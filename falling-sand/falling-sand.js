const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const S = 12, C = Math.floor(W / S), R = Math.floor(H / S);
const grid = new Array(C * R).fill(0);
let hue = 0;

function frame() {
  hue = (hue + 0.5) % 360;
  // pour
  for (let n = 0; n < 14; n++) {
    const x = (C / 2 + Math.sin(hue / 20) * C * 0.3 + (Math.random() - 0.5) * 10) | 0;
    grid[x + 4 * C] = hue + 1;
  }
  // fall
  for (let y = R - 2; y >= 0; y--) {
    for (let x = 0; x < C; x++) {
      const i = y * C + x;
      if (!grid[i]) continue;
      const d = Math.random() < 0.5 ? 1 : -1;
      for (const j of [i + C, i + C + d, i + C - d]) {
        if (!grid[j] && Math.abs((j % C) - x) <= 1) { grid[j] = grid[i]; grid[i] = 0; break; }
      }
    }
  }
  ctx.fillStyle = '#0b0d1a';
  ctx.fillRect(0, 0, W, H);
  grid.forEach((v, i) => {
    if (!v) return;
    ctx.fillStyle = `hsl(${v}, 70%, 60%)`;
    ctx.fillRect((i % C) * S, ((i / C) | 0) * S, S, S);
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
