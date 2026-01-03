/**
 * DeepMemo - Migration Module
 * Handles seamless migration from localStorage to IndexedDB
 */

import * as Storage from './storage.js';
import { showToast } from '../ui/toast.js';
import { t } from '../utils/i18n.js';

/**
 * Run migration process if needed
 * Called at app startup, before loading data
 * @returns {Promise<Object>} Result object {migrated: boolean, hadData: boolean}
 */
export async function runMigrationIfNeeded() {
  try {
    // Initialize storage first
    await Storage.initStorage();

    // Check if we've already migrated
    if (Storage.isMigrated()) {
      console.log('[Migration] Already migrated to IndexedDB, skipping');
      return { migrated: false, hadData: true };
    }

    // Check if there's localStorage data to migrate
    const localData = localStorage.getItem('deepmemo_data');

    if (!localData) {
      console.log('[Migration] No localStorage data found (first-time user or clean state)');
      return { migrated: false, hadData: false };
    }

    console.log('[Migration] 🚀 Starting migration from localStorage to IndexedDB...');

    // Perform migration
    const migrated = await Storage.migrateFromLocalStorage();

    if (migrated) {
      console.log('[Migration] ✅ Migration completed successfully');

      // Show a subtle toast to inform the user (optional - peut être retiré si trop verbeux)
      // showToast(t('migration.success'), 'success');

      return { migrated: true, hadData: true };
    }

    return { migrated: false, hadData: false };
  } catch (error) {
    console.error('[Migration] ❌ Migration failed:', error);

    // Show error toast
    showToast(t('migration.error') || 'Migration error - please report this issue', 'error');

    // Re-throw to let the app handle it
    throw error;
  }
}

/**
 * Migrate attachments from old IndexedDB structure to new Dexie schema
 * The old structure used a separate database 'deepmemo-files' with store 'attachments'
 * @returns {Promise<boolean>} True if migration was performed
 */
export async function migrateAttachmentsDB() {
  console.log('[Migration] Checking for old attachments database...');

  return new Promise((resolve, reject) => {
    // Try to open the old database (correct name: deepmemo-files)
    const request = indexedDB.open('deepmemo-files', 1);

    request.onerror = () => {
      console.log('[Migration] No old attachments database found');
      resolve(false);
    };

    request.onsuccess = async (event) => {
      const oldDB = event.target.result;

      // Check if the old store exists (correct name: attachments)
      if (!oldDB.objectStoreNames.contains('attachments')) {
        console.log('[Migration] Old database exists but no attachments store found');
        oldDB.close();
        resolve(false);
        return;
      }

      try {
        // Read all attachments from old database using cursor
        // Old structure: key=id (string), value=blob (Blob directly)
        const transaction = oldDB.transaction(['attachments'], 'readonly');
        const store = transaction.objectStore('attachments');

        // First, count how many attachments we have
        const countRequest = store.count();

        countRequest.onsuccess = async () => {
          const count = countRequest.result;

          if (count === 0) {
            console.log('[Migration] No attachments found in old database');
            oldDB.close();
            resolve(false);
            return;
          }

          console.log(`[Migration] Found ${count} attachments in old database`);

          // Use cursor to iterate through attachments (key + value)
          const cursorRequest = store.openCursor();
          const attachments = [];

          cursorRequest.onsuccess = async (event) => {
            const cursor = event.target.result;

            if (cursor) {
              // Collect attachment: key=id, value=blob
              attachments.push({
                id: cursor.key,
                blob: cursor.value
              });
              cursor.continue();
            } else {
              // All attachments collected, now migrate them
              try {
                for (const attachment of attachments) {
                  // Save to new Dexie database
                  // Storage.saveAttachment expects (id, blob)
                  await Storage.saveAttachment(attachment.id, attachment.blob);
                  console.log(`[Migration] Migrated attachment: ${attachment.id} (${attachment.blob.size} bytes)`);
                }

                console.log('[Migration] ✅ Attachments migrated to new database structure');
                oldDB.close();

                // Mark as migrated
                localStorage.setItem('deepmemo_attachments_migrated', 'true');

                resolve(true);
              } catch (error) {
                console.error('[Migration] Error saving attachments:', error);
                oldDB.close();
                reject(error);
              }
            }
          };

          cursorRequest.onerror = () => {
            console.error('[Migration] Failed to read old attachments');
            oldDB.close();
            reject(new Error('Failed to read old attachments'));
          };
        };

        countRequest.onerror = () => {
          console.error('[Migration] Failed to count attachments');
          oldDB.close();
          reject(new Error('Failed to count attachments'));
        };
      } catch (error) {
        console.error('[Migration] Error during attachments migration:', error);
        oldDB.close();
        reject(error);
      }
    };
  });
}

/**
 * Check if attachments have been migrated
 * @returns {boolean} True if already migrated
 */
export function areAttachmentsMigrated() {
  return localStorage.getItem('deepmemo_attachments_migrated') === 'true';
}

/**
 * Complete migration process
 * Migrates both data and attachments
 * @returns {Promise<Object>} Result object with details
 */
export async function completeMigration() {
  const result = {
    dataMigrated: false,
    attachmentsMigrated: false,
    errors: []
  };

  try {
    // Migrate main data
    const dataResult = await runMigrationIfNeeded();
    result.dataMigrated = dataResult.migrated;

    // Migrate attachments if not already done
    if (!areAttachmentsMigrated()) {
      result.attachmentsMigrated = await migrateAttachmentsDB();
    }

    // Show stats
    const stats = await Storage.getStats();
    console.log('[Migration] Database stats:', stats);

    return result;
  } catch (error) {
    result.errors.push(error.message);
    throw error;
  }
}
