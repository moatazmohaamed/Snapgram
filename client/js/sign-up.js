import enviroments from '../environments/environment.js';
import { togglePassword } from '../utils/auth.js';

console.log('🔵 Register.js loaded!');

const registerForm = document.querySelector('#register-form');
const nameInput = document.getElementById('name');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

function validateForm(name, username, email, password) {
    const errors = [];
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    if (!username || username.trim().length < 3) {
        errors.push('Username must be at least 3 characters long');
    }
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
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

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

    registerForm.parentNode.insertBefore(errorDiv, registerForm);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message) {
    const existingMessage = document.querySelector('.success-message, .error-message');
    if (existingMessage) {
        existingMessage.remove();
    }

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

    registerForm.parentNode.insertBefore(successDiv, registerForm);
}

function setLoading(isLoading) {
    const submitButton = registerForm.querySelector('button[type="submit"]');

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
        submitButton.textContent = 'Sign up';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const name = nameInput.value.trim();
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;


    const errors = validateForm(name, username, email, password);
    if (errors.length > 0) {
        showError(errors.join('<br>'));
        return;
    }

    setLoading(true);

    try {
        const response = await axios.post(
            `${enviroments.API_URL}/auth/register.php`,
            {
                name: name,
                username: username,
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
            showSuccess(response.data.message);

            localStorage.setItem('pendingVerificationEmail', email);

            registerForm.reset();

            setTimeout(() => {
                window.location.hash = '#/sign-in';
            }, 2000);
        } else {
            showError(response.data.message || 'Registration failed');
        }

    } catch (error) {
        console.error('Registration error:', error);

        if (error.response && error.response.data) {
            showError(error.response.data.message || 'Registration failed');
        } else if (error.request) {
            showError('Network error. Please check your connection and try again.');
        } else {
            showError('An unexpected error occurred. Please try again.');
        }
    } finally {
        setLoading(false);
    }
}

if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
} else {
    console.error('Form not found!');
}

togglePassword(passwordInput);
