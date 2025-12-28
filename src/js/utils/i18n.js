/**
 * DeepMemo - Internationalization (i18n) Module
 * Lightweight i18n system without external dependencies
 *
 * Features:
 * - Auto-detection of browser language
 * - Dynamic dictionary loading (lazy import)
 * - Variable interpolation: {count}
 * - Plural support: {{count > 1 ? 's' : ''}}
 * - Fallback to English if key/language missing
 * - localStorage persistence
 * - DOM translation via data-i18n attributes
 */

// State
let currentLang = 'fr';
let dictionaries = {};

const STORAGE_KEY = 'deepmemo_lang';
const DEFAULT_LANG = 'en';
const FALLBACK_LANG = 'en';
const SUPPORTED_LANGS = ['fr', 'en'];

/**
 * Detect browser language
 * @returns {string} Detected language code (fr/en)
 */
function detectLanguage() {
  const browserLang = navigator.language.split('-')[0];
  return SUPPORTED_LANGS.includes(browserLang) ? browserLang : DEFAULT_LANG;
}

/**
 * Load dictionary for a specific language
 * @param {string} lang - Language code
 */
async function loadDictionary(lang) {
  if (dictionaries[lang]) return; // Already loaded

  try {
    const module = await import(`../locales/${lang}.js`);
    dictionaries[lang] = module.default;
    console.log(`[i18n] Dictionary loaded: ${lang}`);
  } catch (error) {
    console.error(`[i18n] Failed to load dictionary: ${lang}`, error);

    // If not fallback lang, try to load fallback
    if (lang !== FALLBACK_LANG) {
      console.warn(`[i18n] Falling back to ${FALLBACK_LANG}`);
      await loadDictionary(FALLBACK_LANG);
      currentLang = FALLBACK_LANG;
    }
  }
}

/**
 * Get nested value from object using dot notation path
 * @param {object} obj - Object to traverse
 * @param {string} path - Dot notation path (e.g., 'toast.saved')
 * @returns {*} Value at path, or undefined
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

/**
 * Interpolate variables and evaluate expressions in template string
 *
 * Supports:
 * - {key} for simple variable replacement
 * - {{expression}} for evaluated expressions (plurals, conditionals)
 *
 * @param {string} template - Template string
 * @param {object} params - Parameters for interpolation
 * @returns {string} Interpolated string
 */
function interpolate(template, params = {}) {
  let result = template;

  // 1. Replace simple variables {key}
  result = result.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });

  // 2. Evaluate expressions {{...}}
  result = result.replace(/\{\{([^}]+)\}\}/g, (match, expr) => {
    try {
      // Create evaluator function with params as local variables
      const evaluator = new Function(...Object.keys(params), `return ${expr}`);
      return evaluator(...Object.values(params));
    } catch (error) {
      console.warn(`[i18n] Failed to evaluate expression: ${expr}`, error);
      return match; // Return original if evaluation fails
    }
  });

  return result;
}

/**
 * Initialize i18n system
 * - Detect or restore language from localStorage
 * - Load appropriate dictionary
 * - Translate DOM elements
 */
export async function initI18n() {
  // Get saved language or detect from browser
  const savedLang = localStorage.getItem(STORAGE_KEY);
  currentLang = savedLang || detectLanguage();

  // Validate language
  if (!SUPPORTED_LANGS.includes(currentLang)) {
    console.warn(`[i18n] Unsupported language: ${currentLang}, falling back to ${DEFAULT_LANG}`);
    currentLang = DEFAULT_LANG;
  }

  // Load dictionary
  await loadDictionary(currentLang);

  // Translate DOM
  translateDOM();

  console.log(`[i18n] Initialized with language: ${currentLang}`);
}

/**
 * Translate a key with optional parameters
 *
 * @param {string} key - Translation key (dot notation, e.g., 'toast.saved')
 * @param {object} params - Parameters for interpolation
 * @returns {string} Translated string
 *
 * @example
 * t('toast.saved') // "Sauvegardé"
 * t('app.nodeCounter', { count: 5 }) // "5 nœuds"
 */
export function t(key, params = {}) {
  // Get value from current language dictionary
  const value = getNestedValue(dictionaries[currentLang], key);

  if (value !== undefined) {
    return interpolate(value, params);
  }

  // Key not found - try fallback language
  console.warn(`[i18n] Missing key in ${currentLang}: ${key}`);

  const fallbackValue = getNestedValue(dictionaries[FALLBACK_LANG], key);
  if (fallbackValue !== undefined) {
    return interpolate(fallbackValue, params);
  }

  // Fallback also missing - return key in brackets for debugging
  console.error(`[i18n] Missing key in fallback (${FALLBACK_LANG}): ${key}`);
  return `[${key}]`;
}

/**
 * Change current language
 * - Load new dictionary if needed
 * - Save to localStorage
 * - Re-translate DOM
 * - Trigger UI re-renders
 *
 * @param {string} lang - Language code
 */
export async function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) {
    console.error(`[i18n] Unsupported language: ${lang}`);
    return;
  }

  // Load dictionary if not already loaded
  await loadDictionary(lang);

  // Update current language
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);

  // Translate DOM
  translateDOM();

  // Re-render UI components (if app is initialized)
  if (window.app && window.app.render) {
    window.app.render();

    // Re-display current node to refresh editor panel
    if (window.app.currentNodeId) {
      // Dynamic import to avoid circular dependency
      const EditorModule = await import('../features/editor.js');
      EditorModule.displayNode(window.app.currentNodeId, () => window.app.render());
    }

    // Update node counter
    if (window.app.updateNodeCounter) {
      window.app.updateNodeCounter();
    }
  }

  console.log(`[i18n] Language changed to: ${lang}`);
}

/**
 * Get current language
 * @returns {string} Current language code
 */
export function getCurrentLanguage() {
  return currentLang;
}

/**
 * Get list of supported languages
 * @returns {string[]} Array of language codes
 */
export function getAvailableLanguages() {
  return [...SUPPORTED_LANGS];
}

/**
 * Translate DOM elements with data-i18n attributes
 *
 * Supported attributes:
 * - data-i18n: Translates textContent
 * - data-i18n-placeholder: Translates placeholder
 * - data-i18n-title: Translates title
 * - data-i18n-content: Translates content attribute (for meta tags)
 * - data-i18n-aria-label: Translates aria-label
 */
export function translateDOM() {
  // Translate textContent
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const params = el.getAttribute('data-i18n-params');
    const parsedParams = params ? JSON.parse(params) : {};
    el.textContent = t(key, parsedParams);
  });

  // Translate placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  // Translate title
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key);
  });

  // Translate content attribute (for meta tags)
  document.querySelectorAll('[data-i18n-content]').forEach(el => {
    const key = el.getAttribute('data-i18n-content');
    el.setAttribute('content', t(key));
  });

  // Translate aria-label
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    el.setAttribute('aria-label', t(key));
  });
}
