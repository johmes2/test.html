import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase Database Reference
const db = getDatabase();

// Initialize balance to 80 if not already set
if (localStorage.getItem('balance') === null) {
    localStorage.setItem('balance', '80');
}

function updateBalanceDisplay() {
    let balance = parseFloat(localStorage.getItem('balance')) || 80; // Default to 80
    document.getElementById('user-balance').textContent = balance;
}

// Call this function on page load
updateBalanceDisplay();

// Preloader logic
window.onload = function () {
    setTimeout(() => {
        document.getElementById('preloader').style.display = 'none';
        checkForTelegramUsername();
    }, 100);
};

// Use Telegram API to get the username
function checkForTelegramUsername() {
    if (window.Telegram && Telegram.WebApp) {
        const telegramUser = Telegram.WebApp.initDataUnsafe.user;

        if (telegramUser && telegramUser.username) {
            saveUserToFirebase(telegramUser.username);
            showMainContent(telegramUser.username);
        } else {
            alert("Unable to retrieve Telegram username. Please ensure the app is opened via Telegram.");
        }
    } else {
        alert("Telegram WebApp API is not available.");
    }
}

// Save user data to Firebase
function saveUserToFirebase(username) {
    const userRef = ref(db, `users/${username}`);
    const joinDate = new Date().toISOString();

    get(userRef).then((snapshot) => {
        if (!snapshot.exists()) {
            set(userRef, {
                username: username,
                balance: 80, // Default balance
                joinDate: joinDate,
            });
        }
    }).catch((error) => {
        console.error("Error saving user data:", error);
    });
}

// Show main content
function showMainContent(username) {
    document.getElementById('main-content').style.display = 'flex';
    document.getElementById('profile-username').textContent = username;

    const userRef = ref(db, `users/${username}`);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            document.getElementById('user-balance').textContent = data.balance;
        }
    }).catch((error) => {
        console.error("Error fetching user data:", error);
    });

    startCarousel();
}

// Carousel logic
function startCarousel() {
    const carousel = document.querySelector('.carousel-images');
    const images = document.querySelectorAll('.carousel-images img');
    let index = 0;
    setInterval(() => {
        index = (index + 1) % images.length;
        carousel.style.transform = `translateX(-${index * 100}%)`;
    }, 5000);
}
