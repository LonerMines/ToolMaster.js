/**
 * ToolMaster.js - Ultimate Utility Library for Developers
 * Version 4.2.0 
 * Дата: 2025-07-06
 * GitHub: https://github.com/Leha2cool
 */

(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    global.ToolMaster = factory();
  }
})(this, () => {
  // ============================== CORE UTILITIES ==============================
  const ToolMaster = {
    VERSION: '4.2.0',
    isBrowser: typeof window !== 'undefined',
    isNode: typeof process !== 'undefined' && process.versions?.node,
    
    // ========================= DATA MANIPULATION =========================
    /**
     * Deep clone objects/arrays
     * @param {any} data - Input data
     * @returns {any} Deep clone
     */
    clone(data) {
      if (data === null || typeof data !== 'object') return data;
      const result = Array.isArray(data) ? [] : {};
      for (const key in data) {
        result[key] = this.clone(data[key]);
      }
      return result;
    },

    /**
     * Deep merge multiple objects
     * @param {...Object} objects - Objects to merge
     * @returns {Object} Merged object
     */
    merge(...objects) {
      const result = {};
      const mergeFn = (target, source) => {
        for (const key in source) {
          if (source[key] instanceof Object && key in target) {
            mergeFn(target[key], source[key]);
          } else {
            target[key] = this.clone(source[key]);
          }
        }
      };
      
      objects.forEach(obj => mergeFn(result, obj));
      return result;
    },

    // ========================= FUNCTION UTILITIES =========================
    /**
     * Debounce function execution
     * @param {Function} fn - Function to debounce
     * @param {number} delay - Delay in ms
     * @param {boolean} immediate - Execute immediately
     * @returns {Function} Debounced function
     */
    debounce(fn, delay = 300, immediate = false) {
      let timer;
      return (...args) => {
        if (immediate && !timer) fn(...args);
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (!immediate) fn(...args);
          timer = null;
        }, delay);
      };
    },

    /**
     * Throttle function execution
     * @param {Function} fn - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {Function} Throttled function
     */
    throttle(fn, limit = 300) {
      let lastCall = 0;
      return (...args) => {
        const now = Date.now();
        if (now - lastCall >= limit) {
          fn(...args);
          lastCall = now;
        }
      };
    },

    /**
     * Memoize expensive functions
     * @param {Function} fn - Function to memoize
     * @returns {Function} Memoized function
     */
    memoize(fn) {
      const cache = new Map();
      return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn(...args);
        cache.set(key, result);
        return result;
      };
    },

    // ========================= ASYNC UTILITIES =========================
    /**
     * Async retry with exponential backoff
     * @param {Function} fn - Async function
     * @param {number} retries - Max retries
     * @param {number} delay - Initial delay
     * @returns {Promise} Result promise
     */
    async retry(fn, retries = 3, delay = 1000) {
      try {
        return await fn();
      } catch (error) {
        if (retries <= 0) throw error;
        await new Promise(res => setTimeout(res, delay));
        return this.retry(fn, retries - 1, delay * 2);
      }
    },

    /**
     * Run promises in parallel with concurrency limit
     * @param {Array<Function>} tasks - Async functions
     * @param {number} concurrency - Max parallel
     * @returns {Promise<Array>} Results array
     */
    async parallel(tasks, concurrency = 5) {
      const results = [];
      const executing = new Set();
      
      for (const [i, task] of tasks.entries()) {
        const promise = Promise.resolve().then(task);
        results[i] = promise;
        const cleanup = () => executing.delete(promise);
        promise.then(cleanup).catch(cleanup);
        executing.add(promise);
        
        if (executing.size >= concurrency) {
          await Promise.race(executing);
        }
      }
      
      return Promise.all(results);
    },

    // ========================= STRING UTILITIES =========================
    /**
     * Generate UUID v4
     * @returns {string} UUID
     */
    uuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },

    /**
     * Generate random string
     * @param {number} length - String length
     * @param {string} charset - Character set
     * @returns {string} Random string
     */
    randomString(length = 10, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      return result;
    },

    // ========================= OBJECT UTILITIES =========================
    /**
     * Deep object comparison
     * @param {Object} a - First object
     * @param {Object} b - Second object
     * @returns {boolean} True if equal
     */
    deepEqual(a, b) {
      if (a === b) return true;
      if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
      
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      
      return keysA.every(key => 
        Object.prototype.hasOwnProperty.call(b, key) && 
        this.deepEqual(a[key], b[key])
      );
    },

    /**
     * Object deep diff
     * @param {Object} oldObj - Original object
     * @param {Object} newObj - Changed object
     * @returns {Object} Differences
     */
    objectDiff(oldObj, newObj) {
      const diff = {};
      const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
      
      for (const key of allKeys) {
        if (!this.deepEqual(oldObj[key], newObj[key])) {
          if (typeof oldObj[key] === 'object' && typeof newObj[key] === 'object') {
            const nestedDiff = this.objectDiff(oldObj[key] || {}, newObj[key] || {});
            if (Object.keys(nestedDiff).length > 0) {
              diff[key] = nestedDiff;
            }
          } else {
            diff[key] = newObj[key];
          }
        }
      }
      
      return diff;
    },

    // ========================= ARRAY UTILITIES =========================
    /**
     * Array shuffle (Fisher-Yates)
     * @param {Array} array - Input array
     * @returns {Array} Shuffled array
     */
    shuffle(array) {
      const result = [...array];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    },

    /**
     * Array chunking
     * @param {Array} array - Input array
     * @param {number} size - Chunk size
     * @returns {Array<Array>} Chunked array
     */
    chunk(array, size) {
      const chunks = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    },

    // ========================= DATE UTILITIES =========================
    /**
     * Format date
     * @param {Date} date - Date object
     * @param {string} format - Format string
     * @returns {string} Formatted date
     */
    formatDate(date = new Date(), format = 'YYYY-MM-DD HH:mm:ss') {
      const map = {
        YYYY: date.getFullYear(),
        MM: String(date.getMonth() + 1).padStart(2, '0'),
        DD: String(date.getDate()).padStart(2, '0'),
        HH: String(date.getHours()).padStart(2, '0'),
        mm: String(date.getMinutes()).padStart(2, '0'),
        ss: String(date.getSeconds()).padStart(2, '0'),
      };
      
      return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => map[match]);
    },

    /**
     * Calculate time difference
     * @param {Date} start - Start date
     * @param {Date} end - End date
     * @returns {Object} Time units
     */
    timeDiff(start, end = new Date()) {
      const diff = Math.abs(end - start);
      return {
        milliseconds: diff,
        seconds: Math.floor(diff / 1000),
        minutes: Math.floor(diff / (1000 * 60)),
        hours: Math.floor(diff / (1000 * 60 * 60)),
        days: Math.floor(diff / (1000 * 60 * 60 * 24))
      };
    },

    // ========================= BROWSER UTILITIES =========================
    /**
     * Query selector with optional scope
     * @param {string} selector - CSS selector
     * @param {Element} scope - Root element
     * @returns {Element|null} Found element
     */
    $(selector, scope = document) {
      return scope.querySelector(selector);
    },

    /**
     * Query selector all with optional scope
     * @param {string} selector - CSS selector
     * @param {Element} scope - Root element
     * @returns {NodeList} Found elements
     */
    $$(selector, scope = document) {
      return scope.querySelectorAll(selector);
    },

    /**
     * Create DOM element
     * @param {string} tag - HTML tag
     * @param {Object} attributes - Element attributes
     * @param {string|Array} content - Element content
     * @returns {HTMLElement} Created element
     */
    createElement(tag, attributes = {}, content = '') {
      const element = document.createElement(tag);
      
      for (const [key, value] of Object.entries(attributes)) {
        if (key === 'class') {
          element.className = value;
        } else if (key === 'dataset') {
          Object.assign(element.dataset, value);
        } else if (key.startsWith('on')) {
          element.addEventListener(key.substring(2), value);
        } else {
          element.setAttribute(key, value);
        }
      }
      
      if (typeof content === 'string') {
        element.textContent = content;
      } else if (Array.isArray(content)) {
        content.forEach(child => {
          if (child instanceof Node) element.appendChild(child);
        });
      }
      
      return element;
    },

    // ========================= STORAGE UTILITIES =========================
    /**
     * LocalStorage with expiration
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @param {number} ttl - Time to live (seconds)
     */
    setLocal(key, value, ttl = 0) {
      const data = {
        value,
        expires: ttl ? Date.now() + ttl * 1000 : 0
      };
      localStorage.setItem(key, JSON.stringify(data));
    },

    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @returns {any|null} Stored value
     */
    getLocal(key) {
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      try {
        const parsed = JSON.parse(data);
        if (parsed.expires && Date.now() > parsed.expires) {
          localStorage.removeItem(key);
          return null;
        }
        return parsed.value;
      } catch {
        return null;
      }
    },

    // ========================= VALIDATION UTILITIES =========================
    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} Validation result
     */
    isEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    },

    /**
     * Validate data with schema
     * @param {Object} data - Input data
     * @param {Object} schema - Validation schema
     * @returns {Object} Validation result
     */
    validate(data, schema) {
      const errors = {};
      
      for (const [key, rules] of Object.entries(schema)) {
        const value = data[key];
        
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors[key] = rules.message || `${key} is required`;
          continue;
        }
        
        if (value === undefined || value === null) continue;
        
        if (rules.type && typeof value !== rules.type) {
          errors[key] = rules.message || `${key} must be ${rules.type}`;
        }
        
        if (rules.min !== undefined && value < rules.min) {
          errors[key] = rules.message || `${key} must be at least ${rules.min}`;
        }
        
        if (rules.max !== undefined && value > rules.max) {
          errors[key] = rules.message || `${key} must be at most ${rules.max}`;
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          errors[key] = rules.message || `${key} is invalid`;
        }
        
        if (rules.validator && !rules.validator(value)) {
          errors[key] = rules.message || `${key} is invalid`;
        }
      }
      
      return {
        valid: Object.keys(errors).length === 0,
        errors
      };
    },

    // ========================= CRYPTO UTILITIES =========================
    /**
     * Simple hash function
     * @param {string} str - Input string
     * @returns {string} Hash string
     */
    hash(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(16);
    },

    /**
     * Generate HMAC signature
     * @param {string} message - Message to sign
     * @param {string} secret - Secret key
     * @returns {string} HMAC signature
     */
    hmac(message, secret) {
      if (this.isBrowser) {
        const encoder = new TextEncoder();
        const key = encoder.encode(secret);
        const data = encoder.encode(message);
        
        return crypto.subtle.importKey(
          'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
        ).then(cryptoKey => 
          crypto.subtle.sign('HMAC', cryptoKey, data)
        ).then(signature => 
          Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
        );
      } else {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(message);
        return hmac.digest('hex');
      }
    },

    // ========================= MATH UTILITIES =========================
    /**
     * Generate random number in range
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {boolean} integer - Return integer
     * @returns {number} Random number
     */
    random(min = 0, max = 1, integer = false) {
      const value = Math.random() * (max - min) + min;
      return integer ? Math.floor(value) : value;
    },

    /**
     * Clamp number between min and max
     * @param {number} value - Input value
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    },

    // ========================= EVENT SYSTEM =========================
    /**
     * Event bus implementation
     */
    events: {
      _listeners: new Map(),
      
      /**
       * Subscribe to event
       * @param {string} event - Event name
       * @param {Function} listener - Event listener
       */
      on(event, listener) {
        if (!this._listeners.has(event)) {
          this._listeners.set(event, new Set());
        }
        this._listeners.get(event).add(listener);
      },
      
      /**
       * Unsubscribe from event
       * @param {string} event - Event name
       * @param {Function} listener - Event listener
       */
      off(event, listener) {
        if (this._listeners.has(event)) {
          this._listeners.get(event).delete(listener);
        }
      },
      
      /**
       * Emit event
       * @param {string} event - Event name
       * @param {...any} args - Event arguments
       */
      emit(event, ...args) {
        if (this._listeners.has(event)) {
          this._listeners.get(event).forEach(listener => {
            try {
              listener(...args);
            } catch (error) {
              console.error(`Event error: ${event}`, error);
            }
          });
        }
      },
      
      /**
       * Subscribe once to event
       * @param {string} event - Event name
       * @param {Function} listener - Event listener
       */
      once(event, listener) {
        const wrapper = (...args) => {
          listener(...args);
          this.off(event, wrapper);
        };
        this.on(event, wrapper);
      }
    },

    // ========================= PLUGIN SYSTEM =========================
    /**
     * Plugin registry
     */
    plugins: {
      _registry: new Map(),
      
      /**
       * Register plugin
       * @param {string} name - Plugin name
       * @param {Object} plugin - Plugin implementation
       */
      register(name, plugin) {
        this._registry.set(name, plugin);
        ToolMaster.events.emit('plugin:registered', name, plugin);
      },
      
      /**
       * Get plugin
       * @param {string} name - Plugin name
       * @returns {Object|null} Plugin instance
       */
      get(name) {
        return this._registry.get(name) || null;
      },
      
      /**
       * Initialize all plugins
       */
      initAll() {
        this._registry.forEach((plugin, name) => {
          if (typeof plugin.init === 'function') {
            try {
              plugin.init();
              ToolMaster.events.emit('plugin:initialized', name);
            } catch (error) {
              console.error(`Plugin init error: ${name}`, error);
            }
          }
        });
      }
    },

    // ========================= EXTENSIBILITY =========================
    /**
     * Extend library functionality
     * @param {Object} extension - Extension methods
     */
    extend(extension) {
      for (const [key, value] of Object.entries(extension)) {
        if (!this[key]) {
          this[key] = value;
        } else {
          console.warn(`Cannot override existing method: ${key}`);
        }
      }
    }
  };

  // ========================= INITIALIZATION =========================
  // Auto-initialize plugins in browser
  if (ToolMaster.isBrowser && document.readyState !== 'loading') {
    ToolMaster.plugins.initAll();
  } else if (ToolMaster.isBrowser) {
    document.addEventListener('DOMContentLoaded', () => {
      ToolMaster.plugins.initAll();
    });
  }

  return ToolMaster;
});
