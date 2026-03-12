import { gameState } from "../engine/gameState.js";
import { cardDB } from "../data/cards.js";
import { dispatch, getEnergy, canPlay, getNextPhase, canAttack } from "../engine/engine.js";

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
      div.appendChild(cardView);
    }

    /* 手札プレイ可能 */
    if(clickable && gameState.selectedCard !== null){
      if(cardId === null && canPlay(player, gameState.selectedCard)){
        div.classList.add("slot-playable");
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
      canBlock(cardId)
    ){
      div.classList.add("slot-blockable");
    }

    /* クリック処理 */
    if(clickable){

    div.onclick = ()=>{
      /* ---------- ブロック ---------- */
      if(gameState.battle.attacker !== null){
        if(!canBlock(cardId)) return;
        const success = dispatch({
          type:"block",
          card:cardId
        });
        if(success){
          dispatch({type:"resolve_battle"});
        }
        render();
        return;
      }

      /* ---------- 攻撃 ---------- */
      if(gameState.phase === "attack"){
        if(!canAttack(cardId)) return;

        dispatch({
          type:"attack",
          card:cardId
        });

        render();
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

function renderAttackMenu(){
  const menu = document.getElementById("attackMenu");
  if(gameState.attackMenuCard === null){
    menu.style.display = "none";
    return;
  }
  const cardEl = document.getElementById("card-" + gameState.attackMenuCard);

  if(!cardEl){
    menu.style.display = "none";
    return;
  }

  const rect = cardEl.getBoundingClientRect();
  menu.innerHTML = "";
  const attackBtn = document.createElement("button");
  attackBtn.innerText = "Attack";

  attackBtn.onclick = ()=>{
    dispatch({
      type:"attack",
      card:gameState.attackCandidate
    });
    gameState.attackCandidate = null;
    gameState.attackMenuCard = null;
    render();
  };

  const cancelBtn = document.createElement("button");
  cancelBtn.innerText = "Cancel";

  cancelBtn.onclick = ()=>{
    gameState.attackCandidate = null;
    gameState.attackMenuCard = null;
    render();
  };
  menu.appendChild(attackBtn);
  menu.appendChild(cancelBtn);

  /* カード横に表示 */
  menu.style.position = "fixed";
  menu.style.left = rect.right + 8 + "px";
  menu.style.top = rect.top + "px";

  menu.style.display = "block";
}

/* メイン描画 */
export function render(){

  document.getElementById("phase").innerText = gameState.phase;
  document.getElementById("turn").innerText = gameState.turn;

  const player = gameState.players[gameState.currentPlayer];
  const opponent = gameState.players[1 - gameState.currentPlayer];

  document.getElementById("ap").innerText = player.actionPoints;
  document.getElementById("energyTotal").innerText = getEnergy(player);

  if(gameState.phase === "attack"){
    renderSlots("front", player.frontLine, true, "attack");
  }else{
    renderSlots("front", player.frontLine, true, "play_front");
  }
  renderSlots("energy", player.energyLine, true, "play_energy");

  renderSlots("opponent-front", opponent.frontLine);
  renderSlots("opponent-energy", opponent.energyLine);

  renderHand(player);

  renderLife(player, "life");
  renderLife(opponent, "opponent-life");

  renderZone("player-trash","Trash",player.trash);
  renderZone("player-remove","Removed",player.remove);

  renderZone("opponent-trash","Trash",opponent.trash);
  renderZone("opponent-remove","Removed",opponent.remove);

  updateSelected();

  renderAttackMenu();

  const next = getNextPhase();

  const btn = document.getElementById("phaseButton");

  if(next === "turn"){
    btn.innerText = "End Turn ▶";
  }else{
    btn.innerText = next.toUpperCase() + " Phase ▶";
  }

  btn.onclick = ()=>{
    dispatch({type:"next_phase"});
  };

}
