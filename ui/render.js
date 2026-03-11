import { gameState } from "../engine/gameState.js";
import { cardDB } from "../data/cards.js";
import { dispatch } from "../engine/engine.js";
import { getEnergy } from "../engine/engine.js";
import { canPlay } from "../engine/engine.js";

function createCardView(cardId){

  const card = gameState.cards[cardId];
  const def = cardDB[card.cardId];

  const div = document.createElement("div");

  div.className = "card";

  div.innerHTML =
    "<b>" + def.name + "</b><br>" +
    "AP:" + def.apCost + "<br>" +
    "必要EN:" + def.energyCost + "<br>" +
    "EN:" + def.energy + "<br>" +
    "PW:" + def.power;

  return div;

}

// メイン描画関数
export function render(){
  const player = gameState.players[gameState.currentPlayer];
  const opponent = gameState.players[1 - gameState.currentPlayer];

  // 自分の情報
  document.getElementById("ap").innerText = player.actionPoints;
  document.getElementById("energyTotal").innerText = getEnergy(player);

  renderFront(player);
  renderEnergy(player);
  renderHand(player);
  renderLife(player);

  renderPlayerRemove(player);
  renderPlayerTrash(player);

  // 相手フィールド表示
  renderOpponentFront(opponent);
  renderOpponentEnergy(opponent);
  renderOpponentLife(opponent);

  renderOpponentRemove(opponent);
  renderOpponentTrash(opponent);

  // 選択中カード表示
  const sel = document.getElementById("selected");
  if(gameState.selectedCard === null){
    sel.innerText = "none";
  } else {
    const card = gameState.cards[gameState.selectedCard];
    const def = cardDB[card.cardId];
    sel.innerText = def.name;
  }
}

// 自分のフロントライン
function renderFront(player){
  const front = document.getElementById("front");
  front.innerHTML="";

  for(let i=0;i<4;i++){
    const div = document.createElement("div");
    div.className="slot";

    const cardId = player.frontLine[i];
    if(cardId !== null){
      div.appendChild(createCardView(cardId));
    }

    // 選択中カードを置ける場所は緑表示
    if(gameState.selectedCard !== null){
      if(cardId === null && canPlay(player, gameState.selectedCard)){
        div.classList.add("slot-playable");
      }
    }

    div.onclick = ()=>{
      if(gameState.selectedCard === null) return;

      const success = dispatch({
        type:"play_front",
        card:gameState.selectedCard,
        slot:i
      });

      if(success){
        gameState.selectedCard=null;
      }

      render();
    };

    front.appendChild(div);
  }
}

// 自分のエナジーライン
function renderEnergy(player){
  const energy = document.getElementById("energy");
  energy.innerHTML="";

  for(let i=0;i<4;i++){
    const div = document.createElement("div");
    div.className="slot";

    const cardId = player.energyLine[i];
    if(cardId !== null){
      div.appendChild(createCardView(cardId));
    }

    // 選択中カードを置ける場所は緑表示
    if(gameState.selectedCard !== null){
      if(cardId === null && canPlay(player, gameState.selectedCard)){
        div.classList.add("slot-playable");
      }
    }

    div.onclick = ()=>{
      if(gameState.selectedCard === null) return;

      const success = dispatch({
        type:"play_energy",
        card:gameState.selectedCard,
        slot:i
      });

      if(success){
        gameState.selectedCard=null;
      }

      render();
    };

    energy.appendChild(div);
  }
}

// 自分の手札
function renderHand(player){
  const hand = document.getElementById("hand");
  hand.innerHTML = "";

  for(const cardId of player.hand){
    const dispcard = createCardView(cardId);
    const def = cardDB[gameState.cards[cardId].cardId];

    // 選択中カード
    if(cardId === gameState.selectedCard){
      dispcard.classList.add("card-selected");
    }

    // AP不足カードは暗く
    if(player.actionPoints < def.apCost){
      dispcard.classList.add("card-disabled");
    }

    dispcard.onclick = ()=>{
      if(player.actionPoints < def.apCost){
        alert("APが足りません");
        return;
      }

      // 同じカードを再クリックでキャンセル
      if(gameState.selectedCard === cardId){
        gameState.selectedCard=null;
      } else {
        gameState.selectedCard=cardId;
      }

      render();
    };

    hand.appendChild(dispcard);
  }
}

// 自分のライフ
function renderLife(player){
  const lifeDiv = document.getElementById("life");
  lifeDiv.innerHTML = "";
  for(let i=0; i<player.life; i++){
    const div = document.createElement("div");
    div.className = "life-card";
    lifeDiv.appendChild(div);
  }
}

// 相手のフロントライン（表示のみ）
function renderOpponentFront(opponent){
  const front = document.getElementById("opponent-front");
  front.innerHTML = "";

  for(let i=0;i<4;i++){
    const div = document.createElement("div");
    div.className = "slot";

    const cardId = opponent.frontLine[i];
    if(cardId !== null){
      div.appendChild(createCardView(cardId));
    }

    front.appendChild(div);
  }
}

function renderPlayerTrash(player){
  const container = document.getElementById("player-trash");
  container.innerHTML = "";
  for(const cardId of player.trash){
    const cardDiv = createCardView(cardId);
    cardDiv.onclick = ()=> showCardInfo(cardId);
    container.appendChild(cardDiv);
  }
}

function renderPlayerRemove(player){
  const container = document.getElementById("player-remove");
  container.innerHTML = "";
  for(const cardId of player.remove){
    const cardDiv = createCardView(cardId);
    cardDiv.onclick = ()=> showCardInfo(cardId);
    container.appendChild(cardDiv);
  }
}

// 相手のエナジーライン（表示のみ）
function renderOpponentEnergy(opponent){
  const energy = document.getElementById("opponent-energy");
  energy.innerHTML = "";

  for(let i=0;i<4;i++){
    const div = document.createElement("div");
    div.className = "slot";

    const cardId = opponent.energyLine[i];
    if(cardId !== null){
      div.appendChild(createCardView(cardId));
    }

    energy.appendChild(div);
  }
}

// 相手のライフ
function renderOpponentLife(opponent){
  const lifeDiv = document.getElementById("opponent-life");
  lifeDiv.innerHTML = "";
  for(let i=0; i<opponent.life; i++){
    const div = document.createElement("div");
    div.className = "life-card";
    lifeDiv.appendChild(div);
  }
}

function renderOpponentTrash(opponent){
  const container = document.getElementById("opponent-trash");
  container.innerHTML = "";
  for(const cardId of opponent.trash){
    const cardDiv = createCardView(cardId);
    cardDiv.onclick = ()=> showCardInfo(cardId);
    container.appendChild(cardDiv);
  }
}

function renderOpponentRemove(opponent){
  const container = document.getElementById("opponent-remove");
  container.innerHTML = "";
  for(const cardId of opponent.remove){
    const cardDiv = createCardView(cardId);
    cardDiv.onclick = ()=> showCardInfo(cardId);
    container.appendChild(cardDiv);
  }
}

// カード情報をアラート表示
function showCardInfo(cardId){
  const def = cardDB[gameState.cards[cardId].cardId];
  alert(`Card: ${def.name}\nAP: ${def.apCost}\nEN: ${def.energyCost}\nPW: ${def.power}`);
}