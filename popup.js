const toggle = document.getElementById("toggleFilter");

chrome.storage.sync.get("filterEnabled", ({ filterEnabled }) => {
  toggle.checked = !!filterEnabled;
});

toggle.addEventListener("click", () => {
  const isEnabled = toggle.checked;

  chrome.storage.sync.set({ filterEnabled: isEnabled }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "TOGGLE_FILTER",
        enabled: isEnabled
      });
      window.close(); // Close popup
    });
  });
});