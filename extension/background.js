chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    (async () => {
        console.log("Background received:", msg);

        if (msg.action === "save_job") {

            // Step 1: Login first
            const token = await loginToAPI();
            if (!token) {
                console.error("Could not log in.");
                sendResponse({ success: false, error: "Login failed" });
                return;
            }

            // Step 2: Send job to backend
            const result = await sendJobToAPI(token, msg.payload);

            // Step 3: Send result back to popup
            sendResponse(result);
        }
    })();

    // CRITICAL: keep message channel open for async
    return true;
});


function getStoredSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(
            ["apiBaseUrl", "email", "password"],
            (result) => resolve(result)
        );
    });
}


async function loginToAPI() {
    const { apiBaseUrl, email, password } = await getStoredSettings();

    if (!apiBaseUrl || !email || !password) {
        console.error("Missing API settings.");
        return null;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Login failed:", err);
            return null;
        }

        const data = await response.json();
        const token = data.access_token;

        if (!token) {
            console.error("Login response missing access_token");
            return null;
        }

        chrome.storage.sync.set({ token });
        console.log("Login successful. Token saved.");
        return token;

    } catch (err) {
        console.error("Login error:", err);
        return null;
    }
}


async function sendJobToAPI(token, jobPayload) {
    const { apiBaseUrl } = await getStoredSettings();

    const apiPayload = {
        title_display: jobPayload.title,
        company_display: jobPayload.company,
        status: jobPayload.status,
        application_url: jobPayload.url,
        source_display: jobPayload.source
    };

    try {
        const response = await fetch(`${apiBaseUrl}/jobs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(apiPayload)
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Failed to save job:", err);
            return { success: false, error: err };
        }

        const data = await response.json();
        console.log("Job saved successfully:", data);
        return { success: true, data };

    } catch (err) {
        console.error("Job save error:", err);
        return { success: false, error: err };
    }
}
