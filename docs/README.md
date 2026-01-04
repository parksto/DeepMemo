# 📖 DeepMemo - Complete Documentation

> **Concepts, architecture, and detailed features**

*[Version française](README.fr.md)*

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

### ⌨️ Keyboard Shortcuts
- `Alt+N`: New node (child if a node is selected, root otherwise)
- `Alt+E`: Switch to edit mode (with automatic focus)
- `Ctrl+K`: Global search
- `Escape`: Go up to parent
- `↑↓←→`: Navigation in the tree

## 🏗️ Current Architecture (V0.8 - Modular ES6)

### Format
- **Modular multifile**: HTML + CSS + ES6 modules JS
- `index.html`: Minimal HTML structure
- `src/css/`: Organized styles (base, layout, components, utilities)
- `src/js/app.js`: Main entry point
- `src/js/core/`: Data management (data, attachments, default-data)
- `src/js/features/`: Functional modules (tree, editor, search, tags, drag-drop, modals)
- `src/js/ui/`: UI components (toast, panels)
- `src/js/utils/`: Utilities (routing, keyboard, helpers, i18n)
- **100% Vanilla** JavaScript ES6+ (no framework)
- CSS Variables for theming
- LocalStorage + IndexedDB for persistence

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
- LocalStorage + IndexedDB

## 👤 Author

**Fabien** - Passionate developer working on DeepMemo for 5 years (mental conception), now in active development.

## 📄 License

**MIT** - Free and open source software.

You can use, modify, and distribute DeepMemo freely. Your data belongs to you, stored locally in your browser.

---

**DeepMemo V0.9.4** - January 2026
