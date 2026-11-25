const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const boids = Array.from({ length: 160 }, () => ({
  x: Math.random() * W, y: Math.random() * H,
  vx: Math.random() * 6 - 3, vy: Math.random() * 6 - 3,
}));

function frame() {
  ctx.fillStyle = 'rgba(11, 13, 26, 0.35)';
  ctx.fillRect(0, 0, W, H);
  for (const b of boids) {
    // flock
    let cx = 0, cy = 0, ax = 0, ay = 0, sx = 0, sy = 0, n = 0;
    for (const o of boids) {
      const dx = o.x - b.x, dy = o.y - b.y, d = Math.hypot(dx, dy);
      if (o === b || d > 90) continue;
      cx += dx; cy += dy; ax += o.vx; ay += o.vy; n++;
      if (d < 28) { sx -= dx / d; sy -= dy / d; }
    }
    if (n) {
      b.vx += (cx / n) * 0.004 + (ax / n - b.vx) * 0.05 + sx * 0.5;
      b.vy += (cy / n) * 0.004 + (ay / n - b.vy) * 0.05 + sy * 0.5;
    }
    const sp = Math.hypot(b.vx, b.vy) || 1;
    b.vx = (b.vx / sp) * 5; b.vy = (b.vy / sp) * 5;
    b.x = (b.x + b.vx + W) % W; b.y = (b.y + b.vy + H) % H;
    const a = Math.atan2(b.vy, b.vx);
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(a);
    ctx.fillStyle = `hsl(${190 + a * 20}, 80%, 65%)`;
    ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-10, 8); ctx.lineTo(-10, -8); ctx.fill();
    ctx.restore();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
