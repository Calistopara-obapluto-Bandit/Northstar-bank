// Dashboard Data and Functionality
(function(){
  'use strict';

  console.log('Dashboard data script loaded');

  // Account Data (stored in localStorage)
  const defaultAccounts = {
    checking: {
      balance: 12458.42,
      available: 12458.42,
      number: '**** 4821',
      type: 'Everyday Checking',
      interestRate: '0.01% APY',
      interestYTD: 12.45
    },
    savings: {
      balance: 10915.67,
      available: 10915.67,
      number: '**** 9064',
      type: 'Goal Savings',
      interestRate: '2.50% APY',
      interestYTD: 272.89
    },
    credit: {
      balance: 1284.33,
      available: 8715.67,
      number: '**** 1139',
      type: 'Rewards Credit Card',
      creditLimit: 10000.00,
      rewardsPoints: 2450
    }
  };

  // Transactions Data
  const transactions = [
    { id: 1, name: 'Payroll Deposit', icon: 'deposit', date: 'Yesterday', method: 'Direct Deposit', amount: 3240.00, category: 'Income' },
    { id: 2, name: 'Whole Foods Market', icon: 'shopping', date: 'Jul 14, 2026', method: 'Debit Card', amount: -156.82, category: 'Groceries' },
    { id: 3, name: 'Netflix Subscription', icon: 'entertainment', date: 'Jul 14, 2026', method: 'Auto-pay', amount: -15.99, category: 'Entertainment' },
    { id: 4, name: 'Interest Credit', icon: 'deposit', date: 'Jul 13, 2026', method: 'Automatic', amount: 22.75, category: 'Interest' },
    { id: 5, name: 'Shell Gas Station', icon: 'transport', date: 'Jul 12, 2026', method: 'Credit Card', amount: -45.00, category: 'Transportation' },
    { id: 6, name: 'ATM Withdrawal', icon: 'cash', date: 'Jul 11, 2026', method: 'ATM', amount: -200.00, category: 'Cash' },
    { id: 7, name: 'Starbucks', icon: 'dining', date: 'Jul 10, 2026', method: 'Debit Card', amount: -8.45, category: 'Dining' },
    { id: 8, name: 'Electric Company', icon: 'utilities', date: 'Jul 10, 2026', method: 'Auto-pay', amount: -126.40, category: 'Utilities' },
    { id: 9, name: 'Amazon.com', icon: 'shopping', date: 'Jul 9, 2026', method: 'Credit Card', amount: -67.99, category: 'Shopping' },
    { id: 10, name: 'Transfer from Savings', icon: 'transfer', date: 'Jul 8, 2026', amount: 500.00, category: 'Transfer' },
    { id: 11, name: 'Uber Ride', icon: 'transport', date: 'Jul 7, 2026', method: 'Debit Card', amount: -24.50, category: 'Transportation' },
    { id: 12, name: 'Gym Membership', icon: 'fitness', date: 'Jul 5, 2026', method: 'Auto-pay', amount: -49.99, category: 'Health' },
    { id: 13, name: 'Insurance Premium', icon: 'insurance', date: 'Jul 1, 2026', method: 'Auto-pay', amount: -145.00, category: 'Insurance' },
    { id: 14, name: 'Interest Credit', icon: 'deposit', date: 'Jun 30, 2026', method: 'Automatic', amount: 22.75, category: 'Interest' },
    { id: 15, name: 'Costco Wholesale', icon: 'shopping', date: 'Jun 28, 2026', method: 'Debit Card', amount: -234.56, category: 'Groceries' },
    { id: 16, name: 'Transfer to Savings', icon: 'transfer', date: 'Jun 25, 2026', amount: -1000.00, category: 'Transfer' },
    { id: 17, name: 'Target', icon: 'shopping', date: 'Jun 22, 2026', method: 'Debit Card', amount: -89.50, category: 'Shopping' },
    { id: 18, name: 'Restaurant Downtown', icon: 'dining', date: 'Jun 20, 2026', method: 'Credit Card', amount: -67.30, category: 'Dining' },
    { id: 19, name: 'Phone Bill', icon: 'utilities', date: 'Jun 18, 2026', method: 'Auto-pay', amount: -89.99, category: 'Utilities' },
    { id: 20, name: 'Gas Station', icon: 'transport', date: 'Jun 15, 2026', method: 'Credit Card', amount: -52.30, category: 'Transportation' },
    { id: 21, name: 'Apple Store', icon: 'shopping', date: 'Jun 12, 2026', method: 'Credit Card', amount: -299.00, category: 'Shopping' },
    { id: 22, name: 'Coffee Shop', icon: 'dining', date: 'Jun 10, 2026', method: 'Debit Card', amount: -6.50, category: 'Dining' },
    { id: 23, name: 'Grocery Store', icon: 'shopping', date: 'Jun 8, 2026', method: 'Debit Card', amount: -123.45, category: 'Groceries' },
    { id: 24, name: 'Interest Credit', icon: 'deposit', date: 'Jun 30, 2026', method: 'Automatic', amount: 22.75, category: 'Interest' },
    { id: 25, name: 'Payroll Deposit', icon: 'deposit', date: 'Jun 15, 2026', method: 'Direct Deposit', amount: 3240.00, category: 'Income' }
  ];

  // Spending Data
  const spendingData = {
    groceries: 624,
    utilities: 389,
    dining: 487,
    transportation: 305,
    entertainment: 250,
    shopping: 342,
    health: 145,
    insurance: 145
  };

  // Goals Data
  const goals = [
    { id: 1, name: 'Home Down Payment', icon: '🏠', target: 20000, current: 13600, deadline: 'Dec 2027' },
    { id: 2, name: 'New Car', icon: '🚗', target: 10000, current: 4200, deadline: 'Jun 2027' },
    { id: 3, name: 'Vacation Fund', icon: '🌴', target: 3000, current: 2550, deadline: 'Aug 2026' }
  ];

  // Scheduled Bills
  const scheduledBills = [
    { id: 1, name: 'Electric Company', icon: '⚡', amount: 126.40, dueDate: 'Jul 20, 2026', status: 'pending' },
    { id: 2, name: 'Phone Service', icon: '📱', amount: 89.99, dueDate: 'Jul 25, 2026', status: 'pending' },
    { id: 3, name: 'Internet Service', icon: '🌐', amount: 59.99, dueDate: 'Jul 28, 2026', status: 'pending' },
    { id: 4, name: 'Rent Payment', icon: '🏠', amount: 1500.00, dueDate: 'Aug 1, 2026', status: 'pending' },
    { id: 5, name: 'Car Insurance', icon: '🚗', amount: 145.00, dueDate: 'Aug 15, 2026', status: 'pending' }
  ];

  // Initialize or load account data
  function initAccountData() {
    const storedAccounts = localStorage.getItem('northstarBankAccounts');
    if (!storedAccounts) {
      localStorage.setItem('northstarBankAccounts', JSON.stringify(defaultAccounts));
    }
    return JSON.parse(localStorage.getItem('northstarBankAccounts')) || defaultAccounts;
  }

  // Format currency
  function formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Update balance cards
  function updateBalanceCards() {
    const accounts = initAccountData();
    
    const totalBalance = accounts.checking.balance + accounts.savings.balance + accounts.credit.balance;
    const totalAvailable = accounts.checking.available + accounts.savings.available + accounts.credit.available;
    
    if (document.getElementById('totalBalance')) {
      document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);
    }
    if (document.getElementById('checkingBalance')) {
      document.getElementById('checkingBalance').textContent = formatCurrency(accounts.checking.balance);
    }
    if (document.getElementById('checkingAvailable')) {
      document.getElementById('checkingAvailable').textContent = formatCurrency(accounts.checking.available);
    }
    if (document.getElementById('savingsBalance')) {
      document.getElementById('savingsBalance').textContent = formatCurrency(accounts.savings.balance);
    }
    if (document.getElementById('savingsAvailable')) {
      document.getElementById('savingsAvailable').textContent = formatCurrency(accounts.savings.available);
    }
    if (document.getElementById('creditBalance')) {
      document.getElementById('creditBalance').textContent = formatCurrency(accounts.credit.balance);
    }
    if (document.getElementById('creditAvailable')) {
      document.getElementById('creditAvailable').textContent = formatCurrency(accounts.credit.available);
    }
  }

  // Update accounts page
  function updateAccountsPage() {
    const accounts = initAccountData();
    
    // Update checking account
    if (document.getElementById('checkingType')) {
      document.getElementById('checkingType').textContent = accounts.checking.type;
      document.getElementById('checkingNumber').textContent = accounts.checking.number;
      document.getElementById('checkingBalance').textContent = formatCurrency(accounts.checking.balance);
      document.getElementById('checkingRate').textContent = accounts.checking.interestRate;
      document.getElementById('checkingInterest').textContent = formatCurrency(accounts.checking.interestYTD);
    }
    
    // Update savings account
    if (document.getElementById('savingsType')) {
      document.getElementById('savingsType').textContent = accounts.savings.type;
      document.getElementById('savingsNumber').textContent = accounts.savings.number;
      document.getElementById('savingsBalance').textContent = formatCurrency(accounts.savings.balance);
      document.getElementById('savingsRate').textContent = accounts.savings.interestRate;
      document.getElementById('savingsInterest').textContent = formatCurrency(accounts.savings.interestYTD);
    }
    
    // Update credit card
    if (document.getElementById('creditType')) {
      document.getElementById('creditType').textContent = accounts.credit.type;
      document.getElementById('creditNumber').textContent = accounts.credit.number;
      document.getElementById('creditBalance').textContent = formatCurrency(accounts.credit.balance);
      document.getElementById('creditAvailable').textContent = formatCurrency(accounts.credit.available);
      document.getElementById('creditLimit').textContent = formatCurrency(accounts.credit.creditLimit);
      document.getElementById('creditPoints').textContent = accounts.credit.rewardsPoints.toLocaleString();
    }
  }

  // Render transactions
  function renderTransactions() {
    const container = document.querySelector('.transaction-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    transactions.slice(0, 10).forEach(tx => {
      const icon = getTransactionIcon(tx.icon);
      const amountClass = tx.amount >= 0 ? 'positive' : 'negative';
      const amountPrefix = tx.amount >= 0 ? '+' : '';
      
      const html = `
        <div class="transaction-item">
          <div class="transaction-icon ${tx.icon === 'deposit' ? 'deposit' : ''}">
            ${icon}
          </div>
          <div class="transaction-details">
            <div class="transaction-name">${tx.name}</div>
            <div class="transaction-meta">${tx.date} • ${tx.method}</div>
          </div>
          <div class="transaction-amount ${amountClass}">${amountPrefix}${formatCurrency(tx.amount)}</div>
        </div>
      `;
      container.innerHTML += html;
    });
  }

  // Get transaction icon SVG
  function getTransactionIcon(type) {
    const icons = {
      deposit: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 9l7-7 7 7"/></svg>',
      shopping: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293a1 1 0 001.414 1.414L10 15"/></svg>',
      entertainment: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="16" height="12" rx="2"/><path d="M12 7v10"/></svg>',
      transport: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="14" height="10" rx="2"/><circle cx="17" cy="16" r="2"/></svg>',
      cash: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke="2"><rect x="2" y="6" width="16" height="8" rx="2"/><path d="M10 2v4M10 14v4"/></svg>',
      dining: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21a9 9 0 009-9 9 0 00-9-9 9 0 009 9 9 0 00-9-9z"/><path d="M12 12v6"/></svg>',
      utilities: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 10V3L4 14h7"/></svg>',
      transfer: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10l7-7m0 0l7 7m7-7v12"/></svg>',
      fitness: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6a2 2 0 11-4 0 2 2 0 014 0"/><path d="M6 12a2 2 0 11-4 0 2 2 0 014 0"/><path d="M10 2v4"/></svg>',
      insurance: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V8"/><path d="M4 12c0 2 8 2 8 10"/><path d="M4 12c0 2 8 2 8 10"/></svg>'
    };
    return icons[type] || icons.shopping;
  }

  // Render spending chart
  function renderSpendingChart() {
    const container = document.querySelector('.spending-chart');
    if (!container) return;
    
    const total = Object.values(spendingData).reduce((a, b) => a + b, 0);
    const maxSpending = Math.max(...Object.values(spendingData));
    
    container.innerHTML = '';
    
    Object.entries(spendingData).forEach(([category, amount]) => {
      const percentage = (amount / maxSpending) * 100;
      const html = `
        <div class="chart-bar">
          <div class="bar-label">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="bar-value">${formatCurrency(amount)}</div>
        </div>
      `;
      container.innerHTML += html;
    });
    
    // Update total
    const totalEl = document.querySelector('.total-amount');
    const totalElId = document.getElementById('totalSpending');
    if (totalEl) {
      totalEl.textContent = formatCurrency(total);
    }
    if (totalElId) {
      totalElId.textContent = formatCurrency(total);
    }
  }

  // Render goals
  function renderGoals() {
    const container = document.querySelector('.goals-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    goals.forEach(goal => {
      const percentage = Math.round((goal.current / goal.target) * 100);
      const remaining = goal.target - goal.current;
      
      const html = `
        <div class="goal-item">
          <div class="goal-icon">${goal.icon}</div>
          <div class="goal-info">
            <div class="goal-name">${goal.name}</div>
            <div class="goal-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
              </div>
            </div>
            <div class="goal-amounts">
              <span>${formatCurrency(goal.current)}</span>
              <span class="goal-target">of ${formatCurrency(goal.target)}</span>
            </div>
          </div>
        </div>
      `;
      container.innerHTML += html;
    });
  }

  // Quick action handlers
  function setupQuickActions() {
    const actions = document.querySelectorAll('.action-btn');
    
    actions.forEach(btn => {
      btn.addEventListener('click', function() {
        const action = this.textContent.trim();
        
        if (action.includes('Transfer')) {
          window.location.href = 'transfers.html';
        } else if (action.includes('Pay')) {
          window.location.href = 'payments.html';
        } else if (action.includes('Mobile')) {
          showNotification('Mobile deposit: Take a photo of your check');
        } else if (action.includes('Deposit')) {
          showNotification('To deposit cash or checks, visit a branch or ATM');
        } else if (action.includes('Find')) {
          window.location.href = 'locations.html';
        } else if (action.includes('Send')) {
          window.location.href = 'transfers.html';
        } else {
          showNotification(`${action} feature coming soon!`);
        }
      });
    });
  }

  // Account action handlers
  function setupAccountActions() {
    const accountBtns = document.querySelectorAll('.account-btn');
    
    accountBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const action = this.textContent.trim();
        
        if (action.includes('Transfer')) {
          window.location.href = 'transfers.html';
        } else if (action.includes('Payment')) {
          window.location.href = 'payments.html';
        } else if (action.includes('Statement')) {
          window.location.href = 'statements.html';
        } else if (action.includes('Details')) {
          showNotification('Account details: Opening the detailed view');
        } else {
          showNotification(`${action} feature coming soon!`);
        }
      });
    });
  }

  // Show notification
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: #33c1cf;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  function initDashboard() {
    console.log('Initializing dashboard data...');
    updateBalanceCards();
    renderTransactions();
    renderSpendingChart();
    renderGoals();
    setupQuickActions();
    setupAccountActions();
    
    // Check if we're on accounts page and update it
    if (window.location.pathname.includes('accounts.html')) {
      updateAccountsPage();
    }
    
    console.log('Dashboard data initialized');
    
    // Refresh data every 30 seconds
    setInterval(() => {
      updateBalanceCards();
      if (window.location.pathname.includes('accounts.html')) {
        updateAccountsPage();
      }
    }, 30000);
  }

  // Initialize immediately
  console.log('DOM ready state:', document.readyState);
  initDashboard();

  // Expose functions globally for other scripts
  window.dashboardData = {
    updateBalanceCards,
    updateAccountsPage,
    renderTransactions,
    renderSpendingChart,
    renderGoals,
    initAccountData,
    getAccounts: () => initAccountData()
  };

})();
