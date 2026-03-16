import { gameState } from "./gameState.js";
import { cardDB } from "../data/cards.js";
import { moveCard } from "./zones.js";

/* 攻撃可能判定 */
export function canAttack(cardId){
  if(cardId === null) return false;
  if(gameState.phase !== "attack") return false;

  const player = gameState.players[gameState.currentPlayer];
  const card = gameState.cards[cardId];

  if(!card) return false;
  if(card.controller !== gameState.currentPlayer) return false;
  if(card.rested) return false;
  if(!player.frontLine.includes(cardId)) return false;

  // 戦闘中は自分以外のカードは攻撃不可
  if(gameState.battle.attacker !== null && gameState.battle.attacker !== cardId) return false;

  return true;
}

/* 攻撃宣言時の処理 */
export function declareAttack(cardId){
  const playerIndex = gameState.currentPlayer;
  const player = gameState.players[playerIndex];
  const card = gameState.cards[cardId];

  if(!canAttack(cardId)) return false;

  // 戦闘中のカードは attackMenu 更新のみ
  if(gameState.battle.attacker !== null){
    if(gameState.battle.attacker === cardId){
      gameState.attackMenuCard = cardId;
      return true;
    } else {
      return false;
    }
  }

  // 攻撃開始
  gameState.battle.attacker = cardId;
  gameState.battle.blocker = null;
  card.rested = true;
  gameState.attackMenuCard = cardId;

  return true;
}

/* ブロック可能判定（デバッグ用対応） */
export function canBlock(cardId){
  const opponentIndex = 1 - gameState.currentPlayer;
  const opponent = gameState.players[opponentIndex];
  if(gameState.battle.attacker === null) return false;

  const card = gameState.cards[cardId];
  if(!card) return false;

  // デバッグ用: 攻撃側でもクリック可能
  const DEBUG_ALLOW_ATTACKER_BLOCK = true;

  if(!DEBUG_ALLOW_ATTACKER_BLOCK){
    if(card.controller !== opponentIndex) return false;
    if(card.rested) return false;
    if(!opponent.frontLine.includes(cardId)) return false;
  }

  return true;
}

/* ブロック宣言 */
export function declareBlock(cardId){
  const opponentIndex = 1 - gameState.currentPlayer;
  if(!canBlock(cardId)) return false;
  gameState.battle.blocker = cardId;
  return true;
}

/* ライフ減少処理 */
export function takeDamage(){
  const playerIndex = 1 - gameState.currentPlayer;
  const player = gameState.players[playerIndex];

  if(player.life.length > 0){
    const lifeCard = player.life[player.life.length - 1];
    moveCard(playerIndex, lifeCard, "life", "trash");
    console.log(`Player ${playerIndex} takes damage: ${lifeCard}`);
  }

  // 戦闘終了
  gameState.battle.attacker = null;
  gameState.battle.blocker = null;
  gameState.attackMenuCard = null;
}

export function resolveBattle(){
  const attackerId = gameState.battle.attacker;
  const blockerId = gameState.battle.blocker;
  const attacker = gameState.cards[attackerId];
  const opponentIndex = 1 - gameState.currentPlayer;
  const opponent = gameState.players[opponentIndex];

  if(blockerId === null){
    // ブロックなし → ライフダメージ
    if(opponent.life.length > 0){
      const lifeCard = opponent.life[opponent.life.length - 1];
      moveCard(opponentIndex, lifeCard, "life", "trash");
    }

  }else{
    const blocker = gameState.cards[blockerId];
    const attackerDef = cardDB[attacker.cardId];
    const blockerDef = cardDB[blocker.cardId];
    const atk = attackerDef.power;
    const def = blockerDef.power;
    if(atk >= def){
      // 防御側KO
      moveCard(opponentIndex, blockerId, "frontLine", "trash");
    }else{
      // 攻撃 < 防御 → 両方レスト
      blocker.rested = true;
    }
  }

  // 戦闘終了
  gameState.battle.attacker = null;
  gameState.battle.blocker = null;

  return true;
}