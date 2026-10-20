/* Nour Planner — petite invitation à installer l'app sur l'écran d'accueil. */
(function () {
  'use strict';
  var KEY = 'nour_install_v1';
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone) return;
  var snooze = parseInt(ls(KEY) || '0', 10);
  if (snooze && Date.now() < snooze) return;
  var ua = navigator.userAgent || '';
  var ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var deferred = null, bar = null;

  function later(days) { ls(KEY, String(Date.now() + days * 864e5)); }
  function remove() { if (bar && bar.parentNode) bar.parentNode.removeChild(bar); bar = null; }

  function make(texte, bouton, onGo) {
    if (bar) return;
    bar = document.createElement('div');
    bar.setAttribute('data-notilt', '1');
    bar.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:40;width:min(560px,calc(100vw - 24px));box-sizing:border-box;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:18px;background:rgba(18,18,20,.94);border:1px solid rgba(216,178,90,.35);box-shadow:0 12px 40px rgba(0,0,0,.5);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:#EDE8DE;font:500 13px/1.5 Manrope,system-ui,sans-serif;animation:fadeUp .6s ease both';
    var img = document.createElement('img'); img.src = 'icon-192.png'; img.alt = ''; img.width = 40; img.height = 40; img.style.cssText = 'border-radius:10px;flex:0 0 auto';
    var t = document.createElement('div'); t.style.cssText = 'flex:1 1 auto;min-width:0'; t.textContent = texte;
    var go = document.createElement('button'); go.type = 'button'; go.textContent = bouton; go.style.cssText = 'flex:0 0 auto;background:#D8B25A;color:#0A0A0B;border:0;border-radius:999px;padding:9px 16px;font:700 13px Manrope,system-ui,sans-serif;cursor:pointer';
    var x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Plus tard'); x.textContent = '×'; x.style.cssText = 'flex:0 0 auto;background:transparent;border:0;color:#9A9488;font-size:22px;line-height:1;cursor:pointer;padding:2px 6px';
    go.onclick = function () { onGo(); };
    x.onclick = function () { later(14); remove(); };
    bar.appendChild(img); bar.appendChild(t); bar.appendChild(go); bar.appendChild(x);
    document.body.appendChild(bar);
  }

  function iosSheet() {
    var o = document.createElement('div');
    o.setAttribute('data-notilt', '1');
    o.style.cssText = 'position:fixed;inset:0;z-index:70;background:rgba(5,5,6,.8);display:flex;align-items:flex-end;justify-content:center;padding:12px;font:500 14px/1.65 Manrope,system-ui,sans-serif;color:#EDE8DE';
    o.innerHTML = '<div style="width:min(520px,100%);box-sizing:border-box;background:#111113;border:1px solid rgba(216,178,90,.35);border-radius:22px;padding:22px 22px 18px">' +
      '<div style="font:400 22px Marcellus,serif;color:#F3EEE3;margin-bottom:10px">Installer Nour sur ton iPhone</div>' +
      '<ol style="margin:0 0 14px;padding-left:20px;color:#C9C3B6"><li>Ouvre cette page dans <b style="color:#EDE8DE">Safari</b>.</li><li>Appuie sur le bouton <b style="color:#EDE8DE">Partager</b> (le carré avec une flèche vers le haut).</li><li>Choisis <b style="color:#EDE8DE">« Sur l’écran d’accueil »</b>, puis <b style="color:#EDE8DE">Ajouter</b>.</li></ol>' +
      '<button type="button" style="background:#D8B25A;color:#0A0A0B;border:0;border-radius:999px;padding:10px 20px;font:700 13px Manrope,system-ui,sans-serif;cursor:pointer">C’est compris</button></div>';
    o.onclick = function (e) { if (e.target === o || e.target.tagName === 'BUTTON') { later(30); if (o.parentNode) o.parentNode.removeChild(o); remove(); } };
    document.body.appendChild(o);
  }

  window.addEventListener('appinstalled', function () { later(3650); remove(); });
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    setTimeout(function () {
      if (!deferred) return;
      make('Installe Nour sur ton écran d’accueil : il s’ouvre comme une app et marche sans internet.', 'Installer', function () {
        var d = deferred; deferred = null; remove();
        d.prompt(); if (d.userChoice) d.userChoice.then(function (c) { if (c && c.outcome !== 'accepted') later(14); });
      });
    }, 6000);
  });
  if (ios) {
    setTimeout(function () {
      make('Ajoute Nour à ton écran d’accueil pour l’ouvrir comme une app, même sans internet.', 'Comment ?', iosSheet);
    }, 8000);
  }
})();
