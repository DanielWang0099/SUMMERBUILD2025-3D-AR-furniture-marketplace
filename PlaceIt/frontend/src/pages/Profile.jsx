import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, showToast } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zip: ''
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          country: user.address?.country || '',
          zip: user.address?.zip || ''
        }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast('Profile updated successfully!', 'success');
        setIsEditing(false);
        // Update user data in context if needed
        // updateUser(updatedUser);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        showToast('Password changed successfully!', 'success');
        setShowPasswordChange(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast(error.message || 'Failed to change password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Profile Settings
          </h1>
          <p className="text-[#b6cacb] text-lg">
            Manage your account information and preferences
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg h-fit"
          >
            <div className="text-center">              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-br from-[#29d4c5] to-[#209aaa] rounded-full flex items-center justify-center mb-4">
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-white mb-2">
                {user?.name || 'User'}
              </h2>
              <p className="text-[#b6cacb] text-sm mb-4">
                {user?.email}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2 text-[#b6cacb]">
                  <EnvelopeIcon className="h-4 w-4" />
                  <span>Email Verified</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center justify-center gap-2 text-[#b6cacb]">
                    <PhoneIcon className="h-4 w-4" />
                    <span>Phone Added</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 text-[#b6cacb]">
                  <MapPinIcon className="h-4 w-4" />
                  <span>Address {user?.address?.city ? 'Complete' : 'Incomplete'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Information */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-[#29d4c5] hover:text-white transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-[#29d4c5] hover:bg-[#209aaa] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent disabled:opacity-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-6">Address Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-white text-sm font-medium mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    name="address.zip"
                    value={formData.address.zip}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Security</h3>
                {!showPasswordChange && (
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="flex items-center gap-2 text-[#29d4c5] hover:text-white transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Change Password
                  </button>
                )}
              </div>

              {showPasswordChange ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b6cacb] hover:text-white"
                      >
                        {showPasswords.current ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b6cacb] hover:text-white"
                      >
                        {showPasswords.new ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-[#b6cacb] focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b6cacb] hover:text-white"
                      >
                        {showPasswords.confirm ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-[#29d4c5] hover:bg-[#209aaa] text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Update Password
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-[#b6cacb]">
                  <p>Keep your account secure by using a strong password.</p>
                  <p className="text-sm mt-2">
                    Last changed: {user?.password_updated_at ? new Date(user.password_updated_at).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
