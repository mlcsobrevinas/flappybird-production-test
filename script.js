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
let lastObstacleTime = 0;
let obstacleInterval = 2000; // Dynamic interval that decreases as score increases

// Background music settings
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

    backgroundMusic.play();
    
    lastObstacleTime = performance.now();
    gameLoop();
}

function endGame() {
    gameRunning = false;
    gameOverScreen.classList.remove('hidden');
    cancelAnimationFrame(animationFrameId);
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    dieSound.play();
}

function checkWin() {
    if (score >= 3) {
        gameRunning = false;
        valentineModal.classList.remove('hidden');
        cancelAnimationFrame(animationFrameId);
        backgroundMusic.pause();
        let winSound = new Audio('blue.mp3');
        winSound.play();
    }
}

function updateBird() {
    birdVelocity += gravity;
    birdTop += birdVelocity;
    bird.style.top = `${birdTop}px`;

    if (birdTop > gameHeight - 40 || birdTop < 0) {
        endGame();
    }
}

function createObstacle() {
    if (!gameRunning) return;
    
    let obstacleHeight = Math.random() * (gameHeight - obstacleGap - 100) + 50;

    let topPipe = document.createElement('div');
    topPipe.classList.add('obstacle', 'pipe-top');
    topPipe.style.left = `${gameWidth}px`;
    topPipe.style.top = '0px';
    topPipe.style.height = `${obstacleHeight}px`;
    obstacles.appendChild(topPipe);

    let bottomPipe = document.createElement('div');
    bottomPipe.classList.add('obstacle', 'pipe-bottom');
    bottomPipe.style.left = `${gameWidth}px`;
    bottomPipe.style.top = `${obstacleHeight + obstacleGap}px`;
    bottomPipe.style.height = `${gameHeight - obstacleHeight - obstacleGap}px`;
    obstacles.appendChild(bottomPipe);

    moveObstacle(topPipe, bottomPipe);
}

function moveObstacle(obstacle, bottomObstacle) {
    let obstacleLeft = gameWidth;

    function frame() {
        if (!gameRunning) return;

        obstacleLeft -= obstacleSpeed;
        obstacle.style.left = `${obstacleLeft}px`;
        bottomObstacle.style.left = `${obstacleLeft}px`;

        if (obstacleLeft < -obstacleWidth) {
            obstacles.removeChild(obstacle);
            obstacles.removeChild(bottomObstacle);
            score++;
            pointSound.play();
            scoreDisplay.textContent = `Score: ${score}`;
            checkWin();
        } else {
            requestAnimationFrame(frame);
        }

        if (checkCollision(obstacle, bottomObstacle)) {
            endGame();
        }
    }

    requestAnimationFrame(frame);
}

function checkCollision(obstacle, bottomObstacle) {
    let birdRect = bird.getBoundingClientRect();
    let obstacleRect = obstacle.getBoundingClientRect();
    let bottomObstacleRect = bottomObstacle.getBoundingClientRect();

    return (
        birdRect.left < obstacleRect.right &&
        birdRect.right > obstacleRect.left &&
        (birdRect.top < obstacleRect.bottom || birdRect.bottom > bottomObstacleRect.top)
    );
}

function gameLoop(timestamp) {
    if (!gameRunning) return;

    updateBird();

    // Generate obstacles at a controlled interval
    if (timestamp - lastObstacleTime > obstacleInterval) {
        createObstacle();
        lastObstacleTime = timestamp;
        obstacleInterval = Math.max(1000, 2000 - score * 100); // Speed up over time
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

// Valentine Modal Logic
yesButton.addEventListener('click', () => {
    valentineModal.classList.add('hidden');
    valentineConfirmation.classList.remove('hidden');
    gameRunning = false;
});

noButton.addEventListener('click', () => {
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
        if (!gameRunning && !valentineModal.classList.contains('hidden')) return;
        if (!gameRunning) {
            startGame();
        } else {
            birdVelocity = -8;
            jumpSound.play();
        }
    }
});

document.addEventListener('touchstart', () => {
    if (!gameRunning && !valentineModal.classList.contains('hidden')) return;
    if (!gameRunning) {
        startGame();
    } else {
        birdVelocity = -8;
        jumpSound.play();
    }
});
