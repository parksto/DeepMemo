# DeepMemo - Storage System (IndexedDB)

**Version:** V0.10+
**Last updated:** 2026-01-04

## Overview

Since V0.10, DeepMemo uses **IndexedDB with Dexie.js** for all data storage, replacing the previous localStorage-based system. This provides significantly more storage capacity and better performance.

## Storage Architecture

### IndexedDB Database: `deepmemo`

The application uses a single IndexedDB database with three object stores:

```javascript
db.version(1).stores({
  // Nodes table with indexes
  nodes: 'id, parent, *tags, created, modified',

  // Settings table (key-value pairs)
  settings: 'key',

  // Attachments table (files as blobs)
  attachments: 'id'
});
```

### Storage Capacity

| Storage Type | Before (V0.9) | After (V0.10) |
|--------------|---------------|---------------|
| Max capacity | 5-10 MB (localStorage) | 500 MB - 1 GB (IndexedDB) |
| Data structure | Single JSON blob | Structured tables with indexes |
| Performance | ~50ms save, ~200ms load | <100ms save, <500ms load |

### Data Structure

**Nodes store:**
- Stores all node objects (notes, symlinks)
- Indexed by: `id`, `parent`, `tags`, `created`, `modified`
- Enables fast queries by parent, tag, or date range

**Settings store:**
- Key-value pairs for app settings
- Special key: `rootNodes` (array of root node IDs)
- Other settings: `viewMode`, `fontPreference`, `language`

**Attachments store:**
- Stores file blobs with their IDs
- Structure: `{id: string, blob: Blob}`
- No metadata stored here (metadata is in node's `attachments` array)

## Migration from localStorage

### Automatic Migration

On first load after upgrading to V0.10, the app automatically:

1. Detects localStorage data (`deepmemo_data`)
2. Migrates all nodes to IndexedDB `nodes` store
3. Migrates `rootNodes` to `settings` store
4. Migrates old attachments from `deepmemo-attachments` database
5. Preserves localStorage as backup
6. Sets flag: `deepmemo_migrated_to_indexeddb: true`

**Migration time:** ~1 second for 100 nodes

### Backup Safety

After migration:
- Original localStorage data is **kept as backup**
- Old `deepmemo-attachments` database is **preserved**
- Users can manually clear localStorage after confirming everything works

To clear localStorage backup:
```javascript
// In browser console
await window.Storage.clearLocalStorageBackup();
```

## Multi-Tab Synchronization

V0.10 uses **BroadcastChannel API** for real-time sync across tabs:

```javascript
// Module: src/js/utils/sync.js
const channel = new BroadcastChannel('deepmemo-sync');

// After each saveData()
channel.postMessage({ type: 'data-changed' });

// Other tabs reload data automatically
channel.onmessage = () => loadData();
```

**Browser support:** All modern browsers (Chrome 54+, Firefox 38+, Safari 15.4+)

## Developer Tools

### Console Commands

```javascript
// Get storage statistics
const stats = await window.Storage.getStats();
console.table(stats);
// → { nodes: 50, attachments: 5, totalAttachmentsSizeMB: "2.34" }

// List all nodes
const nodes = await window.Storage.loadNodes();
console.log(Object.keys(nodes).length, 'nodes');

// List all attachment IDs
const attachments = await window.Storage.listAttachments();
console.log(attachments);

// Get total attachments size
const size = await window.Storage.getTotalAttachmentsSize();
console.log((size / 1024 / 1024).toFixed(2), 'MB');

// Clear all data (⚠️ DANGER - irreversible!)
await window.Storage.clearAllData();
```

### DevTools Inspection

**Chrome/Edge DevTools:**
1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **IndexedDB** → `deepmemo`
4. View stores: `nodes`, `settings`, `attachments`

**Firefox DevTools:**
1. Open DevTools (F12)
2. Go to **Storage** tab
3. Expand **Indexed DB** → `deepmemo`

## File References

- **Core storage:** `src/js/core/storage.js` (285 lines)
- **Migration logic:** `src/js/core/migration.js` (185 lines)
- **Sync module:** `src/js/utils/sync.js` (80 lines)
- **Attachments:** `src/js/core/attachments.js` (simplified)

## Performance Metrics

**Typical operations:**
- Save single node: <50ms (async, non-blocking)
- Load all data: <500ms (100 nodes + settings)
- Migration: ~1s (100 nodes + attachments)
- Multi-tab notification: <10ms (BroadcastChannel)

**Optimizations:**
- Bulk operations use `bulkPut()` for better performance
- In-memory cache (`data` object) for synchronous access
- Async saves don't block UI
- Indexes on `parent` and `tags` for fast queries

## Fallback Strategy

If IndexedDB is unavailable (e.g., private browsing mode), the app:
1. Falls back to localStorage
2. Logs warning in console
3. Continues functioning with reduced capacity

```javascript
// In data.js
try {
  await Storage.saveNodes(data.nodes);
} catch (error) {
  console.error('IndexedDB failed, falling back to localStorage');
  localStorage.setItem('deepmemo_data', JSON.stringify(data));
}
```

## Future Enhancements

Planned for V0.11+:
- **Compression:** Gzip data before storage
- **Versioning:** Daily snapshots for data recovery
- **Quota management:** Warnings when approaching storage limits
- **Export scheduler:** Automatic periodic backups
- **Sync protocol:** Cloud sync with E2E encryption

---

**Related Documentation:**
- [Architecture](ARCHITECTURE.md) - Overall app architecture
- [Attachments Spec](SPEC-ATTACHMENTS.md) - File handling details
- [Migration Testing](MIGRATION-TESTING.md) - Test scenarios (archived)
