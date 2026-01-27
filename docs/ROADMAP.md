# 🗺️ DeepMemo - Roadmap

> 🌍 **Language versions**: [English](ROADMAP.md) | [Français](ROADMAP.fr.md)

## 📍 Current state: V0.10.4 (January 2026)

### ✅ Implemented features

#### Node management
- [x] Create/edit/delete nodes
- [x] Infinite recursive hierarchy
- [x] Breadcrumb navigation
- [x] Auto-select title on creation
- [x] Auto-resize textarea based on content

#### Tree view
- [x] Tree display in sidebar
- [x] Expand/collapse branches
- [x] Persist expand/collapse state (localStorage)
- [x] Keyboard navigation (↑↓←→ + Enter)
- [x] Visual focus on current node
- [x] Display children as clickable cards

#### Links
- [x] Symbolic links (one node in multiple locations)
- [x] Automatic backlinks
- [x] Delete symlinks without affecting original
- [x] Broken link detection
- [ ] Clickable wiki-links `[[Node name]]` (POSTPONED V1.0+)

#### Tags
- [x] Dedicated tag system (separate field)
- [x] Smart auto-completion (branch + global)
- [x] Tag cloud per branch with counter
- [x] Search by tag
- [x] Visual badges (branch vs global)

#### Search
- [x] Real-time global search (Ctrl+K)
- [x] Search in titles, content and tags
- [x] Keyboard navigation in results
- [x] Match highlights
- [x] Direct open of found node
- [x] Auto-expand path to node

#### Drag & Drop
- [x] Move nodes
- [x] Duplicate (Ctrl + drag)
- [x] Symbolic links (Ctrl+Alt + drag)
- [x] Reorder (before/after/inside zones)
- [x] Visual position indicators
- [x] Support tree + cards

#### Interface
- [x] Dark theme
- [x] Collapsible sidebar
- [x] Collapsible right panel
- [x] Responsive (base)
- [x] Notification toasts
- [x] Modals for multiple actions

#### Keyboard shortcuts
- [x] `Alt+N`: New node
- [x] `Alt+E`: Focus editor
- [x] `Alt+E`: Toggle view/edit
- [x] `Ctrl+K`: Search
- [x] `Escape`: Go up to parent
- [x] `↑↓←→`: Tree navigation
- [x] `Enter`: Activate node
- [x] Complete documentation in right panel

#### Persistence
- [x] IndexedDB with Dexie.js (V0.10)
- [x] Automatic migration from localStorage (V0.10)
- [x] Global JSON export
- [x] Global JSON import
- [x] Branch export (node + descendants)
- [x] Branch import (non-destructive, with ID regeneration)
- [x] .dm archive format (V0.10)
- [x] Auto-save on every change

#### Rendering and Display (V0.7+)
- [x] Markdown rendering with view/edit mode toggle
- [x] View mode by default (reading)
- [x] Resizable sidebar
- [x] Horizontal scroll if content is wide
- [x] Custom favicon
- [x] Scroll reset on navigation (V0.8)
- [x] Right panel hidden by default (V0.8)
- [x] Toggle font choice (Sto vs system) (V0.8)

#### Dynamic URLs and Navigation (V0.8)
- [x] Dynamic URL system with hash routing
- [x] Bookmarkable URLs `#/node/nodeId`
- [x] Persistence after refresh
- [x] Isolated branch mode `?branch=nodeId`
- [x] External symlinks grayed out in branch mode
- [x] Share node (icon 🔗)
- [x] Share isolated branch (icon 🌳)
- [x] Browser navigation support (back/forward)
- [x] Auto-collapse tree (active path only)

#### Refactored Symbolic Links (V0.8)
- [x] Dedicated `symlink` node type
- [x] Independent titles for symlinks
- [x] Cycle detection (circular references)
- [x] Infinite loop prevention
- [x] Icon 🔄 for circular symlinks
- [x] Icon 🔗🚫 for external symlinks (outside branch)

#### Demo Content (V0.8)
- [x] Interactive tutorial on first launch (26 pedagogical nodes)
- [x] Progressive structure: Welcome → Interface → Features → Future → First steps
- [x] Pedagogical format: [Feature → What it allows → Example]
- [x] V0.8 features documented with concrete examples
- [x] Future concepts clarified (types = nodes, multi-node triggers, external API)
- [x] Auto-load if localStorage is empty
- [x] Instructions to delete demo content included

---

## 🐛 Known bugs

### Fixed in V0.7
- [x] **Selection in modals** ✅: Impossible to select destination node in action/symlink modals → **FIXED** (using `data-node-id` with `querySelector`)

### Fixed in V0.8
- [x] **Data loss bug - Symlinks with identical names** ✅: **RESOLVED** with complete overhaul of symlink system. Symlinks are now special-type nodes with their own `id`, eliminating any title-based confusion.
- [x] **Circular references** ✅: **RESOLVED** with automatic cycle detection. Symlinks that would create an infinite loop are detected and displayed with icon 🔄 without showing their children.
- [x] **Multiple symlink display** ✅: **RESOLVED** with instance key system (`nodeId@parent@grandparent@root`) which allows distinguishing each node instance in the tree.

### Medium priority
- [ ] Sometimes button borders have a relief effect (browser default)

### Low priority
- [ ] No confirmation before mass deletion
- [ ] No tree depth limit

---

## ✅ V0.7 - Multifile Restructuring (COMPLETED)

### Achieved objectives

#### 1. Project structure ✅
```
DeepMemo/
  ├── index.html          (Minimal HTML structure)
  ├── src/
  │   ├── css/
  │   │   └── style.css   (All styles)
  │   └── js/
  │       └── app.js      (All logic)
  ├── reference/
  │   └── deepmemo-reference.html  (Single-file version)
  ├── docs/
  │   └── (complete documentation)
  └── .gitignore
```

#### 2. Urgent fixes
- [x] Fix node selection in modals ✅
- [ ] Standardize button borders
- [ ] Improve event handling

#### 3. Infrastructure
- [x] GitHub repo created and configured ✅
- [x] Complete documentation (README + docs) ✅
- [x] Professional scalable structure ✅

---

## 🚀 V0.8 - Symlinks & Navigation Overhaul (✅ COMPLETED)

**Main objective**: Complete refactoring of symbolic link system for more robustness and flexibility + dynamic URL system.

### 🔗 Symbolic Links Overhaul ✅ COMPLETED

**Concept**: Treat symlinks like "Windows shortcuts" - special-type nodes that point to a target node.

#### New architecture
- [x] **Node type**: Added `type: "node" | "symlink"` property to all nodes
- [x] **Symlink structure**:
  ```javascript
  {
    id: "symlink_xxx",
    type: "symlink",
    title: "Custom shortcut title",
    targetId: "node_abc",  // Points to real node
    parent: "node_xyz",
    children: [],          // Always empty
    created: timestamp,
    modified: timestamp
  }
  ```
- [x] **Independent renaming**: Symlink title doesn't affect target node
- [x] **Clean deletion**: Deleting a symlink = deleting a normal node
- [x] **Cycle detection**: Anti-infinite loop protection during creation via `wouldCreateCycleWithMove()`
- [x] **Broken symlinks**: Display with error message and disabled content

#### Rendering and UI
- [x] Modify `render()` to switch on `node.type` with `displayNode` pattern
- [x] Display icon 🔗 for symlinks
- [x] On click: open content of `targetId`, not symlink
- [x] Visual badge distinct from normal nodes
- [x] Simplified code with instance key system

#### Obtained advantages
- ✅ Symlinks = normal children in `children[]`
- ✅ Natural sorting and ordering
- ✅ Metadata specific to each symlink
- ✅ Much simpler code
- ✅ Cycle prevention with detection

### 🌳 Smart Tree ✅ COMPLETED

- [x] **Global auto-collapse**: `autoCollapseTree()` folds everything except active path
- [x] **Expand to current node**: `expandPathToNode()` functional
- [x] **Synchronized focus**: Tree follows navigation
- [x] **Smooth keyboard navigation**: Implemented with instance key system
- [x] **ArrowLeft navigation**: Go up to parent if node is collapsed/has no children

### 🔗 Navigation via Internal Links (POSTPONED V1.0+)

**Note**: Feature temporarily disabled because title-based matching is fragile (duplicates, renames). Needs overhaul with `[[id:title]]` syntax or smart auto-completion.

- [ ] **Refactored wiki-links**: Syntax pointing to ID instead of title
- [ ] **Auto-completion**: Smart selection during input
- [ ] **Smart selection**: Choose original node OR nearest symlink
- [ ] **Euclidean distance**: Calculate symlink closest to current focus
- [ ] **Fallback to original**: If no symlink, open real node

### 🔗 Dynamic URL System ✅ COMPLETED

- [x] **Hash routing**: `#/node/abc123` to point to a node
- [x] **Refresh persistence**: Stay on active node after F5
- [x] **Bookmarkability**: Shareable URLs
- [x] **Branch isolation**: `?branch=nodeId` for isolated instances
- [x] **Symlinks outside branch**: Grayed out + disabled with icon 🔗🚫
- [x] **View mode by default**: Reading display with optional `?view=edit`
- [x] **Share node**: Icon 🔗 to copy node URL
- [x] **Share branch**: Icon 🌳 to copy isolated branch URL
- [x] **Navigation support**: Browser back/forward buttons
- [x] **Auto-expand branch**: Branch automatically expanded on open

### ⌨️ Shortcuts & UX ✅ COMPLETED

- [x] **Toggle view/edit**: [View]/[Edit] button functional
- [x] **Alt+E shortcut**: Toggle view/edit with keyboard
- [x] **Keyboard tips**: Complete documentation at bottom of right panel
- [x] **Action modal**: Delete button moved to modal
- [x] **Conditional hiding**: Modal tree hidden by default
- [x] **Harmonized triangles**: Modal toggles identical to main tree

### 👁️ UI Improvements ✅ COMPLETED

- [x] **Smart breadcrumb**: `.../parent/current_node` with sized levels
- [x] **Import/Export**: Grouped in sidebar + harmonized styles
- [ ] **Tags right panel**: Don't duplicate with center panel (low priority)

### 📄 Documentation & Tests ✅ COMPLETED

- [x] **Audit .md files**: CLAUDE.md, TODO.md, ROADMAP.md updated (Dec 20, 2025)
- [x] **V0.8 documentation**: Complete and up-to-date
- [ ] **Complete JSDoc**: Document all functions (low priority)
- [ ] **Manual tests**: Symlink validation checklist (low priority)

### 🐛 Critical Bugs ✅ FIXED

- [x] **Identical names bug**: RESOLVED - Exclusive use of IDs
- [x] **Circular references**: RESOLVED - Automatic detection with icon 🔄
- [x] **Data loss**: RESOLVED - Refactored symlink system

---

## 🌍 V0.9 - Internationalization (i18n) - ✅ 100% COMPLETED

**Strategic context**: DeepMemo is deployed in production on deepmemo.org and already functional. The priority is to make it accessible to an international audience before implementing advanced features.

### i18n System (Foundations) ✅ COMPLETED
- [x] Lightweight `i18n.js` module (no external dependency) - ~240 lines
- [x] Minimum FR/EN support (ES optional)
- [x] Translation dictionaries structured by module - fr.js and en.js (~270 lines each)
- [x] `t(key)` function for dynamic translation with interpolation
- [x] Automatic browser language detection
- [x] Manual language selector in interface (Right panel → Preferences)
- [x] Persistence in `localStorage.deepmemo_language`
- [x] Dictionary precaching in Service Worker (PWA offline)

### Interface translation ✅ COMPLETED
- [x] Static HTML labels (`index.html`) - Migration with data-i18n-*
- [x] Dynamic labels generated in JavaScript - Complete migration with t()
- [x] Buttons and actions (modals, toasts, confirmations)
- [x] Form field placeholders
- [x] `title` and `aria-label` attributes (accessibility)
- [x] Error and warning messages
- [x] Integrated documentation (keyboard shortcuts, tooltips)
- [x] **Final corrections**: 15 forgotten strings identified and corrected (Dec 28, 2025)

### Multilingual demo content ✅ COMPLETED
- [x] `default-data.js` adapted according to detected language
- [x] FR version (existing) - 26 pedagogical nodes
- [x] EN version (complete translation of 26 nodes)
- [x] Multilingual PWA manifests (manifest-fr.json, manifest-en.json)

### Testing and validation ✅ COMPLETED
- [x] Tests on multilingual browsers (FR, EN)
- [x] Fallback verification (unsupported language → EN by default)
- [x] Persistence tests (language change → refresh)
- [x] User documentation (language selector in preferences)
- [x] PWA offline verification with precached dictionaries

### Optional improvements (Backlog - after V0.9)
- [ ] Quick tag creation via #hashtag in content
- [ ] Global tag renaming
- [ ] Tag merging
- [ ] Markdown export (with preserved structure)
- [ ] Import from Notion/Obsidian

---

## 🐛 V0.9.1 - Bug Fixes & Quality (December 31, 2025) - ✅ COMPLETED

**Context**: Post-launch fixes following public announcement (449 unique sessions on Reddit)

### Critical Bug Fixes ✅
- [x] **Symlinks**: Creating child from symlink now adds to target (not symlink itself)
- [x] **Symlink titles**: Display symlink's own title in center panel (not target's)
- [x] **Visual indicator**: Metadata shows clickable link to original node
- [x] **Auto-save on navigation**: Esc, Alt+E, all navigation now saves before switching
- [x] **i18n fixes**: Empty content showed `[labels.emptyContent]` → now translated
- [x] **Branch mode modals**: Action modal tree now shows branch tree only (not global)

### New Features ✅
- [x] **Orphan cleanup**: `cleanOrphanNodes()` function with UI button
- [x] **Cross-tab sync**: Real-time synchronization between browser tabs
- [x] **Mobile warning**: Dismissible banner for mobile users
- [x] **Service Worker**: Version bumped to v1.4.0

---

## 📘 V0.9.2 - Markdown Help Modal (December 31, 2025) - ✅ COMPLETED

**Context**: UX improvement - make Markdown more accessible

### Markdown Help Modal ✅
- [x] **Alt+H shortcut**: Opens complete Markdown cheatsheet
- [x] **9 sections**: Headings, formatting, lists, links, images, code, quotes, tables, HR
- [x] **Fully responsive**: Scroll support, works offline
- [x] **100% i18n**: FR/EN translations

### Bug Fixes ✅
- [x] **i18n errors**: Fixed `result.replace is not a function` error
- [x] **Duplicate keys**: Removed duplicate `meta:` sections in dictionaries
- [x] **Clean console**: All i18n warnings eliminated

### Demo Content Update ✅
- [x] Added "Markdown: optional and accessible" section in demo
- [x] Service Worker bumped to v1.5.1

---

## 🗺️ V0.9.3 - Mindmap Export (January 1, 2026) - ✅ COMPLETED

**Context**: Enable visual export and sharing of knowledge structure

### Export Modal ✅
- [x] **3 export formats**: ZIP Archive, FreeMind .mm, Mermaid SVG
- [x] **Modal choice**: Replaces direct export buttons
- [x] **Works for both**: Global and branch exports

### FreeMind .mm Export ✅
- [x] **Valid XML**: FreeMind format version 1.0.1
- [x] **Symlink support**: Orange color, bubble style, arrowlinks to targets
- [x] **Proper escaping**: Quotes and special characters
- [x] **Compatible**: Freeplane, FreeMind, XMind

### Mermaid SVG Export ✅
- [x] **Mermaid.js v10**: Loaded via CDN (ES module)
- [x] **Mindmap syntax**: Generated from tree structure
- [x] **Symlinks marked**: 🔗 emoji for symlinks
- [x] **Character escaping**: Parentheses, brackets, special chars
- [x] **Offline support**: Precached by Service Worker

### Bug Fixes ✅
- [x] **exportType reset**: Fixed modal close timing issue
- [x] **Mermaid parser**: Fixed errors with parentheses in titles

---

## 🎨 V0.9.4 - Polish & Bug Fixes (January 1, 2026) - ✅ COMPLETED

**Context**: Interface polish, bug fixes, and UX improvements

### UI Improvements ✅
- [x] **New color palette**: Dark blue accent (#0a376c, #1155aa, #4a9eff)
- [x] **System font default**: Changed from Sto (user can still toggle)

### Critical Bug Fixes ✅
- [x] **Broken symlinks**: Special display with "(BROKEN LINK)" badge, ⚠️ icon, opacity 0.5
- [x] **External symlinks**: Special display with "(EXTERNAL)" badge, 🔗🚫 icon, opacity 0.4
- [x] **Data corruption fix**: `saveNode()` doesn't save when editor disabled
- [x] **Branch mode export**: "Global" export in branch mode exports only active branch
- [x] **Post-deletion navigation**: Smart navigation to parent/sibling/root
- [x] **Disabled buttons**: New node disabled in branch mode, Confirm disabled without selection

### FreeMind Export ✅
- [x] **Content in richcontent NOTE**: Proper FreeMind format
- [x] **Emoji filtering**: Removed from titles for compatibility

### Technical ✅
- [x] **Service Worker**: Version bumped to v1.6.0
- [x] **Code quality**: Better state management, error handling
- [x] **No data corruption**: Protection for special symlink types

---

## 💾 V0.10 - IndexedDB Migration & .dm Format (January 2026) - ✅ COMPLETED

**Context**: Scalable storage with IndexedDB, official .dm archive format, and PDF export

### IndexedDB Storage ✅
- [x] **Dexie.js integration**: Modern IndexedDB wrapper for robust storage
- [x] **Increased capacity**: 500 MB - 1 GB storage (vs ~5-10 MB with localStorage)
- [x] **Three stores**: `nodes`, `settings`, `attachments`
- [x] **Automatic migration**: Seamless upgrade from V0.9 preserving all data
- [x] **Backup support**: Original localStorage data preserved after migration
- [x] **Migration flag**: `deepmemo_migrated_to_indexeddb` in localStorage
- [x] **Module structure**: `storage.js` (Dexie layer), `migration.js` (migration logic)

### .dm Archive Format ✅
- [x] **Official format**: `.dm` extension (ZIP archive with custom extension)
- [x] **metadata.json**: Version, type (global/branch), title, date, stats, generator
- [x] **data.json**: Node tree structure (unchanged from V0.9)
- [x] **attachments/ folder**: Attachment files with naming convention
- [x] **Backward compatible**: Supports legacy .json and .zip imports
- [x] **Auto-detection**: Magic number detection (PK = ZIP, else JSON)
- [x] **File filters**: `.dm,.zip,.json` in native file picker
- [x] **Documentation**: Complete spec in `docs/FILE-FORMATS.md` v2.0

### Improved Import ✅
- [x] **Global import choice**: "Replace all" (destructive) or "Merge" (add to roots)
- [x] **Branch import from global**: Accepts global exports
  - Single root → imports as branch
  - Multiple roots → creates container node with export title
- [x] **JSON Schema validation**: Against `docs/schemas/deepmemo-v1.0.json`
- [x] **Graceful degradation**: Missing files tolerated, warnings displayed

### PDF Export ✅
- [x] **CloudFlare Worker**: Online generation with Browser Rendering API
  - Rate limiting: 5 PDFs/hour, 20/day per IP
  - IP hashing (SHA-256) for privacy
  - CORS headers for quota exposure
  - Referer/origin protection
  - **Status**: Code complete, not yet deployed to production
- [x] **CLI tool**: `bin/branch2pdf.js` for 100% offline generation
  - Node.js + Puppeteer
  - Supports .dm archives (ZIP extraction)
  - No rate limiting
- [x] **Symlink resolution**: Content included, descendants excluded if external to scope
- [x] **Inline images**: Attachments converted to base64 data URLs
- [x] **Cycle detection**: Prevents infinite loops
- [x] **Table of contents**: Simplified hierarchical structure
- [x] **Privacy modal**: First-use notice (localStorage persistence)
- [x] **Quota display**: Real-time quota info in right panel

### Demo Content Update ✅
- [x] **Cleaned speculative content**: Removed "active types", "triggers", "automation" nodes
- [x] **Updated "Collaboration & Sharing"**: Focus on current export/import .dm workflow
- [x] **Added PDF section**: Documented online and offline PDF export options
- [x] **Simplified "Explored Directions"**: Vague mention of future sync without promises
- [x] **Tone adjustment**: "We're exploring, we'll see" - no teasing of unimplemented features
- [x] **Template literal fixes**: Escaped backticks in markdown content (`.dm` → `\`.dm\``)

### Documentation ✅
- [x] **FILE-FORMATS.md v2.0**: Complete .dm format specification
- [x] **FORMATS-FICHIERS.md v2.0**: French version synchronized
- [x] **file-formats/ZIP-FORMAT.md**: Quick reference for .dm structure
- [x] **file-formats/JSON-STRUCTURE.md**: LLM-friendly JSON guide
- [x] **file-formats/SCHEMA-VALIDATION.md**: Validation documentation
- [x] **docs/schemas/**: JSON Schema files for validation
- [x] **cloudflare-worker/README.md**: PDF Worker deployment guide
- [x] **cloudflare-worker/PRIVACY-NOTICE.md**: User privacy notice

### Bug Fixes ✅
- [x] **Template literal errors**: Fixed escaped backticks in `default-data.js`
- [x] **Missing i18n keys**: Added all PDF-related translation keys
- [x] **Attachment format**: Ensured array-of-objects format (not strings)

---

## 🌟 V1.0 - Active types and complete system

### Active node types (Foundations)

**Objective**: Allow nodes to define their own behavior via scripts, transforming DeepMemo into an extensible platform.

**References**: See `docs/VISION.md` for complete specification.

#### Basic architecture
- [ ] Basic `implements` system
- [ ] `implements: ["node_type_X"]` property on nodes
- [ ] Simple scripts (`onSave`, `onRender`, `onLoad`)
- [ ] Secure JavaScript sandbox (isolated eval)
- [ ] Type descriptor nodes (types = nodes themselves)
- [ ] Node manipulation API (`getNode`, `updateNode`, `createChild`)
- [ ] Concrete examples in demo content

#### Advanced types and triggers
- [ ] Dependency resolution between types
- [ ] Type inheritance (multiple `implements`)
- [ ] Multi-node triggers (`triggerNode` API)
- [ ] Multiple views (card, list, kanban, calendar)
- [ ] Custom actions per node type
- [ ] Concrete examples: recipes → shopping list, agile projects, CRM

### Multi-user
- [ ] chmod-style permissions (rwx per user/group)
- [ ] Branch sharing
- [ ] Real-time collaboration
- [ ] Modification history

### Voice interface
- [ ] Voice commands (create, search, navigate)
- [ ] Content dictation
- [ ] Text-to-speech

### Distributed architecture
- [ ] Optional backend (Node.js + PostgreSQL)
- [ ] Multi-device synchronization
- [ ] Offline-first mode
- [ ] Federation between instances

---

## 💡 Backlog (future ideas)

### Interface
- [ ] Customizable themes
- [ ] Light mode
- [ ] Graph view (network visualization)
- [ ] Calendar view
- [ ] Kanban view
- [ ] Zen mode (focus)

### Productivity
- [ ] Node templates
- [ ] Reusable snippets
- [ ] Custom macros/shortcuts
- [ ] Integrations (Google Calendar, Trello, etc.)

### Advanced
- [ ] Versioning (git-like)
- [ ] Work branches
- [ ] Node merging
- [ ] Sensitive data encryption
- [ ] REST API for extensions
- [ ] Plugin system

---

## 📊 Progress metrics

### Code (V0.10.4)
- **Total lines**: ~42.6K lines / 2.3M characters
  - Code: ~19.8K lines (JS, HTML, CSS, JSON, SVG)
  - Documentation: ~22.8K lines (Markdown)
- **Main codebase**:
  - JavaScript: ~13.2K lines
  - CSS: ~1.8K lines
  - HTML: ~1.8K lines
- **Keyboard shortcuts**: 7
- **Modules**: ~20 ES6 modules

### Data
- **Base types**: 1 (Node)
- **Node types**: 2 (note, symlink)
- **Properties per node**: ~10
- **Relations**: parent, children, tags, attachments, targetId (symlinks)
- **Storage**: IndexedDB (Dexie.js) with 3 stores

### User testing
- [x] Fabien actively uses it (content creation)
- [ ] External beta-testers
- [ ] Structured feedback

---

## 🎓 Lessons learned

### What works well
- ✅ Recursive node concept: simple and powerful
- ✅ Symbolic links: very useful in practice
- ✅ Tags with auto-completion: excellent UX
- ✅ Drag & drop: intuitive and fast
- ✅ Single-file at start: practical for prototyping

### What was improved in V0.7
- ✅ Single-file → Multifile: much more maintainable
- ✅ Professional project structure
- ✅ Modal UX fixed

### What still needs improvement
- ⚠️ No automated tests
- ⚠️ Performance with many nodes (>1000) to test
- ⚠️ Code quality (JSDoc, better type safety)

### Validated technical decisions
- ✅ Vanilla JS: no overhead, full control
- ✅ IndexedDB with Dexie.js: scalable storage, excellent performance (V0.10)
- ✅ Modular ES6 architecture: clean separation of concerns (V0.8)
- ✅ Dark theme by default: user preference
- ✅ Keyboard-first: maximum efficiency
- ✅ Offline-first PWA: reliable user experience

---

**Last update**: January 19, 2026 (V0.10.4 IndexedDB & .dm format)
**Current version**: V0.10.4 (✅ COMPLETED & DEPLOYED TO LOCAL)
**Production**: V0.10.3 on **deepmemo.org** (V0.10.4 pending deployment)
**Next milestone**: V1.0 (Active node types - foundations)

---

## 🎉 V0.8 - FINAL MIGRATION COMPLETED

### ✅ Final deployment (December 20, 2025)
- [x] **index.html**: Switch to `app.js` (type="module")
- [x] **app.js → app-backup.js**: Legacy code kept for reference
- [x] **Simplified drag & drop**: Shift modifier removed (Ctrl + Ctrl+Alt only)
- [x] **Validation tests**: All features operational in production
- [x] **Final documentation**: CLAUDE.md, TODO.md, ROADMAP.md up-to-date

### ✅ Branch export/import (December 23, 2025)
- [x] **Branch export**: Export node + descendants recursively
- [x] **Branch import**: Import as children of current node
- [x] **ID regeneration**: Avoid conflicts with existing nodes
- [x] **Non-destructive merge**: Preserve existing data
- [x] **Preserve symlinks**: Relationships preserved in imported branch
- [x] **User interface**: ⬇️/⬆️ buttons in node actions
- [x] **Documentation**: README, ARCHITECTURE, ROADMAP updated

### ✅ Demo content + UX polish (December 24, 2025)
- [x] **Demo content**: 26 pedagogical nodes on first launch
  - Progressive structure: Welcome → Interface → Features → Future → First steps
  - Pedagogical format: [Feature → What it allows → Example]
  - Future concepts clarified (types = nodes, multi-node triggers, external API)
- [x] **Scroll reset**: Return to top of content on each navigation
- [x] **Display mode**: Start in read mode (instead of edit)
- [x] **Right panel**: Hidden by default (clean interface)
- [x] **Font toggle**: Choice between Sto (custom) and system fonts
- [x] **Complete documentation**: CLAUDE.md, README, docs/ all up-to-date

### ✅ Progressive Web App (December 25, 2025)
- [x] **PWA manifest**: Complete configuration (name, icons, theme)
- [x] **Service Worker**: Cache-First with precache and background update
- [x] **Offline mode**: Works without Internet connection
- [x] **Native installation**: Desktop and mobile (Chrome, Edge, Safari, etc.)
- [x] **Icons**: 192x192 and 512x512 generated from favicon.svg
- [x] **Documentation**: Complete guide in docs/PWA.md
- [x] **HTTPS ready**: Compatible GitHub Pages, Netlify, Vercel

### ✅ File attachments (December 25, 2025)
- [x] **IndexedDB storage**: Up to ~500 MB depending on browser
- [x] **File upload**: Images, PDFs, documents (50 MB max per file)
- [x] **Inline display**: Images via syntax `![](attachment:ID)`
- [x] **ZIP export/import**: Systematic format including files + data.json
- [x] **Complete management**: Upload, download, delete, copy syntax
- [x] **Storage indicator**: Real-time progress bar in right panel
- [x] **Garbage collection**: Manual cleanup of orphaned files
- [x] **Icons by type**: Visual differentiation by MIME type
- [x] **Documentation**: Detailed spec in docs/SPEC-ATTACHMENTS.md
