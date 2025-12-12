import AuthService from './services/auth.js';

class ForgotPasswordManager {
    constructor() {
        this.step = 1; // 1: email, 2: code, 3: new password
        this.email = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderStep();
    }

    setupEventListeners() {
        const form = document.querySelector('form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Back button
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBack());
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        switch (this.step) {
            case 1:
                await this.handleEmailSubmit();
                break;
            case 2:
                await this.handleCodeSubmit();
                break;
            case 3:
                await this.handlePasswordSubmit();
                break;
        }
    }

    async handleEmailSubmit() {
        const emailInput = document.getElementById('email');
        this.email = emailInput.value.trim();
        
        if (!this.email) {
            this.showError('Please enter your email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        this.setLoading(true);

        try {
            const response = await AuthService.requestPasswordReset(this.email);
            
            if (response.success) {
                this.showSuccess('Reset code sent to your email');
                this.step = 2;
                this.renderStep();
            } else {
                this.showError(response.message || 'Failed to send reset code');
            }
            
        } catch (error) {
            console.error('Password reset request error:', error);
            this.showError(error.message || 'Failed to send reset code. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    async handleCodeSubmit() {
        const codeInput = document.getElementById('code');
        const code = codeInput.value.trim();
        
        if (!code || code.length !== 6) {
            this.showError('Please enter the 6-digit code');
            return;
        }

        this.setLoading(true);

        try {
            const response = await AuthService.verifyResetCode(this.email, code);
            
            if (response.success) {
                this.showSuccess('Code verified successfully');
                this.step = 3;
                this.renderStep();
            } else {
                this.showError(response.message || 'Invalid or expired code');
            }
            
        } catch (error) {
            console.error('Code verification error:', error);
            this.showError(error.message || 'Invalid or expired code. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    async handlePasswordSubmit() {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!password || password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        this.setLoading(true);

        try {
            const response = await AuthService.resetPassword(this.email, password, confirmPassword);
            
            if (response.success) {
                this.showSuccess('Password reset successfully! Redirecting to login...');
                
                setTimeout(() => {
                    window.location.hash = '/sign-in';
                }, 2000);
            } else {
                this.showError(response.message || 'Failed to reset password');
            }
            
        } catch (error) {
            console.error('Password reset error:', error);
            this.showError(error.message || 'Failed to reset password. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    renderStep() {
        const container = document.querySelector('.form-container');
        if (!container) return;

        let html = '';

        switch (this.step) {
            case 1:
                html = this.renderEmailStep();
                break;
            case 2:
                html = this.renderCodeStep();
                break;
            case 3:
                html = this.renderPasswordStep();
                break;
        }

        container.innerHTML = html;
        this.setupEventListeners();
    }

    renderEmailStep() {
        return `
            <div class="flex flex-col items-center text-center">
                <div class="mb-4 flex items-center gap-3">
                    <svg class="h-10 w-10 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4ZM12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7ZM12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9Z" fill-rule="evenodd"></path>
                    </svg>
                    <span class="text-3xl font-bold text-gray-900 dark:text-white">Snapgram</span>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Forgot Password</h1>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Enter your email to receive a reset code</p>
            </div>
            <form class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="email">Email</label>
                    <div class="mt-1">
                        <input autocomplete="email" class="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm" id="email" name="email" required type="email" />
                    </div>
                </div>
                <div>
                    <button class="flex w-full justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" type="submit">
                        Send Reset Code
                    </button>
                </div>
            </form>
            <p class="text-center text-sm text-gray-500 dark:text-gray-400">
                Remember your password?
                <a class="font-semibold leading-6 text-primary hover:text-primary/80" href="#/sign-in">Sign in</a>
            </p>
        `;
    }

    renderCodeStep() {
        return `
            <div class="flex flex-col items-center text-center">
                <div class="mb-4 flex items-center gap-3">
                    <svg class="h-10 w-10 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4ZM12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7ZM12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9Z" fill-rule="evenodd"></path>
                    </svg>
                    <span class="text-3xl font-bold text-gray-900 dark:text-white">Snapgram</span>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Enter Reset Code</h1>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">We sent a 6-digit code to ${this.email}</p>
            </div>
            <form class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="code">Reset Code</label>
                    <div class="mt-1">
                        <input class="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm text-center text-2xl tracking-widest" id="code" maxlength="6" name="code" placeholder="000000" required type="text" />
                    </div>
                </div>
                <div>
                    <button class="flex w-full justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" type="submit">
                        Verify Code
                    </button>
                </div>
            </form>
            <div class="flex justify-between text-sm">
                <button class="back-btn text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">← Back</button>
                <button class="resend-btn text-primary hover:text-primary/80">Resend Code</button>
            </div>
        `;
    }

    renderPasswordStep() {
        return `
            <div class="flex flex-col items-center text-center">
                <div class="mb-4 flex items-center gap-3">
                    <svg class="h-10 w-10 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4ZM12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7ZM12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9Z" fill-rule="evenodd"></path>
                    </svg>
                    <span class="text-3xl font-bold text-gray-900 dark:text-white">Snapgram</span>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Reset Password</h1>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Enter your new password</p>
            </div>
            <form class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="password">New Password</label>
                    <div class="mt-1">
                        <input class="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm" id="password" name="password" required type="password" />
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="confirmPassword">Confirm Password</label>
                    <div class="mt-1">
                        <input class="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm" id="confirmPassword" name="confirmPassword" required type="password" />
                    </div>
                </div>
                <div>
                    <button class="flex w-full justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" type="submit">
                        Reset Password
                    </button>
                </div>
            </form>
            <button class="back-btn w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">← Back</button>
        `;
    }

    goBack() {
        if (this.step > 1) {
            this.step--;
            this.renderStep();
        }
    }

    setLoading(isLoading) {
        const submitButton = document.querySelector('button[type="submit"]');
        
        if (submitButton) {
            submitButton.disabled = isLoading;
            submitButton.innerHTML = isLoading ? 
                '<span class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>Processing...' : 
                submitButton.textContent;
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-all duration-300 ${
            type === 'error' ? 'bg-red-500 text-white' : 
            type === 'success' ? 'bg-green-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

export function init() {
    new ForgotPasswordManager();
}

if (typeof window !== 'undefined' && !window.moduleSystem) {
    document.addEventListener('DOMContentLoaded', init);
}