import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, cartTotal } = useApp();
  const cartItems = cart;

  const updateQuantity = (id, newQuantity) => {
    updateCartQuantity(id, newQuantity);
  };

  const removeItem = (id) => {
    removeFromCart(id);
  };

  const subtotal = cartTotal;
  const shipping = subtotal > 1000 ? 0 : 99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#b6cacb]/10 to-white">
        <section className="bg-gradient-to-r from-[#0c1825] via-[#2a5d93] to-[#209aaa] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Shopping Cart
              </h1>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-12 shadow-lg"
          >
            <ShoppingBagIcon className="h-24 w-24 text-[#b6cacb] mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-[#0c1825] mb-4">Your cart is empty</h2>
            <p className="text-[#2a5d93] mb-8">
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
    <div className="min-h-screen bg-gradient-to-br from-[#b6cacb]/10 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#0c1825] via-[#2a5d93] to-[#209aaa] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Shopping Cart
            </h1>
            <p className="text-xl text-[#b6cacb]">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <div className="space-y-6">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                    </div>

                    <div className="ml-6 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-[#0c1825]">{item.name}</h3>
                          <p className="text-sm text-[#2a5d93]">Sold by {item.seller}</p>
                          <div className="flex items-center mt-1 space-x-2">
                            {item.has3D && (
                              <span className="bg-[#29d4c5] text-white px-2 py-1 rounded text-xs font-semibold">
                                3D
                              </span>
                            )}
                            {item.hasAR && (
                              <span className="bg-[#209aaa] text-white px-2 py-1 rounded text-xs font-semibold">
                                AR
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#0c1825]">
                            ${item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-md bg-[#29d4c5]/20 hover:bg-[#29d4c5]/30 transition-colors"
                          >
                            <MinusIcon className="h-4 w-4 text-[#0c1825]" />
                          </button>
                          <span className="text-[#0c1825] font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-md bg-[#29d4c5]/20 hover:bg-[#29d4c5]/30 transition-colors"
                          >
                            <PlusIcon className="h-4 w-4 text-[#0c1825]" />
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-4">
                          <button className="text-[#2a5d93] hover:text-[#29d4c5] text-sm font-medium">
                            Save for later
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-8">
              <Link
                to="/browse"
                className="text-[#29d4c5] hover:text-[#209aaa] font-medium transition-colors duration-200"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 mt-16 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg sticky top-4"
            >
              <h2 className="text-xl font-bold text-[#0c1825] mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[#2a5d93]">Subtotal</span>
                  <span className="text-[#0c1825] font-medium">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2a5d93]">Shipping</span>
                  <span className="text-[#0c1825] font-medium">
                    {shipping === 0 ? 'Free' : `$${shipping}`}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-sm text-[#29d4c5]">
                    🎉 Free shipping on orders over $1,000!
                  </p>
                )}
                <div className="flex justify-between">
                  <span className="text-[#2a5d93]">Tax</span>
                  <span className="text-[#0c1825] font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#29d4c5]/20 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-[#0c1825]">Total</span>
                    <span className="text-lg font-bold text-[#0c1825]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <button className="w-full bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2">
                  <CreditCardIcon className="h-5 w-5" />
                  <span>Proceed to Checkout</span>
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-[#2a5d93]">
                    Secure checkout powered by Stripe
                  </p>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6 pt-6 border-t border-[#29d4c5]/20">
                <h3 className="text-sm font-medium text-[#0c1825] mb-3">Promo Code</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
                  />
                  <button className="bg-white/80 border border-[#29d4c5]/30 text-[#0c1825] px-4 py-3 rounded-lg hover:bg-[#29d4c5]/20 transition-colors">
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
