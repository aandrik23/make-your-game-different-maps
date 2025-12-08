import { LEVEL1, LEVEL2, LEVEL3 } from "./maps.js";
// objectives : Key , Port
// enemies : b,p,o
// player : P
// PowerUps : C, A, M, F
// Brick : B(orange),R (red)
// Wall : X

export const LEVEL_MAPS = [
    LEVEL1,
    LEVEL2,
    LEVEL3
];

let currentLevel = 0;

// mutable export so other modules always see the current map
export let tileMap = LEVEL_MAPS[currentLevel];

export function getFreshTileMap2D() {
    return tileMap.map(row => row.split(""));
}

export function goToNextLevel() {
    if (currentLevel >= LEVEL_MAPS.length - 1) {
        return false; // no more levels
    }
    currentLevel++;
    tileMap = LEVEL_MAPS[currentLevel];
    return true;
}

export function resetLevelProgress() {
    currentLevel = 0;
    tileMap = LEVEL_MAPS[0];
}

export function Map2() {

    // 1. Convert tileMap → mutable 2D array
    let map2D = tileMap.map(row => row.split(''));

    for (let y = 0; y < map2D.length; y++) {
        for (let x = 0; x < map2D[y].length; x++) {

            // Border walls -> 'X'
            if (
                x === 0 ||
                x === map2D[y].length - 1 ||
                y === 0 ||
                y === map2D.length - 1
            ) {
                map2D[y][x] = 'X';
                continue;
            }

            // Checker pattern logic
            if (y % 2 !== 0 && x % 2 === 0) {
                map2D[y][x] = 'B';
            } else if (y % 2 === 0 && x % 2 !== 0) {
                map2D[y][x] = 'X';
            } else {
                map2D[y][x] = ' ';
            }
        }
    }

    // 2. Convert back to array of strings
    for (let y = 0; y < map2D.length; y++) {
        tileMap[y] = map2D[y].join("");
    }
}

export function changeMap(mapId) {
    // mapId will be something like "map1", "map2", "map3"
    // Extract the number
    const match = String(mapId).match(/(\d+)/);
    if (!match) return; // invalid id, do nothing

    const index = parseInt(match[1], 10) - 1; // map1 -> 0, map2 -> 1, etc.

    if (index < 0 || index >= LEVEL_MAPS.length) {
        console.warn("changeMap: invalid level index for", mapId);
        return;
    }

    currentLevel = index;
    tileMap = LEVEL_MAPS[currentLevel];
}