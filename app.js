import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- Firebase Config ---
const firebaseConfig = {
    apiKey: "AIzaSyDrMDFrktikS3DgwiT8mfhms6jou4JneXw",
    authDomain: "yaazh-8f9f1.firebaseapp.com",
    projectId: "yaazh-8f9f1",
    storageBucket: "yaazh-8f9f1.firebasestorage.app",
    messagingSenderId: "700879857601",
    appId: "1:700879857601:web:3728e372f1cb229171b140"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- UI Elements ---
const statusEl = document.getElementById("status");
const transcriptEl = document.getElementById("transcript");
const orb = document.getElementById("orb");

// --- Voice Recognition ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = "en-US";

let isAIspeaking = false;
let audioUnlocked = false;

// --- SAFE SITE OPENER (FIX POPUP BLOCK) ---
function openSite(url) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// --- USER CLICK TO UNLOCK AUDIO ---
document.body.addEventListener('click', () => {
    if (!audioUnlocked) {
        audioUnlocked = true;
        const user = auth.currentUser;
        if (user) {
            const firstName = user.displayName ? user.displayName.split(' ')[0] : "Friend";
            speak(`Hello ${firstName}. I am Yaazh, your AI companion. I am ready to assist you.`);
        }
    }
}, { once: true });

// --- AUTH STATE ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        const firstName = user.displayName ? user.displayName.split(' ')[0] : "Friend";
        const nameDisplay = document.getElementById("userName") || document.getElementById("profileName");
        if (nameDisplay) nameDisplay.textContent = firstName;
        if (document.getElementById("userPhoto")) {
            document.getElementById("userPhoto").src = user.photoURL;
        }
    } else {
        window.location.href = "index.html";
    }
});

// --- START LISTENING ---
function startListening() {
    if (isAIspeaking) return;
    try {
        recognition.start();
        if (statusEl) statusEl.textContent = "Listening...";
        if (orb) orb.classList.add("animate-pulse");
    } catch (e) {}
}

// --- SPEECH RESULT ---
recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    if (transcriptEl) transcriptEl.textContent = `"${command}"`;
    handleConversation(command);
};

recognition.onend = () => {
    if (!isAIspeaking && auth.currentUser) {
        setTimeout(startListening, 600);
    }
};

recognition.onerror = (e) => {
    console.warn("Speech recognition error:", e.error);
};

// --- SPEAK FUNCTION ---
function speak(text) {
    isAIspeaking = true;
    try { recognition.stop(); } catch (e) {}
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    const containsTamil = /[\u0B80-\u0BFF]/.test(text);

    const voices = window.speechSynthesis.getVoices();

    if (containsTamil) {
        speech.lang = "ta-IN";
        const tamilVoice = voices.find(v => v.lang.includes("ta"));
        if (tamilVoice) speech.voice = tamilVoice;
        speech.rate = 0.85;
    } else {
        speech.lang = "en-US";
        speech.rate = 1.0;
    }

    speech.onstart = () => {
        if (statusEl) statusEl.textContent = "Yaazh is speaking...";
        if (orb) orb.style.transform = "scale(1.2)";
    };

    speech.onend = () => {
        isAIspeaking = false;
        if (orb) orb.style.transform = "scale(1)";
        startListening();
    };

    window.speechSynthesis.speak(speech);
}

// --- CONVERSATION ENGINE ---
function handleConversation(input) {
    const nameEl = document.getElementById("profileName") || document.getElementById("userName");
    const name = nameEl ? nameEl.textContent : "Friend";

    // TIME & DATE
    if (input.includes("time")) {
        speak(`The time is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`);
    }
    else if (input.includes("date") || input.includes("day")) {
        speak(`Today is ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.`);
    }

    // APPS
    else if (input.includes("youtube") || input.includes("music") || input.includes("songs")) {
        speak("Opening YouTube for you.");
        openSite("https://www.youtube.com");
    }
    else if (input.includes("google") || input.includes("search")) {
        speak("Opening Google for you.");
        openSite("https://www.google.com");
    }
    else if (input.includes("profile")) {
        speak("Opening your profile.");
        setTimeout(() => window.location.href = "profile.html", 1200);
    }

    // IDENTITY
    else if (input.includes("who are you")) {
        speak("I am Yaazh, your personal AI assistant designed for voice interaction and support.");
    }
    else if (input.includes("who created you")) {
        speak("I was proudly created by Sanjay as an AI prototype.");
    }

    // MOTIVATION
    else if (input.includes("motivate")) {
        speak("Discipline beats motivation. Keep going. You are building your future.");
    }

    // HEALTH (MOCK)
    else if (input.includes("blood pressure") || input.includes("bp")) {
        speak(`Your blood pressure is normal, ${name}.`);
    }
    else if (input.includes("sugar")) {
        speak("Your blood sugar level is within a healthy range.");
    }

    // EMOTIONAL
    else if (input.includes("sad") || input.includes("lonely")) {
        speak(`I am here with you, ${name}. You are not alone.`);
    }

    // FUN
    else if (input.includes("joke")) {
        speak("Why do programmers prefer dark mode? Because light attracts bugs.");
    }

    // HACKATHON
    else if (input.includes("project") || input.includes("hackathon")) {
        speak("This project demonstrates voice recognition, authentication, and AI interaction for real world use.");
    }

    // EXIT
    else if (input.includes("stop listening") || input.includes("goodbye")) {
        speak("Goodbye. I will stop listening now.");
        recognition.stop();
    }

    // FALLBACK
    else {
        speak("I didn't understand that. Please say it again.");
    }
}
