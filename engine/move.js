import { moveCard } from "./zones.js";
import { cardDB } from "../data/cards.js";
import { gameState } from "../engine/gameState.js";

/* エナジーラインからフロントラインへの移動 */
export function moveToFront(cardId, slot){

  if(gameState.phase !== "move") return false;

  const playerIndex = gameState.currentPlayer;
  const player = gameState.players[playerIndex];

  const card = gameState.cards[cardId];

  /* このターン中に移動済み */
  if(card.movedThisTurn) return false;

  if(player.frontLine[slot] !== null) return false;
  if(!player.energyLine.includes(cardId)) return false;

  moveCard(playerIndex, cardId, "energyLine", "frontLine", slot);

  /* 移動済みフラグ */
  card.movedThisTurn = true;

  return true;
}

/* フロントラインからエナジーラインへの移動 */
export function moveToEnergy(cardId, slot){

  if(gameState.phase !== "move") return false;

  const playerIndex = gameState.currentPlayer;
  const player = gameState.players[playerIndex];

  const card = gameState.cards[cardId];

  /* このターン中に移動済み */
  if(card.movedThisTurn) return false;

  if(player.energyLine[slot] !== null) return false;

  const def = cardDB[card.cardId];

  /* Step能力チェック */
  if(!def.step) return false;

  /* frontLineにいるか */
  if(!player.frontLine.includes(cardId)) return false;

  moveCard(playerIndex, cardId, "frontLine", "energyLine", slot);

  /* 移動済みフラグ */
  card.movedThisTurn = true;

  return true;
}

/* 移動制限の解除 */
export function resetMoveFlags(player){
  const zones = ["frontLine","energyLine"];
  for(const zone of zones){
    const line = player[zone];
    for(const cardId of line){
      if(cardId === null) continue;
      const card = gameState.cards[cardId];
      card.movedThisTurn = false;
    }
  }
}

/* 移動可能判定 */
export function canMove(cardId, toZone){

  if(gameState.phase !== "move") return false;

  const playerIndex = gameState.currentPlayer;
  const player = gameState.players[playerIndex];

  const card = gameState.cards[cardId];
  if(!card) return false;

  // ターン中に移動済み
  if(card.movedThisTurn) return false;

  /* energy → front */
  if(toZone === "front"){
    return player.energyLine.includes(cardId);
  }

  /* front → energy（step） */
  if(toZone === "energy"){
    if(!player.frontLine.includes(cardId)) return false;

    const def = cardDB[card.cardId];
    return def.step === true;
  }

  return false;
}