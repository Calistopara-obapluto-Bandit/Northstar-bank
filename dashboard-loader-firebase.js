// Firebase Configuration - REPLACE WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Dashboard Data Loading from Firebase
(function() {
  'use strict';
  
  console.log('Dashboard data loader initialized');
  
  // Fetch user's accounts
  async function loadAccounts(user) {
    try {
      const q = query(collection(db, 'accounts'), where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const accounts = [];
      querySnapshot.forEach((doc) => {
        accounts.push({ id: doc.id, ...doc.data() });
      });
      
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
  
  // Fetch user's goals
  async function loadGoals(user) {
    try {
      const q = query(collection(db, 'goals'), where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const goals = [];
      querySnapshot.forEach((doc) => {
        goals.push({ id: doc.id, ...doc.data() });
      });
      
      const goalCard = document.querySelector('.goal-card');
      if (goalCard && goals.length > 0) {
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
        
        // Remove old goal items
        const oldGoals = goalCard.querySelectorAll('.goal-item');
        oldGoals.forEach(g => g.remove());
        
        goalCard.appendChild(goalContainer);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  }
  
  // Initialize dashboard
  function initDashboard() {
    console.log('Loading dashboard data from Firebase...');
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        loadAccounts(user);
        loadGoals(user);
      }
    });
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
  } else {
    initDashboard();
  }
})();
