// Northstar Bank authentication (self-contained demo, localStorage only).
// No backend or database required: sign in / sign up store the member name
// locally and reveal the protected dashboard pages.
(function () {
  'use strict';

  var STORAGE_KEY = 'northstarUser';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function getUser() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function setUser(name) {
    localStorage.setItem(STORAGE_KEY, name);
  }

  function clearUser() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('northstarToken');
    localStorage.removeItem('currentUser');
  }

  function isIndexPage() {
    var p = window.location.pathname;
    return p === '/' || p === '' || p.endsWith('/index.html');
  }

  function revealDashboard(dashboard, name) {
    if (!dashboard) return;
    dashboard.classList.add('show');
    dashboard.style.display = 'block';
    updateGreeting(name);
  }

  function updateGreeting(name) {
    if (!name) return;
    var member = document.getElementById('memberName');
    if (member) member.textContent = name;
    var greetings = document.querySelectorAll('[data-member-name]');
    greetings.forEach(function (el) { el.textContent = name; });
  }

  function wireSignOut() {
    var buttons = document.querySelectorAll('.signout, #signOut, #exitAdmin');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        clearUser();
        window.location.href = 'index.html';
      });
    });
  }

  function init() {
    var modal = document.getElementById('accessModal');
    var dashboard = document.getElementById('dashboard') || document.querySelector('.dashboard');
    var user = getUser();

    // Protected app pages (dashboard, accounts, cards, ...) have a .dashboard
    // wrapper that is hidden by default and no sign-in modal.
    var isAppPage = dashboard && !modal;

    if (isAppPage) {
      if (!user) {
        window.location.href = 'index.html';
        return;
      }
      revealDashboard(dashboard, user);
      wireSignOut();
      return;
    }

    wireSignOut();

    // Landing page: if already signed in, go straight to the dashboard.
    if (isIndexPage() && user) {
      window.location.href = 'dashboard.html';
      return;
    }

    if (!modal) return;

    var signinForm = document.getElementById('signinForm');
    var signupForm = document.getElementById('signupForm');

    var signInBtn = document.getElementById('signInBtn');
    var signinEmail = document.getElementById('signinEmail');
    var signinPassword = document.getElementById('signinPassword');
    var signinError = document.getElementById('signinError');
    var switchToSignup = document.getElementById('switchToSignup');

    var fullName = document.getElementById('fullName');
    var email = document.getElementById('email');
    var password = document.getElementById('password');
    var confirmPassword = document.getElementById('confirmPassword');
    var createAccountBtn = document.getElementById('createAccountBtn');
    var signupError = document.getElementById('signupError');
    var switchToSignin = document.getElementById('switchToSignin');

    var closeBtn = document.getElementById('closeModal');
    var triggers = document.querySelectorAll('.access-trigger');

    function openModal() {
      modal.classList.add('open');
      modal.style.display = 'grid';
      modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
      modal.classList.remove('open');
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }

    function showError(el, message) {
      if (!el) return;
      el.textContent = message;
      el.hidden = false;
    }

    function handleSignIn() {
      var emailVal = signinEmail ? signinEmail.value.trim() : '';
      var pass = signinPassword ? signinPassword.value.trim() : '';
      if (!emailVal || !pass) {
        showError(signinError, 'Please enter email and password');
        return;
      }
      setUser(emailVal.split('@')[0]);
      window.location.href = 'dashboard.html';
    }

    function handleSignUp() {
      var name = fullName ? fullName.value.trim() : '';
      var emailVal = email ? email.value.trim() : '';
      var pass = password ? password.value.trim() : '';
      var confirm = confirmPassword ? confirmPassword.value.trim() : '';

      if (!name || !emailVal || !pass) {
        showError(signupError, 'Please fill in all required fields');
        return;
      }
      if (pass !== confirm) {
        showError(signupError, 'Passwords do not match');
        return;
      }
      if (pass.length < 8) {
        showError(signupError, 'Password must be at least 8 characters');
        return;
      }
      setUser(name);
      window.location.href = 'dashboard.html';
    }

    triggers.forEach(function (btn) {
      btn.addEventListener('click', openModal);
    });

    if (signInBtn) signInBtn.addEventListener('click', handleSignIn);
    if (signinPassword) {
      signinPassword.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') handleSignIn();
      });
    }
    if (createAccountBtn) createAccountBtn.addEventListener('click', handleSignUp);

    if (switchToSignup && signinForm && signupForm) {
      switchToSignup.addEventListener('click', function () {
        signinForm.style.display = 'none';
        signupForm.style.display = 'block';
        if (signinError) signinError.hidden = true;
      });
    }
    if (switchToSignin && signinForm && signupForm) {
      switchToSignin.addEventListener('click', function () {
        signupForm.style.display = 'none';
        signinForm.style.display = 'block';
        if (signupError) signupError.hidden = true;
      });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  }

  ready(init);
})();
