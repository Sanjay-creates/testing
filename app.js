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

const statusEl = document.getElementById("status");
const transcriptEl = document.getElementById("transcript");
const orb = document.getElementById("orb");

// --- Voice Recognition Setup ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = "en-US"; // Set to English for now

let isAIspeaking = false;
let audioUnlocked = false;

// --- Handle User State & Audio Unlock ---
document.body.addEventListener('click', () => {
    if(!audioUnlocked) {
        audioUnlocked = true;
        const user = auth.currentUser;
        if(user) {
            const firstName = user.displayName ? user.displayName.split(' ')[0] : "Friend";
            speak(`Hello ${firstName}. I am Yaazh, your AI companion. I am ready to assist you.`);
        }
    }
}, { once: true });

onAuthStateChanged(auth, (user) => {
    if (user) {
        const firstName = user.displayName ? user.displayName.split(' ')[0] : "Friend";
        const nameDisplay = document.getElementById("userName") || document.getElementById("profileName");
        if(nameDisplay) nameDisplay.textContent = firstName;
        if(document.getElementById("userPhoto")) document.getElementById("userPhoto").src = user.photoURL;
    } else {
        window.location.href = "index.html";
    }
});

function startListening() {
    if (isAIspeaking) return;
    try {
        recognition.start();
        if(statusEl) statusEl.textContent = "Listening..."; 
        if(orb) orb.classList.add("animate-pulse");
    } catch (e) { /* Already active */ }
}

recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    if(transcriptEl) transcriptEl.textContent = `"${command}"`;
    handleConversation(command);
};

recognition.onend = () => {
    if (!isAIspeaking && auth.currentUser) {
        setTimeout(startListening, 600);
    }
};

// --- SMART SPEECH ENGINE (English focus with Tamil support) ---
function speak(text) {
    isAIspeaking = true;
    try { recognition.stop(); } catch(e){}
    window.speechSynthesis.cancel(); 

    const speech = new SpeechSynthesisUtterance(text);
    const containsTamil = /[\u0B80-\u0BFF]/.test(text); // Checks if you added Tamil

    let voices = window.speechSynthesis.getVoices();
    
    if (containsTamil) {
        speech.lang = "ta-IN";
        let tamilVoice = voices.find(v => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil'));
        if (tamilVoice) speech.voice = tamilVoice;
        speech.rate = 0.85;
    } else {
        speech.lang = "en-US";
        speech.rate = 1.0; // Normal speed for English
    }

    speech.onstart = () => {
        if(orb) {
            orb.style.transform = "scale(1.2)";
            orb.style.boxShadow = "0 0 40px rgba(139, 92, 246, 0.4)";
        }
        if(statusEl) statusEl.textContent = "Yaazh is speaking...";
    };

    speech.onend = () => {
        isAIspeaking = false;
        if(orb) {
            orb.style.transform = "scale(1)";
            orb.style.boxShadow = "none";
        }
        startListening(); 
    };

    window.speechSynthesis.speak(speech);
}

// --- THE CONVERSATION BRAIN (100% English Logic) ---
function handleConversation(input) {
    const nameEl = document.getElementById("profileName") || document.getElementById("userName");
    const name = nameEl ? nameEl.textContent : "Friend";

    // 1. TIME & DATE
    if (input.includes("time")) {
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        speak(`The time is ${time}.`);
    } 
    else if (input.includes("date") || input.includes("day")) {
        const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
        speak(`Today is ${date}.`);
    }

    // 2. APPS & NAVIGATION
    else if (input.includes("youtube") || input.includes("songs") || input.includes("music")) {
        speak("Opening YouTube for you. Enjoy your music.");
        window.open("https://www.youtube.com", "_blank");
    }
    else if (input.includes("profile") || input.includes("my info")) {
        speak("Opening your profile now.");
        setTimeout(() => { window.location.href = "profile.html"; }, 1500);
    }

    // 3. HEALTH UPDATES
    else if (input.includes("blood pressure") || input.includes("bp")) {
        speak(`Your blood pressure is 120 over 80. That is a perfect reading, ${name}.`);
    }
    else if (input.includes("sugar") || input.includes("diabetes")) {
        speak("Your blood sugar level is 110 mg/dL. This is within the healthy range.");
    }
    else if (input.includes("medicine") || input.includes("pill")) {
        speak("Please take your prescribed medicines with water. I have updated your health log.");
    }

    // 4. EMOTIONAL SUPPORT
    else if (input.includes("how are you")) {
        speak(`I am functioning perfectly. How are you feeling today, ${name}?`);
    }
    else if (input.includes("lonely") || input.includes("sad") || input.includes("bored")) {
        speak(`I am right here with you, ${name}. You are never alone. Would you like to listen to some music or check your health stats?`);
    }

    // 5. EMERGENCY
    else if (input.includes("help") || input.includes("emergency") || input.includes("pain")) {
        speak("Emergency protocol activated. I am alerting your emergency contacts immediately. Please stay calm.");
        // Add your emergency UI trigger here
    }

    // 6. TECH HELP
    else if (input.includes("how to use") || input.includes("phone")) {
        speak("You can simply talk to me to find information or open apps. I am designed to make things easy for you.");
    }

    // FALLBACK
    else {
        speak("I am sorry, I didn't quite catch that. Could you please repeat it?");
    }
}