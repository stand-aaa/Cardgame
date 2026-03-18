import { render } from "../ui/render.js";

import { gameState } from "./gameState.js";
import { draw } from "../main.js";
import { moveCard } from "./zones.js";
import { canPayCost, payCost } from "./cost.js";
import { getCardBase } from "./stateHelpers.js";

export const effects = {

  // BP+1000
  buff_ally_1000: (state, ctx) => {

    if(ctx.step === 0){
      ctx.mode = "select_target";
      return;
    }

    if(ctx.step === 1){
      const target = ctx.data.target;

      const card = state.cards[target];

      if(!card.buffs) card.buffs = [];

      card.buffs.push({
        type: "bp",
        value: 1000
      });

      ctx.mode = null;
    }
  },

  // 1ドロー1ディスカード
  draw_then_discard: (state, ctx) => {

    if(ctx.step === 0){
      draw(state.currentPlayer, 1);
      ctx.step = 1;
      ctx.mode = "select_hand_discard";
      return;
    }

    if(ctx.step === 1){
      const target = ctx.data.selectedCard;

      moveCard(
        state.currentPlayer,
        target,
        "hand",
        "trash"
      );

      ctx.mode = null;
    }
  }

};


export function runEffectStart(cardId, effectIndex){

  const card = gameState.cards[cardId];
  const effect = card.effects[effectIndex];

  if(!canPayCost(effect.cost)) return false;

  gameState.effect = {
    mode: null,
    source: cardId,
    effectId: effect.id,
    step: 0,
    data: {
      cost: effect.cost
    }
  };

  // コスト支払い開始
  const done = payCost(effect.cost, gameState.effect);

  if(done){
    runEffect();
  }

  return true;
}

/* 効果の発動条件確認 */
export function checkEffectCondition(cardId, effect){

  const card = gameState.cards[cardId];

  if(!effect.condition) return true;

  /* レスト状態で使えない */
  if(effect.condition.notRested){
    if(card.rested) return false;
  }

  /* AP条件 */
  if(effect.condition.ap){
    const player = gameState.players[gameState.currentPlayer];
    if(player.ap < effect.condition.ap) return false;
  }

  return true;
}

/* 効果発動判定 */
export function canUseAnyEffect(cardId){

  const baseCard = getCardBase(cardId);
  if(!baseCard || !baseCard.effects) return false;

  return baseCard.effects.some(effect => {

    if(effect.type !== "activate_main") return false;

    return checkEffectCondition(cardId, effect);
  });
}