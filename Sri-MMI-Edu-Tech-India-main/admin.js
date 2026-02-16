// ========================================
// Admin Credentials (Default)
// ========================================
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'srimmi2025';

// ========================================
// DOM Elements
// ========================================
const loginSection = document.getElementById('loginSection');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const logoutBtn = document.getElementById('logoutBtn');
const leadsTableBody = document.getElementById('leadsTableBody');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const exportBtn = document.getElementById('exportBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// Stats elements
const totalLeadsEl = document.getElementById('totalLeads');
const todayLeadsEl = document.getElementById('todayLeads');
const popularCourseEl = document.getElementById('popularCourse');

// ========================================
// Check if Already Logged In
// ========================================
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showDashboard();
    }
});

// ========================================
// Login Form Handler
// ========================================
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Successful login
        sessionStorage.setItem('adminLoggedIn', 'true');
        errorMessage.classList.remove('show');
        showDashboard();
    } else {
        // Failed login
        errorMessage.classList.add('show');
        document.getElementById('password').value = '';
        
        // Hide error after 3 seconds
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
    }
});

// ========================================
// Logout Handler
// ========================================
logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminLoggedIn');
        loginSection.style.display = 'block';
        adminDashboard.classList.remove('active');
        loginForm.reset();
    }
});

// ========================================
// Show Dashboard
// ========================================
function showDashboard() {
    loginSection.style.display = 'none';
    adminDashboard.classList.add('active');
    loadLeads();
    updateStats();
}

// ========================================
// Load and Display Leads
// ========================================
let allLeads = [];

function loadLeads(searchTerm = '') {
    allLeads = JSON.parse(localStorage.getItem('sriMMILeads')) || [];
    
    // Filter leads based on search term
    let filteredLeads = allLeads;
    if (searchTerm) {
        filteredLeads = allLeads.filter(lead => {
            return lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   lead.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   lead.phone.includes(searchTerm);
        });
    }
    
    // Sort by timestamp (newest first)
    filteredLeads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (filteredLeads.length === 0) {
        leadsTableBody.innerHTML = '';
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        displayLeads(filteredLeads);
    }
}

// ========================================
// Display Leads in Table
// ========================================
function displayLeads(leads) {
    leadsTableBody.innerHTML = '';
    
    leads.forEach((lead, index) => {
        const row = document.createElement('tr');
        
        // Determine badge class based on course
        let badgeClass = 'other';
        if (lead.course.toLowerCase().includes('mbbs') || 
            lead.course.toLowerCase().includes('md') || 
            lead.course.toLowerCase().includes('ms') ||
            lead.course.toLowerCase().includes('bds') ||
            lead.course.toLowerCase().includes('mds')) {
            badgeClass = 'mbbs';
        } else if (lead.course.toLowerCase().includes('engineering') || 
                   lead.course.toLowerCase().includes('biotech')) {
            badgeClass = 'engineering';
        } else if (lead.course.toLowerCase().includes('nursing') || 
                   lead.course.toLowerCase().includes('pharmacy')) {
            badgeClass = 'nursing';
        }
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(lead.name)}</strong></td>
            <td>${escapeHtml(lead.email)}</td>
            <td>${escapeHtml(lead.phone)}</td>
            <td><span class="badge ${badgeClass}">${escapeHtml(lead.course)}</span></td>
            <td>${escapeHtml(lead.message.substring(0, 50))}${lead.message.length > 50 ? '...' : ''}</td>
            <td>${escapeHtml(lead.date)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-delete" onclick="deleteLead('${lead.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        leadsTableBody.appendChild(row);
    });
}

// ========================================
// Update Statistics
// ========================================
function updateStats() {
    const leads = JSON.parse(localStorage.getItem('sriMMILeads')) || [];
    
    // Total leads
    totalLeadsEl.textContent = leads.length;
    
    // Today's leads
    const today = new Date().toLocaleDateString('en-IN');
    const todayLeads = leads.filter(lead => {
        const leadDate = new Date(lead.timestamp).toLocaleDateString('en-IN');
        return leadDate === today;
    });
    todayLeadsEl.textContent = todayLeads.length;
    
    // Most popular course
    if (leads.length > 0) {
        const courseCounts = {};
        leads.forEach(lead => {
            courseCounts[lead.course] = (courseCounts[lead.course] || 0) + 1;
        });
        
        const popularCourse = Object.keys(courseCounts).reduce((a, b) => 
            courseCounts[a] > courseCounts[b] ? a : b
        );
        
        popularCourseEl.textContent = popularCourse;
    } else {
        popularCourseEl.textContent = '-';
    }
}

// ========================================
// Delete Lead
// ========================================
function deleteLead(leadId) {
    if (confirm('Are you sure you want to delete this lead?')) {
        let leads = JSON.parse(localStorage.getItem('sriMMILeads')) || [];
        leads = leads.filter(lead => lead.id !== leadId);
        localStorage.setItem('sriMMILeads', JSON.stringify(leads));
        
        loadLeads(searchInput.value);
        updateStats();
        
        // Show success message
        showNotification('Lead deleted successfully', 'success');
    }
}

// ========================================
// Search Functionality
// ========================================
searchInput.addEventListener('input', (e) => {
    loadLeads(e.target.value);
});

// ========================================
// Export Data to CSV
// ========================================
exportBtn.addEventListener('click', () => {
    const leads = JSON.parse(localStorage.getItem('sriMMILeads')) || [];
    
    if (leads.length === 0) {
        alert('No leads to export');
        return;
    }
    
    // Create CSV content
    let csv = 'Name,Email,Phone,Course,Message,Date\n';
    
    leads.forEach(lead => {
        csv += `"${lead.name}","${lead.email}","${lead.phone}","${lead.course}","${lead.message}","${lead.date}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `sri_mmi_leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Data exported successfully', 'success');
});

// ========================================
// Clear All Leads
// ========================================
clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete ALL leads? This action cannot be undone!')) {
        if (confirm('This will permanently delete all lead data. Are you absolutely sure?')) {
            localStorage.removeItem('sriMMILeads');
            loadLeads();
            updateStats();
            showNotification('All leads have been deleted', 'success');
        }
    }
});

// ========================================
// Utility Functions
// ========================================

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// Auto Refresh Stats Every 30 Seconds
// ========================================
setInterval(() => {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        updateStats();
    }
}, 30000);

// ========================================
// Console Welcome Message
// ========================================
console.log('%cSRI MMI EDU TECH INDIA - Admin Panel', 'color: #1e5da8; font-size: 20px; font-weight: bold;');
console.log('%cDefault Credentials:', 'color: #8b1538; font-size: 14px; font-weight: bold;');
console.log('Username: admin');
console.log('Password: srimmi2025');
console.log('%cPlease change the default credentials in production!', 'color: #dc3545; font-size: 12px; font-weight: bold;');
