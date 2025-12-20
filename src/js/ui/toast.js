/**
 * DeepMemo - Toast Notifications
 */

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} icon - Emoji icon
 */
export function showToast(message, icon) {
  const toast = document.getElementById('toast');
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMessage').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}
