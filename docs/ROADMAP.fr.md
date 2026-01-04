# 🗺️ DeepMemo - Roadmap

> 🌍 **Versions linguistiques** : [English](ROADMAP.md) | [Français](ROADMAP.fr.md)

## 📍 État actuel : V0.10.0 (Janvier 2026)

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
- [ ] Wiki-links `[[Nom du nœud]]` cliquables (REPOUSSÉ V1.0+)

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
- [x] `Alt+E` : Toggle view/edit
- [x] `Ctrl+K` : Recherche
- [x] `Escape` : Remonter au parent
- [x] `↑↓←→` : Navigation arbre
- [x] `Enter` : Activer nœud
- [x] Documentation complète dans panneau droit

#### Persistance
- [x] LocalStorage pour les données
- [x] Export JSON global
- [x] Import JSON global
- [x] Export de branche (nœud + descendants)
- [x] Import de branche (non-destructif, avec régénération IDs)
- [x] Sauvegarde auto à chaque modification

#### Rendu et Affichage (V0.7+)
- [x] Markdown rendering avec mode view/edit toggle
- [x] Mode view par défaut (lecture)
- [x] Sidebar redimensionnable
- [x] Scroll horizontal si contenu large
- [x] Favicon personnalisé
- [x] Reset du scroll à la navigation (V0.8)
- [x] Right panel masqué par défaut (V0.8)
- [x] Toggle choix de police (Sto vs système) (V0.8)

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

#### Contenu de Démonstration (V0.8)
- [x] Tutoriel interactif au premier lancement (26 nœuds pédagogiques)
- [x] Structure progressive : Bienvenue → Interface → Features → Future → Premiers pas
- [x] Format pédagogique : [Fonctionnalité → Ce que ça permet → Exemple]
- [x] Fonctionnalités V0.8 documentées avec exemples concrets
- [x] Concepts futurs clarifiés (types = nœuds, triggers multi-nœuds, API externe)
- [x] Chargement automatique si localStorage vide
- [x] Instructions pour supprimer le contenu de démo incluses

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

## 🚀 V0.8 - Refonte Symlinks & Navigation (✅ TERMINÉE)

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

### 🔗 Navigation via Liens Internes (REPOUSSÉ V1.0+)

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
- [x] **Raccourci Alt+E** : Toggle view/edit au clavier
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

## 🌍 V0.9 - Internationalisation (i18n) - ✅ 100% COMPLÉTÉ

**Contexte stratégique** : DeepMemo est déployé en production sur deepmemo.org et déjà fonctionnel. La priorité est de le rendre accessible à une audience internationale avant d'implémenter des fonctionnalités avancées.

### Système i18n (Fondations) ✅ COMPLÉTÉ
- [x] Module `i18n.js` lightweight (pas de dépendance externe) - ~240 lignes
- [x] Support FR/EN minimum (ES optionnel)
- [x] Dictionnaires de traduction structurés par module - fr.js et en.js (~270 lignes chacun)
- [x] Fonction `t(key)` pour traduction dynamique avec interpolation
- [x] Détection automatique de la langue du navigateur
- [x] Sélecteur manuel de langue dans l'interface (Right panel → Préférences)
- [x] Persistence dans `localStorage.deepmemo_language`
- [x] Précache des dictionnaires dans Service Worker (PWA offline)

### Traduction de l'interface ✅ COMPLÉTÉ
- [x] Labels HTML statiques (`index.html`) - Migration avec data-i18n-*
- [x] Labels dynamiques générés en JavaScript - Migration complète avec t()
- [x] Boutons et actions (modales, toasts, confirmations)
- [x] Placeholders des champs de formulaire
- [x] Attributs `title` et `aria-label` (accessibilité)
- [x] Messages d'erreur et avertissements
- [x] Documentation intégrée (raccourcis clavier, tooltips)
- [x] **Corrections finales** : 15 strings oubliées identifiées et corrigées (28 déc 2025)

### Contenu de démo multilingue ✅ COMPLÉTÉ
- [x] `default-data.js` adapté selon langue détectée
- [x] Version FR (existante) - 26 nœuds pédagogiques
- [x] Version EN (traduction complète des 26 nœuds)
- [x] Manifests PWA multilingues (manifest-fr.json, manifest-en.json)

### Tests et validation ✅ COMPLÉTÉ
- [x] Tests sur navigateurs multilingues (FR, EN)
- [x] Vérification du fallback (langue non supportée → EN par défaut)
- [x] Tests de persistance (changement langue → refresh)
- [x] Documentation utilisateur (sélecteur de langue dans préférences)
- [x] Vérification PWA offline avec dictionnaires précachés

### Améliorations optionnelles (Backlog - après V0.9)
- [ ] Création rapide de tags par #hashtag dans le contenu
- [ ] Renommage de tags globalement
- [ ] Fusion de tags
- [ ] Export en Markdown (avec structure préservée)
- [ ] Import depuis Notion/Obsidian

---

## 🐛 V0.9.1 - Corrections de bugs & Qualité (31 décembre 2025) - ✅ COMPLÉTÉ

**Contexte** : Corrections post-lancement suite à l'annonce publique (449 sessions uniques sur Reddit)

### Corrections de bugs critiques ✅
- [x] **Symlinks** : Créer un enfant depuis un symlink l'ajoute maintenant à la cible (pas au symlink)
- [x] **Titres symlinks** : Affichage du titre propre du symlink dans le panneau central (pas celui de la cible)
- [x] **Indicateur visuel** : Les métadonnées montrent un lien cliquable vers le nœud original
- [x] **Sauvegarde auto navigation** : Esc, Alt+E, toute navigation sauvegarde avant de changer
- [x] **Corrections i18n** : Contenu vide affichait `[labels.emptyContent]` → maintenant traduit
- [x] **Modales mode branche** : Arbre des modales d'actions affiche maintenant seulement la branche (pas global)

### Nouvelles fonctionnalités ✅
- [x] **Nettoyage orphelins** : Fonction `cleanOrphanNodes()` avec bouton UI
- [x] **Sync multi-onglets** : Synchronisation temps réel entre onglets navigateur
- [x] **Avertissement mobile** : Banner dismissible pour utilisateurs mobiles
- [x] **Service Worker** : Version mise à jour v1.4.0

---

## 📘 V0.9.2 - Modal aide Markdown (31 décembre 2025) - ✅ COMPLÉTÉ

**Contexte** : Amélioration UX - rendre Markdown plus accessible

### Modal aide Markdown ✅
- [x] **Raccourci Alt+H** : Ouvre cheatsheet Markdown complet
- [x] **9 sections** : Titres, formatage, listes, liens, images, code, citations, tableaux, séparateurs
- [x] **Responsive** : Support scroll, fonctionne hors ligne
- [x] **100% i18n** : Traductions FR/EN

### Corrections de bugs ✅
- [x] **Erreurs i18n** : Corrigé erreur `result.replace is not a function`
- [x] **Clés dupliquées** : Suppression des sections `meta:` dupliquées dans les dictionnaires
- [x] **Console propre** : Tous les avertissements i18n éliminés

### Mise à jour contenu démo ✅
- [x] Ajout section "Markdown : optionnel et accessible" dans la démo
- [x] Service Worker mis à jour v1.5.1

---

## 🗺️ V0.9.3 - Export Mindmap (1er janvier 2026) - ✅ COMPLÉTÉ

**Contexte** : Permettre l'export visuel et le partage de la structure de connaissances

### Modal d'export ✅
- [x] **3 formats d'export** : Archive ZIP, FreeMind .mm, Mermaid SVG
- [x] **Choix modal** : Remplace les boutons d'export directs
- [x] **Fonctionne pour les deux** : Exports globaux et branches

### Export FreeMind .mm ✅
- [x] **XML valide** : Format FreeMind version 1.0.1
- [x] **Support symlinks** : Couleur orange, style bulle, arrowlinks vers cibles
- [x] **Échappement correct** : Guillemets et caractères spéciaux
- [x] **Compatible** : Freeplane, FreeMind, XMind

### Export Mermaid SVG ✅
- [x] **Mermaid.js v10** : Chargé via CDN (module ES)
- [x] **Syntaxe mindmap** : Générée depuis la structure d'arbre
- [x] **Symlinks marqués** : Emoji 🔗 pour les symlinks
- [x] **Échappement caractères** : Parenthèses, crochets, caractères spéciaux
- [x] **Support hors ligne** : Précaché par Service Worker

### Corrections de bugs ✅
- [x] **Reset exportType** : Corrigé timing de fermeture modal
- [x] **Parser Mermaid** : Corrigé erreurs avec parenthèses dans les titres

---

## 🎨 V0.9.4 - Polish & Corrections (1er janvier 2026) - ✅ COMPLÉTÉ

**Contexte** : Polissage interface, corrections de bugs et améliorations UX

### Améliorations UI ✅
- [x] **Nouvelle palette couleurs** : Accent bleu foncé (#0a376c, #1155aa, #4a9eff)
- [x] **Police système par défaut** : Changé de Sto (l'utilisateur peut toujours basculer)

### Corrections de bugs critiques ✅
- [x] **Symlinks cassés** : Affichage spécial avec badge "(LIEN CASSÉ)", icône ⚠️, opacité 0.5
- [x] **Symlinks externes** : Affichage spécial avec badge "(EXTERNE)", icône 🔗🚫, opacité 0.4
- [x] **Correction corruption données** : `saveNode()` ne sauvegarde pas quand éditeur désactivé
- [x] **Export mode branche** : Export "global" en mode branche exporte seulement la branche active
- [x] **Navigation post-suppression** : Navigation intelligente vers parent/frère/racine
- [x] **Boutons désactivés** : Nouveau nœud désactivé en mode branche, Confirmer désactivé sans sélection

### Export FreeMind ✅
- [x] **Contenu dans richcontent NOTE** : Format FreeMind correct
- [x] **Filtrage emojis** : Supprimés des titres pour compatibilité

### Technique ✅
- [x] **Service Worker** : Version mise à jour v1.6.0
- [x] **Qualité code** : Meilleure gestion état, gestion d'erreurs
- [x] **Pas de corruption données** : Protection pour types spéciaux de symlinks

---

## 💾 V0.10.0 - Migration IndexedDB & Sync Multi-Onglets (4 janvier 2026) - ✅ COMPLÉTÉ

**Mise à niveau majeure du stockage** de localStorage vers IndexedDB avec Dexie.js

### Migration du Stockage
- [x] **IndexedDB avec Dexie.js** : Capacité 500MB-1GB (vs 5-10MB localStorage)
- [x] **3 stores** : nodes, settings, attachments
- [x] **Migration automatique** : Transparente pour utilisateurs, backup localStorage préservé
- [x] **Nouveaux modules** : storage.js (285 lignes), migration.js (185 lignes)

### Synchronisation Multi-Onglets
- [x] **BroadcastChannel API** : Sync cross-tab en temps réel
- [x] **Module sync.js** : 80 lignes, séparation propre
- [x] **Notifications toast** : Feedback visuel lors rechargement données

### Corrections de Bugs
- [x] **5 corrections critiques** : Noms DB, usage cursor, extraction ID, refs Markdown, MIME SVG
- [x] **Corrections i18n** : Boutons Export/Import, titre nouveau nœud, 3 messages toast

### Documentation
- [x] **Nouvelles docs** : STORAGE.md (EN/FR) avec commandes debug
- [x] **Mis à jour** : README, TODO, CLAUDE.md, Service Worker v1.7.0
- [x] **Nettoyé** : Fichiers temporaires migration supprimés

---

## 🌟 V1.0 - Types actifs et système complet

### Types de nœuds actifs (Fondations)

**Objectif** : Permettre aux nœuds de définir leur propre comportement via scripts, transformant DeepMemo en plateforme extensible.

**Références** : Voir `docs/VISION.md` pour la spécification complète.

#### Architecture de base
- [ ] Système d'`implements` basique
- [ ] Propriété `implements: ["node_type_X"]` sur les nœuds
- [ ] Scripts simples (`onSave`, `onRender`, `onLoad`)
- [ ] Sandbox JavaScript sécurisé (eval isolé)
- [ ] Nœuds descripteurs de types (types = nœuds eux-mêmes)
- [ ] API de manipulation de nœuds (`getNode`, `updateNode`, `createChild`)
- [ ] Exemples concrets dans le contenu de démo

#### Types avancés et triggers
- [ ] Résolution de dépendances entre types
- [ ] Héritage de types (`implements` multiple)
- [ ] Triggers multi-nœuds (API `triggerNode`)
- [ ] Vues multiples (card, list, kanban, calendar)
- [ ] Actions customisées par type de nœud
- [ ] Exemples concrets : recettes → courses, projets agiles, CRM

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

**Dernière mise à jour** : 4 janvier 2026 (V0.10.0 migration IndexedDB)
**Version actuelle** : V0.10.0 (✅ COMPLÉTÉ & PRÊT POUR DÉPLOIEMENT)
**Déploiement** : ✅ **deepmemo.org** (EN PRODUCTION)
**Prochaine milestone** : V1.0 (Types de nœuds actifs - fondations)

---

## 🎉 V0.8 - MIGRATION FINALE COMPLÉTÉE

### ✅ Déploiement final (20 décembre 2025)
- [x] **index.html** : Bascule vers `app.js` (type="module")
- [x] **app.js → app-backup.js** : Legacy code conservé pour référence
- [x] **Drag & drop simplifié** : Modificateur Shift supprimé (Ctrl + Ctrl+Alt uniquement)
- [x] **Tests validation** : Toutes fonctionnalités opérationnelles en production
- [x] **Documentation finale** : CLAUDE.md, TODO.md, ROADMAP.md à jour

### ✅ Export/Import de branche (23 décembre 2025)
- [x] **Export branche** : Exporter nœud + descendants récursivement
- [x] **Import branche** : Importer comme enfants du nœud actuel
- [x] **Régénération IDs** : Éviter conflits avec nœuds existants
- [x] **Merge non-destructif** : Conserver données existantes
- [x] **Conservation symlinks** : Relations préservées dans branche importée
- [x] **Interface utilisateur** : Boutons ⬇️/⬆️ dans actions du nœud
- [x] **Documentation** : README, ARCHITECTURE, ROADMAP mis à jour

### ✅ Contenu de démo + UX Polish (24 décembre 2025)
- [x] **Contenu de démo** : 26 nœuds pédagogiques au premier lancement
  - Structure progressive : Bienvenue → Interface → Features → Future → Premiers pas
  - Format pédagogique : [Fonctionnalité → Ce que ça permet → Exemple]
  - Concepts futurs clarifiés (types = nœuds, triggers multi-nœuds, API externe)
- [x] **Reset scroll** : Retour en haut du contenu à chaque navigation
- [x] **Mode affichage** : Démarrage en mode lecture (au lieu d'édition)
- [x] **Right panel** : Masqué par défaut (interface épurée)
- [x] **Toggle police** : Choix entre Sto (personnalisée) et polices système
- [x] **Documentation complète** : CLAUDE.md, README, docs/ tous à jour

### ✅ Progressive Web App (25 décembre 2025)
- [x] **Manifest PWA** : Configuration complète (nom, icônes, thème)
- [x] **Service Worker** : Cache-First avec précache et update en arrière-plan
- [x] **Mode offline** : Fonctionne sans connexion Internet
- [x] **Installation native** : Desktop et mobile (Chrome, Edge, Safari, etc.)
- [x] **Icônes** : 192x192 et 512x512 générées depuis favicon.svg
- [x] **Documentation** : Guide complet dans docs/PWA.md
- [x] **HTTPS ready** : Compatible GitHub Pages, Netlify, Vercel

### ✅ Fichiers joints (25 décembre 2025)
- [x] **Stockage IndexedDB** : Jusqu'à ~500 MB selon navigateur
- [x] **Upload de fichiers** : Images, PDFs, documents (50 MB max par fichier)
- [x] **Affichage inline** : Images via syntaxe `![](attachment:ID)`
- [x] **Export/Import ZIP** : Format systématique incluant fichiers + data.json
- [x] **Gestion complète** : Upload, download, delete, copie syntaxe
- [x] **Indicateur stockage** : Barre de progression temps réel dans panneau droit
- [x] **Garbage collection** : Nettoyage manuel des fichiers orphelins
- [x] **Icônes par type** : Différenciation visuelle selon MIME type
- [x] **Documentation** : Spec détaillée dans docs/SPEC-ATTACHMENTS.md
