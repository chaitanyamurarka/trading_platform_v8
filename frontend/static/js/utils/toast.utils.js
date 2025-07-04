/**
 * @file utils/toast.utils.js
 * @description Toast notification utilities
 */

import { CONSTANTS } from '../core/state/constants.js';
import { createElement } from './dom.utils.js';

/**
 * Toast types and their corresponding styles
 */
const TOAST_TYPES = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
};

/**
 * Get or create toast container
 * @returns {HTMLElement} Toast container element
 */
function getToastContainer() {
    let container = document.getElementById('toast-container');
    
    if (!container) {
        container = createElement('div', {
            attributes: { id: 'toast-container' },
            className: 'fixed top-4 right-4 z-50 space-y-2',
        });
        document.body.appendChild(container);
    }
    
    return container;
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (info, success, warning, error)
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, type = 'info', duration = CONSTANTS.TOAST_DURATION) {
    const container = getToastContainer();
    
    // Create toast element
    const toast = createElement('div', {
        className: `alert ${TOAST_TYPES[type] || TOAST_TYPES.info} shadow-lg transition-opacity duration-300 opacity-0`,
        innerHTML: `<span>${message}</span>`,
    });
    
    container.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0');
        toast.classList.add('opacity-100');
    });
    
    // Auto-dismiss
    setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

/**
 * Show success toast
 * @param {string} message - Toast message
 * @param {number} duration - Duration in milliseconds
 */
export function showSuccessToast(message, duration) {
    showToast(message, 'success', duration);
}

/**
 * Show error toast
 * @param {string} message - Toast message
 * @param {number} duration - Duration in milliseconds
 */
export function showErrorToast(message, duration) {
    showToast(message, 'error', duration);
}

/**
 * Show warning toast
 * @param {string} message - Toast message
 * @param {number} duration - Duration in milliseconds
 */
export function showWarningToast(message, duration) {
    showToast(message, 'warning', duration);
}

/**
 * Show info toast
 * @param {string} message - Toast message
 * @param {number} duration - Duration in milliseconds
 */
export function showInfoToast(message, duration) {
    showToast(message, 'info', duration);
}

/**
 * Clear all toasts
 */
export function clearAllToasts() {
    const container = document.getElementById('toast-container');
    if (container) {
        container.innerHTML = '';
    }
}

// Make showToast available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.showToast = showToast;
}