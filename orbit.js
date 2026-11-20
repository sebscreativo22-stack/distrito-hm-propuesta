// Orbital hero: el progreso de scroll (0→1) alimenta --scroll-progress, que expande los anillos
// y desvanece el centro (todo el movimiento vive en CSS). Mecánica idéntica al componente original.
(() => {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  const handle = () => {
    const rect = hero.getBoundingClientRect();
    const h = rect.height || window.innerHeight;
    const p = Math.max(0, Math.min(1, -rect.top / h));
    hero.style.setProperty('--scroll-progress', p.toFixed(4));
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { handle(); ticking = false; }); }
  }, { passive: true });
  window.addEventListener('resize', handle);
  handle();
})();
