/* Рендер дневника из entries.js. Редактировать обычно НЕ нужно. */

document.getElementById('campaign-title').textContent = CAMPAIGN.title;
document.getElementById('campaign-subtitle').textContent = CAMPAIGN.subtitle;
document.getElementById('year').textContent = new Date().getFullYear();

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
}

/* Нормализуем картинку: строка -> объект, проставляем сторону */
function normFigures(images) {
  if (!images || !images.length) return [];
  let sideToggle = 0;
  return images.map(img => {
    const o = (typeof img === 'string') ? { src: img } : { ...img };
    if (!o.full) {
      o.side = (o.side === 'left' || o.side === 'right')
        ? o.side
        : (sideToggle++ % 2 === 0 ? 'right' : 'left');
    }
    return o;
  });
}

function figureHtml(f) {
  const cls = f.full ? 'illus full' : `illus ${f.side}`;
  const cap = f.cap
    ? `<figcaption>${escapeHtml(f.cap)}</figcaption>` : '';
  return `<figure class="${cls}">` +
         `<img src="${escapeHtml(f.src)}" alt="${escapeHtml(f.cap || '')}" loading="lazy">` +
         `${cap}</figure>`;
}

/* Вплетаем иллюстрации между абзацами (книжная вёрстка) */
function renderBody(text, images) {
  const paras = text.split(/\n\n+/);
  const figs = normFigures(images);
  const n = paras.length;
  const m = figs.length;

  // каждой картинке — индекс абзаца, ПЕРЕД которым её вставить
  const slot = figs.map((_, i) => Math.min(n - 1, Math.round(i * n / Math.max(1, m))));

  let html = '';
  for (let p = 0; p < n; p++) {
    figs.forEach((f, i) => { if (slot[i] === p) html += figureHtml(f); });
    html += `<p>${escapeHtml(paras[p]).replace(/\n/g, '<br>')}</p>`;
  }
  // если вдруг слот вышел за пределы — добьём в конец
  figs.forEach((f, i) => { if (slot[i] >= n) html += figureHtml(f); });
  return html;
}

function renderEntry(e) {
  const loc = e.location
    ? `<span class="location">${escapeHtml(e.location)}</span>` : '';
  const date = e.date
    ? `<span class="date">${escapeHtml(e.date)}</span>` : '';
  return `
    <article class="entry">
      <div class="meta">
        <span class="day-badge">День ${e.day}</span>
        ${date}
        ${loc}
      </div>
      <h2>${escapeHtml(e.title)}</h2>
      <div class="text">${renderBody(e.text, e.images)}</div>
    </article>`;
}

/* ===== Отряд ===== */
function renderParty() {
  const el = document.getElementById('party');
  if (!el || typeof PARTY === 'undefined' || !PARTY.length) return;
  const cards = PARTY.map(m => {
    const initial = escapeHtml(m.name.trim().charAt(0));
    const joined = m.joined
      ? `<div class="hero-join">${escapeHtml(m.joined)}</div>` : '';
    return `
      <div class="hero-card">
        <div class="hero-emblem" style="--c:${escapeHtml(m.color || '#7a2f2f')}">${initial}</div>
        <div class="hero-info">
          <div class="hero-name">${escapeHtml(m.name)}</div>
          <div class="hero-class">${escapeHtml(m.cls)}</div>
          <div class="hero-race">${escapeHtml(m.race)}</div>
          ${joined}
        </div>
      </div>`;
  }).join('');
  el.innerHTML = `<h3 class="party-title">Отряд</h3><div class="party-grid">${cards}</div>`;
}
renderParty();

const timeline = document.getElementById('timeline');
if (!ENTRIES.length) {
  timeline.innerHTML = '<div class="empty">Пока ни одной записи. Добавь первую в entries.js.</div>';
} else {
  timeline.innerHTML = ENTRIES.map(renderEntry).join('');
}

/* Лайтбокс: клик по картинке — увеличить */
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');
timeline.addEventListener('click', ev => {
  const img = ev.target.closest('.illus img');
  if (!img) return;
  lightboxImg.src = img.src;
  lightbox.classList.add('open');
});
lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape') lightbox.classList.remove('open');
});
