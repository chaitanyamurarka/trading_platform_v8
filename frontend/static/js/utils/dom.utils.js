/**
 * @file utils/dom.utils.js
 * @description DOM manipulation and element management utilities
 */

/**
 * Cache for DOM elements to avoid repeated queries
 */
const elementCache = new Map();

/**
 * Get element by ID with caching
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} The element or null if not found
 */
export function getElementById(id) {
    if (!elementCache.has(id)) {
        elementCache.set(id, document.getElementById(id));
    }
    return elementCache.get(id);
}

/**
 * Get multiple elements by their IDs
 * @param {Object} idMap - Object mapping names to IDs
 * @returns {Object} Object with same keys mapped to elements
 */
export function getElementsByIds(idMap) {
    const elements = {};
    for (const [name, id] of Object.entries(idMap)) {
        elements[name] = getElementById(id);
    }
    return elements;
}

/**
 * Clear the element cache (useful when DOM changes)
 */
export function clearElementCache() {
    elementCache.clear();
}

/**
 * Check if element exists and is visible
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if element exists and is visible
 */
export function isElementVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

/**
 * Show element
 * @param {HTMLElement} element - Element to show
 * @param {string} displayType - Display type (default: 'block')
 */
export function showElement(element, displayType = 'block') {
    if (element) {
        element.style.display = displayType;
    }
}

/**
 * Hide element
 * @param {HTMLElement} element - Element to hide
 */
export function hideElement(element) {
    if (element) {
        element.style.display = 'none';
    }
}

/**
 * Toggle element visibility
 * @param {HTMLElement} element - Element to toggle
 * @param {string} displayType - Display type when showing (default: 'block')
 */
export function toggleElement(element, displayType = 'block') {
    if (element) {
        if (element.style.display === 'none') {
            showElement(element, displayType);
        } else {
            hideElement(element);
        }
    }
}

/**
 * Add class to element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class to add
 */
export function addClass(element, className) {
    if (element && className) {
        element.classList.add(className);
    }
}

/**
 * Remove class from element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class to remove
 */
export function removeClass(element, className) {
    if (element && className) {
        element.classList.remove(className);
    }
}

/**
 * Toggle class on element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class to toggle
 */
export function toggleClass(element, className) {
    if (element && className) {
        element.classList.toggle(className);
    }
}

/**
 * Set multiple attributes on element
 * @param {HTMLElement} element - Target element
 * @param {Object} attributes - Attributes to set
 */
export function setAttributes(element, attributes) {
    if (!element) return;
    
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
}

/**
 * Create element with attributes and content
 * @param {string} tag - Element tag name
 * @param {Object} options - Options object
 * @param {Object} options.attributes - Element attributes
 * @param {string} options.className - Element class name
 * @param {string} options.textContent - Element text content
 * @param {string} options.innerHTML - Element HTML content
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    if (options.attributes) {
        setAttributes(element, options.attributes);
    }
    
    if (options.className) {
        element.className = options.className;
    }
    
    if (options.textContent) {
        element.textContent = options.textContent;
    }
    
    if (options.innerHTML) {
        element.innerHTML = options.innerHTML;
    }
    
    return element;
}

/**
 * Remove all children from element
 * @param {HTMLElement} element - Parent element
 */
export function removeAllChildren(element) {
    if (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
}

/**
 * Get element dimensions
 * @param {HTMLElement} element - Target element
 * @returns {{width: number, height: number}} Element dimensions
 */
export function getElementDimensions(element) {
    if (!element) return { width: 0, height: 0 };
    
    const rect = element.getBoundingClientRect();
    return {
        width: rect.width,
        height: rect.height,
    };
}

/**
 * Check if element matches media query
 * @param {string} query - Media query string
 * @returns {boolean} True if matches
 */
export function matchesMediaQuery(query) {
    return window.matchMedia(query).matches;
}

/**
 * Debounce function for DOM events
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}