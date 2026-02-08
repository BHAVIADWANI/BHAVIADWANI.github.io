const loginForm = document.getElementById('loginForm');

// Initialize localStorage with default admin user if not exists
window.addEventListener('load', function() {
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const adminExists = users.some(u => u.username === 'admin');
  
  if (!adminExists) {
    users.push({
      username: 'admin',
      password: 'Waheguru13713@',
      email: 'admin@valentine.com',
      fullName: 'Admin',
      joined: new Date().toISOString().split('T')[0],
      status: 'active',
      role: 'admin'
    });
    localStorage.setItem('users', JSON.stringify(users));
  }
});

loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const remember = document.querySelector('input[name="remember"]').checked;
  
  // Perform validation
  if (email === '' || password === '') {
    alert('Please fill in all fields');
    return;
  }

  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => (u.username === email || u.email === email) && u.password === password);

  if (user) {
    // Store current user in both localStorage and sessionStorage
    localStorage.setItem('currentUser', user.username);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    
    if (remember) {
      localStorage.setItem('rememberedUser', user.username);
    }

    // Check if admin
    if (user.role === 'admin' || user.username === 'admin') {
      alert('Welcome Admin! 🔐');
      window.location.href = 'admin.html';
    } else {
      alert('Login successful! Welcome to Valentine\'s Day 💕');
      // Check if user has sent any invites
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const hasSentInvites = users.some(u => u.username === user.username && u.receiverUsername);
      
      if (hasSentInvites) {
        // Show option to check invite status or go to valentine page
        const goToControl = confirm('You have sent invites! Would you like to check their status?');
        window.location.href = goToControl ? 'sender-control.html' : 'valentine.html';
      } else {
        window.location.href = 'valentine.html';
      }
    }
  } else {
    alert('Invalid username/email or password. Please check your credentials and try again.');
    document.getElementById('password').value = '';
  }
});

// Optional: Add smooth focus effects
const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
inputs.forEach(input => {
  input.addEventListener('focus', function() {
    this.parentElement.parentElement.classList.add('transform', 'scale-105');
  });
  input.addEventListener('blur', function() {
    this.parentElement.parentElement.classList.remove('transform', 'scale-105');
  });
});
