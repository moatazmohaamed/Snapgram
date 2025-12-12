import ApiService from './services/api.js';

class PeopleManager {
    constructor() {
        this.profiles = [];
        this.filteredProfiles = [];
        this.loading = false;
        this.searchTerm = '';
        this.init();
    }

    async init() {
        await this.loadSidebar();
        await this.loadProfiles();
        this.setupEventListeners();
        this.renderProfiles();
    }

    async loadSidebar() {
        const sidebarContainer = document.querySelector('#sidebar-container');
        if (sidebarContainer && window.componentLoader) {
            await window.componentLoader.insert('../components/sidebar.html', sidebarContainer);
        }
    }

    async loadProfiles() {
        try {
            this.setLoading(true);
            const response = await ApiService.getAllProfiles();
            
            if (response.success) {
                this.profiles = response.data;
                this.filteredProfiles = [...this.profiles];
            } else {
                this.showError('Failed to load profiles');
            }
        } catch (error) {
            console.error('Error loading profiles:', error);
            this.showError('Failed to load profiles');
        } finally {
            this.setLoading(false);
        }
    }

    setupEventListeners() {
        const searchInput = document.querySelector('input[placeholder="Search for people..."]');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterProfiles();
            });
        }
    }

    filterProfiles() {
        if (!this.searchTerm) {
            this.filteredProfiles = [...this.profiles];
        } else {
            this.filteredProfiles = this.profiles.filter(profile => 
                profile.firstName.toLowerCase().includes(this.searchTerm) ||
                profile.lastName.toLowerCase().includes(this.searchTerm) ||
                (profile.bio && profile.bio.toLowerCase().includes(this.searchTerm))
            );
        }
        this.renderProfiles();
    }

    async followUser(userId) {
        try {
            await ApiService.sendFriendRequest({ receiverId: userId });
            this.showSuccess('Follow request sent!');
            
            // Update the button state
            const button = document.querySelector(`[data-user-id="${userId}"]`);
            if (button) {
                button.textContent = 'Requested';
                button.disabled = true;
                button.classList.remove('bg-primary', 'hover:bg-primary/90');
                button.classList.add('bg-slate-400', 'cursor-not-allowed');
            }
        } catch (error) {
            console.error('Error sending follow request:', error);
            this.showError('Failed to send follow request');
        }
    }

    renderProfiles() {
        const container = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3');
        if (!container) return;

        if (this.loading) {
            container.innerHTML = this.renderLoadingState();
            return;
        }

        if (this.filteredProfiles.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        container.innerHTML = this.filteredProfiles.map(profile => this.renderProfileCard(profile)).join('');
        this.attachEventListeners();
    }

    renderProfileCard(profile) {
        const fullName = `${profile.firstName} ${profile.lastName}`;
        const username = `@${profile.firstName.toLowerCase()}${profile.lastName.toLowerCase()}`;
        
        return `
            <div class="flex flex-col items-center gap-3 md:gap-4 text-center p-4 md:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div class="relative">
                    <img src="${profile.avatarUrl || '/client/assets/images/avatar.png'}"
                        class="w-20 h-20 md:w-24 md:h-24 bg-center bg-no-repeat aspect-square bg-cover rounded-full ring-2 ring-slate-100 dark:ring-slate-800"
                        alt="${fullName} avatar"
                        onerror="this.src='/client/assets/images/avatar.png'">
                    <span class="absolute bottom-0 right-0 md:bottom-1 md:right-1 block h-4 w-4 md:h-5 md:w-5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"></span>
                </div>
                <div class="flex flex-col gap-1">
                    <p class="text-slate-900 dark:text-white text-sm md:text-base font-semibold leading-normal">
                        ${fullName}
                    </p>
                    <p class="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-normal leading-normal">
                        ${username}
                    </p>
                    ${profile.bio ? `<p class="text-slate-500 dark:text-slate-400 text-xs mt-1">${profile.bio}</p>` : ''}
                </div>
                <button 
                    data-user-id="${profile.id}"
                    class="follow-btn w-full h-8 md:h-9 px-4 bg-primary text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-primary/90 transition-colors">
                    Follow
                </button>
            </div>
        `;
    }

    renderLoadingState() {
        return Array(6).fill(0).map(() => `
            <div class="flex flex-col items-center gap-3 md:gap-4 text-center p-4 md:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm animate-pulse">
                <div class="w-20 h-20 md:w-24 md:h-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div class="flex flex-col gap-2 w-full">
                    <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
                    <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
                    <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mx-auto"></div>
                </div>
                <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            </div>
        `).join('');
    }

    renderEmptyState() {
        return `
            <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div class="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <span class="text-4xl">👥</span>
                </div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">No people found</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm">
                    ${this.searchTerm ? 'Try adjusting your search terms' : 'Check back later for new people to follow'}
                </p>
            </div>
        `;
    }

    attachEventListeners() {
        const followButtons = document.querySelectorAll('.follow-btn');
        followButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = e.target.getAttribute('data-user-id');
                this.followUser(userId);
            });
        });
    }

    setLoading(loading) {
        this.loading = loading;
        const searchInput = document.querySelector('input[placeholder="Search for people..."]');
        if (searchInput) {
            searchInput.disabled = loading;
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
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

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

export function init() {
    new PeopleManager();
}

// Auto-initialize if not using module system
if (typeof window !== 'undefined' && !window.moduleSystem) {
    document.addEventListener('DOMContentLoaded', init);
}