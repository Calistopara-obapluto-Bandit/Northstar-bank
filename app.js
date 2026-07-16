// Main application JS (moved from inline in index.html)
(function(){
  const finalAdminRow = document.querySelector('#adminDashboard tbody tr:last-child');
  if (finalAdminRow) {
    finalAdminRow.children[2].textContent = '43 min ago';
    finalAdminRow.insertAdjacentHTML('beforeend', '<td><span class="status">Resolved</span></td>');
  }

  const modal = document.getElementById('accessModal');
  const dashboard = document.getElementById('dashboard');
  const adminDashboard = document.getElementById('adminDashboard');
  const nameInput = document.getElementById('displayName');
  const emailInput = document.getElementById('accountEmail');
  const passwordInput = document.getElementById('accountPassword');
  const member = document.getElementById('memberName');
  const error = document.getElementById('accessError');
  let lastActiveElement = null;

  function openModal(){
    lastActiveElement = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    nameInput.focus();
    document.addEventListener('keydown', trapFocus);
  }

  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    error.hidden = true;
    document.removeEventListener('keydown', trapFocus);
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') lastActiveElement.focus();
  }

  function trapFocus(e){
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function hideLanding(){
    const home = document.querySelector('main#home');
    if (home) home.style.display='none';
    const hdr = document.querySelector('body > header'); if (hdr) hdr.style.display='none';
    const ftr = document.querySelector('body > footer'); if (ftr) ftr.style.display='none';
  }

  function showLanding(){
    dashboard.classList.remove('show');
    adminDashboard.classList.remove('show');
    const home = document.querySelector('main#home'); if (home) home.style.display='';
    const hdr = document.querySelector('body > header'); if (hdr) hdr.style.display='';
    const ftr = document.querySelector('body > footer'); if (ftr) ftr.style.display='';
    window.scrollTo(0,0);
  }

  function showError(message){ error.textContent = message; error.hidden = false; }

  async function request(url, options={}) {
    const response = await fetch(url, options);
    const data = response.status === 204 ? {} : await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to complete that request.');
    return data;
  }

  function enter(user){
    closeModal();
    hideLanding();
    if (user.role === 'admin') { adminDashboard.classList.add('show'); }
    else { member.textContent = user.name || 'Member'; dashboard.classList.add('show'); }
    window.scrollTo(0,0);
  }

  async function authenticate(path){
    try {
      const data = await request(path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: nameInput.value.trim(), email: emailInput.value.trim(), password: passwordInput.value }) });
      localStorage.setItem('northstarToken', data.token);
      enter(data.user);
    } catch(err) { showError(err.message); }
  }

  async function exitAccount(){
    const token = localStorage.getItem('northstarToken');
    try { if (token) await request('/api/auth/logout', { method:'POST', headers:{ Authorization: 'Bearer ' + token } }); } catch(_) {}
    localStorage.removeItem('northstarToken');
    showLanding();
  }

  document.querySelectorAll('.access-trigger').forEach(button => button.addEventListener('click', openModal));
  const closeBtn = document.getElementById('closeModal'); if (closeBtn) closeBtn.addEventListener('click', closeModal);
  const enterBtn = document.getElementById('enterDashboard'); if (enterBtn) enterBtn.addEventListener('click', () => authenticate('/api/auth/signup'));
  const signInBtn = document.getElementById('signIn'); if (signInBtn) signInBtn.addEventListener('click', () => authenticate('/api/auth/signin'));
  const openAdminBtn = document.getElementById('openAdmin'); if (openAdminBtn) openAdminBtn.addEventListener('click', async () => { try { const data = await request('/api/auth/admin', { method:'POST' }); localStorage.setItem('northstarToken', data.token); enter(data.user); } catch(err) { showError(err.message); } });
  const signOutBtn = document.getElementById('signOut'); if (signOutBtn) signOutBtn.addEventListener('click', exitAccount);
  const exitAdminBtn = document.getElementById('exitAdmin'); if (exitAdminBtn) exitAdminBtn.addEventListener('click', exitAccount);

  const savedToken = localStorage.getItem('northstarToken');
  if (savedToken) request('/api/session', { headers: { Authorization: 'Bearer ' + savedToken } }).then(data => enter(data.user)).catch(() => localStorage.removeItem('northstarToken'));
})();

// Runtime fallback: convert remaining in-page anchors to separate pages
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href="#home"]').forEach(a => a.setAttribute('href', 'index.html'));
  document.querySelectorAll('a[href="#locations"]').forEach(a => a.setAttribute('href', 'locations.html'));
});
