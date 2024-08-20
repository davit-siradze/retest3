let dino = document.getElementById('dino');
let obstacle = document.getElementById('obstacle');
let scoreDisplay = document.getElementById('score');
let levelDisplay = document.getElementById('levelDisplay'); // New element for displaying level
let gameContainer = document.getElementById('gameContainer');
let gameOverBox = document.getElementById('gameOverBox');
let finalScore = document.getElementById('finalScore');
let playAgainButton = document.getElementById('playAgainButton');
let mobileMessageBox = document.getElementById('mobileMessageBox');
let startGameButton = document.getElementById('startGameButton');
let codeMessageGameOver = document.getElementById('codeMessageGameOver'); // Updated to match HTML ID
let congratulatoryMessageBox = document.getElementById('congratulatoryMessage');
let codeMessageCongratulatory = document.getElementById('codeMessageCongratulatory'); // Updated to match HTML ID

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
let obstacleSpeed = DIFFICULTY_LEVELS[0].speed; // Initial speed of the obstacle
let gameOver = false; // Flag to track game state

const GRAVITY = -0.6; // Gravity effect
let JUMP_VELOCITY = DIFFICULTY_LEVELS[0].jumpVelocity; // Initial jump velocity
let obstacleSpacing = DIFFICULTY_LEVELS[0].obstacleSpacing; // Initial obstacle spacing

let dinoBottom = 0; // Dino's bottom position in px
let dinoVelocity = 0; // Dino's vertical velocity

let difficultyIncreaseInterval = 2000; // Time interval for increasing difficulty (ms)
let difficultyTimer = 0; // Timer to track time elapsed for difficulty increase

let currentLevel = 0; // Start at level 0
let levelUpScore = 100; // Score threshold to move to the next level

let lastObstacleImage = null; // To track the last image shown

// Function to detect mobile devices
function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}
function resizeGameContainer() {
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    
    // Set the container dimensions to fit better on mobile devices
    let containerWidth = viewportWidth * 0.9; // 90% of viewport width
    let containerHeight = Math.min(viewportHeight * 0.6, 400); // Adjusted to 60% of viewport height or max 400px

    gameContainer.style.width = containerWidth + 'px';
    gameContainer.style.height = containerHeight + 'px';
    
    // Center the game container
    gameContainer.style.position = 'absolute';
    gameContainer.style.top = '50%';
    gameContainer.style.left = '50%';
    gameContainer.style.transform = 'translate(-50%, -50%)';

    // Adjust the position of the Dino within the game container
    dino.style.bottom = '0px';
    dino.style.left = '10%';

    // Adjust cloud sizes based on container size
    let cloudElements = document.querySelectorAll('#cloud, #cloud2,#cloud3');
    cloudElements.forEach(cloud => {
        cloud.style.width = containerWidth * 0.3 + 'px'; // 30% of container width
        cloud.style.height = containerHeight * 0.3 + 'px'; // 30% of container height
    });
}

// Add the resize event listener and call it initially
window.addEventListener('resize', resizeGameContainer);
resizeGameContainer();


function enterFullscreen() {
    if (gameContainer.requestFullscreen) {
        gameContainer.requestFullscreen();
    } else if (gameContainer.mozRequestFullScreen) { /* Firefox */
        gameContainer.mozRequestFullScreen();
    } else if (gameContainer.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        gameContainer.webkitRequestFullscreen();
    } else if (gameContainer.msRequestFullscreen) { /* IE/Edge */
        gameContainer.msRequestFullscreen();
    }
}

// Call this function when you want to enter fullscreen mode, e.g., on game start
startGameButton.addEventListener('click', () => {
    enterFullscreen();
    startGame();
});

// Function to start the game
function startGame() {
    mobileMessageBox.classList.add('hidden'); // Hide the message box
    gameContainer.classList.remove('hidden'); // Show the game container
    gameLoop(); // Start the game loop
}

// Show message and start button for mobile users
if (isMobile()) {
    gameContainer.classList.add('hidden'); // Hide game container initially
    mobileMessageBox.classList.remove('hidden'); // Show the mobile message box

    startGameButton.addEventListener('click', () => {
        startGame();
    });

    startGameButton.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent default touch behavior
        startGame();
    }, { passive: false }); // Ensure preventDefault works
}

// Function to handle jumping
function jump() {
    if (!isJumping && !gameOver) {
        isJumping = true;
        dinoVelocity = JUMP_VELOCITY; // Set initial jump velocity
        dino.style.transition = 'none'; // Ensure no transition interference
    }
}

// Listen for keyboard events for desktop
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        jump();
    }
});

document.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent default touch behavior
    jump();
}, { passive: false }); // Ensure preventDefault works

document.addEventListener('touchend', (e) => {
    e.preventDefault();
}, { passive: false });
// Play again button event listener
playAgainButton.addEventListener('click', () => {
    resetGame();
    gameOverBox.style.display = 'none'; // Hide game over box
});

// Ensure touch events are handled for mobile
playAgainButton.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent default touch behavior
    resetGame();
    gameOverBox.style.display = 'none'; // Hide game over box
}, { passive: false }); // Ensure preventDefault works

// Resize gameContainer based on window size
function resizeGameContainer() {
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let containerWidth = viewportWidth * 0.9; // 90% of viewport width
    let containerHeight = viewportHeight * 0.6; // 60% of viewport height
    
    gameContainer.style.width = containerWidth + 'px';
    gameContainer.style.height = containerHeight + 'px';
    
    // Adjust cloud sizes based on container size
    let cloudElements = document.querySelectorAll('#cloud, #cloud2');
    cloudElements.forEach(cloud => {
        cloud.style.width = containerWidth * 0.3 + 'px'; // 10% of container width
        cloud.style.height = containerHeight * 0.3 + 'px'; // 10% of container height
    });
}

window.addEventListener('resize', resizeGameContainer);

// Initial resize
resizeGameContainer();

// Function to generate a 7-digit code
function generateCode() {
    return Math.floor(1000000 + Math.random() * 9000000);
}

function updateDifficulty() {
    if (score >= (currentLevel + 1) * levelUpScore && currentLevel < DIFFICULTY_LEVELS.length - 1) {
        currentLevel++;
        obstacleSpeed = DIFFICULTY_LEVELS[currentLevel].speed;
        JUMP_VELOCITY = DIFFICULTY_LEVELS[currentLevel].jumpVelocity;
        difficultyIncreaseInterval = 2000 / (currentLevel + 1); // Increase difficulty more often
        obstacleSpacing = DIFFICULTY_LEVELS[currentLevel].obstacleSpacing; // Update spacing
        levelDisplay.innerText = `დონე: ${currentLevel}`; // Update level display
        console.log(`Level Up! Current Level: ${currentLevel}`);

        // Check if player has reached level 2
        if (currentLevel === 1) {
            console.log('Level 2 reached! Showing congratulatory message.');
            congratulatoryMessageBox.classList.remove('hidden'); // Show the congratulatory message
            codeMessageCongratulatory.innerText = `Your code: ${generateCode()}`; // Display the code in the congratulatory message
            console.log('Congratulations! You won a pack of biscuits!');

            // End the game
            gameOver = true; // Stop the game loop
        }
    }
}

function updateGame() {
    if (gameOver) return;

    let containerRect = gameContainer.getBoundingClientRect();
    let dinoRect = dino.getBoundingClientRect();
    let obstacleRect = obstacle.getBoundingClientRect();

    // Update dino's vertical position
    if (isJumping || isFalling) {
        dinoVelocity += GRAVITY; // Apply gravity
        dinoBottom += dinoVelocity; // Update vertical position

        if (dinoBottom <= 0) { // Ensure dino stays within the bottom boundary
            dinoBottom = 0;
            isJumping = false;
            isFalling = false;
        } else if (dinoBottom > containerRect.height - dinoRect.height) {
            dinoBottom = containerRect.height - dinoRect.height;
            isFalling = false;
        }

        dino.style.bottom = dinoBottom + 'px';
    }

    // Obstacle movement and reset logic
    let obstacleRight = parseInt(getComputedStyle(obstacle).right);
    obstacle.style.right = (obstacleRight + obstacleSpeed) + 'px';

    if (obstacleRight > containerRect.width) {
        obstacle.style.right = -obstacleSpacing + 'px';
        score += 10;
        scoreDisplay.innerHTML = `Okin's : ${score} <img class="head-ring-score" src="img/ring.png" alt="ringscore"> `;

        // Update difficulty
        updateDifficulty();

        // Update obstacle image
        let newImage;
        do {
            newImage = OBSTACLE_IMAGES[Math.floor(Math.random() * OBSTACLE_IMAGES.length)];
        } while (newImage === lastObstacleImage);

        lastObstacleImage = newImage;
        obstacle.style.backgroundImage = `url('${lastObstacleImage}')`;
    }

    // Collision detection
    if (dinoRect.left < obstacleRect.right &&
        dinoRect.right > obstacleRect.left &&
        dinoRect.bottom > obstacleRect.top) {
        gameOver = true;
        finalScore.innerHTML = `Okin's <img class="ring-score" src="img/ring.png" alt="ringscore"> : ${score}`;
        codeMessageGameOver.innerText = `თქვენი კოდი: ${generateCode()}`;
        gameOverBox.style.display = 'block';
    }

    difficultyTimer += 20;
    if (difficultyTimer >= difficultyIncreaseInterval) {
        difficultyTimer = 0;
    }
}


// Function to reset the game
function resetGame() {
    gameOver = false;
    score = 0;
    scoreDisplay.innerHTML = `Okin's <img class="head-ring-score" src="img/ring.png" alt="ringscore">: 0`; // Reset score display
    obstacle.style.right = -obstacleSpacing + 'px'; // Reset obstacle position
    lastObstacleImage = null; // Reset last image to ensure a new one is picked
    dinoBottom = 0;
    dinoVelocity = 0;
    dino.style.bottom = '0px';

    // Reset to initial level settings
    currentLevel = 0;
    obstacleSpeed = DIFFICULTY_LEVELS[0].speed;
    JUMP_VELOCITY = DIFFICULTY_LEVELS[0].jumpVelocity;
    obstacleSpacing = DIFFICULTY_LEVELS[0].obstacleSpacing;
    levelDisplay.innerText = `დონე: ${currentLevel}`;
    gameOverBox.style.display = 'none'; // Hide game over box
    congratulatoryMessageBox.classList.add('hidden'); // Hide the congratulatory message
}

// Main game loop
function gameLoop() {
    updateGame();
    requestAnimationFrame(gameLoop); // Request the next frame
}

// Start the game loop if not on mobile
if (!isMobile()) {
    gameLoop(); // Start the game loop
}