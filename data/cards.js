export const cardDB = {

  1:{
    name:"Soldier",
    apCost:1,
    energyCost:0,
    energy:1,
    power:1000,
    step: true
  },

  2:{
    name:"Knight",
    apCost:1,
    energyCost:1,
    energy:2,
    power:3000,
    effects: [
      {
        type: "activate_main",
        id: "buff_ally_1000",
        label: "他の味方1体のBP+1000",
        condition: {
          notRested: true
        },
        cost: [
          { type: "discard", value: 1 }
        ]
      },
      {
        type: "activate_main",
        id: "draw_then_discard",
        label: "1枚引いて1枚捨てる",

      }
    ]
  },
  3:{
    name:"King",
    apCost:2,
    energyCost:5,
    energy:1,
    power:4000,
    enterActive: true
  }
};