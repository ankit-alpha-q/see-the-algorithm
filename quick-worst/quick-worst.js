const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const N = 200;
const sorted = Array.from({ length: N }, (_, i) => i + 1);
const shuffled = sorted.slice().sort(() => Math.random() - 0.5);
const lanes = [];
const lane = (name, data, sort) => {
  const a = data.slice();
  lanes.push({ name, a, steps: 0, it: sort(a) });
};

function* quickSort(a, lo = 0, hi = a.length - 1) {
  if (lo >= hi) return;
  const p = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    yield;
    if (a[j] < p) { [a[i], a[j]] = [a[j], a[i]]; i++; }
  }
  [a[i], a[hi]] = [a[hi], a[i]];
  yield* quickSort(a, lo, i - 1);
  yield* quickSort(a, i + 1, hi);
}

lane('Shuffled', shuffled, quickSort);
lane('Sorted', sorted, quickSort);
function frame() {
  const band = 820, top = (H - band) / 2 + 20;
  const view = lanes.length ? lanes : [{ name: 'Bars', a: shuffled, steps: 0 }];
  const h = band / view.length;
  const leader = view.find((l) => l.done);
  ctx.fillStyle = '#0b0d1a';
  ctx.fillRect(0, 0, W, H);
  view.forEach((l, k) => {
    const speed = leader && !l.done ? 500 : 30;
    for (let s = 0; s < speed && l.it && !l.done; s++) {
      if (l.it.next().done) l.done = true;
      else l.steps++;
    }
    const y = top + k * h, bw = W / N;
    l.a.forEach((v, i) => {
      ctx.fillStyle = l.done ? '#28c840' : `hsl(${v * 1.6}, 85%, 62%)`;
      const bh = (v / N) * (h - 70);
      ctx.fillRect(i * bw, y + h - bh - 10, bw - 1, bh);
    });
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 34px Menlo, monospace';
    ctx.fillText(`${l.name} · ${l.steps.toLocaleString('en-US')}`, 24, y + 44);
    if (leader && !l.done) {
      ctx.fillStyle = '#ff8a6b';
      ctx.fillText('▶▶ fast-forward', W - 360, y + 44);
    }
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
