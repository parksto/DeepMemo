# Contributing to DeepMemo

> **Version** : V0.10.5
> **Dernière mise à jour** : 2026-02-03
> **Sources vérifiées** : Toutes les conventions référencent le code source

---

## Table des Matières

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Code Style Guide](#code-style-guide)
4. [Naming Conventions](#naming-conventions)
5. [Documentation Standards](#documentation-standards)
6. [Module Pattern](#module-pattern)
7. [Error Handling](#error-handling)
8. [CSS Guidelines](#css-guidelines)
9. [Git Workflow](#git-workflow)
10. [Testing](#testing)
11. [Development Best Practices](#development-best-practices)
12. [Code Review Checklist](#code-review-checklist)
13. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

**Required**:
- Modern web browser (Chrome/Edge recommended for File System Access API)
- Python 3.x (for local HTTP server)
- Git
- Text editor with JavaScript support

**Recommended**:
- VS Code with ESLint/Prettier extensions
- DevTools experience (Console, Network, Application tabs)

### Clone & Setup

```bash
# Clone repository
git clone https://github.com/parksto/DeepMemo.git
cd DeepMemo

# No npm install required (dependencies via CDN)
```

### Local Development Server

**ES6 modules require HTTP server** (file:// won't work due to CORS).

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Open browser
http://localhost:8000
```

📍 **Référence** : Documentation interne du projet

### Service Worker Management

En développement, **désactiver le cache du Service Worker** :

1. Ouvrir DevTools → **Application** tab
2. **Service Workers** section
3. Cocher **"Bypass for network"**
4. Recharger la page (Ctrl+R)

📍 **Référence** : `sw.js:1-142`

---

## Project Structure

### Overview

```
DeepMemo/
├── src/
│   ├── js/                    # JavaScript modules (12,687 lignes)
│   │   ├── app.js             # Point d'entrée (1,628L)
│   │   ├── core/              # Logique métier (6,233L)
│   │   │   ├── data.js        # État + persistence
│   │   │   ├── storage.js     # IndexedDB wrapper
│   │   │   ├── validation.js  # JSON Schema validation
│   │   │   ├── attachments.js # Fichiers blobs
│   │   │   ├── migration.js   # localStorage → IndexedDB
│   │   │   └── default-data.js# Contenu démo
│   │   ├── features/          # Fonctionnalités (4,840L)
│   │   │   ├── editor.js      # Édition nœuds (1,049L)
│   │   │   ├── tree.js        # Arborescence
│   │   │   ├── search.js      # Recherche globale
│   │   │   ├── tags.js        # Gestion tags
│   │   │   ├── modals.js      # Modales UI
│   │   │   ├── drag-drop.js   # Drag & Drop
│   │   │   ├── fs-sync.js     # File System Sync
│   │   │   └── preview.js     # Live preview
│   │   ├── ui/                # Composants UI (160L)
│   │   │   ├── panels.js      # Resize sidebar
│   │   │   └── toast.js       # Notifications
│   │   ├── utils/             # Utilitaires (683L)
│   │   │   ├── helpers.js     # Fonctions utilitaires
│   │   │   ├── i18n.js        # Internationalisation
│   │   │   ├── keyboard.js    # Raccourcis clavier
│   │   │   ├── routing.js     # Navigation URL
│   │   │   ├── sync.js        # Multi-tab sync
│   │   │   └── frontmatter.js # YAML parsing
│   │   └── locales/           # Traductions (869L)
│   │       ├── en.js          # English (432L)
│   │       └── fr.js          # Français (437L)
│   └── css/                   # Styles (1,896 lignes)
│       ├── style.css          # Aggregator
│       ├── base.css           # Reset + variables
│       ├── layout.css         # Structure
│       ├── components.css     # Composants UI
│       └── utilities.css      # Classes utilitaires
├── docs/                      # Documentation (~20,000L)
│   ├── 1-CONCEPTS.md          # Fondamentaux
│   ├── 2-ARCHITECTURE.md      # Stack technique
│   ├── 3-DATA-MODEL.md        # Structure données
│   ├── 4-FEATURES.md          # Fonctionnalités
│   ├── guides/                # Guides utilisateur
│   ├── reference/             # Référence technique
│   └── development/           # Dev guides
├── tests/                     # Tests validation
│   └── validation/            # Fixtures JSON
├── index.html                 # SPA (473 lignes)
├── sw.js                      # Service Worker (142 lignes)
├── manifest.json              # PWA manifest
├── README.md                  # Documentation utilisateur
└── LICENSE                    # MIT License
```

### File Organization Rules

**JavaScript** :
- **`core/`** : Logique métier fondamentale (data, storage, migration)
- **`features/`** : Fonctionnalités utilisateur (editor, search, tags)
- **`ui/`** : Composants UI réutilisables (panels, toasts)
- **`utils/`** : Utilitaires génériques (helpers, i18n, routing)

**CSS** :
- **`base.css`** : Reset, variables CSS, typographie
- **`layout.css`** : Structure layout (sidebar, main, panels)
- **`components.css`** : Composants UI (buttons, modals, tree)
- **`utilities.css`** : Classes utilitaires (marges, padding)

---

## Code Style Guide

### Indentation

✅ **Standard** : **2 espaces** (pas de tabs)

```javascript
// ✅ Correct
if (Object.keys(nodes).length > 0) {
  data.nodes = nodes;
  data.rootNodes = rootNodes;
  console.log(`[Data] Loaded ${Object.keys(nodes).length} nodes`);
} else {
  console.log('📘 Bienvenue dans DeepMemo !');
}
```

📍 **Référence** : `src/js/core/data.js:130-137`, `src/js/features/drag-drop.js:100-150`

### Quotes

✅ **Standards** :
- **Single quotes** pour strings simples : `'string'`
- **Backticks** pour template literals : `` `template ${var}` ``

```javascript
// ✅ Correct
import { generateId } from './utils/helpers.js';
const message = 'Node created successfully';
console.log(`[Data] Loaded ${count} nodes from IndexedDB`);

// ❌ Incorrect
import { generateId } from "./utils/helpers.js";
const message = "Node created successfully";
```

📍 **Référence** : `src/js/app.js:1-23`, `src/js/core/data.js:40-46`

### Semicolons

✅ **Standard** : **Toujours utiliser** les semicolons

```javascript
// ✅ Correct
export function generateId() {
  return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const data = { nodes: {}, rootNodes: [] };
```

📍 **Référence** : `src/js/utils/helpers.js:9-11`

### Line Length

✅ **Recommandation** : **~80-100 caractères** (limite souple)

- Lignes plus longues acceptées pour URLs, templates complexes (~120 chars max)
- Découper les expressions très longues

```javascript
// ✅ Acceptable
const EXPORT_FORMAT_DOC_URL = 'https://deepmemo.org/docs/reference/file-formats/';

// ✅ Découpage recommandé si >120 chars
const message =
  `Import validation failed with ${errors.length} error(s). ` +
  `Please check the console for details.`;
```

### Trailing Commas

✅ **Standard** : **Utiliser** trailing commas dans objets/arrays multilignes

```javascript
// ✅ Correct
const options = {
  maxLength: 50,
  preserveSpaces: false,
  allowDots: false,  // <-- trailing comma
};

const items = [
  'item1',
  'item2',
  'item3',  // <-- trailing comma
];
```

📍 **Référence** : `src/js/features/editor.js:72-77`

### Bracket Spacing

✅ **Standard** : **Espaces** autour des accolades

```javascript
// ✅ Correct
const { errors, warnings } = validation;
const { ctrl, alt } = dragModifiers;
import { generateId, escapeHtml } from './utils/helpers.js';

// ❌ Incorrect
const {errors, warnings} = validation;
import {generateId} from './utils/helpers.js';
```

📍 **Référence** : `src/js/core/validation.js:36`, `src/js/features/drag-drop.js:125`

### Arrow Functions vs Function Declarations

✅ **Guidelines** :

**Arrow functions** pour :
- Callbacks
- Array methods (map, filter, forEach)
- Event handlers courts

```javascript
// ✅ Callbacks
Object.values(nodes).forEach(node => {
  if (node.type === 'note') {
    node.type = 'node';
  }
});

// ✅ Array methods
const results = nodes.filter(n => n.tags.includes('important'));
```

**Function declarations** pour :
- Fonctions exportées
- Fonctions privées principales
- Fonctions nommées (debugging)

```javascript
// ✅ Exports
export function generateId() {
  return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ✅ Fonctions nommées
async function processAttachmentUrls(html, node) {
  // ...
}
```

📍 **Référence** : `src/js/core/data.js:66-71`, `src/js/utils/helpers.js:9-11`

---

## Naming Conventions

### Files

✅ **Convention** : **kebab-case** pour tous les fichiers

```
✅ Correct :
  drag-drop.js
  fs-sync.js
  default-data.js
  base.css

❌ Incorrect :
  dragDrop.js
  PDFExport.js
  fs_sync.js
```

📍 **Référence** : Tous les fichiers dans `/src`

### Functions & Methods

✅ **Convention** : **camelCase** pour toutes les fonctions

```javascript
// ✅ Correct
export function generateId() { }
export function escapeHtml(text) { }
function cleanupBlobUrls() { }
async function processAttachmentUrls(html, node) { }

// ❌ Incorrect
export function GenerateId() { }
export function escape_html(text) { }
```

📍 **Référence** : `src/js/utils/helpers.js`, `src/js/features/editor.js`

### Constants

✅ **Convention** : **UPPER_SNAKE_CASE** pour constantes non mutables

```javascript
// ✅ Correct
const EXPORT_FORMAT_DOC_URL = 'https://...';
const MAX_ERRORS = 50;
const STORAGE_KEY = 'deepmemo_lang';
const DEFAULT_LANG = 'en';
const SUPPORTED_LANGS = ['fr', 'en'];

// ❌ Incorrect
const exportFormatDocUrl = 'https://...';
const maxErrors = 50;
```

📍 **Référence** : `src/js/core/data.js:19`, `src/js/core/validation.js:6`, `src/js/utils/i18n.js:19-22`

### Variables

✅ **Convention** : **camelCase** pour variables

```javascript
// ✅ Correct
let currentInstanceKey = null;
let focusedInstanceKey = null;
let branchMode = false;
let branchRootId = null;
let expandedNodes = new Set();
let renderCallback = null;

// ❌ Incorrect
let CurrentInstanceKey = null;
let branch_mode = false;
```

📍 **Référence** : `src/js/features/tree.js:11-21`

### Business IDs

✅ **Convention** : Préfixes significatifs

- `node_` : IDs de nœuds réguliers → `node_1704067200123_a1b2c3d4e`
- `symlink_` : IDs de symlinks → `symlink_1704067200123_xyz789abc`
- `attach_` : IDs d'attachments → `attach_1704067200123_abc123def`

```javascript
// Génération d'ID
export function generateId() {
  return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
```

📍 **Référence** : `src/js/utils/helpers.js:9-11`, `src/js/features/editor.js:61`

---

## Documentation Standards

### JSDoc Requirements

✅ **Obligatoire** pour toutes les fonctions exportées

#### Format Standard

```javascript
/**
 * Generate a unique ID for nodes
 * @returns {string} Unique node ID
 */
export function generateId() {
  return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
```

📍 **Référence** : `src/js/utils/helpers.js:5-11`

#### With Parameters

```javascript
/**
 * Escape HTML characters to prevent injection
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

📍 **Référence** : `src/js/utils/helpers.js:13-22`

#### Complex Parameters with Options

```javascript
/**
 * Sanitize a string for use as a filename
 * @param {string} text - Text to sanitize
 * @param {Object|number} options - Options object or maxLength
 * @param {number} options.maxLength - Maximum length (default: 50)
 * @param {boolean} options.preserveSpaces - Keep spaces (default: false)
 * @param {boolean} options.allowDots - Allow leading dots (default: false)
 * @returns {string} Sanitized filename-safe string
 * @example
 * sanitizeFilename("🚀  Mon Projet - 2024  !")
 * // Returns: "Mon-Projet-2024"
 */
export function sanitizeFilename(text, options = {}) {
  // Implementation...
}
```

📍 **Référence** : `src/js/utils/helpers.js:50-126`

#### Async Functions

```javascript
/**
 * Process attachment: URLs in rendered HTML
 * Replaces attachment:ID with blob URLs from IndexedDB
 * @param {string} html - Rendered HTML content
 * @param {Object} node - Current node (to get attachment metadata)
 * @returns {Promise<string>} - HTML with blob URLs
 */
async function processAttachmentUrls(html, node) {
  // Implementation...
}
```

📍 **Référence** : `src/js/features/editor.js:41-46`

### Inline Comments

✅ **Guidelines** : Expliquer le **WHY**, pas le **WHAT**

```javascript
// ✅ Good - Explains WHY
// Clear previous timeout to ensure full display duration
if (toastTimeout) {
  clearTimeout(toastTimeout);
}

// Skip nodes outside branch scope
if (!isNodeInBranch(node.id)) {
  return;
}

// ❌ Bad - Obvious WHAT
// Set timeout
if (toastTimeout) {
  clearTimeout(toastTimeout);
}
```

📍 **Référence** : `src/js/ui/toast.js:18-20`, `src/js/features/search.js:70-74`

### Block Comments

Pour logique complexe, utiliser commentaires multi-lignes :

```javascript
// If user has a higher version from old code/tests, gracefully handle it
// Dexie will automatically use the highest compatible version
try {
  await db.open();
  console.log(`[Storage] IndexedDB opened successfully`);
} catch (error) {
  console.error('[Storage] Failed to open IndexedDB:', error);
}
```

📍 **Référence** : `src/js/core/storage.js:37-39`

### TODO/FIXME

⚠️ **Usage limité** : Seulement pour work-in-progress temporaire

```javascript
// TODO: Implement Phase 2 bidirectional sync
// FIXME: Handle edge case when target node is deleted
```

Préférer créer une **issue GitHub** pour vraies tâches futures.

---

## Module Pattern

### ES6 Modules

✅ **Standard** : ES6 import/export **exclusivement**

```javascript
// ✅ Correct - Named imports
import { generateId, escapeHtml, downloadBlob, sanitizeFilename } from './utils/helpers.js';
import { setupKeyboardShortcuts } from './utils/keyboard.js';
import { showToast } from './ui/toast.js';

// ✅ Correct - Namespace imports
import * as RoutingModule from './utils/routing.js';
import * as DataModule from './core/data.js';
import * as Storage from './core/storage.js';

// ❌ Incorrect - CommonJS
const helpers = require('./utils/helpers.js');
module.exports = { generateId };
```

📍 **Référence** : `src/js/app.js:1-23`

### Named Exports

✅ **Préférer** named exports pour utilitaires

```javascript
// helpers.js
export function generateId() { }
export function escapeHtml(text) { }
export function highlightText(text, query) { }
export function downloadBlob(blob, filename) { }
export function sanitizeFilename(text, options = {}) { }
```

📍 **Référence** : `src/js/utils/helpers.js:9-126`

### Namespace Exports

✅ **Utiliser** pour modules avec état ou nombreuses fonctions

```javascript
// app.js
import * as DataModule from './core/data.js';
import * as TreeModule from './features/tree.js';

// Usage
await DataModule.loadData();
TreeModule.renderTree(container);
```

📍 **Référence** : `src/js/app.js:9-18`

### Export d'État Global

✅ **Pattern** pour objets d'état partagés

```javascript
// data.js
export const data = {
  nodes: {},
  rootNodes: []
};

export async function loadData() {
  // Modifies exported `data` object
}
```

📍 **Référence** : `src/js/core/data.js:81-84`

### Default Exports

✅ **Utiliser** pour dictionnaires i18n uniquement

```javascript
// locales/fr.js
export default {
  'meta.title': 'DeepMemo - Notes Hiérarchiques',
  'toast.saved': 'Sauvegardé',
  // ...
};
```

📍 **Référence** : `src/js/locales/en.js`, `src/js/locales/fr.js`

---

## Error Handling

### Try-Catch for Async Operations

✅ **Obligatoire** pour toutes les opérations async

```javascript
// ✅ Correct - Try-catch with user notification
try {
  await DataModule.loadData();
  console.log('[App] Data loaded from IndexedDB');
} catch (error) {
  console.error('[App] Failed to load data:', error);
  showToast(t('toast.dataLoadError') || 'Failed to load data', 'error');
}
```

📍 **Référence** : `src/js/app.js:47-53`

### Fallback Patterns

✅ **Prévoir** fallbacks pour opérations critiques

```javascript
// ✅ Correct - IndexedDB with localStorage fallback
try {
  await Storage.saveNodes(data.nodes);
  await Storage.saveSetting('rootNodes', data.rootNodes);
  notifyDataChanged();
} catch (error) {
  console.error('[Data] Failed to save to IndexedDB:', error);
  // Fallback to localStorage
  localStorage.setItem('deepmemo_data', JSON.stringify(data));
}
```

📍 **Référence** : `src/js/core/data.js:91-103`

### Console Logging

✅ **Standard** : Logging structuré avec préfixe module

**Levels** :
- `console.log()` : Informations générales
- `console.warn()` : Avertissements non-bloquants
- `console.error()` : Erreurs bloquantes

**Format** : `[ModuleName] Message`

```javascript
// ✅ Correct
console.log('[Data] Loaded 42 nodes from IndexedDB');
console.warn('[App] IndexedDB not available (private mode?)');
console.error('[App] Failed to load data:', error);
console.log(`[Import] Normalized ${count} legacy nodes`);

// ❌ Incorrect - No context
console.log('Loaded nodes');
console.error(error);
```

📍 **Référence** : `src/js/core/data.js:49-55`, `src/js/app.js:40-56`

### User Notifications

✅ **Utiliser** toasts pour feedback utilisateur

```javascript
// Success
showToast(t('toast.saved') || 'Saved successfully', 'success');

// Error
showToast(t('toast.dataLoadError') || 'Failed to load data', 'error');

// Info
showToast(t('toast.copied') || 'URL copied to clipboard', 'info');
```

📍 **Référence** : `src/js/ui/toast.js:13-28`

### Validation Errors

✅ **Pattern** pour erreurs de validation détaillées

```javascript
function showValidationErrors(validation) {
  const { errors, warnings } = validation;

  if (errors.length > 0) {
    const summary =
      `❌ Import validation failed\n\n` +
      `Found ${errors.length} error(s):\n\n` +
      errors.slice(0, 3).map((e, i) => `${i + 1}. ${e}`).join('\n') +
      (errors.length > 3 ? `\n\n... and ${errors.length - 3} more` : '');

    alert(summary);
    console.error('[Import] Validation errors:', errors);
  }

  if (warnings.length > 0) {
    console.warn('[Import] Validation warnings:', warnings);
  }
}
```

📍 **Référence** : `src/js/core/data.js:36-56`

---

## CSS Guidelines

### Architecture

✅ **Organisation** : Modularisation en 5 fichiers

```css
/* style.css - Aggregator (7 lignes) */
@import 'base.css';
@import 'layout.css';
@import 'components.css';
@import 'utilities.css';
```

📍 **Référence** : `src/css/style.css:1-7`

### CSS Variables

✅ **Utiliser** variables CSS pour couleurs et espacements

```css
/* base.css */
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #2a2a2a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --accent: #0a376c;
  --accent-hover: #1155aa;
  --accent-text: #4a9eff;
  --border: #333;
  --success: #4ade80;
  --danger: #ef4444;
}

/* Usage */
.sidebar {
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
}
```

📍 **Référence** : `src/css/base.css:26-38`

### Naming Convention

✅ **Style** : BEM-inspired avec classes descriptives

```css
/* ✅ BEM-style classes */
.sidebar { }
.sidebar.hidden { }
.sidebar-header { }
.sidebar-actions { }

/* ✅ Component classes */
.btn { }
.btn:hover { }
.btn-secondary { }
.btn-small { }
.btn-danger { }

/* ✅ Utility classes (minimal) */
.hidden { }
.text-center { }
```

📍 **Référence** : `src/css/layout.css:4-80`, `src/css/components.css:1-85`

### Indentation & Formatting

✅ **Standard** : 2 espaces, cohérent avec JavaScript

```css
/* ✅ Correct */
.app-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 280px;
  min-width: 265px;
  max-width: 600px;
  background: var(--bg-secondary);
}

/* ❌ Incorrect */
.app-container{
    display:flex;
    height:100vh;
}
```

📍 **Référence** : `src/css/layout.css:4-19`

---

## Git Workflow

### Branching Strategy

✅ **Actuel** : Single `master` branch

Pour contributions futures, prévoir :
- `feature/nom-feature` : Nouvelles fonctionnalités
- `fix/nom-bug` : Corrections de bugs
- `docs/nom-doc` : Améliorations documentation

### Commit Messages

✅ **Format** : Verbe d'action + description concise

**Verbes préférés** :
- **Ajouter** : Nouvelles fonctionnalités/fichiers
- **Corriger** : Bug fixes
- **Mettre à jour** : Modifications existantes
- **Supprimer** : Suppression code/fichiers
- **Refactoriser** : Restructuration sans changement fonctionnel
- **Documenter** : Ajouts/modifications documentation

**Exemples réels** :
```
✅ Compléter Phase 4 : spécifications formats + fact-check validation.md
✅ Corriger validateMetadata() pour correspondre au format actuel (v1.0)
✅ Ajouter validation JSON Schema pour les imports avec support legacy
✅ Mettre à jour le plan de documentation - Phase 3 TERMINÉE (100%)
```

📍 **Référence** : `git log --oneline -10`

**Guidelines** :
- Longueur : 50-80 caractères
- Français (ou anglais pour concepts techniques)
- Présent de l'impératif
- Décrire QUOI et POURQUOI, pas COMMENT
- Référencer fichiers/modules si pertinent

### .gitignore

✅ **Fichiers ignorés** :

```gitignore
# Dependencies
node_modules/
npm-debug.log*

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
.DS_Store

# Build outputs
dist/
build/
*.log

# Claude Code
.claude/
```

📍 **Référence** : `.gitignore`

### Pull Request Process

**Checklist avant PR** :
1. ✅ Code suit style guide (indentation, quotes, naming)
2. ✅ JSDoc complet pour fonctions exportées
3. ✅ Tests manuels effectués
4. ✅ Documentation mise à jour si nécessaire
5. ✅ Console.log avec préfixes `[Module]`
6. ✅ Error handling avec try-catch
7. ✅ Commit messages descriptifs

---

## Testing

### Manual Testing

✅ **Procédure** avant commit :

1. **Lancer serveur local** : `python -m http.server 8000`
2. **Ouvrir navigateur** : Chrome/Edge DevTools ouvert
3. **Tester fonctionnalité** : Scénarios utilisateur complets
4. **Vérifier console** : Pas d'erreurs JavaScript
5. **Tester multi-tab** : Ouvrir 2+ onglets (BroadcastChannel sync)
6. **Tester offline** : Service Worker (mode offline DevTools)
7. **Tester responsive** : Desktop + mobile viewport

### Validation Test Files

✅ **Structure** : Fixtures JSON dans `/tests/validation/`

**Valid test files** :
- `test-valid-minimal.json` : Export minimal valide
- `test-valid-branch.json` : Export branche valide
- `test-valid-legacy-note.json` : Support type "note" legacy

**Invalid test files** :
- `test-invalid-missing-id.json` : Nœud sans ID
- `test-invalid-broken-ref.json` : Références cassées (parent/targetId)
- `test-invalid-cycle.json` : Cycle détecté
- `test-invalid-symlink-no-target.json` : Symlink sans targetId

📍 **Référence** : `tests/validation/README.md`

### Test HTML Page

```
tests/validation/test-validation.html
```

✅ **Usage** :
1. Ouvrir dans navigateur (via serveur HTTP)
2. Charger fixture JSON
3. Valider contre schémas
4. Voir résultats détaillés (errors/warnings)

### No Automated Test Framework

⚠️ **État actuel** : Pas de Jest/Vitest/Mocha

**Contribution future bienvenue** : Ajouter framework de tests automatisés

---

## Development Best Practices

### Before You Start

1. **Read documentation** :
   - `docs/1-CONCEPTS.md` : Comprendre fondamentaux (nodes, symlinks, instance keys)
   - `docs/2-ARCHITECTURE.md` : Stack technique et modules
   - `docs/3-DATA-MODEL.md` : Structure de données
   - `docs/4-FEATURES.md` : Fonctionnalités existantes

2. **Explore code** :
   - Lire module concerné AVANT modification
   - Comprendre patterns existants
   - Vérifier imports/exports

3. **Test locally** :
   - Tester toutes modifications immédiatement
   - Vérifier console pour erreurs

### When Writing Code

1. **Follow conventions** :
   - Indentation 2 espaces
   - Single quotes + backticks
   - camelCase fonctions, UPPER_SNAKE_CASE constantes
   - JSDoc pour exports

2. **Add context** :
   - Préfixes console : `[Module]`
   - Commentaires WHY, pas WHAT
   - Error messages descriptifs

3. **Handle errors** :
   - Try-catch pour async
   - Fallbacks si possible
   - User notifications (toasts)

4. **Maintain docs** :
   - Mettre à jour `docs/` si changements API
   - Ajouter références `fichier:ligne` dans docs
   - Fact-check affirmations

### When Committing

1. **Check quality** :
   - ✅ Pas d'erreurs console
   - ✅ Code formaté correctement
   - ✅ JSDoc complet
   - ✅ Tests manuels OK

2. **Write good commit** :
   - Message descriptif (50-80 chars)
   - Verbe d'action (Ajouter, Corriger, etc.)
   - Contexte clair

3. **Update docs** :
   - Documentation synchronisée avec code
   - Références exactes (lignes)

---

## Code Review Checklist

### Style Compliance

- [ ] Indentation 2 espaces (pas de tabs)
- [ ] Single quotes pour strings, backticks pour templates
- [ ] Semicolons présents
- [ ] Bracket spacing : `{ foo }` avec espaces
- [ ] Trailing commas dans objets multilignes
- [ ] Naming : kebab-case files, camelCase functions, UPPER_SNAKE_CASE constants

### Documentation

- [ ] JSDoc complet pour fonctions exportées
- [ ] Types explicites : `@param {string}`, `@returns {Promise<string>}`
- [ ] Commentaires inline expliquent WHY
- [ ] Exemples fournis si fonction complexe (`@example`)

### Error Handling

- [ ] Try-catch pour toutes opérations async
- [ ] Console logging avec préfixes `[Module]`
- [ ] User notifications via toasts (success/error/info)
- [ ] Fallbacks prévus pour opérations critiques

### Testing

- [ ] Tests manuels effectués (navigateur)
- [ ] Pas d'erreurs dans console
- [ ] Multi-tab sync testé (si modif data)
- [ ] Service Worker bypass activé en dev
- [ ] Responsive testé (desktop + mobile viewport)

### Git

- [ ] Commit message descriptif (verbe action + contexte)
- [ ] Longueur commit : 50-80 caractères
- [ ] Pas de fichiers ignorés (.env, .vscode, etc.)
- [ ] Branch appropriée (si multi-branch workflow)

### Documentation Updates

- [ ] `docs/` mis à jour si API change
- [ ] Références code exactes (`fichier:ligne`)
- [ ] Exemples vérifiables
- [ ] CHANGELOG.md mis à jour (si applicable)

---

## Troubleshooting

### Service Worker Cache Issues

**Symptôme** : Modifications non visibles après reload

**Solution** :
1. DevTools → **Application** → **Service Workers**
2. Cocher **"Bypass for network"**
3. Ou : **Unregister** Service Worker
4. Hard reload : `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (macOS)

📍 **Référence** : `sw.js:1-142`

### IndexedDB Not Available

**Symptôme** : `[App] IndexedDB not available` dans console

**Causes** :
- Navigation privée (Chrome Incognito, Firefox Private)
- IndexedDB désactivé dans paramètres navigateur
- Quota storage dépassé

**Solution** :
- Utiliser mode normal (non privé)
- Vérifier `chrome://settings/content/all` → IndexedDB
- Fallback localStorage automatique activé

📍 **Référence** : `src/js/app.js:47-57`, `src/js/core/migration.js`

### ES6 Modules CORS Error

**Symptôme** : `CORS policy: Cross origin requests are only supported for protocol schemes: http`

**Cause** : Fichier ouvert via `file://` au lieu de HTTP

**Solution** :
```bash
# Toujours utiliser serveur HTTP
python -m http.server 8000
# Ouvrir http://localhost:8000
```

📍 **Référence** : Documentation serveur HTTP local

### Cannot Find Module

**Symptôme** : `Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/plain"`

**Cause** : Serveur HTTP ne reconnaît pas `.js` comme JavaScript

**Solution** :
- Utiliser Python HTTP server (reconnaît .js)
- Ou configurer MIME types sur serveur custom

### BroadcastChannel Not Working

**Symptôme** : Multi-tab sync ne fonctionne pas

**Cause** :
- Navigateur ne supporte pas BroadcastChannel (Safari < 15.4)
- Tabs dans domaines différents (http vs https)

**Solution** :
- Utiliser Chrome/Edge/Firefox (support complet)
- Même protocole (http://localhost:8000 partout)

📍 **Référence** : `src/js/utils/sync.js:12-86`

### Attachment Display Issues

**Symptôme** : Images inline ne s'affichent pas

**Causes** :
- Blob URL révoquée prématurément
- Attachment manquant dans IndexedDB
- Mauvaise syntax markdown (`attachment:ID`)

**Solution** :
1. Vérifier syntax : `![alt](attachment:attach_123_abc)`
2. Console : Chercher `[Attachments]` errors
3. IndexedDB : DevTools → Application → IndexedDB → deepmemo → attachments

📍 **Référence** : `src/js/features/editor.js:48-105`, `src/js/core/attachments.js`

---

## Project Metadata

**Nom** : DeepMemo
**Version** : V0.10.5
**Auteur** : Fabien (parksto)
**Licence** : MIT
**Repository** : https://github.com/parksto/DeepMemo
**Production** : https://deepmemo.org/

**Stack** :
- HTML5, CSS3, JavaScript ES6+
- Dexie.js (IndexedDB wrapper)
- Marked.js (Markdown parser)
- JSZip (ZIP creation)
- PWA (Service Worker + Manifest)

---

## Resources

### Documentation

- **Concepts** : `docs/1-CONCEPTS.md`
- **Architecture** : `docs/2-ARCHITECTURE.md`
- **Data Model** : `docs/3-DATA-MODEL.md`
- **Features** : `docs/4-FEATURES.md`
- **Guides** : `docs/guides/`
- **Reference** : `docs/reference/`

### Development

- **Contributing** : `docs/development/CONTRIBUTING.md` (ce fichier)
- **Testing** : `tests/validation/README.md`

### Community

- **Issues** : https://github.com/parksto/DeepMemo/issues
- **Discussions** : https://github.com/parksto/DeepMemo/discussions

---

## Summary - Quick Reference

| Aspect | Convention | Example |
|--------|-----------|---------|
| **Files** | kebab-case | `drag-drop.js` |
| **Functions** | camelCase | `generateId()` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_ERRORS` |
| **Indentation** | 2 spaces | `  if (x) {` |
| **Quotes** | Single + backticks | `'text'`, `` `${var}` `` |
| **Semicolons** | Always | `const x = 1;` |
| **JSDoc** | Full blocks | `@param`, `@returns` |
| **Logging** | Context prefix | `[Module] Message` |
| **Errors** | Try-catch + toast | `showToast('Error', 'error')` |
| **CSS** | BEM-inspired | `.sidebar-header` |
| **Commits** | Action verb | "Ajouter validation" |

---

**Merci de contribuer à DeepMemo !** 🎉

Pour toute question, consultez la documentation dans `/docs` ou ouvrez une issue sur GitHub.
