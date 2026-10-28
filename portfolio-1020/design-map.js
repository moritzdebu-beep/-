// A decorative Minesweeper field. One gesture uncovers the studio's actual mark.
(() => {
  const map = document.querySelector('[data-design-map]');
  if (!map) return;
  const canvas = map.querySelector('[data-design-map-board]');
  const context = canvas.getContext('2d');
  if (!context) return;
  const status = map.querySelector('[data-design-map-status]');
  const progress = map.querySelector('[data-map-progress]');
  const reset = map.querySelector('.design-map__reset');
  const face = reset.querySelector('[data-map-face]');
  const smile = face.getAttribute('d');
  const victoryFace = 'M3 6h14v2h-1v2h-4V8H8v2H4V8H3ZM5 12h2v2h6v-2h2v3h-2v1H7v-1H5Z';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const numberColors = ['', '#0000b7', '#007400', '#c30000', '#000078', '#800000', '#007d7d', '#111', '#666'];
  const segments = ['abcedf', 'bc', 'abged', 'abgcd', 'fgbc', 'afgcd', 'afgecd', 'abc', 'abcdefg', 'abfgcd'];
  const segmentPaths = {
    a: '3,1 11,1 9,3 5,3', b: '12,2 12,10 10,9 10,4',
    c: '12,12 12,20 10,18 10,13', d: '3,21 11,21 9,19 5,19',
    e: '2,12 4,13 4,18 2,20', f: '2,2 4,4 4,9 2,10',
    g: '3,11 5,10 9,10 11,11 9,12 5,12',
  };
  const ns = 'http://www.w3.org/2000/svg';
  let columns = 0;
  let rows = 0;
  let cellWidth = 0;
  let cellHeight = 0;
  let width = 0;
  let height = 0;
  let cells = [];
  let state = 'ready';
  let animation = 0;
  let lastProgress = -1;
  let hover = -1;
  let order = [];
  let revealedCount = 0;

  function makeCounter(svg, value) {
    svg.replaceChildren();
    for (let digit = 0; digit < 3; digit++) {
      const group = document.createElementNS(ns, 'g');
      group.setAttribute('transform', `translate(${digit * 15} 0)`);
      for (const [name, points] of Object.entries(segmentPaths)) {
        const polygon = document.createElementNS(ns, 'polygon');
        polygon.setAttribute('points', points);
        polygon.dataset.segment = name;
        group.append(polygon);
      }
      svg.append(group);
    }
    updateCounter(svg, value);
  }

  function updateCounter(svg, value) {
    const digits = String(value).padStart(3, '0');
    [...svg.children].forEach((group, index) => {
      for (const polygon of group.children) {
        polygon.setAttribute('fill', segments[Number(digits[index])].includes(polygon.dataset.segment) ? '#f20d0d' : '#370000');
      }
    });
  }

  // The same geometry as assets/brand-oto-black.svg, not a typeset O-T-O.
  function inLogo(x, y) {
    if (y < 0 || y > 52 || x < 0 || x > 170) return false;
    return Math.hypot(x - 26, y - 26) <= 26
      || Math.hypot(x - 144, y - 26) <= 26
      || (x >= 59 && x <= 111 && y >= 6 && y <= 30)
      || (x >= 72 && x <= 98 && y >= 30 && y <= 52);
  }

  function neighbors(index, predicate) {
    const x = index % columns;
    const y = Math.floor(index / columns);
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if ((!dx && !dy) || x + dx < 0 || x + dx >= columns || y + dy < 0 || y + dy >= rows) continue;
        if (predicate(cells[(y + dy) * columns + x + dx])) count++;
      }
    }
    return count;
  }

  function drawFlag(x, y, size) {
    // The classic red pennant, black pole and base, on whole physical pixels.
    const pixel = size * .72 / 11;
    const left = Math.round(x - 5.5 * pixel);
    const top = Math.round(y - 5.5 * pixel);
    const sprite = ['000000RK000', '0000RRRK000', '00RRRRRK000', '0RRRRRRK000', '000RRRRK000', '00000RRK000', '0000000K000', '0000000K000', '0000000K000', '0000KKKKK00', '00KKKKKKKK0'];
    sprite.forEach((row, rowIndex) => {
      [...row].forEach((point, column) => {
        if (point !== '0') {
          context.fillStyle = point === 'R' ? '#ed0000' : '#111';
          const px = Math.round(left + column * pixel);
          const py = Math.round(top + rowIndex * pixel);
          context.fillRect(px, py, Math.round(left + (column + 1) * pixel) - px,
            Math.round(top + (rowIndex + 1) * pixel) - py);
        }
      });
    });
  }

  function drawCell(index, final = false, highlight = false) {
    const cell = cells[index];
    const x = Math.round((index % columns) * cellWidth);
    const y = Math.round(Math.floor(index / columns) * cellHeight);
    const w = Math.round((index % columns + 1) * cellWidth) - x;
    const h = Math.round((Math.floor(index / columns) + 1) * cellHeight) - y;
    const scale = canvas.width / width;
    const stroke = Math.max(1, Math.round(scale));
    // Reveal the surrounding field while the mark remains made of raised tiles.
    const flagged = final && (cell.logo || cell.mine);
    const raised = !final || cell.logo || flagged;
    context.fillStyle = '#b0b0b0';
    context.fillRect(x, y, w, h);
    context.fillStyle = highlight ? '#f5f5f5' : '#e7e7e7';
    context.fillRect(x + stroke, y + stroke, w - stroke, h - stroke);
    if (raised) {
      const bevel = Math.max(1, Math.round(scale * 1.4));
      context.fillStyle = '#f7f7f7';
      context.fillRect(x, y, w - stroke, bevel);
      context.fillRect(x, y, bevel, h - stroke);
      context.fillStyle = '#a0a0a0';
      context.fillRect(x + w - bevel, y + bevel, bevel, h - bevel);
      context.fillRect(x + bevel, y + h - bevel, w - bevel, bevel);
      if (flagged) drawFlag(x + w / 2, y + h / 2, Math.min(w, h));
    } else {
      const number = cell.finalNumber;
      if (number) {
        context.fillStyle = numberColors[number];
        context.font = `bold ${Math.round(Math.min(w, h) * .75)}px "Courier New", monospace`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(String(number), x + w / 2 + stroke / 2, y + h / 2 + stroke);
      }
    }
  }

  function paint() {
    for (let index = 0; index < cells.length; index++) drawCell(index, state === 'revealed');
  }

  function setState(next) {
    state = next;
    map.dataset.state = next;
    face.setAttribute('d', next === 'revealed' ? victoryFace : smile);
    reset.title = next === 'revealed' ? '成功！点击笑脸重新开始' : '重新开始';
    canvas.setAttribute('aria-label', next === 'ready'
      ? '点击或按回车，一次揭开 OTO 标识'
      : next === 'revealing' ? '正在揭开 OTO 标识' : '成功！OTO 标识已显现，周围已插上红旗；点击笑脸可以重新开始');
    canvas.setAttribute('aria-pressed', String(next !== 'ready'));
  }

  function finish() {
    cancelAnimationFrame(animation);
    setState('revealed');
    paint();
    updateCounter(progress, 100);
    status.textContent = 'YOU WIN! / OTO 标识已点亮';
  }

  function build() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    cancelAnimationFrame(animation);
    if (state === 'revealing') setState('revealed');
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const target = width < 600 ? 11 : Math.max(16, Math.min(22, width / 80));
    columns = Math.max(24, Math.round(width / target));
    rows = Math.max(8, Math.round(height / (width / columns)));
    cellWidth = canvas.width / columns;
    cellHeight = canvas.height / rows;
    map.dataset.columns = columns;
    map.dataset.rows = rows;
    // Fit the real mark with generous clear space; never crop on a narrow screen.
    const logoWidth = Math.min(width * .82, height * 170 / 52 * .62);
    const logoHeight = logoWidth * 52 / 170;
    const left = (width - logoWidth) / 2;
    const top = (height - logoHeight) / 2;
    cells = Array.from({ length: columns * rows }, (_, index) => {
      const x = index % columns;
      const y = Math.floor(index / columns);
      return {
        logo: inLogo(((x + .5) * width / columns - left) / logoWidth * 170,
          ((y + .5) * height / rows - top) / logoHeight * 52),
        mine: false,
        finalNumber: 0,
      };
    });
    // Sparse mines and their counts trace the outside of the raised silhouette.
    // Hidden mines inside the mark also give the edge natural 1/2/3 patterns.
    cells.forEach((cell, index) => {
      const x = index % columns;
      const y = Math.floor(index / columns);
      const seed = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      const random = seed - Math.floor(seed);
      const onEdge = !cell.logo && neighbors(index, neighbor => neighbor.logo) > 0;
      cell.mine = cell.logo ? random > .58 : onEdge && random > .76;
    });
    cells.forEach((cell, index) => {
      if (!cell.logo && !cell.mine) cell.finalNumber = neighbors(index, neighbor => neighbor.mine);
    });
    hover = -1;
    paint();
    if (state === 'revealed') finish();
  }

  function reveal(clientX, clientY) {
    if (state !== 'ready' || !cells.length) return;
    setState('revealing');
    status.textContent = '正在揭开 / DISCOVERING…';
    const rect = canvas.getBoundingClientRect();
    const originX = (clientX ?? rect.left + rect.width / 2) - rect.left;
    const originY = (clientY ?? rect.top + rect.height / 2) - rect.top;
    order = cells.map((_, index) => ({
      index,
      distance: Math.hypot((index % columns + .5) * width / columns - originX,
        (Math.floor(index / columns) + .5) * height / rows - originY),
    })).sort((a, b) => a.distance - b.distance);
    revealedCount = 0;
    lastProgress = -1;
    const farthest = order[order.length - 1].distance;
    const start = performance.now();
    if (reducedMotion.matches) { finish(); return; }
    const frame = (now) => {
      const elapsed = Math.min(1, (now - start) / 1150);
      const radius = farthest * (1 - Math.pow(1 - elapsed, 1.6));
      while (revealedCount < order.length && order[revealedCount].distance <= radius) {
        drawCell(order[revealedCount].index, true);
        revealedCount++;
      }
      const percent = Math.round(revealedCount / order.length * 100);
      if (percent !== lastProgress) { updateCounter(progress, percent); lastProgress = percent; }
      if (elapsed < 1) animation = requestAnimationFrame(frame);
      else finish();
    };
    animation = requestAnimationFrame(frame);
  }

  canvas.addEventListener('click', event => reveal(event.clientX, event.clientY));
  canvas.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    reveal();
  });
  canvas.addEventListener('pointermove', event => {
    if (state !== 'ready' || event.pointerType === 'touch') return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / width * columns);
    const y = Math.floor((event.clientY - rect.top) / height * rows);
    const next = x < 0 || x >= columns || y < 0 || y >= rows ? -1 : y * columns + x;
    if (next === hover) return;
    if (hover >= 0) drawCell(hover);
    hover = next;
    if (hover >= 0) drawCell(hover, false, true);
  });
  canvas.addEventListener('pointerleave', () => {
    if (state === 'ready' && hover >= 0) drawCell(hover);
    hover = -1;
  });
  reset.addEventListener('click', () => {
    cancelAnimationFrame(animation);
    setState('ready');
    updateCounter(progress, 0);
    status.textContent = '点击任意格子，揭开标识 / CLICK TO DISCOVER';
    hover = -1;
    paint();
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && state === 'revealing') finish();
  });
  makeCounter(map.querySelector('[data-map-edition]'), 1);
  makeCounter(progress, 0);
  setState('ready');
  new ResizeObserver(build).observe(canvas);
})();

