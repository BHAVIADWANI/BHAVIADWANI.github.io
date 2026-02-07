# Valentine's Day Invite - Project Documentation

## Admin Credentials

### Default Admin Account:
| Field | Value |
|-------|-------|
| **Username** | admin |
| **Email** | admin@valentine.com |
| **Password** | Waheguru13713@  |
| **Role** | admin |

**Access:** Navigate to `admin-login.html` to login with admin credentials.

---

## Project Structure

The project has been reorganized by file type for better maintainability:

```
VALENTINE-DAY-INVITE/
│
├── css/                          # Stylesheets (external CSS)
│   ├── login.css                 # Login page styles
│   ├── admin-login.css           # Admin login page styles
│   ├── admin.css                 # Admin panel styles
│   ├── signup.css                # Signup form styles
│   └── valentine.css             # Valentine's day page styles
│
├── js/                           # JavaScript files (external JS)
│   ├── login.js                  # Login page functionality
│   ├── admin-login.js            # Admin login functionality
│   ├── admin.js                  # Admin panel functionality
│   ├── signup.js                 # Signup form functionality
│   └── valentine.js              # Valentine's day page functionality
│
├── html/                         # HTML files (optional - for future use)
│
├── images/                       # Image assets
│   ├── image1.gif
│   ├── image2.gif
│   ├── image3.gif
│   ├── image4.gif
│   ├── image5.gif
│   ├── image6.gif
│   └── image7.gif
│
├── index.html                    # Home page
├── login.html                    # User login page
├── signup.html                   # User signup/registration page
├── valentine.html                # Valentine's day interactive page
├── admin-login.html              # Admin login page
├── admin.html                    # Admin dashboard/panel
├── view-invite.html              # View invite page
├── forgot-password.html          # Password recovery page
├── LICENSE                       # License file
└── README.md                     # Project documentation
```

---

## File Organization Details

### CSS Files (css/)
- **login.css**: Contains styles for user login page (gradients, input fields, buttons)
- **admin-login.css**: Admin portal styling with enhanced security UI elements
- **admin.css**: Dashboard styles including sidebar, tables, and modals
- **signup.css**: Multi-step form styling with animations
- **valentine.css**: Interactive Valentine's day page animations and layout

### JavaScript Files (js/)
- **login.js**: User authentication, admin detection, localStorage management
- **admin-login.js**: Admin authentication, device memory, redirect logic
- **admin.js**: User management, CRUD operations, statistics, search functionality
- **signup.js**: Multi-step form validation, photo handling, account creation
- **valentine.js**: Interactive buttons, photo combining, full-screen overlay, confetti animation

### HTML Files
All HTML files have been updated to reference external CSS and JS files:
- Inline styles removed and moved to corresponding CSS files
- Inline scripts removed and moved to corresponding JS files
- Links added to external stylesheets and scripts

---

## Features

### User Features
- ✅ User registration with email validation
- ✅ User login with remember-me functionality
- ✅ Password strength requirements (minimum 6 characters)
- ✅ Photo upload and storage (Base64 encoding in localStorage)
- ✅ Interactive Valentine's day proposal with animations
- ✅ Combined photo display functionality
- ✅ Confetti celebration animation

### Admin Features
- ✅ Secure admin authentication
- ✅ User dashboard with statistics
- ✅ User management (view, edit, delete)
- ✅ Search functionality for users
- ✅ Account status management
- ✅ Role assignment (admin/user)
- ✅ Recent users tracking
- ✅ Photo verification

---

## Data Storage

The application uses **localStorage** for data persistence:

### Users Object Structure
```javascript
{
  username: string,
  email: string,
  password: string (plain text - not secure for production),
  fullname: string,
  joined: date (YYYY-MM-DD),
  status: 'active' | 'inactive',
  role: 'user' | 'admin',
  whoFor: 'him' | 'her',
  partnerName: string,
  receiverUsername: string,
  photoHim: string (Base64),
  photoHer: string (Base64),
  recoveryPhotoHim: string (Base64),
  recoveryPhotoHer: string (Base64),
  inviteLink: string (generated)
}
```

---

## Usage Guide

### For Users:
1. Go to `index.html` (home page)
2. Click "Sign Up" to create an account
3. Fill in the 5-step signup form:
   - Step 1: Select who the form is for
   - Step 2: Enter personal information
   - Step 3: Add partner info and photos
   - Step 4: Recovery photos
   - Step 5: Confirm and create account
4. Login with credentials
5. View the Valentine's day proposal page
6. Share the invite link with your special someone

### For Admin:
1. Go to `admin-login.html`
2. Login with admin credentials (see above)
3. Access admin dashboard with three sections:
   - **Dashboard**: View statistics and recent users
   - **All Users**: Manage user accounts (edit/delete)
   - **Statistics**: View detailed user analytics

---

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS (CDN)
- **Storage**: Browser's localStorage API
- **Animations**: CSS keyframes, Canvas API (for photo combining)
- **Libraries**: 
  - Tailwind CSS (for utility-first styling)
  - canvas-confetti (for celebration animation)

---

## Security Notes

⚠️ **Important**: This is a demonstration/educational project. For production use:
- Passwords should be hashed and salted
- Use a proper backend database instead of localStorage
- Implement proper authentication (JWT, OAuth, etc.)
- Add HTTPS/SSL encryption
- Implement proper access control and authorization
- Sanitize user inputs to prevent XSS attacks
- Never store sensitive data in localStorage

---

## File Separation Benefits

The new structure provides:
1. **Better Maintainability**: Separate CSS and JS files for each page
2. **Code Reusability**: Shared utilities and styles
3. **Performance**: Smaller HTML files, browser caching of assets
4. **Scalability**: Easy to add new pages or features
5. **Team Collaboration**: Different developers can work on different files
6. **SEO**: Cleaner HTML structure for search engines

---

## How to Run

1. Open `index.html` in a web browser
2. The application will run entirely in the browser using localStorage
3. No server or build process required
4. All data persists in the browser's localStorage

---

## Notes for Developers

- All styles are organized in the `/css` folder by page
- All JavaScript logic is organized in the `/js` folder by page
- External links to CDN (Tailwind CSS, canvas-confetti) are maintained
- localStorage is used for both user data and session management
- Images are stored as Base64 strings in localStorage for simplicity

---

**Version**: 1.0  
**Last Updated**: February 7, 2026  
**Status**: ✅ Reorganized and Ready for Use
