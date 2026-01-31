/**
 * DeepMemo - Toast Notifications
 */

// Store timeout reference to prevent overlapping toasts
let toastTimeout = null;

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} icon - Emoji icon
 */
export function showToast(message, icon) {
  const toast = document.getElementById('toast');
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMessage').textContent = message;

  // Clear previous timeout to ensure full display duration
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toast.classList.add('show');
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    toastTimeout = null;
  }, 2000);
}
