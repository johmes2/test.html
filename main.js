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
            showMainContent(telegramUser.username);
        } else {
            alert("Unable to retrieve Telegram username. Please ensure the app is opened via Telegram.");
        }
    } else {
        alert("Telegram WebApp API is not available.");
    }
}

// Show main content
function showMainContent(username) {
    document.getElementById('main-content').style.display = 'flex';
    document.getElementById('profile-username').textContent = username;
    const balance = localStorage.getItem('balance') || 80;
    document.getElementById('user-balance').textContent = balance;
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
