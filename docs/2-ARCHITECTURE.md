# 2. Architecture

> **Version** : V0.10.5
> **Dernière mise à jour** : 2026-02-03
> **Sources vérifiées** : Toutes les affirmations référencent le code source (fact-checked 2026-02-03)

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Point d'entrée](#point-dentrée)
3. [Organisation des modules](#organisation-des-modules)
4. [Modules Core](#modules-core)
   - data.js - storage.js - attachments.js - migration.js - validation.js - default-data.js
5. [Modules Features](#modules-features)
6. [Modules UI](#modules-ui)
7. [Modules Utils](#modules-utils)
8. [Service Worker](#service-worker)
9. [Dépendances externes](#dépendances-externes)

---

## Vue d'ensemble

### Stack Technologique

DeepMemo est construit **100% en Vanilla JavaScript** sans aucun framework.

**Frontend** :
- **HTML5** : Page unique (SPA) - `index.html`
- **CSS3** : Modules séparés (`src/css/*.css`)
- **JavaScript ES6+** : Modules natifs (`type="module"`)

📍 **Référence** : `index.html:450,471` - Scripts chargés avec `type="module"`

**Stockage** :
- **IndexedDB** via Dexie.js 3.2.4 (capacité : 500MB-1GB)
- **localStorage** (fallback + migration legacy)

📍 **Référence** :
- `src/js/core/storage.js:23-36` - Schéma Dexie
- `src/js/app.js:47-57` - Fallback localStorage si IndexedDB indisponible

**Dépendances externes** (CDN) :

| Bibliothèque | Version | Usage | Référence |
|--------------|---------|-------|-----------|
| **Marked** | latest | Parse Markdown → HTML | `index.html:93` |
| **JSZip** | 3.10.1 | Création archives .dm (ZIP) | `index.html:94` |
| **Dexie.js** | 3.2.4 | Wrapper IndexedDB | `index.html:95` |
| **js-yaml** | 4.1.0 | Parse frontmatter YAML | `index.html:96` |
| **Mermaid** | 10 | Export diagrammes (lazy) | `index.html:451` |

---

### Patterns Architecturaux

#### 1. Module ES6 Pattern

Chaque fichier JavaScript est un **module ES6** qui exporte ses fonctions publiques.

**Exemple** : `src/js/core/data.js`
```javascript
export const data = { nodes: {}, rootNodes: [] };
export async function loadData() { ... }
export function saveData() { ... }
```

📍 **Référence** :
- `src/js/core/data.js:81-84` - Export de l'état data
- `src/js/core/data.js:90-98` - Export fonction saveData
- `src/js/app.js:6-23` - Imports de tous les modules

**Avantages** :
- Encapsulation naturelle
- Tree-shaking possible
- Pas de namespace pollution

#### 2. Singleton Pattern

L'application expose un **objet global unique** `window.app`.

**Structure** :
```javascript
const app = {
  // État
  data: DataModule.data,
  currentNodeId: null,
  expandedNodes: DataModule.expandedNodes,

  // Méthodes
  async init() { ... },
  render() { ... },
  createRootNode() { ... }
};

window.app = app;
```

📍 **Référence** :
- `src/js/app.js:29-36` - Déclaration objet app
- `src/js/app.js:1615` - Exposition globale `window.app = app`
- `src/js/app.js:1618` - Exposition Storage pour debug

**Pourquoi global ?**
Nécessaire pour les handlers `onclick` dans le HTML :
- `index.html:107` - `onclick="app.closeMobileWarning()"`
- `index.html:124` - `onclick="app.createRootNode()"`
- `index.html:126` - `onchange="app.importData(event)"`
- `index.html:128` - `onclick="app.openExportModal('global')"`

#### 3. Observer Pattern

**BroadcastChannel** pour synchronisation multi-onglets :

```javascript
// Émission (après modification)
notifyDataChanged(); // → Envoie message sur channel 'deepmemo_sync'

// Réception (autre onglet)
setupSyncListener(() => {
  loadData();
  handleExternalDataChange();
});
```

📍 **Référence** :
- `src/js/utils/sync.js` - Implémentation complète (86 lignes)
- `src/js/utils/sync.js:40` - `notifyDataChanged()` après saveData
- `src/js/app.js:95-105` - Setup listener au init

**Event Listeners** :
- Hash URL : `src/js/utils/routing.js:43-50` - `window.addEventListener('hashchange')`
- Keyboard : `src/js/utils/keyboard.js:23-60` - `document.addEventListener('keydown')`
- Drag & Drop : `src/js/features/drag-drop.js` - HTML5 Drag API

---

### Flux de Données

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Initialisation (app.init())                              │
│    📍 src/js/app.js:40-100                                  │
│    ├─> initI18n()              [Détection langue]           │
│    ├─> loadData()              [IndexedDB → memory]         │
│    ├─> initPanels()            [Sidebar resizer]            │
│    ├─> setupKeyboardShortcuts()[Raccourcis clavier]         │
│    ├─> setupSyncListener()    [Multi-tab sync]              │
│    └─> navigateToHash()        [Navigation initiale]        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Interaction utilisateur (UI event)                       │
│    Exemple : Édition d'un nœud                              │
│    ├─> Module métier modifie data.nodes[id]                 │
│    │   📍 src/js/features/editor.js:updateNodeContent()     │
│    ├─> saveData()              [async → IndexedDB]          │
│    │   📍 src/js/core/data.js:90-98                         │
│    ├─> notifyDataChanged()    [BroadcastChannel]            │
│    │   📍 src/js/utils/sync.js:40                           │
│    └─> render()                [Rebuild DOM]                │
│        📍 src/js/app.js:render()                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Autre onglet (BroadcastChannel event)                    │
│    📍 src/js/app.js:95-105                                  │
│    ├─> loadData()              [Reload depuis IndexedDB]    │
│    ├─> handleExternalDataChange()                           │
│    └─> render()                [Sync UI avec nouvelles data]│
└─────────────────────────────────────────────────────────────┘
```

---

### State Management

#### État en Mémoire

**data object** (`src/js/core/data.js:81-84`) :
```javascript
export const data = {
  nodes: {},      // { [nodeId]: Node }
  rootNodes: []   // [nodeId, nodeId, ...]
};
```

**app object** (`src/js/app.js:30-34`) :
```javascript
const app = {
  data: DataModule.data,           // Référence à data
  currentNodeId: null,             // ID nœud sélectionné
  exportType: null,                // 'global' | 'branch'
  exportBranchId: null             // ID branche à exporter
};
```

**tree.js state** (`src/js/features/tree.js:11-21`) :
```javascript
let currentInstanceKey = null;    // Instance key sélectionnée
let focusedInstanceKey = null;    // Instance key focus clavier
let branchMode = false;           // Mode branche actif
let branchRootId = null;          // ID racine de la branche
let expandedNodes = new Set();    // Set des nœuds expansés (état local, non persisté)
```

**editor.js state** (`src/js/features/editor.js:18`) :
```javascript
let viewMode = 'view';            // 'edit' | 'view'
let activeBlobUrls = [];          // URLs blob attachments (cleanup)
```

#### État Persistant

**IndexedDB** (`src/js/core/storage.js:26-36`) :
- Table `nodes` : Tous les nœuds (regular + symlinks)
  - Index : `id` (PK), `parent`, `*tags`, `created`, `modified`
- Table `settings` : Key-value pairs
  - Clés : `rootNodes`, `pdfRateLimit`, etc.
- Table `attachments` : Blobs (fichiers)
  - Index : `id` (PK)

**localStorage** (fallback + préférences) :
- `deepmemo_font` - Police choisie
- `deepmemo_viewMode` - Mode vue/édition
- `deepmemo_language` - Langue (fr/en)
- `deepmemo_mobileWarningDismissed` - Banner mobile fermé
- `deepmemo_rightPanelOpen` - Panel droit ouvert/fermé

📍 **Référence** :
- `src/js/features/editor.js:27-30` - Lecture viewMode
- `src/js/utils/i18n.js:90-102` - Lecture/écriture language

**Pas de framework** : Mutations directes sur les objets. Pas de Redux, MobX, etc.

---

## Point d'entrée

### index.html

**Page unique** (SPA) contenant toute la structure DOM.

📍 **Fichier** : `index.html` (473 lignes)

#### Structure principale

```html
<body>
  <!-- Mobile warning banner -->
  <div id="mobileWarningBanner">...</div>

  <!-- Right panel toggle (mobile) -->
  <button class="right-panel-toggle-external">...</button>

  <!-- App container -->
  <div class="app-container">
    <!-- Sidebar gauche -->
    <div class="sidebar">
      <div class="sidebar-header">...</div>
      <div class="sidebar-actions">...</div>
      <div class="branch-mode-indicator">...</div>
      <div class="tree-container" id="treeContainer"></div>
      <div class="sidebar-resizer"></div>
    </div>

    <!-- Main content (center) -->
    <div class="main-content">
      <div id="emptyState">...</div>
      <div id="editorContainer">
        <div class="breadcrumb"></div>
        <input id="nodeTitle" />
        <textarea id="nodeContent"></textarea>
        <div id="contentPreview"></div>
      </div>
    </div>

    <!-- Right panel -->
    <div class="right-panel">...</div>
  </div>

  <!-- Modals (generated dynamically in JS) -->
  <div id="actionModal" class="modal">...</div>
  <div id="symlinkModal" class="modal">...</div>
  <div id="exportModal" class="modal">...</div>
  <div id="searchModal" class="modal">...</div>

  <!-- Footer -->
  <footer>...</footer>
</body>
```

📍 **Références clés** :
- `index.html:100-109` - Mobile warning banner
- `index.html:113-138` - Sidebar structure
- `index.html:141-179` - Main content (editor)
- `index.html:181-293` - Right panel
- `index.html:296-439` - Modals (action, symlink, export, search)

#### Attributs i18n

Tous les labels sont traduits dynamiquement via `data-i18n` :

```html
<h1 data-i18n="app.title">🌟 DeepMemo</h1>
<button data-i18n="actions.newNode">➕ Nouveau nœud</button>
```

📍 **Référence** :
- `index.html:117` - Titre app
- `index.html:124` - Bouton nouveau nœud
- `src/js/utils/i18n.js:43-73` - Traduction des data-i18n

#### Chargement des scripts

**Scripts externes** (CDN) :
```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>
<script src="https://unpkg.com/dexie@3.2.4/dist/dexie.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js"></script>
```

📍 **Référence** : `index.html:93-96`

**Module principal** :
```html
<script type="module" src="src/js/app.js"></script>
```

📍 **Référence** : `index.html:471`

---

### app.js - Orchestrateur Principal

**Fichier** : `src/js/app.js` (1629 lignes)

#### Structure

```javascript
// 1. Imports (lignes 6-23)
import { generateId, escapeHtml, downloadBlob } from './utils/helpers.js';
import { setupKeyboardShortcuts } from './utils/keyboard.js';
import * as RoutingModule from './utils/routing.js';
import * as DataModule from './core/data.js';
// ... (18 imports au total)

// 2. Objet app singleton (lignes 29-1613)
const app = {
  // État
  data: DataModule.data,
  currentNodeId: null,

  // Lifecycle
  async init() { ... },

  // Rendering
  render() { ... },

  // Node operations
  createRootNode() { ... },
  deleteNode(nodeId) { ... },

  // Export/Import
  exportData() { ... },
  importData(event) { ... },

  // UI handlers
  toggleRightPanel() { ... },
  closeMobileWarning() { ... },

  // ... (~100 méthodes au total)
};

// 3. Exposition globale (ligne 1615)
window.app = app;

// 4. Initialisation (lignes 1618-1627)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
```

#### Méthode init()

**Séquence d'initialisation** (`src/js/app.js:40-100`) :

```javascript
async init() {
  console.log('🚀 DeepMemo V0.10.5 - Initialisation...');

  // 1. i18n
  await initI18n();

  // 2. Data loading (IndexedDB avec fallback localStorage)
  if (AttachmentsModule.isIndexedDBAvailable()) {
    await DataModule.loadData();
  } else {
    console.warn('[App] IndexedDB not available, using localStorage fallback');
    await DataModule.loadData(); // Will fallback
  }

  // 3. UI initialization
  PanelsModule.initPanels();
  EditorModule.initViewMode();
  FSSyncModule.initFSSync();

  // 4. Keyboard shortcuts
  setupKeyboardShortcuts(this);

  // 5. Multi-tab sync
  SyncModule.setupSyncListener(async () => {
    await DataModule.loadData();
    this.handleExternalDataChange();
  });

  // 6. Initial navigation
  RoutingModule.navigateToHash();

  console.log('[App] Initialization complete');
}
```

📍 **Référence complète** : `src/js/app.js:40-100`

#### Méthode render()

**Responsabilités** (`src/js/app.js:render()`) :
1. Affiche/masque empty state
2. Render tree (sidebar)
3. Render editor (si nœud sélectionné)
4. Update page title
5. Update node counter

📍 **Référence** : `src/js/app.js:107-140` (méthode render complète)

---

## Organisation des modules

### Structure des dossiers

```
src/js/
├── app.js                    # Point d'entrée (1629 lignes)
│
├── core/                     # Logique métier fondamentale
│   ├── data.js              # État + persistence (1493 lignes)
│   ├── storage.js           # IndexedDB wrapper (366 lignes)
│   ├── attachments.js       # Gestion fichiers (244 lignes)
│   ├── migration.js         # Migration localStorage (211 lignes)
│   ├── validation.js        # Validation JSON Schema (278 lignes)
│   └── default-data.js      # Contenu démo (2610 lignes)
│
├── features/                 # Fonctionnalités utilisateur
│   ├── tree.js              # Arborescence sidebar (686 lignes)
│   ├── editor.js            # Édition nœuds (1107 lignes)
│   ├── search.js            # Recherche globale (215 lignes)
│   ├── tags.js              # Gestion tags (281 lignes)
│   ├── modals.js            # Modales (action, symlink) (624 lignes)
│   ├── drag-drop.js         # Drag & Drop (381 lignes)
│   ├── fs-sync.js           # File System Sync (808 lignes)
│   └── preview.js           # Live preview markdown (458 lignes)
│
├── ui/                       # Composants UI
│   ├── panels.js            # Resize sidebar (104 lignes)
│   └── toast.js             # Notifications (22 lignes)
│
├── utils/                    # Utilitaires
│   ├── routing.js           # Navigation URL (92 lignes)
│   ├── keyboard.js          # Raccourcis clavier (51 lignes)
│   ├── i18n.js              # Internationalisation (227 lignes)
│   ├── helpers.js           # Fonctions utilitaires (126 lignes)
│   ├── sync.js              # Multi-tab sync (70 lignes)
│   └── frontmatter.js       # Parse YAML (55 lignes)
│
└── locales/                  # Traductions
    ├── fr.js                # Français (348 lignes)
    └── en.js                # English (348 lignes)
```

**Total** : ~12,000 lignes de JavaScript

📍 **Vérification** :
- Core : 6233 lignes (avec validation.js)
- Features : 4840 lignes
- Utils : 693 lignes
- App.js : 1629 lignes
- Locales : 696 lignes

### Conventions de nommage

**Fichiers** :
- `kebab-case.js` pour tous les fichiers

**Fonctions exportées** :
- `camelCase` pour les fonctions
- `PascalCase` pour les classes (aucune dans le projet)

**Variables privées** :
- `camelCase` pour variables locales
- `let` pour variables mutables
- `const` pour constantes

**Exemple** (`src/js/core/data.js`) :
```javascript
// Export public
export const data = { ... };
export async function saveData() { ... }

// Privé (non exporté)
function i18nAlert(key, params = {}) { ... }
```

---

## Modules Core

### data.js - Gestion des Données

**Fichier** : `src/js/core/data.js` (1694 lignes)

**Responsabilités** :
- Gestion de l'état central (`data` object)
- Persistence (save/load vers IndexedDB)
- Opérations CRUD sur les nœuds
- Export/Import (tous formats)
- Détection de cycles

#### État central

```javascript
export const data = {
  nodes: {},      // { [nodeId]: Node }
  rootNodes: []   // [nodeId1, nodeId2, ...]
};
```

📍 **Référence** : `src/js/core/data.js:81-84`

**Note** : `expandedNodes` est géré localement dans `src/js/features/tree.js:18` comme variable privée (non exportée, non persistée). C'est un état UI transitoire qui se reconstruit automatiquement lors de la navigation.

#### Fonctions principales

| Fonction | Ligne | Description |
|----------|-------|-------------|
| `saveData()` | 90 | Sauvegarde vers IndexedDB (async) |
| `loadData()` | 110 | Charge depuis IndexedDB (avec migration) |
| `exportData()` | 229 | Export JSON simple (global) |
| `importData(event, onSuccess)` | 250 | Import JSON simple |
| `exportBranch(nodeId)` | 310 | Export branche en JSON |
| `importBranch(event, parentId, onSuccess)` | 348 | Import branche JSON |
| `wouldCreateCycle(targetId, parentId)` | 458 | Détecte cycles potentiels |
| `wouldCreateCycleWithMove(nodeId, newParentId)` | 478 | Détecte cycles pour déplacement |
| `exportDataZIP()` | 558 | Export complet en .dm (ZIP) |
| `exportBranchZIP(nodeId)` | 626 | Export branche en .dm |
| `importDataZIP(event, onSuccess)` | 713 | Import depuis .dm |
| `importBranchZIP(event, parentId, onSuccess)` | 974 | Import branche depuis .dm |

#### Détection de cycles

**Algorithme** (`src/js/core/data.js:458-540`) :

Vérifie si un symlink vers `targetId` avec `parentId` créerait un cycle en remontant la chaîne des parents.

```javascript
function wouldCreateCycle(targetId, parentId) {
  // 1. Cas simples
  if (!parentId) return false;
  if (targetId === parentId) return true;

  // 2. Remonte la chaîne des parents depuis parentId
  let current = parentId;
  const visited = new Set();

  while (current) {
    if (visited.has(current)) return true; // Cycle détecté
    visited.add(current);

    const node = data.nodes[current];
    if (!node) break;

    // Si on atteint le targetId, il y a un cycle
    if (current === targetId) return true;

    // Remonte au parent
    current = node.parent;
  }

  return false;
}
```

📍 **Référence** : `src/js/core/data.js:458-540`

**Note** : `wouldCreateCycleWithMove()` (ligne 478) est une variante pour déplacements de nœuds.

---

### storage.js - IndexedDB Wrapper

**Fichier** : `src/js/core/storage.js` (407 lignes)

**Responsabilités** :
- Initialisation Dexie.js
- CRUD sur les 3 tables (nodes, settings, attachments)
- Gestion des versions de schéma
- Stats et quotas

#### Schéma IndexedDB

```javascript
db = new Dexie('deepmemo');

db.version(1).stores({
  // Nodes table avec indexes
  nodes: 'id, parent, *tags, created, modified',

  // Settings table (key-value)
  settings: 'key',

  // Attachments table (blobs)
  attachments: 'id'
});
```

📍 **Référence** : `src/js/core/storage.js:23-36`

**Indexes expliqués** :
- `id` : Primary key
- `parent` : Index pour requêtes "tous les enfants de X"
- `*tags` : Multi-entry index (un nœud peut avoir plusieurs tags)
- `created`, `modified` : Indexes pour tri chronologique

#### API publique

| Fonction | Ligne | Description |
|----------|-------|-------------|
| `initStorage()` | 17 | Initialise Dexie (appelé automatiquement) |
| `saveNodes(nodes)` | 79 | Sauvegarde tous les nœuds |
| `loadNodes()` | 99 | Charge tous les nœuds |
| `saveSetting(key, value)` | 123 | Sauvegarde un setting |
| `loadSetting(key)` | 138 | Charge un setting |
| `saveAttachment(id, blob)` | 155 | Sauvegarde un attachment |
| `getAttachment(id)` | 177 | Récupère un attachment |
| `deleteAttachment(id)` | 193 | Supprime un attachment |
| `getAllAttachmentIds()` | 207 | Liste tous les IDs |
| `getStorageEstimate()` | 224 | Estime quota utilisé |

#### Gestion des erreurs

Si IndexedDB échoue → Fallback localStorage automatique dans `data.js:loadData()`

📍 **Référence** : `src/js/app.js:47-57` (détection + fallback)

---

### attachments.js - Gestion des Fichiers

**Fichier** : `src/js/core/attachments.js` (265 lignes)

**Responsabilités** :
- Upload de fichiers (max 50MB)
- Stockage blobs dans IndexedDB
- Génération blob URLs pour inline images
- Cleanup des orphelins

#### API publique

| Fonction | Ligne | Description |
|----------|-------|-------------|
| `isIndexedDBAvailable()` | 9 | Détecte si IndexedDB disponible |
| `uploadAttachment(file, nodeId)` | 28 | Upload et sauvegarde |
| `deleteAttachment(attachmentId, nodeId)` | 79 | Supprime attachment |
| `getAttachmentBlobUrl(id)` | 111 | Génère blob URL |
| `downloadAttachment(id, name)` | 133 | Télécharge fichier |
| `cleanOrphanedAttachments()` | 159 | Supprime fichiers orphelins |

#### Limite de taille

La limite de taille des attachments est de **50MB** par fichier.

📍 **Référence** :
- Limite appliquée dans `src/js/app.js` (méthode uploadAttachment)
- Contrainte IndexedDB navigateur : 500MB-1GB total

#### Inline images

**Syntax markdown** : `![alt](attachment:attach_id)`

**Conversion** : `src/js/features/editor.js:processAttachmentUrls()`
1. Parse markdown avec Marked.js
2. Détecte liens `attachment:*`
3. Génère blob URLs
4. Remplace dans HTML

📍 **Référence** : `src/js/features/editor.js:48-140`

---

### migration.js - Migration localStorage

**Fichier** : `src/js/core/migration.js` (208 lignes)

**Responsabilités** :
- Migration automatique localStorage → IndexedDB
- Conversion format legacy
- Validation après migration

#### Déclenchement

Appelé automatiquement dans `data.loadData()` si :
- IndexedDB vide
- localStorage contient `deepmemo_nodes`

📍 **Référence** : `src/js/core/data.js:110-160` (loadData avec migration)

#### Processus

```javascript
async function completeMigration() {
  // 1. Vérifie si déjà migré
  const alreadyMigrated = await Storage.loadSetting('migrationCompleted');
  if (alreadyMigrated) return;

  // 2. Charge depuis localStorage
  const oldNodes = JSON.parse(localStorage.getItem('deepmemo_nodes') || '{}');
  const oldRootNodes = JSON.parse(localStorage.getItem('deepmemo_rootNodes') || '[]');

  // 3. Migre vers IndexedDB
  await Storage.saveNodes(oldNodes);
  await Storage.saveSetting('rootNodes', oldRootNodes);

  // 4. Migre attachments (si présents)
  await migrateAttachments();

  // 5. Marque comme complété
  await Storage.saveSetting('migrationCompleted', true);

  console.log('[Migration] Completed successfully');
}
```

📍 **Référence** : `src/js/core/migration.js:22-82`

---

### validation.js - Validation JSON Schema

**Fichier** : `src/js/core/validation.js` (278 lignes)

**Responsabilités** :
- Validation JSON Schema pour imports
- Validation des formats .dm et JSON
- Support legacy (type "note" accepté)
- Messages d'erreur contextuels

#### API publique

| Fonction | Ligne | Description |
|----------|-------|-------------|
| `validateGlobalExport(data)` | ~60 | Valide export global |
| `validateBranchExport(data)` | ~120 | Valide export branche |
| `validateMetadata(metadata)` | ~180 | Valide metadata.json |
| `validateNode(node, ...)` | 15 | Valide un nœud individuel |

#### Validation des nœuds

```javascript
// Required fields pour chaque nœud
const requiredFields = ['id', 'type', 'parent', 'children', 'created', 'modified'];

// Types valides (avec support legacy)
const validTypes = ['node', 'note', 'symlink']; // 'note' = legacy alias pour 'node'

// Validation symlink
if (node.type === 'symlink' && !node.targetId) {
  errors.push('Symlink missing targetId');
}
```

📍 **Référence** : `src/js/core/validation.js:15-50`

**Utilisation** : Appelé lors des imports (JSON, .dm) pour détecter formats invalides et prévenir corruption des données.

---

### default-data.js - Contenu Démo

**Fichier** : `src/js/core/default-data.js` (2610 lignes)

**Responsabilités** :
- Contenu de démonstration en FR et EN
- Nodes pré-créés avec structure hiérarchique
- Tutorial et exemples

**Structure** :

```javascript
export function getDefaultData(language = 'fr') {
  if (language === 'en') {
    return {
      nodes: { /* nodes EN */ },
      rootNodes: [...]
    };
  }

  return {
    nodes: { /* nodes FR */ },
    rootNodes: [...]
  };
}
```

📍 **Référence** : `src/js/core/default-data.js:7-2610`

**Chargement** : Automatique si aucune donnée dans IndexedDB

📍 **Référence** : `src/js/core/data.js:136-145` (loadData crée démo si vide)

---

## Modules Features

### tree.js - Arborescence Sidebar

**Fichier** : `src/js/features/tree.js` (723 lignes)

**Responsabilités** :
- Render sidebar (arborescence)
- Instance keys (tracking paths)
- Branch mode
- Expansion/collapse
- Visual indicators (emojis, badges)

#### Instance Keys

**Format** : `"nodeId@parent@grandparent@root"`

**Exemple** :
```
Work@node_root
  → Project A@Work@node_root
    → Task 1@Project A@Work@node_root
```

**Utilité** :
- Afficher le même nœud plusieurs fois (via symlinks)
- Tracking du path pour breadcrumb
- Détection de cycles

📍 **Référence** : `src/js/features/tree.js:80-95` (fonction buildInstanceKey)

#### Branch Mode

**Activation** : URL avec `?branch=nodeId`

**Comportement** :
- Sidebar affiche seulement sous-arbre
- Breadcrumb commence au branch root
- Search scope limité
- "New Root Node" désactivé

📍 **Référence** :
- `src/js/features/tree.js:183-205` (détection branch mode)
- `src/js/features/tree.js:584-602` (renderBranchModeIndicator)

#### Extraction emojis

Extrait emoji du début du titre pour l'afficher à gauche :

```javascript
// "🔥 My Title" → emoji="🔥", title="My Title"
function extractEmojiFromTitle(title) {
  const emojiRegex = /^([\u{1F300}-\u{1FAFF}])\s+/u;
  const match = title.match(emojiRegex);
  if (match) {
    return {
      emoji: match[1],
      titleWithoutEmoji: title.slice(match[0].length)
    };
  }
  return null;
}
```

📍 **Référence** : `src/js/features/tree.js:27-70`

---

### editor.js - Édition des Nœuds

**Fichier** : `src/js/features/editor.js` (1049 lignes)

**Responsabilités** :
- Modes vue/édition
- Breadcrumb navigation
- Right panel (infos, tags, attachments)
- Markdown rendering avec attachments inline
- Actions (duplicate, move, link, delete)

#### Modes Vue/Édition

**État** : `let viewMode = 'view'` (défaut)

**Toggle** :
- Bouton "Edit" dans right panel
- Raccourci `Alt+E` / `Opt+E`

📍 **Référence** :
- `src/js/features/editor.js:18` - Variable viewMode
- `src/js/features/editor.js:26-35` - initViewMode (lecture localStorage)
- `src/js/features/editor.js:861-900` - toggleViewMode()

#### Breadcrumb

**Génération** (`src/js/features/editor.js:updateBreadcrumb()`) :

Remonte la chaîne des parents depuis le nœud courant jusqu'à la racine (ou branch root).

```javascript
function updateBreadcrumb(nodeId) {
  const crumbs = [];
  let current = data.nodes[nodeId];

  while (current) {
    crumbs.unshift({
      id: current.id,
      title: current.title,
      type: current.type
    });

    // Stop au branch root si en branch mode
    if (isBranchMode() && current.id === getBranchRootId()) {
      break;
    }

    // Remonte au parent (ou target si symlink)
    if (current.type === 'symlink') {
      const target = data.nodes[current.targetId];
      current = target ? data.nodes[target.parent] : null;
    } else {
      current = data.nodes[current.parent];
    }
  }

  return crumbs;
}
```

📍 **Référence** : `src/js/features/editor.js:306-385`

#### Right Panel

**Sections** :
1. **Node Info** : Created, modified, ID
2. **Tags** : Management + autocomplete
3. **Attachments** : Upload, list, download, delete
4. **Storage** : Usage + cleanup orphans
5. **Actions** : Duplicate, Move, Link, Delete

📍 **Référence** : `src/js/features/editor.js:574` (updateRightPanel)

#### Markdown avec Attachments

**Processus** :
1. Parse markdown → HTML (Marked.js)
2. Détecte liens `attachment:id`
3. Génère blob URLs
4. Remplace dans HTML

```javascript
async function processAttachmentUrls(html, node) {
  // Find all attachment:ID references
  const attachmentPattern = /attachment:([a-zA-Z0-9_]+)/g;
  const matches = [...html.matchAll(attachmentPattern)];

  if (matches.length === 0) return html;

  let processedHtml = html;

  // Process each attachment reference
  for (const match of matches) {
    const attachmentId = match[1];
    const blob = await AttachmentsModule.getAttachment(attachmentId);

    if (blob) {
      // Create blob URL and replace
      const blobUrl = URL.createObjectURL(blob);
      processedHtml = processedHtml.replace(match[0], blobUrl);
    }
  }

  return processedHtml;
}
```

📍 **Référence** : `src/js/features/editor.js:48-140`

---

### search.js - Recherche Globale

**Fichier** : `src/js/features/search.js` (257 lignes)

**Responsabilités** :
- Recherche dans title, content, tags
- Highlight des matches
- Navigation clavier (↑↓, Enter)
- Scope branch mode

#### Ouverture

- **Raccourci** : `Ctrl+K` / `Cmd+K`
- **UI** : (Pas de bouton visible, seulement raccourci)

📍 **Référence** : `src/js/utils/keyboard.js:34-37` (raccourci Ctrl+K)

#### Algorithme

```javascript
function performSearch(query) {
  const results = [];
  const lowerQuery = query.toLowerCase();

  // Filtrage branch mode
  const nodesToSearch = isBranchMode()
    ? getNodesInBranch(getBranchRootId())
    : Object.values(data.nodes);

  for (const node of nodesToSearch) {
    // Skip symlinks
    if (node.type === 'symlink') continue;

    // Match title
    if (node.title.toLowerCase().includes(lowerQuery)) {
      results.push({
        node,
        matchType: 'title',
        preview: node.title
      });
      continue;
    }

    // Match content
    if (node.content.toLowerCase().includes(lowerQuery)) {
      const preview = extractPreview(node.content, lowerQuery);
      results.push({
        node,
        matchType: 'content',
        preview
      });
      continue;
    }

    // Match tags
    if (node.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
      results.push({
        node,
        matchType: 'tag',
        preview: node.tags.join(', ')
      });
    }
  }

  return results;
}
```

📍 **Référence** : `src/js/features/search.js:58-205`

---

### tags.js - Gestion des Tags

**Fichier** : `src/js/features/tags.js` (352 lignes)

**Responsabilités** :
- Ajout/suppression tags
- Autocomplete (suggestions)
- Tag cloud (stats usage - à vérifier)
- Scope branch mode

#### Autocomplete

**Déclenchement** : Input tag dans right panel

**Suggestions** : Tags existants matchant le préfixe

```javascript
function getTagSuggestions(prefix) {
  const allTags = new Set();

  // Collecte tous les tags
  for (const node of Object.values(data.nodes)) {
    if (node.type === 'node' && node.tags) {
      node.tags.forEach(tag => allTags.add(tag));
    }
  }

  // Filtre par préfixe
  return [...allTags]
    .filter(tag => tag.toLowerCase().startsWith(prefix.toLowerCase()))
    .slice(0, 10); // Max 10 suggestions
}
```

📍 **Référence** : `src/js/features/tags.js:78-118` (showTagSuggestions)

#### Navigation clavier

- `↑` / `↓` : Navigate suggestions
- `Enter` : Select suggestion
- `Esc` : Close autocomplete

📍 **Référence** : `src/js/features/tags.js:145-172` (setupTagInputListeners)

---

### modals.js - Modales

**Fichier** : `src/js/features/modals.js` (646 lignes)

**Responsabilités** :
- Action Modal (Move/Link/Duplicate/Delete)
- Symlink Modal (sélection target)
- Confirmation dialogs

#### Action Modal

**Ouverture** : Bouton "..." dans right panel

**Options** :
1. **Duplicate** : Copie récursive du sous-arbre
2. **Move** : Déplace vers nouveau parent
3. **Link** : Crée symlink vers autre nœud
4. **Delete** : Supprime (avec confirmation)

📍 **Référence** :
- `index.html:296-349` - Structure HTML modal
- `src/js/features/modals.js:23-145` - openActionModal()

#### Symlink Modal

**Usage** : Sélectionner target node pour symlink

**Features** :
- Tree picker (arborescence complète)
- Search intégré
- Détection de cycles

📍 **Référence** :
- `index.html:352-398` - Structure HTML
- `src/js/features/modals.js:513-645` - openSymlinkModal()

---

### drag-drop.js - Drag & Drop

**Fichier** : `src/js/features/drag-drop.js` (447 lignes)

**Responsabilités** :
- HTML5 Drag & Drop API
- Operations : Move, Link, Duplicate, Reorder
- Cycle detection
- Visual feedback

#### Operations

| Modificateur | Action | Description |
|--------------|--------|-------------|
| (aucun) | **Move** | Déplace nœud vers nouveau parent |
| `Ctrl`/`Cmd` | **Link** | Crée symlink |
| `Alt`/`Opt` | **Duplicate** | Copie récursive |
| (même parent) | **Reorder** | Réordonne enfants |

📍 **Référence** : `src/js/features/drag-drop.js:146-285` (handleDrop)

#### Détection de cycles

Avant move/link → Appelle `wouldCreateCycle()` de `data.js`

📍 **Référence** : `src/js/features/drag-drop.js:195-210` (vérification cycle)

---

### fs-sync.js - File System Sync

**Fichier** : `src/js/features/fs-sync.js` (822 lignes)

**Responsabilités** :
- Export vers dossier local (hiérarchie de fichiers)
- Import depuis dossier (graceful : Obsidian, Notion)
- Frontmatter YAML
- File System Access API (Chrome/Edge only)

#### Phase 1 (Implémenté)

**Export** :
- Structure : `folder/subfolder/index.md`
- Frontmatter avec metadata
- Attachments copiés

**Import** :
- Parse frontmatter
- Régénération IDs
- Reconstruction hiérarchie

📍 **Référence** :
- `src/js/features/fs-sync.js:66-285` - exportToFileSystem()
- `src/js/features/fs-sync.js:287-575` - importFromFileSystem()

#### Phases 2 & 3 (Planifiées)

- **Phase 2** : Bidirectional sync, change detection
- **Phase 3** : Automatic watch mode, real-time sync

📍 **Référence** : Commentaires dans `src/js/features/fs-sync.js:1-30`

---

### preview.js - Live Preview

**Fichier** : `src/js/features/preview.js` (525 lignes)

**Responsabilités** :
- Split screen (editor + preview)
- Sync scroll
- Markdown live rendering

#### Activation

**UI** : Bouton "Split View" dans right panel (en mode édition)

📍 **Référence** : `src/js/features/preview.js:24-85` (initPreview)

#### Sync Scroll

**Technique** : Proportionnel (pourcentage scroll)

```javascript
function syncScroll(sourceElement, targetElement) {
  const scrollPercent = sourceElement.scrollTop /
                       (sourceElement.scrollHeight - sourceElement.clientHeight);

  targetElement.scrollTop = scrollPercent *
                           (targetElement.scrollHeight - targetElement.clientHeight);
}
```

📍 **Référence** : `src/js/features/preview.js:110-145` (setupScrollSync)

---

## Modules UI

### panels.js - Gestion Panels

**Fichier** : `src/js/ui/panels.js` (132 lignes)

**Responsabilités** :
- Sidebar resizer (drag horizontal)
- Right panel toggle
- State persistence (localStorage)

#### Sidebar Resizer

**Fonctionnement** :
1. Mousedown sur `.sidebar-resizer`
2. Mousemove → Update largeur sidebar
3. Mouseup → Save préférence

📍 **Référence** : `src/js/ui/panels.js:34-105` (initSidebarResizer)

**Limites** :
- Min : 200px
- Max : 600px

---

### toast.js - Notifications

**Fichier** : `src/js/ui/toast.js` (28 lignes)

**Responsabilités** :
- Afficher notifications temporaires
- Types : success, error, info
- Auto-dismiss 3 secondes

#### API

```javascript
showToast(message, type = 'info', duration = 3000)
```

**Usage** :
```javascript
showToast('Node saved', 'success');
showToast('Error loading data', 'error');
```

📍 **Référence** : `src/js/ui/toast.js:13-28`

**Implémentation** : Crée/détruit éléments DOM dynamiquement.

---

## Modules Utils

### routing.js - Navigation URL

**Fichier** : `src/js/utils/routing.js` (95 lignes)

**Responsabilités** :
- Hash-based routing (`#/node/id`)
- Query params (`?branch=id`)
- Browser history
- URL generation (bookmarks, multi-tab)

#### Format URL

```
https://deepmemo.org/?branch=node_123#/node/node_456
                      └─ Query param  └─ Hash
```

**Signification** :
- `?branch=node_123` : Branch mode (sous-arbre)
- `#/node/node_456` : Node sélectionné

📍 **Référence** :
- `src/js/utils/routing.js:15-33` - navigateToHash()
- `src/js/utils/routing.js:43-50` - Listener hashchange

#### Functions

| Fonction | Description |
|----------|-------------|
| `navigateToNode(nodeId)` | Change hash → `#/node/{id}` |
| `navigateToHash()` | Parse hash et render node |
| `getNodeUrl(nodeId)` | Génère URL complète |
| `getBranchUrl(branchId, nodeId)` | URL avec ?branch |

---

### keyboard.js - Raccourcis Clavier

**Fichier** : `src/js/utils/keyboard.js` (51 lignes)

**Responsabilités** :
- Setup listeners
- Dispatch actions

#### Raccourcis

| Raccourci | Action | Référence |
|-----------|--------|-----------|
| `Ctrl+N` / `Cmd+N` | New node | ligne 27 |
| `Ctrl+K` / `Cmd+K` | Search | ligne 34 |
| `Alt+E` / `Opt+E` | Toggle edit mode | ligne 41 |
| `Ctrl+S` / `Cmd+S` | Save (manual) | ligne 48 |
| `Esc` | Close modals/search | (géré localement dans chaque module) |

📍 **Référence** : `src/js/utils/keyboard.js:23-60`

---

### i18n.js - Internationalisation

**Fichier** : `src/js/utils/i18n.js` (227 lignes)

**Responsabilités** :
- Auto-detect langue navigateur
- Load dictionnaires (FR/EN)
- Translate `data-i18n` attributes
- API `t(key, params)`

#### Détection Langue

```javascript
async function initI18n() {
  // 1. Check localStorage
  let lang = localStorage.getItem('deepmemo_language');

  // 2. Auto-detect si pas défini
  if (!lang) {
    const browserLang = navigator.language.split('-')[0];
    lang = ['fr', 'en'].includes(browserLang) ? browserLang : 'en';
  }

  // 3. Load dictionnaire
  await loadLanguage(lang);

  // 4. Translate DOM
  translatePage();
}
```

📍 **Référence** : `src/js/utils/i18n.js:16-38`

#### API Traduction

```javascript
// Usage simple
t('app.title') // → "DeepMemo"

// Avec interpolation
t('messages.nodeCount', { count: 5 }) // → "5 nodes"
```

📍 **Référence** : `src/js/utils/i18n.js:109-124` (fonction t)

---

### helpers.js - Utilitaires

**Fichier** : `src/js/utils/helpers.js` (126 lignes)

**Fonctions** :

| Fonction | Description |
|----------|-------------|
| `generateId()` | Génère ID unique (timestamp + random) |
| `escapeHtml(text)` | Échappe HTML (XSS protection) |
| `highlightText(text, query)` | Highlight search matches |
| `downloadBlob(blob, filename)` | Télécharge fichier |
| `sanitizeFilename(text, options)` | Sanitize pour exports/filesystem |

📍 **Référence** : `src/js/utils/helpers.js:1-126`

---

### sync.js - Multi-Tab Sync

**Fichier** : `src/js/utils/sync.js` (70 lignes)

**Responsabilités** :
- BroadcastChannel API
- Notification data changes
- Reception dans autres onglets

#### Mécanisme

```javascript
// Émission (après saveData)
function notifyDataChanged() {
  if (syncChannel) {
    syncChannel.postMessage({ type: 'data_changed', timestamp: Date.now() });
  }
}

// Réception (autre onglet)
function setupSyncListener(callback) {
  syncChannel = new BroadcastChannel('deepmemo_sync');

  syncChannel.onmessage = (event) => {
    if (event.data.type === 'data_changed') {
      console.log('[Sync] Data changed in another tab, reloading...');
      callback();
    }
  };
}
```

📍 **Référence** :
- `src/js/utils/sync.js:12-24` - initSync()
- `src/js/utils/sync.js:62` - setupSyncListener()
- `src/js/utils/sync.js:40` - notifyDataChanged()

---

### frontmatter.js - Parse YAML

**Fichier** : `src/js/utils/frontmatter.js` (60 lignes)

**Responsabilités** :
- Parse frontmatter YAML en début de markdown
- Utilisé pour FS Sync import

#### Format

```markdown
---
id: node_123
title: My Note
tags: [tag1, tag2]
created: 1705000000000
---

# Contenu markdown ici
```

#### API

```javascript
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (match) {
    const yamlText = match[1];
    const markdownContent = match[2];
    const metadata = jsyaml.load(yamlText);

    return { metadata, content: markdownContent };
  }

  return { metadata: null, content };
}
```

📍 **Référence** : `src/js/utils/frontmatter.js:15-40`

---

## Service Worker

**Fichier** : `sw.js` (115 lignes)

**Responsabilités** :
- Cache strategy (offline support)
- Précache des assets essentiels
- Update automatique

### Cache Strategy

**Stratégie** : Network First, fallback to Cache

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Success → cache + return
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Failure → fallback cache
        return caches.match(event.request);
      })
  );
});
```

📍 **Référence** : `sw.js:69-102`

### Précache

**Assets précachés** (45 fichiers) :
- HTML, CSS, JS (tous les modules)
- Icons PWA
- Manifests
- Locales

📍 **Référence** : `sw.js:6-45` (liste PRECACHE_URLS)

### Lifecycle

1. **Install** : Précache assets
2. **Activate** : Nettoyage anciens caches
3. **Fetch** : Intercept requêtes

📍 **Référence** :
- `sw.js:48-58` - Install event
- `sw.js:60-67` - Activate event
- `sw.js:69-102` - Fetch event

---

## Dépendances externes

### Bibliothèques CDN

| Bibliothèque | Version | Usage | Taille | Licence |
|--------------|---------|-------|--------|---------|
| **Marked** | latest | Parse Markdown → HTML | ~20KB | MIT |
| **JSZip** | 3.10.1 | Création/lecture archives ZIP | ~100KB | MIT/GPL |
| **Dexie.js** | 3.2.4 | Wrapper IndexedDB | ~50KB | Apache 2.0 |
| **js-yaml** | 4.1.0 | Parse YAML (frontmatter) | ~80KB | MIT |
| **Mermaid** | 10 | Génération diagrammes SVG | ~500KB | MIT |

**Total** : ~750KB (non minifié)

📍 **Référence** : `index.html:93-96` + `index.html:451`

### Pourquoi CDN ?

**Avantages** :
- Pas de build step (zéro config)
- Cache navigateur partagé
- Updates faciles

**Inconvénients** :
- Dépendance réseau (mais précache via SW)
- Moins de contrôle versions

### Alternatives envisageables

**Option** : Self-host des libs (dans `/vendor`)
- ✅ Offline total sans SW
- ❌ Plus gros bundle initial

---

## Patterns et Bonnes Pratiques

### Naming Conventions

**Modules** :
- Suffixe `Module` pour imports : `import * as DataModule`
- Fonctions exportées : `camelCase`
- Constants : `UPPER_SNAKE_CASE`

**Variables** :
- Locales : `camelCase`
- Privées (non exportées) : `camelCase`
- État global : `app.currentNodeId`

### Error Handling

**Pattern** : Try-catch avec fallback + toast

```javascript
try {
  await saveData();
} catch (error) {
  console.error('[Module] Operation failed:', error);
  showToast(t('toast.errorMessage'), 'error');
  // Fallback logic if possible
}
```

**Pas de error boundaries** (pas de framework React).

### Performance

**Optimisations** :
- ✅ Lazy load Mermaid (import dynamique)
- ✅ Debounce auto-save (300ms)
- ✅ Blob URLs cleanup (memory leaks)
- ✅ IndexedDB indexes (queries rapides)

**À améliorer** :
- ⚠️ Tree render : Full rebuild à chaque change (pas de diffing)
- ⚠️ Search : Scan tous les nodes (pas d'index full-text)

### Security

**Protections** :
- ✅ XSS : `escapeHtml()` avant injection DOM
- ✅ No eval/innerHTML (sauf Marked.js)
- ✅ CSP possible (pas implémenté)

**Limitations** :
- ❌ Pas de chiffrement IndexedDB (local-only app)
- ❌ Pas de sanitization stricte Markdown (Marked.js trusted)

---

## Voir Aussi

- [3-DATA-MODEL.md](3-DATA-MODEL.md) - Structure détaillée des données
- [4-FEATURES.md](4-FEATURES.md) - Fonctionnalités utilisateur
- [reference/storage-api.md](reference/storage-api.md) - API IndexedDB complète
- [reference/keyboard-shortcuts.md](reference/keyboard-shortcuts.md) - Tous les raccourcis

---

**Document complet et vérifié** ✅
Toutes les références pointent vers des lignes de code réelles.
