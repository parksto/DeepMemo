/**
 * DeepMemo - Data Management Module
 * Handles data storage, persistence, import/export
 * V0.10: Migrated from localStorage to IndexedDB
 */

import { generateId } from '../utils/helpers.js';
import { getDefaultData } from './default-data.js';
import * as AttachmentsModule from './attachments.js';
import * as Storage from './storage.js';
import * as Migration from './migration.js';
import { t } from '../utils/i18n.js';
import { notifyDataChanged } from '../utils/sync.js';

/**
 * i18n wrappers for alerts and confirms
 */
function i18nAlert(key, params = {}) {
  alert(t(`alerts.${key}`, params));
}

function i18nConfirm(key, params = {}) {
  return confirm(t(`confirms.${key}`, params));
}

/**
 * Data state (kept in memory for fast synchronous access)
 */
export const data = {
  nodes: {},
  rootNodes: []
};

/**
 * Save data to IndexedDB
 * Now async - called automatically after each modification
 */
export async function saveData() {
  try {
    await Storage.saveNodes(data.nodes);
    await Storage.saveSetting('rootNodes', data.rootNodes);
    // console.log('[Data] Saved to IndexedDB');

    // Notify other tabs about the change
    notifyDataChanged();
  } catch (error) {
    console.error('[Data] Failed to save to IndexedDB:', error);
    // Fallback to localStorage in case of error
    localStorage.setItem('deepmemo_data', JSON.stringify(data));
  }
}

/**
 * Load data from IndexedDB
 * Handles migration from localStorage automatically
 * If no data exists, load default demo content
 */
export async function loadData() {
  try {
    // Run migration if needed (this also initializes storage)
    const migrationResult = await Migration.completeMigration();

    if (migrationResult.dataMigrated) {
      console.log('[Data] ✅ Data migrated from localStorage to IndexedDB');
    }

    if (migrationResult.attachmentsMigrated) {
      console.log('[Data] ✅ Attachments migrated to new database structure');
    }

    // Load nodes from IndexedDB
    const nodes = await Storage.loadNodes();

    // Load rootNodes from settings
    const rootNodes = await Storage.loadSetting('rootNodes', []);

    // Check if we have data
    if (Object.keys(nodes).length > 0) {
      data.nodes = nodes;
      data.rootNodes = rootNodes;
      console.log(`[Data] Loaded ${Object.keys(nodes).length} nodes from IndexedDB`);
      migrateSymlinks();
    } else {
      // First-time user: load default demo content
      console.log('📘 Bienvenue dans DeepMemo ! Chargement du contenu de démonstration...');
      const defaultData = getDefaultData();
      data.nodes = defaultData.nodes;
      data.rootNodes = defaultData.rootNodes;
      await saveData();

      // Load default demo attachments (async, non-blocking)
      AttachmentsModule.loadDefaultAttachments(data).then(async () => {
        // Save data again with attachment metadata
        await saveData();
      }).catch(error => {
        console.error('[Data] Failed to load default attachments:', error);
      });
    }
  } catch (error) {
    console.error('[Data] Failed to load from IndexedDB, falling back to localStorage:', error);

    // Fallback to localStorage if IndexedDB fails
    const stored = localStorage.getItem('deepmemo_data');
    if (stored) {
      const parsed = JSON.parse(stored);
      data.nodes = parsed.nodes || {};
      data.rootNodes = parsed.rootNodes || [];
      migrateSymlinks();
    } else {
      // Load default data as last resort
      const defaultData = getDefaultData();
      data.nodes = defaultData.nodes;
      data.rootNodes = defaultData.rootNodes;
    }
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
    saveData(); // Fire-and-forget async save
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
        i18nAlert('invalidFile');
        return;
      }

      const nodeCount = Object.keys(imported.nodes).length;
      if (i18nConfirm('importData', { count: nodeCount })) {
        data.nodes = imported.nodes;
        data.rootNodes = imported.rootNodes;
        saveData();

        if (onSuccess) {
          onSuccess(nodeCount);
        }
      }
    } catch (err) {
      i18nAlert('importError', { message: err.message });
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
    i18nAlert('nodeNotFound');
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
        i18nAlert('invalidBranch');
        return;
      }

      const nodeCount = Object.keys(imported.nodes).length;
      if (!i18nConfirm('importBranch', { count: nodeCount })) {
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
      i18nAlert('importError', { message: err.message });
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
    i18nAlert('exportError', { message: error.message });
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
      i18nAlert('nodeNotFound');
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
    i18nAlert('exportError', { message: error.message });
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
      i18nAlert('dataJsonNotFound');
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

      if (!i18nConfirm('importDataWithFiles', { count: nodeCount, fileCount: attachmentCount })) {
        event.target.value = '';
        return;
      }

      // Build list of attachment IDs from imported nodes
      const attachmentIds = new Set();
      Object.values(imported.nodes).forEach(node => {
        if (node.attachments) {
          node.attachments.forEach(att => {
            attachmentIds.add(att.id);
          });
        }
      });

      // Restore attachments to IndexedDB
      for (const { path, file } of attachmentFiles) {
        const blob = await file.async('blob');

        // Find which attachment ID this file corresponds to
        // Filename format: {attachmentId}_{originalName}
        // Problem: attachment IDs contain underscores (e.g., "demo_mindmap_svg")
        // Solution: check which ID matches the start of the path
        let attachId = null;
        for (const id of attachmentIds) {
          if (path.startsWith(id + '_')) {
            attachId = id;
            break;
          }
        }

        if (attachId) {
          await AttachmentsModule.saveAttachment(attachId, blob);
          console.log(`[Import] Restored attachment: ${attachId} (${blob.size} bytes)`);
        } else {
          console.warn(`[Import] Could not find attachment ID for file: ${path}`);
        }
      }
    } else {
      if (!i18nConfirm('importData', { count: nodeCount })) {
        event.target.value = '';
        return;
      }
    }

    // Import data
    data.nodes = imported.nodes;
    data.rootNodes = imported.rootNodes;
    saveData();

    // Clean orphaned attachment references (nodes referencing non-existent files)
    const cleanupStats = await AttachmentsModule.cleanOrphanedReferences(data);
    if (cleanupStats.cleaned > 0) {
      saveData(); // Save again after cleanup
    }

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
      i18nAlert('dataJsonNotFound');
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

    if (!i18nConfirm('importBranchWithFiles', { count: nodeCount, fileCount: attachmentCount })) {
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

      // Find which old attachment ID this file corresponds to
      // Filename format: {attachmentId}_{originalName}
      // Problem: attachment IDs contain underscores (e.g., "demo_mindmap_svg")
      // Solution: check which ID from oldToNewAttachId matches the start of the path
      let oldAttachId = null;
      for (const id of Object.keys(oldToNewAttachId)) {
        if (path.startsWith(id + '_')) {
          oldAttachId = id;
          break;
        }
      }

      if (oldAttachId) {
        const newAttachId = oldToNewAttachId[oldAttachId];
        await AttachmentsModule.saveAttachment(newAttachId, blob);
        console.log(`[Import] Restored attachment: ${oldAttachId} -> ${newAttachId} (${blob.size} bytes)`);
      } else {
        console.warn(`[Import] Could not find attachment ID for file: ${path}`);
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

      // Update attachment IDs in metadata
      if (newNode.attachments) {
        newNode.attachments = newNode.attachments.map(att => ({
          ...att,
          id: oldToNewAttachId[att.id] || att.id
        }));
      }

      // Update attachment references in content (attachment:OLD_ID -> attachment:NEW_ID)
      if (newNode.content) {
        for (const [oldAttachId, newAttachId] of Object.entries(oldToNewAttachId)) {
          const oldRef = `attachment:${oldAttachId}`;
          const newRef = `attachment:${newAttachId}`;
          newNode.content = newNode.content.replaceAll(oldRef, newRef);
        }
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

    // Clean orphaned attachment references (nodes referencing non-existent files)
    const cleanupStats = await AttachmentsModule.cleanOrphanedReferences(data);
    if (cleanupStats.cleaned > 0) {
      saveData(); // Save again after cleanup
    }

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

/**
 * Clean orphan nodes (nodes not referenced anywhere)
 * Returns the number of orphan nodes deleted
 * @returns {number} Number of orphan nodes deleted
 */
export function cleanOrphanNodes() {
  // Collect all referenced node IDs
  const referencedIds = new Set();

  // Add all root nodes
  data.rootNodes.forEach(id => referencedIds.add(id));

  // Add all children and symlink targets
  for (const node of Object.values(data.nodes)) {
    // Add children
    if (node.children) {
      node.children.forEach(childId => referencedIds.add(childId));
    }

    // Add symlink targets
    if (node.type === 'symlink' && node.targetId) {
      referencedIds.add(node.targetId);
    }
  }

  // Find orphan nodes (in data.nodes but not referenced)
  const allNodeIds = Object.keys(data.nodes);
  const orphanIds = allNodeIds.filter(id => !referencedIds.has(id));

  if (orphanIds.length === 0) {
    console.log('[Data] No orphan nodes found');
    return 0;
  }

  // Delete orphan nodes
  for (const id of orphanIds) {
    delete data.nodes[id];
  }

  saveData();

  console.log(`[Data] Cleaned ${orphanIds.length} orphan node(s)`);
  return orphanIds.length;
}

/**
 * Escape XML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeXML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Remove emojis from string for better FreeMind compatibility
 * @param {string} str - String to clean
 * @returns {string} String without emojis
 */
function removeEmojis(str) {
  // Remove emojis using Unicode ranges
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{FE00}-\u{FE0F}\u{1F004}-\u{1F0CF}\u{1F170}-\u{1F251}]/gu, '').trim();
}

/**
 * Generate FreeMind XML for a node and its children
 * @param {string} nodeId - Node ID
 * @param {Object} nodes - Nodes dictionary
 * @param {number} indent - Indentation level
 * @returns {string} XML string
 */
function generateNodeXML(nodeId, nodes, indent) {
  const node = nodes[nodeId];
  if (!node) return '';

  const indentStr = '  '.repeat(indent);
  // Remove emojis for better FreeMind compatibility
  const titleWithoutEmojis = removeEmojis(node.title || 'Untitled');
  const escapedTitle = escapeXML(titleWithoutEmojis);

  let xml = `${indentStr}<node TEXT="${escapedTitle}" ID="${nodeId}"`;

  // Symlink styling: orange color and bubble style for visual distinction
  if (node.type === 'symlink') {
    xml += ' COLOR="#ff9900" STYLE="bubble"';
  }

  xml += '>\n';

  // Add content as richcontent NOTE if present (for non-symlinks)
  if (node.type !== 'symlink' && node.content && node.content.trim()) {
    const escapedContent = escapeXML(node.content);
    xml += `${indentStr}  <richcontent TYPE="NOTE">\n`;
    xml += `${indentStr}    <html>\n`;
    xml += `${indentStr}      <head></head>\n`;
    xml += `${indentStr}      <body>\n`;
    xml += `${indentStr}        <p style="white-space: pre-wrap;">${escapedContent}</p>\n`;
    xml += `${indentStr}      </body>\n`;
    xml += `${indentStr}    </html>\n`;
    xml += `${indentStr}  </richcontent>\n`;
  }

  // Add arrowlink for symlinks to show the connection to target
  if (node.type === 'symlink' && node.targetId) {
    xml += `${indentStr}  <arrowlink DESTINATION="${node.targetId}" COLOR="#ff9900" STARTARROW="None" ENDARROW="Default"/>\n`;
  }

  // Recursively add children
  if (node.children && node.children.length > 0) {
    node.children.forEach(childId => {
      xml += generateNodeXML(childId, nodes, indent + 1);
    });
  }

  xml += `${indentStr}</node>\n`;
  return xml;
}

/**
 * Generate complete FreeMind XML
 * @param {Array} rootIds - Root node IDs
 * @param {Object} nodes - Nodes dictionary
 * @returns {string} Complete XML string
 */
function generateFreeMindXML(rootIds, nodes) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<map version="1.0.1">\n';

  // If single root, use it directly
  // If multiple roots, create a virtual root node
  if (rootIds.length === 1) {
    xml += generateNodeXML(rootIds[0], nodes, 1);
  } else {
    xml += '  <node TEXT="DeepMemo" ID="_virtual_root">\n';
    rootIds.forEach(rootId => {
      xml += generateNodeXML(rootId, nodes, 2);
    });
    xml += '  </node>\n';
  }

  xml += '</map>';
  return xml;
}

/**
 * Export a branch (or full tree) as FreeMind .mm file
 * @param {string|null} branchRootId - Root node ID to export, or null for full tree
 */
export function exportFreeMindMM(branchRootId = null) {
  // Collect nodes to export
  const nodesToExport = branchRootId
    ? collectBranchNodes(branchRootId)
    : data.nodes;

  const rootIds = branchRootId
    ? [branchRootId]
    : data.rootNodes;

  if (rootIds.length === 0) {
    i18nAlert('noData');
    return;
  }

  // Generate XML
  const xml = generateFreeMindXML(rootIds, nodesToExport);

  // Create filename
  const timestamp = Date.now();
  const filename = branchRootId && data.nodes[branchRootId]
    ? `deepmemo-${data.nodes[branchRootId].title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}-${timestamp}.mm`
    : `deepmemo-export-${timestamp}.mm`;

  // Download file
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  console.log(`[Export] FreeMind .mm file exported: ${filename}`);
}

/**
 * Escape special characters for Mermaid syntax
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeMermaid(str) {
  // Remove or replace characters that break Mermaid syntax
  return str
    .replace(/[()[\]{}]/g, ' ')  // Replace all brackets/parens with spaces
    .replace(/"/g, "'")           // Replace double quotes with single quotes
    .replace(/\n/g, ' ')          // Remove newlines
    .replace(/\s+/g, ' ')         // Collapse multiple spaces into one
    .trim();
}

/**
 * Generate Mermaid mindmap syntax for a node and its children
 * @param {string} nodeId - Node ID
 * @param {Object} nodes - Nodes dictionary
 * @param {number} indent - Indentation level
 * @returns {string} Mermaid syntax
 */
function generateMermaidNode(nodeId, nodes, indent) {
  const node = nodes[nodeId];
  if (!node) return '';

  const indentStr = '  '.repeat(indent);
  const escapedTitle = escapeMermaid(node.title || 'Untitled');

  let mermaid = '';

  // Root node has special syntax with double parentheses
  if (indent === 1) {
    mermaid = `${indentStr}root((${escapedTitle}))\n`;
  } else {
    // Symlinks get a special indicator
    const prefix = node.type === 'symlink' ? '🔗 ' : '';
    mermaid = `${indentStr}${prefix}${escapedTitle}\n`;
  }

  // Recursively add children (but not for symlinks to avoid duplication)
  if (node.type !== 'symlink' && node.children && node.children.length > 0) {
    node.children.forEach(childId => {
      mermaid += generateMermaidNode(childId, nodes, indent + 1);
    });
  }

  return mermaid;
}

/**
 * Generate complete Mermaid mindmap syntax
 * @param {Array} rootIds - Root node IDs
 * @param {Object} nodes - Nodes dictionary
 * @returns {string} Complete Mermaid syntax
 */
function generateMermaidMindmap(rootIds, nodes) {
  let mermaid = 'mindmap\n';

  // If single root, use it directly
  // If multiple roots, create a virtual root
  if (rootIds.length === 1) {
    mermaid += generateMermaidNode(rootIds[0], nodes, 1);
  } else {
    mermaid += '  root((DeepMemo))\n';
    rootIds.forEach(rootId => {
      mermaid += generateMermaidNode(rootId, nodes, 2);
    });
  }

  return mermaid;
}

/**
 * Export a branch (or full tree) as Mermaid SVG file
 * @param {string|null} branchRootId - Root node ID to export, or null for full tree
 */
export async function exportMermaidSVG(branchRootId = null) {
  // Check if Mermaid is available
  if (typeof window.mermaid === 'undefined') {
    i18nAlert('mermaidNotAvailable');
    return;
  }

  // Collect nodes to export
  const nodesToExport = branchRootId
    ? collectBranchNodes(branchRootId)
    : data.nodes;

  const rootIds = branchRootId
    ? [branchRootId]
    : data.rootNodes;

  if (rootIds.length === 0) {
    i18nAlert('noData');
    return;
  }

  try {
    // Generate Mermaid syntax
    const mermaidSyntax = generateMermaidMindmap(rootIds, nodesToExport);
    console.log('[Export] Mermaid syntax generated:', mermaidSyntax);

    // Generate SVG using Mermaid.js
    const { svg } = await window.mermaid.render('mermaid-export', mermaidSyntax);

    // Create filename
    const timestamp = Date.now();
    const filename = branchRootId && data.nodes[branchRootId]
      ? `deepmemo-${data.nodes[branchRootId].title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}-${timestamp}.svg`
      : `deepmemo-export-${timestamp}.svg`;

    // Download file
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    console.log(`[Export] Mermaid SVG file exported: ${filename}`);
  } catch (error) {
    console.error('[Export] Mermaid export failed:', error);
    throw error;
  }
}
