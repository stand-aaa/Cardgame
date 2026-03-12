export const gameState = {

  turn: 1,
  phase: "main",
  currentPlayer: 0,

  // 選択中カードを追加
  selectedCard: null,

  attackCandidate: null,
  attackMenuCard: null,

  battle:{
    attacker:null,
    blocker:null
  },

  cards: {},

  players: [
    {
      life: [],

      actionPoints: 0,
      playerTurn: 0,
      isFirst: true,

      deck: [],
      hand: [],

      frontLine: [null,null,null,null],
      energyLine: [null,null,null,null],

      trash: [],
      remove: []

    },

    {
      life: [],

      actionPoints: 0,
      playerTurn: 0,
      isFirst: false,

      deck: [],
      hand: [],

      frontLine: [null,null,null,null],
      energyLine: [null,null,null,null],

      trash: [],
      remove: []

    }
  ]

};