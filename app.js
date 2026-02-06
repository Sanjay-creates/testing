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

// --- Speech Recognition ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = "en-US";

let isAIspeaking = false;
let audioUnlocked = false;

// --- Unlock Audio on User Click ---
document.body.addEventListener("click", () => {
    if (!audioUnlocked) {
        audioUnlocked = true;
        const user = auth.currentUser;
        if (user) {
            const firstName = user.displayName ? user.displayName.split(" ")[0] : "Friend";
            speak(`Hello ${firstName}. I am Yaazh, your AI companion. I am ready to assist you.`);
        }
    }
}, { once: true });

// --- Auth State ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        const firstName = user.displayName ? user.displayName.split(" ")[0] : "Friend";
        const nameEl = document.getElementById("userName") || document.getElementById("profileName");
        if (nameEl) nameEl.textContent = firstName;
        if (document.getElementById("userPhoto")) {
            document.getElementById("userPhoto").src = user.photoURL;
        }
    } else {
        window.location.href = "index.html";
    }
});

// --- Start Listening ---
function startListening() {
    if (isAIspeaking) return;
    try {
        recognition.start();
        if (statusEl) statusEl.textContent = "Listening...";
        if (orb) orb.classList.add("animate-pulse");
    } catch (e) {}
}

// --- Speech Result ---
recognition.onresult = (event) => {
    const input = event.results[0][0].transcript.toLowerCase();
    if (transcriptEl) transcriptEl.textContent = `"${input}"`;
    handleConversation(input);
};

recognition.onend = () => {
    if (!isAIspeaking && auth.currentUser) {
        setTimeout(startListening, 600);
    }
};

recognition.onerror = (e) => {
    console.warn("Speech recognition error:", e.error);
};

// --- Speak Function ---
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

// --- Conversation Engine ---
function handleConversation(input) {
    const nameEl = document.getElementById("profileName") || document.getElementById("userName");
    const name = nameEl ? nameEl.textContent : "Friend";

    // TIME & DATE
    if (input.includes("time")) {
        speak(`The time is ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`);
    }
    else if (input.includes("date") || input.includes("day")) {
        speak(`Today is ${new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}.`);
    }

    // GOOGLE (WORKING)
    else if (input.includes("google") || input.includes("search")) {
        speak("Opening Google.");
        setTimeout(() => {
            window.location.href = "https://www.google.com";
        }, 800);
    }

    // YOUTUBE (WORKING)
    else if (input.includes("youtube") || input.includes("music") || input.includes("songs")) {
        speak("Opening YouTube.");
        setTimeout(() => {
            window.location.href = "https://www.youtube.com";
        }, 800);
    }

    // PROFILE
    else if (input.includes("profile")) {
        speak("Opening your profile.");
        setTimeout(() => {
            window.location.href = "profile.html";
        }, 1000);
    }

    // IDENTITY
    else if (input.includes("who are you")) {
        speak("I am Yaazh, your AI assistant designed for voice interaction and support.");
    }
    else if (input.includes("who created you")) {
        speak("I was proudly created by Sanjay as an AI prototype.");
    }

    // MOTIVATION
    else if (input.includes("motivate")) {
        speak("Small steps every day lead to big success. Keep going.");
    }

    // HEALTH (MOCK)
    else if (input.includes("blood pressure") || input.includes("bp")) {
        speak(`Your blood pressure is normal, ${name}.`);
    }
    else if (input.includes("sugar")) {
        speak("Your blood sugar level is within the healthy range.");
    }

    // EMOTIONAL
    else if (input.includes("sad") || input.includes("lonely") || input.includes("bored")) {
        speak(`I am here with you, ${name}. You are not alone.`);
    }

    // FUN
    else if (input.includes("joke")) {
        speak("Why did the programmer quit his job? Because he didn’t get arrays.");
    }

    // HACKATHON
    else if (input.includes("project") || input.includes("hackathon")) {
        speak("This project demonstrates voice recognition, authentication, and AI conversation.");
    }

    // EXIT
    else if (input.includes("stop listening") || input.includes("goodbye")) {
        speak("Goodbye. I will stop listening now.");
        recognition.stop();
    }

    // FALLBACK
    else {
        speak("Sorry, I didn't understand that. Please repeat.");
    }
}
