/**
 * DeepMemo - Utility Helpers
 */

/**
 * Generate a unique ID for nodes
 * @returns {string} Unique node ID
 */
export function generateId() {
  return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Escape HTML characters to prevent injection
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Highlight matching text in search results
 * @param {string} text - Original text
 * @param {string} query - Search query
 * @returns {string} HTML with highlighted matches
 */
export function highlightText(text, query) {
  if (!query) return escapeHtml(text);
  const regex = new RegExp(`(${query})`, 'gi');
  return escapeHtml(text).replace(regex, '<span class="search-result-highlight">$1</span>');
}

/**
 * Download a blob as a file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Desired filename
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Sanitize a string for use as a filename
 * Removes/replaces special characters, emojis, and normalizes separators
 * @param {string} text - Text to sanitize
 * @param {Object|number} options - Options object or maxLength (for backwards compatibility)
 * @param {number} options.maxLength - Maximum length (default: 50)
 * @param {boolean} options.preserveSpaces - Keep spaces for filesystem (default: false)
 * @param {boolean} options.allowDots - Allow leading dots (default: false)
 * @returns {string} Sanitized filename-safe string
 *
 * @example
 * // Export mode (archives, PDF) - compact, no spaces
 * sanitizeFilename("🚀  Mon Projet - 2024  !")
 * // Returns: "Mon-Projet-2024"
 *
 * // Filesystem mode - readable with spaces
 * sanitizeFilename("Mon Projet", { preserveSpaces: true, maxLength: 200 })
 * // Returns: "Mon Projet"
 *
 * sanitizeFilename("file: test", { preserveSpaces: true })
 * // Returns: "file_ test" (: forbidden on Windows)
 */
export function sanitizeFilename(text, options = {}) {
  // Backwards compatibility: if options is a number, treat it as maxLength
  if (typeof options === 'number') {
    options = { maxLength: options };
  }

  const {
    maxLength = 50,
    preserveSpaces = false,
    allowDots = false
  } = options;

  if (!text || typeof text !== 'string') {
    return 'Untitled';
  }

  let result = text;

  // Normalize multiple spaces to single space
  result = result.replace(/\s+/g, ' ');

  if (preserveSpaces) {
    // FILESYSTEM MODE: Preserve spaces, only replace forbidden characters
    // Replace Windows/Mac/Linux forbidden characters: / : * ? " < > |
    result = result.replace(/[/:*?"<>|]/g, '_');

    // Don't allow leading dots (hidden files on Unix, reserved on Windows)
    if (!allowDots) {
      result = result.replace(/^\.+/, '_');
    }
  } else {
    // EXPORT MODE: Convert to web-friendly format (no spaces)
    // Replace " - " pattern with single hyphen
    result = result.replace(/\s*-\s*/g, '-');

    // Replace all non-alphanumeric characters with hyphens
    result = result.replace(/[^a-z0-9-]/gi, '-');

    // Merge multiple consecutive hyphens
    result = result.replace(/-+/g, '-');

    // Remove leading and trailing hyphens
    result = result.replace(/^-+|-+$/g, '');
  }

  // Limit length and trim
  result = result.substring(0, maxLength).trim();

  // Final cleanup for export mode
  if (!preserveSpaces) {
    result = result.replace(/-+$/, '');
  }

  return result || 'Untitled';
}
