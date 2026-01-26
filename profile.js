import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Populating the Profile Box (Left Side)
        document.getElementById("profileName").textContent = user.displayName;
        document.getElementById("profileEmail").textContent = user.email;
        document.getElementById("profilePic").src = user.photoURL || "https://via.placeholder.com/150";
    } else {
        window.location.href = "index.html";
    }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    });
});