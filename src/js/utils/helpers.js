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
