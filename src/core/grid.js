/*
 * grid.js — Logica pura della Griglia di combattimento condivisa.
 * Niente DOM, niente rete: solo modello dati, codici stanza, distanze e
 * sanificazione dello stato remoto. La sincronizzazione (Firebase) e il
 * rendering vivono in app.js. Pattern UMD-lite: browser (window.DND.grid) o Node.
 */
(function (root, factory) {
  'use strict';
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = mod; }
  if (root) { root.DND = root.DND || {}; root.DND.grid = mod; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // D&D 5e: 1 casella = 1,5 metri = 5 piedi. La diagonale conta come una casella
  // (regola del Manuale del Giocatore) → distanza di Chebyshev.
  var CELL_M = 1.5;
  var CELL_FT = 5;

  var DEFAULT_COLS = 24, DEFAULT_ROWS = 16;
  var MIN_DIM = 6, MAX_DIM = 60;
  var MAX_TOKENS = 60;
  var MAX_LABEL = 24;

  // Alfabeto dei codici stanza: niente caratteri ambigui (0/O, 1/I/L).
  var CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  var CODE_LEN = 5;

  var TOKEN_KINDS = ['monster', 'pc'];
  // Colori predefiniti per le pedine (rosso = mostro, blu = personaggio, ecc.).
  var TOKEN_COLORS = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#a855f7', '#ec4899'];

  function clampInt(n, min, max, fallback) {
    n = Math.round(Number(n));
    if (!isFinite(n)) { return fallback; }
    return n < min ? min : (n > max ? max : n);
  }

  function makeRoomCode(rng) {
    rng = rng || Math.random;
    var s = '';
    for (var i = 0; i < CODE_LEN; i++) {
      s += CODE_ALPHABET.charAt(Math.floor(rng() * CODE_ALPHABET.length));
    }
    return s;
  }
  // Normalizza ciò che l'utente digita (maiuscolo, niente spazi/simboli, lunghezza fissa).
  function normalizeCode(str) {
    return String(str == null ? '' : str).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LEN);
  }
  function isValidCode(str) {
    if (typeof str !== 'string' || str.length !== CODE_LEN) { return false; }
    for (var i = 0; i < str.length; i++) { if (CODE_ALPHABET.indexOf(str.charAt(i)) === -1) { return false; } }
    return true;
  }

  function makeGrid(cols, rows) {
    return {
      cols: clampInt(cols, MIN_DIM, MAX_DIM, DEFAULT_COLS),
      rows: clampInt(rows, MIN_DIM, MAX_DIM, DEFAULT_ROWS)
    };
  }

  var _idc = 0;
  function makeId() { return 't' + Date.now().toString(36) + (_idc++).toString(36); }

  function makeToken(opts, grid) {
    opts = opts || {};
    grid = grid || makeGrid();
    var kind = TOKEN_KINDS.indexOf(opts.kind) !== -1 ? opts.kind : 'monster';
    var label = String(opts.label == null ? '' : opts.label).slice(0, MAX_LABEL);
    var color = (typeof opts.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(opts.color))
      ? opts.color : (kind === 'pc' ? '#3b82f6' : '#ef4444');
    return {
      id: typeof opts.id === 'string' && opts.id ? opts.id.slice(0, 40) : makeId(),
      kind: kind,
      label: label,
      color: color,
      x: clampInt(opts.x, 0, grid.cols - 1, 0),
      y: clampInt(opts.y, 0, grid.rows - 1, 0)
    };
  }

  function clampTokenToGrid(token, grid) {
    token.x = clampInt(token.x, 0, grid.cols - 1, 0);
    token.y = clampInt(token.y, 0, grid.rows - 1, 0);
    return token;
  }

  // Distanza in caselle (Chebyshev: la diagonale conta come 1).
  function cellsBetween(a, b) {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  }
  function distanceM(a, b) { return cellsBetween(a, b) * CELL_M; }
  function distanceFt(a, b) { return cellsBetween(a, b) * CELL_FT; }

  // Etichetta leggibile: "3 caselle · 4,5 m" (virgola decimale italiana).
  function distanceLabel(a, b) {
    var c = cellsBetween(a, b);
    var m = (c * CELL_M).toFixed(1).replace('.0', '').replace('.', ',');
    return c + (c === 1 ? ' casella · ' : ' caselle · ') + m + ' m';
  }

  // Ripulisce uno stato ricevuto da remoto (non fidato) prima di mostrarlo:
  // limita il numero di pedine, forza i tipi, riporta le coordinate nella griglia.
  function sanitizeState(raw) {
    raw = raw || {};
    var grid = makeGrid(raw.grid && raw.grid.cols, raw.grid && raw.grid.rows);
    var out = [];
    var src = raw.tokens;
    if (src && typeof src === 'object') {
      var list = Array.isArray(src) ? src : Object.keys(src).map(function (k) { return src[k]; });
      for (var i = 0; i < list.length && out.length < MAX_TOKENS; i++) {
        if (list[i] && typeof list[i] === 'object') { out.push(makeToken(list[i], grid)); }
      }
    }
    return {
      name: String(raw.name == null ? '' : raw.name).slice(0, 40),
      grid: grid,
      tokens: out,
      updatedAt: clampInt(raw.updatedAt, 0, 9e15, 0)
    };
  }

  return {
    CELL_M: CELL_M, CELL_FT: CELL_FT,
    DEFAULT_COLS: DEFAULT_COLS, DEFAULT_ROWS: DEFAULT_ROWS,
    MIN_DIM: MIN_DIM, MAX_DIM: MAX_DIM, MAX_TOKENS: MAX_TOKENS, MAX_LABEL: MAX_LABEL,
    CODE_ALPHABET: CODE_ALPHABET, CODE_LEN: CODE_LEN,
    TOKEN_KINDS: TOKEN_KINDS, TOKEN_COLORS: TOKEN_COLORS,
    clampInt: clampInt,
    makeRoomCode: makeRoomCode, normalizeCode: normalizeCode, isValidCode: isValidCode,
    makeGrid: makeGrid, makeId: makeId, makeToken: makeToken, clampTokenToGrid: clampTokenToGrid,
    cellsBetween: cellsBetween, distanceM: distanceM, distanceFt: distanceFt, distanceLabel: distanceLabel,
    sanitizeState: sanitizeState
  };
});
