/**
 * DeepMemo - Modals Module
 * Handles Action Modal (Move/Link/Duplicate) and Symlink Modal
 */

import { data, saveData, wouldCreateCycle, wouldCreateCycleWithMove, isDescendantOf } from '../core/data.js';
import { showToast } from '../ui/toast.js';
import { escapeHtml } from '../utils/helpers.js';
import { isBranchMode, getBranchRootId, isNodeInBranch } from './tree.js';

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
    descriptionEl.textContent = 'Attention : la suppression est définitive et supprimera aussi tous les enfants.';
    descriptionEl.style.display = 'block';
    selectorEl.style.display = 'none';
    selectorEl.innerHTML = '';

    // Enable confirm button immediately for delete
    document.getElementById('confirmActionBtn').disabled = false;
  } else {
    // Update description
    const descriptions = {
      move: 'Déplace ce nœud vers un nouveau parent. Tous les enfants suivront.',
      link: 'Crée un lien symbolique de ce nœud vers un autre parent. Le contenu est partagé.',
      duplicate: 'Duplique ce nœud (et ses enfants) vers un nouveau parent.'
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

  // Render root nodes
  data.rootNodes.forEach(rootId => {
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
    disabledReason = 'Nœud actuel';
  } else if (selectedAction === 'move') {
    // Can't move into own descendants
    if (isDescendantOf(nodeId, currentNodeId)) {
      isDisabled = true;
      disabledReason = 'Descendant';
    }
    // Check for cycle
    if (wouldCreateCycleWithMove(currentNodeId, nodeId)) {
      isDisabled = true;
      disabledReason = 'Créerait un cycle';
    }
  } else if (selectedAction === 'link') {
    // Can't create symlink if it would create a cycle
    if (wouldCreateCycle(currentNodeId, nodeId)) {
      isDisabled = true;
      disabledReason = 'Créerait un cycle';
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
        ${node.type === 'symlink' ? ' <span class="symlink-badge">lien</span>' : ''}
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
    showToast('Impossible de déplacer dans ses propres descendants', '⚠️');
    return;
  }

  // Check for cycle
  if (wouldCreateCycleWithMove(nodeId, newParentId)) {
    showToast('Cette action créerait un cycle', '⚠️');
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
  showToast('Nœud déplacé', '↗️');

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
    showToast('Le nœud existe déjà à cet emplacement', 'ℹ️');
    return;
  }

  // Check for cycle
  if (wouldCreateCycle(nodeId, parentId)) {
    showToast('Cette action créerait un cycle', '⚠️');
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
  showToast('Lien symbolique créé', '🔗');

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
  showToast('Nœud dupliqué', '📋');

  if (onSuccess) onSuccess();
}

/**
 * Delete a node and all its descendants
 * @param {string} nodeId - Node ID to delete
 * @param {Function} onSuccess - Callback after deletion
 */
function deleteNode(nodeId, onSuccess) {
  const node = data.nodes[nodeId];
  if (!node) return;

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
    showToast('Lien symbolique supprimé', '🔗');
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
    showToast('Nœud supprimé', '🗑️');
  }

  saveData();
  if (onSuccess) onSuccess();
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
