/* ============================================================
   SETTINGS PAGE — WORKER MODE (NO API KEY REQUIRED)
   Cloudflare Worker handles authentication & rate limiting
   ============================================================ */

// Ẩn toàn bộ UI nhập API keys
document.addEventListener("DOMContentLoaded", () => {
    const settingsBox = document.getElementById("settingsPage");
    if (!settingsBox) return;

    settingsBox.innerHTML = `
        <h2>Authentication</h2>
        <p style="margin-top: 10px; color:#0f0;">
            ✓ No API key required.<br>
            ✓ Your Cloudflare Worker handles authentication securely.
        </p>

        <button id="checkAuthBtn" class="greenBtn" style="margin-top:15px;">
            Verify Connection
        </button>

        <div id="authResult" style="margin-top:15px;"></div>
    `;
});

// Nút kiểm tra kết nối Worker
document.addEventListener("click", async (e) => {
    if (e.target && e.target.id === "checkAuthBtn") {

        const resultBox = document.getElementById("authResult");
        resultBox.textContent = "Checking Worker…";

        try {
            const res = await fetch(`${WORKER}/credit`);
            const json = await res.json();

            if (json.remaining !== undefined) {
                resultBox.style.color = "#0f0";
                resultBox.innerHTML = `
                    ✓ Worker Connected<br>
                    Remaining Characters: <b>${json.remaining}</b>
                `;
            } else {
                resultBox.style.color = "#f33";
                resultBox.innerHTML = `Worker returned invalid response.`;
            }
        }
        catch (err) {
            resultBox.style.color = "#f33";
            resultBox.innerHTML = `❌ Failed to connect to Worker.<br>${err}`;
        }
    }
});
