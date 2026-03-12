import { gameState } from "./gameState.js";
import { cardDB } from "../data/cards.js";
import { render } from "../ui/render.js";
import { moveCard } from "./zones.js";

export const PHASES = [
  "start",
  "move",
  "main",
  "attack",
  "end"
];

export function dispatch(action){

  let result = false;

  switch(action.type){
    case "attack":
      result = attack(action.card);
      break;

    case "play_front":
      result = playFront(action.card, action.slot);
      break;

    case "play_energy":
      result = playEnergy(action.card, action.slot);
      break;

    case "next_phase":
      nextPhase();
      result = true;
      break; 
     
    case "end_turn":
      endTurn();
      result = true;
      break;
  }

  render();
  
  return result;

}

function endTurn(){

  const playerIndex = gameState.currentPlayer;
  const player = gameState.players[playerIndex];

  // カード選択をキャンセル
  gameState.selectedCard = null;

  // すべてのカードアクティブに
  unrestAll(player);

  // プレイヤー交代
  gameState.currentPlayer = 1 - gameState.currentPlayer;

  // ターンカウント
  gameState.turn++;

  // 新しいターン開始
  startTurn();

  // UI 更新
  render();
}

export function startTurn(){
  const p = gameState.players[gameState.currentPlayer];
  p.playerTurn++;
  const ap = calculateAP(p);
  p.actionPoints = ap;
  gameState.phase = "start";
  processPhase();
}

function calculateAP(player){

  const t = player.playerTurn;

  if(player.isFirst){

    if(t===1) return 1;
    if(t===2) return 2;
    return 3;

  }else{

    if(t===1) return 2;
    if(t===2) return 2;
    return 3;

  }
}

export function getEnergy(player){

  let total=0;

  for(const c of player.energyLine){

    if(c===null) continue;

    const card = gameState.cards[c];
    const def = cardDB[card.cardId];

    total += def.energy;

  }

  return total;
}

export function canPlay(player, cardId){

  if(gameState.phase !== "main"){
    return false;
  }

  const card = gameState.cards[cardId];
  const def = cardDB[card.cardId];

  if(player.actionPoints < def.apCost){
    return false;
  }

  const energy = getEnergy(player);

  if(energy < def.energyCost){
    return false;
  }
  return true;
}

/* 攻撃可能判定 */
export function canAttack(player, cardId){
  if(gameState.phase !== "attack") return false;
  const card = gameState.cards[cardId];
  if(card.rested) return false;
  if(card.controller !== gameState.currentPlayer) return false;
  return true;
}

function playFront(cardId,slot){

  const p = gameState.players[gameState.currentPlayer];

  if(!canPlay(p,cardId)) return false;

  if(p.frontLine[slot]!==null) return false;

  const card = gameState.cards[cardId];
  const def = cardDB[card.cardId];

  const index = p.hand.indexOf(cardId);

  p.hand.splice(index,1);

  p.frontLine[slot]=cardId;

  p.actionPoints -= def.apCost;

  return true;
}

function playEnergy(cardId,slot){

  const p = gameState.players[gameState.currentPlayer];

  if(!canPlay(p,cardId)) return false;

  if(p.energyLine[slot]!==null) return false;

  const card = gameState.cards[cardId];
  const def = cardDB[card.cardId];

  const index = p.hand.indexOf(cardId);

  p.hand.splice(index,1);

  p.energyLine[slot]=cardId;

  p.actionPoints -= def.apCost;

  return true;
}

/* フェイズ進行 */
export function nextPhase(){
  const index = PHASES.indexOf(gameState.phase);
  console.log("PHASE:", gameState.phase);
  if(index < PHASES.length - 1){
    gameState.phase = PHASES[index + 1];
    processPhase();
  }else{
    endTurn();
    return;
  }
}

/* フェイズ処理 */
function processPhase(){

  const playerIndex = gameState.currentPlayer;
  const player = gameState.players[playerIndex];

  switch(gameState.phase){

    case "start":
      processStartPhase(playerIndex, player);
      break;

    case "move":
      break;

    case "main":
      break;

    case "attack":
      break;

    case "end":
      processEndPhase(playerIndex, player);
      break;
  }
}

function processStartPhase(playerIndex, player){
   /* デバッグ用 */
  if(player.life.length > 0){
    const cardId = player.life[player.life.length - 1];
    moveCard(playerIndex, cardId, "life", "hand");
  }
}

function processEndPhase(playerIndex, player){

  // 今は処理なし
  // 将来的にここに
  // ・ターン終了効果
  // ・状態リセット
  // などを書く

}

export function getNextPhase(){

  const index = PHASES.indexOf(gameState.phase);

  if(index < PHASES.length - 1){
    return PHASES[index + 1];
  }

  return "turn";

}

/* レスト処理 */
function restCard(cardId){
  const card = gameState.cards[cardId];
  if(card){
    card.rested = true;
  }
}

/* アンレスト処理 */
function unrestAll(player){
  const zones = ["frontLine","energyLine"];
  for(const zone of zones){
    const line = player[zone];
    if(!Array.isArray(line)) continue;
    for(const cardId of line){
      if(cardId === null) continue;
      const card = gameState.cards[cardId];
      if(card.skipUnrest > 0){
        card.skipUnrest--;
        continue;
      }
      card.rested = false;
    }
  }
}

function attack(cardId){

  if(gameState.phase !== "attack") return false;

  const playerIndex = gameState.currentPlayer;
  const opponentIndex = 1 - playerIndex;

  const player = gameState.players[playerIndex];
  const opponent = gameState.players[opponentIndex];

  const card = gameState.cards[cardId];

  // レストしていたら攻撃不可
  if(card.rested) return false;

  // 攻撃 → レスト
  card.rested = true;

  // ライフチェック
  if(opponent.life.length > 0){
    const lifeCard = opponent.life[opponent.life.length - 1];
    moveCard(opponentIndex, lifeCard, "life", "trash");
  }
  return true;
}
