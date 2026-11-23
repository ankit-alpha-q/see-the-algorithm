const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const N = 200, Z = 26;
const pts = Array.from({ length: N }, (_, i) => {
  const t = (i / N) * Math.PI * 2;
  return [16 * Math.sin(t) ** 3,
    -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))];
});
const circles = [];
for (let k = -N / 2; k < N / 2; k++) {
  let re = 0, im = 0;
  pts.forEach(([x, y], n) => {
    const a = (-2 * Math.PI * k * n) / N;
    re += x * Math.cos(a) - y * Math.sin(a);
    im += x * Math.sin(a) + y * Math.cos(a);
  });
  circles.push({ k, r: Math.hypot(re, im) / N, p: Math.atan2(im, re) });
}
circles.sort((a, b) => b.r - a.r);

let t = 0, trace = [];

function frame() {
  ctx.fillStyle = '#0b0d1a';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#3b4261';
  for (const [x, y] of pts) ctx.fillRect(W / 2 + x * Z - 2, H / 2 + y * Z - 2, 4, 4);
  // circles
  let x = W / 2, y = H / 2;
  ctx.strokeStyle = 'rgba(192, 202, 245, 0.35)';
  ctx.lineWidth = 2;
  for (const c of circles) {
    ctx.beginPath();
    ctx.arc(x, y, c.r * Z, 0, 7);
    ctx.stroke();
    x += c.r * Z * Math.cos(c.k * t + c.p);
    y += c.r * Z * Math.sin(c.k * t + c.p);
  }
  trace.push([x, y]);
  if (trace.length > N * 2) trace = [];
  ctx.strokeStyle = '#ff5c8a';
  ctx.lineWidth = 7;
  ctx.beginPath();
  trace.forEach(([px, py]) => ctx.lineTo(px, py));
  ctx.stroke();
  t += Math.PI / N;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
