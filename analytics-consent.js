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
    fr: { title: 'Vos préférences de confidentialité', message: 'Nous utilisons Google Analytics pour comprendre les visites et les clics vers les dons, et le Pixel Meta pour mesurer nos campagnes publicitaires. Ces outils sont désactivés sans votre accord.', analytics: 'Mesure d’audience (Google Analytics)', marketing: 'Publicité (Pixel Meta)', accept: 'Tout accepter', reject: 'Tout refuser', customize: 'Personnaliser', save: 'Enregistrer mes choix', privacy: 'Confidentialité', settings: 'Gérer les cookies' },
    en: { title: 'Your privacy choices', message: 'We use Google Analytics to understand visits and donation-link clicks, and Meta Pixel to measure our advertising. These tools stay off unless you agree.', analytics: 'Analytics (Google Analytics)', marketing: 'Advertising (Meta Pixel)', accept: 'Accept all', reject: 'Reject all', customize: 'Customize', save: 'Save choices', privacy: 'Privacy policy', settings: 'Cookie settings' },
    pt: { title: 'Suas preferências de privacidade', message: 'Usamos o Google Analytics para medir visitas e cliques para doações, e o Pixel da Meta para avaliar campanhas. Essas ferramentas ficam desativadas sem seu consentimento.', analytics: 'Estatísticas (Google Analytics)', marketing: 'Publicidade (Pixel da Meta)', accept: 'Aceitar tudo', reject: 'Recusar tudo', customize: 'Personalizar', save: 'Salvar escolhas', privacy: 'Privacidade', settings: 'Preferências de cookies' },
    es: { title: 'Tus preferencias de privacidad', message: 'Usamos Google Analytics para medir visitas y clics hacia las donaciones, y el píxel de Meta para evaluar campañas. Estas herramientas permanecen desactivadas sin tu consentimiento.', analytics: 'Estadísticas (Google Analytics)', marketing: 'Publicidad (Píxel de Meta)', accept: 'Aceptar todo', reject: 'Rechazar todo', customize: 'Personalizar', save: 'Guardar preferencias', privacy: 'Privacidad', settings: 'Configurar cookies' }
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
        '<p>' + tx.message + ' <a href="/privacy.html">' + tx.privacy + '</a></p>' +
        '<div id="pks-consent-options" hidden>' +
          '<label><input id="pks-a" type="checkbox"> ' + tx.analytics + '</label>' +
          '<label><input id="pks-m" type="checkbox"> ' + tx.marketing + '</label>' +
          '<button type="button" id="pks-save">' + tx.save + '</button>' +
        '</div>' +
        '<div class="pks-consent-actions">' +
          '<button type="button" id="pks-reject">' + tx.reject + '</button>' +
          '<button type="button" id="pks-accept">' + tx.accept + '</button>' +
          '<button type="button" id="pks-customize">' + tx.customize + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);
    document.getElementById('pks-a').checked = choices ? choices.a : false;
    document.getElementById('pks-m').checked = choices ? choices.m : false;
    document.getElementById('pks-reject').onclick = function () { save(false, false); };
    document.getElementById('pks-accept').onclick = function () { save(true, true); };
    document.getElementById('pks-customize').onclick = function () {
      document.getElementById('pks-consent-options').hidden = false;
    };
    document.getElementById('pks-save').onclick = function () {
      save(document.getElementById('pks-a').checked, document.getElementById('pks-m').checked);
    };
  }

  function addStyles() {
    var style = document.createElement('style');
    style.textContent =
      '#pks-consent-banner{position:fixed;left:12px;right:12px;bottom:12px;z-index:20000;max-width:750px;margin:auto;background:#fff;color:#0f1f26;border:1px solid #cbd5e1;border-radius:14px;box-shadow:0 6px 36px rgba(0,0,0,.22);font:14px/1.45 system-ui,Arial,sans-serif}' +
      '.pks-consent-inner{padding:15px 18px}.pks-consent-inner strong{font-size:15px}.pks-consent-inner p{margin:7px 0 12px}.pks-consent-inner a{color:#0b2e6b;text-decoration:underline}' +
      '.pks-consent-actions{display:flex;gap:8px;flex-wrap:wrap}.pks-consent-actions button,#pks-save{font:inherit;border:1px solid #0b2e6b;border-radius:8px;background:#fff;color:#0b2e6b;cursor:pointer;padding:8px 12px;flex:1;min-width:128px;font-weight:650}' +
      '#pks-consent-options{margin:8px 0 12px}#pks-consent-options[hidden]{display:none}#pks-consent-options label{display:block;padding:3px 0}#pks-save{margin-top:8px}' +
      '.pks-cookie-settings{background:none!important;border:0!important;cursor:pointer!important;text-decoration:underline!important;font:inherit!important;color:inherit!important;margin-left:10px!important;padding:0!important}';
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
