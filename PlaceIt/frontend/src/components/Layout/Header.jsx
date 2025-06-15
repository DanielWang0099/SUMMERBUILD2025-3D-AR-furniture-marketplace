import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ShoppingCartIcon, 
  UserIcon,
  HeartIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { cart, user, isAuthenticated, logout } = useApp();

  const cartItemsCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };
  const navigation = [
    { name: 'Browse', href: '/browse' },
    ...(user?.role === 'vendor' ? [{ name: 'Dashboard', href: '/vendor-dashboard' }] : []),
    { name: 'Sell', href: '/sell' },
    { name: 'About', href: '/about' },
  ];

  const userMenuItems = [
    ...(user?.role === 'vendor' ? [
      { name: 'Dashboard', href: '/vendor-dashboard', icon: ChartBarIcon },
      { name: 'Add Product', href: '/vendor/product/new', icon: PlusIcon },
    ] : []),
    { name: 'Favorites', href: '/favorites', icon: HeartIcon },
    { name: 'Profile', href: '/profile', icon: Cog6ToothIcon },
    { name: 'Logout', action: handleLogout, icon: ArrowRightOnRectangleIcon },
  ];

  return (
    <header className="relative bg-gradient-to-r from-[#0c1825] via-[#2a5d93] to-[#209aaa] shadow-lg">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
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
          <nav className="hidden md:flex space-x-6 ml-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-white hover:text-[#29d4c5] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-white/10"
              >
                {item.name}
              </Link>
            ))}
          </nav>    {/* Spacer pushes cart/login to the right */}
          <div className="flex-1"></div>
                    {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-12">
            {/* Cart Button */}
            <button 
              onClick={() => navigate('/cart')}
              className="relative p-2 text-white hover:text-[#29d4c5] transition-colors duration-200"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#29d4c5] text-[#0c1825] text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>{user?.name}</span>
                  {user?.role === 'vendor' && (
                    <span className="bg-[#29d4c5] text-[#0c1825] text-xs px-2 py-1 rounded-full font-semibold">
                      Vendor
                    </span>
                  )}
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 py-2 z-50">
                    {userMenuItems.map((item) => (
                      item.href ? (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-[#0c1825] hover:bg-[#29d4c5]/20 transition-colors"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      ) : (
                        <button
                          key={item.name}
                          onClick={item.action}
                          className="flex items-center space-x-2 px-4 py-2 text-[#0c1825] hover:bg-red-100 transition-colors w-full text-left"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </button>
                      )
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                <UserIcon className="h-5 w-5" />
                <span>Login</span>
              </Link>
            )}
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
        </div>        {/* Mobile Navigation */}
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
                {/* Cart */}
                <button 
                  onClick={() => {
                    navigate('/cart');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-white hover:text-[#29d4c5] px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 w-full"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>Cart ({cartItemsCount})</span>
                </button>

                {/* User Menu Items */}
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-[#b6cacb] text-sm font-medium">
                      {user?.name} {user?.role === 'vendor' && '(Vendor)'}
                    </div>
                    {userMenuItems.map((item) => (
                      item.href ? (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-2 text-white hover:text-[#29d4c5] px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
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
                          className="flex items-center space-x-2 text-white hover:text-red-400 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 w-full text-left"
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </button>
                      )
                    ))}
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-white hover:text-[#29d4c5] px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
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
