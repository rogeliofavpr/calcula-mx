/* =========================================================================
   CalculaMX · site.js — navegación, formato, consentimiento, AdSense + GA4
   ========================================================================= */
(function () {
  'use strict';

  var GA4_ID = 'G-HQWK5N6623'; /* Google Analytics 4 */

  /* ---------- Anuncios (Google AdSense) ----------
     El script de AdSense va directo en el <head> de cada página (lo pide
     Google para verificar el sitio y para que Auto ads funcione sin
     depender de un clic de consentimiento). Aquí solo "activamos" los
     bloques de anuncio manuales (<ins class="adsbygoogle">) que ya tengan
     un data-ad-slot real — los que siguen con el marcador "0000000000..."
     se ignoran hasta que se reemplacen por el ID real del bloque. */
  document.querySelectorAll('ins.adsbygoogle').forEach(function (ins) {
    var slot = ins.getAttribute('data-ad-slot') || '';
    if (/^0+$/.test(slot)) return; /* marcador sin reemplazar */
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  });

  /* ---------- Año dinámico ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('#nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- Consentimiento (solo Google Analytics) ---------- */
  var CONSENT_KEY = 'calculamx_consent_v1';

  function consent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function loadGA4() {
    if (window.__ga4Loaded || GA4_ID.indexOf('X') !== -1) return;
    window.__ga4Loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, { anonymize_ip: true });
  }

  var banner = document.querySelector('.consent');
  if (consent() === 'yes') {
    loadGA4();
  } else if (consent() === null && banner) {
    banner.hidden = false;
    var accept = banner.querySelector('[data-accept]');
    var reject = banner.querySelector('[data-reject]');
    if (accept) accept.addEventListener('click', function () {
      try { localStorage.setItem(CONSENT_KEY, 'yes'); } catch (e) {}
      banner.hidden = true;
      loadGA4();
    });
    if (reject) reject.addEventListener('click', function () {
      try { localStorage.setItem(CONSENT_KEY, 'no'); } catch (e) {}
      banner.hidden = true;
    });
  }

  /* ---------- Helpers de formato / parseo ---------- */
  var mxnFmt = new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', minimumFractionDigits: 2
  });

  window.CalculaMX = {
    mxn: function (n) { return mxnFmt.format(isFinite(n) ? n : 0); },
    num: function (n, d) {
      d = d == null ? 2 : d;
      return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: d, maximumFractionDigits: d
      }).format(isFinite(n) ? n : 0);
    },
    pct: function (n, d) { return this.num(n, d == null ? 2 : d) + ' %'; },
    parse: function (v) {
      if (typeof v !== 'string') v = String(v == null ? '' : v);
      v = v.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
      var f = parseFloat(v);
      return isFinite(f) ? f : 0;
    },
    /* Rastrea un cálculo en GA4 si está disponible. */
    track: function (name, params) {
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    }
  };
})();
