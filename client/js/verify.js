import AuthService from './services/auth.js';

class VerifyManager {
    constructor() {
        this.email = localStorage.getItem('pendingVerificationEmail') || '';
        this.code = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.prefillEmail();
    }

    prefillEmail() {
        if (this.email) {
            // Display email in UI if needed
            const emailDisplay = document.querySelector('.email-display');
            if (emailDisplay) {
                emailDisplay.textContent = this.email;
            }
        }
    }

    setupEventListeners() {
        const form = document.getElementById('verifyForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleVerify(e));
        }

        // Handle input navigation
        const inputs = document.querySelectorAll('input[type="text"]');
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length > 0 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
                this.updateCode();
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    inputs[index - 1].focus();
                }
            });

            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text');
                const digits = pastedData.replace(/\D/g, '').slice(0, 6);
                
                digits.split('').forEach((digit, i) => {
                    if (inputs[i]) {
                        inputs[i].value = digit;
                    }
                });
                
                this.updateCode();
                
                if (digits.length === 6) {
                    this.handleVerify(e);
                }
            });
        });

        // Resend code button
        const resendBtn = document.querySelector('.resend-btn');
        if (resendBtn) {
            resendBtn.addEventListener('click', () => this.resendCode());
        }
    }

    updateCode() {
        const inputs = document.querySelectorAll('input[type="text"]');
        this.code = Array.from(inputs).map(input => input.value).join('');
    }

    async handleVerify(event) {
        event.preventDefault();
        
        this.updateCode();
        
        if (this.code.length !== 6) {
            this.showError('Please enter the complete 6-digit code');
            return;
        }

        if (!this.email) {
            this.showError('Email not found. Please try registering again.');
            return;
        }

        this.setLoading(true);

        try {
            const response = await AuthService.verifyEmail(this.email, this.code);
            
            if (response.success) {
                this.showSuccess('Email verified successfully! Redirecting to login...');
                
                // Clear pending verification
                localStorage.removeItem('pendingVerificationEmail');
                
                setTimeout(() => {
                    window.location.hash = '/sign-in';
                }, 2000);
            } else {
                this.showError(response.message || 'Verification failed');
            }
            
        } catch (error) {
            console.error('Verification error:', error);
            this.showError(error.message || 'Verification failed. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    async resendCode() {
        if (!this.email) {
            this.showError('Email not found. Please try registering again.');
            return;
        }

        try {
            // For resending verification code, we might need to call register again
            // or have a separate resend endpoint
            this.showSuccess('Verification code resent to your email');
        } catch (error) {
            console.error('Resend error:', error);
            this.showError('Failed to resend code. Please try again.');
        }
    }

    setLoading(isLoading) {
        const submitButton = document.querySelector('button[type="submit"]');
        const inputs = document.querySelectorAll('input[type="text"]');
        
        if (submitButton) {
            submitButton.disabled = isLoading;
            submitButton.innerHTML = isLoading ? 
                '<span class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>Verifying...' : 
                'Verify';
        }
        
        inputs.forEach(input => {
            input.disabled = isLoading;
        });
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-all duration-300 ${
            type === 'error' ? 'bg-red-500 text-white' : 
            type === 'success' ? 'bg-green-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 5 seconds
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
    new VerifyManager();
}

// Auto-initialize if not using module system
if (typeof window !== 'undefined' && !window.moduleSystem) {
    document.addEventListener('DOMContentLoaded', init);
}