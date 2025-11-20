/* ============================================================
   JB17 VOICE PRO - FRONTEND SCRIPT
   GenAIPro UI Style – Dark Premium
   Worker endpoint auto-called
   ============================================================ */

// ===== WORKER ENDPOINT =====
const WORKER = "https://tts.jb17voice.top";   // ⚠️ Thay đúng domain worker của bạn

// ===== UI ELEMENTS =====
const voiceSelect = document.getElementById("voiceSelect");
const previewBtn = document.getElementById("previewBtn");
const inputText = document.getElementById("inputText");
const addToQueueBtn = document.getElementById("addToQueue");
const apiStatus = document.getElementById("apiStatus");

// Sliders
const speedSlider = document.getElementById("speedSlider");
const pitchSlider = document.getElementById("pitchSlider");
const volumeSlider = document.getElementById("volumeSlider");

// Queue + History
let queue = [];
let history = JSON.parse(localStorage.getItem("tts_history")) || [];

// Init tabs
function showTab(tab) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".main-content section").forEach(s => s.style.display = "none");

    document.getElementById(tab).style.display = "block";
    document.querySelector(`.tab[data-tab="${tab}"]`).classList.add("active");
}
showTab("studio");

/* ============================================================
   1) CHECK WORKER API STATUS
   ============================================================ */
async function checkWorkerAPI() {
    try {
        const res = await fetch(`${WORKER}/credit`);
        const data = await res.json();

        if (data.status === "ok") {
            apiStatus.textContent = `API Connected ✓ | Remaining: ${data.remaining}`;
            apiStatus.style.color = "#10b981";
        } else {
            apiStatus.textContent = "API Error – Check Worker";
            apiStatus.style.color = "#ef4444";
        }
    } catch {
        apiStatus.textContent = "API Offline – Worker lỗi!";
        apiStatus.style.color = "#ef4444";
    }
}
checkWorkerAPI();

/* ============================================================
   2) LOAD VOICE LIST FROM WORKER
   ============================================================ */
async function loadVoices() {
    try {
        const res = await fetch(`${WORKER}/voices`);
        const voices = await res.json();

        voiceSelect.innerHTML = "";

        voices.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v.voice_id;
            opt.textContent = v.name;
            voiceSelect.appendChild(opt);
        });
    } catch {
        voiceSelect.innerHTML = `<option>Error loading voices</option>`;
    }
}
loadVoices();

/* ============================================================
   3) PREVIEW TTS
   ============================================================ */
previewBtn.addEventListener("click", async () => {
    const text = inputText.value.trim();
    if (!text) return alert("Nhập nội dung để preview!");

    try {
        const res = await fetch(`${WORKER}/tts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                voice_id: voiceSelect.value,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: pitchSlider.value,
                    similarity_boost: 1.0,
                    style: 0,
                    speed: speedSlider.value
                }
            })
        });

        if (!res.ok) throw new Error("Worker error");

        const audioBlob = await res.blob();
        const url = URL.createObjectURL(audioBlob);

        const audio = new Audio(url);
        audio.play();
    } catch {
        alert("Preview error: Worker error!");
    }
});

/* ============================================================
   4) ADD TO QUEUE
   ============================================================ */
addToQueueBtn.addEventListener("click", () => {
    const text = inputText.value.trim();
    if (!text) return alert("Nhập nội dung!");

    queue.push({
        id: Date.now(),
        text,
        voice: voiceSelect.value
    });

    renderQueue();
});

function renderQueue() {
    const queueList = document.getElementById("queueList");
    queueList.innerHTML = "";

    queue.forEach(item => {
        const div = document.createElement("div");
        div.className = "history-item";
        div.innerHTML = `
            <span>${item.text.slice(0, 40)}...</span>
            <div class="history-actions">
                <button class="play-btn">Play</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        div.querySelector(".play-btn").onclick = () => playQueueItem(item);
        div.querySelector(".delete-btn").onclick = () => {
            queue = queue.filter(q => q.id !== item.id);
            renderQueue();
        };

        queueList.appendChild(div);
    });
}

/* ============================================================
   5) PLAY FROM QUEUE
   ============================================================ */
async function playQueueItem(item) {
    try {
        const res = await fetch(`${WORKER}/tts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: item.text,
                voice_id: item.voice,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: pitchSlider.value,
                    similarity_boost: 1.0,
                    style: 0,
                    speed: speedSlider.value
                }
            })
        });

        const audioBlob = await res.blob();
        const url = URL.createObjectURL(audioBlob);
        new Audio(url).play();

        saveHistory(item.text);
    } catch {
        alert("Error generating audio!");
    }
}

/* ============================================================
   6) HISTORY SYSTEM
   ============================================================ */
function saveHistory(text) {
    history.push({
        text,
        time: new Date().toLocaleString()
    });

    localStorage.setItem("tts_history", JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById("historyList");
    list.innerHTML = "";

    history.forEach((h, i) => {
        const div = document.createElement("div");
        div.className = "history-item";
        div.innerHTML = `
            <span>${h.text.slice(0, 40)}...</span>
            <div class="history-actions">
                <button class="play-btn">Play</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        div.querySelector(".play-btn").onclick = () => inputText.value = h.text;
        div.querySelector(".delete-btn").onclick = () => {
            history.splice(i, 1);
            localStorage.setItem("tts_history", JSON.stringify(history));
            renderHistory();
        };

        list.appendChild(div);
    });
}
renderHistory();

/* ============================================================
   END
   ============================================================ */
console.log("JB17 Voice Studio Loaded Successfully!");
