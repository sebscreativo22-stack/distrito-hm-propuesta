// Orbit Media Ring — port a JS puro. La lógica de movimiento y todos los valores se mantienen idénticos al original.
(() => {
  const RADIUS = 0.39, GROWTH = 0.1, BASE_SPEED = 0.055, VEL_DIVISOR = 2600, VEL_CAP = 1.4,
        SPEED_EASE = 1.6, RADIUS_EASE = 2.4, TAU = Math.PI * 2;

  const outer = document.getElementById('orbitRunway');
  const pin = document.getElementById('orbitPin');
  const cards = [...document.querySelectorAll('.orbit-card')];
  if (!outer || !pin || !cards.length) return;

  const N = cards.length;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  let theta = -Math.PI / 2, baseR = 1, R = 1, targetR = 1, progress = 0, speed = BASE_SPEED;
  let visible = true, last = 0, frame = 0;
  let lastScroll = window.scrollY, lastScrollAt = 0, velocity = 0;

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

  function computeR() {
    // Adaptación: en pantallas estrechas el aro se abre un poco para dejar libre el titular
    const k = pin.clientWidth < 700 ? 1.2 : 1;
    baseR = Math.min(pin.clientWidth, pin.clientHeight) * RADIUS * k;
    targetR = baseR * (1 + progress * GROWTH);
    if (R < 2) R = baseR;
  }

  function place() {
    for (let i = 0; i < N; i++) {
      const a = (i / N) * TAU + theta;
      cards[i].style.setProperty('--om-x', (R * Math.cos(a)).toFixed(2) + 'px');
      cards[i].style.setProperty('--om-y', (R * Math.sin(a)).toFixed(2) + 'px');
    }
  }

  function readScroll(now) {
    const box = outer.getBoundingClientRect();
    const span = box.height - window.innerHeight;
    progress = span > 0 ? clamp(-box.top / span, 0, 1) : 0;
    const y = window.scrollY;
    const dt = (now - lastScrollAt) / 1000;
    if (dt > 0) velocity = (y - lastScroll) / dt;
    lastScroll = y;
    lastScrollAt = now;
  }

  function tick(now) {
    const dt = Math.min(now - last, 60) / 1000;
    last = now;
    readScroll(now);
    speed = Math.max(speed, BASE_SPEED + Math.min(Math.abs(velocity) / VEL_DIVISOR, VEL_CAP));
    speed += (BASE_SPEED - speed) * Math.min(1, dt * SPEED_EASE);
    targetR = baseR * (1 + progress * GROWTH);
    R += (targetR - R) * Math.min(1, dt * RADIUS_EASE);
    theta += speed * dt;
    place();
    if (visible) frame = requestAnimationFrame(tick);
  }

  function start() {
    if (frame || reduce.matches) return;
    last = performance.now();
    lastScrollAt = last;
    frame = requestAnimationFrame(tick);
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; }

  window.addEventListener('resize', () => { computeR(); place(); });
  reduce.addEventListener('change', () => (reduce.matches ? stop() : start()));

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      visible ? start() : stop();
    }, { threshold: 0 }).observe(outer);
  }

  computeR();
  R = baseR;
  place();
  start();
})();
