// PlaceIt! API Service
// Handles all communication with the backend API

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3002/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('placeit_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('placeit_token', token);
    } else {
      localStorage.removeItem('placeit_token');
    }
  }

  // Get authorization headers
  getAuthHeaders(isJson = false) {
    const headers = {};

    const isNgrok = import.meta.env.VITE_API_URL?.includes('.ngrok-');
    if (isNgrok) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }

    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  
  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const isJson = options.body && !(options.body instanceof FormData);
    const config = {
      headers: this.getAuthHeaders(isJson),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle network errors
      if (!response) {
        throw new Error('Network error - unable to connect to the server');
      }
      
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      
      // Check if server is unreachable
      if (!navigator.onLine || error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  // ===========================================
  // AUTHENTICATION METHODS
  // ===========================================

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data.session) {
      this.setToken(response.data.session.access_token);
    }
    
    return response;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  logout() {
    this.setToken(null);
  }

  // ===========================================
  // FURNITURE METHODS
  // ===========================================

  async getFurniture(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/furniture?${queryString}` : '/furniture';
    return this.request(endpoint);
  }

  async getFurnitureById(id) {
    return this.request(`/furniture/${id}`);
  }

  // Increment view count for a furniture item
  async incrementViewCount(id) {
    return this.request(`/furniture/${id}/view`, {
      method: 'POST',
    });
  }

  async createFurniture(furnitureData) {
    return this.request('/furniture', {
      method: 'POST',
      body: JSON.stringify(furnitureData),
    });
  }

  async updateFurniture(id, furnitureData) {
    return this.request(`/furniture/${id}`, {
      method: 'PUT',
      body: JSON.stringify(furnitureData),
    });
  }

  async deleteFurniture(id) {
    return this.request(`/furniture/${id}`, {
      method: 'DELETE',
    });
  }

  async updateFurnitureStatus(id, status) {
    return this.request(`/furniture/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async bulkUpdateFurniture(action, furniture_ids) {
    return this.request(`/furniture/bulk/${action}`, {
      method: 'PATCH',
      body: JSON.stringify({ furniture_ids }),
    });
  }

  // ===========================================
  // CATEGORIES METHODS
  // ===========================================

  async getCategories() {
    return this.request('/categories');
  }

  // ===========================================
  // CART METHODS
  // ===========================================

  async getCart() {
    return this.request('/cart');
  }

  async addToCart(furnitureId, quantity = 1) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({
        furniture_id: furnitureId,
        quantity,
      }),
    });
  }

  async updateCartItem(itemId, quantity) {
    return this.request(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId) {
    return this.request(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  // ===========================================
  // FAVORITES METHODS
  // ===========================================

  async getFavorites() {
    return this.request('/favorites');
  }

  async addToFavorites(furnitureId) {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({
        furniture_id: furnitureId,
      }),
    });
  }

  async removeFromFavorites(furnitureId) {
    return this.request(`/favorites/${furnitureId}`, {
      method: 'DELETE',
    });
  }

  // ===========================================
  // REVIEWS METHODS
  // ===========================================

  async getReviews(furnitureId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/reviews/${furnitureId}?${queryString}` 
      : `/reviews/${furnitureId}`;
    return this.request(endpoint);
  }

  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // ===========================================
  // SELLER METHODS
  // ===========================================

  async getVendorDashboard() {
    return this.request('/vendor/dashboard');
  }

  async getVendorAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/vendor/analytics?${queryString}` 
      : '/vendor/analytics';
    return this.request(endpoint);
  }

  async getVendorFurniture(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/vendor/furniture?${queryString}` 
      : '/vendor/furniture';
    return this.request(endpoint);
  }

  // New method for calling photogrammetry/reconstruct endpoint
  async reconstructFurniture(furnitureId) {
    console.log('%c🔥 DEBUG: reconstructFurniture function called!', 'font-size: 20px; color: limegreen; background: black; padding: 10px;');
    return this.request('/photogrammetry/reconstruct', {
      method: 'POST',
      body: JSON.stringify({
        furnitureId: furnitureId,
      }),
    });
  }

  // Method to get reconstruction jobs for the current user
  async getReconstructionJobs() {
    return this.request('/vendor/reconstruction-jobs');
  }

  async getVendorRecommendations() {
    return this.request('/vendor/recommendations');
  }

  // ===========================================
  // UPLOAD METHODS
  // ===========================================
  async uploadMedia(file, furnitureId = null, type = 'image') {
    const formData = new FormData();
    formData.append('file', file);
    if (furnitureId) formData.append('furniture_id', furnitureId);
    formData.append('type', type);

    return this.request('/uploads/media', {
      method: 'POST',
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : undefined,
      },
      body: formData,
    });
  }

  async deleteMedia(mediaId) {
    return this.request(`/uploads/media/${mediaId}`, {
      method: 'DELETE',
    });
  }

  async updateMedia(mediaId, updateData) {
    return this.request(`/uploads/media/${mediaId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // ===========================================
  // AR INTERACTION LOGGING
  // ===========================================

  async logARInteraction(interactionData) {
    return this.request('/ar/interaction', {
      method: 'POST',
      body: JSON.stringify(interactionData),
    });
  }

  // ===========================================
  // VENDOR ENHANCED METHODS
  // ===========================================

  async getVendorStats() {
    return this.request('/vendor/dashboard');
  }

  async getVendorDetailedAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/vendor/analytics?${queryString}` 
      : '/vendor/analytics';
    return this.request(endpoint);
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
