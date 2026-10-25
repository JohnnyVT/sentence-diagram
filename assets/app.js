/* 句構圖解學習路徑 — 對外原型的頁面邏輯。
 * index.html：學習路徑；unit.html?u=<key>：單一單元（概念講解 → 練習）。
 * 圖解交給 diagram-engine；這裡只做宿主該做的事：字卡區、按鈕、桶子、進度。
 */
import { createDiagram, tokensFromTree } from './diagram-engine.js';
import { UNITS, BUCKETS, unitByKey } from './content.js';

const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v != null) n.setAttribute(k, v);
  }
  for (const k of kids.flat()) if (k != null) n.append(k);
  return n;
};
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- 進度：只存在這台瀏覽器，讀不到就當沒做過 ---------- */
const STORE = 'sdp-progress-v1';
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; }
}
function markSolved(key, i) {
  const p = loadProgress();
  p[key] = [...new Set([...(p[key] || []), i])];
  try { localStorage.setItem(STORE, JSON.stringify(p)); } catch { /* 私密視窗等情況：不存也能用 */ }
}

const unitHref = (u) => `unit.html?u=${encodeURIComponent(u.key)}`;
const unitDesc = (u) => u.concept.lead;

/* ================================================================ 首頁 */
function renderIndex() {
  const list = $('#path');
  const progress = loadProgress();
  let group = null;
  for (const u of UNITS) {
    if (u.group !== group) { group = u.group; list.append(el('li', { class: 'group-label', 'aria-hidden': 'true' }, group)); }
    const solved = (progress[u.key] || []).length;
    const total = u.items.length;
    const done = total > 0 && solved >= total;
    const dotText = u.key === 'pos' ? '起' : u.key.toUpperCase();
    list.append(el('li', { class: 'node' + (done ? ' done' : '') + (u.mode === 'other' ? ' morph' : '') },
      el('span', { class: 'dot', 'aria-hidden': 'true' }, done ? '✓' : dotText),
      el('a', { class: 'card', href: unitHref(u) },
        el('span', { class: 'nm' }, `${u.label}　${u.name}`),
        total ? el('span', { class: 'pg' }, `${solved}/${total}`) : el('span', { class: 'pg' }, '另一種練習'),
        el('span', { class: 'ds' }, unitDesc(u)))));
  }
}

/* ================================================================ 單元頁 */
function renderUnit() {
  const key = new URLSearchParams(location.search).get('u');
  const unit = unitByKey(key);
  if (!unit) { location.replace('index.html'); return; }
  const idx = UNITS.indexOf(unit);
  document.title = `${unit.label} ${unit.name}｜句構圖解`;

  $('#kicker').textContent = unit.label;
  $('#title').append(unit.name, el('span', { class: 'tag' }, unit.group));
  $('#lede').textContent = unit.concept.lead;

  /* 概念講解 */
  const c = $('#concept-body');
  unit.concept.body.forEach((p) => c.append(el('p', {}, p)));
  if (unit.concept.points?.length) c.append(el('ul', { class: 'points' }, unit.concept.points.map((p) => el('li', {}, p))));
  if (unit.concept.demo) {
    const d = unit.concept.demo;
    const stage = el('div', { class: 'stage' });
    c.append(el('figure', { class: 'demo' },
      el('p', { class: 'en' }, d.en), stage, el('figcaption', {}, d.caption)));
    createDiagram(stage, { tree: d.tree, tokens: [] });
  }

  /* 練習 */
  if (!unit.items.length) {
    $('#practice-head').textContent = '練習';
    $('#practice').append(el('p', { class: 'morph-note' }, '這一關是動詞形狀的練習，不用圖解。原型還沒做這種練習，先保留位置讓路徑完整——下一關回到圖解。'));
  } else {
    $('#practice-head').textContent = `練習 · ${unit.items.length} 題`;
    mountPractice(unit);
  }

  /* 上一單元／下一單元 */
  const pager = $('#pager');
  const prev = UNITS[idx - 1], next = UNITS[idx + 1];
  pager.append(prev ? el('a', { class: 'prev', href: unitHref(prev) }, el('small', {}, '← 上一單元'), `${prev.label} ${prev.name}`) : el('span'));
  pager.append(next ? el('a', { class: 'next', href: unitHref(next) }, el('small', {}, '下一單元 →'), `${next.label} ${next.name}`)
    : el('a', { class: 'next', href: 'index.html' }, el('small', {}, '走完了 →'), '回學習路徑'));
}

/* ---------------------------------------------------------------- 練習區 */
function mountPractice(unit) {
  const root = $('#practice');
  const steps = el('div', { class: 'steps', role: 'tablist', 'aria-label': '題目' });
  const explain = el('div', { class: 'explain' });
  const prompt = el('div', { class: 'prompt' });
  const work = el('div');
  const bankCount = el('span');
  const bank = el('div', { class: 'bank' });
  const bankWrap = el('div', {}, el('div', { class: 'bank-head' }, el('span', {}, '字卡'), bankCount), bank);
  const verdict = el('div', { class: 'verdict', hidden: '' });
  const btnCheck = el('button', { class: 'btn primary', type: 'button' }, '檢查');
  const btnHint = el('button', { class: 'btn', type: 'button' }, '給一個提示');
  const btnReset = el('button', { class: 'btn ghost', type: 'button' }, '重來');
  const btnNext = el('button', { class: 'btn ghost', type: 'button' }, '下一題 →');
  root.append(steps, explain, prompt, work, bankWrap, el('div', { class: 'controls' }, btnCheck, btnHint, btnReset, btnNext), verdict);

  const solved = new Set(loadProgress()[unit.key] || []);
  let cur = 0;
  let ctl = null;   // 目前這題的控制器：diagram 或 bucket

  function renderSteps() {
    steps.replaceChildren(el('span', { class: 'lab' }, '題'));
    unit.items.forEach((_, i) => {
      const b = el('button', { type: 'button', role: 'tab', 'aria-selected': String(i === cur), onclick: () => load(i) }, String(i + 1));
      if (i === cur) b.setAttribute('aria-current', 'true');
      if (solved.has(i)) b.classList.add('done');
      steps.append(b);
    });
  }

  function showVerdict(passed, wrongLines, item) {
    verdict.hidden = false;
    if (passed) {
      verdict.className = 'verdict good';
      verdict.replaceChildren(el('h3', {}, '對了'), el('p', { class: 'en' }, item.en), el('p', {}, item.after || item.zh));
      solved.add(cur); markSolved(unit.key, cur); renderSteps();
    } else {
      verdict.className = 'verdict bad';
      verdict.replaceChildren(el('h3', {}, `還有 ${wrongLines.length} 個地方要改`),
        el('ul', {}, wrongLines.map((t) => el('li', { html: t }))),
        el('p', {}, '自己找找看是哪裡——答案沒有給你。'));
    }
  }
  const hideVerdict = () => { verdict.hidden = true; };

  function load(i) {
    cur = i; hideVerdict();
    ctl?.destroy?.(); ctl = null;
    const item = unit.items[i];
    explain.replaceChildren(el('span', { class: 'lab' }, '這題在練什麼'), el('p', {}, item.intro));
    prompt.replaceChildren(el('p', { class: 'en' }, item.en), el('p', { class: 'zh' }, item.zh), el('p', { class: 'task' }, item.task));
    work.replaceChildren();
    ctl = unit.mode === 'bucket' ? bucketPractice(item) : diagramPractice(item);
    renderSteps();
  }

  /* ---- 圖解題 ---- */
  function diagramPractice(item) {
    const stage = el('div', { class: 'stage' });
    work.append(stage);
    const dg = createDiagram(stage, {
      tree: item.tree,
      tokens: shuffle(tokensFromTree(item.tree)),
      onChange: () => { hideVerdict(); renderBank(); },
    });
    function renderBank() {
      const armed = dg.getArmed();
      const free = dg.freeTokens();
      bankWrap.hidden = dg.getTokens().length === 0;
      bankCount.textContent = free.length ? `剩 ${free.length} 張` : '全部放完了';
      bank.replaceChildren(...free.map((t) => {
        const b = el('button', { class: 'tile', type: 'button', draggable: 'true', 'aria-pressed': String(armed === t.id) }, t.text);
        b.addEventListener('click', () => { dg.setArmed(armed === t.id ? null : t.id); renderBank(); });
        b.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', t.id); dg.setArmed(t.id); });
        b.addEventListener('dragend', () => { dg.setArmed(null); renderBank(); });
        return b;
      }));
    }
    renderBank();
    return {
      check() {
        const g = dg.grade({ mark: true });
        const lines = g.slots.filter((r) => !r.correct).map((r) => {
          if (r.status === 'empty') return `<strong>${r.role}</strong>還是空的`;
          if (r.understood) return `<strong>${r.role}</strong>填了 <span class="en">${escapeHtml(r.typed)}</span>——想想省略的是哪個字`;
          return `<strong>${r.role}</strong>放了 <span class="en">${escapeHtml(r.text)}</span>——它在這句話裡不是這個角色`;
        });
        showVerdict(g.passed, lines, item);
      },
      hint() { dg.hint(); },
      reset() { dg.setTokens(shuffle(dg.getTokens())); dg.reset(); },
      destroy() { dg.destroy(); },
    };
  }

  /* ---- 桶子題（詞性） ---- */
  function bucketPractice(item) {
    let tokens = shuffle(item.words.map(([text, bucket], i) => ({ id: 't' + i, text, bucket, at: null })));
    let armed = null, checked = false;
    const grid = el('div', { class: 'buckets' });
    work.append(grid);
    function place(tid, bid) {
      const t = tokens.find((x) => x.id === tid);
      if (t) t.at = bid;
      armed = null; checked = false; hideVerdict(); render();
    }
    function render() {
      grid.replaceChildren(...BUCKETS.map((bk) => {
        const drop = el('div', { class: 'drop' });
        tokens.filter((t) => t.at === bk.id).forEach((t) => {
          const chip = el('button', { class: 'tile' + (checked ? (t.bucket === bk.id ? ' ok' : ' bad') : ''), type: 'button', 'aria-label': `${t.text}，點一下取回` }, t.text);
          chip.addEventListener('click', (e) => { e.stopPropagation(); place(t.id, null); });
          drop.append(chip);
        });
        const box = el('div', { class: 'bucket' + (armed ? ' armed' : ''), role: 'button', tabindex: '0', 'aria-label': `${bk.label} 桶` },
          el('h3', {}, bk.label), el('p', { class: 'eg' }, bk.eg), drop);
        const drop2 = () => { if (armed) place(armed, bk.id); };
        box.addEventListener('click', drop2);
        box.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drop2(); } });
        box.addEventListener('dragover', (e) => { e.preventDefault(); box.classList.add('over'); });
        box.addEventListener('dragleave', () => box.classList.remove('over'));
        box.addEventListener('drop', (e) => { e.preventDefault(); box.classList.remove('over'); const id = e.dataTransfer.getData('text/plain'); if (id) place(id, bk.id); });
        return box;
      }));
      const free = tokens.filter((t) => !t.at);
      bankWrap.hidden = false;
      bankCount.textContent = free.length ? `剩 ${free.length} 張` : '全部放完了';
      bank.replaceChildren(...free.map((t) => {
        const b = el('button', { class: 'tile', type: 'button', draggable: 'true', 'aria-pressed': String(armed === t.id) }, t.text);
        b.addEventListener('click', () => { armed = armed === t.id ? null : t.id; render(); });
        b.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', t.id); armed = t.id; });
        b.addEventListener('dragend', () => { armed = null; render(); });
        return b;
      }));
    }
    render();
    return {
      check() {
        checked = true;
        const lines = tokens.filter((t) => t.at !== t.bucket).map((t) => t.at
          ? `<span class="en">${escapeHtml(t.text)}</span> 放錯桶了`
          : `<span class="en">${escapeHtml(t.text)}</span> 還沒放`);
        render();
        showVerdict(!lines.length, lines, item);
      },
      hint() {
        const t = tokens.find((x) => x.at !== x.bucket);
        if (t) place(t.id, t.bucket);
      },
      reset() { tokens = shuffle(tokens.map((t) => ({ ...t, at: null }))); armed = null; checked = false; hideVerdict(); render(); },
      destroy() { grid.remove(); },
    };
  }

  btnCheck.addEventListener('click', () => ctl?.check());
  btnHint.addEventListener('click', () => ctl?.hint());
  btnReset.addEventListener('click', () => ctl?.reset());
  btnNext.addEventListener('click', () => load((cur + 1) % unit.items.length));
  load(0);
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

if (document.body.dataset.page === 'index') renderIndex();
if (document.body.dataset.page === 'unit') renderUnit();
