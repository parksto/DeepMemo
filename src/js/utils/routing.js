/**
 * DeepMemo - URL Routing Module
 * Handles URL-based navigation and sharing
 */

/**
 * Parse URL to extract branch mode and node ID
 * Branch mode: ?branch=rootId#/node/nodeId
 * Node mode: #/node/nodeId
 * @returns {Object} { mode: 'branch'|null, branchRootId: string|null, nodeId: string|null }
 */
export function parseHash() {
  const params = new URLSearchParams(window.location.search);
  const branchParam = params.get('branch');
  const hash = window.location.hash.substring(1); // Remove #

  // Parse hash: #/node/123456 or just #123456 (backward compat)
  let nodeId = null;
  if (hash) {
    if (hash.startsWith('/node/')) {
      nodeId = hash.substring(6); // Remove '/node/'
    } else {
      nodeId = hash; // Backward compatibility
    }
  }

  if (branchParam) {
    // Branch mode from query param
    return { mode: 'branch', branchRootId: branchParam, nodeId };
  }

  return { mode: null, branchRootId: null, nodeId };
}

/**
 * Update URL for current node
 * @param {string} nodeId - Node ID to set in URL
 * @param {string|null} branchRootId - Branch root ID if in branch mode
 */
export function updateHash(nodeId, branchRootId = null) {
  if (!nodeId) {
    // Clear hash if no node selected
    if (window.location.hash || window.location.search) {
      // Use replaceState to avoid triggering hashchange event
      history.replaceState(null, '', window.location.pathname);
    }
    return;
  }

  // Build new URL
  const search = branchRootId ? `?branch=${branchRootId}` : '';
  const hash = `#/node/${nodeId}`;
  const newUrl = `${window.location.pathname}${search}${hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  // Only update if URL is different
  if (currentUrl !== newUrl) {
    // Use replaceState to update URL without triggering hashchange event
    history.replaceState(null, '', newUrl);
  }
}

/**
 * Setup hash change listener
 * @param {Function} onHashChange - Callback when hash changes (receives parseHash result)
 */
export function setupHashListener(onHashChange) {
  window.addEventListener('hashchange', () => {
    const parsed = parseHash();
    onHashChange(parsed);
  });
}

/**
 * Get shareable URL for a node
 * @param {string} nodeId - Node ID
 * @param {string|null} currentBranchRootId - Current branch root ID (null if not in branch mode)
 * @returns {string} Full URL
 */
export function getShareableUrl(nodeId, currentBranchRootId = null) {
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const search = currentBranchRootId ? `?branch=${currentBranchRootId}` : '';
  const hash = `#/node/${nodeId}`;
  return `${baseUrl}${search}${hash}`;
}

/**
 * Get shareable URL for a branch (always creates isolated branch)
 * @param {string} branchRootId - Branch root ID
 * @returns {string} Full URL
 */
export function getShareableBranchUrl(branchRootId) {
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}?branch=${branchRootId}#/node/${branchRootId}`;
}
