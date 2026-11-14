const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const C = 41, R = 11;
const grid = Array.from({ length: R }, () => Array(C).fill(1));
const carve = (x, y) => {
  grid[y][x] = 0;
  const dirs = [[2, 0], [-2, 0], [0, 2], [0, -2]]
    .sort(() => Math.random() - 0.5);
  for (const [dx, dy] of dirs) {
    const nx = x + dx, ny = y + dy;
    if (nx > 0 && ny > 0 && nx < C - 1 && ny < R - 1 && grid[ny][nx]) {
      grid[y + dy / 2][x + dx / 2] = 0;
      carve(nx, ny);
    }
  }
};
carve(1, 1);
for (let i = 0; i < 40; i++) { // a few shortcuts, so paths differ
  const x = 1 + Math.floor(Math.random() * (C - 2));
  const y = 1 + Math.floor(Math.random() * (R - 2));
  if ((x + y) % 2) grid[y][x] = 0;
}
const start = [1, 1], goal = [C - 2, R - 2];

function* search(pick) {
  const key = (x, y) => y * C + x;
  const from = new Map([[key(...start), null]]);
  const g = new Map([[key(...start), 0]]);
  const open = [start];
  while (open.length) {
    const [x, y] = pick(open, g);
    yield [x, y];
    if (x === goal[0] && y === goal[1]) {
      const path = [];
      for (let k = key(x, y); k != null; k = from.get(k)) path.push([k % C, (k / C) | 0]);
      return path;
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, nk = key(nx, ny);
      if (!grid[ny][nx] && !from.has(nk)) {
        from.set(nk, key(x, y));
        g.set(nk, g.get(key(x, y)) + 1);
        open.push([nx, ny]);
      }
    }
  }
}
const lane = (name, color, pick) =>
  lanes.push({ name, color, it: search(pick), seen: [], steps: 0 });

const lanes = [];
let finished = 0, tick = 0;
function frame() {
  tick++;
  const band = 870, top = (H - band) / 2;
  const view = lanes.length ? lanes : [{ name: 'Maze', seen: [], steps: 0 }];
  const h = band / view.length;
  const s = Math.min((W - 40) / C, (h - 40) / R);
  ctx.fillStyle = '#0b0d1a';
  ctx.fillRect(0, 0, W, H);
  view.forEach((l, k) => {
    if (l.it && !l.place && tick % 2 === 0) {
      const r = l.it.next();
      if (r.done) { l.path = r.value; l.place = ++finished; }
      else { l.seen.push(r.value); l.steps++; }
    }
    const ox = (W - C * s) / 2, oy = top + k * h + 40;
    for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
      ctx.fillStyle = grid[y][x] ? '#232850' : '#05060f';
      ctx.fillRect(ox + x * s, oy + y * s, s, s);
    }
    ctx.fillStyle = l.color;
    for (const [x, y] of l.seen) ctx.fillRect(ox + x * s + 3, oy + y * s + 3, s - 6, s - 6);
    ctx.fillStyle = '#fff';
    for (const [x, y] of l.path || []) ctx.fillRect(ox + x * s + 7, oy + y * s + 7, s - 14, s - 14);
    ctx.font = 'bold 30px Menlo, monospace';
    ctx.fillText(`${l.name} · ${l.steps} explored`, ox, oy - 10);
    if (l.place) {
      ctx.fillStyle = '#ffd34d';
      ctx.fillText(`#${l.place}`, W - ox - 50, oy - 10);
    }
  });
  requestAnimationFrame(frame);
}
lane('BFS', '#4cc9f0', (open) => open.shift());
lane('DFS', '#f72585', (open) => open.pop());
lane('A*', '#ffd166', (open, g) => {
  const f = ([x, y]) => g.get(y * C + x)
    + Math.abs(goal[0] - x) + Math.abs(goal[1] - y);
  let b = 0;
  open.forEach((c, i) => { if (f(c) < f(open[b])) b = i; });
  return open.splice(b, 1)[0];
});
requestAnimationFrame(frame);
