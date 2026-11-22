// Ficha de producto. Datos reales de distritohm.com/tienda en assets/data/products.js (precios sin IVA).
(() => {
  const D = window.DHM_PRODUCTS || {};
  const IVA = 0.21;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const eur = n => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' }).format(n);
  const slug = new URLSearchParams(location.search).get('p') || 'mirra-2';
  const P = D[slug];
  const root = $('#pdp');

  if (!P) {
    document.title = 'Producto no encontrado — Distrito HM';
    root.innerHTML = `<div class="empty"><h1 class="h-md-l">No encontramos este producto</h1><p class="body">Puede que el enlace haya cambiado. Mira el catálogo completo o escríbenos.</p><a class="btn btn--dark" href="productos.html">Ver productos <i>→</i></a></div>`;
    return;
  }

  const vars = P.variations || [];
  const hasVar = vars.length > 0;
  const groups = P.options || [];
  const sel = {};

  // ---------- metadatos ----------
  document.title = `${P.name} ${P.brand} — Distrito HM`;
  $('meta[name=description]').content = `${P.name} de ${P.brand}: ${(P.description[0] || '').slice(0, 140)} Distribuidor oficial MillerKnoll en España.`;
  $('#crumbs').innerHTML = `<a href="index.html">Inicio</a> <span>/</span> <a href="productos.html">Productos</a> <span>/</span> <a href="productos.html#sillas">${esc(P.category)}</a> <span>/</span> ${esc(P.name)}`;
  const ld = { '@context': 'https://schema.org/', '@type': 'Product', name: P.name, sku: P.sku, brand: { '@type': 'Brand', name: P.brand }, category: P.category,
    image: new URL(P.image, location.href).href, description: P.description.join(' '),
    offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: P.price_from, highPrice: P.price_to, offerCount: P.offer_count, url: P.url } };
  const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld); document.head.appendChild(s);

  // ---------- helpers de variaciones ----------
  const match = (v, s2) => groups.every(g => v.attrs[g.key] === s2[g.key]);
  const current = () => vars.find(v => match(v, sel));
  const best = (g, val) => {
    // variación que respeta la opción elegida y conserva el máximo de las demás selecciones
    const cand = vars.filter(v => v.attrs[g.key] === val);
    const score = v => groups.reduce((n, h) => n + (h.key !== g.key && v.attrs[h.key] === sel[h.key] ? 1 : 0), 0);
    return cand.sort((a, b) => score(b) - score(a) || (b.in_stock - a.in_stock) || a.price - b.price)[0];
  };
  const available = (g, val) => vars.some(v => v.attrs[g.key] === val && groups.every(h => h.key === g.key || v.attrs[h.key] === sel[h.key]));
  if (hasVar) {
    const start = [...vars].sort((a, b) => (b.in_stock - a.in_stock) || a.price - b.price)[0];
    groups.forEach(g => (sel[g.key] = start.attrs[g.key]));
  }
  const stockInfo = v => {
    const t = (v.stock || '').toLowerCase();
    let cls = 'order', label = 'Disponible bajo pedido a fábrica';
    if (!v.in_stock) { cls = 'out'; label = 'Producto agotado'; }
    else if (t.includes('entrega preferente')) { cls = 'ok'; const n = v.stock.match(/Solo (\d+) en stock/i); label = 'Entrega preferente (5–7 días)' + (n ? ` · Solo ${n[1]} en stock` : ''); }
    return { cls, label };
  };

  // ---------- render principal ----------
  const optHtml = (g, o) => {
    const on = hasVar && sel[g.key] === o.value;
    const av = !hasVar || available(g, o.value);
    const inner = o.swatch ? `<img src="${esc(o.swatch)}" alt="" width="44" height="44">` : `<span>${esc(o.label)}</span>`;
    const tag = hasVar ? 'button type="button"' : 'span';
    const end = hasVar ? 'button' : 'span';
    return `<${tag} class="opt${o.swatch ? ' opt--sw' : ''}${on ? ' on' : ''}${av ? '' : ' na'}" data-g="${esc(g.key)}" data-v="${esc(o.value)}" title="${esc(o.label)}" ${hasVar ? `role="radio" aria-checked="${on}" aria-label="${esc(g.label)}: ${esc(o.label)}"` : ''}>${inner}</${end}>`;
  };
  const optionsBlock = () => groups.map(g => {
    const cur = hasVar ? (g.options.find(o => o.value === sel[g.key]) || {}).label : '';
    return `<div class="optgroup"><p class="optgroup__label">${esc(g.label)}${hasVar ? `: <b>${esc(cur)}</b>` : ''}</p><div class="opts" ${hasVar ? 'role="radiogroup"' : ''}>${g.options.map(o => optHtml(g, o)).join('')}</div></div>`;
  }).join('');

  const priceHtml = () => {
    if (hasVar) {
      const v = current();
      if (!v) return `<p class="pdp__price-main">Combinación no disponible</p>`;
      return `<p class="pdp__price-main">${eur(v.price)} <small>+ IVA</small></p><p class="pdp__price-sub">Total con IVA ${eur(v.price * (1 + IVA))}</p>`;
    }
    return `<p class="pdp__price-main"><span class="from">Desde</span> ${eur(P.price_from)} <small>+ IVA</small></p><p class="pdp__price-sub">Total desde ${eur(P.price_from * (1 + IVA))} · según configuración hasta ${eur(P.price_to)} + IVA</p>`;
  };
  const shopUrl = () => {
    if (!hasVar) return P.url;
    return P.url + '?' + groups.map(g => `${encodeURIComponent(g.key)}=${encodeURIComponent(sel[g.key])}`).join('&');
  };
  const ctaHtml = () => {
    const v = hasVar ? current() : null;
    const dis = hasVar && (!v || !v.in_stock);
    return `<a class="btn btn--dark pdp__buy${dis ? ' is-off' : ''}" href="${esc(dis ? '#' : shopUrl())}" ${dis ? 'aria-disabled="true"' : 'target="_blank" rel="noopener"'}>${hasVar ? 'Comprar en la tienda' : 'Configurar en la tienda'} <i>→</i></a>
      <a class="btn btn--outline" href="index.html#contacto">Pedir presupuesto</a>`;
  };
  const images = () => {
    const v = hasVar ? current() : null;
    const main = (v && v.img) || P.image;
    return [{ src: main, alt: `${P.name}${v ? '' : ''}` }, ...(P.points_image ? [{ src: P.points_image, alt: `Puntos clave de ${P.name}` }] : [])];
  };

  root.innerHTML = `
    <div class="pdp__gallery">
      <div class="pdp__main"><img id="mainImg" src="${esc(images()[0].src)}" alt="${esc(P.name)}" width="1000" height="1250" fetchpriority="high"></div>
      <div class="pdp__thumbs" id="thumbs"></div>
    </div>
    <div class="pdp__info">
      <p class="eyebrow">${esc(P.brand)} · ${esc(P.category)}</p>
      <h1 class="pdp__title">${esc(P.name)}</h1>
      ${P.designer ? `<p class="pdp__designer">${esc(P.designer)}</p>` : ''}
      <div class="pdp__price" id="price"></div>
      ${P.description[0] ? `<p class="pdp__lead">${esc(P.description[0])}</p>` : ''}
      <div class="pdp__options" id="options"></div>
      <div id="stock"></div>
      ${!hasVar ? `<p class="pdp__hint">Esta silla tiene <b>${esc(P.offer_count)}</b> combinaciones posibles. Elige todas las opciones en la tienda online.</p>` : ''}
      <div class="pdp__cta" id="cta"></div>
      ${P.delivery_note ? `<p class="pdp__note">${esc(P.delivery_note)}.</p>` : ''}
      <ul class="pdp__trust">
        <li><b>Distribuidor oficial</b><span>MillerKnoll en España</span></li>
        <li><b>Showroom en Madrid</b><span>Pruébala antes de decidir</span></li>
        <li><b>SKU ${esc(P.sku)}</b><span>Precios sin IVA (21 %)</span></li>
      </ul>
    </div>`;

  let thumbIdx = 0;
  function paint() {
    const imgs = images();
    $('#price').innerHTML = priceHtml();
    $('#options').innerHTML = optionsBlock();
    $('#cta').innerHTML = ctaHtml();
    const v = hasVar ? current() : null;
    $('#stock').innerHTML = v ? (() => { const i = stockInfo(v); return `<p class="stockchip stockchip--${i.cls}"><i></i>${esc(i.label)}</p>`; })() : '';
    thumbIdx = Math.min(thumbIdx, imgs.length - 1);
    const mi = $('#mainImg'); if (mi.getAttribute('src') !== imgs[thumbIdx].src) mi.src = imgs[thumbIdx].src;
    mi.alt = imgs[thumbIdx].alt;
    $('#thumbs').innerHTML = imgs.length > 1 ? imgs.map((im, i) => `<button type="button" class="thumb${i === thumbIdx ? ' on' : ''}" data-i="${i}" aria-label="Ver imagen ${i + 1}"><img src="${esc(im.src)}" alt="" width="96" height="96"></button>`).join('') : '';
  }
  paint();

  root.addEventListener('click', e => {
    const o = e.target.closest('button.opt');
    if (o && hasVar) {
      const g = groups.find(x => x.key === o.dataset.g);
      const v = best(g, o.dataset.v);
      if (v) { groups.forEach(h => (sel[h.key] = v.attrs[h.key])); thumbIdx = 0; paint(); }
      return;
    }
    const t = e.target.closest('.thumb');
    if (t) { thumbIdx = +t.dataset.i; paint(); return; }
    if (e.target.closest('.pdp__buy.is-off')) e.preventDefault();
  });

  // ---------- detalles ----------
  const det = [];
  const left = [];
  left.push(`<div class="blk"><h2 class="h-md-l">Descripción</h2>${(P.description.length > 1 ? P.description.slice(1) : P.description).map(p => `<p class="body">${esc(p)}</p>`).join('')}${(P.notes || []).map(p => `<p class="body">${esc(p)}</p>`).join('')}${P.color_note ? `<p class="pdp__note">${esc(P.color_note)}.</p>` : ''}</div>`);
  if (P.specs && P.specs.length) left.push(`<div class="blk"><h2 class="h-md-l">Ficha técnica</h2><dl class="specs">${P.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>`);
  if (P.pdfs && P.pdfs.length) left.push(`<div class="blk"><h2 class="h-md-l">Documentación</h2><ul class="docs">${P.pdfs.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener"><span class="docs__ic" aria-hidden="true">PDF</span><b>${esc(t)}</b><i>→</i></a></li>`).join('')}</ul></div>`);
  const right = [];
  if ((P.features && P.features.length) || P.points_image) {
    right.push(`<div class="blk"><h2 class="h-md-l">Puntos clave</h2>${P.points_image ? `<div class="points"><img src="${esc(P.points_image)}" alt="Puntos clave de ${esc(P.name)}" loading="lazy"></div>` : ''}<ol class="feats">${(P.features || []).map(f => `<li><span class="feats__n">${esc(f.n)}</span><div><h3>${esc(f.title)}</h3>${f.text ? `<p>${esc(f.text)}</p>` : ''}</div></li>`).join('')}</ol></div>`);
  }
  const video = P.youtube ? `<div class="blk blk--video"><h2 class="h-md-l">Vídeo</h2><div class="video" id="video" data-id="${esc(P.youtube)}"><button type="button" class="video__play" aria-label="Reproducir vídeo de ${esc(P.name)}"><span></span></button><p>Reproducir vídeo de ${esc(P.name)}<small>Se cargará desde YouTube al pulsar</small></p></div></div>` : '';
  $('#pdpDetails').innerHTML = `<div class="pdp-details__cols"><div>${left.join('')}</div><div>${right.join('')}</div></div>${video}`;
  $('#pdp-details').hidden = false;
  const vb = $('#video');
  if (vb) vb.addEventListener('click', () => {
    vb.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(vb.dataset.id)}?autoplay=1&rel=0" title="Vídeo de ${esc(P.name)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }, { once: true });

  // ---------- relacionados ----------
  const rel = Object.values(D).filter(x => x.slug !== P.slug);
  $('#related').innerHTML = rel.map(x => `
    <article class="pcard fade in"><a class="pcard__img" href="producto.html?p=${esc(x.slug)}"><img src="${esc(x.image)}" alt="${esc(x.name)}" loading="lazy"><span class="tag">${esc(x.brand)}</span></a>
      <p class="meta">${esc(x.category.toUpperCase())}</p><h3 class="wide">${esc(x.name)}</h3>
      <p class="body-sm">Desde ${eur(x.price_from)} + IVA</p>
      <div class="pcard__act"><a class="link" href="producto.html?p=${esc(x.slug)}">Ver ficha</a></div></article>`).join('');
  $('#pdp-related').hidden = false;
})();
