import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CloudArrowUpIcon,
  CubeIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const Sell = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUploadForm, setShowUploadForm] = useState(false);

  const listings = [
    {
      id: 1,
      name: "Modern Sectional Sofa",
      price: 1299,
      status: "active",
      views: 234,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
      has3D: true,
      dateAdded: "2025-06-10"
    },
    {
      id: 2,
      name: "Oak Dining Table",
      price: 899,
      status: "active",
      views: 156,
      image: "https://images.unsplash.com/photo-1549497538-303791108f95?w=400",
      has3D: true,
      dateAdded: "2025-06-08"
    },
    {
      id: 3,
      name: "Vintage Armchair",
      price: 599,
      status: "processing",
      views: 0,
      image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400",
      has3D: false,
      dateAdded: "2025-06-12"
    }
  ];

  const stats = [
    { label: "Total Listings", value: 12, icon: CubeIcon },
    { label: "Total Views", value: "2.4K", icon: EyeIcon },
    { label: "Sales This Month", value: 8, icon: ChartBarIcon },
    { label: "Revenue", value: "$12,450", icon: ChartBarIcon }
  ];

  const tabs = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'listings', name: 'My Listings' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'upload', name: 'Add New Item' }
  ];

  const UploadForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-8 shadow-lg"
    >
      <h3 className="text-2xl font-bold text-[#0c1825] mb-6">Add New Furniture Item</h3>
      
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#0c1825] mb-2">
              Item Name *
            </label>
            <input
              type="text"
              className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
              placeholder="e.g., Modern Sectional Sofa"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#0c1825] mb-2">
              Price *
            </label>
            <input
              type="number"
              className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0c1825] mb-2">
            Category *
          </label>
          <select className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80">
            <option>Select Category</option>
            <option>Sofas & Chairs</option>
            <option>Tables</option>
            <option>Beds & Mattresses</option>
            <option>Storage</option>
            <option>Lighting</option>
            <option>Decor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0c1825] mb-2">
            Description *
          </label>
          <textarea
            rows="4"
            className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
            placeholder="Describe your furniture item..."
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#0c1825] mb-2">
              Dimensions (L×W×H)
            </label>
            <input
              type="text"
              className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
              placeholder="e.g., 84×36×32 inches"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#0c1825] mb-2">
              Material
            </label>
            <input
              type="text"
              className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
              placeholder="e.g., Leather, Wood"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#0c1825] mb-2">
              Color
            </label>
            <input
              type="text"
              className="w-full p-3 border border-[#29d4c5]/30 rounded-lg focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent bg-white/80"
              placeholder="e.g., Brown, Black"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0c1825] mb-2">
            Upload Images *
          </label>
          <div className="border-2 border-dashed border-[#29d4c5]/30 rounded-lg p-8 text-center bg-white/40">
            <CloudArrowUpIcon className="h-12 w-12 text-[#29d4c5] mx-auto mb-4" />
            <p className="text-[#2a5d93] mb-2">Click to upload or drag and drop</p>
            <p className="text-sm text-[#2a5d93]/60">PNG, JPG up to 10MB each</p>
            <input type="file" multiple accept="image/*" className="hidden" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0c1825] mb-2">
            Upload Video for 3D Model Generation (Optional)
          </label>
          <div className="border-2 border-dashed border-[#209aaa]/30 rounded-lg p-8 text-center bg-white/40">
            <CubeIcon className="h-12 w-12 text-[#209aaa] mx-auto mb-4" />
            <p className="text-[#2a5d93] mb-2">Upload a 360° video of your furniture</p>
            <p className="text-sm text-[#2a5d93]/60">MP4, MOV up to 100MB. We'll generate a 3D model automatically!</p>
            <input type="file" accept="video/*" className="hidden" />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Publish Listing
          </button>
          <button
            type="button"
            className="bg-white/80 border border-[#29d4c5]/30 text-[#0c1825] px-8 py-3 rounded-lg hover:bg-[#29d4c5]/20 transition-colors"
          >
            Save as Draft
          </button>
        </div>
      </form>
    </motion.div>
  );

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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] p-3 rounded-lg">
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-[#2a5d93]">{stat.label}</p>
                      <p className="text-2xl font-bold text-[#0c1825]">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

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
                <button className="bg-white/80 border border-[#29d4c5]/30 text-[#0c1825] px-6 py-3 rounded-lg hover:bg-[#29d4c5]/20 transition-colors">
                  View Analytics
                </button>
                <button className="bg-white/80 border border-[#29d4c5]/30 text-[#0c1825] px-6 py-3 rounded-lg hover:bg-[#29d4c5]/20 transition-colors">
                  Manage Inventory
                </button>
              </div>
            </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl overflow-hidden shadow-lg"
                >
                  <div className="relative">
                    <img 
                      src={listing.image} 
                      alt={listing.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        listing.status === 'active' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-yellow-500 text-white'
                      }`}>
                        {listing.status}
                      </span>
                      {listing.has3D && (
                        <span className="bg-[#29d4c5] text-white px-2 py-1 rounded text-xs font-semibold">
                          3D
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-[#0c1825] mb-2">{listing.name}</h4>
                    <p className="text-2xl font-bold text-[#0c1825] mb-2">${listing.price.toLocaleString()}</p>
                    <p className="text-sm text-[#2a5d93] mb-4">{listing.views} views</p>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-white/80 border border-[#29d4c5]/30 text-[#0c1825] py-2 px-3 rounded-lg hover:bg-[#29d4c5]/20 transition-colors flex items-center justify-center space-x-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button className="flex-1 bg-white/80 border border-[#29d4c5]/30 text-[#0c1825] py-2 px-3 rounded-lg hover:bg-[#29d4c5]/20 transition-colors flex items-center justify-center space-x-1">
                        <PencilIcon className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button className="bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-colors">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && <UploadForm />}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-[#0c1825] mb-6">Analytics Dashboard</h3>
            <div className="text-center py-12">
              <ChartBarIcon className="h-16 w-16 text-[#29d4c5] mx-auto mb-4" />
              <p className="text-xl text-[#2a5d93]">Analytics Dashboard Coming Soon</p>
              <p className="text-[#2a5d93]/60">Track your sales, views, and performance metrics</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sell;
