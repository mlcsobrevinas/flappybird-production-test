const game = document.getElementById('game');
const bird = document.getElementById('bird');
const obstacles = document.getElementById('obstacles');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const valentineModal = document.getElementById('valentine-modal');
const yesButton = document.getElementById('yes-button');
const noButton = document.getElementById('no-button');
const valentineConfirmation = document.getElementById('valentine-confirmation');
const backgroundMusic = new Audio('bg.mp3');
const jumpSound = new Audio('flap.mp3');
const dieSound = new Audio('die.mp3');
const pointSound = new Audio('point.mp3');
const collisionSound = new Audio('collision.mp3');

let birdTop = 250;
let birdVelocity = 0;
let gravity = 0.5;
let gameHeight = 600;
let gameWidth = 400;
let obstacleWidth = 60;
let obstacleGap = 150;
let obstacleSpeed = 2;
let score = 0;
let gameRunning = false;
let animationFrameId;

// Set background music to loop
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

function startGame() {
    gameRunning = true;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    valentineModal.classList.add('hidden');
    valentineConfirmation.classList.add('hidden');
    score = 0;
    scoreDisplay.textContent = 'Score: 0';
    birdTop = 250;
    birdVelocity = 0;
    obstacles.innerHTML = '';

    // Play background music
    backgroundMusic.play();

    gameLoop();
}

function endGame() {
    gameRunning = false;
    gameOverScreen.classList.remove('hidden');
    cancelAnimationFrame(animationFrameId);

    // Stop background music
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;

    // Play death sound
    dieSound.play();
}

function checkWin() {
    if (score >= 3) {
        gameRunning = false;
        valentineModal.classList.remove('hidden');
        cancelAnimationFrame(animationFrameId); // Stop the game loop
        backgroundMusic.pause();
        let winSound = new Audio('blue.mp3'); // Make sure this file exists in your project
        winSound.play();
    }
}

function updateBird() {
    birdVelocity += gravity;
    birdTop += birdVelocity;
    bird.style.top = birdTop + 'px';

    // Check if bird hits the ground or ceiling
    if (birdTop > gameHeight - 40 || birdTop < 0) {
        endGame();
    }
}

function createObstacle() {
    if (!gameRunning) return;

    let obstacleHeight = Math.random() * (gameHeight - obstacleGap - 100) + 50;

    let topPipe = document.createElement('div');
    topPipe.classList.add('obstacle', 'pipe-top');
    topPipe.style.backgroundSize = 'cover';
    topPipe.style.left = gameWidth + 'px';
    topPipe.style.top = '0px';
    topPipe.style.height = obstacleHeight + 'px';
    obstacles.appendChild(topPipe);

    let bottomPipe = document.createElement('div');
    bottomPipe.classList.add('obstacle', 'pipe-bottom');
    bottomPipe.style.backgroundSize = 'cover';
    bottomPipe.style.left = gameWidth + 'px';
    bottomPipe.style.top = (obstacleHeight + obstacleGap) + 'px';
    bottomPipe.style.height = (gameHeight - obstacleHeight - obstacleGap) + 'px';
    obstacles.appendChild(bottomPipe);

    moveObstacle(topPipe, bottomPipe);
}

function moveObstacle(obstacle, bottomObstacle) {
    let obstacleLeft = gameWidth;

    function frame() {
        if (!gameRunning) return;

        obstacleLeft -= obstacleSpeed;
        obstacle.style.left = obstacleLeft + 'px';
        bottomObstacle.style.left = obstacleLeft + 'px';

        if (obstacleLeft < -obstacleWidth) {
            obstacles.removeChild(obstacle);
            obstacles.removeChild(bottomObstacle);
            score++;
            pointSound.play();
            scoreDisplay.textContent = 'Score: ' + score;
            checkWin(); // Check if the player has won
        } else {
            animationFrameId = requestAnimationFrame(frame); // Restart the animation frame
        }

        if (checkCollision(obstacle, bottomObstacle)) {
            endGame();
        }
    }

    animationFrameId = requestAnimationFrame(frame); // Initial call to start animation
}

function checkCollision(obstacle, bottomObstacle) {
    let birdRect = bird.getBoundingClientRect();
    let obstacleRect = obstacle.getBoundingClientRect();
    let bottomObstacleRect = bottomObstacle.getBoundingClientRect();

    const isColliding = (
        birdRect.left < obstacleRect.right &&
        birdRect.right > obstacleRect.left &&
        (birdRect.top < obstacleRect.bottom || birdRect.bottom > bottomObstacleRect.top)
    );

    if (isColliding) {
        collisionSound.play();
    }
    return isColliding;
}

function gameLoop() {
    if (!gameRunning) return;

    updateBird();
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Valentine Modal Logic
yesButton.addEventListener('click', () => {
    valentineModal.classList.add('hidden');
    valentineConfirmation.classList.remove('hidden');
    gameRunning = false;
});

noButton.addEventListener('click', () => {
    // Move the "No" button to a random position
    const modalRect = valentineModal.getBoundingClientRect();
    const buttonRect = noButton.getBoundingClientRect();
    const maxX = modalRect.width - buttonRect.width;
    const maxY = modalRect.height - buttonRect.height;

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    noButton.style.position = 'absolute';
    noButton.style.left = `${randomX}px`;
    noButton.style.top = `${randomY}px`;
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameRunning && !valentineModal.classList.contains('hidden')) {
            // Prevent starting the game if the Valentine modal is open
            return;
        }
        if (!gameRunning) {
            startGame();
        } else {
            birdVelocity = -8; // Make the bird jump
            jumpSound.play(); // Play jump sound
        }
    }
});

document.addEventListener('touchstart', () => {
    if (!gameRunning && !valentineModal.classList.contains('hidden')) {
        // Prevent starting the game if the Valentine modal is open
        return;
    }
    if (!gameRunning) {
        startGame();
    } else {
        birdVelocity = -8; // Make the bird jump
        jumpSound.play(); // Play jump sound
    }
});

// Gradually decrease the interval as the score increases
setInterval(createObstacle, 2000 - Math.min(score * 100, 1800)); 
