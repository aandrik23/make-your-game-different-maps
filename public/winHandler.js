import { difficultyMultiplier } from "./gameState.js";
import { stopMusic, PlayLevelClearedSound } from "./audio.js";
import { advanceCampaign } from "./mapCampaign.js";

export function handleLevelCompletion() {

    // Give reward & difficulty scaling
    difficultyMultiplier();

    stopMusic();
    PlayLevelClearedSound();

    // Then trigger campaign progression
    advanceCampaign();
}