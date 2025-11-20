/* ============================================================
   JB17 GENAI PRO - MAIN SCRIPT
   TTS Studio • History • Voice Clone
   All UI logic • Worker API • Voice Loader
============================================================ */

const WORKER = "https://tts.jb17voice.top"; // ⚠️ đổi sang worker của bạn nếu khác

/* ============================================================
   DOM ELEMENTS
============================================================ */

// Tabs
const sideButtons = document.querySelectorAll(".side-btn");
const tabs = document.querySelectorAll(".tab");

// Studio
const textInput = document.getElementById("inputText");
const charCount = document.getElementById("charCount");
const generateBtn = document.getElementById("generateBtn");
const previewBtn = document.getElementById("previewBtn");
const outputContainer = document.getElementById("outputContainer");

// Voice controls
const voiceSelect = document.getElementById("voiceSelect");
const modelSelect = document.getElementById("modelSelect");
const speed = document.getElementById("speed");
const stability = document.getElementById("stability");
const similarity = document.getElementById("similarity");
const style = document.getElementById("style");

// History
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// Credits
const creditAmount = document.getElementById("creditAmount");

/* ============================================================
   1. CHANGE TAB
============================================================ */

sideButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        sideButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const tab = btn.dataset.tab;

        tabs.forEach(t => t.classList.remove("active"));
        document.getElementById(tab).classList.add("active");
    });
});

/* ============================================================
   2. CHAR COUNTER
============================================================ */

textInput.addEventListener("input", () => {
    charCount.textContent = textInput.value.length;
});

/* ============================================================
   3. LOAD VOICES FROM WORKER
============================================================ */

async function loadVoices() {
    try {
        const res = await fetch(WORKER + "/voices");
        const data = await res.json();

        voiceSelect.innerHTML = "";

        data.voices.forEach(v => {
            const op = document.createElement("option");
            op.value = v.id;
            op.textContent = v.name;
            voiceSelect.appendChild(op);
        });

    } catch (err) {
        voiceSelect.innerHTML = `<option>Error loading voices</option>`;
        console.error("Voice load error:", err);
    }
}
loadVoices();

/* ============================================================
   4. CHECK CREDITS
============================================================ */

async function checkCredits() {
    try {
        const res = await fetch(WORKER + "/credit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}"
        });

        const data = await res.json();

        if (data.status === "ok") {
            creditAmount.textContent = data.remaining.toLocaleString();
        } else {
            creditAmount.textContent = "Error";
        }
    } catch {
        creditAmount.textContent = "Offline";
    }
}
checkCredits();

/* ============================================================
   5. PREVIEW TTS
============================================================ */

previewBtn.addEventListener("click", async () => {
    const text = textInput.value.trim();
    if (!text) return alert("Nhập nội dung trước!");

    await playTTS(text);
});

/* ============================================================
   6. GENERATE TTS (PLAY + SAVE TO HISTORY)
============================================================ */

generateBtn.addEventListener("click", async () => {
    const text = textInput.value.trim();
    if (!text) return alert("Vui lòng nhập nội dung!");

    await playTTS(text);

    saveHistory(text);
    renderHistory();
});

/* ============================================================
   7. PLAY AUDIO FUNCTION
============================================================ */

async function playTTS(text) {
    try {
        generateBtn.textContent = "Đang tạo giọng...";
        generateBtn.disabled = true;

        const payload = {
            text,
            voice_id: voiceSelect.value,
            model_id: modelSelect.value,
            voice_settings: {
                stability: Number(stability.value),
                similarity_boost: Number(similarity.value),
                style: Number(style.value),
                speed: Number(speed.value)
            }
        };

        const res = await fetch(WORKER + "/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Worker error");

        const audioBlob = await res.blob();
        const audioURL = URL.createObjectURL(audioBlob);

        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = audioURL;

        outputContainer.prepend(audio);

        audio.play();

    } catch (err) {
        alert("Không thể tạo giọng nói! Kiểm tra lại worker.");
        console.error(err);
    } finally {
        generateBtn.textContent = "Tạo giọng nói";
        generateBtn.disabled = false;
    }
}

/* ============================================================
   8. HISTORY SYSTEM
============================================================ */

let history = JSON.parse(localStorage.getItem("jb17_history") || "[]");

function saveHistory(text) {
    history.unshift({
        text,
        time: new Date().toLocaleString()
    });

    localStorage.setItem("jb17_history", JSON.stringify(history));
}

function renderHistory() {
    historyList.innerHTML = "";

    history.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "history-item";

        div.innerHTML = `
            <div>
                <strong>${item.time}</strong><br>
                ${item.text.slice(0, 60)}...
            </div>
            <div class="history-actions">
                <button class="play-btn">Play</button>
                <button class="delete-btn">Xoá</button>
            </div>
        `;

        // PLAY FROM HISTORY
        div.querySelector(".play-btn").onclick = () => playTTS(item.text);

        // DELETE
        div.querySelector(".delete-btn").onclick = () => {
            history.splice(index, 1);
            localStorage.setItem("jb17_history", JSON.stringify(history));
            renderHistory();
        };

        historyList.appendChild(div);
    });
}
renderHistory();

/* ============================================================
   END
============================================================ */

console.log("%cJB17 GenAI Pro UI Loaded ✔", "color:#4ade80;font-size:16px;");
