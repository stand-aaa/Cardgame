import { gameState } from "../engine/gameState.js";
import { cardDB } from "../data/cards.js";
import { dispatch } from "../engine/engine.js";
import { getEnergy, canPlay, getCardBase } from "../engine/stateHelpers.js";
import { getNextPhase } from "../engine/phases.js";
import { canAttack, canBlock } from "../engine/battle.js";
import { canMove } from "../engine/move.js";
import { checkEffectCondition, canUseAnyEffect } from "../engine/effect.js";

/* カード描画 */
function createCardView(cardId){

  const card = gameState.cards[cardId];
  const def = cardDB[card.cardId];

  const div = document.createElement("div");
  div.className = "card";

  if(card.rested){
    div.classList.add("card-rested");
  }

  div.innerHTML =
    "<b>" + def.name + "</b><br>" +
    "AP:" + def.apCost + "<br>" +
    "必要EN:" + def.energyCost + "<br>" +
    "EN:" + def.energy + "<br>" +
    "PW:" + def.power;

  return div;

}

/* スロット描画 */
function renderSlots(containerId, slots, clickable=false, playType=null){

  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const player = gameState.players[gameState.currentPlayer];

  for(let i=0;i<slots.length;i++){

    const div = document.createElement("div");
    div.className = "slot";

    const cardId = slots[i];

    /* カード表示 */
    if(cardId !== null){
      const cardView = createCardView(cardId);
      cardView.id = "card-" + cardId;

      /* 効果発動可能 */
      if(
        gameState.phase === "main" &&
        canUseAnyEffect(cardId)
      ){
        cardView.classList.add("card-effectable");
      }

      div.appendChild(cardView);
    }

    /* 選択中カード */
    if(cardId !== null && cardId === gameState.selectedCard){
      div.classList.add("card-selected");
    }
    
    /* 手札プレイ可能 */
    if(clickable && gameState.selectedCard !== null){
      if(cardId === null && canPlay(player, gameState.selectedCard)){
        div.classList.add("slot-playable");
      }
    }

    /* 移動可能カード表示 */
    if(
      gameState.phase === "move" &&
      gameState.selectedCard === null &&
      cardId !== null
    ){
      if(
        canMove(cardId, "front") ||
        canMove(cardId, "energy")
      ){
        div.classList.add("slot-step");
      }
    }
    /* 移動先表示 */
    if(
      gameState.phase === "move" &&
      gameState.selectedCard !== null &&
      cardId === null
    ){
      if(containerId === "front"){
        if(canMove(gameState.selectedCard, "front")){
          div.classList.add("slot-movable");
        }
      }

      if(containerId === "energy"){
        if(canMove(gameState.selectedCard, "energy")){
          div.classList.add("slot-movable");
        }
      }
    }

    /* 攻撃可能表示（フロントラインのみ） */
    if(
      gameState.phase === "attack" &&
      cardId !== null &&
      canAttack(cardId)
    ){
      div.classList.add("slot-attackable");
    }

    /* ブロック可能表示 */
    if(
      gameState.battle.attacker !== null &&
      cardId !== null &&
      canBlock(cardId) &&
      containerId === "opponent-front"
    ){
      div.classList.add("slot-blockable");
    }

    /* クリック処理 */
    if(clickable){
      div.onclick = ()=>{
        console.log("CLICK", gameState.phase, cardId);
        /* ---------- 起動効果 ---------- */
        if(
          gameState.phase === "main" &&
          cardId !== null
        ){
          const baseCard = getCardBase(cardId);

          if(baseCard && baseCard.effects && baseCard.effects.length > 0){

            // 攻撃と同じ：メニュー表示
            gameState.effectMenuCard = cardId;

            renderEffectMenu();
            return;
          }
        }

        // コスト：手札破棄
        if(gameState.effect.mode === "select_hand_cost"){
          moveCard(
            gameState.currentPlayer,
            cardId,
            "hand",
            "trash"
          );

          gameState.effect.data.costDiscard--;

          if(gameState.effect.data.costDiscard <= 0){
            gameState.effect.mode = null;
            runEffect();
          }

          render();
          return;
        }

        // 効果：対象選択（フロント）
        if(gameState.effect.mode === "select_target"){

          const source = gameState.effect.source;

          if(
            player.frontLine.includes(cardId) &&
            cardId !== source
          ){
            gameState.effect.data.target = cardId;
            gameState.effect.step = 1;
            runEffect();
          }

          return;
        }
        /* ---------- 移動 ---------- */
        if(gameState.phase === "move"){

          /* カード選択 */
          if(cardId !== null){

            // 移動可能なカードのみ対象
            if(
              canMove(cardId, "front") ||
              canMove(cardId, "energy")
            ){

              // 同じカードをもう一度クリック → キャンセル
              if(gameState.selectedCard === cardId){
                gameState.selectedCard = null;
              }else{
                // 別のカード → 選択
                gameState.selectedCard = cardId;
              }

              render();
            }

            return;
          }

          /* 移動実行 */
          if(cardId === null && gameState.selectedCard !== null){

            const selected = gameState.selectedCard;

            if(containerId === "front" && canMove(selected, "front")){
              dispatch({
                type:"move_front",
                card:selected,
                slot:i
              });
            }

            if(containerId === "energy" && canMove(selected, "energy")){
              dispatch({
                type:"move_energy",
                card:selected,
                slot:i
              });
            }

            gameState.selectedCard = null;
            render();
            return;
          }
        }

        const battle = gameState.battle;
        /* ---------- ブロック ---------- */
        if(battle.attacker !== null){
          if(!canBlock(cardId)) return;

          const success = dispatch({
            type:"block",
            card:cardId
          });
          if(success){
            dispatch({type:"resolve_battle"});
          }
          return;
        }

        /* ---------- 攻撃 ---------- */
        if(gameState.phase === "attack"){
          if(!canAttack(cardId)) return;
          gameState.attackMenuCard = cardId;
          renderAttackMenu();
          return;
        }

        /* ---------- 通常プレイ ---------- */
        if(gameState.selectedCard === null) return;
        const success = dispatch({
          type: playType,
          card: gameState.selectedCard,
          slot: i
        });
        if(success){
          gameState.selectedCard = null;
        }
        render();
      };
    }
    container.appendChild(div);
  }
}

/* ゾーン表示 */
function renderZone(containerId, label, cardList){

  const container = document.getElementById(containerId);
  container.innerHTML="";

  const zone = document.createElement("div");
  zone.className="card";

  zone.innerHTML =
    "<b>"+label+"</b><br>"+
    "Cards: "+cardList.length;

  zone.onclick = ()=> showZonePopup(label, cardList);

  container.appendChild(zone);

}

/* ポップアップ表示 */
function showZonePopup(label, cardList){

  const overlay = document.getElementById("overlay");
  const popup = document.getElementById("popup");
  const content = document.getElementById("popup-content");

  content.innerHTML = "";

  const title = document.createElement("h3");
  title.innerText = label;
  content.appendChild(title);

  const list = document.createElement("div");
  list.style.display="flex";
  list.style.flexWrap="wrap";
  list.style.gap="6px";

  for(const cardId of cardList){

    const cardDiv = createCardView(cardId);

    cardDiv.onclick = ()=>{
      const def = cardDB[gameState.cards[cardId].cardId];
      alert(`Card: ${def.name}\nAP:${def.apCost}\nEN:${def.energyCost}\nPW:${def.power}`);
    };

    list.appendChild(cardDiv);

  }

  content.appendChild(list);

  const closeBtn = document.createElement("button");
  closeBtn.innerText="Close";
  closeBtn.onclick = closePopup;

  content.appendChild(closeBtn);

  overlay.style.display="block";

}

/* ポップアップ閉じる */
function closePopup(){

  const overlay = document.getElementById("overlay");
  overlay.style.display="none";

}

/* 手札 */
function renderHand(player){

  const hand = document.getElementById("hand");
  hand.innerHTML = "";

  for(const cardId of player.hand){

    const dispcard = createCardView(cardId);
    const def = cardDB[gameState.cards[cardId].cardId];

    if(cardId === gameState.selectedCard){
      dispcard.classList.add("card-selected");
    }

    if(!canPlay(player, cardId)){
      dispcard.classList.add("card-disabled");
    }

    dispcard.onclick = ()=>{

      if(gameState.selectedCard === cardId){
        gameState.selectedCard=null;
      }else{
        gameState.selectedCard=cardId;
      }

      render();

    };

    hand.appendChild(dispcard);

  }

}

/* ライフ */
function renderLife(player, containerId){
  const lifeDiv = document.getElementById(containerId);
  lifeDiv.innerHTML = "";

  for(const cardId of player.life){
    const div = document.createElement("div");
    div.className = "life-card";
    lifeDiv.appendChild(div);
  }
}

/* 選択カード表示 */
function updateSelected(){

  const sel = document.getElementById("selected");

  if(gameState.selectedCard === null){
    sel.innerText="none";
    return;
  }

  const card = gameState.cards[gameState.selectedCard];
  const def = cardDB[card.cardId];

  sel.innerText = def.name;

}

/* 攻撃メニュー */
function renderAttackMenu(){
  /* 既存メニュー削除 */
  document.querySelectorAll(".attack-menu").forEach(e=>e.remove());

  const cardId = gameState.attackMenuCard;
  if(cardId === null) return;
  const cardEl = document.getElementById("card-" + cardId);
  if(!cardEl) return;
  const menu = document.createElement("div");
  menu.className = "attack-menu";

  menu.onclick = (e)=>{
    e.stopPropagation();
  };

  /* 攻撃 */
  const attackBtn = document.createElement("button");
  attackBtn.textContent = "攻撃";

  attackBtn.onclick = (e)=>{
    e.stopPropagation();
    dispatch({
      type:"attack",
      card:cardId
    });

    gameState.attackMenuCard = null;
    render();
  };

  /* キャンセル */
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "キャンセル";

  cancelBtn.onclick = (e)=>{
    e.stopPropagation();
    gameState.attackMenuCard = null;
    render();
  };

  menu.appendChild(attackBtn);
  menu.appendChild(cancelBtn);

  cardEl.appendChild(menu);
}

/* 効果選択メニュー */
function renderEffectMenu(){

  document.querySelectorAll(".effect-menu").forEach(e=>e.remove());

  const cardId = gameState.effectMenuCard;
  if(cardId === null) return;

  const cardEl = document.getElementById("card-" + cardId);
  if(!cardEl) return;

  const baseCard = getCardBase(cardId);
  if(!baseCard || !baseCard.effects) return;

  const menu = document.createElement("div");
  menu.className = "effect-menu";

  const rect = cardEl.getBoundingClientRect();

  menu.style.position = "fixed";
  menu.style.left = rect.right + "px";
  menu.style.top = rect.top + "px";

  menu.onclick = (e)=> e.stopPropagation();

  baseCard.effects.forEach((effect, index) => {

    if(effect.type !== "activate_main") return;

    const btn = document.createElement("button");
    btn.textContent = effect.label || effect.id;

    /* 発動できるか */
    const canUse = checkEffectCondition(cardId, effect);

    if(!canUse){
      btn.disabled = true;
    }

    btn.onclick = (e)=>{
      e.stopPropagation();

      if(!canUse) return;

      dispatch({
        type:"activate_effect",
        card: cardId,
        effectIndex: index
      });

      gameState.effectMenuCard = null;
      render();
    };

    menu.appendChild(btn);
  });

  /* キャンセル */
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "キャンセル";

  cancelBtn.onclick = (e)=>{
    e.stopPropagation();
    gameState.effectMenuCard = null;
    render();
  };

  menu.appendChild(cancelBtn);

  document.body.appendChild(menu);
  console.log("menu children", menu.children.length);
}

/* メイン描画 */
export function render(){

  document.getElementById("phase").innerText = gameState.phase;
  document.getElementById("turn").innerText = gameState.turn;

  const player = gameState.players[gameState.currentPlayer];
  const opponent = gameState.players[1 - gameState.currentPlayer];

  document.getElementById("ap").innerText = player.actionPoints;
  document.getElementById("energyTotal").innerText = getEnergy(player);

  const DEBUG_ALLOW_CLICK_OPPONENT = true; // デバッグ用フラグ

  // 自分の frontLine
  if(gameState.phase === "attack"){
    renderSlots("front", player.frontLine, true, "attack");
    // デバッグ用: 攻撃側でも相手の frontLine をクリック可能にする
    renderSlots("opponent-front", opponent.frontLine, DEBUG_ALLOW_CLICK_OPPONENT);
  }else{
    renderSlots("front", player.frontLine, true, "play_front");
    // 通常フェーズはクリック不可
    renderSlots("opponent-front", opponent.frontLine, false);
  }

  // エナジーライン
  renderSlots("energy", player.energyLine, true, "play_energy");
  renderSlots("opponent-energy", opponent.energyLine);

  // 手札
  renderHand(player);

  // ライフ
  renderLife(player, "life");
  renderLife(opponent, "opponent-life");

  // トラッシュ / リムーブ
  renderZone("player-trash","Trash",player.trash);
  renderZone("player-remove","Removed",player.remove);
  renderZone("opponent-trash","Trash",opponent.trash);
  renderZone("opponent-remove","Removed",opponent.remove);

  updateSelected();

  renderAttackMenu();
  renderEffectMenu();

  const next = getNextPhase();
  const btn = document.getElementById("phaseButton");
  btn.innerText = next === "turn" ? "End Turn ▶" : next.toUpperCase() + " Phase ▶";
  btn.onclick = ()=> dispatch({type:"next_phase"});

  /* ライフで受けるボタンを表示 */
  const takeBtn = document.getElementById("takeDamageBtn");

  if(gameState.phase === "attack" && gameState.battle.attacker !== null){
    takeBtn.style.display = "inline-block";

    takeBtn.onclick = ()=>{
      const opponentIndex = 1 - gameState.currentPlayer;
      dispatch({ type: "take_damage", player: opponentIndex });
    };
  }else{
    takeBtn.style.display = "none";
  }

  /* EXドローボタン制御 */

  // EXドローボタン削除
  const oldBtn = document.getElementById("exDrawBtn");
  if(oldBtn) oldBtn.remove();

  // startフェイズであれば生成
  if(gameState.phase === "start"){

    const player = gameState.players[gameState.currentPlayer];
    const takeBtn = document.getElementById("takeDamageBtn");

    if(!gameState.exDrawUsed && player.actionPoints > 0){

      const btn = document.createElement("button");
      btn.id = "exDrawBtn";
      btn.textContent = "EXドロー";
      btn.style.marginLeft = "10px";

      btn.onclick = () => {
        dispatch({ type:"ex_draw" });
        render();
      };

      takeBtn.insertAdjacentElement("afterend", btn);
    }
  }
}