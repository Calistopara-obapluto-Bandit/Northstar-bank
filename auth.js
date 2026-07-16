// Northstar Bank Authentication System with MongoDB Backend
(function(){
  'use strict';

  // API Base URL - adjust for Replit or local
  const API_BASE = window.location.origin;

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }

  function initAuth() {
    console.log('Initializing MongoDB auth system...');
    
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

    // Check if user is already logged in
    const token = localStorage.getItem('northstarToken');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (token && currentUser) {
      showDashboard(currentUser.name);
    } else {
      // Show modal on index page
      if (modal && (window.location.pathname.includes('index.html') || window.location.pathname === '/')) {
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

    // Sign In Handler with MongoDB
    async function handleSignIn() {
      const emailVal = signinEmail.value.trim();
      const pass = signinPassword.value.trim();

      if (!emailVal || !pass) {
        signinError.textContent = 'Please enter email and password';
        signinError.hidden = false;
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailVal, password: pass })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('northstarToken', data.userId);
          localStorage.setItem('currentUser', JSON.stringify({ 
            userId: data.userId, 
            name: data.name 
          }));
          showDashboard(data.name);
          window.location.href = 'dashboard.html';
        } else {
          signinError.textContent = data.error || 'Sign in failed';
          signinError.hidden = false;
        }
      } catch (error) {
        console.error('Sign in error:', error);
        // Fallback to localStorage if backend is not available
        console.log('Backend not available, using localStorage fallback');
        localStorage.setItem('northstarUser', emailVal.split('@')[0]);
        showDashboard(emailVal.split('@')[0]);
        window.location.href = 'dashboard.html';
      }
    }

    // Sign Up Handler with MongoDB
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

      if (pass.length < 8) {
        signupError.textContent = 'Password must be at least 8 characters';
        signupError.hidden = false;
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: emailVal, 
            password: pass, 
            name: name, 
            phone: phoneVal 
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('northstarToken', data.userId);
          localStorage.setItem('currentUser', JSON.stringify({ 
            userId: data.userId, 
            name: name 
          }));
          showDashboard(name);
          window.location.href = 'dashboard.html';
        } else {
          signupError.textContent = data.error || 'Sign up failed';
          signupError.hidden = false;
        }
      } catch (error) {
        console.error('Sign up error:', error);
        // Fallback to localStorage if backend is not available
        console.log('Backend not available, using localStorage fallback');
        localStorage.setItem('northstarUser', name);
        showDashboard(name);
        window.location.href = 'dashboard.html';
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
      signOutBtn.addEventListener('click', () => {
        localStorage.removeItem('northstarToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('northstarUser');
        window.location.href = 'index.html';
      });
    }

    console.log('MongoDB auth system initialized');
  }
})();
