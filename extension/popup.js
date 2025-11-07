// popup.js

const walletDisplay = document.getElementById("walletDisplay");
const statusEl = document.getElementById("status");
const connectBtn = document.getElementById("connectBtn");
const syncBtn = document.getElementById("syncBtn");

function setConnected(addr) {
  walletDisplay.value = addr;
  statusEl.textContent = "Connected";
  statusEl.className = "ok";
}

function setNotConnected(msg = "Not connected") {
  walletDisplay.value = "";
  statusEl.textContent = msg;
  statusEl.className = "muted";
}

// Load any stored wallet
chrome.storage.local.get("walletAddress", ({ walletAddress }) => {
  if (walletAddress) setConnected(walletAddress);
  else setNotConnected();
});

// Open your site (user connects wallet there)
connectBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:3000" });
});

// Sync wallet from your site’s localStorage
syncBtn.addEventListener("click", async () => {
  try {
    const tabs = await chrome.tabs.query({});
    const siteTab = tabs.find(t => t.url && t.url.startsWith("http://localhost:3000"));
    if (!siteTab) {
      setNotConnected("Open your site first, then click Sync.");
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: siteTab.id },
        func: () => localStorage.getItem("walletAddress") || ""
      },
      (results) => {
        const wallet = results?.[0]?.result || "";
        if (wallet) {
          chrome.storage.local.set({ walletAddress: wallet }, () => setConnected(wallet));
        } else {
          setNotConnected("No wallet found in site localStorage.");
        }
      }
    );
  } catch (e) {
    setNotConnected(e.message || "Failed to sync.");
  }
});
