# Architecture - Attachments & Files (V0.8)

**Implementation**: V0.8 (December 25, 2025)
**Status**: ✅ Implemented and deployed

> [Français / French version](./SPEC-ATTACHMENTS.fr.md)

---

## 🎯 Functionality

Attach files (images, PDFs, documents, etc.) to DeepMemo nodes, with:
- Local storage via **IndexedDB** (~500 MB depending on browser)
- Export/Import via systematic **ZIP** format
- Complete UI for upload, inline display, download and deletion

**Note**: This document served as a specification during development. It is now kept as an **architecture reference** to understand technical decisions and implementation.

---

## 📋 Design Decisions

### Implemented Decisions

| # | Decision | Justification | Status |
|---|----------|---------------|--------|
| 1 | **IndexedDB only** | Single source of truth, no localStorage/IndexedDB hybrid | ✅ Implemented |
| 2 | **Always export as ZIP** | Consistency, even without files (just data.json in the ZIP) | ✅ Implemented |
| 3 | **Inline via explicit syntax** | `![](attachment:id)` to control display | ✅ Implemented |
| 4 | **No deduplication** | Each attachment is independent, simplifies deletion | ✅ Implemented |
| 5 | **50MB limit per file** | Hard limit to avoid saturation | ✅ Implemented |
| 6 | **Manual deletion** | Delete button in the node's file list | ✅ Implemented |
| 7 | **Manual garbage collection** | Button in right panel "Clean orphaned files" | ✅ Implemented |
| 8 | **No preview** | Fullsize inline display only (V1) | ✅ Decision confirmed |
| 9 | **Upload via button** | Drag & drop postponed to V2 | ✅ Decision confirmed |
| 10 | **Clipboard paste** | Postponed to V2 | ✅ Decision confirmed |

### Postponed Features (V2)

- **Drag & drop**: Upload by dragging and dropping on the node
- **Clipboard paste**: Paste images from clipboard
- **Thumbnails**: Thumbnail previews in the list
- **Compression**: Automatic compression of large files
- **Versioning**: File modification history

---

## 🏗️ Technical Architecture

### Data Structure

#### localStorage (`deepmemo_data`)

```javascript
data = {
  nodes: {
    "node_123": {
      id: "node_123",
      type: "note",
      title: "My note with files",
      content: "Here is my diagram:\n\n![](attachment:attach_001)\n\nAnd my document:\n[See the PDF](attachment:attach_002)",
      attachments: [
        {
          id: "attach_001",           // Unique ID (format: attach_${timestamp}_${random})
          name: "diagram.png",         // Original filename
          type: "image/png",           // MIME type
          size: 45678,                 // Size in bytes
          created: 1703520000000,      // Creation timestamp
          modified: 1703520000000      // Last modification timestamp (for future edit support)
        },
        {
          id: "attach_002",
          name: "document.pdf",
          type: "application/pdf",
          size: 234567,
          created: 1703520100000,
          modified: 1703520100000
        }
      ],
      // ... other standard properties
    }
  }
}
```

#### IndexedDB (`deepmemo-files`)

**Database name**: `deepmemo-files`
**Version**: `1`
**Object Store**: `attachments`
**Key**: `id` (string, e.g., "attach_001")
**Value**: `Blob` (the binary file)

```javascript
// IndexedDB structure
{
  "attach_001": Blob { size: 45678, type: "image/png" },
  "attach_002": Blob { size: 234567, type: "application/pdf" }
}
```

---

## 🔌 attachments.js Module API

### Module: `src/js/core/attachments.js`

```javascript
/**
 * Initialize IndexedDB connection
 * @returns {Promise<IDBDatabase>}
 */
async function initDB()

/**
 * Save a file to IndexedDB
 * @param {string} id - Unique attachment ID
 * @param {Blob} blob - The file to save
 * @returns {Promise<void>}
 */
async function saveAttachment(id, blob)

/**
 * Retrieve a file from IndexedDB
 * @param {string} id - Attachment ID
 * @returns {Promise<Blob|null>} - The blob or null if not found
 */
async function getAttachment(id)

/**
 * Delete a file from IndexedDB
 * @param {string} id - Attachment ID
 * @returns {Promise<void>}
 */
async function deleteAttachment(id)

/**
 * List all IDs stored in IndexedDB
 * @returns {Promise<string[]>} - Array of IDs
 */
async function listAttachments()

/**
 * Get total size used
 * @returns {Promise<number>} - Size in bytes
 */
async function getTotalSize()

/**
 * Generate a unique ID for an attachment
 * @returns {string} - Format: attach_${timestamp}_${random}
 */
function generateAttachmentId()

/**
 * Clean orphaned files (present in IndexedDB but not in data)
 * @param {Object} data - The complete data object
 * @returns {Promise<{deleted: number, freed: number}>} - Cleanup stats
 */
async function cleanOrphans(data)
```

### Function Exports

```javascript
export {
  initDB,
  saveAttachment,
  getAttachment,
  deleteAttachment,
  listAttachments,
  getTotalSize,
  generateAttachmentId,
  cleanOrphans
};
```

---

## 📦 Export/Import Format

### ZIP Structure

```
deepmemo-export-2025-12-25.zip
├── data.json                    # Complete structure (nodes, rootNodes, + attachment metadata)
├── attachments/
│   ├── attach_001_diagram.png   # Format: {id}_{name}
│   ├── attach_002_document.pdf
│   └── attach_003_video.mp4
└── metadata.json                # (Optional) Export metadata
```

### metadata.json (optional)

```json
{
  "version": "0.9.0",
  "exportType": "global",
  "exportDate": 1703520000000,
  "nodeCount": 42,
  "attachmentCount": 15,
  "totalSize": 12345678
}
```

### Global Export

**Function**: `exportGlobalWithFiles()`

**Workflow**:
1. Collect all nodes
2. Extract all referenced attachments
3. Create a ZIP with JSZip
4. Add `data.json`
5. For each attachment:
   - Retrieve the blob from IndexedDB
   - Add to ZIP in `attachments/{id}_{name}`
6. Generate and download the ZIP

**Filename**: `deepmemo-export-{timestamp}.zip`

### Branch Export

**Function**: `exportBranchWithFiles(nodeId)`

**Workflow**:
1. Collect the node + descendants (existing `collectBranchNodes` function)
2. Extract only attachments from this branch
3. Same logic as global export, but limited scope

**Filename**: `deepmemo-branch-{title}-{timestamp}.zip`

### ZIP Import

**Function**: `importZip(file, parentId = null)`

**Workflow**:
1. Detect if it's a ZIP (`.zip` extension)
2. Load with JSZip
3. Extract `data.json`
4. Parse data
5. For each referenced attachment:
   - Search for the file in `attachments/{id}_{name}`
   - If found: save to IndexedDB
   - If missing: log warning + mark as "missing"?
6. Merge data according to mode (global = overwrite, branch = merge)

**ID Management**:
- **Global export**: IDs preserved if importing on empty instance
- **Branch export**: IDs regenerated (as currently) + attachment ID remapping

### Legacy JSON Import (backward compatibility)

If the user imports an old JSON (without files), it should continue to work.

**Workflow**:
1. Detect `.json` extension
2. Parse directly
3. Merge as before
4. Ignore attachments (empty or absent array)

---

## 🎨 User Interface

### 1. File Upload

**Location**: Central panel, below node content (in Edit mode)

**UI**:
```
┌─────────────────────────────────────────────┐
│ [Node title]                                │
│                                             │
│ [Markdown content...]                       │
│                                             │
├─────────────────────────────────────────────┤
│ 📎 Attached files (2)                       │
│                                             │
│  📄 diagram.png (44.6 KB)        [⬇️] [🗑️]  │
│  📄 document.pdf (229.1 KB)      [⬇️] [🗑️]  │
│                                             │
│  [📎 Add a file]                            │
└─────────────────────────────────────────────┘
```

**Behavior**:
- Click on "Add a file" → Native file input
- Icon adapted to MIME type:
  - `image/*` → 🖼️
  - `application/pdf` → 📄
  - `video/*` → 🎬
  - `audio/*` → 🎵
  - Others → 📎
- Size display (formatted: KB, MB)
- Button ⬇️: Download the file
- Button 🗑️: Delete (with confirmation)

**Validation**:
- Check size < 50MB
- If exceeded: Error toast "File too large (max 50MB)"

### 2. Inline Image Display

**Markdown syntax**: `![Description](attachment:attach_001)`

**Rendering**:
- Parse markdown
- Detect `attachment:ID` URLs
- Retrieve blob from IndexedDB
- Create a temporary `blob:` URL
- Inject `<img src="blob:..." alt="Description">`

**Cache Management**:
- Revoke blob URLs when changing nodes (to avoid memory leaks)
- `URL.revokeObjectURL(blobUrl)`

### 3. File Links

**Markdown syntax**: `[See the document](attachment:attach_002)`

**Rendering**:
- Clickable link that downloads the file
- Or opens in a new tab (depending on type)

### 4. Storage Indicator (Settings)

**Location**: Right panel, "Storage" section (new)

**UI**:
```
📊 Storage

Files: 12.3 MB / ~500 MB
[████████░░░░░░░░░░░░] 2%

15 attached files

[🧹 Clean orphaned files]
```

**Behavior**:
- Display total size used (via `getTotalSize()`)
- Limit estimation (depends on browser, display "~500 MB" by default)
- Cleanup button: executes `cleanOrphans(data)` and displays a toast with the result

---

## 🔧 Modifications to Existing Modules

### `src/js/core/data.js`

**Additions**:
- Import `attachments.js` module
- Modify `exportData()` → rename to `exportDataJSON()` (legacy)
- Add `exportDataZIP()` (new main function)
- Modify `exportBranch()` → rename to `exportBranchJSON()` (legacy)
- Add `exportBranchZIP()` (new main function)
- Modify `importData()` to detect ZIP vs JSON
- Modify `importBranch()` to detect ZIP vs JSON
- Add `deleteNodeAttachments(nodeId)`: deletes a node's files when deleted

### `src/js/features/editor.js`

**Additions**:
- "Attached files" section below content
- Function `renderAttachments(node)`: displays file list
- Function `handleFileUpload(event)`: handles upload
- Function `handleFileDelete(attachId)`: handles deletion
- Function `handleFileDownload(attachId, name)`: downloads a file
- Modify `renderMarkdown()` to parse and display `attachment:` URLs

### `src/js/app.js`

**Additions**:
- Initialize IndexedDB on startup: `await initDB()`
- Handle errors if IndexedDB is not available (Safari private mode, etc.)

### `index.html`

**Additions**:
- Hidden file input: `<input type="file" id="attachmentInput" style="display:none">`
- "Add file" button in attachments section

### `src/css/components.css`

**Additions**:
- Styles for `.attachments-section`
- Styles for `.attachment-item`
- Styles for download/delete buttons

---

## 📚 External Dependencies

### JSZip

**Version**: `3.10.1` (or latest stable)
**Size**: ~100 KB (minified)
**License**: MIT
**CDN**: `https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js`

**Integration**:
```html
<!-- In index.html -->
<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>
```

**Alternative**: Download the file and serve it locally in `src/vendor/jszip.min.js`

---

## 🧪 Test Plan

### Manual Tests

**Scenario 1: Basic Upload**
1. Open a node in Edit mode
2. Click "Add file"
3. Select an image < 50MB
4. Verify that the file appears in the list
5. Verify that the size is correct
6. Refresh the page → the file is still there

**Scenario 2: Inline Display**
1. Add an image to a node
2. Note the ID (e.g., `attach_001`)
3. Add to content: `![My diagram](attachment:attach_001)`
4. Switch to View mode
5. Verify that the image displays

**Scenario 3: Deletion**
1. Add a file
2. Click the 🗑️ button
3. Confirm deletion
4. Verify that the file disappears from the list
5. Verify it's deleted from IndexedDB (DevTools → Application → IndexedDB)

**Scenario 4: Global Export/Import**
1. Create 2-3 nodes with files
2. Global export → ZIP downloaded
3. Clear localStorage + IndexedDB
4. Import the ZIP
5. Verify everything is restored (nodes + files)

**Scenario 5: Branch Export/Import**
1. Create a branch with files
2. Branch export → ZIP downloaded
3. Import on another parent node
4. Verify files are duplicated (new IDs)

**Scenario 6: Size Limit**
1. Attempt to upload a file > 50MB
2. Verify error toast
3. Verify the file is not added

**Scenario 7: Garbage Collection**
1. Create a node with file
2. Delete the node (but not via the file delete button)
3. Execute cleanup
4. Verify the orphaned file is deleted from IndexedDB

### Browser Tests

- [ ] Chrome/Edge (Windows, Linux)
- [ ] Firefox (Windows, Linux)
- [ ] Safari (macOS, iOS if possible)
- [ ] Mobile browsers (Chrome Android, Safari iOS)

---

## ✅ Completed Implementation

### All Phases Completed (December 25, 2025)

**Phase 1-7**: All implemented and tested

- [x] **IndexedDB Module**: `src/js/core/attachments.js` complete (~300 lines)
- [x] **Upload UI**: Attachments section in `editor.js` with size validation
- [x] **ZIP Export**: Global and branch via JSZip
- [x] **ZIP Import**: Auto-detection ZIP vs JSON, ID regeneration
- [x] **Inline Display**: Parse `attachment:` + blob URLs + memory cleanup
- [x] **Polish**: Storage indicator, garbage collection, MIME icons
- [x] **Documentation**: README, ARCHITECTURE, ROADMAP, CLAUDE.md updated
- [x] **Demo Content**: "📎 Attached files" section in default-data.js

**Commits**: Implemented in a single session on December 25, 2025

**Modified Files**:
- `src/js/core/attachments.js` (new)
- `src/js/core/data.js` (ZIP export/import)
- `src/js/features/editor.js` (attachments UI + inline display)
- `src/js/app.js` (upload, download, delete, cleanup)
- `index.html` (attachments section + JSZip CDN)
- `src/css/components.css` (complete styles)
- `docs/` (documentation updated)

**Tests**: Test page `test-attachments.html` (all validated ✅, deleted after validation)

---

## ⚠️ Risks and Limitations

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **IndexedDB unavailable** (Safari private mode) | High | Detect on startup, display warning, disable attachments |
| **Quota exceeded** | Medium | Check before upload, display used size, 50MB/file limit |
| **IndexedDB corruption** | Medium | Detection mechanism + reset, clear error toast |
| **Blob URLs not revoked** (memory leak) | Low | Systematic cleanup on node change |
| **ZIP too large** (>500MB) | Low | Warning if export > 100MB, streaming if possible |

### Known Limitations

- **No versioning**: A modified file overwrites the old one (no history)
- **No editing**: Files are read-only (no inline editing)
- **No compression**: Files are stored as-is (no IndexedDB compression)
- **No preview**: No generated thumbnails (fullsize display only)
- **No drag & drop**: Upload via button only (V1)
- **No clipboard paste**: No pasting images from clipboard (V1)

---

## 🔄 Migration and Backward Compatibility

### Migration V0.8 → V0.9

**No migration needed**:
- Existing data continues to work
- Nodes simply have no attached files
- No breaking changes in `data` structure

### Backward Compatibility

**Simple JSON Import**:
- V0.8 exports (simple JSON) remain importable
- Automatic detection of attachment absence

**Backward-compatible Export**:
- We could add an "Export as JSON (without files)" button for legacy
- But not mandatory: the ZIP with just `data.json` is equivalent

---

## 📝 Development Notes

### Naming Convention

**Attachment IDs**: `attach_{timestamp}_{random4digits}`
- Example: `attach_1703520000000_7382`
- Guarantees uniqueness and traceability

**Files in ZIP**: `{id}_{originalName}`
- Example: `attach_1703520000000_7382_diagram.png`
- Allows easy file retrieval + keeps readable name

### Error Handling

**Always wrap IndexedDB calls**:
```javascript
try {
  await saveAttachment(id, blob);
} catch (error) {
  console.error('[Attachments] Failed to save:', error);
  showToast('Error: unable to save file', 'error');
  // Rollback if necessary
}
```

**Error types to handle**:
- `QuotaExceededError`: Quota exceeded
- `NotFoundError`: File not found
- `InvalidStateError`: IndexedDB closed or corrupted
- Network errors (for JSZip if CDN)

### Performance

**Possible Optimizations**:
- Cache blob URLs in memory (avoid regenerating on each render)
- Lazy loading of files (load only if displayed)
- ZIP streaming (for large exports)

**To Monitor**:
- ZIP parsing time on import
- Memory used when displaying many images

---

## 🎓 References

### IndexedDB Documentation

- [MDN - IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN - Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)

### JSZip Documentation

- [JSZip Documentation](https://stuk.github.io/jszip/)
- [JSZip API](https://stuk.github.io/jszip/documentation/api_jszip.html)

### Storage Limits

- [Chrome Storage Quota](https://web.dev/storage-for-the-web/)
- [Firefox Storage Limits](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

---

## ✅ Completion Checklist

**Feature 100% complete**:

- [x] All manual tests pass
- [x] Tested on Chrome, Edge (Firefox and Safari recommended before public deployment)
- [x] Documentation updated (README, ARCHITECTURE, ROADMAP, CLAUDE.md)
- [x] No console errors in production
- [x] Garbage collection works (manual button + stats)
- [x] Export/Import round-trip OK (global + branch)
- [x] 50MB limit enforced (upload validation)
- [x] UI functional and consistent with the rest of the app
- [x] Code commented and structured (ES6 modules)
- [x] Demo content integrated

---

**Last updated**: 2025-12-27 (status)
**Complete implementation**: 2025-12-25
**Status**: ✅ Deployed in V0.8
