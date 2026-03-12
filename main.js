import { gameState } from "./engine/gameState.js";
import { createCard } from "./engine/cardFactory.js";
import { render } from "./ui/render.js";
import { cardDB } from "../data/cards.js";
import { dispatch, startTurn } from "./engine/engine.js";

/* デッキ作成 */
function setupDeck(player){

  const p = gameState.players[player];

  for(let i=0;i<10;i++){

    const cardId = Math.random() < 0.5 ? 1 : 2;

    const instanceId = createCard(cardId, player);

    p.deck.push(instanceId);

  }

}

/* ドロー */
function draw(player){

  const p = gameState.players[player];

  if(p.deck.length === 0){
    return;
  }

  const card = p.deck.pop();

  p.hand.push(card);

}

function setupLife(player){

  const p = gameState.players[player];

  for(let i=0;i<7;i++){

    const cardId = Math.random() < 0.5 ? 1 : 2;
    const instanceId = createCard(cardId, player);

    p.life.push(instanceId);

  }

}

/* 初期化 */
function init(){

  const player = gameState.players[0];
  const opponent = gameState.players[1];

  // 安全に初期化
  gameState.cards = {};
  player.trash = [];
  player.remove = [];
  opponent.trash = [];
  opponent.remove = [];

  /* デッキ作成 */
  setupDeck(0);
  setupDeck(1);

  /* ライフ設定 */
  setupLife(0);
  setupLife(1);

  /* 初期手札 */
  draw(0);
  draw(0);
  draw(0);
  draw(0);
  draw(0);


  draw(1);
  draw(1);
  draw(1);

    /* デバッグ用 */
  // プレイヤー0のトラッシュにランダムで3枚追加
  for (let i = 0; i < 30; i++) {
    const randomCardId = Object.keys(cardDB)[Math.floor(Math.random() * Object.keys(cardDB).length)];
    // gameState.cardsにカードを作る
    const cardInstanceId = `trash-${i}`;
    gameState.cards[cardInstanceId] = { cardId: randomCardId };
    gameState.players[0].trash.push(cardInstanceId);
  }

    /* デバッグ用 */
  // プレイヤー0のリムーブにランダムで2枚追加
  for (let i = 0; i < 20; i++) {
    const randomCardId = Object.keys(cardDB)[Math.floor(Math.random() * Object.keys(cardDB).length)];
    const cardInstanceId = `remove-${i}`;
    gameState.cards[cardInstanceId] = { cardId: randomCardId };
    gameState.players[0].remove.push(cardInstanceId);
  }

  /* 最初のターン開始 */
  startTurn();

  render();

}

init();
