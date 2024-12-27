/**
 * @fileoverview Account class for banking operations
 * @author Ghost
 * @version 1.0.0
 * @license MIT
 */

/**
 * Account status enumeration
 * @readonly
 * @enum {string}
 */
const AccountStatus = {
    ACTIVE: 'active',
    FROZEN: 'frozen',
    CLOSED: 'closed'
};

/**
 * Transaction type enumeration
 * @readonly
 * @enum {string}
 */
const TransactionType = {
    DEPOSIT: 'deposit',
    WITHDRAWAL: 'withdrawal',
    INTEREST: 'interest',
    FEE: 'fee'
};

/**
 * Account class representing a bank account
 * @class
 */
class Account {
    // Private fields
    #transactions;
    #status;
    #createdAt;
    #lastUpdated;
    #interestSettings;
    #fees;

    /**
     * Create a new Account
     * @param {string} accountNumber - The account number
     * @param {string} owner - The account owner's name
     * @param {number} [initialBalance=0] - Initial balance
     * @throws {Error} If validation fails
     */
    constructor(accountNumber, owner, initialBalance = 0) {
        // Validate inputs
        this.#validateAccountNumber(accountNumber);
        this.#validateOwner(owner);
        this.#validateAmount(initialBalance);

        // Initialize account properties
        this.accountNumber = accountNumber;
        this.owner = owner;
        this.balance = Math.max(0, initialBalance);
        
        // Initialize private fields
        this.#transactions = [];
        this.#status = AccountStatus.ACTIVE;
        this.#createdAt = new Date();
        this.#lastUpdated = new Date();
        
        // Set default interest settings
        this.#interestSettings = {
            baseRate: 0.02,          // 2% base interest rate
            minimumBalance: 1000,    // Minimum balance for interest
            bonusRate: 0.005,        // 0.5% bonus rate for high balances
            highBalanceThreshold: 10000 // Threshold for bonus rate
        };

        // Set default fees
        this.#fees = {
            overdraft: 35,
            maintenance: 5,
            minimumBalance: 500
        };

        // Record initial deposit if any
        if (initialBalance > 0) {
            this.#recordTransaction(TransactionType.DEPOSIT, initialBalance, 'Initial deposit');
        }
    }

    /**
     * Deposit money into the account
     * @param {number} amount - Amount to deposit
     * @param {string} [description='Deposit'] - Transaction description
     * @returns {Object} Transaction details
     * @throws {Error} If amount is invalid or account is not active
     */
    deposit(amount, description = 'Deposit') {
        this.#validateAccountStatus();
        this.#validateAmount(amount);

        this.balance += amount;
        this.#lastUpdated = new Date();

        const transaction = this.#recordTransaction(
            TransactionType.DEPOSIT,
            amount,
            description
        );

        return {
            success: true,
            transaction,
            newBalance: this.balance
        };
    }

    /**
     * Withdraw money from the account
     * @param {number} amount - Amount to withdraw
     * @param {string} [description='Withdrawal'] - Transaction description
     * @returns {Object} Transaction details
     * @throws {Error} If amount is invalid, insufficient funds, or account is not active
     */
    withdraw(amount, description = 'Withdrawal') {
        this.#validateAccountStatus();
        this.#validateAmount(amount);
        this.#validateSufficientFunds(amount);

        this.balance -= amount;
        this.#lastUpdated = new Date();

        // Check for overdraft fee
        if (this.balance < this.#fees.minimumBalance) {
            this.#applyFee('Overdraft fee', this.#fees.overdraft);
        }

        const transaction = this.#recordTransaction(
            TransactionType.WITHDRAWAL,
            -amount,
            description
        );

        return {
            success: true,
            transaction,
            newBalance: this.balance
        };
    }

    /**
     * Calculate compound interest
     * @param {number} rate - Annual interest rate (as decimal)
     * @param {number} years - Number of years
     * @param {number} [compoundingFrequency=12] - Times interest is compounded per year
     * @returns {Object} Interest calculation details
     * @throws {Error} If parameters are invalid
     */
    calculateCompoundInterest(rate, years, compoundingFrequency = 12) {
        this.#validateInterestParams(rate, years, compoundingFrequency);

        // Apply bonus rate if eligible
        let effectiveRate = rate;
        if (this.balance >= this.#interestSettings.highBalanceThreshold) {
            effectiveRate += this.#interestSettings.bonusRate;
        }

        // Calculate using compound interest formula: A = P(1 + r/n)^(nt)
        const finalAmount = this.balance * Math.pow(
            1 + (effectiveRate / compoundingFrequency),
            compoundingFrequency * years
        );

        const interestEarned = Math.round((finalAmount - this.balance) * 100) / 100;

        return {
            initialBalance: this.balance,
            finalAmount: Math.round(finalAmount * 100) / 100,
            interestEarned,
            effectiveRate,
            years,
            compoundingFrequency
        };
    }

    /**
     * Get account statement
     * @param {Date} [startDate] - Start date for transactions
     * @param {Date} [endDate] - End date for transactions
     * @returns {Object} Account statement
     */
    getStatement(startDate = null, endDate = null) {
        let filteredTransactions = this.#transactions;

        if (startDate || endDate) {
            filteredTransactions = this.#transactions.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                const afterStart = !startDate || transactionDate >= startDate;
                const beforeEnd = !endDate || transactionDate <= endDate;
                return afterStart && beforeEnd;
            });
        }

        return {
            accountNumber: this.accountNumber,
            owner: this.owner,
            currentBalance: this.balance,
            status: this.#status,
            transactions: filteredTransactions,
            createdAt: this.#createdAt,
            lastUpdated: this.#lastUpdated,
            interestRate: this.#calculateCurrentInterestRate(),
            statistics: this.#calculateStatistics(filteredTransactions)
        };
    }

    /**
     * Freeze account
     * @param {string} reason - Reason for freezing
     * @throws {Error} If account is not active
     */
    freeze(reason) {
        if (this.#status !== AccountStatus.ACTIVE) {
            throw new Error('Account must be active to freeze');
        }
        this.#status = AccountStatus.FROZEN;
        this.#recordTransaction(TransactionType.FEE, 0, `Account frozen: ${reason}`);
    }

    /**
     * Unfreeze account
     * @param {string} reason - Reason for unfreezing
     * @throws {Error} If account is not frozen
     */
    unfreeze(reason) {
        if (this.#status !== AccountStatus.FROZEN) {
            throw new Error('Account must be frozen to unfreeze');
        }
        this.#status = AccountStatus.ACTIVE;
        this.#recordTransaction(TransactionType.FEE, 0, `Account unfrozen: ${reason}`);
    }

    /**
     * Close account
     * @param {string} reason - Reason for closing
     * @throws {Error} If account has non-zero balance
     */
    close(reason) {
        if (this.balance !== 0) {
            throw new Error('Account must have zero balance to close');
        }
        this.#status = AccountStatus.CLOSED;
        this.#recordTransaction(TransactionType.FEE, 0, `Account closed: ${reason}`);
    }

    /**
     * Get account creation timestamp
     * @returns {Date} Account creation timestamp
     */
    getTimestamp() {
        return this.#createdAt;
    }

    /**
     * Get current balance
     * @returns {number} Current balance
     */
    getBalance() {
        return this.balance;
    }

    // Private helper methods

    /**
     * Record a transaction
     * @private
     * @param {TransactionType} type - Transaction type
     * @param {number} amount - Transaction amount
     * @param {string} description - Transaction description
     * @returns {Object} Transaction details
     */
    #recordTransaction(type, amount, description) {
        const transaction = {
            id: this.#generateTransactionId(),
            type,
            amount,
            description,
            date: new Date(),
            balanceAfter: this.balance
        };
        this.#transactions.push(transaction);
        return transaction;
    }

    /**
     * Apply a fee to the account
     * @private
     * @param {string} description - Fee description
     * @param {number} amount - Fee amount
     */
    #applyFee(description, amount) {
        this.balance -= amount;
        this.#recordTransaction(TransactionType.FEE, -amount, description);
    }

    /**
     * Calculate current interest rate based on balance
     * @private
     * @returns {number} Current interest rate
     */
    #calculateCurrentInterestRate() {
        let rate = this.#interestSettings.baseRate;
        if (this.balance >= this.#interestSettings.highBalanceThreshold) {
            rate += this.#interestSettings.bonusRate;
        }
        return rate;
    }

    /**
     * Calculate account statistics
     * @private
     * @param {Array} transactions - Transactions to analyze
     * @returns {Object} Account statistics
     */
    #calculateStatistics(transactions) {
        const stats = {
            totalDeposits: 0,
            totalWithdrawals: 0,
            largestDeposit: 0,
            largestWithdrawal: 0,
            averageTransaction: 0,
            totalFees: 0
        };

        if (transactions.length === 0) return stats;

        transactions.forEach(transaction => {
            const amount = Math.abs(transaction.amount);
            switch (transaction.type) {
                case TransactionType.DEPOSIT:
                    stats.totalDeposits += amount;
                    stats.largestDeposit = Math.max(stats.largestDeposit, amount);
                    break;
                case TransactionType.WITHDRAWAL:
                    stats.totalWithdrawals += amount;
                    stats.largestWithdrawal = Math.max(stats.largestWithdrawal, amount);
                    break;
                case TransactionType.FEE:
                    stats.totalFees += amount;
                    break;
            }
        });

        const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        stats.averageTransaction = totalAmount / transactions.length;

        return stats;
    }

    /**
     * Generate a unique transaction ID
     * @private
     * @returns {string} Transaction ID
     */
    #generateTransactionId() {
        return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Validation methods

    /**
     * Validate account number
     * @private
     * @param {string} accountNumber - Account number to validate
     * @throws {Error} If account number is invalid
     */
    #validateAccountNumber(accountNumber) {
        if (!accountNumber || typeof accountNumber !== 'string' || 
            accountNumber.length < 5 || !/^\d+$/.test(accountNumber)) {
            throw new Error('Invalid account number format');
        }
    }

    /**
     * Validate owner name
     * @private
     * @param {string} owner - Owner name to validate
     * @throws {Error} If owner name is invalid
     */
    #validateOwner(owner) {
        if (!owner || typeof owner !== 'string' || 
            owner.trim().length < 2 || !/^[a-zA-Z\s-']+$/.test(owner)) {
            throw new Error('Invalid owner name format');
        }
    }

    /**
     * Validate transaction amount
     * @private
     * @param {number} amount - Amount to validate
     * @throws {Error} If amount is invalid
     */
    #validateAmount(amount) {
        if (!Number.isFinite(amount) || amount < 0) {
            throw new Error('Invalid amount');
        }
    }

    /**
     * Validate sufficient funds for withdrawal
     * @private
     * @param {number} amount - Amount to validate
     * @throws {Error} If insufficient funds
     */
    #validateSufficientFunds(amount) {
        if (amount > this.balance) {
            throw new Error('Insufficient funds');
        }
    }

    /**
     * Validate account status
     * @private
     * @throws {Error} If account is not active
     */
    #validateAccountStatus() {
        if (this.#status !== AccountStatus.ACTIVE) {
            throw new Error(`Account is ${this.#status}`);
        }
    }

    /**
     * Validate interest calculation parameters
     * @private
     * @param {number} rate - Interest rate to validate
     * @param {number} years - Years to validate
     * @param {number} frequency - Compounding frequency to validate
     * @throws {Error} If parameters are invalid
     */
    #validateInterestParams(rate, years, frequency) {
        if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
            throw new Error('Invalid interest rate');
        }
        if (!Number.isFinite(years) || years <= 0) {
            throw new Error('Invalid number of years');
        }
        if (!Number.isInteger(frequency) || frequency < 1) {
            throw new Error('Invalid compounding frequency');
        }
    }
}

// Export the Account class if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Account, AccountStatus, TransactionType };
} else {
    window.Account = Account;
    window.AccountStatus = AccountStatus;
    window.TransactionType = TransactionType;
}
