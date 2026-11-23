const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const C = 37, R = 25;
const wall = Array.from({ length: R * C }, (_, i) => {
  const x = i % C, y = (i / C) | 0;
  const block = x % 3 && y % 3, crossing = !(x % 3) && !(y % 3);
  return block || (!crossing && x + y > 3 && x + y < C + R - 6 && Math.random() < 0.1);
});
const start = 0, goal = R * C - 1;
const lanes = [];
function* search(guess) {
  const dist = new Map([[start, 0]]), from = new Map();
  const gx = goal % C, gy = (goal / C) | 0;
  const f = (c) => dist.get(c)
    + (guess ? Math.abs(gx - (c % C)) + Math.abs(gy - ((c / C) | 0)) : 0);
  const open = [start];
  while (open.length) {
    let b = 0;
    open.forEach((c, j) => {
      if (f(c) < f(open[b]) || (f(c) === f(open[b]) && dist.get(c) > dist.get(open[b]))) b = j;
    });
    const i = open.splice(b, 1)[0];
    yield i;
    if (i === goal) break;
    const x = i % C, y = (i / C) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, n = ny * C + nx;
      if (nx < 0 || ny < 0 || nx >= C || ny >= R || wall[n]) continue;
      if (!dist.has(n) || dist.get(i) + 1 < dist.get(n)) {
        if (!dist.has(n)) open.push(n);
        dist.set(n, dist.get(i) + 1);
        from.set(n, i);
      }
    }
  }
  const path = [];
  for (let k = goal; k !== undefined; k = from.get(k)) path.push(k);
  return { path };
}
const lane = (name, color, guess) =>
  lanes.push({ name, color, it: search(guess), seen: [] });

let finished = 0;

function frame() {
  const band = 1500, top = (H - band) / 2;
  const view = lanes.length ? lanes : [{ name: 'City', seen: [] }];
  const h = band / view.length;
  const s = Math.min((W - 40) / C, (h - 60) / R);
  ctx.fillStyle = '#0b0d1a';
  ctx.fillRect(0, 0, W, H);
  view.forEach((l, k) => {
    if (l.it && !l.place) {
      for (let n = 0; n < 3; n++) {
        const r = l.it.next();
        if (r.done) { Object.assign(l, r.value); l.place = ++finished; break; }
        l.seen.push(r.value);
      }
    }
    const ox = (W - C * s) / 2, oy = top + k * h + 60;
    wall.forEach((w, i) => {
      ctx.fillStyle = w ? '#232850' : '#141830';
      ctx.fillRect(ox + (i % C) * s, oy + ((i / C) | 0) * s, s - 1, s - 1);
    });
    ctx.fillStyle = l.color;
    ctx.globalAlpha = 0.55;
    for (const i of l.seen) ctx.fillRect(ox + (i % C) * s, oy + ((i / C) | 0) * s, s - 1, s - 1);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    for (const i of l.path || []) ctx.fillRect(ox + (i % C) * s + s / 4, oy + ((i / C) | 0) * s + s / 4, s / 2, s / 2);
    ctx.font = 'bold 34px Menlo, monospace';
    ctx.fillText(`${l.name} · checked ${l.seen.length}${l.path ? ' ✓' : ''}`, ox, oy - 16);
  });
  requestAnimationFrame(frame);
}
lane('Dijkstra', '#4cc9f0', false);
lane('A*', '#ffd166', true);
requestAnimationFrame(frame);
