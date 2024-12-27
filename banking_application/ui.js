/**
 * UI class to handle all user interface interactions
 */
class UI {
    constructor() {
        // Initialize properties
        this.accounts = new Map();
        this.selectedAccount = null;
        
        // Initialize UI
        this.initializeElements();
        this.setupEventListeners();
    }

    /**
     * Initialize UI element references
     * @private
     */
    initializeElements() {
        // Buttons
        this.newAccountBtn = document.getElementById('newAccountBtn');
        this.transferBtn = document.getElementById('transferBtn');
        this.payBillBtn = document.getElementById('payBillBtn');
        this.investBtn = document.getElementById('investBtn');

        // Modals
        this.newAccountModal = document.getElementById('newAccountModal');
        this.operationsModal = document.getElementById('operationsModal');
        this.interestCalculatorModal = document.getElementById('interestCalculatorModal');
        this.transferModal = document.getElementById('transferModal');

        // Forms
        this.createAccountForm = document.getElementById('createAccountForm');
        this.operationsForm = document.getElementById('operationsForm');
        this.interestForm = document.getElementById('interestForm');

        // Create Account inputs
        this.accountNumberInput = document.getElementById('accountNumber');
        this.ownerNameInput = document.getElementById('ownerName');
        this.initialBalanceInput = document.getElementById('initialBalance');

        // Operation inputs
        this.amountInput = document.getElementById('amount');
        this.depositBtn = document.getElementById('depositBtn');
        this.withdrawBtn = document.getElementById('withdrawBtn');

        // Interest Calculator inputs
        this.interestRateInput = document.getElementById('interestRate');
        this.yearsInput = document.getElementById('years');
        this.compoundingFrequencyInput = document.getElementById('compoundingFrequency');

        // Display sections
        this.accountCards = document.getElementById('accountCards');
        this.transactionList = document.getElementById('transactionList');

        // Close modal buttons
        this.closeButtons = document.querySelectorAll('.close-modal');

        // Create notification element
        this.notification = document.createElement('div');
        this.notification.className = 'notification';
        document.body.appendChild(this.notification);
    }

    /**
     * Set up event listeners for all interactive elements
     * @private
     */
    setupEventListeners() {
        // Modal triggers
        this.newAccountBtn.addEventListener('click', () => this.showModal(this.newAccountModal));
        this.transferBtn.addEventListener('click', () => this.showModal(this.transferModal));
        this.investBtn.addEventListener('click', () => this.showModal(this.interestCalculatorModal));

        // Close modal buttons
        this.closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal);
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target);
            }
        });

        // Form submissions
        if (this.createAccountForm) {
            this.createAccountForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateAccount();
            });
        }

        if (this.operationsForm) {
            // Deposit and withdraw buttons
            this.depositBtn.addEventListener('click', () => this.handleTransaction('deposit'));
            this.withdrawBtn.addEventListener('click', () => this.handleTransaction('withdraw'));
        }

        if (this.interestForm) {
            this.interestForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleInterestCalculation();
            });
        }

        // Input validation
        this.setupInputValidation();
    }

    /**
     * Set up input validation for number fields
     * @private
     */
    setupInputValidation() {
        const numberInputs = [
            this.initialBalanceInput,
            this.amountInput,
            this.interestRateInput,
            this.yearsInput,
            this.compoundingFrequencyInput
        ];

        numberInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    this.validateNumberInput(input);
                });
            }
        });
    }

    /**
     * Show a modal
     * @param {HTMLElement} modal - The modal to show
     */
    showModal(modal) {
        if (modal) {
            modal.style.display = 'block';
        }
    }

    /**
     * Hide a modal
     * @param {HTMLElement} modal - The modal to hide
     */
    hideModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Handle account creation
     * @private
     */
    handleCreateAccount() {
        try {
            const accountNumber = this.accountNumberInput.value.trim();
            const ownerName = this.ownerNameInput.value.trim();
            const initialBalance = parseFloat(this.initialBalanceInput.value) || 0;

            if (!accountNumber || !ownerName) {
                throw new Error('Please fill in all required fields.');
            }

            this.account = new Account(accountNumber, ownerName, initialBalance);
            this.updateDisplay();
            this.createAccountForm.reset();
            this.showNotification('Account created successfully!', 'success');
            
            // Enable operation buttons
            this.depositBtn.disabled = false;
            this.withdrawBtn.disabled = false;
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    /**
     * Handle deposit/withdraw transactions
     * @private
     * @param {string} type - Transaction type ('deposit' or 'withdraw')
     */
    handleTransaction(type) {
        if (!this.account) {
            this.showNotification('Please create an account first.', 'error');
            return;
        }

        try {
            const amount = parseFloat(this.amountInput.value);
            
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Please enter a valid amount.');
            }

            if (type === 'deposit') {
                this.account.deposit(amount);
                this.showNotification(`Successfully deposited $${amount.toFixed(2)}`, 'success');
            } else {
                this.account.withdraw(amount);
                this.showNotification(`Successfully withdrew $${amount.toFixed(2)}`, 'success');
            }

            this.updateDisplay();
            this.amountInput.value = '';
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    /**
     * Handle interest calculation
     * @private
     */
    handleInterestCalculation() {
        if (!this.account) {
            this.showNotification('Please create an account first.', 'error');
            return;
        }

        try {
            const rate = parseFloat(this.interestRateInput.value) / 100; // Convert percentage to decimal
            const years = parseInt(this.yearsInput.value);
            const frequency = parseInt(this.compoundingFrequencyInput.value);

            const finalAmount = this.account.calculateCompoundInterest(rate, years, frequency);
            const interest = finalAmount - this.account.balance;

            this.showNotification(
                `After ${years} years at ${(rate * 100).toFixed(1)}% interest: $${finalAmount.toFixed(2)} ` +
                `(Interest earned: $${interest.toFixed(2)})`,
                'info'
            );
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    /**
     * Update the account information display
     * @private
     */
    updateDisplay() {
        if (!this.account) {
            this.accountCards.innerHTML = '<p class="empty-message">No account created yet</p>';
            this.transactionList.innerHTML = '<p class="empty-message">No transactions yet</p>';
            return;
        }

        const statement = this.account.getStatement();

        // Update account info
        this.accountCards.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <span class="label">Account Number:</span>
                    <span class="value">${statement.accountNumber}</span>
                </div>
                <div class="info-item">
                    <span class="label">Owner:</span>
                    <span class="value">${statement.owner}</span>
                </div>
                <div class="info-item">
                    <span class="label">Current Balance:</span>
                    <span class="value balance">$${statement.currentBalance.toFixed(2)}</span>
                </div>
                <div class="info-item">
                    <span class="label">Created:</span>
                    <span class="value">${statement.createdAt.toLocaleDateString()}</span>
                </div>
            </div>
        `;

        // Update transaction history
        if (statement.transactions.length === 0) {
            this.transactionList.innerHTML = '<p class="empty-message">No transactions yet</p>';
            return;
        }

        this.transactionList.innerHTML = `
            <div class="transaction-list">
                ${statement.transactions.map(transaction => `
                    <div class="transaction-item ${transaction.amount > 0 ? 'deposit' : 'withdrawal'}">
                        <div class="transaction-icon">
                            <i class="fas fa-${transaction.amount > 0 ? 'arrow-up' : 'arrow-down'}"></i>
                        </div>
                        <div class="transaction-details">
                            <span class="transaction-type">${transaction.type}</span>
                            <span class="transaction-amount">$${Math.abs(transaction.amount).toFixed(2)}</span>
                            <span class="transaction-date">${new Date(transaction.date).toLocaleString()}</span>
                            <span class="transaction-balance">Balance: $${transaction.balanceAfter.toFixed(2)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Show a notification message
     * @private
     * @param {string} message - Message to display
     * @param {string} type - Notification type ('success', 'error', or 'info')
     */
    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `notification ${type}`;
        this.notification.style.display = 'block';

        // Add animation
        this.notification.style.animation = 'none';
        this.notification.offsetHeight; // Trigger reflow
        this.notification.style.animation = 'slideIn 0.3s ease-out';

        setTimeout(() => {
            this.notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                this.notification.style.display = 'none';
            }, 300);
        }, 3000);
    }

    /**
     * Validate number input
     * @private
     * @param {HTMLInputElement} input - Input element to validate
     */
    validateNumberInput(input) {
        const value = input.value.trim();
        const numberValue = parseFloat(value);
        
        if (value === '') return;
        
        if (isNaN(numberValue) || numberValue < 0) {
            input.classList.add('invalid');
        } else {
            input.classList.remove('invalid');
        }
    }

    /**
     * Add an account card to the dashboard
     * @param {Account} account - Account to add
     */
    addAccountCard(account) {
        const card = document.createElement('div');
        card.className = 'account-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${account.type}</h3>
                <span class="account-number">${account.accountNumber}</span>
            </div>
            <div class="card-body">
                <div class="balance">
                    <span class="label">Balance</span>
                    <span class="amount">${Utils.formatCurrency(account.balance)}</span>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn-secondary" onclick="window.ui.showOperationsModal('${account.accountNumber}')">
                    <i class="fas fa-exchange-alt"></i> Operations
                </button>
            </div>
        `;
        this.accountCards.appendChild(card);
        this.accounts.set(account.accountNumber, account);
    }

    /**
     * Add a transaction to the list
     * @param {Object} transaction - Transaction details
     */
    addTransactionToList(transaction) {
        const listItem = document.createElement('div');
        listItem.className = `transaction-item ${transaction.type}`;
        listItem.innerHTML = `
            <div class="transaction-icon">
                <i class="fas fa-${this.getTransactionIcon(transaction.type)}"></i>
            </div>
            <div class="transaction-details">
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-date">${Utils.formatDate(transaction.date)}</div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'withdrawal' ? '-' : ''}${Utils.formatCurrency(transaction.amount)}
            </div>
        `;
        
        // Create the list if it doesn't exist
        if (!this.transactionList.querySelector('.transaction-list')) {
            const transactionListContainer = document.createElement('div');
            transactionListContainer.className = 'transaction-list';
            this.transactionList.appendChild(transactionListContainer);
        }
        
        const transactionListContainer = this.transactionList.querySelector('.transaction-list');
        transactionListContainer.insertBefore(listItem, transactionListContainer.firstChild);
    }

    /**
     * Get transaction icon based on type
     * @private
     * @param {string} type - Transaction type
     * @returns {string} Icon class name
     */
    getTransactionIcon(type) {
        const icons = {
            deposit: 'arrow-down',
            withdrawal: 'arrow-up',
            transfer: 'exchange-alt'
        };
        return icons[type] || 'circle';
    }

    /**
     * Get list of all transactions
     * @returns {Array} List of transactions
     */
    getTransactionsList() {
        const transactions = [];
        this.accounts.forEach(account => {
            transactions.push(...account.getStatement().transactions);
        });
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Show operations modal for an account
     * @param {string} accountNumber - Account number
     */
    showOperationsModal(accountNumber) {
        this.selectedAccount = this.accounts.get(accountNumber);
        if (this.selectedAccount) {
            this.showModal(this.operationsModal);
        }
    }
}

// Make UI available globally
window.UI = UI;
