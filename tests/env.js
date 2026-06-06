/*
 * env.js — Espone su `T` (global) tutti i moduli sotto test.
 * Browser: riusa window.DND popolato dagli <script>. Node: usa require().
 */
(function (root) {
  'use strict';
  var T;
  if (root.DND && root.DND.filterItems) {
    T = root.DND;
  } else {
    T = {};
    Object.assign(T, require('../src/core/constants.js'));
    Object.assign(T, require('../src/core/util.js'));
    Object.assign(T, require('../src/core/search.js'));
    Object.assign(T, require('../src/core/filter.js'));
    Object.assign(T, require('../src/core/recommend.js'));
    T.items = require('../src/data/items.js');
    T.spells = require('../src/data/spells.js');
    T.encounter = require('../src/core/encounter.js');
    T.dm = require('../src/data/dm.js');
    T.names = require('../src/core/names.js');
    T.changelog = require('../src/data/changelog.js');
    T.builds = require('../src/core/builds.js');
    T.dice = require('../src/core/dice.js');
  }
  root.T = T;
  if (typeof module !== 'undefined' && module.exports) { module.exports = T; }
})(typeof globalThis !== 'undefined' ? globalThis : this);
