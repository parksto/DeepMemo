# 4. Features

> **Version** : V0.11.0
> **Dernière mise à jour** : 2026-02-13
> **Sources vérifiées** : Toutes les features référencent le code source

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Navigation et arborescence](#navigation-et-arborescence)
3. [Branch Mode](#branch-mode)
4. [Markdown](#markdown)
5. [Export PDF](#export-pdf)
6. [Pièces jointes](#pièces-jointes)
7. [Tags](#tags)
8. [Recherche](#recherche)
9. [Drag & Drop](#drag--drop)
10. [Export/Import](#exportimport)
11. [File System Sync](#file-system-sync)
12. [Internationalisation (i18n)](#internationalisation-i18n)
13. [PWA et mode hors ligne](#pwa-et-mode-hors-ligne)
14. [Multi-Tab Sync](#multi-tab-sync)
15. [Raccourcis clavier](#raccourcis-clavier)

---

## Vue d'ensemble

DeepMemo V0.11.0 propose **15 features principales** organisées en 4 catégories :

### 📁 Navigation & Organisation
- **Navigation arborescence** : Arborescence hiérarchique avec déplier/replier
- **Branch Mode** : Isolation de sous-arbres pour focus
- **Symlinks** : Liens symboliques pour nœuds multi-parents

### ✍️ Contenu & Édition
- **Markdown** : Syntaxe complète + Live Preview
- **Export PDF** : Génération serveur avec TOC
- **Pièces jointes** : Téléversement intégré avec prévisualisation

### 🔍 Recherche & Organisation
- **Tags** : Autocomplétion + cloud + index multi-entrées
- **Recherche** : Texte intégral + portée branche + surbrillance

### 🔧 Avancé & Sync
- **Drag & Drop** : Déplacer/Copier/Lier avec modificateurs
- **Export/Import** : .dm (ZIP), JSON, branch
- **FS Sync** : Bidirectionnel vers dossier local
- **i18n** : FR/EN avec interpolation
- **PWA** : Hors ligne d'abord, installable
- **Multi-Tab Sync** : BroadcastChannel

---

## Navigation et arborescence

### Vue d'ensemble

**Module** : `src/js/features/tree.js` (723 lignes)

L'arborescence est le composant central qui affiche la structure hiérarchique dans la sidebar gauche.

**Features** :
- Rendu récursif de tous les nœuds visibles
- Déplier/replier avec état persisté
- Sélection + focus (clavier)
- Instance keys pour gestion des symlinks
- Extraction automatique d'emojis

📍 **Référence** : `src/js/features/tree.js:1-724`

---

### Fonctions Principales

| Fonction | Ligne | Description |
|----------|-------|-------------|
| `renderTree(onNodeClick)` | 220 | Rendu complet de l'arbre visible |
| `setCurrentInstanceKey(key)` | 72 | Sélectionne le nœud + auto-repli/extension du chemin |
| `setFocusedInstanceKey(key)` | 116 | Focus clavier sans sélection |
| `getInstanceKey(nodeId, parentContext)` | 65 | Génère instance key unique |
| `findInstanceKeyForNode(targetNodeId)` | 462 | Construit instance key par remontée |
| `expandTreeNode(instanceKey)` | 446 | Étendre le nœud pour afficher les enfants |
| `collapseTreeNode(instanceKey)` | 453 | Replier le nœud |
| `handleTreeNavigation(e, callback)` | 617 | Navigation clavier (↑↓←→ Enter) |
| `updateTreeFocus()` | 578 | Met à jour classes `.focused`/`.active` |

---

### Instance Keys

**Concept** : Identifiant unique d'une **occurrence** de nœud dans l'arbre.

**Pourquoi** : Un nœud peut apparaître plusieurs fois via symlinks → chaque occurrence doit être distinguable.

**Format** : `nodeId@parentInstanceKey@...@root`

**Exemples** :
```
node_root@root                                   // Nœud racine
node_child@node_root@root                        // Enfant direct
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

L'arborescence affiche différemment chaque type de nœud :

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

### Déplier/Replier

**Comportement** :
- **Clic sur flèche (▶/▼)** : Étendre/replier **sans** sélectionner le nœud
- **Clic sur titre** : Sélectionne le nœud (charge dans l'éditeur)
- **Auto-repli** : Lors de la sélection via `setCurrentInstanceKey()`, l'arborescence se replie puis reconstruit le chemin vers le nœud

**État** :
- Stocké dans `expandedNodes` (Set d'instance keys)
- Persisté dans localStorage (optionnel)

**Classes CSS** :
- `.tree-node.expanded` : Affiche `.tree-node-children`
- `.tree-node-toggle` : Arrow qui change de ▶ à ▼

📍 **Référence** : `src/js/features/tree.js:315-335` (basculement au clic), `tree.js:72-111` (auto-repli)

---

### Sélection et focus

**Sélection (Active)** :
- Nœud actuellement chargé dans l'éditeur
- Classe : `.tree-node-content.active`
- Fond accentué + surbrillance

**Focus (Clavier)** :
- Nœud actuellement ciblé par navigation clavier
- Classe : `.tree-node-content.focused`
- Bordure de contour

**Distinction** :
- Un nœud peut avoir le focus sans être actif (navigation sans sélection)
- Un nœud peut être actif ET avoir le focus (après Enter sur nœud ciblé)

📍 **Référence** : `src/js/features/tree.js:578-602` (updateTreeFocus)

---

### Navigation Clavier

| Touche | Action | Comportement |
|--------|--------|--------------|
| **↓** (ArrowDown) | Descendre | Cibler le nœud visible suivant |
| **↑** (ArrowUp) | Monter | Cibler le nœud visible précédent |
| **→** (ArrowRight) | Étendre | Étendre le nœud ciblé → afficher les enfants |
| **←** (ArrowLeft) | Replier/Parent | Si étendu : replier ; sinon : aller au parent |
| **Enter** | Sélectionner | Sélectionner le nœud ciblé → charger dans l'éditeur |

**Notes** :
- Fonctionne uniquement si l'arborescence a le focus (pas dans un champ de saisie)
- Focus automatique sur le premier nœud si aucun focus
- Défilement automatique pour rendre le nœud visible
- Symlinks externes : sélectionnables (pour suppression) mais avertissement toast

📍 **Référence** : `src/js/features/tree.js:617-723` (handleTreeNavigation)

---

### Structure HTML

**Par nœud** (`tree.js:220-441`) :
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
- `.tree-node` : Conteneur principal
- `.tree-node.expanded` : Affiche les enfants
- `.tree-node-content` : Ligne cliquable
- `.tree-node-content.active` : Nœud sélectionné
- `.tree-node-content.focused` : Focus clavier
- `.tree-node-content.dragging` : En cours de glisser-déposer
- `.tree-node-content.drag-over` : Survol pendant glisser-déposer

📍 **CSS** : `src/css/components.css:254-357`, `src/css/components.css:892-909`

---

## Branch Mode

### Vue d'ensemble

**Branch Mode** permet d'**isoler un sous-arbre** pour travailler sur une branche spécifique sans distraction.

**Activation** :
- URL : `?branch=node_123#/node/node_456`
- UI : Bouton "Copy Branch URL" → génère URL

**Effets** :
- Sidebar affiche **uniquement** les descendants de `branchRootId`
- Breadcrumb commence à `branchRootId` (pas racine globale)
- Portée de recherche limitée à la branche
- Bouton "New Root Node" désactivé
- Titre de page : `"DeepMemo - [Branch Name]"`

📍 **Référence** : `src/js/features/tree.js:136-162` (enable/disable)

---

### Activation/Désactivation

**Enable** (`tree.js:136-151`) :
```javascript
export function enableBranchMode(nodeId) {
  branchMode = true;
  branchRootId = nodeId;
  const instanceKey = getInstanceKey(nodeId, null);
  expandedNodes.add(instanceKey);  // Extension automatique de la racine de branche
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

**Flux** (`routing.js` → `app.js` → `tree.js`) :

1. L'utilisateur visite : `https://deepmemo.org/?branch=node_123#/node/node_456`
2. **`routing.js:12-33`** : Analyser l'URL
   ```javascript
   parseHash() {
     const urlParams = new URLSearchParams(window.location.search);
     const branchRootId = urlParams.get('branch');
     // Retourne: { mode: 'branch', branchRootId, nodeId }
   }
   ```
3. **`app.js:187-204`** : Naviguer vers le hash
   ```javascript
   if (route.mode === 'branch' && route.branchRootId) {
     TreeModule.enableBranchMode(route.branchRootId);
   }
   ```
4. **`tree.js:435`** : Rendu uniquement des descendants de la branche
5. **`editor.js:310`** : Breadcrumb s'arrête à la racine de branche

📍 **Références** :
- `src/js/utils/routing.js:12-33`
- `src/js/app.js:187-204`
- `src/js/features/tree.js:435`

---

### Isolation Comportement

Quand branch mode est actif :

| Fonctionnalité | Comportement Normal | Comportement Branch |
|---------|---------------------|---------------------|
| **Sidebar** | Tous les nœuds racines | Uniquement `branchRootId` + descendants |
| **"New Root Node"** | Activé | **Désactivé** (peut seulement ajouter des enfants) |
| **Recherche** | Globale | **Limitée** aux descendants de la branche |
| **Breadcrumb** | Racine → ... → Nœud | **Racine de branche → ... → Nœud** |
| **Titre de page** | "DeepMemo" | "DeepMemo - [Nom de branche]" |
| **Copie URLs** | Préserve le contexte | Préserve le paramètre `?branch=` |

📍 **Références** :
- Disable new root : `app.js:261-264`
- Scoped search : `search.js:49-65`
- Breadcrumb : `editor.js:310`
- Page title : `tree.js:201-214`

---

### Branch Indicator UI

**Élément** : `<div class="branch-mode-indicator" id="branchModeIndicator">`

**Emplacement** : Sidebar, au-dessus de l'arborescence

**Contenu** :
- Texte : "🌿 branch mode" (i18n : `labels.branchMode`)
- Bouton sortie : "⤴️" lien vers `#/node/{branchRootId}` (sort du branch mode)

**Affichage** :
- Masqué par défaut : `display: none`
- Affiché en branch mode : `display: flex`

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

### URLs de favoris

> **Note** : DeepMemo est **LocalFirst** - les URLs fonctionnent uniquement sur le **même PC, même navigateur, même utilisateur**. Ce sont des bookmarks de navigation locale, pas des liens partageables entre utilisateurs.

**URL du nœud courant** (préserve le contexte de branche) :
```javascript
getNodeUrl(nodeId, branchRootId)
// → https://deepmemo.org/?branch=node_123#/node/node_456
```

**URL d'isolation de branche** (crée toujours une branche) :
```javascript
getBranchUrl(branchRootId)
// → https://deepmemo.org/?branch=node_456#/node/node_456
```

**Boutons UI** (Panneau droit) :
- 🔗 "Copy node URL" : Préserve le contexte (si branch mode, inclut `?branch=`)
- 🌿 "Copy branch URL" : Force le mode branche sur le nœud courant

📍 **Références** :
- `src/js/utils/routing.js:80-95`
- `index.html:155-166` (copy URL buttons)
- `src/js/features/editor.js:963-977` (updateShareLinks)

---

### External Symlinks

**Définition** : Symlink dont le `targetId` pointe vers un nœud **hors de la branche actuelle**.

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
- ✅ **Cliquable** (sélectionnable pour suppression)
- ❌ **Non-déplaçable** (pas de glisser-déposer)
- ⚠️ **Avertissement toast** : "External link to branch (not accessible)"
- ❌ **Pas d'enfants** (agit comme feuille morte, `hasChildren = false`)
- ❌ **Non-navigable** (cible hors de vue)

**Raison** : Suivre le lien briserait l'isolation de la branche.

📍 **Références** :
- Détection : `tree.js:262-272`
- Pas d'enfants : `tree.js:301-302`
- Pas de glisser-déposer : `tree.js:406-414`
- Toast : `tree.js:400-404`

---

### Workflows

#### Workflow : Entrer en Branch Mode

1. L'utilisateur clique sur "Copy Branch URL" (🌿) dans le panneau droit
2. Génère l'URL : `?branch=node_123#/node/node_123`
3. Copie dans le presse-papiers
4. L'utilisateur colle l'URL dans un nouvel onglet (même navigateur)
5. Nouvelle session :
   - `routing.js` analyse le paramètre `?branch=`
   - `app.js` appelle `enableBranchMode(node_123)`
   - Nouveau rendu de la sidebar avec uniquement les descendants
   - Indicateur "🌿 branch mode" affiché
   - Breadcrumb commence à node_123
   - Portée de recherche limitée

#### Workflow : Sortir de Branch Mode

1. L'utilisateur clique sur "⤴️" dans l'indicateur de branche
2. Navigation vers `#/node/{branchRootId}` (sans `?branch=`)
3. `routing.js` détecte l'absence du paramètre `?branch=`
4. `app.js` appelle `disableBranchMode()`
5. Nouveau rendu de la sidebar avec tous les nœuds racines
6. Indicateur masqué
7. Breadcrumb jusqu'à la racine globale

---

## Markdown

### Vue d'ensemble

DeepMemo supporte **Markdown complet** avec :
- Prévisualisation en direct en écran divisé (optionnel)
- Rendu via Marked.js (CDN)
- Support des images inline (pièces jointes)
- Coloration syntaxique pour les blocs de code

**Modules** :
- `src/js/features/editor.js` : Rendu en mode visualisation
- `src/js/features/preview.js` : Prévisualisation en direct en écran divisé
- `src/js/features/modals.js` : Fenêtre modale d'aide Markdown

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

### Prévisualisation en Direct (écran divisé)

**Module** : `src/js/features/preview.js`

**Fonctionnalités** :
- Écran divisé : Éditeur (gauche) + Prévisualisation (droite)
- Mises à jour différées (300ms) pour la performance
- Synchronisation du défilement : Position du curseur → Défilement de la prévisualisation
- Correspondance des lignes : Lignes Markdown → Éléments HTML
- ResizeObserver : Ajustement automatique des hauteurs

**Activation** :
- Bouton : `#togglePreview` (`index.html:221`)
- État : Persisté dans `localStorage.deepmemo_previewEnabled`

**Mobile** : Désactivé automatiquement sur écrans < 768px

📍 **Référence** : `src/js/features/preview.js:103-507`

---

#### Mises à Jour Différées

**Problème** : Nouveau rendu de la prévisualisation à chaque frappe → latence

**Solution** : Différer de 300ms (`preview.js:359-367`)
```javascript
let debounceTimer = null;

function schedulePreviewUpdate() {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    updatePreview();
  }, 300);  // Délai de 300ms
}
```

**Résultat** : Mise à jour de la prévisualisation seulement après 300ms d'inactivité

---

#### Synchronisation du Défilement

**Objectif** : Synchroniser le défilement de la prévisualisation avec la position du curseur dans l'éditeur

**Algorithme** (`preview.js:387-476`) :
1. Détecter la position du curseur (ligne courante dans la zone de texte)
2. Associer la ligne markdown → élément HTML dans la prévisualisation
3. Calculer la position proportionnelle (curseur / total de lignes)
4. Défilement de la prévisualisation à la position équivalente

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

### Pipeline de rendu

**Mode Visualisation** (`editor.js:897-934`) :
```
1. Récupérer node.content (markdown)
2. Appeler window.marked.parse(content)
3. processAttachmentUrls(html, node)
   → Remplacer attachment:ID par des blob URLs
4. Rendu dans la div .markdown-content
```

**Traitement des URL de Pièces Jointes** (`editor.js:48-105`) :
```javascript
Pattern: /attachment:([a-zA-Z0-9_]+)/g

Pour chaque correspondance :
  1. Extraire l'ID de la pièce jointe
  2. Récupérer le blob depuis IndexedDB
  3. Obtenir le type MIME depuis les métadonnées node.attachments
  4. Recréer le blob avec le type correct (critique pour SVG)
  5. Créer l'URL blob : URL.createObjectURL(blob)
  6. Remplacer "attachment:ID" → URL blob
  7. Suivre dans activeBlobUrls[] pour le nettoyage
```

**Gestion de la Mémoire** :
- Blob URLs créés avec `URL.createObjectURL()`
- Suivis dans le tableau `activeBlobUrls`
- Nettoyage avec `URL.revokeObjectURL()` quand le nœud change

📍 **Référence** : `src/js/features/editor.js:48-105`

---

### Fenêtre Modale d'Aide Markdown

**Déclenchement** :
- Clavier : `Alt+H`
- UI : Panneau de paramètres (à vérifier)
- Code : `app.openMarkdownHelp()` → `ModalsModule.openMarkdownHelp()`

**Contenu** : Généré dynamiquement via i18n (`modals.js:560-646`)

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

## Export PDF

### Vue d'ensemble

**PDF Export** génère un document PDF hiérarchique avec :
- Table of Contents (TOC) auto-générée
- Numérotation hiérarchique (1, 1.1, 1.1.1)
- Support images (base64)
- Gestion symlinks (full content OU citations)

**Processus** :
1. Le client prépare les données (résoudre les symlinks, convertir les images en base64)
2. Envoyer au point de terminaison Worker (POST `/api/pdf-export`)
3. Le Worker génère le PDF avec jsPDF
4. Le client télécharge le blob

---

### Export/Import Modal (Modale unifiée)

**UI Modal** : `index.html:349-456`

La modale unifiée **Import/Export** propose 2 onglets (Export/Import) avec tous les formats disponibles.

**Accès** :
- **Actions globales** : Boutons dans le right panel (panneau ℹ️) → Import/Export directs (ZIP uniquement)
- **Actions branche** : Bouton `📤 Import & Export` en bas à droite d'un nœud → Ouvre la modale avec tous les formats

#### Onglet Export

| Format | Extension | Gestionnaire | Disponible | Description |
|--------|-----------|---------|------------|-------------|
| **ZIP** | `.dm` | `confirmExportZIP()` | Global + Branche | Archive complète avec pièces jointes |
| **FreeMind** | `.mm` | `confirmExportFreeMind()` | Branche | Format XML de carte mentale |
| **Mermaid** | `.svg` | `confirmExportMermaid()` | Branche | Visualisation de diagramme |
| **PDF** | `.pdf` | `confirmExportPDF()` | Branche | Document hiérarchique |
| **File System** | dossier | `confirmExportFS()` | Branche | Export vers système de fichiers local |

#### Onglet Import

| Format | Input | Gestionnaire | Disponible | Description |
|--------|-------|---------|------------|-------------|
| **ZIP/DM/JSON** | fichier | `handleImportExportFile()` | Global + Branche | Import depuis fichier `.dm`, `.zip` ou `.json` |
| **File System** | dossier | `confirmImportFS()` | Branche | Import depuis système de fichiers local |

**Système de tabs** :
- `selectImportExportTab('export')` : Affiche l'onglet Export
- `selectImportExportTab('import')` : Affiche l'onglet Import

📍 **Référence** : `src/js/app.js:542-657` (modale), `src/js/app.js:659-725` (handlers export), `src/js/app.js:1147-1195` (handlers FS)

---

### PDF Generation Pipeline

**Flux** (`app.js:983-1055`) :
```
1. Vérifier le statut en ligne (ligne 985)
   → Si hors ligne : showToast("PDF export requires internet")

2. Préparer les données PDF (ligne 997) :
   executePdfExport() {
     - Résoudre les symlinks vers les nœuds cibles
     - Convertir les images de pièces jointes en base64
     - Détecter les symlinks externes (mode branche)
   }

3. Envoyer au Worker (ligne 1004) :
   POST ${workerURL}/api/pdf-export
   Body: { nodes, rootId, type: 'branch' }

4. Gérer la limitation de débit (lignes 1015-1019) :
   Lire les en-têtes :
   - X-RateLimit-Remaining-Hour
   - X-RateLimit-Remaining-Day

5. Télécharger le blob (ligne 1031) :
   const blob = await response.blob();
   downloadBlob(blob, filename);

6. Mettre à jour l'UI (lignes 1036-1044) :
   - Sauvegarder les limites de débit dans localStorage
   - Afficher le message de succès
```

**Worker URL** : Auto-detected (`app.getWorkerURL()`)

📍 **Référence** : `src/js/app.js:983-1055` (executePdfExport)

---

### PDF Generation Details

**Stratégie** : Utilise **Marked.js** pour convertir markdown → HTML, puis génère le PDF

📍 **Marked.js dans Worker et CLI** :
- `cloudflare-worker/worker.js` : Parsing markdown pour PDF online
- `bin/branch2pdf.js:2` : `const { marked } = require("marked");`
- `bin/branch2pdf.js:15` : `const html = marked.parse(markdown);`

**Features** :
- Table of Contents auto-générée
- Numérotation hiérarchique (1, 1.1, 1.1.1)
- Page breaks automatiques
- Support images base64
- Symlink handling (full content OU citations)

---

### Rate Limiting

**Objectif** : Prévenir l'abus du service de génération PDF

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

**Côté Serveur** (Notice de confidentialité, `index.html:400-434`) :
- IP haché avec SHA-256
- Stocké 24h maximum
- Aucune donnée de document sauvegardée
- En-têtes de limitation de débit retournés

**Fenêtre Modale de Confidentialité** (`index.html:395-447`) :
- Affichée lors de la première tentative d'export PDF
- Case à cocher "Ne plus afficher"
- Indicateur de rejet : `localStorage.deepmemo_pdf_privacy_accepted`

📍 **Références** :
- Client rate limit : `src/js/app.js:687-732`
- Privacy modal : `index.html:395-447`

---

## Pièces jointes

### Vue d'ensemble

**Pièces jointes** permet de téléverser des fichiers et de les intégrer dans le contenu markdown.

**Fonctionnalités** :
- Téléversement de n'importe quel type de fichier
- Limite : **50 MB par fichier**
- Stockage : IndexedDB (blobs séparés)
- Images inline : `![alt](attachment:ID)`
- UI de téléchargement/suppression

**Module** : `src/js/core/attachments.js`

📍 **Référence** : `src/js/core/attachments.js:1-265`

---

### Fonctions de l'API

| Fonction | Paramètres | Retour | Description |
|----------|--------|---------|-------------|
| `generateAttachmentId()` | aucun | `string` | Générer `attach_{timestamp}_{random}` |
| `saveAttachment(id, blob)` | id, blob | `Promise<void>` | Sauvegarder le blob dans IndexedDB |
| `getAttachment(id)` | id | `Promise<Blob\|null>` | Récupérer le blob |
| `deleteAttachment(id)` | id | `Promise<void>` | Supprimer le blob |
| `listAttachments()` | aucun | `Promise<string[]>` | Obtenir tous les IDs |
| `getTotalSize()` | aucun | `Promise<number>` | Total d'octets utilisés |
| `cleanOrphans(data)` | data | `{deleted, freed}` | Supprimer les fichiers non référencés |
| `cleanOrphanedReferences(data)` | data | `{cleaned, nodes}` | Supprimer les références invalides |
| `formatFileSize(bytes)` | bytes | `string` | Formater "1.2 MB" |

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

**Stockage** :
- **Métadonnées** : Dans le tableau `node.attachments` (table IndexedDB `nodes`)
- **Blob** : Dans la table IndexedDB `attachments` (clé-valeur : `id → Blob`)

📍 **Référence** : `src/js/core/storage.js:26-36` (schema)

---

### Flux de téléversement

**Déclenchement** :
```javascript
app.triggerFileUpload()
  → Clic sur l'input caché : #attachmentFileInput
```

**Gestionnaire** (`app.js:1397-1453`) :
```javascript
1. Récupérer le fichier depuis input.files[0]

2. Vérifier la taille :
   if (file.size > 50 * 1024 * 1024) {
     showToast('File too large (max 50MB)');
     return;
   }

3. Générer l'ID de pièce jointe :
   const attachId = AttachmentsModule.generateAttachmentId();

4. Sauvegarder dans IndexedDB :
   await AttachmentsModule.saveAttachment(attachId, file);

5. Ajouter les métadonnées au nœud :
   node.attachments.push({
     id: attachId,
     name: file.name,
     type: file.type,
     size: file.size,
     created: Date.now(),
     modified: Date.now()
   });

6. Sauvegarder le nœud :
   await saveData();

7. Nouveau rendu de l'éditeur :
   EditorModule.displayNode(currentNodeId);

8. Afficher le message :
   showToast(`File attached: ${file.name}`);

9. Réinitialiser l'input :
   event.target.value = '';
```

📍 **Référence** : `src/js/app.js:1397-1453`

---

### Composants UI

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

**Rendu** (`editor.js:48-105`) :
```javascript
Pattern: /attachment:([a-zA-Z0-9_]+)/g

Pour chaque correspondance :
  1. Extraire l'ID de pièce jointe
  2. Récupérer le blob depuis IndexedDB : getAttachment(attachId)
  3. Obtenir le type MIME depuis les métadonnées node.attachments
  4. Recréer le blob avec le MIME correct (important pour SVG) :
     if (blob.type !== correctMime) {
       blob = new Blob([blob], { type: correctMime });
     }
  5. Créer l'URL blob : URL.createObjectURL(blob)
  6. Remplacer dans le HTML : attachment:ID → blob:http://...
  7. Suivre dans activeBlobUrls[] pour le nettoyage
```

**Gestion de la Mémoire** :
- **activeBlobUrls[]** : Suivre toutes les URL blob créées
- **cleanupBlobUrls()** : Révoquer toutes les URLs lors du changement de nœud
- **Nettoyage automatique** : Appelé lors du changement de nœud pour prévenir les fuites mémoire

📍 **Référence** : `src/js/features/editor.js:48-105`

---

### Flux de téléchargement

**Gestionnaire** (`app.js:1470-1490`) :
```javascript
async downloadAttachment(attachId, filename) {
  1. Récupérer le blob : const blob = await AttachmentsModule.getAttachment(attachId);

  2. Créer l'URL blob : const blobUrl = URL.createObjectURL(blob);

  3. Créer l'élément <a> :
     const a = document.createElement('a');
     a.href = blobUrl;
     a.download = filename;

  4. Déclencher le téléchargement : a.click();

  5. Nettoyage : URL.revokeObjectURL(blobUrl);

  6. Message : showToast('Download started');
}
```

📍 **Référence** : `src/js/app.js:1470-1490`

---

### Opérations de nettoyage

**Fichiers Orphelins** (`attachments.js:90-124`) :
```javascript
cleanOrphans(data) {
  1. Lister tous les IDs de pièces jointes dans IndexedDB
  2. Lister tous les IDs de pièces jointes référencés dans les nœuds
  3. Trouver la différence : orphelins = dbIds - referencedIds
  4. Supprimer chaque orphelin d'IndexedDB
  5. Retourner : { deleted: count, freed: bytes }
}
```

**Références Orphelines** (`attachments.js:132-162`) :
```javascript
cleanOrphanedReferences(data) {
  1. Lister tous les IDs de pièces jointes dans IndexedDB
  2. Pour chaque node.attachments[] :
     if (!dbIds.includes(attachment.id)) {
       Supprimer de node.attachments
     }
  3. Retourner : { cleaned: count, nodes: [nodeIds] }
}
```

**UI Buttons** (Right panel) :
- "Clean Orphaned Files" → `app.cleanOrphanedAttachments()`
- "Clean Orphaned Refs" → `app.cleanOrphanedNodes()`

📍 **Référence** : `src/js/core/attachments.js:90-162`

---

### Estimation du stockage

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

**Tags** permet d'organiser les nœuds avec des mots-clés.

**Fonctionnalités** :
- Autocomplétion (max 10 suggestions)
- Nuage de tags (panneau droit)
- Index multi-entrées IndexedDB pour recherche rapide
- Portée : globale OU branche
- Stockage et recherche insensibles à la casse (normalisé en minuscules)

**Module** : `src/js/features/tags.js` (352 lignes)

📍 **Référence** : `src/js/features/tags.js:1-352`

---

### Fonctions de l'API

| Fonction | Ligne | Description |
|----------|-------|-------------|
| `setCurrentNodeId(nodeId)` | 19-21 | Définit le nœud courant |
| `renderTags()` | 26-93 | Rendu des tags + input |
| `addTag(tag)` | 98-133 | Ajoute le tag au nœud |
| `removeTag(tag)` | 138-150 | Supprime le tag |
| `handleTagInput(e)` | 155-192 | Gère Enter/Flèches/Échap |
| `handleTagAutocomplete(e)` | 197-220 | Filtre les suggestions |
| `collectAllTagsForAutocomplete()` | 225-243 | Collecte tous les tags (global) |
| `collectBranchTags()` | 320-352 | Collecte les tags de la branche + descendants |
| `renderTagAutocomplete()` | 248-263 | Rendu du menu déroulant |
| `navigateTagAutocomplete(direction)` | 268-276 | Navigation ↑↓ |
| `selectTagSuggestion(index)` | 281-289 | Sélectionne la suggestion |

📍 **Référence** : `src/js/features/tags.js`

---

### Autocomplete

**Workflow** :
```
1. L'utilisateur donne le focus à #tagInput
2. Tape "pro"
3. handleTagAutocomplete() se déclenche :
   → collectAllTagsForAutocomplete()
   → Filtrer par "pro" (insensible à la casse)
   → Trier par fréquence (plus utilisés en premier)
   → Max 10 suggestions
4. renderTagAutocomplete() affiche le menu déroulant
5. L'utilisateur appuie sur Enter OU clique sur une suggestion
   → addTag(tag) s'exécute
   → node.tags.push(tag)
   → saveData()
   → renderTags() rafraîchissement
   → updateRightPanel() rafraîchissement du nuage de tags
```

**Priorité Suggestions** (`tags.js:225-243`) :
```javascript
// Compter les occurrences de tags dans tous les nœuds
const tagCounts = new Map();
Object.values(data.nodes).forEach(node => {
  node.tags?.forEach(tag => {
    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
  });
});

// Trier par nombre décroissant
const sortedTags = [...tagCounts.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([tag]) => tag);

// Filtrer par requête
const filtered = sortedTags.filter(tag =>
  tag.toLowerCase().includes(query.toLowerCase())
);

return filtered.slice(0, 10);  // Max 10
```

📍 **Référence** : `src/js/features/tags.js:225-243`

---

### Navigation clavier

**Dans autocomplete dropdown** :

| Touche | Action |
|--------|--------|
| **↓** (ArrowDown) | Sélectionner la suggestion suivante |
| **↑** (ArrowUp) | Sélectionner la suggestion précédente |
| **Enter** | Ajouter le tag sélectionné OU ajouter le texte tapé |
| **Échap** | Fermer l'autocomplétion |

**Logique** (`tags.js:155-192`) :
```javascript
handleTagInput(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const selectedTag = tagAutocompleteSuggestions[tagAutocompleteIndex];
    const tagToAdd = selectedTag || input.value.trim();
    if (tagToAdd) addTag(tagToAdd);
  }
  else if (e.key === 'ArrowDown') {
    navigateTagAutocomplete(1);  // Suivant
  }
  else if (e.key === 'ArrowUp') {
    navigateTagAutocomplete(-1);  // Précédent
  }
  else if (e.key === 'Escape') {
    hideTagAutocomplete();
  }
}
```

📍 **Référence** : `src/js/features/tags.js:155-192`

---

### Portée

**Autocomplétion** : **Globale** (tous les nœuds)
- Collecte les tags de tous les nœuds
- Trier par fréquence

**Nuage de Tags (Panneau Droit)** : **Branche** (nœud courant + descendants)
- Si branch mode : descendants de branchRootId
- Sinon : descendants de currentNodeId
- Fonction : `collectBranchTags()`

📍 **Référence** : `src/js/features/tags.js:320-352` (collectBranchTags)

---

### Stockage

**Dans le Nœud** :
```javascript
node.tags = ['work', 'urgent', 'project'];  // Tableau de chaînes
```

**IndexedDB** :
- Table : `nodes`
- Index : `*tags` (index multi-entrées)
- Requête exemple : `db.nodes.where('tags').equals('work')`

**Pourquoi multi-entrées** :
- Un nœud peut avoir plusieurs tags
- L'index multi-entrées crée une entrée par tag
- Permet des requêtes rapides par tag

📍 **Référence** : `src/js/core/storage.js:28` (schema definition)

---

### Composants UI

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

**Classes CSS** :
- `.tag` : Élément tag
- `.tag-remove` : Bouton de suppression (×)
- `.tag-autocomplete` : Menu déroulant (positionné en absolu)
- `.tag-autocomplete-item` : Suggestion
- `.tag-autocomplete-item.selected` : Surbrillance de navigation

📍 **CSS** : `src/css/components.css` (tags styles)

---

### Intégration avec recherche

**Clic sur Tag** → Ouvrir la Recherche avec Tag :

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

## Recherche

### Vue d'ensemble

**Recherche** propose une recherche en texte intégral dans tous les nœuds.

**Fonctionnalités** :
- Recherche en texte intégral (titre + contenu + tags)
- Portée mode branche (nœuds dans la branche uniquement)
- Surbrillance des correspondances
- Navigation clavier (↑↓ Enter)
- Aperçus d'extraits avec contexte

**Module** : `src/js/features/search.js` (257 lignes)

**Déclenchement** : `Ctrl+K` (raccourci clavier)

📍 **Référence** : `src/js/features/search.js:1-257`

---

### Fonctions de l'API

| Fonction | Ligne | Description |
|----------|-------|-------------|
| `openSearch(prefillText)` | 20-39 | Ouvre la modale + focus automatique |
| `closeSearch()` | 44-52 | Ferme la modale + réinitialise l'état |
| `performSearch(query)` | 58-110 | Effectue la recherche |
| `getNodePath(nodeId)` | 117-128 | Chemin breadcrumb (parent › nœud) |
| `renderSearchResults(query)` | 134-163 | Rendu des résultats avec surbrillance |
| `handleSearchNavigation(e)` | 169-191 | Navigation clavier |
| `selectSearchResult(index)` | 197-207 | Sélectionne et navigue vers le nœud |
| `scrollSearchResultIntoView()` | 212-217 | Défilement fluide vers la sélection |
| `setupSearchInput()` | 222-250 | Configuration des gestionnaires d'événements |
| `isSearchVisible()` | 255-257 | Obtenir l'état |

📍 **Référence** : `src/js/features/search.js`

---

### Algorithme de Recherche

**Portée** (`search.js:70-74`) :
```javascript
Object.values(data.nodes).forEach(node => {
  // Mode branche : ignorer les nœuds hors de la branche
  if (!isNodeInBranch(node.id)) {
    return;
  }

  // ... logique de recherche
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

**Correspondance de Contenu** (`search.js:88-94`) :
```javascript
if (contentMatch) {
  // Extraire 50 caractères avant/après la correspondance
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

### Navigation clavier

**Dans search modal** :

| Touche | Action | Référence |
|--------|--------|-----------|
| **↓** | Sélectionner le résultat suivant | `search.js:175-179` |
| **↑** | Sélectionner le résultat précédent | `search.js:181-185` |
| **Enter** | Ouvrir le nœud sélectionné → fermer la recherche | `search.js:187-190` |
| **Échap** | Fermer la recherche | Gestionnaire global |

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

### Composants UI

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
      <!-- Résultats rendus dynamiquement -->
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

**Classes CSS** :
- `.search-modal` : Superposition modale
- `.search-modal.active` : État visible
- `.search-result` : Élément de résultat
- `.search-result.selected` : Surbrillance de navigation
- `.search-result-title` : Titre du nœud
- `.search-result-path` : Breadcrumb
- `.search-result-preview` : Extrait de contenu

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

**Drag & Drop** permet de réorganiser les nœuds via glisser-déposer.

**Opérations** :
- **Déplacer** (défaut) : Changer le parent
- **Copier** (Ctrl) : Dupliquer récursivement
- **Lier** (Ctrl+Alt) : Créer un symlink

**Zones de dépôt** :
- **Avant** : Insérer avant la cible
- **Après** : Insérer après la cible
- **Intérieur** : Changer le parent (ou action spéciale selon les modificateurs)

**Module** : `src/js/features/drag-drop.js` (447 lignes)

📍 **Référence** : `src/js/features/drag-drop.js:1-447`

---

### Opérations

| Action | Modificateurs | Zone de Dépôt | Effet | Référence |
|--------|-----------|-----------|-------|-----------|
| **Déplacer** | Aucun | Intérieur | Changer le parent | `drag-drop.js:270-291` |
| **Déplacer** | Aucun | Avant/Après | Réordonner les frères et sœurs | `drag-drop.js:229-265` |
| **Copier** | Ctrl | Intérieur | Dupliquer le nœud | `drag-drop.js:329-382` |
| **Copier** | Ctrl | Avant/Après | Dupliquer + insérer | `drag-drop.js:387-425` |
| **Lier** | Ctrl+Alt | Intérieur | Créer un symlink | `drag-drop.js:296-324` |
| **Lier** | Ctrl+Alt | Avant/Après | Déplacer (ignoré) | N/A |

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

**Pendant le Glisser-Déposer** :
- **Élément source** : classe `.dragging` (opacité 0.5)
- **Zones de dépôt** : `.drop-indicator.top/.bottom/.left/.right` (ligne 3px)
- **Cible survolée** : classe `.drag-over` (bordure pointillée)
- **Curseur** : `dropEffect` change selon les modificateurs

**Effet de Dépôt** (`drag-drop.js:68-75`) :
```javascript
if (dragModifiers.ctrl && dragModifiers.alt) {
  e.dataTransfer.dropEffect = 'link';  // Curseur : alias
}
else if (dragModifiers.ctrl) {
  e.dataTransfer.dropEffect = 'copy';  // Curseur : copie
}
else {
  e.dataTransfer.dropEffect = 'move';  // Curseur : déplacement
}
```

**Classes CSS** :
- `.dragging` : Nœud source en cours de glissement
- `.drag-over` : Survol du nœud cible
- `.drop-indicator` : Ligne indiquant la position d'insertion
- `.drop-indicator.top/.bottom/.left/.right` : Variantes de position

📍 **CSS** : `src/css/components.css` (drag-drop styles)

---

### Move Node

**Function** : `moveNode(nodeId, newParentId)`

**Algorithme** (`drag-drop.js:270-291`) :
```javascript
1. Retirer de l'ancien parent :
   if (oldParent === null) {
     data.rootNodes = data.rootNodes.filter(id => id !== nodeId);
   } else {
     data.nodes[oldParent].children = data.nodes[oldParent].children.filter(id => id !== nodeId);
   }

2. Ajouter au nouveau parent :
   node.parent = newParentId;
   if (newParentId === null) {
     data.rootNodes.push(nodeId);
   } else {
     data.nodes[newParentId].children.push(nodeId);
   }

3. Sauvegarder & notifier :
   saveData();
   showToast('📦 Node moved');
```

📍 **Référence** : `src/js/features/drag-drop.js:270-291`

---

### Reorder Siblings

**Function** : `reorderNodes(draggedId, targetId, position)`

**Algorithme** (`drag-drop.js:229-265`) :
```javascript
1. Les deux nœuds doivent avoir le même parent (frères et sœurs)

2. Retirer le nœud glissé du tableau des enfants

3. Trouver la position cible dans le tableau

4. Insérer selon la position :
   if (position === 'before') {
     childrenArray.splice(targetIndex, 0, draggedId);
   } else {  // 'after'
     childrenArray.splice(targetIndex + 1, 0, draggedId);
   }

5. Mettre à jour la référence parent :
   draggedNode.parent = newParentId;

6. Sauvegarder & notifier :
   saveData();
   showToast('🔄 Order modified');
```

📍 **Référence** : `src/js/features/drag-drop.js:229-265`

---

### Create Symlink

**Function** : `createSymlinkTo(targetNodeId, parentId)`

**Algorithme** (`drag-drop.js:296-324`) :
```javascript
1. Générer l'ID du symlink :
   const symlinkId = 'symlink_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

2. Créer l'objet symlink :
   const symlink = {
     id: symlinkId,
     type: 'symlink',
     targetId: targetNodeId,
     title: targetNode.title,  // Initial = titre de la cible
     parent: parentId,
     children: [],
     tags: [],
     created: Date.now(),
     modified: Date.now()
   };

3. Ajout à l'arborescence :
   data.nodes[symlinkId] = symlink;
   if (parentId === null) {
     data.rootNodes.push(symlinkId);
   } else {
     data.nodes[parentId].children.push(symlinkId);
   }

4. Sauvegarder & notifier :
   saveData();
   showToast('🔗 Symlink created');
```

📍 **Référence** : `src/js/features/drag-drop.js:296-324`

---

### Duplicate Node

**Function** : `duplicateNode(originalId, parentId)`

**Algorithme** (`drag-drop.js:329-382`) :
```javascript
// Copie récursive du sous-arbre complet
const duplicateRecursive = (originalId, parentId) => {
  const original = data.nodes[originalId];

  // Générer un nouvel ID
  const duplicateId = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  // Créer le duplicata (toujours type='node', jamais symlink)
  const duplicate = {
    id: duplicateId,
    type: 'node',
    title: original.title + ' (copie)',
    content: original.content || '',  // Ou contenu cible si symlink
    parent: parentId,
    children: [],
    tags: [...(original.tags || [])],
    created: Date.now(),
    modified: Date.now()
  };

  data.nodes[duplicateId] = duplicate;

  // Dupliquer récursivement les enfants
  if (original.children && original.children.length > 0) {
    original.children.forEach(childId => {
      const duplicatedChildId = duplicateRecursive(childId, duplicateId);
      duplicate.children.push(duplicatedChildId);
    });
  }

  return duplicateId;
};

// Démarrer la récursion
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

  // Vérification récursive
  return isDescendantOf(target.parent, nodeId);
}
```

**Usage** (`drag-drop.js:158-162`) :
```javascript
// Ne pas autoriser le dépôt sur les descendants
if (isDescendantOf(targetNodeId, draggedId)) {
  showToast('⚠️ Impossible: invalid destination');
  return;
}
```

📍 **Référence** : `src/js/features/drag-drop.js:216-224`

---

### Modifier Behavior

**Capture en Temps Réel** (`drag-drop.js:62-66`) :
```javascript
// dragModifiers mis à jour pendant dragover (pas seulement dragstart)
dragModifiers = {
  ctrl: e.ctrlKey || e.metaKey,  // Cmd sur macOS
  alt: e.altKey
};
```

**Pourquoi en temps réel** :
- L'utilisateur peut appuyer/relâcher les modificateurs pendant le glisser-déposer
- dropEffect doit être mis à jour en temps réel
- Retour visuel immédiat

📍 **Référence** : `src/js/features/drag-drop.js:62-66`

---

### i18n Messages

| Message | Clé i18n | Contexte |
|---------|----------|----------|
| "🔄 Order modified" | `toast.orderModified` | Réordonner les frères et sœurs |
| "📦 Node moved" | `toast.nodeMoved` | Déplacer le parent |
| "🔗 Symlink created" | `toast.symlinkCreated` | Ctrl+Alt intérieur |
| "📋 Node duplicated" | `toast.nodeDuplicated` | Copier intérieur |
| "📋 Node duplicated and inserted" | `toast.nodeDuplicatedInserted` | Copier avant/après |
| "⚠️ Impossible: invalid destination" | `toast.invalidDestination` | Prévention de cycle |

📍 **Référence** : `src/js/locales/en.js` (toast.*)

---

## Export/Import

### Vue d'ensemble

DeepMemo propose **4 formats d'export** :

| Format | Extension | Type | Pièces jointes | Cas d'usage |
|--------|-----------|------|-------------|----------|
| **.dm (ZIP)** | `.dm` | Binaire | ✅ Incluses | Export complet avec fichiers |
| **JSON Global** | `.json` | Texte | ❌ Métadonnées seulement | Export simple, compatible LLM |
| **JSON Branch** | `.json` | Texte | ❌ Métadonnées seulement | Export sous-arbre |
| **FreeMind** | `.mm` | XML | ❌ | Carte mentale (Freeplane/XMind) |
| **Mermaid** | `.svg` | SVG | ❌ | Visualisation de diagramme |

**Module** : `src/js/core/data.js`

📍 **Référence** : `src/js/core/data.js:182-949`

---

### Interface Utilisateur

DeepMemo propose **2 niveaux d'actions** Import/Export :

#### Actions Globales (Right Panel)

**Emplacement** : Panneau d'information (bouton ℹ️) → Section "Actions globales"

**Boutons** :
- **📂 Importer** : Import global direct (formats : `.dm`, `.zip`, `.json`)
  - Fonction : `importData(event)` → `DataModule.importDataZIP()`
  - Détection automatique du format (ZIP ou JSON)
  - Remplace toutes les données de l'application
- **💾 Exporter** : Export global direct (format : ZIP uniquement)
  - Fonction : `exportGlobalZIP()` → `DataModule.exportDataZIP()`
  - Génère un fichier `.dm` avec tous les nœuds et pièces jointes

**Justification** : Les actions globales ne concernent que le format DeepMemo (ZIP/DM/JSON), donc pas besoin de modale de sélection.

📍 **Référence** : `src/js/features/editor.js:575-595` (UI), `src/js/app.js:677-685` (exportGlobalZIP)

#### Actions Branche (Content Actions)

**Emplacement** : En bas à droite d'un nœud → Bouton `📤 Import & Export`

**Comportement** :
- Ouvre la **modale unifiée Import/Export**
- 2 onglets : Export et Import
- Tous les formats disponibles (ZIP, FreeMind, Mermaid, PDF, File System)
- Scope : nœud courant et ses descendants (branche)

**Formats disponibles** :

| Onglet | Formats |
|--------|---------|
| **Export** | ZIP, FreeMind (`.mm`), Mermaid (`.svg`), PDF, File System |
| **Import** | ZIP/DM/JSON, File System |

**Justification** : Les actions branche offrent plusieurs formats d'export (visualisation, partage), donc une modale est pertinente.

📍 **Référence** : `index.html:227` (bouton), `src/js/app.js:542-657` (modale)

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
  → Crée un .dm avec tous les nœuds + pièces jointes
  → Nom de fichier : deepmemo-export-{timestamp}.dm
```

**Export Branch ZIP** (`data.js:579-658`) :
```javascript
exportBranchZIP(nodeId, progressCallback)
  → Crée un .dm avec le sous-arbre de la branche + pièces jointes
  → Nom de fichier : deepmemo-branch-{title}-{timestamp}.dm
  → Progression : callback({ current, message })
```

**Export JSON** (`data.js:182-195`) :
```javascript
exportData()
  → JSON simple avec champ $schema
  → Nom de fichier : deepmemo-export-{timestamp}.json
  → Pas de pièces jointes
```

📍 **Référence** : `src/js/core/data.js:182-658`

---

### Import Workflow

**Détection Automatique** (`data.js:666-703`) :
```javascript
importDataZIP(event, onSuccess) {
  1. Récupérer le fichier depuis l'input

  2. Détecter le format :
     const arrayBuffer = await file.arrayBuffer();
     const magic = new Uint8Array(arrayBuffer.slice(0, 2));
     const isZIP = (magic[0] === 0x50 && magic[1] === 0x4B);  // En-tête "PK"

  3. Router :
     if (isZIP) {
       importFromArchive(file, onSuccess);
     } else {
       importFromJSONText(file, onSuccess);
     }
}
```

**Modes** :
- **Remplacer** (bouton OK) : Écraser toutes les données actuelles + rootNodes
- **Fusionner** (bouton Annuler) : Ajouter aux racines actuelles

**Confirmation** :
- `confirms.importData` : "Replace all your data?"
- `confirms.importDataWithFiles` : "Replace all + {count} files?"

📍 **Référence** : `src/js/core/data.js:666-703`

---

### Import Branch

**Function** : `importBranchZIP(event, parentId, onSuccess)`

**Workflow** (`data.js:913-949`) :
```javascript
1. Détection automatique du format (.dm / .zip / .json)

2. Extraire les données :
   if (isZIP) {
     - Extraire metadata.json
     - Extraire data.json
     - Extraire attachments/
   } else {
     - Analyser le JSON directement
   }

3. Gérer l'export global vs branche :
   if (export.type === 'deepmemo-global') {
     if (export.rootNodes.length === 1) {
       // Racine unique : ajouter comme enfant
       importedRootId = export.rootNodes[0];
     } else {
       // Racines multiples : créer un nœud conteneur
       containerNode = {
         title: 'Imported: ' + filename,
         children: export.rootNodes
       };
     }
   }

4. Remappage d'ID :
   remapAllIds(nodes, rootId)
   → Générer de nouveaux IDs pour éviter les collisions

5. Attacher au parent :
   parent.children.push(importedRootId);

6. Sauvegarder & notifier :
   saveData();
   onSuccess(nodeCount, importedRootId);
```

📍 **Référence** : `src/js/core/data.js:913-949`

---

### ID Remapping

**Problème** : IDs importés peuvent être en collision avec IDs existants

**Solution** : Régénérer tous les IDs (`fs-sync.js:359-436`)

**Algorithme** :
```javascript
1. Phase 1 : Générer de nouveaux IDs pour tous les nœuds
   const idMapping = new Map();
   Object.keys(nodes).forEach(oldId => {
     const newId = generateId();
     idMapping.set(oldId, newId);
   });

2. Phase 2 : Créer les nœuds remappés
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

3. Phase 3 : Remapper les références dans le contenu
   Object.values(remappedNodes).forEach(node => {
     // Remplacer attachment:oldId → attachment:newId
     node.content = node.content.replace(/attachment:(\w+)/g, (match, oldId) => {
       return 'attachment:' + (idMapping.get(oldId) || oldId);
     });
   });

4. Phase 4 : Mettre à jour le targetId des symlinks
   Object.values(remappedNodes).forEach(node => {
     if (node.type === 'symlink') {
       node.targetId = idMapping.get(node.targetId);
     }
   });
```

📍 **Référence** : `src/js/features/fs-sync.js:359-436`

---

### Attachment Handling

**Pendant l'Export** (`data.js:628-646`) :
```javascript
// Collecter toutes les pièces jointes
const allAttachments = new Set();
Object.values(nodes).forEach(node => {
  node.attachments?.forEach(att => allAttachments.add(att.id));
});

// Ajouter au ZIP
for (const attachId of allAttachments) {
  const blob = await AttachmentsModule.getAttachment(attachId);
  const attachment = findAttachmentMetadata(attachId);
  const filename = `${attachId}_${attachment.name}`;
  zip.file(`attachments/${filename}`, blob);
}
```

**Pendant l'Import** (`fs-sync.js:700-765`) :
```javascript
// Analyser le nom de fichier : {name}__{oldId}{ext}
const pattern = /^(.+)__([^.]+)(\.[^.]+)?$/;
const match = filename.match(pattern);

if (match) {
  const displayName = match[1];
  const originalId = match[2];  // Pour le remappage

  // Générer un nouvel ID de pièce jointe
  const newId = AttachmentsModule.generateAttachmentId();

  // Sauvegarder dans IndexedDB
  await AttachmentsModule.saveAttachment(newId, blob);

  // Ajouter les métadonnées avec _originalId pour le remappage
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

**Fonctionnalités** :
- Export vers dossier (structure markdown + pièces jointes)
- Import depuis dossier (analyse auto des fichiers .md)
- Frontmatter YAML pour métadonnées
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

**Fallback** : Message toast "Feature not supported in your browser"

📍 **Référence** : `src/js/features/fs-sync.js:24-26`

---

### Export to File System

**Function** : `exportBranchToFS(branchId, progressCallback)`

**Flux** (`fs-sync.js:135-169`) :
```javascript
1. L'utilisateur choisit le dossier d'export :
   const dirHandle = await window.showDirectoryPicker({
     mode: 'readwrite'
   });

2. Exporter récursivement avec la structure :
   exportNodeRecursive(node, dirHandle, depth)

3. Structure:
   Folder/
   ├── index.md (branch node with frontmatter)
   ├── attachment-1.pdf__attach_123.pdf
   ├── Child-Leaf.md (leaf nodes)
   └── Grandchild-Folder/
       ├── index.md
       └── ...

4. Callback de progression :
   progressCallback({ current: nodeCount, message: "Exporting: Node Title" });
```

📍 **Référence** : `src/js/features/fs-sync.js:135-169`

---

### File Organization

**Branches (Nœuds avec enfants)** :
- Folder avec `index.md`
- Enfants exportés récursivement dans sous-dossier

**Feuilles (Nœuds sans enfants)** :
- Fichier `.md` dans répertoire parent
- Nom de fichier : `{title}.md` (nettoyé)

**Symlinks** :
- `.dmlink` file avec YAML metadata
- Content : `targetId`, `title`

**Attachments** :
- Même répertoire que le nœud parent
- Nom de fichier : `{name}__{attachId}{ext}`

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

**Problème** : Collisions de noms de fichiers (plusieurs nœuds avec même titre)

**Algorithm** (`fs-sync.js:55-88`) :
```javascript
function getAvailableFilename(dirHandle, baseName) {
  // Retirer les suffixes accumulés : "doc (2) (2)" → "doc"
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

**Flux** (`fs-sync.js:473-519`) :
```javascript
1. L'utilisateur choisit le dossier d'import :
   const dirHandle = await window.showDirectoryPicker({
     mode: 'read'
   });

2. Analyser le répertoire récursivement :
   parseDirectoryRecursive(dirHandle, parentId)

3. Détecter les fichiers :
   - Fichiers .md → Analyser comme nœuds (extraire le frontmatter)
   - index.md dans dossier → Le dossier devient une branche
   - Fichiers .dmlink → Analyser comme symlinks
   - Autres fichiers → Importer comme pièces jointes
   - Ignorer : fichiers .*, Thumbs.db, desktop.ini

4. ID remapping :
   remapAllIds(nodes, rootId)

5. Retourner :
   { count: numberOfImportedNodes }
```

📍 **Référence** : `src/js/features/fs-sync.js:473-519`

---

### Frontmatter Parsing

**Function** : `parseMarkdownFile(file)`

**Algorithm** (`fs-sync.js:591-631`) :
```javascript
1. Lire le contenu du fichier en texte

2. Détecter le frontmatter :
   Pattern: /^---\n([\s\S]*?)\n---\n([\s\S]*)$/

3. Si le frontmatter existe :
   - Analyser le YAML
   - Valider le schéma : FrontmatterModule.validateFrontmatter(frontmatter, 'node')
   - Utiliser id, title, created, modified depuis le YAML
   - Extraire le tableau tags

4. Sinon (pas de frontmatter) :
   - Générer un nouveau nœud
   - title = nom de fichier (sans .md)
   - created/modified = Date.now()

5. Retourner :
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

**Détection** : Fichiers autres que `.md` ou `.dmlink`

**Parsing** (`fs-sync.js:705-765`) :
```javascript
// Format du nom de fichier : {name}__{oldId}{ext}
const pattern = /^(.+)__([^.]+)(\.[^.]+)?$/;
const match = filename.match(pattern);

if (match) {
  const displayName = match[1];       // Nom affiché à l'utilisateur
  const originalId = match[2];        // Pour le remapping
  const ext = match[3] || '';

  // Générer un nouvel ID
  const newId = AttachmentsModule.generateAttachmentId();

  // Sauvegarder le blob dans IndexedDB
  const blob = await handle.getFile();
  await AttachmentsModule.saveAttachment(newId, blob);

  // Métadonnées avec _originalId pour le remapping
  return {
    id: newId,
    name: displayName + ext,
    type: blob.type,
    size: blob.size,
    _originalId: originalId  // Sera remappé
  };
}
```

**Limite de taille** : 50 Mo par fichier (identique à l'upload UI)

📍 **Référence** : `src/js/features/fs-sync.js:700-765`

---

### ID Remapping Strategy

**Pourquoi** : Les IDs importés peuvent entrer en collision avec les données existantes

**Solution** : `remapAllIds(nodes, rootId)`

**Phases** (`fs-sync.js:359-436`) :
```
Phase 1 : Générer de nouveaux IDs
  oldId → newId mapping

Phase 2 : Remapper la structure des nœuds
  parent, children, id fields

Phase 3 : Remapper les références de contenu
  attachment:oldId → attachment:newId

Phase 4 : Remapper les cibles de symlinks
  targetId: oldId → targetId: newId

Phase 5 : Remapper les IDs de pièces jointes
  _originalId → new attachment ID
```

📍 **Référence** : `src/js/features/fs-sync.js:359-436`

---

### UI Integration

**Export Dialog** (`fs-sync.js:775-807`) :
```javascript
async function showExportDialog(branchId) {
  // Vérifier le support du navigateur
  if (!isFileSystemSyncSupported()) {
    showToast(t('fsSync.notSupported'), '⚠️');
    return;
  }

  // Appeler l'export avec progression
  await exportBranchToFS(branchId, (progress) => {
    console.log(`Exporting ${progress.current}: ${progress.message}`);
  });

  // Toast de succès
  showToast(t('fsSync.exportSuccess', { count, files }), '✅');
}
```

**Import Dialog** (`fs-sync.js:813-837`) :
- Modèle similaire
- Succès : Toast avec le nombre de nœuds importés

**App Integration** (`app.js:1094-1108`) :
```javascript
async exportToFileSystem() {
  await FSSyncModule.showExportDialog(this.currentNodeId);
}

async importFromFileSystem() {
  const result = await FSSyncModule.showImportDialog(this.currentNodeId);
  if (result) {
    this.renderTree();  // Re-rendu après import
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
| "Exporting nodes..." | `fsSync.exporting` | Message de progression |
| "Importing nodes..." | `fsSync.importing` | Message de progression |
| "Export success: {count} nodes, {files} files" | `fsSync.exportSuccess` | Toast de succès |
| "Import success: {count} nodes" | `fsSync.importSuccess` | Toast de succès |
| "Export error" | `fsSync.exportError` | Toast d'erreur |
| "Import error" | `fsSync.importError` | Toast d'erreur |
| "Permission denied" | `fsSync.permissionDenied` | L'utilisateur a annulé le sélecteur de dossier |

📍 **Référence** : `src/js/locales/en.js:408-419`

---

## Internationalisation (i18n)

### Vue d'ensemble

**i18n** gère le support multilingue de DeepMemo.

**Langues** : FR (Français), EN (English)

**Fonctionnalités** :
- Dictionnaires séparés (FR, EN)
- Interpolation avec variables
- Expressions conditionnelles (pluralization)
- Auto-détection langue navigateur
- Changement dynamique sans rechargement

**Module** : `src/js/utils/i18n.js` (262 lignes)

📍 **Référence** : `src/js/utils/i18n.js:1-262`

---

### Core Functions

| Function | Ligne | Description |
|----------|-------|-------------|
| `initI18n()` | 106-124 | Initialiser + charger dict + traduire le DOM |
| `t(key, params)` | 137-156 | Obtenir la traduction avec interpolation |
| `setLanguage(lang)` | 167-201 | Changer la langue + persister + re-rendu |
| `getCurrentLanguage()` | 207-209 | Obtenir la langue active |
| `getAvailableLanguages()` | 215-217 | Lister les langues supportées (FR/EN) |
| `translateDOM()` | 229-261 | Mettre à jour les attributs DOM avec les traductions |
| `loadDictionary(lang)` | 37-54 | Charger le module locale en lazy loading |

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
  // Remplacer {variable}
  text = text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });

  // Remplacer {{expression}}
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

**Organization** : ~400+ clés organisées par fonctionnalité

📍 **Référence** : `src/js/locales/en.js:1-450`, `src/js/locales/fr.js:1-450`

---

### Language Switch Flow

**Function** : `setLanguage(lang)`

**Flux** (`i18n.js:167-201`) :
```javascript
1. Charger le dictionnaire si nécessaire :
   await loadDictionary(lang);

2. Mettre à jour l'état :
   currentLang = lang;

3. Persister dans localStorage :
   localStorage.setItem('deepmemo_lang', lang);

4. Traduire le DOM statique :
   translateDOM();

5. Re-rendu de l'UI dynamique :
   if (window.app?.render) {
     window.app.render();
   }

6. Rafraîchir le panneau éditeur :
   if (EditorModule.displayNode) {
     const currentNodeId = window.app.currentNodeId;
     EditorModule.displayNode(currentNodeId);
   }

7. Mettre à jour le compteur de nœuds :
   if (window.app?.updateNodeCounter) {
     window.app.updateNodeCounter();
   }
```

**Pas de rechargement** : Tous les changements sont appliqués dynamiquement

📍 **Référence** : `src/js/utils/i18n.js:167-201`

---

### Auto-Detection

**Au premier chargement** (`i18n.js:106-124`) :
```javascript
export async function initI18n() {
  // Vérifier localStorage
  let savedLang = localStorage.getItem('deepmemo_lang');

  // Fallback : langue du navigateur
  if (!savedLang) {
    const browserLang = navigator.language.split('-')[0];  // "fr-FR" → "fr"
    savedLang = ['fr', 'en'].includes(browserLang) ? browserLang : 'en';
  }

  // Charger et appliquer
  await setLanguage(savedLang);
}
```

**Default** : EN (English)

📍 **Référence** : `src/js/utils/i18n.js:106-124`

---

## PWA et mode hors ligne

### Vue d'ensemble

DeepMemo est une **Progressive Web App** avec :
- Service Worker (cache-first strategy)
- Manifest (installable)
- Capacités hors ligne
- Auto-update cache

**Files** :
- `sw.js` : Service Worker (174 lignes)
- `manifest.json` : App manifest (FR)
- `manifest-en.json` : App manifest (EN)

📍 **Référence** : `sw.js:1-174`, `manifest.json:1-28`

---

### Service Worker (sw.js)

**Version** : `v1.11.1` (améliorations hors ligne)

**Cache Name** : `deepmemo-v1.11.1`

**Precached Files** (`sw.js:6-48`) :
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
  '/src/js/core/validation.js',      // ✨ Import validation
  '/src/js/features/tree.js',
  // ... all modules
  '/src/js/locales/fr.js',
  '/src/js/locales/en.js',

  // Fonts                              ✨ Custom fonts
  '/assets/sto.ttf',
  '/assets/sto-fixed.ttf',

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

// ✨ CDN externes (fetch explicite au moment de l'install)
const EXTERNAL_CDNS = [
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
  'https://unpkg.com/dexie@3.2.4/dist/dexie.min.js',
  'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js',
  'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'  // UMD bundle
];
```

📍 **Référence** : `sw.js:6-57`

---

### Install Event

**Handler** (`sw.js:60-89`) :
```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        // 1. Précache fichiers locaux
        await cache.addAll(PRECACHE_URLS);

        // 2. ✨ Précache CDN externes (fetch explicite)
        const cdnPromises = EXTERNAL_CDNS.map(async (url) => {
          try {
            const response = await fetch(url, { mode: 'cors' });
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (error) {
            console.warn(`[SW] CDN failed: ${url}`, error);
          }
        });
        await Promise.all(cdnPromises);
      })
      .then(() => self.skipWaiting())  // Activer immédiatement
  );
});
```

**Behavior** :
- Précache tous les fichiers locaux (PRECACHE_URLS)
- **✨ Précache les CDN externes** (fetch explicite avec gestion d'erreur individuelle)
- `skipWaiting()` : Active immédiatement (pas d'attente pour fermeture tabs)

**Pourquoi le fetch explicite des CDN ?**
- Les scripts CDN dans `<head>` sont chargés **avant** que le SW soit activé (race condition)
- Le fetch explicite garantit que les CDN sont dans le cache dès la première visite
- Gestion d'erreur individuelle : un CDN échoué ne bloque pas l'installation

📍 **Référence** : `sw.js:60-89`

---

### Activation Event

**Handler** (`sw.js:91-108`) :
```javascript
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Supprimer les anciennes versions du cache
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();  // Prendre le contrôle immédiatement
    })
  );
});
```

**Behavior** :
- Supprimer les anciennes versions du cache (ne correspondant pas au CACHE_NAME actuel)
- `clients.claim()` : Prendre le contrôle de tous les onglets ouverts immédiatement

📍 **Référence** : `sw.js:91-108`

---

### Fetch Strategy: Cache First

**Handler** (`sw.js:110-147`) :
```javascript
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET (POST, PUT, DELETE, etc.)
  if (event.request.method !== 'GET') {
    return;
  }

  // ✨ Ignorer les extensions de navigateur (chrome-extension://, moz-extension://, etc.)
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Cache hit : retourner immédiatement + mise à jour en arrière-plan
      if (cachedResponse) {
        // Mettre à jour le cache en arrière-plan (pas d'await)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {
          // Échec réseau silencieux (cache déjà retourné)
        });

        return cachedResponse;
      }

      // Cache miss : récupérer depuis le réseau + cacher + retourner
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Cacher la réponse réussie
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Échec réseau + pas dans le cache → message 503 hors ligne
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
1. **Cache hit** : Retourner immédiatement + mise à jour en arrière-plan
2. **Cache miss** : Récupérer depuis le réseau + cacher + retourner
3. **Échec réseau + cache miss** : Retourner un message 503 hors ligne
4. **CDN externes** : Cachés automatiquement (marked, mermaid, jszip, js-yaml)
5. **✨ Extensions navigateur** : Ignorées (chrome-extension://, moz-extension://)

📍 **Référence** : `sw.js:110-147`

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

**Display Mode** : `standalone` (masque l'UI du navigateur)

📍 **Référence** : `manifest.json:1-28`

---

### Offline Capabilities

**Ce qui fonctionne hors ligne** :
- ✅ Tous les fichiers précachés (HTML, CSS, JS, icônes, polices)
- ✅ IndexedDB data (nodes, attachments, settings)
- ✅ BroadcastChannel (cross-tab sync)
- ✅ Service Worker cache-first strategy
- ✅ **External CDN libraries** (Marked.js, Mermaid.js, JSZip, js-yaml)
- ✅ **Custom fonts** (Sto, Sto Fixed)
- ✅ **All exports** (JSON, .dm ZIP, Mermaid SVG, YAML, Markdown)
- ✅ **Markdown rendering** with full syntax highlighting
- ✅ **Import validation** (validation.js)

**Ce qui échoue hors ligne** :
- ❌ Export PDF (nécessite un worker serveur)
- ❌ File System Sync (restriction de l'API navigateur)

**Service Worker Caching** (`sw.js:1-174`) :
- **Stratégie** : Cache-first avec fallback network
- **CDN externes** : Cachés dès l'installation via fetch explicite (marked, mermaid, jszip, js-yaml, dexie)
- **Assets** : Polices personnalisées cachées
- **Une fois les ressources chargées, tout fonctionne offline sauf PDF export**

---

### Install Prompt

**Déclencheur** : Le navigateur affiche "Ajouter à l'écran d'accueil" quand les critères PWA sont remplis

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

**Déclenchement manuel** : Peut être différé et appelé programmatiquement via l'événement `beforeinstallprompt`

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
| `initSync()` | 17-32 | Initialiser le BroadcastChannel |
| `notifyDataChanged(payload)` | 40-53 | Envoyer une notification de changement |
| `setupSyncListener(callback)` | 62-74 | Écouter les changements |
| `closeSync()` | 80-86 | Fermer le canal |

📍 **Référence** : `src/js/utils/sync.js`

---

### Sync Flow

**L'onglet A modifie les données** :
```javascript
// Tab A
await saveData();  // Sauvegarder dans IndexedDB

// Notifier les autres onglets
notifyDataChanged({
  nodeId: '123',
  action: 'modified'
});
```

**L'onglet B reçoit la notification** :
```javascript
// Setup de l'onglet B (pendant l'init de l'app)
setupSyncListener(async (payload) => {
  console.log('Data changed in Tab A, reloading...');

  // Recharger les données depuis IndexedDB
  await loadData();

  // Re-rendu de l'UI
  app.render();

  // Afficher un toast (optionnel)
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
  // L'app continue sans sync cross-tab
}
```

---

### Integration

**In app.js** (`app.js:23`) :
```javascript
import * as SyncModule from './utils/sync.js';

// Initialiser pendant le démarrage de l'app
SyncModule.initSync();
SyncModule.setupSyncListener(async () => {
  await loadData();
  this.render();
});
```

**In data.js** (`data.js:50`) :
```javascript
export async function saveData() {
  // Sauvegarder dans IndexedDB
  await Storage.saveNodes(data.nodes);
  await Storage.saveSetting('rootNodes', data.rootNodes);

  // Notifier les autres onglets
  SyncModule.notifyDataChanged();
}
```

---

## Raccourcis clavier

### Vue d'ensemble

DeepMemo propose des **raccourcis clavier globaux** pour actions courantes.

**Module** : `src/js/utils/keyboard.js` (56 lignes)

**Setup** : Un seul handler `document.addEventListener('keydown')`

📍 **Référence** : `src/js/utils/keyboard.js:9-55`

---

### Complete List

| Shortcut | Mac | Action | Handler | Référence |
|----------|-----|--------|---------|-----------|
| **Alt+N** | Opt+N | Nouveau nœud | `createNode()` | Line 12-15 |
| **Alt+E** | Opt+E | Mode édition | `onEditorFocus()` | Line 18-21 |
| **Ctrl+K** | Cmd+K | Ouvrir la recherche | `openSearch()` | Line 24-27 |
| **Alt+H** | Opt+H | Aide Markdown | `openMarkdownHelp()` | Line 30-33 |
| **Escape** | Esc | Fermer la recherche / Aller au parent | `goToParent()` | Line 36-43 |
| **Arrow keys** | Same | Navigation arborescence | `handleTreeNavigation(e)` | Line 50-52 |
| **Enter** | Same | Activer le nœud | `handleTreeNavigation(e)` | Line 50-52 |

📍 **Référence** : `src/js/utils/keyboard.js:9-55`

---

### Implementation

**Setup Function** (`keyboard.js:9-55`) :
```javascript
export function setupKeyboardShortcuts(handlers) {
  document.addEventListener('keydown', (e) => {
    // Alt+N : Nouveau nœud
    if (e.altKey && e.key === 'n') {
      e.preventDefault();
      if (handlers.createNode) handlers.createNode();
    }

    // Alt+E : Mode édition
    else if (e.altKey && e.key === 'e') {
      e.preventDefault();
      if (handlers.onEditorFocus) handlers.onEditorFocus();
    }

    // Ctrl+K (Cmd+K sur Mac) : Ouvrir la recherche
    else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (handlers.openSearch) handlers.openSearch();
    }

    // Alt+H : Aide Markdown
    else if (e.altKey && e.key === 'h') {
      e.preventDefault();
      if (handlers.openMarkdownHelp) handlers.openMarkdownHelp();
    }

    // Escape : Fermer la recherche OU aller au parent
    else if (e.key === 'Escape') {
      if (handlers.isSearchVisible?.()) {
        handlers.closeSearch?.();
      } else {
        handlers.goToParent?.();
      }
    }

    // Flèches : Navigation arborescence (seulement si pas dans un input)
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

**Désactivé quand** :
- Input/textarea a le focus (en train de taper)
- Modal de recherche visible (la recherche a sa propre navigation)

**Logic** (`keyboard.js:50-52`) :
```javascript
const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
const isSearchVisible = handlers.isSearchVisible?.();

if (!isInputFocused && !isSearchVisible) {
  // Activer navigation arborescence
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

**Usage** : Affiché dans les tooltips UI ou la modale de raccourcis clavier

📍 **Référence** : `src/js/locales/en.js:349-360`

---

## Voir Aussi

- [1-CONCEPTS.md](1-CONCEPTS.md) - Concepts fondamentaux (nodes, hiérarchie, symlinks)
- [2-ARCHITECTURE.md](2-ARCHITECTURE.md) - Architecture technique (modules, flux)
- [3-DATA-MODEL.md](3-DATA-MODEL.md) - Structure des données (schema, formats)
- [README.md](README.md) - Point d'entrée documentation

---

**Document complet et vérifié** ✅
**Dernière mise à jour** : 2026-02-13
**Version** : V0.11.0

Toutes les features sont documentées avec références code exactes (fichier:ligne).
