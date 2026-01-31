/**
 * DeepMemo - Live Preview Module
 * Handles split-screen markdown preview with scroll sync
 */

import { data } from '../core/data.js';
import * as AttachmentsModule from '../core/attachments.js';
import { isBranchMode, isNodeInBranch, getBranchRootId } from './tree.js';

// Preview state
let previewEnabled = false;
let updateTimer = null;
let activeBlobUrls = [];

// Source line mapping for scroll sync
let lineMapping = new Map(); // Maps source line numbers to rendered HTML elements

// ResizeObserver to sync preview height with textarea
let textareaResizeObserver = null;

/**
 * Initialize preview mode from localStorage
 */
export function initPreview() {
  const savedPreview = localStorage.getItem('deepmemo_previewEnabled');
  if (savedPreview === 'true') {
    previewEnabled = true;
  }
}

/**
 * Clean up blob URLs
 */
function cleanupBlobUrls() {
  activeBlobUrls.forEach(url => URL.revokeObjectURL(url));
  activeBlobUrls = [];
}

/**
 * Check if preview mode is enabled
 */
export function isPreviewEnabled() {
  return previewEnabled;
}

/**
 * Toggle preview mode
 */
export function togglePreview() {
  previewEnabled = !previewEnabled;
  localStorage.setItem('deepmemo_previewEnabled', previewEnabled);
  updatePreviewUI();
}

/**
 * Enable preview mode (force enable without toggle)
 */
export function enablePreview() {
  if (!previewEnabled) {
    previewEnabled = true;
    localStorage.setItem('deepmemo_previewEnabled', true);
    updatePreviewUI();
  }
}

/**
 * Disable preview mode (force disable without toggle)
 * This also saves the preference to localStorage
 */
export function disablePreview() {
  if (previewEnabled) {
    previewEnabled = false;
    localStorage.setItem('deepmemo_previewEnabled', false);
    updatePreviewUI();
  }
}

/**
 * Disable preview UI only (don't change user preference)
 * Used when switching to view mode
 */
export function disablePreviewUI() {
  if (previewEnabled) {
    previewEnabled = false;
    // Don't update localStorage - keep user preference
    updatePreviewUI();
  }
}

/**
 * Activate preview from user preference (when returning to edit mode)
 * Forces activation regardless of current state
 */
export function activatePreviewFromPreference() {
  previewEnabled = true;
  // Don't update localStorage - already saved from user action
  updatePreviewUI();
}

/**
 * Update preview UI (show/hide split-screen)
 */
export function updatePreviewUI() {
  const contentBody = document.querySelector('.content-body');
  const contentEditor = document.getElementById('nodeContent');
  const previewContainer = document.getElementById('livePreviewContainer');
  const toggleBtn = document.getElementById('togglePreview');

  if (!contentBody || !contentEditor || !previewContainer || !toggleBtn) {
    return;
  }

  // Check if mobile (disable preview on small screens)
  const isMobile = window.innerWidth < 768;

  if (previewEnabled && !isMobile) {
    // Enable split-screen
    contentBody.classList.add('split-screen-mode');
    previewContainer.style.display = 'flex';
    toggleBtn.textContent = '📖 👁️';
    toggleBtn.title = 'Disable live preview';

    // Wait for next frame to let CSS apply (textarea becomes 50% width)
    requestAnimationFrame(() => {
      // Force textarea auto-resize (content wraps differently at 50% width)
      const contentEditor = document.getElementById('nodeContent');
      if (contentEditor) {
        // Reset height to recalculate
        contentEditor.style.height = 'auto';
        contentEditor.style.height = contentEditor.scrollHeight + 'px';
      }

      // Wait one more frame for the resize to take effect
      requestAnimationFrame(() => {
        // Sync preview height with textarea
        syncPreviewHeight();

        // Render initial preview
        updatePreview();
      });
    });
  } else {
    // Disable split-screen
    contentBody.classList.remove('split-screen-mode');
    previewContainer.style.display = 'none';
    previewContainer.style.height = ''; // Reset height
    toggleBtn.textContent = '📖';
    toggleBtn.title = 'Enable live preview (split-screen)';

    // Clean up
    cleanupBlobUrls();
    lineMapping.clear();
  }
}

/**
 * Process attachment: URLs in rendered HTML
 * @param {string} html - Rendered HTML content
 * @param {Object} node - Current node
 * @returns {Promise<string>} - HTML with blob URLs
 */
async function processAttachmentUrls(html, node) {
  const attachmentPattern = /attachment:([a-zA-Z0-9_]+)/g;
  const matches = [...html.matchAll(attachmentPattern)];

  if (matches.length === 0) {
    return html;
  }

  let processedHtml = html;

  for (const match of matches) {
    const attachmentId = match[1];
    const fullPattern = match[0];

    try {
      const blob = await AttachmentsModule.getAttachment(attachmentId);

      if (blob) {
        let mimeType = blob.type || 'application/octet-stream';

        if (node?.attachments) {
          const attachmentMeta = node.attachments.find(a => a.id === attachmentId);
          if (attachmentMeta?.type) {
            mimeType = attachmentMeta.type;
          }
        }

        let typedBlob = blob;
        if (blob.type !== mimeType) {
          typedBlob = new Blob([blob], { type: mimeType });
        }

        const blobUrl = URL.createObjectURL(typedBlob);
        activeBlobUrls.push(blobUrl);

        processedHtml = processedHtml.replace(fullPattern, blobUrl);
      } else {
        processedHtml = processedHtml.replace(fullPattern, '#attachment-not-found');
      }
    } catch (error) {
      console.error(`[Preview] Error loading attachment ${attachmentId}:`, error);
      processedHtml = processedHtml.replace(fullPattern, '#attachment-error');
    }
  }

  return processedHtml;
}

/**
 * Enhanced markdown renderer with source line mapping
 * Adds data-source-line attributes to rendered HTML for scroll sync
 * @param {string} markdown - Markdown content
 * @returns {Object} - { html, lineMap }
 */
function renderMarkdownWithLineMapping(markdown) {
  if (!window.marked) {
    return { html: markdown, lineMap: new Map() };
  }

  const lines = markdown.split('\n');
  const lineMap = new Map();

  // Parse markdown with marked.js
  let html = window.marked.parse(markdown);

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Map line numbers to DOM elements
  // Strategy: For each element, find the first non-empty line that could correspond
  let currentLine = 0;
  const elements = doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, pre, blockquote, hr, table');

  elements.forEach((element) => {
    // Skip if already mapped from a previous element
    if (currentLine >= lines.length) return;

    // Get first few words of the element (for matching)
    const elementText = element.textContent.trim().substring(0, 50);

    if (!elementText) {
      currentLine++;
      return;
    }

    // Search for matching line starting from currentLine
    for (let i = currentLine; i < lines.length; i++) {
      const lineText = lines[i].trim();

      // Skip empty lines
      if (!lineText) continue;

      // Remove markdown syntax for comparison
      const cleanLineText = lineText
        .replace(/^#+\s*/, '')        // Headers
        .replace(/^[-*+]\s*/, '')     // Lists
        .replace(/^>\s*/, '')         // Blockquotes
        .replace(/^\d+\.\s*/, '')     // Numbered lists
        .replace(/^```.*$/, '')       // Code blocks
        .substring(0, 50);

      // Check if element text starts with this line (fuzzy match)
      if (cleanLineText && elementText.toLowerCase().includes(cleanLineText.toLowerCase().substring(0, 20))) {
        element.setAttribute('data-source-line', i);
        lineMap.set(i, element);
        currentLine = i + 1;
        break;
      }
    }
  });

  html = doc.body.innerHTML;

  return { html, lineMap };
}

/**
 * Set current node ID for preview rendering
 */
let currentNodeId = null;

export function setCurrentNodeId(nodeId) {
  currentNodeId = nodeId;
}

/**
 * Update preview content
 * @param {boolean} syncScroll - Whether to sync scroll after update
 */
export async function updatePreview(syncScroll = true) {
  if (!previewEnabled) return;

  const contentEditor = document.getElementById('nodeContent');
  const previewContent = document.getElementById('livePreviewContent');

  if (!contentEditor || !previewContent) return;
  if (!currentNodeId) return;

  const markdown = contentEditor.value;

  const node = data.nodes[currentNodeId];
  if (!node) return;

  const displayNode = node.type === 'symlink' ? data.nodes[node.targetId] : node;
  if (!displayNode) return;

  try {
    // Render markdown with line mapping
    const { html, lineMap } = renderMarkdownWithLineMapping(markdown);
    lineMapping = lineMap;

    // Process attachment URLs
    const processedHtml = await processAttachmentUrls(html, displayNode);

    // Update preview
    previewContent.innerHTML = '<div class="markdown-content user-content">' + processedHtml + '</div>';

    // Update internal links for branch mode
    if (isBranchMode()) {
      const branchRootId = getBranchRootId();
      const links = previewContent.querySelectorAll('a');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const match = href.match(/#\/node\/([^?#]+)/);
        if (match) {
          const targetNodeId = match[1];
          if (isNodeInBranch(targetNodeId)) {
            if (href.startsWith('http://') || href.startsWith('https://')) {
              link.setAttribute('href', `?branch=${branchRootId}#/node/${targetNodeId}`);
            } else {
              link.setAttribute('href', `?branch=${branchRootId}${href}`);
            }
          }
        }
      });
    }

    // Sync preview height (in case textarea height changed)
    syncPreviewHeight();

    // Sync scroll if requested (wait for DOM to be rendered)
    if (syncScroll) {
      // Use requestAnimationFrame to wait for browser to render the new content
      requestAnimationFrame(() => {
        syncScrollToEditor();
      });
    }
  } catch (error) {
    console.error('[Preview] Error rendering markdown:', error);
  }
}

/**
 * Debounced update preview
 */
function debouncedUpdatePreview() {
  if (updateTimer) {
    clearTimeout(updateTimer);
  }

  updateTimer = setTimeout(() => {
    updatePreview(true);
  }, 300); // 300ms debounce
}

/**
 * Get cursor line number in textarea
 * @param {HTMLTextAreaElement} textarea
 * @returns {number} - Line number (0-indexed)
 */
function getCursorLine(textarea) {
  const text = textarea.value;
  const cursorPos = textarea.selectionStart;

  const textBeforeCursor = text.substring(0, cursorPos);
  const lineNumber = textBeforeCursor.split('\n').length - 1;

  return lineNumber;
}

/**
 * Sync preview scroll to editor cursor position
 */
function syncScrollToEditor() {
  if (!previewEnabled) return;

  const contentEditor = document.getElementById('nodeContent');
  const previewContent = document.getElementById('livePreviewContent');

  if (!contentEditor || !previewContent) return;
  if (lineMapping.size === 0) return; // No mapping available

  const cursorLine = getCursorLine(contentEditor);

  // Find the closest mapped element (prefer backwards, then forwards)
  let targetElement = null;
  let closestDistance = Infinity;

  // First, try exact match
  if (lineMapping.has(cursorLine)) {
    targetElement = lineMapping.get(cursorLine);
  } else {
    // Find closest line (backwards has priority)
    for (const [line, element] of lineMapping) {
      const distance = Math.abs(line - cursorLine);

      // If same distance, prefer the one before cursor
      if (distance < closestDistance || (distance === closestDistance && line <= cursorLine)) {
        closestDistance = distance;
        targetElement = element;
      }
    }
  }

  if (targetElement) {
    // Calculate position to scroll to
    const elementTop = targetElement.offsetTop;
    const containerHeight = previewContent.clientHeight;

    // Scroll to position the element near the top (not centered, for better reading)
    const scrollTo = elementTop - (containerHeight * 0.2); // 20% from top

    // Smooth scroll the preview content container
    previewContent.scrollTo({
      top: Math.max(0, scrollTo),
      behavior: 'smooth'
    });
  }
}

/**
 * Sync preview container height with textarea height
 */
function syncPreviewHeight() {
  if (!previewEnabled) return;

  const contentEditor = document.getElementById('nodeContent');
  const previewContainer = document.getElementById('livePreviewContainer');

  if (!contentEditor || !previewContainer) return;

  // Get current height of textarea (including padding)
  const textareaHeight = contentEditor.offsetHeight;

  // Apply same height to preview container
  previewContainer.style.height = `${textareaHeight}px`;
}

/**
 * Sync preview scroll proportionally to content-body scroll
 */
function syncScrollProportional() {
  if (!previewEnabled) return;

  const contentBody = document.querySelector('.content-body');
  const previewContent = document.getElementById('livePreviewContent');

  if (!contentBody || !previewContent) return;

  // Get scroll percentage of content-body
  const scrollTop = contentBody.scrollTop;
  const scrollHeight = contentBody.scrollHeight - contentBody.clientHeight;
  const scrollPercent = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

  // Apply same percentage to preview
  const previewScrollHeight = previewContent.scrollHeight - previewContent.clientHeight;
  const previewScrollTop = scrollPercent * previewScrollHeight;

  previewContent.scrollTo({
    top: previewScrollTop,
    behavior: 'auto' // Instant for smooth following
  });
}

/**
 * Setup preview listeners
 */
export function setupPreviewListeners() {
  const contentEditor = document.getElementById('nodeContent');
  const contentBody = document.querySelector('.content-body');

  if (!contentEditor) return;

  // Update preview on input (debounced)
  contentEditor.addEventListener('input', debouncedUpdatePreview);

  // Sync scroll proportionally when content-body scrolls
  if (contentBody) {
    contentBody.addEventListener('scroll', () => {
      if (previewEnabled) {
        syncScrollProportional();
      }
    });
  }

  // Observe textarea height changes with ResizeObserver
  if (window.ResizeObserver) {
    textareaResizeObserver = new ResizeObserver(() => {
      syncPreviewHeight();
    });
    textareaResizeObserver.observe(contentEditor);
  }
}

/**
 * Cleanup preview resources
 */
export function cleanupPreview() {
  cleanupBlobUrls();
  lineMapping.clear();

  if (updateTimer) {
    clearTimeout(updateTimer);
    updateTimer = null;
  }

  // Disconnect ResizeObserver
  if (textareaResizeObserver) {
    textareaResizeObserver.disconnect();
    textareaResizeObserver = null;
  }
}
