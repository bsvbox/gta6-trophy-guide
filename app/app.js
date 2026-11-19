// Leonida Trophy Guide — tracker + roadmap. All data comes from data/trophies.json;
// progress and settings live only in this browser (localStorage). No network use.
const STORE_KEY = 'leonida-trophy-guide-v1';
const DATA_URL = 'data/trophies.json';

const STAGES = [
  { n: 1, title: 'Play the story', text: 'Chapters 1 to 4, the final mission, and the named missions in between. Do the two partner trophies while your partner is still around.' },
  { n: 2, title: 'Strangers and side missions', text: 'Finish the strands for Andy, Kenton, Billy, Randy and Tyrone, and complete 8 stranger strands in total.' },
  { n: 3, title: 'Activities and skills', text: 'Stunts, the shooting range, races, fishing, arcade games, challenges, robberies and combat moves. Most of it is repeatable, so take your time.' },
  { n: 4, title: 'Collectibles and exploration', text: 'Cards, WAiNK locations, vehicles, meditation spots, the unique animal hunt, and every corner of Leonida.' },
  { n: 5, title: 'Money and properties', text: 'Launder $250,000 of Marked Bills, spend $100,000 in shops, buy every garage, and register 10 vehicles to Scooter Bros.' },
  { n: 6, title: '100% and the platinum', text: 'Clean up whatever is left until the stats screen reads 100%, then the platinum pops on its own.' },
];

const listEl = document.getElementById('trophy-list');
const roadmapEl = document.getElementById('roadmap-list');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const countText = document.getElementById('count-text');
const emptyText = document.getElementById('empty-text');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const hideEarnedEl = document.getElementById('hide-earned');

let trophies = [];
let earned = new Set();
let kindFilter = 'all';
let openId = null;

function loadStore() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
    earned = new Set(Array.isArray(raw.earned) ? raw.earned : []);
    spoilerEl.checked = raw.spoiler === true;
    hideEarnedEl.checked = raw.hideEarned === true;
  } catch {
    earned = new Set();
  }
}

function saveStore() {
  localStorage.setItem(STORE_KEY, JSON.stringify({
    earned: [...earned],
    spoiler: spoilerEl.checked,
    hideEarned: hideEarnedEl.checked,
  }));
}

function isHidden(t) {
  return spoilerEl.checked && t.hidden && !earned.has(t.id);
}

function matches(t) {
  if (kindFilter === 'missable' && !t.missable) return false;
  if (kindFilter === 'online') return false;
  if (kindFilter !== 'all' && kindFilter !== 'missable' && t.kind !== kindFilter) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && earned.has(t.id)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
  return true;
}

function gradeLabel(g) {
  return g === 'platinum' ? 'Platinum' : g === 'gold' ? 'Gold' : g === 'silver' ? 'Silver' : 'Bronze';
}

function renderRoadmap() {
  roadmapEl.replaceChildren();
  for (const s of STAGES) {
    const items = trophies.filter((t) => t.stage === s.n);
    const got = items.filter((t) => earned.has(t.id)).length;
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = 'Stage ' + s.n + ' — ' + s.title;
    const p = document.createElement('p');
    p.textContent = s.text;
    const c = document.createElement('p');
    const strong = document.createElement('span');
    strong.className = 'stage-count';
    strong.textContent = got + ' of ' + items.length + ' earned';
    c.append(strong);
    li.append(h, p, c);
    roadmapEl.append(li);
  }
}

function renderList() {
  listEl.replaceChildren();
  const shown = trophies.filter(matches);
  for (const t of shown) {
    const card = document.createElement('article');
    card.className = 'card' + (earned.has(t.id) ? ' earned' : '');
    card.id = 'trophy-' + t.id;
    const head = document.createElement('div');
    head.className = 'card-head';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
    box.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      saveStore();
      renderAll();
    });
    const title = document.createElement('div');
    title.className = 'card-title';
    const h3 = document.createElement('h3');
    const hidden = isHidden(t);
    h3.textContent = hidden ? 'Hidden trophy' : t.name;
    const desc = document.createElement('p');
    desc.className = 'official';
    desc.textContent = hidden ? 'A story trophy — earn it to reveal its name and description.' : t.description;
    title.append(h3, desc);
    if (t.missable) {
      const flag = document.createElement('span');
      flag.className = 'flag missable';
      flag.textContent = 'Missable';
      title.append(flag);
    }
    if (t.hidden) {
      const flag = document.createElement('span');
      flag.className = 'flag hidden-flag';
      flag.textContent = 'Hidden on PSN';
      title.append(flag);
    }
    const badge = document.createElement('span');
    badge.className = 'badge ' + t.grade;
    badge.textContent = gradeLabel(t.grade);
    head.append(box, title, badge);
    card.append(head);
    if (openId === t.id) {
      const detail = document.createElement('div');
      detail.className = 'detail';
      if (hidden) {
        const p = document.createElement('p');
        p.className = 'spoiler-note';
        p.textContent = 'This guide stays hidden until the trophy is earned (spoiler-safe mode is on).';
        detail.append(p);
      } else {
        const h4 = document.createElement('h4');
        h4.textContent = 'How to get it';
        const p = document.createElement('p');
        p.textContent = t.guide;
        const h4s = document.createElement('h4');
        h4s.textContent = 'Sources';
        const ul = document.createElement('ul');
        ul.className = 'sources';
        for (const s of t.sources || []) {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = s.url;
          a.textContent = s.name;
          a.target = '_blank';
          a.rel = 'noopener';
          li.append(a);
          ul.append(li);
        }
        detail.append(h4, p, h4s, ul);
      }
      card.append(detail);
    }
    card.tabIndex = 0;
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openId = openId === t.id ? null : t.id;
        renderList();
      }
    });
    card.addEventListener('click', () => {
      openId = openId === t.id ? null : t.id;
      renderList();
    });
    listEl.append(card);
  }
  emptyText.hidden = shown.length !== 0;
  countText.textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies'
    + (kindFilter === 'online' ? ' — the game lists no online trophies.' : '');
}

function renderProgress() {
  const pct = trophies.length ? Math.round((earned.size / trophies.length) * 100) : 0;
  progressFill.style.width = pct + '%';
  progressText.textContent = earned.size + ' of ' + trophies.length + ' earned (' + pct + '%)';
}

function renderAll() {
  renderRoadmap();
  renderList();
  renderProgress();
}

function applyHash() {
  const hash = location.hash || '';
  if (hash === '#roadmap') {
    document.getElementById('roadmap').scrollIntoView();
    return;
  }
  const m = hash.match(/^#trophy-(\d+)$/);
  if (m) {
    openId = Number(m[1]);
    renderList();
    const el = document.getElementById('trophy-' + openId);
    if (el) el.scrollIntoView({ block: 'center' });
  }
}

document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    kindFilter = btn.dataset.kind;
    renderList();
  });
});
searchEl.addEventListener('input', renderList);
gradeEl.addEventListener('change', renderList);
spoilerEl.addEventListener('change', () => { saveStore(); renderList(); });
hideEarnedEl.addEventListener('change', () => { saveStore(); renderList(); });

document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned] }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (Array.isArray(ids)) {
      earned = new Set(ids.filter((id) => trophies.some((t) => t.id === id)));
      saveStore();
      renderAll();
    }
  } catch {
    countText.textContent = 'That file could not be read as a progress export.';
  }
  e.target.value = '';
});
window.addEventListener('hashchange', applyHash);

loadStore();
const doc = await (await fetch(DATA_URL)).json();
trophies = doc.trophies || doc;
renderAll();
applyHash();
