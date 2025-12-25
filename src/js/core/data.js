/**
 * DeepMemo - Data Management Module
 * Handles data storage, persistence, import/export
 */

import { generateId } from '../utils/helpers.js';
import { getDefaultData } from './default-data.js';
import * as AttachmentsModule from './attachments.js';

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
 * If no data exists, load default demo content
 */
export function loadData() {
  const stored = localStorage.getItem('deepmemo_data');
  if (stored) {
    const parsed = JSON.parse(stored);
    data.nodes = parsed.nodes || {};
    data.rootNodes = parsed.rootNodes || [];
    migrateSymlinks();
  } else {
    // First-time user: load default demo content
    console.log('📘 Bienvenue dans DeepMemo ! Chargement du contenu de démonstration...');
    const defaultData = getDefaultData();
    data.nodes = defaultData.nodes;
    data.rootNodes = defaultData.rootNodes;
    saveData();
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
 * Collect a node and all its descendants recursively
 * @param {string} nodeId - Root node ID
 * @returns {Object} Object with nodes dictionary
 */
function collectBranchNodes(nodeId) {
  const branchNodes = {};

  const collectRecursive = (id) => {
    const node = data.nodes[id];
    if (!node || branchNodes[id]) return; // Already collected or doesn't exist

    branchNodes[id] = node;

    // Recursively collect children
    if (node.children && node.children.length > 0) {
      node.children.forEach(childId => collectRecursive(childId));
    }
  };

  collectRecursive(nodeId);
  return branchNodes;
}

/**
 * Export a branch (node + descendants) as JSON file
 * @param {string} nodeId - Root node ID to export
 */
export function exportBranch(nodeId) {
  const node = data.nodes[nodeId];
  if (!node) {
    alert('Nœud introuvable');
    return;
  }

  const branchNodes = collectBranchNodes(nodeId);
  const nodeCount = Object.keys(branchNodes).length;

  const branchData = {
    type: 'deepmemo-branch',
    version: '1.0',
    branchRootId: nodeId,
    exported: Date.now(),
    nodeCount: nodeCount,
    nodes: branchNodes
  };

  const dataStr = JSON.stringify(branchData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `deepmemo-branch-${node.title.replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import a branch as children of current node
 * @param {Event} event - File input change event
 * @param {string} parentId - Parent node ID (or null for root)
 * @param {Function} onSuccess - Callback on successful import
 */
export function importBranch(event, parentId, onSuccess) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);

      // Validate branch format
      if (imported.type !== 'deepmemo-branch' || !imported.nodes || !imported.branchRootId) {
        alert('Fichier de branche invalide. Utilise l\'import global pour les exports complets.');
        return;
      }

      const nodeCount = Object.keys(imported.nodes).length;
      if (!confirm(`Importer ${nodeCount} nœud(s) comme enfants du nœud actuel ?`)) {
        return;
      }

      // Generate new IDs to avoid conflicts
      const oldToNewId = {};
      Object.keys(imported.nodes).forEach(oldId => {
        oldToNewId[oldId] = generateId();
      });

      // Import nodes with new IDs
      const importedRootId = oldToNewId[imported.branchRootId];

      Object.entries(imported.nodes).forEach(([oldId, oldNode]) => {
        const newId = oldToNewId[oldId];
        const newNode = {
          ...oldNode,
          id: newId,
          parent: oldId === imported.branchRootId
            ? parentId
            : (oldNode.parent ? oldToNewId[oldNode.parent] : null),
          children: oldNode.children.map(childId => oldToNewId[childId]),
          modified: Date.now()
        };

        // Update targetId for symlinks
        if (newNode.type === 'symlink' && newNode.targetId) {
          newNode.targetId = oldToNewId[newNode.targetId] || newNode.targetId;
        }

        data.nodes[newId] = newNode;
      });

      // Attach to parent or root
      if (parentId === null) {
        if (!data.rootNodes.includes(importedRootId)) {
          data.rootNodes.push(importedRootId);
        }
      } else {
        const parent = data.nodes[parentId];
        if (parent && !parent.children.includes(importedRootId)) {
          parent.children.push(importedRootId);
        }
      }

      saveData();

      if (onSuccess) {
        onSuccess(nodeCount, importedRootId);
      }
    } catch (err) {
      alert('Erreur lors de l\'import : ' + err.message);
      console.error(err);
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

/**
 * Export all data as ZIP with attachments
 */
export async function exportDataZIP() {
  try {
    const zip = new JSZip();

    // Add data.json
    const dataStr = JSON.stringify(data, null, 2);
    zip.file('data.json', dataStr);

    // Collect all attachment IDs from all nodes
    const attachmentIds = new Set();
    for (const node of Object.values(data.nodes)) {
      if (node.attachments) {
        for (const attachment of node.attachments) {
          attachmentIds.add(attachment.id);
        }
      }
    }

    // Add attachments to ZIP
    const attachmentsFolder = zip.folder('attachments');
    for (const attachId of attachmentIds) {
      const blob = await AttachmentsModule.getAttachment(attachId);
      if (blob) {
        // Find attachment metadata to get filename
        let filename = attachId; // Fallback
        for (const node of Object.values(data.nodes)) {
          if (node.attachments) {
            const att = node.attachments.find(a => a.id === attachId);
            if (att) {
              filename = `${attachId}_${att.name}`;
              break;
            }
          }
        }
        attachmentsFolder.file(filename, blob);
      }
    }

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepmemo-export-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);

    console.log(`[Export] ZIP created with ${attachmentIds.size} attachments`);
  } catch (error) {
    console.error('[Export] Failed to create ZIP:', error);
    alert('Erreur lors de l\'export : ' + error.message);
  }
}

/**
 * Export a branch as ZIP with attachments
 * @param {string} nodeId - Root node ID to export
 */
export async function exportBranchZIP(nodeId) {
  try {
    const node = data.nodes[nodeId];
    if (!node) {
      alert('Nœud introuvable');
      return;
    }

    const zip = new JSZip();

    // Collect branch nodes
    const branchNodes = collectBranchNodes(nodeId);
    const nodeCount = Object.keys(branchNodes).length;

    const branchData = {
      type: 'deepmemo-branch',
      version: '1.0',
      branchRootId: nodeId,
      exported: Date.now(),
      nodeCount: nodeCount,
      nodes: branchNodes
    };

    // Add data.json
    const dataStr = JSON.stringify(branchData, null, 2);
    zip.file('data.json', dataStr);

    // Collect attachment IDs from branch nodes only
    const attachmentIds = new Set();
    for (const branchNode of Object.values(branchNodes)) {
      if (branchNode.attachments) {
        for (const attachment of branchNode.attachments) {
          attachmentIds.add(attachment.id);
        }
      }
    }

    // Add attachments to ZIP
    const attachmentsFolder = zip.folder('attachments');
    for (const attachId of attachmentIds) {
      const blob = await AttachmentsModule.getAttachment(attachId);
      if (blob) {
        // Find attachment metadata to get filename
        let filename = attachId; // Fallback
        for (const branchNode of Object.values(branchNodes)) {
          if (branchNode.attachments) {
            const att = branchNode.attachments.find(a => a.id === attachId);
            if (att) {
              filename = `${attachId}_${att.name}`;
              break;
            }
          }
        }
        attachmentsFolder.file(filename, blob);
      }
    }

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepmemo-branch-${node.title.replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);

    console.log(`[Export] Branch ZIP created with ${nodeCount} nodes and ${attachmentIds.size} attachments`);
  } catch (error) {
    console.error('[Export] Failed to create branch ZIP:', error);
    alert('Erreur lors de l\'export : ' + error.message);
  }
}

/**
 * Import data from ZIP with attachments
 * @param {Event} event - File input change event
 * @param {Function} onSuccess - Callback on successful import
 */
export async function importDataZIP(event, onSuccess) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // Load ZIP
    const zip = await JSZip.loadAsync(file);

    // Extract data.json
    const dataJsonFile = zip.file('data.json');
    if (!dataJsonFile) {
      alert('Fichier data.json introuvable dans le ZIP');
      return;
    }

    const dataStr = await dataJsonFile.async('string');
    const imported = JSON.parse(dataStr);

    if (!imported.nodes || !imported.rootNodes) {
      alert('Fichier JSON invalide');
      return;
    }

    const nodeCount = Object.keys(imported.nodes).length;

    // Extract attachments
    const attachmentsFolder = zip.folder('attachments');
    let attachmentCount = 0;

    if (attachmentsFolder) {
      const attachmentFiles = [];
      attachmentsFolder.forEach((relativePath, file) => {
        if (!file.dir) {
          attachmentFiles.push({ path: relativePath, file });
        }
      });
      attachmentCount = attachmentFiles.length;

      if (!confirm(`Importer ${nodeCount} nœud(s) et ${attachmentCount} fichier(s) ? Cela écrasera tes données actuelles.`)) {
        event.target.value = '';
        return;
      }

      // Restore attachments to IndexedDB
      for (const { path, file } of attachmentFiles) {
        const blob = await file.async('blob');
        // Extract attachment ID from filename (format: {id}_{name})
        const attachId = path.split('_')[0];
        await AttachmentsModule.saveAttachment(attachId, blob);
      }
    } else {
      if (!confirm(`Importer ${nodeCount} nœud(s) ? Cela écrasera tes données actuelles.`)) {
        event.target.value = '';
        return;
      }
    }

    // Import data
    data.nodes = imported.nodes;
    data.rootNodes = imported.rootNodes;
    saveData();

    console.log(`[Import] Imported ${nodeCount} nodes and ${attachmentCount} attachments`);

    if (onSuccess) {
      onSuccess(nodeCount);
    }
  } catch (err) {
    alert('Erreur lors de l\'import : ' + err.message);
    console.error('[Import] Failed:', err);
  }

  event.target.value = '';
}

/**
 * Import branch from ZIP with attachments
 * @param {Event} event - File input change event
 * @param {string} parentId - Parent node ID
 * @param {Function} onSuccess - Callback on successful import
 */
export async function importBranchZIP(event, parentId, onSuccess) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // Load ZIP
    const zip = await JSZip.loadAsync(file);

    // Extract data.json
    const dataJsonFile = zip.file('data.json');
    if (!dataJsonFile) {
      alert('Fichier data.json introuvable dans le ZIP');
      return;
    }

    const dataStr = await dataJsonFile.async('string');
    const imported = JSON.parse(dataStr);

    // Validate branch format
    if (imported.type !== 'deepmemo-branch' || !imported.nodes || !imported.branchRootId) {
      alert('Fichier de branche invalide. Utilise l\'import global pour les exports complets.');
      return;
    }

    const nodeCount = Object.keys(imported.nodes).length;

    // Extract attachments
    const attachmentsFolder = zip.folder('attachments');
    let attachmentCount = 0;
    const attachmentFiles = [];

    if (attachmentsFolder) {
      attachmentsFolder.forEach((relativePath, file) => {
        if (!file.dir) {
          attachmentFiles.push({ path: relativePath, file });
        }
      });
      attachmentCount = attachmentFiles.length;
    }

    if (!confirm(`Importer ${nodeCount} nœud(s) et ${attachmentCount} fichier(s) comme enfants du nœud actuel ?`)) {
      event.target.value = '';
      return;
    }

    // Generate new IDs to avoid conflicts
    const oldToNewId = {};
    const oldToNewAttachId = {};

    Object.keys(imported.nodes).forEach(oldId => {
      oldToNewId[oldId] = generateId();
    });

    // Collect old attachment IDs and generate new ones
    Object.values(imported.nodes).forEach(node => {
      if (node.attachments) {
        node.attachments.forEach(att => {
          if (!oldToNewAttachId[att.id]) {
            oldToNewAttachId[att.id] = AttachmentsModule.generateAttachmentId();
          }
        });
      }
    });

    // Restore attachments to IndexedDB with new IDs
    for (const { path, file } of attachmentFiles) {
      const blob = await file.async('blob');
      // Extract old attachment ID from filename (format: {id}_{name})
      const oldAttachId = path.split('_')[0];
      const newAttachId = oldToNewAttachId[oldAttachId];
      if (newAttachId) {
        await AttachmentsModule.saveAttachment(newAttachId, blob);
      }
    }

    // Import nodes with new IDs
    const importedRootId = oldToNewId[imported.branchRootId];

    Object.entries(imported.nodes).forEach(([oldId, oldNode]) => {
      const newId = oldToNewId[oldId];
      const newNode = {
        ...oldNode,
        id: newId,
        parent: oldId === imported.branchRootId
          ? parentId
          : (oldNode.parent ? oldToNewId[oldNode.parent] : null),
        children: oldNode.children.map(childId => oldToNewId[childId]),
        modified: Date.now()
      };

      // Update targetId for symlinks
      if (newNode.type === 'symlink' && newNode.targetId) {
        newNode.targetId = oldToNewId[newNode.targetId] || newNode.targetId;
      }

      // Update attachment IDs
      if (newNode.attachments) {
        newNode.attachments = newNode.attachments.map(att => ({
          ...att,
          id: oldToNewAttachId[att.id] || att.id
        }));
      }

      data.nodes[newId] = newNode;
    });

    // Attach to parent or root
    if (parentId === null) {
      if (!data.rootNodes.includes(importedRootId)) {
        data.rootNodes.push(importedRootId);
      }
    } else {
      const parent = data.nodes[parentId];
      if (parent && !parent.children.includes(importedRootId)) {
        parent.children.push(importedRootId);
      }
    }

    saveData();

    console.log(`[Import] Imported branch with ${nodeCount} nodes and ${attachmentCount} attachments`);

    if (onSuccess) {
      onSuccess(nodeCount, importedRootId);
    }
  } catch (err) {
    alert('Erreur lors de l\'import : ' + err.message);
    console.error('[Import] Failed:', err);
  }

  event.target.value = '';
}
