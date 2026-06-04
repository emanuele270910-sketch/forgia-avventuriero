/*
 * constants.js — Enumerazioni condivise (rarità, scuole, classi, ecc.)
 * Pattern UMD-lite: funziona sia nel browser (window.DND) sia in Node (require).
 */
(function (root, factory) {
  'use strict';
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = mod; }
  if (root) { root.DND = root.DND || {}; Object.assign(root.DND, mod); }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Rarità in ordine crescente di potenza. `order` serve per il gating per livello.
  var RARITIES = [
    { id: 'common',    label: 'Comune',      order: 0, color: '#9ca3af' },
    { id: 'uncommon',  label: 'Non comune',  order: 1, color: '#22c55e' },
    { id: 'rare',      label: 'Raro',        order: 2, color: '#3b82f6' },
    { id: 'very-rare', label: 'Molto raro',  order: 3, color: '#a855f7' },
    { id: 'legendary', label: 'Leggendario', order: 4, color: '#f59e0b' },
    { id: 'artifact',  label: 'Artefatto',   order: 5, color: '#ef4444' }
  ];

  var ITEM_TYPES = [
    { id: 'weapon',   label: 'Arma' },
    { id: 'armor',    label: 'Armatura' },
    { id: 'shield',   label: 'Scudo' },
    { id: 'wondrous', label: 'Oggetto meraviglioso' },
    { id: 'ring',     label: 'Anello' },
    { id: 'rod',      label: 'Bacchetta da combattimento' },
    { id: 'staff',    label: 'Bastone' },
    { id: 'wand',     label: 'Bacchetta' },
    { id: 'potion',   label: 'Pozione' },
    { id: 'scroll',   label: 'Pergamena' }
  ];

  var SCHOOLS = [
    { id: 'abjuration',     label: 'Abiurazione' },
    { id: 'conjuration',    label: 'Evocazione (Conjuration)' },
    { id: 'divination',     label: 'Divinazione' },
    { id: 'enchantment',    label: 'Ammaliamento' },
    { id: 'evocation',      label: 'Invocazione (Evocation)' },
    { id: 'illusion',       label: 'Illusione' },
    { id: 'necromancy',     label: 'Necromanzia' },
    { id: 'transmutation',  label: 'Trasmutazione' }
  ];

  // role: martial | skirmisher | hybrid | caster
  var CLASSES = [
    { id: 'barbarian', label: 'Barbaro',    caster: false, role: 'martial',    castingAbility: null,  primary: ['str', 'con'] },
    { id: 'bard',      label: 'Bardo',      caster: true,  role: 'caster',     castingAbility: 'cha', primary: ['cha', 'dex'] },
    { id: 'cleric',    label: 'Chierico',   caster: true,  role: 'caster',     castingAbility: 'wis', primary: ['wis'] },
    { id: 'druid',     label: 'Druido',     caster: true,  role: 'caster',     castingAbility: 'wis', primary: ['wis'] },
    { id: 'fighter',   label: 'Guerriero',  caster: false, role: 'martial',    castingAbility: null,  primary: ['str', 'dex'] },
    { id: 'monk',      label: 'Monaco',     caster: false, role: 'martial',    castingAbility: null,  primary: ['dex', 'wis'] },
    { id: 'paladin',   label: 'Paladino',   caster: true,  role: 'hybrid',     castingAbility: 'cha', primary: ['str', 'cha'] },
    { id: 'ranger',    label: 'Ranger',     caster: true,  role: 'hybrid',     castingAbility: 'wis', primary: ['dex', 'wis'] },
    { id: 'rogue',     label: 'Ladro',      caster: false, role: 'skirmisher', castingAbility: null,  primary: ['dex'] },
    { id: 'sorcerer',  label: 'Stregone',   caster: true,  role: 'caster',     castingAbility: 'cha', primary: ['cha'] },
    { id: 'warlock',   label: 'Warlock',    caster: true,  role: 'caster',     castingAbility: 'cha', primary: ['cha'] },
    { id: 'wizard',    label: 'Mago',       caster: true,  role: 'caster',     castingAbility: 'int', primary: ['int'] }
  ];

  var ABILITIES = [
    { id: 'str', label: 'Forza',        abbr: 'FOR' },
    { id: 'dex', label: 'Destrezza',    abbr: 'DES' },
    { id: 'con', label: 'Costituzione', abbr: 'COS' },
    { id: 'int', label: 'Intelligenza', abbr: 'INT' },
    { id: 'wis', label: 'Saggezza',     abbr: 'SAG' },
    { id: 'cha', label: 'Carisma',      abbr: 'CAR' }
  ];

  var CASTING_TIMES = [
    { id: 'action',   label: '1 azione' },
    { id: 'bonus',    label: '1 azione bonus' },
    { id: 'reaction', label: '1 reazione' },
    { id: '1min',     label: '1 minuto' },
    { id: '10min',    label: '10 minuti' },
    { id: '1hr',      label: '1 ora' },
    { id: '8hr',      label: '8 ore' },
    { id: '24hr',     label: '24 ore' }
  ];

  var COMPONENTS = [
    { id: 'v', label: 'Verbale (V)' },
    { id: 's', label: 'Somatica (S)' },
    { id: 'm', label: 'Materiale (M)' }
  ];

  // Indici id -> oggetto, comodi per lookup O(1) nella UI.
  function indexBy(list) {
    var out = {};
    for (var i = 0; i < list.length; i++) { out[list[i].id] = list[i]; }
    return out;
  }

  return {
    RARITIES: RARITIES,
    ITEM_TYPES: ITEM_TYPES,
    SCHOOLS: SCHOOLS,
    CLASSES: CLASSES,
    ABILITIES: ABILITIES,
    CASTING_TIMES: CASTING_TIMES,
    COMPONENTS: COMPONENTS,
    RARITY_BY_ID: indexBy(RARITIES),
    ITEM_TYPE_BY_ID: indexBy(ITEM_TYPES),
    SCHOOL_BY_ID: indexBy(SCHOOLS),
    CLASS_BY_ID: indexBy(CLASSES),
    ABILITY_BY_ID: indexBy(ABILITIES),
    CASTING_TIME_BY_ID: indexBy(CASTING_TIMES)
  };
});
