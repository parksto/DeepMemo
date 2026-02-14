# URL Routing Reference

> Guide complet du système de navigation par URL de DeepMemo
>
> **Version** : V0.11.0
> **Mise à jour** : 2026-02-13
>
> 📍 **Sources** : `src/js/utils/routing.js` (95 lignes), `src/js/app.js` (lignes 97-99, 111-117, 188-220), `index.html` (lignes 155-166)

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Format des URL](#format-des-url)
3. [Paramètres de Routing](#paramètres-de-routing)
4. [Fonctions du Module](#fonctions-du-module)
5. [Intégration App](#intégration-app)
6. [Copie d'URL](#copie-durl)
7. [Cas d'Usage](#cas-dusage)
8. [Référence Rapide](#référence-rapide)

---

## Vue d'ensemble

### Principe de Fonctionnement

DeepMemo utilise un système de **hash-based routing** combiné à des **query parameters** pour permettre la navigation directe vers des nœuds et la gestion du mode branche.

**Architecture** :
```
┌─────────────────────────────────────┐
│   Browser URL Bar                   │
│   ?branch=rootId#/node/nodeId       │
└──────────────┬──────────────────────┘
               │ parse
      ┌────────▼────────┐
      │  routing.js     │
      │  parseHash()    │
      └────────┬────────┘
               │ dispatch
      ┌────────▼────────┐
      │    app.js       │
      │ handleHashChange│
      └────────┬────────┘
               │ execute
      ┌────────▼────────┬────────────┐
      │                 │            │
┌─────▼──────┐  ┌──────▼─────┐  ┌───▼────┐
│ Enable     │  │ Select     │  │ Render │
│ Branch     │  │ Node       │  │ Tree   │
└────────────┘  └────────────┘  └────────┘
```

📍 **Référence** : `routing.js:12-33` (parseHash), `app.js:97-98` (setupHashListener)

---

### Caractéristiques

| Fonctionnalité | Description |
|----------------|-------------|
| **Hash-based** | Navigation via fragment `#/node/id` (pas de rechargement) |
| **Query params** | Mode branche via `?branch=id` |
| **LocalFirst** | URLs valides uniquement sur même PC/navigateur/utilisateur |
| **Bookmarkable** | Sauvegarde de contexte dans les favoris navigateur |
| **Copyable** | Copie d'URL pour ouvrir dans nouvel onglet (même session) |
| **History** | Utilise `history.replaceState` (pas de navigation arrière) |

⚠️ **Important** : DeepMemo stocke les données **localement** (IndexedDB). Les URLs ne pointent **pas** vers un serveur - elles servent de bookmarks locaux.

---

## Format des URL

### Structure Complète

```
https://deepmemo.org/?branch={branchRootId}#/node/{nodeId}
│                    │                      │
│                    │                      └─ Hash (fragment)
│                    └─ Query parameter
└─ Base URL
```

---

### Composants

#### Base URL

**Format** : `https://deepmemo.org/` (ou `http://localhost:8000/` en dev)

**Détails** :
- Domaine du site
- Pas de changement lors de la navigation interne
- Déterminé automatiquement par `window.location.origin`

📍 **Référence** : `routing.js:81`, `routing.js:93`

---

#### Query Parameter : `?branch=`

**Format** : `?branch={nodeId}`

**Signification** : Active le **mode branche** avec le nœud spécifié comme racine.

**Exemples** :
```
?branch=node_123          → Mode branche sur node_123
?branch=abc_xyz           → Mode branche sur abc_xyz
(absent)                  → Mode global (tous les nœuds)
```

**Effets** :
- Sidebar affiche **uniquement** les descendants du nœud racine
- Recherche limitée au scope de la branche
- Indicateur "🌿 mode branche" visible
- Breadcrumb démarre à la racine de la branche

📍 **Référence** : `routing.js:14` (parsing), `app.js:192-200` (activation)

---

#### Hash : `#/node/`

**Format** : `#/node/{nodeId}`

**Signification** : Sélectionne le nœud à afficher dans l'éditeur.

**Exemples** :
```
#/node/node_456           → Sélectionne node_456
#/node/abc_123            → Sélectionne abc_123
#node_456                 → Backward compatibility (ancien format)
(absent)                  → Aucun nœud sélectionné (va à la racine)
```

**Backward Compatibility** :
- Ancien format : `#nodeId` (sans `/node/`)
- Nouveau format : `#/node/nodeId` (recommandé)
- Les deux formats sont supportés

📍 **Référence** : `routing.js:17-25` (parsing avec backward compat)

---

### Exemples Complets

| URL | Mode | Nœud Sélectionné | Description |
|-----|------|------------------|-------------|
| `https://deepmemo.org/` | Global | Aucun (root) | Page d'accueil, pas de nœud |
| `https://deepmemo.org/#/node/abc_123` | Global | `abc_123` | Mode global, nœud abc_123 |
| `https://deepmemo.org/?branch=node_456#/node/node_456` | Branche | `node_456` | Mode branche sur node_456 |
| `https://deepmemo.org/?branch=root_1#/node/child_5` | Branche | `child_5` | Branche root_1, affiche child_5 |
| `https://deepmemo.org/#abc_123` | Global | `abc_123` | Ancien format (backward compat) |

---

## Paramètres de Routing

### Objet `parsed` (Résultat de parseHash)

**Structure** :
```javascript
{
  mode: 'branch' | null,      // Mode actif
  branchRootId: string | null, // ID racine de branche (si mode='branch')
  nodeId: string | null        // ID du nœud sélectionné
}
```

**Exemples** :

| URL | `mode` | `branchRootId` | `nodeId` |
|-----|--------|----------------|----------|
| `/?branch=node_123#/node/node_456` | `'branch'` | `'node_123'` | `'node_456'` |
| `/#/node/abc_123` | `null` | `null` | `'abc_123'` |
| `/` | `null` | `null` | `null` |
| `/?branch=root_1` | `'branch'` | `'root_1'` | `null` |

📍 **Référence** : `routing.js:12-33` (parseHash return type)

---

### Cas Particuliers

#### URL vide (pas de hash ni query)

**Comportement** :
```javascript
parseHash() → { mode: null, branchRootId: null, nodeId: null }
app.handleHashChange() → this.goToRoot()
```

→ Active automatiquement le **premier root node** par défaut.

📍 **Référence** : `app.js:114-117`

---

#### Nœud inexistant

**Comportement** :
```javascript
const node = DataModule.data.nodes[nodeId];
if (!node) {
  showToast(t('toast.nodeNotFound'), '⚠️');
  return;
}
```

→ Toast d'erreur, pas de navigation.

📍 **Référence** : `app.js:212-216`

---

#### Branche inexistante

**Comportement** :
```javascript
const branchNode = DataModule.data.nodes[branchRootId];
if (!branchNode) {
  showToast(t('toast.branchRootNotFound'), '⚠️');
  return;
}
```

→ Toast d'erreur, mode branche non activé.

📍 **Référence** : `app.js:193-197`

---

## Fonctions du Module

### parseHash()

**Signature** :
```javascript
export function parseHash()
```

**Description** : Parse l'URL actuelle pour extraire le mode et les IDs.

**Retour** :
```javascript
{
  mode: 'branch' | null,
  branchRootId: string | null,
  nodeId: string | null
}
```

**Algorithme** :
1. Lit `window.location.search` → Extract `?branch=` param
2. Lit `window.location.hash` → Remove `#`
3. Parse hash :
   - Si commence par `/node/` → Extract nodeId après `/node/`
   - Sinon → Assume nodeId direct (backward compat)
4. Détermine mode : `'branch'` si param présent, sinon `null`

**Code** :
```javascript
export function parseHash() {
  const params = new URLSearchParams(window.location.search);
  const branchParam = params.get('branch');
  const hash = window.location.hash.substring(1); // Remove #

  // Parse hash: #/node/123456 or just #123456 (backward compat)
  let nodeId = null;
  if (hash) {
    if (hash.startsWith('/node/')) {
      nodeId = hash.substring(6); // Remove '/node/'
    } else {
      nodeId = hash; // Backward compatibility
    }
  }

  if (branchParam) {
    // Branch mode from query param
    return { mode: 'branch', branchRootId: branchParam, nodeId };
  }

  return { mode: null, branchRootId: null, nodeId };
}
```

📍 **Référence** : `routing.js:12-33`

---

### updateHash()

**Signature** :
```javascript
export function updateHash(nodeId, branchRootId = null)
```

**Description** : Met à jour l'URL pour refléter le nœud actuel et le mode branche.

**Paramètres** :
- `nodeId` (string | null) : ID du nœud à afficher (null pour vider)
- `branchRootId` (string | null) : ID racine de branche (null pour mode global)

**Comportement** :

**Cas 1 : nodeId = null**
```javascript
// Clear hash if no node selected
history.replaceState(null, '', window.location.pathname);
// URL → https://deepmemo.org/
```

**Cas 2 : nodeId présent, pas de branche**
```javascript
// Mode global
const search = '';
const hash = '#/node/nodeId';
// URL → https://deepmemo.org/#/node/nodeId
```

**Cas 3 : nodeId présent + branche**
```javascript
// Mode branche
const search = '?branch=branchRootId';
const hash = '#/node/nodeId';
// URL → https://deepmemo.org/?branch=branchRootId#/node/nodeId
```

**Optimisation** :
- Compare `currentUrl` et `newUrl`
- Ne met à jour que si différent (évite boucle infinie)
- Utilise `history.replaceState` (pas `pushState`) → Pas d'historique de navigation

**Code** :
```javascript
export function updateHash(nodeId, branchRootId = null) {
  if (!nodeId) {
    // Clear hash if no node selected
    if (window.location.hash || window.location.search) {
      // Use replaceState to avoid triggering hashchange event
      history.replaceState(null, '', window.location.pathname);
    }
    return;
  }

  // Build new URL
  const search = branchRootId ? `?branch=${branchRootId}` : '';
  const hash = `#/node/${nodeId}`;
  const newUrl = `${window.location.pathname}${search}${hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  // Only update if URL is different
  if (currentUrl !== newUrl) {
    // Use replaceState to update URL without triggering hashchange event
    history.replaceState(null, '', newUrl);
  }
}
```

📍 **Référence** : `routing.js:40-61`

---

### setupHashListener()

**Signature** :
```javascript
export function setupHashListener(onHashChange)
```

**Description** : Écoute les changements d'URL (hashchange event) et déclenche le callback.

**Paramètres** :
- `onHashChange` (Function) : Callback appelé avec le résultat de `parseHash()`

**Comportement** :
```javascript
window.addEventListener('hashchange', () => {
  const parsed = parseHash();
  onHashChange(parsed);
});
```

**Quand le hashchange se déclenche** :
- User clique sur lien avec `href="#/node/id"`
- User modifie URL manuellement dans barre d'adresse
- User utilise boutons back/forward du navigateur
- Script modifie `window.location.hash` directement

⚠️ **Note** : `history.replaceState` utilisé par `updateHash()` **ne déclenche pas** hashchange.

📍 **Référence** : `routing.js:67-72`

---

### getNodeUrl()

**Signature** :
```javascript
export function getNodeUrl(nodeId, currentBranchRootId = null)
```

**Description** : Génère une URL pour un nœud, préservant le contexte de branche.

**Paramètres** :
- `nodeId` (string) : ID du nœud
- `currentBranchRootId` (string | null) : Racine de branche actuelle (null pour mode global)

**Retour** : URL complète (string)

**Exemples** :
```javascript
// Mode global
getNodeUrl('node_123', null)
→ 'https://deepmemo.org/#/node/node_123'

// Mode branche
getNodeUrl('node_456', 'root_1')
→ 'https://deepmemo.org/?branch=root_1#/node/node_456'
```

**Code** :
```javascript
export function getNodeUrl(nodeId, currentBranchRootId = null) {
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const search = currentBranchRootId ? `?branch=${currentBranchRootId}` : '';
  const hash = `#/node/${nodeId}`;
  return `${baseUrl}${search}${hash}`;
}
```

📍 **Référence** : `routing.js:80-85`

---

### getBranchUrl()

**Signature** :
```javascript
export function getBranchUrl(branchRootId)
```

**Description** : Génère une URL de branche isolée (force toujours le mode branche).

**Paramètres** :
- `branchRootId` (string) : ID du nœud racine de la branche

**Retour** : URL complète (string)

**Comportement** :
- **Toujours** ajoute `?branch=` param
- Sélectionne automatiquement le nœud racine de la branche
- Utilisé par le bouton "🌿 Copy Branch URL"

**Exemple** :
```javascript
getBranchUrl('node_456')
→ 'https://deepmemo.org/?branch=node_456#/node/node_456'
```

**Code** :
```javascript
export function getBranchUrl(branchRootId) {
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  return `${baseUrl}?branch=${branchRootId}#/node/${branchRootId}`;
}
```

📍 **Référence** : `routing.js:92-95`

---

## Intégration App

### Initialisation (app.js)

**Setup au démarrage** :

```javascript
// Setup URL routing
RoutingModule.setupHashListener((parsed) => {
  this.handleHashChange(parsed);
});

// Handle initial URL hash
const initialHash = RoutingModule.parseHash();
if (initialHash.nodeId) {
  this.handleHashChange(initialHash);
} else {
  // No URL hash: activate first root node by default
  this.goToRoot();
}
```

📍 **Référence** : `app.js:97-117`

---

### handleHashChange()

**Signature** :
```javascript
handleHashChange(parsed)
```

**Paramètres** :
- `parsed` (Object) : Résultat de `parseHash()`

**Flow** :

```
┌─────────────────────────────────┐
│ handleHashChange(parsed)        │
└──────────────┬──────────────────┘
               │
         ┌─────▼─────┐
         │ Mode ?    │
         └─────┬─────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐         ┌──────▼──────┐
│ Branch │         │ Global      │
└───┬────┘         └──────┬──────┘
    │                     │
    │ Enable branch       │ Disable branch
    │ TreeModule          │ TreeModule
    │                     │
    └──────────┬──────────┘
               │
         ┌─────▼─────┐
         │ nodeId ?  │
         └─────┬─────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────┐         ┌──────▼──────┐
│ Exists │         │ Not found   │
└───┬────┘         └──────┬──────┘
    │                     │
    │ selectNodeById()    │ showToast()
    │                     │
    └─────────────────────┘
```

**Code** :
```javascript
handleHashChange(parsed) {
  const { mode, branchRootId, nodeId } = parsed;

  // Handle branch mode
  if (mode === 'branch' && branchRootId) {
    const branchNode = DataModule.data.nodes[branchRootId];
    if (!branchNode) {
      showToast(t('toast.branchRootNotFound'), '⚠️');
      return;
    }
    TreeModule.enableBranchMode(branchRootId);
    this.render();
    showToast(t('toast.branchModeEnabled'), '🌿');
  } else {
    TreeModule.disableBranchMode();
  }

  // Handle node selection
  if (!nodeId) {
    // No hash: go to root
    this.goToRoot();
    return;
  }

  const node = DataModule.data.nodes[nodeId];
  if (!node) {
    showToast(t('toast.nodeNotFound'), '⚠️');
    return;
  }

  // Select the node
  this.selectNodeById(nodeId);
}
```

📍 **Référence** : `app.js:188-220`

---

### Mise à Jour lors de la Sélection

**Quand un nœud est sélectionné** (`selectNode()`) :

```javascript
selectNode(nodeId, instanceKey = null) {
  // ... (load node data)

  // Update URL with branch context if in branch mode
  const branchRootId = TreeModule.isBranchMode() ? TreeModule.getBranchRootId() : null;
  RoutingModule.updateHash(nodeId, branchRootId);

  // ... (display in editor)
}
```

📍 **Référence** : `app.js:280-281`

---

### Effacement lors de la Suppression

**Quand le dernier nœud est supprimé** :

```javascript
if (Object.keys(this.data.nodes).length === 0) {
  this.currentNodeId = null;
  TreeModule.disableBranchMode();
  RoutingModule.updateHash(null);  // Clear URL
  // ... (show empty state)
}
```

📍 **Référence** : `app.js:324-326`

---

## Copie d'URL

### Boutons de Copie d'URL (UI)

**Emplacement** : Header de l'éditeur

**Boutons** :
1. 🔗 "Copy URL" (`#shareLink`)
2. 🌿 "Copy Branch URL" (`#shareBranchLink`)

**HTML** :
```html
<a href="#" id="shareLink"
   title="Copier l'URL de ce nœud (préserve le contexte actuel)"
   onclick="app.copyNodeUrl(event)">🔗</a>

<a href="#" id="shareBranchLink"
   title="Copier l'URL en mode branche isolée (vue focus)"
   onclick="app.copyBranchUrl(event)">🌿</a>
```

📍 **Référence** : `index.html:155-166`

---

### copyNodeUrl() - Copie URL avec Contexte

**Fonction** :
```javascript
copyNodeUrl(event) {
  if (!this.currentNodeId) {
    showToast(t('toast.selectNodeFirst'), 'ℹ️');
    return;
  }

  // Only prevent default and copy on left-click (button 0)
  if (event && event.button === 0) {
    event.preventDefault();

    // URL to copy: preserve current context (branch mode if active)
    const branchRootId = TreeModule.isBranchMode() ? TreeModule.getBranchRootId() : null;
    const urlToCopy = RoutingModule.getNodeUrl(this.currentNodeId, branchRootId);

    // Ctrl+Click or Cmd+Click: copy markdown format [Title](URL)
    if (event.ctrlKey || event.metaKey) {
      const title = this.data.nodes[this.currentNodeId].title;
      const markdown = `[${title}](${urlToCopy})`;
      navigator.clipboard.writeText(markdown).then(() => {
        showToast(t('toast.markdownLinkCopied'), '🔗');
      }).catch(() => {
        showToast(t('toast.copyError'), '⚠️');
      });
    } else {
      // Normal click: copy URL only (preserves branch context)
      navigator.clipboard.writeText(urlToCopy).then(() => {
        showToast(t('toast.linkCopied'), '🔗');
      }).catch(() => {
        showToast(t('toast.copyError'), '⚠️');
      });
    }
  }
}
```

**Comportements** :
- **Click simple** : Copie URL avec contexte préservé (avec `?branch=` si en mode branche, sans sinon)
- **Ctrl/Cmd+Click** : Copie format Markdown `[Title](URL)` avec contexte préservé
- **Middle-click / Right-click** : Comportement navigateur par défaut

📍 **Référence** : `app.js:1134-1166`

---

### copyBranchUrl() - Copie URL Branche Isolée

**Fonction** :
```javascript
copyBranchUrl(event) {
  if (!this.currentNodeId) {
    showToast(t('toast.selectNodeFirst'), 'ℹ️');
    return;
  }

  // Only prevent default and copy on left-click (button 0)
  if (event && event.button === 0) {
    event.preventDefault();
    const url = RoutingModule.getBranchUrl(this.currentNodeId);
    navigator.clipboard.writeText(url).then(() => {
      showToast(t('toast.branchLinkCopied'), '🌿');
    }).catch(() => {
      showToast(t('toast.copyError'), '⚠️');
    });
  }
}
```

**Comportement** :
- **Toujours** crée une URL de branche isolée
- URL : `?branch={currentNodeId}#/node/{currentNodeId}`
- Utile pour ouvrir un sous-arbre dans un nouvel onglet

📍 **Référence** : `app.js:1172-1189`

---

## Cas d'Usage

### 1. Bookmark d'un Nœud Spécifique

**Objectif** : Sauvegarder un nœud favori pour y accéder rapidement.

**Steps** :
1. Sélectionner le nœud dans l'arborescence
2. URL automatiquement mise à jour : `#/node/nodeId`
3. Ajouter aux favoris du navigateur (Ctrl+D)
4. Rouvrir via favoris → Nœud automatiquement sélectionné

**URL générée** : `https://deepmemo.org/#/node/node_123`

---

### 2. Multi-tab (Même Session)

**Objectif** : Ouvrir le même nœud dans un nouvel onglet en préservant le contexte.

**Steps** :
1. Cliquer sur 🔗 (Copy URL)
2. URL copiée dans le presse-papiers
3. Ouvrir nouvel onglet
4. Coller URL → Nœud chargé avec le même contexte

**Exemples d'URL copiée** :
- Mode global : `https://deepmemo.org/#/node/node_456`
- Mode branche : `https://deepmemo.org/?branch=root_123#/node/node_456` (contexte préservé)

---

### 3. Mode Branche Isolé

**Objectif** : Se concentrer sur un sous-arbre spécifique.

**Steps** :
1. Sélectionner le nœud racine du sous-arbre
2. Cliquer sur 🌿 (Copy Branch URL)
3. URL copiée : `?branch=rootId#/node/rootId`
4. Ouvrir dans nouvel onglet → Sidebar n'affiche que les descendants

**Exemple** :
```
Arborescence complète :
├── Project A
│   ├── Task 1
│   └── Task 2
└── Project B
    ├── Subtask 1
    └── Subtask 2

URL branche pour "Project B":
?branch=projectB_id#/node/projectB_id

→ Sidebar affiche uniquement :
Project B (racine)
├── Subtask 1
└── Subtask 2
```

---

### 4. Sortie du Mode Branche

**Objectif** : Revenir à la vue complète depuis le mode branche.

**Steps** :
1. En mode branche, indicateur "🌿 mode branche" visible
2. Cliquer sur "⤴️" dans l'indicateur
3. Navigate vers `#/node/{branchRootId}` (sans `?branch=`)
4. Mode branche désactivé → Vue globale restaurée

**Code du lien** :
```javascript
const exitLink = indicator.querySelector('.branch-mode-exit');
exitLink.href = `./#/node/${branchRootId}`;
```

📍 **Référence** : `app.js:373-375`

---

### 5. Navigation Directe par URL

**Objectif** : Accéder directement à un nœud via la barre d'adresse.

**Steps** :
1. Taper ou modifier l'URL manuellement
2. Changer le hash : `#/node/newNodeId`
3. Appuyer sur Entrée
4. hashchange event déclenché → Nœud chargé

**Exemple** :
```
Avant : https://deepmemo.org/#/node/abc_123
Après : https://deepmemo.org/#/node/xyz_789
→ Nœud xyz_789 automatiquement sélectionné
```

---

### 6. Lien Markdown vers Nœud Interne

**Objectif** : Créer un lien Markdown pointant vers un nœud DeepMemo.

**Steps** :
1. Sélectionner le nœud cible
2. Ctrl/Cmd + Click sur 🔗
3. Format Markdown copié : `[Titre du nœud](URL)`
4. Coller dans un autre nœud

**Exemples** :
```markdown
# Mode global
Voir aussi : [Guide Installation](https://deepmemo.org/#/node/guide_install_123)

# Mode branche (contexte préservé)
Voir : [Subtask 1](https://deepmemo.org/?branch=project_456#/node/subtask_789)
```

⚠️ **Note** : Liens Markdown internes fonctionnent dans le preview, mais ouvrent DeepMemo dans un nouvel onglet (pas de navigation interne au clic). Le contexte de branche est préservé dans l'URL.

---

## Référence Rapide

### Table des Fonctions

| Fonction | Paramètres | Retour | Description | Fichier:Ligne |
|----------|------------|--------|-------------|---------------|
| `parseHash()` | - | `{mode, branchRootId, nodeId}` | Parse URL actuelle | `routing.js:12` |
| `updateHash()` | `nodeId, branchRootId?` | `void` | Met à jour URL | `routing.js:40` |
| `setupHashListener()` | `onHashChange` | `void` | Écoute hashchange | `routing.js:67` |
| `getNodeUrl()` | `nodeId, branchRootId?` | `string` | URL avec contexte | `routing.js:80` |
| `getBranchUrl()` | `branchRootId` | `string` | URL branche isolée | `routing.js:92` |
| `handleHashChange()` | `parsed` | `void` | Gère changement URL | `app.js:188` |
| `copyNodeUrl()` | `event` | `void` | Copie URL nœud | `app.js:1134` |
| `copyBranchUrl()` | `event` | `void` | Copie URL branche | `app.js:1172` |

---

### Patterns d'URL

| Pattern | Mode | Nœud | Exemple |
|---------|------|------|---------|
| `/` | Global | Aucun | `https://deepmemo.org/` |
| `/#/node/id` | Global | `id` | `https://deepmemo.org/#/node/abc_123` |
| `/?branch=rootId` | Branche | Aucun | `https://deepmemo.org/?branch=node_456` |
| `/?branch=rootId#/node/id` | Branche | `id` | `https://deepmemo.org/?branch=node_456#/node/child_789` |
| `/#id` | Global | `id` | `https://deepmemo.org/#abc_123` (old format) |

---

### Flow de Navigation

```
User Action → URL Change → Event → Handler → UI Update
│             │            │       │          │
├─ Click link │            │       │          └─ selectNode()
├─ Type URL   └─ hash mod. │       │             render()
├─ Bookmark               └─ hashchange        updateBreadcrumb()
├─ Copy URL                           └─ handleHashChange()
└─ Button
```

---

### Événements et Listeners

| Événement | Source | Handler | Fichier:Ligne |
|-----------|--------|---------|---------------|
| `hashchange` | Browser | `setupHashListener callback` | `routing.js:68` |
| `load` (initial) | App init | `parseHash()` manual call | `app.js:111` |
| Node selection | User | `updateHash()` call | `app.js:281` |
| Node deletion | User | `updateHash(null)` call | `app.js:326` |

---

## Voir Aussi

- [Features - Branch Mode](../4-FEATURES.md#3-mode-branche-branch-mode) - Fonctionnalité de branche isolée
- [Architecture - Routing Module](../2-ARCHITECTURE.md#routingjs---navigation-url) - Architecture du module
- [Concepts - Instance Keys](../1-CONCEPTS.md#4-instance-keys) - Système d'identification des nœuds

---

## Statistiques

### Fichiers Analysés

| Fichier | Lignes | Contenu |
|---------|--------|---------|
| `src/js/utils/routing.js` | 95 | Module complet de routing |
| `src/js/app.js` | 1629 | Intégration app (lignes 97-220 pour routing) |
| `index.html` | 473 | Boutons de copie d'URL (lignes 155-166) |

**Total** : ~2197 lignes de code analysées

**Fonctions documentées** : 8 fonctions (5 dans routing.js, 3 dans app.js)

**Patterns d'URL** : 5 patterns supportés

---

**Dernière mise à jour** : 2026-02-13 | **Version** : V0.11.0
