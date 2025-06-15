import { useState, useEffect, useContext, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CloudArrowUpIcon,
  CubeIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ShoppingCartIcon,
  HeartIcon,
  CameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/api';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import UploadItemForm from '../pages/UploadItemForm'; // Import the new component

const Sell = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  // Removed local toast state and setToast setter as it will be managed globally
  // const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category_id: '',
    description: '',
    short_description: '',
    dimensions: { height: '', width: '', depth: '', unit: 'inches' },
    materials: [],
    colors: [],
    features: [],
    inventory_count: 1,
    status: 'draft'
  });
  const [uploadFiles, setUploadFiles] = useState({
    images: [],
    video: null
  });
  const [recommendations, setRecommendations] = useState(null);

  // Destructure showToast from useApp() context
  const { user, showToast } = useApp();

  // Removed local showToast definition as it will come from context
  // const showToast = useCallback((options) => {
  //   setToast({ message: options.message, type: options.type || 'info' });
  //   setTimeout(() => setToast(null), 5000);
  // }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchCategories();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'listings') {
      fetchListings();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
    // Also fetch recommendations when dashboard is active or component mounts
    if (activeTab === 'dashboard') {
        fetchRecommendations();
    }
  }, [activeTab]);


  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getVendorStats();
      if (response.success) {
        setDashboardStats(response.data.stats);
      }
    } catch (error) {
      showToast({ message: 'Failed to load dashboard data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (options = {}) => { // Added options to allow period selection
    const { period = '30' } = options; // Default to 30 days
    try {
      setLoading(true);
      const response = await apiService.getVendorDetailedAnalytics(period); // Pass period to API service
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      showToast({ message: 'Failed to load analytics', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getVendorFurniture();
      if (response.success) {
        setListings(response.data);
      }
    } catch (error) {
      showToast({ message: 'Failed to load listings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await apiService.getVendorRecommendations();
      if (response.success) {
        setRecommendations(response.data);
      }
    } catch (error) {
      console.error('Failed to load recommendations');
    }
  };

  const handleInputChange = useCallback((field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  }, []);

  const handleArrayInputChange = useCallback((field, value) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: arrayValue
    }));
  }, []);

  const handleFileUpload = useCallback((type, files) => {
    setUploadFiles(prev => ({
      ...prev,
      [type]: type === 'images' ? Array.from(files) : files[0]
    }));
  }, []);

  const submitListing = useCallback(async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // First create the furniture listing
      const furnitureResponse = await apiService.createFurniture(formData);
      if (!furnitureResponse.success) {
        throw new Error(furnitureResponse.message);
      }

      const furnitureId = furnitureResponse.data.id;

      // Upload images
      if (uploadFiles.images.length > 0) {
        for (const image of uploadFiles.images) {
          await apiService.uploadMedia(image, furnitureId, 'image');
        }
      }

      // Upload video for 3D generation
      if (uploadFiles.video) {
        const videoResponse = await apiService.uploadMedia(uploadFiles.video, furnitureId, 'video');
        if (videoResponse.success) {
          // Trigger 3D model generation
          await apiService.generate3DModel(furnitureId, videoResponse.data.url);
        }
      }

      showToast({ message: 'Listing created successfully!', type: 'success' });

      // Introduce a slight delay before clearing the form and refreshing data
      // This allows the toast to be visible for a moment before other UI changes.
      setTimeout(() => {
        // Reset form
        setFormData({
          title: '',
          price: '',
          category_id: '',
          description: '',
          short_description: '',
          dimensions: { height: '', width: '', depth: '', unit: 'inches' },
          materials: [],
          colors: [],
          features: [],
          inventory_count: 1,
          status: 'draft'
        });
        setUploadFiles({ images: [], video: null });

        // Refresh data
        fetchDashboardData();
      }, 500); // 500 milliseconds delay

    } catch (error) {
      showToast({ message: error.message || 'Failed to create listing', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [formData, uploadFiles, showToast, fetchDashboardData]);

  const deleteListing = async (id) => {
    // Replaced window.confirm with a modal or custom UI for better user experience
    // For this example, I'm just showing a simplified console log.
    // In a real app, you would implement a custom confirmation modal.
    console.log('Would normally show a confirmation modal here for deleting listing:', id);

    try {
      setLoading(true);
      const response = await apiService.deleteFurniture(id);
      if (response.success) {
        showToast({ message: 'Listing deleted successfully', type: 'success' });
        fetchListings();
        fetchDashboardData();
      } else {
        showToast({ message: response.message || 'Failed to delete listing', type: 'error' });
      }
    } catch (error) {
      showToast({ message: 'Failed to delete listing', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'listings', name: 'My Listings' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'upload', name: 'Add New Item' }
  ];

  const getStatsData = () => {
    if (!dashboardStats) return [];
    return [
      {
        label: "Total Listings",
        value: formatNumber(dashboardStats.totalListings),
        icon: CubeIcon,
        change: "+12%",
        isPositive: true
      },
      {
        label: "Total Views",
        value: formatNumber(dashboardStats.totalViews),
        icon: EyeIcon,
        change: "+23%",
        isPositive: true
      },
      {
        label: "Sales This Month",
        value: formatNumber(dashboardStats.salesThisMonth),
        icon: ShoppingCartIcon,
        change: "+8%",
        isPositive: true
      },
      {
        label: "Revenue",
        value: formatCurrency(dashboardStats.revenue),
        icon: ChartBarIcon,
        change: "+15%",
        isPositive: true
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#b6cacb]/10 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#0c1825] via-[#2a5d93] to-[#209aaa] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Seller Dashboard
            </h1>
            <p className="text-xl text-[#b6cacb] max-w-2xl mx-auto">
              Manage your furniture listings and grow your business with 3D technology
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-2 mb-8 shadow-lg">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white shadow-lg'
                    : 'text-[#2a5d93] hover:bg-[#29d4c5]/20'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {getStatsData().map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] p-3 rounded-lg">
                            <stat.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-[#2a5d93]">{stat.label}</p>
                            <p className="text-2xl font-bold text-[#0c1825]">{stat.value}</p>
                          </div>
                        </div>
                        <div className={`flex items-center text-sm ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          <ArrowTrendingUpIcon className={`h-4 w-4 mr-1 ${stat.isPositive ? '' : 'rotate-180'}`} />
                          {stat.change}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Additional KPI Cards */}
                {dashboardStats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg"
                    >
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-[#209aaa] to-[#2a5d93] p-3 rounded-lg">
                          <CheckCircleIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-[#2a5d93]">Active Listings</p>
                          <p className="text-2xl font-bold text-[#0c1825]">{formatNumber(dashboardStats.activeListings)}</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg"
                    >
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] p-3 rounded-lg">
                          <ClockIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-[#2a5d93]">Pending 3D Models</p>
                          <p className="text-2xl font-bold text-[#0c1825]">{formatNumber(dashboardStats.pending3DModels)}</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg"
                    >
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-[#2a5d93] to-[#0c1825] p-3 rounded-lg">
                          <EyeIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-[#2a5d93]">Views (30 days)</p>
                          <p className="text-2xl font-bold text-[#0c1825]">{formatNumber(dashboardStats.viewsLast30Days)}</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                      className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg"
                    >
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-[#29d4c5] to-[#2a5d93] p-3 rounded-lg">
                          <ChartBarIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-[#2a5d93]">Conversion Rate</p>
                          <p className="text-2xl font-bold text-[#0c1825]">{dashboardStats.conversionRate}%</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-[#0c1825] mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                    >
                      <PlusIcon className="h-5 w-5" />
                      <span>Add New Item</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="bg-white/80 border border-[#29d4c5]/30 text-[#0c1825] px-6 py-3 rounded-lg hover:bg-[#29d4c5]/20 transition-colors flex items-center space-x-2"
                    >
                      <ChartBarIcon className="h-5 w-5" />
                      <span>View Analytics</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('listings')}
                      className="bg-white/80 border border-[#29d4c5]/30 text-[#0c1825] px-6 py-3 rounded-lg hover:bg-[#29d4c5]/20 transition-colors flex items-center space-x-2"
                    >
                      <CubeIcon className="h-5 w-5" />
                      <span>Manage Inventory</span>
                    </button>
                  </div>
                </div>

                {/* Recommendations Section */}
                {recommendations && (
                  <div className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-[#0c1825] mb-4">Recommendations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-[#2a5d93] mb-3">Trending Categories</h4>
                        <div className="space-y-2">
                          {recommendations.trendingCategories.slice(0, 3).map((category, index) => (
                            <div key={`${category.category_id}-${index}`} className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                              <span className="text-[#0c1825]">{category.name}</span>
                              <span className="text-sm text-[#29d4c5] font-semibold">{formatNumber(category.totalViews)} views</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-[#2a5d93] mb-3">Optimization Tips</h4>
                        <div className="space-y-2">
                          {recommendations.recommendations.slice(0, 3).map((tip, index) => (
                            <div key={index} className="flex items-start p-2 bg-white/50 rounded-lg">
                              <CheckCircleIcon className="h-5 w-5 text-[#29d4c5] mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-[#0c1825]">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-[#0c1825]">My Listings</h3>
              <button
                onClick={() => setActiveTab('upload')}
                className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add New</span>
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-12 text-center shadow-lg">
                <CubeIcon className="h-16 w-16 text-[#29d4c5] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#0c1825] mb-2">No Listings Yet</h3>
                <p className="text-[#2a5d93] mb-6">Start selling by adding your first furniture item.</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Your First Item</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative">
                      {listing.media_assets && listing.media_assets.length > 0 ? (
                        <img
                          src={listing.media_assets[0].url}
                          alt={listing.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-[#b6cacb]/20 to-[#29d4c5]/20 flex items-center justify-center">
                          <CubeIcon className="h-12 w-12 text-[#2a5d93]" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                          listing.status === 'active'
                            ? 'bg-green-500 text-white'
                            : listing.status === 'draft'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}>
                          {listing.status}
                        </span>
                        {listing.has_3d_model && (
                          <span className="bg-[#29d4c5] text-white px-2 py-1 rounded text-xs font-semibold">
                            3D
                          </span>
                        )}
                        {listing.has_ar_support && (
                          <span className="bg-[#209aaa] text-white px-2 py-1 rounded text-xs font-semibold">
                            AR
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="bg-black/50 text-white px-2 py-1 rounded text-xs">
                          #{listing.inventory_count} in stock
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-[#0c1825] mb-2 line-clamp-2">{listing.title}</h4>
                      <p className="text-2xl font-bold text-[#0c1825] mb-2">{formatCurrency(listing.price)}</p>
                      <div className="flex items-center space-x-4 text-sm text-[#2a5d93] mb-4">
                        <span className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {formatNumber(listing.view_count || 0)} views
                        </span>
                        <span className="flex items-center">
                          <HeartIcon className="h-4 w-4 mr-1" />
                          {formatNumber(listing.favorites_count || 0)}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <button className="flex-1 bg-white/80 border border-[#29d4c5]/30 text-[#0c1825] py-2 px-3 rounded-lg hover:bg-[#29d4c5]/20 transition-colors flex items-center justify-center space-x-1">
                          <EyeIcon className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        <button className="flex-1 bg-white/80 border border-[#29d4c5]/30 text-[#0c1825] py-2 px-3 rounded-lg hover:bg-[#29d4c5]/20 transition-colors flex items-center justify-center space-x-1">
                          <PencilIcon className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => deleteListing(listing.id)}
                          className="bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <UploadItemForm
            formData={formData}
            setFormData={setFormData}
            uploadFiles={uploadFiles}
            handleInputChange={handleInputChange}
            handleArrayInputChange={handleArrayInputChange}
            handleFileUpload={handleFileUpload}
            submitListing={submitListing}
            loading={loading}
            categories={categories} // Pass categories as a prop
          />
        )}
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-[#0c1825]">Analytics Dashboard</h3>
              <select
                onChange={(e) => fetchAnalytics({ period: e.target.value })}
                className="px-4 py-2 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
              >
                <option value="30">Last 30 days</option>
                <option value="7">Last 7 days</option>
                <option value="90">Last 3 months</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : analytics ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] p-3 rounded-lg">
                        <ChartBarIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-[#2a5d93]">Total Revenue</p>
                        <p className="text-2xl font-bold text-[#0c1825]">{formatCurrency(analytics.summary.totalRevenue)}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-[#209aaa] to-[#2a5d93] p-3 rounded-lg">
                        <ShoppingCartIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-[#2a5d93]">Total Orders</p>
                        <p className="text-2xl font-bold text-[#0c1825]">{formatNumber(analytics.summary.totalOrders)}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-[#2a5d93] to-[#0c1825] p-3 rounded-lg">
                        <HeartIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-[#2a5d93]">Avg Order Value</p>
                        <p className="text-2xl font-bold text-[#0c1825]">{formatCurrency(analytics.summary.avgOrderValue)}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-[#29d4c5] to-[#2a5d93] p-3 rounded-lg">
                        <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-[#2a5d93]">Conversion Rate</p>
                        <p className="text-2xl font-bold text-[#0c1825]">{analytics.summary.conversionRate}%</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Revenue Chart */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg"
                  >
                    <h4 className="text-lg font-bold text-[#0c1825] mb-4">Daily Revenue</h4>
                    <div className="space-y-3">
                      {analytics.charts.revenueByDay.slice(-7).map((day, index) => (
                        <div key={day.date} className="flex items-center">
                          <div className="w-20 text-sm text-[#2a5d93]">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex-1 mx-4">
                            <div className="bg-[#b6cacb]/20 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(100, (day.revenue / Math.max(...analytics.charts.revenueByDay.map(d => d.revenue))) * 100)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-20 text-right text-sm font-semibold text-[#0c1825]">
                            {formatCurrency(day.revenue)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Orders Chart */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg"
                  >
                    <h4 className="text-lg font-bold text-[#0c1825] mb-4">Daily Orders</h4>
                    <div className="space-y-3">
                      {analytics.charts.ordersByDay.slice(-7).map((day, index) => (
                        <div key={day.date} className="flex items-center">
                          <div className="w-20 text-sm text-[#2a5d93]">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex-1 mx-4">
                            <div className="bg-[#b6cacb]/20 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-[#209aaa] to-[#2a5d93] h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(100, (day.orders / Math.max(...analytics.charts.ordersByDay.map(d => d.orders))) * 100)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-20 text-right text-sm font-semibold text-[#0c1825]">
                            {formatNumber(day.orders)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Product Performance */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg"
                >
                  <h4 className="text-lg font-bold text-[#0c1825] mb-4">Top Performing Products</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#29d4c5]/20">
                          <th className="text-left py-3 px-4 font-medium text-[#2a5d93]">Product</th>
                          <th className="text-right py-3 px-4 font-medium text-[#2a5d93]">Views</th>
                          <th className="text-right py-3 px-4 font-medium text-[#2a5d93]">Sales</th>
                          <th className="text-right py-3 px-4 font-medium text-[#2a5d93]">Revenue</th>
                          <th className="text-right py-3 px-4 font-medium text-[#2a5d93]">Conversion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.productPerformance.slice(0, 5).map((product, index) => (
                          <tr key={product.id} className="border-b border-[#29d4c5]/10 hover:bg-[#29d4c5]/5">
                            <td className="py-3 px-4">
                              <div className="font-medium text-[#0c1825]">{product.title}</div>
                              <div className="text-sm text-[#2a5d93]">{formatCurrency(product.price)}</div>
                            </td>
                            <td className="text-right py-3 px-4 text-[#0c1825]">{formatNumber(product.views)}</td>
                            <td className="text-right py-3 px-4 text-[#0c1825]">{formatNumber(product.sales)}</td>
                            <td className="text-right py-3 px-4 font-semibold text-[#0c1825]">{formatCurrency(product.revenue)}</td>
                            <td className="text-right py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                product.conversionRate > 5
                                  ? 'bg-green-100 text-green-800'
                                  : product.conversionRate > 2
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.conversionRate.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {/* Engagement Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg text-center"
                  >
                    <div className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <HeartIcon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-[#0c1825] mb-2">Total Favorites</h4>
                    <p className="text-3xl font-bold text-[#29d4c5]">{formatNumber(analytics.summary.totalFavorites)}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg text-center"
                  >
                    <div className="bg-gradient-to-r from-[#209aaa] to-[#2a5d93] p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <ShoppingCartIcon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-[#0c1825] mb-2">Cart Additions</h4>
                    <p className="text-3xl font-bold text-[#209aaa]">{formatNumber(analytics.summary.totalCartAdds)}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg text-center"
                  >
                    <div className="bg-gradient-to-r from-[#2a5d93] to-[#0c1825] p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <CameraIcon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-[#0c1825] mb-2">AR Views</h4>
                    <p className="text-3xl font-bold text-[#2a5d93]">{formatNumber(analytics.summary.totalArViews)}</p>
                  </motion.div>
                </div>
              </>
            ) : (
              <div className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-8 shadow-lg">
                <div className="text-center py-12">
                  <ChartBarIcon className="h-16 w-16 text-[#29d4c5] mx-auto mb-4" />
                  <p className="text-xl text-[#2a5d93]">No Analytics Data Available</p>
                  <p className="text-[#2a5d93]/60">Start selling to see your performance metrics</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Toast Notification - Removed from here, assuming it's in a higher-level component */}
      {/* {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )} */}
    </div>
  );
};

export default Sell;
