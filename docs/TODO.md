# 📋 DeepMemo - Current Status and Next Steps

*[Version française](TODO.fr.md)*

**Last update**: January 1, 2026 (V0.9.4 - Polish & bug fixes)

---

## ✅ V0.8 - 100% COMPLETED

DeepMemo V0.8 is **complete and deployed** with all the following features:

### Main Features
- ✅ Smart tree with auto-collapse
- ✅ Renameable symbolic links (refactored system)
- ✅ Dynamic URLs (`?branch=X#/node/Y`)
- ✅ Isolated branch mode
- ✅ Tags with auto-completion
- ✅ Real-time search
- ✅ Complete drag & drop (Ctrl, Ctrl+Alt)
- ✅ Documented keyboard shortcuts
- ✅ Branch export/import (non-destructive)
- ✅ Educational demo content (26 nodes)
- ✅ Installable PWA (offline, desktop, mobile)
- ✅ File attachments (IndexedDB, ZIP export)

### UI/UX
- ✅ View mode by default
- ✅ Right panel hidden by default
- ✅ Scroll reset on navigation
- ✅ Font toggle (Sto vs system)
- ✅ Smart breadcrumb
- ✅ Storage indicator

### Documentation
- ✅ README.md (welcoming, MIT, Open Source)
- ✅ docs/README.md (complete features)
- ✅ docs/ROADMAP.md (V0.8 status, V0.9/V1.0 forecasts)
- ✅ docs/ARCHITECTURE.md (ES6 modules)
- ✅ docs/CONTRIBUTING.md (development guide)
- ✅ docs/PWA.md (usage guide)
- ✅ docs/SPEC-ATTACHMENTS.md (architecture reference)
- ✅ docs/VISION.md (long-term vision)
- ✅ CLAUDE.md (development context)

---

## 🎯 V0.9 - Internationalization (i18n) - ✅ COMPLETED

**Objective**: Make DeepMemo accessible to an international audience

**Context**: DeepMemo is already useful and deployed in production on deepmemo.org. Priority is to enable the widest possible audience to benefit from it before implementing new complex features.

### i18n System

**Features**:
- [x] Lightweight `i18n.js` module (no external dependencies)
- [x] FR/EN support minimum (ES optional)
- [x] Translation dictionaries (UI, messages, errors)
- [x] Browser language detection + manual selector
- [x] Persistence in `localStorage.deepmemo_language`
- [x] Dictionary precache in Service Worker (offline PWA)

### Content to Translate

**Interface**:
- [x] Static HTML labels (`index.html`)
- [x] Dynamic JS labels (buttons, modals, toasts)
- [x] Placeholders and attributes (`title`, `aria-label`)
- [x] Error messages and confirmations

**Demo Content**:
- [x] `default-data.js` - Complete FR and EN versions (26 educational nodes)
- [x] Automatic detection based on browser language

**Documentation**:
- [x] All public docs translated to English (README, PWA, etc.)
- [x] Bilingual documentation (EN primary, FR secondary)
- [x] Cross-language links in all doc files

### Tests and Validation

- [x] Tests on multilingual browsers
- [x] Fallback verification (unsupported language → EN)
- [x] User documentation (how to change language)

### Tag Improvements (Optional - after i18n)

- [ ] Avoid UI duplication (center panel vs right panel)
- [ ] Quick creation via #hashtag in content
- [ ] Global tag renaming
- [ ] Tag merging

### External Format Export/Import (Optional - after i18n)

- [ ] Markdown export (with preserved structure)
- [ ] Import from Notion
- [ ] Import from Obsidian

---

## 🐛 V0.9.1 - Bug Fixes & Quality Improvements - ✅ COMPLETED

**Date**: December 31, 2025
**Context**: Post-launch fixes following public announcement (449 unique sessions on Reddit)

### Critical Bug Fixes

**Symlinks**:
- [x] Fixed: Creating child from symlink now adds child to **target** instead of symlink itself
- [x] Fixed: Symlink title display - shows **symlink's own title** (not target's) in center panel
- [x] Added: Visual indicator in metadata showing link to original node (clickable)

**Data Persistence**:
- [x] Fixed: `Esc` (go to parent) now **saves current node** before navigation
- [x] Fixed: `Alt+E` (toggle view mode) now **saves before switching** (displays changes immediately)
- [x] Fixed: All navigation (tree clicks, arrows, breadcrumb) now **auto-saves** before switching nodes

**UI/i18n**:
- [x] Fixed: Empty content in children list showed `[labels.emptyContent]` → now displays translated text
- [x] Fixed: Action modal tree in branch mode showed **global tree** → now shows **branch tree only**

### New Features

**Orphan Nodes Cleanup**:
- [x] New function: `cleanOrphanNodes()` in `data.js`
- [x] Detects nodes not referenced anywhere (not in rootNodes, not in children, not in symlink targets)
- [x] UI button in right panel storage section
- [x] Confirmation + toast feedback
- [x] Full FR/EN translations

**Cross-Tab Synchronization**:
- [x] Implemented `storage` event listener
- [x] Real-time sync between tabs when localStorage changes
- [x] Smart reload: preserves current node if exists, goes to root if deleted
- [x] Toast notifications: "Data reloaded" / "Data reloaded - node deleted"
- [x] Perfect for workflow: branch in new tab → auto-sync to main tab

**Mobile Warning Banner**:
- [x] Mobile device detection (Android, iOS, iPad, etc.)
- [x] Non-intrusive orange banner at top
- [x] Professional message about work-in-progress mobile experience
- [x] Dismissible (×) with localStorage persistence (shows once)
- [x] Slide-down animation, responsive design
- [x] Full FR/EN translations

### Technical Improvements

**Code Quality**:
- [x] Service Worker version bumped to v1.4.0
- [x] All new features fully i18n-compliant
- [x] Consistent error handling and user feedback

**User Experience**:
- [x] No more lost edits on navigation
- [x] Clear feedback for all operations
- [x] Professional handling of mobile users
- [x] Seamless multi-tab workflow

---

## 📘 V0.9.2+ - Markdown Help Modal - ✅ COMPLETED

**Date**: December 31, 2025
**Context**: User experience improvement - make Markdown more accessible and clarify it's optional

### Markdown Help Modal

**New Feature**:
- [x] Markdown cheatsheet modal accessible via **Alt+H** keyboard shortcut
- [x] Complete guide with 9 sections: headings, formatting, lists, links, images, code, blockquotes, horizontal rules, tables
- [x] Fully responsive modal with scroll support
- [x] 100% translated (FR/EN) with i18n system
- [x] Offline-compatible (Service Worker precache)

**Demo Content Updated**:
- [x] Added section "✍️ Markdown: optional and accessible" in "📝 The central panel" node (FR + EN)
- [x] Clarifies that plain text is perfectly acceptable
- [x] Mentions Alt+H shortcut for help

**Keyboard Shortcuts**:
- [x] **Alt+H**: Open Markdown help modal (avoids browser history conflict with Ctrl+H)
- [x] Shortcut displayed in right panel keyboard shortcuts list
- [x] Consistent with other Alt-based shortcuts (Alt+N, Alt+E)

### Bug Fixes

**i18n Issues**:
- [x] Fixed: `result.replace is not a function` error in `generateMarkdownHelpContent()`
  - Root cause: `t('modals.markdown.examples')` returned object, not string
  - Solution: Call `t()` individually for each nested key
- [x] Fixed: Duplicate `meta:` sections in fr.js and en.js dictionaries
  - Root cause: Two `meta:` definitions, second overwrote first
  - Solution: Removed duplicates, kept complete definitions with all keys (ogTitle, keywords)

**Console Clean**:
- [x] All i18n warning messages eliminated
- [x] No more missing key errors
- [x] Production-ready clean console

### Technical Improvements

**Service Worker**:
- [x] Version bumped: v1.5.0 → v1.5.1
- [x] All modified files already in precache list

**Code Quality**:
- [x] Proper i18n key structure for nested objects
- [x] No dictionary duplicates
- [x] Clean modal architecture with reusable pattern

---

## 🗺️ V0.9.3 - Mindmap Export (FreeMind + Mermaid) - ✅ COMPLETED

**Date**: January 1, 2026
**Context**: Enable users to export and share their knowledge structure visually

### Export Modal with 3 Formats

**New Feature**:
- [x] Export choice modal replacing direct export buttons
- [x] 3 export formats available for both global and branch exports:
  - **📦 ZIP Archive**: Complete export with all data and attachments (existing)
  - **🧠 FreeMind Mindmap**: Editable .mm file for Freeplane/FreeMind/XMind
  - **📊 Mermaid SVG**: Visual diagram export

### FreeMind .mm Export

**Implementation**:
- [x] `exportFreeMindMM(branchRootId)` in data.js
- [x] Valid FreeMind XML generation (version 1.0.1)
- [x] Symlink support with visual distinction:
  - Orange color (`COLOR="#ff9900"`)
  - Bubble style (`STYLE="bubble"`)
  - Arrowlinks to target nodes (`<arrowlink DESTINATION="..."/>`)
- [x] Proper XML escaping (quotes, special characters)
- [x] Works with global export and branch export
- [x] Compatible with Freeplane, FreeMind, and XMind

### Mermaid SVG Export

**Implementation**:
- [x] Mermaid.js v10 loaded via CDN (ES module)
- [x] `exportMermaidSVG(branchRootId)` in data.js
- [x] Mindmap syntax generation from tree structure
- [x] Symlinks marked with 🔗 emoji
- [x] Character escaping for Mermaid parser:
  - Parentheses, brackets, braces removed/replaced
  - Multi-space collapsed
  - Newlines handled
- [x] SVG download with proper filename
- [x] Works offline (Mermaid.js precached by Service Worker)

### Bug Fixes

**Export Modal**:
- [x] Fixed: `exportType` reset bug - save type before closing modal
  - Root cause: `closeExportModal()` set `exportType = null` before using it
  - Solution: Store in local variable before closing

**Mermaid Parser**:
- [x] Fixed: Parse error with titles containing parentheses
  - Example: "Version (trop) optimiste" → parse error
  - Solution: Remove/replace special characters in `escapeMermaid()`

### Technical Improvements

**Service Worker**:
- [x] Mermaid.js CDN URL added to precache (offline support)
- [x] Version tracking for cache invalidation

**i18n**:
- [x] Complete translations for all 3 export formats (FR/EN)
- [x] Toast notifications: `freemindExported`, `mermaidExported`, etc.
- [x] Alert messages: `mermaidNotAvailable` if CDN fails

**Code Quality**:
- [x] Clean console output (debug logs removed)
- [x] Proper error handling for all export types
- [x] Reusable modal pattern for future features

### User Experience

**Benefits**:
- ✅ Visual representation of knowledge structure
- ✅ Edit exported mindmaps in dedicated tools (Freeplane)
- ✅ Share diagrams as images (SVG)
- ✅ Consistent UX with modal choice
- ✅ Works for both global and branch exports

---

## 🎨 V0.9.4 - Polish, Bug Fixes & UI Improvements - ✅ COMPLETED

**Date**: January 1, 2026
**Context**: Interface polish, bug fixes, and UX improvements after V0.9.3 mindmap export

### UI Improvements

**New Color Palette**:
- [x] Updated accent color to dark blue (#0a376c)
- [x] Hover state: #1155aa
- [x] Accent text: #4a9eff
- [x] More professional and consistent appearance

**Default Font**:
- [x] Changed default font from Sto to system font
- [x] User can still toggle to Sto via font selector
- [x] Better performance and native feel

### Bug Fixes

**Broken & External Symlinks**:
- [x] Special display for broken symlinks (target deleted)
  - Badge "(BROKEN LINK)" with warning icon ⚠️
  - Explanatory message in editor
  - Opacity 0.5, non-clickable in tree
- [x] Special display for external symlinks (in branch mode, target outside branch)
  - Badge "(EXTERNAL)" with icon 🔗🚫
  - Explanatory message in editor
  - Opacity 0.4, selectable for deletion
  - Toast warning on selection
- [x] Critical: Check broken BEFORE external (broken node is not external!)

**Data Protection**:
- [x] Fixed: `saveNode()` no longer saves when editor is disabled
  - Prevents error messages from being saved into node data
  - Critical bug: displaying broken/external link used to corrupt data!
  - Editor disabled for broken and external symlinks

**Branch Mode Export**:
- [x] Fixed: "Global" export in branch mode now exports only the active branch
- [x] More intuitive behavior matching user expectations

**Node Deletion**:
- [x] Improved post-deletion navigation
  - Goes to parent if exists
  - Goes to first sibling if no parent
  - Smart fallback to root

**Disabled Buttons**:
- [x] "New node" button disabled in branch mode (clearer UX)
- [x] "Confirm" button in modals disabled when no selection

### FreeMind Export Improvements

**Content Handling**:
- [x] Node content moved to richcontent NOTE (proper FreeMind format)
- [x] Emojis filtered from titles (compatibility with XMind/Freeplane)
- [x] Better structure for editing in mindmap tools

### Technical Improvements

**Code Quality**:
- [x] Consistent error handling across features
- [x] Cleaner separation of concerns
- [x] Better state management for edge cases

**User Experience**:
- [x] No more data corruption from special symlink types
- [x] Clear visual feedback for all node states
- [x] Professional color scheme
- [x] Improved export workflow

---

## 🔮 V1.0 - Active Types and Advanced System

### Active Node Types (Foundations)

**Objective**: Allow nodes to define their own behavior via scripts

**Features**:
- [ ] Basic `implements` system
- [ ] Property `implements: ["node_type_X"]` on nodes
- [ ] Simple scripts (`onSave`, `onRender`)
- [ ] Secure JavaScript sandbox
- [ ] Type descriptor nodes (see docs/VISION.md)
- [ ] Concrete examples in demo content

**References**:
- `docs/VISION.md` - Complete active types specification
- Demo content - "🔮 Explored Directions" section

---

## 💭 Backlog Ideas (V1.1+)

See `docs/ROADMAP.md` section "V1.0 - Complete System" and `docs/VISION.md` for:
- Multi-node triggers (external API, automation)
- Multiple views (card, list, kanban, calendar)
- Collaboration and sharing (multi-user, permissions)
- Voice interface (commands, dictation)

---

## 📊 Project Status

**Current version**: V0.9.4 (January 2026)
**Status**: ✅ Stable, documented, deployed in production
**Deployment**: ✅ **deepmemo.org** (IN PRODUCTION)
**License**: MIT (Open Source)

**Codebase**:
- ~11000 lines JS (modular ES6 architecture)
- ~1750 lines CSS (organized in 5 files)
- 18 modules JS (core, features, ui, utils, locales)
- 100% Vanilla JavaScript (no framework)

**Data**:
- LocalStorage (structured data, ~5-10 MB)
- IndexedDB (attached files, ~500 MB)
- Export format: ZIP (data.json + attachments/)

---

## 🔧 Maintenance

### Before Public Release

- [ ] Complete browser tests (Chrome, Firefox, Safari, Edge)
- [ ] Mobile tests (iOS Safari, Android Chrome)
- [ ] Accessibility verification (keyboard navigation, screen readers)
- [ ] Performance optimization (large trees >500 nodes)

### Remaining Documentation

- [x] Complete update of all docs/ (Dec 28, 2025)
- [ ] Detailed contribution guide (if needed)
- [ ] User FAQ (after beta feedback)

---

**Next session**: V1.0 preparation (Active node types - foundations)

**Historical reference**: For complete V0.8 development history, see Git commits and `CLAUDE.md`.
