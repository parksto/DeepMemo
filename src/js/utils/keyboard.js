/**
 * DeepMemo - Keyboard Shortcuts
 */

/**
 * Setup keyboard shortcuts
 * @param {Object} handlers - Object with handler functions
 */
export function setupKeyboardShortcuts(handlers) {
  document.addEventListener('keydown', (e) => {
    // Alt+N: New node
    if (e.altKey && e.key === 'n') {
      e.preventDefault();
      if (handlers.createNode) handlers.createNode();
    }

    // Alt+E: Focus editor and switch to edit mode if needed
    if (e.altKey && e.key === 'e') {
      e.preventDefault();
      if (handlers.onEditorFocus) handlers.onEditorFocus();
    }

    // Alt+V: Toggle view/edit mode
    if (e.altKey && e.key === 'v') {
      e.preventDefault();
      if (handlers.toggleViewMode) handlers.toggleViewMode();
    }

    // Ctrl+K: Open search
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      if (handlers.openSearch) handlers.openSearch();
    }

    // Escape: Close search or go to parent
    if (e.key === 'Escape') {
      if (handlers.isSearchVisible && handlers.isSearchVisible()) {
        // Handled by search module
      } else if (handlers.goToParent) {
        e.preventDefault();
        handlers.goToParent();
      }
    }

    // Arrow keys: Tree navigation (only when not in input/textarea and search not visible)
    const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
    const isSearchVisible = handlers.isSearchVisible && handlers.isSearchVisible();

    if (!isInputFocused && !isSearchVisible && handlers.handleTreeNavigation) {
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        handlers.handleTreeNavigation(e);
      }
    }
  });
}
