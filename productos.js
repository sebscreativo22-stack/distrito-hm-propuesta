// Catálogo de productos (demo con las imágenes disponibles). Sustituir `href` por las fichas / tienda reales.
const CATS = [
  { id: 'todos', label: 'Todos' },
  { id: 'sillas', label: 'Sillas de trabajo' },
  { id: 'multiuso', label: 'Multiuso y taburetes' },
  { id: 'mesas', label: 'Mesas' },
  { id: 'lounge', label: 'Zonas lounge' },
  { id: 'almacenamiento', label: 'Almacenamiento' },
  { id: 'acustica', label: 'Acústica' },
  { id: 'equipamiento', label: 'Equipamiento' },
  { id: 'repuestos', label: 'Repuestos' },
];
const HM = 'Herman Miller', KN = 'Knoll';
const P = (cat, name, brand, img, type, extra = {}) => ({ cat, name, brand, img, type, href: '#', ...extra });
const PRODUCTS = [
  P('sillas', 'Mirra 2', HM, 'mirra2', 'Silla de trabajo', { star: true }),
  P('sillas', 'Aeron', HM, 'aeron', 'Silla de trabajo'),
  P('sillas', 'Cosm', HM, 'cosm', 'Silla de trabajo'),
  P('sillas', 'Embody', HM, 'embody', 'Silla de trabajo'),
  P('sillas', 'Sayl', HM, 'sayl', 'Silla de trabajo'),
  P('sillas', 'Setu', HM, 'setu', 'Silla de trabajo'),
  P('sillas', 'Verus', HM, 'verus', 'Silla de trabajo'),
  P('sillas', 'KN02 / KN03 Lissoni', KN, 'knoll-lissoni', 'Silla de dirección'),
  P('multiuso', 'Polly', HM, 'cat-multiuso', 'Silla multiuso'),
  P('multiuso', 'Taburetes', 'Otras marcas', 'cat-taburetes', 'Taburetes'),
  P('multiuso', 'Bertoia Side Chair', KN, 'bertoia-side', 'Silla auxiliar'),
  P('multiuso', 'Bertoia Diamond', KN, 'bertoia-diamond', 'Silla / butaca'),
  P('mesas', 'Passport', HM, 'cat-sitstand', 'Mesa de trabajo sit/stand'),
  P('mesas', 'Knot', HM, 'cat-mesas', 'Mesas auxiliares'),
  P('lounge', 'Always Lounge', HM, 'cat-lounge', 'Butaca lounge'),
  P('lounge', 'Pilot', KN, 'knoll-pilot', 'Butaca de respaldo alto'),
  P('lounge', 'Klismos', KN, 'klismos', 'Silla lounge'),
  P('lounge', 'Wilkes Modular', HM, 'wilkes', 'Sofá modular'),
  P('lounge', 'Osaka', 'laCividina', 'osaka', 'Sofá modular'),
  P('almacenamiento', 'Florence Knoll Credenza', KN, 'credenza', 'Credenza'),
  P('almacenamiento', 'Softbox', 'Otras marcas', 'cat-almacenamiento', 'Almacenamiento'),
  P('acustica', 'Cabina acústica', 'Otras marcas', 'cat-acustica', 'Cabina de concentración'),
  P('equipamiento', 'Flo · soporte de monitor', HM, 'cat-equipamiento', 'Brazo de monitor'),
  P('equipamiento', 'Flo · soporte de portátil', HM, 'soporte-portatil', 'Soporte de portátil'),
];
const BRANDS = ['Todas las marcas', ...[...new Set(PRODUCTS.map(p => p.brand))]];

const $ = id => document.getElementById(id);
const state = { cat: 'todos', brand: BRANDS[0], q: '' };
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// chips y select
$('chips').innerHTML = CATS.map(c => `<button class="chip" role="tab" data-cat="${c.id}">${c.label}</button>`).join('');
$('brand').innerHTML = BRANDS.map(b => `<option>${b}</option>`).join('');

const SPECIAL = {
  repuestos: { title: 'Repuestos para sillas', text: 'Recambios originales para tu silla Herman Miller: pídenoslos y te ayudamos a identificar la pieza.' },
  iluminacion: { title: 'Iluminación', text: 'Próximamente en la web. Consúltanos la selección de iluminación disponible.' },
  decoracion: { title: 'Decoración', text: 'Próximamente en la web. Consúltanos la selección de decoración disponible.' },
};

function render() {
  const sp = SPECIAL[state.cat];
  const q = norm(state.q.trim());
  const list = sp ? [] : PRODUCTS.filter(p =>
    (state.cat === 'todos' || p.cat === state.cat) &&
    (state.brand === BRANDS[0] || p.brand === state.brand) &&
    (!q || norm(p.name + ' ' + p.brand + ' ' + p.type).includes(q)));
  document.querySelectorAll('.chip').forEach(c => {
    const on = c.dataset.cat === state.cat;
    c.classList.toggle('on', on); c.setAttribute('aria-selected', on);
  });
  $('grid').innerHTML = list.map(p => `
    <article class="pcard fade in">
      <a class="pcard__img" href="${p.href}"><img src="assets/img/${p.img}.jpg" alt="${p.name}" loading="lazy"><span class="tag">${p.brand}</span>${p.star ? '<span class="tag tag--red">Destacada</span>' : ''}</a>
      <p class="meta">${p.type.toUpperCase()}</p>
      <h3 class="wide">${p.name}</h3>
      <div class="pcard__act"><a class="link" href="${p.href}">Ver ficha</a><a class="link" href="index.html#contacto">Consultar</a></div>
    </article>`).join('');
  const e = $('empty');
  if (sp) {
    e.hidden = false;
    e.querySelector('h2').textContent = sp.title;
    e.querySelector('p').textContent = sp.text;
    $('count').textContent = '';
  } else {
    e.hidden = list.length > 0;
    e.querySelector('h2').textContent = 'No hay resultados';
    e.querySelector('p').textContent = 'Prueba con otra categoría o marca, o cuéntanos qué buscas y te asesoramos.';
    $('count').textContent = list.length + (list.length === 1 ? ' producto' : ' productos');
  }
}

$('chips').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  state.cat = b.dataset.cat; history.replaceState(null, '', state.cat === 'todos' ? 'productos.html' : '#' + state.cat); render();
});
$('brand').addEventListener('change', e => { state.brand = e.target.value; render(); });
$('q').addEventListener('input', e => { state.q = e.target.value; render(); });
document.querySelectorAll('[data-cat="repuestos"]').forEach(a => a.addEventListener('click', e => {
  if (!a.classList.contains('chip')) { state.cat = 'repuestos'; render(); document.querySelector('.catalog').scrollIntoView({ behavior: 'smooth' }); }
}));

function fromHash() {
  const h = location.hash.slice(1);
  state.cat = (CATS.some(c => c.id === h) || SPECIAL[h]) ? h : 'todos';
  render();
}
window.addEventListener('hashchange', fromHash);
fromHash();
