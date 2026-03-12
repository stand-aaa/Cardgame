import { gameState } from "./gameState.js";

export function moveCard(player, cardId, fromZone, toZone, slot = null){

  const p = gameState.players[player];

  const arrayZones = [
    "hand",
    "deck",
    "trash",
    "remove",
    "life"
  ];

  const slotZones = [
    "frontLine",
    "energyLine"
  ];

  /* ---------- from ---------- */

  if(arrayZones.includes(fromZone)){

    const index = p[fromZone].indexOf(cardId);
    if(index !== -1){
      p[fromZone].splice(index,1);
    }

  }

  if(slotZones.includes(fromZone)){

    for(let i=0;i<p[fromZone].length;i++){
      if(p[fromZone][i] === cardId){
        p[fromZone][i] = null;
      }
    }

  }

  /* ---------- to ---------- */

  if(arrayZones.includes(toZone)){
    p[toZone].push(cardId);
  }

  if(slotZones.includes(toZone)){

    if(slot === null){
      console.error("slot required");
      return false;
    }

    if(p[toZone][slot] !== null){
      console.error("slot already used");
      return false;
    }

    p[toZone][slot] = cardId;

  }

  /* カード状態更新 */

  const card = gameState.cards[cardId];
  card.zone = toZone;
  card.controller = player;
  card.slot = slot;

  /* デバッグ用 */
  console.log(
   `MOVE P${player} ${cardId}: ${fromZone} -> ${toZone}`
  );

  return true;

}