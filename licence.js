/* Nour Planner — codes d'accès (hors ligne, sans serveur).
   Un code = 7 octets (version + identifiant) + signature ECDSA P-256 de ces octets,
   écrits en base32 « Crockford ». La clé publique est dans config.js ; seule la
   clé privée (dans l'outil de génération, jamais mis en ligne) peut créer un code valide.
   Les adhkar sont gratuits ; le reste de l'app s'ouvre avec un code. Il n'y a plus d'essai. */
(function () {
  'use strict';
  var ALPHA = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  var STORE = 'nour_licence_v1';
  var cfg = function () { return window.NOUR_CONFIG || {}; };

  function norm(code) {
    var s = String(code || '').toUpperCase().replace(/\s+/g, '');
    s = s.replace(/^NOUR[-_]?/, '').replace(/[^0-9A-Z]/g, '');
    return s.replace(/O/g, '0').replace(/[IL]/g, '1');
  }
  function b32decode(s) {
    var bits = 0, val = 0, out = [];
    for (var i = 0; i < s.length; i++) {
      var v = ALPHA.indexOf(s.charAt(i));
      if (v < 0) return null;
      val = (val << 5) | v; bits += 5;
      if (bits >= 8) { bits -= 8; out.push((val >> bits) & 255); val &= (1 << bits) - 1; }
    }
    return new Uint8Array(out);
  }
  function hex(u8) { var h = ''; for (var i = 0; i < u8.length; i++) h += (u8[i] < 16 ? '0' : '') + u8[i].toString(16); return h; }

  // Vérifie la signature. Résultat : { ok:true, id } ou { ok:false, reason }
  function verify(code) {
    var bytes = b32decode(norm(code));
    if (!bytes || bytes.length !== 71 || bytes[0] !== 1) return Promise.resolve({ ok: false, reason: 'format' });
    var subtle = window.crypto && window.crypto.subtle;
    var pub = cfg().clePublique;
    if (!subtle || !pub) return Promise.resolve({ ok: false, reason: 'crypto' });
    var payload = bytes.slice(0, 7), sig = bytes.slice(7);
    return subtle.importKey('jwk', pub, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify'])
      .then(function (key) { return subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, sig, payload); })
      .then(function (ok) { return ok ? { ok: true, id: hex(payload.slice(1)) } : { ok: false, reason: 'signature' }; })
      .catch(function () { return { ok: false, reason: 'crypto' }; });
  }

  // Liste des codes désactivés (facultative). Renvoie un tableau, ou null si injoignable.
  function blocked() {
    var f = cfg().fichierCodesBloques;
    if (!f || !window.fetch) return Promise.resolve(null);
    return fetch(f, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j && Array.isArray(j.codes) ? j.codes.map(String) : (Array.isArray(j) ? j.map(String) : null); })
      .catch(function () { return null; });
  }

  function stored() {
    try { var o = JSON.parse(localStorage.getItem(STORE)); return o && o.code ? o : null; } catch (e) { return null; }
  }
  function save(code, id) { try { localStorage.setItem(STORE, JSON.stringify({ code: code, id: id, at: Date.now() })); } catch (e) {} }
  function clear() { try { localStorage.removeItem(STORE); } catch (e) {} }

  // Active un code saisi : vérifie la signature, puis la liste des codes désactivés.
  function activate(code) {
    return verify(code).then(function (r) {
      if (!r.ok) return r;
      return blocked().then(function (list) {
        if (list && list.indexOf(r.id) >= 0) return { ok: false, reason: 'blocked' };
        save(code, r.id);
        return r;
      });
    });
  }

  // Contrôle le code enregistré sur cet appareil : 'full' (licence valide) ou 'none' (pas de licence).
  function check() {
    var st = stored();
    if (!st) return Promise.resolve({ lic: 'none' });
    return verify(st.code).then(function (r) {
      if (!r.ok) { if (r.reason !== 'crypto') clear(); return { lic: r.reason === 'crypto' ? 'full' : 'none' }; }
      return blocked().then(function (list) {
        if (list && list.indexOf(r.id) >= 0) { clear(); return { lic: 'none', blocked: true }; }
        return { lic: 'full', id: r.id };
      });
    });
  }

  window.NourLicence = { verify: verify, activate: activate, check: check, stored: stored, clear: clear, norm: norm };
})();
