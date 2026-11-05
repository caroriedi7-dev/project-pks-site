/* Project PKS — Consentement et mesure d'audience
   GA4 : G-E15DVF1C48 | Meta Pixel : 1059026633352724
   Installer une seule fois sur chaque page, après retrait de l'ancien Pixel Meta.
   Les traceurs ne sont chargés qu'après consentement explicite.
*/
(function () {
  'use strict';
  var KEY = 'pks_cookie_choices_v1';
  var SIX_MONTHS = 183 * 24 * 60 * 60 * 1000;
  var GA_ID = 'G-E15DVF1C48';
  var META_ID = '1059026633352724';
  var choices = null;
  var gaStarted = false;
  var metaStarted = false;

  var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  if (!['fr', 'en', 'pt', 'es'].includes(lang)) lang = 'en';
  var translations = {
    fr: { title: 'Vos consentements', message: 'Aidez-nous à mesurer nos visites et nos campagnes, si vous l’acceptez.', analytics: 'Mesure d’audience (Google Analytics)', marketing: 'Publicité (Pixel Meta)', accept: 'Accepter', reject: 'Refuser', customize: 'Personnaliser', save: 'Enregistrer mes choix', privacy: 'Savoir plus', settings: 'Gérer les cookies' },
    en: { title: 'Your choices', message: 'Help us measure visits and campaigns, if you agree.', analytics: 'Analytics (Google Analytics)', marketing: 'Advertising (Meta Pixel)', accept: 'Accept', reject: 'Reject', customize: 'Customize', save: 'Save choices', privacy: 'Learn more', settings: 'Cookie settings' },
    pt: { title: 'Suas escolhas', message: 'Ajude-nos a medir as visitas e campanhas, se você concordar.', analytics: 'Estatísticas (Google Analytics)', marketing: 'Publicidade (Pixel da Meta)', accept: 'Aceitar', reject: 'Recusar', customize: 'Personalizar', save: 'Salvar escolhas', privacy: 'Saiba mais', settings: 'Preferências de cookies' },
    es: { title: 'Tus elecciones', message: 'Ayúdanos a medir las visitas y campañas, si estás de acuerdo.', analytics: 'Estadísticas (Google Analytics)', marketing: 'Publicidad (Píxel de Meta)', accept: 'Aceptar', reject: 'Rechazar', customize: 'Personalizar', save: 'Guardar preferencias', privacy: 'Saber más', settings: 'Configurar cookies' }
  };
  var tx = translations[lang];

  try {
    var stored = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (stored && typeof stored.a === 'boolean' && typeof stored.m === 'boolean' && Date.now() - stored.time < SIX_MONTHS) {
      choices = { a: stored.a, m: stored.m };
    }
  } catch (e) { /* stockage indisponible : consentement non présumé */ }

  function loadGA() {
    if (gaStarted) return;
    gaStarted = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(script);
  }

  function loadMeta() {
    if (metaStarted) return;
    metaStarted = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_ID);
    window.fbq('track', 'PageView');
  }

  function startAllowed() {
    if (!choices) return;
    if (choices.a) loadGA();
    if (choices.m) loadMeta();
  }

  function clearTrackingCookies() {
    var prefixes = ['_ga', '_fbp', '_fbc'];
    var domains = ['', '; domain=project-pks.org', '; domain=.project-pks.org'];
    document.cookie.split(';').forEach(function (part) {
      var name = part.split('=')[0].trim();
      if (!prefixes.some(function (p) { return name === p || name.indexOf(p + '_') === 0; })) return;
      domains.forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax' + domain;
      });
    });
  }

  function save(a, m) {
    var hadGA = gaStarted;
    var hadMeta = metaStarted;
    choices = { a: a, m: m };
    try { localStorage.setItem(KEY, JSON.stringify({ a: a, m: m, time: Date.now() })); } catch (e) {}
    if ((hadGA && !a) || (hadMeta && !m)) {
      clearTrackingCookies();
      location.reload(); // stoppe les bibliothèques déjà chargées après retrait du consentement
      return;
    }
    closeBanner();
    startAllowed();
  }

  function closeBanner() {
    var banner = document.getElementById('pks-consent-banner');
    if (banner) banner.remove();
  }

  function banner() {
    closeBanner();
    var root = document.createElement('section');
    root.id = 'pks-consent-banner';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', tx.title);
    root.innerHTML =
      '<div class="pks-consent-inner">' +
        '<strong>' + tx.title + '</strong>' +
        '<p>' + tx.message + '</p>' +
        '<div id="pks-consent-options" hidden>' +
          '<label><input id="pks-a" type="checkbox"> ' + tx.analytics + '</label>' +
          '<label><input id="pks-m" type="checkbox"> ' + tx.marketing + '</label>' +
          '<button type="button" id="pks-save">' + tx.save + '</button>' +
        '</div>' +
        '<div class="pks-consent-actions">' +
          '<button type="button" id="pks-accept">' + tx.accept + '</button>' +
          '<button type="button" id="pks-reject">' + tx.reject + '</button>' +
          '<button type="button" id="pks-customize" aria-controls="pks-consent-options" aria-expanded="false">' + tx.customize + '</button>' +
          '<a href="/privacy.html">' + tx.privacy + '</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);
    document.getElementById('pks-a').checked = choices ? choices.a : false;
    document.getElementById('pks-m').checked = choices ? choices.m : false;
    document.getElementById('pks-reject').onclick = function () { save(false, false); };
    document.getElementById('pks-accept').onclick = function () { save(true, true); };
    document.getElementById('pks-customize').onclick = function () {
      var opts = document.getElementById('pks-consent-options');
      opts.hidden = !opts.hidden;
      this.setAttribute('aria-expanded', String(!opts.hidden));
    };
    document.getElementById('pks-save').onclick = function () {
      save(document.getElementById('pks-a').checked, document.getElementById('pks-m').checked);
    };
  }

  function addStyles() {
    var style = document.createElement('style');
    style.textContent =
      '#pks-consent-banner{box-sizing:border-box;position:fixed;left:5px;right:5px;bottom:5px;z-index:20000;max-width:480px;margin:0 auto;background:#fff;color:#0f1f26;border:1px solid #cbded8;border-radius:10px;box-shadow:0 3px 15px rgba(0,0,0,.17);font:11px/1.28 system-ui,Arial,sans-serif}' +
      '#pks-consent-banner *{box-sizing:border-box}' +
      '.pks-consent-inner{padding:7px 9px 6px}.pks-consent-inner strong{display:inline;font-size:11.5px;line-height:1.28;color:#0b2e6b;margin-right:4px}.pks-consent-inner p{display:inline;font-size:11px;color:#455b65;margin:0}' +
      '.pks-consent-actions{display:grid;grid-template-columns:1fr 1fr 1.12fr .86fr;align-items:center;gap:4px;margin-top:6px}.pks-consent-actions button,.pks-consent-actions a,#pks-save{font:inherit;font-size:10.5px;cursor:pointer;border-radius:6px;min-height:36px;display:flex;align-items:center;justify-content:center;text-align:center;padding:4px 2px;line-height:1.2;white-space:normal}' +
      '#pks-accept,#pks-reject{border:1px solid #0b2e6b;background:#fff;color:#0b2e6b;font-weight:700}' +
      '#pks-customize,.pks-consent-actions a{background:none;border:0;color:#0b2e6b;text-decoration:underline;font-weight:600}' +
      '#pks-consent-options{margin:7px 0 5px;padding:7px 9px;background:#f2fbf7;border-radius:9px}#pks-consent-options[hidden]{display:none}#pks-consent-options label{display:block;padding:4px 0;font-size:12px}#pks-save{margin-top:6px;width:100%;border:1px solid #0b2e6b;background:#fff;color:#0b2e6b;font-weight:700}' +
      '#pks-consent-banner button:focus-visible,#pks-consent-banner a:focus-visible{outline:2px solid #1e63ff;outline-offset:2px}' +
      '.pks-cookie-settings{background:none!important;border:0!important;cursor:pointer!important;text-decoration:underline!important;font:inherit!important;color:inherit!important;margin-left:10px!important;padding:0!important}' +
      '@media(max-width:340px){.pks-consent-inner{padding:6px 7px}.pks-consent-actions{gap:3px}.pks-consent-actions button,.pks-consent-actions a{font-size:10px;padding:4px 1px;min-height:36px}}';
    document.head.appendChild(style);
  }

  function install() {
    addStyles();
    var footer = document.querySelector('footer');
    if (footer) {
      var settings = document.createElement('button');
      settings.className = 'pks-cookie-settings';
      settings.type = 'button';
      settings.textContent = tx.settings;
      settings.onclick = banner;
      footer.appendChild(settings);
    }
    if (choices === null) banner();
    else startAllowed();

    // Liens externes vers les plateformes de dons (sur toutes les pages).
    document.addEventListener('click', function (event) {
      var anchor = event.target.closest ? event.target.closest('a[href]') : null;
      if (!anchor || !choices || !choices.a || !gaStarted) return;
      var url;
      try { url = new URL(anchor.href); } catch (e) { return; }
      var host = url.hostname.toLowerCase();
      var provider = host === 'buy.stripe.com' ? 'stripe' :
        host === 'dons-fondationmaladiesrares.iraiser.eu' ? 'iraiser_fmr' : '';
      if (provider) trackDonationClick(provider, null, null);
    });
  }

  function trackDonationClick(provider, amount, frequency) {
    if (!choices || !choices.a || !gaStarted || typeof window.gtag !== 'function') return;
    var params = { donation_provider: provider || 'unknown' };
    if (typeof amount === 'number' && isFinite(amount)) params.selected_amount = amount;
    if (frequency) params.donation_frequency = frequency;
    window.gtag('event', 'donation_outbound_click', params);
  }

  // Pour les boutons qui ouvrent un paiement par JavaScript (window.open).
  window.PKSAnalytics = { trackDonationClick: trackDonationClick };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
