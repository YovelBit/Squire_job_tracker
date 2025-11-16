// Utility to extract source_display from a URL
function extractSource(url) { // Not parsing current page, Ban-risk free
  try {
    const hostname = new URL(url).hostname;  // # From the url object, get hostname (from www to .com)
    const hostWithoutWWW = hostname.replace(/^www\./, ""); // // Remove www. if present
    const parts = hostWithoutWWW.split("."); // split by dot
    return parts[0]; // the first part is the source_display
  } catch (err) { // Handle invalid URLs
    console.error("Invalid URL:", err);
    return "";
  }
} 


document.addEventListener("DOMContentLoaded", () => { // When popup is loaded

  // 1. Get references to HTML fields
  const urlInput = document.getElementById("application_url");
  const sourceInput = document.getElementById("source_display");

  // 2. Get current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { // Callback with tabs array
    const tab = tabs[0];
    if (!tab || !tab.url) {
      urlInput.value = "";
      sourceInput.value = "";
      return;
    }

    const url = tab.url; // Get URL of the active tab

    // 3. Fill URL field
    urlInput.value = url; // Set application_url field based on URL

    // 4. Fill source_display based on URL
    sourceInput.value = extractSource(url); // Set source_display field
  });

});

document.addEventListener("SettingsSet", )