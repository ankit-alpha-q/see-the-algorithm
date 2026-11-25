const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const w = Math.round(W / 4), h = Math.round(H / 4);
const small = document.createElement('canvas');
small.width = w; small.height = h;
const img = small.getContext('2d').createImageData(w, h);
const cx0 = -0.743643887, cy0 = 0.131825904;
let zoom = 3;

function frame() {
  zoom *= 0.985;
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const x0 = cx0 + ((px - w / 2) / Math.min(w, h)) * zoom;
      const y0 = cy0 + ((py - h / 2) / Math.min(w, h)) * zoom;
      let x = 0, y = 0, i = 0;
      while (x * x + y * y < 4 && i < 300) {
        [x, y] = [x * x - y * y + x0, 2 * x * y + y0];
        i++;
      }
      const k = (py * w + px) * 4;
      const inside = i >= 300;
      img.data[k] = inside ? 0 : 128 + 127 * Math.sin(i * 0.25);
      img.data[k + 1] = inside ? 0 : 128 + 127 * Math.sin(i * 0.25 + 2);
      img.data[k + 2] = inside ? 0 : 128 + 127 * Math.sin(i * 0.25 + 4);
      img.data[k + 3] = 255;
    }
  }
  small.getContext('2d').putImageData(img, 0, 0);
  ctx.drawImage(small, 0, 0, W, H);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
