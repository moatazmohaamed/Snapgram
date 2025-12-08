import enviroments from '../environments/environment.js';
import { togglePassword } from '../utils/auth.js';

console.log('🔵 Login.js loaded!');

const loginForm = document.querySelector('form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');


if (localStorage.getItem('isAuthenticated') === 'true') {
    console.log('ℹ️ User already authenticated, redirecting to feed...');
    window.location.hash = '#/feed';
}

function validateForm(email, password) {
    const errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    return errors;
}

function showError(message) {
    // Remove existing error if any
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message bg-red-100 dark:bg-red-900/30 my-6 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-4';
    errorDiv.innerHTML = `
        <div class="flex items-start">
            <svg class="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm">${message}</span>
        </div>
    `;

    // Insert before form
    loginForm.parentNode.insertBefore(errorDiv, loginForm);

    // Auto remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message) {
    // Remove existing messages
    const existingMessage = document.querySelector('.success-message, .error-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create success element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 my-6 rounded-md mb-4';
    successDiv.innerHTML = `
        <div class="flex items-start">
            <svg class="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm">${message}</span>
        </div>
    `;

    loginForm.parentNode.insertBefore(successDiv, loginForm);
}

function setLoading(isLoading) {
    const submitButton = loginForm.querySelector('button[type="submit"]');

    if (isLoading) {
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <svg class="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        `;
    } else {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign in';
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const errors = validateForm(email, password);
    if (errors.length > 0) {
        showError(errors.join('<br>'));
        return;
    }

    setLoading(true);

    try {
        const response = await axios.post(
            `${enviroments.API_URL}/auth/login.php`,
            {
                email: email,
                password: password
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );


        if (response.data.success) {
            const userData = response.data.data;

            localStorage.setItem('accessToken', userData.token);
            localStorage.setItem('refreshToken', userData.refreshToken);
            localStorage.setItem('userName', userData.name);
            localStorage.setItem('userRole', userData.role);
            localStorage.setItem('isAuthenticated', 'true');

            showSuccess('Login successful! Redirecting...');

            loginForm.reset();

            setTimeout(() => {
                window.location.hash = '#/feed';
            }, 1000);
        } else {
            showError(response.data.message || 'Login failed');
        }

    } catch (error) {
        console.error('❌ Login error:', error);

        if (error.response && error.response.data) {
            showError(error.response.data.message || 'Login failed');
        } else if (error.request) {
            showError('Network error. Please check your connection and try again.');
        } else {
            showError('An unexpected error occurred. Please try again.');
        }
    } finally {
        setLoading(false);
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
} else {
    console.error('❌ Login form not found!');
}

togglePassword(passwordInput);

