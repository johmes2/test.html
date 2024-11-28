// Firebase SDK imports
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Initialize Firebase and database
const database = getDatabase();

// Function to retrieve data from Firebase Realtime Database
function getUserData(userId) {
    const userRef = ref(database, 'users/' + userId);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log("User Data retrieved:", userData);
            updateUI(userData);
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}

// Function to update data in Firebase Realtime Database
function updateUserData(userId, data) {
    const userRef = ref(database, 'users/' + userId);
    update(userRef, data)
        .then(() => {
            console.log("User data updated in Firebase.");
        })
        .catch((error) => {
            console.error("Error updating data: ", error);
        });
}

// Preloader logic
window.onload = function () {
    setTimeout(() => {
        document.getElementById('preloader').style.display = 'none';
        checkForTelegramUsername();
    }, 1000); // Wait for 1 second before checking username
};

// Check if Telegram username is available
function checkForTelegramUsername() {
    if (window.Telegram && Telegram.WebApp) {
        const telegramUser = Telegram.WebApp.initDataUnsafe.user;

        if (telegramUser && telegramUser.username) {
            // Set username in Firebase if it doesn't exist
            const userId = telegramUser.id.toString();
            const userRef = ref(database, 'users/' + userId);
            get(userRef).then((snapshot) => {
                if (!snapshot.exists()) {
                    // New user, set up initial data
                    set(userRef, {
                        username: telegramUser.username,
                        balance: 80, // Default balance
                        joinedDate: new Date().toISOString(),
                        referrals: 0
                    }).then(() => {
                        console.log("New user data set in Firebase.");
                        showMainContent(telegramUser.username, 80); // Show main content with default balance
                    });
                } else {
                    // User exists, fetch and update UI
                    const userData = snapshot.val();
                    showMainContent(userData.username, userData.balance);
                }
            }).catch((error) => {
                console.error("Error retrieving user data: ", error);
            });
        } else {
            alert("Unable to retrieve Telegram username. Please ensure the app is opened via Telegram.");
        }
    } else {
        alert("Telegram WebApp API is not available.");
    }
}

// Show main content (profile, balance, etc.)
function showMainContent(username, balance) {
    document.getElementById('main-content').style.display = 'flex';
    document.getElementById('profile-username').textContent = username;
    document.getElementById('user-balance').textContent = balance;

    // Update Firebase balance and other data
    const userId = Telegram.WebApp.initDataUnsafe.user.id.toString();
    updateUserData(userId, { balance: balance });

    startCarousel();
}

// Update UI with user data
function updateUI(userData) {
    document.getElementById('profile-username').textContent = userData.username;
    document.getElementById('user-balance').textContent = userData.balance;
}

// Carousel logic
function startCarousel() {
    const carousel = document.querySelector('.carousel-images');
    const images = document.querySelectorAll('.carousel-images img');
    let index = 0;
    setInterval(() => {
        index = (index + 1) % images.length;
        carousel.style.transform = `translateX(-${index * 100}%)`;
    }, 5000); // Change image every 5 seconds
}

// Balance update logic
function updateBalance(newBalance) {
    // Update local storage balance and Firebase database
    localStorage.setItem('balance', newBalance);
    const userId = Telegram.WebApp.initDataUnsafe.user.id.toString();
    updateUserData(userId, { balance: newBalance });
    document.getElementById('user-balance').textContent = newBalance;
    console.log(`Balance updated to: $${newBalance}`);
}

// Add referral logic (increment referral count)
function addReferral() {
    const userId = Telegram.WebApp.initDataUnsafe.user.id.toString();
    const userRef = ref(database, 'users/' + userId);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            const newReferralCount = userData.referrals + 1;
            updateUserData(userId, { referrals: newReferralCount });
            console.log(`Referral count updated: ${newReferralCount}`);
        }
    }).catch((error) => {
        console.error(error);
    });
}
