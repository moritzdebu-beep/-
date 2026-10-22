const morphLogo = document.querySelector(".course-logo-morph");

if (morphLogo) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const TAU = Math.PI * 2;
  const circlePointCount = 24;

  function seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function circleState(cx, cy, radius, seed, strength = 1) {
    const random = seededRandom(seed);
    const points = [];

    for (let index = 0; index < circlePointCount; index += 1) {
      const angle = (index / circlePointCount) * TAU;
      const radialShift = (random() - 0.5) * radius * 0.19 * strength;
      const tangentShift = (random() - 0.5) * radius * 0.1 * strength;
      const currentRadius = radius + radialShift;

      points.push([
        cx + Math.cos(angle) * currentRadius - Math.sin(angle) * tangentShift,
        cy + Math.sin(angle) * currentRadius + Math.cos(angle) * tangentShift,
      ]);
    }

    return points;
  }

  const tBase = [
    [122, 10], [238, 10], [238, 45], [207, 45],
    [207, 110], [153, 110], [153, 45], [122, 45],
  ];

  function tState(seed, strength = 1) {
    const random = seededRandom(seed);
    return tBase.map(([x, y], index) => {
      const edgeWeight = index === 0 || index === 1 || index === 4 || index === 5 ? 1 : 0.72;
      return [
        x + (random() - 0.5) * 16 * strength * edgeWeight,
        y + (random() - 0.5) * 13 * strength * edgeWeight,
      ];
    });
  }

  function polygonPath(points) {
    return `${points
      .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(" ")} Z`;
  }

  function interpolatePoints(from, to, progress) {
    const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
    return from.map(([fromX, fromY], index) => {
      const [toX, toY] = to[index];
      return [
        fromX + (toX - fromX) * eased,
        fromY + (toY - fromY) * eased,
      ];
    });
  }

  function stateAt(states, elapsed, duration) {
    const totalSegments = states.length - 1;
    const localTime = elapsed / duration;
    const segment = Math.floor(localTime) % totalSegments;
    const progress = localTime - Math.floor(localTime);
    return interpolatePoints(states[segment], states[segment + 1], progress);
  }

  function blendPoints(from, to, amount) {
    return from.map(([fromX, fromY], index) => {
      const [toX, toY] = to[index];
      return [
        fromX + (toX - fromX) * amount,
        fromY + (toY - fromY) * amount,
      ];
    });
  }

  const leftBase = circleState(56, 60, 50, 1, 0);
  const rightBase = circleState(304, 60, 50, 1, 0);
  const shapes = [
    {
      element: morphLogo.querySelector('[data-oto-morph="left"]'),
      anchor: 0.16,
      idleDuration: 3100,
      hotDuration: 720,
      offset: 170,
      idleStates: [leftBase, circleState(56, 60, 50, 121, 0.72), circleState(56, 60, 50, 331, 0.92), circleState(56, 60, 50, 779, 0.68), leftBase],
      hotStates: [leftBase, circleState(56, 60, 50, 9121, 2.35), circleState(56, 60, 50, 9331, 2.9), circleState(56, 60, 50, 9779, 2.15), leftBase],
    },
    {
      element: morphLogo.querySelector('[data-oto-morph="middle"]'),
      anchor: 0.5,
      idleDuration: 3400,
      hotDuration: 860,
      offset: 640,
      idleStates: [tBase, tState(227, 0.68), tState(541, 0.88), tState(887, 0.62), tBase],
      hotStates: [tBase, tState(8227, 2.45), tState(8541, 3.1), tState(8887, 2.3), tBase],
    },
    {
      element: morphLogo.querySelector('[data-oto-morph="right"]'),
      anchor: 0.84,
      idleDuration: 2850,
      hotDuration: 650,
      offset: 1180,
      idleStates: [rightBase, circleState(304, 60, 50, 163, 0.84), circleState(304, 60, 50, 457, 0.66), circleState(304, 60, 50, 983, 0.96), rightBase],
      hotStates: [rightBase, circleState(304, 60, 50, 9163, 2.75), circleState(304, 60, 50, 9457, 2.2), circleState(304, 60, 50, 9983, 3.05), rightBase],
    },
  ];

  const pointer = {
    x: 0.5,
    y: 0.5,
    previousX: 0.5,
    previousY: 0.5,
    velocity: 0,
    target: 0,
    intensity: 0,
    lastMove: performance.now(),
  };

  function updatePointer(event) {
    if (!finePointer.matches) return;
    const rect = morphLogo.getBoundingClientRect();
    const paddingX = rect.width * 0.08;
    const paddingY = Math.max(80, rect.height * 0.55);
    const inside = event.clientX >= rect.left - paddingX
      && event.clientX <= rect.right + paddingX
      && event.clientY >= rect.top - paddingY
      && event.clientY <= rect.bottom + paddingY;

    const now = performance.now();
    const nextX = (event.clientX - rect.left) / rect.width;
    const nextY = (event.clientY - rect.top) / rect.height;
    const delta = Math.max(16, now - pointer.lastMove);
    const travel = Math.hypot(nextX - pointer.previousX, nextY - pointer.previousY);

    pointer.x = nextX;
    pointer.y = nextY;
    pointer.velocity = Math.min(1, travel * 880 / delta);
    pointer.target = inside ? 1 : 0;
    pointer.previousX = nextX;
    pointer.previousY = nextY;
    pointer.lastMove = now;
  }

  function clearPointer() {
    pointer.target = 0;
  }

  function drawStaticLogo() {
    shapes.forEach(({ element, idleStates }) => {
      element.setAttribute("d", polygonPath(idleStates[0]));
      element.style.transform = "translate(0, 0) rotate(0deg) scale(1)";
    });
  }

  let previousFrame = performance.now();

  function animateLogo(timestamp) {
    const frameDelta = Math.min(48, timestamp - previousFrame || 16);
    previousFrame = timestamp;
    const response = pointer.target ? 0.024 : 0.009;
    pointer.intensity += (pointer.target - pointer.intensity) * (1 - Math.exp(-frameDelta * response));
    pointer.velocity *= Math.pow(0.84, frameDelta / 16);

    const chaos = Math.min(1, pointer.intensity * (1 + pointer.velocity * 1.35));
    const easedChaos = chaos * chaos * (3 - 2 * chaos);

    shapes.forEach(({ element, anchor, idleDuration, hotDuration, offset, idleStates, hotStates }, shapeIndex) => {
      const idlePoints = stateAt(idleStates, timestamp + offset, idleDuration);
      const hotPoints = stateAt(hotStates, timestamp + offset * 2.7, hotDuration);
      const points = blendPoints(idlePoints, hotPoints, easedChaos).map(([x, y], pointIndex) => {
        const pulse = timestamp * 0.021 + pointIndex * 1.67 + shapeIndex * 2.1;
        const velocityKick = pointer.velocity * 4.5;
        const idlePulse = timestamp * 0.0044 + pointIndex * 1.19 + shapeIndex * 2.7;
        return [
          x + Math.sin(idlePulse) * 1.45 + Math.sin(pulse) * (4.5 + velocityKick) * easedChaos,
          y + Math.cos(idlePulse * 1.13) * 1.05 + Math.cos(pulse * 1.23) * (3.4 + velocityKick) * easedChaos,
        ];
      });

      const proximity = Math.max(0, 1 - Math.abs(pointer.x - anchor) * 2.1);
      const idleFloatX = Math.sin(timestamp * 0.00135 + shapeIndex * 2.2) * 1.8;
      const idleFloatY = Math.cos(timestamp * 0.0011 + shapeIndex * 1.8) * 1.4;
      const pullX = idleFloatX + (pointer.x - anchor) * 28 * easedChaos * proximity;
      const pullY = idleFloatY + (pointer.y - 0.5) * 18 * easedChaos * proximity;
      const rotate = Math.sin(timestamp * 0.001 + shapeIndex * 2.4) * 0.7 + (pointer.x - anchor) * 14 * easedChaos;
      const scale = 1 + easedChaos * (0.035 + proximity * 0.055);

      element.setAttribute("d", polygonPath(points));
      element.style.transform = `translate(${pullX.toFixed(2)}px, ${pullY.toFixed(2)}px) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    });

    requestAnimationFrame(animateLogo);
  }

  drawStaticLogo();
  if (!reduceMotion.matches) {
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerout", (event) => {
      if (!event.relatedTarget) clearPointer();
    }, { passive: true });
    window.addEventListener("blur", clearPointer);
    requestAnimationFrame(animateLogo);
  }
}
