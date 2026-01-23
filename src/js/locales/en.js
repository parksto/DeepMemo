/**
 * DeepMemo - English Dictionary
 * Complete translation of all UI strings
 */

export default {
  // Application metadata
  app: {
    title: "DeepMemo",
    tagline: "Your second brain",
    nodeCounter: "{count} node{{count > 1 ? 's' : ''}}"
  },

  // Actions (buttons, commands)
  actions: {
    newNode: "New node",
    import: "Import",
    export: "Export",
    exportBranch: "⬇️ Export branch",
    importBranch: "⬆️ Import branch",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirm: "Confirm",
    close: "Close",
    move: "Move",
    link: "Link",
    duplicate: "Duplicate",
    edit: "Edit",
    view: "View",
    toggleView: "👁️ View",
    togglePreview: "📖 Preview",
    addChild: "Add child",
    addFile: "Add file",
    addAttachment: "Add file",
    openActions: "Actions..."
  },

  // Toast notifications (~73 messages)
  toast: {
    appInit: "Application initialized",
    saved: "Saved",
    nodeSelected: "Node selected",
    nodeCreated: "Node created",
    rootNodeCreated: "Root node created",
    childNodeCreated: "Child node created",
    nodeMoved: "Node moved",
    nodeDeleted: "Node deleted",
    symlinkCreated: "Symbolic link created",
    symlinkDeleted: "Symbolic link deleted",
    nodeDuplicated: "Node duplicated",
    nodeDuplicatedInserted: "Node duplicated and inserted",
    orderModified: "Order modified",
    branchModeEnabled: "Branch mode enabled",
    branchModeDisabled: "Branch mode disabled",
    branchRootNotFound: "Branch root node not found",
    nodeNotFound: "Node not found",
    alreadyAtRoot: "Already at root",
    movedToParent: "Moved to parent",
    linkCopied: "Link copied to clipboard",
    branchLinkCopied: "Branch link copied to clipboard",
    markdownLinkCopied: "Markdown link copied to clipboard",
    copyError: "Copy error",
    selectNodeFirst: "Select a node first",
    selectParentFirst: "Select a parent node first",
    invalidDestination: "Impossible: invalid destination",
    cannotMoveToDescendant: "Cannot move into own descendants",
    wouldCreateCycle: "This action would create a cycle",
    nodeAlreadyExists: "Node already exists at this location",
    cannotDeleteBranchRoot: "Cannot delete branch root node",
    externalSymlink: "⚠️ External link to branch (not accessible)",
    brokenLink: "⚠️ Broken link",
    tagAlreadyExists: "Tag already exists",
    tagAdded: "Tag added",
    tagRemoved: "Tag removed",
    dataImported: "{count} node(s) imported",
    dataImportedJSON: "{count} node(s) imported (JSON)",
    dataImportedZIP: "{count} node(s) imported (ZIP)",
    dataExported: "Data exported (ZIP)",
    branchExported: "Branch exported (ZIP)",
    freemindExported: "Mindmap exported (FreeMind)",
    freemindBranchExported: "Branch exported (FreeMind)",
    mermaidExported: "Diagram exported (Mermaid SVG)",
    mermaidBranchExported: "Branch exported (Mermaid SVG)",
    pdfExported: "PDF document exported",
    pdfBranchExported: "Branch exported (PDF)",
    pdfRequiresOnline: "PDF export requires an internet connection",
    pdfRateLimitExceeded: "PDF export limit reached. Try again later.",
    pdfWorkerUnavailable: "PDF server unavailable. Check your connection or use the offline CLI tool.",
    branchImported: "{count} node(s) imported",
    comingSoon: "Feature coming soon",
    importError: "Import error",
    exportError: "Export error",
    dataLoadError: "Data loading error",
    attachmentsNotAvailable: "⚠️ Attachments not available (IndexedDB)",
    fileTooBig: "❌ File too large (max 50MB)",
    fileAdded: "✅ File added: {name}",
    fileAddError: "❌ Error adding file",
    syntaxCopied: "✅ Syntax copied to clipboard",
    syntaxCopyError: "❌ Copy error",
    fileNotFound: "❌ File not found",
    downloadStarted: "✅ Download: {name}",
    downloadError: "❌ Download error",
    fileDeleted: "✅ File deleted: {name}",
    fileDeleteError: "❌ File deletion error",
    orphansCleaned: "✅ {count} orphaned file(s) deleted",
    noOrphans: "✅ No orphaned files found",
    cleanOrphansError: "❌ Cleanup error",
    orphanNodesCleaned: "✅ {count} orphaned node(s) deleted",
    noOrphanNodes: "✅ No orphaned nodes found",
    cleanOrphanNodesError: "❌ Node cleanup error",
    customFontEnabled: "Custom font enabled",
    systemFontEnabled: "System font enabled",
    languageChanged: "Language changed",
    dataReloaded: "🔄 Data reloaded (modified in another tab)",
    dataReloadedNodeDeleted: "🔄 Data reloaded - current node was deleted"
  },

  // Alert messages
  alerts: {
    invalidFile: "Invalid JSON file",
    invalidBranch: "Invalid branch file. Use global import for full exports.",
    nodeNotFound: "Node not found",
    dataJsonNotFound: "data.json file not found in ZIP",
    importError: "Import error: {message}",
    exportError: "Export error: {message}",
    mermaidNotAvailable: "Mermaid.js is not loaded. Cannot export to SVG.",
    brokenSymlink: "⚠️ Broken symlink: target node no longer exists."
  },

  // Confirmation dialogs
  confirms: {
    importData: "Import {count} node(s)? This will overwrite your current data.",
    importDataWithFiles: "Import {count} node(s) and {fileCount} file(s)? This will overwrite your current data.",
    importBranch: "Import {count} node(s) as children of current node?",
    importBranchWithFiles: "Import {count} node(s) and {fileCount} file(s) as children of current node?",
    deleteSymlink: "Delete this symbolic link?",
    deleteNode: "Delete this node and all its children?",
    deleteFile: "Delete this file?",
    cleanOrphans: "Clean orphaned files? This action is irreversible.",
    cleanOrphanNodes: "Clean orphaned nodes? This action is irreversible."
  },

  // Modals
  modals: {
    actions: {
      title: "⚙️ Node Actions",
      subtitle: "What do you want to do with this node?",
      move: "↗️ Move",
      link: "🔗 Link",
      duplicate: "📋 Duplicate",
      delete: "🗑️ Delete",
      cancel: "Cancel",
      confirm: "✓ Confirm",
      descriptions: {
        move: "Move this node to a new parent. All children will follow.",
        link: "Create a symbolic link of this node to another parent. Content is shared.",
        duplicate: "Duplicate this node (and its children) to a new parent.",
        delete: "Warning: deletion is permanent and will also delete all children."
      },
      disabledReasons: {
        currentNode: "Current node",
        descendant: "Descendant",
        wouldCycle: "Would create cycle"
      }
    },
    symlink: {
      title: "🔗 Create Symbolic Link",
      subtitle: "Choose where to display this node as a symbolic link:",
      cancel: "Cancel",
      confirm: "🔗 Create link"
    },
    search: {
      placeholder: "Search in all nodes...",
      emptyHint: "Type to search in your nodes",
      noResults: "No results found",
      navigate: "↑↓ Navigate",
      open: "Enter Open",
      close: "Esc Close"
    },
    markdown: {
      title: "Markdown Guide",
      intro: "Markdown is a simple syntax for formatting text. Here are the main elements you can use in your nodes:",
      tip: "You don't have to use Markdown! Just write plain text if you prefer. Markdown is there to add formatting when you need it.",
      examples: {
        headings: {
          title: "📐 Headings",
          syntax: "# Heading level 1\n## Heading level 2\n### Heading level 3"
        },
        formatting: {
          title: "✏️ Text formatting",
          syntax: "**bold**\n*italic*\n~~strikethrough~~\n`inline code`"
        },
        lists: {
          title: "📝 Lists",
          syntax: "- Item 1\n- Item 2\n  - Sub-item\n\n1. First\n2. Second\n3. Third"
        },
        links: {
          title: "🔗 Links",
          syntax: "[Link text](https://example.com)\n[DeepMemo](https://deepmemo.org)"
        },
        images: {
          title: "🖼️ Images",
          syntax: "![Alt text](image-url.jpg)\n\nFor attached files:\n![](attachment:FILE_ID)"
        },
        code: {
          title: "💻 Code blocks",
          syntax: "```javascript\nfunction hello() {\n  console.log('Hello!');\n}\n```"
        },
        blockquotes: {
          title: "💬 Blockquotes",
          syntax: "> This is a quote\n> On multiple lines"
        },
        hr: {
          title: "➖ Horizontal rule",
          syntax: "---"
        },
        tables: {
          title: "📊 Tables",
          syntax: "| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |"
        }
      }
    },
    export: {
      title: "Export",
      subtitle: "Choose export format:",
      subtitleBranch: "Export branch \"{branch}\":",
      cancel: "Cancel",
      zip: {
        title: "Complete archive",
        desc: "Complete export with all data and attached files"
      },
      freemind: {
        title: "Mind map",
        desc: ".mm file editable in Freeplane/FreeMind/XMind"
      },
      mermaid: {
        title: "Visual diagram",
        desc: "Visual diagram as SVG format"
      },
      pdf: {
        title: "PDF Document",
        desc: "PDF document with hierarchical table of contents and images"
      }
    },
    pdfPrivacy: {
      title: "PDF Export - Privacy",
      intro: "To protect our server costs, we limit exports:",
      limitHour: "5 PDFs per hour (maximum)",
      limitDay: "20 PDFs per day (maximum)",
      hashInfo: "These limits are based on your hashed IP (SHA-256), stored for 24h only. Your IP is never stored in plain text.",
      noteTitle: "Note:",
      noteContent: "Your web host already stores IPs in standard logs (30-90 days). Our rate limiting is shorter (24h) and uses a cryptographic hash.",
      noData: "No data from your document is saved. The PDF is generated and sent directly to your browser.",
      offlineTitle: "Offline alternative:",
      offlineContent: "A CLI tool is available on GitHub to export without limitations or internet connection (bin/ folder).",
      dontShow: "Don't show this again",
      cancel: "Cancel",
      confirm: "✓ OK, generate"
    }
  },

  // Placeholders
  placeholders: {
    nodeTitle: "Node title",
    nodeContent: "Write your content here... (Use [[Node name]] to create links)",
    search: "Search in all nodes...",
    tagInput: "+ tag"
  },

  // Labels and metadata
  labels: {
    branchMode: "🌿 branch mode",
    created: "Created",
    modified: "Modified",
    children: "📂 Child nodes",
    parent: "Parent",
    attachments: "📎 Attached files",
    tags: "Tags",
    tagsInBranch: "☁️ Branch tags",
    noTags: "No tags in branch",
    storage: "📊 Storage",
    preferences: "Preferences",
    language: "Language",
    french: "Français",
    english: "English",
    systemFont: "System font",
    keyboardShortcuts: "Keyboard shortcuts",
    structure: "Structure",
    type: "Type",
    dates: "Dates",
    statistics: "Statistics",
    characters: "Characters",
    words: "Words",
    informations: "Information",
    symlinkTo: "Link to",
    pdfExport: "PDF Export",
    pdfQuotaHour: "Remaining (hour)",
    pdfQuotaDay: "Remaining (day)",
    pdfQuotaUpdated: "Updated {minutes} min ago",
    preview: "📖 Preview"
  },

  // Node types and badges
  nodeTypes: {
    node: "📄 Node",
    symlink: "🔗 Symbolic link",
    brokenSymlink: "Broken symbolic link",
    badge: {
      link: "link",
      external: "external",
      broken: "broken link",
      circular: "circular",
      copy: "copy"
    }
  },

  // Messages
  messages: {
    welcome: "Welcome to DeepMemo",
    welcomeSubtitle: "Create your first node to get started",
    emptyContent: "No content",
    emptyPreview: "Empty",
    brokenSymlink: "⚠️ This symbolic link points to a node that no longer exists.\n\nYou can delete this broken link.",
    externalSymlink: "⚠️ This symbolic link points to a node outside the current branch.\n\nIn branch mode, external links are not accessible. You can delete this link or exit branch mode to access the target node.",
    newNodeTitle: "New node"
  },

  // Tooltips
  tooltips: {
    shareNode: "Copy URL of this node (preserves current context)",
    shareBranch: "Copy URL in isolated branch mode (focus view)",
    goToParent: "Go to parent",
    goToRoot: "Back to root",
    togglePreview: "Enable/disable live preview (split-screen)",
    exportBranch: "Export this node and its descendants",
    importBranch: "Import a branch as children",
    attachmentId: "Attachment ID",
    copyMarkdown: "Copy markdown syntax",
    download: "Download",
    deleteFile: "Delete",
    tagOccurrences: "{count} occurrence(s) - Click to search"
  },

  // Keyboard shortcuts
  keyboard: {
    newNode: "New node",
    search: "Search",
    markdownHelp: "Markdown help",
    editMode: "Switch to edit mode",
    navigateTree: "Navigate tree",
    expandNode: "Expand node",
    collapseOrParent: "Collapse / Parent",
    activateNode: "Activate node",
    goToParent: "Go to parent"
  },

  // Storage section
  storage: {
    files: "Files",
    maxSize: " / ~500 MB",
    filesCount: "{count} attached file(s)",
    storageError: "Storage error",
    cleanOrphans: "🧹 Clean orphaned files",
    cleanOrphanNodes: "🗑️ Clean orphaned nodes"
  },

  // Empty states
  empty: {
    icon: "🧩",
    welcome: "Welcome to DeepMemo",
    subtitle: "Create your first node to get started",
    searchPlaceholder: "💭",
    searchText: "Type to search in your nodes",
    noResults: "No results found"
  },

  // Mobile warning
  mobileWarning: {
    title: "Mobile version in development",
    message: "The mobile experience is being improved. For optimal use, we recommend using a computer."
  },

  // Meta (PWA)
  meta: {
    title: "DeepMemo - Your second brain, organized and connected",
    description: "Knowledge management system based on recursive and interconnected nodes",
    ogTitle: "DeepMemo - Your second brain",
    keywords: "knowledge management, note-taking, PKM, second brain, Zettelkasten, hierarchical notes, symlinks, tags, offline-first, privacy-first, PWA"
  },

  // PDF export
  pdf: {
    tableOfContents: "Table of Contents",
    cycleDetected: "Circular reference detected",
    brokenLink: "Broken link",
    symlinkTo: "Link to",
    see: "See",
    preparing: "Preparing images...",
    generating: "Generating PDF..."
  },

  // Footer
  footer: {
    openSource: "Open Source Project",
    githubLink: "https://github.com/parksto/DeepMemo"
  }
};
