/**
 * DeepMemo - Data Management Module
 * Handles data storage, persistence, import/export
 */

import { generateId } from '../utils/helpers.js';

/**
 * Data state
 */
export const data = {
  nodes: {},
  rootNodes: []
};

/**
 * Save data to localStorage
 */
export function saveData() {
  localStorage.setItem('deepmemo_data', JSON.stringify(data));
}

/**
 * Load data from localStorage
 */
export function loadData() {
  const stored = localStorage.getItem('deepmemo_data');
  if (stored) {
    const parsed = JSON.parse(stored);
    data.nodes = parsed.nodes || {};
    data.rootNodes = parsed.rootNodes || [];
    migrateSymlinks();
  }
}

/**
 * Migrate old symlinks format to new format
 */
function migrateSymlinks() {
  let migrated = false;

  // Add type: 'node' to all nodes that don't have it
  Object.values(data.nodes).forEach(node => {
    if (!node.type) {
      node.type = 'node';
      migrated = true;
    }
  });

  // Convert old symlinks (symlinkedIn[]) to actual symlink nodes
  Object.values(data.nodes).forEach(node => {
    if (node.symlinkedIn && node.symlinkedIn.length > 0) {
      node.symlinkedIn.forEach(parentId => {
        const symlinkId = generateId();
        const symlink = {
          id: symlinkId,
          type: 'symlink',
          title: node.title,
          targetId: node.id,
          parent: parentId,
          children: [],
          created: Date.now(),
          modified: Date.now()
        };

        data.nodes[symlinkId] = symlink;

        if (parentId === null) {
          if (!data.rootNodes.includes(symlinkId)) {
            data.rootNodes.push(symlinkId);
          }
        } else {
          const parent = data.nodes[parentId];
          if (parent && !parent.children.includes(symlinkId)) {
            parent.children.push(symlinkId);
          }
        }

        migrated = true;
      });

      delete node.symlinkedIn;
    }
  });

  if (migrated) {
    console.log('✅ Migration des symlinks effectuée');
    saveData();
  }
}

/**
 * Export data as JSON file
 */
export function exportData() {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'deepmemo-export-' + Date.now() + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import data from JSON file
 * @param {Event} event - File input change event
 * @param {Function} onSuccess - Callback on successful import
 */
export function importData(event, onSuccess) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!imported.nodes || !imported.rootNodes) {
        alert('Fichier JSON invalide');
        return;
      }

      const nodeCount = Object.keys(imported.nodes).length;
      if (confirm(`Importer ${nodeCount} nœud(s) ? Cela écrasera tes données actuelles.`)) {
        data.nodes = imported.nodes;
        data.rootNodes = imported.rootNodes;
        saveData();

        if (onSuccess) {
          onSuccess(nodeCount);
        }
      }
    } catch (err) {
      alert('Erreur lors de l\'import : ' + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

/**
 * Find a node by its title
 * @param {string} title - Node title to search
 * @returns {Object|undefined} Found node or undefined
 */
export function findNodeByTitle(title) {
  return Object.values(data.nodes).find(
    node => node.title.toLowerCase() === title.toLowerCase()
  );
}

/**
 * Check if nodeId is a descendant of ancestorId
 * @param {string} nodeId - Node ID to check
 * @param {string} ancestorId - Potential ancestor ID
 * @returns {boolean} True if nodeId is descendant of ancestorId
 */
export function isDescendantOf(nodeId, ancestorId) {
  let current = nodeId;
  while (current) {
    const node = data.nodes[current];
    if (!node) return false;
    if (node.parent === ancestorId) return true;
    current = node.parent;
  }
  return false;
}

/**
 * Check if creating a symlink would create a cycle
 * @param {string} targetId - Target node ID
 * @param {string} parentId - Parent node ID where symlink would be created
 * @returns {boolean} True if would create a cycle
 */
export function wouldCreateCycle(targetId, parentId) {
  if (parentId === null) return false;

  let current = parentId;
  while (current) {
    if (current === targetId) return true;
    const node = data.nodes[current];
    if (!node) return false;
    current = node.parent;
  }

  return false;
}

/**
 * Check if moving a node would create a cycle
 * @param {string} nodeId - Node ID to move
 * @param {string} newParentId - New parent ID
 * @returns {boolean} True if would create a cycle
 */
export function wouldCreateCycleWithMove(nodeId, newParentId) {
  if (newParentId === null) return false;

  // Collect all ancestors of new parent
  const ancestorIds = [newParentId];
  let current = newParentId;
  while (current) {
    const node = data.nodes[current];
    if (!node) break;
    if (node.parent) ancestorIds.push(node.parent);
    current = node.parent;
  }

  // Check if any descendant of nodeId contains a symlink pointing to ancestors
  const checkDescendants = (id) => {
    const node = data.nodes[id];
    if (!node) return false;

    for (const childId of node.children) {
      const child = data.nodes[childId];
      if (!child) continue;

      // If child is a symlink pointing to an ancestor, cycle detected
      if (child.type === 'symlink' && ancestorIds.includes(child.targetId)) {
        return true;
      }

      // Recursively check descendants
      if (checkDescendants(childId)) {
        return true;
      }
    }

    return false;
  };

  return checkDescendants(nodeId);
}
