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
      version: '1.7.0',
      date: '2026-06-11',
      title: 'Armature, nuovi incantesimi e veste grafica rinnovata',
      added: [
        'Otto nuove armature magiche ufficiali: Armatura del Marinaio, Armatura della Resistenza, Cuoio Borchiato Cangiante, Cotta di Scaglie di Drago, Corazza Nanica di Piastre, Armatura Demoniaca, Corazza dell’Eterealità e Armatura dell’Invulnerabilità.',
        'Sei nuovi scudi magici ufficiali: Scudo della Sentinella, Scudo +2, Scudo +3, Scudo Acchiappafrecce, Scudo Anti-Incantesimi e Scudo Animato.',
        'Venti nuovi incantesimi ufficiali sparsi dal 1° al 9° livello — tra cui Grasso, Apertura, Linguaggi, Forma Gassosa, Occhio Arcano, Mano di Bigby, Legame Planare, Malocchio, Banchetto degli Eroi e Spada di Mordenkainen.'
      ],
      improved: [
        'Veste grafica rinnovata da cima a fondo: sfondo più profondo, schede che si illuminano e si sollevano al passaggio del mouse, intestazione con rifinitura dorata, titoli con un delicato alone e schede di navigazione più curate — senza cambiare il funzionamento di nulla.',
        'Il Database Oggetti conta ora 178 oggetti e il Grimorio 204 incantesimi.'
      ],
      fixed: []
    },
    {
      version: '1.6.0',
      date: '2026-06-08',
      title: 'Nomi in italiano ed elenco completo nelle build',
      added: [
        'Nella sezione « Build » ora puoi sfogliare l’elenco completo di oggetti e incantesimi: lascia vuota la casella di ricerca e scorri la lista, così non devi più ricordare i nomi a memoria.',
        'La casella di ricerca delle build filtra l’elenco mentre scrivi e funziona sia con il nome italiano sia con quello inglese (per esempio « fireball » trova la Palla di Fuoco).'
      ],
      improved: [
        'Tutti i nomi di oggetti e incantesimi sono ora in italiano (per esempio « Lingua di Fuoco », « Palla di Fuoco », « Dardo Incantato »), per una lettura più immediata.',
        'La ricerca nel Database resta valida anche con i nomi inglesi: chi li conosce può continuare a usarli.'
      ],
      fixed: []
    },
    {
      version: '1.5.0',
      date: '2026-06-06',
      title: 'Lancio dei dadi e contenuti ufficiali',
      added: [
        'Nuova sezione « Dadi »: scegli un dado (d4, d6, d8, d10, d12, d20, d100), quanti lanciarne e un eventuale modificatore (per esempio 2d6+3), poi premi « Lancia » e guarda i dadi rotolare a schermo fino al risultato.',
        'Cronologia dei tiri recenti: gli ultimi lanci restano a portata di mano, con il dettaglio dei singoli dadi e del totale.',
        'Cinquanta nuovi incantesimi ufficiali, cinque per ogni livello dallo 0 al 9 — tra cui Vera trasformazione, Simulacro, Labirinto, Nube mortale e Gabbia di forza.',
        'Quattro armi-artefatto leggendarie: la Spada di Kas, l’Ascia dei Signori dei Nani, la Bacchetta di Orcus e la Spada di Zariel.'
      ],
      improved: [
        'Tutti i contenuti del sito sono ora ufficiali di D&D 5e: oggetti e incantesimi presi dai manuali (SRD, Manuale del DM, Guida di Xanathar), senza nulla di inventato.'
      ],
      fixed: [
        'Le armi non ufficiali introdotte di recente sono state sostituite con armi magiche ufficiali, tra cui Lama solare, Lingua di fuoco, Spada vorpal e il Sacro vendicatore.'
      ]
    },
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
