/**
 * @fileoverview Constants and enums for the banking application
 * @author Ghost
 * @version 1.0.0
 */

const TransactionCategory = {
    INCOME: 'Income',
    EXPENSE: 'Expense',
    TRANSFER: 'Transfer',
    INVESTMENT: 'Investment',
    SAVINGS: 'Savings',
    BILLS: 'Bills'
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TransactionCategory };
} else {
    window.TransactionCategory = TransactionCategory;
}
