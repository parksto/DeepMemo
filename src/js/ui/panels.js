/**
 * DeepMemo - Panels Module
 * Handles sidebar and right panel visibility
 */

// State
let sidebarVisible = true;
let rightPanelVisible = false; // Default: hidden (can be opened with [i] button)

/**
 * Initialize panels state from localStorage
 */
export function initPanels() {
  const savedRightPanelState = localStorage.getItem('deepmemo_rightPanelVisible');
  if (savedRightPanelState !== null) {
    rightPanelVisible = savedRightPanelState === 'true';
  }

  // Apply right panel state (whether from localStorage or default)
  if (!rightPanelVisible) {
    const panel = document.querySelector('.right-panel');
    const externalBtn = document.querySelector('.right-panel-toggle-external');
    if (panel) panel.classList.add('hidden');
    if (externalBtn) externalBtn.style.display = 'flex';
  }

  // Initialize sidebar resizer
  initSidebarResizer();
}

/**
 * Initialize sidebar resizer
 */
function initSidebarResizer() {
  const resizer = document.getElementById('sidebarResizer');
  const sidebar = document.querySelector('.sidebar');

  if (!resizer || !sidebar) return;

  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  // Load saved width
  const savedWidth = localStorage.getItem('deepmemo_sidebarWidth');
  if (savedWidth) {
    sidebar.style.width = savedWidth + 'px';
  }

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = sidebar.offsetWidth;
    resizer.classList.add('resizing');
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const delta = e.clientX - startX;
    const newWidth = startWidth + delta;
    const minWidth = 265;
    const maxWidth = 600;

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      sidebar.style.width = newWidth + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      resizer.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      // Save width
      localStorage.setItem('deepmemo_sidebarWidth', sidebar.offsetWidth);
    }
  });
}

/**
 * Toggle sidebar visibility
 */
export function toggleSidebar() {
  sidebarVisible = !sidebarVisible;
  const sidebar = document.querySelector('.sidebar');
  const externalBtn = document.querySelector('.sidebar-toggle-external');

  if (sidebar) sidebar.classList.toggle('hidden');

  // Show/hide external button
  if (externalBtn) {
    externalBtn.style.display = sidebarVisible ? 'none' : 'flex';
  }
}

/**
 * Toggle right panel visibility
 */
export function toggleRightPanel() {
  rightPanelVisible = !rightPanelVisible;
  const panel = document.querySelector('.right-panel');
  const externalBtn = document.querySelector('.right-panel-toggle-external');

  if (panel) panel.classList.toggle('hidden');

  // Show/hide external button
  if (externalBtn) {
    externalBtn.style.display = rightPanelVisible ? 'none' : 'flex';
  }

  // Save state to localStorage
  localStorage.setItem('deepmemo_rightPanelVisible', rightPanelVisible);
}

/**
 * Get sidebar visibility state
 */
export function isSidebarVisible() {
  return sidebarVisible;
}

/**
 * Get right panel visibility state
 */
export function isRightPanelVisible() {
  return rightPanelVisible;
}
