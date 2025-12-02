# 🌐 Simple Social Media App (Client Side)

A beginner-friendly **social media front-end** built using **HTML**, **Tailwind CSS**, and **native JavaScript**.  
This front end connects to a PHP backend via RESTful APIs to deliver a complete social media experience.
the app must be modern UIX with clean tailwind css clasess and a responsive design
and it follows the best practices of the web and mobile app development.
The app is designed to be easy to use and understand, with a clean and modern interface.


---

## 🧭 Overview

The client side handles:
- User authentication (login/register)
- Profile creation and editing
- Viewing and creating posts
- Liking, commenting, and sharing posts
- Searching for users or content
- Responsive UI using Tailwind CSS

---

## 📂 Folder Structure

client/
│
├── /pages/ # All main app pages
│ ├── index.html # Landing or feed page
│ ├── register.html # Sign-up page
│ ├── login.html # Login page
│ ├── feed.html # Home feed showing posts
│ ├── profile.html # View user profile
│ ├── edit-profile.html # Edit user info and avatar
│ ├── create-post.html # Form to upload text/image/video post
│ ├── post.html # View a single post with comments
│ ├── search.html # Search users or posts
│ ├── settings.html # Account settings (password, privacy)
│ ├── admin-dashboard.html # (Optional) For moderators/admins
│ └── error.html # 404 or general error page
│
├── /components/ # Reusable HTML templates
│ ├── navbar.html # Top navigation bar
│ ├── footer.html # Footer links and credits
│ └── post-card.html # Post UI template
│
├── /js/ # Client-side logic
│ ├── auth.js # Handles login/register/logout
│ ├── feed.js # Fetches and displays posts
│ ├── profile.js # Loads and updates user profiles
│ ├── post.js # Handles likes/comments
│ ├── createPost.js # Handles new post creation
│ ├── search.js # User and post search logic
│ ├── ui.js # Shared UI utilities (alerts, modals)
│ └── utils.js # Helper functions and constants
│ └── routes.js # for spa feeling concept
│
├── /assets/ # Static assets
│ ├── /images/
│ ├── /icons/
│ └── logo.png
│
└── /css/
└── main.css 

└── /config/
└── tailwind.css 


---

## 🧩 Core Pages and Features

### 🔐 Authentication
- **register.html** – Signup form (username, email, password).  
- **login.html** – Login form that redirects to feed on success.
- **forgot-password.html** – Form to request password reset via email.  
- **reset-password.html** – Form to set new password using reset token.

### 👤 User Profiles
- **profile.html** – Displays user bio, avatar, and posts.  
- **edit-profile.html** – Allows user to update details and profile image.

### 🏠 Feed and Posts
- **feed.html** – Shows main feed with posts (text, image, video).  
- **create-post.html** – Lets users create new posts.  
- **post.html** – Detailed view of a single post with likes and comments.

### 💬 Interactions
- Likes, comments, and shares handled dynamically using JavaScript.
- Data fetched from backend APIs using `fetch()` with JSON.

### 🔍 Search and Discovery
- **search.html** – Search bar for users and posts.
- Displays results with clickable profile/post links.

### ⚙️ Settings and Admin (optional)
- **settings.html** – Change password 
---

## 🎨 UI Components
Reusable HTML fragments dynamically loaded via JavaScript:
- **Navbar** – Links to Home, Profile, Search, and Logout.
- **Footer** – Static footer with credits.
- **Post Card** – Template for displaying each post in feed or profile.

---

## 🧠 Technologies Used
- **HTML5** – Structure and layout.
- **Tailwind CSS** – Responsive and utility-first styling.
- **Vanilla JavaScript (ES6)** – Dynamic interactivity and API integration.
- **Fetch API** – For async communication with backend.
- **Local Storage / Session Storage** – For session persistence.

---

## 👑 Admin Features

### Admin Dashboard
- **admin-dashboard.html** – Overview with user/post statistics and quick actions.
- **admin-users.html** – View all registered users with search and filter options.
- **admin-posts.html** – Browse all posts with moderation tools.

### Admin Capabilities
- **User Management** – View, edit, suspend, or delete user accounts.
- **Post Moderation** – Review, edit, hide, or remove inappropriate posts.

### Admin JavaScript Files
- **admin.js** – Core admin functionality and API calls.
- **userManagement.js** – Handle user CRUD operations.
- **postModeration.js** – Manage post content and visibility.
---


