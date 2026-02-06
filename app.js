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

    // 🕒 TIME & DATE
    if (input.includes("time")) {
        speak(`The time is ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`);
    }
    else if (input.includes("date") || input.includes("day")) {
        speak(`Today is ${new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}.`);
    }

    // 👋 GREETINGS
    else if (input.includes("good morning")) {
        speak(`Good morning, ${name}. I hope you have a productive day.`);
    }
    else if (input.includes("good afternoon")) {
        speak(`Good afternoon, ${name}. How can I assist you?`);
    }
    else if (input.includes("good evening")) {
        speak(`Good evening, ${name}. I hope your day was good.`);
    }
    else if (input.includes("good night")) {
        speak(`Good night, ${name}. Have a peaceful sleep.`);
    }

    // 🙂 BASIC CHAT
    else if (input.includes("how are you")) {
        speak("I am functioning perfectly and ready to help you.");
    }
    else if (input.includes("what are you doing")) {
        speak("I am listening and waiting for your command.");
    }
    else if (input.includes("are you there")) {
        speak("Yes, I am right here with you.");
    }

    // 🧍 PERSONAL
    else if (input.includes("my name")) {
        speak(`Your name is ${name}.`);
    }
    else if (input.includes("do you know me")) {
        speak(`Yes, ${name}. You are my registered user.`);
    }
    else if (input.includes("are you my friend")) {
        speak("Yes. I am always your digital companion.");
    }

    // 🤖 AI IDENTITY
    else if (input.includes("who are you")) {
        speak("I am Yaazh, your AI voice assistant.");
    }
    else if (input.includes("who created you")) {
        speak("I was created by Sanjay as an AI prototype.");
    }
    else if (input.includes("how do you work")) {
        speak("I convert your voice into text, process it, and respond with speech.");
    }
    else if (input.includes("are you intelligent")) {
        speak("I simulate intelligence using predefined logic and voice processing.");
    }

    // 🎓 STUDENT / TECH
    else if (input.includes("programming")) {
        speak("Programming is problem solving. Practice daily to improve.");
    }
    else if (input.includes("ai")) {
        speak("Artificial Intelligence allows machines to assist humans intelligently.");
    }
    else if (input.includes("future")) {
        speak("The future belongs to those who keep learning new skills.");
    }
    else if (input.includes("college")) {
        speak("College life is about learning skills, not just marks.");
    }

    // 💪 MOTIVATION
    else if (input.includes("motivate")) {
        speak("Discipline is stronger than motivation. Keep moving forward.");
    }
    else if (input.includes("success")) {
        speak("Success comes from consistent effort over time.");
    }
    else if (input.includes("failure")) {
        speak("Failure is a lesson, not the end.");
    }

    // ❤️ EMOTIONAL SUPPORT
    else if (input.includes("sad")) {
        speak(`I am here with you, ${name}. This feeling will pass.`);
    }
    else if (input.includes("lonely")) {
        speak("You are not alone. I am listening to you.");
    }
    else if (input.includes("stressed") || input.includes("stress")) {
        speak("Take a deep breath. You are doing better than you think.");
    }
    else if (input.includes("tired")) {
        speak("You should take a short rest. Your health matters.");
    }

    // 🏥 HEALTH (MOCK)
    else if (input.includes("health")) {
        speak("Your health status appears stable. Maintain good habits.");
    }
    else if (input.includes("drink water")) {
        speak("Please remember to stay hydrated.");
    }
    else if (input.includes("exercise")) {
        speak("Regular exercise improves both physical and mental health.");
    }

    // 😂 FUN
    else if (input.includes("joke")) {
        speak("Why do programmers prefer dark mode? Because light attracts bugs.");
    }
    else if (input.includes("are you real")) {
        speak("I am virtual, but my support for you is real.");
    }

    // 🧪 PROJECT / HACKATHON
    else if (input.includes("project") || input.includes("hackathon")) {
        speak("This project demonstrates voice recognition and AI conversation.");
    }

    // 🙏 POLITE
    else if (input.includes("thank you") || input.includes("thanks")) {
        speak(`You're welcome, ${name}. Happy to help.`);
    }

    // 👋 EXIT
    else if (input.includes("bye") || input.includes("goodbye") || input.includes("stop listening")) {
        speak("Goodbye. I am always here when you need me.");
        recognition.stop();
    }

    // ❓ FALLBACK
    else {
        speak("Sorry, I didn't understand that. Please say it again.");
    }
}
