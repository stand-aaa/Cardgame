export const gameState = {

  turn: 1,
  phase: "main",
  currentPlayer: 0,

  // EXドローの回数
  exDrawUsed: false,

  // 選択中カードを追加
  selectedCard: null,

  // 起動効果メニュー用
  effectMenuCard: null,

  attackCandidate: null,
  attackMenuCard: null,

  battle:{
    attacker:null,
    blocker:null
  },

  cards: {},

  effect: {
    mode: null,        // "select_target" / "select_hand_discard"
    source: null,
    effectId: null,
    step: 0,
    data: {}
  },

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