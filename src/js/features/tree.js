/**
 * DeepMemo - Tree Rendering Module
 * Handles the tree/sidebar display of nodes
 */

import { data, saveData } from '../core/data.js';
import { showToast } from '../ui/toast.js';
import { initDragDrop } from './drag-drop.js';
import { t } from '../utils/i18n.js';

// State
let currentInstanceKey = null;
let focusedInstanceKey = null;
let branchMode = false;
let branchRootId = null;

// Set of instance keys to expand (computed dynamically based on current node)
let expandedNodes = new Set();

// Store the callback for re-rendering (needed for manual toggle in branch mode)
let renderCallback = null;

/**
 * Extract emoji from the start of a title
 * Returns {emoji: string, titleWithoutEmoji: string} or null if no emoji found
 */
function extractEmojiFromTitle(title) {
  if (!title) return null;

  // Comprehensive emoji regex covering all Unicode emoji ranges:
  // - 1F300-1F5FF: Misc Symbols and Pictographs
  // - 1F600-1F64F: Emoticons (faces)
  // - 1F680-1F6FF: Transport and Map
  // - 1F700-1F77F: Alchemical Symbols
  // - 1F780-1F7FF: Geometric Shapes Extended
  // - 1F800-1F8FF: Supplemental Arrows-C
  // - 1F900-1F9FF: Supplemental Symbols and Pictographs
  // - 1FA00-1FA6F: Chess + Extended-A
  // - 1FA70-1FAFF: Symbols and Pictographs Extended-A (includes 🪢)
  // - 1F1E0-1F1FF: Regional Indicators (flags)
  // - 2600-26FF: Miscellaneous Symbols
  // - 2700-27BF: Dingbats
  // - 2300-23FF: Miscellaneous Technical
  // - 2B00-2BFF: Miscellaneous Symbols and Arrows
  // - FE00-FE0F: Variation Selectors
  // - 1F3FB-1F3FF: Skin tone modifiers
  // - 200D: Zero Width Joiner (for composite emojis like 👨‍👩‍👧‍👦)
  // Using + to capture complete composite emojis, followed by optional whitespace
  const emojiRegex = /^([\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\uFE00-\uFE0F\u{1F3FB}-\u{1F3FF}\u200D]+)\s*/u;

  const match = title.match(emojiRegex);
  if (match) {
    return {
      emoji: match[1],
      titleWithoutEmoji: title.slice(match[0].length)
    };
  }

  return null;
}

/**
 * Get instance key for a node in the tree
 */
export function getInstanceKey(nodeId, parentContext) {
  return parentContext === null ? `${nodeId}@root` : `${nodeId}@${parentContext}`;
}

/**
 * Set current instance key and auto-collapse (clear and rebuild path)
 */
export function setCurrentInstanceKey(key) {
  currentInstanceKey = key;

  // Auto-collapse: clear all expanded nodes
  expandedNodes.clear();

  if (!key) return;

  // Extract nodeId from instance key
  const nodeId = key.split('@')[0];
  const node = data.nodes[nodeId];
  if (!node) return;

  // Build path from root (or branch root) to current node
  const path = [];
  let currentId = nodeId;
  while (currentId) {
    const n = data.nodes[currentId];
    if (!n) break;
    path.unshift(currentId);

    // In branch mode, stop at branch root
    if (branchMode && currentId === branchRootId) {
      break;
    }

    currentId = n.parent;
  }

  // Rebuild expandedNodes with only the path to current node
  let instanceKey = null;
  for (let i = 0; i < path.length; i++) {
    instanceKey = getInstanceKey(path[i], instanceKey);
    expandedNodes.add(instanceKey);
  }

  // Sync focus: find the actual instance key visible in the DOM
  // (may differ from calculated key if node is accessed via symlink)
  focusedInstanceKey = findVisibleInstanceKey(nodeId) || instanceKey;
}

/**
 * Set focused instance key
 */
export function setFocusedInstanceKey(key) {
  focusedInstanceKey = key;
}

/**
 * Update focus after tree render (finds visible instance in DOM)
 */
export function updateFocusAfterRender(nodeId) {
  // Find the visible instance key in the DOM
  const visibleKey = findVisibleInstanceKey(nodeId);
  if (visibleKey) {
    currentInstanceKey = visibleKey;
    focusedInstanceKey = visibleKey;
    updateTreeFocus();
  }
}

/**
 * Enable branch mode
 */
export function enableBranchMode(nodeId) {
  const node = data.nodes[nodeId];
  if (!node) return false;

  branchMode = true;
  branchRootId = nodeId;

  // Just expand the root node (like the old working code)
  const instanceKey = getInstanceKey(nodeId, null);
  expandedNodes.add(instanceKey);

  // Update page title for branch mode
  updatePageTitle();

  return true;
}

/**
 * Disable branch mode
 */
export function disableBranchMode() {
  branchMode = false;
  branchRootId = null;

  // Restore default page title
  updatePageTitle();
}

/**
 * Check if branch mode is enabled
 */
export function isBranchMode() {
  return branchMode;
}

/**
 * Get branch root ID
 */
export function getBranchRootId() {
  return branchRootId;
}

/**
 * Check if node is in current branch
 */
export function isNodeInBranch(nodeId) {
  if (!branchMode) return true;
  if (nodeId === branchRootId) return true;

  let current = nodeId;
  while (current) {
    if (current === branchRootId) return true;
    const node = data.nodes[current];
    if (!node) return false;
    current = node.parent;
  }

  return false;
}

/**
 * Update page title based on branch mode
 * In normal mode: "DeepMemo - Your second brain..."
 * In branch mode: "DeepMemo - [branch root node title]"
 */
export function updatePageTitle() {
  if (branchMode && branchRootId) {
    const node = data.nodes[branchRootId];
    if (node) {
      // Clean the title: remove newlines and control characters to avoid injection
      const cleanTitle = node.title.replace(/[\r\n\t]/g, ' ').trim();
      document.title = `DeepMemo - ${cleanTitle}`;
      return;
    }
  }

  // Default title (uses i18n)
  document.title = t('meta.title');
}

/**
 * Render the tree
 * @param {Function} onNodeClick - Callback when node is clicked (nodeId, instanceKey)
 */
export function renderTree(onNodeClick) {
  // Store callback for manual toggle in branch mode
  renderCallback = onNodeClick;

  const container = document.getElementById('treeContainer');
  container.innerHTML = '';

  const renderNode = (nodeId, parentContext = null) => {
    const node = data.nodes[nodeId];
    if (!node) return null;

    const isSymlink = node.type === 'symlink';

    // CYCLE DETECTION for symlinks
    if (isSymlink && node.targetId) {
      const ancestorIds = parentContext ? parentContext.split('@').filter(id => id !== 'root') : [];
      ancestorIds.push(nodeId);

      if (ancestorIds.includes(node.targetId)) {
        // Circular symlink - display without children
        const instanceKey = getInstanceKey(nodeId, parentContext);
        const isActive = instanceKey === currentInstanceKey;

        const div = document.createElement('div');
        div.className = 'tree-node';
        const content = document.createElement('div');
        content.className = 'tree-node-content circular-symlink' + (isActive ? ' active' : '');
        content.setAttribute('data-node-id', nodeId);
        content.setAttribute('data-instance-key', instanceKey);
        content.innerHTML = '<span style="width:16px"></span><span class="tree-node-icon">🔄</span><span class="tree-node-title user-content" style="opacity:0.5">' + node.title + ' (' + t('nodeTypes.badge.circular') + ')</span>';

        content.onclick = () => {
          currentInstanceKey = instanceKey;
          focusedInstanceKey = instanceKey;
          if (onNodeClick) onNodeClick(nodeId, instanceKey);
        };

        div.appendChild(content);
        return div;
      }
    }

    // EXTERNAL SYMLINK check
    // A symlink is external if its TARGET exists but is outside the branch
    let isExternalSymlink = false;
    if (isSymlink && node.targetId && branchMode) {
      const targetNode = data.nodes[node.targetId];
      if (targetNode) {
        // Check if target node is in the branch by walking up its parent chain
        isExternalSymlink = !isNodeInBranch(node.targetId);
      }
      // Note: if targetNode doesn't exist, it's a broken symlink, NOT an external one
    }

    // Get display node (target for symlinks)
    const displayNode = isSymlink ? data.nodes[node.targetId] : node;
    if (!displayNode) {
      // Broken symlink
      const instanceKey = getInstanceKey(nodeId, parentContext);
      const isActive = instanceKey === currentInstanceKey;

      const div = document.createElement('div');
      div.className = 'tree-node';
      const content = document.createElement('div');
      content.className = 'tree-node-content broken-symlink' + (isActive ? ' active' : '');
      content.setAttribute('data-node-id', nodeId);
      content.setAttribute('data-instance-key', instanceKey);
      content.innerHTML = '<span style="width:16px"></span><span class="tree-node-icon">⚠️</span><span class="tree-node-title user-content" style="opacity:0.5">' + node.title + ' (' + t('nodeTypes.badge.broken') + ')</span>';

      content.onclick = () => {
        currentInstanceKey = instanceKey;
        focusedInstanceKey = instanceKey;
        if (onNodeClick) onNodeClick(nodeId, instanceKey);
      };

      div.appendChild(content);
      return div;
    }

    const instanceKey = getInstanceKey(nodeId, parentContext);
    const isActive = instanceKey === currentInstanceKey;
    // External symlinks shouldn't show children (act as "dead leaves")
    const hasChildren = !isExternalSymlink && displayNode.children.length > 0;

    const div = document.createElement('div');
    const isExpanded = expandedNodes.has(instanceKey);
    div.className = 'tree-node' + (isExpanded ? ' expanded' : '');
    if (isSymlink) div.classList.add('symlink-node');

    const content = document.createElement('div');
    content.className = 'tree-node-content' + (isActive ? ' active' : '');
    content.setAttribute('data-node-id', nodeId);
    content.setAttribute('data-instance-key', instanceKey);

    // Toggle arrow (not shown for external symlinks)
    if (hasChildren) {
      const toggle = document.createElement('span');
      toggle.className = 'tree-node-toggle';
      toggle.textContent = isExpanded ? '▼' : '▶';
      toggle.style.cursor = 'pointer';

      toggle.onclick = (e) => {
        e.stopPropagation();

        // Toggle works the same in both modes - expand/collapse without selecting
        if (isExpanded) {
          expandedNodes.delete(instanceKey);
        } else {
          expandedNodes.add(instanceKey);
        }

        // Re-render to show the change
        if (renderCallback) {
          renderTree(renderCallback);
        }
      };

      content.appendChild(toggle);
    } else {
      const spacer = document.createElement('span');
      spacer.style.width = '16px';
      content.appendChild(spacer);
    }

    // Extract emoji from title (for all nodes, including symlinks)
    let nodeEmoji = null;
    let displayTitle = node.title;
    const extracted = extractEmojiFromTitle(node.title);
    if (extracted) {
      nodeEmoji = extracted.emoji;
      displayTitle = extracted.titleWithoutEmoji;
    }

    // Icon
    const icon = document.createElement('span');
    icon.className = 'tree-node-icon';
    if (isSymlink) {
      // Symlinks: use custom emoji if present, otherwise default 🔗 or 🔗🚫
      if (nodeEmoji) {
        icon.textContent = nodeEmoji;
      } else {
        icon.textContent = isExternalSymlink ? '🔗🚫' : '🔗';
      }
    } else {
      // Regular nodes: use custom emoji or default 📄
      icon.textContent = nodeEmoji || '📄';
    }
    content.appendChild(icon);

    // Title
    const title = document.createElement('span');
    title.className = 'tree-node-title user-content';
    title.textContent = displayTitle;

    if (isExternalSymlink) {
      title.style.opacity = '0.4';
      title.style.fontStyle = 'italic';
    }

    content.appendChild(title);

    // Badge for symlinks
    if (isSymlink) {
      const badge = document.createElement('span');
      badge.className = 'symlink-badge';
      badge.textContent = isExternalSymlink ? 'externe' : 'lien';
      if (isExternalSymlink) {
        badge.style.opacity = '0.5';
      }
      content.appendChild(badge);
    }

    // Click handler
    content.onclick = () => {
      currentInstanceKey = instanceKey;
      focusedInstanceKey = instanceKey;
      if (onNodeClick) onNodeClick(nodeId, instanceKey);

      // Show toast for external symlinks (but still allow selection for deletion)
      if (isExternalSymlink) {
        showToast(t('toast.externalSymlink'), '🚫');
      }
    };

    // Drag & Drop (only if not an external symlink)
    if (!isExternalSymlink) {
      initDragDrop(content, nodeId, () => {
        // Re-render tree after drop
        if (renderCallback) {
          renderTree(renderCallback);
        }
      });
    }

    div.appendChild(content);

    // Children
    if (hasChildren) {
      const childrenDiv = document.createElement('div');
      childrenDiv.className = 'tree-node-children';

      displayNode.children.forEach(childId => {
        const childElement = renderNode(childId, instanceKey);
        if (childElement) childrenDiv.appendChild(childElement);
      });

      div.appendChild(childrenDiv);
    }

    return div;
  };

  // Render roots (or branch root in branch mode)
  const rootNodesToRender = branchMode ? [branchRootId] : data.rootNodes;

  rootNodesToRender.forEach(nodeId => {
    const element = renderNode(nodeId, null);
    if (element) container.appendChild(element);
  });
}

/**
 * Expand tree node
 */
export function expandTreeNode(instanceKey) {
  expandedNodes.add(instanceKey);
}

/**
 * Collapse tree node
 */
export function collapseTreeNode(instanceKey) {
  expandedNodes.delete(instanceKey);
}

/**
 * Find the instance key for a node by walking from root
 * This is needed because a node's instance key depends on its parent context
 * In branch mode, walks from branch root instead of global root
 */
export function findInstanceKeyForNode(targetNodeId) {
  const node = data.nodes[targetNodeId];
  if (!node) return null;

  // In branch mode, check if target node is in the branch
  if (branchMode) {
    if (!isNodeInBranch(targetNodeId)) {
      // Node is outside the branch - can't build instance key
      return null;
    }
  }

  // Build path from root (or branch root) to target node
  const path = [];
  let currentId = targetNodeId;
  while (currentId) {
    const n = data.nodes[currentId];
    if (!n) break;
    path.unshift(currentId);

    // In branch mode, stop at branch root
    if (branchMode && currentId === branchRootId) {
      break;
    }

    currentId = n.parent;
  }

  // Build instance key by walking the path
  let instanceKey = null;
  for (let i = 0; i < path.length; i++) {
    instanceKey = getInstanceKey(path[i], instanceKey);
  }

  return instanceKey;
}

/**
 * Find visible instance key for a node ID in the current tree
 * (useful when node appears multiple times via symlinks)
 */
function findVisibleInstanceKey(nodeId) {
  const container = document.getElementById('treeContainer');
  if (!container) return null;

  // Find all instances of this node in the visible tree
  const elements = container.querySelectorAll(`[data-node-id="${nodeId}"]`);

  for (const el of elements) {
    // Check if element is visible (not in collapsed section)
    let parent = el.parentElement;
    let isVisible = true;

    while (parent && parent !== container) {
      if (parent.classList.contains('tree-node-children')) {
        const parentTreeNode = parent.parentElement;
        if (parentTreeNode && !parentTreeNode.classList.contains('expanded')) {
          isVisible = false;
          break;
        }
      }
      parent = parent.parentElement;
    }

    if (isVisible) {
      const instanceKey = el.getAttribute('data-instance-key');
      if (instanceKey) {
        return instanceKey;
      }
    }
  }

  return null;
}

/**
 * Get all visible tree nodes (instance keys) in order
 */
export function getVisibleTreeNodes() {
  const visible = [];
  const container = document.getElementById('treeContainer');
  if (!container) return visible;

  // Find all tree node content elements that are actually visible (not in collapsed sections)
  const elements = container.querySelectorAll('.tree-node-content');
  elements.forEach(el => {
    // Check if element is visible by checking if any parent .tree-node is collapsed
    let parent = el.parentElement;
    let isVisible = true;

    while (parent && parent !== container) {
      // If we're in a .tree-node-children, check if parent .tree-node is expanded
      if (parent.classList.contains('tree-node-children')) {
        const parentTreeNode = parent.parentElement;
        if (parentTreeNode && !parentTreeNode.classList.contains('expanded')) {
          isVisible = false;
          break;
        }
      }
      parent = parent.parentElement;
    }

    if (isVisible) {
      const instanceKey = el.getAttribute('data-instance-key');
      if (instanceKey) {
        visible.push(instanceKey);
      }
    }
  });

  return visible;
}

/**
 * Update tree focus visual indicator
 */
export function updateTreeFocus() {
  // Remove all focused and active classes
  document.querySelectorAll('.tree-node-content.focused').forEach(el => {
    el.classList.remove('focused');
  });
  document.querySelectorAll('.tree-node-content.active').forEach(el => {
    el.classList.remove('active');
  });

  // Add focused class to current keyboard focus
  if (focusedInstanceKey) {
    const element = document.querySelector(`[data-instance-key="${focusedInstanceKey}"]`);
    if (element) {
      element.classList.add('focused');
    }
  }

  // Add active class to current selected node
  if (currentInstanceKey) {
    const element = document.querySelector(`[data-instance-key="${currentInstanceKey}"]`);
    if (element) {
      element.classList.add('active');
    }
  }
}

/**
 * Scroll tree node into view
 */
function scrollTreeNodeIntoView(instanceKey) {
  const element = document.querySelector(`[data-instance-key="${instanceKey}"]`);
  if (element) {
    element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

/**
 * Handle tree navigation with keyboard
 */
export function handleTreeNavigation(e, selectNodeCallback, renderCallback) {
  const visibleNodes = getVisibleTreeNodes();
  if (visibleNodes.length === 0) return;

  // If no node focused, focus the first one
  if (!focusedInstanceKey) {
    if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
      e.preventDefault();
      focusedInstanceKey = visibleNodes[0];
      updateTreeFocus();
    }
    return;
  }

  const currentIndex = visibleNodes.indexOf(focusedInstanceKey);
  if (currentIndex === -1) return;

  // Extract nodeId from instance key
  const nodeId = focusedInstanceKey.split('@')[0];

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      if (currentIndex < visibleNodes.length - 1) {
        focusedInstanceKey = visibleNodes[currentIndex + 1];
        updateTreeFocus();
        scrollTreeNodeIntoView(focusedInstanceKey);
      }
      break;

    case 'ArrowUp':
      e.preventDefault();
      if (currentIndex > 0) {
        focusedInstanceKey = visibleNodes[currentIndex - 1];
        updateTreeFocus();
        scrollTreeNodeIntoView(focusedInstanceKey);
      }
      break;

    case 'ArrowRight':
      e.preventDefault();
      // Expand the focused node (both modes work the same)
      expandTreeNode(focusedInstanceKey);
      if (renderCallback) renderCallback();
      break;

    case 'ArrowLeft':
      e.preventDefault();
      // Collapse or go to parent (both modes work the same)
      const element = document.querySelector(`[data-instance-key="${focusedInstanceKey}"]`);
      const treeNode = element?.closest('.tree-node');
      const isExpanded = treeNode?.classList.contains('expanded');
      const node = data.nodes[nodeId];
      const displayNode = node?.type === 'symlink' ? data.nodes[node.targetId] : node;
      const hasChildren = displayNode && displayNode.children.length > 0;

      if (isExpanded && hasChildren) {
        // Collapse if expanded - stay on this node
        collapseTreeNode(focusedInstanceKey);
        if (renderCallback) renderCallback();
      } else {
        // Go to parent if not expanded or no children
        const atIndex = focusedInstanceKey.indexOf('@');
        if (atIndex !== -1) {
          const parentContext = focusedInstanceKey.substring(atIndex + 1);
          if (parentContext !== 'root') {
            const parentId = parentContext.split('@')[0];
            const parentInstanceKey = findInstanceKeyForNode(parentId);
            if (parentInstanceKey) {
              focusedInstanceKey = parentInstanceKey;
              updateTreeFocus();
              scrollTreeNodeIntoView(focusedInstanceKey);
            }
          }
        }
      }
      break;

    case 'Enter':
      e.preventDefault();
      // Select the focused node (allow selection of external symlinks for deletion)
      const focusedNode = data.nodes[nodeId];
      if (focusedNode) {
        // Check if it's an external symlink
        const isSymlink = focusedNode.type === 'symlink';
        let isExternalSymlink = false;
        if (isSymlink && focusedNode.targetId && branchMode) {
          const targetNode = data.nodes[focusedNode.targetId];
          if (targetNode) {
            isExternalSymlink = !isNodeInBranch(focusedNode.targetId);
          }
          // If targetNode doesn't exist, it's broken, not external
        }

        // Always allow selection (even for external symlinks)
        if (selectNodeCallback) {
          selectNodeCallback(nodeId, focusedInstanceKey);
        }

        // Show toast for external symlinks
        if (isExternalSymlink) {
          showToast(t('toast.externalSymlink'), '🚫');
        }
      }
      break;
  }
}
