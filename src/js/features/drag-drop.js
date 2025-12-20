/**
 * DeepMemo - Drag & Drop Module
 * Handles drag and drop for tree nodes and children cards
 */

import { data, saveData } from '../core/data.js';
import { showToast } from '../ui/toast.js';

// Drag state
let draggedNodeId = null;
let dragModifiers = { ctrl: false, alt: false };
let dropPosition = null; // 'before', 'after', 'inside'

/**
 * Initialize drag & drop for a DOM element
 * @param {HTMLElement} element - Element to make draggable
 * @param {string} nodeId - Node ID associated with this element
 * @param {Function} onDropComplete - Callback when drop is complete (for re-render)
 */
export function initDragDrop(element, nodeId, onDropComplete) {
  element.setAttribute('draggable', 'true');

  element.addEventListener('dragstart', (e) => handleDragStart(e, nodeId));
  element.addEventListener('dragend', (e) => handleDragEnd(e));
  element.addEventListener('dragover', (e) => handleDragOver(e));
  element.addEventListener('dragleave', (e) => handleDragLeave(e));
  element.addEventListener('drop', (e) => handleDrop(e, nodeId, onDropComplete));
}

/**
 * Handle drag start
 */
function handleDragStart(e, nodeId) {
  draggedNodeId = nodeId;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'all';
  e.dataTransfer.setData('text/plain', nodeId);

  // Capture modifiers at start
  dragModifiers = {
    ctrl: e.ctrlKey || e.metaKey,
    alt: e.altKey
  };
}

/**
 * Handle drag end
 */
function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
}

/**
 * Handle drag over
 */
function handleDragOver(e) {
  e.preventDefault();

  // Update modifiers in real-time
  dragModifiers = {
    ctrl: e.ctrlKey || e.metaKey,
    alt: e.altKey
  };

  // Determine drop effect based on modifiers
  if (dragModifiers.ctrl && dragModifiers.alt) {
    e.dataTransfer.dropEffect = 'link';
  } else if (dragModifiers.ctrl) {
    e.dataTransfer.dropEffect = 'copy';
  } else {
    e.dataTransfer.dropEffect = 'move';
  }

  // Remove old indicators
  document.querySelectorAll('.drop-indicator').forEach(el => el.remove());

  const element = e.currentTarget;
  if (element.classList.contains('dragging')) return;

  // Calculate mouse position relative to element
  const rect = element.getBoundingClientRect();

  // Detect if it's a child-card (horizontal grid) or tree-node (vertical tree)
  const isChildCard = element.classList.contains('child-card');

  if (isChildCard) {
    // HORIZONTAL GRID: use mouseX (left/right)
    const mouseX = e.clientX - rect.left;
    const width = rect.width;

    if (mouseX < width * 0.33) {
      // Left zone: insert BEFORE (to the left)
      dropPosition = 'before';
      const indicator = document.createElement('div');
      indicator.className = 'drop-indicator left';
      element.appendChild(indicator);
    } else if (mouseX > width * 0.67) {
      // Right zone: insert AFTER (to the right)
      dropPosition = 'after';
      const indicator = document.createElement('div');
      indicator.className = 'drop-indicator right';
      element.appendChild(indicator);
    } else {
      // Middle zone: drop INSIDE
      dropPosition = 'inside';
      element.classList.add('drag-over');
    }
  } else {
    // VERTICAL TREE: use mouseY (top/bottom)
    const mouseY = e.clientY - rect.top;
    const height = rect.height;

    if (mouseY < height * 0.33) {
      // Top zone: insert BEFORE (above)
      dropPosition = 'before';
      const indicator = document.createElement('div');
      indicator.className = 'drop-indicator top';
      element.appendChild(indicator);
    } else if (mouseY > height * 0.67) {
      // Bottom zone: insert AFTER (below)
      dropPosition = 'after';
      const indicator = document.createElement('div');
      indicator.className = 'drop-indicator bottom';
      element.appendChild(indicator);
    } else {
      // Middle zone: drop INSIDE
      dropPosition = 'inside';
      element.classList.add('drag-over');
    }
  }
}

/**
 * Handle drag leave
 */
function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

/**
 * Handle drop
 */
function handleDrop(e, targetNodeId, onDropComplete) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove('drag-over');
  document.querySelectorAll('.drop-indicator').forEach(el => el.remove());

  const draggedId = draggedNodeId;
  const position = dropPosition;

  // Don't do anything if dropping on itself
  if (draggedId === targetNodeId) return;

  // Don't allow dropping on descendants (cycle prevention)
  if (isDescendantOf(targetNodeId, draggedId)) {
    showToast('Impossible : destination invalide', '⚠️');
    return;
  }

  const { ctrl, alt } = dragModifiers;

  // Determine action based on position and modifiers
  if (position === 'before' || position === 'after') {
    // TOP/BOTTOM ZONES: insert before/after
    if (ctrl && !alt) {
      // Ctrl alone: DUPLICATE and insert before/after
      duplicateNodeAt(draggedId, targetNodeId, position);
    } else {
      // Default (and Ctrl+Alt): MOVE and insert before/after
      reorderNodes(draggedId, targetNodeId, position);
    }
  } else {
    // MIDDLE ZONE: drop INSIDE (change parent)
    handleInsideAction(draggedId, targetNodeId);
  }

  // Trigger re-render
  if (onDropComplete) onDropComplete();
}

/**
 * Handle "inside" action (drop inside)
 */
function handleInsideAction(draggedId, targetNodeId) {
  const { ctrl, alt } = dragModifiers;

  let action;
  if (ctrl && alt) {
    action = 'link';
  } else if (ctrl) {
    action = 'duplicate';
  } else {
    action = 'move';
  }

  switch (action) {
    case 'move':
      moveNode(draggedId, targetNodeId);
      break;
    case 'link':
      createSymlinkTo(draggedId, targetNodeId);
      break;
    case 'duplicate':
      duplicateNode(draggedId, targetNodeId);
      break;
  }
}

/**
 * Check if targetId is a descendant of nodeId
 */
function isDescendantOf(targetId, nodeId) {
  if (!targetId || targetId === nodeId) return false;

  const target = data.nodes[targetId];
  if (!target) return false;

  if (target.parent === nodeId) return true;
  return isDescendantOf(target.parent, nodeId);
}

/**
 * Reorder nodes (siblings) - insert before/after
 */
function reorderNodes(draggedId, targetId, position) {
  const draggedNode = data.nodes[draggedId];
  const targetNode = data.nodes[targetId];
  const newParentId = targetNode.parent;
  const oldParentId = draggedNode.parent;

  // Remove dragged node from old parent
  if (oldParentId === null) {
    data.rootNodes = data.rootNodes.filter(id => id !== draggedId);
  } else {
    data.nodes[oldParentId].children = data.nodes[oldParentId].children.filter(id => id !== draggedId);
  }

  // Get children array of target's parent (AFTER removal)
  let childrenArray;
  if (newParentId === null) {
    childrenArray = data.rootNodes;
  } else {
    childrenArray = data.nodes[newParentId].children;
  }

  // Find target position
  const targetIndex = childrenArray.indexOf(targetId);

  // Insert based on position
  if (position === 'before') {
    childrenArray.splice(targetIndex, 0, draggedId);
  } else { // 'after'
    childrenArray.splice(targetIndex + 1, 0, draggedId);
  }

  // Update dragged node's parent
  draggedNode.parent = newParentId;

  saveData();
  showToast('Ordre modifié', '🔄');
}

/**
 * Move a node to a new parent
 */
function moveNode(nodeId, newParentId) {
  const node = data.nodes[nodeId];
  const oldParent = node.parent;

  // Remove from old parent
  if (oldParent === null) {
    data.rootNodes = data.rootNodes.filter(id => id !== nodeId);
  } else {
    data.nodes[oldParent].children = data.nodes[oldParent].children.filter(id => id !== nodeId);
  }

  // Add to new parent
  node.parent = newParentId;
  if (newParentId === null) {
    data.rootNodes.push(nodeId);
  } else {
    data.nodes[newParentId].children.push(nodeId);
  }

  saveData();
  showToast('Nœud déplacé', '📦');
}

/**
 * Create a symlink to a node
 */
function createSymlinkTo(targetNodeId, parentId) {
  const targetNode = data.nodes[targetNodeId];
  if (!targetNode) return;

  const symlinkId = 'symlink_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  const symlink = {
    id: symlinkId,
    type: 'symlink',
    targetId: targetNodeId,
    title: targetNode.title,
    parent: parentId,
    children: [],
    tags: [],
    created: Date.now(),
    modified: Date.now()
  };

  data.nodes[symlinkId] = symlink;

  if (parentId === null) {
    data.rootNodes.push(symlinkId);
  } else {
    data.nodes[parentId].children.push(symlinkId);
  }

  saveData();
  showToast('Lien symbolique créé', '🔗');
}

/**
 * Duplicate a node (and its descendants)
 */
function duplicateNode(nodeId, newParentId) {
  const node = data.nodes[nodeId];
  if (!node) return;

  // Generate new ID
  const newId = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  // Recursive duplication
  const duplicateRecursive = (originalId, parentId) => {
    const original = data.nodes[originalId];
    if (!original) return null;

    const duplicateId = originalId === nodeId ? newId : 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Create duplicate (don't duplicate symlinks as symlinks, duplicate the content)
    const duplicate = {
      id: duplicateId,
      type: 'note',
      title: original.title + ' (copie)',
      content: original.type === 'symlink' ? data.nodes[original.targetId]?.content || '' : original.content,
      parent: parentId,
      children: [],
      tags: [...original.tags],
      created: Date.now(),
      modified: Date.now()
    };

    data.nodes[duplicateId] = duplicate;

    // Duplicate children
    if (original.children && original.children.length > 0) {
      original.children.forEach(childId => {
        const duplicatedChildId = duplicateRecursive(childId, duplicateId);
        if (duplicatedChildId) {
          duplicate.children.push(duplicatedChildId);
        }
      });
    }

    return duplicateId;
  };

  duplicateRecursive(nodeId, newParentId);

  // Add to parent
  if (newParentId === null) {
    data.rootNodes.push(newId);
  } else {
    data.nodes[newParentId].children.push(newId);
  }

  saveData();
  showToast('Nœud dupliqué', '📋');
}

/**
 * Duplicate a node and insert it before/after target
 */
function duplicateNodeAt(draggedId, targetId, position) {
  const draggedNode = data.nodes[draggedId];
  const targetNode = data.nodes[targetId];
  const parentId = targetNode.parent;

  // Generate new ID
  const newId = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  // Recursive duplication (same as duplicateNode)
  const duplicateRecursive = (originalId, newParentId) => {
    const original = data.nodes[originalId];
    if (!original) return null;

    const duplicateId = originalId === draggedId ? newId : 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const duplicate = {
      id: duplicateId,
      type: 'note',
      title: original.title + ' (copie)',
      content: original.type === 'symlink' ? data.nodes[original.targetId]?.content || '' : original.content,
      parent: newParentId,
      children: [],
      tags: [...original.tags],
      created: Date.now(),
      modified: Date.now()
    };

    data.nodes[duplicateId] = duplicate;

    if (original.children && original.children.length > 0) {
      original.children.forEach(childId => {
        const duplicatedChildId = duplicateRecursive(childId, duplicateId);
        if (duplicatedChildId) {
          duplicate.children.push(duplicatedChildId);
        }
      });
    }

    return duplicateId;
  };

  duplicateRecursive(draggedId, parentId);

  // Insert before/after target
  let childrenArray;
  if (parentId === null) {
    childrenArray = data.rootNodes;
  } else {
    childrenArray = data.nodes[parentId].children;
  }

  const targetIndex = childrenArray.indexOf(targetId);
  if (position === 'before') {
    childrenArray.splice(targetIndex, 0, newId);
  } else {
    childrenArray.splice(targetIndex + 1, 0, newId);
  }

  saveData();
  showToast('Nœud dupliqué et inséré', '📋');
}
