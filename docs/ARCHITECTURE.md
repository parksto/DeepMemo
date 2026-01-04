# 🏗️ DeepMemo - Technical Architecture V0.9

**Last updated**: December 28, 2025
**Version**: 0.9 (ES6 modular architecture + PWA + Attachments + i18n)

> 📖 **[Version française disponible](./ARCHITECTURE.fr.md)** | **English version**

---

## 📐 Overview

DeepMemo is a **single-page application** (SPA) built with vanilla JavaScript ES6, HTML5, and CSS3, using LocalStorage for data persistence.

**V0.9 Architecture**: Modular ES6 + Internationalization
- `index.html`: HTML structure (~190 lines)
- `src/css/`: Modular styles (~1500 lines across 5 files)
- `src/js/`: **13 ES6 modules** organized (~3000 lines)
  - `app.js`: Main entry point (~830 lines)
  - `core/`: Data management
  - `features/`: Business features
  - `ui/`: User interface
  - `utils/`: Utilities

---

## 📂 File Structure

### JavaScript (ES6 Modules)

```
src/js/
├── app.js                      # Entry point (~830 lines)
│
├── core/
│   ├── data.js                 # Data + IndexedDB + export/import
│   ├── storage.js              # IndexedDB layer (Dexie.js) - V0.10
│   ├── migration.js            # localStorage → IndexedDB migration - V0.10
│   ├── attachments.js          # File attachments (IndexedDB)
│   └── default-data.js         # Default demo content
│
├── features/
│   ├── tree.js                 # Tree view + branch mode
│   ├── editor.js               # Editor + breadcrumb + attachments UI
│   ├── search.js               # Global search
│   ├── tags.js                 # Tags + autocomplete
│   ├── modals.js               # Modals (Move/Link/Duplicate)
│   └── drag-drop.js            # Complete drag & drop
│
├── ui/
│   ├── toast.js                # Toast notifications
│   ├── panels.js               # Side panels
│   └── mobile-tabs.js          # Mobile tab navigation
│
├── utils/
│   ├── routing.js              # URL navigation
│   ├── keyboard.js             # Keyboard shortcuts
│   ├── helpers.js              # Utility functions
│   ├── i18n.js                 # Internationalization system
│   └── sync.js                 # Multi-tab sync (BroadcastChannel) - V0.10
│
└── locales/
    ├── fr.js                   # French dictionary
    └── en.js                   # English dictionary
```

### CSS (Modular)

```
src/css/
├── style.css                   # Global import (~10 lines)
├── base.css                    # Reset + CSS variables (~150 lines)
├── layout.css                  # Responsive structure (~250 lines)
├── components.css              # UI components (~800 lines)
├── mobile.css                  # Mobile-specific styles (~400 lines)
└── utilities.css               # Utility classes (~50 lines)
```

---

## 🎯 Design Principles

### 1. ES6 Modularity
- **Named imports/exports** for each module
- **Local state** within each module (not exported)
- **Communication** via callbacks and exported functions
- **No global state manager** (deliberately simple)

### 2. Minimalism
- **Single base type**: the Node
- Structure emerges from usage
- No imposed constraints

### 3. Recursion
- Any node can contain other nodes
- Infinite depth
- No distinction between "container" and "content"

### 4. Flexibility
- Symlinks for multiple appearances
- Free tags without hierarchy
- Branch mode for isolation

---

## 📊 Data Structure

### The Node Type

```javascript
{
  id: String,              // "node_timestamp_random"
  type: String,            // "note" or "symlink"
  title: String,           // Node title
  content: String,         // Markdown content
  children: Array<String>, // Direct children IDs
  parent: String | null,   // Parent ID (null = root)
  created: Number,         // Creation timestamp
  modified: Number,        // Modification timestamp
  tags: Array<String>,     // Node tags

  // For symlinks only:
  targetId: String         // Target node ID (if type === "symlink")
}
```

### Global Structure

```javascript
{
  nodes: {
    [nodeId]: Node,
    // ...
  },
  rootNodes: Array<String> // Root node IDs
}
```

### Symlink Example

```javascript
// Original node
{
  id: "node_1702234567894_mno345",
  type: "note",
  title: "👤 Alice",
  content: "Contact: alice@example.com",
  children: [],
  parent: "node_contacts",
  tags: ["contact", "team"]
}

// Symlink with custom title
{
  id: "symlink_1702234567895_pqr678",
  type: "symlink",
  title: "👤 Alice (Lead Dev)",        // Independent title
  targetId: "node_1702234567894_mno345",
  parent: "node_projet_x",
  children: [],                         // Always empty
  tags: []                              // Independent tags
}
```

**Important**: Renaming a symlink does NOT rename the target node. Only content is shared.

---

## 🔄 Key Modules

### app.js (Entry Point)

**Responsibilities**:
- Application initialization
- Module coordination
- Global state management (currentNodeId, viewMode)
- Global functions exposed via `window.app`

**Exports**:
```javascript
export class DeepMemoApp {
  init()
  selectNode(nodeId, instanceKey)
  selectNodeById(nodeId)
  createRootNode()
  createChildNode()
  // ... public functions
}
```

### core/data.js

**Responsibilities**:
- Data structure management
- localStorage save/load
- JSON export/import
- CRUD operations on nodes

**Exports**:
```javascript
export let data = { nodes: {}, rootNodes: [] };
export function saveData()
export function loadData()
export function exportData()
export function importData(event, onSuccess)
export function exportBranch(nodeId)
export function importBranch(event, parentId, onSuccess)
export function findNodeByTitle(title)
export function isDescendantOf(nodeId, ancestorId)
export function wouldCreateCycle(targetId, parentId)
export function wouldCreateCycleWithMove(nodeId, newParentId)
```

### core/attachments.js

**Responsibilities**:
- File attachments management
- IndexedDB storage (~500 MB limit)
- ZIP export/import with files
- Orphaned files garbage collection

**Exports**:
```javascript
export async function initDB()
export async function saveAttachment(id, blob)
export async function getAttachment(id)
export async function deleteAttachment(id)
export async function listAttachments()
export async function getTotalSize()
export function generateAttachmentId()
export async function cleanOrphans(data)
export function isIndexedDBAvailable()
export function formatFileSize(bytes)
```

**Storage**:
- Database: `deepmemo-attachments`
- Store: `files` (keyPath: `id`)
- ID format: `attach_{timestamp}_{random}`
- Limit: 50 MB per file

**Export/Import**:
- Systematic ZIP format: `data.json` + `attachments/`
- Backward compatibility with simple JSON (auto-detection)
- ID regeneration on branch import

### core/default-data.js

**Responsibilities**:
- Provide initial demonstration content
- Interactive documentation for new users
- Bilingual support (FR/EN) based on detected language

**Exports**:
```javascript
export function getDefaultData()         // Dispatcher
export function getDefaultDataFR()       // French content
export function getDefaultDataEN()       // English content
```

**Structure**:
- 26 pedagogical nodes hierarchically organized
- Progressive tutorial: Interface → Features → Future vision
- Concrete examples for each feature
- Format: [Feature → Utility → Practical example]

### features/tree.js

**Responsibilities**:
- Tree rendering
- Keyboard navigation in tree
- Isolated branch mode
- Expand/collapse management
- Auto-collapse on activation

**State variables (not exported)**:
```javascript
let branchMode = false;
let branchRootId = null;
let expandedNodes = new Set();       // Expanded instance keys
let currentInstanceKey = null;       // Currently displayed node
let focusedInstanceKey = null;       // Currently focused node (keyboard)
```

**Key exports**:
```javascript
export function renderTree()
export function setCurrentInstanceKey(key)
export function enableBranchMode(nodeId)
export function disableBranchMode()
export function isBranchMode()
export function getBranchRootId()
export function updateTreeFocus()
export function updateFocusAfterRender(nodeId)
```

**Instance Keys**:

A node can appear multiple times via symlinks. The instance key encodes the full path:

```javascript
function getInstanceKey(nodeId, parentContext) {
  return parentContext === null
    ? `${nodeId}@root`
    : `${nodeId}@${parentContext}`;
}

// Examples:
// - Root node: "node123@root"
// - Child: "node456@node123@root"
// - Via symlink: "node789@node456@node123@root"
```

**Two Distinct Action Types**:

1. **Manual fold/unfold** (triangle, arrows):
   - Modifies `expandedNodes` directly
   - State preserved
   - Does NOT change active node

2. **Activation** (click title, Enter):
   - Calls `setCurrentInstanceKey()`
   - **Auto-collapse**: empties `expandedNodes` and rebuilds path
   - Changes active node

### features/editor.js

**Responsibilities**:
- Node content display
- Smart breadcrumb (stops at branchRootId)
- Children list with clickable cards
- Title/content save
- View/edit mode toggle

**Key exports**:
```javascript
export function displayNode(nodeId, onComplete)
export function saveNode(nodeId)
export function updateBreadcrumb(nodeId)
export function updateRightPanel(nodeId)
export function updateViewMode(mode)
```

**Symlink save**:
```javascript
export function saveNode(nodeId) {
  const node = data.nodes[nodeId];

  if (node.type === 'symlink') {
    const targetNode = data.nodes[node.targetId];
    // Title saved on symlink
    node.title = document.getElementById('nodeTitle').value;
    node.modified = Date.now();
    // Content saved on target
    targetNode.content = document.getElementById('nodeContent').value;
    targetNode.modified = Date.now();
  } else {
    // Normal node: everything saved on node
    node.title = document.getElementById('nodeTitle').value;
    node.content = document.getElementById('nodeContent').value;
    node.modified = Date.now();
  }

  saveData();
}
```

### features/drag-drop.js

**Responsibilities**:
- Drag & drop on tree and child cards
- Visual indicators (before/after/inside)
- Actions based on keyboard modifiers
- Cycle prevention

**Public API**:
```javascript
export function initDragDrop(element, nodeId, onDropComplete)
```

**Keyboard modifiers**:
- **Default**: Move
- **Ctrl**: Duplicate
- **Ctrl+Alt**: Symlink

**Drop zones**:
- **before/after** (33% top/bottom): Insert sibling
- **inside** (33% middle): Change parent

**Cycle prevention**:
```javascript
function isDescendantOf(targetId, nodeId) {
  if (!targetId || targetId === nodeId) return false;
  const target = data.nodes[targetId];
  if (!target) return false;
  if (target.parent === nodeId) return true;
  return isDescendantOf(target.parent, nodeId);
}
```

### features/tags.js

**Responsibilities**:
- Tag management
- Smart autocomplete (branch + global)
- Tag cloud with counters
- Search by tag

**Key exports**:
```javascript
export function updateTagsDisplay(nodeId)
export function setupTagAutocomplete()
export function updateTagCloud()
export function searchByTag(tag)
```

**Autocomplete**:
- Current branch tags (priority)
- Global tags (secondary)
- Sorted by frequency

### features/search.js

**Responsibilities**:
- Global search (titles, content, tags)
- Search modal with keyboard navigation
- Result highlights

**Key exports**:
```javascript
export function openSearch()
export function closeSearch()
export function performSearch(query)
```

### utils/routing.js

**Responsibilities**:
- URL parsing (hash + query params)
- URL updates
- popstate/hashchange handling

**URL format**:
```
?branch=nodeId#/node/nodeId
```

**Key exports**:
```javascript
export function parseHash()
export function updateHash(nodeId, branchRootId)
export function setupHashListener(callback)
```

### utils/keyboard.js

**Responsibilities**:
- Global keyboard shortcuts management

**Shortcuts**:
- `Alt+N`: New node
- `Alt+E`: Switch to edit mode (with focus)
- `Ctrl+K`: Search
- `Escape`: Go to parent

### utils/i18n.js (V0.9)

**Responsibilities**:
- Internationalization system (0 dependencies)
- Dynamic dictionary loading
- DOM translation
- Language detection and persistence

**Key exports**:
```javascript
export async function initI18n()
export function t(key, params)
export async function setLanguage(lang)
export function getCurrentLanguage()
export function translateDOM()
```

**Features**:
- Custom interpolation: `{count}` variables and `{{count > 1 ? 's' : ''}}` expressions
- Auto language detection: `localStorage` → `navigator.language` → fallback
- DOM auto-translation via `data-i18n*` attributes
- Dynamic dictionary loading via `import()`

**Supported languages**:
- French (fr)
- English (en)

---

## 🎨 Isolated Branch Mode

### Concept

Branch mode allows displaying only a sub-tree, isolating a specific branch.

### Differences from Normal Mode

**The ONLY differences**:

1. **Displayed nodes**:
   - Normal mode: Whole tree (`data.rootNodes`)
   - Branch mode: Sub-tree (`[branchRootId]`)

2. **External symlinks**:
   - Normal mode: All functional
   - Branch mode: Symlinks outside branch disabled
     - Icon `🔗🚫`, greyed text (opacity 0.4)
     - Non-clickable, warning toast
     - No toggle triangle

3. **Instance keys**:
   - Normal mode: Full path from global root
   - Branch mode: Path stops at `branchRootId`

**Identical navigation**: Fold/unfold, auto-collapse, keyboard work the same way.

### Activation

```javascript
// URL with ?branch=nodeId
?branch=node_123#/node/node_456

// Or programmatic
enableBranchMode(nodeId);
```

### Share Buttons

- **🔗 (Share Node)**: Preserves current context
  - In normal mode → `#/node/X`
  - In branch mode → `?branch=root#/node/X`

- **🌳 (Share Branch)**: Always creates isolated branch
  - Always → `?branch=X#/node/X`

---

## 💾 Persistence

### IndexedDB (V0.10+)

Since V0.10, DeepMemo uses **IndexedDB with Dexie.js** for all data storage, replacing the previous localStorage-based system.

**Database:** `deepmemo` with three object stores:

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

**Storage Capacity:**
- Before (V0.9): 5-10 MB (localStorage)
- After (V0.10): 500 MB - 1 GB (IndexedDB)

**Key Features:**
- Automatic migration from localStorage on first load
- Structured tables with indexes for fast queries
- localStorage preserved as backup after migration
- Migration flag: `deepmemo_migrated_to_indexeddb`

**Settings stored:**
- `rootNodes`: Array of root node IDs
- `viewMode`: 'view' or 'edit'
- `language`: 'fr' or 'en'
- `fontPreference`: 'sto' or 'system'

**Note**: `expandedNodes` is NOT saved (dynamically recalculated via auto-collapse).

**Multi-Tab Synchronization (V0.10):**

Uses BroadcastChannel API for real-time sync across tabs:

```javascript
const channel = new BroadcastChannel('deepmemo-sync');

// After each saveData()
channel.postMessage({ type: 'data-changed' });

// Other tabs reload data automatically
channel.onmessage = async () => {
  await loadData();
  render();
};
```

**See also:** `docs/STORAGE.md` for complete documentation.

### Export/Import JSON

**Global export/import**:
- Sidebar buttons to export/import entire database
- Format: `{nodes: {...}, rootNodes: [...]}`
- Global import **overwrites** all existing data

**Branch export/import (V0.8)**:
- Buttons in current node actions (bottom right)
- **Export**: Exports a node + all descendants recursively
- **Import**: Imports as children of current node (non-destructive)
- **ID regeneration**: Avoids conflicts with existing nodes
- Special format: `{type: 'deepmemo-branch', branchRootId: '...', nodes: {...}}`

```javascript
// Branch export format
{
  type: 'deepmemo-branch',
  version: '1.0',
  branchRootId: 'node_xxx',  // Exported root node ID
  exported: 1234567890,       // Timestamp
  nodeCount: 42,              // Node count
  nodes: {                    // Branch nodes
    'node_xxx': {...},
    'node_yyy': {...}
  }
}
```

**Branch import process**:
1. Format validation (`type === 'deepmemo-branch'`)
2. Generate new IDs for all nodes (via `generateId()`)
3. Create `oldId → newId` map
4. Update relationships (parent, children, targetId for symlinks)
5. Attach to current parent node
6. Merge into existing `data.nodes` (without overwriting)

---

## 🎨 CSS Theme

### CSS Variables (base.css)

```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #2a2a2a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --accent: #4a9eff;
  --border: #333;
  --success: #4ade80;
  --danger: #ef4444;
}
```

### z-index Hierarchy

```css
/* Base: 1 */
/* Panel toggle: 50 */
/* External buttons: 200 */
/* Drop indicators: 1000 */
/* Toast: 1000 */
/* Search modal: 2000 */
/* Action modals: 3000 */
```

---

## ⚡ Performance

### Current Optimizations
- ES6 modules (tree-shaking possible)
- Targeted rendering (no full re-render)
- Event delegation
- IndexedDB with indexes for fast queries (V0.10+)
- Async/await for non-blocking storage operations

### Current Limitations
- No virtual scrolling (limit ~1000 nodes)
- No lazy loading
- No Web Workers

### Performance Metrics (V0.10)
- Save single node: <50ms (async, non-blocking)
- Load all data: <500ms (100 nodes + settings)
- Migration: ~1s (100 nodes + attachments)

---

## 🔐 Security

### Current Measures
- No `eval()` or `innerHTML` with user content
- Markdown rendering via marked.js (secure)

### To Implement (future)
- Content Security Policy
- Enhanced sanitization
- Optional encryption

---

## 🚀 Future Evolutions (V1.0+)

### Advanced Features
- Wiki-links `[[id:title]]` with autocomplete
- Nested list view (visual indentation)
- Structured Markdown export
- Advanced search (regex, filters)

### Optimizations
- Virtual scrolling for large trees
- Web Workers for async search
- Advanced query optimization with IndexedDB indexes

---

**Technical Document V0.10**
Last updated: January 4, 2026
