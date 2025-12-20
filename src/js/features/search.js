/**
 * DeepMemo - Search Module
 * Handles global search functionality
 */

import { data } from '../core/data.js';
import { highlightText } from '../utils/helpers.js';

// Search state
let searchVisible = false;
let searchResults = [];
let selectedSearchResultIndex = 0;

/**
 * Open search modal
 * @param {string} prefillText - Optional text to prefill
 */
export function openSearch(prefillText = '') {
  searchVisible = true;
  const modal = document.getElementById('searchModal');
  const input = document.getElementById('searchInput');
  modal.classList.add('active');

  if (prefillText) {
    input.value = prefillText;
    performSearch(prefillText);
  } else {
    performSearch('');
  }

  setTimeout(() => {
    input.focus();
    if (prefillText) {
      input.select();
    }
  }, 100);
}

/**
 * Close search modal
 */
export function closeSearch() {
  searchVisible = false;
  const modal = document.getElementById('searchModal');
  const input = document.getElementById('searchInput');
  modal.classList.remove('active');
  input.value = '';
  searchResults = [];
  selectedSearchResultIndex = 0;
}

/**
 * Perform search
 * @param {string} query - Search query
 */
function performSearch(query) {
  const resultsContainer = document.getElementById('searchResults');

  if (!query.trim()) {
    resultsContainer.innerHTML = '<div class="search-empty"><div class="search-empty-icon">💭</div><div>Tape pour rechercher dans tes nœuds</div></div>';
    searchResults = [];
    return;
  }

  const results = [];
  const queryLower = query.toLowerCase();

  Object.values(data.nodes).forEach(node => {
    const titleMatch = node.title.toLowerCase().includes(queryLower);
    const contentMatch = node.content?.toLowerCase().includes(queryLower);
    const tagsMatch = node.tags && node.tags.some(tag => tag.toLowerCase().includes(queryLower));

    if (titleMatch || contentMatch || tagsMatch) {
      const path = getNodePath(node.id);
      let preview = '';

      if (tagsMatch && !titleMatch) {
        const matchingTags = node.tags.filter(tag => tag.toLowerCase().includes(queryLower));
        preview = `🏷️ Tags: ${matchingTags.join(', ')}`;
      } else if (contentMatch) {
        const index = node.content.toLowerCase().indexOf(queryLower);
        const start = Math.max(0, index - 50);
        const end = Math.min(node.content.length, index + query.length + 50);
        preview = (start > 0 ? '...' : '') + node.content.substring(start, end) + (end < node.content.length ? '...' : '');
      } else {
        preview = node.content?.substring(0, 100) || '';
      }

      results.push({
        id: node.id,
        title: node.title,
        path: path,
        preview: preview,
        matchInTitle: titleMatch,
        matchInTags: tagsMatch && !titleMatch
      });
    }
  });

  searchResults = results;
  selectedSearchResultIndex = 0;
  renderSearchResults(query);
}

/**
 * Get node path for breadcrumb
 * @param {string} nodeId - Node ID
 * @returns {string} Path string
 */
function getNodePath(nodeId) {
  const path = [];
  let currentId = nodeId;
  while (currentId) {
    const node = data.nodes[currentId];
    if (node) {
      path.unshift(node.title);
      currentId = node.parent;
    } else break;
  }
  return path.join(' › ');
}

/**
 * Render search results
 * @param {string} query - Search query for highlighting
 */
function renderSearchResults(query) {
  const resultsContainer = document.getElementById('searchResults');

  if (searchResults.length === 0) {
    resultsContainer.innerHTML = '<div class="search-empty"><div class="search-empty-icon">😕</div><div>Aucun résultat trouvé</div></div>';
    return;
  }

  let html = '';
  searchResults.forEach((result, index) => {
    const isSelected = index === selectedSearchResultIndex;
    html += `
      <div class="search-result-item ${isSelected ? 'selected' : ''}" data-index="${index}">
        <div class="search-result-title">${highlightText(result.title, query)}</div>
        <div class="search-result-path">${result.path}</div>
        <div class="search-result-preview">${highlightText(result.preview, query)}</div>
      </div>
    `;
  });

  resultsContainer.innerHTML = html;

  // Add click handlers
  resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
    item.onclick = () => {
      const index = parseInt(item.dataset.index);
      selectSearchResult(index);
    };
  });
}

/**
 * Handle search navigation with keyboard
 * @param {KeyboardEvent} e - Keyboard event
 */
export function handleSearchNavigation(e) {
  if (!searchVisible) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedSearchResultIndex = Math.min(selectedSearchResultIndex + 1, searchResults.length - 1);
    const input = document.getElementById('searchInput');
    renderSearchResults(input.value);
    scrollSearchResultIntoView();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedSearchResultIndex = Math.max(selectedSearchResultIndex - 1, 0);
    const input = document.getElementById('searchInput');
    renderSearchResults(input.value);
    scrollSearchResultIntoView();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (searchResults.length > 0) {
      selectSearchResult(selectedSearchResultIndex);
    }
  }
  // Escape is handled globally in setupSearchInput()
}

/**
 * Select a search result
 * @param {number} index - Result index
 */
function selectSearchResult(index) {
  if (index < 0 || index >= searchResults.length) return;

  const result = searchResults[index];
  closeSearch();

  // Trigger callback to select node
  if (window.app && window.app.selectNodeById) {
    window.app.selectNodeById(result.id);
  }
}

/**
 * Scroll selected result into view
 */
function scrollSearchResultIntoView() {
  const selectedElement = document.querySelector('.search-result-item.selected');
  if (selectedElement) {
    selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

/**
 * Setup search input handler
 */
export function setupSearchInput() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      performSearch(e.target.value);
    });

    searchInput.addEventListener('keydown', handleSearchNavigation);
  }

  // Close search on click outside
  const searchModal = document.getElementById('searchModal');
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      // Close if clicking on the modal backdrop (not on the content)
      if (e.target === searchModal) {
        closeSearch();
      }
    });
  }

  // Global Escape handler for search
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchVisible) {
      e.preventDefault();
      closeSearch();
    }
  });
}

/**
 * Is search visible
 */
export function isSearchVisible() {
  return searchVisible;
}
