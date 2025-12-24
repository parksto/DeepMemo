/**
 * default-data.js
 *
 * Contenu de démonstration par défaut pour les nouveaux utilisateurs.
 * Ce contenu sert à la fois de présentation et de tutoriel interactif.
 */

export function getDefaultData() {
  const now = Date.now();

  // Générer des IDs uniques pour chaque nœud
  const ids = {
    root: `node_${now}_welcome`,
    privacy: `node_${now + 1}_privacy`,
    interface: `node_${now + 2}_interface`,
    tree: `node_${now + 3}_tree`,
    center: `node_${now + 4}_center`,
    right: `node_${now + 5}_right`,
    features: `node_${now + 6}_features`,
    nodes: `node_${now + 7}_nodes`,
    nodesExample1: `node_${now + 8}_nodes_ex1`,
    nodesExample2: `node_${now + 9}_nodes_ex2`,
    symlinks: `node_${now + 10}_symlinks`,
    symlinksExample: `node_${now + 11}_symlinks_ex`,
    tags: `node_${now + 12}_tags`,
    tagsExample: `node_${now + 13}_tags_ex`,
    branch: `node_${now + 14}_branch`,
    branchExample: `node_${now + 15}_branch_ex`,
    export: `node_${now + 16}_export`,
    exportExample: `node_${now + 17}_export_ex`,
    keyboard: `node_${now + 18}_keyboard`,
    future: `node_${now + 19}_future`,
    activeNodes: `node_${now + 20}_active_nodes`,
    activeNodesExample: `node_${now + 21}_active_nodes_ex`,
    triggers: `node_${now + 22}_triggers`,
    triggersExample: `node_${now + 23}_triggers_ex`,
    multiUser: `node_${now + 24}_multi_user`,
    multiUserExample: `node_${now + 25}_multi_user_ex`,
    firstSteps: `node_${now + 26}_first_steps`,
  };

  return {
    nodes: {
      // Nœud racine : Bienvenue
      [ids.root]: {
        id: ids.root,
        type: "node",
        title: "📘 Bienvenue dans DeepMemo",
        content: `# Bienvenue dans DeepMemo ! 👋

DeepMemo est un outil de prise de notes **hiérarchique**, **flexible** et **puissant**.

## 🎯 À quoi ça sert ?

- **Organiser tes idées** en arborescence infinie
- **Lier des informations** entre elles (symlinks, tags)
- **Retrouver rapidement** ce que tu cherches
- **Partager des branches** avec d'autres personnes
- **Garder le contrôle** : tes données restent chez toi

## 🧭 Comment l'utiliser ?

👈 **Explore l'arborescence à gauche** pour découvrir les fonctionnalités.

Chaque nœud t'explique un aspect de DeepMemo avec des exemples concrets.

## 🚀 Pour qui ?

- Étudiants qui prennent des notes de cours
- Développeurs qui documentent leurs projets
- Créatifs qui organisent leurs idées
- Cuisiniers qui partagent des recettes
- Ou simplement toi, qui veux **un second cerveau numérique** !

---

**Commence par explorer les enfants de ce nœud** (regarde juste en dessous, ou dans l'arborescence à gauche). 😊`,
        children: [ids.privacy, ids.interface, ids.features, ids.future, ids.firstSteps],
        parent: null,
        tags: ["bienvenue", "guide"],
        links: [],
        backlinks: [],
        created: now,
        modified: now
      },

      // 🔐 Tes données t'appartiennent
      [ids.privacy]: {
        id: ids.privacy,
        type: "node",
        title: "🔐 Tes données t'appartiennent",
        content: `# Pas de serveur, pas de tracking

DeepMemo est un outil **100% local**. Voici ce que ça signifie :

## 📦 Stockage local (localStorage)

- Toutes tes données sont **stockées dans ton navigateur**
- Aucun serveur distant
- Aucune collecte de données
- Aucun compte requis

## ✅ Avantages

- **Vie privée** : Personne d'autre que toi ne voit tes notes
- **Rapidité** : Pas de latence réseau
- **Gratuit** : Pas d'abonnement, pas de limite
- **Offline** : Fonctionne sans Internet

## ⚠️ Ce que tu dois savoir

- Les données sont **liées à ce navigateur sur cet appareil**
- Si tu vides le cache du navigateur, tu perds tes données
- **Solution** : Exporte régulièrement tes données (voir le nœud "Export/Import")

## 🔮 Bientôt

À l'avenir, DeepMemo pourra **optionnellement** se synchroniser sur plusieurs appareils, mais toujours avec **ton contrôle total** sur tes données.

---

**En résumé** : DeepMemo respecte ta vie privée. C'est ton espace, tes règles.`,
        children: [],
        parent: ids.root,
        tags: ["vie-privée", "sécurité", "local"],
        links: [],
        backlinks: [],
        created: now + 1,
        modified: now + 1
      },

      // 🧭 Découvrir l'interface
      [ids.interface]: {
        id: ids.interface,
        type: "node",
        title: "🧭 Découvrir l'interface",
        content: `# L'interface en 3 panneaux

DeepMemo est organisé en **3 zones principales** :

## 👈 Panneau gauche : L'arborescence

Affiche tous tes nœuds sous forme d'arbre.

**Actions possibles** :
- Cliquer sur un nœud pour l'afficher
- Cliquer sur le triangle (▶) pour déplier/replier
- Naviguer au clavier (↑↓←→ + Entrée)

## 📝 Panneau central : Le contenu

Affiche le nœud actuellement sélectionné.

**Ce que tu y trouves** :
- Le **titre** et le **contenu** du nœud
- Les **enfants** (cartes cliquables en bas)
- Les **tags**
- Les **boutons d'action** (Nouveau, Actions, Export/Import de branche)

## 🏷️ Panneau droit : Tags et infos

Affiche des informations contextuelles.

**Ce que tu y trouves** :
- Les **tags** du nœud actuel
- Le **tag cloud** de la branche (tous les tags avec compteurs)
- Les **raccourcis clavier**

---

**Explore les sous-nœuds** pour plus de détails sur chaque panneau.`,
        children: [ids.tree, ids.center, ids.right],
        parent: ids.root,
        tags: ["interface", "guide"],
        links: [],
        backlinks: [],
        created: now + 2,
        modified: now + 2
      },

      // Sous-nœud : L'arborescence
      [ids.tree]: {
        id: ids.tree,
        type: "node",
        title: "🌳 L'arborescence (panneau gauche)",
        content: `# L'arborescence

C'est ta **carte de navigation**. Tous tes nœuds y sont organisés.

## 📂 Hiérarchie infinie

- Les nœuds peuvent avoir des **enfants**
- Les enfants peuvent avoir des **enfants**
- Et ainsi de suite, **à l'infini**

## 🎯 Navigation

**À la souris** :
- Clic sur le **titre** : Affiche le nœud
- Clic sur le **triangle** (▶) : Déplie/replie (sans changer le nœud affiché)

**Au clavier** :
- **↑↓** : Monter/descendre
- **→** : Déplier un nœud
- **←** : Replier un nœud (ou remonter au parent si déjà replié)
- **Entrée** : Afficher le nœud sélectionné

## 🎨 Auto-collapse

Quand tu **affiches** un nœud (clic sur le titre ou Entrée), l'arbre se "nettoie" automatiquement :
- Seul le **chemin vers le nœud actuel** reste déplié
- Le reste se replie pour garder l'arbre lisible

Mais si tu **déplis manuellement** (clic sur triangle ou →), l'état est préservé.

---

**Astuce** : Utilise les **raccourcis clavier** pour naviguer rapidement !`,
        children: [],
        parent: ids.interface,
        tags: ["navigation", "arbre"],
        links: [],
        backlinks: [],
        created: now + 3,
        modified: now + 3
      },

      // Sous-nœud : Le panneau central
      [ids.center]: {
        id: ids.center,
        type: "node",
        title: "📝 Le panneau central",
        content: `# Le panneau central

C'est là que tu **lis et édites** tes nœuds.

## 🎭 Deux modes : View / Edit

- **Mode View** (lecture) : Le contenu est affiché en Markdown rendu
- **Mode Edit** (édition) : Le contenu est affiché dans un textarea éditable

**Bascule** entre les deux :
- Clic sur le bouton **[Afficher]** / **[Éditer]**
- Raccourci clavier : **Alt+V**

## 🧩 Sections

### En haut
- **Breadcrumb** : Le chemin vers le nœud actuel (ex: ".../parent/actuel")
- **Bouton 🏠** : Retour au premier nœud racine

### Au milieu
- **Titre** du nœud
- **Contenu** (Markdown)
- **Tags** du nœud

### En bas
- **Boutons d'action** : Nouveau nœud, Actions, Export/Import de branche
- **Cartes des enfants** : Cliquables pour naviguer

---

**Astuce** : Double-clique sur le titre pour le modifier !`,
        children: [],
        parent: ids.interface,
        tags: ["édition", "contenu"],
        links: [],
        backlinks: [],
        created: now + 4,
        modified: now + 4
      },

      // Sous-nœud : Le panneau droit
      [ids.right]: {
        id: ids.right,
        type: "node",
        title: "🏷️ Le panneau droit",
        content: `# Le panneau droit

Affiche des **informations contextuelles** sur le nœud actuel et la branche.

## 🏷️ Tags du nœud

Les tags attachés au nœud actuellement affiché.

## ☁️ Tag cloud de la branche

Tous les tags utilisés dans la **branche actuelle** (le nœud actuel + ses descendants), avec le **nombre d'occurrences**.

**Utilité** :
- Voir d'un coup d'œil les thèmes abordés
- Identifier les tags les plus utilisés
- Naviguer par thématique

## ⌨️ Raccourcis clavier

Un rappel des **raccourcis** disponibles :
- **Alt+N** : Nouveau nœud
- **Alt+E** : Focus éditeur
- **Alt+V** : Toggle view/edit
- **Ctrl+K** : Recherche
- Et bien d'autres !

---

**Astuce** : Le panneau droit est **pliable** (clic sur le bouton en haut à droite).`,
        children: [],
        parent: ids.interface,
        tags: ["tags", "raccourcis"],
        links: [],
        backlinks: [],
        created: now + 5,
        modified: now + 5
      },

      // ✨ Fonctionnalités actuelles
      [ids.features]: {
        id: ids.features,
        type: "node",
        title: "✨ Fonctionnalités actuelles",
        content: `# Ce que DeepMemo peut déjà faire

DeepMemo **V0.8** inclut toutes ces fonctionnalités :

## 📂 Nœuds et hiérarchie
Organise tes idées en arborescence infinie.

## 🔗 Liens symboliques
Un même nœud peut apparaître dans plusieurs endroits.

## 🏷️ Tags et recherche
Retrouve rapidement tes notes par tags ou mots-clés.

## 🌳 Mode branche
Isole une sous-arborescence pour travailler au calme.

## ⬇️ Export/Import
Sauvegarde et partage tes données (global ou par branche).

## ⌨️ Raccourcis clavier
Navigue rapidement sans utiliser la souris.

---

**Explore les sous-nœuds** pour découvrir chaque fonctionnalité en détail avec des exemples concrets.`,
        children: [ids.nodes, ids.symlinks, ids.tags, ids.branch, ids.export, ids.keyboard],
        parent: ids.root,
        tags: ["fonctionnalités", "guide"],
        links: [],
        backlinks: [],
        created: now + 6,
        modified: now + 6
      },

      // Fonctionnalité : Nœuds et hiérarchie
      [ids.nodes]: {
        id: ids.nodes,
        type: "node",
        title: "📂 Nœuds et hiérarchie",
        content: `# Les nœuds : La brique de base

Tout dans DeepMemo est un **nœud**.

## 🧩 Qu'est-ce qu'un nœud ?

Un nœud contient :
- Un **titre**
- Du **contenu** (Markdown)
- Des **tags**
- Des **enfants** (d'autres nœuds)
- Un **parent** (optionnel)

## 🌳 Hiérarchie infinie

Les nœuds s'organisent en **arborescence** :
- Un nœud peut avoir plusieurs **enfants**
- Un enfant peut lui-même avoir des enfants
- Et ainsi de suite, **sans limite de profondeur**

## 🎯 Ce que ça permet

**Organiser** :
- Projets avec sous-tâches
- Notes de cours par chapitre
- Recettes par catégorie
- Documentation par module

**Naviguer** :
- Du général au particulier
- Explorer progressivement
- Garder le contexte

---

**Exemples concrets ci-dessous** 👇`,
        children: [ids.nodesExample1, ids.nodesExample2],
        parent: ids.features,
        tags: ["nœuds", "hiérarchie"],
        links: [],
        backlinks: [],
        created: now + 7,
        modified: now + 7
      },

      // Exemple : Projet
      [ids.nodesExample1]: {
        id: ids.nodesExample1,
        type: "node",
        title: "Exemple : Organiser un projet",
        content: `# Exemple : Projet de site web

Imagine que tu veux organiser un projet de site web.

## 🗂️ Structure possible

\`\`\`
🌐 Projet Site Web
├── 🎨 Design
│   ├── Maquettes
│   ├── Charte graphique
│   └── Logo
├── 💻 Développement
│   ├── Frontend
│   │   ├── Composants React
│   │   └── Styles CSS
│   └── Backend
│       ├── API
│       └── Base de données
└── 📋 Gestion
    ├── To-do
    ├── Bugs
    └── Roadmap
\`\`\`

## ✅ Avantages

- Tout est **au même endroit**
- Tu peux **zoomer** sur une partie (ex: Frontend)
- Tu peux **ajouter** des détails au fur et à mesure
- Tu peux **réorganiser** facilement (drag & drop)

---

**En pratique** : Crée un nœud racine "Projet", puis ajoute des enfants pour chaque catégorie.`,
        children: [],
        parent: ids.nodes,
        tags: ["exemple", "projet", "organisation"],
        links: [],
        backlinks: [],
        created: now + 8,
        modified: now + 8
      },

      // Exemple : Notes de cours
      [ids.nodesExample2]: {
        id: ids.nodesExample2,
        type: "node",
        title: "Exemple : Prendre des notes de cours",
        content: `# Exemple : Notes de cours de physique

Les nœuds hiérarchiques sont parfaits pour structurer des notes de cours.

## 🗂️ Structure possible

\`\`\`
⚛️ Physique
├── 📚 Chapitre 1 : Mécanique
│   ├── 1.1 Cinématique
│   │   ├── Vitesse
│   │   ├── Accélération
│   │   └── Exercices
│   ├── 1.2 Dynamique
│   │   ├── Forces
│   │   ├── Lois de Newton
│   │   └── Exercices
│   └── 🧪 TP n°1
├── 📚 Chapitre 2 : Thermodynamique
│   ├── 2.1 Température
│   └── 2.2 Entropie
└── 📝 Fiches de révision
\`\`\`

## ✅ Avantages

- **Navigation intuitive** : Du cours général aux détails
- **Contexte préservé** : Tu sais toujours où tu es (breadcrumb)
- **Évolutif** : Ajoute des nœuds au fur et à mesure du semestre
- **Recherche rapide** : Retrouve un concept avec Ctrl+K

---

**Astuce** : Ajoute des **tags** (ex: "important", "examen", "formule") pour retrouver rapidement les infos clés.`,
        children: [],
        parent: ids.nodes,
        tags: ["exemple", "cours", "étudiant"],
        links: [],
        backlinks: [],
        created: now + 9,
        modified: now + 9
      },

      // Fonctionnalité : Liens symboliques
      [ids.symlinks]: {
        id: ids.symlinks,
        type: "node",
        title: "🔗 Liens symboliques",
        content: `# Les symlinks : Un nœud à plusieurs endroits

Un **lien symbolique** (symlink) est comme un raccourci Windows : il pointe vers un nœud existant.

## 🎯 Ce que ça permet

**Réutiliser** un nœud sans le dupliquer :
- Une recette dans "Desserts" ET "Sans gluten"
- Un contact dans "Travail" ET "Amis"
- Une note dans "Projet A" ET "Projet B"

## 🧩 Comment ça marche ?

1. Tu crées un **nœud normal** quelque part
2. Tu crées un **symlink** ailleurs qui pointe vers ce nœud
3. Le contenu est **partagé** : modifier l'un modifie l'autre
4. Mais le **titre** du symlink est **indépendant**

## 🔄 Différence avec la duplication

**Duplication** :
- Copie complète du nœud
- Modifications indépendantes
- Utilise plus d'espace

**Symlink** :
- Référence vers l'original
- Modifications synchronisées
- Un seul contenu partagé

## 🚫 Protection

DeepMemo détecte les **références circulaires** (A → B → A) et les empêche automatiquement.

---

**Exemple concret ci-dessous** 👇`,
        children: [ids.symlinksExample],
        parent: ids.features,
        tags: ["symlinks", "liens"],
        links: [],
        backlinks: [],
        created: now + 10,
        modified: now + 10
      },

      // Exemple : Symlinks
      [ids.symlinksExample]: {
        id: ids.symlinksExample,
        type: "node",
        title: "Exemple : Recette sans gluten",
        content: `# Exemple : Une recette dans deux catégories

Imagine que tu as une recette de "Cookies au chocolat" qui est **sans gluten**.

## 🗂️ Structure sans symlinks

\`\`\`
🍰 Recettes
├── 🍪 Desserts
│   └── Cookies au chocolat
└── 🌾 Sans gluten
    └── Cookies au chocolat (copie)
\`\`\`

**Problème** : Si tu modifies la recette dans "Desserts", tu dois **aussi** la modifier dans "Sans gluten".

## 🔗 Structure avec symlinks

\`\`\`
🍰 Recettes
├── 🍪 Desserts
│   └── Cookies au chocolat (original)
└── 🌾 Sans gluten
    └── 🔗 Cookies au chocolat (symlink)
\`\`\`

**Avantage** : Tu modifies l'original, le symlink affiche automatiquement la **même recette**.

## ✅ Résultat

- **Une seule source de vérité** : Le contenu de la recette
- **Plusieurs contextes** : Accessible depuis "Desserts" ou "Sans gluten"
- **Pas de désynchronisation** : Toujours à jour

---

**Pour créer un symlink** : Ouvre le modal "Actions" sur un nœud → Choisir "Créer lien symbolique vers" → Sélectionner la destination.`,
        children: [],
        parent: ids.symlinks,
        tags: ["exemple", "recette", "organisation"],
        links: [],
        backlinks: [],
        created: now + 11,
        modified: now + 11
      },

      // Fonctionnalité : Tags et recherche
      [ids.tags]: {
        id: ids.tags,
        type: "node",
        title: "🏷️ Tags et recherche",
        content: `# Tags et recherche : Retrouver l'info rapidement

DeepMemo inclut un **système de tags** et une **recherche globale** puissante.

## 🏷️ Les tags

**Qu'est-ce que c'est ?** :
- Des **étiquettes** attachées à un nœud
- Ex: "important", "idée", "recette", "travail"

**À quoi ça sert ?** :
- Organiser par **thématique** (pas seulement par hiérarchie)
- Retrouver des nœuds liés conceptuellement
- Filtrer rapidement

**Auto-complétion** :
- Quand tu tapes un tag, DeepMemo te **suggère** les tags existants
- Scope intelligent : d'abord les tags de la branche, puis globaux
- Évite les fautes de frappe et les doublons

## 🔍 La recherche globale

**Raccourci** : **Ctrl+K**

**Recherche dans** :
- Les **titres** des nœuds
- Le **contenu** (markdown)
- Les **tags**

**Navigation** :
- Résultats en temps réel
- Highlights des correspondances
- Clique sur un résultat pour y aller directement
- L'arbre se déplie automatiquement jusqu'au nœud

---

**Exemple concret ci-dessous** 👇`,
        children: [ids.tagsExample],
        parent: ids.features,
        tags: ["tags", "recherche"],
        links: [],
        backlinks: [],
        created: now + 12,
        modified: now + 12
      },

      // Exemple : Tags
      [ids.tagsExample]: {
        id: ids.tagsExample,
        type: "node",
        title: "Exemple : Retrouver une recette rapide",
        content: `# Exemple : Tags pour les recettes

Imagine que tu as 50 recettes organisées par catégorie (Desserts, Plats, Entrées).

## 🏷️ Tags utiles

Tu peux ajouter des tags comme :
- **rapide** : Recettes de moins de 30 minutes
- **végé** : Recettes végétariennes
- **hiver** : Recettes de saison
- **batch-cooking** : Recettes en grande quantité
- **kids** : Recettes appréciées des enfants

## 🔍 Recherche

**Besoin** : "Je veux une recette rapide et végé pour ce soir"

**Solution** :
1. Ouvre la recherche (**Ctrl+K**)
2. Tape "rapide végé"
3. Les résultats affichent uniquement les recettes avec ces deux tags

**Résultat** : Tu trouves en **2 secondes** au lieu de parcourir toute l'arborescence.

## ☁️ Tag cloud

Le **panneau droit** affiche tous les tags de la branche avec leur nombre d'occurrences.

**Utilité** :
- Voir d'un coup d'œil les thèmes récurrents
- Identifier les tags les plus utilisés
- S'assurer de ne pas créer de doublons (ex: "végé" vs "végétarien")

---

**Astuce** : Utilise des tags **courts** et **cohérents** pour une auto-complétion efficace.`,
        children: [],
        parent: ids.tags,
        tags: ["exemple", "recette", "efficacité"],
        links: [],
        backlinks: [],
        created: now + 13,
        modified: now + 13
      },

      // Fonctionnalité : Mode branche
      [ids.branch]: {
        id: ids.branch,
        type: "node",
        title: "🌳 Mode branche",
        content: `# Mode branche : Isoler une sous-arborescence

Le **mode branche** permet d'afficher uniquement une **partie** de ton arbre.

## 🎯 Ce que ça permet

**Isoler** :
- Travailler sur un sous-projet sans être distrait par le reste
- Partager une branche spécifique avec quelqu'un d'autre
- Créer des "espaces de travail" thématiques

**Comment ça fonctionne** :
1. Clique sur l'icône **🌳** (Partager branche) sur un nœud
2. L'URL change : \`?branch=nodeId#/node/nodeId\`
3. Seule la **sous-arborescence** de ce nœud est affichée
4. Le reste de l'arbre est **masqué**

## 🔗 Symlinks externes

En mode branche, les **symlinks qui pointent hors de la branche** sont :
- **Grisés** (opacity réduite)
- **Non-cliquables**
- Marqués avec l'icône **🔗🚫**
- Affichent un badge "externe"

**Pourquoi ?** : Pour éviter de naviguer hors de la branche isolée et maintenir le contexte.

## 🔖 Partage

Le mode branche génère une **URL bookmarkable** :
- Tu peux la partager avec quelqu'un
- La personne voit **uniquement cette branche**
- Pratique pour la collaboration

---

**Exemple concret ci-dessous** 👇`,
        children: [ids.branchExample],
        parent: ids.features,
        tags: ["branche", "isolation"],
        links: [],
        backlinks: [],
        created: now + 14,
        modified: now + 14
      },

      // Exemple : Mode branche
      [ids.branchExample]: {
        id: ids.branchExample,
        type: "node",
        title: "Exemple : Partager une recette",
        content: `# Exemple : Partager une branche de recettes

Imagine que tu as une branche "Recettes" avec des sous-catégories.

## 🗂️ Structure complète

\`\`\`
📘 Bienvenue dans DeepMemo
├── 📚 Projets
├── 📝 Notes
└── 🍰 Recettes
    ├── 🍪 Desserts
    │   ├── Cookies
    │   └── Gâteau
    ├── 🥗 Plats
    └── 🍲 Soupes
\`\`\`

## 🌳 Mode branche activé

Tu veux partager **uniquement** les recettes avec un ami.

**Action** :
1. Va sur le nœud "🍰 Recettes"
2. Clique sur l'icône **🌳** (Partager branche)
3. L'URL devient : \`?branch=node_recettes#/node/node_recettes\`
4. Copie cette URL et envoie-la à ton ami

**Résultat pour ton ami** :
- Il voit **uniquement** la branche "Recettes"
- Pas de "Projets" ni "Notes"
- Navigation limitée à cette sous-arborescence
- Expérience propre et ciblée

## ⬇️ Bonus : Export de branche

Tu peux aussi **exporter** la branche en fichier JSON :
1. Va sur "🍰 Recettes"
2. Clique sur **⬇️ Export branche**
3. Envoie le fichier JSON à ton ami
4. Il peut **l'importer** dans son DeepMemo (⬆️ Import branche)

**Avantage** : Les données sont **locales**, pas besoin de serveur !

---

**Astuce** : Le mode branche est parfait pour collaborer sans tout partager.`,
        children: [],
        parent: ids.branch,
        tags: ["exemple", "partage", "collaboration"],
        links: [],
        backlinks: [],
        created: now + 15,
        modified: now + 15
      },

      // Fonctionnalité : Export/Import
      [ids.export]: {
        id: ids.export,
        type: "node",
        title: "⬇️ Export / Import",
        content: `# Export et Import : Sauvegarde et partage

DeepMemo permet d'**exporter** et **importer** tes données en JSON.

## 💾 Deux types d'export/import

### 1. Export/Import **global**

**Boutons** : Dans la sidebar gauche

**Ce qui est exporté** :
- **Tout** l'arbre (tous les nœuds racines)
- **Toutes** les données (contenu, tags, relations)

**Utilité** :
- Sauvegarder toutes tes données
- Migrer vers un autre navigateur
- Partager ton système complet

⚠️ **Attention** : L'import global **écrase** toutes les données existantes.

### 2. Export/Import **de branche**

**Boutons** : Dans le panneau central, sous le contenu du nœud

**Ce qui est exporté** :
- Le nœud actuel + **tous ses descendants**
- Les relations internes (symlinks, enfants)

**Utilité** :
- Partager une branche spécifique (ex: recettes)
- Collaborer sans tout partager
- Réutiliser une structure ailleurs

✅ **Bonus** : L'import de branche est **non-destructif** :
- Les IDs sont régénérés automatiquement
- Pas de conflit avec les nœuds existants
- La branche est **fusionnée** comme enfants du nœud actuel

---

**Exemple concret ci-dessous** 👇`,
        children: [ids.exportExample],
        parent: ids.features,
        tags: ["export", "import", "sauvegarde"],
        links: [],
        backlinks: [],
        created: now + 16,
        modified: now + 16
      },

      // Exemple : Export/Import
      [ids.exportExample]: {
        id: ids.exportExample,
        type: "node",
        title: "Exemple : Partager des recettes",
        content: `# Exemple : Partager une branche de recettes avec un ami

Imagine que tu veux partager tes recettes de pâtisserie avec ton frère.

## 📤 Étape 1 : Exporter la branche

1. Va sur le nœud "🍰 Recettes de pâtisserie"
2. Clique sur **⬇️ Export branche**
3. Un fichier JSON est téléchargé : \`deepmemo-branch-Recettes-[timestamp].json\`
4. Envoie ce fichier à ton frère (email, Telegram, etc.)

## 📥 Étape 2 : Importer la branche

Ton frère ouvre son DeepMemo et :
1. Crée un nœud "Recettes reçues" (ou n'importe quel nom)
2. Va sur ce nœud
3. Clique sur **⬆️ Import branche**
4. Sélectionne le fichier JSON que tu lui as envoyé

## ✅ Résultat

Ton frère a maintenant :
- Un nœud "Recettes reçues"
- Avec tous **tes enfants** (Cookies, Gâteaux, etc.) dedans
- Tous les **tags** préservés
- Tous les **symlinks internes** fonctionnels

**Et toi** :
- Tu gardes tes recettes intactes
- Aucune modification de tes données

## 🔄 Collaboration itérative

Si tu modifies une recette, tu peux :
1. Ré-exporter la branche
2. Renvoyer le nouveau fichier JSON
3. Ton frère importe à nouveau (écrase l'ancienne branche ou crée une nouvelle)

---

**Astuce** : C'est comme échanger des fichiers, mais pour des **arbres entiers de données** !`,
        children: [],
        parent: ids.export,
        tags: ["exemple", "collaboration", "partage"],
        links: [],
        backlinks: [],
        created: now + 17,
        modified: now + 17
      },

      // Fonctionnalité : Raccourcis clavier
      [ids.keyboard]: {
        id: ids.keyboard,
        type: "node",
        title: "⌨️ Raccourcis clavier",
        content: `# Raccourcis clavier : Navigation rapide

DeepMemo est **optimisé pour le clavier**. Voici les principaux raccourcis.

## 🚀 Navigation

- **Alt+N** : Créer un nouveau nœud enfant
- **Alt+E** : Focus dans l'éditeur de contenu
- **Alt+V** : Toggle entre mode View (lecture) et Edit (édition)
- **Ctrl+K** : Ouvrir la recherche globale
- **Escape** : Remonter au parent du nœud actuel

## 🌳 Arborescence

- **↑** : Sélectionner le nœud précédent
- **↓** : Sélectionner le nœud suivant
- **→** : Déplier le nœud sélectionné
- **←** : Replier le nœud sélectionné (ou remonter au parent si déjà replié)
- **Entrée** : Afficher le nœud sélectionné

## 🎯 Pourquoi utiliser les raccourcis ?

**Rapidité** :
- Pas besoin de déplacer la souris
- Navigation fluide entre les nœuds
- Édition sans friction

**Efficacité** :
- Tu te concentres sur le **contenu**, pas sur l'interface
- Workflow plus rapide
- Moins de fatigue visuelle

---

**Astuce** : Les raccourcis sont affichés en permanence dans le **panneau droit** pour t'y habituer progressivement.`,
        children: [],
        parent: ids.features,
        tags: ["raccourcis", "productivité"],
        links: [],
        backlinks: [],
        created: now + 18,
        modified: now + 18
      },

      // 🔮 Idées pour la suite
      [ids.future]: {
        id: ids.future,
        type: "node",
        title: "🔮 Idées pour la suite",
        content: `# Ce qui pourrait arriver dans le futur

DeepMemo a **plein d'idées** pour devenir encore plus puissant.

## 🎯 Nœuds actifs (Types personnalisés)

Imagine des nœuds qui **calculent** automatiquement :
- Un nœud "Budget" qui additionne revenus et dépenses
- Un nœud "Recette" qui génère une liste de courses
- Un nœud "Projet" qui affiche l'avancement en %

## 🔔 Triggers (Actions automatiques)

Un nœud peut **déclencher** des actions sur d'autres nœuds :
- Ajouter une recette → Mettre à jour la liste de courses
- Terminer une tâche → Notifier le projet parent
- Budget dépassé → Créer une alerte

## 👥 Multi-utilisateur (Collaboration)

Partager des branches avec **permissions** :
- Lecture seule
- Édition limitée
- Admin complet
- Comme un système de fichiers (chmod-style)

---

**Explore les sous-nœuds** pour comprendre ces concepts avec des exemples.`,
        children: [ids.activeNodes, ids.triggers, ids.multiUser],
        parent: ids.root,
        tags: ["futur", "idées"],
        links: [],
        backlinks: [],
        created: now + 19,
        modified: now + 19
      },

      // Futur : Nœuds actifs
      [ids.activeNodes]: {
        id: ids.activeNodes,
        type: "node",
        title: "🎯 Nœuds actifs (Types personnalisés)",
        content: `# Nœuds actifs : Des données qui se comportent

## 💡 L'idée principale

Au lieu que tous les nœuds soient "passifs" (juste du texte), certains pourraient avoir des **comportements**.

**Le concept clé** : Les **types eux-mêmes sont des nœuds** !

## 🧩 Comment ça marcherait ?

### Les types sont des nœuds descripteurs

Un nœud spécial (appelé "nœud descripteur") peut **définir un type** :
- Son **schéma de données** : "Ce type contient quels champs ?"
- Ses **scripts** : "Que fait ce type quand on le sauvegarde ?"
- Ses **actions** : "Quels boutons afficher ?"
- Son **affichage** : "Comment le rendre visuellement ?"

**Exemple** : Tu créerais un nœud "🎨 Type: Budget" qui décrit :
\`\`\`javascript
Schéma :
  - revenus (nombre)
  - dépenses (nombre)
  - solde (calculé automatiquement)

Scripts :
  - onSave: "solde = revenus - dépenses"
  - onAlert: "si solde < 0, ajouter tag 'alerte'"

Affichage :
  - Vue graphique avec barres de progression
\`\`\`

### Utiliser un type

Quand tu crées un nœud normal, tu lui dis "utilise le Type: Budget" :
- Le nœud **hérite** des comportements du type
- Il **calcule** automatiquement (grâce aux scripts du type)
- Il **s'affiche** différemment (grâce à la vue du type)

## 📚 Bibliothèque de types

Les types disponibles dépendent de **tes permissions** (multi-utilisateur) :

**Types personnels** :
- Créés par toi
- Accessibles uniquement à toi

**Types partagés (groupe)** :
- Créés par ton équipe/famille
- Accessibles à tous les membres

**Types publics (communauté)** :
- Créés par la communauté
- Disponibles pour tous

**Avantage** : Tu **choisis** les types que tu veux utiliser dans une bibliothèque, comme des plugins.

## 🛠️ Créer un type personnalisé

Tu pourrais créer un nœud descripteur avec :
- Un **schéma** (définir les champs)
- Des **scripts** (JavaScript)
- Des **vues** personnalisées
- Des **actions** disponibles

**C'est de la programmation visuelle** : tu décris le comportement dans un nœud, DeepMemo l'exécute.

---

**Exemple concret ci-dessous** 👇`,
        children: [ids.activeNodesExample],
        parent: ids.future,
        tags: ["futur", "nœuds-actifs", "types"],
        links: [],
        backlinks: [],
        created: now + 20,
        modified: now + 20
      },

      // Exemple : Nœuds actifs
      [ids.activeNodesExample]: {
        id: ids.activeNodesExample,
        type: "node",
        title: "Exemple : Budget automatique",
        content: `# Exemple : Un nœud "Budget" qui calcule

Imagine un nœud de type **Budget** qui calcule automatiquement.

## 💰 Données

\`\`\`
Revenus : 3000€
Dépenses : 2700€
\`\`\`

## 🧮 Calcul automatique

Le nœud calculerait tout seul :
\`\`\`
Solde = 3000 - 2700 = 300€
\`\`\`

## 🎨 Affichage personnalisé

Au lieu de texte brut, tu verrais :
- Une barre de progression (Dépenses / Revenus)
- Le solde en vert si positif, rouge si négatif
- Un graphique de l'évolution

## 🔔 Alertes automatiques

Si Dépenses > 90% des Revenus :
- Le nœud s'ajoute automatiquement le tag **alerte**
- Une notification s'affiche : "⚠️ Budget presque épuisé"

## ✅ Avantages

- **Moins d'erreurs** : Pas de calcul manuel
- **Toujours à jour** : Recalcul automatique
- **Visuellement clair** : Pas besoin de lire du texte
- **Actions automatiques** : Tags, alertes, etc.

---

**C'est de la programmation sans code** : tu définis des comportements, DeepMemo les exécute.`,
        children: [],
        parent: ids.activeNodes,
        tags: ["exemple", "budget", "automatisation"],
        links: [],
        backlinks: [],
        created: now + 21,
        modified: now + 21
      },

      // Futur : Triggers
      [ids.triggers]: {
        id: ids.triggers,
        type: "node",
        title: "🔔 Triggers (Workflows & Automatisations)",
        content: `# Triggers : Déclencher des actions sur d'autres nœuds

## 💡 L'idée principale

Un nœud pourrait **déclencher** des actions sur **un ou plusieurs autres nœuds**, même s'ils ne sont pas ses enfants.

**Points clés** :
- Une action peut trigger **plusieurs nœuds** (workflows)
- Les actions peuvent être déclenchées **depuis l'extérieur** (API)

## 🧩 Comment ça marcherait ?

### 1. Trigger depuis l'interface

**Exemple** : Tu as une recette et une liste de courses.

Quand tu cliques sur "Ajouter aux courses" sur la recette :
1. La recette **lit** ses ingrédients (enfants)
2. Elle **envoie** ces ingrédients à **plusieurs destinations** :
   - Liste de courses (ajout des items)
   - Budget mensuel (calcul du coût estimé)
   - Calendrier (ajoute "Faire les courses" pour demain)

**Résultat** : Une seule action → plusieurs nœuds mis à jour !

### 2. Trigger depuis l'extérieur (API)

DeepMemo pourrait exposer une **API** pour déclencher des actions :

**Exemple** : Automatisation avec un assistant vocal
\`\`\`javascript
// Requête HTTP vers DeepMemo
POST /api/trigger
{
  "nodeId": "ma-liste-courses",
  "action": "addItem",
  "data": {
    "nom": "Lait",
    "quantité": "1L"
  }
}
\`\`\`

**Cas d'usage** :
- **Assistant vocal** : "Alexa, ajoute du lait à ma liste de courses"
- **Zapier/IFTTT** : "Quand je reçois un email avec #recette, l'ajouter à DeepMemo"
- **Home Assistant** : "Quand le frigo est vide, ajouter à la liste de courses"
- **Webhook** : "Quand un client paie, créer une facture dans DeepMemo"

## 🎯 Workflows complexes

Une action peut déclencher une **cascade** :

**Exemple** : "Planifier un repas"
1. Clic sur "Planifier" sur une recette
2. **Trigger 1** : Ajouter ingrédients à la liste de courses
3. **Trigger 2** : Créer une tâche "Faire les courses" dans le planning
4. **Trigger 3** : Calculer le budget de la semaine (somme des recettes planifiées)
5. **Trigger 4** : Envoyer une notification si budget > limite

**Résultat** : Un seul clic → 4 nœuds mis à jour automatiquement !

## 🔗 Communication entre nœuds

Les nœuds pourraient :
- **Envoyer des messages** : "Ajoute ces items", "Calcule le total"
- **Réagir à des événements** : "Quand je reçois un message, faire X"
- **Se coordonner** : "Ce nœud dépend de cet autre"
- **Déclencher en cascade** : "Si A alors B, puis C, puis D"

## 🌐 API pour automatisations

L'API permettrait :
- **Lecture** : Lire le contenu d'un nœud
- **Écriture** : Modifier un nœud
- **Actions** : Déclencher une action spécifique
- **Webhooks** : DeepMemo peut notifier d'autres services

**Avantage** : DeepMemo devient un **hub central** pour tes données personnelles, contrôlable depuis n'importe où.

---

**Exemple concret ci-dessous** 👇`,
        children: [ids.triggersExample],
        parent: ids.future,
        tags: ["futur", "triggers", "automatisation"],
        links: [],
        backlinks: [],
        created: now + 22,
        modified: now + 22
      },

      // Exemple : Triggers
      [ids.triggersExample]: {
        id: ids.triggersExample,
        type: "node",
        title: "Exemple : Recette → Liste de courses",
        content: `# Exemple : Recette qui génère une liste de courses

Imagine que tu planifies tes repas de la semaine.

## 🗂️ Structure

\`\`\`
📋 Mes listes
└── 🛒 Liste de courses de la semaine

🍰 Recettes
├── 🍪 Cookies au chocolat
│   ├── Farine (200g)
│   ├── Sucre (90g)
│   └── Chocolat (100g)
└── 🥗 Salade César
    ├── Salade romaine
    ├── Parmesan
    └── Croûtons
\`\`\`

## ⚡ Action déclenchée

Tu vas sur "🍪 Cookies au chocolat" et cliques sur **"Ajouter aux courses"**.

**Ce qui se passe** :
1. Le nœud Recette **collecte** ses enfants (ingrédients)
2. Il **trigger** la liste de courses avec ces données
3. La liste de courses **reçoit** le message
4. Elle **ajoute** automatiquement :
   - Farine : 200g
   - Sucre : 90g
   - Chocolat : 100g

## 🎁 Bonus : Fusion intelligente

Si tu ajoutes **deux recettes** qui utilisent du sucre :
- Cookies : 90g de sucre
- Gâteau : 150g de sucre

La liste de courses **fusionne** automatiquement :
- Sucre : **240g** (au lieu de deux lignes séparées)

## ✅ Avantages

- **Rapidité** : Plus besoin de copier-coller
- **Fiabilité** : Pas d'oubli d'ingrédient
- **Intelligence** : Fusion automatique des quantités
- **Contexte** : Tu sais que le sucre vient de 2 recettes

---

**C'est de l'automatisation intelligente** : les nœuds se parlent et collaborent.`,
        children: [],
        parent: ids.triggers,
        tags: ["exemple", "recette", "automatisation"],
        links: [],
        backlinks: [],
        created: now + 23,
        modified: now + 23
      },

      // Futur : Multi-utilisateur
      [ids.multiUser]: {
        id: ids.multiUser,
        type: "node",
        title: "👥 Multi-utilisateur",
        content: `# Multi-utilisateur : Collaborer avec permissions

## 💡 L'idée

Partager des branches avec **contrôle précis** des permissions.

## 🔐 Système de permissions

Inspiré du système de fichiers Unix (chmod) :
- **Lecture (r)** : Voir le nœud et ses enfants
- **Écriture (w)** : Modifier le contenu
- **Exécution (x)** : Déclencher des actions (scripts, triggers)

**Niveaux** :
- **Propriétaire** : Toi (contrôle total)
- **Groupe** : Un groupe d'utilisateurs (ex: famille, équipe)
- **Autres** : Tout le monde

## 🧩 Cas d'usage

### 1. Recettes familiales

- **Toi** : Lecture + Écriture + Exécution
- **Famille** : Lecture + Écriture (peuvent ajouter des recettes)
- **Amis** : Lecture uniquement (peuvent consulter)

### 2. Projet d'équipe

- **Chef de projet** : Contrôle total
- **Développeurs** : Écriture sur "Code", Lecture sur "Roadmap"
- **Clients** : Lecture uniquement sur "Documentation"

### 3. Notes de cours

- **Toi** : Écriture complète
- **Groupe d'étude** : Lecture + Ajout de questions
- **Public** : Lecture uniquement

## 🔄 Synchronisation

Les modifications seraient **synchronisées** en temps réel :
- Comme Google Docs
- Voir les curseurs des autres utilisateurs
- Résolution automatique des conflits

---

**Exemple concret ci-dessous** 👇`,
        children: [ids.multiUserExample],
        parent: ids.future,
        tags: ["futur", "collaboration", "permissions"],
        links: [],
        backlinks: [],
        created: now + 24,
        modified: now + 24
      },

      // Exemple : Multi-utilisateur
      [ids.multiUserExample]: {
        id: ids.multiUserExample,
        type: "node",
        title: "Exemple : Projet d'équipe",
        content: `# Exemple : Gérer un projet avec une équipe

Imagine que tu gères un projet de développement web avec une équipe.

## 🗂️ Structure

\`\`\`
🌐 Projet Site Web
├── 📋 Roadmap (lecture seule pour développeurs)
├── 💻 Code (écriture pour développeurs)
├── 🐛 Bugs (écriture pour testeurs)
├── 📊 Statistiques (lecture seule pour clients)
└── 💰 Budget (lecture uniquement pour toi)
\`\`\`

## 🔐 Permissions par branche

### Roadmap

- **Toi** : rwx (Écriture + planification)
- **Développeurs** : r-- (Consultation uniquement)
- **Clients** : r-- (Suivi de l'avancement)

### Code

- **Toi** : rwx
- **Développeurs** : rw- (Peuvent modifier)
- **Clients** : --- (Pas d'accès)

### Bugs

- **Toi** : rwx
- **Développeurs** : rw- (Peuvent corriger)
- **Testeurs** : rw- (Peuvent signaler)
- **Clients** : r-- (Peuvent voir l'état)

### Budget

- **Toi** : rwx
- **Tous** : --- (Privé)

## 🔄 Collaboration en temps réel

Quand un développeur modifie du code :
- Tu **vois** sa modification en direct
- Pas de conflit (merge automatique)
- Historique préservé (qui a fait quoi)

## ✅ Avantages

- **Contrôle précis** : Chacun voit ce qu'il doit voir
- **Collaboration fluide** : Pas besoin d'envoyer des fichiers
- **Traçabilité** : Historique complet des modifications
- **Flexibilité** : Permissions ajustables à tout moment

---

**C'est un système de fichiers intelligent** : chacun travaille sur sa partie, tout reste synchronisé.`,
        children: [],
        parent: ids.multiUser,
        tags: ["exemple", "équipe", "collaboration"],
        links: [],
        backlinks: [],
        created: now + 25,
        modified: now + 25
      },

      // 🚀 Premiers pas
      [ids.firstSteps]: {
        id: ids.firstSteps,
        type: "node",
        title: "🚀 Premiers pas",
        content: `# Prêt à essayer DeepMemo ?

Maintenant que tu as exploré les fonctionnalités, il est temps de **t'approprier l'outil** !

## ✨ Suggestions pour démarrer

### 1. Crée ton premier nœud

- Appuie sur **Alt+N** (ou clique sur "Nouveau nœud")
- Donne-lui un titre : "Mes projets", "Notes", "Idées"...
- Écris quelque chose dedans
- Sauvegarde (automatique !)

### 2. Navigue dans l'arbre

- Utilise **↑↓** pour monter/descendre
- Utilise **→** pour déplier un nœud
- Utilise **Entrée** pour afficher un nœud
- Regarde comment l'arbre se **replie automatiquement**

### 3. Ajoute des tags

- Édite un nœud (mode Edit)
- Ajoute des tags (ex: "important", "idée", "travail")
- Regarde l'**auto-complétion** en action
- Vérifie le **tag cloud** dans le panneau droit

### 4. Essaie la recherche

- Appuie sur **Ctrl+K**
- Tape un mot-clé
- Regarde les résultats en temps réel
- Navigue avec les flèches et appuie sur Entrée

### 5. Crée une hiérarchie

- Crée un nœud parent : "Projets"
- Crée des enfants : "Projet A", "Projet B"
- Crée des petits-enfants : "Tâche 1", "Tâche 2"
- Navigue dans l'arborescence

### 6. Exporte tes données

- Va dans la sidebar gauche
- Clique sur **Exporter**
- Télécharge le fichier JSON
- **Garde-le précieusement** (c'est ta sauvegarde !)

## 🗑️ Supprimer ce contenu de démo

Quand tu seras à l'aise avec DeepMemo, tu pourras **supprimer** ce nœud "Bienvenue" et tous ses enfants :
1. Va sur ce nœud
2. Clique sur **Actions**
3. Choisis **Supprimer**
4. Confirme

**Pas de panique** : Tes propres nœuds restent intacts !

## 💡 Besoin d'aide ?

- Relis les nœuds de ce guide
- Consulte la documentation (si disponible)
- Expérimente : tu ne peux rien casser ! (et tu as l'export de secours 😉)

---

**Amuse-toi bien avec DeepMemo !** 🎉`,
        children: [],
        parent: ids.root,
        tags: ["guide", "démarrage"],
        links: [],
        backlinks: [],
        created: now + 26,
        modified: now + 26
      }
    },
    rootNodes: [ids.root]
  };
}
