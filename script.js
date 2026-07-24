// ========================
// Audio
// ========================

const mergeSound = new Audio("sounds/merge.mp3");
const winSound = new Audio("sounds/win.mp3");
const gameOverSound = new Audio("sounds/gameover.mp3");
const clickSound = new Audio("sounds/click.mp3");

// board init
let mergedTiles = [];
let tiles = [];

let newTileMap = [];
let mergedTileMap = [];

const SIZE = 4;

const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");

let darkMode = localStorage.getItem("darkMode") === "true";
let highScore = localStorage.getItem("highScore") || 0;
let board = [];
let score = 0;
let hasWonBefore = localStorage.getItem("hasWonBefore") === "true";
let newTilePosition = null;
let gameEnded = false;
let continuesUsed = 0;
const MAX_CONTINUES = 1;
let gamePaused = false;

let soundEnabled = true;
let removeTileMode = false;
let adContinueUsed = false;

let mergedThisMove = false;
// Initialize board
function initializeBoard() {

    board = [];

    for (let row = 0; row < SIZE; row++) {

        board[row] = [];

        for (let col = 0; col < SIZE; col++) {
            board[row][col] = 0;
        }
    }
}

function createBoard() {

    boardElement.innerHTML = "";

    tiles = [];

    for (let row = 0; row < SIZE; row++) {

        tiles[row] = [];

        for (let col = 0; col < SIZE; col++) {

            const tile = document.createElement("div");

            tile.className = "tile";

            boardElement.appendChild(tile);

            tiles[row][col] = tile;

        }

    }

}


function drawBoard() {

    scoreElement.textContent =
        "Score: " + score +
        " | High Score: " + highScore;

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            const tile = tiles[row][col];

            const value = board[row][col];

            // Reset tile
            tile.className = "tile";
            tile.textContent = "";

            if (value !== 0) {

                tile.textContent = value;

                if (value <= 32768) {
                    tile.classList.add("tile-" + value);
                }
                else {
                    tile.classList.add("tile-32768");
                }

                if (
                    newTileMap[row] &&
                    newTileMap[row][col]
                ) {
                    tile.classList.add("tile-new");
                }

                if (
                    mergedTileMap[row] &&
                    mergedTileMap[row][col]
                ) {
                    tile.classList.add("tile-merged");
                }

            }

        }

    }

    newTileMap = [];
    mergedTileMap = [];
}



// Spawn random tile
function spawnRandomTile() {

    let emptyCells = [];


    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            if (board[row][col] === 0) {

                emptyCells.push({
                    row: row,
                    col: col
                });

            }
        }
    }


    if (emptyCells.length === 0) {
        return;
    }


    let randomIndex = Math.floor(
        Math.random() * emptyCells.length
    );


    let chosen = emptyCells[randomIndex];


    let value = Math.random() < 0.9 ? 2 : 4;


    board[chosen.row][chosen.col] = value;


    newTileMap = [];

    newTileMap[chosen.row] = [];
    newTileMap[chosen.row][chosen.col] = true;
}



// Move Left
function moveLeft() {

    let moved = false;


    for (let row = 0; row < SIZE; row++) {


        let oldRow = [...board[row]];


        let newRow = board[row].filter(v => v !== 0);


        for (let i = 0; i < newRow.length - 1; i++) {

            if (newRow[i] === newRow[i + 1]) {

                newRow[i] *= 2;
                mergedThisMove = true;
                score += newRow[i];

                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem("highScore", highScore);
                }

                if (!mergedTileMap[row]) {
                    mergedTileMap[row] = [];
                }

                mergedTileMap[row][i] = true;

                newRow[i + 1] = 0;
            }
        }


        newRow = newRow.filter(v => v !== 0);


        while (newRow.length < SIZE) {
            newRow.push(0);
        }


        if (oldRow.toString() !== newRow.toString()) {
            moved = true;
        }


        board[row] = newRow;
    }


    return moved;
}



// Move Right
function moveRight() {

    for (let row = 0; row < SIZE; row++) {
        board[row].reverse();
    }


    let moved = moveLeft();


    for (let row = 0; row < SIZE; row++) {
        board[row].reverse();
    }


    return moved;
}



function moveUp() {

    let moved = false;

    for (let col = 0; col < SIZE; col++) {

        let oldCol = [];

        for (let row = 0; row < SIZE; row++) {
            oldCol.push(board[row][col]);
        }


        let newCol = [];

        for (let row = 0; row < SIZE; row++) {
            if (board[row][col] !== 0) {
                newCol.push(board[row][col]);
            }
        }


        for (let i = 0; i < newCol.length - 1; i++) {

            if (newCol[i] === newCol[i + 1]) {

                newCol[i] *= 2;

                mergedThisMove = true;

                score += newCol[i];

                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem("highScore", highScore);
                }

                if (!mergedTileMap[i]) {
                    mergedTileMap[i] = [];
                }

                mergedTileMap[i][col] = true;

                newCol[i + 1] = 0;
            }
        }


        newCol = newCol.filter(v => v !== 0);


        while (newCol.length < SIZE) {
            newCol.push(0);
        }


        if (oldCol.toString() !== newCol.toString()) {
            moved = true;
        }


        for (let row = 0; row < SIZE; row++) {
            board[row][col] = newCol[row];
        }
    }


    return moved;
}


function moveDown() {

    let moved = false;

    for (let col = 0; col < SIZE; col++) {

        let oldCol = [];

        for (let row = 0; row < SIZE; row++) {
            oldCol.push(board[row][col]);
        }


        let newCol = [];

        for (let row = SIZE - 1; row >= 0; row--) {

            if (board[row][col] !== 0) {
                newCol.push(board[row][col]);
            }
        }


        for (let i = 0; i < newCol.length - 1; i++) {

            if (newCol[i] === newCol[i + 1]) {

                newCol[i] *= 2;

                mergedThisMove = true;

                score += newCol[i];

                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem("highScore", highScore);
                }

                const finalRow = SIZE - 1 - i;

                if (!mergedTileMap[finalRow]) {
                    mergedTileMap[finalRow] = [];
                }

                mergedTileMap[finalRow][col] = true;

                newCol[i + 1] = 0;
            }
        }


        newCol = newCol.filter(v => v !== 0);


        while (newCol.length < SIZE) {
            newCol.push(0);
        }


        newCol.reverse();


        if (oldCol.toString() !== newCol.toString()) {
            moved = true;
        }


        for (let row = 0; row < SIZE; row++) {
            board[row][col] = newCol[row];
        }
    }


    return moved;
}

function startRemoveTileMode() {

    removeTileMode = true;

    document.getElementById("message-text").textContent =
        "Tap ONE tile to remove";

    document.getElementById("ad-continue").style.display = "none";
    document.getElementById("message-restart").style.display = "none";

}

function removeTile(event) {

    if (!removeTileMode) {
        return;
    }

    const row = Number(event.target.dataset.row);
    const col = Number(event.target.dataset.col);

    if (board[row][col] === 0) {
        return;
    }

    board[row][col] = 0;

    removeTileMode = false;
    gameEnded = false;
    adContinueUsed = true;

    const box = document.getElementById("game-message");

    box.style.display = "none";

    document.getElementById("ad-continue").style.display = "";
    document.getElementById("message-restart").style.display = "";

    drawBoard();
}

// Rotate board clockwise
function rotateBoard() {

    let newBoard = [];

    for (let row = 0; row < SIZE; row++) {

        newBoard[row] = [];

        for (let col = 0; col < SIZE; col++) {

            newBoard[row][col] =
                board[SIZE - col - 1][row];

        }
    }

    board = newBoard;
}



// Check win
function checkWin() {

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            if (board[row][col] === 2048) {
                return true;
            }

        }
    }

    return false;
}



// Check game over
function checkGameOver() {


    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            if (board[row][col] === 0) {
                return false;
            }
        }
    }


    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE - 1; col++) {

            if (board[row][col] === board[row][col + 1]) {
                return false;
            }
        }
    }


    for (let col = 0; col < SIZE; col++) {

        for (let row = 0; row < SIZE - 1; row++) {

            if (board[row][col] === board[row + 1][col]) {
                return false;
            }
        }
    }

    playSound(gameOverSound);
    return true;
}

// Keyboard controls
document.addEventListener("keydown", function (event) {

    event.preventDefault();

    if (gameEnded || gamePaused) {
        return;
    }

    let moved = false;
    mergedThisMove = false;

    newTilePosition = null;
    mergedTiles = [];


    if (event.key === "ArrowLeft") {
        moved = moveLeft();
    }


    if (event.key === "ArrowRight") {
        moved = moveRight();
    }


    if (event.key === "ArrowUp") {
        moved = moveUp();
    }


    if (event.key === "ArrowDown") {
        moved = moveDown();
    }



    if (moved) {

        if (mergedThisMove) {
            playSound(mergeSound);
        }
        spawnRandomTile();


        if (checkWin() && !hasWonBefore) {

            hasWonBefore = true;

            localStorage.setItem("hasWonBefore", "true");

            showMessage("You reached 2048 🎉", true);

        }


        if (checkGameOver()) {
            showMessage("Game Over!", false);
            gameEnded = true;
        }
    }


    drawBoard();

});

function restartGame() {

    removeTileMode = false;
    adContinueUsed = false;

    score = 0;

    continuesUsed = 0;

    gameEnded = false;

    initializeBoard();

    newTilePosition = null;
    mergedTiles = [];

    const box = document.getElementById("game-message");

    if (box) {
        box.style.display = "none";
    }

    spawnRandomTile();
    spawnRandomTile();

    drawBoard();
}

let touchStartX = 0;
let touchStartY = 0;



boardElement.addEventListener("touchstart", function (event) {

    event.preventDefault();

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;

});


boardElement.addEventListener("touchend", function (event) {

    event.preventDefault();

    if (gameEnded || gamePaused) {
        return;
    }

    let touchEndX = event.changedTouches[0].clientX;
    let touchEndY = event.changedTouches[0].clientY;


    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;


    let moved = false;
    mergedThisMove = false;

    newTilePosition = null;
    mergedTiles = [];


    // Horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {

        if (diffX > 50) {
            moved = moveRight();
        }

        else if (diffX < -50) {
            moved = moveLeft();
        }

    }


    // Vertical swipe
    else {

        if (diffY > 50) {
            moved = moveDown();
        }

        else if (diffY < -50) {
            moved = moveUp();
        }

    }


    if (moved) {
        spawnRandomTile();
        if (mergedThisMove) {
            playSound(mergeSound);
        }

        if (checkWin() && !hasWonBefore) {

            hasWonBefore = true;

            localStorage.setItem("hasWonBefore", "true");

            showMessage("You reached 2048 🎉", true);

        }


        if (checkGameOver()) {
            showMessage("Game Over!", false);
            gameEnded = true;
        }

    }


    drawBoard();

});

function showMessage(text) {

    const box = document.getElementById("game-message");
    const message = document.getElementById("message-text");

    const continueButton = document.getElementById("continue-button");
    const adButton = document.getElementById("ad-continue");
    const restartButton = document.getElementById("message-restart");

    message.textContent = text;

    if (text === "Game Over!") {

        continueButton.style.display = "none";
        adButton.style.display = "inline-block";
        restartButton.style.display = "inline-block";

    } else {

        continueButton.style.display = "inline-block";
        adButton.style.display = "none";
        restartButton.style.display = "inline-block";

    }

    box.style.display = "block";
}

function watchRewardAd() {

    if (continuesUsed >= MAX_CONTINUES) {
        alert("No continues remaining.");
        return;
    }

    const button = document.getElementById("ad-continue");

    button.disabled = true;
    button.textContent = "Watching Ad...";

    showRewardedAd();

}

const continueButton = document.getElementById("continue-button");

if (continueButton) {

    continueButton.addEventListener("click", function () {

        document.getElementById("game-message").style.display = "none";

    });

}

const restartButton = document.getElementById("restart");

if (restartButton) {
    restartButton.addEventListener("click", restartGame);
}


const messageRestartButton = document.getElementById("message-restart");

if (messageRestartButton) {
    messageRestartButton.addEventListener("click", function () {

        document.getElementById("game-message").style.display = "none";

        restartGame();

    });
}

const adButton = document.getElementById("ad-continue");

if (adButton) {
    adButton.addEventListener("click", watchRewardAd);
}



const soundButton = document.getElementById("sound-button");

if (soundButton) {

    soundButton.addEventListener("click", function () {

        soundEnabled = !soundEnabled;

        soundButton.textContent =
            soundEnabled ? "Sound: ON" : "Sound: OFF";

    });

}

// ========================
// Pause Menu
// ========================

const menuButton = document.getElementById("menu-button");

if (menuButton) {

    menuButton.addEventListener("click", function () {

        gamePaused = true;

        document.getElementById("menu-overlay").style.display = "block";
        document.getElementById("pause-menu").style.display = "block";

    });

}

const resumeButton = document.getElementById("resume-button");

if (resumeButton) {

    resumeButton.addEventListener("click", function () {

        gamePaused = false;

        document.getElementById("menu-overlay").style.display = "none";
        document.getElementById("pause-menu").style.display = "none";

    });

}

document
    .getElementById("ad-continue")
    .addEventListener("click", function () {

        playSound(clickSound);

        showRewardedAd();

    });

const pauseRestart = document.getElementById("pause-restart");

if (pauseRestart) {

    pauseRestart.addEventListener("click", function () {

        document.getElementById("menu-overlay").style.display = "none";
        document.getElementById("pause-menu").style.display = "none";

        gamePaused = false;

        restartGame();

    });

}

function playSound(sound) {

    if (!soundEnabled) {
        return;
    }

    sound.currentTime = 0;
    sound.play();

}

function applyTheme() {

    if (darkMode) {
        document.body.classList.add("dark");
    }
    else {
        document.body.classList.remove("dark");
    }

    const themeButton = document.getElementById("theme-button");

    if (themeButton) {
        themeButton.textContent =
            darkMode ? "Dark Mode: ON" : "Dark Mode: OFF";
    }

}

const themeButton = document.getElementById("theme-button");

if (themeButton) {

    themeButton.addEventListener("click", function () {

        playSound(clickSound);

        darkMode = !darkMode;

        localStorage.setItem("darkMode", darkMode);

        applyTheme();

    });

}

function showRewardedAd() {

    const rewardedVideoAd = TTMinis.game.createRewardedVideoAd({
        adUnitId: "YOUR_PLACEMENT_ID"
    });

    rewardedVideoAd.onError(function (err) {
        console.log("Rewarded ad error:", err);
        alert("Ad unavailable. Please try again later.");
    });

    rewardedVideoAd.onClose(function (res) {

        if (res && res.isEnded) {

            // User watched the full ad
            startRemoveTileMode();

        } else {

            // User skipped the ad
            alert("Watch the full ad to continue.");

        }

    });

    rewardedVideoAd.show().catch(function (err) {
        console.log(err);
        alert("Unable to show ad.");
    });

}


// Start game



initializeBoard();
newTileMap = [];
mergedTileMap = [];

applyTheme();

createBoard();

spawnRandomTile();
spawnRandomTile();

drawBoard();