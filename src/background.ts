function polling() {
  // console.log("polling");
  setTimeout(polling, 1000 * 30);
}

// polling();
let popupWindowId: any = null;

// Handle messages from the content script
// chrome.runtime.onConnect.addListener((port) => {
//   if (port.name === "content-script") {
//     console.log("content-script");
//     port.onMessage.addListener((msg) => {
//       console.log("msg", msg);
//       if (msg.type === "popupOpened") {
//         // Record the popup window ID
//         popupWindowId = port.sender?.tab?.id;
//       }
//     });
//   }
// });

// Establish a connection with the content script
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "content-script") {
    // Listen for messages from the content script
    console.log("port.name");
    port.onMessage.addListener((msg) => {
      console.log("msg", msg);
      if (msg.type === "signingRequestDetected") {
        console.log("signingRequestDetected");
        // Handle the signing request detection
        // Open a popup or perform any other action
        if (popupWindowId) {
          chrome.windows.update(popupWindowId, { focused: true });
        } else {
          // Check if the content script is already injected
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (
              !activeTab.url?.startsWith("chrome-extension://") &&
              activeTab.id
            ) {
              // Inject the content script
              chrome.tabs.executeScript(activeTab.id, {
                file: "js/content_script.js",
              });
            }
          });

          // Create a new popup window
          chrome.windows.create(
            {
              url: "popup.html", // Replace with the URL of your popup HTML
              type: "popup",
              width: 400,
              height: 300,
            },
            (window) => {
              popupWindowId = window?.id;
            }
          );
        }
      }
    });
  }
});

// Handle messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "signingRequestDetected") {
    console.log("signingRequestDetected");
    // Handle the signing request detection
    // Open a popup or perform any other action
    if (popupWindowId) {
      chrome.windows.update(popupWindowId, { focused: true });
    } else {
      // Check if the content script is already injected
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab.url?.startsWith("chrome-extension://") && activeTab.id) {
          // Inject the content script
          chrome.tabs.executeScript(activeTab.id, {
            file: "js/content_script.js",
          });
        }
      });

      // Create a new popup window
      chrome.windows.create(
        {
          url: "popup.html", // Replace with the URL of your popup HTML
          type: "popup",
          width: 400,
          height: 300,
        },
        (window) => {
          popupWindowId = window?.id;
        }
      );
    }
  }
});

// Listen for tab changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // Inject the content script when the tab is fully loaded

    if (
      tab?.url?.includes("chrome://") ||
      tab?.url?.includes("chrome-extension://")
    ) {
      console.log("can`t run on start page");
    } else {
      console.log("chrome.scripting.executeScrip");
      chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: ["js/content_script.js"],
      });
    }
  }
});
