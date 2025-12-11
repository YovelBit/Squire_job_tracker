// Utility to extract source_display from a URL
function extractSource(url) {
  // Not parsing current page, Ban-risk free
  try {
    const hostname = new URL(url).hostname; // # From the url object, get hostname (from www to .com)
    const hostWithoutWWW = hostname.replace(/^www\./, ""); // // Remove www. if present
    const parts = hostWithoutWWW.split("."); // split by dot
    return parts[0]; // the first part is the source_display
  } catch (err) {
    // Handle invalid URLs
    console.error("Invalid URL:", err);
    return "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // When popup is loaded

  // 1. Get references to HTML fields
  const urlInput = document.getElementById("application_url");
  const sourceInput = document.getElementById("source_display");

  // 2. Get current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Callback with tabs array
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

document.addEventListener("DOMContentLoaded", () => {
  const jobForm = document.getElementById("job-form");

  jobForm.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent popup from refreshing

    const title = document.getElementById("title_display").value;
    const company = document.getElementById("company_display").value;
    const status = document.getElementById("status").value;
    const url = document.getElementById("application_url").value;
    const source = document.getElementById("source_display").value;

    chrome.runtime.sendMessage(
      {
        action: "save_job",
        payload: {
          title,
          company,
          status,
          url,
          source,
        },
      },
      (response) => {
        const statusMessage = document.getElementById("status-message");

        if (!response) {
          statusMessage.textContent = "No response from extension.";
          statusMessage.className = "error";
          return;
        }

        if (response.success) {
          statusMessage.textContent = "Job added successfully!";
          statusMessage.className = "success";

          // Optional: clear fields
          document.getElementById("title_display").value = "";
          document.getElementById("company_display").value = "";
        } else {
          statusMessage.textContent =
            "Failed to save job: " + JSON.stringify(response.error);
          statusMessage.className = "error";
        }
      }
    );

    console.log("Sent to background:", { title, company, status, url, source });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // When popup is loaded
  const settingsForm = document.getElementById("settings-form");

  settingsForm.addEventListener("submit", (e) => {
    // On form submit, rather than button click, easier for automation
    e.preventDefault();

    const apiBaseUrl = document.getElementById("api_base_url").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    chrome.storage.sync.set(
      {
        // Storing credentials securely on chrome storage
        apiBaseUrl,
        email,
        password,
      },
      () => {
        document.getElementById("settings-message").textContent =
          "Settings saved!";
        document.getElementById("settings-message").className = "success";
      }
    );
  });
});
