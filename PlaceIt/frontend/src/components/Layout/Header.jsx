import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  UserIcon,
  HeartIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { cart, user, isAuthenticated, logout, showToast } = useApp();

  const cartItemsCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  const handleLogout = () => {
    logout();
    navigate('/');
    showToast({ type: 'success', message: 'Logged out successfully' });
  };

  const navigation = [
    { name: 'Browse', href: '/browse' },
    { name: 'Sell', href: '/sell' },
    { name: 'About', href: '/about' },
  ];

  const userMenuItems = [
    { name: 'Favorites', href: '/favorites', icon: HeartIcon },
    { name: 'Profile', href: '/profile', icon: Cog6ToothIcon },
    { name: 'Logout', action: handleLogout, icon: ArrowRightOnRectangleIcon },
  ];

  return (
    <header className="relative bg-gradient-to-r from-[#0c1825] via-[#2a5d93] to-[#209aaa] shadow-lg">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/src/assets/placeit-logo-no-bg.png" alt="PlaceIt!" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-white">PlaceIt!</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-[#2a5d93] hover:via-[#209aaa] hover:to-[#29d4c5] hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 text-white transition-all duration-200 hover:text-[#29d4c5]"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#29d4c5] text-[#0c1825] text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-[#2a5d93] hover:via-[#209aaa] hover:to-[#29d4c5]">
                  <UserIcon className="h-5 w-5" />
                  <span>{user?.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/20 py-2 opacity-0 invisible group-hover:visible group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-200 z-50">
                  {userMenuItems.map((item) =>
                    item.href ? (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center space-x-2 px-4 py-2 text-[#0c1825] transition-all duration-200 hover:bg-gradient-to-r hover:from-[#2a5d93] hover:via-[#209aaa] hover:to-[#29d4c5] hover:text-white"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    ) : (
                      <button
                        key={item.name}
                        onClick={item.action}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-[#0c1825] transition-all duration-200 hover:bg-red-200 hover:text-white"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-[#2a5d93] hover:via-[#209aaa] hover:to-[#29d4c5]"
              >
                <UserIcon className="h-5 w-5" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2 transition-all duration-200 hover:text-[#29d4c5]"
            >
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-white px-3 py-2 rounded-md text-base font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-[#2a5d93] hover:via-[#209aaa] hover:to-[#29d4c5]"
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-white/20 pt-3 mt-3">
                <button
                  onClick={() => {
                    navigate('/cart');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full text-white px-3 py-2 rounded-md text-base font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-[#2a5d93] hover:via-[#209aaa] hover:to-[#29d4c5]"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>Cart ({cartItemsCount})</span>
                </button>
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-[#b6cacb] text-sm font-medium">{user?.name}</div>
                    {userMenuItems.map((item) =>
                      item.href ? (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-2 text-white px-3 py-2 rounded-md text-base font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-[#2a5d93] hover:via-[#209aaa] hover:to-[#29d4c5]"
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      ) : (
                        <button
                          key={item.name}
                          onClick={() => {
                            item.action();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 w-full text-left text-white px-3 py-2 rounded-md text-base font-medium transition-all duration-200 hover:bg-red-400"
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </button>
                      )
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-white px-3 py-2 rounded-md text-base font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-[#2a5d93] hover:via-[#209aaa] hover:to-[#29d4c5]"
                  >
                    <UserIcon className="h-5 w-5" />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
