function applyFilter() {
  fetch(chrome.runtime.getURL("badwords.txt"))
    .then(response => response.text())
    .then(text => {
      const offensiveWords = text
        .split("\n")
        .map(w => w.trim().toLowerCase())
        .filter(Boolean);

      const regex = new RegExp(`(${offensiveWords.join("|")})`, "gi");

      function walk(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const parent = node.parentNode;
          const frag = document.createDocumentFragment();
          const parts = node.textContent.split(regex);

          parts.forEach(part => {
            if (regex.test(part)) {
              const span = document.createElement("span");
              span.className = "blurred-word";
              span.textContent = part;
              frag.appendChild(span);
            } else {
              frag.appendChild(document.createTextNode(part));
            }
          });

          parent.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          node.childNodes.forEach(walk);
        }
      }

      walk(document.body);
      showStatus("Filter is ON");
    });
}

function clearFilter() {
  document.querySelectorAll(".blurred-word").forEach(span => {
    const textNode = document.createTextNode(span.textContent);
    span.replaceWith(textNode);
  });
  showStatus("Filter is OFF");
}

function showStatus(message) {
  const status = document.createElement("div");
  status.textContent = message;
  status.style.position = "fixed";
  status.style.bottom = "10px";
  status.style.right = "10px";
  status.style.background = "#333";
  status.style.color = "#fff";
  status.style.padding = "8px 12px";
  status.style.borderRadius = "5px";
  status.style.zIndex = "9999";
  document.body.appendChild(status);
  setTimeout(() => status.remove(), 3000);
}

// Initial load
chrome.storage.sync.get("filterEnabled", ({ filterEnabled }) => {
  if (filterEnabled) applyFilter();
});

// Listen for toggle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_FILTER") {
    if (message.enabled) {
      applyFilter();
    } else {
      clearFilter();
    }
  }
});
