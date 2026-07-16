// Dashboard Interactions
(function() {
  'use strict';
  
  console.log('Dashboard interactions script loaded');
  
  // Quick action buttons navigation
  function setupQuickActions() {
    console.log('Setting up quick actions');
    const actionButtons = document.querySelectorAll('.action-btn');
    console.log('Found action buttons:', actionButtons.length);
    actionButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const text = this.textContent.trim();
        console.log('Action button clicked:', text);
        if (text === 'Transfer Money') {
          window.location.href = 'transfers.html';
        } else if (text === 'Pay Bills') {
          window.location.href = 'payments.html';
        } else if (text === 'View Statements') {
          window.location.href = 'statements.html';
        } else if (text === 'Manage Cards') {
          window.location.href = 'cards.html';
        }
      });
    });
  }
  
  // Account action buttons
  function setupAccountActions() {
    const accountBtns = document.querySelectorAll('.account-btn, .card-btn');
    accountBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const text = this.textContent.trim();
        if (text === 'View Details') {
          alert('Account details feature coming soon!');
        } else if (text === 'Transfer') {
          window.location.href = 'transfers.html';
        } else if (text === 'Statement' || text === 'View Statement') {
          window.location.href = 'statements.html';
        } else if (text === 'Make Payment') {
          window.location.href = 'payments.html';
        } else if (text === 'Lock Card') {
          alert('Card locked successfully!');
        } else if (text === 'Settings') {
          alert('Card settings feature coming soon!');
        }
      });
    });
  }
  
  // Sign out button
  function setupSignOut() {
    const signOutBtn = document.querySelector('.signout');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', function() {
        // Clear localStorage
        localStorage.removeItem('northstarToken');
        localStorage.removeItem('currentUser');
        // Redirect to index
        window.location.href = 'index.html';
      });
    }
  }
  
  // Transfer form submission
  function setupTransferForm() {
    const transferBtn = document.querySelector('.submit-btn');
    if (transferBtn) {
      transferBtn.addEventListener('click', function() {
        const amount = document.querySelector('.form-input')?.value;
        if (amount && parseFloat(amount) > 0) {
          alert(`Transfer of $${amount} completed successfully!`);
        } else {
          alert('Please enter a valid amount');
        }
      });
    }
  }
  
  // Bill pay buttons
  function setupBillPay() {
    const billBtns = document.querySelectorAll('.bill-btn');
    billBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const amount = this.closest('.bill-item')?.querySelector('.bill-amount')?.textContent;
        if (amount) {
          alert(`Payment of ${amount} scheduled successfully!`);
        }
      });
    });
    
    // Payee items
    const payeeItems = document.querySelectorAll('.payee-item');
    payeeItems.forEach(item => {
      item.addEventListener('click', function() {
        const name = this.querySelector('.payee-name')?.textContent;
        alert(`Pay bill to ${name} - feature coming soon!`);
      });
    });
  }
  
  // Goal buttons
  function setupGoalActions() {
    const goalBtns = document.querySelectorAll('.goal-btn');
    goalBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const text = this.textContent.trim();
        if (text === 'Add Funds') {
          alert('Add funds feature coming soon!');
        } else if (text === 'Details') {
          alert('Goal details feature coming soon!');
        }
      });
    });
  }
  
  // Statement download buttons
  function setupStatements() {
    const statementBtns = document.querySelectorAll('.statement-btn');
    statementBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const item = this.closest('.statement-item');
        const details = item?.querySelector('.statement-details');
        const title = details?.querySelector('.statement-name')?.textContent;
        const date = details?.querySelector('.statement-date')?.textContent;
        alert(`Downloading ${title} for ${date}...`);
      });
    });
  }
  
  // Initialize all functionality
  function init() {
    console.log('Initializing dashboard interactions');
    setupQuickActions();
    setupAccountActions();
    setupSignOut();
    setupTransferForm();
    setupBillPay();
    setupGoalActions();
    setupStatements();
    console.log('Dashboard interactions initialized');
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', init);
  } else {
    console.log('DOM already loaded, initializing immediately');
    init();
  }
})();
