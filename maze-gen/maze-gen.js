const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const C = 33, R = 25;
const s = Math.min((W - 40) / C, 820 / R);
const ox = (W - C * s) / 2, oy = (H - R * s) / 2;
const open = new Map(); // cell -> carve order
let stack = [];

function frame() {
  if (typeof digger !== 'undefined') { digger.next(); digger.next(); }
  ctx.fillStyle = '#0b0d1a';
  ctx.fillRect(0, 0, W, H);
  for (let y = 0; y < R; y++) {
    for (let x = 0; x < C; x++) {
      const n = open.get(y * C + x);
      ctx.fillStyle = n === undefined ? '#232850'
        : `hsl(${(n * 0.7) % 360}, 80%, 55%)`;
      ctx.fillRect(ox + x * s, oy + y * s, s + 0.5, s + 0.5);
    }
  }
  ctx.fillStyle = '#fff';
  for (const k of stack) ctx.fillRect(ox + (k % C) * s + s / 3, oy + ((k / C) | 0) * s + s / 3, s / 3, s / 3);
  requestAnimationFrame(frame);
}
function* carve() {
  stack = [1 * C + 1];
  open.set(stack[0], 0);
  while (stack.length) {
    const k = stack.at(-1), x = k % C, y = (k / C) | 0;
    const next = [[2, 0], [-2, 0], [0, 2], [0, -2]]
      .map(([dx, dy]) => [x + dx, y + dy, dx / 2, dy / 2])
      .filter(([nx, ny]) => nx > 0 && ny > 0
        && nx < C - 1 && ny < R - 1 && !open.has(ny * C + nx));
    if (!next.length) { stack.pop(); yield; continue; }
    const pick = Math.floor(Math.random() * next.length);
    const [nx, ny, wx, wy] = next[pick];
    open.set((y + wy) * C + x + wx, open.size);
    open.set(ny * C + nx, open.size);
    stack.push(ny * C + nx);
    yield;
  }
}
const digger = carve();
requestAnimationFrame(frame);
