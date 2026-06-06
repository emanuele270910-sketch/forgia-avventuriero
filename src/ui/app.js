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
  var CHANGELOG = D.changelog || []; // cronologia versioni (Patch Notes)
  var DICE = D.dice; // logica pura del lancio dei dadi (RNG iniettabile)

  // Build personalizzate dell'utente: logica pura in builds.js, stato persistito
  // in localStorage. `builds` è l'elenco salvato, `activeBuildId` quella in modifica.
  var BUILDS = D.builds;
  var BUILD_STORE_KEY = 'dnd.builds';
  var builds = [];
  var activeBuildId = null;
  var buildItemQuery = '';   // testo di ricerca « aggiungi oggetto »
  var buildSpellQuery = '';  // testo di ricerca « aggiungi incantesimo »

  // DM: logica del tracker (funzioni pure) e materiale di riferimento.
  var E = D.encounter;
  var DM = D.dm;
  var NAMES = D.names;
  var DM_STORE_KEY = 'dnd.encounter.monsters';
  var dmMonsters = []; // stato del tracker, persistito in localStorage
  var dmCombat = { active: false, round: 1, turnIndex: 0 }; // stato del combattimento (non persistito)

  // Mappa chiave→condizione per le etichette dei badge di stato.
  var CONDITION_BY_KEY = {};
  ((DM && DM.conditions) ? DM.conditions : []).forEach(function (c) { CONDITION_BY_KEY[c.key] = c; });

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
      { id: 'build', label: t.nav.build },
      { id: 'dm', label: t.nav.dm },
      { id: 'dice', label: t.nav.dice },
      { id: 'patch', label: t.nav.patch }
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

    // Build personalizzate
    $('build-title').textContent = t.build.title;
    $('build-intro').textContent = t.build.intro;
    $('build-new-title').textContent = t.build.newTitle;
    $('lbl-build-name').textContent = t.build.name;
    $('build-name').placeholder = t.build.namePlaceholder;
    $('lbl-build-class').textContent = t.build.class;
    $('build-create').textContent = t.build.create;
    $('build-saved-title').textContent = t.build.savedTitle;
    $('build-saved-empty').textContent = t.build.savedEmpty;
    $('build-editor-empty').textContent = t.build.editorEmpty;

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

    // PG, iniziativa e combattimento
    $('dm-pc-add-title').textContent = t.dm.pcAddTitle;
    $('lbl-dm-pc-name').textContent = t.dm.pcName;
    $('dm-pc-name').placeholder = t.dm.pcNamePlaceholder;
    $('lbl-dm-pc-init').textContent = t.dm.pcInit;
    $('dm-pc-add').textContent = t.dm.pcAdd;
    $('dm-combat-start').textContent = t.dm.combatStart;
    $('dm-combat-next').textContent = t.dm.combatNext;
    $('dm-combat-end').textContent = t.dm.combatEnd;

    // Generatore di nomi
    $('dm-names-title').textContent = t.dm.namesTitle;
    $('dm-names-hint').textContent = t.dm.namesHint;
    $('lbl-dm-names-kind').textContent = t.dm.namesKind;
    $('dm-name-gen').textContent = t.dm.namesGenerate;

    // Novità / Patch Notes
    $('patch-title').textContent = t.patch.title;
    $('patch-intro').textContent = t.patch.intro;
    $('patch-empty').textContent = t.patch.empty;

    // Lancio dei dadi
    $('dice-title').textContent = t.dice.title;
    $('dice-intro').textContent = t.dice.intro;
    $('lbl-dice-die').textContent = t.dice.die;
    $('lbl-dice-qty').textContent = t.dice.quantity;
    $('lbl-dice-mod').textContent = t.dice.modifier;
    $('dice-roll').textContent = t.dice.roll;
    $('dice-result-title').textContent = t.dice.resultTitle;
    $('dice-empty').textContent = t.dice.empty;
    $('dice-history-title').textContent = t.dice.historyTitle;
    $('dice-history-clear').textContent = t.dice.historyClear;
    $('dice-history-empty').textContent = t.dice.historyEmpty;

    $('drawer-close').setAttribute('aria-label', t.common.close);
  }

  // ---- Tabs ----------------------------------------------------------------
  function initTabs() {
    $('tabs').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-tab]');
      if (!btn) { return; }
      var id = btn.getAttribute('data-tab');
      ['items', 'spells', 'assistant', 'build', 'dm', 'dice', 'patch'].forEach(function (p) {
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
    critical: '#ef4444', dead: '#6b7280', pc: '#818cf8'
  };
  function dmStatusLabel(st) {
    return {
      healthy: t.dm.statusHealthy, wounded: t.dm.statusWounded, bloodied: t.dm.statusBloodied,
      critical: t.dm.statusCritical, dead: t.dm.statusDead, pc: t.dm.pcBadge
    }[st] || st;
  }

  function dmLoad() {
    try {
      var raw = window.localStorage.getItem(DM_STORE_KEY);
      if (!raw) { return []; }
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) { return []; }
      return arr.map(function (m) {
        return E.makeMonster(m.name, m.maxHp, {
          id: m.id, currentHp: m.currentHp, note: m.note,
          initiative: m.initiative, isPC: m.isPC, conditions: m.conditions
        });
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

  // Badge rimovibili per le condizioni di stato attive sul combattente.
  function conditionBadgesHtml(m) {
    if (!m.conditions || !m.conditions.length) { return ''; }
    return m.conditions.map(function (key) {
      var c = CONDITION_BY_KEY[key];
      var label = c ? c.it : key;
      var desc = c ? c.it + ' (' + c.en + '): ' + c.desc : key;
      return '<button type="button" data-act="remove-cond" data-cond="' + esc(key) + '" title="' + esc(desc) + '" ' +
        'class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/40 hover:bg-amber-500/25 transition">' +
        esc(label) + ' <span class="opacity-70">&times;</span></button>';
    }).join('');
  }

  // Menu a tendina per aggiungere una condizione non ancora presente.
  function conditionAddHtml(m) {
    var current = {};
    (m.conditions || []).forEach(function (k) { current[k] = true; });
    var opts = '<option value="">' + esc(t.dm.condAdd) + '</option>';
    (DM.conditions || []).forEach(function (c) {
      if (!current[c.key]) { opts += '<option value="' + esc(c.key) + '">' + esc(c.it) + '</option>'; }
    });
    return '<select class="dm-cond-add text-[11px] rounded-md bg-panel border border-edge px-2 py-1 text-muted focus:outline-none focus:border-gold/70" title="' + esc(t.dm.condTitle) + '">' + opts + '</select>';
  }

  function monsterCard(m, activeId) {
    var isPC = !m.maxHp;
    var st = E.status(m);
    var color = DM_STATUS_COLOR[st] || '#9b94ac';
    var dead = st === 'dead';
    var active = !!activeId && m.id === activeId;

    var wrapCls = 'rounded-lg border p-3 ' +
      (active ? 'border-indigo-400/80 ring-1 ring-indigo-400/60 bg-indigo-500/10'
        : (isPC ? 'border-indigo-400/30 bg-panel2/60' : 'border-edge bg-panel2/60')) +
      (dead ? ' opacity-60' : '');

    var initBox = '<input type="number" inputmode="numeric" value="' + (m.initiative == null ? '' : m.initiative) + '" ' +
      'class="dm-init w-12 rounded-md bg-panel border border-edge px-1.5 py-1 text-parchment text-sm text-center focus:outline-none focus:border-indigo-400/70" ' +
      'placeholder="' + esc(t.dm.initShort) + '" title="' + esc(t.dm.initTitle) + '" aria-label="' + esc(t.dm.initTitle) + '" />';
    var statusBadge = '<span class="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap" style="background:' + color + '22;color:' + color + ';border:1px solid ' + color + '66">' + esc(dmStatusLabel(st)) + '</span>';
    var removeBtn = '<button type="button" data-act="remove" aria-label="' + esc(t.dm.remove) + '" class="w-6 h-6 rounded border border-edge text-muted hover:text-crimson hover:border-crimson/60 flex items-center justify-center text-sm leading-none">&times;</button>';

    var header =
      '<div class="flex items-center justify-between gap-2">' +
        '<div class="flex items-center gap-2 min-w-0">' + initBox +
          '<h4 class="font-display text-base text-parchment leading-tight truncate' + (dead ? ' line-through' : '') + '">' + esc(m.name) + '</h4>' +
        '</div>' +
        '<div class="flex items-center gap-2 shrink-0">' + statusBadge + removeBtn + '</div>' +
      '</div>';

    var body = '';
    if (!isPC) {
      var pct = E.hpPercent(m);
      body =
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
        '</div>';
    }

    var condRow =
      '<div class="mt-2 flex items-center gap-1.5 flex-wrap">' + conditionBadgesHtml(m) + conditionAddHtml(m) + '</div>';
    var note = m.note ? '<p class="mt-2 text-xs text-muted leading-snug">' + esc(m.note) + '</p>' : '';

    return '<div data-mid="' + esc(m.id) + '" class="' + wrapCls + '">' + header + body + condRow + note + '</div>';
  }

  function renderMonsters() {
    var n = dmMonsters.length;
    $('dm-monster-count').textContent = n + ' ' + (n === 1 ? t.dm.monsterCountOne : t.dm.monsterCount);
    $('dm-monster-empty').textContent = t.dm.empty;
    $('dm-monster-empty').classList.toggle('hidden', n !== 0);

    // In combattimento ordina per iniziativa (decrescente) ed evidenzia il turno.
    var ordered = dmMonsters;
    var activeId = null;
    if (dmCombat.active && E.sortByInitiative) {
      ordered = E.sortByInitiative(dmMonsters);
      if (ordered.length) {
        if (dmCombat.turnIndex >= ordered.length) { dmCombat.turnIndex = 0; }
        activeId = ordered[dmCombat.turnIndex].id;
      }
    }
    $('dm-monster-list').innerHTML = ordered.map(function (m) { return monsterCard(m, activeId); }).join('');
    renderCombatBar(activeId);
  }

  // Mostra/aggiorna la barra dell'iniziativa in base allo stato del combattimento.
  function renderCombatBar(activeId) {
    var combat = $('dm-combat');
    if (!combat) { return; }
    combat.classList.toggle('hidden', dmMonsters.length === 0);
    var startBtn = $('dm-combat-start');
    var panel = $('dm-combat-panel');
    if (dmCombat.active) {
      startBtn.classList.add('hidden');
      panel.classList.remove('hidden');
      panel.classList.add('flex');
      var active = null;
      for (var i = 0; i < dmMonsters.length; i++) { if (dmMonsters[i].id === activeId) { active = dmMonsters[i]; break; } }
      $('dm-combat-info').textContent = t.dm.combatRound + ' ' + dmCombat.round + ' · ' +
        t.dm.combatTurnOf + ' ' + (active ? active.name : '—');
    } else {
      startBtn.classList.remove('hidden');
      panel.classList.add('hidden');
      panel.classList.remove('flex');
    }
  }

  function startCombat() {
    if (!dmMonsters.length) { return; }
    dmCombat.active = true;
    dmCombat.round = 1;
    dmCombat.turnIndex = 0;
    renderMonsters();
  }
  function nextTurn() {
    if (!dmCombat.active) { return; }
    if (!dmMonsters.length) { endCombat(); return; }
    dmCombat.turnIndex++;
    if (dmCombat.turnIndex >= dmMonsters.length) { dmCombat.turnIndex = 0; dmCombat.round++; }
    renderMonsters();
  }
  function endCombat() {
    dmCombat.active = false;
    dmCombat.round = 1;
    dmCombat.turnIndex = 0;
    renderMonsters();
  }

  function dmAddPc(name, initiative) {
    dmMonsters.push(E.makeMonster(name, 0, { isPC: true, initiative: initiative }));
    dmSave();
    renderMonsters();
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
      dmCombat.active = false; dmCombat.round = 1; dmCombat.turnIndex = 0;
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
      if (act === 'remove-cond') {
        dmMonsters[idx] = E.removeCondition(dmMonsters[idx], btn.getAttribute('data-cond'));
        dmSave();
        renderMonsters();
        return;
      }
      var input = card.querySelector('.dm-amount');
      var amount = input ? input.value : 0;
      if (act === 'damage') { dmMonsters[idx] = E.applyDamage(dmMonsters[idx], amount); }
      else if (act === 'heal') { dmMonsters[idx] = E.applyHeal(dmMonsters[idx], amount); }
      dmSave();
      renderMonsters();
    });

    // 'change' delegato: menu « aggiungi stato » (.dm-cond-add) e campo iniziativa (.dm-init).
    $('dm-monster-list').addEventListener('change', function (e) {
      var card = e.target.closest('[data-mid]');
      if (!card) { return; }
      var idx = dmIndexOf(card.getAttribute('data-mid'));
      if (idx < 0) { return; }
      var m = dmMonsters[idx];
      if (e.target.classList.contains('dm-cond-add')) {
        var key = e.target.value;
        if (key) { dmMonsters[idx] = E.addCondition(m, key); dmSave(); renderMonsters(); }
        return;
      }
      if (e.target.classList.contains('dm-init')) {
        var raw = String(e.target.value).trim();
        var initVal = raw === '' ? null : E.toInt(raw, 0);
        dmMonsters[idx] = E.makeMonster(m.name, m.maxHp, {
          id: m.id, currentHp: m.currentHp, note: m.note,
          initiative: initVal, isPC: m.isPC, conditions: m.conditions
        });
        dmSave();
        renderMonsters();
      }
    });

    $('dm-quick-list').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-qi]');
      if (!btn) { return; }
      var mon = (DM.monsters || [])[parseInt(btn.getAttribute('data-qi'), 10)];
      if (!mon) { return; }
      dmAddMonsters(mon.name, mon.hp, 1, mon.note);
    });

    // Aggiunta di un personaggio (PG) all'ordine di iniziativa.
    $('dm-pc-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var initRaw = String($('dm-pc-init').value).trim();
      var init = initRaw === '' ? null : E.toInt(initRaw, 0);
      dmAddPc($('dm-pc-name').value, init);
      $('dm-pc-name').value = '';
      $('dm-pc-init').value = '';
      $('dm-pc-name').focus();
    });

    // Controlli del combattimento.
    $('dm-combat-start').addEventListener('click', startCombat);
    $('dm-combat-next').addEventListener('click', nextTurn);
    $('dm-combat-end').addEventListener('click', endCombat);

    initNames();
  }

  // ---- DM: generatore di nomi per PNG --------------------------------------
  function initNames() {
    if (!NAMES) { return; }
    var kindLabels = {
      png: t.dm.namesNpc, maschile: t.dm.namesMale, femminile: t.dm.namesFemale,
      taverna: t.dm.namesTavern, luogo: t.dm.namesPlace
    };
    var sel = $('dm-name-kind');
    sel.innerHTML = (NAMES.kinds || []).map(function (k) {
      return '<option value="' + esc(k) + '">' + esc(kindLabels[k] || k) + '</option>';
    }).join('');

    function generate() {
      var kind = sel.value || 'png';
      $('dm-name-out').innerHTML = NAMES.generateMany(6, kind).map(function (nm) {
        return '<button type="button" data-name="' + esc(nm) + '" title="' + esc(t.dm.namesCopied) + '" ' +
          'class="text-sm px-3 py-1.5 rounded-full bg-panel2 border border-edge text-parchment hover:border-gold/60 hover:text-gold transition">' +
          esc(nm) + '</button>';
      }).join('');
    }

    $('dm-name-gen').addEventListener('click', generate);
    sel.addEventListener('change', generate);
    $('dm-name-out').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-name]');
      if (btn) { copyName(btn.getAttribute('data-name'), btn); }
    });
    generate(); // primo set all'apertura
  }

  // Copia negli appunti con feedback visivo temporaneo sul chip.
  function copyName(name, btn) {
    function flash() {
      btn.textContent = t.dm.namesCopied;
      setTimeout(function () { btn.textContent = name; }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(name).then(flash, flash);
    } else {
      flash();
    }
  }

  // ---- Novità / Patch Notes ------------------------------------------------
  var PATCH_GROUP_COLOR = { added: '#34d399', improved: '#d9b65f', fixed: '#f87171' };

  // Una sezione (Aggiunto / Migliorato / Corretto): vuota → stringa vuota (non resa).
  function patchGroup(label, color, items) {
    if (!items || !items.length) { return ''; }
    return '' +
      '<div class="mt-3">' +
        '<div class="text-xs uppercase tracking-wide font-semibold mb-1.5" style="color:' + color + '">' + esc(label) + '</div>' +
        '<ul class="space-y-1.5">' +
          items.map(function (line) {
            return '<li class="flex gap-2 text-sm text-parchment/90 leading-snug">' +
              '<span aria-hidden="true" style="color:' + color + '">•</span>' +
              '<span>' + esc(line) + '</span></li>';
          }).join('') +
        '</ul>' +
      '</div>';
  }

  // Scheda di una versione con titolo, data e i tre gruppi di modifiche.
  function patchCard(v) {
    var date = v.date ? '<span class="text-xs text-muted whitespace-nowrap">' + esc(v.date) + '</span>' : '';
    var ver = '<span class="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/40 whitespace-nowrap">' + esc(t.patch.version) + ' ' + esc(v.version) + '</span>';
    return '' +
      '<article class="rounded-xl bg-panel border border-edge p-4 fade-in">' +
        '<div class="flex items-center justify-between gap-3 flex-wrap border-b border-edge/60 pb-3">' +
          '<div class="flex items-center gap-2 min-w-0">' + ver +
            '<h3 class="font-display text-base text-parchment leading-tight truncate">' + esc(v.title || '') + '</h3>' +
          '</div>' + date +
        '</div>' +
        patchGroup(t.patch.added, PATCH_GROUP_COLOR.added, v.added) +
        patchGroup(t.patch.improved, PATCH_GROUP_COLOR.improved, v.improved) +
        patchGroup(t.patch.fixed, PATCH_GROUP_COLOR.fixed, v.fixed) +
      '</article>';
  }

  function initPatch() {
    var list = $('patch-list');
    if (!list) { return; }
    var empty = $('patch-empty');
    if (!CHANGELOG.length) {
      list.innerHTML = '';
      if (empty) { empty.classList.remove('hidden'); }
      return;
    }
    if (empty) { empty.classList.add('hidden'); }
    list.innerHTML = CHANGELOG.map(patchCard).join('');
  }

  // ---- Lancio dei dadi -----------------------------------------------------
  var diceState = { sides: 20, count: 1, modifier: 0 };
  var diceHistory = [];
  var diceRolling = false;
  var diceAnimTimer = null;

  function diceReadInputs() {
    diceState.count = DICE.clampInt($('dice-qty').value, 1, DICE.MAX_COUNT, 1);
    diceState.modifier = DICE.clampInt($('dice-mod').value, -99, 99, 0);
  }
  function diceUpdateNotation() { $('dice-notation').textContent = DICE.notation(diceState); }

  function diceRenderTypes() {
    $('dice-types').innerHTML = DICE.DICE.map(function (d) {
      return '<button type="button" class="' + chipClass(d.sides === diceState.sides) + '" data-sides="' + d.sides + '">' + esc(d.label) + '</button>';
    }).join('');
  }
  function diceRestyleTypes() {
    Array.prototype.forEach.call($('dice-types').children, function (c) {
      c.className = chipClass(Number(c.getAttribute('data-sides')) === diceState.sides);
    });
  }

  function dieFaceHtml(value, cls) {
    return '<span class="die-face ' + cls + '">' + esc(String(value)) + '</span>';
  }
  function diceModText(mod) {
    if (mod > 0) { return ' + ' + mod; }
    if (mod < 0) { return ' - ' + Math.abs(mod); }
    return '';
  }

  function diceRenderHistory() {
    var box = $('dice-history');
    var empty = $('dice-history-empty');
    if (!diceHistory.length) { box.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
    box.innerHTML = diceHistory.map(function (h) {
      return '<div class="flex items-center justify-between gap-3 text-sm border-b border-edge/40 pb-2 last:border-0 last:pb-0">' +
        '<span class="text-muted shrink-0">' + esc(h.notation) + '</span>' +
        '<span class="text-parchment/80 truncate">' + esc(h.rolls.join(' + ') + diceModText(h.modifier)) + '</span>' +
        '<span class="font-display text-gold text-lg shrink-0">' + h.total + '</span>' +
        '</div>';
    }).join('');
  }

  // Mostra il risultato finale: facce ferme, totale e scomposizione.
  function diceShowResult(result) {
    $('dice-empty').classList.add('hidden');
    $('dice-faces').innerHTML = result.rolls.map(function (v) { return dieFaceHtml(v, 'settled'); }).join('');
    $('dice-total-wrap').classList.remove('hidden');
    $('dice-total-label').textContent = t.dice.total;
    var totalEl = $('dice-total');
    totalEl.textContent = result.total;
    totalEl.classList.remove('die-total'); void totalEl.offsetWidth; totalEl.classList.add('die-total'); // riavvia il "pop"
    var bd = t.dice.sumLabel + ' ' + result.sum;
    if (result.modifier) { bd += '  ·  ' + t.dice.modLabel + ' ' + (result.modifier > 0 ? '+' + result.modifier : result.modifier); }
    $('dice-breakdown').textContent = bd;
  }

  function diceDoRoll() {
    if (diceRolling) { return; }
    diceReadInputs();
    var result = DICE.roll(diceState); // RNG di default (Math.random)
    diceRolling = true;
    var btn = $('dice-roll');
    btn.disabled = true;
    btn.textContent = t.dice.rolling;
    $('dice-total-wrap').classList.add('hidden');
    $('dice-empty').classList.add('hidden');

    // Animazione: le facce "rotolano" mostrando numeri casuali, poi si fermano.
    var faces = $('dice-faces');
    faces.innerHTML = result.rolls.map(function () { return dieFaceHtml('?', 'is-rolling'); }).join('');
    var spins = 0;
    diceAnimTimer = window.setInterval(function () {
      spins++;
      Array.prototype.forEach.call(faces.children, function (el) { el.textContent = DICE.rollDie(result.sides); });
      if (spins >= 11) {
        window.clearInterval(diceAnimTimer);
        diceAnimTimer = null;
        diceShowResult(result);
        diceHistory.unshift({ notation: DICE.notation(diceState), rolls: result.rolls, modifier: result.modifier, total: result.total });
        if (diceHistory.length > 8) { diceHistory.pop(); }
        diceRenderHistory();
        diceRolling = false;
        btn.disabled = false;
        btn.textContent = t.dice.roll;
      }
    }, 55);
  }

  function initDice() {
    if (!DICE || !$('dice-types')) { return; } // modulo o markup assenti: salta senza rompere
    diceRenderTypes();
    diceUpdateNotation();
    diceRenderHistory();

    $('dice-types').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-sides]');
      if (!btn) { return; }
      diceState.sides = Number(btn.getAttribute('data-sides'));
      diceRestyleTypes();
      diceUpdateNotation();
    });
    $('dice-qty').addEventListener('input', function () { diceReadInputs(); diceUpdateNotation(); });
    $('dice-mod').addEventListener('input', function () { diceReadInputs(); diceUpdateNotation(); });
    $('dice-roll').addEventListener('click', diceDoRoll);
    $('dice-history-clear').addEventListener('click', function () { diceHistory = []; diceRenderHistory(); });
  }

  // ---- Build personalizzate ------------------------------------------------
  var BUILD_CTX = { itemById: ITEM_BY_ID, spellById: SPELL_BY_ID, classById: CLASS_BY_ID };
  var BUILD_VERDICT = {
    great:  { key: 'verdictGreat',  color: '#34d399' },
    good:   { key: 'verdictGood',   color: '#d9b65f' },
    review: { key: 'verdictReview', color: '#f87171' },
    empty:  { key: 'verdictEmpty',  color: '#9b94ac' }
  };

  function buildClassLabel(id) { return (CLASS_BY_ID[id] || { label: id }).label; }
  function buildTypeLabel(id) { return (ITEM_TYPE_BY_ID[id] || { label: id }).label; }

  // Traduce un codice di evaluateBuild nel messaggio localizzato, interpolando i campi.
  function buildMessage(entry) {
    var tpl = (t.build.msg && t.build.msg[entry.code]) || entry.code;
    return tpl
      .replace(/\{used\}/g, entry.used)
      .replace(/\{max\}/g, entry.max)
      .replace(/\{count\}/g, entry.count)
      .replace(/\{clazz\}/g, buildClassLabel(entry.clazz))
      .replace(/\{type\}/g, buildTypeLabel(entry.type));
  }

  function buildLoad() {
    try {
      var raw = window.localStorage.getItem(BUILD_STORE_KEY);
      if (!raw) { return []; }
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) { return []; }
      return arr.map(function (b) {
        return BUILDS.makeBuild(b.name, b.clazz, { id: b.id, itemIds: b.itemIds, spellIds: b.spellIds });
      });
    } catch (e) { return []; }
  }
  function buildSave() {
    try { window.localStorage.setItem(BUILD_STORE_KEY, JSON.stringify(builds)); } catch (e) { /* spazio non disponibile: ignora */ }
  }
  function activeBuild() {
    for (var i = 0; i < builds.length; i++) { if (builds[i].id === activeBuildId) { return builds[i]; } }
    return null;
  }
  function buildIndexOf(id) {
    for (var i = 0; i < builds.length; i++) { if (builds[i].id === id) { return i; } }
    return -1;
  }
  // Rimpiazza in elenco la build attiva con la sua nuova versione (immutabile) e salva.
  function replaceActive(next) {
    var idx = buildIndexOf(activeBuildId);
    if (idx < 0) { return; }
    builds[idx] = next;
    buildSave();
  }
  function setActiveBuild(id) {
    activeBuildId = id;
    buildItemQuery = '';
    buildSpellQuery = '';
  }

  // Opzioni del menu classe (con voce « Nessuna classe »).
  function buildClassOptions(selected) {
    return '<option value="">' + esc(t.build.noClass) + '</option>' +
      D.CLASSES.map(function (c) {
        return '<option value="' + esc(c.id) + '"' + (c.id === selected ? ' selected' : '') + '>' + esc(c.label) + '</option>';
      }).join('');
  }

  // Elenco delle build salvate (colonna sinistra).
  function renderBuildList() {
    var box = $('build-list');
    if (!box) { return; }
    var n = builds.length;
    $('build-count').textContent = n + ' ' + (n === 1 ? t.build.countOne : t.build.count);
    $('build-saved-empty').classList.toggle('hidden', n !== 0);
    box.innerHTML = builds.map(function (b) {
      var active = b.id === activeBuildId;
      var clazz = b.clazz ? buildClassLabel(b.clazz) : t.build.noClass;
      var counts = (b.itemIds || []).length + ' ' + t.build.itemsCount + ' · ' + (b.spellIds || []).length + ' ' + t.build.spellsCount;
      var wrap = 'rounded-lg border px-3 py-2 transition ' +
        (active ? 'border-gold/70 bg-gold/10' : 'border-edge bg-panel2/60 hover:border-gold/50');
      return '<div data-bid="' + esc(b.id) + '" class="' + wrap + '">' +
        '<div class="flex items-center justify-between gap-2">' +
          '<button type="button" data-act="select" class="text-left min-w-0 flex-1">' +
            '<span class="block font-display text-sm text-parchment truncate">' + esc(b.name) + '</span>' +
            '<span class="block text-[11px] text-muted truncate">' + esc(clazz) + ' · ' + esc(counts) + '</span>' +
          '</button>' +
          '<div class="flex items-center gap-1 shrink-0">' +
            '<button type="button" data-act="duplicate" title="' + esc(t.build.duplicate) + '" aria-label="' + esc(t.build.duplicate) + '" class="w-7 h-7 rounded border border-edge text-muted hover:text-gold hover:border-gold/60 flex items-center justify-center text-xs leading-none">&#10697;</button>' +
            '<button type="button" data-act="delete" title="' + esc(t.build.delete) + '" aria-label="' + esc(t.build.delete) + '" class="w-7 h-7 rounded border border-edge text-muted hover:text-crimson hover:border-crimson/60 flex items-center justify-center text-sm leading-none">&times;</button>' +
          '</div>' +
        '</div>' +
        (active ? '<span class="mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/40">' + esc(t.build.active) + '</span>' : '') +
      '</div>';
    }).join('');
  }

  // Editor completo della build attiva. Ricostruito per intero solo quando cambia
  // la build attiva o la classe; gli aggiornamenti minori toccano i sotto-contenitori.
  function renderBuildEditor() {
    var editor = $('build-editor');
    var empty = $('build-editor-empty');
    if (!editor) { return; }
    var b = activeBuild();
    if (!b) {
      editor.classList.add('hidden');
      editor.classList.remove('flex');
      editor.innerHTML = '';
      if (empty) { empty.classList.remove('hidden'); }
      return;
    }
    if (empty) { empty.classList.add('hidden'); }
    editor.classList.remove('hidden');
    editor.classList.add('flex');

    var info = CLASS_BY_ID[b.clazz] || null;
    var isCaster = !!(info && info.caster);

    var spellsSection = isCaster
      ? '<h4 class="font-display text-base text-parchment mb-2">' + esc(t.build.spellsTitle) + '</h4>' +
        '<div id="build-spells" class="grid gap-2 sm:grid-cols-2"></div>' +
        '<p id="build-spells-empty" class="text-xs text-muted py-2"></p>' +
        '<input id="build-spell-search" type="search" autocomplete="off" placeholder="' + esc(t.build.spellSearch) + '" ' +
          'class="mt-2 w-full rounded-lg bg-panel2 border border-edge px-3 py-2 text-sm text-parchment placeholder-muted focus:outline-none focus:border-gold/70" />' +
        '<div id="build-spell-results" class="mt-2 flex flex-col gap-1.5"></div>'
      : '<h4 class="font-display text-base text-parchment mb-2">' + esc(t.build.spellsTitle) + '</h4>' +
        '<p class="text-sm text-muted rounded-lg border border-dashed border-edge px-3 py-3">' + esc(t.build.spellsNonCaster) + '</p>';

    editor.innerHTML =
      '<div class="rounded-xl bg-panel border border-edge p-4">' +
        '<div class="grid gap-3 sm:grid-cols-3">' +
          '<div class="sm:col-span-2">' +
            '<label class="block text-[11px] uppercase tracking-wider text-muted mb-1" for="build-ed-name">' + esc(t.build.name) + '</label>' +
            '<input id="build-ed-name" type="text" autocomplete="off" value="' + esc(b.name) + '" ' +
              'class="w-full rounded-lg bg-panel2 border border-edge px-3 py-2 text-parchment focus:outline-none focus:border-gold/70" />' +
          '</div>' +
          '<div>' +
            '<label class="block text-[11px] uppercase tracking-wider text-muted mb-1" for="build-ed-class">' + esc(t.build.class) + '</label>' +
            '<select id="build-ed-class" class="w-full rounded-lg bg-panel2 border border-edge px-3 py-2 text-parchment focus:outline-none focus:border-gold/70">' + buildClassOptions(b.clazz) + '</select>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="rounded-xl bg-panel border border-edge p-4">' +
        '<h4 class="font-display text-base text-parchment mb-2">' + esc(t.build.itemsTitle) + '</h4>' +
        '<div id="build-items" class="grid gap-2 sm:grid-cols-2"></div>' +
        '<p id="build-items-empty" class="text-xs text-muted py-2"></p>' +
        '<input id="build-item-search" type="search" autocomplete="off" placeholder="' + esc(t.build.itemSearch) + '" ' +
          'class="mt-2 w-full rounded-lg bg-panel2 border border-edge px-3 py-2 text-sm text-parchment placeholder-muted focus:outline-none focus:border-gold/70" />' +
        '<div id="build-item-results" class="mt-2 flex flex-col gap-1.5"></div>' +
      '</div>' +
      '<div class="rounded-xl bg-panel border border-edge p-4">' + spellsSection + '</div>' +
      '<div id="build-assist"></div>';

    var itemSearch = $('build-item-search');
    if (itemSearch) { itemSearch.value = buildItemQuery; }
    var spellSearch = $('build-spell-search');
    if (spellSearch) { spellSearch.value = buildSpellQuery; }

    renderBuildItems();
    renderBuildSpells();
    renderItemSearch();
    renderSpellSearch();
    renderBuildAssist();
  }

  function buildItemChip(item) {
    var r = RARITY_BY_ID[item.rarity] || { label: item.rarity, color: '#888' };
    var att = item.attunement ? '<span class="text-[10px] text-gold/90 whitespace-nowrap">' + esc(t.common.attunement) + '</span>' : '';
    return '<div class="flex items-center gap-2 rounded-lg bg-panel2 border border-edge pl-2 pr-1 py-1" style="border-left:3px solid ' + r.color + '">' +
      '<button type="button" data-act="open-item" data-id="' + esc(item.id) + '" class="flex-1 min-w-0 text-left text-sm text-parchment hover:text-gold transition truncate">' + esc(item.name) + '</button>' + att +
      '<button type="button" data-act="remove-item" data-id="' + esc(item.id) + '" aria-label="' + esc(t.build.remove) + '" class="w-6 h-6 rounded border border-edge text-muted hover:text-crimson hover:border-crimson/60 flex items-center justify-center text-sm leading-none shrink-0">&times;</button>' +
    '</div>';
  }
  function renderBuildItems() {
    var b = activeBuild();
    var box = $('build-items');
    if (!b || !box) { return; }
    var items = (b.itemIds || []).map(function (id) { return ITEM_BY_ID[id]; }).filter(Boolean);
    box.innerHTML = items.map(buildItemChip).join('');
    var empty = $('build-items-empty');
    if (empty) { empty.textContent = t.build.itemsEmpty; empty.classList.toggle('hidden', items.length !== 0); }
  }

  function buildSpellChip(spell) {
    var color = SCHOOL_COLORS[spell.school] || '#888';
    return '<div class="flex items-center gap-2 rounded-lg bg-panel2 border border-edge pl-2 pr-1 py-1" style="border-left:3px solid ' + color + '">' +
      '<span class="shrink-0 w-6 h-6 rounded flex items-center justify-center font-display text-[11px] font-bold" style="background:' + color + '22;color:' + color + ';border:1px solid ' + color + '66">' + (spell.level === 0 ? '0' : spell.level) + '</span>' +
      '<button type="button" data-act="open-spell" data-id="' + esc(spell.id) + '" class="flex-1 min-w-0 text-left text-sm text-parchment hover:text-gold transition truncate">' + esc(spell.name) + '</button>' +
      '<button type="button" data-act="remove-spell" data-id="' + esc(spell.id) + '" aria-label="' + esc(t.build.remove) + '" class="w-6 h-6 rounded border border-edge text-muted hover:text-crimson hover:border-crimson/60 flex items-center justify-center text-sm leading-none shrink-0">&times;</button>' +
    '</div>';
  }
  function renderBuildSpells() {
    var b = activeBuild();
    var box = $('build-spells');
    if (!b || !box) { return; } // sezione assente per i non-incantatori
    var spells = (b.spellIds || []).map(function (id) { return SPELL_BY_ID[id]; }).filter(Boolean);
    box.innerHTML = spells.map(buildSpellChip).join('');
    var empty = $('build-spells-empty');
    if (empty) { empty.textContent = t.build.spellsEmpty; empty.classList.toggle('hidden', spells.length !== 0); }
  }

  // Riga di un risultato di ricerca: « + Aggiungi » oppure stato « già nella build ».
  function buildSearchRow(kind, id, name, tag, has) {
    var cls = 'w-full text-left flex items-center gap-2 rounded-lg border px-2 py-1.5 transition ' +
      (has ? 'border-edge/50 bg-panel2/40 opacity-60 cursor-default' : 'border-edge bg-panel2 hover:border-gold/60');
    var tail = has
      ? '<span class="text-[10px] text-muted whitespace-nowrap">' + esc(t.build.inBuild) + '</span>'
      : '<span class="text-[11px] text-gold whitespace-nowrap font-semibold">+ ' + esc(t.build.add) + '</span>';
    return '<button type="button"' + (has ? ' disabled' : ' data-act="add-' + kind + '"') + ' data-id="' + esc(id) + '" class="' + cls + '">' +
      '<span class="flex-1 min-w-0 truncate text-sm text-parchment">' + esc(name) + '</span>' + badge(tag.label, tag.color) + tail +
    '</button>';
  }
  function renderItemSearch() {
    var box = $('build-item-results');
    if (!box) { return; }
    var b = activeBuild();
    var q = (buildItemQuery || '').trim();
    if (!b || !q) { box.innerHTML = ''; return; }
    var list = D.filterItems(ITEMS, { text: q }).slice(0, 8);
    if (!list.length) { box.innerHTML = '<p class="text-xs text-muted px-1 py-1">' + esc(t.build.searchEmpty) + '</p>'; return; }
    box.innerHTML = list.map(function (item) {
      return buildSearchRow('item', item.id, item.name, RARITY_BY_ID[item.rarity] || { label: item.rarity, color: '#888' }, (b.itemIds || []).indexOf(item.id) !== -1);
    }).join('');
  }
  function renderSpellSearch() {
    var box = $('build-spell-results');
    if (!box) { return; }
    var b = activeBuild();
    var q = (buildSpellQuery || '').trim();
    if (!b || !q) { box.innerHTML = ''; return; }
    var list = D.filterSpells(SPELLS, { text: q }).slice(0, 8);
    if (!list.length) { box.innerHTML = '<p class="text-xs text-muted px-1 py-1">' + esc(t.build.searchEmpty) + '</p>'; return; }
    box.innerHTML = list.map(function (spell) {
      return buildSearchRow('spell', spell.id, spell.name, { label: levelLabel(spell.level), color: SCHOOL_COLORS[spell.school] || '#888' }, (b.spellIds || []).indexOf(spell.id) !== -1);
    }).join('');
  }

  function buildAssistGroup(title, color, entries) {
    if (!entries || !entries.length) { return ''; }
    return '<div class="mt-3">' +
      '<div class="text-xs uppercase tracking-wide font-semibold mb-1.5" style="color:' + color + '">' + esc(title) + '</div>' +
      '<ul class="space-y-1.5">' +
      entries.map(function (en) {
        return '<li class="flex gap-2 text-sm text-parchment/90 leading-snug">' +
          '<span aria-hidden="true" style="color:' + color + '">•</span><span>' + esc(buildMessage(en)) + '</span></li>';
      }).join('') +
      '</ul></div>';
  }
  function renderBuildAssist() {
    var box = $('build-assist');
    var b = activeBuild();
    if (!box || !b) { return; }
    var rep = BUILDS.evaluateBuild(b, BUILD_CTX);
    var v = BUILD_VERDICT[rep.verdict] || BUILD_VERDICT.empty;
    box.innerHTML =
      '<div class="rounded-xl bg-panel border border-edge p-4">' +
        '<div class="flex items-center justify-between gap-3 flex-wrap">' +
          '<h4 class="font-display text-base text-parchment">' + esc(t.build.assistantTitle) + '</h4>' +
          '<span class="text-sm font-display font-semibold" style="color:' + v.color + '">' + esc(t.build[v.key]) + '</span>' +
        '</div>' +
        '<div class="mt-3 flex items-center gap-3">' +
          '<span class="font-display text-3xl font-bold tabular-nums" style="color:' + v.color + '">' + rep.score + '</span>' +
          '<span class="text-xs text-muted whitespace-nowrap">/ 100 · ' + esc(t.build.score) + '</span>' +
          '<div class="flex-1 h-2 rounded-full bg-ink/70 border border-edge/60 overflow-hidden">' +
            '<div class="h-full rounded-full" style="width:' + rep.score + '%;background:' + v.color + '"></div>' +
          '</div>' +
        '</div>' +
        '<div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">' +
          '<span>' + rep.itemCount + ' ' + esc(t.build.itemsCount) + '</span>' +
          '<span>' + rep.spellCount + ' ' + esc(t.build.spellsCount) + '</span>' +
          '<span>' + esc(t.build.attunement) + ': ' + rep.attunementUsed + ' / ' + rep.attunementMax + '</span>' +
        '</div>' +
        buildAssistGroup(t.build.problemsTitle, '#f87171', rep.warnings) +
        buildAssistGroup(t.build.suggestionsTitle, '#d9b65f', rep.suggestions) +
        buildAssistGroup(t.build.positivesTitle, '#34d399', rep.positives) +
      '</div>';
  }

  function initBuild() {
    if (!BUILDS) { return; } // modulo non caricato: salta senza rompere il resto
    builds = buildLoad();
    if (builds.length) { activeBuildId = builds[0].id; }

    $('build-class').innerHTML = buildClassOptions('');

    // Crea una nuova build dal form e la rende attiva.
    $('build-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var b = BUILDS.makeBuild($('build-name').value, $('build-class').value, {});
      builds.unshift(b);
      setActiveBuild(b.id);
      buildSave();
      $('build-name').value = '';
      $('build-class').value = '';
      renderBuildList();
      renderBuildEditor();
    });

    // Elenco build: selezione, duplica, elimina (un solo listener delegato).
    $('build-list').addEventListener('click', function (e) {
      var card = e.target.closest('[data-bid]');
      if (!card) { return; }
      var id = card.getAttribute('data-bid');
      var btn = e.target.closest('[data-act]');
      var act = btn ? btn.getAttribute('data-act') : 'select';
      if (act === 'select') {
        if (id !== activeBuildId) { setActiveBuild(id); renderBuildList(); renderBuildEditor(); }
        return;
      }
      if (act === 'duplicate') {
        var src = builds[buildIndexOf(id)];
        if (!src) { return; }
        var copy = BUILDS.makeBuild(src.name + ' (copia)', src.clazz, { itemIds: src.itemIds, spellIds: src.spellIds });
        builds.unshift(copy);
        setActiveBuild(copy.id);
        buildSave();
        renderBuildList();
        renderBuildEditor();
        return;
      }
      if (act === 'delete') {
        if (!window.confirm(t.build.confirmDelete)) { return; }
        builds = builds.filter(function (x) { return x.id !== id; });
        if (activeBuildId === id) { activeBuildId = builds.length ? builds[0].id : null; buildItemQuery = ''; buildSpellQuery = ''; }
        buildSave();
        renderBuildList();
        renderBuildEditor();
      }
    });

    // Editor — input delegato: rinomina e campi di ricerca (focus preservato:
    // aggiorniamo solo i sotto-contenitori, non l'intero editor).
    $('build-editor').addEventListener('input', function (e) {
      if (e.target.id === 'build-ed-name') {
        var b = activeBuild();
        if (b) { replaceActive(BUILDS.rename(b, e.target.value)); renderBuildList(); }
        return;
      }
      if (e.target.id === 'build-item-search') { buildItemQuery = e.target.value; renderItemSearch(); return; }
      if (e.target.id === 'build-spell-search') { buildSpellQuery = e.target.value; renderSpellSearch(); }
    });

    // Editor — change delegato: la classe (la sezione incantesimi dipende da essa).
    $('build-editor').addEventListener('change', function (e) {
      if (e.target.id === 'build-ed-class') {
        var b = activeBuild();
        if (!b) { return; }
        replaceActive(BUILDS.setClass(b, e.target.value));
        renderBuildList();
        renderBuildEditor();
      }
    });

    // Editor — click delegato: apri dettaglio, aggiungi/rimuovi oggetti e incantesimi.
    $('build-editor').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) { return; }
      var act = btn.getAttribute('data-act');
      var id = btn.getAttribute('data-id');
      var b = activeBuild();
      if (!b) { return; }
      if (act === 'open-item') { openItemDrawer(id); return; }
      if (act === 'open-spell') { openSpellDrawer(id); return; }
      if (act === 'add-item') { replaceActive(BUILDS.addItem(b, id)); renderBuildItems(); renderItemSearch(); renderBuildAssist(); return; }
      if (act === 'remove-item') { replaceActive(BUILDS.removeItem(b, id)); renderBuildItems(); renderItemSearch(); renderBuildAssist(); return; }
      if (act === 'add-spell') { replaceActive(BUILDS.addSpell(b, id)); renderBuildSpells(); renderSpellSearch(); renderBuildAssist(); return; }
      if (act === 'remove-spell') { replaceActive(BUILDS.removeSpell(b, id)); renderBuildSpells(); renderSpellSearch(); renderBuildAssist(); }
    });

    renderBuildList();
    renderBuildEditor();
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
    initBuild();
    initDice();
    initPatch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
