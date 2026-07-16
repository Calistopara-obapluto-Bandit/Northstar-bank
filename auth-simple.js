// Simple Authentication - localStorage based (works without backend)
(function(){
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }

  function initAuth() {
    console.log('Simple auth system initializing...');
    
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

    // Check if user is logged in
    const currentUser = localStorage.getItem('northstarUser');
    if (currentUser) {
      showDashboard(currentUser);
    } else {
      // Show modal on index page
      if (modal && window.location.pathname.includes('index.html')) {
        modal.classList.add('open');
        modal.style.display = 'grid';
      }
    }

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

    // Simple Sign In (localStorage only for demo)
    function handleSignIn() {
      const email = signinEmail.value.trim();
      const password = signinPassword.value.trim();

      if (!email || !password) {
        signinError.textContent = 'Please enter email and password';
        signinError.hidden = false;
        return;
      }

      // Demo: Store user in localStorage
      localStorage.setItem('northstarUser', email.split('@')[0]);
      showDashboard(email.split('@')[0]);
      window.location.href = 'dashboard.html';
    }

    // Simple Sign Up
    function handleSignUp() {
      const name = fullName.value.trim();
      const emailVal = email.value.trim();
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

      // Demo: Store user in localStorage
      localStorage.setItem('northstarUser', name);
      showDashboard(name);
      window.location.href = 'dashboard.html';
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
      signOutBtn.addEventListener('click', () => {
        localStorage.removeItem('northstarUser');
        window.location.href = 'index.html';
      });
    }

    console.log('Simple auth system initialized');
  }
})();
