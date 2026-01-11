/**
 * DeepMemo V0.10.1 - Main Application Entry Point
 * Modular ES6 version
 */

import { generateId, escapeHtml } from './utils/helpers.js';
import { setupKeyboardShortcuts } from './utils/keyboard.js';
import * as RoutingModule from './utils/routing.js';
import * as DataModule from './core/data.js';
import * as Storage from './core/storage.js';
import { showToast } from './ui/toast.js';
import * as PanelsModule from './ui/panels.js';
import * as TreeModule from './features/tree.js';
import * as EditorModule from './features/editor.js';
import * as SearchModule from './features/search.js';
import * as TagsModule from './features/tags.js';
import * as ModalsModule from './features/modals.js';
import * as DragDropModule from './features/drag-drop.js';
import * as AttachmentsModule from './core/attachments.js';
import { initI18n, t, setLanguage, getCurrentLanguage } from './utils/i18n.js';
import * as SyncModule from './utils/sync.js';

/**
 * Main Application Object
 * Exposed globally for compatibility with onclick handlers in HTML
 */
const app = {
  // State
  data: DataModule.data,
  currentNodeId: null,
  expandedNodes: DataModule.expandedNodes,
  exportType: null, // 'global' or 'branch'
  exportBranchId: null, // ID of branch to export (null for global)

  /**
   * Initialize the application
   */
  async init() {
    console.log('🚀 DeepMemo V0.10.1 - Initialisation...');

    // Initialize i18n system
    await initI18n();

    // Load data from IndexedDB (with automatic migration from localStorage)
    if (AttachmentsModule.isIndexedDBAvailable()) {
      try {
        await DataModule.loadData();
        console.log('[App] Data loaded from IndexedDB');
      } catch (error) {
        console.error('[App] Failed to load data:', error);
        showToast(t('toast.dataLoadError') || 'Failed to load data', 'error');
      }
    } else {
      console.warn('[App] IndexedDB not available (private mode?), using localStorage fallback');
      await DataModule.loadData(); // Will fallback to localStorage
    }

    // Initialize panels and view mode
    PanelsModule.initPanels();
    EditorModule.initViewMode();
    this.initFontPreference();

    // Setup search input handler
    SearchModule.setupSearchInput();

    // Setup modal close on click outside
    this.setupModalCloseOnClickOutside();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts({
      createNode: () => this.currentNodeId ? this.createChildNode() : this.createRootNode(),
      openSearch: () => SearchModule.openSearch(),
      openMarkdownHelp: () => this.openMarkdownHelp(),
      goToParent: () => this.goToParent(),
      isSearchVisible: () => SearchModule.isSearchVisible(),
      onEditorFocus: () => this.focusEditor(),
      toggleViewMode: () => this.toggleViewMode(),
      handleTreeNavigation: (e) => {
        TreeModule.handleTreeNavigation(e, (nodeId, instanceKey) => {
          this.selectNode(nodeId, instanceKey);
        }, () => {
          this.render();
        });
      }
    });

    // Setup URL routing
    RoutingModule.setupHashListener((parsed) => {
      this.handleHashChange(parsed);
    });

    // Setup cross-tab synchronization with BroadcastChannel
    SyncModule.initSync();
    SyncModule.setupSyncListener(() => {
      this.handleExternalDataChange();
    });

    // Render tree
    this.render();

    // Handle initial URL hash
    const initialHash = RoutingModule.parseHash();
    if (initialHash.nodeId) {
      this.handleHashChange(initialHash);
    } else {
      // No URL hash: activate first root node by default
      this.goToRoot();
    }

    // Show mobile warning banner if needed
    this.checkMobileWarning();

    // Test toast
    showToast(t('toast.appInit'), '🎉');

    // Update node counter
    this.updateNodeCounter();
  },

  /**
   * Check if user is on mobile and show warning banner if needed
   */
  checkMobileWarning() {
    // Check if already dismissed
    const dismissed = localStorage.getItem('deepmemo_mobileWarningDismissed');
    if (dismissed === 'true') return;

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Show banner if mobile
    if (isMobile) {
      const banner = document.getElementById('mobileWarningBanner');
      if (banner) {
        banner.style.display = 'block';
      }
    }
  },

  /**
   * Close mobile warning banner
   */
  closeMobileWarning() {
    const banner = document.getElementById('mobileWarningBanner');
    if (banner) {
      banner.style.display = 'none';
      // Remember dismissal
      localStorage.setItem('deepmemo_mobileWarningDismissed', 'true');
    }
  },

  /**
   * Setup modal close on click outside (on overlay)
   */
  setupModalCloseOnClickOutside() {
    const modals = [
      { id: 'exportModal', closeFunc: () => this.closeExportModal() },
      { id: 'actionModal', closeFunc: () => this.closeActionModal() },
      { id: 'symlinkModal', closeFunc: () => this.closeSymlinkModal() },
      { id: 'markdownHelpModal', closeFunc: () => this.closeMarkdownHelp() }
    ];

    modals.forEach(({ id, closeFunc }) => {
      const overlay = document.getElementById(id);
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          // Close only if clicking directly on overlay (not on modal content)
          if (e.target === overlay) {
            closeFunc();
          }
        });
      }
    });
  },

  /**
   * Handle URL hash change
   */
  handleHashChange(parsed) {
    const { mode, branchRootId, nodeId } = parsed;

    // Handle branch mode
    if (mode === 'branch' && branchRootId) {
      const branchNode = DataModule.data.nodes[branchRootId];
      if (!branchNode) {
        showToast(t('toast.branchRootNotFound'), '⚠️');
        return;
      }
      TreeModule.enableBranchMode(branchRootId);
      this.render();
      showToast(t('toast.branchModeEnabled'), '🌿');
    } else {
      TreeModule.disableBranchMode();
    }

    // Handle node selection
    if (!nodeId) {
      // No hash: go to root
      this.goToRoot();
      return;
    }

    const node = DataModule.data.nodes[nodeId];
    if (!node) {
      showToast(t('toast.nodeNotFound'), '⚠️');
      return;
    }

    // Select the node
    this.selectNodeById(nodeId);
  },

  /**
   * Handle data changes from other tabs (cross-tab synchronization)
   */
  async handleExternalDataChange() {
    // Reload data from IndexedDB (async!)
    await DataModule.loadData();

    // Render tree with updated data
    this.render();

    // Check if current node still exists
    if (this.currentNodeId && DataModule.data.nodes[this.currentNodeId]) {
      // Current node still exists: re-display it
      EditorModule.displayNode(this.currentNodeId, () => this.render());
      showToast(t('toast.dataReloaded'), '🔄');
    } else {
      // Current node was deleted in other tab: go to root
      this.currentNodeId = null;
      this.goToRoot();
      showToast(t('toast.dataReloadedNodeDeleted'), '🔄');
    }

    // Update node counter
    this.updateNodeCounter();
  },

  /**
   * Render the tree
   */
  render() {
    TreeModule.renderTree((nodeId, instanceKey) => {
      this.selectNode(nodeId, instanceKey);
    });
    TreeModule.updateTreeFocus();

    // Disable "New Root Node" button in branch mode
    const newRootNodeBtn = document.getElementById('newRootNodeBtn');
    if (newRootNodeBtn) {
      newRootNodeBtn.disabled = TreeModule.isBranchMode();
    }
  },

  /**
   * Select a node
   */
  selectNode(nodeId, instanceKey) {
    // Save previous node before switching (to preserve unsaved changes)
    if (this.currentNodeId) {
      this.saveCurrentNode();
    }

    this.currentNodeId = nodeId;
    TreeModule.setCurrentInstanceKey(instanceKey);

    // Update URL with branch context if in branch mode
    const branchRootId = TreeModule.isBranchMode() ? TreeModule.getBranchRootId() : null;
    RoutingModule.updateHash(nodeId, branchRootId);

    // Display in editor
    EditorModule.displayNode(nodeId, () => this.render());

    // Re-render tree to update active state
    this.render();

    // Update focus AFTER tree is rendered (to find visible instance key in DOM)
    TreeModule.updateFocusAfterRender(nodeId);

    showToast(t('toast.nodeSelected'), '📄');
  },

  /**
   * Select node by ID only (for breadcrumb clicks)
   */
  selectNodeById(nodeId) {
    // Find the correct instance key by walking from root
    const instanceKey = TreeModule.findInstanceKeyForNode(nodeId);
    if (instanceKey) {
      this.selectNode(nodeId, instanceKey);
    }
  },

  /**
   * Go to root (home)
   * Activates the first root node (or branchRootId in branch mode)
   */
  goToRoot() {
    // Get the appropriate root node ID
    const targetRootId = TreeModule.isBranchMode()
      ? TreeModule.getBranchRootId()
      : DataModule.data.rootNodes[0];

    if (targetRootId) {
      // Activate the root node
      this.selectNodeById(targetRootId);
    } else {
      // No nodes available - show empty state
      this.currentNodeId = null;
      TreeModule.disableBranchMode();
      RoutingModule.updateHash(null);
      document.getElementById('emptyState').style.display = 'flex';
      document.getElementById('editorContainer').style.display = 'none';
      this.render();
    }
  },

  /**
   * Go to parent node
   */
  goToParent() {
    if (!this.currentNodeId) return;

    // Save current node before navigating
    this.saveCurrentNode();

    const node = DataModule.data.nodes[this.currentNodeId];
    if (node && node.parent) {
      this.selectNodeById(node.parent);
      showToast(t('toast.movedToParent'), '⬆️');
    } else {
      showToast(t('toast.alreadyAtRoot'), '🏠');
    }
  },

  /**
   * Update node counter display
   */
  updateNodeCounter() {
    const count = Object.keys(this.data.nodes).length;
    document.getElementById('nodeCounter').textContent = t('app.nodeCounter', { count });
  },

  /**
   * Create a root node
   */
  createRootNode() {
    EditorModule.createRootNode((nodeId) => {
      this.updateNodeCounter();

      // Re-render tree first to show the new node
      this.render();

      // Then select the new node (it will re-render again with active state)
      this.selectNodeById(nodeId);

      // Focus on title input
      setTimeout(() => {
        const titleInput = document.getElementById('nodeTitle');
        if (titleInput) {
          titleInput.select();
        }
      }, 100);
    });
  },

  /**
   * Create a child node
   */
  createChildNode() {
    if (!this.currentNodeId) {
      showToast(t('toast.selectParentFirst'), 'ℹ️');
      return;
    }

    EditorModule.createChildNode(this.currentNodeId, (nodeId) => {
      this.updateNodeCounter();

      // Re-render tree first to show the new node
      this.render();

      // Then select the new node (auto-collapse will open the path to it)
      this.selectNodeById(nodeId);

      // Focus on title input
      setTimeout(() => {
        const titleInput = document.getElementById('nodeTitle');
        if (titleInput) {
          titleInput.select();
        }
      }, 100);
    });
  },

  /**
   * Save current node
   */
  saveCurrentNode() {
    if (!this.currentNodeId) return;
    EditorModule.saveNode(this.currentNodeId);
    this.render(); // Re-render to update title in tree
  },

  /**
   * Auto-resize textarea
   */
  autoResizeTextarea(textarea) {
    EditorModule.autoResizeTextarea(textarea);
  },

  /**
   * Toggle between view and edit modes (Alt+E)
   */
  focusEditor() {
    if (!this.currentNodeId) {
      showToast(t('toast.selectNodeFirst'), 'ℹ️');
      return;
    }

    // Save current node before toggling (to preserve unsaved changes)
    this.saveCurrentNode();

    // Toggle view mode
    EditorModule.toggleViewMode();

    // If we just switched to edit mode, focus the editor
    const contentEditor = document.getElementById('nodeContent');
    if (contentEditor && contentEditor.style.display !== 'none') {
      setTimeout(() => {
        contentEditor.focus();
      }, 50);
    }
  },

  /**
   * Open search with prefilled tag
   */
  openSearchWithTag(tag) {
    SearchModule.openSearch(tag);
  },

  /**
   * Import data
   */
  async importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Detect file type and call appropriate import function
      if (file.name.endsWith('.zip')) {
        await DataModule.importDataZIP(event, (nodeCount) => {
          this.currentNodeId = null;
          this.render();
          this.updateNodeCounter();

          // Reset UI
          document.getElementById('emptyState').style.display = 'flex';
          document.getElementById('editorContainer').style.display = 'none';

          showToast(t('toast.dataImportedZIP', { count: nodeCount }), '📥');
        });
      } else {
        // Legacy JSON import
        DataModule.importData(event, (nodeCount) => {
          this.currentNodeId = null;
          this.render();
          this.updateNodeCounter();

          // Reset UI
          document.getElementById('emptyState').style.display = 'flex';
          document.getElementById('editorContainer').style.display = 'none';

          showToast(t('toast.dataImportedJSON', { count: nodeCount }), '📥');
        });
      }
    } catch (error) {
      console.error('[App] Import failed:', error);
      showToast(t('toast.importError'), '⚠️');
    }
  },

  /**
   * Export data as ZIP with attachments
   */
  async exportData() {
    try {
      await DataModule.exportDataZIP();
      showToast(t('toast.dataExported'), '💾');
    } catch (error) {
      console.error('[App] Export failed:', error);
      showToast(t('toast.exportError'), '⚠️');
    }
  },

  /**
   * Export current branch as ZIP with attachments
   */
  async exportBranch() {
    if (!this.currentNodeId) {
      showToast(t('toast.selectNodeFirst'), 'ℹ️');
      return;
    }

    try {
      await DataModule.exportBranchZIP(this.currentNodeId);
      showToast(t('toast.branchExported'), '⬇️');
    } catch (error) {
      console.error('[App] Branch export failed:', error);
      showToast(t('toast.exportError'), '⚠️');
    }
  },

  /**
   * Open export modal
   * @param {string} type - 'global' or 'branch'
   */
  openExportModal(type) {
    if (type === 'branch' && !this.currentNodeId) {
      showToast(t('toast.selectNodeFirst'), 'ℹ️');
      return;
    }

    // In branch mode, "global" export should export the current branch
    if (type === 'global' && TreeModule.isBranchMode()) {
      const branchRootId = TreeModule.getBranchRootId();
      this.exportType = 'branch';
      this.exportBranchId = branchRootId;

      // Update modal subtitle to indicate branch export
      const branchNode = this.data.nodes[branchRootId];
      const branchTitle = branchNode ? branchNode.title : '';
      const subtitle = document.getElementById('exportModalSubtitle');
      if (subtitle) {
        subtitle.textContent = t('modals.export.subtitleBranch', { branch: branchTitle });
      }
    } else if (type === 'branch') {
      this.exportType = 'branch';
      this.exportBranchId = this.currentNodeId;

      // Update modal subtitle for specific node export
      const nodeTitle = this.data.nodes[this.currentNodeId]?.title || '';
      const subtitle = document.getElementById('exportModalSubtitle');
      if (subtitle) {
        subtitle.textContent = t('modals.export.subtitleBranch', { branch: nodeTitle });
      }
    } else {
      this.exportType = 'global';
      this.exportBranchId = null;

      // Reset to default subtitle for global export
      const subtitle = document.getElementById('exportModalSubtitle');
      if (subtitle) {
        subtitle.textContent = t('modals.export.subtitle');
      }
    }

    document.getElementById('exportModal').style.display = 'flex';
  },

  /**
   * Close export modal
   */
  closeExportModal() {
    document.getElementById('exportModal').style.display = 'none';
    this.exportType = null;
    this.exportBranchId = null;
  },

  /**
   * Confirm ZIP export (global or branch)
   */
  async confirmExportZIP() {
    // Save export info before closing modal (which resets it to null)
    const type = this.exportType;
    const branchId = this.exportBranchId;
    this.closeExportModal();

    try {
      if (type === 'global') {
        await DataModule.exportDataZIP();
        showToast(t('toast.dataExported'), '💾');
      } else if (type === 'branch') {
        await DataModule.exportBranchZIP(branchId);
        showToast(t('toast.branchExported'), '⬇️');
      }
    } catch (error) {
      console.error('[App] ZIP export failed:', error);
      showToast(t('toast.exportError'), '⚠️');
    }
  },

  /**
   * Confirm FreeMind export (global or branch)
   */
  confirmExportFreeMind() {
    // Save export info before closing modal (which resets it to null)
    const type = this.exportType;
    const branchId = this.exportBranchId;
    this.closeExportModal();

    try {
      if (type === 'global') {
        DataModule.exportFreeMindMM(null);
        showToast(t('toast.freemindExported'), '🧠');
      } else if (type === 'branch') {
        DataModule.exportFreeMindMM(branchId);
        showToast(t('toast.freemindBranchExported'), '🧠');
      }
    } catch (error) {
      console.error('[App] FreeMind export failed:', error);
      showToast(t('toast.exportError'), '⚠️');
    }
  },

  /**
   * Confirm Mermaid export (SVG diagram)
   */
  async confirmExportMermaid() {
    // Save export info before closing modal (which resets it to null)
    const type = this.exportType;
    const branchId = this.exportBranchId;
    this.closeExportModal();

    try {
      if (type === 'global') {
        await DataModule.exportMermaidSVG(null);
        showToast(t('toast.mermaidExported'), '📊');
      } else if (type === 'branch') {
        await DataModule.exportMermaidSVG(branchId);
        showToast(t('toast.mermaidBranchExported'), '📊');
      }
    } catch (error) {
      console.error('[App] Mermaid export failed:', error);
      showToast(t('toast.exportError'), '⚠️');
    }
  },

  /**
   * Import branch as children of current node
   */
  async importBranch(event) {
    if (!this.currentNodeId) {
      showToast(t('toast.selectParentFirst'), 'ℹ️');
      event.target.value = ''; // Reset file input
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    try {
      // Detect file type and call appropriate import function
      if (file.name.endsWith('.zip')) {
        await DataModule.importBranchZIP(event, this.currentNodeId, (nodeCount, importedRootId) => {
          this.render();
          this.updateNodeCounter();
          showToast(t('toast.dataImportedZIP', { count: nodeCount }), '⬆️');

          // Optionally select the imported root
          if (importedRootId) {
            setTimeout(() => {
              this.selectNodeById(importedRootId);
            }, 100);
          }
        });
      } else {
        // Legacy JSON import
        DataModule.importBranch(event, this.currentNodeId, (nodeCount, importedRootId) => {
          this.render();
          this.updateNodeCounter();
          showToast(t('toast.dataImportedJSON', { count: nodeCount }), '⬆️');

          // Optionally select the imported root
          if (importedRootId) {
            setTimeout(() => {
              this.selectNodeById(importedRootId);
            }, 100);
          }
        });
      }
    } catch (error) {
      console.error('[App] Branch import failed:', error);
      showToast(t('toast.importError'), '⚠️');
    }
  },

  /**
   * Toggle sidebar
   */
  toggleSidebar() {
    PanelsModule.toggleSidebar();
  },

  /**
   * Toggle right panel
   */
  toggleRightPanel() {
    PanelsModule.toggleRightPanel();
  },

  /**
   * Share current node (copy URL to clipboard on left-click)
   * Preserves current context (branch or global)
   */
  shareNode(event) {
    if (!this.currentNodeId) {
      showToast(t('toast.selectNodeFirst'), 'ℹ️');
      return;
    }

    // Only prevent default and copy on left-click (button 0)
    // Allow middle-click (button 1) and right-click (button 2) to work normally
    if (event && event.button === 0) {
      event.preventDefault();
      const branchRootId = TreeModule.isBranchMode() ? TreeModule.getBranchRootId() : null;
      const url = RoutingModule.getShareableUrl(this.currentNodeId, branchRootId);
      navigator.clipboard.writeText(url).then(() => {
        showToast(t('toast.linkCopied'), '🔗');
      }).catch(() => {
        showToast(t('toast.copyError'), '⚠️');
      });
    }
  },

  /**
   * Share current branch (copy URL to clipboard on left-click)
   * Always creates an isolated branch URL
   */
  shareBranch(event) {
    if (!this.currentNodeId) {
      showToast(t('toast.selectNodeFirst'), 'ℹ️');
      return;
    }

    // Only prevent default and copy on left-click (button 0)
    // Allow middle-click (button 1) and right-click (button 2) to work normally
    if (event && event.button === 0) {
      event.preventDefault();
      const url = RoutingModule.getShareableBranchUrl(this.currentNodeId);
      navigator.clipboard.writeText(url).then(() => {
        showToast(t('toast.branchLinkCopied'), '🌿');
      }).catch(() => {
        showToast(t('toast.copyError'), '⚠️');
      });
    }
  },
  toggleViewMode() {
    EditorModule.toggleViewMode();
  },

  /**
   * Initialize font preference from localStorage
   */
  initFontPreference() {
    const preference = localStorage.getItem('deepmemo_fontPreference');
    // Default to system font, unless explicitly set to custom (Sto)
    if (preference !== 'custom') {
      document.body.classList.add('system-font');
    }
  },

  /**
   * Toggle font preference between custom (Sto) and system fonts
   */
  toggleFontPreference() {
    const isSystemFont = document.body.classList.contains('system-font');

    if (isSystemFont) {
      // Switch to custom font (Sto)
      document.body.classList.remove('system-font');
      localStorage.setItem('deepmemo_fontPreference', 'custom');
      showToast(t('toast.customFontEnabled'), '✨');
    } else {
      // Switch to system font
      document.body.classList.add('system-font');
      localStorage.setItem('deepmemo_fontPreference', 'system');
      showToast(t('toast.systemFontEnabled'), '🔤');
    }

    // Re-render right panel to update checkbox
    if (this.currentNodeId) {
      EditorModule.displayNode(this.currentNodeId, () => this.render());
    }
  },

  /**
   * Open action modal
   */
  openActionModal() {
    if (!this.currentNodeId) {
      showToast(t('toast.selectNodeFirst'), 'ℹ️');
      return;
    }

    ModalsModule.openActionModal(this.currentNodeId, (nextNodeId) => {
      this.render();
      this.updateNodeCounter();

      // Handle navigation after deletion
      if (nextNodeId !== undefined) {
        if (nextNodeId === null) {
          // No roots left, create a new one
          this.createRootNode();
        } else {
          // Select the next node (parent or first root)
          const instanceKey = TreeModule.findInstanceKeyForNode(nextNodeId);
          if (instanceKey) {
            this.selectNode(nextNodeId, instanceKey);
          }
        }
      }
    });
  },

  /**
   * Close action modal
   */
  closeActionModal() {
    ModalsModule.closeActionModal();
  },

  /**
   * Select action in modal
   */
  selectAction(action) {
    ModalsModule.selectAction(action, this.currentNodeId);
  },

  /**
   * Toggle action tree node
   */
  toggleActionTreeNode(instanceKey) {
    ModalsModule.toggleActionTreeNode(instanceKey, this.currentNodeId);
  },

  /**
   * Select action destination
   */
  selectActionDestination(nodeId) {
    ModalsModule.selectActionDestination(nodeId);
  },

  /**
   * Confirm action
   */
  confirmAction() {
    ModalsModule.confirmAction(this.currentNodeId, (nextNodeId) => {
      this.render();
      this.updateNodeCounter();

      // Handle navigation after deletion
      if (nextNodeId !== undefined) {
        if (nextNodeId === null) {
          // No roots left, create a new one
          this.createRootNode();
        } else {
          // Select the next node (parent or first root)
          const instanceKey = TreeModule.findInstanceKeyForNode(nextNodeId);
          if (instanceKey) {
            this.selectNode(nextNodeId, instanceKey);
          }
        }
      }
    });
  },

  /**
   * Delete current node
   */
  deleteCurrentNode() {
    if (!this.currentNodeId) return;

    EditorModule.deleteNode(this.currentNodeId, (parentId) => {
      // Navigate after deletion
      if (parentId) {
        // If deleted a child, select parent
        this.selectNodeById(parentId);
      } else {
        // If deleted a root, go to empty state
        this.currentNodeId = null;
        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('editorContainer').style.display = 'none';
      }

      this.render();
      this.updateNodeCounter();
    });
  },

  /**
   * Open symlink modal
   */
  openSymlinkModal() {
    if (!this.currentNodeId) {
      showToast(t('toast.selectNodeFirst'), 'ℹ️');
      return;
    }

    ModalsModule.openSymlinkModal(this.currentNodeId, () => {
      this.render();
      this.updateNodeCounter();
    });
  },

  /**
   * Close symlink modal
   */
  closeSymlinkModal() {
    ModalsModule.closeSymlinkModal();
  },

  /**
   * Confirm symlink
   */
  confirmSymlink() {
    ModalsModule.confirmSymlink(this.currentNodeId, () => {
      this.render();
      this.updateNodeCounter();
    });
  },

  /**
   * Open Markdown help modal
   */
  openMarkdownHelp() {
    ModalsModule.openMarkdownHelp();
  },

  /**
   * Close Markdown help modal
   */
  closeMarkdownHelp() {
    ModalsModule.closeMarkdownHelp();
  },

  /**
   * Trigger file upload input
   */
  triggerFileUpload() {
    const input = document.getElementById('attachmentFileInput');
    input.click();
  },

  /**
   * Handle attachment upload
   */
  async handleAttachmentUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size limit (50MB)
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > MAX_SIZE) {
      showToast(t('toast.fileTooBig'), '⚠️');
      event.target.value = ''; // Reset input
      return;
    }

    try {
      // Generate attachment ID
      const attachId = AttachmentsModule.generateAttachmentId();

      // Save file to IndexedDB
      await AttachmentsModule.saveAttachment(attachId, file);

      // Get current node
      const node = this.data.nodes[this.currentNodeId];
      if (!node) return;

      // For symlinks, add to target
      const targetNode = node.type === 'symlink' ? this.data.nodes[node.targetId] : node;
      if (!targetNode) return;

      // Initialize attachments array if doesn't exist
      if (!targetNode.attachments) {
        targetNode.attachments = [];
      }

      // Add attachment metadata
      targetNode.attachments.push({
        id: attachId,
        name: file.name,
        type: file.type,
        size: file.size,
        created: Date.now(),
        modified: Date.now()
      });

      // Save data
      DataModule.saveData();

      // Refresh display
      EditorModule.displayNode(this.currentNodeId, () => this.render());

      showToast(t('toast.fileAdded', { name: file.name }), '📎');
    } catch (error) {
      console.error('[App] Failed to upload attachment:', error);
      showToast(t('toast.fileAddError'), '⚠️');
    }

    // Reset input
    event.target.value = '';
  },

  /**
   * Copy attachment markdown syntax to clipboard
   */
  copyAttachmentSyntax(syntax) {
    navigator.clipboard.writeText(syntax).then(() => {
      showToast(t('toast.syntaxCopied'), '📋');
    }).catch(err => {
      console.error('[App] Failed to copy syntax:', err);
      showToast(t('toast.syntaxCopyError'), '⚠️');
    });
  },

  /**
   * Download an attachment
   */
  async downloadAttachment(attachId, filename) {
    try {
      const blob = await AttachmentsModule.getAttachment(attachId);
      if (!blob) {
        showToast(t('toast.fileNotFound'), '⚠️');
        return;
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      showToast(t('toast.downloadStarted', { name: filename }), '⬇️');
    } catch (error) {
      console.error('[App] Failed to download attachment:', error);
      showToast(t('toast.downloadError'), '⚠️');
    }
  },

  /**
   * Delete an attachment
   */
  async deleteAttachment(attachId) {
    if (!confirm(t('confirms.deleteFile'))) return;

    try {
      // Get current node
      const node = this.data.nodes[this.currentNodeId];
      if (!node) return;

      // For symlinks, delete from target
      const targetNode = node.type === 'symlink' ? this.data.nodes[node.targetId] : node;
      if (!targetNode || !targetNode.attachments) return;

      // Remove from metadata
      const index = targetNode.attachments.findIndex(a => a.id === attachId);
      if (index === -1) return;

      const attachment = targetNode.attachments[index];
      targetNode.attachments.splice(index, 1);

      // Delete from IndexedDB
      await AttachmentsModule.deleteAttachment(attachId);

      // Save data
      DataModule.saveData();

      // Refresh display
      EditorModule.displayNode(this.currentNodeId, () => this.render());

      showToast(t('toast.fileDeleted', { name: attachment.name }), '🗑️');
    } catch (error) {
      console.error('[App] Failed to delete attachment:', error);
      showToast(t('toast.fileDeleteError'), '⚠️');
    }
  },

  /**
   * Clean orphaned attachments (files not referenced by any node)
   */
  async cleanOrphanedAttachments() {
    if (!confirm(t('confirms.cleanOrphans'))) return;

    try {
      const deletedCount = await AttachmentsModule.cleanOrphans(DataModule.data);

      if (deletedCount > 0) {
        showToast(t('toast.orphansCleaned', { count: deletedCount }), '🧹');
      } else {
        showToast(t('toast.noOrphans'), '🧹');
      }

      // Refresh right panel to update storage info
      if (this.currentNodeId) {
        EditorModule.displayNode(this.currentNodeId, () => this.render());
      }
    } catch (error) {
      console.error('[App] Failed to clean orphaned attachments:', error);
      showToast(t('toast.cleanOrphansError'), '⚠️');
    }
  },

  /**
   * Clean orphaned nodes (nodes not referenced anywhere)
   */
  cleanOrphanedNodes() {
    if (!confirm(t('confirms.cleanOrphanNodes'))) return;

    try {
      const deletedCount = DataModule.cleanOrphanNodes();

      if (deletedCount > 0) {
        showToast(t('toast.orphanNodesCleaned', { count: deletedCount }), '🗑️');
        // Refresh tree and UI
        this.render();
        if (this.currentNodeId) {
          EditorModule.displayNode(this.currentNodeId, () => this.render());
        }
      } else {
        showToast(t('toast.noOrphanNodes'), 'ℹ️');
      }
    } catch (error) {
      console.error('[App] Failed to clean orphaned nodes:', error);
      showToast(t('toast.cleanOrphanNodesError'), '⚠️');
    }
  },

  /**
   * i18n - Change language and refresh UI
   */
  async changeLanguage(lang) {
    await setLanguage(lang);

    // Refresh entire UI
    this.updateNodeCounter();
    this.render();

    // Refresh current node if any
    if (this.currentNodeId) {
      EditorModule.displayNode(this.currentNodeId, () => this.render());
    }

    showToast(t('toast.languageChanged'), '🌍');
  },

  /**
   * i18n - Get current language
   */
  getCurrentLanguage() {
    return getCurrentLanguage();
  },

  /**
   * i18n - Translate key
   */
  t(key, params) {
    return t(key, params);
  }
};

// Expose app globally for onclick handlers
window.app = app;

// Expose Storage for debugging in console
window.Storage = Storage;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Export for potential module usage
export default app;
