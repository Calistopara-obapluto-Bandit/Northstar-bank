// Northstar Bank authentication.
// Talks to the Northstar Bank API for real sign up / sign in (hashed passwords,
// JWT sessions). The JWT and member name are kept in localStorage so protected
// pages can reveal the dashboard and greet the member.
(function () {
  'use strict';

  // API base URL. Defaults to the page's origin (the backend serves this
  // frontend). Using the origin — rather than a relative path — avoids fetch
  // refusing URLs that resolve against a page URL containing credentials
  // (e.g. behind Basic-auth proxies). Override with `window.NORTHSTAR_API_BASE`.
  var API_BASE = (window.NORTHSTAR_API_BASE || window.location.origin).replace(/\/$/, '');

  var TOKEN_KEY = 'northstarToken';
  var NAME_KEY = 'northstarUser';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function getName() { return localStorage.getItem(NAME_KEY); }

  function setSession(token, name) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(NAME_KEY, name);
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem('currentUser');
  }

  function api(path, options) {
    return fetch(API_BASE + path, options).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          var msg = (data && data.detail) ? data.detail : 'Something went wrong. Please try again.';
          throw new Error(msg);
        }
        return data;
      });
    }, function () {
      throw new Error('Cannot reach the server. Please try again.');
    });
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
        clearSession();
        window.location.href = 'index.html';
      });
    });
  }

  function init() {
    var modal = document.getElementById('accessModal');
    var dashboard = document.getElementById('dashboard') || document.querySelector('.dashboard');
    var token = getToken();

    // Protected app pages (dashboard, accounts, ...) have a .dashboard wrapper
    // hidden by default and no sign-in modal.
    var isAppPage = dashboard && !modal;

    if (isAppPage) {
      if (!token) {
        window.location.href = 'index.html';
        return;
      }
      wireSignOut();
      // Verify the token server-side; reveal on success, bounce on failure.
      api('/api/me', { headers: { 'X-Auth-Token': token } }).then(function (me) {
        setSession(token, me.name);
        revealDashboard(dashboard, me.name);
      }, function () {
        clearSession();
        window.location.href = 'index.html';
      });
      return;
    }

    wireSignOut();

    // Landing page: if a valid session exists, go straight to the dashboard.
    if (isIndexPage() && token) {
      api('/api/me', { headers: { 'X-Auth-Token': token } }).then(function () {
        window.location.href = 'dashboard.html';
      }, function () {
        clearSession();
      });
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
    var phone = document.getElementById('phone');
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

    function setBusy(btn, busy, label) {
      if (!btn) return;
      btn.disabled = busy;
      btn.textContent = busy ? 'Please wait…' : label;
    }

    function handleSignIn() {
      var emailVal = signinEmail ? signinEmail.value.trim() : '';
      var pass = signinPassword ? signinPassword.value : '';
      if (signinError) signinError.hidden = true;
      if (!emailVal || !pass) {
        showError(signinError, 'Please enter email and password');
        return;
      }
      setBusy(signInBtn, true, 'Sign in');
      api('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal, password: pass })
      }).then(function (data) {
        setSession(data.token, data.name);
        window.location.href = 'dashboard.html';
      }, function (err) {
        setBusy(signInBtn, false, 'Sign in');
        showError(signinError, err.message);
      });
    }

    function handleSignUp() {
      var name = fullName ? fullName.value.trim() : '';
      var emailVal = email ? email.value.trim() : '';
      var phoneVal = phone ? phone.value.trim() : '';
      var pass = password ? password.value : '';
      var confirm = confirmPassword ? confirmPassword.value : '';
      if (signupError) signupError.hidden = true;

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
      setBusy(createAccountBtn, true, 'Create account');
      api('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: emailVal, phone: phoneVal, password: pass })
      }).then(function (data) {
        setSession(data.token, data.name);
        window.location.href = 'dashboard.html';
      }, function (err) {
        setBusy(createAccountBtn, false, 'Create account');
        showError(signupError, err.message);
      });
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
    if (confirmPassword) {
      confirmPassword.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') handleSignUp();
      });
    }

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
