# 📋 DeepMemo - TODO Personnel

> **Backlog de développement** - Liste des tâches en cours et à venir pour DeepMemo V0.8+

**Dernière mise à jour** : 24 Décembre 2025

---

## ✅ COMPLÉTÉ - 📘 Contenu de démo par défaut (24 déc 2025)

- ✅ Création de `src/js/core/default-data.js` avec 26 nœuds pédagogiques
- ✅ Modification de `loadData()` pour charger le contenu si localStorage vide
- ✅ Structure progressive : Bienvenue → Interface → Features → Future → Premiers pas
- ✅ Format pédagogique : [Fonctionnalité → Ce que ça permet → Exemple]
- ✅ Concepts futurs clarifiés (types = nœuds, triggers multi-nœuds, API externe)

**Implémentation** :
- Module `default-data.js` avec fonction `getDefaultData()`
- Chargement automatique au premier lancement
- Sauvegarde dans localStorage pour persistence

---

## ✅ COMPLÉTÉ - 🎨 UX Polish (24 déc 2025)

### 1. Reset du scroll à la navigation
- ✅ Ajout de `scrollTo(0, 0)` dans `displayNode()`
- ✅ Scroll revient en haut à chaque nœud affiché

### 2. Mode affichage par défaut
- ✅ `viewMode = 'view'` au lieu de `'edit'`
- ✅ Démarrage en mode lecture

### 3. Right panel masqué par défaut
- ✅ `rightPanelVisible = false` dans `panels.js`
- ✅ Interface épurée, ouverture via [i]

### 4. Toggle pour choisir la police
- ✅ Classe CSS `.system-font` pour override
- ✅ Section "Préférences" dans right panel
- ✅ Fonctions `initFontPreference()` et `toggleFontPreference()`
- ✅ Sauvegarde dans localStorage (`deepmemo_fontPreference`)
- ✅ Support Sto (défaut) et polices système (optionnel)

**Fichiers modifiés** :
- `src/js/features/editor.js` - Reset scroll + toggle police
- `src/js/ui/panels.js` - Right panel masqué
- `src/js/app.js` - Gestion préférence police
- `src/css/base.css` - Classe `.system-font`

---

## ✅ COMPLÉTÉ - 🌳 Arborescence

- ✅ L'arborescence n'est ouverte que sur le nœud en cours ET là où on est en train de naviguer.
- ✅ Lors de chaque affichage d'un nœud dans le center panel, l'arborescence se déplie jusqu'à lui, le sélectionne/focus, le déplie et replie tout le reste via `autoCollapseTree()`.

**Implémentation** :
- Fonction `autoCollapseTree()` qui maintient uniquement le chemin actif déplié
- Auto-scroll pour garder le nœud visible
- Système d'instance keys pour gérer expand/collapse

---

## 🔗 Liens internes (REPOUSSÉ)

### ⚠️ DÉSACTIVÉ - À REFAIRE PLUS TARD

**Raison** :
- Les wiki-links `[[titre]]` posent problème car le matching par titre est fragile
- Problèmes : doublons de titres, renommages, ambiguïté
- Nécessite une refonte complète pour pointer vers ID au lieu de titre
- Code supprimé temporairement (editor.js + components.css)

**Solution future envisagée** :
- Syntaxe `[[id:titre]]` ou `[[titre#id]]`
- Auto-complétion intelligente à la saisie
- Sélection du bon nœud parmi les doublons
- Mise à jour automatique du titre affiché si le nœud cible est renommé

**Sélection intelligente (pour plus tard)** :
- Quand on accède à un nœud via un lien interne
- Dans l'arborescence : sélectionner le nœud réel si pas de symlink
- Sinon : sélectionner le symlink OU le nœud réel le plus proche du focus actuel
- Calculer la distance euclidienne pour choisir la meilleure option
- Fallback sur l'original si aucun symlink disponible

---

## ✅ COMPLÉTÉ - 🔗 Liens symboliques

- ✅ Il est possible de renommer les liens symboliques sans affecter le nœud qu'ils référencent
- ✅ Titre du symlink stocké séparément dans `node.title`
- ✅ Contenu affiché depuis `targetId` via pattern `displayNode`
- ✅ Sauvegarde correcte : titre sur symlink, contenu sur target

**Implémentation** :
- Type `symlink` dédié avec propriété `targetId`
- Pattern `displayNode` pour récupérer le contenu du nœud cible
- Fonction `saveCurrentNode()` adaptée pour gérer les deux cas

---

## ✅ COMPLÉTÉ - 🔗 URL dynamique

- ✅ Système d'URL dynamique complet et fonctionnel
- ✅ Persistence du nœud actif après refresh (`#/node/nodeId`)
- ✅ Bookmarks possibles sur n'importe quel nœud
- ✅ Instances isolées sur une branche (`?branch=nodeId`)
- ✅ Symlinks externes grisés et non-cliquables (icône 🔗🚫)
- ✅ Mode view par défaut avec `?view=edit` optionnel
- ✅ Partage de nœud (🔗) et partage de branche (🌳)
- ✅ Support navigation navigateur (back/forward)
- ✅ Auto-expansion de la branche lors de l'ouverture

**Implémentation** :
- Fonctions `parseURL()`, `updateURL()`, `setupURLListener()`
- Mode branche avec `enableBranchMode()` et `isNodeInBranch()`
- Icônes de partage avec `updateShareLink()` et `shareBranch()`
- Détection des symlinks externes en mode branche

---

## 🏷️ Tags

### ⚠️ À FAIRE

**Éviter duplication UI** :
- Les tags du nœud actuel sont affichés en haut du center panel
- Ils n'ont pas besoin d'être répétés dans le right panel
- Nettoyer l'affichage pour éviter la redondance

**Options** :
1. Masquer les tags du nœud actuel dans le right panel
2. Afficher seulement les tags des autres nœuds (tag cloud global)
3. Distinguer visuellement "tags du nœud" vs "tags de la branche"

---

## ✅ COMPLÉTÉ - 🪟 Fenêtre modale

- ✅ Bouton [Supprimer] ajouté dans la fenêtre modale d'[Actions]
- ✅ Bouton [Supprimer] retiré du center-panel (duplication supprimée)
- ✅ Arborescence du modal masquée par défaut
- ✅ Affichage de l'arborescence seulement quand une action est sélectionnée
- ✅ Texte "Sélectionne une action ci-dessus" supprimé
- ✅ Triangles de toggle harmonisés avec l'arbre principal

**Implémentation** :
- Fonction `deleteNode()` dans modals.js
- Gestion différenciée symlinks vs nœuds normaux
- CSS harmonisé pour `.node-selector-toggle`
- Affichage conditionnel de `.node-selector` via CSS

---

## ✅ COMPLÉTÉ - ⌨️ Raccourcis clavier

- ✅ Toggle view/edit via bouton [Afficher]/[Éditer] fonctionnel
- ✅ Raccourci clavier `Alt+E` pour toggle view/edit implémenté
- ✅ Documentation des raccourcis clavier ajoutée dans le panneau droit
- ✅ Bloc keyboard tips positionné en bas du right panel (dans zone défilante)
- ✅ Présentation améliorée avec sections et titre

**Raccourcis documentés** :
- `Alt+N` : Nouveau nœud
- `Alt+E` : Focus éditeur
- `Ctrl+K` : Recherche
- `Alt+E` : Toggle view/edit
- `↑↓` : Naviguer arbre (haut/bas)
- `→` : Déplier nœud
- `←` : Replier nœud / Remonter au parent si déjà replié
- `Enter` : Activer nœud sélectionné
- `Escape` : Remonter au parent

**Implémentation** :
- Raccourcis dans `keyboard.js`
- Documentation générée dynamiquement dans `editor.js` (updateRightPanel)
- CSS dans `components.css` (.shortcuts-hint, .shortcuts-title, .shortcuts-section)

---

## 👁️ Affichage divers

### ✅ COMPLÉTÉ

**Harmonisation Export/Import** :
- ✅ Boutons [Exporter] et [Importer] regroupés dans la sidebar
- ✅ Styles harmonisés (classe `.btn-import` commune)
- ✅ Zone dédiée `.import-export-zone` avec flexbox
- ✅ Label raccourci de "Importer JSON" à "Importer"

### ✅ COMPLÉTÉ

**Breadcrumb intelligent** :
- ✅ Format : `.../[nom du nœud parent]/[nom du nœud actuel]`
- ✅ Nœud actuel : taille normale
- ✅ Chemin parent : plus petit et légèrement transparent
- ✅ Adaptation selon contexte :
  - Nœud racine : pas de chemin parent
  - Nœud de niveau 1 : pas de `.../ `
  - Instances isolées : adapté selon `branchRootId`
- ✅ Amélioration de la lisibilité de la navigation

**Implémentation** :
- Fonction `updateBreadcrumb()` dans editor.js
- Calcul du chemin complet avec getNodePath()
- Gestion spéciale pour racines et mode branche
- Styles CSS différenciés pour ancêtres (.breadcrumb-ancestor)

---

## ✅ RÉSOLU - 📄 Docs

- ✅ Bilan complet des fichiers .md effectué
- ✅ ROADMAP.md, ARCHITECTURE.md, README.md mis à jour
- ✅ Documentation V0.8 complète (URL dynamiques, symlinks, auto-collapse)
- ✅ Dates mises à jour (19 Décembre 2025)
- ✅ VISION.md et Guide de développement.md vérifiés

**Fichiers à jour** :
- `docs/ROADMAP.md` - État V0.8, bugs résolus
- `docs/ARCHITECTURE.md` - Section URL Dynamiques complète
- `docs/README.md` - Features V0.8 ajoutées
- `docs/TODO.md` - Ce fichier (nouveau)

---

## ✅ RÉSOLU - 🪲 Bug : Perte de données avec symlinks de noms identiques

**Symptôme initial** :
- Créer un lien symbolique depuis un nœud vers un autre de même nom
- Résultat : disparition totale du contenu

**Root cause identifiée** :
- Utilisation de `title` au lieu de `id` pour identifier les nœuds
- Confusion quand deux nœuds portent le même nom

**Solution implémentée (V0.8)** :
- ✅ Refonte complète du système symlinks
- ✅ Chaque symlink a son propre `id` unique
- ✅ Propriété `targetId` pour pointer vers le nœud cible
- ✅ Utilisation exclusive des IDs pour toutes les références
- ✅ Détection de cycles avec `wouldCreateCycleWithMove()`
- ✅ Prévention des boucles infinies
- ✅ Système d'instance keys pour gérer affichages multiples

**Bonus** :
- ✅ Symlinks avec titres indépendants
- ✅ Détection des symlinks cassés
- ✅ Icône 🔄 pour références circulaires
- ✅ Icône 🔗🚫 pour symlinks externes (mode branche)

---

## 📊 Résumé de l'avancement

### V0.8 - Progression globale : ✅ 100% COMPLÉTÉ

**✅ Complété (11/11 sections principales)** :
1. Arborescence intelligente (avec focus visuel symlinks)
2. Liens symboliques refactorés
3. URL dynamique complet
4. Documentation mise à jour
5. Bug critique résolu
6. Mode view par défaut
7. **Fenêtre modale améliorée** (Actions + Delete + arborescence masquable)
8. **Raccourcis clavier complets** (Alt+E + documentation)
9. **UI polish** (Export/Import harmonisés, keyboard tips, toggles)
10. **Breadcrumb intelligent** (Format `.../parent/actuel` avec styles adaptés)
11. **Drag & drop complet** (arbre + enfants, modificateurs clavier, prévention cycles)

**🔧 Bugs corrigés** :
- ✅ Renommage symlinks (sauvegarde titre sur symlink, pas target)
- ✅ Suffixe " (lien)" supprimé à la création
- ✅ Focus visuel après navigation via symlinks

**⚠️ Priorité basse (polish)** :
- Tags (éviter duplication UI dans right panel)

**🔮 Repoussé pour V0.9+** :
- Navigation via liens internes `[[titre]]` - Nécessite refonte complète (pointer vers ID)

---

## 🎯 Priorités suggérées pour la suite

### ✅ Migration finale V0.8 - COMPLÉTÉE
1. ✅ **Basculement index.html** - `app.js` chargé en production
2. ✅ **Renommage legacy** - `app.js` → `app-backup.js` (référence)
3. ✅ **Drag & drop simplifié** - Modificateur Shift supprimé
4. ✅ **Tests fonctionnels** - Toutes fonctionnalités validées

### 🎉 V0.8 - 100% DÉPLOYÉE

**Prochaine étape : V0.9 (Features Avancées)**

### Priorité basse (Polish UI)
- **Tags sans duplication** - Nettoyer l'interface right panel

### Futur (V0.9+)
- **Wiki-links refactorés** - Syntaxe `[[id:titre]]` avec auto-complétion
- **Vue liste nested** - Indentation visuelle style todo-list
- **Export Markdown** - Export avec structure préservée

---

## 💭 Notes de développement

### Patterns techniques établis
- **Instance keys** : `nodeId@parent@grandparent@root` pour identification unique
- **displayNode pattern** : `const displayNode = node.type === 'symlink' ? this.data.nodes[node.targetId] : node`
- **URL structure** : `?branch=xxx#/node/yyy?view=edit`
- **isInitializing flag** : Éviter écrasement d'URL pendant init

### Leçons apprises
- Toujours utiliser les IDs, jamais les titres pour les références
- Penser aux cycles lors de la création de liens
- Tester les cas limites (noms identiques, références circulaires)
- Documenter au fur et à mesure du développement

---

- **Maintenu par** : Fabien
- **Outil** : DeepMemo + Claude Code + Sublime Text + Git
- **Prochaine revue** : Après implémentation des liens internes cliquables (?)
