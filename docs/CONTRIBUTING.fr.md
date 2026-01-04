# 🚀 Guide de développement DeepMemo V0.10

> **[English version](CONTRIBUTING.md)** 🇬🇧

**Dernière mise à jour** : 4 janvier 2026
**Version** : 0.10 (Migration IndexedDB + Sync multi-onglets)

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
│   │   ├── mobile.css             # Navigation mobile (~400 lignes)
│   │   └── utilities.css          # Classes utilitaires (~50 lignes)
│   │
│   └── js/
│       ├── app.js                 # Point d'entrée (~830 lignes)
│       │
│       ├── core/
│       │   ├── data.js            # Gestion données + export/import
│       │   ├── storage.js         # Couche IndexedDB (Dexie.js) - V0.10
│       │   ├── migration.js       # Migration localStorage → IndexedDB - V0.10
│       │   ├── attachments.js     # Gestion fichiers joints (IndexedDB)
│       │   └── default-data.js    # Contenu de démo par défaut
│       │
│       ├── features/
│       │   ├── tree.js            # Arborescence + mode branche
│       │   ├── editor.js          # Éditeur + breadcrumb + enfants + attachments UI
│       │   ├── search.js          # Recherche globale
│       │   ├── tags.js            # Tags + autocomplete
│       │   ├── modals.js          # Modales (Move/Link/Duplicate)
│       │   └── drag-drop.js       # Drag & drop complet
│       │
│       ├── ui/
│       │   ├── toast.js           # Notifications toast
│       │   ├── panels.js          # Panneaux latéraux
│       │   └── mobile-tabs.js     # Navigation mobile par onglets
│       │
│       └── utils/
│           ├── routing.js         # Navigation URL
│           ├── keyboard.js        # Raccourcis clavier
│           ├── helpers.js         # Fonctions utilitaires
│           ├── i18n.js            # Internationalisation
│           └── sync.js            # Sync multi-onglets (BroadcastChannel) - V0.10
│
│       └── locales/
│           ├── fr.js              # Dictionnaire français
│           └── en.js              # Dictionnaire anglais
│
├── assets/
│   └── sto*.ttf                   # Fonts personnalisées
│
├── icons/
│   ├── icon-192x192.png           # Icône PWA
│   └── icon-512x512.png           # Icône PWA
│
├── docs/
│   ├── README.md                  # Concept et features
│   ├── ROADMAP.md                 # État actuel et prochaines étapes
│   ├── ARCHITECTURE.md            # Détails techniques modulaires
│   ├── CONTRIBUTING.md            # Ce fichier (anglais)
│   ├── CONTRIBUTING.fr.md         # Ce fichier (français)
│   ├── TODO.md                    # Backlog et progression
│   ├── V0.8-COMPLETE.md           # Récapitulatif V0.8
│   ├── I18N.md                    # Documentation système i18n
│   └── VISION.md                  # Vision long-terme
│
├── manifest-fr.json               # Manifest PWA (français)
├── manifest-en.json               # Manifest PWA (anglais)
├── sw.js                          # Service Worker
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

1. **[README.md](../README.md)** - Concept général et features V0.9
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture modulaire ES6
3. **[ROADMAP.md](ROADMAP.md)** - État V0.9 et vision V1.0+
4. **[TODO.md](TODO.md)** - Backlog et progression détaillée
5. **[I18N.md](I18N.md)** - Documentation système i18n
6. **[VISION.md](VISION.md)** - Vision long-terme

---

## 🧩 Architecture modulaire

### Principes clés

**V0.9 utilise une architecture modulaire ES6** :

1. **Imports/exports nommés** pour chaque module
2. **État local** dans chaque module (non exporté)
3. **Communication** via callbacks et fonctions exportées
4. **Pas de state manager global** (simplicité volontaire)

### Exemple de module

```javascript
// features/tags.js
import { data, saveData } from '../core/data.js';
import { showToast } from '../ui/toast.js';
import { t } from '../utils/i18n.js';

// État local (non exporté)
let tagAutocompleteIndex = 0;
let tagAutocompleteSuggestions = [];

// Fonction exportée
export function updateTagsDisplay(nodeId) {
  const node = data.nodes[nodeId];
  // ...
  saveData();
  showToast(t('toast.tagsUpdated'), '🏷️');
}
```

### Flux de données

```
index.html (charge app.js type="module")
    ↓
app.js (point d'entrée)
    ↓
├─→ core/data.js (données)
├─→ core/attachments.js (fichiers)
├─→ features/tree.js (arbre)
├─→ features/editor.js (contenu)
├─→ features/drag-drop.js (interactions)
├─→ utils/routing.js (URL)
└─→ utils/i18n.js (traductions)
```

---

## 🧪 Tester l'application

### Fonctionnalités V0.10 à tester

#### ✅ Stockage & Persistence
- [ ] Migration automatique de localStorage vers IndexedDB (premier chargement après upgrade)
- [ ] Données persistantes après redémarrage du navigateur
- [ ] Inspecter les stores IndexedDB (nodes, settings, attachments)
- [ ] Capacité de stockage augmentée (500 Mo-1 Go)
- [ ] localStorage préservé comme backup

#### ✅ Synchronisation multi-onglets
- [ ] Ouvrir l'app dans deux onglets
- [ ] Créer/éditer un nœud dans onglet 1 → apparaît instantanément dans onglet 2
- [ ] Supprimer un nœud dans onglet 2 → disparaît dans onglet 1
- [ ] Sync temps réel sans refresh manuel
- [ ] Nœud actuel préservé s'il n'est pas supprimé

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
- [ ] Toggle police (Sto vs polices système)

#### ✅ Export/Import
- [ ] Exporter global en JSON
- [ ] Exporter global en ZIP
- [ ] Exporter branche en JSON
- [ ] Exporter branche en ZIP
- [ ] Importer un JSON (destructif)
- [ ] Importer un ZIP (avec fichiers joints)
- [ ] Importer branche (non-destructif, régénération IDs)
- [ ] Vérifier l'intégrité des données

#### ✅ Fichiers joints
- [ ] Uploader des fichiers (50MB max par fichier)
- [ ] Afficher images inline `![](attachment:ID)`
- [ ] Lier des fichiers `[nom](attachment:ID)`
- [ ] Télécharger un fichier joint
- [ ] Supprimer un fichier joint
- [ ] Voir l'utilisation du stockage
- [ ] Nettoyer fichiers orphelins

#### ✅ Internationalisation (V0.9)
- [ ] Détection automatique de langue (navigateur)
- [ ] Sélecteur manuel de langue (FR/EN)
- [ ] Interface complètement traduite
- [ ] Messages toast traduits
- [ ] Contenu de démo dans les deux langues
- [ ] Persistance langue (localStorage)
- [ ] Traduction offline (PWA)

#### ✅ Mobile (V1.2.0)
- [ ] Navigation par onglets (🌲 Arbre | 📝 Édition | ℹ️ Info)
- [ ] Boutons tactiles (≥44px)
- [ ] Layouts responsifs
- [ ] Support zone sécurisée (encoche)
- [ ] Espacement optimisé (portrait/paysage)

---

## 🐛 Debugging

### Console navigateur

Ouvre les DevTools (`F12`) pour :
- Voir les erreurs JavaScript
- Inspecter IndexedDB (stockage principal depuis V0.10)
- Inspecter LocalStorage (backup de migration uniquement)
- Debugger le code (sources ES6 modules)

### IndexedDB (V0.10+)

**Stockage principal** dans DevTools → Application → IndexedDB → `deepmemo` :
- **nodes** store : Tous les objets nœuds
- **settings** store : rootNodes, viewMode, language, fontPreference
- **attachments** store : Blobs de fichiers

**Commandes console** :
```javascript
// Obtenir les statistiques de stockage
const stats = await window.Storage.getStats();
console.table(stats);

// Lister tous les nœuds
const nodes = await window.Storage.loadNodes();
console.log(Object.keys(nodes).length, 'nœuds');

// Obtenir la taille totale des attachments
const size = await window.Storage.getTotalAttachmentsSize();
console.log((size / 1024 / 1024).toFixed(2), 'Mo');

// Tout effacer (⚠️ DANGER - irréversible !)
await window.Storage.clearAllData();
```

### LocalStorage (Backup uniquement)

Depuis la V0.10, localStorage n'est utilisé que comme backup de migration :

```javascript
// Flag de migration
localStorage.getItem('deepmemo_migrated_to_indexeddb')  // "true" après migration

// Anciennes données (préservées comme backup)
localStorage.getItem('deepmemo_data')  // Backup JSON de V0.9

// Effacer le backup localStorage après confirmation que la migration a fonctionné
await window.Storage.clearLocalStorageBackup();
```

**Note** : `expandedNodes` n'est PAS sauvegardé (recalculé dynamiquement via auto-collapse).

### Fichiers à vérifier en cas de bug

**Par ordre de complexité** :

1. **app.js** - Point d'entrée et coordination
2. **features/tree.js** - Navigation et arborescence
3. **features/editor.js** - Affichage et sauvegarde
4. **features/drag-drop.js** - Interactions drag & drop
5. **core/data.js** - Opérations sur les données et export/import
6. **core/storage.js** - Couche IndexedDB (V0.10)
7. **core/migration.js** - Logique de migration (V0.10)
8. **utils/sync.js** - Synchronisation multi-onglets (V0.10)
9. **utils/routing.js** - URLs et hash routing
10. **utils/i18n.js** - Internationalisation

### Erreurs courantes

**Module not found** :
- Vérifier que le serveur HTTP est lancé (pas `file://`)
- Vérifier les imports (chemins relatifs corrects)
- Hard refresh (`Ctrl + Shift + R`)

**Erreurs IndexedDB (V0.10+)** :
- Vérifier le support navigateur (tous les navigateurs modernes)
- Vérifier que la base `deepmemo` existe dans DevTools
- Exporter les données avant diagnostic
- Utiliser `window.Storage.clearAllData()` en dernier recours

**Problèmes de migration** :
- Vérifier `localStorage.getItem('deepmemo_migrated_to_indexeddb')`
- Vérifier que les anciennes données existent dans le backup localStorage
- Vérifier les erreurs de migration dans la console
- Migration manuelle : utiliser Export depuis V0.9 → Import dans V0.10

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
- `🌍 i18n:` Internationalisation

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
import { t } from '../utils/i18n.js';

// État local
let favorites = new Set();

export function toggleFavorite(nodeId) {
  if (favorites.has(nodeId)) {
    favorites.delete(nodeId);
    showToast(t('toast.removedFromFavorites'), '⭐');
  } else {
    favorites.add(nodeId);
    showToast(t('toast.addedToFavorites'), '⭐');
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

### Ajouter une nouvelle langue

Voir **[I18N.md](I18N.md)** pour le guide complet d'internationalisation.

**Étapes rapides** :

1. Créer `src/js/locales/XX.js` (copier `fr.js` et traduire)
2. Créer `manifest-XX.json` (traduire nom/description app)
3. Mettre à jour `sw.js` précache (ajouter nouveaux fichiers)
4. Tester détection langue et sélection manuelle

---

## 🔧 Technologies utilisées

### Frontend

- **HTML5** - Structure sémantique
- **CSS3** - Variables, Flexbox, Grid
- **JavaScript ES6+** - Modules, Classes, Arrow functions

### APIs natives

- **ES6 Modules** - Import/export
- **IndexedDB API** - Stockage principal des données (V0.10+)
- **BroadcastChannel API** - Synchronisation multi-onglets (V0.10+)
- **Drag & Drop API** - Interactions
- **FileReader API** - Import/Export
- **History API** - URL routing (pushState/replaceState)
- **Clipboard API** - Copie liens de partage

### Bibliothèques externes

- **Dexie.js** - Wrapper IndexedDB (CDN, V0.10+)
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
- **IndexedDB avec indexes** - Requêtes rapides, capacité 500 Mo-1 Go (V0.10+)
- **Async/await** - Opérations de stockage non-bloquantes
- **BroadcastChannel** - Sync multi-onglets efficace

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
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
- [Drag & Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [Dexie.js](https://dexie.org/) - Wrapper IndexedDB

### Documentation interne

- **ARCHITECTURE.md** - Détails techniques complets
- **STORAGE.md** - Système de stockage IndexedDB (V0.10)
- **I18N.md** - Système d'internationalisation
- **CLAUDE.md** - Guide contexte pour Claude (ignoré Git)
- **V0.8-COMPLETE.md** - Récapitulatif de la V0.8

### Projet

- **Repo GitHub** : `https://github.com/parksto/DeepMemo`
- **Version actuelle** : V0.10 (Migration IndexedDB + Sync multi-onglets)
- **Statut** : ✅ Stable et en production
- **Prochaine version** : V1.0 (Types actifs)

---

## 🚀 Prochaines étapes (V1.0+)

Si tu veux contribuer à la V1.0, voici les features prévues :

### Features avancées

- **Types actifs** - Nœuds basés sur templates avec comportements personnalisés
- **Wiki-links refactorés** - Syntaxe `[[id:titre]]` avec auto-complétion
- **Vue liste nested** - Indentation visuelle style todo-list
- **Export Markdown** - Structure préservée
- **Recherche avancée** - Regex, filtres combinés

### Optimisations

- **Virtual scrolling** - Pour grandes arborescences (>500 nœuds)
- **Web Workers** - Recherche asynchrone

Consulte **TODO.md** pour la liste complète et les priorités.

---

**Bonne contribution ! 🚀**

*N'hésite pas à poser des questions ou proposer des améliorations.*

**Dernière mise à jour** : 4 janvier 2026
