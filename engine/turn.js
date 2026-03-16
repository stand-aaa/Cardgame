import { gameState } from "./gameState.js";
import { render } from "../ui/render.js";
import { calculateAP, unrestAll } from "./stateHelpers.js";
import { processPhase } from "./phases.js";
import { draw } from "../main.js"

/* ターン終了時の処理 */
export function endTurn(){

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
  const playerIndex = gameState.currentPlayer;
  const p = gameState.players[playerIndex];
  p.playerTurn++;

  const ap = calculateAP(p);
  p.actionPoints = ap;

  // ドロー処理（先行プレイヤーの1ターン目はドローなし）
  if( !(p.isFirst && p.playerTurn === 1) ){
    draw(playerIndex); // main.js の draw() を使用
    console.log(`Player ${playerIndex} draws a card`);
  } else {
    console.log(`Player ${playerIndex} skips draw on first turn (先行1ターン目)`);
  }

  gameState.phase = "start";

  processPhase();
}