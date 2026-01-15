/**
 * DeepMemo - Tags Module
 * Handles tag management and autocomplete
 */

import { data, saveData } from '../core/data.js';
import { showToast } from '../ui/toast.js';
import { updateRightPanel } from './editor.js';
import { t } from '../utils/i18n.js';

// Autocomplete state
let tagAutocompleteSuggestions = [];
let tagAutocompleteIndex = 0;
let currentNodeId = null;

/**
 * Set current node ID
 */
export function setCurrentNodeId(nodeId) {
  currentNodeId = nodeId;
}

/**
 * Render tags for current node
 */
export function renderTags() {
  if (!currentNodeId) return;

  const node = data.nodes[currentNodeId];
  const container = document.getElementById('tagsContainer');

  // Clear container
  container.innerHTML = '';

  // Render existing tags
  if (node.tags && node.tags.length > 0) {
    node.tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'tag';
      tagEl.style.cursor = 'pointer';

      // Click on tag to search (except on remove button)
      tagEl.onclick = (e) => {
        // Don't trigger search if clicking on remove button
        if (e.target.classList.contains('tag-remove')) return;

        // Open search with this tag
        if (window.app && window.app.openSearchWithTag) {
          window.app.openSearchWithTag(tag);
        }
      };

      const tagText = document.createElement('span');
      tagText.className = 'user-content';
      tagText.textContent = tag;

      const removeBtn = document.createElement('span');
      removeBtn.className = 'tag-remove';
      removeBtn.textContent = '×';
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        removeTag(tag);
      };

      tagEl.appendChild(tagText);
      tagEl.appendChild(removeBtn);
      container.appendChild(tagEl);
    });
  }

  // Create input wrapper with autocomplete
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'tag-input';
  input.id = 'tagInput';
  input.placeholder = t('placeholders.tagInput');
  input.onkeydown = (e) => handleTagInput(e);
  input.oninput = (e) => handleTagAutocomplete(e);
  input.onfocus = () => showTagAutocomplete();
  input.onblur = () => hideTagAutocomplete();

  const autocompleteDiv = document.createElement('div');
  autocompleteDiv.className = 'tag-autocomplete';
  autocompleteDiv.id = 'tagAutocomplete';
  autocompleteDiv.style.display = 'none';

  wrapper.appendChild(input);
  wrapper.appendChild(autocompleteDiv);
  container.appendChild(wrapper);
}

/**
 * Add a tag to current node
 */
function addTag(tag) {
  if (!currentNodeId) return;

  const node = data.nodes[currentNodeId];
  if (!node.tags) node.tags = [];

  // Clean tag (trim and normalize to lowercase)
  tag = tag.trim().toLowerCase();

  if (!tag) return;

  // Don't add if already exists
  if (node.tags.includes(tag)) {
    showToast(t('toast.tagAlreadyExists'), '⚠️');
    // Re-focus input anyway
    setTimeout(() => {
      const input = document.getElementById('tagInput');
      if (input) input.focus();
    }, 100);
    return;
  }

  node.tags.push(tag);
  node.modified = Date.now();
  saveData();
  renderTags();
  updateRightPanel(currentNodeId); // Update tag cloud in right panel

  // Re-focus input for quick multi-tag addition
  setTimeout(() => {
    const input = document.getElementById('tagInput');
    if (input) input.focus();
  }, 50);

  showToast(t('toast.tagAdded'), '🏷️');
}

/**
 * Remove a tag from current node
 */
function removeTag(tag) {
  if (!currentNodeId) return;

  const node = data.nodes[currentNodeId];
  if (!node.tags) return;

  node.tags = node.tags.filter(t => t !== tag);
  node.modified = Date.now();
  saveData();
  renderTags();
  updateRightPanel(currentNodeId); // Update tag cloud in right panel
  showToast(t('toast.tagRemoved'), '🗑️');
}

/**
 * Handle tag input (Enter, arrows, Escape)
 */
function handleTagInput(event) {
  if (event.key === 'Enter') {
    event.preventDefault();

    // Check if autocomplete is visible
    const autocomplete = document.getElementById('tagAutocomplete');
    const isAutocompleteVisible = autocomplete && autocomplete.style.display !== 'none';

    // If autocomplete is visible AND we have suggestions, use them
    if (isAutocompleteVisible && tagAutocompleteSuggestions.length > 0) {
      const suggestion = tagAutocompleteSuggestions[tagAutocompleteIndex];
      if (suggestion) {
        const tagToAdd = suggestion.tag;
        event.target.value = ''; // Clear BEFORE addTag
        hideTagAutocomplete();
        addTag(tagToAdd);
        return;
      }
    }

    // Otherwise, add the typed text
    const tag = event.target.value.trim();
    if (tag) {
      event.target.value = ''; // Clear BEFORE addTag
      hideTagAutocomplete();
      addTag(tag);
    }
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    navigateTagAutocomplete(1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    navigateTagAutocomplete(-1);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    hideTagAutocomplete();
  }
}

/**
 * Handle tag autocomplete
 */
function handleTagAutocomplete(event) {
  const input = event.target.value.trim().toLowerCase();
  if (!input) {
    hideTagAutocomplete();
    return;
  }

  // Collect all tags with priority to children
  const allTags = collectAllTagsForAutocomplete();

  // Filter by input
  const suggestions = allTags
    .filter(t => t.tag.toLowerCase().includes(input))
    .slice(0, 10); // Max 10 suggestions

  if (suggestions.length === 0) {
    hideTagAutocomplete();
    return;
  }

  tagAutocompleteSuggestions = suggestions;
  tagAutocompleteIndex = 0;
  renderTagAutocomplete();
}

/**
 * Collect ALL tags (from entire tree) for autocomplete
 */
function collectAllTagsForAutocomplete() {
  const tagMap = new Map();

  // Collect from all nodes
  Object.values(data.nodes).forEach(node => {
    if (node.tags && node.tags.length > 0) {
      node.tags.forEach(tag => {
        if (tagMap.has(tag)) {
          tagMap.get(tag).count++;
        } else {
          tagMap.set(tag, { tag, count: 1 });
        }
      });
    }
  });

  // Sort by count (most used first)
  return Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * Render autocomplete suggestions
 */
function renderTagAutocomplete() {
  const autocomplete = document.getElementById('tagAutocomplete');
  if (!autocomplete) return;

  autocomplete.innerHTML = '';

  tagAutocompleteSuggestions.forEach((suggestion, index) => {
    const item = document.createElement('div');
    item.className = 'tag-autocomplete-item' + (index === tagAutocompleteIndex ? ' selected' : '');
    item.textContent = `${suggestion.tag} (${suggestion.count})`;
    item.onclick = () => selectTagSuggestion(index);
    autocomplete.appendChild(item);
  });

  autocomplete.style.display = 'block';
}

/**
 * Navigate autocomplete with arrows
 */
function navigateTagAutocomplete(direction) {
  if (tagAutocompleteSuggestions.length === 0) return;

  tagAutocompleteIndex =
    (tagAutocompleteIndex + direction + tagAutocompleteSuggestions.length)
    % tagAutocompleteSuggestions.length;

  renderTagAutocomplete();
}

/**
 * Select a tag suggestion by index
 */
function selectTagSuggestion(index) {
  const suggestion = tagAutocompleteSuggestions[index];
  if (suggestion) {
    const input = document.getElementById('tagInput');
    if (input) input.value = ''; // Clear BEFORE addTag
    hideTagAutocomplete();
    addTag(suggestion.tag);
  }
}

/**
 * Show autocomplete (on focus)
 */
function showTagAutocomplete() {
  const input = document.getElementById('tagInput');
  if (input && input.value.trim()) {
    handleTagAutocomplete({ target: input });
  }
}

/**
 * Hide autocomplete
 */
function hideTagAutocomplete() {
  setTimeout(() => {
    const autocomplete = document.getElementById('tagAutocomplete');
    if (autocomplete) {
      autocomplete.style.display = 'none';
    }
    // Clear suggestions when hiding autocomplete
    tagAutocompleteSuggestions = [];
    tagAutocompleteIndex = 0;
  }, 200); // Delay to allow click
}

/**
 * Collect all tags from a branch (current node + descendants)
 * @returns {Array} Array of {tag, count} objects sorted by count
 */
export function collectBranchTags() {
  const tagMap = new Map();

  // Recursive function to collect tags from descendants
  const collectFromNode = (nodeId) => {
    const node = data.nodes[nodeId];
    if (!node) return;

    if (node.tags) {
      node.tags.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, { tag, count: 0 });
        }
        const entry = tagMap.get(tag);
        entry.count++;
      });
    }

    // Traverse children recursively
    if (node.children && node.children.length > 0) {
      node.children.forEach(childId => collectFromNode(childId));
    }
  };

  // Start from current node
  if (currentNodeId) {
    collectFromNode(currentNodeId);
  }

  // Convert to array and sort by count (descending)
  return Array.from(tagMap.values())
    .sort((a, b) => b.count - a.count);
}
