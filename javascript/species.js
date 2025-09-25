function uid(){ return Math.random().toString(36).slice(2,9); }

let speciesConfig = [
  {
    id: uid(),
    name: 'Xborg',
    image: './images/xborg.png',
    count: 15,
    canAttackNames: ['Lapu - Lapu'] 
  },
  {
    id: uid(),
    name: 'Lapu - Lapu',
    image: './images/lapu-lapu.png',
    count: 15,
    canAttackNames: ['Zilong'] 
  },
  {
    id: uid(),
    name: 'Zilong',
    image: './images/zilong.png',
    count: 15,
    canAttackNames: ['Xborg'] 
  }
];
