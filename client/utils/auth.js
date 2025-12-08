export function isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true' &&
        localStorage.getItem('accessToken') !== null;
}

export function getAccessToken() {
    return localStorage.getItem('accessToken');
}

export function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

export function getUserName() {
    return localStorage.getItem('userName');
}

export function getUserRole() {
    return localStorage.getItem('userRole');
}

export function storeAuthData(data) {
    localStorage.setItem('accessToken', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userName', data.name);
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('isAuthenticated', 'true');
}

export function clearAuthData() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
}

export function redirectToLogin() {
    window.location.hash = '#/sign-in';
}

export function redirectToFeed() {
    window.location.hash = '#/feed';
}

export function getAuthHeader() {
    const token = getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export function protectRoute() {
    if (!isAuthenticated()) {
        redirectToLogin();
        return false;
    }
    return true;
}

export function togglePassword(passwordInput) {
    const passwordToggle = document.querySelector('button[type="button"]');
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            const icon = passwordToggle.querySelector('svg');
            if (type === 'text') {
                icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
            `;
            } else {
                icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            `;
            }
        });
    }
}