/**
 * @fileoverview Utility functions for the banking application
 * @author Ghost
 * @version 1.0.0
 */

const Utils = {
    /**
     * Format currency amount
     * @param {number} amount - Amount to format
     * @param {string} [currency='USD'] - Currency code
     * @returns {string} Formatted currency string
     */
    formatCurrency: (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    /**
     * Format date to locale string
     * @param {Date|string} date - Date to format
     * @param {Object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted date string
     */
    formatDate: (date, options = {}) => {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(date).toLocaleString('en-US', { ...defaultOptions, ...options });
    },

    /**
     * Generate a unique identifier
     * @param {string} [prefix=''] - Prefix for the ID
     * @returns {string} Unique identifier
     */
    generateId: (prefix = '') => {
        return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Generate an account number
     * @returns {string} Account number
     */
    generateAccountNumber: () => {
        const prefix = CONFIG.ACCOUNT.NUMBER_PREFIX;
        const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        return `${prefix}${number}`;
    },

    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Debounce a function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle a function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle: (func, limit) => {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Calculate monthly loan payment
     * @param {number} principal - Loan amount
     * @param {number} rate - Annual interest rate (as decimal)
     * @param {number} years - Loan term in years
     * @returns {number} Monthly payment amount
     */
    calculateLoanPayment: (principal, rate, years) => {
        const monthlyRate = rate / 12;
        const numberOfPayments = years * 12;
        return principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) 
               / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    },

    /**
     * Calculate loan amortization schedule
     * @param {number} principal - Loan amount
     * @param {number} rate - Annual interest rate (as decimal)
     * @param {number} years - Loan term in years
     * @returns {Array} Array of payment objects
     */
    calculateAmortizationSchedule: (principal, rate, years) => {
        const monthlyRate = rate / 12;
        const numberOfPayments = years * 12;
        const monthlyPayment = Utils.calculateLoanPayment(principal, rate, years);
        
        let balance = principal;
        const schedule = [];

        for (let i = 1; i <= numberOfPayments; i++) {
            const interest = balance * monthlyRate;
            const principal = monthlyPayment - interest;
            balance -= principal;

            schedule.push({
                payment: i,
                monthlyPayment: monthlyPayment,
                principal: principal,
                interest: interest,
                balance: Math.max(0, balance)
            });
        }

        return schedule;
    },

    /**
     * Format percentage
     * @param {number} value - Value to format as percentage
     * @param {number} [decimals=2] - Number of decimal places
     * @returns {string} Formatted percentage string
     */
    formatPercentage: (value, decimals = 2) => {
        return `${(value * 100).toFixed(decimals)}%`;
    },

    /**
     * Format large numbers with abbreviations
     * @param {number} value - Number to format
     * @returns {string} Formatted number string
     */
    formatLargeNumber: (value) => {
        const suffixes = ['', 'K', 'M', 'B', 'T'];
        const suffixNum = Math.floor((`${value}`).length/3);
        let shortValue = parseFloat((suffixNum !== 0 ? (value / Math.pow(1000,suffixNum)) : value).toPrecision(2));
        if (shortValue % 1 !== 0) {
            shortValue = shortValue.toFixed(1);
        }
        return shortValue+suffixes[suffixNum];
    },

    /**
     * Calculate the difference between two dates in days
     * @param {Date} date1 - First date
     * @param {Date} date2 - Second date
     * @returns {number} Number of days
     */
    daysBetween: (date1, date2) => {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((new Date(date1) - new Date(date2)) / oneDay));
    },

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} Validation result with score and feedback
     */
    validatePassword: (password) => {
        let score = 0;
        const feedback = [];

        if (password.length >= 8) score++;
        if (password.match(/[a-z]/)) score++;
        if (password.match(/[A-Z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^a-zA-Z0-9]/)) score++;

        if (score < 2) feedback.push('Password is weak');
        else if (score < 4) feedback.push('Password is moderate');
        else feedback.push('Password is strong');

        return {
            score,
            feedback,
            isValid: score >= 3
        };
    },

    /**
     * Format file size
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size string
     */
    formatFileSize: (bytes) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    },

    /**
     * Get relative time string
     * @param {Date} date - Date to compare
     * @returns {string} Relative time string
     */
    getRelativeTimeString: (date) => {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        const now = new Date();
        const diff = now - new Date(date);
        
        const diffInSeconds = diff / 1000;
        const diffInMinutes = diffInSeconds / 60;
        const diffInHours = diffInMinutes / 60;
        const diffInDays = diffInHours / 24;

        if (diffInSeconds < 60) return rtf.format(-Math.round(diffInSeconds), 'second');
        if (diffInMinutes < 60) return rtf.format(-Math.round(diffInMinutes), 'minute');
        if (diffInHours < 24) return rtf.format(-Math.round(diffInHours), 'hour');
        return rtf.format(-Math.round(diffInDays), 'day');
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else {
    window.Utils = Utils;
}
