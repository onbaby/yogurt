document.addEventListener("DOMContentLoaded", function () {
  const chatgptButton = document.getElementById("chatgpt");
  const geminiButton = document.getElementById("gemini");
  const deepseekButton = document.getElementById("deepseek");
  const statusMessage = document.getElementById("status-message");
  const footerVersionElement = document.getElementById("footer-version");

  const currentVersion = chrome.runtime.getManifest().version;
  footerVersionElement.textContent = `v${currentVersion}`;

  chrome.storage.sync.get("aiModel", function (data) {
    const currentModel = data.aiModel || "chatgpt";
    setActiveButtonState(currentModel);
    checkModelAvailability(currentModel);
  });

  [chatgptButton, geminiButton, deepseekButton].forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.id;
      setActiveModel(id);
    });

    // support keyboard activation
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });

  function setActiveModel(model) {
    chrome.storage.sync.set({ aiModel: model }, function () {
      setActiveButtonState(model);
      checkModelAvailability(model);
    });
  }

  function setActiveButtonState(model) {
    const map = { chatgpt: chatgptButton, gemini: geminiButton, deepseek: deepseekButton };
    Object.keys(map).forEach((key) => {
      const btn = map[key];
      const active = key === model;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      if (active) btn.focus();
    });
  }

  function checkModelAvailability(currentModel) {
    statusMessage.textContent = "Checking assistant availability...";
    statusMessage.className = "";

    chrome.tabs.query({ url: "https://chatgpt.com/*" }, (chatgptTabs) => {
      const chatgptAvailable = chatgptTabs.length > 0;

      chrome.tabs.query(
        { url: "https://gemini.google.com/*" },
        (geminiTabs) => {
          const geminiAvailable = geminiTabs.length > 0;

          chrome.tabs.query(
            { url: "https://chat.deepseek.com/*" },
            (deepseekTabs) => {
              const deepseekAvailable = deepseekTabs.length > 0;

              const availableMap = { 
                chatgpt: chatgptAvailable, 
                gemini: geminiAvailable, 
                deepseek: deepseekAvailable 
              };
              
              const friendlyName = { 
                chatgpt: 'ChatGPT', 
                gemini: 'Gemini', 
                deepseek: 'DeepSeek' 
              }[currentModel] || currentModel;
              
              if (availableMap[currentModel]) {
                statusMessage.textContent = `${friendlyName} tab is open and ready to use.`;
                statusMessage.className = "success";
              } else {
                statusMessage.textContent = `Please open ${friendlyName} in another tab to use this assistant.`;
                statusMessage.className = "error";
              }
            }
          );
        }
      );
    });
  }

  // Check availability every 5 seconds
  setInterval(() => {
    chrome.storage.sync.get("aiModel", function (data) {
      const currentModel = data.aiModel || "chatgpt";
      checkModelAvailability(currentModel);
    });
  }, 5000);
});