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

// Initialize local storage balance if not already set
if (localStorage.getItem("balance") === null) {
    localStorage.setItem("balance", "80");
}

// Preloader logic with fallback
window.onload = function () {
    const timeoutDuration = 1500; // 1.5 seconds
    const fallbackTimeout = 5000; // Fallback if Telegram API fails

    const fallback = setTimeout(() => {
        alert("Unable to load Telegram data. Please try reloading the app.");
        showMainContent("Guest"); // Default to "Guest" if Telegram API fails
    }, fallbackTimeout);

    setTimeout(() => {
        document.getElementById("preloader").style.display = "none";
        clearTimeout(fallback);
        checkForTelegramUsername();
    }, timeoutDuration);
};

// Check Telegram username and initialize user data
function checkForTelegramUsername() {
    if (window.Telegram && Telegram.WebApp) {
        const telegramUser = Telegram.WebApp.initDataUnsafe.user;

        if (telegramUser && telegramUser.username) {
            initializeUserData(telegramUser.id, telegramUser.username);
            syncBalance(telegramUser.id);
            showMainContent(telegramUser.username);
        } else {
            alert("Unable to retrieve Telegram username. Using default settings.");
            showMainContent("Guest");
        }
    } else {
        alert("Telegram WebApp API is not available.");
        showMainContent("Guest");
    }
}

// Show main content and update dynamic data
function showMainContent(username) {
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
            set(userRef, {
                username: username,
                balance: parseFloat(localStorage.getItem("balance")) || 80,
                dateJoined: new Date().toISOString(),
                referrals: [],
                tasks: {},
            }).then(() => console.log("User data initialized successfully"))
              .catch((error) => console.error("Error initializing user data:", error));
        } else {
            console.log("User data already exists.");
        }
    }).catch((error) => console.error("Error checking user data:", error));
}

// Sync Firebase and local data (balance)
function syncBalance(userId) {
    const userRef = ref(database, `users/${userId}`);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const firebaseBalance = snapshot.val().balance;
            localStorage.setItem("balance", firebaseBalance.toString());
            updateBalanceDisplay();
        }
    }).catch((error) => console.error("Error syncing balance:", error));
}

// Update balance display
function updateBalanceDisplay() {
    const balance = parseFloat(localStorage.getItem("balance")) || 80;
    document.getElementById("user-balance").textContent = `$${balance} SKY`;
}

// Update balance and sync with Firebase
function updateBalance(userId, newBalance) {
    const userRef = ref(database, `users/${userId}`);
    update(userRef, { balance: newBalance })
        .then(() => {
            localStorage.setItem("balance", newBalance.toString());
            updateBalanceDisplay();
            console.log("Balance updated successfully.");
        })
        .catch((error) => console.error("Error updating balance:", error));
}

// Add referral
function addReferral(userId, referralUsername) {
    const userRef = ref(database, `users/${userId}/referrals`);
    get(userRef).then((snapshot) => {
        const referrals = snapshot.exists() ? snapshot.val() : [];
        if (!referrals.includes(referralUsername)) {
            referrals.push(referralUsername);
            update(ref(database, `users/${userId}`), { referrals })
                .then(() => console.log("Referral added successfully."))
                .catch((error) => console.error("Error adding referral:", error));
        }
    }).catch((error) => console.error("Error retrieving referrals:", error));
}

// Add task and track status
function addTask(userId, taskId, status = "pending") {
    const taskRef = ref(database, `users/${userId}/tasks/${taskId}`);
    set(taskRef, { status })
        .then(() => console.log(`Task ${taskId} added with status: ${status}`))
        .catch((error) => console.error("Error adding task:", error));
}

// Update task status
function updateTaskStatus(userId, taskId, status) {
    const taskRef = ref(database, `users/${userId}/tasks/${taskId}`);
    update(taskRef, { status })
        .then(() => console.log(`Task ${taskId} status updated to: ${status}`))
        .catch((error) => console.error("Error updating task status:", error));
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
