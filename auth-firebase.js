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
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Northstar Bank Authentication System with Firebase
(function(){
  'use strict';

  function initAuth() {
    console.log('Initializing Firebase auth system...');
    
    const modal = document.getElementById('accessModal');
    const dashboard = document.getElementById('dashboard');
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    
    const signInBtn = document.getElementById('signInBtn');
    const signinEmail = document.getElementById('signinEmail');
    const signinPassword = document.getElementById('signinPassword');
    const signinError = document.getElementById('signinError');
    const switchToSignup = document.getElementById('switchToSignup');
    
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const createAccountBtn = document.getElementById('createAccountBtn');
    const signupError = document.getElementById('signupError');
    const switchToSignin = document.getElementById('switchToSignin');
    
    const memberNameEl = document.getElementById('memberName');
    const closeBtn = document.getElementById('closeModal');
    const signOutBtn = document.getElementById('signOut');

    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('User is signed in:', user.email);
        showDashboard(user.displayName || user.email.split('@')[0]);
      } else {
        console.log('User is signed out');
        // Show modal on index page
        if (modal && (window.location.pathname.includes('index.html') || window.location.pathname === '/')) {
          modal.classList.add('open');
          modal.style.display = 'grid';
        }
      }
    });

    function showDashboard(name) {
      if (dashboard) {
        dashboard.classList.add('show');
        dashboard.style.display = 'block';
        if (memberNameEl) {
          memberNameEl.textContent = name;
        }
      }
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    }

    // Sign In Handler with Firebase
    async function handleSignIn() {
      const emailVal = signinEmail.value.trim();
      const pass = signinPassword.value.trim();

      if (!emailVal || !pass) {
        signinError.textContent = 'Please enter email and password';
        signinError.hidden = false;
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailVal, pass);
        console.log('Sign in successful:', userCredential.user);
        // Auth state listener will handle redirect
      } catch (error) {
        console.error('Sign in error:', error);
        signinError.textContent = getErrorMessage(error.code);
        signinError.hidden = false;
      }
    }

    // Sign Up Handler with Firebase
    async function handleSignUp() {
      const name = fullName.value.trim();
      const emailVal = email.value.trim();
      const phoneVal = phone.value.trim();
      const pass = password.value.trim();
      const confirm = confirmPassword.value.trim();

      if (!name || !emailVal || !pass) {
        signupError.textContent = 'Please fill in all required fields';
        signupError.hidden = false;
        return;
      }

      if (pass !== confirm) {
        signupError.textContent = 'Passwords do not match';
        signupError.hidden = false;
        return;
      }

      if (pass.length < 6) {
        signupError.textContent = 'Password must be at least 6 characters';
        signupError.hidden = false;
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, emailVal, pass);
        
        // Update user profile with name
        await userCredential.user.updateProfile({
          displayName: name
        });

        // Create user document in Firestore
        await addDoc(collection(db, 'users'), {
          uid: userCredential.user.uid,
          name: name,
          email: emailVal,
          phone: phoneVal,
          createdAt: new Date()
        });

        // Create default accounts
        await addDoc(collection(db, 'accounts'), {
          uid: userCredential.user.uid,
          type: 'checking',
          balance: 12458.42,
          accountNumber: '**** 4821',
          interestRate: '0.01% APY',
          interestYTD: 12.45
        });

        await addDoc(collection(db, 'accounts'), {
          uid: userCredential.user.uid,
          type: 'savings',
          balance: 10915.67,
          accountNumber: '**** 9064',
          interestRate: '2.50% APY',
          interestYTD: 272.89
        });

        await addDoc(collection(db, 'accounts'), {
          uid: userCredential.user.uid,
          type: 'credit',
          balance: 1284.33,
          accountNumber: '**** 1139',
          creditLimit: 10000,
          rewardsPoints: 2450
        });

        // Create default goals
        await addDoc(collection(db, 'goals'), {
          uid: userCredential.user.uid,
          name: 'Home Down Payment',
          icon: '🏠',
          targetAmount: 20000,
          currentAmount: 13600,
          deadline: '2027-12-01'
        });

        await addDoc(collection(db, 'goals'), {
          uid: userCredential.user.uid,
          name: 'New Car',
          icon: '🚗',
          targetAmount: 10000,
          currentAmount: 4200,
          deadline: '2027-06-01'
        });

        await addDoc(collection(db, 'goals'), {
          uid: userCredential.user.uid,
          name: 'Vacation Fund',
          icon: '🌴',
          targetAmount: 3000,
          currentAmount: 2550,
          deadline: '2026-08-01'
        });

        console.log('Sign up successful:', userCredential.user);
        // Auth state listener will handle redirect
      } catch (error) {
        console.error('Sign up error:', error);
        signupError.textContent = getErrorMessage(error.code);
        signupError.hidden = false;
      }
    }

    function getErrorMessage(code) {
      switch (code) {
        case 'auth/email-already-in-use':
          return 'Email already in use';
        case 'auth/invalid-email':
          return 'Invalid email address';
        case 'auth/weak-password':
          return 'Password is too weak';
        case 'auth/user-not-found':
          return 'User not found';
        case 'auth/wrong-password':
          return 'Incorrect password';
        default:
          return 'An error occurred. Please try again.';
      }
    }

    // Event Listeners
    if (signInBtn) {
      signInBtn.addEventListener('click', handleSignIn);
    }

    if (signinPassword) {
      signinPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignIn();
      });
    }

    if (switchToSignup) {
      switchToSignup.addEventListener('click', () => {
        signinForm.style.display = 'none';
        signupForm.style.display = 'block';
        signinError.hidden = true;
      });
    }

    if (createAccountBtn) {
      createAccountBtn.addEventListener('click', handleSignUp);
    }

    if (switchToSignin) {
      switchToSignin.addEventListener('click', () => {
        signupForm.style.display = 'none';
        signinForm.style.display = 'block';
        signupError.hidden = true;
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
        modal.style.display = 'none';
      });
    }

    if (signOutBtn) {
      signOutBtn.addEventListener('click', async () => {
        await firebaseSignOut(auth);
        window.location.href = 'index.html';
      });
    }

    console.log('Firebase auth system initialized');
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
})();
