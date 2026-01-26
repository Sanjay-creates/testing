import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const provider = new GoogleAuthProvider();

// 🔹 Check if user is already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, redirect directly to app.html
    window.location.href = "app.html";
  }
});

// 🔹 Google Sign Up / Login
document.getElementById("googleBtn").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Logged in:", result.user);
      window.location.href = "app.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});
