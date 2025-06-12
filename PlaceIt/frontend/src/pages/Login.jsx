import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    userType: 'buyer'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login/register logic here
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
                <div>
                  <label htmlFor="confirm-password" className="sr-only">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-[#b6cacb]" />
                    </div>
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      required={!isLogin}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-white/30 placeholder-[#b6cacb] text-white rounded-lg bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                      placeholder="Confirm Password"
                    />
                  </div>
                </div>
              )}

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-[#b6cacb] mb-2">
                    I am a:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative">
                      <input
                        type="radio"
                        name="userType"
                        value="buyer"
                        checked={formData.userType === 'buyer'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-lg border cursor-pointer text-center transition-all duration-200 ${
                        formData.userType === 'buyer'
                          ? 'bg-[#29d4c5] border-[#29d4c5] text-white'
                          : 'bg-white/10 border-white/30 text-[#b6cacb] hover:bg-white/20'
                      }`}>
                        Buyer
                      </div>
                    </label>
                    <label className="relative">
                      <input
                        type="radio"
                        name="userType"
                        value="seller"
                        checked={formData.userType === 'seller'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-lg border cursor-pointer text-center transition-all duration-200 ${
                        formData.userType === 'seller'
                          ? 'bg-[#29d4c5] border-[#29d4c5] text-white'
                          : 'bg-white/10 border-white/30 text-[#b6cacb] hover:bg-white/20'
                      }`}>
                        Seller
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#29d4c5] focus:ring-[#29d4c5] border-white/30 rounded bg-white/10"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-[#b6cacb]">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-[#29d4c5] hover:text-[#209aaa] transition-colors duration-200"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#29d4c5] to-[#209aaa] hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#29d4c5] transition-all duration-200"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-[#b6cacb]">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium text-[#29d4c5] hover:text-[#209aaa] transition-colors duration-200"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Social Login Options */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-[#b6cacb]">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-white/30 rounded-lg shadow-sm bg-white/10 text-sm font-medium text-[#b6cacb] hover:bg-white/20 transition-all duration-200"
                >
                  Google
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-white/30 rounded-lg shadow-sm bg-white/10 text-sm font-medium text-[#b6cacb] hover:bg-white/20 transition-all duration-200"
                >
                  Facebook
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
