/**
 * default-data.js
 *
 * Contenu de démonstration par défaut pour les nouveaux utilisateurs.
 * Ce contenu sert à la fois de présentation et de tutoriel interactif.
 *
 * Disponible en français et anglais selon la langue active.
 */

import { getCurrentLanguage } from '../utils/i18n.js';

/**
 * Get default demo data in the appropriate language
 */
export function getDefaultData() {
  const currentLang = getCurrentLanguage();

  if (currentLang === 'en') {
    return getDefaultDataEN();
  } else {
    return getDefaultDataFR();
  }
}

/**
 * French demo content
 */
function getDefaultDataFR() {
  const now = Date.now();

  // Générer des IDs uniques pour chaque nœud
  const ids = {
    root: `node_${now}_welcome`,
    privacy: `node_${now + 1}_privacy`,
    whyHierarchy: `node_${now + 2}_why_hierarchy`,
    interface: `node_${now + 3}_interface`,
    tree: `node_${now + 4}_tree`,
    center: `node_${now + 5}_center`,
    right: `node_${now + 6}_right`,
    features: `node_${now + 7}_features`,
    nodes: `node_${now + 8}_nodes`,
    nodesExample1: `node_${now + 9}_nodes_ex1`,
    nodesExample2: `node_${now + 10}_nodes_ex2`,
    symlinks: `node_${now + 11}_symlinks`,
    symlinksExample: `node_${now + 12}_symlinks_ex`,
    tags: `node_${now + 13}_tags`,
    tagsExample: `node_${now + 14}_tags_ex`,
    branch: `node_${now + 15}_branch`,
    branchExample: `node_${now + 16}_branch_ex`,
    export: `node_${now + 17}_export`,
    exportExample: `node_${now + 18}_export_ex`,
    keyboard: `node_${now + 19}_keyboard`,
    future: `node_${now + 20}_future`,
    activeNodes: `node_${now + 21}_active_nodes`,
    activeNodesExample: `node_${now + 22}_active_nodes_ex`,
    triggers: `node_${now + 23}_triggers`,
    triggersExample: `node_${now + 24}_triggers_ex`,
    triggersVoiceExample: `node_${now + 25}_triggers_voice_ex`,
    multiUser: `node_${now + 26}_multi_user`,
    multiUserExample: `node_${now + 27}_multi_user_ex`,
    attachments: `node_${now + 28}_attachments`,
    attachmentsExample: `node_${now + 29}_attachments_ex`,
    firstSteps: `node_${now + 30}_first_steps`,
  };

  return {
    nodes: {
      // Nœud racine : Bienvenue
      [ids.root]: {
        id: ids.root,
        type: "node",
        title: "📘 Bienvenue dans DeepMemo",
        content: `# Bienvenue dans DeepMemo ! 👋

DeepMemo est un outil de prise de notes qui crée un **réseau hiérarchique** de connaissances, **flexible** et **puissant**.

## 🎯 À quoi ça sert ?

- **Organiser tes idées** en arborescence infinie
- **Lier des informations** entre elles (symlinks, tags)
- **Attacher des fichiers** (images, PDFs, documents)
- **Retrouver rapidement** ce que tu cherches
- **Exporter et importer** des branches (collaboration locale)
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
        children: [ids.privacy, ids.whyHierarchy, ids.interface, ids.features, ids.future, ids.firstSteps],
        parent: null,
        tags: ["bienvenue", "guide"],
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
        created: now + 1,
        modified: now + 1
      },

      // 🧠 Pourquoi une structure en arbre ?
      [ids.whyHierarchy]: {
        id: ids.whyHierarchy,
        type: "node",
        title: "🧠 Pourquoi une structure en arbre ?",
        content: `# Comment pense ton cerveau ?

DeepMemo n'est pas qu'un outil de prise de notes—c'est un **reflet de comment ton esprit fonctionne naturellement**.

## 🌳 Les arbres et réseaux sont partout

Regarde autour de toi : **les structures hiérarchiques sont omniprésentes**.

- **Ton cerveau** → Neurones organisés en dendrites arborescentes et synapses en réseau
- **Le langage** → Phrases structurées en arbres syntaxiques (sujet, verbe, complément...)
- **L'évolution** → Arbre buissonnant des espèces (avec des croisements, pas juste des branches)
- **Les cartes mentales** → Concept central qui se ramifie en sous-idées
- **Même la musique** → Rythmes divisés hiérarchiquement (mesures → temps → divisions)

## 💡 Pourquoi c'est important ?

**Ton cerveau est câblé comme ça.** Quand tu te souviens de quelque chose, tu ne cherches pas dans une liste linéaire—tu **sautes d'une association à l'autre** dans un réseau de connexions.

DeepMemo embrasse cette réalité :
- ✅ **Hiérarchie** pour l'organisation (comme tes dossiers)
- ✅ **Liens symboliques** pour les connexions croisées (comme ton esprit)
- ✅ **Tags** pour les associations flexibles

## 🗺️ Visualiser ta structure : les mindmaps

DeepMemo te permet d'**exporter ta structure** en mindmap pour la visualiser et la partager :

- **Format SVG** (Mermaid) : Diagramme visuel, idéal pour documentation
- **Format .mm** (FreeMind) : Éditable dans Freeplane, XMind, FreeMind

**Exemple** : Voici à quoi ressemble ce contenu de démo en mindmap SVG :

![Mindmap de DeepMemo](attachment:demo_mindmap_svg)

*(Cette image est un fichier joint—tu peux faire pareil avec tes propres images !)*

## 📚 Pour aller plus loin

Voir le document complet sur GitHub : [docs/HIERARCHICAL_STRUCTURES.fr.md](https://github.com/parksto/DeepMemo/blob/main/docs/HIERARCHICAL_STRUCTURES.fr.md)

---

**En bref** : DeepMemo travaille **avec** ton cerveau, pas contre lui.`,
        children: [],
        parent: ids.root,
        tags: ["concept", "cognition", "philosophie"],
        attachments: [],
        created: now + 2,
        modified: now + 2
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
- Les **fichiers attachés** (images, PDFs, documents)
- Les **boutons d'action** (Nouveau, Actions, Export/Import de branche)

## 🏷️ Panneau droit : Tags et infos

Affiche des informations contextuelles.

**Ce que tu y trouves** :
- Les **tags** du nœud actuel
- Le **tag cloud** de la branche (tous les tags avec compteurs)
- L'**indicateur de stockage** (espace utilisé par les fichiers)
- Les **raccourcis clavier**

---

**Explore les sous-nœuds** pour plus de détails sur chaque panneau.`,
        children: [ids.tree, ids.center, ids.right],
        parent: ids.root,
        tags: ["interface", "guide"],
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

**Passer en mode édition** :
- Clic sur le bouton **[Éditer]**
- Raccourci clavier : **Alt+E** (focus automatique dans l'éditeur)

## ✍️ Le Markdown : optionnel et accessible

**Tu n'es pas obligé d'utiliser Markdown** : écris simplement du texte brut si tu préfères !

Le Markdown ajoute du **formatage** (titres, listes, liens, images) mais reste **100% lisible en mode texte**.

**Besoin d'aide ?** Appuie sur **Alt+H** pour afficher le **guide Markdown** avec tous les exemples de syntaxe.

## 🧩 Sections

### En haut
- **Breadcrumb** : Le chemin vers le nœud actuel (ex: ".../parent/actuel")
- **Bouton 🏠** : Retour au premier nœud racine

### Au milieu
- **Titre** du nœud
- **Contenu** (Markdown ou texte brut)
- **Tags** du nœud

### En bas
- **Fichiers attachés** : Liste des fichiers joints au nœud (📎 Ajouter un fichier)
- **Boutons d'action** : Nouveau nœud, Actions, Export/Import de branche
- **Cartes des enfants** : Cliquables pour naviguer

---

**Astuce** : Double-clique sur le titre pour le modifier !`,
        children: [],
        parent: ids.interface,
        tags: ["édition", "contenu"],
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

## 📊 Indicateur de stockage

Affiche l'**espace utilisé** par les fichiers attachés.

**Informations** :
- Taille utilisée / Limite estimée (~500 MB)
- Nombre de fichiers attachés
- Barre de progression visuelle

**Actions** :
- **🧹 Nettoyer les fichiers orphelins** : Supprime les fichiers non référencés

## ⌨️ Raccourcis clavier

Un rappel des **raccourcis** disponibles :
- **Alt+N** : Nouveau nœud
- **Alt+E** : Passer en édition
- **Ctrl+K** : Recherche
- Et bien d'autres !

---

**Astuce** : Le panneau droit est **pliable** (clic sur le bouton en haut à droite).`,
        children: [],
        parent: ids.interface,
        tags: ["tags", "raccourcis"],
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

## 📎 Fichiers joints
Attache des images, PDFs, documents à tes nœuds.

## ⬇️ Export/Import
Sauvegarde et partage tes données : .dm (archive), .json, FreeMind, Mermaid, PDF.

## ⌨️ Raccourcis clavier
Navigue rapidement sans utiliser la souris.

---

**Explore les sous-nœuds** pour découvrir chaque fonctionnalité en détail avec des exemples concrets.`,
        children: [ids.nodes, ids.symlinks, ids.tags, ids.branch, ids.attachments, ids.export, ids.keyboard],
        parent: ids.root,
        tags: ["fonctionnalités", "guide"],
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

Les symlinks transforment l'arbre simple en **structure arborescente réticulée** : l'arborescence de base reste hiérarchique, mais les symlinks créent des liens transversaux qui forment un réseau maillé.

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
- Créer des "espaces de travail" thématiques
- Bookmarker une branche spécifique pour y revenir rapidement

**Comment ça fonctionne** :
1. Clique sur l'icône **🌳** (Mode branche) sur un nœud
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

## 🔖 URL bookmarkable

Le mode branche génère une **URL que tu peux bookmarker** :
- Sauvegarde cette URL dans tes favoris
- Reviens directement à cette vue isolée
- Organise ton travail par contexte

⚠️ **Important** : L'URL ne contient **pas les données**, seulement la vue. Pour partager des données avec quelqu'un, utilise **Export branche** (⬇️)

---

**Exemple concret ci-dessous** 👇`,
        children: [ids.branchExample],
        parent: ids.features,
        tags: ["branche", "isolation"],
        created: now + 14,
        modified: now + 14
      },

      // Exemple : Mode branche
      [ids.branchExample]: {
        id: ids.branchExample,
        type: "node",
        title: "Exemple : Travailler sur une branche isolée",
        content: `# Exemple : Se concentrer sur les recettes uniquement

Imagine que tu as une branche "Recettes" noyée dans ton arbre complet.

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

## 🌳 Mode branche : Isoler la vue

Tu veux **te concentrer uniquement** sur les recettes, sans distraction.

**Action** :
1. Va sur le nœud "🍰 Recettes"
2. Clique sur l'icône **🌳** (Mode branche)
3. L'URL devient : \`?branch=node_recettes#/node/node_recettes\`
4. **Bookmark cette URL** pour y revenir facilement

**Résultat** :
- Tu vois **uniquement** la branche "Recettes"
- Pas de "Projets" ni "Notes" dans l'arbre
- Navigation limitée à cette sous-arborescence
- Expérience **propre et ciblée**

⚠️ **Important** : L'URL ne contient **pas les données**, juste la vue ! C'est pour toi, sur ton appareil.

## 📤 Partager avec quelqu'un d'autre

Pour **vraiment partager les données** avec un ami :
1. Va sur "🍰 Recettes"
2. Clique sur **⬇️ Export branche**
3. Envoie le fichier ZIP à ton ami (inclut les recettes + photos !)
4. Il peut **l'importer** dans son DeepMemo (⬆️ Import branche)

**Différence** :
- **URL** = Vue isolée (pour toi, sur ton appareil)
- **Export ZIP** = Partage de données (pour quelqu'un d'autre)

---

**Astuce** : Le mode branche est parfait pour **organiser ton travail** par contexte.`,
        children: [],
        parent: ids.branch,
        tags: ["exemple", "partage", "collaboration"],
        created: now + 15,
        modified: now + 15
      },

      // Fonctionnalité : Export/Import
      [ids.export]: {
        id: ids.export,
        type: "node",
        title: "⬇️ Export / Import",
        content: `# Export et Import : Sauvegarde et partage

DeepMemo propose **deux types d'export/import** (global ou branche), chacun disponible dans **3 formats différents** !

## 💾 Deux types d'export/import

### 1. Export/Import **global**

**Boutons** : Dans la sidebar gauche

**Ce qui est exporté** :
- **Tout** l'arbre (tous les nœuds racines)
- **Toutes** les données (contenu, tags, relations)
- **Tous les fichiers attachés** (images, PDFs, documents)

**Format** : Fichier ZIP contenant \`data.json\` + dossier \`attachments/\`

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
- **Les fichiers attachés** de tous les nœuds de la branche

**Format** : Fichier ZIP contenant \`data.json\` + dossier \`attachments/\`

**Utilité** :
- Partager une branche spécifique (ex: recettes avec photos)
- Collaborer sans tout partager
- Réutiliser une structure ailleurs

✅ **Bonus** : L'import de branche est **non-destructif** :
- Les IDs sont régénérés automatiquement (nœuds + fichiers)
- Pas de conflit avec les nœuds existants
- La branche est **fusionnée** comme enfants du nœud actuel

## 🗺️ Export mindmap (nouveau !)

En plus du ZIP, tu peux exporter en **mindmap** pour visualiser et éditer ta structure :

### **📊 Mermaid SVG** : Diagramme visuel

- Export en image SVG vectorielle
- Idéal pour documentation, présentations
- Fonctionne hors ligne (Mermaid.js précaché)

### **🧠 FreeMind .mm** : Éditable

- Format XML standard des mindmaps
- **Éditable** dans Freeplane, XMind, FreeMind
- Les symlinks deviennent des flèches orange

**Exemple** : Voici le contenu de démo ouvert dans Freeplane :

![Export FreeMind dans Freeplane](attachment:demo_freeplane_screenshot)

*(Capture d'écran en fichier joint—démonstration concrète des attachments !)*

## 📄 Export PDF : Document imprimable

**Nouveau** : Export de branches en **PDF** pour impression ou archivage :

**Fonctionnement** :
- Génération en ligne via CloudFlare Worker (ou CLI offline avec Node.js)
- Symlinks résolus automatiquement avec leur contenu
- Images inline (attachments convertis en base64)
- Table des matières hiérarchique
- Rate limiting (5 PDFs/heure, 20/jour) pour éviter les abus

**Utilité** :
- Documentation imprimable
- Archivage long terme (format universel)
- Partage avec personnes non-techniques

**Confidentialité** :
- IP hashée (SHA-256) côté serveur pour le rate limiting
- Données non conservées après génération
- Alternative CLI 100% offline disponible (\`bin/branch2pdf.js\`)

---

**Exemple concret ci-dessous** 👇`,
        children: [ids.exportExample],
        parent: ids.features,
        tags: ["export", "import", "sauvegarde"],
        attachments: [],
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
3. Un fichier ZIP est téléchargé : \`deepmemo-branch-Recettes-[timestamp].zip\`
4. Envoie ce fichier à ton frère (email, Telegram, etc.)

**Contenu du ZIP** :
- \`data.json\` : Tous les nœuds de la branche
- \`attachments/\` : Toutes les **photos de recettes** attachées

## 📥 Étape 2 : Importer la branche

Ton frère ouvre son DeepMemo et :
1. Crée un nœud "Recettes reçues" (ou n'importe quel nom)
2. Va sur ce nœud
3. Clique sur **⬆️ Import branche**
4. Sélectionne le fichier ZIP que tu lui as envoyé

## ✅ Résultat

Ton frère a maintenant :
- Un nœud "Recettes reçues"
- Avec tous **tes enfants** (Cookies, Gâteaux, etc.) dedans
- Tous les **tags** préservés
- Tous les **symlinks internes** fonctionnels
- Toutes les **photos de recettes** attachées

**Et toi** :
- Tu gardes tes recettes intactes
- Aucune modification de tes données

## 🔄 Collaboration itérative

Si tu modifies une recette, tu peux :
1. Ré-exporter la branche
2. Renvoyer le nouveau fichier ZIP
3. Ton frère importe à nouveau (écrase l'ancienne branche ou crée une nouvelle)

---

**Astuce** : C'est comme échanger des fichiers, mais pour des **arbres entiers de données** !`,
        children: [],
        parent: ids.export,
        tags: ["exemple", "collaboration", "partage"],
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
- **Alt+E** : Passer en mode édition (avec focus automatique dans l'éditeur)
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
        created: now + 18,
        modified: now + 18
      },

      // Fonctionnalité : Fichiers joints
      [ids.attachments]: {
        id: ids.attachments,
        type: "node",
        title: "📎 Fichiers joints",
        content: `# Attache des fichiers à tes nœuds

DeepMemo te permet d'**attacher des fichiers** (images, PDFs, documents, etc.) à n'importe quel nœud.

## 📤 Uploader un fichier

**Comment faire** :
1. Sélectionne un nœud
2. Scroll en bas du panneau central
3. Clic sur **📎 Ajouter un fichier**
4. Choisis le fichier à uploader (max 50 MB)

**Fichiers supportés** :
- Images (PNG, JPG, GIF, SVG...)
- Documents (PDF, DOC, TXT...)
- Vidéos (MP4, WEBM...)
- Audio (MP3, WAV...)
- Et bien d'autres !

## 🖼️ Affichage inline

**Syntaxe markdown** :
\`\`\`markdown
![Description](attachment:attach_ID)
\`\`\`

**Pour les autres fichiers** (liens de téléchargement) :
\`\`\`markdown
[Nom du fichier](attachment:attach_ID)
\`\`\`

**Astuce** : Utilise le bouton **📋** à côté de chaque fichier pour copier la syntaxe automatiquement !

## 💾 Stockage et export

**Stockage local** :
- Les fichiers sont stockés dans **IndexedDB** (navigateur)
- Limite estimée : ~500 MB selon le navigateur
- Indicateur de stockage visible dans le panneau droit (📊 Stockage)

**Export/Import** :
- Les exports sont maintenant en **format ZIP**
- Inclut automatiquement tous les fichiers attachés
- Import restaure fichiers + données

## 🧹 Nettoyage

**Fichiers orphelins** :
Si tu supprimes un nœud avec des attachments, les fichiers peuvent rester dans le stockage.

**Solution** :
- Ouvre le panneau droit (ℹ️)
- Section **📊 Stockage**
- Clic sur **🧹 Nettoyer les fichiers orphelins**

---

**Explore le sous-nœud** pour voir un exemple concret d'utilisation d'images inline.`,
        children: [ids.attachmentsExample],
        parent: ids.features,
        tags: ["fichiers", "attachments", "images"],
        created: now + 27,
        modified: now + 27
      },

      // Exemple : Fichiers joints
      [ids.attachmentsExample]: {
        id: ids.attachmentsExample,
        type: "node",
        title: "Exemple : Fichier joint",
        content: `# Comment ça fonctionne ?

## 1️⃣ Upload

Imagine que tu viens d'uploader une **capture d'écran** de ton interface DeepMemo.

Le fichier apparaît dans la liste des **Fichiers attachés** en bas du panneau central.

## 2️⃣ Copier la syntaxe

À côté du fichier, tu vois :
- **📋** Copier syntaxe
- **⬇️** Télécharger
- **🗑️** Supprimer

Clic sur **📋** copie automatiquement :
\`\`\`markdown
![screenshot.png](attachment:attach_1735157234567_abc123)
\`\`\`

## 3️⃣ Coller dans le contenu

Tu colles cette syntaxe dans le **contenu du nœud**.

Quand tu passes en **mode Affichage** (👁️), l'image s'affiche directement !

## 💡 Cas d'usage

**Documentation technique** :
- Screenshots de bugs
- Diagrammes d'architecture
- Photos de tableaux blancs

**Recettes de cuisine** :
- Photos des plats
- PDFs de livres de recettes

**Projets créatifs** :
- Moodboards (images)
- Références visuelles

---

**Tu peux tester dès maintenant** en uploadant un fichier sur ce nœud ! 🚀`,
        children: [],
        parent: ids.attachments,
        tags: ["exemple", "attachments"],
        created: now + 28,
        modified: now + 28
      },

      // 🔮 Idées pour la suite
      [ids.future]: {
        id: ids.future,
        type: "node",
        title: "🔮 Directions explorées",
        content: `# Directions explorées

DeepMemo est **un projet open-source** qui avance à son rythme, sans promesses ni calendrier.

## 👥 Collaboration & Partage

**Actuellement** : L'export/import de branches (\`.dm\`) permet déjà une collaboration de base :
- Tu exportes une branche → tu l'envoies à quelqu'un → il l'importe chez lui
- Collaboration offline, via fichiers (email, Git, USB, etc.)
- Contrôle total : chacun décide ce qu'il partage

**Explorations futures** : Des pistes de synchronisation sont à l'étude, mais rien de concret pour l'instant. L'idée serait de permettre une collaboration temps réel tout en gardant la souveraineté des données (pas de plateforme centrale).

## 🌱 Open Source

DeepMemo est sous licence **MIT**. Contributions bienvenues sur [GitHub](https://github.com/parksto/DeepMemo) :
- Code, idées, documentation
- Rapports de bugs, suggestions
- Cas d'usage réels qui aident à comprendre les besoins

Pas de pression, pas de roadmap stricte. On publie ce qu'on a quand c'est prêt.`,
        children: [ids.multiUser],
        parent: ids.root,
        tags: ["futur", "collaboration", "open-source"],
        created: now + 19,
        modified: now + 19
      },

      // Futur : Collaboration & Partage
      [ids.multiUser]: {
        id: ids.multiUser,
        type: "node",
        title: "👥 Collaboration & Partage",
        content: `# Collaboration & Partage

## 📦 Actuellement : Partage de fichiers .dm

DeepMemo permet déjà de **collaborer de manière asynchrone** grâce à l'export/import de branches :

**Workflow actuel** :
1. Tu exportes une branche en fichier \`.dm\` (archive complète avec pièces jointes)
2. Tu partages le fichier (email, cloud, USB...)
3. Ton collaborateur l'importe dans son DeepMemo
4. Il modifie, ajoute des nœuds, puis te renvoie une nouvelle version
5. Tu importes la mise à jour (fusion intelligente)

**Avantages** :
- 100% offline et décentralisé
- Aucun serveur tiers requis
- Contrôle total sur tes données
- Format ouvert et documenté

## 🔄 Explorations futures

Des **pistes de synchronisation** sont à l'étude pour permettre une collaboration en temps réel, mais le projet avance à son rythme. L'important est de garder une approche **simple, fiable et respectueuse de la vie privée**.

Pour l'instant, l'export/import fonctionne bien et répond à la plupart des besoins de collaboration.`,
        children: [],
        parent: ids.future,
        tags: ["futur", "collaboration", "décentralisation"],
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
- Télécharge le fichier ZIP
- **Garde-le précieusement** (c'est ta sauvegarde complète !)

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
        created: now + 29,
        modified: now + 29
      }
    },
    rootNodes: [ids.root]
  };
} // end getDefaultDataFR

/**
 * English demo content
 */
function getDefaultDataEN() {
  const now = Date.now();

  // Generate unique IDs for each node
  const ids = {
    root: `node_${now}_welcome`,
    privacy: `node_${now + 1}_privacy`,
    whyHierarchy: `node_${now + 2}_why_hierarchy`,
    interface: `node_${now + 3}_interface`,
    tree: `node_${now + 4}_tree`,
    center: `node_${now + 5}_center`,
    right: `node_${now + 6}_right`,
    features: `node_${now + 7}_features`,
    nodes: `node_${now + 8}_nodes`,
    nodesExample1: `node_${now + 9}_nodes_ex1`,
    nodesExample2: `node_${now + 10}_nodes_ex2`,
    symlinks: `node_${now + 11}_symlinks`,
    symlinksExample: `node_${now + 12}_symlinks_ex`,
    tags: `node_${now + 13}_tags`,
    tagsExample: `node_${now + 14}_tags_ex`,
    branch: `node_${now + 15}_branch`,
    branchExample: `node_${now + 16}_branch_ex`,
    export: `node_${now + 17}_export`,
    exportExample: `node_${now + 18}_export_ex`,
    keyboard: `node_${now + 19}_keyboard`,
    future: `node_${now + 20}_future`,
    activeNodes: `node_${now + 21}_active_nodes`,
    activeNodesExample: `node_${now + 22}_active_nodes_ex`,
    triggers: `node_${now + 23}_triggers`,
    triggersExample: `node_${now + 24}_triggers_ex`,
    triggersVoiceExample: `node_${now + 25}_triggers_voice_ex`,
    multiUser: `node_${now + 26}_multi_user`,
    multiUserExample: `node_${now + 27}_multi_user_ex`,
    attachments: `node_${now + 28}_attachments`,
    attachmentsExample: `node_${now + 29}_attachments_ex`,
    firstSteps: `node_${now + 30}_first_steps`,
  };

  return {
    nodes: {
      // Root node: Welcome
      [ids.root]: {
        id: ids.root,
        type: "node",
        title: "📘 Welcome to DeepMemo",
        content: `# Welcome to DeepMemo! 👋

DeepMemo is a note-taking tool that creates a **hierarchical network** of knowledge, **flexible** and **powerful**.

## 🎯 What is it for?

- **Organize your ideas** in an infinite tree structure
- **Link information** together (symlinks, tags)
- **Attach files** (images, PDFs, documents)
- **Find quickly** what you're looking for
- **Export and import** branches (local collaboration)
- **Stay in control**: your data stays with you

## 🧭 How to use it?

👈 **Explore the tree on the left** to discover the features.

Each node explains an aspect of DeepMemo with concrete examples.

## 🚀 Who is it for?

- Students taking class notes
- Developers documenting their projects
- Creatives organizing their ideas
- Cooks sharing recipes
- Or simply you, who want **a digital second brain**!

---

**Start by exploring the children of this node** (look just below, or in the tree on the left). 😊`,
        children: [ids.privacy, ids.whyHierarchy, ids.interface, ids.features, ids.future, ids.firstSteps],
        parent: null,
        tags: ["welcome", "guide"],
        created: now,
        modified: now
      },

      // 🔐 Your data belongs to you
      [ids.privacy]: {
        id: ids.privacy,
        type: "node",
        title: "🔐 Your data belongs to you",
        content: `# No server, no tracking

DeepMemo is a **100% local** tool. Here's what that means:

## 📦 Local storage (localStorage)

- All your data is **stored in your browser**
- No remote server
- No data collection
- No account required

## ✅ Advantages

- **Privacy**: Nobody but you sees your notes
- **Speed**: No network latency
- **Free**: No subscription, no limits
- **Offline**: Works without Internet

## ⚠️ What you need to know

- Data is **tied to this browser on this device**
- If you clear your browser cache, you lose your data
- **Solution**: Export your data regularly (see the "Export/Import" node)

## 🔮 Coming soon

In the future, DeepMemo will be able to **optionally** sync across multiple devices, but always with **your total control** over your data.

---

**In summary**: DeepMemo respects your privacy. It's your space, your rules.`,
        children: [],
        parent: ids.root,
        tags: ["privacy", "security", "local"],
        created: now + 1,
        modified: now + 1
      },

      // 🧠 Why a tree structure?
      [ids.whyHierarchy]: {
        id: ids.whyHierarchy,
        type: "node",
        title: "🧠 Why a tree structure?",
        content: `# How does your brain think?

DeepMemo isn't just a note-taking tool—it's a **reflection of how your mind naturally works**.

## 🌳 Trees and networks are everywhere

Look around you: **hierarchical structures are ubiquitous**.

- **Your brain** → Neurons organized in tree-like dendrites and networked synapses
- **Language** → Sentences structured in syntax trees (subject, verb, object...)
- **Evolution** → Bushy tree of species (with crossings, not just branches)
- **Mind maps** → Central concept branching into sub-ideas
- **Even music** → Rhythms divided hierarchically (measures → beats → subdivisions)

## 💡 Why does it matter?

**Your brain is wired this way.** When you remember something, you don't search through a linear list—you **jump from one association to another** in a network of connections.

DeepMemo embraces this reality:
- ✅ **Hierarchy** for organization (like your folders)
- ✅ **Symbolic links** for cross-connections (like your mind)
- ✅ **Tags** for flexible associations

## 🗺️ Visualize your structure: mindmaps

DeepMemo lets you **export your structure** as a mindmap to visualize and share it:

- **SVG format** (Mermaid): Visual diagram, perfect for documentation
- **.mm format** (FreeMind): Editable in Freeplane, XMind, FreeMind

**Example**: Here's what this demo content looks like as a mindmap SVG:

![DeepMemo Mindmap](attachment:demo_mindmap_svg)

*(This image is an attached file—you can do the same with your own images!)*

## 📚 To go further

See the complete document on GitHub: [docs/HIERARCHICAL_STRUCTURES.md](https://github.com/parksto/DeepMemo/blob/main/docs/HIERARCHICAL_STRUCTURES.md)

---

**In short**: DeepMemo works **with** your brain, not against it.`,
        children: [],
        parent: ids.root,
        tags: ["concept", "cognition", "philosophy"],
        attachments: [],
        created: now + 2,
        modified: now + 2
      },

      // 🧭 Discover the interface
      [ids.interface]: {
        id: ids.interface,
        type: "node",
        title: "🧭 Discover the interface",
        content: `# The interface in 3 panels

DeepMemo is organized into **3 main areas**:

## 👈 Left panel: The tree

Displays all your nodes as a tree.

**Possible actions**:
- Click on a node to display it
- Click on the triangle (▶) to expand/collapse
- Navigate with keyboard (↑↓←→ + Enter)

## 📝 Central panel: The content

Displays the currently selected node.

**What you'll find**:
- The **title** and **content** of the node
- The **children** (clickable cards at the bottom)
- The **tags**
- The **attached files** (images, PDFs, documents)
- The **action buttons** (New, Actions, Branch Export/Import)

## 🏷️ Right panel: Tags and info

Displays contextual information.

**What you'll find**:
- The **tags** of the current node
- The **tag cloud** of the branch (all tags with counters)
- The **storage indicator** (space used by files)
- The **keyboard shortcuts**

---

**Explore the sub-nodes** for more details on each panel.`,
        children: [ids.tree, ids.center, ids.right],
        parent: ids.root,
        tags: ["interface", "guide"],
        created: now + 2,
        modified: now + 2
      },

      // Sub-node: The tree
      [ids.tree]: {
        id: ids.tree,
        type: "node",
        title: "🌳 The tree (left panel)",
        content: `# The tree

This is your **navigation map**. All your nodes are organized here.

## 📂 Infinite hierarchy

- Nodes can have **children**
- Children can have **children**
- And so on, **infinitely**

## 🎯 Navigation

**With the mouse**:
- Click on the **title**: Display the node
- Click on the **triangle** (▶): Expand/collapse (without changing the displayed node)

**With the keyboard**:
- **↑↓**: Move up/down
- **→**: Expand a node
- **←**: Collapse a node (or go up to parent if already collapsed)
- **Enter**: Display the selected node

## 🎨 Auto-collapse

When you **display** a node (click on title or Enter), the tree automatically "cleans up":
- Only the **path to the current node** stays expanded
- The rest collapses to keep the tree readable

But if you **manually expand** (click on triangle or →), the state is preserved.

---

**Tip**: Use **keyboard shortcuts** to navigate quickly!`,
        children: [],
        parent: ids.interface,
        tags: ["navigation", "tree"],
        created: now + 3,
        modified: now + 3
      },

      // Sub-node: The central panel
      [ids.center]: {
        id: ids.center,
        type: "node",
        title: "📝 The central panel",
        content: `# The central panel

This is where you **read and edit** your nodes.

## 🎭 Two modes: View / Edit

- **View mode** (reading): Content is displayed as rendered Markdown
- **Edit mode** (editing): Content is displayed in an editable textarea

**Switch to edit mode**:
- Click the **[Edit]** button
- Keyboard shortcut: **Alt+E** (auto-focus in the editor)

## ✍️ Markdown: optional and accessible

**You don't have to use Markdown**: just write plain text if you prefer!

Markdown adds **formatting** (headings, lists, links, images) but remains **100% readable as plain text**.

**Need help?** Press **Alt+H** to display the **Markdown guide** with all syntax examples.

## 🧩 Sections

### At the top
- **Breadcrumb**: The path to the current node (e.g., ".../parent/current")
- **🏠 button**: Return to the first root node

### In the middle
- **Title** of the node
- **Content** (Markdown or plain text)
- **Tags** of the node

### At the bottom
- **Attached files**: List of files attached to the node (📎 Add a file)
- **Action buttons**: New node, Actions, Branch Export/Import
- **Children cards**: Clickable to navigate

---

**Tip**: Double-click on the title to edit it!`,
        children: [],
        parent: ids.interface,
        tags: ["editing", "content"],
        created: now + 4,
        modified: now + 4
      },

      // Sub-node: The right panel
      [ids.right]: {
        id: ids.right,
        type: "node",
        title: "🏷️ The right panel",
        content: `# The right panel

Displays **contextual information** about the current node and branch.

## 🏷️ Node tags

The tags attached to the currently displayed node.

## ☁️ Branch tag cloud

All tags used in the **current branch** (the current node + its descendants), with the **number of occurrences**.

**Usefulness**:
- See at a glance the themes covered
- Identify the most used tags
- Navigate by theme

## 📊 Storage indicator

Shows the **space used** by attached files.

**Information**:
- Used size / Estimated limit (~500 MB)
- Number of attached files
- Visual progress bar

**Actions**:
- **🧹 Clean orphaned files**: Removes unreferenced files

## ⌨️ Keyboard shortcuts

A reminder of available **shortcuts**:
- **Alt+N**: New node
- **Alt+E**: Switch to edit mode
- **Ctrl+K**: Search
- And many more!

---

**Tip**: The right panel is **collapsible** (click the button at the top right).`,
        children: [],
        parent: ids.interface,
        tags: ["tags", "shortcuts"],
        created: now + 5,
        modified: now + 5
      },

      // ✨ Current features
      [ids.features]: {
        id: ids.features,
        type: "node",
        title: "✨ Current features",
        content: `# What DeepMemo can already do

DeepMemo **V0.8** includes all these features:

## 📂 Nodes and hierarchy
Organize your ideas in an infinite tree.

## 🔗 Symbolic links
A single node can appear in multiple places.

## 🏷️ Tags and search
Find your notes quickly by tags or keywords.

## 🌳 Branch mode
Isolate a sub-tree to work in peace.

## 📎 Attached files
Attach images, PDFs, documents to your nodes.

## ⬇️ Export/Import
Save and share your data: .dm (archive), .json, FreeMind, Mermaid, PDF.

## ⌨️ Keyboard shortcuts
Navigate quickly without using the mouse.

---

**Explore the sub-nodes** to discover each feature in detail with concrete examples.`,
        children: [ids.nodes, ids.symlinks, ids.tags, ids.branch, ids.attachments, ids.export, ids.keyboard],
        parent: ids.root,
        tags: ["features", "guide"],
        created: now + 6,
        modified: now + 6
      },

      // Feature: Nodes and hierarchy
      [ids.nodes]: {
        id: ids.nodes,
        type: "node",
        title: "📂 Nodes and hierarchy",
        content: `# Nodes: The basic building block

Everything in DeepMemo is a **node**.

## 🧩 What is a node?

A node contains:
- A **title**
- **Content** (Markdown)
- **Tags**
- **Children** (other nodes)
- A **parent** (optional)

## 🌳 Infinite hierarchy

Nodes are organized in a **tree**:
- A node can have multiple **children**
- A child can itself have children
- And so on, **without depth limit**

## 🎯 What it allows

**Organize**:
- Projects with sub-tasks
- Class notes by chapter
- Recipes by category
- Documentation by module

**Navigate**:
- From general to specific
- Explore progressively
- Keep the context

---

**Concrete examples below** 👇`,
        children: [ids.nodesExample1, ids.nodesExample2],
        parent: ids.features,
        tags: ["nodes", "hierarchy"],
        created: now + 7,
        modified: now + 7
      },

      // Example: Project
      [ids.nodesExample1]: {
        id: ids.nodesExample1,
        type: "node",
        title: "Example: Organizing a project",
        content: `# Example: Website project

Imagine you want to organize a website project.

## 🗂️ Possible structure

\`\`\`
🌐 Website Project
├── 🎨 Design
│   ├── Mockups
│   ├── Brand guidelines
│   └── Logo
├── 💻 Development
│   ├── Frontend
│   │   ├── React components
│   │   └── CSS styles
│   └── Backend
│       ├── API
│       └── Database
└── 📋 Management
    ├── To-do
    ├── Bugs
    └── Roadmap
\`\`\`

## ✅ Advantages

- Everything is **in one place**
- You can **zoom in** on a part (e.g., Frontend)
- You can **add** details as you go
- You can **reorganize** easily (drag & drop)

---

**In practice**: Create a root node "Project", then add children for each category.`,
        children: [],
        parent: ids.nodes,
        tags: ["example", "project", "organization"],
        created: now + 8,
        modified: now + 8
      },

      // Example: Class notes
      [ids.nodesExample2]: {
        id: ids.nodesExample2,
        type: "node",
        title: "Example: Taking class notes",
        content: `# Example: Physics class notes

Hierarchical nodes are perfect for structuring class notes.

## 🗂️ Possible structure

\`\`\`
⚛️ Physics
├── 📚 Chapter 1: Mechanics
│   ├── 1.1 Kinematics
│   │   ├── Velocity
│   │   ├── Acceleration
│   │   └── Exercises
│   ├── 1.2 Dynamics
│   │   ├── Forces
│   │   ├── Newton's Laws
│   │   └── Exercises
│   └── 🧪 Lab #1
├── 📚 Chapter 2: Thermodynamics
│   ├── 2.1 Temperature
│   └── 2.2 Entropy
└── 📝 Review sheets
\`\`\`

## ✅ Advantages

- **Intuitive navigation**: From general course to details
- **Preserved context**: You always know where you are (breadcrumb)
- **Scalable**: Add nodes as the semester progresses
- **Quick search**: Find a concept with Ctrl+K

---

**Tip**: Add **tags** (e.g., "important", "exam", "formula") to quickly find key information.`,
        children: [],
        parent: ids.nodes,
        tags: ["example", "class", "student"],
        created: now + 9,
        modified: now + 9
      },

      // Feature: Symbolic links
      [ids.symlinks]: {
        id: ids.symlinks,
        type: "node",
        title: "🔗 Symbolic links",
        content: `# Symlinks: One node in multiple places

A **symbolic link** (symlink) is like a Windows shortcut: it points to an existing node.

Symlinks transform the simple tree into a **reticulated tree structure**: the base hierarchy remains hierarchical, but symlinks create cross-links that form a meshed network.

## 🎯 What it allows

**Reuse** a node without duplicating it:
- A recipe in "Desserts" AND "Gluten-free"
- A contact in "Work" AND "Friends"
- A note in "Project A" AND "Project B"

## 🧩 How does it work?

1. You create a **normal node** somewhere
2. You create a **symlink** elsewhere that points to this node
3. The content is **shared**: modifying one modifies the other
4. But the **title** of the symlink is **independent**

## 🔄 Difference with duplication

**Duplication**:
- Complete copy of the node
- Independent modifications
- Uses more space

**Symlink**:
- Reference to the original
- Synchronized modifications
- Single shared content

## 🚫 Protection

DeepMemo detects **circular references** (A → B → A) and prevents them automatically.

---

**Concrete example below** 👇`,
        children: [ids.symlinksExample],
        parent: ids.features,
        tags: ["symlinks", "links"],
        created: now + 10,
        modified: now + 10
      },

      // Example: Symlinks
      [ids.symlinksExample]: {
        id: ids.symlinksExample,
        type: "node",
        title: "Example: Gluten-free recipe",
        content: `# Example: A recipe in two categories

Imagine you have a "Chocolate Chip Cookies" recipe that is **gluten-free**.

## 🗂️ Structure without symlinks

\`\`\`
🍰 Recipes
├── 🍪 Desserts
│   └── Chocolate Chip Cookies
└── 🌾 Gluten-free
    └── Chocolate Chip Cookies (copy)
\`\`\`

**Problem**: If you modify the recipe in "Desserts", you must **also** modify it in "Gluten-free".

## 🔗 Structure with symlinks

\`\`\`
🍰 Recipes
├── 🍪 Desserts
│   └── Chocolate Chip Cookies (original)
└── 🌾 Gluten-free
    └── 🔗 Chocolate Chip Cookies (symlink)
\`\`\`

**Advantage**: You modify the original, the symlink automatically displays the **same recipe**.

## ✅ Result

- **Single source of truth**: The recipe content
- **Multiple contexts**: Accessible from "Desserts" or "Gluten-free"
- **No desynchronization**: Always up to date

---

**To create a symlink**: Open the "Actions" modal on a node → Choose "Create symbolic link to" → Select the destination.`,
        children: [],
        parent: ids.symlinks,
        tags: ["example", "recipe", "organization"],
        created: now + 11,
        modified: now + 11
      },

      // Feature: Tags and search
      [ids.tags]: {
        id: ids.tags,
        type: "node",
        title: "🏷️ Tags and search",
        content: `# Tags and search: Find information quickly

DeepMemo includes a **tag system** and a **powerful global search**.

## 🏷️ Tags

**What are they?**:
- **Labels** attached to a node
- E.g., "important", "idea", "recipe", "work"

**What are they for?**:
- Organize by **theme** (not just by hierarchy)
- Find conceptually related nodes
- Filter quickly

**Auto-completion**:
- When you type a tag, DeepMemo **suggests** existing tags
- Smart scope: first branch tags, then global
- Avoids typos and duplicates

## 🔍 Global search

**Shortcut**: **Ctrl+K**

**Searches in**:
- Node **titles**
- **Content** (markdown)
- **Tags**

**Navigation**:
- Real-time results
- Highlighted matches
- Click on a result to go there directly
- The tree automatically expands to the node

---

**Concrete example below** 👇`,
        children: [ids.tagsExample],
        parent: ids.features,
        tags: ["tags", "search"],
        created: now + 12,
        modified: now + 12
      },

      // Example: Tags
      [ids.tagsExample]: {
        id: ids.tagsExample,
        type: "node",
        title: "Example: Finding a quick recipe",
        content: `# Example: Tags for recipes

Imagine you have 50 recipes organized by category (Desserts, Main dishes, Appetizers).

## 🏷️ Useful tags

You can add tags like:
- **quick**: Recipes under 30 minutes
- **veggie**: Vegetarian recipes
- **winter**: Seasonal recipes
- **batch-cooking**: Large quantity recipes
- **kids**: Recipes kids love

## 🔍 Search

**Need**: "I want a quick and veggie recipe for tonight"

**Solution**:
1. Open search (**Ctrl+K**)
2. Type "quick veggie"
3. Results show only recipes with these two tags

**Result**: You find in **2 seconds** instead of browsing the entire tree.

## ☁️ Tag cloud

The **right panel** displays all branch tags with their occurrence count.

**Usefulness**:
- See at a glance recurring themes
- Identify most used tags
- Ensure no duplicates (e.g., "veggie" vs "vegetarian")

---

**Tip**: Use **short** and **consistent** tags for effective auto-completion.`,
        children: [],
        parent: ids.tags,
        tags: ["example", "recipe", "efficiency"],
        created: now + 13,
        modified: now + 13
      },

      // Feature: Branch mode
      [ids.branch]: {
        id: ids.branch,
        type: "node",
        title: "🌳 Branch mode",
        content: `# Branch mode: Isolate a sub-tree

**Branch mode** allows you to display only **part** of your tree.

## 🎯 What it allows

**Isolate**:
- Work on a sub-project without being distracted by the rest
- Create thematic "workspaces"
- Bookmark a specific branch to return quickly

**How it works**:
1. Click on the **🌳** icon (Branch mode) on a node
2. The URL changes: \`?branch=nodeId#/node/nodeId\`
3. Only the **sub-tree** of this node is displayed
4. The rest of the tree is **hidden**

## 🔗 External symlinks

In branch mode, **symlinks pointing outside the branch** are:
- **Grayed out** (reduced opacity)
- **Non-clickable**
- Marked with the **🔗🚫** icon
- Display an "external" badge

**Why?**: To avoid navigating outside the isolated branch and maintain context.

## 🔖 Bookmarkable URL

Branch mode generates a **URL you can bookmark**:
- Save this URL in your favorites
- Return directly to this isolated view
- Organize your work by context

⚠️ **Important**: The URL does **not contain data**, only the view. To share data with someone, use **Export branch** (⬇️)

---

**Concrete example below** 👇`,
        children: [ids.branchExample],
        parent: ids.features,
        tags: ["branch", "isolation"],
        created: now + 14,
        modified: now + 14
      },

      // Example: Branch mode
      [ids.branchExample]: {
        id: ids.branchExample,
        type: "node",
        title: "Example: Working on an isolated branch",
        content: `# Example: Focus on recipes only

Imagine you have a "Recipes" branch buried in your complete tree.

## 🗂️ Complete structure

\`\`\`
📘 Welcome to DeepMemo
├── 📚 Projects
├── 📝 Notes
└── 🍰 Recipes
    ├── 🍪 Desserts
    │   ├── Cookies
    │   └── Cake
    ├── 🥗 Main dishes
    └── 🍲 Soups
\`\`\`

## 🌳 Branch mode: Isolate the view

You want to **focus only** on recipes, without distraction.

**Action**:
1. Go to the "🍰 Recipes" node
2. Click on the **🌳** icon (Branch mode)
3. The URL becomes: \`?branch=node_recipes#/node/node_recipes\`
4. **Bookmark this URL** to return easily

**Result**:
- You see **only** the "Recipes" branch
- No "Projects" or "Notes" in the tree
- Navigation limited to this sub-tree
- **Clean and focused** experience

⚠️ **Important**: The URL does **not contain data**, just the view! It's for you, on your device.

## 📤 Share with someone else

To **actually share data** with a friend:
1. Go to "🍰 Recipes"
2. Click on **⬇️ Export branch**
3. Send the ZIP file to your friend (includes recipes + photos!)
4. They can **import it** into their DeepMemo (⬆️ Import branch)

**Difference**:
- **URL** = Isolated view (for you, on your device)
- **Export ZIP** = Data sharing (for someone else)

---

**Tip**: Branch mode is perfect for **organizing your work** by context.`,
        children: [],
        parent: ids.branch,
        tags: ["example", "sharing", "collaboration"],
        created: now + 15,
        modified: now + 15
      },

      // Feature: Export/Import
      [ids.export]: {
        id: ids.export,
        type: "node",
        title: "⬇️ Export / Import",
        content: `# Export and Import: Save and share

DeepMemo offers **two types of export/import** (global or branch), each available in **3 different formats**!

## 💾 Two types of export/import

### 1. **Global** Export/Import

**Buttons**: In the left sidebar

**What is exported**:
- **All** the tree (all root nodes)
- **All** data (content, tags, relationships)
- **All attached files** (images, PDFs, documents)

**Format**: ZIP file containing \`data.json\` + \`attachments/\` folder

**Usefulness**:
- Backup all your data
- Migrate to another browser
- Share your complete system

⚠️ **Warning**: Global import **overwrites** all existing data.

### 2. **Branch** Export/Import

**Buttons**: In the central panel, below the node content

**What is exported**:
- The current node + **all its descendants**
- Internal relationships (symlinks, children)
- **Attached files** of all nodes in the branch

**Format**: ZIP file containing \`data.json\` + \`attachments/\` folder

**Usefulness**:
- Share a specific branch (e.g., recipes with photos)
- Collaborate without sharing everything
- Reuse a structure elsewhere

✅ **Bonus**: Branch import is **non-destructive**:
- IDs are regenerated automatically (nodes + files)
- No conflict with existing nodes
- The branch is **merged** as children of the current node

## 🗺️ Mindmap export (new!)

In addition to ZIP, you can export as a **mindmap** to visualize and edit your structure:

### **📊 Mermaid SVG**: Visual diagram

- Export as vector SVG image
- Perfect for documentation, presentations
- Works offline (Mermaid.js precached)

### **🧠 FreeMind .mm**: Editable

- Standard XML mindmap format
- **Editable** in Freeplane, XMind, FreeMind
- Symlinks become orange arrows

**Example**: Here's the demo content opened in Freeplane:

![FreeMind export in Freeplane](attachment:demo_freeplane_screenshot)

*(Screenshot as attached file—concrete demonstration of attachments!)*

## 📄 PDF Export: Printable document

**New**: Export branches as **PDF** for printing or archiving:

**How it works**:
- Online generation via CloudFlare Worker (or offline CLI with Node.js)
- Symlinks automatically resolved with their content
- Inline images (attachments converted to base64)
- Hierarchical table of contents
- Rate limiting (5 PDFs/hour, 20/day) to prevent abuse

**Usefulness**:
- Printable documentation
- Long-term archiving (universal format)
- Sharing with non-technical people

**Privacy**:
- Hashed IP (SHA-256) server-side for rate limiting
- Data not retained after generation
- 100% offline CLI alternative available (\`bin/branch2pdf.js\`)

---

**Concrete example below** 👇`,
        children: [ids.exportExample],
        parent: ids.features,
        tags: ["export", "import", "backup"],
        attachments: [],
        created: now + 16,
        modified: now + 16
      },

      // Example: Export/Import
      [ids.exportExample]: {
        id: ids.exportExample,
        type: "node",
        title: "Example: Sharing recipes",
        content: `# Example: Share a recipe branch with a friend

Imagine you want to share your pastry recipes with your brother.

## 📤 Step 1: Export the branch

1. Go to the "🍰 Pastry Recipes" node
2. Click on **⬇️ Export branch**
3. A ZIP file is downloaded: \`deepmemo-branch-Recipes-[timestamp].zip\`
4. Send this file to your brother (email, Telegram, etc.)

**ZIP contents**:
- \`data.json\`: All nodes in the branch
- \`attachments/\`: All **recipe photos** attached

## 📥 Step 2: Import the branch

Your brother opens his DeepMemo and:
1. Creates a node "Received recipes" (or any name)
2. Goes to this node
3. Clicks on **⬆️ Import branch**
4. Selects the ZIP file you sent

## ✅ Result

Your brother now has:
- A node "Received recipes"
- With all **your children** (Cookies, Cakes, etc.) inside
- All **tags** preserved
- All **internal symlinks** functional
- All **recipe photos** attached

**And you**:
- Keep your recipes intact
- No modification to your data

## 🔄 Iterative collaboration

If you modify a recipe, you can:
1. Re-export the branch
2. Send the new ZIP file
3. Your brother imports again (overwrites the old branch or creates a new one)

---

**Tip**: It's like exchanging files, but for **entire trees of data**!`,
        children: [],
        parent: ids.export,
        tags: ["example", "collaboration", "sharing"],
        created: now + 17,
        modified: now + 17
      },

      // Feature: Keyboard shortcuts
      [ids.keyboard]: {
        id: ids.keyboard,
        type: "node",
        title: "⌨️ Keyboard shortcuts",
        content: `# Keyboard shortcuts: Quick navigation

DeepMemo is **optimized for keyboard**. Here are the main shortcuts.

## 🚀 Navigation

- **Alt+N**: Create a new child node
- **Alt+E**: Switch to edit mode (with auto-focus in the editor)
- **Ctrl+K**: Open global search
- **Escape**: Go up to parent of current node

## 🌳 Tree

- **↑**: Select previous node
- **↓**: Select next node
- **→**: Expand selected node
- **←**: Collapse selected node (or go up to parent if already collapsed)
- **Enter**: Display selected node

## 🎯 Why use shortcuts?

**Speed**:
- No need to move the mouse
- Fluid navigation between nodes
- Editing without friction

**Efficiency**:
- You focus on the **content**, not on the interface
- Faster workflow
- Less visual fatigue

---

**Tip**: Shortcuts are displayed permanently in the **right panel** to get used to them gradually.`,
        children: [],
        parent: ids.features,
        tags: ["shortcuts", "productivity"],
        created: now + 18,
        modified: now + 18
      },

      // Feature: Attached files
      [ids.attachments]: {
        id: ids.attachments,
        type: "node",
        title: "📎 Attached files",
        content: `# Attach files to your nodes

DeepMemo allows you to **attach files** (images, PDFs, documents, etc.) to any node.

## 📤 Upload a file

**How to**:
1. Select a node
2. Scroll to the bottom of the central panel
3. Click on **📎 Add a file**
4. Choose the file to upload (max 50 MB)

**Supported files**:
- Images (PNG, JPG, GIF, SVG...)
- Documents (PDF, DOC, TXT...)
- Videos (MP4, WEBM...)
- Audio (MP3, WAV...)
- And many more!

## 🖼️ Inline display

**Markdown syntax**:
\`\`\`markdown
![Description](attachment:attach_ID)
\`\`\`

**For other files** (download links):
\`\`\`markdown
[File name](attachment:attach_ID)
\`\`\`

**Tip**: Use the **📋** button next to each file to copy the syntax automatically!

## 💾 Storage and export

**Local storage**:
- Files are stored in **IndexedDB** (browser)
- Estimated limit: ~500 MB depending on browser
- Storage indicator visible in right panel (📊 Storage)

**Export/Import**:
- Exports are now in **ZIP format**
- Automatically includes all attached files
- Import restores files + data

## 🧹 Cleanup

**Orphaned files**:
If you delete a node with attachments, the files may remain in storage.

**Solution**:
- Open the right panel (ℹ️)
- **📊 Storage** section
- Click on **🧹 Clean orphaned files**

---

**Explore the sub-node** to see a concrete example of using inline images.`,
        children: [ids.attachmentsExample],
        parent: ids.features,
        tags: ["files", "attachments", "images"],
        created: now + 27,
        modified: now + 27
      },

      // Example: Attached files
      [ids.attachmentsExample]: {
        id: ids.attachmentsExample,
        type: "node",
        title: "Example: Attached file",
        content: `# How does it work?

## 1️⃣ Upload

Imagine you just uploaded a **screenshot** of your DeepMemo interface.

The file appears in the **Attached files** list at the bottom of the central panel.

## 2️⃣ Copy syntax

Next to the file, you see:
- **📋** Copy syntax
- **⬇️** Download
- **🗑️** Delete

Click on **📋** to automatically copy:
\`\`\`markdown
![screenshot.png](attachment:attach_1735157234567_abc123)
\`\`\`

## 3️⃣ Paste in content

You paste this syntax in the **node content**.

When you switch to **View mode** (👁️), the image displays directly!

## 💡 Use cases

**Technical documentation**:
- Bug screenshots
- Architecture diagrams
- Whiteboard photos

**Cooking recipes**:
- Dish photos
- Recipe book PDFs

**Creative projects**:
- Moodboards (images)
- Visual references

---

**You can test right now** by uploading a file to this node! 🚀`,
        children: [],
        parent: ids.attachments,
        tags: ["example", "attachments"],
        created: now + 28,
        modified: now + 28
      },

      // 🔮 Future directions
      [ids.future]: {
        id: ids.future,
        type: "node",
        title: "🔮 Explored directions",
        content: `# Explored directions

DeepMemo is **an open-source project** that progresses at its own pace, with no promises or strict timeline.

## 👥 Collaboration & Sharing

**Currently**: Branch export/import (\`.dm\`) already enables basic collaboration:
- You export a branch → send it to someone → they import it
- Offline collaboration via files (email, Git, USB, etc.)
- Total control: everyone decides what they share

**Future explorations**: Synchronization approaches are being explored, but nothing concrete yet. The idea would be to enable real-time collaboration while maintaining data sovereignty (no central platform).

## 🌱 Open Source

DeepMemo is under **MIT license**. Contributions welcome on [GitHub](https://github.com/parksto/DeepMemo):
- Code, ideas, documentation
- Bug reports, suggestions
- Real-world use cases that help understand needs

No pressure, no strict roadmap. We publish what we have when it's ready.`,
        children: [ids.multiUser],
        parent: ids.root,
        tags: ["future", "exploration", "open-source"],
        created: now + 19,
        modified: now + 19
      },

      // Future: Collaboration & Sharing
      [ids.multiUser]: {
        id: ids.multiUser,
        type: "node",
        title: "👥 Collaboration & Sharing",
        content: `# Collaboration & Sharing

## 📦 Currently: .dm file sharing

DeepMemo already allows **asynchronous collaboration** through branch export/import:

**Current workflow**:
1. You export a branch as a \`.dm\` file (complete archive with attachments)
2. You share the file (email, cloud, USB...)
3. Your collaborator imports it into their DeepMemo
4. They modify, add nodes, then send you back a new version
5. You import the update (smart merge)

**Advantages**:
- 100% offline and decentralized
- No third-party server required
- Total control over your data
- Open and documented format

## 🔄 Future explorations

**Synchronization approaches** are being explored to enable real-time collaboration, but the project moves at its own pace. The important thing is to maintain a **simple, reliable, and privacy-respecting** approach.

For now, export/import works well and meets most collaboration needs.`,
        children: [],
        parent: ids.future,
        tags: ["future", "collaboration", "decentralization"],
        created: now + 25,
        modified: now + 25
      },

      // 🚀 First steps
      [ids.firstSteps]: {
        id: ids.firstSteps,
        type: "node",
        title: "🚀 First steps",
        content: `# Ready to try DeepMemo?

Now that you've explored the features, it's time to **make the tool your own**!

## ✨ Suggestions to get started

### 1. Create your first node

- Press **Alt+N** (or click "New node")
- Give it a title: "My projects", "Notes", "Ideas"...
- Write something in it
- Save (automatic!)

### 2. Navigate the tree

- Use **↑↓** to move up/down
- Use **→** to expand a node
- Use **Enter** to display a node
- Watch how the tree **auto-collapses**

### 3. Add tags

- Edit a node (Edit mode)
- Add tags (e.g., "important", "idea", "work")
- Watch **auto-completion** in action
- Check the **tag cloud** in the right panel

### 4. Try search

- Press **Ctrl+K**
- Type a keyword
- See real-time results
- Navigate with arrows and press Enter

### 5. Create a hierarchy

- Create a parent node: "Projects"
- Create children: "Project A", "Project B"
- Create grandchildren: "Task 1", "Task 2"
- Navigate the tree

### 6. Export your data

- Go to the left sidebar
- Click **Export**
- Download the ZIP file
- **Keep it safe** (it's your complete backup!)

## 🗑️ Delete this demo content

When you're comfortable with DeepMemo, you can **delete** this "Welcome" node and all its children:
1. Go to this node
2. Click on **Actions**
3. Choose **Delete**
4. Confirm

**Don't panic**: Your own nodes stay intact!

## 💡 Need help?

- Re-read the nodes in this guide
- Check the documentation (if available)
- Experiment: you can't break anything! (and you have the export backup 😉)

---

**Have fun with DeepMemo!** 🎉`,
        children: [],
        parent: ids.root,
        tags: ["guide", "getting-started"],
        created: now + 29,
        modified: now + 29
      }
    },
    rootNodes: [ids.root]
  };
} // end getDefaultDataEN
