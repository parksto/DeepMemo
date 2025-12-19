# 📋 DeepMemo - TODO Personnel

> **Backlog de développement** - Liste des tâches en cours et à venir pour DeepMemo V0.8+

**Dernière mise à jour** : 19 Décembre 2025

---

## ✅ COMPLÉTÉ - 🌳 Arborescence

- ✅ L'arborescence n'est ouverte que sur le nœud en cours ET là où on est en train de naviguer.
- ✅ Lors de chaque affichage d'un nœud dans le center panel, l'arborescence se déplie jusqu'à lui, le sélectionne/focus, le déplie et replie tout le reste via `autoCollapseTree()`.

**Implémentation** :
- Fonction `autoCollapseTree()` qui maintient uniquement le chemin actif déplié
- Auto-scroll pour garder le nœud visible
- Système d'instance keys pour gérer expand/collapse

---

## 🔗 Liens internes (PARTIELLEMENT FAIT)

### ⚠️ À FAIRE

**Audit complet du système** :
- Faire un point sur le système de liens interne à DeepMemo
- Vérifier ce qui est en place et ce qui fonctionne
- S'assurer que tout ce qui est envisagé est implémenté
- Tester les cas limites

**Sélection intelligente** :
- Quand on accède à un nœud via un lien interne `[[titre]]`
- Dans l'arborescence : sélectionner le nœud réel si pas de symlink
- Sinon : sélectionner le symlink OU le nœud réel le plus proche du focus actuel
- Calculer la distance euclidienne pour choisir la meilleure option
- Fallback sur l'original si aucun symlink disponible

**Amélioration navigation** :
- Rendre les liens `[[titre]]` cliquables dans le preview
- Améliorer l'UX de navigation par wiki-links

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

## 🪟 Fenêtre modale

### ⚠️ À FAIRE

**Réorganisation des actions** :
- Déplacer le bouton [Supprimer] dans la fenêtre modale d'[Actions]
- Regrouper toutes les actions destructives au même endroit
- Améliorer la cohérence de l'interface

**Optimisation de l'espace** :
- Le bloc prêt à accueillir l'arborescence peut être masqué
- Ne l'afficher que quand on choisit une action qui le nécessite
- Rendre la modale plus légère par défaut

---

## ⌨️ Raccourcis clavier (PARTIELLEMENT FAIT)

### ✅ Complété

- ✅ Toggle view/edit via bouton [Afficher]/[Éditer] fonctionnel

### ⚠️ À FAIRE

**Raccourci clavier dédié** :
- Ajouter `Alt+V` ou `Ctrl+Shift+E` pour toggle view/edit
- Permettre de basculer sans utiliser la souris
- Améliorer la productivité

**Mise à jour des keyboard tips** :
- Mettre à jour le bloc avec tous les raccourcis actuels
- Inclure les nouveaux raccourcis de navigation
- Déplacer le bloc en bas du right panel
- Améliorer la présentation visuelle

**Raccourcis actuels à documenter** :
- `Alt+N` : Nouveau nœud
- `Alt+E` : Focus éditeur
- `Ctrl+K` : Recherche
- `Escape` : Remonter au parent
- `↑↓←→` : Navigation arbre
- `Enter` : Sélectionner nœud focusé
- (À ajouter) `Alt+V` : Toggle view/edit

---

## 👁️ Affichage divers

### ⚠️ À FAIRE

**Harmonisation Export/Import** :
- Regrouper les boutons [Exporter] et [Importer]
- Harmoniser leurs styles pour cohérence visuelle
- Positionner de manière logique dans l'interface

**Breadcrumb intelligent** :
- Format : `.../[nom du nœud parent]/[nom du nœud actuel]`
- Nœud actuel : taille normale
- Chemin parent : plus petit et légèrement transparent
- Adaptation selon contexte :
  - Nœud racine : pas de chemin parent
  - Nœud de niveau 1 : pas de `.../ `
  - Instances isolées : adapter selon `branchRootId`
- Améliorer la lisibilité de la navigation

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

### V0.8 - Progression globale : ~75% complété

**✅ Complété (6/10 sections principales)** :
1. Arborescence intelligente
2. Liens symboliques refactorés
3. URL dynamique complet
4. Documentation mise à jour
5. Bug critique résolu
6. Mode view par défaut

**⚠️ En attente (4/10 sections)** :
1. Navigation via liens internes (sélection intelligente)
2. Tags (éviter duplication UI)
3. Fenêtres modales (amélioration UX)
4. Raccourcis clavier et affichage divers

---

## 🎯 Priorités suggérées pour la suite

### Haute priorité (Impact UX majeur)
1. **Navigation via liens `[[titre]]` cliquables** - Feature importante pour l'UX quotidienne
2. **Raccourci clavier toggle view/edit** - Productivité
3. **Breadcrumb intelligent** - Améliore la navigation

### Priorité moyenne (Polish UI)
4. **Tags sans duplication** - Nettoyer l'interface
5. **Export/Import harmonisés** - Cohérence visuelle
6. **Keyboard tips à jour** - Documentation utilisateur

### Priorité basse (Nice to have)
7. **Modal Actions optimisée** - Amélioration mineure
8. **Bouton Supprimer dans modal** - Réorganisation

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
