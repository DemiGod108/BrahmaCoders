// content-script.js

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === "POA_CONNECT_WALLET") {
    if (!window.ethereum) {
      chrome.runtime.sendMessage({ type: "POA_WALLET_FAILURE", error: "MetaMask not found" });
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      chrome.runtime.sendMessage({ type: "POA_WALLET_SUCCESS", account: accounts[0] });
    } catch (err) {
      chrome.runtime.sendMessage({ type: "POA_WALLET_FAILURE", error: err.message });
    }
  }
});
