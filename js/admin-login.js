const adminLoginForm = document.getElementById('adminLoginForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Check if already logged in as admin
window.addEventListener('load', function() {
  const currentUser = localStorage.getItem('currentUser');
  const rememberDevice = localStorage.getItem('rememberAdminDevice');

  if (currentUser && rememberDevice) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === currentUser);
    
    if (user && (user.role === 'admin' || user.username === 'admin')) {
      window.location.href = 'admin.html';
    }
  }
});

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  successMessage.style.display = 'none';
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 5000);
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.style.display = 'block';
  errorMessage.style.display = 'none';
}

adminLoginForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;
  const remember = document.querySelector('input[name="admin-remember"]').checked;

  if (email.trim() === '' || password.trim() === '') {
    showError('❌ Please enter both username and password');
    return;
  }

  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => (u.username === email || u.email === email) && u.password === password);

  if (!user) {
    showError('❌ Invalid admin credentials');
    return;
  }

  // Check if user is admin
  if (user.role !== 'admin' && user.username !== 'admin') {
    showError('❌ Access Denied! This account does not have admin privileges.');
    return;
  }

  // Successful login
  localStorage.setItem('currentUser', user.username);
  
  if (remember) {
    localStorage.setItem('rememberAdminDevice', 'true');
  } else {
    localStorage.removeItem('rememberAdminDevice');
  }

  showSuccess('✅ Admin authentication successful. Redirecting...');
  
  setTimeout(() => {
    window.location.href = 'admin.html';
  }, 1500);
});

// Focus effects
const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
inputs.forEach(input => {
  input.addEventListener('focus', function() {
    this.parentElement.classList.add('transform', 'scale-105');
  });
  input.addEventListener('blur', function() {
    this.parentElement.classList.remove('transform', 'scale-105');
  });
});
