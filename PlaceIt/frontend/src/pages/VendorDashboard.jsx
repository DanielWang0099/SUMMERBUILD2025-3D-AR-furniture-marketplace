import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import apiService from '../services/api';
import {
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const VendorDashboard = () => {
  const { user, showToast } = useApp();
  const [furniture, setFurniture] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [furnitureResponse, analyticsResponse] = await Promise.all([
          apiService.getVendorFurniture(),
          apiService.getVendorAnalytics()
        ]);
        
        setFurniture(furnitureResponse.data || []);
        setAnalytics(analyticsResponse.data || {});
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [showToast]);

  const handleDeleteFurniture = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await apiService.deleteFurniture(id);
      setFurniture(furniture.filter(item => item.id !== id));
      showToast('Item deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete item', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'draft': return 'text-yellow-400';
      case 'archived': return 'text-gray-400';
      case 'out_of_stock': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircleIcon;
      case 'draft': return ClockIcon;
      case 'archived': return XCircleIcon;
      case 'out_of_stock': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#29d4c5] mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'products', name: 'My Products', icon: CubeIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Vendor Dashboard</h1>
          <p className="text-[#b6cacb]">Welcome back, {user?.name}!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#b6cacb] text-sm">Total Products</p>
                <p className="text-2xl font-bold text-white">{furniture.length}</p>
              </div>
              <CubeIcon className="h-8 w-8 text-[#29d4c5]" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#b6cacb] text-sm">Total Views</p>
                <p className="text-2xl font-bold text-white">{analytics?.total_views || 0}</p>
              </div>
              <EyeIcon className="h-8 w-8 text-[#29d4c5]" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#b6cacb] text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white">${analytics?.total_revenue || 0}</p>
              </div>
              <ShoppingCartIcon className="h-8 w-8 text-[#29d4c5]" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#b6cacb] text-sm">Avg. Rating</p>
                <p className="text-2xl font-bold text-white">{analytics?.average_rating?.toFixed(1) || '0.0'}</p>
              </div>
              <StarIcon className="h-8 w-8 text-[#29d4c5]" />
            </div>
          </motion.div>
        </div>        {/* Add Product Button */}
        <div className="mb-6">
          <Link
            to="/vendor/product/new"
            className="inline-flex items-center gap-2 bg-[#29d4c5] hover:bg-[#209aaa] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add New Product
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/20 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#29d4c5] text-[#29d4c5]'
                    : 'border-transparent text-[#b6cacb] hover:text-white hover:border-white/30'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {furniture.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.media_assets?.find(m => m.is_primary)?.url || 'https://via.placeholder.com/50'}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-[#b6cacb] text-sm">{item.view_count || 0} views</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {React.createElement(getStatusIcon(item.status), {
                        className: `h-4 w-4 ${getStatusColor(item.status)}`
                      })}
                      <span className={`text-sm ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Top Performing Products</h3>
                <div className="space-y-3">
                  {furniture
                    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
                    .slice(0, 3)
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.media_assets?.find(m => m.is_primary)?.url || 'https://via.placeholder.com/40'}
                            alt={item.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="text-white text-sm">{item.title}</span>
                        </div>
                        <span className="text-[#29d4c5] text-sm">{item.view_count || 0} views</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Status Breakdown</h3>
                <div className="space-y-3">
                  {['active', 'draft', 'archived', 'out_of_stock'].map((status) => {
                    const count = furniture.filter(item => item.status === status).length;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {React.createElement(getStatusIcon(status), {
                            className: `h-4 w-4 ${getStatusColor(status)}`
                          })}
                          <span className="text-white text-sm capitalize">{status.replace('_', ' ')}</span>
                        </div>
                        <span className="text-[#b6cacb] text-sm">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            {furniture.length === 0 ? (
              <div className="text-center py-16">
                <CubeIcon className="h-16 w-16 text-[#b6cacb] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No products yet</h3>
                <p className="text-[#b6cacb] mb-6">Start by adding your first product to the marketplace</p>
                <Link
                  to="/vendor/add-product"
                  className="inline-flex items-center gap-2 bg-[#29d4c5] hover:bg-[#209aaa] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Your First Product
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {furniture.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden"
                  >
                    <div className="aspect-video relative">
                      <img
                        src={item.media_assets?.find(m => m.is_primary)?.url || 'https://via.placeholder.com/300x200'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {item.has_3d_model && (
                          <span className="bg-[#29d4c5] text-white text-xs px-2 py-1 rounded-full">3D</span>
                        )}
                        {item.has_ar_support && (
                          <span className="bg-[#209aaa] text-white text-xs px-2 py-1 rounded-full">AR</span>
                        )}
                      </div>
                      <div className="absolute top-2 left-2">
                        <div className="flex items-center gap-1">
                          {React.createElement(getStatusIcon(item.status), {
                            className: `h-4 w-4 ${getStatusColor(item.status)}`
                          })}
                          <span className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-[#29d4c5] text-xl font-bold mb-3">${item.price}</p>
                      
                      <div className="flex items-center justify-between text-sm text-[#b6cacb] mb-4">
                        <span>{item.view_count || 0} views</span>
                        <span>{item.review_count || 0} reviews</span>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/product/${item.id}`}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg text-center transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mx-auto" />
                        </Link>
                        <Link
                          to={`/vendor/product/edit/${item.id}`}
                          className="flex-1 bg-[#29d4c5] hover:bg-[#209aaa] text-white py-2 px-3 rounded-lg text-center transition-colors"
                        >
                          <PencilIcon className="h-4 w-4 mx-auto" />
                        </Link>
                        <button
                          onClick={() => handleDeleteFurniture(item.id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-4 w-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Analytics Coming Soon</h3>
              <p className="text-[#b6cacb]">
                Detailed analytics including revenue trends, customer demographics, and product performance metrics will be available soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
