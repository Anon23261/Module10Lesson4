/**
 * @fileoverview Transaction class for handling banking transactions
 * @author Ghost
 * @version 1.0.0
 */

/**
 * Transaction status enumeration
 * @readonly
 * @enum {string}
 */
const TransactionStatus = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REVERSED: 'reversed'
};

/**
 * Transaction class for managing banking transactions
 * @class
 */
class Transaction {
    // Private fields
    #id;
    #timestamp;
    #status;
    #metadata;

    /**
     * Create a new Transaction
     * @param {Object} params - Transaction parameters
     * @param {string} params.type - Transaction type
     * @param {number} params.amount - Transaction amount
     * @param {string} params.fromAccount - Source account
     * @param {string} [params.toAccount] - Destination account
     * @param {string} [params.description] - Transaction description
     * @param {string} [params.category] - Transaction category
     * @param {Object} [params.metadata] - Additional metadata
     */
    constructor({
        type,
        amount,
        fromAccount,
        toAccount = null,
        description = '',
        category = null,
        metadata = {}
    }) {
        this.#validateParams(type, amount, fromAccount);

        this.#id = Utils.generateId('TXN');
        this.#timestamp = new Date();
        this.#status = TransactionStatus.PENDING;
        
        this.type = type;
        this.amount = amount;
        this.fromAccount = fromAccount;
        this.toAccount = toAccount;
        this.description = description;
        this.category = this.#determineCategory(category, type);
        this.#metadata = {
            ...metadata,
            deviceInfo: this.#getDeviceInfo(),
            location: null // Would be set by geolocation if available
        };
    }

    /**
     * Get transaction details
     * @returns {Object} Transaction details
     */
    getDetails() {
        return {
            id: this.#id,
            timestamp: this.#timestamp,
            status: this.#status,
            type: this.type,
            amount: this.amount,
            fromAccount: this.fromAccount,
            toAccount: this.toAccount,
            description: this.description,
            category: this.category,
            metadata: this.#metadata
        };
    }

    /**
     * Complete the transaction
     * @param {Object} [result] - Transaction result details
     * @returns {boolean} Success status
     */
    complete(result = {}) {
        if (this.#status !== TransactionStatus.PENDING) {
            throw new Error(`Transaction cannot be completed. Current status: ${this.#status}`);
        }

        this.#status = TransactionStatus.COMPLETED;
        this.#metadata.completedAt = new Date();
        this.#metadata.result = result;

        return true;
    }

    /**
     * Fail the transaction
     * @param {string} reason - Failure reason
     * @param {Object} [details] - Additional failure details
     */
    fail(reason, details = {}) {
        if (this.#status !== TransactionStatus.PENDING) {
            throw new Error(`Transaction cannot be failed. Current status: ${this.#status}`);
        }

        this.#status = TransactionStatus.FAILED;
        this.#metadata.failedAt = new Date();
        this.#metadata.failureReason = reason;
        this.#metadata.failureDetails = details;
    }

    /**
     * Cancel the transaction
     * @param {string} reason - Cancellation reason
     */
    cancel(reason) {
        if (this.#status !== TransactionStatus.PENDING) {
            throw new Error(`Transaction cannot be cancelled. Current status: ${this.#status}`);
        }

        this.#status = TransactionStatus.CANCELLED;
        this.#metadata.cancelledAt = new Date();
        this.#metadata.cancellationReason = reason;
    }

    /**
     * Reverse the transaction
     * @param {string} reason - Reversal reason
     * @returns {Transaction} Reversal transaction
     */
    reverse(reason) {
        if (this.#status !== TransactionStatus.COMPLETED) {
            throw new Error(`Transaction cannot be reversed. Current status: ${this.#status}`);
        }

        this.#status = TransactionStatus.REVERSED;
        this.#metadata.reversedAt = new Date();
        this.#metadata.reversalReason = reason;

        // Create reversal transaction
        return new Transaction({
            type: `REVERSAL_${this.type}`,
            amount: this.amount,
            fromAccount: this.toAccount || this.fromAccount,
            toAccount: this.fromAccount,
            description: `Reversal: ${this.description} - ${reason}`,
            category: this.category,
            metadata: {
                originalTransaction: this.#id,
                reversalReason: reason
            }
        });
    }

    /**
     * Add a note to the transaction
     * @param {string} note - Note to add
     */
    addNote(note) {
        if (!this.#metadata.notes) {
            this.#metadata.notes = [];
        }
        this.#metadata.notes.push({
            text: note,
            timestamp: new Date()
        });
    }

    /**
     * Add an attachment to the transaction
     * @param {Object} attachment - Attachment details
     */
    addAttachment(attachment) {
        if (!this.#metadata.attachments) {
            this.#metadata.attachments = [];
        }
        this.#metadata.attachments.push({
            ...attachment,
            uploadedAt: new Date()
        });
    }

    /**
     * Get transaction status
     * @returns {string} Current status
     */
    getStatus() {
        return this.#status;
    }

    /**
     * Get transaction ID
     * @returns {string} Transaction ID
     */
    getId() {
        return this.#id;
    }

    /**
     * Get transaction timestamp
     * @returns {Date} Transaction timestamp
     */
    getTimestamp() {
        return new Date(this.#timestamp);
    }

    /**
     * Check if transaction can be modified
     * @returns {boolean} True if modifiable
     */
    isModifiable() {
        return this.#status === TransactionStatus.PENDING;
    }

    // Private helper methods

    /**
     * Validate transaction parameters
     * @private
     */
    #validateParams(type, amount, fromAccount) {
        if (!type || !CONFIG.TRANSACTION.TYPES[type]) {
            throw new Error('Invalid transaction type');
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error('Invalid transaction amount');
        }

        if (amount > CONFIG.TRANSACTION.MAX_AMOUNT) {
            throw new Error('Transaction amount exceeds maximum limit');
        }

        if (!fromAccount) {
            throw new Error('Source account is required');
        }
    }

    /**
     * Determine transaction category
     * @private
     */
    #determineCategory(category, type) {
        if (category && TransactionCategory[category]) {
            return category;
        }

        switch (type) {
            case CONFIG.TRANSACTION.TYPES.DEPOSIT:
                return TransactionCategory.INCOME;
            case CONFIG.TRANSACTION.TYPES.WITHDRAWAL:
                return TransactionCategory.EXPENSE;
            case CONFIG.TRANSACTION.TYPES.TRANSFER:
                return TransactionCategory.TRANSFER;
            case CONFIG.TRANSACTION.TYPES.INTEREST:
                return TransactionCategory.INTEREST;
            case CONFIG.TRANSACTION.TYPES.FEE:
                return TransactionCategory.FEE;
            default:
                return null;
        }
    }

    /**
     * Get device information
     * @private
     */
    #getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timestamp: new Date()
        };
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Transaction, TransactionStatus };
} else {
    window.Transaction = Transaction;
    window.TransactionStatus = TransactionStatus;
}
