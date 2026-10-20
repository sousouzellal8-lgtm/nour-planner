/* Nour Planner : message « Nouveautés » dans l'app. Il vient de contenu.json (nouveautes.actif = true).
   Chaque utilisateur le voit une seule fois, puis il disparaît. Sans internet ou sans message, il ne se passe rien. */
(function () {
  try {
    if (!window.fetch) return;
    function statique(cb) { fetch('contenu.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(cb); }
    function charger(cb) {
      var d = (window.NOUR_CONFIG && window.NOUR_CONFIG.contenuDistant) || {};
      if (!(d.url && d.lecture && /^https:\/\//i.test(d.url))) return statique(cb);
      var ctl = window.AbortController ? new AbortController() : null, t = setTimeout(function () { if (ctl) ctl.abort(); }, 4000);
      fetch(String(d.url).replace(/\/+$/, '') + '/get/nour_contenu', { headers: { Authorization: 'Bearer ' + d.lecture }, cache: 'no-store', signal: ctl ? ctl.signal : undefined })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (j) { clearTimeout(t); var c = JSON.parse(j && j.result); if (!c || typeof c !== 'object') throw 0; return c; })
        .then(function (c) { cb(c); }, function () { clearTimeout(t); statique(cb); });
    }
    charger(function (c) {
      var n = c && c.nouveautes;
      if (!n || !n.actif || !n.id || !n.titre) return;
      var id = String(n.id).slice(0, 40), vu = '';
      try { vu = localStorage.getItem('nour_news_seen') || ''; } catch (e) {}
      if (vu === id) return;
      var b = document.createElement('div'); b.setAttribute('role', 'status');
      b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:max(16px,env(safe-area-inset-bottom));z-index:99999;width:min(92vw,420px);box-sizing:border-box;background:#121214;color:#EDE8DE;border:1px solid rgba(216,178,90,.55);border-radius:18px;padding:16px 18px;font:500 14.5px/1.5 Manrope,system-ui,sans-serif;box-shadow:0 18px 50px rgba(0,0,0,.55)';
      var t = document.createElement('div'); t.textContent = String(n.titre).slice(0, 80); t.style.cssText = 'font:700 16px/1.3 Manrope,system-ui,sans-serif;color:#F3E7C4;margin-bottom:4px';
      b.appendChild(t);
      if (n.texte) { var p = document.createElement('div'); p.textContent = String(n.texte).slice(0, 280); b.appendChild(p); }
      var row = document.createElement('div'); row.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;align-items:center;margin-top:12px';
      if (n.lien && /^https:\/\//i.test(n.lien)) { var a = document.createElement('a'); a.href = n.lien; a.target = '_blank'; a.rel = 'noopener'; a.textContent = String(n.lienTexte || 'En savoir plus').slice(0, 30); a.style.cssText = 'color:#D8B25A;font-weight:700;text-decoration:underline'; row.appendChild(a); }
      var ok = document.createElement('button'); ok.type = 'button'; ok.textContent = 'OK';
      ok.style.cssText = 'background:#D8B25A;color:#0A0A0B;border:0;border-radius:999px;padding:9px 20px;font:700 14px/1 Manrope,system-ui,sans-serif;cursor:pointer;min-height:40px';
      ok.onclick = function () { try { localStorage.setItem('nour_news_seen', id); } catch (e) {} b.remove(); };
      row.appendChild(ok); b.appendChild(row); document.body.appendChild(b);
    });
  } catch (e) {}
})();
