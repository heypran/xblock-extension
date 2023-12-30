// Function to extract payload from a transaction
function extractPayload(transaction: any) {
  // Customize this function based on the structure of your transaction payload
  console.log("transaction", transaction);
  return transaction.input;
}

// Inject a content script to the current tab
function injectContentScript() {
  const script = document.createElement("script");
  script.textContent = `
    // Capture the send function of the wallet
    const originalSend = window.ethereum.send;
    window.ethereum.send = async (payload, callback) => {
      // Check if the payload is related to signing a transaction
      if (payload.method === 'eth_sendTransaction') {
        const transaction = payload.params[0];
        const extractedPayload = extractPayload(transaction);
        console.log('Extracted Payload:', extractedPayload);
        // Add your custom logic here to handle the extracted payload
        // Send a message to the background script through the established connection
        port.postMessage({ type: "popupOpened" });
        chrome.runtime.sendMessage({ type: 'signingRequestDetected', payload: extractedPayload });
      }
   

      // Check if the payload is related to signing a message
      if (payload.method === 'eth_sign') {
        const signatureRequest = payload.params[1];
        const extractedPayload = extractPayload(signatureRequest);
        console.log('Extracted Payload for Signature Request:', extractedPayload);
        // Add your custom logic here to handle the extracted payload for signature requests
        // Send a message to the background script through the established connection
        port.postMessage({ type: "popupOpened" });
        chrome.runtime.sendMessage({ type: 'signingRequestDetected', payload: extractedPayload });
      }

      // Call the original send function
      return originalSend.call(window.ethereum, payload, callback);
    };
  `;

  document.documentElement.appendChild(script);
  script.remove();
}
// chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
//   if (msg.color) {
//     console.log("Receive color = " + msg.color);
//     document.body.style.backgroundColor = msg.color;
//     sendResponse("Change color to " + msg.color);
//   } else {
//     sendResponse("Color message is none.");
//   }
// });

// Establish a connection with the background script
const port = chrome.runtime.connect({ name: "content-script" });

// Listen for messages from the background script
window.addEventListener("message", (event) => {
  if (
    event.source === window &&
    event.data.type &&
    event.data.type === "popupOpened"
  ) {
    // Forward the message to the background script
    port.postMessage({ type: "popupOpened" });
  }
});
// Wait for the DOM to be ready before injecting the content script
document.addEventListener("DOMContentLoaded", injectContentScript);
