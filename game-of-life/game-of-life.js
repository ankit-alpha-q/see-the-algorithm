const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const S = 12;
const C = Math.floor(W / S), R = Math.floor(H / S);
let grid = Array.from({ length: R * C },
  () => (Math.random() < 0.3 ? 1 : 0));
let age = new Uint16Array(R * C);

const neighbours = (i) => {
  const x = i % C, y = (i / C) | 0;
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      n += grid[((y + dy + R) % R) * C + (x + dx + C) % C];
    }
  }
  return n;
};

let tick = 0;
function frame() {
  tick++;
  if (tick % 3 === 0) {
    grid = grid.map((v, i) => {
      const n = neighbours(i);
      const alive = n === 3 || (v && n === 2) ? 1 : 0;
      age[i] = alive && v ? age[i] + 1 : 0;
      return alive;
    });
  }
  ctx.fillStyle = '#0b0d1a';
  ctx.fillRect(0, 0, W, H);
  grid.forEach((v, i) => {
    if (!v) return;
    const hue = 180 + Math.min(age[i], 60) * 2;
    ctx.fillStyle = `hsl(${hue}, 85%, 60%)`;
    ctx.fillRect((i % C) * S, ((i / C) | 0) * S, S - 1, S - 1);
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
