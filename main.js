// Firebase imports and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCcs3j9YJL02lmO0lNdSz4C3BE91-sVipM",
    authDomain: "sopra-f8d9f.firebaseapp.com",
    projectId: "sopra-f8d9f",
    storageBucket: "sopra-f8d9f.firebasestorage.app",
    messagingSenderId: "418083166144",
    appId: "1:418083166144:web:35f5d5d7820a3788be5a25",
    measurementId: "G-GNE3R99FWQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Initialize balance if not already set
if (localStorage.getItem("balance") === null) {
    localStorage.setItem("balance", "80");
}

function updateBalanceDisplay() {
    let balance = parseFloat(localStorage.getItem("balance")) || 80; // Default to 80
    document.getElementById("user-balance").textContent = balance;
}

// Preloader logic
window.onload = function () {
    setTimeout(() => {
        document.getElementById("preloader").style.display = "none";
        checkForTelegramUsername();
    }, 100);
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

// Show main content
function showMainContent(username) {
    document.getElementById("main-content").style.display = "flex";
    document.getElementById("profile-username").textContent = username;
    updateBalanceDisplay();
    startCarousel();
}

// Update user balance in Firebase
function updateUserBalance(userId, newBalance) {
    const userRef = ref(database, `users/${userId}/balance`);
    update(userRef, { balance: newBalance })
        .then(() => console.log("Balance updated successfully"))
        .catch((error) => console.error("Error updating balance:", error));
}

// Add referral to user data
function addReferral(userId, referredUserId) {
    const referralsRef = ref(database, `users/${userId}/referrals`);
    get(referralsRef).then((snapshot) => {
        const referrals = snapshot.exists() ? snapshot.val() : [];
        referrals.push(referredUserId);
        update(referralsRef, referrals)
            .then(() => console.log("Referral added successfully"))
            .catch((error) => console.error("Error adding referral:", error));
    }).catch((error) => console.error("Error fetching referrals:", error));
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
