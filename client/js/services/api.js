import environments from '../../environments/environment.js';

class ApiService {
    constructor() {
        this.baseURL = environments.production ? environments.API_URL : environments.MOCK_API;
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
                const token = localStorage.getItem('authToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.axios.interceptors.response.use(
            (response) => {
                // Transform the response to match expected format
                return {
                    success: true,
                    data: response.data
                };
            },
            (error) => {
                console.error('API Error:', error);
                
                let errorMessage = 'An error occurred';
                if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
                    errorMessage = 'Network connection failed. Please check your internet connection.';
                } else if (error.response) {
                    errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
                } else if (error.request) {
                    errorMessage = 'No response from server. Please try again later.';
                } else {
                    errorMessage = error.message || 'An unexpected error occurred';
                }
                
                return Promise.reject({
                    success: false,
                    error: errorMessage
                });
            }
        );
    }

    // Data transformation methods
    transformProfile(profile) {
        // Split name into firstName and lastName
        const nameParts = (profile.name || '').split(' ');
        return {
            ...profile,
            firstName: nameParts[0] || 'Unknown',
            lastName: nameParts.slice(1).join(' ') || 'User',
            followers: profile.NumberMutualFriends || 0,
            following: Math.floor(Math.random() * 500) + 50, // Mock data
            postsCount: profile.postsCount || 0
        };
    }

    transformPost(post) {
        // Transform post structure to match frontend expectations
        const transformedAuthor = post.author ? {
            id: post.author.id,
            firstName: (post.author.name || '').split(' ')[0] || 'Unknown',
            lastName: (post.author.name || '').split(' ').slice(1).join(' ') || 'User',
            avatarUrl: post.author.avatarUrl
        } : null;

        return {
            ...post,
            authorId: post.author?.id,
            author: transformedAuthor,
            imageUrl: post.images && post.images.length > 0 ? post.images[0] : null,
            likes: post.totalreaction || 0,
            comments: post.commentsCount || 0,
            shares: Math.floor(Math.random() * 100) + 1 // Mock data
        };
    }

    // Profile endpoints
    async getAllProfiles() {
        try {
            console.log('Fetching profiles from:', this.baseURL + '/api/profile');
            const response = await this.axios.get('/api/profile');
            console.log('Profiles API response:', response);
            if (response.success && response.data) {
                response.data = response.data.map(profile => this.transformProfile(profile));
                console.log('Transformed profiles:', response.data);
            }
            return response;
        } catch (error) {
            console.error('Profiles API error:', error);
            return { success: false, error: error.message || 'Failed to fetch profiles' };
        }
    }

    async getProfile(id, isMyProfile = false) {
        try {
            const response = await this.axios.get(`/api/profile/${id}?IsMyProfile=${isMyProfile}`);
            if (response.success && response.data) {
                response.data = this.transformProfile(response.data);
            }
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateProfile(profileData) {
        return this.axios.put('/api/profile', profileData);
    }

    // Posts endpoints
    async getAllPosts() {
        try {
            console.log('Fetching posts from:', this.baseURL + '/api/posts');
            const response = await this.axios.get('/api/posts');
            console.log('Posts API response:', response);
            if (response.success && response.data) {
                response.data = response.data.map(post => this.transformPost(post));
                console.log('Transformed posts:', response.data);
            }
            return response;
        } catch (error) {
            console.error('Posts API error:', error);
            return { success: false, error: error.message || 'Failed to fetch posts' };
        }
    }

    async getPost(id) {
        try {
            const response = await this.axios.get(`/api/posts/${id}`);
            if (response.success && response.data) {
                response.data = this.transformPost(response.data);
            }
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async createPost(postData) {
        return this.axios.post('/api/posts', postData);
    }

    async updatePost(id, postData) {
        return this.axios.put(`/api/posts/${id}`, postData);
    }

    async deletePost(id) {
        return this.axios.delete(`/api/posts/${id}`);
    }

    // Reactions endpoints
    async getAllReactions() {
        return this.axios.get('/api/reactions');
    }

    async addReaction(reactionData) {
        return this.axios.post('/api/reactions', reactionData);
    }

    // Comments endpoints
    async addComment(commentData) {
        return this.axios.post('/api/comments', commentData);
    }

    async updateComment(commentId, commentData) {
        return this.axios.put(`/api/comments/${commentId}`, commentData);
    }

    async deleteComment(commentId) {
        return this.axios.delete(`/api/comments/${commentId}`);
    }

    // Friend requests endpoints
    async sendFriendRequest(requestData) {
        return this.axios.post('/api/requests', requestData);
    }
}

export default new ApiService();