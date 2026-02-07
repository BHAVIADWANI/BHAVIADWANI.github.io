# Quick Reference Guide

## 🗂️ File Organization at a Glance

### CSS Files (`/css/`)
| File | Purpose |
|------|---------|
| `login.css` | User login styling |
| `admin-login.css` | Admin login styling |
| `admin.css` | Admin dashboard styling |
| `signup.css` | Registration form styling |
| `valentine.css` | Interactive page styling |

### JavaScript Files (`/js/`)
| File | Purpose |
|------|---------|
| `login.js` | User authentication & admin check |
| `admin-login.js` | Admin authentication |
| `admin.js` | User management & analytics |
| `signup.js` | Form validation & registration |
| `valentine.js` | Interactive features & animations |

## 🌐 Page Map

| Page | URL | Purpose | Access |
|------|-----|---------|--------|
| Home | `index.html` | Landing page | Public |
| Login | `login.html` | User authentication | Public |
| Signup | `signup.html` | New user registration | Public |
| Valentine | `valentine.html` | Interactive proposal | Logged in users |
| Admin Login | `admin-login.html` | Admin authentication | Public |
| Admin Panel | `admin.html` | User management | Admin only |
| View Invite | `view-invite.html` | Invite viewing | Public |
| Forgot Password | `forgot-password.html` | Password recovery | Public |

## 🔄 User Flow

```
index.html (Home)
    ↓
signup.html (Register) → login.html (Login)
    ↓
valentine.html (Proposal Page)
    ↓
Share Invite Link → view-invite.html (Receiver)
```

## 🔐 Admin Flow

```
admin-login.html (Admin Login)
    ↓
admin.html (Dashboard)
    ├── Dashboard (Statistics)
    ├── All Users (Manage)
    └── Statistics (Analytics)
```

## 📊 Data Stored in localStorage

**Key**: `users`
**Value**: Array of user objects

**User Object Example:**
```javascript
{
  username: "john_doe",
  email: "john@example.com",
  password: "Secure123",
  fullname: "John Doe",
  joined: "2026-02-07",
  status: "active",
  role: "user",
  whoFor: "her",
  partnerName: "Jane Doe",
  photoHim: "data:image/jpeg;base64,...",
  photoHer: "data:image/jpeg;base64,..."
}
```

## 🛠️ Common Tasks

### Find Admin Credentials
→ Open `/js/login.js`
→ Search for `username: 'admin'`

### Change Admin Password
→ Edit `/js/login.js`
→ Change `password: 'Waheguru13713@'`
→ Update in all relevant files

### Customize Styling
→ Edit corresponding `/css/` file
→ Changes apply to that page only

### Add New Functionality
→ Create `new-page.html`
→ Create `/css/new-page.css`
→ Create `/js/new-page.js`
→ Link them in HTML file

## 🎨 Color Scheme

| Element | Color |
|---------|-------|
| Primary | `#bd1e59` (Deep Pink) |
| Secondary | `#e91e63` (Pink) |
| Accent | `#c2185b` (Darker Pink) |
| Background | `#fff0f6` to `#ffffff` (Light Pink Gradient) |
| Text | `#666` (Gray), `#000` (Black) |
| Success | `#4caf50` (Green) |
| Error | `#f44336` (Red) |

## 🚀 Quick Start

1. **Open in Browser**
   ```
   Open /index.html
   ```

2. **Create Test Account**
   ```
   Email: test@example.com
   Password: Test123
   ```

3. **Login as Admin**
   ```
   Username: admin
   Password: Waheguru13713@
   ```

4. **Access Admin Panel**
   ```
   Go to /admin-login.html
   Use admin credentials above
   ```

## 📱 Responsive Design

- ✅ Mobile friendly with Tailwind CSS
- ✅ Responsive grid layouts
- ✅ Mobile navigation support
- ✅ Touch-friendly buttons

## 🔍 Debugging Tips

1. **Check Browser Console**
   - Press F12 → Console tab
   - Look for errors

2. **Check localStorage**
   - F12 → Application tab
   - Click localStorage
   - View 'users' data

3. **Check CSS**
   - F12 → Elements tab
   - Inspect elements
   - Check applied styles

4. **Check JavaScript Errors**
   - F12 → Console
   - Errors show with red background
   - Click to see line number

## 🔗 Important Functions

### User Authentication
```javascript
// login.js
loginForm.addEventListener('submit', ...)

// Check admin
if (user.role === 'admin' || user.username === 'admin')
```

### Admin Dashboard
```javascript
// admin.js
function showSection(sectionId)
function loadDashboard()
function loadUsers()
function loadStatistics()
```

### Form Validation
```javascript
// signup.js
function validateStep(step)
function nextStep()
function submitSignup()
```

## ⚠️ Known Limitations

1. **Data Persistence**: Only in browser localStorage (lost if cache cleared)
2. **No Backend**: All data stored client-side
3. **No Security**: Passwords not encrypted
4. **Single Browser**: Data not synced across devices
5. **No Email**: No actual email sending

## 💡 Tips & Tricks

- Use browser DevTools (F12) to inspect code
- Clear localStorage: F12 → Application → localStorage → Clear All
- Test on mobile: Use Chrome DevTools device emulation
- Share invite links after signup
- Admin can manage all users from dashboard

## 📞 Support

For issues or questions:
1. Check the STRUCTURE_AND_CREDENTIALS.md file
2. Review the corresponding CSS/JS files
3. Check browser console for errors
4. Verify localStorage data integrity

---

**Last Updated**: February 7, 2026
**Version**: 1.0
**Status**: ✅ Complete
