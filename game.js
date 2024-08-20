let dino = document.getElementById('dino');
let obstacle = document.getElementById('obstacle');
let scoreDisplay = document.getElementById('score');
let levelDisplay = document.getElementById('levelDisplay');
let gameContainer = document.getElementById('gameContainer');
let gameOverBox = document.getElementById('gameOverBox');
let finalScore = document.getElementById('finalScore');
let playAgainButton = document.getElementById('playAgainButton');
let mobileMessageBox = document.getElementById('mobileMessageBox');
let startGameButton = document.getElementById('startGameButton');
let codeMessageGameOver = document.getElementById('codeMessageGameOver');
let congratulatoryMessageBox = document.getElementById('congratulatoryMessage');
let codeMessageCongratulatory = document.getElementById('codeMessageCongratulatory');

// Define difficulty levels (10 levels)
const DIFFICULTY_LEVELS = [
    { speed: 5, jumpVelocity: 16, spawnChance: 0.6, obstacleSpacing: 40 },
    { speed: 6, jumpVelocity: 15, spawnChance: 0.65, obstacleSpacing: 60 },
    { speed: 7, jumpVelocity: 14, spawnChance: 0.7, obstacleSpacing: 80 },
    { speed: 8, jumpVelocity: 13, spawnChance: 0.75, obstacleSpacing: 100 },
    { speed: 9, jumpVelocity: 12, spawnChance: 0.8, obstacleSpacing: 120 },
    { speed: 10, jumpVelocity: 11, spawnChance: 0.85, obstacleSpacing: 140 },
    { speed: 11, jumpVelocity: 10, spawnChance: 0.9, obstacleSpacing: 160 },
    { speed: 15, jumpVelocity: 9, spawnChance: 0.95, obstacleSpacing: 155 },
    { speed: 15, jumpVelocity: 8, spawnChance: 1.0, obstacleSpacing: 200 },
    { speed: 16, jumpVelocity: 7, spawnChance: 1.05, obstacleSpacing: 220 }
];

// Array of obstacle images
const OBSTACLE_IMAGES = [
    'img/obstacle1.png',
    'img/obstacle2.png',
    'img/obstacle3.png',
    'img/obstacle4.png',
    'img/obstacle5.png'
];

let isJumping = false;
let isFalling = false;
let score = 0;
let obstacleSpeed = DIFFICULTY_LEVELS[0].speed;
let gameOver = false;

const GRAVITY = -0.489;
let JUMP_VELOCITY = DIFFICULTY_LEVELS[0].jumpVelocity;
let obstacleSpacing = DIFFICULTY_LEVELS[0].obstacleSpacing;

let dinoBottom = 0;
let dinoVelocity = 0;

let difficultyIncreaseInterval = 2000;
let difficultyTimer = 0;

let currentLevel = 0;
let levelUpScore = 100;

let lastObstacleImage = null;

let fpsDisplay = document.getElementById('fpsDisplay');
let lastFrameTime = performance.now();
let frameCount = 0;

// Function to detect mobile devices
function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

// Resize the game container for mobile and desktop
function resizeGameContainer() {
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    
    let containerWidth = viewportWidth * 0.9;
    let containerHeight = Math.min(viewportHeight * 0.6, 400);

    gameContainer.style.width = containerWidth + 'px';
    gameContainer.style.height = containerHeight + 'px';

    gameContainer.style.position = 'absolute';
    gameContainer.style.top = '50%';
    gameContainer.style.left = '50%';
    gameContainer.style.transform = 'translate(-50%, -50%)';

    dino.style.bottom = '0px';
    dino.style.left = '10%';

    let cloudElements = document.querySelectorAll('#cloud, #cloud2, #cloud3');
    cloudElements.forEach(cloud => {
        cloud.style.width = containerWidth * 0.3 + 'px';
        cloud.style.height = containerHeight * 0.3 + 'px';
    });
}

window.addEventListener('resize', resizeGameContainer);
resizeGameContainer();

function enterFullscreen() {
    if (gameContainer.requestFullscreen) {
        gameContainer.requestFullscreen();
    } else if (gameContainer.mozRequestFullScreen) {
        gameContainer.mozRequestFullScreen();
    } else if (gameContainer.webkitRequestFullscreen) {
        gameContainer.webkitRequestFullscreen();
    } else if (gameContainer.msRequestFullscreen) {
        gameContainer.msRequestFullscreen();
    }
}

// Start game button event listener
startGameButton.addEventListener('click', () => {
    enterFullscreen();
    startGame();
});

// Function to start the game
function startGame() {
    mobileMessageBox.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    gameLoop();
}

// Show message and start button for mobile users
if (isMobile()) {
    gameContainer.classList.add('hidden');
    mobileMessageBox.classList.remove('hidden');

    startGameButton.addEventListener('click', () => {
        startGame();
    });

    startGameButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    }, { passive: false });
}

// Function to handle jumping
function jump() {
    if (!isJumping && !gameOver) {
        isJumping = true;
        dinoVelocity = JUMP_VELOCITY;
        dino.style.transition = 'none';
    }
}

// Listen for keyboard events
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        jump();
    }
});

document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
}, { passive: false });

document.addEventListener('touchend', (e) => {
    e.preventDefault();
}, { passive: false });

playAgainButton.addEventListener('click', () => {
    resetGame();
    gameOverBox.style.display = 'none';
});

playAgainButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    resetGame();
    gameOverBox.style.display = 'none';
}, { passive: false });

function generateCode() {
    return Math.floor(1000000 + Math.random() * 9000000);
}

function updateDifficulty() {
    if (score >= (currentLevel + 1) * levelUpScore && currentLevel < DIFFICULTY_LEVELS.length - 1) {
        currentLevel++;
        obstacleSpeed = DIFFICULTY_LEVELS[currentLevel].speed;
        JUMP_VELOCITY = DIFFICULTY_LEVELS[currentLevel].jumpVelocity;
        difficultyIncreaseInterval = 2000 / (currentLevel + 1);
        obstacleSpacing = DIFFICULTY_LEVELS[currentLevel].obstacleSpacing;
        levelDisplay.innerText = `Level: ${currentLevel}`;
        console.log(`Level Up! Current Level: ${currentLevel}`);

        if (currentLevel === 1) {
            congratulatoryMessageBox.classList.remove('hidden');
            codeMessageCongratulatory.innerText = `Your code: ${generateCode()}`;
            gameOver = true;
        }
    }
}

let collisionCheckInterval = 100;
let lastCollisionCheck = performance.now();

function updateGame() {
    if (gameOver) return;

    let containerRect = gameContainer.getBoundingClientRect();
    let dinoRect = dino.getBoundingClientRect();
    let obstacleRect = obstacle.getBoundingClientRect();

    if (isJumping || isFalling) {
        dinoVelocity += GRAVITY;
        dinoBottom += dinoVelocity;

        if (dinoBottom <= 0) {
            dinoBottom = 0;
            isJumping = false;
            isFalling = false;
        } else if (dinoBottom > containerRect.height - dinoRect.height) {
            dinoBottom = containerRect.height - dinoRect.height;
            isFalling = false;
        }

        dino.style.bottom = dinoBottom + 'px';
    }

    let obstacleRight = parseInt(getComputedStyle(obstacle).right);
    obstacle.style.transform = `translateX(${obstacleRight + obstacleSpeed}px)`;

    if (obstacleRight > containerRect.width) {
        obstacle.style.transform = `translateX(-${obstacleSpacing}px)`;
        score += 10;
        scoreDisplay.innerHTML = `Okin's: ${score} <img class="head-ring-score" src="img/ring.png" alt="ringscore">`;

        updateDifficulty();

        let newImage;
        do {
            newImage = OBSTACLE_IMAGES[Math.floor(Math.random() * OBSTACLE_IMAGES.length)];
        } while (newImage === lastObstacleImage);

        lastObstacleImage = newImage;
        obstacle.style.backgroundImage = `url('${lastObstacleImage}')`;
    }

    let now = performance.now();
    if (now - lastCollisionCheck > collisionCheckInterval) {
        lastCollisionCheck = now;

        if (dinoRect.left < obstacleRect.right &&
            dinoRect.right > obstacleRect.left &&
            dinoRect.bottom > obstacleRect.top) {
            gameOver = true;
            finalScore.innerHTML = `Okin's <img class="ring-score" src="img/ring.png" alt="ringscore"> : ${score}`;
            codeMessageGameOver.innerText = `Your code: ${generateCode()}`;
            gameOverBox.style.display = 'block';
        }
    }
}

function gameLoop() {
    if (!gameOver) {
        updateGame();

        frameCount++;
        let now = performance.now();
        let elapsed = now - lastFrameTime;

        if (elapsed >= 1000) {
            let fps = (frameCount / elapsed) * 1000;
            fpsDisplay.innerText = `FPS: ${Math.round(fps)}`;
            frameCount = 0;
            lastFrameTime = now;
        }

        requestAnimationFrame(gameLoop);
    }
}

function resetGame() {
    isJumping = false;
    isFalling = false;
    score = 0;
    currentLevel = 0;
    obstacleSpeed = DIFFICULTY_LEVELS[0].speed;
    JUMP_VELOCITY = DIFFICULTY_LEVELS[0].jumpVelocity;
    obstacleSpacing = DIFFICULTY_LEVELS[0].obstacleSpacing;
    dinoBottom = 0;
    dinoVelocity = 0;
    gameOver = false;
    scoreDisplay.innerHTML = `Okin's: 0 <img class="head-ring-score" src="img/ring.png" alt="ringscore">`;
    levelDisplay.innerText = `Level: 0`;
    obstacle.style.transform = 'translateX(0)';
    dino.style.bottom = '0px';
    gameLoop();
}
