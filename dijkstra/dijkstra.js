const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const C = 36, R = 13;
const p1 = Math.random() * 6, p2 = Math.random() * 6;
const cost = Array.from({ length: R * C }, (_, i) => {
  const x = i % C, y = (i / C) | 0;
  const h = Math.sin(x * 0.35 + p1) * Math.cos(y * 0.5 + p2)
    + Math.sin((x + y) * 0.2);
  return 1 + Math.round(Math.max(0, h) * 4);
});
const start = 0, goal = R * C - 1;
const lanes = [];
function* search(weighted) {
  const dist = new Map([[start, 0]]), from = new Map();
  const open = [start];
  while (open.length) {
    let b = 0;
    if (weighted) open.forEach((c, j) => { if (dist.get(c) < dist.get(open[b])) b = j; });
    const i = open.splice(b, 1)[0];
    yield i;
    if (i === goal) break;
    const x = i % C, y = (i / C) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, n = ny * C + nx;
      if (nx < 0 || ny < 0 || nx >= C || ny >= R) continue;
      const d = dist.get(i) + (weighted ? cost[n] : 1);
      if (!dist.has(n) || d < dist.get(n)) {
        if (!dist.has(n) || weighted) open.push(n);
        dist.set(n, d);
        from.set(n, i);
      }
    }
  }
  const path = [];
  for (let k = goal; k !== undefined; k = from.get(k)) path.push(k);
  return { path, total: path.reduce((a, k) => a + cost[k], 0) };
}
const lane = (name, color, weighted) =>
  lanes.push({ name, color, it: search(weighted), seen: [] });

let finished = 0, tick = 0;

function frame() {
  tick++;
  const band = 840, top = (H - band) / 2;
  const view = lanes.length ? lanes : [{ name: 'Terrain', seen: [], steps: 0 }];
  const h = band / view.length;
  const s = Math.min((W - 40) / C, (h - 50) / R);
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
    const ox = (W - C * s) / 2, oy = top + k * h + 50;
    cost.forEach((c, i) => {
      ctx.fillStyle = `hsl(${130 - c * 12}, 45%, ${48 - c * 6}%)`;
      ctx.fillRect(ox + (i % C) * s, oy + ((i / C) | 0) * s, s, s);
    });
    ctx.fillStyle = l.color;
    ctx.globalAlpha = 0.5;
    for (const i of l.seen) ctx.fillRect(ox + (i % C) * s, oy + ((i / C) | 0) * s, s, s);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    for (const i of l.path || []) ctx.fillRect(ox + (i % C) * s + s / 4, oy + ((i / C) | 0) * s + s / 4, s / 2, s / 2);
    ctx.font = 'bold 30px Menlo, monospace';
    ctx.fillText(`${l.name}${l.path ? ` · ${l.path.length} steps · cost ${l.total}` : ''}`, ox, oy - 12);
  });
  requestAnimationFrame(frame);
}
lane('BFS', '#4cc9f0', false);
lane('Dijkstra', '#ffd166', true);
requestAnimationFrame(frame);
