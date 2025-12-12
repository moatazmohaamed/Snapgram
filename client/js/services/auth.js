import environments from '../../environments/environment.js';

class AuthService {
    constructor() {
        this.baseURL = environments.production ? environments.API_URL : environments.API_URL; // Use real API for auth
        this.axios = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        this.setupInterceptors();
    }

    setupInterceptors() {
        this.axios.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.axios.interceptors.response.use(
            (response) => response.data,
            async (error) => {
                const originalRequest = error.config;
                
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    try {
                        await this.refreshToken();
                        const token = this.getToken();
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return this.axios(originalRequest);
                    } catch (refreshError) {
                        this.logout();
                        window.location.hash = '/sign-in';
                        return Promise.reject(refreshError);
                    }
                }
                
                return Promise.reject(error);
            }
        );
    }

    // Authentication methods
    async login(email, password) {
        try {
            const response = await this.axios.post('/auth/login.php', {
                email,
                password
            });
            
            if (response.success) {
                this.setTokens(response.data.token, response.data.refreshToken);
                this.setUser(response.data);
                return response;
            }
            
            throw new Error(response.message || 'Login failed');
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async register(userData) {
        try {
            const response = await this.axios.post('/auth/register.php', userData);
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async verifyEmail(email, code) {
        try {
            const response = await this.axios.post('/auth/verify_email.php', {
                email,
                code
            });
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async requestPasswordReset(email) {
        try {
            const response = await this.axios.get(`/auth/reset_password.php?email=${encodeURIComponent(email)}`);
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async verifyResetCode(email, code) {
        try {
            const response = await this.axios.post('/auth/reset_password.php', {
                email,
                code
            });
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async resetPassword(email, password, confirmPassword) {
        try {
            const response = await this.axios.patch('/auth/reset_password.php', {
                email,
                Password: password,
                confirmPassword
            });
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async changePassword(oldPassword, newPassword, confirmPassword) {
        try {
            const response = await this.axios.patch('/auth/ChangePassword.php', {
                oldPassword,
                newPassword,
                confirmPassword
            });
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async logout() {
        try {
            await this.axios.delete('/auth/logout.php');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuth();
        }
    }

    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await this.axios.post('/auth/AccessToken.php', {
                refreshToken
            });

            if (response.success) {
                this.setTokens(response.data.token, response.data.refreshToken);
                return response;
            }

            throw new Error('Token refresh failed');
        } catch (error) {
            this.clearAuth();
            throw error;
        }
    }

    // Token management
    setTokens(token, refreshToken) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
    }

    getToken() {
        return localStorage.getItem('authToken');
    }

    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }

    setUser(userData) {
        localStorage.setItem('user', JSON.stringify(userData));
    }

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    clearAuth() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    // Utility methods
    handleError(error) {
        if (error.response?.data) {
            return new Error(error.response.data.message || 'An error occurred');
        }
        return error;
    }

    // Auth guards
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.hash = '/sign-in';
            return false;
        }
        return true;
    }

    requireGuest() {
        if (this.isAuthenticated()) {
            window.location.hash = '/home';
            return false;
        }
        return true;
    }
}

export default new AuthService();