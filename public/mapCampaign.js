import { buildMap, map, setMap } from "./bomber.js";
import { changeMap, map1, map2, map3 } from "./mapData.js";
import { Restart, Continue } from "./menu.js";
import { handleGameOver } from "./scoreboard.js";
import { loadYouWin } from "./videos.js";

// Order of maps in the campaign
const mapRotation = ["map1", "map2", "map3"];

// Nice display names (optional, just for logs / future UI)
const mapNames = {
  map1: "The Colonnade",
  map2: "BOX",
  map3: "The Catacombs"
};

// Helper: apply a map by id using mapData + changeMap()
function applyMapById(id) {
  if (id === "map1") {
    changeMap(map1);
  } else if (id === "map2") {
    changeMap(map2);
  } else if (id === "map3") {
    changeMap(map3);
  } else {
    console.warn("Unknown map id:", id);
  }
}

// Called when player reaches port WITH key
export function advanceCampaign() {
  const index = mapRotation.indexOf(map);

  // Not last map → go to next
  if (index > -1 && index < mapRotation.length - 1) {
    const nextId = mapRotation[index + 1];
    console.log(`Level Completed! Loading next map: ${mapNames[nextId]}`);
    setMap(nextId);
    // Change the active tileMap
    applyMapById(nextId);
    buildMap();

    // Reset the game state and resume
    Restart();
    Continue();
    return;
  }

  // Last map completed → final win
  console.log("Final map completed!");
  playFinalWinSequence();
}

function playFinalWinSequence() {
  // Play your win video (you already use this elsewhere)
  loadYouWin();

  // If your video element has id="youWinVideo", use that:
  const video = document.getElementById("youWinVideo");

  if (!video) {
    console.warn("Missing #youWinVideo element! Falling back to endGame().");
    handleGameOver();
    return;
  }

  video.onended = () => {
    handleGameOver();
  };
}