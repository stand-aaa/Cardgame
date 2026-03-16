import { gameState } from "./gameState.js";
import { cardDB } from "../data/cards.js";
import { moveCard } from "./zones.js";
import { canPlay } from "./stateHelpers.js";

/* フロントラインにカードをプレイ */
export function playFront(cardId,slot){
  const playerIndex = gameState.currentPlayer;
  const p = gameState.players[playerIndex];
  if(!canPlay(p,cardId)) return false;
  if(p.frontLine[slot] !== null) return false;

  const card = gameState.cards[cardId];
  const def = cardDB[card.cardId];

  /* hand → frontLine */
  moveCard(playerIndex, cardId, "hand", "frontLine", slot);

  /* 基本はレストで登場 */
  card.rested = true;

  /* 効果でアクティブ登場 */
  if(def.enterActive){
    card.rested = false;
  }
  p.actionPoints -= def.apCost;

  // デバッグ用: controller を必ずセット
  card.controller = playerIndex;

  return true;
}

/* エナジーラインにカードをプレイ */
export function playEnergy(cardId,slot){
  const playerIndex = gameState.currentPlayer;
  const p = gameState.players[playerIndex];
  if(!canPlay(p,cardId)) return false;
  if(p.energyLine[slot] !== null) return false;

  const card = gameState.cards[cardId];
  const def = cardDB[card.cardId];

  /* hand → energyLine */
  moveCard(playerIndex, cardId, "hand", "energyLine", slot);

  /* 基本レスト */
  card.rested = true;

  /* 効果でアクティブ登場 */
  if(def.enterActive){
    card.rested = false;
  }

  p.actionPoints -= def.apCost;

  // デバッグ用: controller を必ずセット
  card.controller = playerIndex;

  return true;
}