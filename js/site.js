/* =========================================================================
   CalculaMX · site.js — navegación, formato, consentimiento, AdSense + GA4
   ========================================================================= */
(function () {
  'use strict';

  /* ---------- IDs a reemplazar cuando estén disponibles ---------- */
  var ADSENSE_PUB_ID = 'ca-pub-XXXXXXXXXXXXXXXX';   /* AdSense: ca-pub-… (pendiente) */
  var GA4_ID         = 'G-HQWK5N6623';               /* Google Analytics 4 */

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

  /* ---------- Consentimiento (cookies de anuncios y analítica) ---------- */
  var CONSENT_KEY = 'calculamx_consent_v1';

  function consent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function loadGA4() {
    if (GA4_ID.indexOf('X') !== -1) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, { anonymize_ip: true });
  }

  function loadAdSense() {
    if (ADSENSE_PUB_ID.indexOf('X') !== -1) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_PUB_ID;
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
    document.querySelectorAll('ins.adsbygoogle').forEach(function () {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }

  function enableThirdParty() {
    if (window.__thirdPartyLoaded) return;
    window.__thirdPartyLoaded = true;
    loadGA4();
    loadAdSense();
  }

  var banner = document.querySelector('.consent');
  if (consent() === 'yes') {
    enableThirdParty();
  } else if (consent() === null && banner) {
    banner.hidden = false;
    var accept = banner.querySelector('[data-accept]');
    var reject = banner.querySelector('[data-reject]');
    if (accept) accept.addEventListener('click', function () {
      try { localStorage.setItem(CONSENT_KEY, 'yes'); } catch (e) {}
      banner.hidden = true;
      enableThirdParty();
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
