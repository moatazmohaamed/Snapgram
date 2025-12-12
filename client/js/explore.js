import ApiService from './services/api.js';

class ExploreManager {
    constructor() {
        this.posts = [];
        this.profiles = [];
        this.filteredPosts = [];
        this.loading = false;
        this.searchTerm = '';
        this.currentPage = 1;
        this.postsPerPage = 9;
        this.trendingTopics = [
            { tag: '#WebDevelopment', count: '12.5K' },
            { tag: '#Design', count: '8.3K' },
            { tag: '#Photography', count: '5.7K' },
            { tag: '#Travel', count: '4.2K' },
            { tag: '#Technology', count: '3.8K' },
            { tag: '#Art', count: '2.9K' }
        ];
        this.init();
    }

    async init() {
        await this.loadSidebar();
        await this.loadData();
        this.setupEventListeners();
        this.renderTrendingTopics();
        this.renderPosts();
    }

    async loadSidebar() {
        const sidebarContainer = document.querySelector('#sidebar-container');
        if (sidebarContainer && window.componentLoader) {
            await window.componentLoader.insert('../components/sidebar.html', sidebarContainer);
        }
    }

    async loadData() {
        try {
            this.setLoading(true);
            console.log('Starting to load data...');
            
            const [postsResponse, profilesResponse] = await Promise.all([
                ApiService.getAllPosts(),
                ApiService.getAllProfiles()
            ]);
            
            console.log('Posts response:', postsResponse);
            console.log('Profiles response:', profilesResponse);
            
            if (postsResponse.success && profilesResponse.success) {
                this.posts = postsResponse.data;
                this.profiles = profilesResponse.data;
                
                console.log('Loaded posts:', this.posts.length);
                console.log('Loaded profiles:', this.profiles.length);
                
                // Create profile map for easy lookup
                const profileMap = this.profiles.reduce((map, profile) => {
                    map[profile.id] = profile;
                    return map;
                }, {});
                
                // Enhance posts with author information
                this.posts = this.posts.map(post => ({
                    ...post,
                    author: profileMap[post.authorId] || post.author || {
                        firstName: 'Unknown',
                        lastName: 'User',
                        avatarUrl: '/client/assets/images/avatar.png'
                    },
                    likes: post.likes || Math.floor(Math.random() * 2000) + 50,
                    comments: post.comments || Math.floor(Math.random() * 200) + 5,
                    shares: post.shares || Math.floor(Math.random() * 100) + 1
                }));
                
                this.filteredPosts = [...this.posts];
                console.log('Data loaded successfully');
            } else {
                console.error('API responses failed:', { postsResponse, profilesResponse });
                this.showError('Failed to load posts');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load posts');
        } finally {
            this.setLoading(false);
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterPosts();
            });
        }

        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.currentPage++;
                this.renderPosts();
            });
        }

        // Event delegation for post interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.like-btn')) {
                const postId = e.target.closest('.like-btn').getAttribute('data-post-id');
                this.toggleLike(postId);
            } else if (e.target.closest('.save-btn')) {
                const postId = e.target.closest('.save-btn').getAttribute('data-post-id');
                this.toggleSave(postId);
            } else if (e.target.closest('.share-btn')) {
                const postId = e.target.closest('.share-btn').getAttribute('data-post-id');
                this.sharePost(postId);
            } else if (e.target.closest('.trending-topic')) {
                const topic = e.target.closest('.trending-topic').getAttribute('data-topic');
                this.searchByTopic(topic);
            }
        });
    }

    filterPosts() {
        if (!this.searchTerm) {
            this.filteredPosts = [...this.posts];
        } else {
            this.filteredPosts = this.posts.filter(post => 
                post.content.toLowerCase().includes(this.searchTerm) ||
                `${post.author.firstName} ${post.author.lastName}`.toLowerCase().includes(this.searchTerm)
            );
        }
        this.currentPage = 1;
        this.renderPosts();
    }

    searchByTopic(topic) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = topic;
            this.searchTerm = topic.toLowerCase();
            this.filterPosts();
        }
    }

    renderTrendingTopics() {
        const container = document.getElementById('trending-topics');
        if (!container) return;

        container.innerHTML = this.trendingTopics.map(topic => `
            <button class="trending-topic flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" data-topic="${topic.tag}">
                <span class="text-sm font-semibold text-slate-900 dark:text-white">${topic.tag}</span>
                <span class="text-xs text-slate-500 dark:text-slate-400">${topic.count}</span>
            </button>
        `).join('');
    }

    renderPosts() {
        const container = document.getElementById('posts-grid');
        const loadMoreContainer = document.getElementById('load-more-container');
        
        if (!container) return;

        if (this.loading && this.currentPage === 1) {
            container.innerHTML = this.renderLoadingState();
            return;
        }

        const startIndex = 0;
        const endIndex = this.currentPage * this.postsPerPage;
        const postsToShow = this.filteredPosts.slice(startIndex, endIndex);

        if (postsToShow.length === 0) {
            container.innerHTML = this.renderEmptyState();
            loadMoreContainer.style.display = 'none';
            return;
        }

        container.innerHTML = postsToShow.map(post => this.renderPostCard(post)).join('');
        
        // Show/hide load more button
        if (loadMoreContainer) {
            loadMoreContainer.style.display = endIndex >= this.filteredPosts.length ? 'none' : 'flex';
        }
    }

    renderPostCard(post) {
        const fullName = `${post.author.firstName} ${post.author.lastName}`;
        
        return `
            <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onclick="window.location.hash='/post-details?id=${post.id}'">
                ${post.imageUrl ? `
                    <div class="aspect-square overflow-hidden">
                        <img src="${post.imageUrl}" alt="Post image" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                    </div>
                ` : `
                    <div class="aspect-square bg-gradient-to-br from-primary/10 to-indigo-600/10 flex items-center justify-center">
                        <span class="text-6xl opacity-50">📝</span>
                    </div>
                `}
                
                <div class="p-4">
                    <div class="flex items-center gap-3 mb-3">
                        <img src="${post.author.avatarUrl || '/client/assets/images/avatar.png'}" 
                             alt="${fullName}" 
                             class="w-8 h-8 rounded-full ring-2 ring-slate-100 dark:ring-slate-800"
                             onerror="this.src='/client/assets/images/avatar.png'">
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">${fullName}</p>
                            <p class="text-xs text-slate-500 dark:text-slate-400">${this.formatDate(post.createdAt)}</p>
                        </div>
                    </div>
                    
                    <p class="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 mb-3">
                        ${post.content}
                    </p>
                    
                    <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span class="flex items-center gap-1">
                                <span>❤️</span>
                                ${this.formatNumber(post.likes)}
                            </span>
                            <span class="flex items-center gap-1">
                                <span>💬</span>
                                ${this.formatNumber(post.comments)}
                            </span>
                        </div>
                        
                        <div class="flex items-center gap-2" onclick="event.stopPropagation()">
                            <button class="like-btn p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" data-post-id="${post.id}" title="Like">
                                <span class="text-lg">🤍</span>
                            </button>
                            <button class="save-btn p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" data-post-id="${post.id}" title="Save">
                                <span class="text-lg">🔖</span>
                            </button>
                            <button class="share-btn p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" data-post-id="${post.id}" title="Share">
                                <span class="text-lg">↗️</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLoadingState() {
        return Array(9).fill(0).map(() => `
            <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
                <div class="aspect-square bg-slate-200 dark:bg-slate-700"></div>
                <div class="p-4">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        <div class="flex-1">
                            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-1"></div>
                            <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                        </div>
                    </div>
                    <div class="space-y-2 mb-3">
                        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    </div>
                    <div class="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div class="flex gap-4">
                            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
                            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
                        </div>
                        <div class="flex gap-2">
                            <div class="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                            <div class="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                            <div class="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderEmptyState() {
        return `
            <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div class="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <span class="text-4xl">🔍</span>
                </div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">No posts found</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm">
                    ${this.searchTerm ? 'Try adjusting your search terms' : 'Check back later for new content'}
                </p>
            </div>
        `;
    }

    async toggleLike(postId) {
        try {
            await ApiService.addReaction({ postId, type: 'like' });
            
            const likeBtn = document.querySelector(`[data-post-id="${postId}"].like-btn span`);
            if (likeBtn) {
                likeBtn.textContent = likeBtn.textContent === '🤍' ? '❤️' : '🤍';
            }
            
            this.showSuccess('Post liked!');
        } catch (error) {
            console.error('Error liking post:', error);
            this.showError('Failed to like post');
        }
    }

    async toggleSave(postId) {
        try {
            const saveBtn = document.querySelector(`[data-post-id="${postId}"].save-btn span`);
            if (saveBtn) {
                const isSaved = saveBtn.textContent === '🔖';
                saveBtn.textContent = isSaved ? '📌' : '🔖';
                this.showSuccess(isSaved ? 'Post saved!' : 'Post unsaved!');
            }
        } catch (error) {
            console.error('Error saving post:', error);
            this.showError('Failed to save post');
        }
    }

    async sharePost(postId) {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Check out this post',
                    url: `${window.location.origin}#/post-details?id=${postId}`
                });
            } else {
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
        const searchInput = document.getElementById('search-input');
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
    new ExploreManager();
}

if (typeof window !== 'undefined' && !window.moduleSystem) {
    document.addEventListener('DOMContentLoaded', init);
}