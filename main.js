/* ============================================================
   GLOBAL – Worker Endpoint
============================================================ */

const WORKER = "https://tts.jb17voice.top";

/* ============================================================
   UI ELEMENTS
============================================================ */

const modelSelect = document.getElementById("modelSelect");
const taskVoiceSelect = document.getElementById("taskVoiceSelect");
const customVoiceId = document.getElementById("customVoiceId");
const previewVoiceBtn = document.getElementById("previewVoiceBtn");

const speed = document.getElementById("speed");
const stability = document.getElementById("stability");
const similarity = document.getElementById("similarity");
const style = document.getElementById("style");

const speedVal = document.getElementById("speedVal");
const stabilityVal = document.getElementById("stabilityVal");
const similarityVal = document.getElementById("similarityVal");
const styleVal = document.getElementById("styleVal");

const inputText = document.getElementById("inputText");
const addToQueueBtn = document.getElementById("addToQueueBtn");
const queueContainer = document.getElementById("queueContainer");

let history = JSON.parse(localStorage.getItem("tts_history") || "[]");

/* ============================================================
   LOAD VOICES FROM WORKER
============================================================ */

async function loadVoices() {
    try {
        const res = await fetch(WORKER + "/voices");
        const data = await res.json();

        taskVoiceSelect.innerHTML = "";

        data.voices.forEach(v => {
            const op = document.createElement("option");
            op.value = v.id;
            op.textContent = v.name;
            taskVoiceSelect.appendChild(op);
        });
    } catch (e) {
        console.error("Failed to load voices:", e);
    }
}

loadVoices();

/* ============================================================
   LOAD CREDITS (API CONNECTED)
============================================================ */

async function checkAPI() {
    try {
        const res = await fetch(WORKER + "/credit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });

        const data = await res.json();

        const statusBox = document.getElementById("apiStatusBox");

        if (data.status === "ok") {
            statusBox.textContent = `API Connected ✓ | Remaining: ${data.remaining}`;
            statusBox.style.color = "#33FF66";
        } else {
            statusBox.textContent = "API Error";
            statusBox.style.color = "red";
        }
    } catch (err) {
        console.error(err);
    }
}

checkAPI();

/* ============================================================
   SLIDER UPDATE
============================================================ */

function updateSliderDisplay() {
    speedVal.textContent = speed.value;
    stabilityVal.textContent = stability.value;
    similarityVal.textContent = similarity.value;
    styleVal.textContent = style.value;
}

[speed, stability, similarity, style].forEach(sl => {
    sl.addEventListener("input", updateSliderDisplay);
});

updateSliderDisplay();

/* ============================================================
   PREVIEW VOICE
============================================================ */

previewVoiceBtn.addEventListener("click", async () => {
    const voiceId = customVoiceId.value.trim() || taskVoiceSelect.value;
    const txt = "Hello, this is a preview.";

    try {
        const res = await fetch(WORKER + "/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: txt,
                voice_id: voiceId,
                voice_settings: {
                    speed: Number(speed.value),
                    stability: Number(stability.value),
                    similarity_boost: Number(similarity.value),
                    style: Number(style.value)
                }
            })
        });

        if (!res.ok) {
            alert("Preview error");
            return;
        }

        const audioBlob = await res.blob();
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.play();

    } catch (e) {
        alert("Preview failed");
        console.error(e);
    }
});

/* ============================================================
   ADD TO QUEUE
============================================================ */

addToQueueBtn.addEventListener("click", () => {
    if (!inputText.value.trim()) return;

    history.push({
        text: inputText.value,
        voice_id: customVoiceId.value.trim() || taskVoiceSelect.value
    });

    localStorage.setItem("tts_history", JSON.stringify(history));
    renderQueue();
});

/* ============================================================
   RENDER QUEUE
============================================================ */

function renderQueue() {
    queueContainer.innerHTML = "";

    history.forEach((item, i) => {
        const div = document.createElement("div");
        div.className = "queue-item";

        div.innerHTML = `
            <span>${item.text}</span>
            <button class="playBtn">Play</button>
            <button class="deleteBtn">Delete</button>
        `;

        div.querySelector(".playBtn").onclick = () => playQueueItem(i);
        div.querySelector(".deleteBtn").onclick = () => deleteQueueItem(i);

        queueContainer.appendChild(div);
    });
}

renderQueue();

/* ============================================================
   PLAY QUEUE ITEM
============================================================ */

async function playQueueItem(i) {
    const item = history[i];
    try {
        const res = await fetch(WORKER + "/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: item.text,
                voice_id: item.voice_id,
                voice_settings: {
                    speed: Number(speed.value),
                    stability: Number(stability.value),
                    similarity_boost: Number(similarity.value),
                    style: Number(style.value)
                }
            })
        });

        if (!res.ok) {
            alert("Playback failed");
            return;
        }

        const audioBlob = await res.blob();
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.play();

    } catch (err) {
        alert("Playback error");
        console.error(err);
    }
}

/* ============================================================
   DELETE QUEUE ITEM
============================================================ */

function deleteQueueItem(i) {
    history.splice(i, 1);
    localStorage.setItem("tts_history", JSON.stringify(history));
    renderQueue();
}

/* ============================================================
   CLEAR ALL HISTORY
============================================================ */

document.getElementById("clearHistoryBtn").onclick = () => {
    history = [];
    localStorage.setItem("tts_history", "[]");
    renderQueue();
};

