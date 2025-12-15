# 🏗️ DeepMemo - Architecture Technique

## 📐 Vue d'ensemble

DeepMemo est une application **single-page** (SPA) en vanilla JavaScript, HTML et CSS, utilisant LocalStorage pour la persistence.

**Architecture V0.7** : Multifile
- `index.html` : Structure HTML
- `src/css/style.css` : Styles (~1180 lignes)
- `src/js/app.js` : Logique (~2270 lignes)

---

## 🎯 Principes de conception

### Minimalisme
- **Un seul type de base** : le Nœud
- Pas de types prédéfinis (note, projet, contact, etc.)
- La structure émerge de l'usage, pas de contraintes imposées

### Récursivité
- Tout nœud peut contenir d'autres nœuds
- Profondeur infinie
- Pas de distinction entre "conteneur" et "contenu"

### Flexibilité
- Un nœud peut apparaître à plusieurs endroits (symlinks)
- Liens bidirectionnels automatiques
- Tags libres sans hiérarchie

---

## 📊 Structure des données

### Le type Nœud

```javascript
{
  id: String,              // "node_timestamp_random"
  title: String,           // Titre du nœud
  content: String,         // Contenu (markdown supporté)
  children: Array<String>, // IDs des enfants directs
  parent: String | null,   // ID du parent (null = racine)
  created: Number,         // Timestamp de création
  modified: Number,        // Timestamp de dernière modification
  links: Array<String>,    // Titres des nœuds liés via [[...]]
  backlinks: Array<String>, // IDs des nœuds qui pointent ici
  tags: Array<String>,     // Tags du nœud
  symlinkedIn: Array<String | null> // IDs des parents où ce nœud apparaît aussi
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

### Exemples

#### Nœud simple
```javascript
{
  id: "node_1702234567890_abc123",
  title: "📝 Ma note",
  content: "Contenu de la note",
  children: [],
  parent: null,
  created: 1702234567890,
  modified: 1702234567890,
  links: [],
  backlinks: [],
  tags: ["important"],
  symlinkedIn: []
}
```

#### Nœud avec enfants et liens
```javascript
{
  id: "node_1702234567891_def456",
  title: "💼 Projet X",
  content: "Description du projet.\nVoir aussi [[Contacts]] pour l'équipe.",
  children: [
    "node_1702234567892_ghi789",  // Tâche 1
    "node_1702234567893_jkl012"   // Tâche 2
  ],
  parent: null,
  created: 1702234567891,
  modified: 1702234567900,
  links: ["Contacts"],
  backlinks: [],
  tags: ["projet", "urgent"],
  symlinkedIn: []
}
```

#### Nœud avec lien symbolique
```javascript
{
  id: "node_1702234567894_mno345",
  title: "👤 Alice",
  content: "Contact : alice@example.com",
  children: [],
  parent: "node_contacts",
  created: 1702234567894,
  modified: 1702234567894,
  links: [],
  backlinks: ["node_1702234567891_def456"],
  tags: ["contact", "équipe"],
  symlinkedIn: [
    "node_projet_x",  // Apparaît aussi dans le projet X
    null              // Apparaît aussi à la racine
  ]
}
```

---

## 🔄 Algorithmes clés

### Génération d'ID unique
```javascript
generateId() {
  return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
// Exemple: "node_1702234567890_k3m9x7q2p"
```

### Parsing des wiki-links
```javascript
parseLinks(content) {
  const regex = /\[\[([^\]]+)\]\]/g;
  const links = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].trim());
  }
  return [...new Set(links)]; // Dédupliquer
}
```

### Mise à jour des backlinks
```javascript
updateBacklinks() {
  // 1. Reset tous les backlinks
  Object.values(this.data.nodes).forEach(node => {
    node.backlinks = [];
  });

  // 2. Recalculer depuis les liens
  Object.values(this.data.nodes).forEach(sourceNode => {
    sourceNode.links?.forEach(linkTitle => {
      const targetNode = this.findNodeByTitle(linkTitle);
      if (targetNode && !targetNode.backlinks.includes(sourceNode.id)) {
        targetNode.backlinks.push(sourceNode.id);
      }
    });
  });
}
```

### Recherche du chemin vers un nœud
```javascript
getNodePath(nodeId) {
  const path = [];
  let currentId = nodeId;
  
  while (currentId) {
    const node = this.data.nodes[currentId];
    if (node) {
      path.unshift(node.title);
      currentId = node.parent;
    } else break;
  }
  
  return path.join(' › ');
}
// Exemple: "Projets › Projet X › Tâche 1"
```

### Expansion automatique du chemin
```javascript
expandPathToNode(nodeId) {
  const path = [];
  let currentId = nodeId;
  
  // Collecter tous les parents
  while (currentId) {
    const node = this.data.nodes[currentId];
    if (node?.parent !== null) {
      path.unshift(node.parent);
    }
    currentId = node?.parent;
  }
  
  // Déplier tous les parents
  path.forEach(id => this.expandedNodes.add(id));
  
  // Sauvegarder
  localStorage.setItem('deepmemo_expanded', JSON.stringify([...this.expandedNodes]));
}
```

---

## 🎨 Architecture UI

### Structure HTML simplifiée
```html
<body>
  <div class="app-container">
    <!-- Sidebar gauche -->
    <div class="sidebar">
      <div class="sidebar-header">...</div>
      <div class="tree-container" id="treeContainer">
        <!-- Arborescence générée dynamiquement -->
      </div>
    </div>

    <!-- Contenu central -->
    <div class="main-content">
      <div class="breadcrumb">...</div>
      <div class="content-header">
        <input id="nodeTitle">
        <div id="tagsContainer">...</div>
      </div>
      <div class="content-body">
        <textarea id="nodeContent"></textarea>
        <div id="childrenGrid">...</div>
      </div>
    </div>

    <!-- Panel droit -->
    <div class="right-panel">
      <div id="panelBody">
        <!-- Métadonnées, liens, backlinks -->
      </div>
    </div>
  </div>

  <!-- Modales -->
  <div class="search-modal" id="searchModal">...</div>
  <div class="modal-overlay" id="symlinkModal">...</div>
  <div class="modal-overlay" id="actionModal">...</div>
</body>
```

### Rendu de l'arborescence
```javascript
render() {
  const container = document.getElementById('treeContainer');
  container.innerHTML = '';

  const renderNode = (nodeId, parentContext = null) => {
    const node = this.data.nodes[nodeId];
    const isSymlink = parentContext !== null && this.isSymlinkIn(nodeId, parentContext);
    const isExpanded = this.expandedNodes.has(nodeId);

    // Créer le nœud DOM
    const div = document.createElement('div');
    div.className = 'tree-node' + (isExpanded ? ' expanded' : '');
    
    // ... construire le contenu
    
    return div;
  };

  // Rendre racines + symlinks
  this.data.rootNodes.forEach(nodeId => {
    container.appendChild(renderNode(nodeId, null));
  });
}
```

---

## 💾 Persistence

### LocalStorage
```javascript
// Sauvegarde
saveData() {
  localStorage.setItem('deepmemo_data', JSON.stringify(this.data));
  localStorage.setItem('deepmemo_expanded', JSON.stringify([...this.expandedNodes]));
}

// Chargement
loadData() {
  const stored = localStorage.getItem('deepmemo_data');
  if (stored) this.data = JSON.parse(stored);
  
  const expandedStored = localStorage.getItem('deepmemo_expanded');
  if (expandedStored) {
    this.expandedNodes = new Set(JSON.parse(expandedStored));
  }
}
```

### Export/Import JSON
```javascript
exportData() {
  const dataStr = JSON.stringify(this.data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'deepmemo-export-' + Date.now() + '.json';
  a.click();
  
  URL.revokeObjectURL(url);
}

importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const imported = JSON.parse(e.target.result);
    this.data = imported;
    this.saveData();
    this.render();
  };
  reader.readAsText(file);
}
```

---

## ⚡ Gestion des événements

### Délégation d'événements
```javascript
// Au lieu de : onclick="app.selectNode('xxx')"
// On utilise la délégation :

document.addEventListener('click', (e) => {
  const treeNode = e.target.closest('.tree-node-content');
  if (treeNode) {
    const nodeId = treeNode.dataset.nodeId;
    this.selectNode(nodeId);
  }
});
```

### Raccourcis clavier globaux
```javascript
setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Alt+N : Nouveau nœud
    if (e.altKey && e.key === 'n') {
      e.preventDefault();
      this.currentNodeId ? this.createChildNode() : this.createRootNode();
    }
    
    // Ctrl+K : Recherche
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      this.openSearch();
    }
    
    // Escape : Remonter
    if (e.key === 'Escape' && this.currentNodeId && !this.searchVisible) {
      e.preventDefault();
      this.goToParent();
    }
  });
}
```

---

## 🎯 Drag & Drop

### Système de zones
```javascript
handleDragOver(e) {
  e.preventDefault();
  
  const rect = element.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  const height = rect.height;
  
  if (mouseY < height * 0.33) {
    this.dropPosition = 'before';  // Zone haute
  } else if (mouseY > height * 0.67) {
    this.dropPosition = 'after';   // Zone basse
  } else {
    this.dropPosition = 'inside';  // Zone milieu
  }
}
```

### Actions selon modificateurs
```javascript
handleDrop(e, targetNodeId) {
  const draggedId = this.draggedNodeId;
  const position = this.dropPosition;
  const { ctrl, alt } = this.dragModifiers;

  if (position === 'before' || position === 'after') {
    if (ctrl && !alt) {
      this.duplicateNodeAt(draggedId, targetNodeId, position);
    } else {
      this.reorderNodes(draggedId, targetNodeId, position);
    }
  } else { // inside
    if (ctrl && alt) {
      this.createSymlinkTo(draggedId, targetNodeId);
    } else if (ctrl) {
      this.duplicateNode(draggedId, targetNodeId);
    } else {
      this.moveNode(draggedId, targetNodeId);
    }
  }
}
```

---

## 🔍 Recherche

### Algorithme de recherche
```javascript
performSearch(query) {
  const results = [];
  const queryLower = query.toLowerCase();

  Object.values(this.data.nodes).forEach(node => {
    const titleMatch = node.title.toLowerCase().includes(queryLower);
    const contentMatch = node.content.toLowerCase().includes(queryLower);
    const tagsMatch = node.tags?.some(tag => tag.toLowerCase().includes(queryLower));

    if (titleMatch || contentMatch || tagsMatch) {
      results.push({
        id: node.id,
        title: node.title,
        path: this.getNodePath(node.id),
        preview: this.generatePreview(node, query),
        matchInTitle: titleMatch,
        matchInTags: tagsMatch
      });
    }
  });

  return results;
}
```

---

## 🏷️ Tags

### Auto-complétion
```javascript
collectAllTagsForAutocomplete() {
  const tagMap = new Map();
  
  // 1. Tags de la branche (prioritaires)
  const collectFromBranch = (nodeId) => {
    const node = this.data.nodes[nodeId];
    node.tags?.forEach(tag => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, { tag, count: 0, inBranch: true });
      }
      tagMap.get(tag).count++;
    });
    node.children?.forEach(childId => collectFromBranch(childId));
  };
  
  if (this.currentNodeId) collectFromBranch(this.currentNodeId);
  
  // 2. Tags globaux (moins prioritaires)
  Object.values(this.data.nodes).forEach(node => {
    if (!this.isInCurrentBranch(node.id)) {
      node.tags?.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, { tag, count: 0, inBranch: false });
        }
        tagMap.get(tag).count++;
      });
    }
  });
  
  // Trier : branche d'abord, puis par fréquence
  return Array.from(tagMap.values()).sort((a, b) => {
    if (a.inBranch && !b.inBranch) return -1;
    if (!a.inBranch && b.inBranch) return 1;
    return b.count - a.count;
  });
}
```

---

## 🎨 Thème CSS

### Variables CSS
```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #2a2a2a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --accent: #4a9eff;
  --accent-hover: #6bb0ff;
  --border: #333;
  --success: #4ade80;
  --danger: #ef4444;
}
```

### Hiérarchie de z-index
```css
/* Arborescence : z-index 1 (base) */
/* Panel droit toggle : z-index 50 */
/* Boutons toggle externes : z-index 200 */
/* Drop indicators : z-index 1000 */
/* Toast : z-index 1000 */
/* Search modal : z-index 2000 */
/* Action modals : z-index 3000 */
```

---

## 📦 État de l'application

### Variables globales
```javascript
const app = {
  // Données
  data: { nodes: {}, rootNodes: [] },
  currentNodeId: null,
  
  // État UI
  sidebarVisible: true,
  rightPanelVisible: true,
  searchVisible: false,
  
  // Navigation
  focusedTreeNodeId: null,
  expandedNodes: new Set(),
  
  // Modales
  symlinkModalExpandedNodes: new Set(),
  actionModalExpandedNodes: new Set(),
  selectedNodeForSymlink: null,
  selectedAction: null,
  selectedDestination: null,
  
  // Recherche
  searchResults: [],
  selectedSearchResultIndex: 0,
  
  // Tags
  tagAutocompleteIndex: 0,
  tagAutocompleteSuggestions: [],
  showAllTags: false,
  
  // Drag & Drop
  draggedNodeId: null,
  dragModifiers: { ctrl: false, alt: false, shift: false },
  dropPosition: null
};
```

---

## 🚀 Performance

### Optimisations actuelles
- Rendu différentiel (pas de re-render complet)
- Délégation d'événements
- Debounce sur les auto-complete
- LocalStorage pour persistence rapide

### À optimiser en V0.7+
- Virtual scrolling pour grandes arborescences (>1000 nœuds)
- Web Workers pour recherche asynchrone
- IndexedDB pour grandes quantités de données
- Lazy loading des nœuds profonds

---

## 🔐 Sécurité

### Actuel
- Échappement HTML pour éviter XSS : `escapeHtml(text)`
- Pas de `eval()` ou `innerHTML` avec contenu utilisateur

### À implémenter
- Sanitization markdown (si rendu HTML)
- Content Security Policy
- Encryption optionnelle des données sensibles

---

**Document technique V0.7**
Dernière mise à jour : 15 Décembre 2025
