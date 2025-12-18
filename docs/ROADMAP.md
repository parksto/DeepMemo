# 🗺️ DeepMemo - Roadmap

## 📍 État actuel : V0.7 (Décembre 2025)

### ✅ Fonctionnalités implémentées

#### Gestion des nœuds
- [x] Création/édition/suppression de nœuds
- [x] Hiérarchie récursive infinie
- [x] Navigation par breadcrumbs
- [x] Sélection auto du titre lors de la création
- [x] Auto-resize du textarea selon le contenu

#### Arborescence
- [x] Affichage arborescent dans la sidebar
- [x] Expand/collapse des branches
- [x] Persistence de l'état expand/collapse (localStorage)
- [x] Navigation clavier (↑↓←→ + Enter)
- [x] Focus visuel du nœud actuel
- [x] Affichage des enfants en cartes cliquables

#### Liens
- [x] Wiki-links `[[Nom du nœud]]` dans le contenu
- [x] Liens symboliques (un nœud dans plusieurs emplacements)
- [x] Backlinks automatiques
- [x] Suppression des symlinks sans toucher l'original
- [x] Détection des liens cassés

#### Tags
- [x] Système de tags dédié (champ séparé)
- [x] Auto-complétion intelligente (branche + global)
- [x] Tag cloud par branche avec compteur
- [x] Recherche par tag
- [x] Badges visuels (branche vs global)

#### Recherche
- [x] Recherche globale temps réel (Ctrl+K)
- [x] Recherche dans titres, contenus et tags
- [x] Navigation clavier dans les résultats
- [x] Highlights des correspondances
- [x] Ouverture directe du nœud trouvé
- [x] Dépliage automatique du chemin

#### Drag & Drop
- [x] Déplacement de nœuds
- [x] Duplication (Ctrl + drag)
- [x] Liens symboliques (Ctrl+Alt + drag)
- [x] Réorganisation de l'ordre (zones before/after/inside)
- [x] Indicateurs visuels de position
- [x] Support arbre + cartes

#### Interface
- [x] Dark theme
- [x] Sidebar pliable
- [x] Panel droit pliable
- [x] Responsive (base)
- [x] Toasts de notification
- [x] Modales pour actions multiples

#### Raccourcis clavier
- [x] `Alt+N` : Nouveau nœud
- [x] `Alt+E` : Focus éditeur
- [x] `Ctrl+K` : Recherche
- [x] `Escape` : Remonter au parent
- [x] `↑↓←→` : Navigation arbre

#### Persistance
- [x] LocalStorage pour les données
- [x] Export JSON
- [x] Import JSON
- [x] Sauvegarde auto à chaque modification

---

## 🐛 Bugs connus

### Corrigés en V0.7
- [x] **Sélection dans les modales** ✅ : Impossible de sélectionner le nœud destination dans les modales d'action/symlink → **CORRIGÉ** (utilisation de `data-node-id` avec `querySelector`)

### Priorité CRITIQUE
- [ ] **⚠️ Bug perte de données - Symlinks avec noms identiques** : Créer un lien symbolique depuis un nœud vers un autre nœud portant exactement le même nom peut causer la disparition totale du contenu. **WORKAROUND** : Éviter de créer des symlinks entre nœuds de même nom. **ROOT CAUSE** : Possible utilisation de `title` au lieu de `id` pour identifier les nœuds. **FIX PRÉVU** : V0.8 avec refonte complète du système symlinks.

### Priorité haute
- [ ] **Liens symboliques et arborescence** : Quand un lien symbolique a plusieurs niveaux d'enfants dépliés, l'arborescence peut afficher les enfants à plusieurs endroits simultanément (sous l'original ET sous le symlink). En attendant une refonte complète du système de rendu (V0.8), il est recommandé de garder l'arborescence ouverte à un seul endroit à la fois.

### Priorité moyenne
- [ ] Parfois les bordures des boutons ont un effet relief (navigateur par défaut)

### Priorité basse
- [ ] Pas de confirmation avant suppression massive
- [ ] Pas de limite de profondeur d'arborescence

---

## ✅ V0.7 - Restructuration Multifile (TERMINÉE)

### Objectifs atteints

#### 1. Structure du projet ✅
```
DeepMemo/
  ├── index.html          (Structure HTML minimale)
  ├── src/
  │   ├── css/
  │   │   └── style.css   (Tous les styles)
  │   └── js/
  │       └── app.js      (Toute la logique)
  ├── reference/
  │   └── deepmemo-reference.html  (Version single-file)
  ├── docs/
  │   └── (documentation complète)
  └── .gitignore
```

#### 2. Corrections urgentes
- [x] Fix sélection de nœud dans les modales ✅
- [ ] Uniformiser les bordures des boutons
- [ ] Améliorer la gestion des events

#### 3. Infrastructure
- [x] Repo GitHub créé et configuré ✅
- [x] Documentation complète (README + docs) ✅
- [x] Structure professionnelle évolutive ✅

---

## 🚀 V0.8 - Refonte Symlinks & Navigation

**Objectif principal** : Refactorisation complète du système de liens symboliques pour plus de robustesse et de flexibilité.

### 🔗 Refonte des Liens Symboliques (PRIORITÉ #1)

**Concept** : Traiter les symlinks comme des "raccourcis Windows" - des nœuds de type spécial qui pointent vers un nœud cible.

#### Architecture nouvelle
- [ ] **Type de nœud** : Ajouter propriété `type: "node" | "symlink"` à tous les nœuds
- [ ] **Structure symlink** :
  ```javascript
  {
    id: "symlink_xxx",
    type: "symlink",
    title: "Titre custom du raccourci",
    targetId: "node_abc",  // Pointe vers le nœud réel
    parent: "node_xyz",
    children: [],          // Toujours vide
    created: timestamp,
    modified: timestamp
  }
  ```
- [ ] **Migration automatique** : Convertir `symlinkedIn[]` vers vrais nœuds symlink
- [ ] **Fonction `migrateSymlinks()`** : Exécuter au `loadData()` si ancien format détecté
- [ ] **Renommage indépendant** : Le titre du symlink n'affecte pas le nœud cible
- [ ] **Suppression propre** : Supprimer un symlink = supprimer un nœud normal
- [ ] **Détection cycles** : Protection anti-boucle infinie lors de la création
- [ ] **Symlinks cassés** : Affichage grisé + icône ⚠️ si `targetId` invalide

#### Rendu et UI
- [ ] Modifier `render()` pour switch sur `node.type`
- [ ] Afficher icône 🔗 pour les symlinks
- [ ] Au clic : ouvrir le contenu du `targetId`, pas du symlink
- [ ] Badge visuel distinct des nœuds normaux
- [ ] Supprimer code complexe `isSymlinkIn()`, `symlinksInThisNode`, etc.

#### Avantages
- ✅ Symlinks = enfants normaux dans `children[]`
- ✅ Tri et ordre naturels
- ✅ Métadonnées propres à chaque symlink
- ✅ Code beaucoup plus simple
- ✅ Pas de cycles possibles (symlinks n'ont pas d'enfants)

### 🌳 Arborescence Intelligente

- [ ] **Auto-collapse global** : Replier tout sauf le chemin actif
- [ ] **Déplier jusqu'au nœud actuel** : `expandPathToNode()` amélioré
- [ ] **Focus synchronisé** : Arborescence suit la navigation
- [ ] **Navigation clavier fluide** : Sans "téléportation" du focus

### 🔗 Navigation via Liens Internes

- [ ] **Sélection intelligente** : Choisir nœud original OU symlink le plus proche
- [ ] **Distance euclidienne** : Calculer le symlink le plus proche du focus actuel
- [ ] **Fallback sur original** : Si pas de symlink, ouvrir le nœud réel

### 🔗 Système d'URL Dynamique

- [ ] **Hash routing** : `#node=abc123` pour pointer vers un nœud
- [ ] **Persistence refresh** : Rester sur le nœud actif après F5
- [ ] **Bookmarkabilité** : URLs partageables
- [ ] **Scope isolation** : `#scope=projects&node=abc123`
- [ ] **Symlinks hors scope** : Grisés + désactivés
- [ ] **Mode read-only** : Pour nœuds accessibles mais non modifiables

### ⌨️ Raccourcis & UX

- [ ] **Toggle view/edit** : `Alt+V` ou `Ctrl+Shift+E`
- [ ] **Keyboard tips** : Mise à jour + déplacement en bas du right panel
- [ ] **Modal Actions** : Déplacer bouton Supprimer dedans
- [ ] **Masquage conditionnel** : Cacher arborescence modale si pas nécessaire

### 👁️ Améliorations UI

- [ ] **Breadcrumb intelligent** : `.../parent/noeud_actuel` avec niveaux de taille
- [ ] **Tags right panel** : Ne pas dupliquer avec center panel
- [ ] **Import/Export** : Regrouper + harmoniser styles
- [ ] **Titre contextuel** : Adapter selon profondeur (racine, niveau 1, niveau N)

### 📄 Documentation & Tests

- [ ] **Audit .md files** : Cohérence et mise à jour
- [ ] **JSDoc complet** : Documenter toutes les fonctions
- [ ] **Guide migration** : Expliquer passage V0.7 → V0.8
- [ ] **Tests manuels** : Checklist validation des symlinks

### 🐛 Bugs Critiques à Corriger

- [ ] **Bug noms identiques** : Investigation + fix (utiliser IDs partout)
- [ ] **Références circulaires** : Protection lors création symlinks
- [ ] **Perte de données** : Audit complet avant release

---

## 🌟 V0.9 - Features Avancées

### Vue liste nested
- [ ] Les enfants deviennent le contenu principal
- [ ] Indentation visuelle
- [ ] Todo-list style
- [ ] Checkboxes pour les tâches

### Améliorations des tags
- [ ] Création rapide de tags par #hashtag dans le contenu
- [ ] Renommage de tags globalement
- [ ] Fusion de tags
- [ ] Couleurs personnalisées par tag

### Export/Import amélioré
- [ ] Export en Markdown (avec structure)
- [ ] Import depuis Notion
- [ ] Import depuis Obsidian
- [ ] Export PDF

### Recherche avancée
- [ ] Filtres combinés (tags + date + type)
- [ ] Recherche par regex
- [ ] Sauvegarde de recherches
- [ ] Historique de recherche

---

## 🌟 V1.0 - Système complet

### Types de nœuds actifs
- [ ] Nœuds avec scripts personnalisés
- [ ] Calculs automatiques (budget, stats)
- [ ] Génération automatique (listes de courses depuis recettes)
- [ ] Actions customisées par type

### Multi-utilisateur
- [ ] Permissions chmod-style (rwx par utilisateur/groupe)
- [ ] Partage de branches
- [ ] Collaboration temps réel
- [ ] Historique des modifications

### Interface vocale
- [ ] Commandes vocales (créer, rechercher, naviguer)
- [ ] Dictée de contenu
- [ ] Lecture à voix haute

### Architecture distribuée
- [ ] Backend optionnel (Node.js + PostgreSQL)
- [ ] Synchronisation multi-devices
- [ ] Mode offline-first
- [ ] Fédération entre instances

---

## 💡 Backlog (idées futures)

### Interface
- [ ] Thèmes personnalisables
- [ ] Mode clair
- [ ] Vue graphe (network visualization)
- [ ] Vue calendrier
- [ ] Vue kanban
- [ ] Mode zen (focus)

### Productivité
- [ ] Templates de nœuds
- [ ] Snippets réutilisables
- [ ] Macros/Shortcuts personnalisés
- [ ] Intégrations (Google Calendar, Trello, etc.)

### Avancé
- [ ] Versioning (git-like)
- [ ] Branches de travail
- [ ] Merge de nœuds
- [ ] Encryption des données sensibles
- [ ] API REST pour extensions
- [ ] Plugin system

---

## 📊 Métriques de progression

### Code
- **Lignes de code** : ~3600 (V0.6 single-file)
- **Fonctions** : ~50
- **Événements** : ~30
- **Raccourcis clavier** : 7

### Données
- **Types de base** : 1 (Nœud)
- **Propriétés par nœud** : 10
- **Relations** : parent, children, links, backlinks, symlinks

### Tests utilisateur
- [x] Fabien utilise activement (création de contenu)
- [ ] Bêta-testeurs externes
- [ ] Feedback structuré

---

## 🎓 Leçons apprises

### Ce qui fonctionne bien
- ✅ Concept des nœuds récursifs : simple et puissant
- ✅ Liens symboliques : très utiles en pratique
- ✅ Tags avec auto-complétion : excellent UX
- ✅ Drag & drop : intuitif et rapide
- ✅ Single-file au début : pratique pour prototyper

### Ce qui a été amélioré en V0.7
- ✅ Single-file → Multifile : beaucoup plus maintenable
- ✅ Structure de projet professionnelle
- ✅ UX des modales corrigée

### Ce qui doit encore être amélioré
- ⚠️ Pas de tests automatisés
- ⚠️ Performance avec beaucoup de nœuds (>1000) à tester
- ⚠️ Qualité de code (JSDoc, séparation des responsabilités)

### Décisions techniques validées
- ✅ Vanilla JS : pas de overhead, contrôle total
- ✅ LocalStorage : assez pour MVP, migration backend prévue
- ✅ Dark theme par défaut : préférence utilisateur
- ✅ Keyboard-first : efficacité maximale

---

**Dernière mise à jour** : 15 Décembre 2025
**Version actuelle** : V0.7
**Prochaine milestone** : V0.8 (Features avancées)
