# 📚 Snapgram API Endpoints Documentation

Complete API reference for the Snapgram social media application backend.

---

## 🔐 Authentication Endpoints

### 1. Register User

**Endpoint:** `POST /server/auth/register.php`

**Description:** Register a new user account

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required)",
  "image": "string (optional)",
  "bio": "string (optional)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully and Verification email sent",
  "data": null
}
```

**Error Responses:**
- `400` - All fields are required
- `400` - Invalid email format
- `400` - Username already exists
- `400` - Email already registered
- `500` - Insertion error

**Features:**
- ✅ Validates email format
- ✅ Checks for duplicate username/email
- ✅ Hashes password with bcrypt
- ✅ Sends 6-digit verification code via email
- ✅ Code expires in 5 minutes

---

### 2. Login

**Endpoint:** `POST /server/auth/login.php`

**Description:** Authenticate user and get access tokens

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "success",
  "data": {
    "name": "username",
    "role": 1,
    "token": "JWT_ACCESS_TOKEN",
    "refreshToken": "JWT_REFRESH_TOKEN"
  }
}
```

**Error Responses:**
- `400` - Invalid input
- `400` - Invalid email or password
- `400` - Email not verified
- `500` - Failed to update refresh token

**Features:**
- ✅ Requires verified email (`email_verified = 1`)
- ✅ Verifies password with bcrypt
- ✅ Returns access token (short-lived) and refresh token (long-lived)
- ✅ Updates refresh token in database

---

### 3. Verify Email

**Endpoint:** `POST /server/auth/verify_email.php`

**Description:** Verify user email with 6-digit code sent during registration

**Request Body:**
```json
{
  "email": "string (required)",
  "code": "string (required, 6 digits)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": null
}
```

**Error Responses:**
- `400` - Email and code are required
- `404` - Email is not found
- `400` - Email already verified
- `404` - Verification code is not found
- `400` - Invalid verification code
- `400` - Verification code has expired

**Features:**
- ✅ Validates verification code
- ✅ Checks code expiration (5 minutes)
- ✅ Updates `email_verified` to 1
- ✅ Deletes verification code after success

---

### 4. Reset Password

This endpoint supports three different operations using different HTTP methods:

#### 4a. Request Reset Code

**Endpoint:** `GET /server/auth/reset_password.php?email={email}`

**Description:** Send password reset code to user's email

**Query Parameters:**
- `email` - User's email address (required)

**Success Response (204):**
```json
{
  "success": true,
  "message": "email sent successfully",
  "data": null
}
```

**Error Responses:**
- `400` - Invalid email
- `500` - Failed to send email

---

#### 4b. Verify Reset Code

**Endpoint:** `POST /server/auth/reset_password.php`

**Description:** Verify the password reset code

**Request Body:**
```json
{
  "email": "string (required)",
  "code": "string (required, 6 digits)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": null
}
```

**Error Responses:**
- `400` - Email and code are required
- `404` - Email is not found
- `404` - Verification code is not found
- `400` - Invalid verification code
- `400` - Verification code has expired

---

#### 4c. Update Password

**Endpoint:** `PATCH /server/auth/reset_password.php`

**Description:** Set new password after code verification

**Request Body:**
```json
{
  "email": "string (required)",
  "Password": "string (required)",
  "confirmPassword": "string (required)"
}
```

**Success Response (204):**
```json
{
  "success": true,
  "message": "Your password has been changed successfully",
  "data": null
}
```

**Error Responses:**
- `400` - Email, password and confirmPassword are required
- `400` - Password and confirmPassword do not match

---

### 5. Change Password (Authenticated)

**Endpoint:** `PATCH /server/auth/ChangePassword.php`

**Description:** Change password for logged-in user

**Headers:**
```
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
```

**Request Body:**
```json
{
  "oldPassword": "string (required)",
  "newPassword": "string (required)",
  "confirmPassword": "string (required)"
}
```

**Success Response (204):**
```json
{
  "success": false,
  "message": "success",
  "data": null
}
```

**Error Responses:**
- `400` - Invalid Header
- `401` - Authorization token is required
- `401` - Invalid token
- `400` - Invalid Inputs
- `400` - New password must match confirm password
- `400` - Old password is wrong
- `500` - Something error

**Features:**
- ✅ Requires valid JWT token
- ✅ Verifies old password
- ✅ Validates new password matches confirm password
- ✅ Hashes new password with bcrypt

---

### 6. Logout

**Endpoint:** `DELETE /server/auth/logout.php`

**Description:** Logout user by invalidating refresh token

**Headers:**
```
Authorization: Bearer {ACCESS_TOKEN}
```

**Success Response (204):**
```json
{
  "success": true,
  "message": "success",
  "data": null
}
```

**Error Responses:**
- `401` - Authorization token is required
- `401` - Invalid token
- `500` - Failed update

**Features:**
- ✅ Requires valid JWT token
- ✅ Clears refresh token from database
- ✅ Invalidates user session

---

### 7. Refresh Access Token

**Endpoint:** `GET /server/auth/AccessToken.php/{REFRESH_TOKEN}`

**Description:** Get new access token using refresh token

**URL Parameter:**
- `{REFRESH_TOKEN}` - The refresh token received during login

**Success Response (200):**
```json
{
  "success": true,
  "message": "success",
  "data": {
    "accessToken": "NEW_JWT_ACCESS_TOKEN"
  }
}
```

**Error Responses:**
- `404` - NOT FOUND (no refresh token provided)
- `401` - Invalid token

**Features:**
- ✅ Validates refresh token from database
- ✅ Generates new access token
- ✅ Used when access token expires

---

## 🔑 Authentication Flow

```
┌─────────────┐
│  Register   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Verify Email │ ◄── 6-digit code sent via email
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Login    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Receive Tokens:             │
│ - Access Token (short-lived)│
│ - Refresh Token (long-lived)│
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Use Access Token for API    │
│ calls in Authorization      │
│ header                      │
└──────┬──────────────────────┘
       │
       ├──► Access Token Expired? ──► Refresh Token ──┐
       │                                               │
       │                                               ▼
       │                                    ┌──────────────────┐
       │                                    │ Get New Access   │
       │                                    │ Token            │
       │                                    └────────┬─────────┘
       │                                             │
       │◄────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│   Logout    │ ──► Clear refresh token
└─────────────┘
```

---

## 📋 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Success with data returned |
| 201 | Created | Resource created successfully |
| 204 | No Content | Success but no data to return |
| 400 | Bad Request | Validation error or invalid input |
| 401 | Unauthorized | Invalid or missing authentication token |
| 404 | Not Found | Resource not found |
| 405 | Method Not Allowed | Wrong HTTP method used |
| 500 | Internal Server Error | Server-side error |

---

## 💡 Usage Examples

### Example 1: Complete Registration Flow

```javascript
// Step 1: Register new user
const registerResponse = await fetch('http://localhost:8000/server/auth/register.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'SecurePass123',
    bio: 'Hello, I am John!'
  })
});

const registerData = await registerResponse.json();
console.log(registerData.message); // "User registered successfully and Verification email sent"

// Step 2: Verify Email (user receives 6-digit code via email)
const verifyResponse = await fetch('http://localhost:8000/server/auth/verify_email.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    code: '123456' // Code from email
  })
});

const verifyData = await verifyResponse.json();
console.log(verifyData.message); // "Email verified successfully"

// Step 3: Login
const loginResponse = await fetch('http://localhost:8000/server/auth/login.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123'
  })
});

const loginData = await loginResponse.json();
const { token, refreshToken } = loginData.data;

// Save tokens (e.g., in localStorage)
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', refreshToken);
```

---

### Example 2: Using Access Token for Authenticated Requests

```javascript
const accessToken = localStorage.getItem('accessToken');

// Change password
const changePasswordResponse = await fetch('http://localhost:8000/server/auth/ChangePassword.php', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    oldPassword: 'SecurePass123',
    newPassword: 'NewSecurePass456',
    confirmPassword: 'NewSecurePass456'
  })
});

const result = await changePasswordResponse.json();
console.log(result.message); // "success"
```

---

### Example 3: Refresh Access Token

```javascript
const refreshToken = localStorage.getItem('refreshToken');

// When access token expires, get a new one
const refreshResponse = await fetch(
  `http://localhost:8000/server/auth/AccessToken.php/${refreshToken}`
);

const refreshData = await refreshResponse.json();
const newAccessToken = refreshData.data.accessToken;

// Update stored access token
localStorage.setItem('accessToken', newAccessToken);
```

---

### Example 4: Password Reset Flow

```javascript
// Step 1: Request reset code
const requestResetResponse = await fetch(
  'http://localhost:8000/server/auth/reset_password.php?email=john@example.com',
  { method: 'GET' }
);

// User receives 6-digit code via email

// Step 2: Verify reset code
const verifyCodeResponse = await fetch('http://localhost:8000/server/auth/reset_password.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    code: '654321' // Code from email
  })
});

// Step 3: Set new password
const updatePasswordResponse = await fetch('http://localhost:8000/server/auth/reset_password.php', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    Password: 'BrandNewPass789',
    confirmPassword: 'BrandNewPass789'
  })
});

const result = await updatePasswordResponse.json();
console.log(result.message); // "Your password has been changed successfully"
```

---

### Example 5: Logout

```javascript
const accessToken = localStorage.getItem('accessToken');

const logoutResponse = await fetch('http://localhost:8000/server/auth/logout.php', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Clear stored tokens
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');

console.log('Logged out successfully');
```

---

## 🎯 Best Practices

### 1. Token Management
- **Store tokens securely**: Use `localStorage` or `sessionStorage`
- **Include Bearer prefix**: Always use `Bearer {token}` format in Authorization header
- **Refresh proactively**: Refresh access token before it expires
- **Clear on logout**: Remove all tokens from storage on logout

### 2. Error Handling
```javascript
async function apiRequest(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
}
```

### 3. Token Refresh Strategy
```javascript
async function fetchWithAuth(url, options = {}) {
  let accessToken = localStorage.getItem('accessToken');
  
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`
  };
  
  let response = await fetch(url, options);
  
  // If token expired, refresh and retry
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    const refreshResponse = await fetch(
      `http://localhost:8000/server/auth/AccessToken.php/${refreshToken}`
    );
    
    const refreshData = await refreshResponse.json();
    accessToken = refreshData.data.accessToken;
    localStorage.setItem('accessToken', accessToken);
    
    // Retry original request with new token
    options.headers.Authorization = `Bearer ${accessToken}`;
    response = await fetch(url, options);
  }
  
  return response;
}
```

---

## 🔒 Security Notes

1. **Email Verification Required**: Users cannot login until email is verified
2. **Password Hashing**: All passwords are hashed using bcrypt
3. **Token Expiration**: 
   - Access tokens are short-lived (typically 15-60 minutes)
   - Refresh tokens are long-lived (typically 7-30 days)
4. **Code Expiration**: Verification codes expire after 5 minutes
5. **HTTPS Required**: Always use HTTPS in production
6. **CORS**: Configure CORS headers appropriately for your frontend domain

---

## 🐛 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid email or password` | Wrong credentials or email not verified | Check credentials and verify email first |
| `Authorization token is required` | Missing Authorization header | Include `Authorization: Bearer {token}` header |
| `Invalid token` | Expired or malformed token | Refresh the access token |
| `Verification code has expired` | Code older than 5 minutes | Request a new verification code |
| `Method Not Allowed` | Wrong HTTP method | Check endpoint documentation for correct method |

---

## 📝 Notes

- **Base URL**: `http://localhost:8000` (development)
- **Content-Type**: All POST/PATCH requests require `Content-Type: application/json`
- **Email Service**: Uses PHPMailer for sending verification emails
- **Database**: MySQL/MariaDB with PDO
- **JWT Library**: Firebase PHP-JWT for token generation

---

## 🤝 Support

For issues or questions:
1. Check this documentation first
2. Review error messages carefully
3. Verify request format matches examples
4. Check server logs for detailed error information

---

**Last Updated**: December 2025  
**API Version**: 1.0  
**Maintained by**: Snapgram Development Team
