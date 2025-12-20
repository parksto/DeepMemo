# 🗺️ DeepMemo - Roadmap

## 📍 État actuel : V0.8 (Décembre 2025)

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
- [x] Liens symboliques (un nœud dans plusieurs emplacements)
- [x] Backlinks automatiques
- [x] Suppression des symlinks sans toucher l'original
- [x] Détection des liens cassés
- [ ] Wiki-links `[[Nom du nœud]]` cliquables (REPOUSSÉ V0.9+)

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
- [x] `Alt+V` : Toggle view/edit
- [x] `Ctrl+K` : Recherche
- [x] `Escape` : Remonter au parent
- [x] `↑↓←→` : Navigation arbre
- [x] `Enter` : Activer nœud
- [x] Documentation complète dans panneau droit

#### Persistance
- [x] LocalStorage pour les données
- [x] Export JSON
- [x] Import JSON
- [x] Sauvegarde auto à chaque modification

#### Rendu et Affichage (V0.7+)
- [x] Markdown rendering avec mode view/edit toggle
- [x] Mode view par défaut (lecture)
- [x] Sidebar redimensionnable
- [x] Scroll horizontal si contenu large
- [x] Favicon personnalisé

#### URL Dynamiques et Navigation (V0.8)
- [x] Système d'URL dynamique avec hash routing
- [x] URLs bookmarkables `#/node/nodeId`
- [x] Persistence après refresh
- [x] Mode branche isolée `?branch=nodeId`
- [x] Symlinks externes grisés en mode branche
- [x] Partage de nœud (icône 🔗)
- [x] Partage de branche isolée (icône 🌳)
- [x] Support navigation navigateur (back/forward)
- [x] Auto-collapse arborescence (chemin actif uniquement)

#### Liens Symboliques Refactorés (V0.8)
- [x] Type de nœud `symlink` dédié
- [x] Titres indépendants pour symlinks
- [x] Détection de cycles (références circulaires)
- [x] Prévention des boucles infinies
- [x] Icône 🔄 pour symlinks circulaires
- [x] Icône 🔗🚫 pour symlinks externes (hors branche)

---

## 🐛 Bugs connus

### Corrigés en V0.7
- [x] **Sélection dans les modales** ✅ : Impossible de sélectionner le nœud destination dans les modales d'action/symlink → **CORRIGÉ** (utilisation de `data-node-id` avec `querySelector`)

### Corrigés en V0.8
- [x] **Bug perte de données - Symlinks avec noms identiques** ✅ : **RÉSOLU** avec la refonte complète du système symlinks. Les symlinks sont maintenant des nœuds de type spécial avec leur propre `id`, ce qui élimine toute confusion basée sur les titres.
- [x] **Références circulaires** ✅ : **RÉSOLU** avec détection automatique des cycles. Les symlinks qui créeraient une boucle infinie sont détectés et affichés avec l'icône 🔄 sans afficher leurs enfants.
- [x] **Affichage multiple de symlinks** ✅ : **RÉSOLU** avec le système d'instance keys (`nodeId@parent@grandparent@root`) qui permet de distinguer chaque instance d'un nœud dans l'arbre.

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

## 🚀 V0.8 - Refonte Symlinks & Navigation (EN COURS)

**Objectif principal** : Refactorisation complète du système de liens symboliques pour plus de robustesse et de flexibilité + système d'URL dynamiques.

### 🔗 Refonte des Liens Symboliques ✅ COMPLÉTÉ

**Concept** : Traiter les symlinks comme des "raccourcis Windows" - des nœuds de type spécial qui pointent vers un nœud cible.

#### Architecture nouvelle
- [x] **Type de nœud** : Ajouté propriété `type: "node" | "symlink"` à tous les nœuds
- [x] **Structure symlink** :
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
- [x] **Renommage indépendant** : Le titre du symlink n'affecte pas le nœud cible
- [x] **Suppression propre** : Supprimer un symlink = supprimer un nœud normal
- [x] **Détection cycles** : Protection anti-boucle infinie lors de la création via `wouldCreateCycleWithMove()`
- [x] **Symlinks cassés** : Affichage avec message d'erreur et contenu désactivé

#### Rendu et UI
- [x] Modifier `render()` pour switch sur `node.type` avec pattern `displayNode`
- [x] Afficher icône 🔗 pour les symlinks
- [x] Au clic : ouvrir le contenu du `targetId`, pas du symlink
- [x] Badge visuel distinct des nœuds normaux
- [x] Code simplifié avec système d'instance keys

#### Avantages obtenus
- ✅ Symlinks = enfants normaux dans `children[]`
- ✅ Tri et ordre naturels
- ✅ Métadonnées propres à chaque symlink
- ✅ Code beaucoup plus simple
- ✅ Prévention des cycles avec détection

### 🌳 Arborescence Intelligente ✅ COMPLÉTÉ

- [x] **Auto-collapse global** : `autoCollapseTree()` replie tout sauf le chemin actif
- [x] **Déplier jusqu'au nœud actuel** : `expandPathToNode()` fonctionnel
- [x] **Focus synchronisé** : Arborescence suit la navigation
- [x] **Navigation clavier fluide** : Implémentée avec système d'instance keys
- [x] **Navigation ArrowLeft** : Remonte au parent si nœud replié/sans enfants

### 🔗 Navigation via Liens Internes (REPOUSSÉ V0.9+)

**Note** : Fonctionnalité désactivée temporairement car le matching par titre est fragile (doublons, renommages). Nécessite refonte avec syntaxe `[[id:titre]]` ou auto-complétion intelligente.

- [ ] **Wiki-links refactorés** : Syntaxe pointant vers ID au lieu de titre
- [ ] **Auto-complétion** : Sélection intelligente à la saisie
- [ ] **Sélection intelligente** : Choisir nœud original OU symlink le plus proche
- [ ] **Distance euclidienne** : Calculer le symlink le plus proche du focus actuel
- [ ] **Fallback sur original** : Si pas de symlink, ouvrir le nœud réel

### 🔗 Système d'URL Dynamique ✅ COMPLÉTÉ

- [x] **Hash routing** : `#/node/abc123` pour pointer vers un nœud
- [x] **Persistence refresh** : Rester sur le nœud actif après F5
- [x] **Bookmarkabilité** : URLs partageables
- [x] **Branch isolation** : `?branch=nodeId` pour instances isolées
- [x] **Symlinks hors branche** : Grisés + désactivés avec icône 🔗🚫
- [x] **Mode view par défaut** : Affichage lecture avec `?view=edit` optionnel
- [x] **Partage nœud** : Icône 🔗 pour copier URL du nœud
- [x] **Partage branche** : Icône 🌳 pour copier URL de branche isolée
- [x] **Support navigation** : Boutons précédent/suivant du navigateur
- [x] **Auto-expansion branche** : Branche dépliée automatiquement à l'ouverture

### ⌨️ Raccourcis & UX ✅ COMPLÉTÉ

- [x] **Toggle view/edit** : Bouton [Afficher]/[Éditer] fonctionnel
- [x] **Raccourci Alt+V** : Toggle view/edit au clavier
- [x] **Keyboard tips** : Documentation complète en bas du right panel
- [x] **Modal Actions** : Bouton Supprimer déplacé dans modal
- [x] **Masquage conditionnel** : Arborescence modale masquée par défaut
- [x] **Triangles harmonisés** : Toggles du modal identiques à l'arbre principal

### 👁️ Améliorations UI ✅ COMPLÉTÉ

- [x] **Breadcrumb intelligent** : `.../parent/noeud_actuel` avec niveaux de taille
- [x] **Import/Export** : Regroupés dans sidebar + styles harmonisés
- [ ] **Tags right panel** : Ne pas dupliquer avec center panel (priorité basse)

### 📄 Documentation & Tests ✅ COMPLÉTÉ

- [x] **Audit .md files** : CLAUDE.md, TODO.md, ROADMAP.md mis à jour (20 déc 2025)
- [x] **Documentation V0.8** : Complète et à jour
- [ ] **JSDoc complet** : Documenter toutes les fonctions (priorité basse)
- [ ] **Tests manuels** : Checklist validation des symlinks (priorité basse)

### 🐛 Bugs Critiques ✅ CORRIGÉS

- [x] **Bug noms identiques** : RÉSOLU - Utilisation exclusive des IDs
- [x] **Références circulaires** : RÉSOLU - Détection automatique avec icône 🔄
- [x] **Perte de données** : RÉSOLU - Système symlinks refactoré

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

**Dernière mise à jour** : 20 Décembre 2025
**Version actuelle** : V0.8 (✅ 100% COMPLÉTÉ + DÉPLOYÉ)
**Prochaine milestone** : V0.9 (Features avancées)

---

## 🎉 V0.8 - MIGRATION FINALE COMPLÉTÉE

### ✅ Déploiement final (20 décembre 2025)
- [x] **index.html** : Bascule vers `app-new.js` (type="module")
- [x] **app.js → app-backup.js** : Legacy code conservé pour référence
- [x] **Drag & drop simplifié** : Modificateur Shift supprimé (Ctrl + Ctrl+Alt uniquement)
- [x] **Tests validation** : Toutes fonctionnalités opérationnelles en production
- [x] **Documentation finale** : CLAUDE.md, TODO.md, ROADMAP.md à jour
