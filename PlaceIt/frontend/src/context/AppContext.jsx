import { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  cart: [],
  favorites: [],
  categories: [],
  isLoading: false,
  error: null,
  toast: null
};

// Action types
export const actionTypes = {
  SET_USER: 'SET_USER',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  LOGOUT: 'LOGOUT',
  SET_CART: 'SET_CART',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_QUANTITY: 'UPDATE_CART_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_FAVORITES: 'SET_FAVORITES',
  ADD_TO_FAVORITES: 'ADD_TO_FAVORITES',
  REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SHOW_TOAST: 'SHOW_TOAST',
  HIDE_TOAST: 'HIDE_TOAST'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        error: null
      };

    case actionTypes.SET_AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: action.payload
      };

    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        cart: [],
        favorites: []
      };

    case actionTypes.SET_CART:
      return {
        ...state,
        cart: action.payload
      };

    case actionTypes.ADD_TO_CART:
      const existingCartItem = state.cart.find(item => item.furniture.id === action.payload.furniture.id);
      if (existingCartItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.furniture.id === action.payload.furniture.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        };
      }
      return {
        ...state,
        cart: [...state.cart, action.payload]
      };

    case actionTypes.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };

    case actionTypes.UPDATE_CART_QUANTITY:
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case actionTypes.CLEAR_CART:
      return {
        ...state,
        cart: []
      };

    case actionTypes.SET_FAVORITES:
      return {
        ...state,
        favorites: action.payload
      };

    case actionTypes.ADD_TO_FAVORITES:
      return {
        ...state,
        favorites: [...state.favorites, action.payload]
      };

    case actionTypes.REMOVE_FROM_FAVORITES:
      return {
        ...state,
        favorites: state.favorites.filter(item => item.furniture_id !== action.payload)
      };

    case actionTypes.SET_CATEGORIES:
      return {
        ...state,
        categories: action.payload
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case actionTypes.SHOW_TOAST:
      return {
        ...state,
        toast: action.payload
      };

    case actionTypes.HIDE_TOAST:
      return {
        ...state,
        toast: null
      };

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app data
  useEffect(() => {
    initializeApp();
  }, []);
  
  const initializeApp = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      // Load categories
      await loadCategories();
      
      // Check if user is authenticated
      const token = localStorage.getItem('placeit_token');
      if (token) {
        try {
          const response = await apiService.getProfile();
          if (response.success) {
            dispatch({ type: actionTypes.SET_USER, payload: response.data });
            dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true });
            
            // Load user-specific data
            await Promise.all([
              loadCart(),
              loadFavorites()
            ]);
          }
        } catch (error) {
          console.error('Authentication check failed:', error);
          // Clear invalid token and show message
          apiService.logout();
          dispatch({ 
            type: actionTypes.SHOW_TOAST, 
            payload: { type: 'info', message: 'Your session has expired. Please log in again.' }
          });
        }
      }
    } catch (error) {
      console.error('App initialization error:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };
  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success) {
        dispatch({ type: actionTypes.SET_CATEGORIES, payload: response.data });
      } else {
        // If no success flag but data exists
        dispatch({ type: actionTypes.SET_CATEGORIES, payload: [] });
        throw new Error('Categories load failed');
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Don't show toast for this as it's not user-initiated
    }
  };

  const loadCart = async () => {
    try {
      const response = await apiService.getCart();
      if (response.success) {
        dispatch({ type: actionTypes.SET_CART, payload: response.data });
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await apiService.getFavorites();
      if (response.success) {
        dispatch({ type: actionTypes.SET_FAVORITES, payload: response.data });
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  // Action creators
  const actions = {
    // Authentication actions
    register: async (userData) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await apiService.register(userData);
        
        if (response.success) {
          dispatch({ type: actionTypes.SET_USER, payload: response.data.user });
          dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true });
          dispatch({ 
            type: actionTypes.SHOW_TOAST, 
            payload: { type: 'success', message: 'Registration successful!' }
          });
          
          // Load user-specific data
          await Promise.all([loadCart(), loadFavorites()]);
        }
        
        return response;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        dispatch({ 
          type: actionTypes.SHOW_TOAST, 
          payload: { type: 'error', message: error.message }
        });
        throw error;
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    },

    login: async (credentials) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await apiService.login(credentials);
        
        if (response.success) {
          dispatch({ type: actionTypes.SET_USER, payload: response.data.user });
          dispatch({ type: actionTypes.SET_AUTHENTICATED, payload: true });
          dispatch({ 
            type: actionTypes.SHOW_TOAST, 
            payload: { type: 'success', message: 'Login successful!' }
          });
          
          // Load user-specific data
          await Promise.all([loadCart(), loadFavorites()]);
        }
        
        return response;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        dispatch({ 
          type: actionTypes.SHOW_TOAST, 
          payload: { type: 'error', message: error.message }
        });
        throw error;
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    },
    
    logout: () => {
      apiService.logout();
      dispatch({ type: actionTypes.LOGOUT });
      dispatch({ 
        type: actionTypes.SHOW_TOAST, 
        payload: { type: 'success', message: 'Logged out successfully' }
      });
    },

    updateProfile: async (profileData) => {
      try {
        const response = await apiService.updateProfile(profileData);
        if (response.success) {
          dispatch({ type: actionTypes.SET_USER, payload: response.data });
          dispatch({ 
            type: actionTypes.SHOW_TOAST, 
            payload: { type: 'success', message: 'Profile updated successfully!' }
          });
        }
        return response;
      } catch (error) {
        dispatch({ 
          type: actionTypes.SHOW_TOAST, 
          payload: { type: 'error', message: error.message }
        });
        throw error;
      }
    },

    // Cart actions
    addToCart: async (furniture, quantity = 1) => {
      try {
        if (!state.isAuthenticated) {
          // For non-authenticated users, add to local state
          const cartItem = {
            id: `temp-${Date.now()}`,
            furniture,
            quantity,
            created_at: new Date().toISOString()
          };
          dispatch({ type: actionTypes.ADD_TO_CART, payload: cartItem });
          dispatch({ 
            type: actionTypes.SHOW_TOAST, 
            payload: { type: 'success', message: `${furniture.title} added to cart!` }
          });
          return;
        }

        const response = await apiService.addToCart(furniture.id, quantity);
        if (response.success) {
          await loadCart(); // Refresh cart from server
          dispatch({ 
            type: actionTypes.SHOW_TOAST, 
            payload: { type: 'success', message: `${furniture.title} added to cart!` }
          });
        }
      } catch (error) {
        dispatch({ 
          type: actionTypes.SHOW_TOAST, 
          payload: { type: 'error', message: error.message }
        });
      }
    },
    
    removeFromCart: async (cartItemId) => {
      try {
        if (!state.isAuthenticated) {
          dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: cartItemId });
          dispatch({ 
            type: actionTypes.SHOW_TOAST, 
            payload: { type: 'success', message: 'Item removed from cart' }
          });
          return;
        }

        const response = await apiService.removeFromCart(cartItemId);
        if (response.success) {
          dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: cartItemId });
          dispatch({ 
            type: actionTypes.SHOW_TOAST, 
            payload: { type: 'success', message: 'Item removed from cart' }
          });
        }
      } catch (error) {
        dispatch({ 
          type: actionTypes.SHOW_TOAST, 
          payload: { type: 'error', message: error.message }
        });
      }
    },
    
    updateCartQuantity: async (cartItemId, quantity) => {
      try {
        if (quantity <= 0) {
          return actions.removeFromCart(cartItemId);
        }

        if (!state.isAuthenticated) {
          dispatch({ 
            type: actionTypes.UPDATE_CART_QUANTITY, 
            payload: { id: cartItemId, quantity } 
          });
          return;
        }

        const response = await apiService.updateCartItem(cartItemId, quantity);
        if (response.success) {
          dispatch({ 
            type: actionTypes.UPDATE_CART_QUANTITY, 
            payload: { id: cartItemId, quantity } 
          });
        }
      } catch (error) {
        dispatch({ 
          type: actionTypes.SHOW_TOAST, 
          payload: { type: 'error', message: error.message }
        });
      }
    },
    
    clearCart: () => dispatch({ type: actionTypes.CLEAR_CART }),

    // Favorites actions
    addToFavorites: async (furniture) => {
      try {
        if (!state.isAuthenticated) {
          dispatch({ 
            type: actionTypes.SHOW_TOAST, 
            payload: { type: 'error', message: 'Please login to add favorites' }
          });
          return;
        }

        const response = await apiService.addToFavorites(furniture.id);
        if (response.success) {
          dispatch({ type: actionTypes.ADD_TO_FAVORITES, payload: response.data });
          dispatch({ 
            type: actionTypes.SHOW_TOAST, 
            payload: { type: 'success', message: `${furniture.title} added to favorites!` }
          });
        }
      } catch (error) {
        dispatch({ 
          type: actionTypes.SHOW_TOAST, 
          payload: { type: 'error', message: error.message }
        });
      }
    },

    removeFromFavorites: async (furnitureId) => {
      try {
        const response = await apiService.removeFromFavorites(furnitureId);
        if (response.success) {
          dispatch({ type: actionTypes.REMOVE_FROM_FAVORITES, payload: furnitureId });
          dispatch({ 
            type: actionTypes.SHOW_TOAST, 
            payload: { type: 'success', message: 'Removed from favorites' }
          });
        }
      } catch (error) {
        dispatch({ 
          type: actionTypes.SHOW_TOAST, 
          payload: { type: 'error', message: error.message }
        });
      }
    },

    // Utility actions
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    
    showToast: (toast) => {
      dispatch({ type: actionTypes.SHOW_TOAST, payload: toast });
      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        dispatch({ type: actionTypes.HIDE_TOAST });
      }, 5000);
    },
    
    hideToast: () => dispatch({ type: actionTypes.HIDE_TOAST })
  };

  // Computed values
  const cartItemsCount = state.cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = state.cart.reduce((total, item) => {
    const price = item.furniture?.price || 0;
    return total + (price * item.quantity);
  }, 0);

  const value = {
    ...state,
    ...actions,
    cartItemsCount,
    cartTotal,
    apiService // Expose API service for direct use in components
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
