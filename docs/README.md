# 📖 DeepMemo - Complete Documentation

> **Concepts, architecture, and detailed features**

*[Version française](README.fr.md)*

---

## 📚 Documentation Index

> **Central index of all DeepMemo documentation**. Use this list when updating documentation to ensure nothing is forgotten.

### 🎯 Core Documentation (Bilingual)

**General**
- [`README.md`](README.md) / [`README.fr.md`](README.fr.md) - Main overview (V0.10.4)
- [`ARCHITECTURE.md`](ARCHITECTURE.md) / [`ARCHITECTURE.fr.md`](ARCHITECTURE.fr.md) - Technical architecture
- [`VISION.md`](VISION.md) / [`VISION.fr.md`](VISION.fr.md) - Project vision and philosophy
- [`ROADMAP.md`](ROADMAP.md) / [`ROADMAP.fr.md`](ROADMAP.fr.md) - Development roadmap

**Technical Specs**
- [`FILE-FORMATS.md`](FILE-FORMATS.md) / [`FORMATS-FICHIERS.md`](FORMATS-FICHIERS.md) - Export/import formats (⚠️ EN: v2.0, FR: v1.0)
- [`SPEC-ATTACHMENTS.md`](SPEC-ATTACHMENTS.md) / [`SPEC-ATTACHMENTS.fr.md`](SPEC-ATTACHMENTS.fr.md) - Attachment system
- [`STORAGE.md`](STORAGE.md) / [`STORAGE.fr.md`](STORAGE.fr.md) - IndexedDB storage
- [`I18N.md`](I18N.md) / [`I18N.fr.md`](I18N.fr.md) - Internationalization
- [`PWA.md`](PWA.md) / [`PWA.fr.md`](PWA.fr.md) - Progressive Web App

**Detailed Topics**
- [`HIERARCHICAL_STRUCTURES.md`](HIERARCHICAL_STRUCTURES.md) / [`HIERARCHICAL_STRUCTURES.fr.md`](HIERARCHICAL_STRUCTURES.fr.md) - Hierarchical structures
- [`TODO.md`](TODO.md) / [`TODO.fr.md`](TODO.fr.md) - Development tasks

**Contributing**
- [`CONTRIBUTING.md`](CONTRIBUTING.md) / [`CONTRIBUTING.fr.md`](CONTRIBUTING.fr.md) - Contribution guide

### 📄 File Format Details

- [`file-formats/JSON-STRUCTURE.md`](file-formats/JSON-STRUCTURE.md) - JSON interchange format
- [`file-formats/ZIP-FORMAT.md`](file-formats/ZIP-FORMAT.md) - .dm archive format
- [`file-formats/SCHEMA-VALIDATION.md`](file-formats/SCHEMA-VALIDATION.md) - JSON Schema validation

### 🔮 Prospective (Future Vision)

- [`Prospective/1-FUTURE-VISION.md`](Prospective/1-FUTURE-VISION.md) - Long-term vision
- [`Prospective/2-DEEPMEMO-ACTIVE-NODES.md`](Prospective/2-DEEPMEMO-ACTIVE-NODES.md) - Active nodes concept
- [`Prospective/3-USE-CASES.md`](Prospective/3-USE-CASES.md) - Future use cases
- [`Prospective/4-PARADOX.md`](Prospective/4-PARADOX.md) - Philosophical paradoxes
- [`Prospective/5-ACTION.md`](Prospective/5-ACTION.md) - Action plans

### 🛠️ Development

- [`CONTEXT-CLAUDE-PROJECTS.md`](CONTEXT-CLAUDE-PROJECTS.md) - Context for Claude Code (⚠️ Should be CLAUDE.md at root)
- [`../cloudflare-worker/README.md`](../cloudflare-worker/README.md) - PDF export worker
- [`../cloudflare-worker/PRIVACY-NOTICE.md`](../cloudflare-worker/PRIVACY-NOTICE.md) - PDF privacy notice

### 📋 Update Checklist

When making significant changes to DeepMemo, ensure you update:
1. ✅ Both language versions (EN + FR) of affected files
2. ✅ Version numbers in README files
3. ✅ ROADMAP for new features or completed items
4. ✅ ARCHITECTURE for structural changes
5. ✅ FILE-FORMATS / FORMATS-FICHIERS for data format changes
6. ✅ SPEC-ATTACHMENTS for attachment-related changes
7. ✅ Relevant file-formats/ subdirectory files
8. ✅ This index if new documentation is added

---

DeepMemo is a personal knowledge management system based on a **hierarchical network** of recursive, interconnected, and active nodes. Everything (notes, projects, contacts, files, ideas) is a node that can contain other nodes infinitely.

## 🎯 Core Concept

**A single base type: the Node**

Each node has:
- A title
- Content (text, markdown)
- Children (other nodes)
- Links to other nodes
- Tags
- Customizable properties

## ✨ Main Features

### 🌳 Flexible Hierarchy
- Breadcrumb navigation
- Expand/collapse tree
- Persistent state between sessions

### 🔗 Link System
- **Reticular tree structure**: The hierarchical tree becomes a meshed network thanks to symlinks
- **Symbolic links**: A node can appear in multiple places (like `ln -s` on Linux), independently renameable
- **Backlinks**: Automatically see all nodes that point to the current node

### 🏷️ Tags
- Dedicated tag system
- Intelligent auto-completion (branch tags + global tags)
- Per-branch tag cloud
- Tag-based search

### 🔍 Global Search
- Real-time search (Ctrl+K)
- Search in titles, content, and tags
- Keyboard navigation
- Result highlights

### 🔗 Dynamic URLs (V0.8)
- **Bookmarkable URLs**: `#/node/nodeId`
- **Persistence after refresh**: Stay on the active node
- **Isolated branch mode**: `?branch=nodeId` to display only a subtree
- **Easy sharing**: Icons 🔗 (node) and 🌳 (branch)
- **Browser navigation**: Support for back/forward buttons

### 📦 Branch Export/Import (V0.8)
- **Local export**: Export a node + all its descendants
- **Non-destructive import**: Import as children of the current node
- **ID regeneration**: Avoids conflicts with existing nodes
- **Symlink preservation**: Relationships preserved in the imported branch
- **Collaborative sharing**: First step towards multi-user usage

### 🌍 Internationalization (V0.9)
- **Bilingual interface**: Full French/English support
- **Automatic detection**: Language detected from browser settings
- **Manual switcher**: Toggle FR/EN in the right panel
- **Bilingual demo content**: 26 educational nodes in both languages
- **PWA manifests**: Localized app names and descriptions
- **Offline compatible**: All dictionaries pre-cached

### 📘 Demo Content (V0.8)
- **Interactive tutorial**: 26 educational nodes on first launch
- **Progressive structure**: Discovery through tree exploration
- **Current features**: Nodes, symlinks, tags, branch, export/import, shortcuts
- **Future vision**: Active types, multi-node triggers, external API, multi-user
- **Educational format**: [Feature → What it enables → Concrete example]
- **Deletable**: Instructions to remove demo content included

### 📄 Display and Rendering (V0.7+)
- **Markdown rendering**: Formatted content display
- **View mode by default**: Reading prioritized over editing (V0.8)
- **View/edit toggle**: [View]/[Edit] button + Alt+E shortcut
- **Resizable sidebar**: Mouse-adjustable
- **Auto-collapse**: Tree collapsed except active path
- **Scroll reset**: Return to top of content on each navigation (V0.8)
- **Right panel hidden**: Clean interface by default, open via [i] (V0.8)
- **Font choice**: Toggle Sto (custom) vs system (V0.8)

### 🎨 Drag & Drop (V0.8 - Complete)
- **Move**: Drag-and-drop to change parent or reorganize
- **Duplicate**: Ctrl + drag to copy with descendants
- **Link**: Ctrl+Alt + drag to create a symbolic link
- **Precise zones**: Visual indicators before/after/inside
- **Cycle prevention**: Automatic detection of circular references
- **Full support**: Works in tree AND children list

### 📱 Progressive Web App (V0.8)
- **Native installation**: Installable as a real app on desktop/mobile
- **Offline mode**: Works without internet (smart cache)
- **Service Worker**: Automatic caching of all static files
- **Standalone opening**: Launches in dedicated window (no address bar)
- **Adaptive icons**: Icon generator (used once, deleted after generation)
- **HTTPS deployment**: Compatible with GitHub Pages, Netlify, Vercel, etc.
- **Complete documentation**: Installation and testing guide in `docs/PWA.md`

### 📎 File Attachments (V0.8)
- **File upload**: Attach files (images, PDFs, documents) to any node
- **IndexedDB storage**: ~500 MB limit depending on browser (vs localStorage limited to ~5-10 MB)
- **Inline display**: Images displayed directly with markdown syntax `![](attachment:ID)`
- **Download links**: Other files downloadable with `[name](attachment:ID)`
- **ZIP Export/Import**: Systematic ZIP format including files + JSON data
- **Complete management**: Upload, download, delete, copy syntax, garbage collection
- **Storage indicator**: Real-time progress bar in right panel
- **Supported types**: Images, PDFs, videos, audio, documents (50 MB max per file)
- **Documentation**: Complete spec in `docs/SPEC-ATTACHMENTS.md`

### 💾 IndexedDB Storage (V0.10)
- **Scalable storage**: Migration from localStorage to IndexedDB with Dexie.js
- **Increased capacity**: 500 MB - 1 GB storage (vs ~5-10 MB with localStorage)
- **Performance**: Better handling of large datasets and attachments
- **Automatic migration**: Seamless upgrade from V0.9 preserving all data
- **Backup support**: Original localStorage data preserved after migration

### 📦 .dm Archive Format (V0.10)
- **Standard export format**: `.dm` files (ZIP archives with custom extension)
- **Complete packaging**: Includes metadata.json, data.json, and attachments folder
- **Version tracking**: Export metadata with version, date, node count, generator info
- **Backward compatible**: Still supports .json and legacy ZIP formats
- **LLM-friendly**: .json interchange format still available for AI generation
- **Documentation**: Full spec in `docs/FILE-FORMATS.md`

### 📄 PDF Export (V0.10)
- **Document generation**: Export branches as formatted PDF documents
- **Symlink resolution**: Automatically includes linked content
- **Inline images**: Attachments converted to base64 for embedding
- **Table of contents**: Hierarchical TOC for navigation
- **Two implementations**:
  - **CloudFlare Worker**: Online generation with rate limiting (code ready, not yet deployed)
  - **CLI tool**: 100% offline with `bin/branch2pdf.js` (Node.js + Puppeteer)
- **Privacy-focused**: IP hashing (SHA-256) for online version
- **Documentation**: `cloudflare-worker/README.md`

### ⌨️ Keyboard Shortcuts
- `Alt+N`: New node (child if a node is selected, root otherwise)
- `Alt+E`: Switch to edit mode (with automatic focus)
- `Ctrl+K`: Global search
- `Escape`: Go up to parent
- `↑↓←→`: Navigation in the tree

## 🏗️ Current Architecture (V0.10 - Modular ES6)

### Format
- **Modular multifile**: HTML + CSS + ES6 modules JS
- `index.html`: Minimal HTML structure
- `src/css/`: Organized styles (base, layout, components, utilities, mobile)
- `src/js/app.js`: Main entry point
- `src/js/core/`: Data management (data, storage, migration, attachments, default-data)
- `src/js/features/`: Functional modules (tree, editor, search, tags, drag-drop, modals)
- `src/js/ui/`: UI components (toast, panels, mobile-tabs)
- `src/js/utils/`: Utilities (routing, keyboard, helpers, i18n, sync)
- **100% Vanilla** JavaScript ES6+ (no framework)
- CSS Variables for theming
- **IndexedDB with Dexie.js** for persistence (V0.10)

### Data Structure
```javascript
{
  nodes: {
    "node_xxx": {
      id: "node_xxx",
      type: "node",  // "node" (normal) or "symlink" (V0.8)
      title: "Title",
      content: "Markdown content",
      children: ["node_yyy", "node_zzz"],
      parent: "node_parent" | null,
      created: timestamp,
      modified: timestamp,
      links: ["Linked node title"],
      backlinks: ["node_pointing_here"],
      tags: ["tag1", "tag2"],
      attachments: ["attach_123_abc"],  // IndexedDB IDs (V0.8)
      targetId: "node_target"  // If type === "symlink" (V0.8)
    }
  },
  rootNodes: ["node_aaa", "node_bbb"]
}
```

## 🎨 Interface

- **Left sidebar**: Complete tree
- **Central zone**: Current node editor + children as cards
- **Right panel**: Metadata, links, backlinks, tag cloud
- **Dark theme** by default

## 🚀 Next Steps (V1.0)

### Features to Implement
- [ ] Navigation via clickable `[[title]]` links
- [ ] Nested list view (children = main content)
- [ ] External format Export/Import (Markdown, Notion, Obsidian)
- [ ] Customizable themes
- [ ] Multi-user permissions (chmod-style)
- [ ] Active node types (with scripts)

## 💡 Long-term Vision

To discover explored directions (active nodes, automation, decentralized collaboration), check the **"🔮 Explored Directions"** section in the app's demo content.

**Humble and open tone**: These ideas are exploratory tracks, not promises. DeepMemo is Open Source (MIT), contributions welcome!

## 🛠️ Development

### Local Server
```bash
cd DeepMemo
python3 -m http.server 8000
# Then open http://localhost:8000
```

### Technologies
- HTML5
- CSS3 (Variables, Flexbox, Grid)
- JavaScript ES6+ (Classes, Modules)
- IndexedDB with Dexie.js (V0.10)
- Service Worker (PWA)

## 👤 Author

**Fabien** - Passionate developer working on DeepMemo for 5 years (mental conception), now in active development.

## 📄 License

**MIT** - Free and open source software.

You can use, modify, and distribute DeepMemo freely. Your data belongs to you, stored locally in your browser.

---

**DeepMemo V0.10.4** - January 2026
