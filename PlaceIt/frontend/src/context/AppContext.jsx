import { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  user: null,
  cart: [],
  isLoading: false,
  error: null,
  toast: null
};

// Action types
export const actionTypes = {
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_QUANTITY: 'UPDATE_CART_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
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

    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        cart: []
      };

    case actionTypes.ADD_TO_CART:
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: action.payload.quantity || 1 }]
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

  // Action creators
  const actions = {
    setUser: (user) => dispatch({ type: actionTypes.SET_USER, payload: user }),
    
    logout: () => dispatch({ type: actionTypes.LOGOUT }),
    
    addToCart: (product) => {
      dispatch({ type: actionTypes.ADD_TO_CART, payload: product });
      dispatch({ 
        type: actionTypes.SHOW_TOAST, 
        payload: { type: 'success', message: `${product.name} added to cart!` }
      });
    },
    
    removeFromCart: (productId) => {
      dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: productId });
      dispatch({ 
        type: actionTypes.SHOW_TOAST, 
        payload: { type: 'success', message: 'Item removed from cart' }
      });
    },
    
    updateCartQuantity: (productId, quantity) => {
      if (quantity <= 0) {
        actions.removeFromCart(productId);
        return;
      }
      dispatch({ 
        type: actionTypes.UPDATE_CART_QUANTITY, 
        payload: { id: productId, quantity } 
      });
    },
    
    clearCart: () => dispatch({ type: actionTypes.CLEAR_CART }),
    
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
  const cartTotal = state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const value = {
    ...state,
    ...actions,
    cartItemsCount,
    cartTotal
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
