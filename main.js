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

// ===== Propuesta: pantalla "quiero esta web", aviso de enlaces de ejemplo y enlaces externos =====
const PROPOSAL = {
  email: 'contacto@growth-digital.es',
  phone: '+34 611 93 04 25',
  wa: 'https://wa.me/34611930425?text=' + encodeURIComponent('Vi la propuesta de Distrito HM y la quiero'),
  gmail: 'https://mail.google.com/mail/?view=cm&fs=1&to=contacto@growth-digital.es&su=' + encodeURIComponent('Propuesta web Distrito HM') + '&body=' + encodeURIComponent('Hola, he visto la propuesta de Distrito HM y la quiero.'),
  mail: 'mailto:contacto@growth-digital.es?subject=' + encodeURIComponent('Propuesta web Distrito HM') + '&body=' + encodeURIComponent('Hola, he visto la propuesta de Distrito HM y la quiero.'),
};

const modal = document.createElement('div');
modal.className = 'pmodal';
modal.hidden = true;
modal.innerHTML = `
  <div class="pmodal__bg" data-close></div>
  <div class="pmodal__card" role="dialog" aria-modal="true" aria-labelledby="pmTitle" aria-describedby="pmText" tabindex="-1">
    <button type="button" class="pmodal__x" data-close aria-label="Cerrar"><span></span><span></span></button>
    <p class="eyebrow">Propuesta de diseño web</p>
    <h2 id="pmTitle" class="pmodal__title">¿Te gusta esta web?</h2>
    <p id="pmText" class="pmodal__text">Esto es una <b>propuesta</b> de Growth Digital: la tienda y las compras no están activas. Si quieres esta web para Distrito HM, escríbenos a <a href="${PROPOSAL.mail}">${PROPOSAL.email}</a> o por WhatsApp.</p>
    <div class="pmodal__actions">
      <a class="btn pmodal__wa" href="${PROPOSAL.wa}" target="_blank" rel="noopener">
        <svg viewBox="0 0 32 32" width="20" height="20" aria-hidden="true"><path d="M16 4a12 12 0 0 0-10.3 18.1L4 28l6.1-1.6A12 12 0 1 0 16 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 11c0 5 4 9 9 9l1.5-2.5-3-1.5-1.2 1.2a6 6 0 0 1-3-3l1.2-1.2L15 9.5 12 11z" fill="currentColor"/></svg>
        Escribir por WhatsApp</a>
      <button type="button" class="btn btn--outline" id="pmMail">Enviar un email</button>
    </div>
    <p class="pmodal__fallback" id="pmFallback" hidden role="status"></p>
    <p class="pmodal__meta">¿No se abre tu correo? <a href="${PROPOSAL.gmail}" target="_blank" rel="noopener">Abrir Gmail</a> · <button type="button" class="pmodal__copy" id="pmCopy">Copiar email</button></p>
    <p class="pmodal__meta pmodal__meta--2">WhatsApp ${PROPOSAL.phone}</p>
    <button type="button" class="pmodal__back" data-close>Seguir viendo la web</button>
  </div>`;
document.body.appendChild(modal);

const toast = document.createElement('div');
toast.className = 'ptoast';
toast.setAttribute('role', 'status');
toast.setAttribute('aria-live', 'polite');
document.body.appendChild(toast);
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('on'), 3200);
}

async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (_) {}
  const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0';
  document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} ta.remove(); return ok;
}
const pmFallback = modal.querySelector('#pmFallback');
const pmCopy = modal.querySelector('#pmCopy');
modal.querySelector('#pmMail').addEventListener('click', () => {
  let opened = false; const seen = () => { opened = true; };
  window.addEventListener('blur', seen, { once: true });
  document.addEventListener('visibilitychange', seen, { once: true });
  window.addEventListener('pagehide', seen, { once: true });
  window.location.href = PROPOSAL.mail;
  setTimeout(async () => {
    window.removeEventListener('blur', seen); document.removeEventListener('visibilitychange', seen); window.removeEventListener('pagehide', seen);
    if (opened) return;
    const ok = await copyText(PROPOSAL.email);
    pmFallback.hidden = false;
    pmFallback.textContent = ok ? `No se abrió tu correo. Copiamos ${PROPOSAL.email}: pégalo en tu app de correo.` : `No se abrió tu correo. Escríbenos a ${PROPOSAL.email}.`;
  }, 1200);
});
pmCopy.addEventListener('click', async () => {
  const ok = await copyText(PROPOSAL.email);
  pmCopy.textContent = ok ? '¡Copiado!' : PROPOSAL.email;
  setTimeout(() => { pmCopy.textContent = 'Copiar email'; }, 2200);
});

let lastFocus = null;
function openModal(trigger) {
  lastFocus = trigger || document.activeElement;
  modal.hidden = false;
  document.documentElement.classList.add('pm-open');
  requestAnimationFrame(() => { modal.classList.add('on'); modal.querySelector('.pmodal__card').focus(); });
}
function closeModal() {
  modal.classList.remove('on');
  document.documentElement.classList.remove('pm-open');
  setTimeout(() => { modal.hidden = true; }, 220);
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
document.addEventListener('keydown', e => {
  if (modal.hidden) return;
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key === 'Tab') {
    const f = [...modal.querySelectorAll('a[href],button')].filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === modal.querySelector('.pmodal__card'))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

document.addEventListener('click', e => {
  if (e.target.closest('[data-close]')) { closeModal(); return; }
  const a = e.target.closest('a');
  if (!a) return;
  if (a.closest('.pmodal')) return;
  // acciones de compra -> pantalla de propuesta
  if (a.hasAttribute('data-proposal')) { e.preventDefault(); openModal(a); return; }
  const href = a.getAttribute('href') || '';
  // Todo enlace sin destino dentro de la propuesta (vacío, "#" o hacia el sitio original / redes) abre la pantalla de contacto
  if (href === '' || href === '#') { e.preventDefault(); openModal(a); return; }
  if (/^https?:/i.test(href)) {
    let u; try { u = new URL(href); } catch (_) { u = null; }
    const isDoc = u && /\.pdf$/i.test(u.pathname);
    if (u && u.host !== location.host && !isDoc && !/(^|\.)wa\.me$/.test(u.host)) { e.preventDefault(); openModal(a); return; }
  }
});

// El formulario no envía nada en la propuesta: abre la pantalla de contacto
const form = document.getElementById('form');
if (form) form.addEventListener('submit', e => { e.preventDefault(); openModal(form.querySelector('button[type=submit]')); });
