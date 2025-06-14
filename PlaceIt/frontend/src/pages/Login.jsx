import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { isValidEmail, validatePassword, isValidPhone } from '../utils/validation';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  PhoneIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const Login = () => {
  const navigate = useNavigate();
  const { login, register, showToast } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zip: ''
    }
  });  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!formData.email || !isValidEmail(formData.email)) {
        showToast({ type: 'error', message: 'Please enter a valid email address' });
        return;
      }
      
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        showToast({ type: 'error', message: passwordValidation.message });
        return;
      }
      
      if (!isLogin) {
        // Additional register validations
        if (!formData.name.trim()) {
          showToast({ type: 'error', message: 'Please enter your full name' });
          return;
        }
        
        if (formData.password !== formData.confirmPassword) {
          showToast({ type: 'error', message: 'Passwords do not match' });
          return;
        }
        
        if (formData.phone && !isValidPhone(formData.phone)) {
          showToast({ type: 'error', message: 'Please enter a valid phone number or leave it empty' });
          return;
        }
      }
      
      setIsLoading(true);
      
      if (isLogin) {
        // Login
        const response = await login({
          email: formData.email,
          password: formData.password
        });
        
        if (response?.success) {
          showToast({ type: 'success', message: 'Login successful!' });
          navigate('/');
        } else {
          throw new Error(response?.message || 'Login failed');
        }
      } else {
        // Register
        const response = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          address: formData.address
        });
        
        if (response?.success) {
          showToast({ type: 'success', message: 'Registration successful!' });
          navigate('/');
        } else {
          throw new Error(response?.message || 'Registration failed');
        }
      }
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          <div className="text-center">
            <img 
              src="/src/assets/placeit-logo-no-bg.png" 
              alt="PlaceIt!" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back!' : 'Join PlaceIt!'}
            </h2>
            <p className="text-[#b6cacb]">
              {isLogin 
                ? 'Sign in to your account to continue' 
                : 'Create your account to start your furniture journey'
              }
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="sr-only">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-[#b6cacb]" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-white/30 placeholder-[#b6cacb] text-white rounded-lg bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                      placeholder="Full Name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-[#b6cacb]" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-white/30 placeholder-[#b6cacb] text-white rounded-lg bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-[#b6cacb]" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-white/30 placeholder-[#b6cacb] text-white rounded-lg bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                    placeholder="Password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#b6cacb] hover:text-white"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="confirmPassword" className="sr-only">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-[#b6cacb]" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required={!isLogin}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-white/30 placeholder-[#b6cacb] text-white rounded-lg bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                        placeholder="Confirm Password"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-[#b6cacb] hover:text-white"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="sr-only">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-[#b6cacb]" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-white/30 placeholder-[#b6cacb] text-white rounded-lg bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                        placeholder="Phone Number (Optional)"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#209aaa] to-[#29d4c5] hover:from-[#29d4c5] hover:to-[#209aaa] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#29d4c5] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);                  
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    name: '',
                    phone: '',
                    address: {
                      street: '',
                      city: '',
                      state: '',
                      country: '',
                      zip: ''
                    }
                  });
                }}
                className="text-[#29d4c5] hover:text-white transition-colors"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
