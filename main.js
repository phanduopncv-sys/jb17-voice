const WORKER = "https://tts.jb17voice.top";

/* ============ SLIDER VALUE UPDATE ============ */
const sliders = ["speed","stability","similarity","style"];
sliders.forEach(id => {
    const el = document.getElementById(id);
    const val = document.getElementById(id+"Val");
    el.oninput = () => val.textContent = el.value;
});

/* ============ LOAD VOICES FROM WORKER ============ */
async function loadVoices() {
    const res = await fetch(WORKER + "/voices");
    const data = await res.json();

    const sel = document.getElementById("taskVoiceSelect");
    sel.innerHTML = "";

    data.voices.forEach(v => {
        const op = document.createElement("option");
        op.value = v.id;
        op.textContent = v.name;
        sel.appendChild(op);
    });
}
loadVoices();

/* ============ PREVIEW VOICE ============ */
document.getElementById("previewVoiceBtn").onclick = async () => {
    const text = "Đây là giọng đọc thử nghiệm.";
    const voice_id = document.getElementById("customVoiceId").value.trim() || 
                     document.getElementById("taskVoiceSelect").value;

    const payload = {
        text,
        voice_id,
        voice_settings: {
            speed: Number(speed.value),
            stability: Number(stability.value),
            similarity_boost: Number(similarity.value),
            style: Number(style.value)
        }
    };

    const res = await fetch(WORKER + "/tts", {
        method: "POST",
        body: JSON.stringify(payload)
    });

    const blob = await res.blob();
    new Audio(URL.createObjectURL(blob)).play();
};

/* ============ GENERATE TTS ============ */
document.getElementById("generateBtn").onclick = async () => {
    const text = document.getElementById("inputText").value.trim();
    if (!text) return alert("Nhập nội dung trước!");

    const voice_id = document.getElementById("customVoiceId").value.trim() || 
                     document.getElementById("taskVoiceSelect").value;

    const payload = {
        text,
        voice_id,
        voice_settings: {
            speed: Number(speed.value),
            stability: Number(stability.value),
            similarity_boost: Number(similarity.value),
            style: Number(style.value)
        }
    };

    const res = await fetch(WORKER + "/tts", {
        method: "POST",
        body: JSON.stringify(payload)
    });

    const blob = await res.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    audio.controls = true;

    const box = document.getElementById("queueContainer");
    box.appendChild(audio);
};

/* ============ TAB SWITCHING ============ */
document.querySelectorAll(".nav-item").forEach(item => {
    item.onclick = () => {
        document.querySelectorAll(".nav-item").forEach(i=>i.classList.remove("active"));
        item.classList.add("active");

        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelector(item.dataset.target).classList.add("active");
    };
});
