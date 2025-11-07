// background.js

// ======= CONFIG =======
const BACKEND_UPLOAD = "http://localhost:4000/upload";
const FRONTEND_URL   = "http://localhost:3000";

// ======= CONTEXT MENUS =======
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "poa-claim-media",
      title: "Claim Ownership with POA",
      contexts: ["image", "video", "audio"]
    });
  });
});

// ======= HELPERS =======
async function getWallet() {
  const { walletAddress } = await chrome.storage.local.get("walletAddress");
  return walletAddress || "";
}

function nowISO() {
  return new Date().toISOString();
}

async function fetchAsBlob(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
  return await res.blob();
}

function notify(title, message, url) {
  const id = "poa-" + Date.now();

  chrome.notifications.create(id, {
    type: "basic",
    iconUrl: "icons/poa-128.png",
    title,
    message,
    priority: 2
  });

  if (url) {
    chrome.notifications.onClicked.addListener(function listener(clickedId) {
      if (clickedId === id) {
        chrome.tabs.create({ url });
        chrome.notifications.onClicked.removeListener(listener);
      }
    });
  }

  setTimeout(() => chrome.notifications.clear(id), 6000);
}

async function sendToBackend({ blob, filename, wallet, prompt, model, timestamp }) {
  const fd = new FormData();
  fd.append("wallet", wallet);
  fd.append("prompt", prompt || "");
  fd.append("model", model || "Unknown Model");
  fd.append("timestamp", timestamp);
  fd.append("title", filename || "Untitled Media");
  fd.append("file", blob, filename || "media.bin");

  const res = await fetch(BACKEND_UPLOAD, { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data;
}

// ======= CLAIM HANDLER =======
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    const wallet = await getWallet();
    if (!wallet) {
      notify("POA", "Connect your wallet. Opening site…", FRONTEND_URL);
      chrome.tabs.create({ url: FRONTEND_URL });
      return;
    }

    notify("Claiming Ownership…", "Uploading + minting on-chain… Please wait.");

    const timestamp = nowISO();
    const model = tab?.title || "Unknown Model";
    const mediaUrl = info.srcUrl;

    let blob, filename;

    try {
      const urlObj = new URL(mediaUrl);
      filename = decodeURIComponent(urlObj.pathname.split("/").pop()) || "media.bin";
    } catch {
      filename = "media.bin";
    }

    blob = await fetchAsBlob(mediaUrl);

    const result = await sendToBackend({
      blob,
      filename,
      wallet,
      model,
      timestamp
    });

    if (result.status === "DUPLICATE") {
      notify(
        "Already Registered",
        `Owner: ${result.owner}\nToken #${result.tokenId}`,
        result.gatewayMetadataURL || result.metadataURI
      );
      return;
    }

    if (result.status === "MINTED") {
      notify(
        "NFT Minted Successfully 🎉",
        `Token #${result.tokenId} minted.\nClick to verify.`,
        result.gatewayMetadataURL || result.metadataURI
      );
      return;
    }

    notify("Done", "Ownership claim complete.");

  } catch (err) {
    notify("POA Error", String(err.message || err));
  }
});
