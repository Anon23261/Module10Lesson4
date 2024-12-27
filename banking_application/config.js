/**
 * @fileoverview Configuration settings for the banking application
 * @author Ghost
 * @version 1.0.0
 */

const CONFIG = {
    // Application Settings
    APP_NAME: 'Ghost Banking',
    VERSION: '1.0.0',
    DEBUG_MODE: false,
    
    // API Settings (if connecting to a backend)
    API: {
        BASE_URL: 'https://api.ghostbanking.com',
        TIMEOUT: 5000,
        RETRY_ATTEMPTS: 3
    },

    // Account Settings
    ACCOUNT: {
        TYPES: {
            CHECKING: {
                name: 'Checking Account',
                minBalance: 0,
                monthlyFee: 0,
                interestRate: 0.001 // 0.1%
            },
            SAVINGS: {
                name: 'Savings Account',
                minBalance: 100,
                monthlyFee: 5,
                interestRate: 0.02 // 2%
            },
            INVESTMENT: {
                name: 'Investment Account',
                minBalance: 1000,
                monthlyFee: 10,
                interestRate: 0.05 // 5%
            }
        },
        NUMBER_PREFIX: 'GB',
        MIN_INITIAL_DEPOSIT: 25
    },

    // Transaction Settings
    TRANSACTION: {
        TYPES: {
            DEPOSIT: 'deposit',
            WITHDRAWAL: 'withdrawal',
            TRANSFER: 'transfer',
            INTEREST: 'interest',
            FEE: 'fee'
        },
        MAX_AMOUNT: 1000000,
        DAILY_LIMIT: 50000
    },

    // Interest Calculation Settings
    INTEREST: {
        COMPOUNDING_FREQUENCIES: {
            DAILY: 365,
            WEEKLY: 52,
            MONTHLY: 12,
            QUARTERLY: 4,
            SEMI_ANNUALLY: 2,
            ANNUALLY: 1
        },
        MAX_RATE: 0.25, // 25%
        MIN_RATE: 0.0001 // 0.01%
    },

    // UI Settings
    UI: {
        THEME: {
            PRIMARY_COLOR: '#2c3e50',
            SECONDARY_COLOR: '#3498db',
            SUCCESS_COLOR: '#2ecc71',
            WARNING_COLOR: '#f1c40f',
            DANGER_COLOR: '#e74c3c',
            INFO_COLOR: '#3498db'
        },
        ANIMATION_DURATION: 300,
        NOTIFICATION_TIMEOUT: 5000,
        CHART_COLORS: [
            '#2ecc71',
            '#3498db',
            '#e74c3c',
            '#f1c40f',
            '#9b59b6',
            '#1abc9c'
        ]
    },

    // Validation Settings
    VALIDATION: {
        NAME: {
            MIN_LENGTH: 2,
            MAX_LENGTH: 50,
            PATTERN: /^[a-zA-Z\s-']+$/
        },
        ACCOUNT_NUMBER: {
            LENGTH: 10,
            PATTERN: /^[A-Z]{2}\d{8}$/
        },
        PASSWORD: {
            MIN_LENGTH: 8,
            PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        }
    },

    // Storage Keys
    STORAGE: {
        ACCOUNTS: 'gb_accounts',
        TRANSACTIONS: 'gb_transactions',
        USER_PREFERENCES: 'gb_preferences',
        AUTH_TOKEN: 'gb_auth_token'
    },

    // Feature Flags
    FEATURES: {
        BILL_PAY: true,
        INVESTMENTS: true,
        LOANS: true,
        MOBILE_CHECK_DEPOSIT: false,
        INTERNATIONAL_TRANSFER: false
    },

    // Error Messages
    ERRORS: {
        INVALID_AMOUNT: 'Please enter a valid amount',
        INSUFFICIENT_FUNDS: 'Insufficient funds available',
        INVALID_ACCOUNT: 'Invalid account information',
        DAILY_LIMIT_EXCEEDED: 'Daily transaction limit exceeded',
        MINIMUM_BALANCE: 'Balance cannot be below minimum requirement',
        NETWORK_ERROR: 'Network error. Please try again',
        INVALID_TRANSFER: 'Invalid transfer details',
        ACCOUNT_FROZEN: 'Account is currently frozen',
        INVALID_CREDENTIALS: 'Invalid login credentials'
    },

    // Security Settings
    SECURITY: {
        SESSION_TIMEOUT: 1800000, // 30 minutes
        MAX_LOGIN_ATTEMPTS: 3,
        REQUIRE_2FA: true,
        PASSWORD_EXPIRY_DAYS: 90
    }
};

// Freeze the configuration object to prevent modifications
Object.freeze(CONFIG);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
