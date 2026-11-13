const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const N = 100;
const data = Array.from({ length: N }, (_, i) => i + 1)
  .sort(() => Math.random() - 0.5);

const lanes = [];
const lane = (name, sort) => {
  const a = data.slice();
  lanes.push({ name, a, steps: 0, it: sort(a) });
};
function* mergeSort(a) {
  for (let w = 1; w < a.length; w *= 2) {
    for (let lo = 0; lo < a.length - w; lo += 2 * w) {
      const hi = Math.min(lo + 2 * w, a.length);
      const L = a.slice(lo, lo + w);
      const R = a.slice(lo + w, hi);
      let i = 0, j = 0, k = lo;
      while (i < L.length && j < R.length) {
        yield;
        a[k++] = L[i] <= R[j] ? L[i++] : R[j++];
      }
      while (i < L.length) a[k++] = L[i++];
      while (j < R.length) a[k++] = R[j++];
    }
  }
}
lane('Merge', mergeSort);

function* shellSort(a) {
  for (let gap = a.length >> 1; gap > 0; gap >>= 1) {
    for (let i = gap; i < a.length; i++) {
      for (let j = i; j >= gap; j -= gap) {
        yield;
        if (a[j - gap] <= a[j]) break;
        [a[j], a[j - gap]] = [a[j - gap], a[j]];
      }
    }
  }
}
lane('Shell', shellSort);

function* heapSort(a) {
  function* sift(i, size) {
    for (;;) {
      let m = i;
      const l = 2 * i + 1, r = l + 1;
      if (l < size) { yield; if (a[l] > a[m]) m = l; }
      if (r < size) { yield; if (a[r] > a[m]) m = r; }
      if (m === i) return;
      [a[i], a[m]] = [a[m], a[i]];
      i = m;
    }
  }
  for (let i = (a.length >> 1) - 1; i >= 0; i--) {
    yield* sift(i, a.length);
  }
  for (let end = a.length - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    yield* sift(0, end);
  }
}
lane('Heap', heapSort);

function* quickSort(a, lo = 0, hi = a.length - 1) {
  if (lo >= hi) return;
  const p = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    yield;
    if (a[j] < p) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
  }
  [a[i], a[hi]] = [a[hi], a[i]];
  yield* quickSort(a, lo, i - 1);
  yield* quickSort(a, i + 1, hi);
}
lane('Quick', quickSort);

let finished = 0;

function frame() {
  const band = Math.min(H, 800);
  const top = (H - band) / 2 + 30;
  const h = band / Math.max(lanes.length, 1);
  ctx.fillStyle = '#0b0d1a';
  ctx.fillRect(0, 0, W, H);
  lanes.forEach((l, k) => {
    for (let s = 0; s < 3 && !l.place; s++) {
      if (l.it.next().done) l.place = ++finished;
      else l.steps++;
    }
    const y = top + k * h;
    const bw = W / N;
    l.a.forEach((v, i) => {
      ctx.fillStyle = l.place
        ? '#28c840' : `hsl(${v * 3}, 85%, 62%)`;
      const bh = (v / N) * (h - 56);
      ctx.fillRect(i * bw + 1, y + h - bh - 8, bw - 2, bh);
    });
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 34px Menlo, monospace';
    ctx.fillText(`${l.name} · ${l.steps}`, 24, y + 40);
    if (l.place) {
      ctx.fillStyle = '#ffd34d';
      ctx.fillText(`#${l.place}`, W - 90, y + 40);
    }
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
