# 🏗️ DeepMemo - Architecture Technique V0.10

**Dernière mise à jour** : 19 Janvier 2026
**Version** : 0.10 (Architecture modulaire ES6 + IndexedDB + format .dm + export PDF)

> 📖 **Version française** | **[English version available](./ARCHITECTURE.md)**

---

## 📐 Vue d'ensemble

DeepMemo est une **application single-page** (SPA) en vanilla JavaScript ES6, HTML5 et CSS3, utilisant IndexedDB (Dexie.js) pour la persistence scalable des données.

**Architecture V0.10** : Modulaire ES6 + IndexedDB + format .dm
- `index.html` : Structure HTML (~190 lignes)
- `src/css/` : Styles modulaires (~1.8K lignes réparties en 6 fichiers)
- `src/js/` : **~20 modules ES6** organisés (~13.2K lignes)
  - `app.js` : Point d'entrée
  - `core/` : Gestion données + storage + migration
  - `features/` : Fonctionnalités métier
  - `ui/` : Interface utilisateur
  - `utils/` : Utilitaires + sync

---

## 📂 Structure des fichiers

### JavaScript (ES6 Modules)

```
src/js/
├── app.js                      # Point d'entrée
│
├── core/
│   ├── data.js                 # Gestion données + export/import
│   ├── storage.js              # Couche IndexedDB (Dexie.js)
│   ├── migration.js            # Migration localStorage → IndexedDB
│   ├── attachments.js          # Gestion fichiers joints (IndexedDB)
│   └── default-data.js         # Contenu de démo par défaut
│
├── features/
│   ├── tree.js                 # Arborescence + mode branche
│   ├── editor.js               # Éditeur + breadcrumb + attachments UI
│   ├── search.js               # Recherche globale
│   ├── tags.js                 # Tags + autocomplete
│   ├── modals.js               # Modales (Move/Link/Duplicate + Aide Markdown)
│   └── drag-drop.js            # Drag & drop complet
│
├── ui/
│   ├── toast.js                # Notifications toast
│   ├── panels.js               # Panneaux latéraux
│   └── mobile-tabs.js          # Navigation par tabs mobile
│
├── utils/
│   ├── routing.js              # Navigation URL
│   ├── keyboard.js             # Raccourcis clavier
│   ├── helpers.js              # Fonctions utilitaires (incl. downloadBlob)
│   ├── i18n.js                 # Système d'internationalisation
│   └── sync.js                 # Sync multi-onglets (BroadcastChannel)
│
└── locales/
    ├── fr.js                   # Dictionnaire français
    └── en.js                   # Dictionnaire anglais
```

### CSS (Modulaire)

```
src/css/
├── style.css                   # Import global (~10 lignes)
├── base.css                    # Reset + variables CSS (~150 lignes)
├── layout.css                  # Structure responsive (~250 lignes)
├── components.css              # Composants UI (~800 lignes)
├── mobile.css                  # Styles spécifiques mobile (~400 lignes)
└── utilities.css               # Classes utilitaires (~50 lignes)
```

---

## 🎯 Principes de conception

### 1. Modularité ES6
- **Imports/exports nommés** pour chaque module
- **État local** dans chaque module (non exporté)
- **Communication** via callbacks et fonctions exportées
- **Pas de state manager global** (volontairement simple)

### 2. Minimalisme
- **Un seul type de base** : le Nœud
- La structure émerge de l'usage
- Pas de contraintes imposées

### 3. Récursivité
- Tout nœud peut contenir d'autres nœuds
- Profondeur infinie
- Pas de distinction entre "conteneur" et "contenu"

### 4. Flexibilité
- Symlinks pour apparitions multiples
- Tags libres sans hiérarchie
- Mode branche pour isolation

---

## 📊 Structure des données

### Le type Nœud

```javascript
{
  id: String,              // "node_timestamp_random"
  type: String,            // "note" ou "symlink"
  title: String,           // Titre du nœud
  content: String,         // Contenu markdown
  children: Array<String>, // IDs des enfants directs
  parent: String | null,   // ID du parent (null = racine)
  created: Number,         // Timestamp création
  modified: Number,        // Timestamp modification
  tags: Array<String>,     // Tags du nœud

  // Pour les symlinks uniquement :
  targetId: String         // ID du nœud cible (si type === "symlink")
}
```

### La structure globale

```javascript
{
  nodes: {
    [nodeId]: Node,
    // ...
  },
  rootNodes: Array<String> // IDs des nœuds racines
}
```

### Exemple de symlink

```javascript
// Nœud original
{
  id: "node_1702234567894_mno345",
  type: "note",
  title: "👤 Alice",
  content: "Contact : alice@example.com",
  children: [],
  parent: "node_contacts",
  tags: ["contact", "équipe"]
}

// Symlink avec titre personnalisé
{
  id: "symlink_1702234567895_pqr678",
  type: "symlink",
  title: "👤 Alice (Lead Dev)",      // Titre indépendant
  targetId: "node_1702234567894_mno345",
  parent: "node_projet_x",
  children: [],                       // Toujours vide
  tags: []                            // Tags indépendants
}
```

**Important** : Le renommage d'un symlink ne renomme PAS le nœud cible. Seul le contenu est partagé.

---

## 🔄 Modules clés

### app.js (Point d'entrée)

**Responsabilités** :
- Initialisation de l'application
- Coordination entre modules
- Gestion de l'état global (currentNodeId, viewMode)
- Fonctions globales exposées via `window.app`

**Exports** :
```javascript
export class DeepMemoApp {
  init()
  selectNode(nodeId, instanceKey)
  selectNodeById(nodeId)
  createRootNode()
  createChildNode()
  // ... fonctions publiques
}
```

### core/data.js

**Responsabilités** :
- Gestion de la structure de données en mémoire
- Export/import (archives .dm et fichiers .json)
- Opérations CRUD sur les nœuds
- Coordination avec storage.js pour la persistence

**Exports** :
```javascript
export let data = { nodes: {}, rootNodes: [] };
export function saveData()
export function loadData()
export function exportData()
export function importData(event, onSuccess)
export function exportBranch(nodeId)
export function importBranch(event, parentId, onSuccess)
export function findNodeByTitle(title)
export function isDescendantOf(nodeId, ancestorId)
export function wouldCreateCycle(targetId, parentId)
export function wouldCreateCycleWithMove(nodeId, newParentId)
```

### core/storage.js (V0.10)

**Responsabilités** :
- Couche de persistence IndexedDB avec Dexie.js
- Trois object stores : `nodes`, `settings`, `attachments`
- Opérations read/write asynchrones
- Initialisation et gestion de la base de données

**Exports** :
```javascript
export async function initStorage()
export async function loadNodes()
export async function saveNodes(nodes)
export async function loadSettings()
export async function saveSetting(key, value)
export async function getStats()
```

**Structure de la base** :
```javascript
const db = new Dexie('deepmemo');
db.version(1).stores({
  nodes: 'id, created, modified',
  settings: 'key',
  attachments: 'id'
});
```

### core/migration.js (V0.10)

**Responsabilités** :
- Migration unique de localStorage vers IndexedDB
- Préservation et backup des données
- Gestion du flag de migration
- Gestion d'erreurs et rollback

**Exports** :
```javascript
export async function migrateFromLocalStorage()
```

**Processus de migration** :
1. Vérification du flag de migration dans localStorage
2. Lecture anciennes données depuis `deepmemo_data` et `deepmemo_settings`
3. Écriture dans IndexedDB via storage.js
4. Définition flag de migration pour éviter re-exécution
5. Conservation données localStorage originales comme backup

### core/attachments.js

**Responsabilités** :
- Gestion des fichiers joints aux nœuds
- Stockage dans IndexedDB (~500 MB limite)
- Export/Import ZIP avec fichiers
- Garbage collection fichiers orphelins

**Exports** :
```javascript
export async function initDB()
export async function saveAttachment(id, blob)
export async function getAttachment(id)
export async function deleteAttachment(id)
export async function listAttachments()
export async function getTotalSize()
export function generateAttachmentId()
export async function cleanOrphans(data)
export function isIndexedDBAvailable()
export function formatFileSize(bytes)
```

**Stockage** :
- Database : `deepmemo-attachments`
- Store : `files` (keyPath: `id`)
- Format ID : `attach_{timestamp}_{random}`
- Limite : 50 MB par fichier

**Export/Import** :
- Format ZIP systématique : `data.json` + `attachments/`
- Rétrocompatibilité JSON simple (détection auto)
- Régénération IDs lors import branche

### core/default-data.js

**Responsabilités** :
- Fournir le contenu de démonstration initial
- Documentation interactive pour nouveaux utilisateurs
- Support bilingue (FR/EN) selon langue détectée

**Exports** :
```javascript
export function getDefaultData()         // Dispatcher
export function getDefaultDataFR()       // Contenu français
export function getDefaultDataEN()       // Contenu anglais
```

**Structure** :
- 26 nœuds pédagogiques organisés hiérarchiquement
- Tutoriel progressif : Interface → Fonctionnalités → Vision future
- Exemples concrets pour chaque feature
- Format : [Fonctionnalité → Utilité → Exemple pratique]

### features/tree.js

**Responsabilités** :
- Rendu de l'arborescence
- Navigation clavier dans l'arbre
- Mode branche isolée
- Gestion expand/collapse
- Auto-collapse sur activation

**Variables d'état (non exportées)** :
```javascript
let branchMode = false;
let branchRootId = null;
let expandedNodes = new Set();       // Instance keys dépliés
let currentInstanceKey = null;       // Nœud actuellement affiché
let focusedInstanceKey = null;       // Nœud focusé (clavier)
```

**Exports clés** :
```javascript
export function renderTree()
export function setCurrentInstanceKey(key)
export function enableBranchMode(nodeId)
export function disableBranchMode()
export function isBranchMode()
export function getBranchRootId()
export function updateTreeFocus()
export function updateFocusAfterRender(nodeId)
```

**Instance Keys** :

Un nœud peut apparaître plusieurs fois via symlinks. L'instance key encode le chemin complet :

```javascript
function getInstanceKey(nodeId, parentContext) {
  return parentContext === null
    ? `${nodeId}@root`
    : `${nodeId}@${parentContext}`;
}

// Exemples :
// - Nœud racine : "node123@root"
// - Enfant : "node456@node123@root"
// - Via symlink : "node789@node456@node123@root"
```

**Deux types d'actions distinctes** :

1. **Pliage/dépliage manuel** (triangle, flèches) :
   - Modifie `expandedNodes` directement
   - État préservé
   - Ne change PAS le nœud actif

2. **Activation** (clic titre, Entrée) :
   - Appelle `setCurrentInstanceKey()`
   - **Auto-collapse** : vide `expandedNodes` et reconstruit le chemin
   - Change le nœud actif

### features/editor.js

**Responsabilités** :
- Affichage du contenu du nœud
- Breadcrumb intelligent (s'arrête au branchRootId)
- Liste des enfants avec cartes cliquables
- Sauvegarde titre/contenu
- Toggle view/edit mode

**Exports clés** :
```javascript
export function displayNode(nodeId, onComplete)
export function saveNode(nodeId)
export function updateBreadcrumb(nodeId)
export function updateRightPanel(nodeId)
export function updateViewMode(mode)
```

**Sauvegarde symlinks** :
```javascript
export function saveNode(nodeId) {
  const node = data.nodes[nodeId];

  if (node.type === 'symlink') {
    const targetNode = data.nodes[node.targetId];
    // Titre sauvegardé sur symlink
    node.title = document.getElementById('nodeTitle').value;
    node.modified = Date.now();
    // Contenu sauvegardé sur target
    targetNode.content = document.getElementById('nodeContent').value;
    targetNode.modified = Date.now();
  } else {
    // Nœud normal : tout sauvegardé sur le nœud
    node.title = document.getElementById('nodeTitle').value;
    node.content = document.getElementById('nodeContent').value;
    node.modified = Date.now();
  }

  saveData();
}
```

### features/drag-drop.js

**Responsabilités** :
- Drag & drop sur arbre et cartes enfants
- Indicateurs visuels (before/after/inside)
- Actions selon modificateurs clavier
- Prévention des cycles

**API publique** :
```javascript
export function initDragDrop(element, nodeId, onDropComplete)
```

**Modificateurs clavier** :
- **Défaut** : Déplacer (move)
- **Ctrl** : Dupliquer (duplicate)
- **Ctrl+Alt** : Lien symbolique (symlink)

**Zones de drop** :
- **before/after** (33% haut/bas) : Insert sibling
- **inside** (33% milieu) : Change parent

**Prévention cycles** :
```javascript
function isDescendantOf(targetId, nodeId) {
  if (!targetId || targetId === nodeId) return false;
  const target = data.nodes[targetId];
  if (!target) return false;
  if (target.parent === nodeId) return true;
  return isDescendantOf(target.parent, nodeId);
}
```

### features/tags.js

**Responsabilités** :
- Gestion des tags
- Auto-complétion intelligente (branche + global)
- Tag cloud avec compteurs
- Recherche par tag

**Exports clés** :
```javascript
export function updateTagsDisplay(nodeId)
export function setupTagAutocomplete()
export function updateTagCloud()
export function searchByTag(tag)
```

**Auto-complétion** :
- Tags de la branche actuelle (prioritaires)
- Tags globaux (secondaires)
- Triés par fréquence

### features/search.js

**Responsabilités** :
- Recherche globale (titres, contenus, tags)
- Modal de recherche avec navigation clavier
- Highlights des résultats

**Exports clés** :
```javascript
export function openSearch()
export function closeSearch()
export function performSearch(query)
```

### utils/routing.js

**Responsabilités** :
- Parsing URL (hash + query params)
- Mise à jour URL
- Gestion popstate/hashchange

**Format URL** :
```
?branch=nodeId#/node/nodeId
```

**Exports clés** :
```javascript
export function parseHash()
export function updateHash(nodeId, branchRootId)
export function setupHashListener(callback)
```

### utils/keyboard.js

**Responsabilités** :
- Gestion des raccourcis clavier globaux

**Raccourcis** :
- `Alt+N` : Nouveau nœud
- `Alt+E` : Passer en mode édition (avec focus)
- `Ctrl+K` : Recherche
- `Escape` : Remonter au parent

### utils/i18n.js (V0.9)

**Responsabilités** :
- Système d'internationalisation (0 dépendance)
- Chargement dynamique dictionnaires
- Traduction du DOM
- Détection et persistence de la langue

**Exports clés** :
```javascript
export async function initI18n()
export function t(key, params)
export async function setLanguage(lang)
export function getCurrentLanguage()
export function translateDOM()
```

**Fonctionnalités** :
- Interpolation custom : variables `{count}` et expressions `{{count > 1 ? 's' : ''}}`
- Détection auto langue : `localStorage` → `navigator.language` → fallback
- Traduction auto DOM via attributs `data-i18n*`
- Chargement dynamique dictionnaires via `import()`

**Langues supportées** :
- Français (fr)
- Anglais (en)

---

## 🎨 Mode Branche Isolée

### Concept

Le mode branche permet d'afficher uniquement une sous-arborescence, en isolant une branche spécifique.

### Différences avec mode normal

**Les SEULES différences** :

1. **Nœuds affichés** :
   - Mode normal : Tout l'arbre (`data.rootNodes`)
   - Mode branche : Sous-arborescence (`[branchRootId]`)

2. **Symlinks externes** :
   - Mode normal : Tous fonctionnels
   - Mode branche : Symlinks hors branche désactivés
     - Icône `🔗🚫`, texte grisé (opacity 0.4)
     - Non-cliquables, toast d'avertissement
     - Pas de triangle de toggle

3. **Instance keys** :
   - Mode normal : Chemin complet depuis racine globale
   - Mode branche : Chemin s'arrête au `branchRootId`

**Navigation identique** : Pliage/dépliage, auto-collapse, clavier fonctionnent de la même manière.

### Activation

```javascript
// URL avec ?branch=nodeId
?branch=node_123#/node/node_456

// Ou programmatique
enableBranchMode(nodeId);
```

### Boutons de partage

- **🔗 (Share Node)** : Préserve le contexte actuel
  - En mode normal → `#/node/X`
  - En mode branche → `?branch=root#/node/X`

- **🌳 (Share Branch)** : Crée toujours une branche isolée
  - Toujours → `?branch=X#/node/X`

---

## 💾 Persistence

### IndexedDB (V0.10+)

Depuis la V0.10, DeepMemo utilise **IndexedDB avec Dexie.js** pour tout le stockage de données, remplaçant le système précédent basé sur localStorage.

**Base de données :** `deepmemo` avec trois object stores :

```javascript
db.version(1).stores({
  // Table nodes avec indexes
  nodes: 'id, parent, *tags, created, modified',

  // Table settings (paires clé-valeur)
  settings: 'key',

  // Table attachments (fichiers comme blobs)
  attachments: 'id'
});
```

**Capacité de stockage :**
- Avant (V0.9) : 5-10 Mo (localStorage)
- Après (V0.10) : 500 Mo - 1 Go (IndexedDB)

**Fonctionnalités clés :**
- Migration automatique depuis localStorage au premier chargement
- Tables structurées avec indexes pour des requêtes rapides
- localStorage préservé comme backup après migration
- Flag de migration : `deepmemo_migrated_to_indexeddb`

**Paramètres stockés :**
- `rootNodes` : Tableau des IDs des nœuds racines
- `viewMode` : 'view' ou 'edit'
- `language` : 'fr' ou 'en'
- `fontPreference` : 'sto' ou 'system'

**Note** : `expandedNodes` n'est PAS sauvegardé (recalculé dynamiquement via auto-collapse).

**Synchronisation multi-onglets (V0.10) :**

Utilise l'API BroadcastChannel pour la synchro temps réel entre onglets :

```javascript
const channel = new BroadcastChannel('deepmemo-sync');

// Après chaque saveData()
channel.postMessage({ type: 'data-changed' });

// Les autres onglets rechargent automatiquement
channel.onmessage = async () => {
  await loadData();
  render();
};
```

**Voir aussi :** `docs/STORAGE.md` pour la documentation complète.

### Export/Import JSON

**Export/Import global** :
- Boutons dans la sidebar pour exporter/importer toute la base de données
- Format : `{nodes: {...}, rootNodes: [...]}`
- Import global **écrase** toutes les données existantes

**Export/Import de branche (V0.8)** :
- Boutons dans les actions du nœud actuel (en bas à droite)
- **Export** : Exporte un nœud + tous ses descendants récursivement
- **Import** : Importe comme enfants du nœud actuel (non-destructif)
- **Régénération des IDs** : Évite les conflits avec les nœuds existants
- Format spécial : `{type: 'deepmemo-branch', branchRootId: '...', nodes: {...}}`

```javascript
// Format export branche
{
  type: 'deepmemo-branch',
  version: '1.0',
  branchRootId: 'node_xxx',  // ID du nœud racine exporté
  exported: 1234567890,       // Timestamp
  nodeCount: 42,              // Nombre de nœuds
  nodes: {                    // Nœuds de la branche
    'node_xxx': {...},
    'node_yyy': {...}
  }
}
```

**Processus d'import de branche** :
1. Validation du format (`type === 'deepmemo-branch'`)
2. Génération de nouveaux IDs pour tous les nœuds (via `generateId()`)
3. Création d'une map `oldId → newId`
4. Mise à jour des relations (parent, children, targetId pour symlinks)
5. Attachement au nœud parent actuel
6. Merge dans `data.nodes` existant (sans écraser)

---

## 🎨 Thème CSS

### Variables CSS (base.css)

```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #2a2a2a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --accent: #4a9eff;
  --border: #333;
  --success: #4ade80;
  --danger: #ef4444;
}
```

### Hiérarchie z-index

```css
/* Base : 1 */
/* Panel toggle : 50 */
/* Boutons externes : 200 */
/* Drop indicators : 1000 */
/* Toast : 1000 */
/* Search modal : 2000 */
/* Action modals : 3000 */
```

---

## ⚡ Performance

### Optimisations actuelles
- Modules ES6 (tree-shaking possible)
- Rendu ciblé (pas de re-render complet)
- Délégation d'événements
- IndexedDB avec indexes pour requêtes rapides (V0.10+)
- Async/await pour opérations de stockage non-bloquantes

### Limitations actuelles
- Pas de virtual scrolling (limite ~1000 nœuds)
- Pas de lazy loading
- Pas de Web Workers

### Métriques de performance (V0.10)
- Sauvegarde d'un nœud : <50ms (async, non-bloquant)
- Chargement des données : <500ms (100 nœuds + settings)
- Migration : ~1s (100 nœuds + attachments)

---

## 🔐 Sécurité

### Mesures actuelles
- Pas de `eval()` ou `innerHTML` avec contenu utilisateur
- Markdown rendering via marked.js (sécurisé)

### À implémenter (futur)
- Content Security Policy
- Sanitization renforcée
- Encryption optionnelle

---

## 🚀 Évolutions futures (V1.0+)

### Features avancées
- Wiki-links `[[id:titre]]` avec auto-complétion
- Vue liste nested (indentation visuelle)
- Export Markdown structuré
- Recherche avancée (regex, filtres)

### Optimisations
- Virtual scrolling pour grandes arborescences
- Web Workers pour recherche asynchrone
- Optimisation avancée des requêtes avec indexes IndexedDB

---

**Document technique V0.10**
Dernière mise à jour : 4 janvier 2026
