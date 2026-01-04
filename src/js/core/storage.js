/**
 * DeepMemo - Storage Module
 * Centralized IndexedDB storage using Dexie.js
 * Replaces localStorage with a more robust, scalable solution
 */

// Dexie database instance
let db;

/**
 * Initialize Dexie database
 * Schema version 1: Initial IndexedDB migration
 */
export async function initStorage() {
  db = new Dexie('deepmemo');

  // Define schema
  db.version(1).stores({
    // Nodes table with indexes
    nodes: 'id, parent, *tags, created, modified',

    // Settings table (key-value pairs)
    settings: 'key',

    // Attachments table (files as blobs, keyed by ID)
    // Simple key-value: {id: blob}
    attachments: 'id'
  });

  await db.open();
  console.log('[Storage] IndexedDB initialized with Dexie');

  return db;
}

/**
 * Get the database instance
 */
export function getDB() {
  if (!db) {
    throw new Error('[Storage] Database not initialized. Call initStorage() first.');
  }
  return db;
}

// ============================================================================
// NODES OPERATIONS
// ============================================================================

/**
 * Save all nodes to IndexedDB
 * @param {Object} nodes - The nodes object {nodeId: nodeData}
 */
export async function saveNodes(nodes) {
  const db = getDB();
  const nodesArray = Object.values(nodes);

  // Use bulkPut for better performance (upsert)
  await db.nodes.bulkPut(nodesArray);
  console.log(`[Storage] Saved ${nodesArray.length} nodes to IndexedDB`);
}

/**
 * Load all nodes from IndexedDB
 * @returns {Promise<Object>} The nodes object {nodeId: nodeData}
 */
export async function loadNodes() {
  const db = getDB();
  const nodesArray = await db.nodes.toArray();

  // Convert array back to object keyed by id
  const nodes = {};
  nodesArray.forEach(node => {
    nodes[node.id] = node;
  });

  console.log(`[Storage] Loaded ${nodesArray.length} nodes from IndexedDB`);
  return nodes;
}

/**
 * Save a single node
 * @param {Object} node - The node data
 */
export async function saveNode(node) {
  const db = getDB();
  await db.nodes.put(node);
}

/**
 * Delete a node
 * @param {string} nodeId - The node ID to delete
 */
export async function deleteNode(nodeId) {
  const db = getDB();
  await db.nodes.delete(nodeId);
}

/**
 * Get a single node
 * @param {string} nodeId - The node ID
 * @returns {Promise<Object|undefined>} The node data
 */
export async function getNode(nodeId) {
  const db = getDB();
  return await db.nodes.get(nodeId);
}

/**
 * Search nodes by tags
 * @param {string} tag - The tag to search for
 * @returns {Promise<Array>} Array of nodes with this tag
 */
export async function getNodesByTag(tag) {
  const db = getDB();
  return await db.nodes.where('tags').equals(tag).toArray();
}

/**
 * Get nodes by parent
 * @param {string|null} parentId - The parent ID (null for root nodes)
 * @returns {Promise<Array>} Array of child nodes
 */
export async function getNodesByParent(parentId) {
  const db = getDB();
  return await db.nodes.where('parent').equals(parentId).toArray();
}

// ============================================================================
// SETTINGS OPERATIONS
// ============================================================================

/**
 * Save a setting
 * @param {string} key - Setting key
 * @param {any} value - Setting value (will be JSON stringified)
 */
export async function saveSetting(key, value) {
  const db = getDB();
  await db.settings.put({ key, value });
}

/**
 * Load a setting
 * @param {string} key - Setting key
 * @param {any} defaultValue - Default value if not found
 * @returns {Promise<any>} The setting value
 */
export async function loadSetting(key, defaultValue = null) {
  const db = getDB();
  const setting = await db.settings.get(key);
  return setting ? setting.value : defaultValue;
}

/**
 * Load all settings as an object
 * @returns {Promise<Object>} Object with all settings {key: value}
 */
export async function loadAllSettings() {
  const db = getDB();
  const settingsArray = await db.settings.toArray();

  const settings = {};
  settingsArray.forEach(s => {
    settings[s.key] = s.value;
  });

  return settings;
}

// ============================================================================
// ATTACHMENTS OPERATIONS
// ============================================================================

/**
 * Save an attachment (simple blob storage)
 * @param {string} id - Attachment ID
 * @param {Blob} blob - File data
 */
export async function saveAttachment(id, blob) {
  const db = getDB();
  await db.attachments.put({ id, blob });
  // console.log(`[Storage] Saved attachment ${id} (${blob.size} bytes)`);
}

/**
 * Load an attachment
 * @param {string} id - The attachment ID
 * @returns {Promise<Blob|undefined>} The blob or undefined
 */
export async function loadAttachment(id) {
  const db = getDB();
  const record = await db.attachments.get(id);
  return record ? record.blob : undefined;
}

/**
 * Delete an attachment
 * @param {string} id - The attachment ID
 */
export async function deleteAttachment(id) {
  const db = getDB();
  await db.attachments.delete(id);
  // console.log(`[Storage] Deleted attachment ${id}`);
}

/**
 * List all attachment IDs
 * @returns {Promise<Array>} Array of attachment IDs
 */
export async function listAttachments() {
  const db = getDB();
  const records = await db.attachments.toArray();
  return records.map(r => r.id);
}

/**
 * Get total size of all attachments
 * @returns {Promise<number>} Total size in bytes
 */
export async function getTotalAttachmentsSize() {
  const db = getDB();
  const records = await db.attachments.toArray();
  return records.reduce((sum, r) => sum + (r.blob?.size || 0), 0);
}

// ============================================================================
// MIGRATION FROM LOCALSTORAGE
// ============================================================================

/**
 * Migrate data from localStorage to IndexedDB
 * Called automatically on first load if localStorage data exists
 * @returns {Promise<boolean>} True if migration was performed
 */
export async function migrateFromLocalStorage() {
  console.log('[Storage] Checking for localStorage data to migrate...');

  const localData = localStorage.getItem('deepmemo_data');

  if (!localData) {
    console.log('[Storage] No localStorage data found, skipping migration');
    return false;
  }

  try {
    // Parse localStorage data
    const parsed = JSON.parse(localData);
    const nodes = parsed.nodes || {};
    const rootNodes = parsed.rootNodes || [];

    console.log(`[Storage] Found ${Object.keys(nodes).length} nodes in localStorage`);

    // Save nodes to IndexedDB
    await saveNodes(nodes);

    // Save rootNodes as a special setting
    await saveSetting('rootNodes', rootNodes);

    // Migrate other settings
    const viewMode = localStorage.getItem('deepmemo_viewMode');
    if (viewMode) {
      await saveSetting('viewMode', viewMode);
    }

    const fontPreference = localStorage.getItem('deepmemo_fontPreference');
    if (fontPreference) {
      await saveSetting('fontPreference', fontPreference);
    }

    const language = localStorage.getItem('deepmemo_language');
    if (language) {
      await saveSetting('language', language);
    }

    console.log('[Storage] ✅ Migration from localStorage completed successfully');

    // IMPORTANT: Keep localStorage as backup for now (don't delete immediately)
    // Users can manually clear it later, or we can add a cleanup after confirmation
    localStorage.setItem('deepmemo_migrated_to_indexeddb', 'true');

    return true;
  } catch (error) {
    console.error('[Storage] ❌ Migration from localStorage failed:', error);
    throw error;
  }
}

/**
 * Check if migration from localStorage has been completed
 * @returns {boolean} True if already migrated
 */
export function isMigrated() {
  return localStorage.getItem('deepmemo_migrated_to_indexeddb') === 'true';
}

/**
 * Clear localStorage backup after successful migration
 * Only call this after confirming everything works
 */
export function clearLocalStorageBackup() {
  console.log('[Storage] Clearing localStorage backup...');
  localStorage.removeItem('deepmemo_data');
  localStorage.removeItem('deepmemo_viewMode');
  localStorage.removeItem('deepmemo_fontPreference');
  localStorage.removeItem('deepmemo_language');
  console.log('[Storage] ✅ localStorage backup cleared');
}

// ============================================================================
// UTILITY OPERATIONS
// ============================================================================

/**
 * Get database statistics
 * @returns {Promise<Object>} Stats object
 */
export async function getStats() {
  const db = getDB();

  const nodesCount = await db.nodes.count();
  const attachmentsCount = await db.attachments.count();
  const settingsCount = await db.settings.count();

  // Calculate total size (approximate for attachments)
  const attachments = await db.attachments.toArray();
  const totalAttachmentsSize = attachments.reduce((sum, a) => sum + (a.size || 0), 0);

  return {
    nodes: nodesCount,
    attachments: attachmentsCount,
    settings: settingsCount,
    totalAttachmentsSize,
    totalAttachmentsSizeMB: (totalAttachmentsSize / 1024 / 1024).toFixed(2)
  };
}

/**
 * Clear all data (for testing/reset)
 * USE WITH CAUTION!
 */
export async function clearAllData() {
  const db = getDB();
  await db.nodes.clear();
  await db.settings.clear();
  await db.attachments.clear();
  console.log('[Storage] ⚠️ All data cleared from IndexedDB');
}
