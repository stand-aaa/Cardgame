import { render } from "../ui/render.js";

import { declareAttack, declareBlock, resolveBattle, takeDamage } from "./battle.js";
import { playFront, playEnergy } from "./play.js";
import { nextPhase } from "./phases.js";
import { endTurn } from "./turn.js";
import { moveToFront, moveToEnergy } from "./move.js";
import { exDraw } from "./stateHelpers.js";

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
  console.log(`action : ${action.type}`);
  

  switch(action.type){
    case "move_front":
      result = moveToFront(action.card, action.slot);
      break;

    case "move_energy":
      result = moveToEnergy(action.card, action.slot);
      break;

    case "attack":
      result = declareAttack(action.card);
      break;

    case "block":
      result = declareBlock(action.card);
      break;

    case "resolve_battle":
      result = resolveBattle();
      break;

    case "take_damage":
      result = takeDamage();
      result = true;
      break;

    case "ex_draw":
      result = exDraw();
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