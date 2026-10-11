/* Critter Capture — the item table. Items heal a fixed amount of HP.
   Prices are balanced against the trainer payouts ($120 / $200 / $150). */

export const ITEMS = {
  snack: {
    id: 'snack', name: 'Critter Snack', price: 50, heal: 20,
    desc: 'Restores 20 HP to one critter.',
  },
  tonic: {
    id: 'tonic', name: 'Big Tonic', price: 120, heal: 60,
    desc: 'Restores 60 HP to one critter.',
  },
};
