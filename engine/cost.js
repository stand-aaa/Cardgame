import { gameState } from "./gameState.js";
import { moveCard } from "./zones.js";

export function canPayCost(costs){

  const player = gameState.players[gameState.currentPlayer];

  for(const cost of costs){

    if(cost.type === "ap"){
      if(player.actionPoints < cost.value) return false;
    }

    if(cost.type === "discard"){
      if(player.hand.length < cost.value) return false;
    }
  }

  return true;
}

export function payCost(costs, ctx){

  const player = gameState.players[gameState.currentPlayer];

  for(const cost of costs){

    // AP
    if(cost.type === "ap"){
      player.actionPoints -= cost.value;
    }

    // 手札破棄（選択必要）
    if(cost.type === "discard"){
      ctx.mode = "select_hand_cost";
      ctx.data.costDiscard = cost.value;
      return false; // ← 途中停止
    }
  }

  return true;
}