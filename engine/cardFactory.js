import { gameState } from "./gameState.js";

let nextId = 1;

export function createCard(cardId, owner){

  const id = nextId++;

  gameState.cards[id] = {

    id: id,
    cardId: cardId,
    owner: owner,
    controller: owner,
    zone: "deck",
    slot: null,
    state: "active",
    rested:false,
    /* ターン中の移動制限 */
    movedThisTurn: false,

    skipUnrest:0
  };

  return id;

}