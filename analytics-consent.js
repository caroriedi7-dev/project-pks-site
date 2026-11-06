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
    fr: { title: 'Aidez-nous à mieux faire connaître le projet', message: 'En acceptant, vous nous aidez à savoir quelles campagnes font avancer la recherche pour Giulia et les enfants atteints du PKS.', analytics: 'Mesure d’audience (Google Analytics)', marketing: 'Publicité (Pixel Meta)', accept: 'Accepter', reject: 'Refuser', customize: 'Personnaliser', save: 'Enregistrer mes choix', privacy: 'En savoir plus', settings: 'Gérer les cookies' },
    en: { title: 'Help us spread the word about the project', message: 'By accepting, you help us see which campaigns move the research forward for Giulia and every child with PKS.', analytics: 'Analytics (Google Analytics)', marketing: 'Advertising (Meta Pixel)', accept: 'Accept', reject: 'Decline', customize: 'Customize', save: 'Save choices', privacy: 'Learn more', settings: 'Cookie settings' },
    pt: { title: 'Ajude-nos a divulgar o projeto', message: 'Ao aceitar, você nos ajuda a saber quais campanhas fazem a pesquisa avançar pela Giulia e por todas as crianças com PKS.', analytics: 'Estatísticas (Google Analytics)', marketing: 'Publicidade (Pixel da Meta)', accept: 'Aceitar', reject: 'Recusar', customize: 'Personalizar', save: 'Salvar escolhas', privacy: 'Saiba mais', settings: 'Preferências de cookies' },
    es: { title: 'Ayúdanos a dar a conocer el proyecto', message: 'Al aceptar, nos ayudas a saber qué campañas hacen avanzar la investigación para Giulia y todos los niños con PKS.', analytics: 'Estadísticas (Google Analytics)', marketing: 'Publicidad (Píxel de Meta)', accept: 'Aceptar', reject: 'Rechazar', customize: 'Personalizar', save: 'Guardar preferencias', privacy: 'Saber más', settings: 'Configurar cookies' }
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
        '</div>' +
        '<div class="pks-consent-links">' +
          '<button type="button" id="pks-customize" aria-controls="pks-consent-options" aria-expanded="false">' + tx.customize + '</button>' +
          '<span aria-hidden="true">·</span>' +
          '<a href="/privacy.html">' + tx.privacy + '</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);
    updateConsentPosition();
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
      '#pks-consent-banner{box-sizing:border-box;position:fixed;left:8px;right:8px;bottom:calc(8px + var(--pks-donatebar-height, 0px));z-index:20000;max-width:440px;margin:0 auto;background:#fff;color:#0f1f26;border:1px solid #cbded8;border-radius:14px;box-shadow:0 4px 18px rgba(0,0,0,.16);font:12px/1.4 system-ui,-apple-system,Arial,sans-serif}' +
      '#pks-consent-banner *{box-sizing:border-box}' +
      '.pks-consent-inner{padding:11px 12px 9px}.pks-consent-inner strong{display:block;font-size:13px;line-height:1.3;color:#0b2e6b;font-weight:700;margin:0 0 3px}.pks-consent-inner p{font-size:12px;line-height:1.4;color:#455b65;margin:0}' +
      '.pks-consent-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}' +
      '#pks-accept,#pks-reject,#pks-save{font:inherit;font-size:13px;font-weight:700;cursor:pointer;border:0;border-radius:999px;min-height:40px;padding:8px 10px;color:#fff;display:flex;align-items:center;justify-content:center}' +
      '#pks-accept{background:#1e63ff}#pks-reject{background:#0b2e6b}' +
      '.pks-consent-links{display:flex;justify-content:center;align-items:center;gap:6px;margin-top:7px;font-size:11px;color:#0b2e6b}' +
      '#pks-customize,.pks-consent-links a{font:inherit;font-size:11px;background:none;border:0;padding:4px 2px;color:#0b2e6b;text-decoration:underline;cursor:pointer}' +
      '#pks-consent-options{margin:9px 0 2px;padding:8px 10px;background:#f2fbf7;border-radius:10px}#pks-consent-options[hidden]{display:none}#pks-consent-options label{display:block;padding:4px 0;font-size:12px}#pks-save{margin-top:6px;width:100%;background:#0b2e6b}' +
      '#pks-consent-banner button:focus-visible,#pks-consent-banner a:focus-visible{outline:2px solid #1e63ff;outline-offset:2px}' +
      '.pks-cookie-settings{background:none!important;border:0!important;cursor:pointer!important;text-decoration:underline!important;font:inherit!important;color:inherit!important;margin-left:10px!important;padding:0!important}' +
      '@media(max-width:340px){.pks-consent-inner{padding:9px 9px 7px}.pks-consent-actions{gap:6px}#pks-accept,#pks-reject{font-size:12px}}';
    document.head.appendChild(style);
  }

  // Sur mobile, le bandeau cookies reste au-dessus de la barre fixe de don,
  // même si cette dernière change de hauteur selon la largeur de l'écran.
  function updateConsentPosition() {
    var root = document.getElementById('pks-consent-banner');
    if (!root) return;
    var height = 0;
    if (window.innerWidth <= 768) {
      var bar = document.querySelector('.donateBar');
      if (bar && window.getComputedStyle(bar).position === 'fixed') {
        var rect = bar.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0) {
          height = Math.ceil(Math.max(0, window.innerHeight - rect.top));
        }
      }
    }
    root.style.setProperty('--pks-donatebar-height', height + 'px');
  }

  function install() {
    addStyles();
    window.addEventListener('resize', updateConsentPosition);
    var donationBar = document.querySelector('.donateBar');
    if (donationBar && typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(updateConsentPosition).observe(donationBar);
    }
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
