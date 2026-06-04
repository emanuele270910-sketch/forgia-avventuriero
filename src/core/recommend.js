/*
 * recommend.js — Assistente Build: motore di raccomandazione a regole.
 *
 * Logica deterministica (nessun servizio esterno): assegna un punteggio di
 * affinita a ogni oggetto in base a classe, livello e caratteristiche, rispetta
 * il tetto di rarita per livello e il budget di sintonia (max 3), e suggerisce
 * incantesimi castabili per le classi incantatrici.
 */
(function (root, factory) {
  'use strict';
  var mod = factory(root);
  if (typeof module !== 'undefined' && module.exports) { module.exports = mod; }
  if (root) { root.DND = root.DND || {}; Object.assign(root.DND, mod); }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  var constants = (root && root.DND && root.DND.CLASS_BY_ID)
    ? root.DND
    : (typeof require !== 'undefined' ? require('./constants.js') : null);

  var CLASS_BY_ID = constants.CLASS_BY_ID;
  var RARITIES = constants.RARITIES;

  var MAX_ATTUNEMENT = 3;
  var MAX_ITEMS = 6;

  var RARITY_ORDER = {};
  RARITIES.forEach(function (r) { RARITY_ORDER[r.id] = r.order; });

  // Equipaggiamento preferito per classe: types = categorie sensate,
  // ac = trae beneficio da bonus alla CA, atk = combatte con attacchi d'arma.
  var GEAR = {
    barbarian: { types: ['weapon', 'wondrous', 'ring'], ac: false, atk: true },
    fighter:   { types: ['weapon', 'armor', 'shield', 'wondrous', 'ring'], ac: true, atk: true },
    paladin:   { types: ['weapon', 'armor', 'shield', 'wondrous', 'ring'], ac: true, atk: true },
    ranger:    { types: ['weapon', 'armor', 'wondrous', 'ring'], ac: true, atk: true },
    rogue:     { types: ['weapon', 'wondrous', 'ring'], ac: false, atk: true },
    monk:      { types: ['weapon', 'wondrous', 'ring'], ac: false, atk: true },
    cleric:    { types: ['armor', 'shield', 'wondrous', 'staff', 'wand', 'ring'], ac: true, atk: false },
    druid:     { types: ['wondrous', 'staff', 'wand', 'ring'], ac: false, atk: false },
    bard:      { types: ['weapon', 'wondrous', 'wand', 'ring'], ac: false, atk: true },
    sorcerer:  { types: ['wondrous', 'wand', 'staff', 'rod', 'ring'], ac: false, atk: false },
    warlock:   { types: ['wondrous', 'wand', 'staff', 'rod', 'ring'], ac: false, atk: false },
    wizard:    { types: ['wondrous', 'wand', 'staff', 'rod', 'ring'], ac: false, atk: false }
  };

  var SLOT_CAP = { weapon: 1, armor: 1, shield: 1, ring: 2 };

  function clampLevel(level) {
    level = parseInt(level, 10);
    if (isNaN(level) || level < 1) { return 1; }
    if (level > 20) { return 20; }
    return level;
  }

  // Tetto di rarita per livello (ordine massimo accettato). Gli artefatti
  // (ordine 5) non vengono mai raccomandati automaticamente: sono oggetti da GM.
  function rarityCapOrderForLevel(level) {
    level = clampLevel(level);
    if (level <= 4) { return 1; }   // fino a non comune
    if (level <= 10) { return 2; }  // fino a raro
    if (level <= 16) { return 3; }  // fino a molto raro
    return 4;                       // fino a leggendario
  }

  // Livello massimo di incantesimo lanciabile.
  function maxSpellLevelFor(clazz, level) {
    level = clampLevel(level);
    var info = CLASS_BY_ID[clazz];
    if (!info || !info.caster) { return 0; }
    // Semi-incantatori: paladino e ranger (iniziano al 2° livello di classe).
    if (clazz === 'paladin' || clazz === 'ranger') {
      if (level < 2) { return 0; }
      if (level <= 4) { return 1; }
      if (level <= 8) { return 2; }
      if (level <= 12) { return 3; }
      if (level <= 16) { return 4; }
      return 5;
    }
    // Incantatori pieni (e warlock, approssimato per livello tematico).
    return Math.min(9, Math.ceil(level / 2));
  }

  function isPrimaryAbility(info, ability) {
    if (!info) { return false; }
    if (ability === info.castingAbility) { return true; }
    return (info.primary || []).indexOf(ability) !== -1;
  }

  // Punteggio di affinita di un oggetto per una build. Esposto per i test.
  function scoreItemForBuild(item, input) {
    var clazz = input.clazz;
    var info = CLASS_BY_ID[clazz];
    var gear = GEAR[clazz] || { types: [], ac: false, atk: false };
    var abilities = input.abilities || {};
    var b = item.bonus || {};
    var reasons = [];
    var s = (RARITY_ORDER[item.rarity] || 0) * 2;

    // Categorie incompatibili con la classe: escluse a priori (mai raccomandate).
    var incompatible =
      (item.type === 'weapon' && !gear.atk) ||
      ((item.type === 'armor' || item.type === 'shield') && gear.types.indexOf(item.type) === -1) ||
      ((item.type === 'wand' || item.type === 'staff' || item.type === 'rod') && !(info && info.caster));
    if (incompatible) { return { score: -100, reasons: [], typeMatch: false }; }

    var typeMatch = gear.types.indexOf(item.type) !== -1;
    if (typeMatch) { s += 5; }

    if (gear.atk) {
      if (b.weaponBonus) { s += b.weaponBonus * 4; reasons.push('Potenzia i tuoi attacchi con +' + b.weaponBonus); }
      if (item.type === 'weapon') { s += 3; }
    }

    if (gear.ac && b.acBonus) {
      s += b.acBonus * 4; reasons.push('Migliora la Classe Armatura di +' + b.acBonus);
    } else if (!gear.ac && b.acBonus && (item.type === 'wondrous' || item.type === 'ring')) {
      s += b.acBonus * 2; reasons.push('Classe Armatura extra senza armatura');
    }

    if (b.saveBonus) { s += b.saveBonus * 2; reasons.push('Rinforza i tiri salvezza di +' + b.saveBonus); }

    if (info && info.caster) {
      if (b.spellSaveDcBonus) { s += b.spellSaveDcBonus * 5; reasons.push('Aumenta la CD dei tuoi incantesimi di +' + b.spellSaveDcBonus); }
      if (b.spellAttackBonus) { s += b.spellAttackBonus * 4; reasons.push('Migliora i tiri per colpire con incantesimi di +' + b.spellAttackBonus); }
    }

    if (b.setAbility) {
      var ab = b.setAbility.ability;
      var target = b.setAbility.score;
      var cur = typeof abilities[ab] === 'number' ? abilities[ab] : 10;
      var gain = Math.max(0, target - cur);
      if (isPrimaryAbility(info, ab)) {
        s += 6 + Math.min(gain, 10);
        if (gain > 0) { reasons.push('Porta ' + ab.toUpperCase() + ' a ' + target + ' (caratteristica chiave)'); }
        else { reasons.push('Garantisce ' + ab.toUpperCase() + ' ' + target); }
      } else {
        s += 1;
      }
    }

    if (b.abilityBonus) {
      Object.keys(b.abilityBonus).forEach(function (ab2) {
        var amt = b.abilityBonus[ab2];
        if (isPrimaryAbility(info, ab2)) {
          s += 4 * Math.abs(amt);
          reasons.push('Aumenta ' + ab2.toUpperCase() + ' di +' + amt + ' (caratteristica chiave)');
        } else {
          s += 1;
        }
      });
    }

    if (b.abilityCheckBonus) { s += b.abilityCheckBonus; }
    if (b.resist) { s += 1; }

    return { score: s, reasons: reasons, typeMatch: typeMatch };
  }

  function compareScored(a, b) {
    if (b.score !== a.score) { return b.score - a.score; }
    var ro = (RARITY_ORDER[b.item.rarity] || 0) - (RARITY_ORDER[a.item.rarity] || 0);
    if (ro !== 0) { return ro; }
    return a.item.name.localeCompare(b.item.name);
  }

  // Seleziona un loadout coerente rispettando diversita di slot e budget sintonia.
  function buildLoadout(scored) {
    var slotCount = {};
    var attuneUsed = 0;
    var picks = [];
    for (var i = 0; i < scored.length && picks.length < MAX_ITEMS; i++) {
      var entry = scored[i];
      if (entry.score <= 0) { continue; }
      var item = entry.item;
      var cap = SLOT_CAP[item.type] !== undefined ? SLOT_CAP[item.type] : 99;
      var used = slotCount[item.type] || 0;
      if (used >= cap) { continue; }
      if (item.attunement && attuneUsed >= MAX_ATTUNEMENT) { continue; }
      slotCount[item.type] = used + 1;
      var willAttune = item.attunement === true;
      if (willAttune) { attuneUsed++; }
      picks.push({
        item: item,
        score: entry.score,
        attune: willAttune,
        reason: entry.reasons.length ? entry.reasons.join('. ') : 'Equipaggiamento solido e adatto alla classe.'
      });
    }
    return { picks: picks, attunementUsed: attuneUsed };
  }

  function recommendSpells(clazz, level, spells) {
    var maxLvl = maxSpellLevelFor(clazz, level);
    var info = CLASS_BY_ID[clazz];
    if (!info || !info.caster) {
      return { maxSpellLevel: 0, spells: [], note: 'noncaster' };
    }
    if (maxLvl < 1) {
      return { maxSpellLevel: 0, spells: [], note: 'noslots' };
    }
    var available = (spells || []).filter(function (sp) {
      return (sp.classes || []).indexOf(clazz) !== -1 && sp.level <= maxLvl;
    });
    // Per ogni livello disponibile (dal piu alto) scegli fino a 2 incantesimi.
    var byLevel = {};
    available.forEach(function (sp) {
      (byLevel[sp.level] = byLevel[sp.level] || []).push(sp);
    });
    var picks = [];
    for (var lvl = maxLvl; lvl >= 0 && picks.length < 8; lvl--) {
      var bucket = (byLevel[lvl] || []).slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
      for (var j = 0; j < bucket.length && j < 2 && picks.length < 8; j++) {
        var sp = bucket[j];
        picks.push({
          spell: sp,
          reason: lvl === 0
            ? 'Trucchetto sempre disponibile per la tua classe.'
            : 'Incantesimo di livello ' + lvl + ' alla portata del tuo personaggio.'
        });
      }
    }
    return { maxSpellLevel: maxLvl, spells: picks, note: null };
  }

  function resolveData(data) {
    if (data && (data.items || data.spells)) {
      return { items: data.items || [], spells: data.spells || [] };
    }
    var ns = (root && root.DND) ? root.DND : {};
    return { items: ns.items || [], spells: ns.spells || [] };
  }

  /*
   * input: { clazz, subclass?, level, abilities:{str,dex,con,int,wis,cha} }
   * data:  { items, spells }  (facoltativo; default ai dati globali)
   */
  function recommendBuild(input, data) {
    input = input || {};
    var clazz = input.clazz;
    var info = CLASS_BY_ID[clazz];
    var level = clampLevel(input.level);
    var resolved = resolveData(data);

    if (!info) {
      return {
        valid: false, error: 'Classe non riconosciuta',
        clazz: clazz, className: clazz, level: level,
        items: [], attunementUsed: 0, attunementMax: MAX_ATTUNEMENT,
        maxSpellLevel: 0, spells: [], spellNote: 'noncaster'
      };
    }

    var capOrder = rarityCapOrderForLevel(level);
    var scored = resolved.items
      .filter(function (item) { return (RARITY_ORDER[item.rarity] || 0) <= capOrder; })
      .map(function (item) {
        var sc = scoreItemForBuild(item, { clazz: clazz, level: level, abilities: input.abilities });
        return { item: item, score: sc.score, reasons: sc.reasons };
      })
      .sort(compareScored);

    var loadout = buildLoadout(scored);
    var spellRec = recommendSpells(clazz, level, resolved.spells);

    return {
      valid: true,
      clazz: clazz,
      className: info.label,
      subclass: input.subclass || '',
      level: level,
      role: info.role,
      caster: info.caster,
      rarityCapOrder: capOrder,
      attunementMax: MAX_ATTUNEMENT,
      attunementUsed: loadout.attunementUsed,
      items: loadout.picks,
      maxSpellLevel: spellRec.maxSpellLevel,
      spells: spellRec.spells,
      spellNote: spellRec.note
    };
  }

  return {
    recommendBuild: recommendBuild,
    scoreItemForBuild: scoreItemForBuild,
    maxSpellLevelFor: maxSpellLevelFor,
    rarityCapOrderForLevel: rarityCapOrderForLevel,
    MAX_ATTUNEMENT: MAX_ATTUNEMENT
  };
});
