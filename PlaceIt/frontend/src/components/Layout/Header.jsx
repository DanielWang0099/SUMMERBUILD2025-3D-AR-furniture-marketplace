import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { cartItemsCount, user } = useApp();

  const navigation = [
    { name: 'Browse', href: '/browse' },
    { name: 'Sell', href: '/sell' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="relative bg-gradient-to-r from-[#0c1825] via-[#2a5d93] to-[#209aaa] shadow-lg">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/src/assets/placeit-logo-no-bg.png" 
                alt="PlaceIt!" 
                className="h-10 w-auto"
              />
              <span className="text-2xl font-bold text-white">PlaceIt!</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-white hover:text-[#29d4c5] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-white/10"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => navigate('/cart')}
              className="relative p-2 text-white hover:text-[#29d4c5] transition-colors duration-200"
            >              <ShoppingCartIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-[#29d4c5] text-[#0c1825] text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {cartItemsCount}
              </span>
            </button>            <button 
              onClick={() => navigate('/login')}
              className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              <UserIcon className="h-5 w-5" />
              <span>{user ? user.name : 'Login'}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-[#29d4c5] p-2"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/10 backdrop-blur-sm rounded-lg mt-2 border border-white/20">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-white hover:text-[#29d4c5] block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-white/20 pt-3 mt-3">
                <button 
                  onClick={() => navigate('/cart')}
                  className="flex items-center space-x-2 text-white hover:text-[#29d4c5] px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 w-full"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>Cart</span>
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="flex items-center space-x-2 text-white hover:text-[#29d4c5] px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 w-full"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Login</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
