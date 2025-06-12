import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, showToast } = useApp();
  const [isUpdating, setIsUpdating] = useState({});

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setIsUpdating(prev => ({ ...prev, [cartItemId]: true }));
      await updateCartQuantity(cartItemId, newQuantity);
    } catch (error) {
      showToast('Failed to update quantity', 'error');
    } finally {
      setIsUpdating(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
      showToast('Item removed from cart', 'info');
    } catch (error) {
      showToast('Failed to remove item', 'error');
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (item.furniture.price * item.quantity), 0);
  const shipping = subtotal > 1000 ? 0 : 99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa]">
        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 shadow-lg max-w-md mx-auto"
          >
            <ShoppingBagIcon className="h-24 w-24 text-[#b6cacb] mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
            <p className="text-[#b6cacb] mb-8">
              Discover amazing furniture with 3D models and AR visualization
            </p>
            <Link
              to="/browse"
              className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-2"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              <span>Start Shopping</span>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Shopping Cart
          </h1>
          <p className="text-[#b6cacb] text-lg">
            {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => {
              const primaryImage = item.furniture.media_assets?.find(media => media.is_primary && media.type === 'image')?.url || 
                                   item.furniture.media_assets?.find(media => media.type === 'image')?.url ||
                                   'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400';
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <img 
                        src={primaryImage}
                        alt={item.furniture.title}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {item.furniture.title}
                          </h3>
                          <p className="text-[#b6cacb] text-sm mb-2">
                            {item.furniture.short_description}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-[#29d4c5] text-xl font-bold">
                              ${item.furniture.price}
                            </span>
                            {item.furniture.compare_at_price && item.furniture.compare_at_price > item.furniture.price && (
                              <span className="text-[#b6cacb] text-sm line-through">
                                ${item.furniture.compare_at_price}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-white/30 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating[item.id]}
                            className="p-2 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 text-white bg-white/10 min-w-[60px] text-center">
                            {isUpdating[item.id] ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isUpdating[item.id]}
                            className="p-2 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-white font-semibold">
                            ${(item.furniture.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg sticky top-4"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-[#b6cacb]">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-[#b6cacb]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                
                <div className="flex justify-between text-[#b6cacb]">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                {shipping === 0 && (
                  <div className="flex items-center gap-2 text-[#29d4c5] text-sm">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Free shipping applied!</span>
                  </div>
                )}
                
                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between text-white text-lg font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white py-4 px-6 rounded-lg font-semibold mt-6 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                <CreditCardIcon className="h-5 w-5" />
                Proceed to Checkout
              </button>
              
              <div className="mt-4 text-center">
                <Link
                  to="/browse"
                  className="text-[#29d4c5] hover:text-white transition-colors text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
              
              {subtotal < 1000 && (
                <div className="mt-4 p-3 bg-[#29d4c5]/20 rounded-lg">
                  <div className="flex items-center gap-2 text-[#29d4c5] text-sm">
                    <TruckIcon className="h-4 w-4" />
                    <span>Add ${(1000 - subtotal).toFixed(2)} more for free shipping</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
