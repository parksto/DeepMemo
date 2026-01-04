# DeepMemo

> **Your digital second brain: interconnected notes, projects, and ideas**

*[Version française](README.fr.md) • [Documentation](docs/README.md) • [Live Demo](https://deepmemo.org)*

---

DeepMemo is a knowledge management system built on a **hierarchical network** of nodes. Each node can contain infinite child nodes, creating a tree-like structure enriched with symbolic links—mirroring how your brain naturally organizes information.

**Open Source Project** (MIT License) - Your data belongs to you, stored locally in your browser.

---

## 🧠 Why Hierarchical Structures?

**Trees and networks aren't just a design choice—they're hardwired into how we think.**

From the neurons in your brain to the syntax of language, from evolutionary trees to mind maps, **hierarchical and networked structures appear everywhere**. DeepMemo embraces this universal pattern to help you organize knowledge the way your mind already works.

→ Read more: [Why hierarchical structures are universal](docs/HIERARCHICAL_STRUCTURES.md)

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
- 📤 Export/Import (global or branch, ZIP format)
- 🌐 Shareable URLs (read-only, local data)
- 🔐 Data sovereignty (LocalStorage + IndexedDB)

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

**Long-term vision**: See [ROADMAP.md](docs/ROADMAP.md) for explored directions (active nodes, automation, decentralized collaboration).

---

## 📚 Documentation

**For users**:
- [Complete usage guide](docs/README.md)
- [PWA installation](docs/PWA.md)
- [Why hierarchical structures?](docs/HIERARCHICAL_STRUCTURES.md)

**For developers**:
- [Technical architecture](docs/ARCHITECTURE.md)
- [Development guide](docs/CONTRIBUTING.md)
- [History and roadmap](docs/ROADMAP.md)
- [Internationalization (i18n)](docs/I18N.md)

---

## 🔧 Tech Stack

**100% Vanilla**: HTML5, CSS3, JavaScript ES6+ (no framework)

**Storage**:
- LocalStorage (structured data)
- IndexedDB (file attachments)

**Architecture**: ES6 modules, multifile structure

**Compatible**: Chrome, Firefox, Safari, Edge (latest versions)

---

## 📝 Current Version

**V0.10.0** (January 2026) - Major storage upgrade

Latest additions: **IndexedDB migration** (500MB-1GB capacity, up from 5-10MB), **real-time multi-tab synchronization** with BroadcastChannel API, automatic data migration, complete i18n coverage.

Implemented features: infinite hierarchy, renameable symlinks, intelligent tags, real-time search, branch mode, drag & drop, branch export/import, attachments, installable PWA, **scalable IndexedDB storage**, **multi-tab sync**.

[→ See ROADMAP.md for complete history](docs/ROADMAP.md)

---

## 🤝 Contributing

We welcome contributions! Whether it's:
- 🐛 Bug reports
- 💡 Feature suggestions
- 🌍 Translations (new languages)
- 📝 Documentation improvements
- 💻 Code contributions

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

---

## 👤 Author

Developed by **Fabien** ([parksto](https://github.com/parksto))

*Conceptualized for 5 years, active development since 2024*

---

## 🌟 Star History

If you find DeepMemo useful, consider giving it a ⭐ on GitHub!

---

**DeepMemo** - Your second brain, organized and connected 🧠

*Working with your mind, not against it.*
