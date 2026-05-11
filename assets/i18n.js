/* ==========================================================================
   DELTIXIA, moteur i18n 100% client
   Langues : fr (defaut), en, ar, de
   Priorite de detection :
     1. localStorage "deltixia.lang"
     2. URL query "?lang=xx" ou path prefix "/en/", "/ar/", "/de/"
     3. navigator.languages
     4. fallback fr
   ========================================================================== */

(() => {
  'use strict';

  const SUPPORTED = ['fr', 'en', 'ar', 'de'];
  const DEFAULT_LANG = 'fr';
  const RTL_LANGS = ['ar'];
  const STORAGE_KEY = 'deltixia.lang';

  /* ------- Detection ------- */

  function detectLanguage() {
    // 1. Choix utilisateur deja stocke
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.includes(stored)) return stored;
    } catch (_) { /* localStorage indisponible */ }

    // 2. URL : path prefix /xx/  OU  query ?lang=xx
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts[0] && SUPPORTED.includes(pathParts[0])) return pathParts[0];

    const qLang = new URLSearchParams(location.search).get('lang');
    if (qLang && SUPPORTED.includes(qLang.toLowerCase())) return qLang.toLowerCase();

    // 3. Navigateur
    const navLangs = navigator.languages || [navigator.language || navigator.userLanguage || ''];
    for (const l of navLangs) {
      const code = String(l).toLowerCase().slice(0, 2);
      if (SUPPORTED.includes(code)) return code;
    }

    // 4. Fallback
    return DEFAULT_LANG;
  }

  /* ------- Chargement des traductions ------- */

  const cache = Object.create(null);

  async function loadTranslations(lang) {
    if (cache[lang]) return cache[lang];
    try {
      const res = await fetch(`assets/i18n/${lang}.json`, { cache: 'force-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      cache[lang] = json;
      return json;
    } catch (err) {
      console.warn('[i18n] echec chargement', lang, err);
      return {};
    }
  }

  /* ------- Application des traductions ------- */

  // Charge la police arabe Tajawal uniquement quand necessaire
  function ensureArabicFont() {
    if (document.querySelector('link[data-font="tajawal"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap';
    link.dataset.font = 'tajawal';
    document.head.appendChild(link);
  }

  function applyTranslations(translations, lang) {
    const isRTL = RTL_LANGS.includes(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.classList.toggle('rtl', isRTL);
    if (isRTL) ensureArabicFont();

    // 1) textContent via data-i18n="cle"
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = translations[key];
      if (val !== undefined && val !== null && val !== '') {
        el.textContent = val;
      }
    });

    // 2) innerHTML via data-i18n-html="cle" (pour textes avec balises internes)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = translations[key];
      if (val !== undefined && val !== null && val !== '') {
        el.innerHTML = val;
      }
    });

    // 3) Attributs via data-i18n-attr="placeholder:cle,title:cle2"
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const specs = el.getAttribute('data-i18n-attr').split(',');
      specs.forEach(spec => {
        const parts = spec.trim().split(':');
        if (parts.length !== 2) return;
        const [attr, key] = parts;
        const val = translations[key.trim()];
        if (val !== undefined && val !== null && val !== '') {
          el.setAttribute(attr.trim(), val);
        }
      });
    });

    // 4) Etat actif du selecteur de langue
    document.querySelectorAll('[data-lang-option]').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-lang-option') === lang);
    });
    document.querySelectorAll('[data-lang-current]').forEach(el => {
      el.textContent = lang.toUpperCase();
    });
  }

  /* ------- API publique ------- */

  window.deltixiaI18n = {
    supported: SUPPORTED,
    current: DEFAULT_LANG,

    async setLanguage(lang) {
      if (!SUPPORTED.includes(lang)) return false;
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
      this.current = lang;
      const t = await loadTranslations(lang);
      applyTranslations(t, lang);
      // Reapplique l'init Lucide / autres post-render eventuels
      window.dispatchEvent(new CustomEvent('deltixia:lang-changed', { detail: { lang } }));
      return true;
    },
  };

  /* ------- Boot ------- */

  async function init() {
    const lang = detectLanguage();
    await window.deltixiaI18n.setLanguage(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
