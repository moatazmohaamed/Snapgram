# 📸 Snapgram - Social Media Application

A modern, responsive social media web application built with vanilla HTML, CSS (Tailwind), and JavaScript. Features a clean UI/UX with dark mode support and hash-based SPA routing.

---

## 🚀 Features (still on progress)

- ✨ **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- 🌓 **Dark Mode** - Full dark mode support
- 🔐 **Authentication Pages** - Sign in, Sign up, Forgot Password, OTP Verification
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🎯 **SPA Routing** - Hash-based client-side routing (no server config needed)
- 🎨 **Custom Theming** - Custom color palette and typography
- 👤 **User Profiles** - View and edit user profiles
- 🏠 **Home Feed** - Browse posts from users
- 🔍 **Explore Page** - Discover new content
- 💾 **Saved Posts** - Save and view favorite posts
- 📝 **Post Details** - Detailed post view with interactions
- 👨‍💼 **Admin Panel** - User and post management

---

## 📁 Project Structure (still on progress)

```
client/
├── pages/              # HTML pages
│   ├── index.html      # Landing/Loading page
│   ├── sign-in.html    # Sign in page
│   ├── sign-up.html    # Sign up page
│   └── 404.html        # 404 error page
│
├── js/                 # JavaScript files
│   └── router.js       # SPA router with hash-based navigation
│
├── css/                # Stylesheets
│   └── main.css        # Custom styles
│
├── config/             # Configuration files
│   └── tailwind.config.js  # Tailwind CSS configuration
│
├── assets/             # Static assets
│   ├── images/         # Images
│   └── icons/          # Icons and favicon
│
└── README.md           # This file
```

---

## 🎨 Screenshots

### 🔐 Authentication Pages

#### Sign In
![Sign In Page](/screens/auth/login.png)

#### Sign Up
![Sign Up Page](/screens/auth/sign%20up.png)

#### Forgot Password
![Forgot Password](/screens/auth/forgot%20pass.png)

#### OTP Verification
![OTP Verification](/screens/auth/verify%20otp.png)

---

### 📱 Main Application

#### Home Feed
![Home Page](/screens/home%20page.png)

#### Explore
![Explore Page](/screens/explore.png)

#### Post Details
![Post Details](/screens/post%20details.png)

#### User Profile
![User Profile](/screens/user%20profile.png)

#### Saved Posts
![Saved Posts](/screens/saved%20posts.png)

---

### 👨‍💼 Admin Panel

#### User Management
![User Management](/screens/admin/Users%20managment.png)

#### Post Management
![Post Management](/screens/admin/Posts%20management.png)

---

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first CSS framework (via CDN)
- **JavaScript (ES6+)** - Modern JavaScript features
- **Google Fonts** - Plus Jakarta Sans typography
- **Material Icons** - Icon library
- **Hash-based Routing** - Client-side SPA navigation

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local development server (Live Server, http-server, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Social Media App/client"
   ```

2. **Serve the application**
   
   Using Live Server (VS Code extension):
   - Right-click on `pages/index.html`
   - Select "Open with Live Server"

   Or using npx:
   ```bash
   npx serve .
   ```

3. **Open in browser**
   ```
   http://localhost:5500/pages/index.html
   ```

---

## 🧭 Navigation Implemented (Still on progress)

The application uses **hash-based routing** for SPA navigation:

- **Landing Page**: `index.html`
- **Sign In**: `index.html#/sign-in`
- **Sign Up**: `index.html#/sign-up`
- **404 Page**: `index.html#/404`

### How It Works

1. Open `pages/index.html` in your browser
2. The loading screen appears briefly
3. Router automatically navigates to the sign-in page
4. Click navigation links to move between pages
5. All navigation happens client-side without page reloads

---

## ⚙️ Configuration


## 🎯 Key Features Explained

### Hash-Based Routing

The router uses URL hashes (`#/route`) instead of traditional paths. This approach:
- ✅ Works without server configuration
- ✅ Supports browser back/forward buttons
- ✅ Enables direct URL access to pages
- ✅ No "Cannot GET /route" errors

### Dark Mode

Toggle between light and dark themes:
- Uses Tailwind's `dark:` variant
- Persists across page navigation
- Smooth transitions between modes

### Responsive Design

- Mobile-first approach
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Adaptive layouts for all screen sizes

---

## 📝 Development Notes

### Adding New Pages

1. Create HTML file in `pages/` directory
2. Add route to `js/router.js`:
   ```javascript
   '/new-page': {
       path: '../pages/new-page.html',
       title: 'New Page'
   }
   ```
3. Add navigation links with `onclick="router(event)"` and `href="#/new-page"`

### Styling Guidelines

- Use Tailwind utility classes
- Follow dark mode patterns: `dark:bg-background-dark`
- Maintain consistent spacing and typography
- Use custom colors from theme config

---

## 🐛 Troubleshooting

### Router not working
- Ensure `router.js` is loaded before any page-specific scripts
- Check that links use `href="#/route"` format
- Verify `onclick="router(event)"` is present on navigation links

### Styles not loading
- Check that Tailwind CDN script is in `<head>`
- Verify `tailwind.config.js` path is correct
- Clear browser cache and reload

### Images not displaying
- Verify image paths are relative to the HTML file location
- Check that image files exist in `assets/images/`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- Tailwind CSS for the amazing utility-first framework
- Google Fonts for Plus Jakarta Sans typography
- Material Icons for the icon library
- The open-source community for inspiration
