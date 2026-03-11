import { gameState } from "./gameState.js";
import { cardDB } from "../data/cards.js";
import { render } from "../ui/render.js";

export function dispatch(action){

  let result = false;

  switch(action.type){
    case "play_front":
      result = playFront(action.card, action.slot);
      break;

    case "play_energy":
      result = playEnergy(action.card, action.slot);
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
  // カード選択をキャンセル
  gameState.selectedCard = null;

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

function createCardView(cardId){

  const card = gameState.cards[cardId];
  const def = cardDB[card.cardId];

  const div = document.createElement("div");

  div.className = "card";

  div.innerHTML =
      "<b>"+def.name+"</b><br>" +
      "AP:"+def.apCost+"<br>" +
      "EN:"+def.energyCost+"<br>" +
      "E:"+def.energy+"<br>" +
      "PW:"+def.power;

  return div;

}