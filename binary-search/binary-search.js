const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const N = 1000;
const target = 600 + Math.floor(Math.random() * 350);
const lanes = [];
const lane = (name, color, search) =>
  lanes.push({ name, color, it: search(), lo: 1, hi: N, g: 0, steps: 0 });

let tick = 0;
function frame() {
  tick++;
  const band = 640, top = (H - band) / 2;
  const view = lanes.length ? lanes : [{ name: 'Secret', lo: 1, hi: N, steps: 0 }];
  const h = band / view.length;
  const x = (v) => 40 + ((v - 1) / (N - 1)) * (W - 80);
  const leader = view.find((l) => l.found);
  ctx.fillStyle = '#0b0d1a';
  ctx.fillRect(0, 0, W, H);
  view.forEach((l, k) => {
    const turns = leader && !l.found ? 20 : tick % 8 === 0 ? 1 : 0;
    for (let s = 0; s < turns && l.it && !l.found; s++) {
      const r = l.it.next();
      if (r.done) l.found = true;
      else { Object.assign(l, r.value); l.steps++; }
    }
    const y = top + k * h + h / 2;
    ctx.fillStyle = '#232850';
    ctx.fillRect(40, y - 18, W - 80, 36);
    ctx.fillStyle = l.color || '#3b4261';
    ctx.fillRect(x(l.lo), y - 18, x(l.hi) - x(l.lo) + 2, 36);
    ctx.fillStyle = '#ffd34d';
    ctx.fillRect(x(target) - 2, y - 40, 4, 80);
    if (l.g) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(x(l.g) - 3, y - 50, 6, 100);
      ctx.font = 'bold 30px Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(l.g, x(l.g), y + 90);
    }
    ctx.textAlign = 'left';
    ctx.font = 'bold 34px Menlo, monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${l.name} · ${l.steps} guesses`, 40, y - 70);
    if (leader && !l.found) {
      ctx.fillStyle = '#ff8a6b';
      ctx.fillText('▶▶ fast-forward', W - 360, y - 70);
    }
  });
  requestAnimationFrame(frame);
}
lane('Linear', '#f72585', function* () {
  for (let g = 1; g <= N; g++) {
    yield { lo: g, hi: N, g };
    if (g === target) return;
  }
});
lane('Binary', '#4cc9f0', function* () {
  let lo = 1, hi = N;
  while (lo <= hi) {
    const g = (lo + hi) >> 1;
    yield { lo, hi, g };
    if (g === target) return;
    if (g < target) lo = g + 1; else hi = g - 1;
  }
});
requestAnimationFrame(frame);
