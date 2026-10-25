/* @vt/diagram-engine v0.1.1 — 直角句構圖解引擎
 *
 * 輸入：樹 JSON（寫法見 README）＋ 填放狀態 → 輸出 DOM。事件：place / typed。
 * 純巢狀 DOM／CSS：無 SVG、無座標、無外部依賴。
 *
 * 記號約束（不可違反）：
 *   ‖ 只出現在主詞／述語之間；其餘位置用 |；修飾語垂直往下掛；省略字用括號讓學生打字。
 *
 * 匯出：
 *   createDiagram(container, options) → controller
 *   collectSlots / validateTree / tokensFromTree / gradeState / nextHint / norm  （純函式，可在 Node 測）
 */

export const VERSION = '0.1.1';

/** 子句六個位置，渲染與走訪順序皆照此（io 掛在 v 正下方，不站骨幹）。 */
export const POSITIONS = ['s', 'v', 'io', 'o', 'sc', 'oc'];
const POS_RANK = Object.fromEntries(POSITIONS.map((p, i) => [p, i]));

/** 判分用正規化：忽略大小寫與句末標點。 */
export function norm(s) {
  return String(s ?? '').toLowerCase().replace(/[.,!?;:]/g, '').trim();
}

/** 節點型別：passage | compound | clause | phrase | pp | conj | leaf */
export function kindOf(n) {
  if (!n || typeof n !== 'object') return null;
  if (n.passage) return 'passage';
  if (n.compound) return 'compound';
  if (n.clause) return 'clause';
  if (n.phrase) return 'phrase';
  if (n.pp) return 'pp';
  if (n.conj) return 'conj';
  return 'leaf';
}

/** leaf 節點是不是空格：`slot` 省略時視為 true；`slot:false` 是灰色給定字。 */
export function isSlot(n) {
  return n.slot !== false;
}

/* ------------------------------------------------------------------ */
/* 走訪                                                                 */
/* ------------------------------------------------------------------ */

/**
 * 走訪樹，收集所有空格（slot）。不改動輸入樹。
 * 回傳陣列，每項：{ id, node, role, expected, understood, depth, pos, path, order }
 *   id        node.id 若有，否則依走訪順序 s0, s1, …
 *   depth     從根算的掛載深度（骨幹 0，掛在下面的修飾語 1，修飾語的修飾語 2…；子句掛下去其位置同深度）
 *   pos       所屬子句位置 s/v/io/o/sc/oc；conj 為 'conj'；修飾語為 null
 */
export function collectSlots(tree) {
  const out = [];
  const walk = (n, depth, pos, path) => {
    switch (kindOf(n)) {
      case 'passage':
      case 'compound':
        n.parts.forEach((p, i) => walk(p, depth, null, `${path}.parts[${i}]`));
        return;
      case 'conj':
        walk(n.conj, depth, 'conj', `${path}.conj`);
        return;
      case 'clause':
        POSITIONS.forEach((k) => { if (n[k]) walk(n[k], depth, k, `${path}.${k}`); });
        return;
      case 'phrase':
        n.parts.forEach((p, i) => walk(p, depth, pos, `${path}.parts[${i}]`));
        return;
      case 'pp':
        walk(n.p, depth, pos, `${path}.p`);
        walk(n.o, depth, pos, `${path}.o`);
        return;
      case 'leaf': {
        if (isSlot(n)) {
          out.push({
            id: n.id || `s${out.length}`,
            node: n,
            role: n.role || '',
            expected: n.w,
            understood: !!n.understood,
            depth, pos, path,
            order: out.length,
          });
        }
        (n.mods || []).forEach((m, i) => walk(m, depth + 1, null, `${path}.mods[${i}]`));
        return;
      }
      default:
        return;
    }
  };
  walk(tree, 0, null, '$');
  return out;
}

/** 提示與回饋的優先順序：淺的先（骨幹優先）、同深度照 s→v→io→o→sc→oc、再照走訪序。 */
export function hintOrder(slots) {
  const rank = (p) => (p in POS_RANK ? POS_RANK[p] : 99);
  return [...slots].sort((a, b) => a.depth - b.depth || rank(a.pos) - rank(b.pos) || a.order - b.order);
}

/* ------------------------------------------------------------------ */
/* 驗證                                                                 */
/* ------------------------------------------------------------------ */

/**
 * 驗證樹 JSON。回傳 [{ level:'error'|'warn', path, message }]，空陣列＝合格。
 * error：結構不對，引擎拒收。warn：能畫，但內容品質有疑慮（例如空格沒有 role）。
 */
export function validateTree(tree) {
  const out = [];
  const ids = new Set();
  const error = (path, message) => out.push({ level: 'error', path, message });
  const warn = (path, message) => out.push({ level: 'warn', path, message });

  const leaf = (n, path) => {
    if (typeof n.w !== 'string' || !n.w.trim()) error(path, 'leaf 節點需要非空字串 w');
    if ('slot' in n && typeof n.slot !== 'boolean') error(path, 'slot 必須是 boolean');
    if (n.understood && n.slot === false) error(path, '省略字（understood）必須是空格，不能 slot:false');
    if (n.id != null) {
      if (typeof n.id !== 'string' || !n.id) error(path, 'id 必須是非空字串');
      else if (ids.has(n.id)) error(path, `id 重複：${n.id}`);
      else ids.add(n.id);
    }
    if (isSlot(n) && !n.role) warn(path, '空格沒有 role，學生會看到空白格');
    if (n.mods != null) {
      if (!Array.isArray(n.mods)) error(path, 'mods 必須是陣列');
      else n.mods.forEach((m, i) => mod(m, `${path}.mods[${i}]`));
    }
  };
  const mod = (m, path) => {
    const k = kindOf(m);
    if (k === 'leaf') leaf(m, path);
    else if (k === 'pp') pp(m, path);
    else if (k === 'phrase') phrase(m, path);
    else if (k === 'clause') clause(m, path);
    else error(path, `修飾語只能是 Node / PP / Phrase / Clause，收到 ${k}`);
  };
  const pp = (n, path) => {
    if (!n.p) error(path, 'PP 需要 p（介係詞）'); else leaf(n.p, `${path}.p`);
    if (!n.o) error(path, 'PP 需要 o（介詞受詞）'); else leaf(n.o, `${path}.o`);
  };
  const phrase = (n, path) => {
    if (!Array.isArray(n.parts) || !n.parts.length) { error(path, 'Phrase 需要非空 parts'); return; }
    n.parts.forEach((p, i) => leaf(p, `${path}.parts[${i}]`));
  };
  const position = (n, path) => {
    const k = kindOf(n);
    if (k === 'leaf') leaf(n, path);
    else if (k === 'phrase') phrase(n, path);
    else if (k === 'clause') clause(n, path);
    else error(path, `子句位置只能放 Node / Phrase / Clause，收到 ${k}`);
  };
  const clause = (n, path) => {
    if (!n.s) error(path, '子句需要 s（主詞）');
    if (!n.v) error(path, '子句需要 v（述語）');
    Object.keys(n).forEach((k) => {
      if (!['clause', 'role', 'id', ...POSITIONS].includes(k)) warn(`${path}.${k}`, `子句上不認識的欄位 ${k}，會被忽略`);
    });
    POSITIONS.forEach((k) => { if (n[k]) position(n[k], `${path}.${k}`); });
  };
  const top = (n, path) => {
    const k = kindOf(n);
    if (k === 'clause') clause(n, path);
    else if (k === 'compound') {
      if (!Array.isArray(n.parts) || !n.parts.length) { error(path, 'Compound 需要非空 parts'); return; }
      n.parts.forEach((p, i) => {
        const pk = kindOf(p);
        if (pk === 'clause') clause(p, `${path}.parts[${i}]`);
        else if (pk === 'conj') leaf(p.conj, `${path}.parts[${i}].conj`);
        else error(`${path}.parts[${i}]`, `Compound 的 parts 只能是 Clause 或 {conj}，收到 ${pk}`);
      });
    } else if (k === 'passage') {
      if (!Array.isArray(n.parts) || !n.parts.length) { error(path, 'Passage 需要非空 parts'); return; }
      n.parts.forEach((p, i) => {
        const pk = kindOf(p);
        if (pk === 'clause' || pk === 'compound') top(p, `${path}.parts[${i}]`);
        else error(`${path}.parts[${i}]`, `Passage 的 parts 只能是 Clause 或 Compound，收到 ${pk}`);
      });
    } else error(path, `樹的根必須是 Clause / Compound / Passage，收到 ${k}`);
  };

  top(tree, '$');
  return out;
}

/* ------------------------------------------------------------------ */
/* 字卡、判分、提示（純函式）                                             */
/* ------------------------------------------------------------------ */

/**
 * 從樹產生字卡：每個非省略字的空格一張，文字＝節點 w（所以 `have-seen` 會是一張連字號卡）。
 * 預設照閱讀順序；UI 要打亂自己傳 shuffle:true。
 */
export function tokensFromTree(tree, { shuffle = false, prefix = 't' } = {}) {
  const list = collectSlots(tree)
    .filter((s) => !s.understood)
    .map((s, i) => ({ id: `${prefix}${i}`, text: s.expected }));
  if (shuffle) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
  }
  return list;
}

/**
 * 判分。state = { placed: {slotId: tokenId}, typed: {slotId: string} }
 * 回傳 { passed, wrongCount, slots:[{ slotId, role, expected, understood, status:'empty'|'wrong'|'correct', correct, tokenId?, text?, typed? }] }
 * 比對用文字（norm）而非 token id：句子裡兩個 the 可以互換。
 */
export function gradeState(tree, tokens, state) {
  const tok = new Map((tokens || []).map((t) => [t.id, t]));
  const placed = state?.placed || {};
  const typed = state?.typed || {};
  const rows = collectSlots(tree).map((s) => {
    if (s.understood) {
      const v = typed[s.id] ?? '';
      const status = !norm(v) ? 'empty' : norm(v) === norm(s.expected) ? 'correct' : 'wrong';
      return { slotId: s.id, role: s.role, expected: s.expected, understood: true, typed: v, status, correct: status === 'correct' };
    }
    const tokenId = placed[s.id] ?? null;
    const text = tokenId != null ? (tok.get(tokenId)?.text ?? '') : '';
    const status = tokenId == null ? 'empty' : norm(text) === norm(s.expected) ? 'correct' : 'wrong';
    return { slotId: s.id, role: s.role, expected: s.expected, understood: false, tokenId, text, status, correct: status === 'correct' };
  });
  const wrongCount = rows.filter((r) => !r.correct).length;
  return { passed: wrongCount === 0, wrongCount, slots: rows };
}

/**
 * 算出下一個提示（不套用）。骨幹優先。
 * 回傳 { type:'place', slotId, tokenId } | { type:'typed', slotId, value } | null（全對或無可用字卡）
 */
export function nextHint(tree, tokens, state) {
  const g = gradeState(tree, tokens, state);
  const bad = new Set(g.slots.filter((r) => !r.correct).map((r) => r.slotId));
  if (!bad.size) return null;
  const used = new Set(Object.values(state?.placed || {}));
  for (const s of hintOrder(collectSlots(tree))) {
    if (!bad.has(s.id)) continue;
    if (s.understood) return { type: 'typed', slotId: s.id, value: s.expected };
    const match = (t) => norm(t.text) === norm(s.expected);
    const tok = (tokens || []).find((t) => !used.has(t.id) && match(t)) || (tokens || []).find(match);
    if (tok) return { type: 'place', slotId: s.id, tokenId: tok.id };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* DOM 引擎                                                              */
/* ------------------------------------------------------------------ */

const DEFAULT_LABELS = {
  emptyAria: (role) => `${role} 空格`,
  filledAria: (role, text) => `${role}：已放入 ${text}，點一下取回`,
  understoodAria: (role) => `${role}（省略字，自己打）`,
  placeholder: '?',
};

/**
 * createDiagram(container, options)
 *
 * options:
 *   tree      必填。樹 JSON（寫法見 README）。建立時會 validateTree，有 error 直接 throw。
 *   tokens    字卡 [{id, text}]。省略＝tokensFromTree(tree)（閱讀順序，不打亂）。
 *   state     初始 { placed, typed }。
 *   checked   是否顯示對錯標記（預設 false）。任何填放／打字都會把它關掉，要再顯示請重呼叫 setChecked(true)。
 *   armed     目前「拿在手上」的 tokenId；有值時點任何空格＝放進去。
 *   onPlace(ev) / onTyped(ev) / onChange(ev)   事件；ev.state 永遠是最新狀態。
 *   labels    無障礙文案覆寫（見 DEFAULT_LABELS）。
 *
 * 拖放：空格接受 drop，讀 dataTransfer 的 'text/plain' 當 tokenId。字卡那端由 UI 自己 setData。
 */
export function createDiagram(container, options = {}) {
  const root = typeof container === 'string' ? document.querySelector(container) : container;
  if (!root) throw new Error('createDiagram：找不到 container');
  const { tree } = options;
  const problems = validateTree(tree).filter((p) => p.level === 'error');
  if (problems.length) {
    throw new Error('createDiagram：樹 JSON 不合格\n' + problems.map((p) => `  ${p.path}: ${p.message}`).join('\n'));
  }

  const labels = { ...DEFAULT_LABELS, ...(options.labels || {}) };
  const slots = collectSlots(tree);
  const byId = new Map(slots.map((s) => [s.id, s]));
  const byNode = new Map(slots.map((s) => [s.node, s]));

  let tokens = new Map();
  const placed = new Map();   // slotId -> tokenId
  const typed = new Map();    // slotId -> string
  let checked = !!options.checked;
  let armed = options.armed ?? null;
  let destroyed = false;

  const el = (tag, cls) => { const d = document.createElement(tag); if (cls) d.className = cls; return d; };
  const span = (cls, text) => { const s = el('span', cls); s.textContent = text; return s; };

  function getState() {
    return { placed: Object.fromEntries(placed), typed: Object.fromEntries(typed) };
  }
  function emit(ev) {
    ev.state = getState();
    ev.armed = armed;
    if (ev.type === 'place') options.onPlace?.(ev);
    if (ev.type === 'typed') options.onTyped?.(ev);
    options.onChange?.(ev);
    return ev;
  }
  function clearMarks() {
    if (!checked) return;
    checked = false;
    root.querySelectorAll('.dg-ok,.dg-bad').forEach((n) => n.classList.remove('dg-ok', 'dg-bad'));
  }

  /* ---- 狀態操作 ---- */
  function setTokens(list) {
    tokens = new Map((list || []).map((t) => [t.id, t]));
    for (const [sid, tid] of placed) if (!tokens.has(tid)) placed.delete(sid);
  }
  function setState(state = {}) {
    if (state.placed) {
      placed.clear();
      const seen = new Set();
      for (const [sid, tid] of Object.entries(state.placed)) {
        const s = byId.get(sid);
        if (!s || s.understood || tid == null || !tokens.has(tid) || seen.has(tid)) continue;
        placed.set(sid, tid); seen.add(tid);
      }
    }
    if (state.typed) {
      typed.clear();
      for (const [sid, v] of Object.entries(state.typed)) {
        const s = byId.get(sid);
        if (s?.understood && typeof v === 'string') typed.set(sid, v);
      }
    }
    render();
  }

  /**
   * 放字卡。tokenId 為 null ＝ 取回。
   * 規則：一格一卡、一卡一格——卡從別格移來會清掉原格，格內原卡被擠回字卡區。
   * 回傳事件 { type:'place', slotId, tokenId, prevTokenId, fromSlotId, state, armed }；無變化回 null。
   */
  function place(slotId, tokenId) {
    const slot = byId.get(slotId);
    if (!slot || slot.understood) return null;
    if (tokenId != null && !tokens.has(tokenId)) return null;
    const prevTokenId = placed.get(slotId) ?? null;
    let fromSlotId = null;
    if (tokenId != null) {
      for (const [sid, tid] of placed) if (tid === tokenId && sid !== slotId) { fromSlotId = sid; placed.delete(sid); }
    }
    if (prevTokenId === tokenId && fromSlotId == null) { if (armed != null) { armed = null; render(); } return null; }
    if (tokenId == null) placed.delete(slotId); else placed.set(slotId, tokenId);
    armed = null;
    checked = false;
    render();
    return emit({ type: 'place', slotId, tokenId, prevTokenId, fromSlotId });
  }

  /** 省略字打字（程式呼叫版，會重繪）。 */
  function type(slotId, value) {
    const slot = byId.get(slotId);
    if (!slot || !slot.understood) return null;
    typed.set(slotId, String(value ?? ''));
    checked = false;
    render();
    return emit({ type: 'typed', slotId, value: typed.get(slotId) });
  }
  /** 使用者在 input 裡打字：不重繪（保住焦點），只清標記。 */
  function typeFromInput(slotId, value) {
    typed.set(slotId, value);
    clearMarks();
    emit({ type: 'typed', slotId, value });
  }

  function setChecked(v) { checked = !!v; render(); }
  function setArmed(tokenId) { armed = tokenId ?? null; render(); }
  function grade({ mark = false } = {}) {
    const g = gradeState(tree, [...tokens.values()], getState());
    if (mark) setChecked(true);
    return g;
  }
  function hint() {
    const h = nextHint(tree, [...tokens.values()], getState());
    if (!h) return null;
    return h.type === 'typed' ? type(h.slotId, h.value) : place(h.slotId, h.tokenId);
  }
  function reset() {
    placed.clear(); typed.clear(); checked = false; armed = null;
    render();
    return emit({ type: 'reset' });
  }
  function freeTokens() {
    const used = new Set(placed.values());
    return [...tokens.values()].filter((t) => !used.has(t.id));
  }

  /* ---- 渲染 ---- */
  let marks = null; // slotId -> grade row（checked 時）

  function headEl(node) {
    const slot = byNode.get(node);
    if (!slot) {
      const d = el('div', 'dg-head dg-top dg-fixed');
      d.textContent = node.w;
      return d;
    }
    const mark = marks ? (marks.get(slot.id).correct ? ' dg-ok' : ' dg-bad') : '';
    if (slot.understood) {
      const d = el('div', 'dg-head dg-top dg-slot dg-understood' + mark);
      d.dataset.slot = slot.id;
      d.appendChild(span('dg-paren', '('));
      const inp = el('input', 'dg-input');
      inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false;
      inp.placeholder = labels.placeholder;
      inp.setAttribute('aria-label', labels.understoodAria(slot.role));
      inp.value = typed.get(slot.id) || '';
      inp.addEventListener('input', () => typeFromInput(slot.id, inp.value));
      d.appendChild(inp);
      d.appendChild(span('dg-paren', ')'));
      return d;
    }
    const b = el('button', 'dg-head dg-top dg-slot' + mark);
    b.type = 'button'; b.dataset.slot = slot.id;
    const tid = placed.get(slot.id);
    const tok = tid != null ? tokens.get(tid) : null;
    if (tok) {
      b.classList.add('dg-filled');
      b.textContent = tok.text;
      b.setAttribute('aria-label', labels.filledAria(slot.role, tok.text));
    } else {
      b.appendChild(span('dg-role', slot.role));
      b.setAttribute('aria-label', labels.emptyAria(slot.role));
    }
    if (armed != null) b.classList.add('dg-armed');
    b.addEventListener('click', () => {
      if (armed != null) { place(slot.id, armed); return; }
      if (tok) place(slot.id, null);
    });
    b.addEventListener('dragover', (e) => { e.preventDefault(); b.classList.add('dg-over'); });
    b.addEventListener('dragleave', () => b.classList.remove('dg-over'));
    b.addEventListener('drop', (e) => {
      e.preventDefault(); b.classList.remove('dg-over');
      const id = e.dataTransfer.getData('text/plain');
      if (id) place(slot.id, id);
    });
    return b;
  }

  function partsRow(cls, parts) {
    const row = el('div', cls);
    parts.forEach((p) => row.appendChild(cellEl(p, 'dg-part')));
    return row;
  }

  function modsEl(mods, extra) {
    if (!mods.length && !extra.length) return null;
    const box = el('div', 'dg-mods');
    extra.forEach((io) => {                       // 間接受詞：掛在述語正下方第一條
      const w = el('div', 'dg-mod dg-io');
      w.appendChild(cellEl(io, 'dg-m'));
      box.appendChild(w);
    });
    mods.forEach((m) => {
      const w = el('div', 'dg-mod');
      const k = kindOf(m);
      if (k === 'clause') w.appendChild(clauseEl(m));
      else if (k === 'pp') w.appendChild(partsRow('dg-pp', [m.p, m.o]));
      else if (k === 'phrase') w.appendChild(partsRow('dg-phrase', m.parts));
      else w.appendChild(cellEl(m, 'dg-m'));
      box.appendChild(w);
    });
    return box;
  }

  function cellEl(node, cls, extraMods = []) {
    const c = el('div', 'dg-cell ' + cls);
    const k = kindOf(node);
    if (k === 'phrase') { c.appendChild(partsRow('dg-phrase', node.parts)); return c; }
    if (k === 'clause') {                          // 子句站在位置上（例：名詞子句當主詞）
      const nest = el('div', 'dg-nest');
      if (node.role) nest.appendChild(span('dg-nest-role', node.role));
      nest.appendChild(clauseEl(node));
      c.appendChild(nest);
      return c;
    }
    c.appendChild(headEl(node));
    const m = modsEl(node.mods || [], extraMods);
    if (m) c.appendChild(m);
    return c;
  }

  function clauseEl(cl) {
    const row = el('div', 'dg-clause');
    for (const k of ['s', 'v', 'o', 'sc', 'oc']) {
      if (!cl[k]) continue;
      const extra = k === 'v' && cl.io ? [cl.io] : [];
      row.appendChild(cellEl(cl[k], 'dg-pos-' + k, extra));
    }
    return row;
  }

  function treeEl(t) {
    const k = kindOf(t);
    if (k === 'passage') {
      const p = el('div', 'dg-passage');
      t.parts.forEach((x) => p.appendChild(treeEl(x)));
      return p;
    }
    const box = el('div', 'dg-diagram');
    if (k === 'compound') {
      t.parts.forEach((p) => {
        if (kindOf(p) === 'conj') {
          const c = el('div', 'dg-conj');
          c.appendChild(el('div', 'dg-tie'));
          c.appendChild(headEl(p.conj));
          box.appendChild(c);
        } else box.appendChild(clauseEl(p));
      });
    } else box.appendChild(clauseEl(t));
    return box;
  }

  function render() {
    if (destroyed) return;
    marks = checked ? new Map(gradeState(tree, [...tokens.values()], getState()).slots.map((r) => [r.slotId, r])) : null;
    root.classList.add('dg-root');
    root.replaceChildren(treeEl(tree));
  }

  function destroy() {
    destroyed = true;
    root.replaceChildren();
    root.classList.remove('dg-root');
  }

  /* ---- 初始化 ---- */
  setTokens(options.tokens || tokensFromTree(tree));
  if (options.state) setState(options.state); else render();

  return {
    get slots() { return slots.map(({ node, ...rest }) => rest); },
    get tree() { return tree; },
    getState, setState, setTokens,
    getTokens: () => [...tokens.values()],
    freeTokens,
    place, type, hint, reset,
    grade, setChecked, isChecked: () => checked,
    setArmed, getArmed: () => armed,
    render, destroy,
  };
}

export default createDiagram;
