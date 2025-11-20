/* ============================================================
   GLOBAL — Worker Endpoint
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
        taskVoiceSelect.innerHTML = `
            <option value="EXAVITQu4vr4xnSDxMaL">Bella</option>
            <option value="21m00Tcm4TlvDq8ikWAM">Rachel</option>
            <option value="AZnzlk1XvdvUeBnXmlld">Domi</option>
        `;
    }
    catch (e) {
        console.error("Voice load error:", e);
    }
}
loadVoices();

/* ============================================================
   CALL WORKER FOR TTS
   ============================================================ */

async function callTTS(text, voice, model) {
    const payload = {
        text,
        voice_id: voice,
        model_id: model,
        speed: Number(speed.value),
        stability: Number(stability.value),
        similarity_boost: Number(similarity.value),
        style: Number(style.value)
    };

    const res = await fetch(`${WORKER}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        throw new Error("Worker error: " + res.status);
    }

    const buf = await res.arrayBuffer();
    return buf;
}

/* ============================================================
   PREVIEW VOICE THROUGH WORKER
   ============================================================ */

previewVoiceBtn.onclick = async () => {
    let voice = customVoiceId.value.trim() || taskVoiceSelect.value;
    let model = modelSelect.value;
    
    if (!voice) return alert("No voice selected");

    try {
        const blobData = await callTTS("This is a preview of your voice settings.", voice, model);
        const audioBlob = new Blob([blobData], { type: "audio/mpeg" });
        const audio = new Audio(URL.createObjectURL(audioBlob));
        audio.play();
    }
    catch (err) {
        alert("Preview error:\n" + err.message);
    }
};

/* ============================================================
   ADD TO QUEUE
   ============================================================ */

addToQueueBtn.onclick = async () => {
    const text = inputText.value.trim();
    if (!text) return alert("Text empty");

    let voice = customVoiceId.value.trim() || taskVoiceSelect.value;
    let model = modelSelect.value;

    try {
        const blobData = await callTTS(text, voice, model);
        const blob = new Blob([blobData], { type: "audio/mpeg" });

        const url = URL.createObjectURL(blob);
        history.push({ text, voice, model, url });

        localStorage.setItem("tts_history", JSON.stringify(history));
        renderQueue();

        alert("Done!");
    }
    catch (err) {
        alert("Error:\n" + err.message);
    }
};

/* ============================================================
   RENDER HISTORY
   ============================================================ */

function renderQueue() {
    queueContainer.innerHTML = "";

    history.forEach((item, i) => {
        const div = document.createElement("div");
        div.className = "queueItem";
        div.innerHTML = `
            <p>${item.text}</p>
            <button onclick="playAudio('${item.url}')">Play</button>
            <button onclick="deleteQueue(${i})">Delete</button>
        `;
        queueContainer.appendChild(div);
    });
}

window.playAudio = function (url) {
    new Audio(url).play();
};

window.deleteQueue = function (i) {
    history.splice(i, 1);
    localStorage.setItem("tts_history", JSON.stringify(history));
    renderQueue();
};

renderQueue();

/* ============================================================
   SLIDER UPDATE
   ============================================================ */
   /* ============================================================
   CHECK WORKER API STATUS
============================================================ */

async function checkAPI() {
    const apiStatus = document.getElementById("apiStatus");
    apiStatus.textContent = "Checking API…";

    try {
        const res = await fetch(`${WORKER}/credit`, { method: "GET" });
        if (!res.ok) throw new Error(res.status);

        const json = await res.json();

        if (json.remaining !== undefined) {
            apiStatus.style.color = "#4CAF50";
            apiStatus.textContent = `API Connected ✓  |  Remaining: ${json.remaining}`;
        } else {
            apiStatus.style.color = "#f33";
            apiStatus.textContent = "Invalid response from Worker";
        }
    } catch (err) {
        apiStatus.style.color = "#f33";
        apiStatus.textContent = `Failed to connect Worker (${err.message})`;
    }
}

// Auto check on load
checkAPI();


speed.oninput = () => speedVal.textContent = Number(speed.value).toFixed(2);
stability.oninput = () => stabilityVal.textContent = Number(stability.value).toFixed(2);
similarity.oninput = () => similarityVal.textContent = Number(similarity.value).toFixed(2);
style.oninput = () => styleVal.textContent = Number(style.value).toFixed(2);
