/*
 * changelog.js — Cronologia delle versioni (Patch Notes), dalla più recente.
 * CONVENZIONE: a OGNI update dell'app aggiungere qui in cima una nuova voce
 * { version, date, title, added[], improved[], fixed[] }. Le liste vuote
 * non vengono mostrate. Esposto come DND.changelog nel browser, module.exports in Node.
 */
(function (root, factory) {
  'use strict';
  var data = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = data; }
  if (root) { root.DND = root.DND || {}; root.DND.changelog = data; }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Voci in ordine cronologico inverso (la più recente per prima).
  return [
    {
      version: '1.4.0',
      date: '2026-06-06',
      title: 'Arsenale da mischia',
      added: [
        'Trenta nuove armi da corpo a corpo, almeno cinque per ogni rarità: dal Comune all’Artefatto, c’è sempre qualcosa da impugnare.',
        'Tanti tipi diversi: spade, pugnali, asce, mazze, magli, lance, tridenti, alabarde, fruste, falci, scimitarre e stocchi.',
        'Tra le chicche: Scimitarra della velocità, Maglio dei fulmini, Lama della fenice e cinque Artefatti leggendari come il Maglio della Forgia del Mondo e Stormheart.',
        'Tutte le armi sono cercabili nel Database Oggetti (filtro « Tipo: Arma » e per rarità) e si possono aggiungere alle tue build.'
      ],
      improved: [],
      fixed: []
    },
    {
      version: '1.3.0',
      date: '2026-06-06',
      title: 'Armi corpo a corpo',
      added: [
        'Dieci nuove armi da mischia, soprattutto spade: Spada affilata, Spada succhia-vita, Spada vulnerante, Spada danzante, Ammazzadraghi, Ammazzagiganti e Lama fortunata.',
        'Più varietà anche per asce e mazze: Ascia furente (Berserker), Mazza della disgregazione e il letale Ladro di nove vite.',
        'Tutte le nuove armi sono cercabili nel Database Oggetti (filtro « Tipo: Arma ») e si possono aggiungere alle tue build.'
      ],
      improved: [],
      fixed: []
    },
    {
      version: '1.2.0',
      date: '2026-06-06',
      title: 'Le mie Build',
      added: [
        'Nuova sezione « Build »: crea le tue build dando un nome e scegliendo una classe, poi aggiungi gli oggetti e gli incantesimi presenti nel sito.',
        'Assistente della build integrato: assegna un punteggio di equilibrio (0–100), segnala che cosa rivedere, che cosa conviene aggiungere o togliere e i punti di forza della build.',
        'Più build salvate insieme: creane quante vuoi, rinominale, duplicale ed eliminale. Tutto resta salvato su questo dispositivo e si ritrova alla riapertura dell’app.',
        'Sei nuovi oggetti magici (tra cui Armatura adamantina, Stivali elfici e Martello nanico) e sei nuovi incantesimi (tra cui Nube di nebbia, Silenzio e Lentezza).'
      ],
      improved: [],
      fixed: []
    },
    {
      version: '1.1.0',
      date: '2026-06-05',
      title: 'Strumenti del Dungeon Master',
      added: [
        'Condizioni di stato su mostri e PG: 15 condizioni SRD con descrizione, badge rimovibili e menu rapido « Aggiungi stato ».',
        'Tracker dell’iniziativa: aggiungi i personaggi (PG), ordina i combattenti per iniziativa e scorri i turni con il contatore dei round.',
        'Generatore di nomi per PNG, taverne e luoghi: un clic su un nome per copiarlo.'
      ],
      improved: [
        'Le schede dei combattenti distinguono i PG dai mostri ed evidenziano il turno attivo durante il combattimento.'
      ],
      fixed: []
    },
    {
      version: '1.0.0',
      date: '2026-06-05',
      title: 'Primo rilascio',
      added: [
        'Database degli oggetti magici con ricerca e filtri per rarità, tipo e sintonia.',
        'Grimorio degli incantesimi con filtri per classe, livello, scuola e componenti.',
        'Assistente Build: suggerisce equipaggiamento e incantesimi in base a classe, livello e caratteristiche.',
        'Strumenti del Dungeon Master: tracker dei mostri con punti ferita, mostri iconici e tabelle di riferimento SRD.'
      ],
      improved: [],
      fixed: []
    }
  ];
});
