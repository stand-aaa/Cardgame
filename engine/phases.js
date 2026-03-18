import { gameState } from "./gameState.js";
import { moveCard } from "./zones.js";
import { PHASES } from "./engine.js";
import { endTurn } from "./turn.js";

/* フェイズ進行 */
export function nextPhase(){

  const index = PHASES.indexOf(gameState.phase);

  console.log("PHASE:", gameState.phase);

  if(index < PHASES.length - 1){

    gameState.phase = PHASES[index + 1];
    resetPhaseState();
    processPhase();

  }else{

    endTurn();

    return;

  }
}

/* フェイズ処理 */
export function processPhase(){

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

  // 今は処理なし
  // 将来的にここに
  // ・ターン開始効果
  // ・状態リセット
  // などを書く
}

function processEndPhase(playerIndex, player){

  // 今は処理なし
  // 将来的にここに
  // ・ターン終了効果
  // ・状態リセット
  // などを書く

}

/* フェイズ移行のリセット処理 */
function resetPhaseState(){
  //選択カードの初期化
  gameState.selectedCard = null;
  gameState.attackMenuCard = null;
  gameState.effectMenuCard = null;
  gameState.battle = {
    attacker: null,
    blocker: null
  };
}

/* 次のフェイズに移行 */
export function getNextPhase(){
  const index = PHASES.indexOf(gameState.phase);
  if(index < PHASES.length - 1){
    return PHASES[index + 1];
  }

  return "turn";
}