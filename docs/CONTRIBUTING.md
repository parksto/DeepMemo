# 🚀 DeepMemo Development Guide V0.10

> **[Version française](CONTRIBUTING.fr.md)** 🇫🇷

**Last updated**: January 4, 2026
**Version**: 0.10 (IndexedDB migration + Multi-tab sync)

---

## 📁 Project structure

```
DeepMemo/
├── index.html                      # HTML entry point (~190 lines)
├── favicon.svg                     # App icon
│
├── src/
│   ├── css/
│   │   ├── style.css              # Global import (~10 lines)
│   │   ├── base.css               # Reset + CSS variables (~150 lines)
│   │   ├── layout.css             # Responsive structure (~250 lines)
│   │   ├── components.css         # UI components (~800 lines)
│   │   ├── mobile.css             # Mobile navigation (~400 lines)
│   │   └── utilities.css          # Utility classes (~50 lines)
│   │
│   └── js/
│       ├── app.js                 # Main entry point (~830 lines)
│       │
│       ├── core/
│       │   ├── data.js            # Data management + export/import
│       │   ├── storage.js         # IndexedDB layer (Dexie.js) - V0.10
│       │   ├── migration.js       # localStorage → IndexedDB migration - V0.10
│       │   ├── attachments.js     # File attachments (IndexedDB)
│       │   └── default-data.js    # Default demo content
│       │
│       ├── features/
│       │   ├── tree.js            # Sidebar tree + branch mode
│       │   ├── editor.js          # Editor + breadcrumb + children + attachments UI
│       │   ├── search.js          # Global search
│       │   ├── tags.js            # Tag management + autocomplete
│       │   ├── modals.js          # Modals (Move/Link/Duplicate)
│       │   └── drag-drop.js       # Drag & drop nodes
│       │
│       ├── ui/
│       │   ├── toast.js           # Toast notifications
│       │   ├── panels.js          # Sidebar panel management
│       │   └── mobile-tabs.js     # Mobile tab navigation
│       │
│       └── utils/
│           ├── routing.js         # URL navigation
│           ├── keyboard.js        # Keyboard shortcuts
│           ├── helpers.js         # Utility functions
│           ├── i18n.js            # Internationalization
│           └── sync.js            # Multi-tab sync (BroadcastChannel) - V0.10
│
│       └── locales/
│           ├── fr.js              # French dictionary
│           └── en.js              # English dictionary
│
├── assets/
│   └── sto*.ttf                   # Custom fonts
│
├── icons/
│   ├── icon-192x192.png           # PWA icon
│   └── icon-512x512.png           # PWA icon
│
├── docs/
│   ├── README.md                  # Concept and features
│   ├── ROADMAP.md                 # Current state and next steps
│   ├── ARCHITECTURE.md            # Technical details (modules)
│   ├── CONTRIBUTING.md            # This file (English)
│   ├── CONTRIBUTING.fr.md         # This file (French)
│   ├── TODO.md                    # Backlog and progress
│   ├── V0.8-COMPLETE.md           # V0.8 recap
│   ├── I18N.md                    # i18n system documentation
│   └── VISION.md                  # Long-term vision
│
├── manifest-fr.json               # PWA manifest (French)
├── manifest-en.json               # PWA manifest (English)
├── sw.js                          # Service Worker
│
├── .gitignore
├── .claude/                       # Claude Code configuration (ignored)
└── CLAUDE.md                      # Development context guide (ignored)
```

---

## 🛠️ Environment setup

### Prerequisites

- **Modern browser** (Chrome, Firefox, Edge, Safari)
- **Local HTTP server** (required for ES6 modules)
- **Git** (for versioning)
- **Python 3** or **Node.js** (for the server)

**Important**: ES6 modules do NOT work with `file://`! An HTTP server is **mandatory**.

### Running the application

#### With Python (recommended)
```bash
cd DeepMemo
python -m http.server 8000
```

#### With Node.js
```bash
cd DeepMemo
npx http-server -p 8000
```

Then open: **http://localhost:8000**

### Hard refresh

To avoid cache issues with ES6 modules:
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

---

## 📚 Reading the documentation

Recommended order to understand the project:

1. **[README.md](../README.md)** - General concept and V0.9 features
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** - ES6 modular architecture
3. **[ROADMAP.md](ROADMAP.md)** - V0.9 state and V1.0+ vision
4. **[TODO.md](TODO.md)** - Detailed backlog and progress
5. **[I18N.md](I18N.md)** - Internationalization system
6. **[VISION.md](VISION.md)** - Long-term vision

---

## 🧩 Modular architecture

### Key principles

**V0.9 uses an ES6 modular architecture**:

1. **Named imports/exports** for each module
2. **Local state** in each module (not exported)
3. **Communication** via callbacks and exported functions
4. **No global state manager** (intentional simplicity)

### Module example

```javascript
// features/tags.js
import { data, saveData } from '../core/data.js';
import { showToast } from '../ui/toast.js';
import { t } from '../utils/i18n.js';

// Local state (not exported)
let tagAutocompleteIndex = 0;
let tagAutocompleteSuggestions = [];

// Exported function
export function updateTagsDisplay(nodeId) {
  const node = data.nodes[nodeId];
  // ...
  saveData();
  showToast(t('toast.tagsUpdated'), '🏷️');
}
```

### Data flow

```
index.html (loads app.js type="module")
    ↓
app.js (entry point)
    ↓
├─→ core/data.js (data)
├─→ core/attachments.js (files)
├─→ features/tree.js (tree)
├─→ features/editor.js (content)
├─→ features/drag-drop.js (interactions)
├─→ utils/routing.js (URL)
└─→ utils/i18n.js (translations)
```

---

## 🧪 Testing the application

### V0.10 features to test

#### ✅ Storage & Persistence
- [ ] Automatic migration from localStorage to IndexedDB (first load after upgrade)
- [ ] Data persists across browser restarts
- [ ] Inspect IndexedDB stores (nodes, settings, attachments)
- [ ] Storage capacity increased (500MB-1GB)
- [ ] localStorage preserved as backup

#### ✅ Multi-Tab Synchronization
- [ ] Open app in two tabs
- [ ] Create/edit node in tab 1 → appears instantly in tab 2
- [ ] Delete node in tab 2 → disappears in tab 1
- [ ] Real-time sync without manual refresh
- [ ] Current node preserved if not deleted

#### ✅ Node management
- [ ] Create a root node (`Alt+N`)
- [ ] Create a child node
- [ ] Edit title and content
- [ ] Delete a node (via Actions modal)
- [ ] Auto-activation at startup (no empty state)

#### ✅ Navigation
- [ ] Smart breadcrumb (stops at branchRootId in branch mode)
- [ ] 🏠 button activates first node
- [ ] Keyboard navigation in tree (`↑↓←→ + Enter`)
- [ ] Auto-collapse on activation
- [ ] Manual expand/collapse (triangle, arrows)

#### ✅ Branch isolation mode
- [ ] Activate via URL `?branch=nodeId`
- [ ] 🌳 button to share a branch
- [ ] External symlinks disabled (icon 🔗🚫)
- [ ] Breadcrumb stops at branchRootId
- [ ] Navigation identical to normal mode

#### ✅ Symbolic links
- [ ] Create a symlink via drag & drop (`Ctrl+Alt`)
- [ ] Rename a symlink (title independent from target)
- [ ] Edit content (shared with target)
- [ ] Visual focus after symlink navigation
- [ ] Badge [link] visible (no " (link)" suffix)

#### ✅ Tags
- [ ] Add tags
- [ ] Smart auto-completion (branch + global)
- [ ] Tag cloud in right panel
- [ ] Search by tag

#### ✅ Search
- [ ] Open search (`Ctrl+K`)
- [ ] Search in titles, contents, tags
- [ ] Keyboard navigation in results

#### ✅ Drag & Drop
- [ ] Move a node (simple drag)
- [ ] Duplicate a node (`Ctrl + drag`)
- [ ] Create a symlink (`Ctrl+Alt + drag`)
- [ ] Reorganize order (before/after/inside zones)
- [ ] Visual position indicators
- [ ] Cycle prevention (warning toast)
- [ ] Support for tree AND children cards

#### ✅ Modals
- [ ] Actions modal: select action (Move/Link/Duplicate/Delete)
- [ ] Collapsible tree in modal (toggle)
- [ ] Toggles harmonized with main tree

#### ✅ Interface
- [ ] Toggle view/edit mode (`Alt+E`)
- [ ] Collapsible sidebar
- [ ] Collapsible right panel
- [ ] Resize sidebar (265px-600px)
- [ ] Documented keyboard shortcuts (right panel)
- [ ] Export/Import grouped in sidebar
- [ ] Font toggle (Sto vs system fonts)

#### ✅ Export/Import
- [ ] Export global as JSON
- [ ] Export global as ZIP
- [ ] Export branch as JSON
- [ ] Export branch as ZIP
- [ ] Import JSON (destructive)
- [ ] Import ZIP (with attachments)
- [ ] Import branch (non-destructive, ID regeneration)
- [ ] Verify data integrity

#### ✅ Attachments
- [ ] Upload files (50MB max per file)
- [ ] Display images inline `![](attachment:ID)`
- [ ] Link to files `[name](attachment:ID)`
- [ ] Download attachment
- [ ] Delete attachment
- [ ] View storage usage
- [ ] Clean orphaned files

#### ✅ Internationalization (V0.9)
- [ ] Auto language detection (browser)
- [ ] Manual language selector (FR/EN)
- [ ] UI fully translated
- [ ] Toast messages translated
- [ ] Demo content in both languages
- [ ] Language persistence (localStorage)
- [ ] Offline translation (PWA)

#### ✅ Mobile (V1.2.0)
- [ ] Tab bar navigation (🌲 Tree | 📝 Edit | ℹ️ Info)
- [ ] Touch-friendly buttons (≥44px)
- [ ] Responsive layouts
- [ ] Safe area support (notch)
- [ ] Optimized spacing (portrait/landscape)

---

## 🐛 Debugging

### Browser console

Open DevTools (`F12`) to:
- See JavaScript errors
- Inspect IndexedDB (primary storage since V0.10)
- Inspect LocalStorage (migration backup only)
- Debug code (ES6 module sources)

### IndexedDB (V0.10+)

**Primary storage** in DevTools → Application → IndexedDB → `deepmemo`:
- **nodes** store: All node objects
- **settings** store: rootNodes, viewMode, language, fontPreference
- **attachments** store: File blobs

**Console commands**:
```javascript
// Get storage statistics
const stats = await window.Storage.getStats();
console.table(stats);

// List all nodes
const nodes = await window.Storage.loadNodes();
console.log(Object.keys(nodes).length, 'nodes');

// Get total attachments size
const size = await window.Storage.getTotalAttachmentsSize();
console.log((size / 1024 / 1024).toFixed(2), 'MB');

// Clear all data (⚠️ DANGER - irreversible!)
await window.Storage.clearAllData();
```

### LocalStorage (Backup only)

Since V0.10, localStorage is only used for migration backup:

```javascript
// Migration flag
localStorage.getItem('deepmemo_migrated_to_indexeddb')  // "true" after migration

// Old data (preserved as backup)
localStorage.getItem('deepmemo_data')  // JSON backup from V0.9

// Clear localStorage backup after confirming migration worked
await window.Storage.clearLocalStorageBackup();
```

**Note**: `expandedNodes` is NOT saved (recalculated dynamically via auto-collapse).

### Files to check in case of bugs

**By order of complexity**:

1. **app.js** - Entry point and coordination
2. **features/tree.js** - Navigation and tree structure
3. **features/editor.js** - Display and saving
4. **features/drag-drop.js** - Drag & drop interactions
5. **core/data.js** - Data operations and export/import
6. **core/storage.js** - IndexedDB layer (V0.10)
7. **core/migration.js** - Data migration logic (V0.10)
8. **utils/sync.js** - Multi-tab synchronization (V0.10)
9. **utils/routing.js** - URLs and hash routing
10. **utils/i18n.js** - Internationalization

### Common errors

**Module not found**:
- Verify HTTP server is running (not `file://`)
- Check imports (correct relative paths)
- Hard refresh (`Ctrl + Shift + R`)

**IndexedDB errors (V0.10+)**:
- Check browser support (all modern browsers)
- Verify database `deepmemo` exists in DevTools
- Export data before troubleshooting
- Use `window.Storage.clearAllData()` as last resort

**Migration issues**:
- Check `localStorage.getItem('deepmemo_migrated_to_indexeddb')`
- Verify old data exists in localStorage backup
- Check console for migration errors
- Manual migration: use Export from V0.9 → Import in V0.10

---

## 📝 Code conventions

### JavaScript style (ES6)

- **Indentation**: 2 spaces
- **Quotes**: Single quotes `'...'`
- **Variable names**: `camelCase`
- **Function names**: `camelCase`
- **Comments**: English or French
- **Imports**: Always at top of file

**Example**:
```javascript
import { data, saveData } from '../core/data.js';
import { t } from '../utils/i18n.js';

// Local state (not exported)
let expandedNodes = new Set();

// Exported function
export function renderTree() {
  const container = document.getElementById('treeContainer');
  // ...
}
```

### CSS style

- **Class names**: `kebab-case`
- **CSS variables**: `--variable-name`
- **Order**: base.css → layout.css → components.css → mobile.css → utilities.css
- **Imports**: Via `@import` in `style.css`

### Module organization

**Local state (not exported)**:
```javascript
// State variables accessible only within the module
let branchMode = false;
let expandedNodes = new Set();
```

**Exported functions**:
```javascript
// Public API of the module
export function renderTree() { ... }
export function enableBranchMode(nodeId) { ... }
```

**Internal functions (not exported)**:
```javascript
// Private helpers
function getInstanceKey(nodeId, parentContext) { ... }
```

---

## 🎯 Contributing

### Git workflow

```bash
# Create a branch for your feature
git checkout -b feature/my-feature

# Develop and test

# Commit
git add .
git commit -m "✨ Add: my feature"

# Push
git push origin feature/my-feature
```

### Commit types

- `✨ Add:` New feature
- `🐛 Fix:` Bug fix
- `📝 Docs:` Documentation
- `♻️ Refactor:` Refactoring
- `🎨 Style:` CSS/UI
- `⚡ Perf:` Performance
- `🌍 i18n:` Internationalization

### Adding a new feature

**Recommended steps**:

1. **Choose the right module** (or create a new one)
2. **Define the public API** (exports)
3. **Implement the logic** (local state + functions)
4. **Test manually**
5. **Document** (comments + ARCHITECTURE.md if needed)
6. **Commit** with clear message

**Example: Adding a favorites feature**

```javascript
// features/favorites.js (new module)
import { data, saveData } from '../core/data.js';
import { showToast } from '../ui/toast.js';
import { t } from '../utils/i18n.js';

// Local state
let favorites = new Set();

export function toggleFavorite(nodeId) {
  if (favorites.has(nodeId)) {
    favorites.delete(nodeId);
    showToast(t('toast.removedFromFavorites'), '⭐');
  } else {
    favorites.add(nodeId);
    showToast(t('toast.addedToFavorites'), '⭐');
  }
  saveFavorites();
}

function saveFavorites() {
  localStorage.setItem('deepmemo_favorites', JSON.stringify([...favorites]));
}
```

Then in `app.js`:
```javascript
import * as FavoritesModule from './features/favorites.js';

// Expose the function
window.app.toggleFavorite = (nodeId) => FavoritesModule.toggleFavorite(nodeId);
```

### Adding a new language

See **[I18N.md](I18N.md)** for complete internationalization guide.

**Quick steps**:

1. Create `src/js/locales/XX.js` (copy `fr.js` and translate)
2. Create `manifest-XX.json` (translate app name/description)
3. Update `sw.js` precache (add new files)
4. Test language detection and manual selection

---

## 🔧 Technologies used

### Frontend

- **HTML5** - Semantic structure
- **CSS3** - Variables, Flexbox, Grid
- **JavaScript ES6+** - Modules, Classes, Arrow functions

### Native APIs

- **ES6 Modules** - Import/export
- **IndexedDB API** - Primary data storage (V0.10+)
- **BroadcastChannel API** - Multi-tab synchronization (V0.10+)
- **Drag & Drop API** - Interactions
- **FileReader API** - Import/Export
- **History API** - URL routing (pushState/replaceState)
- **Clipboard API** - Copy share links

### External libraries

- **Dexie.js** - IndexedDB wrapper (CDN, V0.10+)
- **marked.js** - Markdown rendering (CDN)

### No other dependencies

- No framework (React, Vue, etc.)
- No bundler (Webpack, Vite, etc.)
- No transpiler (Babel, etc.)
- Everything is vanilla modern JavaScript

---

## 💡 Tips

### Progressive approach

1. **Read ARCHITECTURE.md** - Understand the modules
2. **Test the app** - Manipulate all features
3. **Read the code** - Start with `app.js` then modules
4. **Make small changes** - One module at a time
5. **Test frequently** - After each change

### Keep it simple

- **Prefer simple solutions** - No over-engineering
- **One module = one responsibility** - Strong cohesion
- **Local state when possible** - Avoid global state
- **Test manually** - No automated tests (for now)

### Performance

- **Event delegation** - Avoid multiple listeners
- **Targeted rendering** - No complete re-render
- **IndexedDB with indexes** - Fast queries, 500MB-1GB capacity (V0.10+)
- **Async/await** - Non-blocking storage operations
- **BroadcastChannel** - Efficient multi-tab sync

### Avoid anti-patterns

❌ **Bad**:
```javascript
// Import without extension
import { data } from '../core/data';  // ❌ Missing .js

// Shared global state
window.myGlobalState = {};  // ❌ Use local module

// innerHTML with user content
element.innerHTML = userContent;  // ❌ XSS risk
```

✅ **Good**:
```javascript
// Import with extension
import { data } from '../core/data.js';  // ✅

// Local state in module
let myLocalState = {};  // ✅

// textContent for text
element.textContent = userContent;  // ✅
```

---

## 📚 Resources

### External documentation

- [MDN Web Docs](https://developer.mozilla.org/)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
- [Drag & Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [Dexie.js](https://dexie.org/) - IndexedDB wrapper

### Internal documentation

- **ARCHITECTURE.md** - Complete technical details
- **STORAGE.md** - IndexedDB storage system (V0.10)
- **I18N.md** - Internationalization system
- **CLAUDE.md** - Context guide for Claude (Git ignored)
- **V0.8-COMPLETE.md** - V0.8 recap

### Project

- **GitHub Repo**: `https://github.com/parksto/DeepMemo`
- **Current version**: V0.10 (IndexedDB migration + Multi-tab sync)
- **Status**: ✅ Stable and in production
- **Next version**: V1.0 (Active types)

---

## 🚀 Next steps (V1.0+)

If you want to contribute to V1.0, here are the planned features:

### Advanced features

- **Active types** - Template-based nodes with custom behaviors
- **Refactored Wiki-links** - Syntax `[[id:title]]` with auto-completion
- **Nested list view** - Visual indentation todo-list style
- **Markdown export** - Structure preserved
- **Advanced search** - Regex, combined filters

### Optimizations

- **Virtual scrolling** - For large trees (>500 nodes)
- **Web Workers** - Asynchronous search

See **TODO.md** for the complete list and priorities.

---

**Happy contributing! 🚀**

*Feel free to ask questions or propose improvements.*

**Last updated**: January 4, 2026
