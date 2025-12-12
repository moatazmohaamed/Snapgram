import ApiService from './services/api.js';

class UserProfileManager {
    constructor() {
        this.profile = null;
        this.posts = [];
        this.loading = false;
        this.isMyProfile = true; // Default to true, can be determined from URL params
        this.userId = this.getUserIdFromUrl();
        this.init();
    }

    getUserIdFromUrl() {
        // Extract user ID from URL params if viewing another user's profile
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('userId') || 'current'; // 'current' for logged-in user
    }

    async init() {
        await this.loadSidebar();
        await this.loadProfile();
        await this.loadUserPosts();
        this.setupEventListeners();
    }

    async loadSidebar() {
        const sidebarContainer = document.querySelector('#sidebar-container');
        if (sidebarContainer && window.componentLoader) {
            await window.componentLoader.insert('../components/sidebar.html', sidebarContainer);
        }
    }

    async loadProfile() {
        try {
            this.setLoading(true);
            
            let response;
            if (this.userId === 'current' || this.isMyProfile) {
                // For current user, get the first profile from all profiles as a mock
                const profilesResponse = await ApiService.getAllProfiles();
                if (profilesResponse.success && profilesResponse.data.length > 0) {
                    response = {
                        success: true,
                        data: profilesResponse.data[0] // Use first profile as current user
                    };
                } else {
                    response = { success: false };
                }
            } else {
                response = await ApiService.getProfile(this.userId, this.isMyProfile);
            }
            
            if (response.success) {
                this.profile = response.data;
                this.renderProfile();
            } else {
                this.showError('Failed to load profile');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showError('Failed to load profile');
        } finally {
            this.setLoading(false);
        }
    }

    async loadUserPosts() {
        try {
            const response = await ApiService.getAllPosts();
            
            if (response.success) {
                // For demo purposes, show some posts for the current user
                if (this.userId === 'current' || this.isMyProfile) {
                    // Show first few posts as user's posts
                    this.posts = response.data.slice(0, 2);
                } else {
                    // Filter posts by specific user ID
                    this.posts = response.data.filter(post => post.authorId === this.userId);
                }
                this.renderPosts();
            }
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    setupEventListeners() {
        const editButton = document.querySelector('.edit-profile-btn');
        if (editButton && this.isMyProfile) {
            editButton.addEventListener('click', () => this.openEditModal());
        }

        const followButton = document.querySelector('.follow-user-btn');
        if (followButton && !this.isMyProfile) {
            followButton.addEventListener('click', () => this.followUser());
        }
    }

    renderProfile() {
        if (!this.profile) return;

        const fullName = `${this.profile.firstName} ${this.profile.lastName}`;
        const username = `@${this.profile.firstName.toLowerCase()}${this.profile.lastName.toLowerCase()}`;

        // Update profile header
        const nameElement = document.querySelector('.text-xl.md\\:text-2xl.font-bold');
        if (nameElement) {
            nameElement.textContent = fullName;
        }

        const usernameElement = document.querySelector('.text-slate-500.dark\\:text-slate-400.text-sm.md\\:text-base');
        if (usernameElement) {
            usernameElement.textContent = username;
        }

        const bioElement = document.querySelector('.text-slate-600.dark\\:text-slate-300.text-sm.md\\:text-base.mt-2');
        if (bioElement) {
            bioElement.textContent = this.profile.bio || 'No bio available';
        }

        // Update avatar
        const avatarElement = document.querySelector('.rounded-full.size-16.md\\:size-20');
        if (avatarElement) {
            avatarElement.src = this.profile.avatarUrl || '/client/assets/images/avatar.png';
            avatarElement.alt = `${fullName} avatar`;
        }

        // Update stats
        this.updateStats();

        // Update action button
        this.updateActionButton();
    }

    updateStats() {
        const followersElement = document.querySelector('.text-lg.md\\:text-2xl.font-bold');
        const followingElements = document.querySelectorAll('.text-lg.md\\:text-2xl.font-bold');
        
        if (followersElement && this.profile.followers !== undefined) {
            followersElement.textContent = this.formatNumber(this.profile.followers);
        }
        
        if (followingElements[1] && this.profile.following !== undefined) {
            followingElements[1].textContent = this.formatNumber(this.profile.following);
        }

        if (followingElements[2]) {
            followingElements[2].textContent = this.posts.length;
        }
    }

    updateActionButton() {
        const buttonContainer = document.querySelector('.flex.min-w-\\[84px\\]');
        if (!buttonContainer) return;

        if (this.isMyProfile) {
            buttonContainer.innerHTML = `
                <button class="edit-profile-btn flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 md:h-10 px-4 md:px-5 bg-primary text-white text-xs md:text-sm font-bold w-full sm:w-auto hover:bg-primary/90 transition-colors">
                    <span class="truncate">Edit Profile</span>
                </button>
            `;
        } else {
            buttonContainer.innerHTML = `
                <button class="follow-user-btn flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 md:h-10 px-4 md:px-5 bg-primary text-white text-xs md:text-sm font-bold w-full sm:w-auto hover:bg-primary/90 transition-colors">
                    <span class="truncate">Follow</span>
                </button>
            `;
        }

        this.setupEventListeners();
    }

    renderPosts() {
        const postsContainer = document.querySelector('.flex.flex-col.gap-4.md\\:gap-6');
        if (!postsContainer) return;

        if (this.posts.length === 0) {
            postsContainer.innerHTML = this.renderEmptyPostsState();
            return;
        }

        postsContainer.innerHTML = this.posts.map(post => this.renderPostCard(post)).join('');
    }

    renderPostCard(post) {
        const fullName = `${this.profile.firstName} ${this.profile.lastName}`;
        
        return `
            <article class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div class="p-3 md:p-5">
                    <div class="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <div>
                            <img src="${this.profile.avatarUrl || '/client/assets/images/avatar.png'}"
                                class="rounded-full size-8 md:size-10" alt="avatar">
                        </div>
                        <div>
                            <p class="text-slate-900 dark:text-white text-sm md:text-base font-semibold">
                                ${fullName}
                            </p>
                            <p class="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
                                ${this.formatDate(post.createdAt)}
                            </p>
                        </div>
                    </div>
                    <p class="text-slate-700 dark:text-slate-300 text-sm md:text-base mb-3 md:mb-4">
                        ${post.content}
                    </p>
                </div>
                ${post.imageUrl ? `
                    <div>
                        <img src="${post.imageUrl}" class="aspect-video w-full object-cover" alt="Post image">
                    </div>
                ` : ''}
                <div class="p-2 md:p-3 border-t border-slate-100 dark:border-slate-700">
                    <div class="flex items-center justify-start gap-2 md:gap-4 -ml-1 md:-ml-2">
                        <button class="like-btn flex items-center justify-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 rounded-full hover:bg-red-50 group cursor-pointer" data-post-id="${post.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4 md:size-5 text-slate-500 group-hover:text-red-500 dark:text-slate-400">
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3c3.08 0 5.5 2.42 5.5 5.5 0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <p class="text-xs md:text-sm font-medium leading-normal text-slate-500 group-hover:text-red-500 dark:text-slate-400">
                                Like
                            </p>
                        </button>
                        <button class="comment-btn flex items-center justify-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 rounded-full hover:bg-blue-50 group cursor-pointer" data-post-id="${post.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4 md:size-5 text-slate-500 group-hover:text-blue-500 dark:text-slate-400">
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                            </svg>
                            <p class="text-xs md:text-sm font-medium leading-normal text-slate-500 group-hover:text-blue-500 dark:text-slate-400">
                                Comment
                            </p>
                        </button>
                        <button class="share-btn flex items-center justify-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 rounded-full hover:bg-green-50 group cursor-pointer" data-post-id="${post.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4 md:size-5 text-slate-500 group-hover:text-green-500 dark:text-slate-400">
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.51.48 1.2.77 1.96.77 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L7.05 11.9c-.51-.48-1.2-.77-1.96-.77-1.66 0-3 1.34-3 3s1.34 3 3 3c.76 0 1.44-.3 1.96-.77l7.05 4.11c-.05.23-.09.46-.09.7 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                            <p class="text-xs md:text-sm font-medium leading-normal text-slate-500 group-hover:text-green-500 dark:text-slate-400">
                                Share
                            </p>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    renderEmptyPostsState() {
        return `
            <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <span class="text-4xl">📝</span>
                </div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">No posts yet</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm">
                    ${this.isMyProfile ? 'Share your first post to get started!' : 'This user hasn\'t posted anything yet.'}
                </p>
            </div>
        `;
    }

    async followUser() {
        try {
            await ApiService.sendFriendRequest({ receiverId: this.userId });
            this.showSuccess('Follow request sent!');
            
            const button = document.querySelector('.follow-user-btn span');
            if (button) {
                button.textContent = 'Requested';
                button.parentElement.disabled = true;
                button.parentElement.classList.add('opacity-50', 'cursor-not-allowed');
            }
        } catch (error) {
            console.error('Error following user:', error);
            this.showError('Failed to send follow request');
        }
    }

    openEditModal() {
        // This would open an edit profile modal
        this.showSuccess('Edit profile feature coming soon!');
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else if (diffInHours < 168) {
            return `${Math.floor(diffInHours / 24)}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    setLoading(loading) {
        this.loading = loading;
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
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
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

export function init() {
    new UserProfileManager();
}

if (typeof window !== 'undefined' && !window.moduleSystem) {
    document.addEventListener('DOMContentLoaded', init);
}