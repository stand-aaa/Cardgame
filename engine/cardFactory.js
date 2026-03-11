import { gameState } from "./gameState.js";

let nextId = 1;

export function createCard(cardId, owner){

  const id = nextId++;

  gameState.cards[id] = {
    id:id,
    cardId:cardId,
    owner:owner,
    state:"active"
  };

  return id;

}