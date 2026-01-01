/**
 * DeepMemo - Modals Module
 * Handles Action Modal (Move/Link/Duplicate) and Symlink Modal
 */

import { data, saveData, wouldCreateCycle, wouldCreateCycleWithMove, isDescendantOf } from '../core/data.js';
import { showToast } from '../ui/toast.js';
import { escapeHtml } from '../utils/helpers.js';
import { isBranchMode, getBranchRootId, isNodeInBranch } from './tree.js';
import { t } from '../utils/i18n.js';

// Modal state
let selectedAction = null; // 'move', 'link', or 'duplicate'
let selectedDestination = null; // Target node ID
let actionModalExpandedNodes = new Set();
let symlinkModalExpandedNodes = new Set();

/**
 * Open Action Modal
 * @param {string} currentNodeId - Current node ID
 * @param {Function} onSuccess - Callback after action (for re-rendering)
 */
export function openActionModal(currentNodeId, onSuccess) {
  if (!currentNodeId) return;

  selectedAction = null;
  selectedDestination = null;

  // Reset UI
  document.querySelectorAll('#actionModal .btn-secondary').forEach(btn => {
    btn.classList.remove('active');
  });

  document.getElementById('confirmActionBtn').disabled = true;
  document.getElementById('actionDescription').textContent = '';
  document.getElementById('actionDescription').style.display = 'none';
  document.getElementById('actionNodeSelector').innerHTML = '';
  document.getElementById('actionNodeSelector').style.display = 'none';

  // Show modal
  document.getElementById('actionModal').classList.add('active');
}

/**
 * Close Action Modal
 */
export function closeActionModal() {
  document.getElementById('actionModal').classList.remove('active');
  selectedAction = null;
  selectedDestination = null;
}

/**
 * Select an action (move, link, duplicate, delete)
 * @param {string} action - Action type
 * @param {string} currentNodeId - Current node ID
 */
export function selectAction(action, currentNodeId) {
  selectedAction = action;
  selectedDestination = null;

  // Update button states
  document.querySelectorAll('#actionModal .btn-secondary').forEach(btn => {
    btn.classList.remove('active');
  });

  const btnId = `action${action.charAt(0).toUpperCase() + action.slice(1)}`;
  document.getElementById(btnId).classList.add('active');

  const descriptionEl = document.getElementById('actionDescription');
  const selectorEl = document.getElementById('actionNodeSelector');

  if (action === 'delete') {
    // Delete doesn't need tree selector
    selectorEl.style.display = 'none';
    selectorEl.innerHTML = '';

    // Check if trying to delete branch root node
    const isBranchRoot = isBranchMode() && currentNodeId === getBranchRootId();

    if (isBranchRoot) {
      // Cannot delete branch root
      descriptionEl.textContent = t('modals.actions.descriptions.delete') + '\n\n⚠️ ' + t('toast.cannotDeleteBranchRoot');
      descriptionEl.style.display = 'block';
      document.getElementById('confirmActionBtn').disabled = true;
    } else {
      descriptionEl.textContent = t('modals.actions.descriptions.delete');
      descriptionEl.style.display = 'block';
      // Enable confirm button immediately for delete
      document.getElementById('confirmActionBtn').disabled = false;
    }
  } else {
    // Update description
    const descriptions = {
      move: t('modals.actions.descriptions.move'),
      link: t('modals.actions.descriptions.link'),
      duplicate: t('modals.actions.descriptions.duplicate')
    };

    descriptionEl.textContent = descriptions[action];
    descriptionEl.style.display = 'block';
    selectorEl.style.display = 'block';

    // Render tree selector
    renderActionTreeSelector(currentNodeId);

    // Disable confirm button until destination is selected
    document.getElementById('confirmActionBtn').disabled = true;
  }
}

/**
 * Render tree selector for action modal
 * @param {string} currentNodeId - Current node ID
 */
function renderActionTreeSelector(currentNodeId) {
  const container = document.getElementById('actionNodeSelector');
  container.innerHTML = '';

  const node = data.nodes[currentNodeId];
  if (!node) return;

  let html = '<div class="node-selector-tree">';

  // Render root nodes (branch mode: only branch root, normal mode: all roots)
  const rootsToRender = isBranchMode() ? [getBranchRootId()] : data.rootNodes;
  rootsToRender.forEach(rootId => {
    html += renderActionTreeNode(rootId, currentNodeId, null, 0);
  });

  html += '</div>';
  container.innerHTML = html;
}

/**
 * Render a single node in the action tree selector
 * @param {string} nodeId - Node ID to render
 * @param {string} currentNodeId - Current node ID (to disable)
 * @param {string|null} parentId - Parent ID
 * @param {number} depth - Tree depth
 * @returns {string} HTML string
 */
function renderActionTreeNode(nodeId, currentNodeId, parentId, depth) {
  const node = data.nodes[nodeId];
  if (!node) return '';

  const instanceKey = parentId === null ? `${nodeId}@root` : `${nodeId}@${parentId}`;
  const isExpanded = actionModalExpandedNodes.has(instanceKey);
  const hasChildren = node.children && node.children.length > 0;

  // Determine if this node should be disabled
  let isDisabled = false;
  let disabledReason = '';

  if (nodeId === currentNodeId) {
    isDisabled = true;
    disabledReason = t('modals.actions.disabledReasons.currentNode');
  } else if (selectedAction === 'move') {
    // Can't move into own descendants
    if (isDescendantOf(nodeId, currentNodeId)) {
      isDisabled = true;
      disabledReason = t('modals.actions.disabledReasons.descendant');
    }
    // Check for cycle
    if (wouldCreateCycleWithMove(currentNodeId, nodeId)) {
      isDisabled = true;
      disabledReason = t('modals.actions.disabledReasons.wouldCycle');
    }
  } else if (selectedAction === 'link') {
    // Can't create symlink if it would create a cycle
    if (wouldCreateCycle(currentNodeId, nodeId)) {
      isDisabled = true;
      disabledReason = t('modals.actions.disabledReasons.wouldCycle');
    }
  }

  const icon = node.type === 'symlink' ? '🔗' : (hasChildren ? (isExpanded ? '📂' : '📁') : '📄');
  const indent = depth * 20;

  let html = `
    <div class="node-selector-item ${isDisabled ? 'disabled' : ''}"
         data-node-id="${nodeId}"
         data-instance-key="${instanceKey}"
         style="padding-left: ${indent}px;">
  `;

  // Expand/collapse button
  if (hasChildren) {
    html += `
      <button class="node-selector-toggle"
              onclick="event.stopPropagation(); window.app.toggleActionTreeNode('${instanceKey}')">
        ${isExpanded ? '▼' : '▶'}
      </button>
    `;
  } else {
    html += '<span class="node-selector-spacer"></span>';
  }

  html += `
      <span class="node-selector-icon">${icon}</span>
      <span class="node-selector-title"
            onclick="${isDisabled ? '' : `event.stopPropagation(); window.app.selectActionDestination('${nodeId}')`}">
        ${escapeHtml(node.title)}
        ${isDisabled ? `<span style="opacity: 0.5; font-size: 11px;"> (${disabledReason})</span>` : ''}
        ${node.type === 'symlink' ? ` <span class="symlink-badge">${t('nodeTypes.badge.link')}</span>` : ''}
      </span>
    </div>
  `;

  // Render children if expanded
  if (isExpanded && hasChildren) {
    node.children.forEach(childId => {
      html += renderActionTreeNode(childId, currentNodeId, nodeId, depth + 1);
    });
  }

  return html;
}

/**
 * Toggle expand/collapse for action tree node
 * @param {string} instanceKey - Instance key
 * @param {string} currentNodeId - Current node ID
 */
export function toggleActionTreeNode(instanceKey, currentNodeId) {
  if (actionModalExpandedNodes.has(instanceKey)) {
    actionModalExpandedNodes.delete(instanceKey);
  } else {
    actionModalExpandedNodes.add(instanceKey);
  }

  // Re-render tree selector
  renderActionTreeSelector(currentNodeId);
}

/**
 * Select destination node for action
 * @param {string} nodeId - Destination node ID
 */
export function selectActionDestination(nodeId) {
  selectedDestination = nodeId;

  // Update UI - highlight selected node
  document.querySelectorAll('#actionNodeSelector .node-selector-item').forEach(item => {
    item.classList.remove('selected');
  });

  const selectedItem = document.querySelector(`#actionNodeSelector [data-node-id="${nodeId}"]`);
  if (selectedItem) {
    selectedItem.classList.add('selected');
  }

  // Enable confirm button
  document.getElementById('confirmActionBtn').disabled = false;
}

/**
 * Confirm and execute the selected action
 * @param {string} currentNodeId - Current node ID
 * @param {Function} onSuccess - Callback after action
 */
export function confirmAction(currentNodeId, onSuccess) {
  if (!selectedAction) return;

  // Delete doesn't need destination
  if (selectedAction !== 'delete' && !selectedDestination) return;

  const targetNode = data.nodes[currentNodeId];
  if (!targetNode) return;

  switch (selectedAction) {
    case 'move':
      moveNode(currentNodeId, selectedDestination, onSuccess);
      break;
    case 'link':
      createSymlink(currentNodeId, selectedDestination, onSuccess);
      break;
    case 'duplicate':
      duplicateNode(currentNodeId, selectedDestination, onSuccess);
      break;
    case 'delete':
      deleteNode(currentNodeId, onSuccess);
      break;
  }

  closeActionModal();
}

/**
 * Move a node to a new parent
 * @param {string} nodeId - Node ID to move
 * @param {string} newParentId - New parent ID
 * @param {Function} onSuccess - Callback after move
 */
function moveNode(nodeId, newParentId, onSuccess) {
  const node = data.nodes[nodeId];
  const oldParent = node.parent;

  // Protection: can't move into own descendants
  if (newParentId !== null && isDescendantOf(newParentId, nodeId)) {
    showToast(t('toast.cannotMoveToDescendant'), '⚠️');
    return;
  }

  // Check for cycle
  if (wouldCreateCycleWithMove(nodeId, newParentId)) {
    showToast(t('toast.wouldCreateCycle'), '⚠️');
    return;
  }

  // Remove from old parent
  if (oldParent) {
    const oldParentNode = data.nodes[oldParent];
    oldParentNode.children = oldParentNode.children.filter(id => id !== nodeId);
  } else {
    data.rootNodes = data.rootNodes.filter(id => id !== nodeId);
  }

  // Add to new parent
  if (newParentId) {
    const newParentNode = data.nodes[newParentId];
    newParentNode.children.push(nodeId);
    node.parent = newParentId;
  } else {
    data.rootNodes.push(nodeId);
    node.parent = null;
  }

  saveData();
  showToast(t('toast.nodeMoved'), '↗️');

  if (onSuccess) onSuccess();
}

/**
 * Create a symlink to a node
 * @param {string} nodeId - Target node ID
 * @param {string} parentId - Parent ID for the symlink
 * @param {Function} onSuccess - Callback after creation
 */
function createSymlink(nodeId, parentId, onSuccess) {
  const targetNode = data.nodes[nodeId];
  if (!targetNode) return;

  // Check if symlink already exists
  if (parentId === targetNode.parent) {
    showToast(t('toast.nodeAlreadyExists'), 'ℹ️');
    return;
  }

  // Check for cycle
  if (wouldCreateCycle(nodeId, parentId)) {
    showToast(t('toast.wouldCreateCycle'), '⚠️');
    return;
  }

  // Create symlink
  const symlinkId = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  data.nodes[symlinkId] = {
    id: symlinkId,
    type: 'symlink',
    targetId: nodeId,
    title: targetNode.title, // Symlink can have its own title
    parent: parentId,
    children: [], // Symlinks don't have their own children
    created: Date.now(),
    modified: Date.now()
  };

  // Add to parent
  if (parentId) {
    const parentNode = data.nodes[parentId];
    parentNode.children.push(symlinkId);
  } else {
    data.rootNodes.push(symlinkId);
  }

  saveData();
  showToast(t('toast.symlinkCreated'), '🔗');

  if (onSuccess) onSuccess();
}

/**
 * Duplicate a node (recursively) to a new parent
 * @param {string} nodeId - Node ID to duplicate
 * @param {string} newParentId - New parent ID
 * @param {Function} onSuccess - Callback after duplication
 */
function duplicateNode(nodeId, newParentId, onSuccess) {
  const duplicateRecursive = (originalId, parentId) => {
    const original = data.nodes[originalId];
    const newId = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Copy node (except children and parent)
    data.nodes[newId] = {
      id: newId,
      type: original.type,
      title: original.title + ' (copie)',
      content: original.content || '',
      children: [],
      parent: parentId,
      tags: [...(original.tags || [])],
      links: [...(original.links || [])],
      backlinks: [], // Don't copy backlinks
      created: Date.now(),
      modified: Date.now()
    };

    // Handle symlinks
    if (original.type === 'symlink') {
      data.nodes[newId].targetId = original.targetId;
    }

    // Duplicate children recursively
    if (original.children && original.children.length > 0) {
      original.children.forEach(childId => {
        const duplicatedChildId = duplicateRecursive(childId, newId);
        data.nodes[newId].children.push(duplicatedChildId);
      });
    }

    return newId;
  };

  const newId = duplicateRecursive(nodeId, newParentId);

  // Add to new parent
  if (newParentId) {
    const newParentNode = data.nodes[newParentId];
    newParentNode.children.push(newId);
  } else {
    data.rootNodes.push(newId);
  }

  saveData();
  showToast(t('toast.nodeDuplicated'), '📋');

  if (onSuccess) onSuccess();
}

/**
 * Delete a node and all its descendants
 * @param {string} nodeId - Node ID to delete
 * @param {Function} onSuccess - Callback after deletion (receives next node to select)
 */
function deleteNode(nodeId, onSuccess) {
  const node = data.nodes[nodeId];
  if (!node) return;

  // Save parent info before deletion
  const parentId = node.parent;
  const isRootNode = !parentId;
  const isSymlink = node.type === 'symlink';

  if (isSymlink) {
    // Delete only the symlink (not the target)
    if (node.parent) {
      const parent = data.nodes[node.parent];
      parent.children = parent.children.filter(id => id !== nodeId);
    } else {
      data.rootNodes = data.rootNodes.filter(id => id !== nodeId);
    }

    delete data.nodes[nodeId];
    showToast(t('toast.symlinkDeleted'), '🔗');
  } else {
    // Recursive deletion for regular nodes
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
    showToast(t('toast.nodeDeleted'), '🗑️');
  }

  saveData();

  // Determine which node to select after deletion
  let nextNodeId = null;

  if (isRootNode) {
    // If was a root node, select first available root
    if (data.rootNodes.length > 0) {
      nextNodeId = data.rootNodes[0];
    }
    // If no roots left, nextNodeId stays null (will trigger new node creation)
  } else {
    // If was a child node, select parent
    nextNodeId = parentId;
  }

  if (onSuccess) onSuccess(nextNodeId);
}

// ===== SYMLINK MODAL (Legacy - simplified version) =====

/**
 * Open Symlink Modal (legacy)
 * @param {string} currentNodeId - Current node ID
 * @param {Function} onSuccess - Callback after creation
 */
export function openSymlinkModal(currentNodeId, onSuccess) {
  // For now, just redirect to action modal with 'link' pre-selected
  openActionModal(currentNodeId, onSuccess);
  selectAction('link', currentNodeId);
}

/**
 * Close Symlink Modal
 */
export function closeSymlinkModal() {
  closeActionModal();
}

/**
 * Confirm symlink creation (legacy)
 * @param {string} currentNodeId - Current node ID
 * @param {Function} onSuccess - Callback after creation
 */
export function confirmSymlink(currentNodeId, onSuccess) {
  confirmAction(currentNodeId, onSuccess);
}

// ===== MARKDOWN HELP MODAL =====

/**
 * Open Markdown Help Modal
 */
export function openMarkdownHelp() {
  // Generate content with i18n
  const content = generateMarkdownHelpContent();
  document.getElementById('markdownHelpContent').innerHTML = content;

  // Show modal
  document.getElementById('markdownHelpModal').classList.add('active');
}

/**
 * Close Markdown Help Modal
 */
export function closeMarkdownHelp() {
  document.getElementById('markdownHelpModal').classList.remove('active');
}

/**
 * Generate Markdown help content with i18n
 * @returns {string} HTML string
 */
function generateMarkdownHelpContent() {
  return `
    <div style="font-size: 14px; line-height: 1.6;">
      <p style="color: var(--text-secondary); margin-bottom: 20px;">
        ${t('modals.markdown.intro')}
      </p>

      <div style="display: grid; gap: 20px;">
        <!-- Headings -->
        <div class="markdown-example">
          <h3 style="margin: 0 0 8px 0; color: var(--primary);">${t('modals.markdown.examples.headings.title')}</h3>
          <div class="code-block">
            <pre style="margin: 0; white-space: pre-wrap;">${t('modals.markdown.examples.headings.syntax')}</pre>
          </div>
        </div>

        <!-- Text formatting -->
        <div class="markdown-example">
          <h3 style="margin: 0 0 8px 0; color: var(--primary);">${t('modals.markdown.examples.formatting.title')}</h3>
          <div class="code-block">
            <pre style="margin: 0; white-space: pre-wrap;">${t('modals.markdown.examples.formatting.syntax')}</pre>
          </div>
        </div>

        <!-- Lists -->
        <div class="markdown-example">
          <h3 style="margin: 0 0 8px 0; color: var(--primary);">${t('modals.markdown.examples.lists.title')}</h3>
          <div class="code-block">
            <pre style="margin: 0; white-space: pre-wrap;">${t('modals.markdown.examples.lists.syntax')}</pre>
          </div>
        </div>

        <!-- Links -->
        <div class="markdown-example">
          <h3 style="margin: 0 0 8px 0; color: var(--primary);">${t('modals.markdown.examples.links.title')}</h3>
          <div class="code-block">
            <pre style="margin: 0; white-space: pre-wrap;">${t('modals.markdown.examples.links.syntax')}</pre>
          </div>
        </div>

        <!-- Images -->
        <div class="markdown-example">
          <h3 style="margin: 0 0 8px 0; color: var(--primary);">${t('modals.markdown.examples.images.title')}</h3>
          <div class="code-block">
            <pre style="margin: 0; white-space: pre-wrap;">${t('modals.markdown.examples.images.syntax')}</pre>
          </div>
        </div>

        <!-- Code -->
        <div class="markdown-example">
          <h3 style="margin: 0 0 8px 0; color: var(--primary);">${t('modals.markdown.examples.code.title')}</h3>
          <div class="code-block">
            <pre style="margin: 0; white-space: pre-wrap;">${t('modals.markdown.examples.code.syntax')}</pre>
          </div>
        </div>

        <!-- Blockquotes -->
        <div class="markdown-example">
          <h3 style="margin: 0 0 8px 0; color: var(--primary);">${t('modals.markdown.examples.blockquotes.title')}</h3>
          <div class="code-block">
            <pre style="margin: 0; white-space: pre-wrap;">${t('modals.markdown.examples.blockquotes.syntax')}</pre>
          </div>
        </div>

        <!-- Horizontal rule -->
        <div class="markdown-example">
          <h3 style="margin: 0 0 8px 0; color: var(--primary);">${t('modals.markdown.examples.hr.title')}</h3>
          <div class="code-block">
            <pre style="margin: 0; white-space: pre-wrap;">${t('modals.markdown.examples.hr.syntax')}</pre>
          </div>
        </div>

        <!-- Tables -->
        <div class="markdown-example">
          <h3 style="margin: 0 0 8px 0; color: var(--primary);">${t('modals.markdown.examples.tables.title')}</h3>
          <div class="code-block">
            <pre style="margin: 0; white-space: pre-wrap;">${t('modals.markdown.examples.tables.syntax')}</pre>
          </div>
        </div>
      </div>

      <div style="margin-top: 24px; padding: 12px; background: var(--bg-secondary); border-radius: 8px; color: var(--text-secondary); font-size: 13px;">
        💡 ${t('modals.markdown.tip')}
      </div>
    </div>
  `;
}
