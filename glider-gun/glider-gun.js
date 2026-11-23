const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const S = 12;
const C = Math.floor(W / S) + 80, R = Math.floor(H / S) + 80; // room off-screen so gliders fly away
let grid = new Uint8Array(R * C);
const alive = (x, y) => (x >= 0 && y >= 0 && x < C && y < R ? grid[y * C + x] : 0);

const gun = [
  '........................O...........',
  '......................O.O...........',
  '............OO......OO............OO',
  '...........O...O....OO............OO',
  'OO........O.....O...OO..............',
  'OO........O...O.OO....O.O...........',
  '..........O.....O.......O...........',
  '...........O...O....................',
  '............OO......................',
];
gun.forEach((row, y) => [...row].forEach((c, x) => {
  if (c === 'O') grid[(y + 50) * C + x + 3] = 1;
}));

let tick = 0;
function frame() {
  if (++tick % 2 === 0) {
    grid = grid.map((v, i) => {
      const x = i % C, y = (i / C) | 0;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) if (dx || dy) n += alive(x + dx, y + dy);
      return n === 3 || (v && n === 2) ? 1 : 0;
    });
  }
  ctx.fillStyle = '#0b0d1a';
  ctx.fillRect(0, 0, W, H);
  grid.forEach((v, i) => {
    if (!v) return;
    const x = i % C;
    ctx.fillStyle = x < 40 ? '#ffd166' : '#4cc9f0';
    ctx.fillRect(x * S, ((i / C) | 0) * S, S - 1, S - 1);
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
