# 🚀 Guide de développement DeepMemo V0.8

**Dernière mise à jour** : 20 Décembre 2025
**Version** : 0.8 (Architecture modulaire ES6)

---

## 📁 Structure du projet

```
DeepMemo/
├── index.html                      # Point d'entrée HTML (~190 lignes)
├── favicon.svg                     # Icône de l'app
│
├── src/
│   ├── css/
│   │   ├── style.css              # Import global (~10 lignes)
│   │   ├── base.css               # Reset + variables CSS (~150 lignes)
│   │   ├── layout.css             # Structure responsive (~250 lignes)
│   │   ├── components.css         # Composants UI (~800 lignes)
│   │   └── utilities.css          # Classes utilitaires (~50 lignes)
│   │
│   └── js/
│       ├── app.js                 # Point d'entrée (~420 lignes)
│       ├── app-legacy-backup.js   # Ancien monolithique (référence)
│       │
│       ├── core/
│       │   └── data.js            # Gestion données + localStorage
│       │
│       ├── features/
│       │   ├── tree.js            # Arborescence + mode branche
│       │   ├── editor.js          # Éditeur + breadcrumb
│       │   ├── search.js          # Recherche globale
│       │   ├── tags.js            # Tags + autocomplete
│       │   ├── modals.js          # Modales (Move/Link/Duplicate)
│       │   └── drag-drop.js       # Drag & drop complet
│       │
│       ├── ui/
│       │   ├── toast.js           # Notifications toast
│       │   └── panels.js          # Panneaux latéraux
│       │
│       └── utils/
│           ├── routing.js         # Navigation URL
│           ├── keyboard.js        # Raccourcis clavier
│           └── helpers.js         # Fonctions utilitaires
│
├── assets/
│   └── sto*.ttf                   # Fonts personnalisées
│
├── docs/
│   ├── README.md                  # Concept et features
│   ├── ROADMAP.md                 # État actuel et prochaines étapes
│   ├── ARCHITECTURE.md            # Détails techniques modulaires
│   ├── Guide de développement.md  # Ce fichier
│   ├── TODO.md                    # Backlog et progression
│   ├── V0.8-COMPLETE.md           # Récapitulatif V0.8
│   └── VISION.md                  # Vision long-terme
│
├── .gitignore
├── .claude/                       # Configuration Claude Code (ignoré)
└── CLAUDE.md                      # Guide contexte développement (ignoré)
```

---

## 🛠️ Configuration de l'environnement

### Prérequis

- **Navigateur moderne** (Chrome, Firefox, Edge, Safari)
- **Serveur HTTP local** (requis pour ES6 modules)
- **Git** (pour le versioning)
- **Python 3** ou **Node.js** (pour le serveur)

**Important** : Les modules ES6 ne fonctionnent PAS avec `file://` ! Un serveur HTTP est **obligatoire**.

### Lancer l'application

#### Depuis Python (recommandé)
```bash
cd DeepMemo
python -m http.server 8000
```

#### Depuis Node.js
```bash
cd DeepMemo
npx http-server -p 8000
```

Puis ouvrir : **http://localhost:8000**

### Hard refresh

Pour éviter les problèmes de cache avec les modules ES6 :
- **Windows/Linux** : `Ctrl + Shift + R`
- **Mac** : `Cmd + Shift + R`

---

## 📚 Lire la documentation

Ordre recommandé pour bien comprendre le projet :

1. **[README.md](../README.md)** - Concept général et features V0.8
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture modulaire ES6
3. **[ROADMAP.md](ROADMAP.md)** - État V0.8 et vision V0.9+
4. **[TODO.md](TODO.md)** - Backlog et progression détaillée
5. **[VISION.md](VISION.md)** - Vision long-terme

---

## 🧩 Architecture modulaire

### Principes clés

**V0.8 utilise une architecture modulaire ES6** :

1. **Imports/exports nommés** pour chaque module
2. **État local** dans chaque module (non exporté)
3. **Communication** via callbacks et fonctions exportées
4. **Pas de state manager global** (simplicité volontaire)

### Exemple de module

```javascript
// features/tags.js
import { data, saveData } from '../core/data.js';
import { showToast } from '../ui/toast.js';

// État local (non exporté)
let tagAutocompleteIndex = 0;
let tagAutocompleteSuggestions = [];

// Fonction exportée
export function updateTagsDisplay(nodeId) {
  const node = data.nodes[nodeId];
  // ...
  saveData();
  showToast('Tags mis à jour', '🏷️');
}
```

### Flux de données

```
index.html (charge app.js type="module")
    ↓
app.js (point d'entrée)
    ↓
├─→ core/data.js (données)
├─→ features/tree.js (arbre)
├─→ features/editor.js (contenu)
├─→ features/drag-drop.js (interactions)
└─→ utils/routing.js (URL)
```

---

## 🧪 Tester l'application

### Fonctionnalités V0.8 à tester

#### ✅ Gestion des nœuds
- [ ] Créer un nœud racine (`Alt+N`)
- [ ] Créer un nœud enfant
- [ ] Éditer le titre et le contenu
- [ ] Supprimer un nœud (via modal Actions)
- [ ] Auto-activation au démarrage (pas d'empty state)

#### ✅ Navigation
- [ ] Breadcrumb intelligent (s'arrête au branchRootId en mode branche)
- [ ] Bouton 🏠 active le premier nœud
- [ ] Navigation clavier dans l'arbre (`↑↓←→ + Enter`)
- [ ] Auto-collapse à l'activation
- [ ] Expand/collapse manuel (triangle, flèches)

#### ✅ Mode branche isolée
- [ ] Activer via URL `?branch=nodeId`
- [ ] Bouton 🌳 pour partager une branche
- [ ] Symlinks externes désactivés (icône 🔗🚫)
- [ ] Breadcrumb s'arrête au branchRootId
- [ ] Navigation identique au mode normal

#### ✅ Liens symboliques
- [ ] Créer un symlink via drag & drop (`Ctrl+Alt`)
- [ ] Renommer un symlink (titre indépendant du target)
- [ ] Éditer le contenu (partagé avec target)
- [ ] Focus visuel après navigation via symlink
- [ ] Badge [lien] visible (pas de suffixe " (lien)")

#### ✅ Tags
- [ ] Ajouter des tags
- [ ] Auto-complétion intelligente (branche + global)
- [ ] Tag cloud dans le panel droit
- [ ] Recherche par tag

#### ✅ Recherche
- [ ] Ouvrir la recherche (`Ctrl+K`)
- [ ] Rechercher dans titres, contenus, tags
- [ ] Navigation clavier dans les résultats

#### ✅ Drag & Drop
- [ ] Déplacer un nœud (drag simple)
- [ ] Dupliquer un nœud (`Ctrl + drag`)
- [ ] Créer un symlink (`Ctrl+Alt + drag`)
- [ ] Réorganiser l'ordre (zones before/after/inside)
- [ ] Indicateurs visuels de position
- [ ] Prévention cycles (toast d'avertissement)
- [ ] Support arbre ET cartes enfants

#### ✅ Modales
- [ ] Modal Actions : sélectionner action (Move/Link/Duplicate/Delete)
- [ ] Arborescence masquable dans modal (toggle)
- [ ] Toggles harmonisés avec arbre principal

#### ✅ Interface
- [ ] Toggle view/edit mode (`Alt+E`)
- [ ] Sidebar pliable
- [ ] Right panel pliable
- [ ] Resize panneau latéral (265px-600px)
- [ ] Raccourcis clavier documentés (right panel)
- [ ] Export/Import regroupés dans sidebar

#### ✅ Export/Import
- [ ] Exporter en JSON
- [ ] Importer un JSON
- [ ] Vérifier l'intégrité des données

---

## 🐛 Debugging

### Console navigateur

Ouvre les DevTools (`F12`) pour :
- Voir les erreurs JavaScript
- Inspecter le LocalStorage
- Debugger le code (sources ES6 modules)

### LocalStorage

```javascript
// Dans la console :
localStorage.getItem('deepmemo_data')        // Voir les données
localStorage.getItem('deepmemo_viewMode')    // Voir le mode (view/edit)
localStorage.clear()                          // Reset complet
```

**Note** : `expandedNodes` n'est PAS sauvegardé (recalculé dynamiquement via auto-collapse).

### Fichiers à vérifier en cas de bug

**Par ordre de complexité** :

1. **app.js** - Point d'entrée et coordination
2. **features/tree.js** - Navigation et arborescence
3. **features/editor.js** - Affichage et sauvegarde
4. **features/drag-drop.js** - Interactions drag & drop
5. **core/data.js** - Données et persistence
6. **utils/routing.js** - URLs et hash routing

### Erreurs courantes

**Module not found** :
- Vérifier que le serveur HTTP est lancé (pas `file://`)
- Vérifier les imports (chemins relatifs corrects)
- Hard refresh (`Ctrl + Shift + R`)

**LocalStorage plein** :
- Limite ~5-10 MB selon navigateur
- Exporter les données avant de nettoyer
- `localStorage.clear()` en dernier recours

---

## 📝 Conventions de code

### Style JavaScript (ES6)

- **Indentation** : 2 espaces
- **Quotes** : Simple quotes `'...'`
- **Noms de variables** : `camelCase`
- **Noms de fonctions** : `camelCase`
- **Commentaires** : Français ou anglais
- **Imports** : Toujours en haut du fichier

**Exemple** :
```javascript
import { data, saveData } from '../core/data.js';

// État local (non exporté)
let expandedNodes = new Set();

// Fonction exportée
export function renderTree() {
  const container = document.getElementById('treeContainer');
  // ...
}
```

### Style CSS

- **Noms de classes** : `kebab-case`
- **Variables CSS** : `--nom-variable`
- **Ordre** : base.css → layout.css → components.css → utilities.css
- **Imports** : Via `@import` dans `style.css`

### Organisation des modules

**État local (non exporté)** :
```javascript
// Variables d'état accessibles uniquement dans le module
let branchMode = false;
let expandedNodes = new Set();
```

**Fonctions exportées** :
```javascript
// API publique du module
export function renderTree() { ... }
export function enableBranchMode(nodeId) { ... }
```

**Fonctions internes (non exportées)** :
```javascript
// Helpers privés
function getInstanceKey(nodeId, parentContext) { ... }
```

---

## 🎯 Contribuer

### Workflow Git

```bash
# Créer une branche pour ta feature
git checkout -b feature/ma-feature

# Développer et tester

# Commit
git add .
git commit -m "✨ Add: ma feature"

# Push
git push origin feature/ma-feature
```

### Types de commits

- `✨ Add:` Nouvelle feature
- `🐛 Fix:` Correction de bug
- `📝 Docs:` Documentation
- `♻️ Refactor:` Refactoring
- `🎨 Style:` CSS/UI
- `⚡ Perf:` Performance

### Ajouter une nouvelle fonctionnalité

**Étapes recommandées** :

1. **Choisir le bon module** (ou en créer un nouveau)
2. **Définir l'API publique** (exports)
3. **Implémenter la logique** (état local + fonctions)
4. **Tester manuellement**
5. **Documenter** (commentaires + ARCHITECTURE.md si nécessaire)
6. **Commit** avec message clair

**Exemple : Ajouter une feature de favoris**

```javascript
// features/favorites.js (nouveau module)
import { data, saveData } from '../core/data.js';
import { showToast } from '../ui/toast.js';

// État local
let favorites = new Set();

export function toggleFavorite(nodeId) {
  if (favorites.has(nodeId)) {
    favorites.delete(nodeId);
    showToast('Retiré des favoris', '⭐');
  } else {
    favorites.add(nodeId);
    showToast('Ajouté aux favoris', '⭐');
  }
  saveFavorites();
}

function saveFavorites() {
  localStorage.setItem('deepmemo_favorites', JSON.stringify([...favorites]));
}
```

Puis dans `app.js` :
```javascript
import * as FavoritesModule from './features/favorites.js';

// Exposer la fonction
window.app.toggleFavorite = (nodeId) => FavoritesModule.toggleFavorite(nodeId);
```

---

## 🔧 Technologies utilisées

### Frontend

- **HTML5** - Structure sémantique
- **CSS3** - Variables, Flexbox, Grid
- **JavaScript ES6+** - Modules, Classes, Arrow functions

### APIs natives

- **ES6 Modules** - Import/export
- **LocalStorage API** - Persistence
- **Drag & Drop API** - Interactions
- **FileReader API** - Import/Export
- **History API** - URL routing (pushState/replaceState)
- **Clipboard API** - Copie liens de partage

### Bibliothèques externes

- **marked.js** - Rendu Markdown (CDN)

### Pas d'autres dépendances

- Pas de framework (React, Vue, etc.)
- Pas de bundler (Webpack, Vite, etc.)
- Pas de transpiler (Babel, etc.)
- Tout est vanilla JavaScript moderne

---

## 💡 Conseils

### Approche progressive

1. **Lire ARCHITECTURE.md** - Comprendre les modules
2. **Tester l'app** - Manipuler toutes les features
3. **Lire le code** - Commencer par `app.js` puis les modules
4. **Faire des petites modifications** - Un module à la fois
5. **Tester fréquemment** - À chaque changement

### Garder la simplicité

- **Privilégier les solutions simples** - Pas de sur-ingénierie
- **Un module = une responsabilité** - Cohésion forte
- **État local quand possible** - Éviter état global
- **Tester manuellement** - Pas de tests automatisés (pour l'instant)

### Performance

- **Délégation d'événements** - Éviter les listeners multiples
- **Rendu ciblé** - Pas de re-render complet
- **LocalStorage rapide** - Mais limité en taille (~5-10 MB)

### Éviter les anti-patterns

❌ **Mauvais** :
```javascript
// Import sans extension
import { data } from '../core/data';  // ❌ Manque .js

// État global partagé
window.myGlobalState = {};  // ❌ Utiliser module local

// innerHTML avec contenu utilisateur
element.innerHTML = userContent;  // ❌ XSS risk
```

✅ **Bon** :
```javascript
// Import avec extension
import { data } from '../core/data.js';  // ✅

// État local dans module
let myLocalState = {};  // ✅

// textContent pour texte
element.textContent = userContent;  // ✅
```

---

## 📚 Ressources

### Documentation externe

- [MDN Web Docs](https://developer.mozilla.org/)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Drag & Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)

### Documentation interne

- **ARCHITECTURE.md** - Détails techniques complets
- **CLAUDE.md** - Guide contexte pour Claude (ignoré Git)
- **V0.8-COMPLETE.md** - Récapitulatif de la V0.8

### Projet

- **Repo GitHub** : `https://github.com/parksto/DeepMemo`
- **Version actuelle** : V0.8 (Architecture modulaire ES6)
- **Statut** : ✅ Stable et en production
- **Prochaine version** : V0.9 (Features avancées)

---

## 🚀 Prochaines étapes (V0.9+)

Si tu veux contribuer à la V0.9, voici les features prévues :

### Features avancées

- **Wiki-links refactorés** - Syntaxe `[[id:titre]]` avec auto-complétion
- **Vue liste nested** - Indentation visuelle style todo-list
- **Export Markdown** - Structure préservée
- **Recherche avancée** - Regex, filtres combinés

### Optimisations

- **Virtual scrolling** - Pour grandes arborescences (>500 nœuds)
- **IndexedDB** - Pour grandes quantités de données
- **Web Workers** - Recherche asynchrone

Consulte **TODO.md** pour la liste complète et les priorités.

---

**Bonne contribution ! 🚀**

*N'hésite pas à poser des questions ou proposer des améliorations.*

**Dernière mise à jour** : 20 Décembre 2025
