# Keyboard Shortcuts Reference

> Guide complet des raccourcis clavier DeepMemo
>
> **Version** : V0.11.0
> **Mise à jour** : 2026-02-13
>
> 📍 **Sources** : `src/js/utils/keyboard.js` (56 lignes), `src/js/features/search.js` (258 lignes), `src/js/features/tags.js` (353 lignes), `src/js/features/tree.js` (ligne 617-720)

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Raccourcis Globaux](#raccourcis-globaux)
3. [Navigation Arborescence](#navigation-arborescence)
4. [Recherche](#recherche)
5. [Tags Autocomplete](#tags-autocomplete)
6. [Modificateurs (Drag & Drop)](#modificateurs-drag--drop)
7. [Compatibilité Plateformes](#compatibilité-plateformes)
8. [Gestion des Conflits](#gestion-des-conflits)
9. [Référence Rapide](#référence-rapide)

---

## Vue d'ensemble

### Principe de Fonctionnement

DeepMemo utilise un système de raccourcis clavier **contextuels** pour permettre une navigation et une édition rapides sans quitter le clavier.

**Architecture** :
```
┌─────────────────────────────────────┐
│   Keyboard Handler (keyboard.js)   │
│   Raccourcis globaux               │
└──────────────┬──────────────────────┘
               │ dispatch events
      ┌────────┴────────┬────────────┐
      │                 │            │
┌─────▼──────┐  ┌──────▼─────┐  ┌───▼────┐
│ Search     │  │ Tags       │  │ Tree   │
│ Module     │  │ Module     │  │ Module │
└────────────┘  └────────────┘  └────────┘
```

📍 **Référence** : `keyboard.js:9-55` (fonction setupKeyboardShortcuts)

---

### Caractéristiques

| Fonctionnalité | Description |
|----------------|-------------|
| **Contextuels** | Les raccourcis s'adaptent au contexte actif |
| **Non-bloquants** | Ne déclenchent pas quand un input est focusé |
| **Compatibles** | Support Windows, Linux, macOS |
| **Extensibles** | Architecture handler-based modulaire |
| **Sans conflit** | Gestion intelligente des priorités |

---

## Raccourcis Globaux

### Vue d'ensemble

Les raccourcis globaux sont **toujours actifs** (sauf si un input/textarea est focusé).

📍 **Référence** : `keyboard.js:10-43`

---

### Alt+N : Nouveau Nœud

**Action** : Crée un nouveau nœud enfant (ou root si aucun nœud sélectionné).

**Détails** :
- Si un nœud est sélectionné → Crée un **enfant** de ce nœud
- Sinon → Crée un **root node**
- Focus automatique sur le titre du nouveau nœud
- Mode édition activé automatiquement

**Code** :
```javascript
// Alt+N: New node
if (e.altKey && e.key === 'n') {
  e.preventDefault();
  if (handlers.createNode) handlers.createNode();
}
```

📍 **Référence** : `keyboard.js:11-15`

**Label i18n** :
- FR : "Nouveau nœud"
- EN : "New node"

📍 **Référence** : `locales/fr.js:364`, `locales/en.js:351`

---

### Alt+E : Basculer en Mode Édition

**Action** : Focus sur l'éditeur et bascule en mode édition si nécessaire.

**Détails** :
- Si en mode **vue** → Passe en mode **édition**
- Focus sur le textarea de contenu
- Utile pour éditer rapidement sans cliquer

**Code** :
```javascript
// Alt+E: Focus editor and switch to edit mode if needed
if (e.altKey && e.key === 'e') {
  e.preventDefault();
  if (handlers.onEditorFocus) handlers.onEditorFocus();
}
```

📍 **Référence** : `keyboard.js:17-21`

**Label i18n** :
- FR : "Passer en édition"
- EN : "Switch to edit mode"

📍 **Référence** : `locales/fr.js:367`, `locales/en.js:354`

---

### Ctrl+K : Ouvrir la Recherche

**Action** : Ouvre la modal de recherche globale.

**Détails** :
- Modal de recherche avec **focus automatique** sur l'input
- Recherche dans : titres, contenu, tags
- Respect du **branch mode** (scope limité si actif)

⚠️ **Important** : Sur macOS, utiliser **Ctrl+K** (pas Cmd+K). Voir [Compatibilité Plateformes](#compatibilité-plateformes).

**Code** :
```javascript
// Ctrl+K: Open search
if (e.ctrlKey && e.key === 'k') {
  e.preventDefault();
  if (handlers.openSearch) handlers.openSearch();
}
```

📍 **Référence** : `keyboard.js:23-27`

**Label i18n** :
- FR : "Recherche"
- EN : "Search"

📍 **Référence** : `locales/fr.js:365`, `locales/en.js:352`

---

### Alt+H : Aide Markdown

**Action** : Ouvre la modal d'aide Markdown.

**Détails** :
- Affiche la **syntaxe Markdown** supportée
- Exemples de formatage (titres, listes, liens, code, etc.)
- Raccourci utile pour les débutants Markdown

**Code** :
```javascript
// Alt+H: Open Markdown help
if (e.altKey && e.key === 'h') {
  e.preventDefault();
  if (handlers.openMarkdownHelp) handlers.openMarkdownHelp();
}
```

📍 **Référence** : `keyboard.js:29-33`

**Label i18n** :
- FR : "Aide Markdown"
- EN : "Markdown help"

📍 **Référence** : `locales/fr.js:366`, `locales/en.js:353`

---

### Escape : Fermer ou Remonter

**Action** : Ferme la recherche (si ouverte) ou remonte au parent (sinon).

**Détails** :
- **Si recherche ouverte** → Ferme la modal de recherche
- **Sinon** → Navigue au nœud parent dans l'arborescence
- Comportement contextuel intelligent

**Code** :
```javascript
// Escape: Close search or go to parent
if (e.key === 'Escape') {
  if (handlers.isSearchVisible && handlers.isSearchVisible()) {
    // Handled by search module
  } else if (handlers.goToParent) {
    e.preventDefault();
    handlers.goToParent();
  }
}
```

📍 **Référence** : `keyboard.js:35-43`

**Label i18n** :
- FR : "Remonter au parent"
- EN : "Go to parent"

📍 **Référence** : `locales/fr.js:372`, `locales/en.js:359`

---

## Navigation Arborescence

### Vue d'ensemble

Navigation clavier dans l'arborescence (sidebar). Fonctionne **uniquement** quand :
- Aucun input/textarea n'est focusé
- La recherche n'est pas ouverte

📍 **Référence** : `keyboard.js:45-53`, `tree.js:617-720`

---

### Contexte d'Activation

**Conditions** :
```javascript
const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
const isSearchVisible = handlers.isSearchVisible && handlers.isSearchVisible();

if (!isInputFocused && !isSearchVisible && handlers.handleTreeNavigation) {
  if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
    handlers.handleTreeNavigation(e);
  }
}
```

📍 **Référence** : `keyboard.js:46-52`

---

### ArrowDown : Descendre

**Action** : Déplace le focus vers le nœud suivant (visible) dans l'arborescence.

**Détails** :
- Parcourt les nœuds **visibles** (expanded) uniquement
- Scroll automatique si nécessaire
- Arrive en bas → Pas de wrapping (reste sur le dernier)

**Code** :
```javascript
case 'ArrowDown':
  e.preventDefault();
  if (currentIndex < visibleNodes.length - 1) {
    focusedInstanceKey = visibleNodes[currentIndex + 1];
    updateTreeFocus();
    scrollTreeNodeIntoView(focusedInstanceKey);
  }
  break;
```

📍 **Référence** : `tree.js:638-645`

---

### ArrowUp : Monter

**Action** : Déplace le focus vers le nœud précédent (visible) dans l'arborescence.

**Détails** :
- Parcourt les nœuds **visibles** (expanded) uniquement
- Scroll automatique si nécessaire
- Arrive en haut → Pas de wrapping (reste sur le premier)

**Code** :
```javascript
case 'ArrowUp':
  e.preventDefault();
  if (currentIndex > 0) {
    focusedInstanceKey = visibleNodes[currentIndex - 1];
    updateTreeFocus();
    scrollTreeNodeIntoView(focusedInstanceKey);
  }
  break;
```

📍 **Référence** : `tree.js:647-654`

---

### ArrowRight : Déplier

**Action** : Déplie le nœud focusé (affiche ses enfants).

**Détails** :
- Si le nœud a des **enfants** → Les affiche
- Si déjà déplié → Aucun effet
- Re-render de l'arborescence

**Code** :
```javascript
case 'ArrowRight':
  e.preventDefault();
  // Expand the focused node (both modes work the same)
  expandTreeNode(focusedInstanceKey);
  if (renderCallback) renderCallback();
  break;
```

📍 **Référence** : `tree.js:656-661`

**Label i18n** :
- FR : "Déplier nœud"
- EN : "Expand node"

📍 **Référence** : `locales/fr.js:369`, `locales/en.js:356`

---

### ArrowLeft : Replier ou Parent

**Action** : Replie le nœud (si déplié) ou remonte au parent (si replié/sans enfants).

**Détails** :
- **Si nœud déplié avec enfants** → Replie le nœud (reste focusé)
- **Sinon** → Remonte au parent dans l'arborescence
- Comportement intelligent adapté au contexte

**Code** :
```javascript
case 'ArrowLeft':
  e.preventDefault();
  // Collapse or go to parent (both modes work the same)
  const element = document.querySelector(`[data-instance-key="${focusedInstanceKey}"]`);
  const treeNode = element?.closest('.tree-node');
  const isExpanded = treeNode?.classList.contains('expanded');
  const node = data.nodes[nodeId];
  const displayNode = node?.type === 'symlink' ? data.nodes[node.targetId] : node;
  const hasChildren = displayNode && displayNode.children.length > 0;

  if (isExpanded && hasChildren) {
    // Collapse if expanded - stay on this node
    collapseTreeNode(focusedInstanceKey);
    if (renderCallback) renderCallback();
  } else {
    // Go to parent if not expanded or no children
    const atIndex = focusedInstanceKey.indexOf('@');
    if (atIndex !== -1) {
      const parentContext = focusedInstanceKey.substring(atIndex + 1);
      if (parentContext !== 'root') {
        const parentId = parentContext.split('@')[0];
        const parentInstanceKey = findInstanceKeyForNode(parentId);
        if (parentInstanceKey) {
          focusedInstanceKey = parentInstanceKey;
          updateTreeFocus();
          scrollTreeNodeIntoView(focusedInstanceKey);
        }
      }
    }
  }
  break;
```

📍 **Référence** : `tree.js:663-693`

**Label i18n** :
- FR : "Replier / Parent"
- EN : "Collapse / Parent"

📍 **Référence** : `locales/fr.js:370`, `locales/en.js:357`

---

### Enter : Activer Nœud

**Action** : Sélectionne et active le nœud focusé.

**Détails** :
- **Charge le nœud** dans l'éditeur
- **Met à jour l'URL** (#/node/id)
- Fonctionne même pour les **symlinks externes** (en branch mode)
- Permet la sélection pour suppression

**Code** :
```javascript
case 'Enter':
  e.preventDefault();
  // Select the focused node (allow selection of external symlinks for deletion)
  const focusedNode = data.nodes[nodeId];
  if (focusedNode) {
    // Check if it's an external symlink
    const isSymlink = focusedNode.type === 'symlink';
    let isExternalSymlink = false;
    if (isSymlink && focusedNode.targetId && branchMode) {
      const targetNode = data.nodes[focusedNode.targetId];
      if (targetNode) {
        isExternalSymlink = !isNodeInBranch(focusedNode.targetId);
      }
      // If targetNode doesn't exist, it's broken, not external
    }

    // Always allow selection (even for external symlinks)
    if (selectNodeCallback) {
      selectNodeCallback(nodeId, focusedInstanceKey);
    }
  }
  break;
```

📍 **Référence** : `tree.js:695-717`

**Label i18n** :
- FR : "Activer nœud"
- EN : "Activate node"

📍 **Référence** : `locales/fr.js:371`, `locales/en.js:358`

---

## Recherche

### Vue d'ensemble

Raccourcis actifs **uniquement** quand la modal de recherche est ouverte.

📍 **Référence** : `search.js:169-190`, `search.js:244-249`

---

### ArrowDown : Résultat Suivant

**Action** : Descend dans la liste des résultats de recherche.

**Détails** :
- Déplace la sélection vers le résultat suivant
- Scroll automatique si nécessaire
- Arrive en bas → Reste sur le dernier résultat

**Code** :
```javascript
if (e.key === 'ArrowDown') {
  e.preventDefault();
  selectedSearchResultIndex = Math.min(selectedSearchResultIndex + 1, searchResults.length - 1);
  const input = document.getElementById('searchInput');
  renderSearchResults(input.value);
  scrollSearchResultIntoView();
}
```

📍 **Référence** : `search.js:172-177`

---

### ArrowUp : Résultat Précédent

**Action** : Remonte dans la liste des résultats de recherche.

**Détails** :
- Déplace la sélection vers le résultat précédent
- Scroll automatique si nécessaire
- Arrive en haut → Reste sur le premier résultat

**Code** :
```javascript
else if (e.key === 'ArrowUp') {
  e.preventDefault();
  selectedSearchResultIndex = Math.max(selectedSearchResultIndex - 1, 0);
  const input = document.getElementById('searchInput');
  renderSearchResults(input.value);
  scrollSearchResultIntoView();
}
```

📍 **Référence** : `search.js:178-183`

---

### Enter : Sélectionner Résultat

**Action** : Sélectionne le résultat de recherche actuellement focusé.

**Détails** :
- Ferme la modal de recherche
- Navigue vers le nœud sélectionné
- Charge le nœud dans l'éditeur

**Code** :
```javascript
else if (e.key === 'Enter') {
  e.preventDefault();
  if (searchResults.length > 0) {
    selectSearchResult(selectedSearchResultIndex);
  }
}
```

📍 **Référence** : `search.js:184-189`

---

### Escape : Fermer Recherche

**Action** : Ferme la modal de recherche.

**Détails** :
- Efface l'input de recherche
- Réinitialise les résultats
- Retourne le focus au document

**Code** :
```javascript
// Global Escape handler for search
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && searchVisible) {
    e.preventDefault();
    closeSearch();
  }
});
```

📍 **Référence** : `search.js:244-249`

---

## Tags Autocomplete

### Vue d'ensemble

Raccourcis actifs **uniquement** quand l'input de tag est focusé et que l'autocomplete est affiché.

📍 **Référence** : `tags.js:155-191`

---

### ArrowDown : Suggestion Suivante

**Action** : Descend dans la liste des suggestions de tags.

**Détails** :
- Parcourt les suggestions d'autocomplete
- Max 10 suggestions affichées
- Wrapping circulaire (bas → haut)

**Code** :
```javascript
else if (event.key === 'ArrowDown') {
  event.preventDefault();
  navigateTagAutocomplete(1);
}
```

📍 **Référence** : `tags.js:182-184`

**Navigation circulaire** :
```javascript
function navigateTagAutocomplete(direction) {
  if (tagAutocompleteSuggestions.length === 0) return;

  tagAutocompleteIndex =
    (tagAutocompleteIndex + direction + tagAutocompleteSuggestions.length)
    % tagAutocompleteSuggestions.length;

  renderTagAutocomplete();
}
```

📍 **Référence** : `tags.js:268-276`

---

### ArrowUp : Suggestion Précédente

**Action** : Remonte dans la liste des suggestions de tags.

**Détails** :
- Parcourt les suggestions d'autocomplete
- Wrapping circulaire (haut → bas)

**Code** :
```javascript
else if (event.key === 'ArrowUp') {
  event.preventDefault();
  navigateTagAutocomplete(-1);
}
```

📍 **Référence** : `tags.js:185-187`

---

### Enter : Ajouter Tag

**Action** : Ajoute le tag sélectionné (ou le tag tapé si pas de suggestion).

**Détails** :
- **Si autocomplete visible** → Ajoute le tag suggéré sélectionné
- **Sinon** → Ajoute le texte tapé comme nouveau tag
- Tags normalisés en **lowercase**
- Détection de doublons (toast d'avertissement)
- Re-focus automatique sur l'input pour ajout rapide multi-tags

**Code** :
```javascript
if (event.key === 'Enter') {
  event.preventDefault();

  // Check if autocomplete is visible
  const autocomplete = document.getElementById('tagAutocomplete');
  const isAutocompleteVisible = autocomplete && autocomplete.style.display !== 'none';

  // If autocomplete is visible AND we have suggestions, use them
  if (isAutocompleteVisible && tagAutocompleteSuggestions.length > 0) {
    const suggestion = tagAutocompleteSuggestions[tagAutocompleteIndex];
    if (suggestion) {
      const tagToAdd = suggestion.tag;
      event.target.value = ''; // Clear BEFORE addTag
      hideTagAutocomplete();
      addTag(tagToAdd);
      return;
    }
  }

  // Otherwise, add the typed text
  const tag = event.target.value.trim();
  if (tag) {
    event.target.value = ''; // Clear BEFORE addTag
    hideTagAutocomplete();
    addTag(tag);
  }
}
```

📍 **Référence** : `tags.js:156-181`

---

### Escape : Fermer Autocomplete

**Action** : Ferme la liste de suggestions sans ajouter de tag.

**Détails** :
- Masque l'autocomplete
- Vide la liste des suggestions
- Le focus reste sur l'input

**Code** :
```javascript
else if (event.key === 'Escape') {
  event.preventDefault();
  hideTagAutocomplete();
}
```

📍 **Référence** : `tags.js:188-191`

---

## Modificateurs (Drag & Drop)

### Vue d'ensemble

Les modificateurs clavier changent le **comportement du drag & drop** dans l'arborescence.

📍 **Référence** : `drag-drop.js:42-44`, `drag-drop.js:64-66`

---

### Ctrl / Cmd : Créer Symlink

**Action** : Drag & Drop crée un **symlink** au lieu de déplacer.

**Détails** :
- **Windows/Linux** : Maintenir **Ctrl**
- **macOS** : Maintenir **Cmd** (ou Ctrl)
- Le nœud source reste à sa place
- Un symlink est créé dans la destination
- Détection automatique de cycles

**Code** :
```javascript
// Capture modifiers at start
dragModifiers = {
  ctrl: e.ctrlKey || e.metaKey,
  alt: e.altKey
};
```

📍 **Référence** : `drag-drop.js:41-44`

---

### Alt : Dupliquer

**Action** : Drag & Drop **duplique** le nœud (récursif).

**Détails** :
- Maintenir **Alt** (Windows/Linux/macOS)
- Le nœud source reste à sa place
- Un **clone complet** (enfants, tags, attachments) est créé dans la destination
- Nouveaux IDs générés pour tous les nœuds dupliqués

**Code** :
```javascript
dragModifiers = {
  ctrl: e.ctrlKey || e.metaKey,
  alt: e.altKey
};
```

📍 **Référence** : `drag-drop.js:41-44`

---

### Aucun Modificateur : Déplacer

**Action** : Drag & Drop **déplace** le nœud (comportement par défaut).

**Détails** :
- Aucun modificateur nécessaire
- Le nœud est **retiré** de son emplacement actuel
- Inséré à la nouvelle position
- Les enfants suivent le nœud

---

## Compatibilité Plateformes

### Windows / Linux

| Raccourci | Touches |
|-----------|---------|
| **Nouveau nœud** | Alt+N |
| **Mode édition** | Alt+E |
| **Recherche** | Ctrl+K |
| **Aide Markdown** | Alt+H |
| **Fermer/Remonter** | Escape |
| **Drag Symlink** | Ctrl+Drag |
| **Drag Duplicate** | Alt+Drag |

---

### macOS

| Raccourci | Touches | Notes |
|-----------|---------|-------|
| **Nouveau nœud** | Alt+N | Alt = Option ⌥ |
| **Mode édition** | Alt+E | Alt = Option ⌥ |
| **Recherche** | ⚠️ **Ctrl+K** | **PAS Cmd+K** (limitation actuelle) |
| **Aide Markdown** | Alt+H | Alt = Option ⌥ |
| **Fermer/Remonter** | Escape | |
| **Drag Symlink** | Cmd+Drag | Cmd = ⌘ (ou Ctrl) |
| **Drag Duplicate** | Alt+Drag | Alt = Option ⌥ |

---

### Limitation Ctrl+K sur macOS

⚠️ **Important** : Le raccourci Ctrl+K utilise `e.ctrlKey` uniquement (pas `e.metaKey`).

**Impact** :
- Sur macOS, il faut utiliser **Ctrl+K** (touche Control physique)
- **Cmd+K** ne fonctionne pas

**Code actuel** :
```javascript
// Ctrl+K: Open search
if (e.ctrlKey && e.key === 'k') {  // ⚠️ Manque: || e.metaKey
  e.preventDefault();
  if (handlers.openSearch) handlers.openSearch();
}
```

📍 **Référence** : `keyboard.js:24`

**Comparaison avec Drag & Drop** (qui gère correctement macOS) :
```javascript
// Drag & Drop: Support Cmd sur macOS
dragModifiers = {
  ctrl: e.ctrlKey || e.metaKey,  // ✅ Correct
  alt: e.altKey
};
```

📍 **Référence** : `drag-drop.js:42`

---

## Gestion des Conflits

### Priorités des Contextes

Les raccourcis sont gérés avec une **hiérarchie de priorités** pour éviter les conflits :

**1. Input focusé** (priorité maximale)
- Si un `<input>` ou `<textarea>` est focusé
- **Aucun** raccourci global n'est actif
- Seuls les raccourcis contextuels (search, tags) fonctionnent

**2. Recherche ouverte**
- Si la modal de recherche est visible
- Raccourcis de navigation dans les résultats actifs
- Raccourcis d'arborescence **désactivés**

**3. Tags autocomplete**
- Si l'input de tag est focusé et autocomplete visible
- Raccourcis de navigation dans les suggestions actifs

**4. Navigation arborescence**
- Si aucun input focusé et recherche fermée
- Raccourcis de navigation dans l'arbre actifs

**5. Raccourcis globaux**
- Toujours actifs (sauf si input focusé)

---

### Détection du Contexte

**Code** :
```javascript
// Arrow keys: Tree navigation (only when not in input/textarea and search not visible)
const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
const isSearchVisible = handlers.isSearchVisible && handlers.isSearchVisible();

if (!isInputFocused && !isSearchVisible && handlers.handleTreeNavigation) {
  if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
    handlers.handleTreeNavigation(e);
  }
}
```

📍 **Référence** : `keyboard.js:46-52`

---

### Prévention des Comportements par Défaut

Tous les raccourcis utilisent `e.preventDefault()` pour bloquer le comportement navigateur par défaut :

**Exemples** :
- **Ctrl+K** → Empêche la barre de recherche navigateur (Chrome)
- **Alt+E** → Empêche les menus système
- **Escape** → Empêche la fermeture de modales navigateur

---

## Référence Rapide

### Table Récapitulative

| Raccourci | Contexte | Action | Fichier:Ligne |
|-----------|----------|--------|---------------|
| **Alt+N** | Global | Nouveau nœud | `keyboard.js:12` |
| **Alt+E** | Global | Mode édition | `keyboard.js:18` |
| **Ctrl+K** | Global | Recherche | `keyboard.js:24` |
| **Alt+H** | Global | Aide Markdown | `keyboard.js:30` |
| **Escape** | Global | Fermer/Remonter | `keyboard.js:36` |
| **↓** | Arborescence | Descendre | `tree.js:638` |
| **↑** | Arborescence | Monter | `tree.js:647` |
| **→** | Arborescence | Déplier | `tree.js:656` |
| **←** | Arborescence | Replier/Parent | `tree.js:663` |
| **Enter** | Arborescence | Activer nœud | `tree.js:695` |
| **↓** | Recherche | Résultat suivant | `search.js:172` |
| **↑** | Recherche | Résultat précédent | `search.js:178` |
| **Enter** | Recherche | Sélectionner | `search.js:184` |
| **Escape** | Recherche | Fermer | `search.js:245` |
| **↓** | Tags | Suggestion suivante | `tags.js:182` |
| **↑** | Tags | Suggestion précédente | `tags.js:185` |
| **Enter** | Tags | Ajouter tag | `tags.js:156` |
| **Escape** | Tags | Fermer autocomplete | `tags.js:188` |
| **Ctrl/Cmd+Drag** | Drag & Drop | Créer symlink | `drag-drop.js:42` |
| **Alt+Drag** | Drag & Drop | Dupliquer | `drag-drop.js:43` |

---

### Par Catégorie

#### Création et Édition
- **Alt+N** : Nouveau nœud
- **Alt+E** : Mode édition

#### Navigation
- **Ctrl+K** : Recherche
- **Escape** : Fermer/Remonter
- **↓↑** : Naviguer arborescence
- **→←** : Déplier/Replier
- **Enter** : Activer nœud

#### Aide
- **Alt+H** : Aide Markdown

#### Recherche
- **↓↑** : Naviguer résultats
- **Enter** : Sélectionner
- **Escape** : Fermer

#### Tags
- **↓↑** : Naviguer suggestions
- **Enter** : Ajouter tag
- **Escape** : Fermer

#### Drag & Drop
- **Ctrl/Cmd+Drag** : Symlink
- **Alt+Drag** : Dupliquer

---

## Voir Aussi

- [Architecture](../2-ARCHITECTURE.md#keyboard) - Module keyboard dans l'architecture
- [Features](../4-FEATURES.md#13-raccourcis-clavier) - Description fonctionnelle des raccourcis
- [Search Module](../4-FEATURES.md#5-recherche) - Fonctionnalité de recherche
- [Tree Navigation](../4-FEATURES.md#21-arborescence-sidebar) - Navigation dans l'arborescence

---

## Statistiques

### Fichiers Analysés

| Fichier | Lignes | Contenu |
|---------|--------|---------|
| `src/js/utils/keyboard.js` | 56 | Handler principal des raccourcis globaux |
| `src/js/features/search.js` | 258 | Navigation dans les résultats de recherche |
| `src/js/features/tags.js` | 353 | Navigation autocomplete des tags |
| `src/js/features/tree.js` | 723 | Navigation arborescence (lignes 617-720) |
| `src/js/features/drag-drop.js` | 298 | Modificateurs drag & drop |
| `src/js/locales/fr.js` | 432 | Labels français des raccourcis |
| `src/js/locales/en.js` | 427 | Labels anglais des raccourcis |

**Total** : ~2547 lignes de code analysées

**Raccourcis documentés** : 19 raccourcis + 3 modificateurs drag & drop

---

**Dernière mise à jour** : 2026-02-13 | **Version** : V0.11.0
