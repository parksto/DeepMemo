# DeepMemo

> **Your digital second brain: interconnected notes, projects, and ideas**

*[Version française](README.md) • [Documentation](docs/README.en.md) • [Live Demo](https://deepmemo.org)*

---

DeepMemo is a knowledge management system built on a **hierarchical network** of nodes. Each node can contain infinite child nodes, creating a tree-like structure enriched with symbolic links—mirroring how your brain naturally organizes information.

**Open Source Project** (MIT License) - Your data belongs to you, stored locally in your browser.

---

## 🧠 Why Hierarchical Structures?

**Trees and networks aren't just a design choice—they're hardwired into how we think.**

From the neurons in your brain to the syntax of language, from evolutionary trees to mind maps, **hierarchical and networked structures appear everywhere**. DeepMemo embraces this universal pattern to help you organize knowledge the way your mind already works.

→ Read more: [Why hierarchical structures are universal](docs/1-CONCEPTS.md)

---

## 🎯 Why DeepMemo?

- **Natural hierarchy**: Organize your thoughts like you think them (projects → tasks → subtasks)
- **Symbolic links**: A node can appear in multiple places (without duplication)
- **Branch mode**: Focus on an isolated subtree while preserving context
- **Keyboard-first**: Full keyboard navigation, documented shortcuts
- **100% local**: No server, no tracking, data stays in your browser
- **Truly yours**: LocalStorage + IndexedDB, export anytime

---

## 🚀 Try DeepMemo

### Online (instant demo)

→ **[deepmemo.org](https://deepmemo.org)** - Ready to use with demo content

### Locally

```bash
# Clone the repo
git clone https://github.com/parksto/DeepMemo.git
cd DeepMemo

# Start a local HTTP server (required for ES6 modules)
python -m http.server 8000

# Open http://localhost:8000
```

**Installable as PWA**: Desktop icon, works offline.

---

## ✨ Key Features

**Organization**:
- 🌳 Infinite hierarchy of recursive nodes
- 🔗 Symbolic links (independently renameable)
- 🏷️ Tags with auto-completion and per-branch tag cloud
- 📎 File attachments (images, PDFs, etc.) stored locally

**Navigation**:
- 🔍 Real-time search (titles, content, tags)
- ⌨️ Keyboard shortcuts for everything
- 🌲 Branch mode (subtree isolation)
- 🔖 Bookmarkable URLs (`?branch=X#/node/Y`)

**Sharing & Collaboration**:
- 📤 Export/Import: .dm (archive), .json (LLM-friendly), Mind map file, Mind map image, PDF, filesystem (markdown content, hierarchical folders, attachments)
- 🔐 Data sovereignty (LocalStorage + IndexedDB)
- 📄 PDF generation (online with rate limiting or offline CLI)

**UX**:
- 🎨 Full Drag & Drop (move, duplicate, link)
- 📱 Progressive Web App (installable, offline)
- 📘 Educational demo content on first launch
- 🌍 Bilingual interface (French/English)
- 🎨 Clean interface, read/edit modes

---

## 🌍 Open Source

**MIT License** - Use, modify, distribute freely.

**Contributions welcome**:
- Bugs and suggestions: [GitHub Issues](https://github.com/parksto/DeepMemo/issues)
- Code: [Pull Requests](https://github.com/parksto/DeepMemo/pulls)
- Documentation: Always improvable!

---

## 📚 Documentation

**For users**:
- [Complete usage guide](docs/README.md)
- [Why hierarchical structures?](docs/1-CONCEPTS.md)

**For developers**:
- [Technical architecture](docs/2-ARCHITECTURE.md)
- [Development guide](docs/development/CONTRIBUTING.md)
- [History and roadmap](docs/development/ROADMAP.md)
- [Internationalization (i18n)](docs/guides/I18N.md)

---

## 🔧 Tech Stack

**100% Vanilla**: HTML5, CSS3, JavaScript ES6+ (no framework)

**Storage**:
- IndexedDB with Dexie.js (nodes, settings, attachments)
- LocalStorage (legacy, migration support)

**Architecture**: ES6 modules, multifile structure

**Compatible**: Chrome, Firefox, Safari, Edge (latest versions)

---

## 📝 Current Version

**V0.11.0** (February 2026) - Documentation refactoring and fixes

This version brings a complete documentation overhaul:
- Restructured and verified documentation (1-CONCEPTS, 2-ARCHITECTURE, 3-DATA-MODEL, 4-FEATURES)
- JSON schemas for import/export validation
- Bug fixes and vocabulary harmonization
- Validation tests added
- Complete French localization of documentation

Core features: infinite hierarchy, renameable symlinks, intelligent tags, real-time search, branch mode, drag & drop, multi-format export/import (.dm, .json, FreeMind, PDF), attachments with IndexedDB, file system sync (Phase 1), installable PWA, bilingual interface.

[→ See ROADMAP.md for complete history](docs/development/ROADMAP.md)

---

## 🤝 Contributing

We welcome contributions! Whether it's:
- 🐛 Bug reports
- 💡 Feature suggestions
- 🌍 Translations (new languages)
- 📝 Documentation improvements
- 💻 Code contributions

Please read [CONTRIBUTING.md](docs/development/CONTRIBUTING.md) for guidelines.

---

## 👤 Author

Developed by **Fabien** ([parksto](https://github.com/parksto))

*Conceptualized for 5 years, active development since 2024*


---

**DeepMemo** - Your second brain, organized and connected 🧠

*Working with your mind, not against it.*
