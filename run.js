// Element Selectors 
const dino = document.getElementById("dino");
const obstacle = document.getElementById("obstacle");
const coin = document.getElementById("coin");
const scoreDisplay = document.getElementById("scoreDisplay");
const leaderboardEntries = document.getElementById("leaderboardEntries");
const gameOverDisplay = document.getElementById("gameOver");
const welcomeScreen = document.getElementById("welcomeScreen");
const finalScoreDisplay = document.getElementById("finalScore");
const startButton = document.getElementById("startButton");
const fileInput = document.getElementById("fileInput");
const profileImage = document.getElementById("profileImage");
const dinoHeadImg = document.getElementById("dinoHeadImg");
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Game State Variables
let isJumping = false;
let isGameOver = false;
let score = 0;
let obstacleSpeed = 6;
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
let gameStarted = false;
let isNightMode = false;

// Theme Handling
themeToggle.addEventListener("click", () => {
    isNightMode = !isNightMode;
    body.classList.toggle("night-mode");
    themeToggle.textContent = isNightMode ? "☀️" : "🌙";
    localStorage.setItem("nightMode", isNightMode);
});
if (localStorage.getItem("nightMode") === "true") {
    isNightMode = true;
    body.classList.add("night-mode");
    themeToggle.textContent = "☀️";
}

// Image Upload Handling
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            profileImage.src = e.target.result;
            dinoHeadImg.src = e.target.result;
            localStorage.setItem("dinoHeadImage", e.target.result);
        };
        reader.readAsDataURL(file);
    }
});
if (localStorage.getItem("dinoHeadImage")) {
    profileImage.src = localStorage.getItem("dinoHeadImage");
    dinoHeadImg.src = localStorage.getItem("dinoHeadImage");
}

// QUICKSELECT ALGORITHM

function quickselect(arr, k, left = 0, right = arr.length - 1, compare = (a, b) => b.score - a.score) {
    while (left <= right) {
        const pivotIndex = partition(arr, left, right, compare);
        if (pivotIndex === k) return arr[pivotIndex];
        else if (pivotIndex < k) left = pivotIndex + 1;
        else right = pivotIndex - 1;
    }
    return arr[k];
}
function partition(arr, left, right, compare) {
    const pivot = arr[right];
    let i = left;
    for (let j = left; j < right; j++) {
        if (compare(arr[j], pivot) < 0) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            i++;
        }
    }
    [arr[i], arr[right]] = [arr[right], arr[i]];
    return i;
}
function sortLeaderboard(arr) {
    if (arr.length <= 3) {
        arr.sort((a, b) => b.score - a.score);
        return arr;
    }
    quickselect(arr, 2);
    return arr.slice(0, 3).sort((a, b) => b.score - a.score);
}
function updateLeaderboardDisplay() {
    const sortedLeaderboard = sortLeaderboard([...leaderboard]);
    leaderboardEntries.innerHTML = sortedLeaderboard
        .map((entry, index) => {
            const labels = ["🥇 1st:", "🥈 2nd:", "🥉 3rd:"];
            return `<div>${labels[index]} ${entry.name} - ${entry.score}</div>`;
        })
        .join("");
}
function updateLeaderboardData() {
    const playerName = prompt("New High Score! Enter your name:") || "Anonymous";
    leaderboard.push({ name: playerName, score });
    leaderboard = sortLeaderboard(leaderboard).slice(0, 3);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    updateLeaderboardDisplay();
}

// Game Mechanics
function jump() {
    if (!isJumping && !isGameOver && gameStarted) {
        isJumping = true;
        dino.classList.add("jumping");
        setTimeout(() => {
            dino.classList.remove("jumping");
            isJumping = false;
        }, 500);
    }
}
function checkCollision() {
    const dinoRect = dino.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();
    return !(
        dinoRect.right < obstacleRect.left + 10 ||
        dinoRect.left + 10 > obstacleRect.right ||
        dinoRect.bottom < obstacleRect.top ||
        dinoRect.top > obstacleRect.bottom
    );
}
function checkCoinCollision() {
    if (coin.style.display === "none") return false;
    const dinoRect = dino.getBoundingClientRect();
    const coinRect = coin.getBoundingClientRect();
    return !(
        dinoRect.right < coinRect.left ||
        dinoRect.left > coinRect.right ||
        dinoRect.bottom < coinRect.top ||
        dinoRect.top > coinRect.bottom
    );
}
function createScorePopup(amount, x, y) {
    const popup = document.createElement("div");
    popup.className = "score-popup";
    popup.textContent = `+${amount}`;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
}
function createObstacle() {
    obstacle.innerHTML = '';
    const isBig = Math.random() > 0.5;
    const cactus = document.createElement("div");
    cactus.className = isBig ? "cactus-big" : "cactus-small";
    obstacle.appendChild(cactus);
}

// Game Loop & State
function startGame() {
    welcomeScreen.style.display = "none";
    gameStarted = true;
    resetGame();
}
function gameLoop() {
    if (isGameOver) return;

    // Move obstacle
    const currentLeft = parseInt(obstacle.style.left || "0");
    const newLeft = currentLeft - obstacleSpeed;
    if (newLeft < -50) {
        obstacle.style.left = window.innerWidth + "px";
        createObstacle();
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        if (score % 5 === 0 && obstacleSpeed < 15) obstacleSpeed += 0.5;
        if (score >= 10) {
            coin.style.display = "block";
            coin.style.left = `${900 + Math.random() * 300}px`;
        }
    } else {
        obstacle.style.left = `${newLeft}px`;
    }

    // Move coin if visible
    if (coin.style.display === "block") {
        const coinLeft = parseInt(coin.style.left || "0");
        const newCoinLeft = coinLeft - obstacleSpeed;
        if (newCoinLeft < -20) {
            coin.style.display = "none";
        } else {
            coin.style.left = `${newCoinLeft}px`;
        }
        if (checkCoinCollision()) {
            score += 5;
            scoreDisplay.textContent = `Score: ${score}`;
            coin.style.display = "none";
            const dinoRect = dino.getBoundingClientRect();
            createScorePopup(5, dinoRect.left + 40, dinoRect.top - 20);
        }
    }

    // Check collision
    if (checkCollision()) {
        isGameOver = true;
        gameOverDisplay.style.display = "block";
        finalScoreDisplay.textContent = `Score: ${score}`;
        if (leaderboard.length < 3 || score > leaderboard[leaderboard.length - 1]?.score) {
            updateLeaderboardData();
        }
    }

    requestAnimationFrame(gameLoop);
}
function resetGame() {
    isGameOver = false;
    isJumping = false;
    score = 0;
    obstacleSpeed = 6;
    dino.classList.remove("jumping");
    obstacle.style.left = window.innerWidth + "px";
    createObstacle();
    coin.style.display = "none";
    gameOverDisplay.style.display = "none";
    scoreDisplay.textContent = `Score: ${score}`;
    gameLoop();
}
function initGame() {
    updateLeaderboardDisplay();
    obstacle.style.left = window.innerWidth + "px";
    createObstacle();
    gameOverDisplay.addEventListener("mousedown", resetGame);
    gameOverDisplay.addEventListener("touchstart", resetGame);
}

// Event Listeners
document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        event.preventDefault();
        if (!gameStarted && welcomeScreen.style.display !== "none") return;
        jump();
    }
});
document.addEventListener("mousedown", () => {
    if (!gameStarted && welcomeScreen.style.display !== "none") return;
    jump();
});
document.addEventListener("touchstart", () => {
    if (!gameStarted && welcomeScreen.style.display !== "none") return;
    jump();
});
startButton.addEventListener("click", startGame);

// Start the Game
initGame();
