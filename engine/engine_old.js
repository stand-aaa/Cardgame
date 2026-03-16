import { gameState } from "./gameState.js";
import { cardDB } from "../data/cards.js";
import { render } from "../ui/render.js";
import { moveCard } from "./zones.js";

/* フェイズの宣言 */
export const PHASES = [
  "start",
  "move",
  "main",
  "attack",
  "end"
];

/* 各処理を振り分けるための関数 */
export function dispatch(action){

  let result = false;

  switch(action.type){
    case "attack":
      result = declareAttack(action.card);
      break;

    case "block":
      result = declareBlock(action.card);
      break;

    case "resolve_battle":
      result = resolveBattle();
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

/* ターン終了時の処理 */
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

/* ターン開始時の処理 */
export function startTurn(){
  const p = gameState.players[gameState.currentPlayer];
  p.playerTurn++;
  const ap = calculateAP(p);
  p.actionPoints = ap;
  gameState.phase = "start";
  processPhase();
}

/* 最大APの処理 */
function calculateAP(player){

  /* プレイヤーの先行/後攻を取得 */
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

/* エナジーラインのカードから発生エナジーを計算 */
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

/* カードがプレイ可能かを確認 */
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
export function canAttack(cardId){
  if(cardId === null) return false;
  if(gameState.phase !== "attack") return false;
  const card = gameState.cards[cardId];
  if(!card) return false;
  const player = gameState.players[gameState.currentPlayer];
  if(card.controller !== gameState.currentPlayer) return false;
  if(card.rested) return false;
  if(!player.frontLine.includes(cardId)) return false;
  return true;
}

/* フロントラインにカードをプレイ */
function playFront(cardId,slot){
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

  return true;
}


/* エナジーラインにカードをプレイ */
function playEnergy(cardId,slot){
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

/* 攻撃宣言時の処理 */
function declareAttack(cardId){
  const playerIndex = gameState.currentPlayer;
  const player = gameState.players[playerIndex];

  if(!canAttack(cardId)) return false;

  gameState.battle.attacker = cardId;
  gameState.battle.blocker = null;

  const card = gameState.cards[cardId];

  // 攻撃 → レスト
  card.rested = true;

  return true;
}

export function canBlock(cardId){

  const opponentIndex = 1 - gameState.currentPlayer;
  const opponent = gameState.players[opponentIndex];

  if(gameState.battle.attacker === null) return false;

  const card = gameState.cards[cardId];

  if(!card) return false;
  if(card.controller !== opponentIndex) return false;
  if(card.rested) return false;

  if(!opponent.frontLine.includes(cardId)) return false;

  return true;
}

/* ブロック宣言 */
function declareBlock(cardId){
  const opponentIndex = 1 - gameState.currentPlayer;
  if(!canBlock(cardId)) return false;
  gameState.battle.blocker = cardId;
  return true;
}

function resolveBattle(){
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