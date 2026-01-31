/**
 * DeepMemo - Cross-Tab Synchronization Module
 * Uses BroadcastChannel API to sync data changes across multiple tabs
 *
 * V0.10: Replaces localStorage event listener with BroadcastChannel
 * for IndexedDB-based sync
 */

// BroadcastChannel instance
let channel = null;
const CHANNEL_NAME = 'deepmemo-sync';

/**
 * Initialize the BroadcastChannel
 * Call this once during app initialization
 */
export function initSync() {
  // Check if BroadcastChannel is supported
  if (typeof BroadcastChannel === 'undefined') {
    console.warn('[Sync] BroadcastChannel not supported in this browser');
    return false;
  }

  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    console.log('[Sync] BroadcastChannel initialized');
    return true;
  } catch (error) {
    console.error('[Sync] Failed to create BroadcastChannel:', error);
    return false;
  }
}

/**
 * Notify other tabs that data has changed
 * Call this after saveData() or any data modification
 *
 * @param {Object} payload - Optional payload with change details
 */
export function notifyDataChanged(payload = {}) {
  if (!channel) return;

  try {
    channel.postMessage({
      type: 'data-changed',
      timestamp: Date.now(),
      ...payload
    });
    // console.log('[Sync] Notified other tabs of data change');
  } catch (error) {
    console.error('[Sync] Failed to notify other tabs:', error);
  }
}

/**
 * Setup listener for data changes from other tabs
 * Call this during app initialization
 *
 * @param {Function} callback - Function to call when data changes
 *                               Receives the message payload
 */
export function setupSyncListener(callback) {
  if (!channel) {
    console.warn('[Sync] Cannot setup listener: BroadcastChannel not initialized');
    return;
  }

  channel.onmessage = (event) => {
    if (event.data.type === 'data-changed') {
      console.log('[Sync] Data changed in another tab, reloading...');
      callback(event.data);
    }
  };
}

/**
 * Close the BroadcastChannel
 * Call this when the app is closing (optional, browser handles it)
 */
export function closeSync() {
  if (channel) {
    channel.close();
    channel = null;
    console.log('[Sync] BroadcastChannel closed');
  }
}
