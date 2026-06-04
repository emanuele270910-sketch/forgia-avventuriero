/*
 * app.js — Controller dell'interfaccia (vanilla JS).
 * Legge tutto dal namespace globale DND popolato dagli script precedenti.
 */
(function () {
  'use strict';

  var D = window.DND || {};
  var t = D.i18n;
  var esc = D.escapeHtml;

  // Dati
  var ITEMS = D.items || [];
  var SPELLS = D.spells || [];
  var ITEM_BY_ID = index(ITEMS);
  var SPELL_BY_ID = index(SPELLS);

  // DM: logica del tracker (funzioni pure) e materiale di riferimento.
  var E = D.encounter;
  var DM = D.dm;
  var DM_STORE_KEY = 'dnd.encounter.monsters';
  var dmMonsters = []; // stato del tracker, persistito in localStorage

  // Lookup costanti
  var RARITY_BY_ID = D.RARITY_BY_ID;
  var ITEM_TYPE_BY_ID = D.ITEM_TYPE_BY_ID;
  var SCHOOL_BY_ID = D.SCHOOL_BY_ID;
  var CLASS_BY_ID = D.CLASS_BY_ID;
  var CASTING_TIME_BY_ID = D.CASTING_TIME_BY_ID;

  var SCHOOL_COLORS = {
    abjuration: '#60a5fa', conjuration: '#f59e0b', divination: '#38bdf8',
    enchantment: '#ec4899', evocation: '#ef4444', illusion: '#a855f7',
    necromancy: '#84cc16', transmutation: '#14b8a6'
  };

  // Stato filtri
  var itemFilters = { text: '', rarities: new Set(), types: new Set(), attunement: 'any' };
  var spellFilters = { text: '', cls: '', levels: new Set(), schools: new Set(), comp: {}, concentration: false, ritual: false };

  function index(list) {
    var m = {};
    list.forEach(function (x) { m[x.id] = x; });
    return m;
  }
  function $(id) { return document.getElementById(id); }
  function pluralResults(n) { return n + ' ' + (n === 1 ? t.common.result : t.common.results); }

  // ---- Chip helpers --------------------------------------------------------
  var CHIP_BASE = 'chip text-xs px-2.5 py-1 rounded-full border cursor-pointer select-none';
  var CHIP_ON = 'bg-gold text-ink border-gold font-semibold';
  var CHIP_OFF = 'bg-panel2 text-muted border-edge hover:border-gold/50 hover:text-parchment';

  function chipClass(active) { return CHIP_BASE + ' ' + (active ? CHIP_ON : CHIP_OFF); }

  function renderToggleGroup(container, options, set, onChange) {
    container.innerHTML = options.map(function (o) {
      return '<button type="button" class="' + chipClass(set.has(o.id)) + '" data-value="' + esc(o.id) + '">' + esc(o.label) + '</button>';
    }).join('');
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-value]');
      if (!btn) { return; }
      var v = btn.getAttribute('data-value');
      if (set.has(v)) { set.delete(v); } else { set.add(v); }
      btn.className = chipClass(set.has(v));
      onChange();
    });
  }

  // Gruppo a selezione singola (radio-like). options: [{id,label}], current via getter/setter.
  function renderRadioGroup(container, options, getValue, setValue, onChange) {
    container.innerHTML = options.map(function (o) {
      return '<button type="button" class="' + chipClass(getValue() === o.id) + '" data-value="' + esc(o.id) + '">' + esc(o.label) + '</button>';
    }).join('');
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-value]');
      if (!btn) { return; }
      setValue(btn.getAttribute('data-value'));
      Array.prototype.forEach.call(container.children, function (c) {
        c.className = chipClass(c.getAttribute('data-value') === getValue());
      });
      onChange();
    });
  }

  // Aggiorna SOLO lo stile dei chip in base allo stato corrente, senza toccare
  // i listener. Da usare al reset: richiamare i render* riaggancerebbe un
  // secondo handler sullo stesso contenitore, facendo commutare i chip due
  // volte per click (così non cambierebbe nulla).
  function restyleToggleGroup(container, set) {
    Array.prototype.forEach.call(container.children, function (c) {
      c.className = chipClass(set.has(c.getAttribute('data-value')));
    });
  }
  function restyleRadioGroup(container, value) {
    Array.prototype.forEach.call(container.children, function (c) {
      c.className = chipClass(c.getAttribute('data-value') === value);
    });
  }

  // ---- Static text ---------------------------------------------------------
  function applyStaticText() {
    document.title = t.appTitle + ' — Compendio D&D 5e';
    $('app-title').textContent = t.appTitle;
    $('app-subtitle').textContent = t.appSubtitle;

    // Nav
    var tabs = [
      { id: 'items', label: t.nav.items },
      { id: 'spells', label: t.nav.spells },
      { id: 'assistant', label: t.nav.assistant },
      { id: 'dm', label: t.nav.dm }
    ];
    $('tabs').innerHTML = tabs.map(function (tab, i) {
      var cls = 'px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition ' + (i === 0 ? 'tab-active' : 'text-muted hover:text-parchment');
      return '<button type="button" role="tab" class="' + cls + '" data-tab="' + tab.id + '">' + esc(tab.label) + '</button>';
    }).join('');

    $('items-title').textContent = t.items.title;
    $('items-search').placeholder = t.common.search;
    $('lbl-rarity').textContent = t.common.rarity;
    $('lbl-type').textContent = t.common.type;
    $('lbl-att').textContent = t.common.attunement;
    $('items-reset').textContent = t.common.reset;
    $('items-empty').textContent = t.common.noResults;

    $('spells-title').textContent = t.spells.title;
    $('spells-search').placeholder = t.common.search;
    $('lbl-class').textContent = t.spells.filterClass;
    $('lbl-school').textContent = t.spells.filterSchool;
    $('lbl-level').textContent = t.spells.filterLevel;
    $('lbl-comp').textContent = t.spells.filterComponents;
    $('spells-reset').textContent = t.common.reset;
    $('spells-empty').textContent = t.common.noResults;

    $('assistant-title').textContent = t.assistant.title;
    $('assistant-intro').textContent = t.assistant.intro;
    $('lbl-a-class').textContent = t.assistant.class;
    $('lbl-a-subclass').textContent = t.assistant.subclass;
    $('a-subclass').placeholder = t.assistant.subclassPlaceholder;
    $('lbl-a-level').textContent = t.assistant.level;
    $('lbl-a-abilities').textContent = t.assistant.abilities;
    $('a-generate').textContent = t.assistant.generate;
    $('assistant-empty').textContent = t.assistant.emptyState;

    $('dm-title').textContent = t.dm.title;
    $('dm-intro').textContent = t.dm.intro;
    $('dm-tracker-title').textContent = t.dm.trackerTitle;
    $('dm-tracker-hint').textContent = t.dm.trackerHint;
    $('lbl-dm-name').textContent = t.dm.name;
    $('dm-name').placeholder = t.dm.namePlaceholder;
    $('lbl-dm-hp').textContent = t.dm.hp;
    $('lbl-dm-qty').textContent = t.dm.qty;
    $('dm-add').textContent = t.dm.add;
    $('dm-clear').textContent = t.dm.clearAll;
    $('dm-quick-title').textContent = t.dm.quickTitle;
    $('dm-quick-hint').textContent = t.dm.quickHint;
    $('dm-ref-title').textContent = t.dm.referenceTitle;

    $('drawer-close').setAttribute('aria-label', t.common.close);
  }

  // ---- Tabs ----------------------------------------------------------------
  function initTabs() {
    $('tabs').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-tab]');
      if (!btn) { return; }
      var id = btn.getAttribute('data-tab');
      ['items', 'spells', 'assistant', 'dm'].forEach(function (p) {
        $('panel-' + p).classList.toggle('hidden', p !== id);
      });
      Array.prototype.forEach.call($('tabs').children, function (c) {
        var active = c.getAttribute('data-tab') === id;
        c.className = 'px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition ' + (active ? 'tab-active' : 'text-muted hover:text-parchment');
      });
    });
  }

  // ---- Items ---------------------------------------------------------------
  function initItems() {
    renderToggleGroup($('items-rarity'), D.RARITIES, itemFilters.rarities, renderItems);
    renderToggleGroup($('items-type'), D.ITEM_TYPES, itemFilters.types, renderItems);
    renderRadioGroup($('items-att'),
      [{ id: 'any', label: t.items.attAny }, { id: 'yes', label: t.items.attYes }, { id: 'no', label: t.items.attNo }],
      function () { return itemFilters.attunement; },
      function (v) { itemFilters.attunement = v; },
      renderItems);

    $('items-search').addEventListener('input', function (e) { itemFilters.text = e.target.value; renderItems(); });
    $('items-reset').addEventListener('click', function () {
      itemFilters.text = ''; itemFilters.rarities.clear(); itemFilters.types.clear(); itemFilters.attunement = 'any';
      $('items-search').value = '';
      restyleToggleGroup($('items-rarity'), itemFilters.rarities);
      restyleToggleGroup($('items-type'), itemFilters.types);
      restyleRadioGroup($('items-att'), itemFilters.attunement);
      renderItems();
    });

    $('items-results').addEventListener('click', function (e) {
      var card = e.target.closest('[data-id]');
      if (card) { openItemDrawer(card.getAttribute('data-id')); }
    });
    renderItems();
  }

  function renderItems() {
    var list = D.filterItems(ITEMS, {
      text: itemFilters.text,
      rarities: Array.from(itemFilters.rarities),
      types: Array.from(itemFilters.types),
      attunement: itemFilters.attunement
    });
    $('items-count').textContent = pluralResults(list.length);
    $('items-empty').classList.toggle('hidden', list.length !== 0);
    $('items-results').innerHTML = list.map(itemCard).join('');
  }

  function itemCard(item) {
    var r = RARITY_BY_ID[item.rarity] || { label: item.rarity, color: '#888' };
    var typeLabel = (ITEM_TYPE_BY_ID[item.type] || { label: item.type }).label;
    var att = item.attunement
      ? '<span class="text-[10px] text-gold/90">• ' + esc(t.common.attunement) + '</span>' : '';
    return '' +
      '<button type="button" data-id="' + esc(item.id) + '" class="card-rise accent-left text-left rounded-xl bg-panel border border-edge p-4 fade-in" style="border-left-color:' + r.color + '">' +
        '<div class="flex items-start justify-between gap-2">' +
          '<h3 class="font-display text-base text-parchment leading-tight">' + esc(item.name) + '</h3>' +
          badge(r.label, r.color) +
        '</div>' +
        '<div class="mt-1 text-[11px] text-muted uppercase tracking-wide flex items-center gap-2">' + esc(typeLabel) + att + '</div>' +
        '<p class="mt-2 text-sm text-muted line-clamp-3">' + esc(item.descrizione) + '</p>' +
      '</button>';
  }

  function badge(label, color) {
    return '<span class="shrink-0 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap" style="background:' + color + '22;color:' + color + ';border:1px solid ' + color + '66">' + esc(label) + '</span>';
  }

  // ---- Spells --------------------------------------------------------------
  function initSpells() {
    // Classe (select)
    var casterClasses = D.CLASSES.filter(function (c) { return c.caster; });
    $('spells-class').innerHTML = '<option value="">' + esc(t.common.all) + '</option>' +
      casterClasses.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.label) + '</option>'; }).join('');
    $('spells-class').addEventListener('change', function (e) { spellFilters.cls = e.target.value; renderSpells(); });

    // Scuole
    renderToggleGroup($('spells-school'), D.SCHOOLS, spellFilters.schools, renderSpells);

    // Livelli 0-9
    var levelOpts = [];
    for (var i = 0; i <= 9; i++) { levelOpts.push({ id: String(i), label: i === 0 ? t.spells.cantrip : String(i) }); }
    var levelContainer = $('spells-level');
    levelContainer.innerHTML = levelOpts.map(function (o) {
      return '<button type="button" class="' + chipClass(false) + '" data-value="' + o.id + '">' + esc(o.label) + '</button>';
    }).join('');
    levelContainer.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-value]');
      if (!btn) { return; }
      var v = parseInt(btn.getAttribute('data-value'), 10);
      if (spellFilters.levels.has(v)) { spellFilters.levels.delete(v); } else { spellFilters.levels.add(v); }
      btn.className = chipClass(spellFilters.levels.has(v));
      renderSpells();
    });

    // Componenti V/S/M
    var compContainer = $('spells-comp');
    compContainer.innerHTML = D.COMPONENTS.map(function (c) {
      return '<button type="button" class="' + chipClass(false) + '" data-value="' + c.id + '">' + esc(c.label) + '</button>';
    }).join('');
    compContainer.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-value]');
      if (!btn) { return; }
      var v = btn.getAttribute('data-value');
      spellFilters.comp[v] = !spellFilters.comp[v];
      btn.className = chipClass(!!spellFilters.comp[v]);
      renderSpells();
    });

    // Flag concentrazione / rituale
    var flags = $('spells-flags');
    flags.innerHTML =
      '<button type="button" class="' + chipClass(false) + '" data-flag="concentration">' + esc(t.spells.onlyConcentration) + '</button>' +
      '<button type="button" class="' + chipClass(false) + '" data-flag="ritual">' + esc(t.spells.onlyRitual) + '</button>';
    flags.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-flag]');
      if (!btn) { return; }
      var f = btn.getAttribute('data-flag');
      spellFilters[f] = !spellFilters[f];
      btn.className = chipClass(!!spellFilters[f]);
      renderSpells();
    });

    $('spells-search').addEventListener('input', function (e) { spellFilters.text = e.target.value; renderSpells(); });
    $('spells-reset').addEventListener('click', function () {
      // Muta lo stato sul posto: i listener (es. scuole) hanno catturato i Set
      // originali; riassegnare l'oggetto li lascerebbe orfani e i chip non
      // filtrerebbero più dopo un reset.
      spellFilters.text = '';
      spellFilters.cls = '';
      spellFilters.levels.clear();
      spellFilters.schools.clear();
      spellFilters.comp = {};
      spellFilters.concentration = false;
      spellFilters.ritual = false;
      $('spells-search').value = '';
      $('spells-class').value = '';
      initSpellsControlsReset();
      renderSpells();
    });

    $('spells-results').addEventListener('click', function (e) {
      var card = e.target.closest('[data-id]');
      if (card) { openSpellDrawer(card.getAttribute('data-id')); }
    });

    renderSpells();
  }

  // Ripristina lo stile dei chip dopo un reset (senza riattaccare listener).
  function initSpellsControlsReset() {
    ['spells-school', 'spells-level', 'spells-comp', 'spells-flags'].forEach(function (cid) {
      Array.prototype.forEach.call($(cid).children, function (c) { c.className = chipClass(false); });
    });
  }

  function renderSpells() {
    var list = D.filterSpells(SPELLS, {
      text: spellFilters.text,
      classes: spellFilters.cls ? [spellFilters.cls] : [],
      levels: Array.from(spellFilters.levels),
      schools: Array.from(spellFilters.schools),
      components: spellFilters.comp,
      concentration: spellFilters.concentration,
      ritual: spellFilters.ritual
    }).slice().sort(function (a, b) { return a.level - b.level || a.name.localeCompare(b.name); });

    $('spells-count').textContent = pluralResults(list.length);
    $('spells-empty').classList.toggle('hidden', list.length !== 0);
    $('spells-results').innerHTML = list.map(spellCard).join('');
  }

  function levelLabel(level) { return level === 0 ? t.spells.cantrip : t.spells.levelN.replace('{n}', level); }
  function compString(c) {
    var out = [];
    if (c.v) { out.push('V'); }
    if (c.s) { out.push('S'); }
    if (c.m) { out.push('M'); }
    return out.join(' · ');
  }

  function spellCard(spell) {
    var color = SCHOOL_COLORS[spell.school] || '#888';
    var schoolLabel = (SCHOOL_BY_ID[spell.school] || { label: spell.school }).label;
    var ctLabel = (CASTING_TIME_BY_ID[spell.castingTime] || { label: spell.castingTime }).label;
    var flags = '';
    if (spell.concentration) { flags += '<span class="text-[10px] px-1.5 py-0.5 rounded bg-panel2 border border-edge text-muted">C</span>'; }
    if (spell.ritual) { flags += '<span class="text-[10px] px-1.5 py-0.5 rounded bg-panel2 border border-edge text-muted">R</span>'; }
    return '' +
      '<button type="button" data-id="' + esc(spell.id) + '" class="card-rise accent-left text-left rounded-xl bg-panel border border-edge p-4 fade-in" style="border-left-color:' + color + '">' +
        '<div class="flex items-start gap-3">' +
          '<span class="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-display text-sm font-bold" style="background:' + color + '22;color:' + color + ';border:1px solid ' + color + '66">' + (spell.level === 0 ? '0' : spell.level) + '</span>' +
          '<div class="min-w-0">' +
            '<h3 class="font-display text-base text-parchment leading-tight truncate">' + esc(spell.name) + '</h3>' +
            '<div class="text-[11px] text-muted">' + esc(levelLabel(spell.level)) + ' · ' + esc(schoolLabel) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">' +
          '<span>' + esc(ctLabel) + '</span><span class="opacity-40">|</span><span>' + esc(compString(spell.components || {})) + '</span>' + flags +
        '</div>' +
        '<p class="mt-2 text-sm text-muted line-clamp-2">' + esc(spell.descrizione) + '</p>' +
      '</button>';
  }

  // ---- Drawer --------------------------------------------------------------
  function openDrawer(eyebrow, bodyHtml) {
    $('drawer-eyebrow').textContent = eyebrow;
    $('drawer-body').innerHTML = bodyHtml;
    $('drawer').classList.remove('drawer-closed');
    var ov = $('overlay');
    ov.classList.remove('opacity-0', 'pointer-events-none');
  }
  function closeDrawer() {
    $('drawer').classList.add('drawer-closed');
    $('overlay').classList.add('opacity-0', 'pointer-events-none');
  }

  function row(label, value) {
    if (value === undefined || value === null || value === '') { return ''; }
    return '<div class="flex justify-between gap-4 py-1.5 border-b border-edge/50">' +
      '<span class="text-xs uppercase tracking-wide text-muted">' + esc(label) + '</span>' +
      '<span class="text-sm text-parchment text-right">' + esc(value) + '</span></div>';
  }

  function bonusListHtml(bonus) {
    if (!bonus) { return ''; }
    var lines = [];
    if (bonus.weaponBonus) { lines.push('Arma +' + bonus.weaponBonus + ' (colpire e danni)'); }
    if (bonus.acBonus) { lines.push('Classe Armatura +' + bonus.acBonus); }
    if (bonus.saveBonus) { lines.push('Tiri salvezza +' + bonus.saveBonus); }
    if (bonus.spellAttackBonus) { lines.push('Attacco con incantesimi +' + bonus.spellAttackBonus); }
    if (bonus.spellSaveDcBonus) { lines.push('CD incantesimi +' + bonus.spellSaveDcBonus); }
    if (bonus.abilityCheckBonus) { lines.push('Prove di caratteristica +' + bonus.abilityCheckBonus); }
    if (bonus.setAbility) { lines.push(bonus.setAbility.ability.toUpperCase() + ' impostata a ' + bonus.setAbility.score); }
    if (bonus.abilityBonus) {
      Object.keys(bonus.abilityBonus).forEach(function (k) { lines.push(k.toUpperCase() + ' +' + bonus.abilityBonus[k]); });
    }
    if (bonus.resist) { lines.push('Resistenza: ' + bonus.resist.join(', ')); }
    if (bonus.extra) { lines.push(bonus.extra); }
    if (!lines.length) { return ''; }
    return '<div class="mt-4"><div class="text-xs uppercase tracking-wide text-gold mb-1">' + esc(t.common.bonuses) + '</div>' +
      '<ul class="list-disc list-inside text-sm text-parchment space-y-0.5">' +
      lines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></div>';
  }

  function openItemDrawer(id) {
    var item = ITEM_BY_ID[id];
    if (!item) { return; }
    var r = RARITY_BY_ID[item.rarity] || { label: item.rarity, color: '#888' };
    var typeLabel = (ITEM_TYPE_BY_ID[item.type] || { label: item.type }).label;
    var attText = item.attunement
      ? (t.common.attunementYes + (item.attunementNote ? ' (' + item.attunementNote + ')' : ''))
      : t.common.attunementNo;
    var html = '' +
      '<div class="flex items-center justify-between gap-3 mb-3">' +
        '<h2 class="font-display text-2xl text-parchment leading-tight">' + esc(item.name) + '</h2>' + badge(r.label, r.color) +
      '</div>' +
      '<div class="rounded-lg border border-edge bg-panel/60 px-3 py-1">' +
        row(t.common.type, typeLabel) +
        row(t.common.rarity, r.label) +
        row(t.common.attunement, attText) +
        row(t.common.source, item.source) +
      '</div>' +
      bonusListHtml(item.bonus) +
      '<p class="mt-4 text-sm text-parchment/90 leading-relaxed">' + esc(item.descrizione) + '</p>';
    openDrawer(typeLabel, html);
  }

  function openSpellDrawer(id) {
    var spell = SPELL_BY_ID[id];
    if (!spell) { return; }
    var schoolLabel = (SCHOOL_BY_ID[spell.school] || { label: spell.school }).label;
    var ctLabel = (CASTING_TIME_BY_ID[spell.castingTime] || { label: spell.castingTime }).label;
    var color = SCHOOL_COLORS[spell.school] || '#888';
    var c = spell.components || {};
    var compText = compString(c) + (c.material ? ' — ' + c.material : '');
    var classes = (spell.classes || []).map(function (id2) { return (CLASS_BY_ID[id2] || { label: id2 }).label; }).join(', ');
    var html = '' +
      '<div class="flex items-center gap-3 mb-3">' +
        '<span class="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center font-display text-lg font-bold" style="background:' + color + '22;color:' + color + ';border:1px solid ' + color + '66">' + (spell.level === 0 ? '0' : spell.level) + '</span>' +
        '<div><h2 class="font-display text-2xl text-parchment leading-tight">' + esc(spell.name) + '</h2>' +
        '<div class="text-sm text-muted">' + esc(levelLabel(spell.level)) + ' · ' + esc(schoolLabel) + '</div></div>' +
      '</div>' +
      '<div class="rounded-lg border border-edge bg-panel/60 px-3 py-1">' +
        row(t.spells.castingTime, ctLabel) +
        row(t.spells.range, spell.range) +
        row(t.spells.components, compText) +
        row(t.spells.duration, spell.duration) +
        row(t.spells.concentration, spell.concentration ? t.spells.yes : t.spells.no) +
        row(t.spells.ritual, spell.ritual ? t.spells.yes : t.spells.no) +
        row(t.spells.class, classes) +
        row(t.common.source, spell.source) +
      '</div>' +
      '<p class="mt-4 text-sm text-parchment/90 leading-relaxed">' + esc(spell.descrizione) + '</p>' +
      (spell.higherLevels ? '<div class="mt-3"><div class="text-xs uppercase tracking-wide text-gold mb-1">' + esc(t.spells.higherLevels) + '</div><p class="text-sm text-parchment/90">' + esc(spell.higherLevels) + '</p></div>' : '');
    openDrawer(schoolLabel, html);
  }

  function initDrawer() {
    $('drawer-close').addEventListener('click', closeDrawer);
    $('overlay').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDrawer(); } });
  }

  // ---- Assistant -----------------------------------------------------------
  function initAssistant() {
    $('a-class').innerHTML = D.CLASSES.map(function (c) {
      return '<option value="' + esc(c.id) + '">' + esc(c.label) + '</option>';
    }).join('');
    $('a-class').value = 'fighter';

    $('a-abilities').innerHTML = D.ABILITIES.map(function (a) {
      return '<div>' +
        '<label class="block text-[10px] text-muted mb-0.5" for="ab-' + a.id + '">' + esc(a.abbr) + '</label>' +
        '<input id="ab-' + a.id + '" type="number" min="1" max="30" value="10" class="w-full rounded-md bg-panel2 border border-edge px-2 py-1.5 text-parchment text-sm focus:outline-none focus:border-gold/70" />' +
      '</div>';
    }).join('');

    $('assistant-form').addEventListener('submit', function (e) {
      e.preventDefault();
      runAssistant();
    });

    $('assistant-results').addEventListener('click', function (e) {
      var card = e.target.closest('[data-kind]');
      if (!card) { return; }
      var kind = card.getAttribute('data-kind');
      var id = card.getAttribute('data-id');
      if (kind === 'item') { openItemDrawer(id); } else if (kind === 'spell') { openSpellDrawer(id); }
    });
  }

  function readAbilities() {
    var out = {};
    D.ABILITIES.forEach(function (a) {
      var v = parseInt(($('ab-' + a.id) || {}).value, 10);
      out[a.id] = isNaN(v) ? 10 : v;
    });
    return out;
  }

  function runAssistant() {
    var input = {
      clazz: $('a-class').value,
      subclass: $('a-subclass').value.trim(),
      level: $('a-level').value,
      abilities: readAbilities()
    };
    var res = D.recommendBuild(input, { items: ITEMS, spells: SPELLS });
    $('assistant-results').innerHTML = renderAssistant(res);
  }

  function renderAssistant(res) {
    var head = '' +
      '<div class="rounded-xl bg-panel border border-edge p-4 mb-4 fade-in">' +
        '<div class="flex items-center justify-between gap-3 flex-wrap">' +
          '<h3 class="font-display text-xl text-gold">' + esc(t.assistant.summaryFor) + ' ' + esc(res.className) +
            (res.subclass ? ' <span class="text-muted text-base">/ ' + esc(res.subclass) + '</span>' : '') + '</h3>' +
          '<span class="text-sm text-muted">' + esc(t.spells.level) + ' ' + res.level + '</span>' +
        '</div>' +
        '<div class="mt-2 text-xs text-muted">' + esc(t.assistant.attunementBudget) + ': ' +
          '<span class="text-parchment font-semibold">' + res.attunementUsed + ' / ' + res.attunementMax + '</span></div>' +
      '</div>';

    var itemsHtml = '<h4 class="font-display text-lg text-parchment mb-2">' + esc(t.assistant.resultsTitle) + '</h4>';
    if (!res.items.length) {
      itemsHtml += '<p class="text-muted text-sm mb-4">' + esc(t.common.noResults) + '</p>';
    } else {
      itemsHtml += '<div class="grid gap-3 sm:grid-cols-2 mb-6">' + res.items.map(assistantItemCard).join('') + '</div>';
    }

    var spellsHtml = '<h4 class="font-display text-lg text-parchment mb-2">' + esc(t.assistant.spellsTitle) + '</h4>';
    if (res.spellNote === 'noncaster') {
      spellsHtml += '<p class="text-muted text-sm">' + esc(t.assistant.noSpells) + '</p>';
    } else if (res.spellNote === 'noslots') {
      spellsHtml += '<p class="text-muted text-sm">' + esc(res.className) + ': nessuno slot incantesimo a questo livello.</p>';
    } else if (!res.spells.length) {
      spellsHtml += '<p class="text-muted text-sm">' + esc(t.common.noResults) + '</p>';
    } else {
      spellsHtml += '<div class="grid gap-3 sm:grid-cols-2">' + res.spells.map(assistantSpellCard).join('') + '</div>';
    }

    return head + itemsHtml + spellsHtml;
  }

  function assistantItemCard(pick) {
    var item = pick.item;
    var r = RARITY_BY_ID[item.rarity] || { label: item.rarity, color: '#888' };
    var attune = pick.attune
      ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/40">' + esc(t.assistant.attuneBadge) + '</span>'
      : '<span class="text-[10px] px-2 py-0.5 rounded-full bg-panel2 text-muted border border-edge">' + esc(t.assistant.noAttune) + '</span>';
    return '' +
      '<button type="button" data-kind="item" data-id="' + esc(item.id) + '" class="card-rise accent-left text-left rounded-xl bg-panel border border-edge p-4 fade-in" style="border-left-color:' + r.color + '">' +
        '<div class="flex items-start justify-between gap-2">' +
          '<h5 class="font-display text-base text-parchment leading-tight">' + esc(item.name) + '</h5>' + badge(r.label, r.color) +
        '</div>' +
        '<div class="mt-1.5 flex items-center gap-2">' + attune + '</div>' +
        '<p class="mt-2 text-xs text-muted"><span class="text-gold/90 uppercase tracking-wide">' + esc(t.assistant.whyTitle) + ':</span> ' + esc(pick.reason) + '</p>' +
      '</button>';
  }

  function assistantSpellCard(pick) {
    var spell = pick.spell;
    var color = SCHOOL_COLORS[spell.school] || '#888';
    return '' +
      '<button type="button" data-kind="spell" data-id="' + esc(spell.id) + '" class="card-rise accent-left text-left rounded-xl bg-panel border border-edge p-4 fade-in" style="border-left-color:' + color + '">' +
        '<div class="flex items-center gap-2">' +
          '<span class="shrink-0 w-7 h-7 rounded-md flex items-center justify-center font-display text-xs font-bold" style="background:' + color + '22;color:' + color + ';border:1px solid ' + color + '66">' + (spell.level === 0 ? '0' : spell.level) + '</span>' +
          '<h5 class="font-display text-base text-parchment leading-tight truncate">' + esc(spell.name) + '</h5>' +
        '</div>' +
        '<p class="mt-2 text-xs text-muted">' + esc(pick.reason) + '</p>' +
      '</button>';
  }

  // ---- DM: tracker mostri + riferimento ------------------------------------
  var DM_STATUS_COLOR = {
    healthy: '#22c55e', wounded: '#d9b65f', bloodied: '#f59e0b',
    critical: '#ef4444', dead: '#6b7280'
  };
  function dmStatusLabel(st) {
    return {
      healthy: t.dm.statusHealthy, wounded: t.dm.statusWounded, bloodied: t.dm.statusBloodied,
      critical: t.dm.statusCritical, dead: t.dm.statusDead
    }[st] || st;
  }

  function dmLoad() {
    try {
      var raw = window.localStorage.getItem(DM_STORE_KEY);
      if (!raw) { return []; }
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) { return []; }
      return arr.map(function (m) {
        return E.makeMonster(m.name, m.maxHp, { id: m.id, currentHp: m.currentHp, note: m.note, initiative: m.initiative });
      });
    } catch (e) { return []; }
  }
  function dmSave() {
    try { window.localStorage.setItem(DM_STORE_KEY, JSON.stringify(dmMonsters)); } catch (e) { /* spazio non disponibile: ignora */ }
  }
  function dmIndexOf(id) {
    for (var i = 0; i < dmMonsters.length; i++) { if (dmMonsters[i].id === id) { return i; } }
    return -1;
  }

  function dmAddMonsters(name, hp, qty, note) {
    var count = Math.max(1, Math.min(20, E.toInt(qty, 1)));
    var stem = (name === undefined || name === null ? '' : String(name)).trim() || 'Mostro';
    for (var i = 0; i < count; i++) {
      var label = count > 1 ? stem + ' ' + (i + 1) : stem;
      dmMonsters.push(E.makeMonster(label, hp, { note: note || '' }));
    }
    dmSave();
    renderMonsters();
  }

  function monsterCard(m) {
    var st = E.status(m);
    var pct = E.hpPercent(m);
    var color = DM_STATUS_COLOR[st];
    var dead = st === 'dead';
    return '' +
      '<div data-mid="' + esc(m.id) + '" class="rounded-lg border border-edge bg-panel2/60 p-3' + (dead ? ' opacity-60' : '') + '">' +
        '<div class="flex items-center justify-between gap-2">' +
          '<h4 class="font-display text-base text-parchment leading-tight' + (dead ? ' line-through' : '') + '">' + esc(m.name) + '</h4>' +
          '<div class="flex items-center gap-2 shrink-0">' +
            '<span class="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap" style="background:' + color + '22;color:' + color + ';border:1px solid ' + color + '66">' + esc(dmStatusLabel(st)) + '</span>' +
            '<button type="button" data-act="remove" aria-label="' + esc(t.dm.remove) + '" class="w-6 h-6 rounded border border-edge text-muted hover:text-crimson hover:border-crimson/60 flex items-center justify-center text-sm leading-none">&times;</button>' +
          '</div>' +
        '</div>' +
        '<div class="mt-2 flex items-center gap-2">' +
          '<div class="flex-1 h-2.5 rounded-full bg-ink/70 overflow-hidden border border-edge/60">' +
            '<div class="h-full rounded-full" style="width:' + pct + '%;background:' + color + '"></div>' +
          '</div>' +
          '<span class="text-sm tabular-nums whitespace-nowrap text-muted"><span class="font-semibold" style="color:' + color + '">' + m.currentHp + '</span> / ' + m.maxHp + ' ' + esc(t.dm.hpOf) + '</span>' +
        '</div>' +
        '<div class="mt-2 flex items-center gap-2 flex-wrap">' +
          '<input type="number" min="1" inputmode="numeric" class="dm-amount w-20 rounded-md bg-panel border border-edge px-2 py-1.5 text-parchment text-sm focus:outline-none focus:border-gold/70" placeholder="' + esc(t.dm.amountPlaceholder) + '" />' +
          '<button type="button" data-act="damage" class="px-3 py-1.5 rounded-md text-sm font-semibold bg-crimson/20 text-red-300 border border-crimson/50 hover:bg-crimson/30 transition">' + esc(t.dm.damage) + '</button>' +
          '<button type="button" data-act="heal" class="px-3 py-1.5 rounded-md text-sm font-semibold bg-green-500/15 text-green-300 border border-green-500/40 hover:bg-green-500/25 transition">' + esc(t.dm.heal) + '</button>' +
        '</div>' +
        (m.note ? '<p class="mt-2 text-xs text-muted leading-snug">' + esc(m.note) + '</p>' : '') +
      '</div>';
  }

  function renderMonsters() {
    var n = dmMonsters.length;
    $('dm-monster-count').textContent = n + ' ' + (n === 1 ? t.dm.monsterCountOne : t.dm.monsterCount);
    $('dm-monster-empty').textContent = t.dm.empty;
    $('dm-monster-empty').classList.toggle('hidden', n !== 0);
    $('dm-monster-list').innerHTML = dmMonsters.map(monsterCard).join('');
  }

  function renderQuickMonsters() {
    $('dm-quick-list').innerHTML = (DM.monsters || []).map(function (mon, i) {
      return '<button type="button" data-qi="' + i + '" class="text-xs px-3 py-1.5 rounded-full bg-panel2 border border-edge text-parchment hover:border-gold/60 hover:text-gold transition">' +
        esc(mon.name) + ' <span class="text-muted">· GS ' + esc(mon.cr) + ' · ' + mon.hp + ' PF</span></button>';
    }).join('');
  }

  function dmTableHtml(s) {
    var head = '<tr>' + s.columns.map(function (c, i) {
      return '<th class="px-2 py-1.5 font-semibold text-gold/90 ' + (i === 0 ? 'text-left' : 'text-right') + '">' + esc(c) + '</th>';
    }).join('') + '</tr>';
    var body = s.rows.map(function (r) {
      return '<tr class="border-t border-edge/40">' + r.map(function (cell, i) {
        return '<td class="px-2 py-1.5 ' + (i === 0 ? 'text-parchment' : 'text-right text-muted tabular-nums') + '">' + esc(cell) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return '<div class="overflow-x-auto"><table class="w-full text-sm border-collapse"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
  }
  function dmListHtml(items, ordered) {
    var tag = ordered ? 'ol' : 'ul';
    var cls = ordered ? 'list-decimal' : 'list-disc';
    return '<' + tag + ' class="' + cls + ' list-inside text-sm text-parchment/90 space-y-1">' +
      items.map(function (it) { return '<li>' + esc(it) + '</li>'; }).join('') + '</' + tag + '>';
  }
  function dmSectionHtml(s) {
    var body = s.kind === 'table' ? dmTableHtml(s) : dmListHtml(s.items, s.kind === 'steps');
    var note = s.note ? '<p class="mt-2 text-xs text-muted italic leading-snug">' + esc(s.note) + '</p>' : '';
    return '' +
      '<details class="rounded-xl bg-panel border border-edge overflow-hidden">' +
        '<summary class="px-4 py-3 flex items-center gap-2 hover:bg-panel2/50">' +
          (s.icon ? '<span class="text-base leading-none">' + esc(s.icon) + '</span>' : '') +
          '<span class="font-display text-sm text-parchment flex-1">' + esc(s.title) + '</span>' +
          '<span class="text-muted text-xs">▾</span>' +
        '</summary>' +
        '<div class="px-4 pb-4 pt-1">' + body + note + '</div>' +
      '</details>';
  }
  function renderDmReference() {
    $('dm-reference').innerHTML = (DM.sections || []).map(dmSectionHtml).join('');
  }

  function initDM() {
    if (!E || !DM) { return; } // moduli DM non caricati: salta senza rompere il resto
    dmMonsters = dmLoad();
    renderQuickMonsters();
    renderDmReference();
    renderMonsters();

    $('dm-monster-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var hp = E.toInt($('dm-hp').value, 0);
      if (hp <= 0) { $('dm-hp').focus(); return; }
      dmAddMonsters($('dm-name').value, hp, $('dm-qty').value, '');
      $('dm-name').value = '';
      $('dm-hp').value = '';
      $('dm-qty').value = '1';
      $('dm-name').focus();
    });

    $('dm-clear').addEventListener('click', function () {
      if (!dmMonsters.length) { return; }
      if (!window.confirm(t.dm.confirmClear)) { return; }
      dmMonsters = [];
      dmSave();
      renderMonsters();
    });

    // Delego i click una sola volta: renderMonsters() riscrive solo l'HTML,
    // così non si accumulano listener duplicati a ogni ridisegno.
    $('dm-monster-list').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) { return; }
      var card = e.target.closest('[data-mid]');
      if (!card) { return; }
      var id = card.getAttribute('data-mid');
      var act = btn.getAttribute('data-act');
      if (act === 'remove') {
        dmMonsters = dmMonsters.filter(function (m) { return m.id !== id; });
        dmSave();
        renderMonsters();
        return;
      }
      var idx = dmIndexOf(id);
      if (idx < 0) { return; }
      var input = card.querySelector('.dm-amount');
      var amount = input ? input.value : 0;
      if (act === 'damage') { dmMonsters[idx] = E.applyDamage(dmMonsters[idx], amount); }
      else if (act === 'heal') { dmMonsters[idx] = E.applyHeal(dmMonsters[idx], amount); }
      dmSave();
      renderMonsters();
    });

    $('dm-quick-list').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-qi]');
      if (!btn) { return; }
      var mon = (DM.monsters || [])[parseInt(btn.getAttribute('data-qi'), 10)];
      if (!mon) { return; }
      dmAddMonsters(mon.name, mon.hp, 1, mon.note);
    });
  }

  // ---- Boot ----------------------------------------------------------------
  function boot() {
    if (!t || !D.filterItems) {
      document.body.insertAdjacentHTML('afterbegin',
        '<div style="background:#9b2226;color:#fff;padding:12px;text-align:center">Errore: script dei dati non caricati. Apri index.html dalla cartella del progetto.</div>');
      return;
    }
    applyStaticText();
    initTabs();
    initItems();
    initSpells();
    initAssistant();
    initDrawer();
    initDM();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
