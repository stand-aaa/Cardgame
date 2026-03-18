import { gameState } from "./gameState.js";
import { cardDB } from "../data/cards.js";
import { draw } from "../main.js"

/* 最大APの処理 */
export function calculateAP(player){

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

/* レスト処理 */
export function restCard(cardId){

  const card = gameState.cards[cardId];

  if(card){
    card.rested = true;
  }
}

/* アンレスト処理 */
export function unrestAll(player){

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

/* EXドロー処理 */
export function exDraw(){

  const player = gameState.players[gameState.currentPlayer];

  // 条件チェック
  if(gameState.phase !== "start") return false;
  if(gameState.exDrawUsed) return false;
  if(player.actionPoints < 1) return false;

  // AP消費
  player.actionPoints -= 1;

  // ドロー
  draw(gameState.currentPlayer, 1);

  // 使用済みフラグ
  gameState.exDrawUsed = true;

  console.log("EXドロー実行");

  return true;
}

/* カード定義を取得 */
export function getCardBase(cardId){
  const card = gameState.cards[cardId];
  if(!card) return null;
  return cardDB[card.cardId];
}