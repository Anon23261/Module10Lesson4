/**
 * Main application initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Show loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.display = 'flex';

        // Initialize UI
        window.ui = new UI();

        // Initialize charts
        initializeCharts();

        // Load demo data
        loadDemoData();

        // Hide loading overlay
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 1000);
    } catch (error) {
        console.error('Failed to initialize application:', error);
        // Show error in notification
        if (window.ui) {
            window.ui.showNotification('Failed to initialize application. Please refresh the page.', 'error');
        }
        // Hide loading overlay
        document.getElementById('loadingOverlay').style.display = 'none';
    }
});

/**
 * Load demo data for the application
 */
function loadDemoData() {
    // Create demo accounts
    const accounts = [
        { type: 'Checking', balance: 5000, number: '1234567890' },
        { type: 'Savings', balance: 10000, number: '0987654321' },
        { type: 'Investment', balance: 25000, number: '5678901234' }
    ];

    // Add accounts to UI
    accounts.forEach(acc => {
        const account = new Account(acc.number, 'John Doe', acc.balance);
        account.type = acc.type;
        window.ui.addAccountCard(account);
    });

    // Add some demo transactions
    const transactions = [
        { type: 'deposit', amount: 1000, date: '2024-12-20', description: 'Salary Deposit' },
        { type: 'withdrawal', amount: 500, date: '2024-12-22', description: 'ATM Withdrawal' },
        { type: 'transfer', amount: 750, date: '2024-12-24', description: 'Transfer to Savings' }
    ];

    // Add transactions to UI
    transactions.forEach(trans => {
        window.ui.addTransactionToList({
            type: trans.type,
            amount: trans.amount,
            date: new Date(trans.date),
            description: trans.description
        });
    });

    // Update charts
    updateCharts();
}

/**
 * Update charts with current data
 */
function updateCharts() {
    // Update balance chart
    const balanceData = Array.from(window.ui.accounts.values()).map(account => ({
        date: account.getTimestamp(),
        balance: account.getBalance()
    }));
    Charts.updateBalanceChart(balanceData);

    // Update transaction chart
    const transactionData = window.ui.getTransactionsList();
    Charts.updateTransactionChart(transactionData);
}
