# DeepMemo Documentation

**Complete technical documentation for developers and contributors**

*[Version française](README.md)*

---

Welcome to DeepMemo's documentation. This guide is organized like a technical book: start at the beginning if you're new, or jump to specific sections if you know what you're looking for.

---

## 📖 How to Read This Documentation

This documentation follows a **narrative structure**, progressing from fundamental concepts to advanced implementation details:

1. **Understanding DeepMemo** (Part 1) - Start here to learn what DeepMemo is and how it works
2. **Features** (Part 2) - Discover what you can do with DeepMemo
3. **Technical Reference** (Part 3) - Detailed specs for developers
4. **Contributing** (Part 4) - Join the development

**New to DeepMemo?** Read [1-CONCEPTS.md](1-CONCEPTS.md) first. It explains the core ideas that make everything else make sense.

**Looking for something specific?** Use the index below to jump directly to what you need.

---

## Part 1: Understanding DeepMemo

**Start here if you're new to DeepMemo or want to understand the design philosophy.**

### Core Concepts
📘 **[1-CONCEPTS.md](1-CONCEPTS.md)** - The fundamentals

Learn about:
- **Nodes**: The single base type that powers everything
- **Hierarchy**: How parent-child relationships create structure
- **Symlinks**: Transforming a tree into a reticular network
- **Instance Keys**: Tracking paths through the network
- **Branch Mode**: Isolated subtrees for focus and sharing
- **Tags**: Cross-cutting metadata

*Read this first. Everything else builds on these concepts.*

### Architecture
🏗️ **[2-ARCHITECTURE.md](2-ARCHITECTURE.md)** - Technical design

Discover:
- Modular ES6 architecture
- Module communication patterns
- Navigation system (URLs, routing, browser back/forward)
- Tree rendering (pliage vs activation, auto-collapse)
- State management approach

### Data Model
🗄️ **[3-DATA-MODEL.md](3-DATA-MODEL.md)** - Structure and storage

Understand:
- Node structure (complete JSON schema)
- Types: `node` vs `symlink`
- Relations: parent, children, targetId
- Metadata: timestamps, tags, attachments
- IndexedDB storage with Dexie.js

---

## Part 2: Features

**Discover what DeepMemo can do.**

### Features Overview
✨ **[4-FEATURES.md](4-FEATURES.md)** - Complete feature list

Quick reference of all features with links to detailed guides:
- Navigation (tree, branch mode, breadcrumb, URLs)
- Content (markdown, live preview, attachments, tags)
- Export/Import (.dm archives, FS Sync, PDF)
- Advanced (drag & drop, multi-tab sync, PWA, i18n)

### Thematic Guides

#### Export and Import
📦 **[guides/FILE-FORMATS.md](guides/FILE-FORMATS.md)** - Export/import formats
- `.dm` archives (ZIP with metadata + attachments)
- `.json` interchange format (LLM-friendly)
- FreeMind `.mm` export (read-only, see [MM-FORMAT.md](reference/file-formats/MM-FORMAT.md))
- Import workflows (global vs branch)

#### File System Sync
💾 **[guides/FS-SYNC.md](guides/FS-SYNC.md)** - Sync with local filesystem
- Phase 1 (✅ implemented): Export to local folder + import with ID regeneration
- Phase 2 (📋 planned): Bidirectional sync with change detection
- Phase 3 (🔮 future): Automatic watch mode with real-time sync
- File structure: `index.md`, `.dmlink`, frontmatter YAML
- Chrome/Edge only (File System Access API)
- Graceful import from external folders (Obsidian, Notion)

#### PDF Export
📄 **[guides/PDF-EXPORT.md](guides/PDF-EXPORT.md)** - Generate PDF documents
- Why it works naturally (hierarchy → document structure)
- Online version (CloudFlare Worker, not deployed)
- Offline CLI (`bin/branch2pdf.js`)
- Symlink resolution (scope-aware in branch mode)
- Image embedding (base64)

#### Attachments
📎 **[guides/ATTACHMENTS.md](guides/ATTACHMENTS.md)** - File attachment system
- Storage in IndexedDB
- Inline images (`![](attachment:ID)`)
- Upload/download/delete workflows
- Export/import with `.dm` archives
- Size limits and quotas

#### Internationalization
🌍 **[guides/I18N.md](guides/I18N.md)** - Multi-language support
- FR/EN with auto-detection
- Adding new translations
- Bilingual demo content
- PWA manifests per language

#### Progressive Web App
📱 **[guides/PWA.md](guides/PWA.md)** - Offline and installable
- Service Worker caching strategy
- Installation on desktop/mobile
- Offline mode
- Manifest configuration

---

## Part 3: Technical Reference

**Detailed specs for developers implementing features or debugging.**

### File Formats

#### .dm Archive Format
🗜️ **[reference/file-formats/DM-FORMAT.md](reference/file-formats/DM-FORMAT.md)** - ZIP structure specification
- Archive structure (metadata.json, data.json, attachments/)
- Version tracking and metadata
- Import auto-detection (magic number)
- ID generation and remapping (global vs branch)
- Compression and encoding

#### JSON Interchange Format
🔤 **[reference/file-formats/json-interchange.md](reference/file-formats/json-interchange.md)** - Portable JSON format
- Structure for LLM generation
- Minimal format (metadata only, no binary attachments)
- Global export vs branch export
- Import workflows (replace/merge, ID remapping)
- Use cases (backup, migration, Git versioning)

#### FreeMind Mind Map Format
🧠 **[reference/file-formats/MM-FORMAT.md](reference/file-formats/MM-FORMAT.md)** - XML export for mind mapping
- FreeMind/Freeplane/XMind compatible format
- XML structure (1.0.1 standard)
- Node conversion (titles, content as HTML notes)
- Symlink visualization (arrows and styling)
- Limitations (no tags, no attachments, no reimport)
- Use cases (external visualization, collaboration)

#### Schema Validation
✅ **[reference/file-formats/validation.md](reference/file-formats/validation.md)** - Format validation reference
- JSON Schema specifications (v1.0)
- Validation process (client-side with validation.js)
- Manual validation tools (ajv-cli, online validators)
- Common errors and solutions
- Schema migration strategy

### Storage API
💽 **[reference/storage-api.md](reference/storage-api.md)** - IndexedDB/Dexie operations
- CRUD operations
- Dexie.js API reference
- Debug console commands
- Stats and quotas

### Keyboard Shortcuts
⌨️ **[reference/keyboard-shortcuts.md](reference/keyboard-shortcuts.md)** - Complete shortcut list
- Navigation shortcuts
- Editing shortcuts
- Search shortcuts
- Context-specific shortcuts

---

## Part 4: Contributing

**Join the development of DeepMemo.**

### Contribution Guide
🤝 **[development/CONTRIBUTING.md](development/CONTRIBUTING.md)** - How to contribute
- Code style guidelines
- Pull request process
- Testing requirements
- Communication channels

### Roadmap
🗺️ **[development/ROADMAP.md](development/ROADMAP.md)** - Development plan
- Planned features
- Version milestones
- Long-term vision

### Debugging Guide
🔧 **[development/debugging.md](development/debugging.md)** - Troubleshooting
- Common bugs and solutions
- Console commands
- IndexedDB inspection
- Hard refresh and cache clearing

### Changelog
📅 **[CHANGELOG.md](CHANGELOG.md)** - Version history
- Release notes by version
- Breaking changes
- Bug fixes and improvements

---

## Additional Resources


### CloudFlare Worker
☁️ **[../cloudflare-worker/README.md](../cloudflare-worker/README.md)** - PDF generation worker
- Deployment guide
- API documentation
- Rate limiting details

☁️ **[../cloudflare-worker/PRIVACY-NOTICE.md](../cloudflare-worker/PRIVACY-NOTICE.md)** - Privacy policy
- IP hashing (SHA-256)
- Data handling
- User notice

---

## Philosophy

This documentation follows these principles:

1. **No suspense**: Every section starts by telling you what you'll learn
2. **No redundancy**: Each piece of information exists in one place
3. **Findable**: Clear hierarchy and cross-references
4. **Cognitive clarity**: Like DeepMemo's PDF export, structure follows naturally from content

**Inspired by**: The way DeepMemo's hierarchical structure naturally becomes a document structure in PDF export. The documentation mirrors this cognitive clarity.

---

**DeepMemo V0.10.5** - Open Source (MIT License)

Built with: Vanilla JavaScript ES6+, IndexedDB (Dexie.js), Service Workers

Author: Fabien | Website: https://deepmemo.org/
