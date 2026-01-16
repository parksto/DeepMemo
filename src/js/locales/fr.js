/**
 * DeepMemo - French (Français) Dictionary
 * Complete translation of all UI strings
 */

export default {
  // Meta tags
  meta: {
    title: "DeepMemo - Ton second cerveau, organisé et connecté",
    description: "DeepMemo - Système de gestion de connaissances basé sur des nœuds récursifs et interconnectés",
    ogTitle: "DeepMemo - Ton second cerveau",
    keywords: "gestion connaissances, prise de notes, PKM, second cerveau, Zettelkasten, notes hiérarchiques, symlinks, tags, offline-first, privacy-first, PWA"
  },

  // Application metadata
  app: {
    title: "DeepMemo",
    tagline: "Ton second cerveau",
    nodeCounter: "{count} nœud{{count > 1 ? 's' : ''}}"
  },

  // Actions (buttons, commands)
  actions: {
    newNode: "Nouveau nœud",
    import: "Importer",
    export: "Exporter",
    exportBranch: "⬇️ Export branche",
    importBranch: "⬆️ Import branche",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    confirm: "Confirmer",
    close: "Fermer",
    move: "Déplacer",
    link: "Lien",
    duplicate: "Dupliquer",
    edit: "Éditer",
    view: "Afficher",
    toggleView: "👁️ Afficher",
    addChild: "Ajouter un enfant",
    addFile: "Ajouter un fichier",
    addAttachment: "Ajouter un fichier",
    openActions: "Actions..."
  },

  // Toast notifications (~73 messages)
  toast: {
    appInit: "Application initialisée",
    saved: "Sauvegardé",
    nodeSelected: "Nœud sélectionné",
    nodeCreated: "Nœud créé",
    rootNodeCreated: "Nœud racine créé",
    childNodeCreated: "Nœud enfant créé",
    nodeMoved: "Nœud déplacé",
    nodeDeleted: "Nœud supprimé",
    symlinkCreated: "Lien symbolique créé",
    symlinkDeleted: "Lien symbolique supprimé",
    nodeDuplicated: "Nœud dupliqué",
    nodeDuplicatedInserted: "Nœud dupliqué et inséré",
    orderModified: "Ordre modifié",
    branchModeEnabled: "Mode branche activé",
    branchModeDisabled: "Mode branche désactivé",
    branchRootNotFound: "Nœud racine de branche introuvable",
    nodeNotFound: "Nœud introuvable",
    alreadyAtRoot: "Déjà à la racine",
    movedToParent: "Remonté au parent",
    linkCopied: "Lien copié dans le presse-papier",
    branchLinkCopied: "Lien de branche copié dans le presse-papier",
    markdownLinkCopied: "Lien Markdown copié dans le presse-papier",
    copyError: "Erreur lors de la copie",
    selectNodeFirst: "Sélectionne d'abord un nœud",
    selectParentFirst: "Sélectionne d'abord un nœud parent",
    invalidDestination: "Impossible : destination invalide",
    cannotMoveToDescendant: "Impossible de déplacer dans ses propres descendants",
    wouldCreateCycle: "Cette action créerait un cycle",
    nodeAlreadyExists: "Le nœud existe déjà à cet emplacement",
    cannotDeleteBranchRoot: "Impossible de supprimer la racine de la branche",
    externalSymlink: "⚠️ Lien externe à la branche (non accessible)",
    brokenLink: "⚠️ Lien cassé",
    tagAlreadyExists: "Tag déjà existant",
    tagAdded: "Tag ajouté",
    tagRemoved: "Tag supprimé",
    dataImported: "{count} nœud(s) importés",
    dataImportedJSON: "{count} nœud(s) importés (JSON)",
    dataImportedZIP: "{count} nœud(s) importés (ZIP)",
    dataExported: "Données exportées (ZIP)",
    branchExported: "Branche exportée (ZIP)",
    freemindExported: "Mindmap exportée (FreeMind)",
    freemindBranchExported: "Branche exportée (FreeMind)",
    mermaidExported: "Diagramme exporté (Mermaid SVG)",
    mermaidBranchExported: "Branche exportée (Mermaid SVG)",
    pdfExported: "Document PDF exporté",
    pdfBranchExported: "Branche exportée (PDF)",
    pdfRequiresOnline: "Export PDF nécessite une connexion internet",
    pdfRateLimitExceeded: "Limite d'export PDF atteinte. Essayez plus tard.",
    branchImported: "{count} nœud(s) importés",
    comingSoon: "Fonctionnalité bientôt disponible",
    importError: "Erreur lors de l'import",
    exportError: "Erreur lors de l'export",
    attachmentsNotAvailable: "⚠️ Attachments non disponibles (IndexedDB)",
    fileTooBig: "❌ Fichier trop volumineux (max 50MB)",
    fileAdded: "✅ Fichier ajouté : {name}",
    fileAddError: "❌ Erreur lors de l'ajout du fichier",
    syntaxCopied: "✅ Syntaxe copiée dans le presse-papier",
    syntaxCopyError: "❌ Erreur lors de la copie",
    fileNotFound: "❌ Fichier introuvable",
    downloadStarted: "✅ Téléchargement : {name}",
    downloadError: "❌ Erreur lors du téléchargement",
    fileDeleted: "✅ Fichier supprimé : {name}",
    fileDeleteError: "❌ Erreur lors de la suppression",
    orphansCleaned: "✅ {count} fichier(s) orphelin(s) supprimé(s)",
    noOrphans: "✅ Aucun fichier orphelin trouvé",
    cleanOrphansError: "❌ Erreur lors du nettoyage",
    orphanNodesCleaned: "✅ {count} nœud(s) orphelin(s) supprimé(s)",
    noOrphanNodes: "✅ Aucun nœud orphelin trouvé",
    cleanOrphanNodesError: "❌ Erreur lors du nettoyage des nœuds",
    customFontEnabled: "Police personnalisée activée",
    systemFontEnabled: "Police système activée",
    languageChanged: "Langue modifiée",
    dataReloaded: "🔄 Données rechargées (modifiées dans un autre onglet)",
    dataReloadedNodeDeleted: "🔄 Données rechargées - nœud actuel supprimé"
  },

  // Alert messages
  alerts: {
    invalidFile: "Fichier JSON invalide",
    invalidBranch: "Fichier de branche invalide. Utilise l'import global pour les exports complets.",
    nodeNotFound: "Nœud introuvable",
    dataJsonNotFound: "Fichier data.json introuvable dans le ZIP",
    importError: "Erreur lors de l'import : {message}",
    exportError: "Erreur lors de l'export : {message}",
    mermaidNotAvailable: "Mermaid.js n'est pas chargé. Impossible d'exporter en SVG.",
    brokenSymlink: "⚠️ Lien symbolique cassé : le nœud cible n'existe plus."
  },

  // Confirmation dialogs
  confirms: {
    importData: "Importer {count} nœud(s) ? Cela écrasera tes données actuelles.",
    importDataWithFiles: "Importer {count} nœud(s) et {fileCount} fichier(s) ? Cela écrasera tes données actuelles.",
    importBranch: "Importer {count} nœud(s) comme enfants du nœud actuel ?",
    importBranchWithFiles: "Importer {count} nœud(s) et {fileCount} fichier(s) comme enfants du nœud actuel ?",
    deleteSymlink: "Supprimer ce lien symbolique ?",
    deleteNode: "Supprimer ce nœud et tous ses enfants ?",
    deleteFile: "Supprimer ce fichier ?",
    cleanOrphans: "Nettoyer les fichiers orphelins ? Cette action est irréversible.",
    cleanOrphanNodes: "Nettoyer les nœuds orphelins ? Cette action est irréversible."
  },

  // Modals
  modals: {
    actions: {
      title: "⚙️ Actions sur le nœud",
      subtitle: "Que veux-tu faire avec ce nœud ?",
      move: "↗️ Déplacer",
      link: "🔗 Lien",
      duplicate: "📋 Dupliquer",
      delete: "🗑️ Supprimer",
      cancel: "Annuler",
      confirm: "✓ Confirmer",
      descriptions: {
        move: "Déplace ce nœud vers un nouveau parent. Tous les enfants suivront.",
        link: "Crée un lien symbolique de ce nœud vers un autre parent. Le contenu est partagé.",
        duplicate: "Duplique ce nœud (et ses enfants) vers un nouveau parent.",
        delete: "Attention : la suppression est définitive et supprimera aussi tous les enfants."
      },
      disabledReasons: {
        currentNode: "Nœud actuel",
        descendant: "Descendant",
        wouldCycle: "Créerait un cycle"
      }
    },
    symlink: {
      title: "🔗 Créer un lien symbolique",
      subtitle: "Choisis où afficher ce nœud comme lien symbolique :",
      cancel: "Annuler",
      confirm: "🔗 Créer le lien"
    },
    search: {
      placeholder: "Rechercher dans tous les nœuds...",
      emptyHint: "Tape pour rechercher dans tes nœuds",
      noResults: "Aucun résultat trouvé",
      navigate: "↑↓ Naviguer",
      open: "Entrée Ouvrir",
      close: "Esc Fermer"
    },
    markdown: {
      title: "Guide Markdown",
      intro: "Markdown est une syntaxe simple pour formater du texte. Voici les principaux éléments que tu peux utiliser dans tes nœuds :",
      tip: "Tu n'es pas obligé d'utiliser Markdown ! Écris simplement du texte brut si tu préfères. Le Markdown est là pour ajouter du formatage quand tu en as besoin.",
      examples: {
        headings: {
          title: "📐 Titres",
          syntax: "# Titre niveau 1\n## Titre niveau 2\n### Titre niveau 3"
        },
        formatting: {
          title: "✏️ Formatage de texte",
          syntax: "**gras**\n*italique*\n~~barré~~\n`code inline`"
        },
        lists: {
          title: "📝 Listes",
          syntax: "- Élément 1\n- Élément 2\n  - Sous-élément\n\n1. Premier\n2. Deuxième\n3. Troisième"
        },
        links: {
          title: "🔗 Liens",
          syntax: "[Texte du lien](https://example.com)\n[DeepMemo](https://deepmemo.org)"
        },
        images: {
          title: "🖼️ Images",
          syntax: "![Texte alternatif](url-de-l-image.jpg)\n\nPour les fichiers attachés :\n![](attachment:ID_DU_FICHIER)"
        },
        code: {
          title: "💻 Blocs de code",
          syntax: "```javascript\nfunction hello() {\n  console.log('Hello!');\n}\n```"
        },
        blockquotes: {
          title: "💬 Citations",
          syntax: "> Ceci est une citation\n> Sur plusieurs lignes"
        },
        hr: {
          title: "➖ Séparateur horizontal",
          syntax: "---"
        },
        tables: {
          title: "📊 Tableaux",
          syntax: "| Colonne 1 | Colonne 2 |\n|-----------|----------|\n| Cellule 1 | Cellule 2 |\n| Cellule 3 | Cellule 4 |"
        }
      }
    },
    export: {
      title: "Export",
      subtitle: "Choisir le format d'export :",
      subtitleBranch: "Export de la branche « {branch} » :",
      cancel: "Annuler",
      zip: {
        title: "Archive complète",
        desc: "Export complet avec toutes les données et fichiers attachés"
      },
      freemind: {
        title: "Carte mentale",
        desc: "Fichier .mm éditable dans Freeplane/FreeMind/XMind"
      },
      mermaid: {
        title: "Diagramme visuel",
        desc: "Diagramme visuel au format SVG"
      },
      pdf: {
        title: "Document PDF",
        desc: "Document PDF avec sommaire hiérarchique et images"
      }
    },
    pdfPrivacy: {
      title: "Export PDF - Confidentialité",
      intro: "Pour protéger nos coûts serveur, nous limitons les exports :",
      limitHour: "5 PDFs par heure (maximum)",
      limitDay: "20 PDFs par jour (maximum)",
      hashInfo: "Ces limites sont basées sur votre IP hashée (SHA-256), conservée 24h uniquement. Votre IP n'est jamais stockée en clair.",
      noteTitle: "Note :",
      noteContent: "Votre hébergeur web conserve déjà les IPs dans ses logs standards (30-90 jours). Notre système de rate limiting est plus court (24h) et utilise un hash cryptographique.",
      noData: "Aucune donnée de votre document n'est sauvegardée. Le PDF est généré et envoyé directement à votre navigateur.",
      offlineTitle: "Alternative offline :",
      offlineContent: "Un outil CLI est disponible sur GitHub pour exporter sans limitation ni connexion internet (dossier bin/).",
      dontShow: "Ne plus afficher ce message",
      cancel: "Annuler",
      confirm: "✓ Compris, générer"
    }
  },

  // Placeholders
  placeholders: {
    nodeTitle: "Titre du nœud",
    nodeContent: "Écris ton contenu ici... (Utilise [[Nom du nœud]] pour créer des liens)",
    search: "Rechercher dans tous les nœuds...",
    tagInput: "+ tag"
  },

  // Labels and metadata
  labels: {
    branchMode: "🌿 mode branche",
    created: "Créé",
    modified: "Modifié",
    children: "📂 Nœuds enfants",
    parent: "Parent",
    attachments: "📎 Fichiers attachés",
    tags: "Tags",
    tagsInBranch: "☁️ Tags de la branche",
    noTags: "Aucun tag dans la branche",
    storage: "📊 Stockage",
    preferences: "Préférences",
    language: "Langue",
    french: "Français",
    english: "English",
    systemFont: "Police système",
    keyboardShortcuts: "Raccourcis clavier",
    structure: "Structure",
    type: "Type",
    dates: "Dates",
    statistics: "Statistiques",
    characters: "Caractères",
    words: "Mots",
    informations: "Informations",
    symlinkTo: "Lien vers",
    pdfExport: "Export PDF",
    pdfQuotaHour: "Restant (heure)",
    pdfQuotaDay: "Restant (jour)",
    pdfQuotaUpdated: "Mis à jour il y a {minutes} min"
  },

  // Node types and badges
  nodeTypes: {
    node: "📄 Nœud",
    symlink: "🔗 Lien symbolique",
    brokenSymlink: "Lien symbolique cassé",
    badge: {
      link: "lien",
      external: "externe",
      broken: "lien cassé",
      circular: "circulaire",
      copy: "copie"
    }
  },

  // Empty states
  empty: {
    icon: "🧩"
  },

  // Messages
  messages: {
    welcome: "Bienvenue dans DeepMemo",
    welcomeSubtitle: "Crée ton premier nœud pour commencer",
    emptyContent: "Aucun contenu",
    emptyPreview: "Vide",
    brokenSymlink: "⚠️ Ce lien symbolique pointe vers un nœud qui n'existe plus.\n\nVous pouvez supprimer ce lien cassé.",
    externalSymlink: "⚠️ Ce lien symbolique pointe vers un nœud en dehors de la branche actuelle.\n\nEn mode branche, les liens externes ne sont pas accessibles. Vous pouvez supprimer ce lien ou quitter le mode branche pour accéder au nœud cible.",
    newNodeTitle: "Nouveau nœud"
  },

  // Tooltips
  tooltips: {
    shareNode: "Copier l'URL de ce nœud (préserve le contexte actuel)",
    shareBranch: "Copier l'URL en mode branche isolée (vue focus)",
    goToParent: "Remonter au parent",
    goToRoot: "Retour à la racine",
    exportBranch: "Exporter ce nœud et ses descendants",
    importBranch: "Importer une branche comme enfants",
    attachmentId: "ID de l'attachment",
    copyMarkdown: "Copier la syntaxe markdown",
    download: "Télécharger",
    deleteFile: "Supprimer",
    tagOccurrences: "{count} occurrence(s) - Cliquer pour rechercher"
  },

  // Keyboard shortcuts
  keyboard: {
    newNode: "Nouveau nœud",
    search: "Recherche",
    markdownHelp: "Aide Markdown",
    editMode: "Passer en édition",
    navigateTree: "Naviguer arbre",
    expandNode: "Déplier nœud",
    collapseOrParent: "Replier / Parent",
    activateNode: "Activer nœud",
    goToParent: "Remonter au parent"
  },

  // Storage section
  storage: {
    files: "Fichiers",
    maxSize: " / ~500 MB",
    filesCount: "{count} fichier(s) attaché(s)",
    storageError: "Erreur de stockage",
    cleanOrphans: "🧹 Nettoyer les fichiers orphelins",
    cleanOrphanNodes: "🗑️ Nettoyer les nœuds orphelins"
  },

  // Empty states
  empty: {
    icon: "🧩",
    welcome: "Bienvenue dans DeepMemo",
    subtitle: "Crée ton premier nœud pour commencer",
    searchPlaceholder: "💭",
    searchText: "Tape pour rechercher dans tes nœuds",
    noResults: "Aucun résultat trouvé"
  },

  // Mobile warning
  mobileWarning: {
    title: "Version mobile en développement",
    message: "L'expérience mobile est en cours d'amélioration. Pour une utilisation optimale, nous recommandons d'utiliser un ordinateur."
  },

  // PDF export
  pdf: {
    tableOfContents: "Sommaire",
    cycleDetected: "Référence circulaire détectée",
    brokenLink: "Lien cassé",
    symlinkTo: "Lien vers",
    see: "Voir",
    generating: "Génération du PDF en cours..."
  },

  // Footer
  footer: {
    openSource: "Projet Open Source",
    githubLink: "https://github.com/parksto/DeepMemo"
  }
};
