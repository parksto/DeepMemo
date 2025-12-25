/**
 * DeepMemo V0.8 - Main Application Entry Point
 * Modular ES6 version
 */

import { generateId, escapeHtml } from './utils/helpers.js';
import { setupKeyboardShortcuts } from './utils/keyboard.js';
import * as RoutingModule from './utils/routing.js';
import * as DataModule from './core/data.js';
import { showToast } from './ui/toast.js';
import * as PanelsModule from './ui/panels.js';
import * as TreeModule from './features/tree.js';
import * as EditorModule from './features/editor.js';
import * as SearchModule from './features/search.js';
import * as TagsModule from './features/tags.js';
import * as ModalsModule from './features/modals.js';
import * as DragDropModule from './features/drag-drop.js';
import * as AttachmentsModule from './core/attachments.js';

/**
 * Main Application Object
 * Exposed globally for compatibility with onclick handlers in HTML
 */
const app = {
  // State
  data: DataModule.data,
  currentNodeId: null,
  expandedNodes: DataModule.expandedNodes,

  /**
   * Initialize the application
   */
  async init() {
    console.log('🚀 DeepMemo V0.8 - Initialisation...');

    // Initialize IndexedDB for attachments
    if (AttachmentsModule.isIndexedDBAvailable()) {
      try {
        await AttachmentsModule.initDB();
        console.log('[App] IndexedDB initialized for attachments');
      } catch (error) {
        console.error('[App] IndexedDB failed to initialize:', error);
        showToast('⚠️ Attachments non disponibles (IndexedDB)', '⚠️');
      }
    } else {
      console.warn('[App] IndexedDB not available (private mode?)');
    }

    // Load data from localStorage
    DataModule.loadData();

    // Initialize panels and view mode
    PanelsModule.initPanels();
    EditorModule.initViewMode();
    this.initFontPreference();

    // Setup search input handler
    SearchModule.setupSearchInput();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts({
      createNode: () => this.currentNodeId ? this.createChildNode() : this.createRootNode(),
      openSearch: () => SearchModule.openSearch(),
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

    // Test toast
    showToast('Application initialisée', '🎉');

    // Update node counter
    this.updateNodeCounter();
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
        showToast('Nœud racine de branche introuvable', '⚠️');
        return;
      }
      TreeModule.enableBranchMode(branchRootId);
      this.render();
      showToast('Mode branche activé', '🌿');
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
      showToast('Nœud introuvable', '⚠️');
      return;
    }

    // Select the node
    this.selectNodeById(nodeId);
  },

  /**
   * Render the tree
   */
  render() {
    TreeModule.renderTree((nodeId, instanceKey) => {
      this.selectNode(nodeId, instanceKey);
    });
    TreeModule.updateTreeFocus();
  },

  /**
   * Select a node
   */
  selectNode(nodeId, instanceKey) {
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

    showToast('Nœud sélectionné', '📄');
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
    const node = DataModule.data.nodes[this.currentNodeId];
    if (node && node.parent) {
      this.selectNodeById(node.parent);
      showToast('Remonté au parent', '⬆️');
    } else {
      showToast('Déjà à la racine', '🏠');
    }
  },

  /**
   * Update node counter display
   */
  updateNodeCounter() {
    const count = Object.keys(this.data.nodes).length;
    document.getElementById('nodeCounter').textContent = `${count} nœud${count > 1 ? 's' : ''}`;
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
      showToast('Sélectionne d\'abord un nœud parent', 'ℹ️');
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
      showToast('Sélectionne d\'abord un nœud', 'ℹ️');
      return;
    }

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
  importData(event) {
    DataModule.importData(event, (nodeCount) => {
      this.currentNodeId = null;
      this.render();
      this.updateNodeCounter();

      // Reset UI
      document.getElementById('emptyState').style.display = 'flex';
      document.getElementById('editorContainer').style.display = 'none';

      showToast(`${nodeCount} nœud(s) importés`, '📥');
    });
  },

  /**
   * Export data
   */
  exportData() {
    DataModule.exportData();
    showToast('Données exportées', '💾');
  },

  /**
   * Export current branch
   */
  exportBranch() {
    if (!this.currentNodeId) {
      showToast('Sélectionne d\'abord un nœud', 'ℹ️');
      return;
    }

    DataModule.exportBranch(this.currentNodeId);
    showToast('Branche exportée', '⬇️');
  },

  /**
   * Import branch as children of current node
   */
  importBranch(event) {
    if (!this.currentNodeId) {
      showToast('Sélectionne d\'abord un nœud parent', 'ℹ️');
      event.target.value = ''; // Reset file input
      return;
    }

    DataModule.importBranch(event, this.currentNodeId, (nodeCount, importedRootId) => {
      this.render();
      this.updateNodeCounter();
      showToast(`${nodeCount} nœud(s) importés`, '⬆️');

      // Optionally select the imported root
      if (importedRootId) {
        setTimeout(() => {
          this.selectNodeById(importedRootId);
        }, 100);
      }
    });
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
      showToast('Sélectionne d\'abord un nœud', 'ℹ️');
      return;
    }

    // Only prevent default and copy on left-click (button 0)
    // Allow middle-click (button 1) and right-click (button 2) to work normally
    if (event && event.button === 0) {
      event.preventDefault();
      const branchRootId = TreeModule.isBranchMode() ? TreeModule.getBranchRootId() : null;
      const url = RoutingModule.getShareableUrl(this.currentNodeId, branchRootId);
      navigator.clipboard.writeText(url).then(() => {
        showToast('Lien copié dans le presse-papier', '🔗');
      }).catch(() => {
        showToast('Erreur lors de la copie', '⚠️');
      });
    }
  },

  /**
   * Share current branch (copy URL to clipboard on left-click)
   * Always creates an isolated branch URL
   */
  shareBranch(event) {
    if (!this.currentNodeId) {
      showToast('Sélectionne d\'abord un nœud', 'ℹ️');
      return;
    }

    // Only prevent default and copy on left-click (button 0)
    // Allow middle-click (button 1) and right-click (button 2) to work normally
    if (event && event.button === 0) {
      event.preventDefault();
      const url = RoutingModule.getShareableBranchUrl(this.currentNodeId);
      navigator.clipboard.writeText(url).then(() => {
        showToast('Lien de branche copié dans le presse-papier', '🌿');
      }).catch(() => {
        showToast('Erreur lors de la copie', '⚠️');
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
    if (preference === 'system') {
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
      showToast('Police personnalisée activée', '✨');
    } else {
      // Switch to system font
      document.body.classList.add('system-font');
      localStorage.setItem('deepmemo_fontPreference', 'system');
      showToast('Police système activée', '🔤');
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
      showToast('Sélectionne d\'abord un nœud', 'ℹ️');
      return;
    }

    ModalsModule.openActionModal(this.currentNodeId, () => {
      this.render();
      this.updateNodeCounter();
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
    ModalsModule.confirmAction(this.currentNodeId, () => {
      this.render();
      this.updateNodeCounter();
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
      showToast('Sélectionne d\'abord un nœud', 'ℹ️');
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
      showToast(`❌ Fichier trop volumineux (max 50MB)`, '⚠️');
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

      showToast(`✅ Fichier ajouté : ${file.name}`, '📎');
    } catch (error) {
      console.error('[App] Failed to upload attachment:', error);
      showToast('❌ Erreur lors de l\'ajout du fichier', '⚠️');
    }

    // Reset input
    event.target.value = '';
  },

  /**
   * Download an attachment
   */
  async downloadAttachment(attachId, filename) {
    try {
      const blob = await AttachmentsModule.getAttachment(attachId);
      if (!blob) {
        showToast('❌ Fichier introuvable', '⚠️');
        return;
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      showToast(`✅ Téléchargement : ${filename}`, '⬇️');
    } catch (error) {
      console.error('[App] Failed to download attachment:', error);
      showToast('❌ Erreur lors du téléchargement', '⚠️');
    }
  },

  /**
   * Delete an attachment
   */
  async deleteAttachment(attachId) {
    if (!confirm('Supprimer ce fichier ?')) return;

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

      showToast(`✅ Fichier supprimé : ${attachment.name}`, '🗑️');
    } catch (error) {
      console.error('[App] Failed to delete attachment:', error);
      showToast('❌ Erreur lors de la suppression', '⚠️');
    }
  }
};

// Expose app globally for onclick handlers
window.app = app;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Export for potential module usage
export default app;
