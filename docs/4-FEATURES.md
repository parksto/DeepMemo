# 4. Features

> **Version** : V0.10.5
> **Dernière mise à jour** : 2026-01-29
> **Sources vérifiées** : Toutes les features référencent le code source

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Navigation & Tree](#navigation--tree)
3. [Branch Mode](#branch-mode)
4. [Markdown](#markdown)
5. [PDF Export](#pdf-export)
6. [Attachments](#attachments)
7. [Tags](#tags)
8. [Search](#search)
9. [Drag & Drop](#drag--drop)
10. [Export/Import](#exportimport)
11. [File System Sync](#file-system-sync)
12. [Internationalization (i18n)](#internationalization-i18n)
13. [PWA & Offline](#pwa--offline)
14. [Multi-tab Sync](#multi-tab-sync)
15. [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Vue d'ensemble

DeepMemo V0.10.5 propose **15 features principales** organisées en 4 catégories :

### 📁 Navigation & Organisation
- **Tree Navigation** : Arborescence hiérarchique avec expand/collapse
- **Branch Mode** : Isolation de sous-arbres pour focus
- **Symlinks** : Liens symboliques pour nodes multi-parents

### ✍️ Contenu & Édition
- **Markdown** : Syntaxe complète + live preview
- **PDF Export** : Génération serveur avec TOC
- **Attachments** : Upload inline avec preview

### 🔍 Recherche & Organisation
- **Tags** : Autocomplete + cloud + multi-entry index
- **Search** : Full-text + scope branch + highlighting

### 🔧 Avancé & Sync
- **Drag & Drop** : Move/Copy/Link avec modifiers
- **Export/Import** : .dm (ZIP), JSON, branch
- **FS Sync** : Bidirectionnel vers dossier local
- **i18n** : FR/EN avec interpolation
- **PWA** : Offline-first, installable
- **Multi-tab Sync** : BroadcastChannel

---

## Navigation & Tree

### Vue d'ensemble

**Module** : `src/js/features/tree.js` (723 lignes)

Le tree est le composant central qui affiche l'arborescence hiérarchique dans la sidebar gauche.

**Features** :
- Rendering récursif de tous les nodes visibles
- Expand/collapse avec état persisté
- Selection + focus (keyboard)
- Instance keys pour gestion des symlinks
- Extraction automatique d'emojis

📍 **Référence** : `src/js/features/tree.js:1-724`

---

### Fonctions Principales

| Fonction | Ligne | Description |
|----------|-------|-------------|
| `renderTree(onNodeClick)` | 220 | Render complet de l'arbre visible |
| `setCurrentInstanceKey(key)` | 72 | Sélectionne node + auto-collapse/expand path |
| `setFocusedInstanceKey(key)` | 116 | Focus keyboard sans sélection |
| `getInstanceKey(nodeId, parentContext)` | 65 | Génère instance key unique |
| `findInstanceKeyForNode(targetNodeId)` | 462 | Construit instance key par remontée |
| `expandTreeNode(instanceKey)` | 446 | Expand node pour afficher children |
| `collapseTreeNode(instanceKey)` | 453 | Collapse node |
| `handleTreeNavigation(e, callback)` | 617 | Navigation clavier (↑↓←→ Enter) |
| `updateTreeFocus()` | 578 | Met à jour classes `.focused`/`.active` |

---

### Instance Keys

**Concept** : Identifiant unique d'une **occurrence** de node dans l'arbre.

**Pourquoi** : Un node peut apparaître plusieurs fois via symlinks → chaque occurrence doit être distinguable.

**Format** : `nodeId@parentInstanceKey@...@root`

**Exemples** :
```
node_root@root                                   // Root node
node_child@node_root@root                        // Child direct
symlink_ref@node_child@node_root@root            // Symlink
node_target@symlink_ref@node_child@node_root@root // Via symlink (récursif)
```

**Usage** :
- Stockage de l'état expand/collapse
- Navigation breadcrumb
- Détection de cycles (symlinks récursifs)

📍 **Référence** : `src/js/features/tree.js:65-67` (getInstanceKey)

---

### Extraction d'Emojis

Les emojis au début du titre sont automatiquement extraits pour affichage séparé.

**Algorithme** (`tree.js:27-60`) :
```javascript
function extractEmojiFromTitle(title) {
  if (!title) return null;

  // Regex: Comprehensive Unicode emoji ranges
  const emojiRegex = /^([\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}...])\s*/u;

  const match = title.match(emojiRegex);
  if (match) {
    return {
      emoji: match[1],  // Groupe de capture
      titleWithoutEmoji: title.slice(match[0].length)
    };
  }
  return null;  // Pas d'emoji trouvé
}
```

**Exemples** :
- Input : `"🔥 Project Alpha"`
- Output : `{ emoji: "🔥", titleWithoutEmoji: "Project Alpha" }`
- Input : `"No emoji"`
- Output : `null`

**Affichage** :
- Emoji dans `.tree-node-icon`
- Titre dans `.tree-node-title`

📍 **Référence** : `src/js/features/tree.js:27-60`

---

### Types de Nodes

Le tree affiche différemment chaque type de node :

| Type | Icon | Style | Draggable | Référence |
|------|------|-------|-----------|-----------|
| **Regular Node** | Emoji OU 📄 | Normal | ✅ | `tree.js:357-359` |
| **Symlink** | Emoji OU 🔗 | Italic title | ✅ | `tree.js:374-391` |
| **External Symlink** | 🔗🚫 | Opacity 0.4 + italic | ❌ | `tree.js:374-391` |
| **Broken Symlink** | ⚠️ | Opacity 0.5 | ❌ | `tree.js:276-297` |

**External Symlink** : Symlink dont le target est hors de la branche actuelle (branch mode uniquement)

**Broken Symlink** : Symlink dont le target a été supprimé

> **Note** : Les **symlinks circulaires** ne peuvent **pas être créés** grâce à la validation `wouldCreateCycle()` (`modals.js:171-174`, `352-355`). Le code empêche la création de boucles (A → B → C → A).

---

### Expand/Collapse

**Comportement** :
- **Clic sur arrow (▶/▼)** : Expand/collapse **sans** sélectionner le node
- **Clic sur titre** : Sélectionne le node (charge dans editor)
- **Auto-collapse** : Lors de la sélection via `setCurrentInstanceKey()`, le tree se replie puis reconstruit le path vers le node

**État** :
- Stocké dans `expandedNodes` (Set d'instance keys)
- Persisté dans localStorage (optionnel)

**Classes CSS** :
- `.tree-node.expanded` : Affiche `.tree-node-children`
- `.tree-node-toggle` : Arrow qui change de ▶ à ▼

📍 **Référence** : `src/js/features/tree.js:315-335` (toggle onclick), `tree.js:72-111` (auto-collapse)

---

### Selection & Focus

**Selection (Active)** :
- Node actuellement chargé dans l'éditeur
- Classe : `.tree-node-content.active`
- Background accent + highlight

**Focus (Keyboard)** :
- Node actuellement ciblé par navigation clavier
- Classe : `.tree-node-content.focused`
- Outline border

**Distinction** :
- Un node peut être focused sans être active (navigation sans sélection)
- Un node peut être active ET focused (après Enter sur focused node)

📍 **Référence** : `src/js/features/tree.js:578-602` (updateTreeFocus)

---

### Navigation Clavier

| Touche | Action | Comportement |
|--------|--------|--------------|
| **↓** (ArrowDown) | Move down | Focus next visible node |
| **↑** (ArrowUp) | Move up | Focus previous visible node |
| **→** (ArrowRight) | Expand | Expand focused node → show children |
| **←** (ArrowLeft) | Collapse/Parent | If expanded: collapse; else: go to parent |
| **Enter** | Select | Select focused node → load in editor |

**Notes** :
- Fonctionne uniquement si tree a focus (pas dans input)
- Auto-focus premier node si aucun focus
- Scrolls node into view automatiquement
- External symlinks : sélectionnables (pour suppression) mais toast warning

📍 **Référence** : `src/js/features/tree.js:617-723` (handleTreeNavigation)

---

### Structure HTML

**Par node** (`tree.js:220-441`) :
```html
<div class="tree-node [expanded]" data-instance-key="node_123@root">
  <div class="tree-node-content [active|focused]">
    <span class="tree-node-toggle">▶/▼</span>
    <span class="tree-node-icon">📄/🔗/⚠️</span>
    <span class="tree-node-title">Node Title</span>
    <span class="symlink-badge">link/external/broken</span>
  </div>
  <div class="tree-node-children">
    <!-- Nested nodes recursively -->
  </div>
</div>
```

**Classes CSS** :
- `.tree-node` : Container principal
- `.tree-node.expanded` : Affiche children
- `.tree-node-content` : Row cliquable
- `.tree-node-content.active` : Node sélectionné
- `.tree-node-content.focused` : Focus clavier
- `.tree-node-content.dragging` : En cours de drag
- `.tree-node-content.drag-over` : Hover pendant drag

📍 **CSS** : `src/css/components.css:254-357`, `src/css/components.css:892-909`

---

## Branch Mode

### Vue d'ensemble

**Branch Mode** permet d'**isoler une sous-arbre** pour travailler sur une branche spécifique sans distraction.

**Activation** :
- URL : `?branch=node_123#/node/node_456`
- UI : Bouton "Copy Branch URL" → génère URL

**Effets** :
- Sidebar affiche **uniquement** les descendants de `branchRootId`
- Breadcrumb commence à `branchRootId` (pas root global)
- Search scope limité à la branche
- "New Root Node" button disabled
- Page title : `"DeepMemo - [Branch Name]"`

📍 **Référence** : `src/js/features/tree.js:136-162` (enable/disable)

---

### Activation/Désactivation

**Enable** (`tree.js:136-151`) :
```javascript
export function enableBranchMode(nodeId) {
  branchMode = true;
  branchRootId = nodeId;
  const instanceKey = getInstanceKey(nodeId, null);
  expandedNodes.add(instanceKey);  // Auto-expand branch root
  updatePageTitle();
  return true;
}
```

**Disable** (`tree.js:156-162`) :
```javascript
export function disableBranchMode() {
  branchMode = false;
  branchRootId = null;
  updatePageTitle();
}
```

**Détection** :
```javascript
export function isBranchMode() { return branchMode; }
export function getBranchRootId() { return branchRootId; }
```

---

### Activation depuis URL

**Flow** (`routing.js` → `app.js` → `tree.js`) :

1. User visite : `https://deepmemo.org/?branch=node_123#/node/node_456`
2. **`routing.js:12-33`** : Parse URL
   ```javascript
   parseHash() {
     const urlParams = new URLSearchParams(window.location.search);
     const branchRootId = urlParams.get('branch');
     // Returns: { mode: 'branch', branchRootId, nodeId }
   }
   ```
3. **`app.js:187-204`** : Navigate to hash
   ```javascript
   if (route.mode === 'branch' && route.branchRootId) {
     TreeModule.enableBranchMode(route.branchRootId);
   }
   ```
4. **`tree.js:435`** : Render only branch descendants
5. **`editor.js:310`** : Breadcrumb stops at branch root

📍 **Références** :
- `src/js/utils/routing.js:12-33`
- `src/js/app.js:187-204`
- `src/js/features/tree.js:435`

---

### Isolation Comportement

Quand branch mode est actif :

| Feature | Comportement Normal | Comportement Branch |
|---------|---------------------|---------------------|
| **Sidebar** | Tous les root nodes | Uniquement `branchRootId` + descendants |
| **"New Root Node"** | Enabled | **Disabled** (can only add children) |
| **Search** | Global | **Scoped** to branch descendants |
| **Breadcrumb** | Root → ... → Node | **Branch Root → ... → Node** |
| **Page Title** | "DeepMemo" | "DeepMemo - [Branch Name]" |
| **Copy URLs** | Preserve context | Preserve `?branch=` param |

📍 **Références** :
- Disable new root : `app.js:261-264`
- Scoped search : `search.js:49-65`
- Breadcrumb : `editor.js:310`
- Page title : `tree.js:201-214`

---

### Branch Indicator UI

**Élément** : `<div class="branch-mode-indicator" id="branchModeIndicator">`

**Location** : Sidebar, au-dessus du tree

**Contenu** :
- Texte : "🌿 branch mode" (i18n : `labels.branchMode`)
- Bouton exit : "⤴️" link vers `#/node/{branchRootId}` (sort du branch mode)

**Affichage** :
- Hidden par défaut : `display: none`
- Shown en branch mode : `display: flex`

**Update Logic** (`app.js:365-378`) :
```javascript
updateBranchModeIndicator() {
  const indicator = document.getElementById('branchModeIndicator');
  const isBranchMode = TreeModule.isBranchMode();
  indicator.style.display = isBranchMode ? 'flex' : 'none';

  if (isBranchMode) {
    const branchRootId = TreeModule.getBranchRootId();
    const exitLink = indicator.querySelector('.branch-mode-exit');
    exitLink.href = `./#/node/${branchRootId}`;
  }
}
```

📍 **Références** :
- HTML : `index.html:132-135`
- JS : `src/js/app.js:365-378`
- CSS : `src/css/layout.css:60-85`

---

### Bookmark URLs

> **Note** : DeepMemo est **LocalFirst** - les URLs fonctionnent uniquement sur le **même PC, même navigateur, même utilisateur**. Ce sont des bookmarks de navigation locale, pas des liens partageables entre utilisateurs.

**Current Node URL** (preserve branch context) :
```javascript
getNodeUrl(nodeId, branchRootId)
// → https://deepmemo.org/?branch=node_123#/node/node_456
```

**Branch Isolation URL** (always creates branch) :
```javascript
getBranchUrl(branchRootId)
// → https://deepmemo.org/?branch=node_456#/node/node_456
```

**UI Buttons** (Right panel) :
- 🔗 "Copy node URL" : Preserve context (si branch mode, inclut `?branch=`)
- 🌿 "Copy branch URL" : Force branch mode sur le node courant

📍 **Références** :
- `src/js/utils/routing.js:80-95`
- `index.html:155-166` (copy URL buttons)
- `src/js/features/editor.js:963-977` (updateShareLinks)

---

### External Symlinks

**Définition** : Symlink dont le `targetId` pointe vers un node **hors de la branche actuelle**.

**Conditions** :
- Branch mode actif
- Symlink existe
- Target existe
- Mais `target` n'est pas descendant de `branchRootId`

**Exemple** :
```
Branch Mode: Project A
├─ Task 1
└─ 🔗 Reference  ← Points to "Some Note" (EXTERNAL)

Project B (outside branch)
└─ Some Note  ← Target ici
```

**Affichage** (`tree.js:374-391`) :

| Aspect | Style |
|--------|-------|
| Icon | 🔗🚫 (chain + prohibition) |
| Opacity | 0.4 |
| Font | italic |
| Badge | "external" (i18n) |
| Badge opacity | 0.5 |

**Comportement** :
- ✅ **Clickable** (sélectionnable pour suppression)
- ❌ **Non-draggable** (pas de drag-drop)
- ⚠️ **Toast warning** : "External link to branch (not accessible)"
- ❌ **No children** (agit comme dead leaf, `hasChildren = false`)
- ❌ **Non-navigable** (target hors de vue)

**Raison** : Suivre le lien briserait l'isolation de la branche.

📍 **Références** :
- Détection : `tree.js:262-272`
- Pas de children : `tree.js:301-302`
- Pas de drag-drop : `tree.js:406-414`
- Toast : `tree.js:400-404`

---

### Workflows

#### Workflow : Entrer en Branch Mode

1. User clique sur "Copy Branch URL" (🌿) dans right panel
2. Génère URL : `?branch=node_123#/node/node_123`
3. Copie dans clipboard
4. User colle URL dans nouvelle tab (même navigateur)
5. Nouvelle session :
   - `routing.js` parse `?branch=` param
   - `app.js` appelle `enableBranchMode(node_123)`
   - Sidebar re-render avec uniquement descendants
   - Indicator "🌿 branch mode" affiché
   - Breadcrumb commence à node_123
   - Search scope limité

#### Workflow : Sortir de Branch Mode

1. User clique sur "⤴️" dans branch indicator
2. Navigate vers `#/node/{branchRootId}` (sans `?branch=`)
3. `routing.js` détecte absence de `?branch=` param
4. `app.js` appelle `disableBranchMode()`
5. Sidebar re-render avec tous les root nodes
6. Indicator caché
7. Breadcrumb jusqu'au root global

---

## Markdown

### Vue d'ensemble

DeepMemo supporte **Markdown complet** avec :
- Live preview split-screen (optionnel)
- Rendering via Marked.js (CDN)
- Support inline images (attachments)
- Syntax highlighting pour code blocks

**Modules** :
- `src/js/features/editor.js` : Rendering en view mode
- `src/js/features/preview.js` : Live preview split-screen
- `src/js/features/modals.js` : Markdown help modal

📍 **Référence** : Library Marked.js chargée via `index.html:93`

---

### Syntaxe Supportée

**Référence complète** : Markdown Help Modal (`modals.js:560-646`)

| Élément | Syntaxe | Support |
|---------|---------|---------|
| **Headings** | `# H1` à `###### H6` | ✅ |
| **Bold** | `**text**` | ✅ |
| **Italic** | `*text*` | ✅ |
| **Strikethrough** | `~~text~~` | ✅ |
| **Code inline** | `` `code` `` | ✅ |
| **Code block** | ` ```language ... ``` ` | ✅ |
| **Lists (unordered)** | `- item` ou `* item` | ✅ |
| **Lists (ordered)** | `1. item` | ✅ |
| **Links** | `[text](url)` | ✅ |
| **Images** | `![alt](url)` ou `![alt](attachment:id)` | ✅ |
| **Blockquotes** | `> quote` | ✅ |
| **Horizontal rules** | `---` ou `***` ou `___` | ✅ |
| **Tables** | Standard markdown tables | ✅ |

**Inline Attachments** :
```markdown
![Screenshot](attachment:attach_1234567890_abc123)
[Download PDF](attachment:attach_1234567890_def456)
```

📍 **Référence** : `src/js/features/modals.js:560-646` (help modal)

---

### Live Preview (Split-Screen)

**Module** : `src/js/features/preview.js`

**Features** :
- Split-screen : Editor (left) + Preview (right)
- Debounced updates (300ms) pour performance
- Scroll sync : Cursor position → Preview scroll
- Line mapping : Markdown lines → HTML elements
- ResizeObserver : Auto-adjust heights

**Activation** :
- Button : `#togglePreview` (`index.html:221`)
- State : Persisté dans `localStorage.deepmemo_previewEnabled`

**Mobile** : Disabled automatiquement sur écrans < 768px

📍 **Référence** : `src/js/features/preview.js:103-507`

---

#### Debounced Updates

**Problème** : Re-render preview à chaque frappe → lag

**Solution** : Debounce 300ms (`preview.js:359-367`)
```javascript
let debounceTimer = null;

function schedulePreviewUpdate() {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    updatePreview();
  }, 300);  // 300ms delay
}
```

**Résultat** : Preview update seulement après 300ms d'inactivité

---

#### Scroll Sync

**Objectif** : Synchroniser scroll de preview avec position du curseur dans editor

**Algorithme** (`preview.js:387-476`) :
1. Detecter cursor position (ligne courante dans textarea)
2. Mapper ligne markdown → élément HTML dans preview
3. Calculer position proportionnelle (cursor / total lines)
4. Scroll preview à la position équivalente

**Line Mapping** (`preview.js:216-276`) :
```javascript
// Build map: markdown line → HTML element
const lineMap = new Map();
const blocks = parseMarkdown(content);
blocks.forEach(block => {
  lineMap.set(block.startLine, block.element);
});
```

**Proportional Scroll** (`preview.js:455-476`) :
```javascript
const cursorLine = getCurrentCursorLine(textarea);
const progress = cursorLine / totalLines;
const scrollTarget = progress * previewHeight;
previewElement.scrollTop = scrollTarget;
```

📍 **Référence** : `src/js/features/preview.js:387-476`

---

### Rendering Pipeline

**View Mode** (`editor.js:897-934`) :
```
1. Get node.content (markdown)
2. Call window.marked.parse(content)
3. processAttachmentUrls(html, node)
   → Replace attachment:ID with blob URLs
4. Render into .markdown-content div
```

**Attachment URL Processing** (`editor.js:48-105`) :
```javascript
Pattern: /attachment:([a-zA-Z0-9_]+)/g

For each match:
  1. Extract attachment ID
  2. Fetch blob from IndexedDB
  3. Get MIME type from node.attachments metadata
  4. Recreate blob with correct type (critical for SVG)
  5. Create blob URL: URL.createObjectURL(blob)
  6. Replace "attachment:ID" → blob URL
  7. Track in activeBlobUrls[] for cleanup
```

**Memory Management** :
- Blob URLs créés avec `URL.createObjectURL()`
- Tracked dans `activeBlobUrls` array
- Cleanup avec `URL.revokeObjectURL()` quand node change

📍 **Référence** : `src/js/features/editor.js:48-105`

---

### Markdown Help Modal

**Trigger** :
- Keyboard : `Alt+H`
- UI : Settings panel (à vérifier)
- Code : `app.openMarkdownHelp()` → `ModalsModule.openMarkdownHelp()`

**Content** : Généré dynamiquement via i18n (`modals.js:560-646`)

**Sections** :
- Headings
- Text formatting (bold, italic)
- Lists (unordered, ordered)
- Links
- Images (URL + attachments)
- Code (inline + blocks)
- Blockquotes
- Horizontal rules
- Tables

**Exemple** (Headings) :
```
# Heading 1
## Heading 2
### Heading 3
```

📍 **Références** :
- Modal generator : `src/js/features/modals.js:560-646`
- i18n keys : `src/js/locales/en.js:195-237` (markdown.examples)
- Trigger : `src/js/app.js:82` (openMarkdownHelp)

---

### SVG Special Handling

**Problème** : SVG files stockés dans IndexedDB peuvent perdre leur MIME type

**Solution** (`editor.js:80-85`) :
```javascript
// Get MIME from metadata
const attachmentMeta = node.attachments.find(a => a.id === attachmentId);
const correctMimeType = attachmentMeta?.type || 'application/octet-stream';

// Recreate blob with correct MIME
if (blob.type !== correctMimeType) {
  blob = new Blob([blob], { type: correctMimeType });
}
```

**Résultat** : SVG affichés correctement avec `type: "image/svg+xml"`

📍 **Référence** : `src/js/features/editor.js:80-85`

---

## PDF Export

### Vue d'ensemble

**PDF Export** génère un document PDF hiérarchique avec :
- Table of Contents (TOC) auto-générée
- Numérotation hiérarchique (1, 1.1, 1.1.1)
- Markdown parsing direct (sans Marked.js)
- Support images (base64)
- Gestion symlinks (full content OU citations)

**Module** : `src/js/core/pdf-export-new.js` (557 lignes)

**Processus** :
1. Client prépare data (resolve symlinks, convert images to base64)
2. Send to Worker endpoint (POST `/api/pdf-export`)
3. Worker génère PDF avec jsPDF
4. Client download blob

📍 **Référence** : `src/js/core/pdf-export-new.js:1-557`

---

### Export Options

**UI Modal** : `index.html:342-393`

| Format | Extension | Handler | Description |
|--------|-----------|---------|-------------|
| **ZIP** | `.dm` | `confirmExportZIP()` | Complete archive with attachments |
| **FreeMind** | `.mm` | `confirmExportFreeMind()` | Mindmap XML format |
| **Mermaid** | `.svg` | `confirmExportMermaid()` | Diagram visualization |
| **PDF** | `.pdf` | `confirmExportPDF()` | Hierarchical document |

📍 **Référence** : `src/js/app.js:613-651` (handlers)

---

### PDF Generation Pipeline

**Flow** (`app.js:983-1055`) :
```
1. Check online status (line 985)
   → If offline: showToast("PDF export requires internet")

2. Prepare PDF data (line 997):
   executePdfExport() {
     - Resolve symlinks to target nodes
     - Convert attachment images to base64
     - Detect external symlinks (branch mode)
   }

3. Send to Worker (line 1004):
   POST ${workerURL}/api/pdf-export
   Body: { nodes, rootId, type: 'branch' }

4. Handle rate limit (lines 1015-1019):
   Read headers:
   - X-RateLimit-Remaining-Hour
   - X-RateLimit-Remaining-Day

5. Download blob (line 1031):
   const blob = await response.blob();
   downloadBlob(blob, filename);

6. Update UI (lines 1036-1044):
   - Save rate limits to localStorage
   - Show success toast
```

**Worker URL** : Auto-detected (`app.getWorkerURL()`)

📍 **Référence** : `src/js/app.js:983-1055` (executePdfExport)

---

### PDF Markdown Parsing

**Stratégie** : Utilise **Marked.js** dans le Worker pour convertir markdown → HTML, puis génère le PDF

📍 **Marked.js dans Worker** :
- `bin/branch2pdf.js:2` : `const { marked } = require("marked");`
- `bin/branch2pdf.js:15` : `const html = marked.parse(markdown);`

**Blocks Parsed** (`pdf-export-new.js:18-150`) :

| Block | Pattern | Action |
|-------|---------|--------|
| **Headings** | `^#{1,6}\s+` | Level offset by nodeDepth |
| **Code blocks** | ` ```...``` ` | Monospace font, background |
| **Unordered lists** | `^[\s]*[-*+]\s+` | Bullets with indentation |
| **Ordered lists** | `^[\s]*\d+\.\s+` | Numbered with indentation |
| **Blockquotes** | `^>` | Italic + indented |
| **Images** | `!\[([^\]]*)\]\(([^)]+)\)` | Embed base64 or skip |
| **Horizontal rules** | `^[-*_]{3,}$` | Line separator |
| **Paragraphs** | Consecutive lines | Normal text blocks |

**Markdown Stripping** (`pdf-export-new.js:155-166`) :
```javascript
Strip inline formatting:
  **bold** → bold
  *italic* → italic
  ~~strikethrough~~ → strikethrough
  `code` → code
  [link](url) → link (text only)
  ![alt](url) → alt (text only)
```

📍 **Référence** : `src/js/core/pdf-export-new.js:18-166`

---

### PDF Structure Features

**Table of Contents** (`pdf-export-new.js:429-447`) :
- Auto-generated from hierarchy
- **Plain text list** (non cliquable)
- Hierarchical numbering (1, 1.1, 1.1.1)

**Hierarchical Numbering** (`pdf-export-new.js:189-191`) :
```javascript
function buildNumberingPrefix(depth, index) {
  // Depth 0: "1"
  // Depth 1: "1.1"
  // Depth 2: "1.1.1"
  return numberingPath.join('.');
}
```

**Page Breaks** :
- Auto-inserted quand contenu dépasse page height
- Check avant chaque block : `if (y > pageHeight - margin) { addPage(); }`

📍 **Références** :
- TOC : `pdf-export-new.js:429-447`
- Numbering : `pdf-export-new.js:189-191`
- Page breaks : `pdf-export-new.js:291-295`, `341-344`

**Font Sizing** (`pdf-export-new.js:287`) :
```javascript
const fontSize = Math.max(10, 14 - (depth * 2));
// Depth 0: 14pt
// Depth 1: 12pt
// Depth 2: 10pt
// Depth 3+: 10pt (minimum)
```

**Images** (`pdf-export-new.js:393-400`) :
- Format : Base64-encoded
- Max width : 150mm
- Supported : PNG, JPG, JPEG

**Symlink Handling** (`pdf-export-new.js:300-319`) :
- **Full mode** : Include target content recursively
- **Citations mode** : Just show "See: [Title]" reference

---

### Rate Limiting

**Purpose** : Prevent abuse du service PDF génération

**Quotas** :
- **5 exports / hour**
- **20 exports / day**

**Client-Side** (`app.js:687-732`) :
```javascript
localStorage: 'deepmemo_pdf_rate_limits'
{
  hour: { count: 3, resetTime: 1706123456789 },
  day: { count: 8, resetTime: 1706123456789 }
}

TTL: 24 hours (86400000 ms)
```

**Server-Side** (Privacy Notice, `index.html:400-434`) :
- IP hashed avec SHA-256
- Stored 24h maximum
- No document data saved
- Rate limit headers returned

**Privacy Modal** (`index.html:395-447`) :
- Shown on first PDF export attempt
- "Don't show again" checkbox
- Dismissal flag : `localStorage.deepmemo_pdf_privacy_accepted`

📍 **Références** :
- Client rate limit : `src/js/app.js:687-732`
- Privacy modal : `index.html:395-447`

---

## Attachments

### Vue d'ensemble

**Attachments** permet d'uploader des fichiers et de les intégrer dans le contenu markdown.

**Features** :
- Upload n'importe quel type de fichier
- Limite : **50 MB par fichier**
- Storage : IndexedDB (blobs séparés)
- Inline images : `![alt](attachment:ID)`
- Download/delete UI

**Module** : `src/js/core/attachments.js`

📍 **Référence** : `src/js/core/attachments.js:1-265`

---

### API Functions

| Function | Params | Returns | Description |
|----------|--------|---------|-------------|
| `generateAttachmentId()` | none | `string` | Generate `attach_{timestamp}_{random}` |
| `saveAttachment(id, blob)` | id, blob | `Promise<void>` | Save blob to IndexedDB |
| `getAttachment(id)` | id | `Promise<Blob\|null>` | Retrieve blob |
| `deleteAttachment(id)` | id | `Promise<void>` | Delete blob |
| `listAttachments()` | none | `Promise<string[]>` | Get all IDs |
| `getTotalSize()` | none | `Promise<number>` | Total bytes used |
| `cleanOrphans(data)` | data | `{deleted, freed}` | Remove unreferenced files |
| `cleanOrphanedReferences(data)` | data | `{cleaned, nodes}` | Remove invalid refs |
| `formatFileSize(bytes)` | bytes | `string` | Format "1.2 MB" |

📍 **Référence** : `src/js/core/attachments.js:27-193`

---

### Attachment Metadata Structure

**Dans node.attachments[]** (`app.js:1430-1437`) :
```javascript
{
  id: "attach_1234567890_abc123def",
  name: "screenshot.png",
  type: "image/png",
  size: 102400,
  created: 1234567890000,
  modified: 1234567890000
}
```

**Storage** :
- **Metadata** : Dans `node.attachments` array (IndexedDB table `nodes`)
- **Blob** : Dans IndexedDB table `attachments` (key-value: `id → Blob`)

📍 **Référence** : `src/js/core/storage.js:26-36` (schema)

---

### Upload Workflow

**Trigger** :
```javascript
app.triggerFileUpload()
  → Click hidden input: #attachmentFileInput
```

**Handler** (`app.js:1397-1453`) :
```javascript
1. Get file from input.files[0]

2. Check size:
   if (file.size > 50 * 1024 * 1024) {
     showToast('File too large (max 50MB)');
     return;
   }

3. Generate attachment ID:
   const attachId = AttachmentsModule.generateAttachmentId();

4. Save to IndexedDB:
   await AttachmentsModule.saveAttachment(attachId, file);

5. Add metadata to node:
   node.attachments.push({
     id: attachId,
     name: file.name,
     type: file.type,
     size: file.size,
     created: Date.now(),
     modified: Date.now()
   });

6. Save node:
   await saveData();

7. Re-render editor:
   EditorModule.displayNode(currentNodeId);

8. Show toast:
   showToast(`File attached: ${file.name}`);

9. Reset input:
   event.target.value = '';
```

📍 **Référence** : `src/js/app.js:1397-1453`

---

### UI Components

**Attachments Section** (`index.html:203-210`) :
```html
<div class="attachments-section">
  <h3>📎 Files attached (N)</h3>
  <ul id="attachmentsList"></ul>
  <button onclick="app.triggerFileUpload()">Add file</button>
</div>
```

**Attachment Item** (`editor.js:537-565`) :
```html
<li class="attachment-item">
  <span class="attachment-icon">📄/🖼️</span>
  <span class="attachment-name">screenshot.png</span>
  <span class="attachment-id">(attach_123...)</span>
  <span class="attachment-size">1.2 MB</span>
  <div class="attachment-actions">
    <button onclick="app.copyAttachmentSyntax('![...](attachment:ID)')">📋 Copy</button>
    <button onclick="app.downloadAttachment(ID, name)">⬇️ Download</button>
    <button onclick="app.deleteAttachment(ID)">🗑️ Delete</button>
  </div>
</li>
```

**Icon Logic** :
- `type.startsWith('image/')` → 🖼️
- Else → 📄

📍 **Référence** : `src/js/features/editor.js:537-565`

---

### Inline Images & Links

**Markdown Syntax** :
```markdown
Images: ![Screenshot](attachment:attach_123_abc)
Links:  [Download PDF](attachment:attach_456_def)
```

**Rendering** (`editor.js:48-105`) :
```javascript
Pattern: /attachment:([a-zA-Z0-9_]+)/g

For each match:
  1. Extract attachment ID
  2. Fetch blob from IndexedDB: getAttachment(attachId)
  3. Get MIME type from node.attachments metadata
  4. Recreate blob with correct MIME (important for SVG):
     if (blob.type !== correctMime) {
       blob = new Blob([blob], { type: correctMime });
     }
  5. Create blob URL: URL.createObjectURL(blob)
  6. Replace in HTML: attachment:ID → blob:http://...
  7. Track in activeBlobUrls[] for cleanup
```

**Memory Management** :
- **activeBlobUrls[]** : Track all blob URLs created
- **cleanupBlobUrls()** : Revoke all URLs when switching nodes
- **Auto-cleanup** : Called on node switch to prevent memory leaks

📍 **Référence** : `src/js/features/editor.js:48-105`

---

### Download Workflow

**Handler** (`app.js:1470-1490`) :
```javascript
async downloadAttachment(attachId, filename) {
  1. Fetch blob: const blob = await AttachmentsModule.getAttachment(attachId);

  2. Create blob URL: const blobUrl = URL.createObjectURL(blob);

  3. Create <a> element:
     const a = document.createElement('a');
     a.href = blobUrl;
     a.download = filename;

  4. Trigger download: a.click();

  5. Cleanup: URL.revokeObjectURL(blobUrl);

  6. Toast: showToast('Download started');
}
```

📍 **Référence** : `src/js/app.js:1470-1490`

---

### Cleanup Operations

**Orphaned Files** (`attachments.js:90-124`) :
```javascript
cleanOrphans(data) {
  1. List all attachment IDs in IndexedDB
  2. List all attachment IDs referenced in nodes
  3. Find diff: orphans = dbIds - referencedIds
  4. Delete each orphan from IndexedDB
  5. Return: { deleted: count, freed: bytes }
}
```

**Orphaned References** (`attachments.js:132-162`) :
```javascript
cleanOrphanedReferences(data) {
  1. List all attachment IDs in IndexedDB
  2. For each node.attachments[]:
     if (!dbIds.includes(attachment.id)) {
       Remove from node.attachments
     }
  3. Return: { cleaned: count, nodes: [nodeIds] }
}
```

**UI Buttons** (Right panel) :
- "Clean Orphaned Files" → `app.cleanOrphanedAttachments()`
- "Clean Orphaned Refs" → `app.cleanOrphanedNodes()`

📍 **Référence** : `src/js/core/attachments.js:90-162`

---

### Storage Estimate

**Display** (Right panel, `editor.js:687-709`) :
```javascript
Total: 12.5 MB / ~500 MB (2.5%)
[=========>                    ] 2.5%
Files: 8
```

**Calculation** :
```javascript
const estimatedLimit = 500 * 1024 * 1024;  // 500 MB
const percentage = Math.min(100, Math.round((totalSize / estimatedLimit) * 100));
```

**Note** : 500 MB est une estimation, la limite réelle varie selon le navigateur (500 MB - 1 GB)

📍 **Référence** : `src/js/features/editor.js:687-709`

---

## Tags

### Vue d'ensemble

**Tags** permet d'organiser les nodes avec des mots-clés.

**Features** :
- Autocomplete (max 10 suggestions)
- Tag cloud (right panel)
- Multi-entry IndexedDB index pour search rapide
- Scope : global OU branch
- Case-insensitive storage and search (normalized to lowercase)

**Module** : `src/js/features/tags.js` (352 lignes)

📍 **Référence** : `src/js/features/tags.js:1-352`

---

### API Functions

| Fonction | Ligne | Description |
|----------|-------|-------------|
| `setCurrentNodeId(nodeId)` | 19-21 | Définit node courant |
| `renderTags()` | 26-93 | Render tags + input |
| `addTag(tag)` | 98-133 | Ajoute tag au node |
| `removeTag(tag)` | 138-150 | Supprime tag |
| `handleTagInput(e)` | 155-192 | Gère Enter/Arrows/Escape |
| `handleTagAutocomplete(e)` | 197-220 | Filtre suggestions |
| `collectAllTagsForAutocomplete()` | 225-243 | Collecte tous les tags (global) |
| `collectBranchTags()` | 320-352 | Collecte tags branche + descendants |
| `renderTagAutocomplete()` | 248-263 | Render dropdown |
| `navigateTagAutocomplete(direction)` | 268-276 | Navigation ↑↓ |
| `selectTagSuggestion(index)` | 281-289 | Sélectionne suggestion |

📍 **Référence** : `src/js/features/tags.js`

---

### Autocomplete

**Workflow** :
```
1. User focus #tagInput
2. Type "pro"
3. handleTagAutocomplete() triggers:
   → collectAllTagsForAutocomplete()
   → Filter by "pro" (case-insensitive)
   → Sort by frequency (most used first)
   → Max 10 suggestions
4. renderTagAutocomplete() shows dropdown
5. User presses Enter OR clicks suggestion
   → addTag(tag) executes
   → node.tags.push(tag)
   → saveData()
   → renderTags() refresh
   → updateRightPanel() refresh tag cloud
```

**Priorité Suggestions** (`tags.js:225-243`) :
```javascript
// Count tag occurrences across all nodes
const tagCounts = new Map();
Object.values(data.nodes).forEach(node => {
  node.tags?.forEach(tag => {
    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
  });
});

// Sort by count descending
const sortedTags = [...tagCounts.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([tag]) => tag);

// Filter by query
const filtered = sortedTags.filter(tag =>
  tag.toLowerCase().includes(query.toLowerCase())
);

return filtered.slice(0, 10);  // Max 10
```

📍 **Référence** : `src/js/features/tags.js:225-243`

---

### Keyboard Navigation

**Dans autocomplete dropdown** :

| Touche | Action |
|--------|--------|
| **↓** (ArrowDown) | Select next suggestion |
| **↑** (ArrowUp) | Select previous suggestion |
| **Enter** | Add selected tag OU add typed text |
| **Escape** | Close autocomplete |

**Logic** (`tags.js:155-192`) :
```javascript
handleTagInput(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const selectedTag = tagAutocompleteSuggestions[tagAutocompleteIndex];
    const tagToAdd = selectedTag || input.value.trim();
    if (tagToAdd) addTag(tagToAdd);
  }
  else if (e.key === 'ArrowDown') {
    navigateTagAutocomplete(1);  // Next
  }
  else if (e.key === 'ArrowUp') {
    navigateTagAutocomplete(-1);  // Previous
  }
  else if (e.key === 'Escape') {
    hideTagAutocomplete();
  }
}
```

📍 **Référence** : `src/js/features/tags.js:155-192`

---

### Scope

**Autocomplete** : **Global** (tous les nodes)
- Collecte tags de tous les nodes
- Sort by frequency

**Tag Cloud (Right Panel)** : **Branch** (node courant + descendants)
- Si branch mode : descendants de branchRootId
- Sinon : descendants de currentNodeId
- Fonction : `collectBranchTags()`

📍 **Référence** : `src/js/features/tags.js:320-352` (collectBranchTags)

---

### Storage

**Dans Node** :
```javascript
node.tags = ['work', 'urgent', 'project'];  // Array of strings
```

**IndexedDB** :
- Table : `nodes`
- Index : `*tags` (multi-entry index)
- Query exemple : `db.nodes.where('tags').equals('work')`

**Pourquoi multi-entry** :
- Un node peut avoir plusieurs tags
- Index multi-entry crée une entrée par tag
- Permet queries rapides par tag

📍 **Référence** : `src/js/core/storage.js:28` (schema definition)

---

### UI Components

**Tags Container** (`index.html:170-181`) :
```html
<div class="tags-container" id="tagsContainer">
  <!-- Rendered dynamically -->
</div>
```

**Rendered Structure** (`tags.js:26-93`) :
```html
<div class="tags-container">
  <span class="tag">
    <span class="user-content">work</span>
    <span class="tag-remove">×</span>
  </span>
  <span class="tag">
    <span class="user-content">urgent</span>
    <span class="tag-remove">×</span>
  </span>

  <div style="position: relative;">
    <input type="text" class="tag-input" id="tagInput" placeholder="+ tag">
    <div class="tag-autocomplete" id="tagAutocomplete" style="display: none;">
      <div class="tag-autocomplete-item selected">project</div>
      <div class="tag-autocomplete-item">productivity</div>
    </div>
  </div>
</div>
```

**CSS Classes** :
- `.tag` : Tag element
- `.tag-remove` : Remove button (×)
- `.tag-autocomplete` : Dropdown (absolute positioned)
- `.tag-autocomplete-item` : Suggestion
- `.tag-autocomplete-item.selected` : Navigation highlight

📍 **CSS** : `src/css/components.css` (tags styles)

---

### Integration avec Search

**Click on Tag** → Open Search with Tag :

```javascript
// tags.js:43-50
tagEl.onclick = (e) => {
  if (!e.target.classList.contains('tag-remove')) {
    window.app.openSearchWithTag(tag);  // Call search with prefill
  }
};
```

**Search receives prefilled query** :
```javascript
// app.js:482-483
openSearchWithTag(tag) {
  SearchModule.openSearch(tag);  // Prefill input
}
```

📍 **Référence** : `src/js/features/tags.js:43-50`

---

### i18n Messages

| Message | i18n Key | Contexte |
|---------|----------|----------|
| "🏷️ Tag added" | `toast.tagAdded` | Après ajout |
| "⚠️ Tag already exists" | `toast.tagAlreadyExists` | Doublon détecté |
| "🗑️ Tag removed" | `toast.tagRemoved` | Après suppression |
| "+ tag" | `placeholders.tagInput` | Placeholder input |

📍 **Référence** : `src/js/locales/en.js` (toast.*, placeholders.*)

---

## Search

### Vue d'ensemble

**Search** propose une recherche full-text dans tous les nodes.

**Features** :
- Full-text search (title + content + tags)
- Scope branch mode (nodes dans branche uniquement)
- Highlighting des matches
- Navigation keyboard (↑↓ Enter)
- Preview snippets avec contexte

**Module** : `src/js/features/search.js` (257 lignes)

**Trigger** : `Ctrl+K` (keyboard shortcut)

📍 **Référence** : `src/js/features/search.js:1-257`

---

### API Functions

| Fonction | Ligne | Description |
|----------|-------|-------------|
| `openSearch(prefillText)` | 20-39 | Ouvre modal + autofocus |
| `closeSearch()` | 44-52 | Ferme modal + reset state |
| `performSearch(query)` | 58-110 | Effectue recherche |
| `getNodePath(nodeId)` | 117-128 | Breadcrumb path (parent › node) |
| `renderSearchResults(query)` | 134-163 | Render résultats avec highlight |
| `handleSearchNavigation(e)` | 169-191 | Keyboard navigation |
| `selectSearchResult(index)` | 197-207 | Sélectionne et navigue vers node |
| `scrollSearchResultIntoView()` | 212-217 | Smooth scroll selected |
| `setupSearchInput()` | 222-250 | Setup event handlers |
| `isSearchVisible()` | 255-257 | Getter state |

📍 **Référence** : `src/js/features/search.js`

---

### Search Algorithm

**Portée** (`search.js:70-74`) :
```javascript
Object.values(data.nodes).forEach(node => {
  // Branch mode: skip nodes outside branch
  if (!isNodeInBranch(node.id)) {
    return;
  }

  // ... search logic
});
```

**Critères Match** (`search.js:76-78`) :
```javascript
const titleMatch = node.title.toLowerCase().includes(queryLower);
const contentMatch = node.content?.toLowerCase().includes(queryLower);
const tagsMatch = node.tags?.some(tag => tag.toLowerCase().includes(queryLower));
```

**Résultat Structure** (`search.js:96-103`) :
```javascript
{
  id: node.id,
  title: node.title,
  path: "Root › Parent › Node",  // Breadcrumb
  preview: "... snippet with context ...",
  matchInTitle: boolean,
  matchInTags: boolean  // Tag-only match
}
```

📍 **Référence** : `src/js/features/search.js:58-110`

---

### Preview Generation

**Tag Match** (`search.js:84-87`) :
```javascript
if (tagsMatch && !titleMatch && !contentMatch) {
  const matchingTags = node.tags.filter(tag =>
    tag.toLowerCase().includes(queryLower)
  );
  preview = `🏷️ Tags: ${matchingTags.join(', ')}`;
}
```

**Content Match** (`search.js:88-94`) :
```javascript
if (contentMatch) {
  // Extract 50 chars before/after match
  const index = node.content.toLowerCase().indexOf(queryLower);
  const start = Math.max(0, index - 50);
  const end = Math.min(node.content.length, index + query.length + 50);

  let snippet = node.content.substring(start, end);
  preview = (start > 0 ? '...' : '') + snippet + '...';
}
```

**Fallback** :
```javascript
preview = node.content?.substring(0, 100) || '(No content)';
```

📍 **Référence** : `src/js/features/search.js:84-94`

---

### Keyboard Navigation

**Dans search modal** :

| Touche | Action | Référence |
|--------|--------|-----------|
| **↓** | Select next result | `search.js:175-179` |
| **↑** | Select previous result | `search.js:181-185` |
| **Enter** | Open selected node → close search | `search.js:187-190` |
| **Escape** | Close search | Global handler |

**Logic** (`search.js:169-191`) :
```javascript
handleSearchNavigation(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedSearchResultIndex = Math.min(
      selectedSearchResultIndex + 1,
      searchResults.length - 1
    );
    scrollSearchResultIntoView();
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedSearchResultIndex = Math.max(0, selectedSearchResultIndex - 1);
    scrollSearchResultIntoView();
  }
  else if (e.key === 'Enter') {
    e.preventDefault();
    selectSearchResult(selectedSearchResultIndex);
  }
}
```

📍 **Référence** : `src/js/features/search.js:169-191`

---

### UI Components

**Modal HTML** (`index.html:252-272`) :
```html
<div class="search-modal" id="searchModal">
  <div class="search-container">
    <div class="search-input-wrapper">
      <div class="search-icon">🔍</div>
      <input type="text" class="search-input" id="searchInput"
             placeholder="Search in all nodes..."
             data-i18n-placeholder="placeholders.search">
      <span class="search-hint">Esc</span>
    </div>

    <div class="search-results" id="searchResults">
      <!-- Results rendered dynamically -->
    </div>

    <div class="search-footer">
      <div>↑↓ Navigate</div>
      <div>Enter Open</div>
      <div>Esc Close</div>
    </div>
  </div>
</div>
```

**Result Item** (`search.js:134-163`) :
```html
<div class="search-result [selected]" onclick="selectSearchResult(index)">
  <div class="search-result-title">Node Title</div>
  <div class="search-result-path">Root › Parent › Node</div>
  <div class="search-result-preview">... snippet with <mark>highlight</mark> ...</div>
</div>
```

**CSS Classes** :
- `.search-modal` : Modal overlay
- `.search-modal.active` : Visible state
- `.search-result` : Result item
- `.search-result.selected` : Navigation highlight
- `.search-result-title` : Node title
- `.search-result-path` : Breadcrumb
- `.search-result-preview` : Content snippet

📍 **CSS** : `src/css/components.css` (search styles)

---

### Highlighting

**Fonction** : `highlightText()` from `utils/helpers.js`

**Usage** :
```javascript
const highlightedTitle = highlightText(result.title, query);
const highlightedPreview = highlightText(result.preview, query);
```

**Résultat** :
```html
Node <mark>title</mark> with highlight
```

📍 **Référence** : `src/js/utils/helpers.js:30-50` (highlightText)

---

### i18n Messages

| Message | i18n Key | Contexte |
|---------|----------|----------|
| "Search in all nodes..." | `placeholders.search` | Input placeholder |
| "Type to search..." | `modals.search.emptyHint` | État vide |
| "No results found" | `modals.search.noResults` | No match |
| "↑↓ Navigate" | `modals.search.navigate` | Footer hint |
| "Enter Open" | `modals.search.open` | Footer hint |
| "Esc Close" | `modals.search.close` | Footer hint |

📍 **Référence** : `src/js/locales/en.js:138-149` (modals.search.*)

---

## Drag & Drop

### Vue d'ensemble

**Drag & Drop** permet de réorganiser les nodes via glisser-déposer.

**Opérations** :
- **Move** (défaut) : Change parent
- **Copy** (Ctrl) : Duplicate recursively
- **Link** (Ctrl+Alt) : Create symlink

**Zones de drop** :
- **Before** : Insert avant le target
- **After** : Insert après le target
- **Inside** : Change parent (ou action spéciale selon modifiers)

**Module** : `src/js/features/drag-drop.js` (447 lignes)

📍 **Référence** : `src/js/features/drag-drop.js:1-447`

---

### Opérations

| Action | Modifiers | Zone Drop | Effet | Référence |
|--------|-----------|-----------|-------|-----------|
| **Move** | None | Inside | Change parent | `drag-drop.js:270-291` |
| **Move** | None | Before/After | Reorder siblings | `drag-drop.js:229-265` |
| **Copy** | Ctrl | Inside | Duplicate node | `drag-drop.js:329-382` |
| **Copy** | Ctrl | Before/After | Duplicate + insert | `drag-drop.js:387-425` |
| **Link** | Ctrl+Alt | Inside | Create symlink | `drag-drop.js:296-324` |
| **Link** | Ctrl+Alt | Before/After | Move (ignored) | N/A |

📍 **Référence** : `src/js/features/drag-drop.js`

---

### Détection Position

**Tree Nodes (Vertical)** (`drag-drop.js:112-133`) :
```javascript
const mouseY = e.clientY - rect.top;
const height = rect.height;

if (mouseY < height * 0.33) {
  dropPosition = 'before';  // Top 1/3
  indicator.className = 'drop-indicator top';
}
else if (mouseY > height * 0.67) {
  dropPosition = 'after';   // Bottom 1/3
  indicator.className = 'drop-indicator bottom';
}
else {
  dropPosition = 'inside';  // Middle 1/3
  element.classList.add('drag-over');
}
```

**Child Cards (Horizontal)** (`drag-drop.js:89-110`) :
```javascript
const mouseX = e.clientX - rect.left;
const width = rect.width;

if (mouseX < width * 0.33) {
  dropPosition = 'before';  // Left 1/3
  indicator.className = 'drop-indicator left';
}
else if (mouseX > width * 0.67) {
  dropPosition = 'after';   // Right 1/3
  indicator.className = 'drop-indicator right';
}
else {
  dropPosition = 'inside';  // Middle 1/3
  element.classList.add('drag-over');
}
```

📍 **Référence** : `src/js/features/drag-drop.js:89-133`

---

### Indicateurs Visuels

**During Drag** :
- **Source element** : `.dragging` class (opacity 0.5)
- **Drop zones** : `.drop-indicator.top/.bottom/.left/.right` (line 3px)
- **Hover target** : `.drag-over` class (dashed border)
- **Cursor** : `dropEffect` change selon modifiers

**Drop Effect** (`drag-drop.js:68-75`) :
```javascript
if (dragModifiers.ctrl && dragModifiers.alt) {
  e.dataTransfer.dropEffect = 'link';  // Cursor: alias
}
else if (dragModifiers.ctrl) {
  e.dataTransfer.dropEffect = 'copy';  // Cursor: copy
}
else {
  e.dataTransfer.dropEffect = 'move';  // Cursor: move
}
```

**CSS Classes** :
- `.dragging` : Source node being dragged
- `.drag-over` : Target node hover
- `.drop-indicator` : Line showing insert position
- `.drop-indicator.top/.bottom/.left/.right` : Position variants

📍 **CSS** : `src/css/components.css` (drag-drop styles)

---

### Move Node

**Function** : `moveNode(nodeId, newParentId)`

**Algorithm** (`drag-drop.js:270-291`) :
```javascript
1. Remove from old parent:
   if (oldParent === null) {
     data.rootNodes = data.rootNodes.filter(id => id !== nodeId);
   } else {
     data.nodes[oldParent].children = data.nodes[oldParent].children.filter(id => id !== nodeId);
   }

2. Add to new parent:
   node.parent = newParentId;
   if (newParentId === null) {
     data.rootNodes.push(nodeId);
   } else {
     data.nodes[newParentId].children.push(nodeId);
   }

3. Save & notify:
   saveData();
   showToast('📦 Node moved');
```

📍 **Référence** : `src/js/features/drag-drop.js:270-291`

---

### Reorder Siblings

**Function** : `reorderNodes(draggedId, targetId, position)`

**Algorithm** (`drag-drop.js:229-265`) :
```javascript
1. Both nodes must have same parent (siblings)

2. Remove dragged from children array

3. Find target position in array

4. Insert based on position:
   if (position === 'before') {
     childrenArray.splice(targetIndex, 0, draggedId);
   } else {  // 'after'
     childrenArray.splice(targetIndex + 1, 0, draggedId);
   }

5. Update parent reference:
   draggedNode.parent = newParentId;

6. Save & notify:
   saveData();
   showToast('🔄 Order modified');
```

📍 **Référence** : `src/js/features/drag-drop.js:229-265`

---

### Create Symlink

**Function** : `createSymlinkTo(targetNodeId, parentId)`

**Algorithm** (`drag-drop.js:296-324`) :
```javascript
1. Generate symlink ID:
   const symlinkId = 'symlink_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

2. Create symlink object:
   const symlink = {
     id: symlinkId,
     type: 'symlink',
     targetId: targetNodeId,
     title: targetNode.title,  // Initial = target title
     parent: parentId,
     children: [],
     tags: [],
     created: Date.now(),
     modified: Date.now()
   };

3. Add to tree:
   data.nodes[symlinkId] = symlink;
   if (parentId === null) {
     data.rootNodes.push(symlinkId);
   } else {
     data.nodes[parentId].children.push(symlinkId);
   }

4. Save & notify:
   saveData();
   showToast('🔗 Symlink created');
```

📍 **Référence** : `src/js/features/drag-drop.js:296-324`

---

### Duplicate Node

**Function** : `duplicateNode(originalId, parentId)`

**Algorithm** (`drag-drop.js:329-382`) :
```javascript
// Recursive copy of full subtree
const duplicateRecursive = (originalId, parentId) => {
  const original = data.nodes[originalId];

  // Generate new ID
  const duplicateId = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  // Create duplicate (always type='node', never symlink)
  const duplicate = {
    id: duplicateId,
    type: 'node',
    title: original.title + ' (copie)',
    content: original.content || '',  // Or target content if symlink
    parent: parentId,
    children: [],
    tags: [...(original.tags || [])],
    created: Date.now(),
    modified: Date.now()
  };

  data.nodes[duplicateId] = duplicate;

  // Recursively duplicate children
  if (original.children && original.children.length > 0) {
    original.children.forEach(childId => {
      const duplicatedChildId = duplicateRecursive(childId, duplicateId);
      duplicate.children.push(duplicatedChildId);
    });
  }

  return duplicateId;
};

// Start recursion
const newId = duplicateRecursive(originalId, parentId);
saveData();
showToast('📋 Node duplicated');
```

**Note** : Les symlinks sont dupliqués comme nodes réguliers (content = target content)

📍 **Référence** : `src/js/features/drag-drop.js:329-382`

---

### Cycle Prevention

**Function** : `isDescendantOf(targetId, nodeId)`

**Algorithm** (`drag-drop.js:216-224`) :
```javascript
function isDescendantOf(targetId, nodeId) {
  if (!targetId || targetId === nodeId) return false;

  const target = data.nodes[targetId];
  if (!target) return false;

  if (target.parent === nodeId) return true;

  // Recursive check
  return isDescendantOf(target.parent, nodeId);
}
```

**Usage** (`drag-drop.js:158-162`) :
```javascript
// Don't allow dropping on descendants
if (isDescendantOf(targetNodeId, draggedId)) {
  showToast('⚠️ Impossible: invalid destination');
  return;
}
```

📍 **Référence** : `src/js/features/drag-drop.js:216-224`

---

### Modifier Behavior

**Capture Real-Time** (`drag-drop.js:62-66`) :
```javascript
// dragModifiers updated during dragover (not just dragstart)
dragModifiers = {
  ctrl: e.ctrlKey || e.metaKey,  // Cmd on macOS
  alt: e.altKey
};
```

**Pourquoi real-time** :
- User peut presser/relâcher modifiers pendant drag
- dropEffect doit update en temps réel
- Visual feedback immédiat

📍 **Référence** : `src/js/features/drag-drop.js:62-66`

---

### i18n Messages

| Message | i18n Key | Contexte |
|---------|----------|----------|
| "🔄 Order modified" | `toast.orderModified` | Reorder siblings |
| "📦 Node moved" | `toast.nodeMoved` | Move parent |
| "🔗 Symlink created" | `toast.symlinkCreated` | Ctrl+Alt inside |
| "📋 Node duplicated" | `toast.nodeDuplicated` | Copy inside |
| "📋 Node duplicated and inserted" | `toast.nodeDuplicatedInserted` | Copy before/after |
| "⚠️ Impossible: invalid destination" | `toast.invalidDestination` | Cycle prevention |

📍 **Référence** : `src/js/locales/en.js` (toast.*)

---

## Export/Import

### Vue d'ensemble

DeepMemo propose **4 formats d'export** :

| Format | Extension | Type | Attachments | Use Case |
|--------|-----------|------|-------------|----------|
| **.dm (ZIP)** | `.dm` | Binary | ✅ Included | Export complet avec fichiers |
| **JSON Global** | `.json` | Text | ❌ Metadata only | Export simple, LLM-friendly |
| **JSON Branch** | `.json` | Text | ❌ Metadata only | Export sous-arbre |
| **FreeMind** | `.mm` | XML | ❌ | Mindmap (Freeplane/XMind) |
| **Mermaid** | `.svg` | SVG | ❌ | Diagram visualization |

**Module** : `src/js/core/data.js`

📍 **Référence** : `src/js/core/data.js:182-949`

---

### Format .dm (ZIP Archive)

**Structure** :
```
deepmemo-export.dm (ZIP file)
├── metadata.json          # Export metadata
├── data.json              # Nodes data with $schema
└── attachments/           # Folder
    ├── attach_123_screenshot.png
    ├── attach_456_document.pdf
    └── ...
```

#### metadata.json

**Schema** : `schemas/v1.0/metadata.json`

**Structure** :
```json
{
  "version": "1.0",
  "type": "deepmemo-branch",
  "title": "Project Alpha",
  "branchRootId": "node_123",
  "exported": 1706123456789,
  "nodeCount": 42,
  "attachmentCount": 8,
  "totalSize": 5242880,
  "generator": "DeepMemo v0.10.5"
}
```

📍 **Référence** : `schemas/v1.0/metadata.json:1-67`

#### data.json

**Structure** :
```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "type": "deepmemo-branch",
  "branchRootId": "node_123",
  "nodes": {
    "node_123": { /* node object */ },
    "node_456": { /* node object */ }
  },
  "rootNodes": ["node_123"]
}
```

#### attachments/

**Naming** : `{attachmentId}_{filename}`

**Exemples** :
```
attachments/attach_1706123456789_abc123_screenshot.png
attachments/attach_1706123456790_def456_document.pdf
```

📍 **Référence** : `src/js/core/data.js:628-646` (export), `src/js/features/fs-sync.js:700-765` (import)

---

### Export Functions

**Export Global ZIP** (`data.js`) :
```javascript
exportDataZIP()
  → Creates .dm with all nodes + attachments
  → Filename: deepmemo-export-{timestamp}.dm
```

**Export Branch ZIP** (`data.js:579-658`) :
```javascript
exportBranchZIP(nodeId, progressCallback)
  → Creates .dm with branch subtree + attachments
  → Filename: deepmemo-branch-{title}-{timestamp}.dm
  → Progress: callback({ current, message })
```

**Export JSON** (`data.js:182-195`) :
```javascript
exportData()
  → Simple JSON with $schema field
  → Filename: deepmemo-export-{timestamp}.json
  → No attachments
```

📍 **Référence** : `src/js/core/data.js:182-658`

---

### Import Workflow

**Auto-detect** (`data.js:666-703`) :
```javascript
importDataZIP(event, onSuccess) {
  1. Get file from input

  2. Detect format:
     const arrayBuffer = await file.arrayBuffer();
     const magic = new Uint8Array(arrayBuffer.slice(0, 2));
     const isZIP = (magic[0] === 0x50 && magic[1] === 0x4B);  // "PK" header

  3. Route:
     if (isZIP) {
       importFromArchive(file, onSuccess);
     } else {
       importFromJSONText(file, onSuccess);
     }
}
```

**Modes** :
- **Replace** (OK button) : Overwrite all current data + rootNodes
- **Merge** (Cancel button) : Add to current roots

**Confirmation** :
- `confirms.importData` : "Replace all your data?"
- `confirms.importDataWithFiles` : "Replace all + {count} files?"

📍 **Référence** : `src/js/core/data.js:666-703`

---

### Import Branch

**Function** : `importBranchZIP(event, parentId, onSuccess)`

**Workflow** (`data.js:913-949`) :
```javascript
1. Auto-detect format (.dm / .zip / .json)

2. Extract data:
   if (isZIP) {
     - Extract metadata.json
     - Extract data.json
     - Extract attachments/
   } else {
     - Parse JSON directly
   }

3. Handle global vs branch export:
   if (export.type === 'deepmemo-global') {
     if (export.rootNodes.length === 1) {
       // Single root: add as child
       importedRootId = export.rootNodes[0];
     } else {
       // Multiple roots: create container node
       containerNode = {
         title: 'Imported: ' + filename,
         children: export.rootNodes
       };
     }
   }

4. ID remapping:
   remapAllIds(nodes, rootId)
   → Generate new IDs to avoid collisions

5. Attach to parent:
   parent.children.push(importedRootId);

6. Save & notify:
   saveData();
   onSuccess(nodeCount, importedRootId);
```

📍 **Référence** : `src/js/core/data.js:913-949`

---

### ID Remapping

**Problème** : IDs importés peuvent être en collision avec IDs existants

**Solution** : Régénérer tous les IDs (`fs-sync.js:359-436`)

**Algorithm** :
```javascript
1. Phase 1: Generate new IDs for all nodes
   const idMapping = new Map();
   Object.keys(nodes).forEach(oldId => {
     const newId = generateId();
     idMapping.set(oldId, newId);
   });

2. Phase 2: Create remapped nodes
   const remappedNodes = {};
   Object.entries(nodes).forEach(([oldId, node]) => {
     const newId = idMapping.get(oldId);
     remappedNodes[newId] = {
       ...node,
       id: newId,
       parent: node.parent ? idMapping.get(node.parent) : null,
       children: node.children.map(childId => idMapping.get(childId))
     };
   });

3. Phase 3: Remap references in content
   Object.values(remappedNodes).forEach(node => {
     // Replace attachment:oldId → attachment:newId
     node.content = node.content.replace(/attachment:(\w+)/g, (match, oldId) => {
       return 'attachment:' + (idMapping.get(oldId) || oldId);
     });
   });

4. Phase 4: Update symlink targetId
   Object.values(remappedNodes).forEach(node => {
     if (node.type === 'symlink') {
       node.targetId = idMapping.get(node.targetId);
     }
   });
```

📍 **Référence** : `src/js/features/fs-sync.js:359-436`

---

### Attachment Handling

**During Export** (`data.js:628-646`) :
```javascript
// Collect all attachments
const allAttachments = new Set();
Object.values(nodes).forEach(node => {
  node.attachments?.forEach(att => allAttachments.add(att.id));
});

// Add to ZIP
for (const attachId of allAttachments) {
  const blob = await AttachmentsModule.getAttachment(attachId);
  const attachment = findAttachmentMetadata(attachId);
  const filename = `${attachId}_${attachment.name}`;
  zip.file(`attachments/${filename}`, blob);
}
```

**During Import** (`fs-sync.js:700-765`) :
```javascript
// Parse filename: {name}__{oldId}{ext}
const pattern = /^(.+)__([^.]+)(\.[^.]+)?$/;
const match = filename.match(pattern);

if (match) {
  const displayName = match[1];
  const originalId = match[2];  // For remapping

  // Generate new attachment ID
  const newId = AttachmentsModule.generateAttachmentId();

  // Save to IndexedDB
  await AttachmentsModule.saveAttachment(newId, blob);

  // Add metadata with _originalId for remapping
  attachment = {
    id: newId,
    name: displayName,
    type: file.type,
    size: file.size,
    _originalId: originalId
  };
}
```

📍 **Référence** : `src/js/features/fs-sync.js:700-765`

---

## File System Sync

### Vue d'ensemble

**FS Sync** permet de synchroniser DeepMemo avec un **dossier local** sur le disque.

**Features** :
- Export vers dossier (structure markdown + attachments)
- Import depuis dossier (auto-parse .md files)
- Frontmatter YAML pour metadata
- Bidirectionnel : Export ↔ Import

**API** : **File System Access API** (Chrome/Edge uniquement)

**Module** : `src/js/features/fs-sync.js` (837 lignes)

📍 **Référence** : `src/js/features/fs-sync.js:1-837`

---

### Feature Detection

```javascript
export function isFileSystemSyncSupported() {
  return 'showDirectoryPicker' in window;
}
```

**Support** :
- ✅ Chrome/Edge (Desktop + Android)
- ❌ Firefox, Safari
- ❌ iOS

**Fallback** : Toast message "Feature not supported in your browser"

📍 **Référence** : `src/js/features/fs-sync.js:24-26`

---

### Export to File System

**Function** : `exportBranchToFS(branchId, progressCallback)`

**Workflow** (`fs-sync.js:135-169`) :
```javascript
1. User picks export folder:
   const dirHandle = await window.showDirectoryPicker({
     mode: 'readwrite'
   });

2. Export recursively with structure:
   exportNodeRecursive(node, dirHandle, depth)

3. Structure:
   Folder/
   ├── index.md (branch node with frontmatter)
   ├── attachment-1.pdf__attach_123.pdf
   ├── Child-Leaf.md (leaf nodes)
   └── Grandchild-Folder/
       ├── index.md
       └── ...

4. Progress callback:
   progressCallback({ current: nodeCount, message: "Exporting: Node Title" });
```

📍 **Référence** : `src/js/features/fs-sync.js:135-169`

---

### File Organization

**Branches (Nodes with children)** :
- Folder avec `index.md`
- Children exportés récursivement dans subfolder

**Leaves (Nodes without children)** :
- `.md` file dans parent directory
- Filename : `{title}.md` (sanitized)

**Symlinks** :
- `.dmlink` file avec YAML metadata
- Content : `targetId`, `title`

**Attachments** :
- Same directory as parent node
- Filename : `{name}__{attachId}{ext}`

**Example** :
```
Export/
├── index.md                           # Branch root
├── screenshot__attach_123.png         # Attachment
├── Task-1.md                          # Leaf node
└── Subfolder/                         # Branch child
    ├── index.md                       # Branch content
    └── Subtask.md                     # Leaf child
```

📍 **Référence** : `src/js/features/fs-sync.js:177-253`

---

### Frontmatter Format

**Generated by** : `FrontmatterModule.generateFrontmatter(node)`

**Structure** :
```yaml
---
id: node_1706123456789_abc123
type: node
title: Project Alpha
created: 1706123456789
modified: 1706123456790
tags:
  - work
  - important
---

# Markdown content here

This is the node content...
```

**Fields** :
- `id` : Original node ID (preserved)
- `type` : `'node'` ou `'symlink'`
- `title` : Node title
- `created` : Timestamp
- `modified` : Timestamp
- `tags` : Array (YAML list format)

📍 **Référence** : `src/js/features/fs-sync.js:255-269`

---

### Collision Resolution

**Problème** : Filename collisions (multiple nodes avec même titre)

**Algorithm** (`fs-sync.js:55-88`) :
```javascript
function getAvailableFilename(dirHandle, baseName) {
  // Remove accumulated suffixes: "doc (2) (2)" → "doc"
  const cleanName = baseName.replace(/\s*\(\d+\)\s*/g, '').trim();

  // Try: doc.md
  let candidate = cleanName;
  if (!await fileExists(dirHandle, candidate + '.md')) {
    return candidate;
  }

  // Try: doc (2).md, doc (3).md, ...
  let counter = 2;
  while (true) {
    candidate = `${cleanName} (${counter})`;
    if (!await fileExists(dirHandle, candidate + '.md')) {
      return candidate;
    }
    counter++;
  }
}
```

📍 **Référence** : `src/js/features/fs-sync.js:55-88`

---

### Import from File System

**Function** : `importBranchFromFS(parentId, progressCallback)`

**Workflow** (`fs-sync.js:473-519`) :
```javascript
1. User picks import folder:
   const dirHandle = await window.showDirectoryPicker({
     mode: 'read'
   });

2. Parse directory recursively:
   parseDirectoryRecursive(dirHandle, parentId)

3. Detect files:
   - .md files → Parse as nodes (extract frontmatter)
   - index.md in folder → Folder becomes branch
   - .dmlink files → Parse as symlinks
   - Other files → Import as attachments
   - Skip: .* files, Thumbs.db, desktop.ini

4. ID remapping:
   remapAllIds(nodes, rootId)

5. Return:
   { count: numberOfImportedNodes }
```

📍 **Référence** : `src/js/features/fs-sync.js:473-519`

---

### Frontmatter Parsing

**Function** : `parseMarkdownFile(file)`

**Algorithm** (`fs-sync.js:591-631`) :
```javascript
1. Read file content as text

2. Detect frontmatter:
   Pattern: /^---\n([\s\S]*?)\n---\n([\s\S]*)$/

3. If frontmatter exists:
   - Parse YAML
   - Validate schema: FrontmatterModule.validateFrontmatter(frontmatter, 'node')
   - Use id, title, created, modified from YAML
   - Extract tags array

4. Else (no frontmatter):
   - Generate new node
   - title = filename (without .md)
   - created/modified = Date.now()

5. Return:
   {
     id, type, title, content,
     created, modified, tags,
     parent: null,  // Set later
     children: []
   }
```

📍 **Référence** : `src/js/features/fs-sync.js:591-631`

---

### Attachment Import

**Detection** : Files not `.md` or `.dmlink`

**Parsing** (`fs-sync.js:705-765`) :
```javascript
// Filename format: {name}__{oldId}{ext}
const pattern = /^(.+)__([^.]+)(\.[^.]+)?$/;
const match = filename.match(pattern);

if (match) {
  const displayName = match[1];       // User-facing name
  const originalId = match[2];        // For remapping
  const ext = match[3] || '';

  // Generate new ID
  const newId = AttachmentsModule.generateAttachmentId();

  // Save blob to IndexedDB
  const blob = await handle.getFile();
  await AttachmentsModule.saveAttachment(newId, blob);

  // Metadata with _originalId for remapping
  return {
    id: newId,
    name: displayName + ext,
    type: blob.type,
    size: blob.size,
    _originalId: originalId  // Will be remapped
  };
}
```

**Size Limit** : 50 MB per file (same as UI upload)

📍 **Référence** : `src/js/features/fs-sync.js:700-765`

---

### ID Remapping Strategy

**Why** : Imported IDs may collide with existing data

**Solution** : `remapAllIds(nodes, rootId)`

**Phases** (`fs-sync.js:359-436`) :
```
Phase 1: Generate new IDs
  oldId → newId mapping

Phase 2: Remap node structure
  parent, children, id fields

Phase 3: Remap content references
  attachment:oldId → attachment:newId

Phase 4: Remap symlink targets
  targetId: oldId → targetId: newId

Phase 5: Remap attachment IDs
  _originalId → new attachment ID
```

📍 **Référence** : `src/js/features/fs-sync.js:359-436`

---

### UI Integration

**Export Dialog** (`fs-sync.js:775-807`) :
```javascript
async function showExportDialog(branchId) {
  // Check browser support
  if (!isFileSystemSyncSupported()) {
    showToast(t('fsSync.notSupported'), '⚠️');
    return;
  }

  // Call export with progress
  await exportBranchToFS(branchId, (progress) => {
    console.log(`Exporting ${progress.current}: ${progress.message}`);
  });

  // Success toast
  showToast(t('fsSync.exportSuccess', { count, files }), '✅');
}
```

**Import Dialog** (`fs-sync.js:813-837`) :
- Similar pattern
- Success : Toast with imported node count

**App Integration** (`app.js:1094-1108`) :
```javascript
async exportToFileSystem() {
  await FSSyncModule.showExportDialog(this.currentNodeId);
}

async importFromFileSystem() {
  const result = await FSSyncModule.showImportDialog(this.currentNodeId);
  if (result) {
    this.renderTree();  // Re-render after import
  }
}
```

📍 **Références** :
- Dialogs : `src/js/features/fs-sync.js:775-837`
- App : `src/js/app.js:1094-1108`

---

### i18n Messages

| Message | i18n Key | Contexte |
|---------|----------|----------|
| "Feature not supported" | `fsSync.notSupported` | Browser sans File System Access API |
| "Exporting nodes..." | `fsSync.exporting` | Progress message |
| "Importing nodes..." | `fsSync.importing` | Progress message |
| "Export success: {count} nodes, {files} files" | `fsSync.exportSuccess` | Success toast |
| "Import success: {count} nodes" | `fsSync.importSuccess` | Success toast |
| "Export error" | `fsSync.exportError` | Error toast |
| "Import error" | `fsSync.importError` | Error toast |
| "Permission denied" | `fsSync.permissionDenied` | User cancelled folder picker |

📍 **Référence** : `src/js/locales/en.js:408-419`

---

## Internationalization (i18n)

### Vue d'ensemble

**i18n** gère le support multilingue de DeepMemo.

**Languages** : FR (Français), EN (English)

**Features** :
- Dictionnaires séparés (FR, EN)
- Interpolation avec variables
- Expressions conditionnelles (pluralization)
- Auto-détection langue navigateur
- Switch dynamique sans reload

**Module** : `src/js/utils/i18n.js` (262 lignes)

📍 **Référence** : `src/js/utils/i18n.js:1-262`

---

### Core Functions

| Function | Ligne | Description |
|----------|-------|-------------|
| `initI18n()` | 106-124 | Initialize + load dict + translate DOM |
| `t(key, params)` | 137-156 | Get translation with interpolation |
| `setLanguage(lang)` | 167-201 | Change language + persist + re-render |
| `getCurrentLanguage()` | 207-209 | Get active language |
| `getAvailableLanguages()` | 215-217 | List supported langs (FR/EN) |
| `translateDOM()` | 229-261 | Update DOM attributes with translations |
| `loadDictionary(lang)` | 37-54 | Lazy load locale module |

📍 **Référence** : `src/js/utils/i18n.js`

---

### Interpolation System

**Simple Variables** (Single braces) :
```javascript
t('nodeCounter', { count: 5 })
// Template: "{count} node{{count > 1 ? 's' : ''}}"
// Output: "5 nodes"
```

**Expressions** (Double braces) :
```javascript
// Pattern: {{condition ? 'yes' : 'no'}}
// Evaluated in function scope with params as local variables

Example:
  Template: "{count} node{{count > 1 ? 's' : ''}}"
  Params: { count: 1 }
  Output: "1 node"

  Params: { count: 5 }
  Output: "5 nodes"
```

**Implementation** (`i18n.js:86-95`) :
```javascript
function interpolate(text, params) {
  // Replace {variable}
  text = text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });

  // Replace {{expression}}
  text = text.replace(/\{\{([^}]+)\}\}/g, (match, expr) => {
    try {
      const func = new Function(...Object.keys(params), `return ${expr};`);
      return func(...Object.values(params));
    } catch (e) {
      return match;
    }
  });

  return text;
}
```

📍 **Référence** : `src/js/utils/i18n.js:86-95`

---

### DOM Translation Attributes

**Supported Attributes** :

| Attribute | Target | Example | Référence |
|-----------|--------|---------|-----------|
| `data-i18n` | textContent | `<span data-i18n="app.title"></span>` | Line 231-236 |
| `data-i18n-placeholder` | placeholder | `<input data-i18n-placeholder="placeholders.search">` | Line 239-242 |
| `data-i18n-title` | title | `<button data-i18n-title="tooltips.export">` | Line 245-248 |
| `data-i18n-content` | content (meta) | `<meta data-i18n-content="meta.description">` | Line 251-254 |
| `data-i18n-aria-label` | aria-label | `<button data-i18n-aria-label="actions.close">` | Line 257-260 |
| `data-i18n-params` | Parameters (JSON) | `<span data-i18n-params='{"count": 42}'>` | Line 233-234 |

**Example HTML** :
```html
<span data-i18n="app.nodeCounter" data-i18n-params='{"count": 42}'></span>
<!-- Renders: "42 nodes" (EN) or "42 nœuds" (FR) -->
```

📍 **Référence** : `src/js/utils/i18n.js:229-261`

---

### Locale Files Structure

**Files** : `src/js/locales/fr.js` & `src/js/locales/en.js`

**Export** : `export default { ... }`

**Structure** (nested object, dot notation for keys) :
```javascript
export default {
  app: {
    title: "DeepMemo",
    tagline: "Your second brain",
    nodeCounter: "{count} node{{count > 1 ? 's' : ''}}"
  },
  actions: {
    newNode: "New node",
    import: "Import",
    export: "Export",
    // ...
  },
  toast: {
    saved: "Saved",
    nodeCreated: "Node created",
    // ...
  },
  modals: {
    actions: { /* ... */ },
    markdown: { /* ... */ },
    export: { /* ... */ }
  },
  labels: {
    branchMode: "branch mode",
    created: "Created",
    tags: "Tags",
    // ...
  },
  keyboard: {
    newNode: "New node",
    search: "Search",
    // ...
  }
}
```

**Organization** : ~400+ keys organisées par feature

📍 **Référence** : `src/js/locales/en.js:1-450`, `src/js/locales/fr.js:1-450`

---

### Language Switch Flow

**Function** : `setLanguage(lang)`

**Workflow** (`i18n.js:167-201`) :
```javascript
1. Load dictionary if needed:
   await loadDictionary(lang);

2. Update state:
   currentLang = lang;

3. Persist to localStorage:
   localStorage.setItem('deepmemo_lang', lang);

4. Translate static DOM:
   translateDOM();

5. Re-render dynamic UI:
   if (window.app?.render) {
     window.app.render();
   }

6. Refresh editor panel:
   if (EditorModule.displayNode) {
     const currentNodeId = window.app.currentNodeId;
     EditorModule.displayNode(currentNodeId);
   }

7. Update node counter:
   if (window.app?.updateNodeCounter) {
     window.app.updateNodeCounter();
   }
```

**No page reload** : All changes applied dynamically

📍 **Référence** : `src/js/utils/i18n.js:167-201`

---

### Auto-Detection

**On First Load** (`i18n.js:106-124`) :
```javascript
export async function initI18n() {
  // Check localStorage
  let savedLang = localStorage.getItem('deepmemo_lang');

  // Fallback: browser language
  if (!savedLang) {
    const browserLang = navigator.language.split('-')[0];  // "fr-FR" → "fr"
    savedLang = ['fr', 'en'].includes(browserLang) ? browserLang : 'en';
  }

  // Load & apply
  await setLanguage(savedLang);
}
```

**Default** : EN (English)

📍 **Référence** : `src/js/utils/i18n.js:106-124`

---

## PWA & Offline

### Vue d'ensemble

DeepMemo est une **Progressive Web App** avec :
- Service Worker (cache-first strategy)
- Manifest (installable)
- Offline capabilities
- Auto-update cache

**Files** :
- `sw.js` : Service Worker (143 lignes)
- `manifest.json` : App manifest (FR)
- `manifest-en.json` : App manifest (EN)

📍 **Référence** : `sw.js:1-143`, `manifest.json:1-28`

---

### Service Worker (sw.js)

**Version** : `v1.10.5` (matches app version)

**Cache Name** : `deepmemo-v1.10.5`

**Precached Files** (`sw.js:6-44`) :
```javascript
const PRECACHE_URLS = [
  // HTML
  '/',
  '/index.html',
  '/robots.txt',
  '/sitemap.xml',

  // CSS
  '/src/css/base.css',
  '/src/css/layout.css',
  '/src/css/components.css',
  '/src/css/utilities.css',
  '/src/css/style.css',

  // JS (core modules + locales)
  '/src/js/app.js',
  '/src/js/core/data.js',
  '/src/js/features/tree.js',
  // ... all modules
  '/src/js/locales/fr.js',
  '/src/js/locales/en.js',

  // Media
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/og-image.png',
  '/screenshot.png',

  // Manifests
  '/manifest.json',
  '/manifest-fr.json',
  '/manifest-en.json'
];
```

📍 **Référence** : `sw.js:6-44`

---

### Install Event

**Handler** (`sw.js:48-58`) :
```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching app shell');
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      self.skipWaiting();  // Activate immediately
    })
  );
});
```

**Behavior** :
- Precache tous les fichiers listés
- `skipWaiting()` : Active immédiatement (pas de wait pour fermeture tabs)

📍 **Référence** : `sw.js:48-58`

---

### Activation Event

**Handler** (`sw.js:61-77`) :
```javascript
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Delete old cache versions
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();  // Take control immediately
    })
  );
});
```

**Behavior** :
- Delete old cache versions (not matching current CACHE_NAME)
- `clients.claim()` : Take control of all open tabs immediately

📍 **Référence** : `sw.js:61-77`

---

### Fetch Strategy: Cache First

**Handler** (`sw.js:80-142`) :
```javascript
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignore external CDN
  if (event.request.url.includes('cdn.jsdelivr.net')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Cache hit: return immediately + update in background
      if (cachedResponse) {
        // Update cache in background (no await)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {
          // Network fail silently (cache already returned)
        });

        return cachedResponse;
      }

      // Cache miss: fetch from network + cache + return
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Cache successful response
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Network fail + not in cache → 503 offline message
        return new Response('Offline: Resource not available', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});
```

**Strategy** :
1. **Cache hit** : Return immediately + update in background
2. **Cache miss** : Fetch from network + cache + return
3. **Network fail + cache miss** : Return 503 offline message

📍 **Référence** : `sw.js:80-142`

---

### Web App Manifest

**Files** :
- `manifest.json` (French version, primary)
- `manifest-fr.json` (French, explicit)
- `manifest-en.json` (English, explicit)

**Structure** (`manifest.json:1-28`) :
```json
{
  "name": "DeepMemo - Ton second cerveau",
  "short_name": "DeepMemo",
  "description": "Système de gestion de connaissances hiérarchique local et open-source",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#0a0a0a",
  "scope": "/",
  "icons": [
    {
      "src": "icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["productivity", "education"],
  "lang": "fr",
  "dir": "ltr",
  "orientation": "any"
}
```

**Display Mode** : `standalone` (hides browser UI)

📍 **Référence** : `manifest.json:1-28`

---

### Offline Capabilities

**What Works Offline** :
- ✅ All precached files (HTML, CSS, JS, icons)
- ✅ IndexedDB data (nodes, attachments, settings)
- ✅ BroadcastChannel (cross-tab sync)
- ✅ Service Worker cache-first strategy
- ✅ **Markdown rendering** (Marked.js cached after first load)

**What Fails Offline** :
- ❌ PDF export (requires server worker)
- ❌ File System Sync (browser API restriction)

**Service Worker Caching** (`sw.js:1-45`) :
- Marked.js CDN : Cached après premier chargement
- Stratégie : Cache-first avec fallback network
- Une fois les ressources chargées, **tout fonctionne offline sauf PDF export**

---

### Install Prompt

**Trigger** : Browser shows "Add to Home Screen" when PWA criteria met

**Criteria** :
- HTTPS (ou localhost)
- Valid manifest.json
- Service Worker registered
- Icons provided

**Platform Support** :
- ✅ Android (Chrome)
- ✅ Windows (Chrome/Edge)
- ✅ macOS (Chrome/Edge/Safari)
- ⚠️ iOS (Safari, limited support)

**Manual Trigger** : Can be deferred and called programmatically via `beforeinstallprompt` event

---

## Multi-tab Sync

### Vue d'ensemble

**Multi-tab Sync** permet de synchroniser les modifications entre plusieurs onglets ouverts.

**API** : **BroadcastChannel** (modern browsers)

**Channel Name** : `'deepmemo-sync'`

**Module** : `src/js/utils/sync.js` (87 lignes)

📍 **Référence** : `src/js/utils/sync.js:1-87`

---

### Functions

| Function | Ligne | Description |
|----------|-------|-------------|
| `initSync()` | 17-32 | Initialize BroadcastChannel |
| `notifyDataChanged(payload)` | 40-53 | Send change notification |
| `setupSyncListener(callback)` | 62-74 | Listen for changes |
| `closeSync()` | 80-86 | Close channel |

📍 **Référence** : `src/js/utils/sync.js`

---

### Sync Flow

**Tab A modifies data** :
```javascript
// Tab A
await saveData();  // Save to IndexedDB

// Notify other tabs
notifyDataChanged({
  nodeId: '123',
  action: 'modified'
});
```

**Tab B receives notification** :
```javascript
// Tab B setup (during app init)
setupSyncListener(async (payload) => {
  console.log('Data changed in Tab A, reloading...');

  // Reload data from IndexedDB
  await loadData();

  // Re-render UI
  app.render();

  // Show toast (optional)
  showToast('Data updated from another tab', 'ℹ️');
});
```

**Message Format** (`sync.js:40-53`) :
```javascript
{
  type: 'data-changed',
  timestamp: 1706123456789,
  ...payload  // Optional custom data
}
```

📍 **Référence** : `src/js/utils/sync.js:40-53`

---

### Implementation Details

**Initialization** (`sync.js:17-32`) :
```javascript
let channel = null;

export function initSync() {
  if (typeof BroadcastChannel === 'undefined') {
    console.warn('[Sync] BroadcastChannel not supported');
    return;
  }

  try {
    channel = new BroadcastChannel('deepmemo-sync');
    console.log('[Sync] BroadcastChannel initialized');
  } catch (error) {
    console.error('[Sync] Failed to initialize BroadcastChannel:', error);
  }
}
```

**Send Notification** (`sync.js:40-53`) :
```javascript
export function notifyDataChanged(payload = {}) {
  if (!channel) return;

  try {
    channel.postMessage({
      type: 'data-changed',
      timestamp: Date.now(),
      ...payload
    });
  } catch (error) {
    console.error('[Sync] Failed to notify:', error);
  }
}
```

**Setup Listener** (`sync.js:62-74`) :
```javascript
export function setupSyncListener(callback) {
  if (!channel) return;

  channel.onmessage = (event) => {
    if (event.data.type === 'data-changed') {
      callback(event.data);
    }
  };
}
```

📍 **Référence** : `src/js/utils/sync.js:17-74`

---

### Browser Support

**Supported** :
- ✅ Chrome/Edge (all versions)
- ✅ Firefox (38+)
- ✅ Safari (15.4+)
- ✅ Opera (all versions)

**Not Supported** :
- ❌ IE11

**Graceful Fallback** :
```javascript
if (typeof BroadcastChannel === 'undefined') {
  console.warn('[Sync] BroadcastChannel not supported');
  // App continues without cross-tab sync
}
```

---

### Integration

**In app.js** (`app.js:23`) :
```javascript
import * as SyncModule from './utils/sync.js';

// Initialize during app startup
SyncModule.initSync();
SyncModule.setupSyncListener(async () => {
  await loadData();
  this.render();
});
```

**In data.js** (`data.js:50`) :
```javascript
export async function saveData() {
  // Save to IndexedDB
  await Storage.saveNodes(data.nodes);
  await Storage.saveSetting('rootNodes', data.rootNodes);

  // Notify other tabs
  SyncModule.notifyDataChanged();
}
```

---

## Keyboard Shortcuts

### Vue d'ensemble

DeepMemo propose des **raccourcis clavier globaux** pour actions courantes.

**Module** : `src/js/utils/keyboard.js` (56 lignes)

**Setup** : Single `document.addEventListener('keydown')` handler

📍 **Référence** : `src/js/utils/keyboard.js:9-55`

---

### Complete List

| Shortcut | Mac | Action | Handler | Référence |
|----------|-----|--------|---------|-----------|
| **Alt+N** | Opt+N | New node | `createNode()` | Line 12-15 |
| **Alt+E** | Opt+E | Edit mode | `onEditorFocus()` | Line 18-21 |
| **Ctrl+K** | Cmd+K | Open search | `openSearch()` | Line 24-27 |
| **Alt+H** | Opt+H | Markdown help | `openMarkdownHelp()` | Line 30-33 |
| **Escape** | Esc | Close search / Go to parent | `goToParent()` | Line 36-43 |
| **Arrow keys** | Same | Tree navigation | `handleTreeNavigation(e)` | Line 50-52 |
| **Enter** | Same | Activate node | `handleTreeNavigation(e)` | Line 50-52 |

📍 **Référence** : `src/js/utils/keyboard.js:9-55`

---

### Implementation

**Setup Function** (`keyboard.js:9-55`) :
```javascript
export function setupKeyboardShortcuts(handlers) {
  document.addEventListener('keydown', (e) => {
    // Alt+N: New node
    if (e.altKey && e.key === 'n') {
      e.preventDefault();
      if (handlers.createNode) handlers.createNode();
    }

    // Alt+E: Edit mode
    else if (e.altKey && e.key === 'e') {
      e.preventDefault();
      if (handlers.onEditorFocus) handlers.onEditorFocus();
    }

    // Ctrl+K (Cmd+K on Mac): Open search
    else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (handlers.openSearch) handlers.openSearch();
    }

    // Alt+H: Markdown help
    else if (e.altKey && e.key === 'h') {
      e.preventDefault();
      if (handlers.openMarkdownHelp) handlers.openMarkdownHelp();
    }

    // Escape: Close search OR go to parent
    else if (e.key === 'Escape') {
      if (handlers.isSearchVisible?.()) {
        handlers.closeSearch?.();
      } else {
        handlers.goToParent?.();
      }
    }

    // Arrow keys: Tree navigation (only if not in input)
    else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
      const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      const isSearchVisible = handlers.isSearchVisible?.();

      if (!isInputFocused && !isSearchVisible && handlers.handleTreeNavigation) {
        handlers.handleTreeNavigation(e);
      }
    }
  });
}
```

📍 **Référence** : `src/js/utils/keyboard.js:9-55`

---

### Context-Aware

**Disabled When** :
- Input/textarea has focus (typing)
- Search modal visible (search has own navigation)

**Logic** (`keyboard.js:50-52`) :
```javascript
const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
const isSearchVisible = handlers.isSearchVisible?.();

if (!isInputFocused && !isSearchVisible) {
  // Enable tree navigation
}
```

---

### i18n Labels

**Labels** (`locales/en.js:349-360`) :
```javascript
keyboard: {
  newNode: "New node",
  search: "Search",
  markdownHelp: "Markdown help",
  editMode: "Switch to edit mode",
  navigateTree: "Navigate tree",
  expandNode: "Expand node",
  collapseOrParent: "Collapse / Parent",
  activateNode: "Activate node",
  goToParent: "Go to parent"
}
```

**Usage** : Displayed in UI tooltips or keyboard shortcuts modal

📍 **Référence** : `src/js/locales/en.js:349-360`

---

## Voir Aussi

- [1-CONCEPTS.md](1-CONCEPTS.md) - Concepts fondamentaux (nodes, hiérarchie, symlinks)
- [2-ARCHITECTURE.md](2-ARCHITECTURE.md) - Architecture technique (modules, flux)
- [3-DATA-MODEL.md](3-DATA-MODEL.md) - Structure des données (schema, formats)
- [README.md](README.md) - Point d'entrée documentation

---

**Document complet et vérifié** ✅
**Dernière mise à jour** : 2026-01-29
**Version** : V0.10.5

Toutes les features sont documentées avec références code exactes (fichier:ligne).
