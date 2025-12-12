import ApiService from './services/api.js';

class SavedPostsManager {
    constructor() {
        this.savedPosts = [];
        this.loading = false;
        this.init();
    }

    async init() {
        await this.loadSidebar();
        await this.loadSavedPosts();
        this.setupEventListeners();
    }

    async loadSidebar() {
        const sidebarContainer = document.querySelector('#sidebar-container');
        if (sidebarContainer && window.componentLoader) {
            await window.componentLoader.insert('../components/sidebar.html', sidebarContainer);
        }
    }

    async loadSavedPosts() {
        try {
            this.setLoading(true);
            console.log('Loading saved posts...');
            
            // Get all posts and filter saved ones (in real app, there would be a dedicated endpoint)
            const postsResponse = await ApiService.getAllPosts();
            const profilesResponse = await ApiService.getAllProfiles();
            
            console.log('Saved posts - Posts response:', postsResponse);
            console.log('Saved posts - Profiles response:', profilesResponse);
            
            if (postsResponse.success && profilesResponse.success) {
                // Simulate saved posts by taking some posts
                const allPosts = postsResponse.data;
                const profiles = profilesResponse.data;
                
                // Create a map of profiles for easy lookup
                const profileMap = profiles.reduce((map, profile) => {
                    map[profile.id] = profile;
                    return map;
                }, {});
                
                // Simulate saved posts (in real app, this would come from user's saved posts)
                this.savedPosts = allPosts.slice(0, 3).map(post => ({
                    ...post,
                    author: profileMap[post.authorId] || post.author || {
                        firstName: 'Unknown',
                        lastName: 'User',
                        avatarUrl: '/client/assets/images/avatar.png'
                    },
                    savedAt: new Date().toISOString()
                }));
                
                console.log('Saved posts loaded:', this.savedPosts.length);
                this.renderSavedPosts();
            } else {
                console.error('Failed to load saved posts:', { postsResponse, profilesResponse });
                this.showError('Failed to load saved posts');
            }
        } catch (error) {
            console.error('Error loading saved posts:', error);
            this.showError('Failed to load saved posts');
        } finally {
            this.setLoading(false);
        }
    }

    setupEventListeners() {
        // Event delegation for dynamic content
        document.addEventListener('click', (e) => {
            if (e.target.closest('.unsave-btn')) {
                const postId = e.target.closest('.unsave-btn').getAttribute('data-post-id');
                this.unsavePost(postId);
            } else if (e.target.closest('.like-btn')) {
                const postId = e.target.closest('.like-btn').getAttribute('data-post-id');
                this.toggleLike(postId);
            } else if (e.target.closest('.comment-btn')) {
                const postId = e.target.closest('.comment-btn').getAttribute('data-post-id');
                this.openComments(postId);
            } else if (e.target.closest('.share-btn')) {
                const postId = e.target.closest('.share-btn').getAttribute('data-post-id');
                this.sharePost(postId);
            }
        });
    }

    renderSavedPosts() {
        const container = document.querySelector('.flex.flex-col.gap-4.max-w-3xl');
        if (!container) return;

        if (this.loading) {
            container.innerHTML = this.renderLoadingState();
            return;
        }

        if (this.savedPosts.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        container.innerHTML = this.savedPosts.map(post => this.renderPostCard(post)).join('');
    }

    renderPostCard(post) {
        const fullName = `${post.author.firstName} ${post.author.lastName}`;
        const username = `@${post.author.firstName.toLowerCase()}${post.author.lastName.toLowerCase()}`;
        
        return `
            <article class="flex flex-col rounded-xl bg-white shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div class="p-3 md:p-4">
                    <div class="flex flex-col items-stretch justify-start">
                        <div class="flex w-full grow flex-col items-stretch justify-center gap-2 md:gap-3 pb-2 md:pb-3">
                            <div class="flex items-center gap-2 md:gap-3">
                                <div>
                                    <img src="${post.author.avatarUrl || '/client/assets/images/avatar.png'}"
                                        class="aspect-square size-8 md:size-10 rounded-full bg-cover bg-center bg-no-repeat"
                                        alt="${fullName} avatar"
                                        onerror="this.src='/client/assets/images/avatar.png'">
                                </div>
                                <div>
                                    <p class="text-slate-900 text-sm md:text-base font-medium dark:text-white">
                                        ${fullName}
                                    </p>
                                    <p class="text-slate-500 text-xs md:text-sm font-normal leading-normal dark:text-slate-400">
                                        ${username} · ${this.formatDate(post.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <p class="text-slate-800 text-sm md:text-base font-normal leading-relaxed dark:text-slate-200">
                                ${post.content}
                            </p>
                        </div>
                        ${post.imageUrl ? `
                            <div>
                                <img src="${post.imageUrl}"
                                    class="aspect-video w-full rounded-lg md:rounded-xl bg-cover bg-center bg-no-repeat"
                                    alt="Post image">
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="border-t border-slate-100 px-3 md:px-4 dark:border-slate-800">
                    <div class="flex items-center justify-start gap-2 md:gap-4 -ml-1 md:-ml-2 py-1">
                        <button class="like-btn flex items-center justify-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 rounded-full hover:bg-red-50 group cursor-pointer" data-post-id="${post.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4 md:size-5 text-slate-500 group-hover:text-red-500 dark:text-slate-400">
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3c3.08 0 5.5 2.42 5.5 5.5 0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <p class="text-xs md:text-sm font-medium leading-normal text-slate-500 group-hover:text-red-500 dark:text-slate-400 like-count">
                                ${this.formatNumber(Math.floor(Math.random() * 2000) + 100)}
                            </p>
                        </button>
                        <button class="comment-btn flex items-center justify-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 rounded-full hover:bg-blue-50 group cursor-pointer" data-post-id="${post.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4 md:size-5 text-slate-500 group-hover:text-blue-500 dark:text-slate-400">
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                            </svg>
                            <p class="text-xs md:text-sm font-medium leading-normal text-slate-500 group-hover:text-blue-500 dark:text-slate-400">
                                ${Math.floor(Math.random() * 500) + 10}
                            </p>
                        </button>
                        <button class="share-btn flex items-center justify-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 rounded-full hover:bg-green-50 group cursor-pointer" data-post-id="${post.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4 md:size-5 text-slate-500 group-hover:text-green-500 dark:text-slate-400">
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.51.48 1.2.77 1.96.77 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L7.05 11.9c-.51-.48-1.2-.77-1.96-.77-1.66 0-3 1.34-3 3s1.34 3 3 3c.76 0 1.44-.3 1.96-.77l7.05 4.11c-.05.23-.09.46-.09.7 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                            <p class="text-xs md:text-sm font-medium leading-normal text-slate-500 group-hover:text-green-500 dark:text-slate-400">
                                ${Math.floor(Math.random() * 100) + 5}
                            </p>
                        </button>
                        <button class="unsave-btn ml-auto flex items-center justify-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 rounded-full hover:bg-red-50 group cursor-pointer" data-post-id="${post.id}" title="Remove from saved">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4 md:size-5 text-primary group-hover:text-red-500">
                                <path d="M0 0h24v24H0z" fill="none" />
                                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    renderLoadingState() {
        return Array(3).fill(0).map(() => `
            <article class="flex flex-col rounded-xl bg-white shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-pulse">
                <div class="p-3 md:p-4">
                    <div class="flex items-center gap-2 md:gap-3 mb-3">
                        <div class="size-8 md:size-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        <div class="flex-1">
                            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-1"></div>
                            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    </div>
                </div>
                <div class="aspect-video bg-slate-200 dark:bg-slate-700"></div>
                <div class="p-3 border-t border-slate-100 dark:border-slate-800">
                    <div class="flex gap-4">
                        <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
                        <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
                        <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
                    </div>
                </div>
            </article>
        `).join('');
    }

    renderEmptyState() {
        return `
            <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <span class="text-4xl">🔖</span>
                </div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">No saved posts</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm">
                    Posts you save will appear here for easy access later
                </p>
            </div>
        `;
    }

    async unsavePost(postId) {
        try {
            // Remove from local array
            this.savedPosts = this.savedPosts.filter(post => post.id !== postId);
            this.renderSavedPosts();
            this.showSuccess('Post removed from saved');
        } catch (error) {
            console.error('Error unsaving post:', error);
            this.showError('Failed to remove post');
        }
    }

    async toggleLike(postId) {
        try {
            await ApiService.addReaction({ postId, type: 'like' });
            
            // Update UI
            const likeBtn = document.querySelector(`[data-post-id="${postId}"].like-btn`);
            const likeCount = likeBtn.querySelector('.like-count');
            const currentCount = parseInt(likeCount.textContent.replace(/[^\d]/g, ''));
            likeCount.textContent = this.formatNumber(currentCount + 1);
            
            this.showSuccess('Post liked!');
        } catch (error) {
            console.error('Error liking post:', error);
            this.showError('Failed to like post');
        }
    }

    openComments(postId) {
        // Navigate to post details or open comments modal
        window.location.hash = `/post-details?id=${postId}`;
    }

    async sharePost(postId) {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Check out this post',
                    url: `${window.location.origin}#/post-details?id=${postId}`
                });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(`${window.location.origin}#/post-details?id=${postId}`);
                this.showSuccess('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing post:', error);
            this.showError('Failed to share post');
        }
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
            return `${diffInHours}h`;
        } else if (diffInHours < 168) {
            return `${Math.floor(diffInHours / 24)}d`;
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
    new SavedPostsManager();
}

if (typeof window !== 'undefined' && !window.moduleSystem) {
    document.addEventListener('DOMContentLoaded', init);
}