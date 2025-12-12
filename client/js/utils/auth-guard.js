import AuthService from '../services/auth.js';

class AuthGuard {
    static init() {
        // Add logout functionality to sidebar
        document.addEventListener('click', (e) => {
            if (e.target.closest('.logout-btn')) {
                this.handleLogout();
            }
        });

        // Check authentication on page load
        this.checkAuth();
    }

    static async handleLogout() {
        try {
            await AuthService.logout();
            window.location.hash = '/sign-in';
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if API call fails
            AuthService.clearAuth();
            window.location.hash = '/sign-in';
        }
    }

    static checkAuth() {
        const currentPath = window.location.hash.slice(1) || '/';
        const protectedRoutes = ['/home', '/feed', '/saved', '/people', '/user-profile', '/settings', '/explore'];
        const guestOnlyRoutes = ['/sign-in', '/sign-up', '/forgot-password', '/verify'];
        
        const isAuthenticated = AuthService.isAuthenticated();
        
        if (protectedRoutes.includes(currentPath) && !isAuthenticated) {
            window.location.hash = '/sign-in';
            return false;
        }
        
        if (guestOnlyRoutes.includes(currentPath) && isAuthenticated) {
            window.location.hash = '/home';
            return false;
        }

        return true;
    }

    static requireAuth() {
        return AuthService.requireAuth();
    }

    static requireGuest() {
        return AuthService.requireGuest();
    }
}

// Initialize auth guard
AuthGuard.init();

export default AuthGuard;