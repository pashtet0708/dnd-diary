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

/* ===== Иконки классов (SVG, золотой контур) ===== */
const CLASS_ICONS = {
  "Инженер":
    `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15z"/>`,
  "Колдун":
    `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`,
  "Следопыт":
    `<path d="M7 4a11 11 0 0 1 0 16"/><path d="M7 4v16"/><path d="M5 12h15"/><path d="M17 9l3 3-3 3"/>`,
  "Паладин":
    `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v7"/><path d="M9 11h6"/>`,
  "Жрец":
    `<circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v2.5M12 20v2.5M3.5 3.5l1.8 1.8M18.7 18.7l1.8 1.8M1.5 12h2.5M20 12h2.5M3.5 20.5l1.8-1.8M18.7 5.3l1.8-1.8"/>`,
  "Волшебница":
    `<path d="M12 2.5l1.6 6.3 6.3 1.6-6.3 1.6L12 18.3l-1.6-6.3L4.1 10.4l6.3-1.6z"/><path d="M18.5 3.5l.5 1.8 1.8.5-1.8.5-.5 1.8-.5-1.8-1.8-.5 1.8-.5z"/>`,
};
function classIcon(cls) {
  const inner = CLASS_ICONS[cls] || `<path d="M12 3l9 9-9 9-9-9z"/>`;
  return `<svg class="cls-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
         `stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
         `${inner}</svg>`;
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
        <div class="hero-icon" title="${escapeHtml(m.cls)}">${classIcon(m.cls)}</div>
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
