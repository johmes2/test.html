// Firebase SDK imports
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Initialize Firebase (already included in index.html as per previous setup)
// Ensure Firebase is initialized properly in the script
const database = getDatabase(); // Initialize Firebase Realtime Database

// Initialize balance to 80 if not already set
if (localStorage.getItem('balance') === null) {
    localStorage.setItem('balance', '80');
}

function updateBalanceDisplay() {
    let balance = parseFloat(localStorage.getItem('balance')) || 80; // Default to 80
    console.log(`Current Balance: $${balance} SKY`); // Debugging step
    // Optional: Update a balance display element on the page
    // document.getElementById('balance-display').textContent = `$${balance} SKY`;
}

// Call this function on page load
updateBalanceDisplay();

// Preloader logic
window.onload = function () {
    // Set a timeout to ensure that the preloader disappears after loading
    setTimeout(() => {
        document.getElementById('preloader').style.display = 'none'; // Hide preloader after a slight delay
        checkForTelegramUsername(); // Proceed with checking Telegram username after preloader is hidden
    }, 2000); // Timeout of 2 seconds for smooth transition
};

// Function to check for the Telegram username
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

// Function to show main content (profile, balance, etc.)
function showMainContent(username, balance) {
    document.getElementById('main-content').style.display = 'flex';
    document.getElementById('profile-username').textContent = username;
    document.getElementById('user-balance').textContent = balance;

    // Update Firebase balance and other data
    const userId = Telegram.WebApp.initDataUnsafe.user.id.toString();
    updateUserData(userId, { balance: balance });

    startCarousel();
}

// Update user data in Firebase
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
