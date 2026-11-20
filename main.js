// Menú móvil
const burger = document.getElementById('burger');
const links = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
links.addEventListener('click', e => {
  if (e.target.tagName === 'A') { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); }
});

// Reveal al hacer scroll
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
document.querySelectorAll('.card,.post,.feat__card,.review,.cat,.way').forEach(el => { el.classList.add('fade'); io.observe(el); });

// Carrusel de productos
const cards = document.getElementById('cards');
if (cards) document.querySelectorAll('.circle').forEach(b => b.addEventListener('click', () => {
  cards.scrollBy({ left: b.dataset.dir * (cards.firstElementChild.offsetWidth + 32), behavior: 'smooth' });
}));

// Formulario (demo: conectar a backend / servicio de formularios)
const form = document.getElementById('form');
if (form) form.addEventListener('submit', e => {
  e.preventDefault();
  if (!e.target.checkValidity()) { e.target.reportValidity(); return; }
  document.getElementById('formOk').hidden = false;
  e.target.reset();
});
