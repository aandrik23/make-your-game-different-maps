import { Player, Enemy, Tile, PowerUp } from "./classes.js";
import { resetFrameTimers, ResetPort, resetTimer } from "./gameLoop.js";
import { resetStats, getLives } from "./gameState.js";
import { Continue, Restart, gamePaused, gameRunning } from "./menu.js";



import { tileMap, getFreshTileMap2D, changeMap, resetLevelProgress, goToNextLevel } from "./mapData.js";
import { runCountdown } from "./countdown.js";



const game = document.getElementById("game");
export let ROWS = tileMap.length;
export let COLS = tileMap[0].length;
game.style.setProperty("--cols", COLS);
game.style.setProperty("--rows", ROWS);

export let entities = [];


export let player = null;
export let bricks = [];

export let tileMap2D = getFreshTileMap2D();

export function buildMap() {
    // Recompute dimensions for the current level
    ROWS = tileMap.length;
    COLS = tileMap[0].length;
    game.style.setProperty("--cols", COLS);
    game.style.setProperty("--rows", ROWS);

    // Reset the live tileMap2D
    tileMap2D = getFreshTileMap2D();

    entities.length = 0;
    bricks.length = 0;
    player = null;
    document.getElementById("game").innerHTML = "";

    // Build map
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const char = tileMap[y][x];

            // Tiles
            if (char === "X") new Tile(x, y, "wall");
            else if (char === "B") {
                const brickTile = new Tile(x, y, "brick");

                if (Math.random() < randomEnemy) {
                    // choose random enemy type
                    const enemyTypes = ["blue", "orange", "pink", "red"];
                    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                    brickTile.hiddenItem = { type: "enemy", color: type };
                }
                bricks.push(brickTile); // store reference in an array
            } else if (char === "R") {
                const brickTile = new Tile(x, y, "red_brick");
                bricks.push(brickTile); // store reference in an array
            }
            else new Tile(x, y, "floor");

            // Entities
            switch (char) {

                case "P":
                    player = new Player(x, y, tileMap2D); // <--- assign to player
                    entities.push(player);
                    break;
                case "b": entities.push(new Enemy(x, y, "blue", tileMap2D, COLS, ROWS)); break;
                case "o": entities.push(new Enemy(x, y, "orange", tileMap2D, COLS, ROWS)); break;
                case "p": entities.push(new Enemy(x, y, "pink", tileMap2D, COLS, ROWS)); break;
                case "r": entities.push(new Enemy(x, y, "red", tileMap2D, COLS, ROWS)); break;
                case "C": case "A": case "M": case "F":
                    const powerUp = new PowerUp(
                        x, y,
                        char === "C" ? "cherry" : char === "A" ? "apple" : char === "M" ? "banana" : "flake"
                    );
                    entities.push(powerUp);
                    break;
            }
        }
    }

    // After building map & bricks:

    const KeyBrick = bricks[Math.floor(Math.random() * bricks.length)];
    KeyBrick.hiddenItem = "key";  // could also do "port" if you want
}


// Add this function
export function resetGame() {
    // Reset all game state variables
    resetTimer();
    resetFrameTimers();
    ResetPort();
    resetStats();

    if (allmaps) {
        // 🔹 story mode: start from LEVEL0
        resetLevelProgress();
    } else {
        // 🔹 single-map mode: use currently selected map
        changeMap(map);
    }

    entities.length = 0;
    bricks.length = 0;
    player = null;
    document.getElementById("game").innerHTML = "";
}

export function loadNextLevel() {
    const advanced = goToNextLevel();
    if (!advanced) {
        return; // no more levels defined
    }
    

    
    Continue(); // unpause the game
    // Rebuild everything for the new map
    getLives(); // extra life for completing level
    buildMap();
}


export function updateTileMap2D(x, y, newChar) {
    tileMap2D[y][x] = newChar;
}


let pendingChanges = false;

const applyButton = document.getElementById("applyChangesBtn");
const confirmModal = document.getElementById("confirmModal");
const confirmApply = document.getElementById("confirmApply");
const cancelApply = document.getElementById("cancelApply");



// Define your variable (will change based on click)
export let difficulty = "easy";
let randomEnemy = 0.1; // default value

// Get all buttons
const buttons = document.querySelectorAll(".difficultyBtn");

// Loop through and add event listeners
buttons.forEach(button => {
    button.addEventListener("click", () => {
        difficulty = button.dataset.level; // "easy", "medium", or "hard"
        console.log("Difficulty set to:", difficulty);

        // remove highlight from all buttons
        document.querySelectorAll(".difficultyBtn")
            .forEach(btn => btn.classList.remove("selected"));

        // highlight selected button
        button.classList.add("selected");

        if (!player) {
            applyDifficulty();
        }
        // Mark that there are unsaved changes
        pendingChanges = true;
        applyButton.style.display = "flex";

    });
});

function applyDifficulty() {
    // Assign values
    if (difficulty === "easy") {
        randomEnemy = 0.1;
    } else if (difficulty === "medium") {
        randomEnemy = 0.2;
    } else if (difficulty === "hard") {
        randomEnemy = 0.3;
    }
}



export let map = "allmaps";
export let mapDisplayName = "Story Mode";
export let allmaps = true;                // by default: full story mode (all maps)


const mapButtons = document.querySelectorAll(".mapBtn");

mapButtons.forEach(button => {
    button.addEventListener("click", () => {
        map = button.dataset.map;                 // "map0", "map1", ...
        mapDisplayName = button.textContent.trim();
        console.log("Selected map id:", map);

        //  update HUD immediately
        document.getElementById("Map").textContent = `Map: ${mapDisplayName}`;

        // decide mode:
        // map0 -> play full story (all maps)
        // anything else -> single map only
        allmaps = (map === "allmaps");

        document.querySelectorAll(".mapBtn")
            .forEach(btn => btn.classList.remove("selected"));

        button.classList.add("selected");

        if (!player) {
            applyMap(); // no restart if game hasn't started
        }

        pendingChanges = true;
        applyButton.style.display = "flex";
    });
});


function applyMap() {
    if (map === "allmaps") {
        // Story mode: reset to level 0
        resetLevelProgress();
    } else {
        // Single-level mode: jump to that specific level
        changeMap(map);
    }
}


applyButton.addEventListener("click", () => {
    if (!pendingChanges) return;

    // If no player exists yet → FIRST TIME IN MENU
    if (!player) {
        // Just accept the settings, no modal and no restart
        pendingChanges = false;
        applyButton.style.display = "none";
        settingsMenu.style.display = "none";
        return;
    }

    // If player exists → show modal (changing settings forces restart)
    confirmModal.style.display = "flex";
});

confirmApply.addEventListener("click", () => {
    confirmModal.style.display = "none";


    if (player) {
        applyDifficulty();
        applyMap();
        Restart();
    }

    pendingChanges = false;
    applyButton.style.display = "none";
    settingsMenu.style.display = "none";
});

cancelApply.addEventListener("click", () => {
    confirmModal.style.display = "none";
});
