// PlaceIt! API Service
// Handles all communication with the backend API

const API_BASE_URL = 'http://localhost:3002/api';

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
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
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

  async getVendorFurniture(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/vendor/furniture?${queryString}` 
      : '/vendor/furniture';
    return this.request(endpoint);
  }

  async generate3DModel(furnitureId, videoUrl) {
    return this.request(`/vendor/furniture/${furnitureId}/generate-3d`, {
      method: 'POST',
      body: JSON.stringify({
        video_url: videoUrl,
      }),
    });
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

  // ===========================================
  // AR INTERACTION LOGGING
  // ===========================================

  async logARInteraction(interactionData) {
    return this.request('/ar/interaction', {
      method: 'POST',
      body: JSON.stringify(interactionData),
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
