// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDkhGKUTHuJDSn_ZWDC6oWRPCRy-ta10c0",
    authDomain: "project-1-5b4bd.firebaseapp.com",
    databaseURL: "https://project-1-5b4bd-default-rtdb.firebaseio.com",
    projectId: "project-1-5b4bd",
    storageBucket: "project-1-5b4bd.appspot.com",
    messagingSenderId: "164037063325",
    appId: "1:164037063325:web:6cd1610f52d25cb5575a74",
    measurementId: "G-LLRRJLBBRD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Initialize balance if not already set
if (localStorage.getItem("balance") === null) {
    localStorage.setItem("balance", "80");
}

// Preloader logic with delay to ensure everything loads
window.onload = function () {
    setTimeout(() => {
        document.getElementById("preloader").style.display = "none";
        checkForTelegramUsername();
    }, 1500); // Delay for 1.5 seconds
};

// Check for Telegram username and initialize user data
function checkForTelegramUsername() {
    if (window.Telegram && Telegram.WebApp) {
        const telegramUser = Telegram.WebApp.initDataUnsafe.user;

        if (telegramUser && telegramUser.username) {
            initializeUserData(telegramUser.id, telegramUser.username);
            showMainContent(telegramUser.username);
        } else {
            alert("Unable to retrieve Telegram username. Please ensure the app is opened via Telegram.");
        }
    } else {
        alert("Telegram WebApp API is not available.");
    }
}

// Show main content and update user details
function showMainContent(username) {
    // Show the main content after preloader
    document.getElementById("main-content").style.display = "flex";
    document.getElementById("profile-username").textContent = username;
    updateBalanceDisplay();
    startCarousel();
}

// Initialize user data in Firebase
function initializeUserData(userId, username) {
    const userRef = ref(database, `users/${userId}`);
    get(userRef).then((snapshot) => {
        if (!snapshot.exists()) {
            // Save new user data
            set(userRef, {
                username: username,
                balance: parseFloat(localStorage.getItem("balance")) || 80,
                dateJoined: new Date().toISOString(),
                referrals: [],
            })
                .then(() => console.log("User data initialized successfully"))
                .catch((error) => console.error("Error initializing user data:", error));
        } else {
            console.log("User data already exists.");
        }
    }).catch((error) => console.error("Error checking user data:", error));
}

// Update balance display on page load
function updateBalanceDisplay() {
    let balance = parseFloat(localStorage.getItem("balance")) || 80;
    document.getElementById("user-balance").textContent = `$${balance} SKY`;
}

// Carousel logic
function startCarousel() {
    const carousel = document.querySelector(".carousel-images");
    const images = document.querySelectorAll(".carousel-images img");
    let index = 0;
    setInterval(() => {
        index = (index + 1) % images.length;
        carousel.style.transform = `translateX(-${index * 100}%)`;
    }, 5000);
}
