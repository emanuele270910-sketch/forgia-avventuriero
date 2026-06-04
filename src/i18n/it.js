/*
 * it.js — Stringhe dell'interfaccia in italiano.
 * Esposto come DND.i18n nel browser e module.exports in Node.
 */
(function (root, factory) {
  'use strict';
  var data = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = data; }
  if (root) { root.DND = root.DND || {}; root.DND.i18n = data; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return {
    appTitle: "Forgia dell'Avventuriero",
    appSubtitle: 'Compendio D&D 5e — Oggetti, Incantesimi e Assistente Build',
    nav: {
      items: 'Oggetti',
      spells: 'Incantesimi',
      assistant: 'Assistente',
      dm: 'DM'
    },
    common: {
      search: 'Cerca…',
      filters: 'Filtri',
      reset: 'Azzera filtri',
      results: 'risultati',
      result: 'risultato',
      noResults: 'Nessun risultato. Prova a modificare la ricerca o i filtri.',
      close: 'Chiudi',
      attunement: 'Sintonia',
      attunementYes: 'Richiede sintonia',
      attunementNo: 'Nessuna sintonia',
      any: 'Qualsiasi',
      all: 'Tutti',
      type: 'Tipo',
      rarity: 'Rarità',
      source: 'Fonte',
      bonuses: 'Bonus e proprietà',
      requirements: 'Requisiti'
    },
    items: {
      title: 'Database Oggetti',
      filterRarity: 'Rarità',
      filterType: 'Tipo',
      filterAttunement: 'Sintonia',
      attAny: 'Indifferente',
      attYes: 'Solo con sintonia',
      attNo: 'Solo senza sintonia'
    },
    spells: {
      title: 'Grimorio degli Incantesimi',
      level: 'Livello',
      cantrip: 'Trucchetto',
      levelN: 'Livello {n}',
      school: 'Scuola',
      class: 'Classe',
      castingTime: 'Tempo di lancio',
      range: 'Gittata',
      components: 'Componenti',
      duration: 'Durata',
      concentration: 'Concentrazione',
      ritual: 'Rituale',
      higherLevels: 'A livelli superiori',
      filterClass: 'Classe incantatore',
      filterLevel: 'Livello',
      filterSchool: 'Scuola',
      filterComponents: 'Componenti',
      onlyConcentration: 'Solo concentrazione',
      onlyRitual: 'Solo rituali',
      yes: 'Sì',
      no: 'No'
    },
    assistant: {
      title: 'Assistente Build',
      intro: "Inserisci le caratteristiche del personaggio: l'assistente suggerisce oggetti e incantesimi ottimali per la tua build.",
      class: 'Classe',
      subclass: 'Sottoclasse (facoltativa)',
      subclassPlaceholder: 'es. Campione, Evocazione, Vendetta…',
      level: 'Livello personaggio',
      abilities: 'Caratteristiche',
      generate: 'Genera build consigliata',
      resultsTitle: 'Equipaggiamento consigliato',
      spellsTitle: 'Incantesimi consigliati',
      attuneBadge: 'Da sintonizzare',
      noAttune: 'Senza sintonia',
      attunementBudget: 'Slot di sintonia usati',
      whyTitle: 'Perché',
      emptyState: 'Compila il modulo e premi « Genera build consigliata » per vedere i suggerimenti.',
      noSpells: 'Questa classe non lancia incantesimi: la build si concentra su oggetti ed equipaggiamento.',
      scoreLabel: 'Affinità',
      level1to4: 'Livelli 1–4',
      summaryFor: 'Build per'
    },
    dm: {
      title: 'Strumenti del Dungeon Master',
      intro: 'Tracker dei mostri e tabelle di riferimento pronte all’uso durante la sessione. Tutto resta salvato su questo dispositivo.',
      trackerTitle: 'Tracker dei mostri',
      trackerHint: 'Aggiungi un mostro con nome e punti ferita: il sistema tiene il conto dei PF mentre applichi danni e cure.',
      name: 'Nome del mostro',
      namePlaceholder: 'es. Goblin, Capo Orco…',
      hp: 'Punti ferita',
      qty: 'Quantità',
      add: 'Aggiungi',
      clearAll: 'Svuota il tracker',
      monsterCount: 'mostri in campo',
      monsterCountOne: 'mostro in campo',
      empty: 'Nessun mostro nel tracker. Aggiungine uno qui sopra o scegli un mostro iconico.',
      damage: 'Danno',
      heal: 'Cura',
      apply: 'Applica',
      amountPlaceholder: 'PF',
      remove: 'Rimuovi',
      hpOf: 'PF',
      down: 'Abbattuto',
      quickTitle: 'Mostri iconici',
      quickHint: 'Un clic per aggiungerli al tracker con i PF medi da manuale.',
      referenceTitle: 'Tabelle e regole di riferimento',
      confirmClear: 'Rimuovere tutti i mostri dal tracker?',
      statusHealthy: 'Illeso',
      statusWounded: 'Ferito',
      statusBloodied: 'Malconcio',
      statusCritical: 'Critico',
      statusDead: 'Abbattuto'
    }
  };
});
