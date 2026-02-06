# Concepts Fondamentaux

**Comprendre les briques de base de DeepMemo**

Ce document explique les concepts fondamentaux qui font fonctionner DeepMemo. Commencez ici si vous découvrez le projet ou avez besoin de comprendre comment les pièces s'assemblent.

---

## 1. Le Nœud : Un Type de Base Unique

DeepMemo a **une unité fondamentale** : le **nœud**.

Un nœud est un conteneur qui peut contenir :
- **Titre** : Description courte (ex : "Idées de projet", "Notes de réunion")
- **Contenu** : Texte Markdown (longueur illimitée)
- **Enfants** : D'autres nœuds (créant la hiérarchie)
- **Tags** : Labels pour catégorisation
- **Pièces jointes** : Fichiers (images, PDFs, documents)
- **Métadonnées** : Date de création, date de modification, etc.

```
┌─────────────────────────────┐
│  📄 Nœud                    │
│  ────                       │
│  Titre : "Mon projet"       │
│  Contenu : "Des notes..."   │
│  Enfants : [nœud1, nœud2]   │
│  Tags : ["travail", "urgent"]│
│  Pièces jointes : [file.pdf]│
└─────────────────────────────┘
```

**Idée clé** : Tout est un nœud. Il n'y a pas de "dossiers", "documents" ou "catégories" comme types séparés. Cette simplicité permet des fonctionnalités puissantes comme les symlinks et l'organisation flexible.

---

## 2. Hiérarchie : Relations Parent-Enfant

Les nœuds s'organisent à travers des **relations parent-enfant**, formant une structure arborescente.

### Structure Arborescente de Base

```
Nœuds Racine (niveau supérieur)
├─ 📘 Travail
│  ├─ 📋 Projet A
│  │  ├─ 📝 Tâche 1
│  │  └─ 📝 Tâche 2
│  └─ 📋 Projet B
└─ 🏠 Personnel
   ├─ 📚 Livres
   └─ ✈️ Voyages
```

### Propriétés

- **Racines multiples** : Vous pouvez avoir plusieurs nœuds de niveau supérieur (pas forcé dans une racine unique)
- **Profondeur illimitée** : Les nœuds peuvent s'imbriquer infiniment (nœud → enfant → petit-enfant → ...)
- **Parent unique** : Chaque nœud a exactement un parent (sauf les nœuds racine, qui ont `parent: null`)
- **Enfants ordonnés** : Les enfants conservent leur ordre (peuvent être réorganisés par glisser-déposer)

### Navigation

Les utilisateurs naviguent dans l'arbre en :
- **Dépliant/repliant** les nœuds (afficher/masquer les enfants)
- **Sélectionnant** un nœud (affiche son contenu dans le panneau central)
- **Fil d'Ariane** montrant le chemin de la racine au nœud actuel

**Pourquoi la hiérarchie ?** Les connaissances humaines s'organisent naturellement de façon hiérarchique. Les projets ont des tâches, les livres ont des chapitres, les voyages ont des destinations. DeepMemo reflète cette structure naturelle.

---

## 3. Symlinks : De l'Arbre au Réseau

Une hiérarchie pure a une limitation : un nœud ne peut exister qu'à un seul endroit. Mais l'information du monde réel appartient souvent à plusieurs contextes.

Les **Symlinks** (liens symboliques) résolvent cela en permettant à un nœud d'apparaître à plusieurs endroits.

### Comment Fonctionnent les Symlinks

```
Travail
├─ 📋 Projet A
│  ├─ 📝 Tâche : Réviser design
│  └─ 📝 Tâche : Tester fonctionnalité
└─ 🔁 Réunions Équipe
   ├─ 📅 Réunion 2026-01-27
   └─ 🔗 Tâche : Réviser design  ← Symlink vers nœud dans Projet A

Personnel
└─ 📚 Apprentissage
   └─ 🔗 Tâche : Réviser design  ← Même symlink, contexte différent
```

La tâche "Réviser design" existe physiquement sous "Projet A", mais apparaît (via symlinks) dans :
- Réunions Équipe (discutée en réunion)
- Apprentissage (quelque chose que j'ai appris de cette tâche)

### Propriétés des Symlinks

**Renommables** : Vous pouvez donner au symlink un titre différent du nœud original.
```
Original : "Spécification technique document v2.3"
Symlink dans "Référence Rapide" : "Doc spec"
Symlink dans "Archive 2025" : "Vieille spec (2025)"
```

**Le contenu suit la cible** : Le contenu réel (markdown, pièces jointes, enfants) vient toujours du nœud cible. Éditer un symlink édite l'original.

**Suppression indépendante** : Supprimer un symlink ne supprime pas le nœud cible. Cela retire juste cette référence.

### Structure Réticulaire

Avec les symlinks, la hiérarchie devient une **structure réticulaire** (arbre en réseau) :

```
        Arbre             +        Symlinks         =        Réseau

    A                                                      A
   / \                                                    / \
  B   C                                                  B═══C
                              C → B                       ║
                          (symlink)
                                                    (B apparaît sous A et C)
```

**Pourquoi les symlinks ?** La connaissance n'est pas purement hiérarchique. Un article de recherche peut être pertinent pour plusieurs projets. Un contact peut appartenir aux contextes travail et personnel. Les symlinks permettent à l'information d'exister là où elle est nécessaire sans duplication.

---

## 4. Clés d'Instance : Suivre les Chemins

Voici un problème que créent les symlinks : Comment identifier de façon unique un nœud quand il apparaît plusieurs fois dans l'arbre ?

### Le Problème

```
Racine
├─ Projet A
│  └─ Tâche X (id: "node_123")
└─ Archive
   └─ 🔗 Tâche X (aussi id: "node_123" - c'est le même nœud !)
```

Les deux instances ont `id: "node_123"`, mais elles sont à des endroits différents. Comment les distinguer ?

### La Solution : Clés d'Instance

Une **clé d'instance** encode le chemin complet de la racine au nœud :

```
nodeId @ parent @ grand-parent @ ... @ racine
```

**Exemples** :
- Nœud racine : `"node_123@root"`
- Enfant : `"node_456@node_123@root"`
- Petit-enfant : `"node_789@node_456@node_123@root"`
- Via symlink : `"node_123@node_999@root"` (même nœud, chemin différent)

### Pourquoi C'est Important

Les clés d'instance permettent :
1. **Sélection unique** : Savoir exactement quelle instance l'utilisateur a cliquée
2. **Détection de cycles** : Empêcher les boucles infinies (nœud se contenant via symlinks)
3. **Préservation du contexte** : Se souvenir où vous étiez dans l'arbre à travers les rafraîchissements de page
4. **Isolation de branche** : (voir section suivante)

**Détail d'implémentation** : La fonction `getInstanceKey(nodeId, parentContext)` dans `tree.js` génère ces clés pendant le rendu de l'arbre.

---

## 5. Mode Branche : Sous-Arbres Isolés

Parfois vous voulez vous concentrer sur juste une partie de votre arbre de connaissances, en ignorant tout le reste.

Le **Mode Branche** vous permet d'isoler une sous-arborescence, affichant seulement un nœud spécifique et ses descendants.

### Mode Normal vs Mode Branche

**Mode Normal** (par défaut) :
```
Nœuds Racine (tous visibles)
├─ 📘 Travail
│  ├─ Projet A
│  └─ Projet B
├─ 🏠 Personnel
└─ 📚 Archive
```

**Mode Branche** (isoler "Travail") :
```
Travail (racine de branche)
├─ Projet A
│  ├─ Tâche 1
│  └─ Tâche 2
└─ Projet B
   └─ Tâche 3

(Personnel et Archive sont masqués)
```

### Comment Ça Marche

1. **Paramètre URL** : `?branch=node_123` définit la racine de branche
2. **Rendu de l'arbre** : Rend seulement les descendants de `node_123`
3. **Clés d'instance** : S'arrêtent à la racine de branche (ex : `"node_456@node_123"` au lieu de continuer jusqu'à la racine globale)
4. **Navigation** : Le fil d'Ariane commence à la racine de branche
5. **Recherche** : Limitée aux nœuds dans la branche

### Symlinks Externes

Que se passe-t-il si un symlink pointe hors de la branche ?

```
Branche : Travail
├─ Projet A
└─ 🔗 Note Importante  ← Pointe vers un nœud dans Personnel (hors branche)
```

**Comportement** : Les symlinks externes sont **grisés** en mode branche :
- Apparence grisée (opacity 0.4)
- Badge "externe" / "external" (selon la langue)
- Icône : 🔗🚫
- Cliquable mais affiche toast d'avertissement (sélection autorisée pour suppression)
- Non déplaçable

**Pourquoi désactivés pour la navigation ?** Suivre un symlink externe briserait l'isolation de branche. Le nœud cible ne serait pas accessible dans la vue actuelle. Cependant, la sélection est permise pour pouvoir supprimer les symlinks externes si nécessaire.

### Cas d'Usage

- **Partage** : Exporter un projet spécifique sans toute votre base de connaissances
- **Concentration** : Travailler sur une zone sans distractions
- **Présentations** : Montrer une sous-arborescence spécifique pendant les réunions
- **Collaboration** : Partager une branche via export `.dm` sans exposer le contenu non lié

**Format d'URL** : Le mode branche utilise paramètres de requête + hash :
```
?branch=node_123#/node/node_456
       ├─────────┘      └──────────┘
   ID racine branche    nœud actuellement affiché
```

Cette conception permet :
- **Marque-pages** de branches (paramètre de requête persiste)
- **Navigation navigateur** (hash permet boutons précédent/suivant)

---

## 6. Tags : Métadonnées Transversales

Alors que la hiérarchie organise les nœuds verticalement (parent → enfant), les **tags** les organisent horizontalement à travers l'arbre.

### Usage de Base

Tout nœud peut avoir plusieurs tags :
```
Nœud : "Architecture composant React"
Tags : ["react", "frontend", "tutorial", "video"]
```

Les tags permettent :
- **Recherche par tag** : Trouver tous les nœuds avec le tag "frontend"
- **Nuage de tags** : Voir tous les tags dans la branche actuelle
- **Auto-complétion** : Suggère les tags existants pendant la frappe
- **Filtrage** : (fonctionnalité future)

### Portée des Tags

Les tags sont **globaux** mais la recherche respecte le mode branche :
- **Mode normal** : La recherche trouve les nœuds tagués n'importe où dans l'arbre
- **Mode branche** : La recherche trouve les nœuds tagués seulement dans la branche actuelle

### Tags vs Hiérarchie

**Quand utiliser la hiérarchie** :
- Relation parent-enfant claire (Projet → Tâches)
- Structure séquentielle ou imbriquée (Livre → Chapitres → Sections)
- Une catégorisation primaire

**Quand utiliser les tags** :
- Catégorisations multiples (une note peut être à la fois "tutorial" et "avancé")
- Thèmes inter-projets (tous les nœuds liés à "sécurité")
- Marqueurs de statut ("todo", "review", "done")
- Marqueurs temporels ("2025", "Q1")

**Bonne pratique** : Utiliser les deux. Hiérarchie pour la structure, tags pour les références croisées flexibles.

```
Travail (hiérarchie)
├─ Projet A [tags: sécurité, backend]
│  └─ Tâche 1 [tags: sécurité, urgent]
└─ Projet B [tags: frontend]
   └─ Tâche 2 [tags: sécurité]

Recherche "sécurité" → trouve Projet A, Tâche 1, Tâche 2
```

---

## Tout Assembler

La puissance de DeepMemo vient de la combinaison de ces concepts :

1. Les **Nœuds** fournissent une unité unique et flexible
2. La **Hiérarchie** crée une organisation naturelle
3. Les **Symlinks** connectent l'information liée à travers les contextes
4. Les **Clés d'instance** suivent les chemins uniques à travers le réseau
5. Le **Mode branche** permet des vues concentrées et un partage sécurisé
6. Les **Tags** ajoutent une catégorisation orthogonale

**Exemple de workflow** :

```
1. Créer une structure hiérarchique
   Travail
   └─ Projet A
      ├─ Design
      └─ Implémentation

2. Ajouter des symlinks pour références croisées
   Travail
   └─ Projet A
      ├─ Design
      │  └─ 🔗 Maquettes UI (depuis Ressources Design)
      └─ Implémentation

3. Ajouter des tags pour les thèmes
   Design [tags: ui, priorité-haute]
   Implémentation [tags: backend, api]

4. Utiliser le mode branche pour partager
   Exporter branche "Projet A" en .dm
   → Seulement le contenu Projet A inclus
   → Symlinks externes préservés mais marqués

5. Rechercher et naviguer
   Recherche "ui" → trouve Design + nœuds tagués
   Naviguer via arbre ou fil d'Ariane
   Suivre symlinks pour explorer les connexions
```

Cette conception supporte naturellement les fonctionnalités avancées de DeepMemo comme l'export PDF (hiérarchie → structure de document), File System Sync (nœuds → fichiers/dossiers), et le partage collaboratif (exports de branches).

---

## Prochaines Étapes

Maintenant que vous comprenez les concepts fondamentaux, explorez :

- **[2-ARCHITECTURE.md](2-ARCHITECTURE.md)** - Comment ces concepts sont implémentés
- **[3-DATA-MODEL.md](3-DATA-MODEL.md)** - La structure de données réelle dans IndexedDB
- **[4-FEATURES.md](4-FEATURES.md)** - Ce que vous pouvez faire avec DeepMemo

Ou plongez dans des guides spécifiques :
- **[guides/FILE-FORMATS.md](guides/FILE-FORMATS.md)** - Export/import avec archives `.dm`
- **[guides/FS-SYNC.md](guides/FS-SYNC.md)** - Sync avec système de fichiers local
