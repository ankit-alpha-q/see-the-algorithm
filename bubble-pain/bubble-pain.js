const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const N = 300;
const data = Array.from({ length: N }, (_, i) => i + 1)
  .sort(() => Math.random() - 0.5);
const lanes = [];
const lane = (name, sort) => {
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
lane('Quick', quickSort);

function* bubbleSort(a) {
  for (let end = a.length - 1; end > 0; end--) {
    for (let i = 0; i < end; i++) {
      yield;
      if (a[i] > a[i + 1]) [a[i], a[i + 1]] = [a[i + 1], a[i]];
    }
  }
}
lane('Bubble', bubbleSort);

function frame() {
  const band = 820, top = (H - band) / 2 + 20;
  const view = lanes.length ? lanes : [{ name: 'Shuffled', a: data, steps: 0 }];
  const h = band / view.length;
  const leader = view.find((l) => l.done);
  ctx.fillStyle = '#0b0d1a';
  ctx.fillRect(0, 0, W, H);
  view.forEach((l, k) => {
    const speed = leader && !l.done ? 600 : 40; // fast-forward the loser
    for (let s = 0; s < speed && l.it && !l.done; s++) {
      if (l.it.next().done) l.done = true;
      else l.steps++;
    }
    const y = top + k * h, bw = W / N;
    l.a.forEach((v, i) => {
      ctx.fillStyle = l.done ? '#28c840' : `hsl(${v * 1.1}, 85%, 62%)`;
      const bh = (v / N) * (h - 70);
      ctx.fillRect(i * bw, y + h - bh - 10, bw - 0.6, bh);
    });
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 34px Menlo, monospace';
    ctx.fillText(`${l.name} · ${l.steps.toLocaleString('en-US')}`, 24, y + 44);
    if (leader && !l.done) {
      ctx.fillStyle = '#ff8a6b';
      ctx.fillText('▶▶ 15× fast-forward', W - 420, y + 44);
    }
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
