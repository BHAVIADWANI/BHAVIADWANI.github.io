// Check if user is logged in as admin
window.addEventListener('load', function() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    alert('Please login as admin first');
    window.location.href = 'admin-login.html';
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.username === currentUser);

  if (!user || (user.role !== 'admin' && user.username !== 'admin')) {
    alert('Unauthorized access. Admin only!');
    window.location.href = 'admin-login.html';
    return;
  }

  loadDashboard();
});

function getUsers() {
  return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.classList.remove('active'));

  const sidebarItems = document.querySelectorAll('.sidebar-item');
  sidebarItems.forEach(item => item.classList.remove('active'));

  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
  }
  event.target.classList.add('active');

  const titles = {
    'dashboard': 'Dashboard',
    'users': 'Manage Users',
    'statistics': 'Statistics'
  };
  document.getElementById('pageTitle').textContent = titles[sectionId];

  loadData(sectionId);
}

function loadData(sectionId) {
  if (sectionId === 'dashboard') {
    loadDashboard();
  } else if (sectionId === 'users') {
    loadUsers();
  } else if (sectionId === 'statistics') {
    loadStatistics();
  }
}

function loadDashboard() {
  const users = getUsers().filter(u => u.username !== 'admin' || u.role === 'user');
  
  document.getElementById('totalUsers').textContent = users.length;
  document.getElementById('activeUsers').textContent = users.filter(u => u.status === 'active').length;
  document.getElementById('adminCount').textContent = getUsers().filter(u => u.role === 'admin' || u.username === 'admin').length;
  document.getElementById('usersWithPhotos').textContent = users.filter(u => u.photoHim || u.photoHer).length;

  const tbody = document.getElementById('recentUsersBody');
  tbody.innerHTML = '';
  users.slice(-5).reverse().forEach(user => {
    tbody.innerHTML += `
      <tr>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.joined}</td>
        <td><span class="badge badge-${user.status}">${user.status.toUpperCase()}</span></td>
      </tr>
    `;
  });
}

function loadUsers() {
  const users = getUsers().filter(u => u.username !== 'admin' || u.role === 'user');
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = '';
  
  users.forEach((user) => {
    const hasPhotos = (user.photoHim || user.photoHer) ? '✅' : '❌';
    tbody.innerHTML += `
      <tr>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.fullname || '-'}</td>
        <td>${user.joined}</td>
        <td><span class="badge badge-${user.status}">${user.status.toUpperCase()}</span></td>
        <td><span class="badge badge-${user.role}">${user.role.toUpperCase()}</span></td>
        <td>${hasPhotos}</td>
        <td>
          <button class="btn btn-edit" onclick="editUser('${user.username}')">Edit</button>
          <button class="btn btn-delete" onclick="deleteUser('${user.username}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

function loadStatistics() {
  const users = getUsers().filter(u => u.username !== 'admin' || u.role === 'user');
  
  document.getElementById('regularUsers').textContent = users.filter(u => u.role === 'user' || !u.role).length;
  document.getElementById('adminUsers').textContent = getUsers().filter(u => u.role === 'admin' || u.username === 'admin').length;
  document.getElementById('activeCount').textContent = users.filter(u => u.status === 'active').length;
  document.getElementById('inactiveCount').textContent = users.filter(u => u.status === 'inactive').length;
  document.getElementById('photosCount').textContent = users.filter(u => u.photoHim || u.photoHer).length;
  document.getElementById('noPhotosCount').textContent = users.filter(u => !u.photoHim && !u.photoHer).length;
  document.getElementById('avgUsersDay').textContent = Math.ceil(users.length / 1) + ' users';
}

function editUser(username) {
  const users = getUsers();
  const user = users.find(u => u.username === username);

  if (user) {
    document.getElementById('editUserId').value = username;
    document.getElementById('editFullName').value = user.fullname || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editStatus').value = user.status || 'active';
    document.getElementById('editRole').value = user.role || 'user';

    if (user.photoHim) {
      document.getElementById('previewPhotoHim').src = user.photoHim;
      document.getElementById('previewPhotoHim').classList.remove('hidden');
    } else {
      document.getElementById('previewPhotoHim').classList.add('hidden');
    }

    if (user.photoHer) {
      document.getElementById('previewPhotoHer').src = user.photoHer;
      document.getElementById('previewPhotoHer').classList.remove('hidden');
    } else {
      document.getElementById('previewPhotoHer').classList.add('hidden');
    }

    document.getElementById('userModal').style.display = 'block';
  }
}

function submitEditUser(event) {
  event.preventDefault();

  const username = document.getElementById('editUserId').value;
  const fullname = document.getElementById('editFullName').value;
  const email = document.getElementById('editEmail').value;
  const status = document.getElementById('editStatus').value;
  const role = document.getElementById('editRole').value;

  const users = getUsers();
  const userIndex = users.findIndex(u => u.username === username);

  if (userIndex !== -1) {
    users[userIndex].fullname = fullname;
    users[userIndex].email = email;
    users[userIndex].status = status;
    users[userIndex].role = role;

    saveUsers(users);
    closeModal();
    loadUsers();
    alert('User updated successfully!');
  }
}

function deleteUser(username) {
  if (confirm(`Are you sure you want to delete ${username}?`)) {
    let users = getUsers();
    users = users.filter(u => u.username !== username);
    saveUsers(users);
    loadUsers();
    loadDashboard();
    alert('User deleted successfully!');
  }
}

function searchUsers() {
  const searchTerm = document.getElementById('searchBox').value.toLowerCase();
  const users = getUsers().filter(u => u.username !== 'admin' || u.role === 'user');
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = '';

  const filtered = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm) ||
    (user.fullname && user.fullname.toLowerCase().includes(searchTerm))
  );

  filtered.forEach((user) => {
    const hasPhotos = (user.photoHim || user.photoHer) ? '✅' : '❌';
    tbody.innerHTML += `
      <tr>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.fullname || '-'}</td>
        <td>${user.joined}</td>
        <td><span class="badge badge-${user.status}">${user.status.toUpperCase()}</span></td>
        <td><span class="badge badge-${user.role}">${user.role.toUpperCase()}</span></td>
        <td>${hasPhotos}</td>
        <td>
          <button class="btn btn-edit" onclick="editUser('${user.username}')">Edit</button>
          <button class="btn btn-delete" onclick="deleteUser('${user.username}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

function closeModal() {
  document.getElementById('userModal').style.display = 'none';
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('currentUser');
    alert('Logged out successfully!');
    window.location.href = 'login.html';
  }
}

window.onclick = function(event) {
  const modal = document.getElementById('userModal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}
