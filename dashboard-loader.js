// Dashboard Data Loading from MongoDB Backend
(function() {
  'use strict';
  
  const API_BASE = window.location.origin;
  
  console.log('Dashboard data loader initialized');
  
  // Fetch user's accounts
  async function loadAccounts() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/accounts/${currentUser.userId}`);
      const accounts = await response.json();
      
      // Update account list
      const accountList = document.querySelector('.account-list');
      if (accountList && accounts.length > 0) {
        accountList.innerHTML = '';
        accounts.forEach(account => {
          const accountHTML = `
            <div class="account">
              <div>
                <div class="account-type">${account.type.charAt(0).toUpperCase() + account.type.slice(1)}</div>
                <span class="account-number">${account.accountNumber || '**** ****'}</span>
              </div>
              <div>
                <div class="balance">$${account.balance.toFixed(2)}</div>
                <span class="available">Available: $${account.balance.toFixed(2)}</span>
              </div>
            </div>
          `;
          accountList.innerHTML += accountHTML;
        });
      }
      
      // Update balance cards
      const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
      const totalBalanceEl = document.querySelector('.balance-card.primary .balance-amount');
      if (totalBalanceEl) {
        totalBalanceEl.textContent = `$${totalBalance.toFixed(2)}`;
      }
      
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  }
  
  // Fetch user's transactions
  async function loadTransactions() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/transactions/${currentUser.userId}`);
      const transactions = await response.json();
      
      const activityList = document.querySelector('.activity');
      if (activityList && transactions.length > 0) {
        activityList.innerHTML = '';
        transactions.slice(0, 10).forEach(tx => {
          const amountClass = tx.type === 'deposit' ? 'positive' : 'negative';
          const amountSign = tx.type === 'deposit' ? '+' : '-';
          const activityHTML = `
            <div class="activity-item">
              <div class="activity-details">
                <div class="activity-name">${tx.description || tx.type}</div>
                <span class="activity-meta">${new Date(tx.date).toLocaleDateString()}</span>
              </div>
              <div class="amount ${amountClass}">${amountSign}$${tx.amount.toFixed(2)}</div>
            </div>
          `;
          activityList.innerHTML += activityHTML;
        });
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }
  
  // Fetch user's goals
  async function loadGoals() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/goals/${currentUser.userId}`);
      const goals = await response.json();
      
      const goalCard = document.querySelector('.goal-card');
      if (goalCard && goals.length > 0) {
        const goalsHTML = document.querySelector('.goal-card h2');
        goalsHTML.outerHTML = '<h2>Savings Goals</h2>';
        
        const goalContainer = document.createElement('div');
        goals.forEach(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const goalHTML = `
            <div class="goal-item">
              <div class="goal-header">
                <span class="goal-name">${goal.icon || '🎯'} ${goal.name}</span>
                <span class="goal-amount">$${goal.currentAmount.toFixed(2)}</span>
              </div>
              <div class="progress"><span style="width: ${progress}%"></span></div>
              <div class="goal-meta">
                <span>${progress.toFixed(0)}% complete</span>
                <span>Target: $${goal.targetAmount.toFixed(2)}</span>
              </div>
            </div>
          `;
          goalContainer.innerHTML += goalHTML;
        });
        goalCard.appendChild(goalContainer);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  }
  
  // Initialize dashboard
  function initDashboard() {
    console.log('Loading dashboard data from API...');
    loadAccounts();
    loadTransactions();
    loadGoals();
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
  } else {
    initDashboard();
  }
})();
