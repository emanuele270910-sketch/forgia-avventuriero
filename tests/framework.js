/*
 * framework.js — Mini framework di test, funziona nel browser e in Node.
 * Espone describe/it/expect sul global e un TestRunner.run() che restituisce
 * un riepilogo {total, passed, failed, results}.
 */
(function (root) {
  'use strict';

  var suites = [];
  var current = null;

  function describe(name, fn) {
    current = { name: name, tests: [] };
    suites.push(current);
    try { fn(); } finally { current = null; }
  }

  function it(name, fn) {
    var bucket = current ? current.tests : (suites[0] || (suites[0] = { name: '(root)', tests: [] })).tests;
    bucket.push({ name: name, fn: fn });
  }

  function deepEqual(a, b) {
    if (a === b) { return true; }
    try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return false; }
  }

  function fail(msg) { throw new Error(msg); }

  function expect(actual) {
    var api = {
      toBe: function (exp) { if (actual !== exp) { fail('atteso ' + format(exp) + ', ottenuto ' + format(actual)); } },
      toEqual: function (exp) { if (!deepEqual(actual, exp)) { fail('atteso (deep) ' + format(exp) + ', ottenuto ' + format(actual)); } },
      toBeTruthy: function () { if (!actual) { fail('atteso truthy, ottenuto ' + format(actual)); } },
      toBeFalsy: function () { if (actual) { fail('atteso falsy, ottenuto ' + format(actual)); } },
      toBeGreaterThan: function (n) { if (!(actual > n)) { fail('atteso > ' + n + ', ottenuto ' + format(actual)); } },
      toBeGreaterThanOrEqual: function (n) { if (!(actual >= n)) { fail('atteso >= ' + n + ', ottenuto ' + format(actual)); } },
      toBeLessThan: function (n) { if (!(actual < n)) { fail('atteso < ' + n + ', ottenuto ' + format(actual)); } },
      toBeLessThanOrEqual: function (n) { if (!(actual <= n)) { fail('atteso <= ' + n + ', ottenuto ' + format(actual)); } },
      toHaveLength: function (n) { if (!actual || actual.length !== n) { fail('attesa lunghezza ' + n + ', ottenuta ' + (actual ? actual.length : 'n/d')); } },
      toContain: function (item) {
        var ok = (typeof actual === 'string') ? actual.indexOf(item) !== -1
          : (Array.isArray(actual) && actual.indexOf(item) !== -1);
        if (!ok) { fail(format(actual) + ' non contiene ' + format(item)); }
      }
    };
    api.not = {
      toBe: function (exp) { if (actual === exp) { fail('atteso diverso da ' + format(exp)); } },
      toContain: function (item) {
        var has = (typeof actual === 'string') ? actual.indexOf(item) !== -1 : (Array.isArray(actual) && actual.indexOf(item) !== -1);
        if (has) { fail(format(actual) + ' non dovrebbe contenere ' + format(item)); }
      }
    };
    return api;
  }

  function format(v) {
    if (typeof v === 'string') { return '"' + v + '"'; }
    if (Array.isArray(v)) { return '[' + v.length + ' elementi]'; }
    if (v && typeof v === 'object') { try { return JSON.stringify(v); } catch (e) { return '[object]'; } }
    return String(v);
  }

  function run() {
    var results = [];
    var passed = 0, failed = 0;
    suites.forEach(function (suite) {
      suite.tests.forEach(function (test) {
        var rec = { suite: suite.name, name: test.name, pass: true, error: null };
        try { test.fn(); passed++; }
        catch (e) { rec.pass = false; rec.error = e && e.message ? e.message : String(e); failed++; }
        results.push(rec);
      });
    });
    return { total: passed + failed, passed: passed, failed: failed, results: results };
  }

  var mod = { describe: describe, it: it, expect: expect, run: run, _suites: suites };

  // Esponi sul global per i file di test (window in browser, global in Node).
  root.describe = describe;
  root.it = it;
  root.expect = expect;
  root.TestRunner = { run: run };

  if (typeof module !== 'undefined' && module.exports) { module.exports = mod; }
})(typeof globalThis !== 'undefined' ? globalThis : this);
