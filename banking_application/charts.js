/**
 * @fileoverview Charts module for financial visualizations
 * @author Ghost
 * @version 1.0.0
 */

const Charts = {
    /**
     * Initialize all charts
     */
    init() {
        this.initBalanceChart();
        this.initTransactionChart();
        this.setupChartDefaults();
    },

    /**
     * Set up global chart defaults
     */
    setupChartDefaults() {
        Chart.defaults.font.family = "'Poppins', sans-serif";
        Chart.defaults.color = '#666';
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
    },

    /**
     * Initialize balance history chart
     * @param {Array} data - Balance history data
     */
    initBalanceChart(data = []) {
        const ctx = document.getElementById('balanceChart').getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(46, 204, 113, 0.2)');
        gradient.addColorStop(1, 'rgba(46, 204, 113, 0)');

        this.balanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'Balance History',
                    data: data.map(d => d.balance),
                    fill: true,
                    backgroundColor: gradient,
                    borderColor: '#2ecc71',
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#2ecc71'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Balance: ${Utils.formatCurrency(context.raw)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => Utils.formatCurrency(value)
                        }
                    }
                }
            }
        });
    },

    /**
     * Initialize transaction analysis chart
     * @param {Array} data - Transaction data
     */
    initTransactionChart(data = []) {
        const ctx = document.getElementById('transactionChart').getContext('2d');
        
        this.transactionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.values(TransactionCategory),
                datasets: [{
                    data: this.calculateCategoryTotals(data),
                    backgroundColor: CONFIG.UI.CHART_COLORS
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${Utils.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Update balance chart with new data
     * @param {Array} data - New balance data
     */
    updateBalanceChart(data) {
        this.balanceChart.data.labels = data.map(d => d.date);
        this.balanceChart.data.datasets[0].data = data.map(d => d.balance);
        this.balanceChart.update();
    },

    /**
     * Update transaction chart with new data
     * @param {Array} data - New transaction data
     */
    updateTransactionChart(data) {
        this.transactionChart.data.datasets[0].data = this.calculateCategoryTotals(data);
        this.transactionChart.update();
    },

    /**
     * Calculate totals by category
     * @private
     * @param {Array} transactions - Transaction data
     * @returns {Array} Category totals
     */
    calculateCategoryTotals(transactions) {
        const totals = {};
        Object.values(TransactionCategory).forEach(category => {
            totals[category] = 0;
        });

        transactions.forEach(transaction => {
            if (transaction.category) {
                totals[transaction.category] += Math.abs(transaction.amount);
            }
        });

        return Object.values(totals);
    },

    /**
     * Create a loan amortization chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} schedule - Amortization schedule
     */
    createLoanChart(canvasId, schedule) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: schedule.map(s => `Payment ${s.payment}`),
                datasets: [{
                    label: 'Principal',
                    data: schedule.map(s => s.principal),
                    backgroundColor: CONFIG.UI.CHART_COLORS[0]
                }, {
                    label: 'Interest',
                    data: schedule.map(s => s.interest),
                    backgroundColor: CONFIG.UI.CHART_COLORS[1]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${Utils.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            callback: (value) => Utils.formatCurrency(value)
                        }
                    }
                }
            }
        });
    },

    /**
     * Create a savings goal progress chart
     * @param {string} canvasId - Canvas element ID
     * @param {number} current - Current amount
     * @param {number} target - Target amount
     */
    createSavingsGoalChart(canvasId, current, target) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const percentage = (current / target) * 100;

        new Chart(ctx, {
            type: 'gauge',
            data: {
                datasets: [{
                    value: percentage,
                    minValue: 0,
                    maxValue: 100,
                    backgroundColor: this.getProgressColor(percentage)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                valueLabel: {
                    display: true,
                    formatter: (value) => `${value.toFixed(1)}%`
                }
            }
        });
    },

    /**
     * Get color based on progress percentage
     * @private
     * @param {number} percentage - Progress percentage
     * @returns {string} Color code
     */
    getProgressColor(percentage) {
        if (percentage < 25) return CONFIG.UI.THEME.DANGER_COLOR;
        if (percentage < 50) return CONFIG.UI.THEME.WARNING_COLOR;
        if (percentage < 75) return CONFIG.UI.THEME.INFO_COLOR;
        return CONFIG.UI.THEME.SUCCESS_COLOR;
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Charts;
} else {
    window.Charts = Charts;
}

// Initialize charts when the script loads
function initializeCharts() {
    document.addEventListener('DOMContentLoaded', () => {
        Charts.init();
    });
}

initializeCharts();
