/**
 * DeepMemo - Editor Module
 * Handles node editing, breadcrumb, children display, and right panel
 */

import { data, saveData } from '../core/data.js';
import { showToast } from '../ui/toast.js';
import { escapeHtml } from '../utils/helpers.js';
import * as TagsModule from './tags.js';
import { isBranchMode, isNodeInBranch, getBranchRootId } from './tree.js';
import { getShareableUrl, getShareableBranchUrl } from '../utils/routing.js';
import { initDragDrop } from './drag-drop.js';
import * as AttachmentsModule from '../core/attachments.js';

// View mode state
let viewMode = 'view'; // 'edit' or 'view' (default: view)

/**
 * Initialize view mode from localStorage
 */
export function initViewMode() {
  const savedMode = localStorage.getItem('deepmemo_viewMode');
  if (savedMode) {
    viewMode = savedMode;
  }
}

/**
 * Display a node in the editor
 * @param {string} nodeId - Node ID to display
 * @param {Function} renderCallback - Callback to trigger tree re-render
 */
export function displayNode(nodeId, renderCallback) {
  const node = data.nodes[nodeId];
  if (!node) return;

  // Get display node (target for symlinks)
  const displayNode = node.type === 'symlink' ? data.nodes[node.targetId] : node;

  if (!displayNode) {
    // Broken symlink
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('editorContainer').style.display = 'flex';

    document.getElementById('nodeTitle').value = node.title + ' (CASSÉ)';
    const contentEditor = document.getElementById('nodeContent');
    contentEditor.value = '⚠️ Ce lien symbolique pointe vers un nœud qui n\'existe plus.\n\nVous pouvez supprimer ce lien cassé.';
    contentEditor.disabled = true;

    showToast('Lien symbolique cassé', '⚠️');
    return;
  }

  // Enable editor
  document.getElementById('nodeContent').disabled = false;

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('editorContainer').style.display = 'flex';

  // Display title and content
  document.getElementById('nodeTitle').value = displayNode.title;
  const contentEditor = document.getElementById('nodeContent');
  contentEditor.value = displayNode.content || '';

  // Auto-resize textarea
  autoResizeTextarea(contentEditor);

  // Display metadata
  document.getElementById('nodeMeta').textContent =
    `Créé: ${new Date(displayNode.created).toLocaleDateString()}`;

  // Set current node for view mode
  setCurrentNodeId(nodeId);

  // Reset scroll to top when displaying a node
  const contentBody = document.querySelector('.content-body');
  if (contentBody) {
    contentBody.scrollTo(0, 0);
  }

  // Update UI components
  updateBreadcrumb(nodeId);
  updateAttachments(nodeId);
  updateChildren(nodeId);
  updateRightPanel(nodeId);
  updateShareLinks(nodeId);
  updateViewMode();

  // Render tags
  TagsModule.setCurrentNodeId(nodeId);
  TagsModule.renderTags();
}

/**
 * Save current node
 * @param {string} nodeId - Node ID to save
 */
export function saveNode(nodeId) {
  const node = data.nodes[nodeId];
  if (!node) return;

  // For symlinks: save title to symlink, content to target
  if (node.type === 'symlink') {
    const targetNode = data.nodes[node.targetId];
    if (!targetNode) return;

    // Title is saved on the symlink itself
    node.title = document.getElementById('nodeTitle').value;
    node.modified = Date.now();

    // Content is saved on the target node
    targetNode.content = document.getElementById('nodeContent').value;
    targetNode.modified = Date.now();
  } else {
    // Normal node: save both title and content
    node.title = document.getElementById('nodeTitle').value;
    node.content = document.getElementById('nodeContent').value;
    node.modified = Date.now();
  }

  saveData();
  showToast('Sauvegardé', '💾');
}

/**
 * Auto-resize textarea based on content
 * @param {HTMLTextAreaElement} textarea - Textarea element
 */
export function autoResizeTextarea(textarea) {
  if (!textarea) return;

  const childrenSection = document.getElementById('childrenSection');
  const hasChildren = childrenSection && childrenSection.style.display !== 'none';

  if (hasChildren) {
    textarea.classList.remove('expanded');
  } else {
    textarea.classList.add('expanded');
  }

  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, hasChildren ? 400 : 2000) + 'px';
}

/**
 * Update breadcrumb navigation with intelligent formatting
 * Format: .../[parent]/[current] where parent is smaller and transparent
 * In branch mode, path stops at branchRootId
 * @param {string} currentNodeId - Current node ID
 */
function updateBreadcrumb(currentNodeId) {
  const breadcrumb = document.getElementById('breadcrumb');
  const path = [];
  let nodeId = currentNodeId;
  const branchRootId = isBranchMode() ? getBranchRootId() : null;

  // Build path from current to root (or branchRootId in branch mode)
  while (nodeId) {
    const node = data.nodes[nodeId];
    if (node) {
      path.unshift({ id: nodeId, title: node.title });

      // Stop at branchRootId in branch mode
      if (branchRootId && nodeId === branchRootId) {
        break;
      }

      nodeId = node.parent;
    } else break;
  }

  let html = '<span class="breadcrumb-item breadcrumb-home" onclick="app.goToRoot()" title="Retour à la racine">🏠</span>';

  if (path.length === 0) {
    // No node selected - just show home
    breadcrumb.innerHTML = html;
    return;
  }

  if (path.length === 1) {
    // Root level node - no parent path needed
    html += '<span class="breadcrumb-separator">›</span>';
    html += `<span class="breadcrumb-item breadcrumb-current">${escapeHtml(path[0].title)}</span>`;
  } else {
    // Has parents - show intelligent breadcrumb
    const currentNode = path[path.length - 1];
    const parentNode = path[path.length - 2];

    html += '<span class="breadcrumb-separator">›</span>';

    // Add ellipsis if depth > 2
    if (path.length > 2) {
      html += '<span class="breadcrumb-ellipsis" title="' +
        path.slice(0, -2).map(p => escapeHtml(p.title)).join(' › ') +
        '">...</span>';
      html += '<span class="breadcrumb-separator">›</span>';
    }

    // Parent node (smaller, clickable)
    html += `<span class="breadcrumb-item breadcrumb-parent"
             onclick="app.selectNodeById('${parentNode.id}')"
             title="Remonter au parent">
             ${escapeHtml(parentNode.title)}</span>`;

    html += '<span class="breadcrumb-separator">›</span>';

    // Current node (normal size, not clickable)
    html += `<span class="breadcrumb-item breadcrumb-current">${escapeHtml(currentNode.title)}</span>`;
  }

  breadcrumb.innerHTML = html;
}

/**
 * Update children display
 * @param {string} currentNodeId - Current node ID
 */
function updateChildren(currentNodeId) {
  const node = data.nodes[currentNodeId];
  const section = document.getElementById('childrenSection');
  const grid = document.getElementById('childrenGrid');

  // For symlinks, display target's children
  const displayNode = node.type === 'symlink' ? data.nodes[node.targetId] : node;
  if (!displayNode) {
    section.style.display = 'none';
    return;
  }

  const totalChildren = displayNode.children.length;

  if (totalChildren === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  document.getElementById('childrenCount').textContent = totalChildren;

  grid.innerHTML = '';

  displayNode.children.forEach(childId => {
    const child = data.nodes[childId];
    if (!child) return;

    const isSymlink = child.type === 'symlink';
    const childDisplayNode = isSymlink ? data.nodes[child.targetId] : child;

    // Check if symlink is external (pointing outside branch)
    let isExternalSymlink = false;
    if (isSymlink && child.targetId && isBranchMode()) {
      isExternalSymlink = !isNodeInBranch(child.targetId);
    }

    if (!childDisplayNode) {
      // Broken symlink
      const card = document.createElement('div');
      card.className = 'child-card broken-symlink';
      card.style.opacity = '0.5';
      card.innerHTML = `
        <div class="child-card-icon">⚠️</div>
        <div class="child-card-title">${escapeHtml(child.title)} (cassé)</div>
        <div class="child-card-preview">Lien symbolique cassé</div>
      `;
      grid.appendChild(card);
      return;
    }

    const icon = isSymlink ? (isExternalSymlink ? '🔗🚫' : '🔗') : (childDisplayNode.children.length > 0 ? '📂' : '📄');
    const preview = childDisplayNode.content?.substring(0, 50) || 'Vide';

    const card = document.createElement('div');
    card.className = isSymlink ? 'child-card symlink-card' : 'child-card';

    if (isSymlink) {
      if (isExternalSymlink) {
        card.style.border = '1px dashed var(--text-secondary)';
        card.style.opacity = '0.4';
        card.style.cursor = 'not-allowed';
      } else {
        card.style.border = '1px dashed var(--accent)';
        card.style.opacity = '0.9';
      }
    }

    // Click handler
    if (isExternalSymlink) {
      card.onclick = () => {
        showToast('⚠️ Lien externe à la branche (non accessible)', '🚫');
      };
    } else {
      const targetId = isSymlink ? child.targetId : childId;
      card.onclick = () => {
        if (window.app && window.app.selectNodeById) {
          window.app.selectNodeById(targetId);
        }
      };
    }

    const titleStyle = isSymlink ? 'font-style: italic;' : '';
    const badge = isSymlink ? ` <span class="symlink-badge" style="${isExternalSymlink ? 'opacity: 0.5;' : ''}">${isExternalSymlink ? 'externe' : 'lien'}</span>` : '';

    card.innerHTML = `
      <div class="child-card-icon">${icon}</div>
      <div class="child-card-title" style="${titleStyle}${isExternalSymlink ? ' opacity: 0.6;' : ''}">${escapeHtml(child.title)}${badge}</div>
      <div class="child-card-preview" style="${isExternalSymlink ? 'opacity: 0.5;' : ''}">${escapeHtml(preview)}</div>
    `;

    // Drag & Drop (only if not an external symlink)
    if (!isExternalSymlink) {
      initDragDrop(card, childId, () => {
        // Re-render children after drop
        updateChildren(currentNodeId);
      });
    }

    grid.appendChild(card);
  });
}

/**
 * Get icon for attachment based on MIME type
 * @param {string} mimeType - MIME type
 * @returns {string} - Emoji icon
 */
function getAttachmentIcon(mimeType) {
  if (!mimeType) return '📎';

  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
  if (mimeType.includes('text/')) return '📃';

  return '📎';
}

/**
 * Update attachments section
 * @param {string} currentNodeId - Current node ID
 */
function updateAttachments(currentNodeId) {
  const node = data.nodes[currentNodeId];
  const section = document.getElementById('attachmentsSection');
  const list = document.getElementById('attachmentsList');
  const countSpan = document.getElementById('attachmentsCount');

  // For symlinks, display target's attachments
  const displayNode = node.type === 'symlink' ? data.nodes[node.targetId] : node;
  if (!displayNode) {
    section.style.display = 'none';
    return;
  }

  // Initialize attachments array if doesn't exist
  if (!displayNode.attachments) {
    displayNode.attachments = [];
  }

  const totalAttachments = displayNode.attachments.length;

  // Always show section (so the "Add file" button is visible)
  section.style.display = 'block';
  countSpan.textContent = totalAttachments;

  list.innerHTML = '';

  // If no attachments, just show empty list (button remains visible)
  if (totalAttachments === 0) {
    return;
  }

  displayNode.attachments.forEach(attachment => {
    const item = document.createElement('div');
    item.className = 'attachment-item';

    const icon = getAttachmentIcon(attachment.type);
    const formattedSize = AttachmentsModule.formatFileSize(attachment.size);

    item.innerHTML = `
      <div class="attachment-icon">${icon}</div>
      <div class="attachment-info">
        <div class="attachment-name">${escapeHtml(attachment.name)}</div>
        <div class="attachment-size">${formattedSize}</div>
      </div>
      <div class="attachment-actions">
        <button class="attachment-btn" onclick="app.downloadAttachment('${attachment.id}', '${escapeHtml(attachment.name)}')">⬇️</button>
        <button class="attachment-btn delete" onclick="app.deleteAttachment('${attachment.id}')">🗑️</button>
      </div>
    `;

    list.appendChild(item);
  });
}

/**
 * Update right panel
 * @param {string} currentNodeId - Current node ID
 */
function updateRightPanel(currentNodeId) {
  const node = data.nodes[currentNodeId];
  const panel = document.getElementById('panelBody');

  // For symlinks, show target info
  const displayNode = node.type === 'symlink' ? data.nodes[node.targetId] : node;
  if (!displayNode) {
    panel.innerHTML = '<div class="info-section"><h3>⚠️ Lien cassé</h3></div>';
    return;
  }

  let html = '<div class="info-section"><h3>Structure</h3>';
  html += `<div class="info-item"><div class="info-label">Enfants</div>${displayNode.children.length} nœud(s)</div>`;

  // Show parent
  if (displayNode.parent) {
    const parent = data.nodes[displayNode.parent];
    if (parent) {
      html += `<div class="info-item"><div class="info-label">Parent</div>${escapeHtml(parent.title)}</div>`;
    }
  }

  html += '</div>';

  // Show node type
  html += '<div class="info-section"><h3>Type</h3>';
  html += `<div class="info-item">${node.type === 'symlink' ? '🔗 Lien symbolique' : '📄 Nœud'}</div>`;
  html += '</div>';

  // Show dates
  html += '<div class="info-section"><h3>Dates</h3>';
  html += `<div class="info-item"><div class="info-label">Créé</div>${new Date(displayNode.created).toLocaleString()}</div>`;
  html += `<div class="info-item"><div class="info-label">Modifié</div>${new Date(displayNode.modified).toLocaleString()}</div>`;
  html += '</div>';

  // Show branch tags cloud
  html += '<div class="info-section"><h3>☁️ Tags de la branche</h3>';
  const branchTags = TagsModule.collectBranchTags();

  if (branchTags.length > 0) {
    // Calculate sizes for cloud (based on frequency)
    const maxCount = Math.max(...branchTags.map(t => t.count));
    const minSize = 11;
    const maxSize = 18;

    const maxTagsToShow = 10;
    const tagsToDisplay = branchTags.slice(0, maxTagsToShow);

    html += '<div class="tag-cloud">';
    tagsToDisplay.forEach(item => {
      // Size proportional to frequency
      const size = minSize + ((item.count / maxCount) * (maxSize - minSize));
      const escapedTag = escapeHtml(item.tag);

      html += `
        <div class="tag-cloud-item"
             style="--tag-size: ${size}px;"
             data-tag="${escapedTag}"
             title="${item.count} occurrence(s) - Cliquer pour rechercher">
          🏷️ ${escapedTag}
        </div>
      `;
    });

    html += '</div>';

    // Add click handlers after rendering
    setTimeout(() => {
      document.querySelectorAll('.tag-cloud-item').forEach(item => {
        const tag = item.dataset.tag;
        if (tag) {
          item.onclick = () => window.app.openSearchWithTag(tag);
          item.style.cursor = 'pointer';
        }
      });
    }, 0);
  } else {
    html += '<div class="info-item" style="opacity: 0.5;">Aucun tag dans la branche</div>';
  }
  html += '</div>';

  // Show statistics
  html += '<div class="info-section"><h3>Statistiques</h3>';
  const content = displayNode.content || '';
  html += `<div class="info-item"><div class="info-label">Caractères</div>${content.length}</div>`;
  html += `<div class="info-item"><div class="info-label">Mots</div>${content.split(/\s+/).filter(w => w).length}</div>`;
  html += '</div>';

  // Keyboard shortcuts
  html += `
    <div class="shortcuts-hint">
      <div class="shortcuts-title">Raccourcis clavier</div>
      <div class="shortcuts-section">
        <div><kbd>Alt+N</kbd> Nouveau nœud</div>
        <div><kbd>Ctrl+K</kbd> Recherche</div>
        <div><kbd>Alt+E</kbd> Focus éditeur</div>
        <div><kbd>Alt+V</kbd> Toggle vue/édition</div>
      </div>
      <div class="shortcuts-section">
        <div><kbd>↑</kbd><kbd>↓</kbd> Naviguer arbre</div>
        <div><kbd>→</kbd> Déplier nœud</div>
        <div><kbd>←</kbd> Replier / Parent</div>
        <div><kbd>Entrée</kbd> Activer nœud</div>
      </div>
      <div class="shortcuts-section">
        <div><kbd>Esc</kbd> Remonter au parent</div>
      </div>
    </div>
  `;

  // Font preference toggle
  const isSystemFont = document.body.classList.contains('system-font');
  html += `
    <div class="info-section">
      <h3>Préférences</h3>
      <div class="info-item" style="cursor: pointer;" onclick="window.app.toggleFontPreference()">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>Police système</span>
          <span style="font-size: 1.2em;">${isSystemFont ? '✅' : '☐'}</span>
        </div>
      </div>
    </div>
  `;

  panel.innerHTML = html;
}

/**
 * Create a new root node
 * @param {Function} onSuccess - Callback after creation (receives nodeId)
 */
export function createRootNode(onSuccess) {
  const id = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  data.nodes[id] = {
    id,
    type: 'node',
    title: 'Nouveau nœud',
    content: '',
    children: [],
    parent: null,
    tags: [],
    links: [],
    backlinks: [],
    created: Date.now(),
    modified: Date.now()
  };

  data.rootNodes.push(id);
  saveData();

  if (onSuccess) onSuccess(id);

  showToast('Nœud racine créé', '➕');
}

/**
 * Create a child node
 * @param {string} parentId - Parent node ID
 * @param {Function} onSuccess - Callback after creation (receives nodeId)
 */
export function createChildNode(parentId, onSuccess) {
  const parent = data.nodes[parentId];
  if (!parent) return;

  const id = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  data.nodes[id] = {
    id,
    type: 'node',
    title: 'Nouveau nœud',
    content: '',
    children: [],
    parent: parentId,
    tags: [],
    links: [],
    backlinks: [],
    created: Date.now(),
    modified: Date.now()
  };

  parent.children.push(id);
  saveData();

  if (onSuccess) onSuccess(id);

  showToast('Nœud enfant créé', '➕');
}

/**
 * Toggle between view and edit modes
 */
export function toggleViewMode() {
  viewMode = viewMode === 'edit' ? 'view' : 'edit';
  localStorage.setItem('deepmemo_viewMode', viewMode);
  updateViewMode();
}

/**
 * Update display based on current view mode
 */
export function updateViewMode() {
  const toggleBtn = document.getElementById('toggleViewMode');
  const contentEditor = document.getElementById('nodeContent');
  const contentPreview = document.getElementById('contentPreview');

  if (viewMode === 'view') {
    // View mode: show rendered markdown
    toggleBtn.textContent = '✏️ Éditer';
    contentEditor.style.display = 'none';
    contentPreview.style.display = 'block';

    // Render markdown content
    const currentNodeId = getCurrentNodeId();
    if (currentNodeId) {
      const node = data.nodes[currentNodeId];
      const displayNode = node?.type === 'symlink' ? data.nodes[node.targetId] : node;

      if (displayNode?.content) {
        // Use marked.js for markdown rendering (loaded from CDN in index.html)
        const renderedContent = window.marked ? window.marked.parse(displayNode.content) : displayNode.content;
        contentPreview.innerHTML = '<div class="markdown-content">' + renderedContent + '</div>';
      } else {
        contentPreview.innerHTML = '<div class="markdown-content"><em>Aucun contenu</em></div>';
      }
    }
  } else {
    // Edit mode: show textarea
    toggleBtn.textContent = '👁️ Afficher';
    contentEditor.style.display = 'block';
    contentPreview.style.display = 'none';
    autoResizeTextarea(contentEditor);
  }
}

/**
 * Update share links href attributes
 * @param {string} currentNodeId - Current node ID
 */
function updateShareLinks(currentNodeId) {
  const shareLink = document.getElementById('shareLink');
  const shareBranchLink = document.getElementById('shareBranchLink');

  if (!currentNodeId) {
    shareLink.href = '#';
    shareBranchLink.href = '#';
    return;
  }

  // Build proper URLs for middle-click and right-click
  const branchRootId = isBranchMode() ? getBranchRootId() : null;
  shareLink.href = getShareableUrl(currentNodeId, branchRootId);
  shareBranchLink.href = getShareableBranchUrl(currentNodeId);
}

/**
 * Get current node ID (temporary - will be passed as parameter later)
 */
let currentNodeIdCache = null;
export function setCurrentNodeId(nodeId) {
  currentNodeIdCache = nodeId;
}
function getCurrentNodeId() {
  return currentNodeIdCache;
}

/**
 * Delete current node
 * @param {string} nodeId - Node ID to delete
 * @param {Function} onSuccess - Callback after deletion (receives parentId or null)
 */
export function deleteNode(nodeId, onSuccess) {
  const node = data.nodes[nodeId];
  if (!node) return;

  const isSymlink = node.type === 'symlink';
  const confirmMessage = isSymlink
    ? 'Supprimer ce lien symbolique ?'
    : 'Supprimer ce nœud et tous ses enfants ?';

  if (!confirm(confirmMessage)) return;

  const parentId = node.parent;

  if (isSymlink) {
    // Remove from parent's children
    if (node.parent) {
      const parent = data.nodes[node.parent];
      parent.children = parent.children.filter(id => id !== nodeId);
    } else {
      data.rootNodes = data.rootNodes.filter(id => id !== nodeId);
    }

    // Delete just the symlink
    delete data.nodes[nodeId];
    showToast('Lien symbolique supprimé', '🔗');
  } else {
    // Recursive deletion for normal nodes
    const deleteRecursive = (id) => {
      const n = data.nodes[id];
      if (!n) return;
      n.children.forEach(childId => deleteRecursive(childId));
      delete data.nodes[id];
    };

    // Remove from parent
    if (node.parent) {
      const parent = data.nodes[node.parent];
      parent.children = parent.children.filter(id => id !== nodeId);
    } else {
      data.rootNodes = data.rootNodes.filter(id => id !== nodeId);
    }

    deleteRecursive(nodeId);
    showToast('Nœud supprimé', '🗑️');
  }

  saveData();

  // Call success callback with parent ID
  if (onSuccess) {
    onSuccess(parentId && data.nodes[parentId] ? parentId : null);
  }
}
