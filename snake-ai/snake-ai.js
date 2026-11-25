const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const S = 80, C = Math.floor(W / S), R = Math.floor(H / S);
let snake, dir, food;
const free = (x, y) => x >= 0 && y >= 0 && x < C && y < R && !snake.some(([a, b]) => a === x && b === y);
const place = () => {
  do food = [(Math.random() * C) | 0, (Math.random() * R) | 0];
  while (!free(...food));
};
const reset = () => { snake = [[(C / 2) | 0, (R / 2) | 0]]; dir = [1, 0]; place(); };
reset();

let tick = 0;
function frame() {
  if (++tick % 2 === 0) {
    const [hx, hy] = snake[0];
    // brain
    const prev = new Map([[hx + ',' + hy, null]]), q = [[hx, hy]];
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = x + dx + ',' + (y + dy);
        if (!prev.has(k) && free(x + dx, y + dy)) { prev.set(k, [x, y]); q.push([x + dx, y + dy]); }
      }
    }
    let at = food;
    while (prev.get(at + '') && prev.get(at + '') + '' !== hx + ',' + hy) at = prev.get(at + '');
    if (prev.has(food + '')) dir = [at[0] - hx, at[1] - hy];
    else dir = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([dx, dy]) => free(hx + dx, hy + dy)) || dir;
    const nx = hx + dir[0], ny = hy + dir[1];
    if (!free(nx, ny)) reset();
    else {
      snake.unshift([nx, ny]);
      if (nx === food[0] && ny === food[1]) place(); else snake.pop();
    }
  }
  ctx.fillStyle = '#0b0d1a';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ff5c8a';
  ctx.fillRect(food[0] * S + 8, food[1] * S + 8, S - 16, S - 16);
  snake.forEach(([x, y], i) => {
    ctx.fillStyle = `hsl(${140 + i * 2}, 70%, ${62 - Math.min(i, 30)}%)`;
    ctx.fillRect(x * S + 2, y * S + 2, S - 4, S - 4);
  });
  ctx.fillStyle = '#c0caf5';
  ctx.font = 'bold 44px Menlo, monospace';
  ctx.fillText(`length ${snake.length}`, 30, H - 40);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
