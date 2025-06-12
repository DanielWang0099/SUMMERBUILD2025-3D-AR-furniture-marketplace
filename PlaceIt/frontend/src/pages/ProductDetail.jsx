import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import ThreeDViewer from '../components/3D/ThreeDViewer';
import ARViewer from '../components/AR/ARViewer';
import { 
  CubeIcon,
  EyeIcon,
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  ShareIcon,
  CameraIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const ProductDetail = () => {
  const { id } = useParams();  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isARActive, setIsARActive] = useState(false);
  const [show3D, setShow3D] = useState(false);

  // Mock product data - in real app this would come from API
  const product = {
    id: parseInt(id) || 1,
    name: "Modern Sectional Sofa",
    price: 1299,
    rating: 4.8,
    reviews: 156,
    seller: "Furniture Plus",
    description: "Experience ultimate comfort with this modern sectional sofa. Crafted with premium materials and designed for contemporary living spaces. The sleek design and plush cushioning make it perfect for both relaxation and entertaining.",
    features: [
      "Premium leather upholstery",
      "Solid hardwood frame",
      "High-density foam cushions",
      "Stain-resistant coating",
      "5-year warranty included"
    ],
    specifications: {
      dimensions: "84\" L × 36\" W × 32\" H",
      material: "Top-grain leather",
      color: "Charcoal Gray",
      weight: "180 lbs",
      assembly: "Minimal assembly required"
    },
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
      "https://images.unsplash.com/photo-1549497538-303791108f95?w=600",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600"
    ],
    has3D: true,
    hasAR: true,
    inStock: true,
    shipping: "Free shipping on orders over $1,000"
  };

  const tabs = [
    { id: 'description', name: 'Description' },
    { id: 'specifications', name: 'Specifications' },
    { id: 'reviews', name: 'Reviews' }
  ];

  const relatedProducts = [
    {
      id: 2,
      name: "Oak Coffee Table",
      price: 599,
      image: "https://images.unsplash.com/photo-1549497538-303791108f95?w=300",
      rating: 4.7
    },
    {
      id: 3,
      name: "Accent Chair",
      price: 799,
      image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300",
      rating: 4.9
    },
    {
      id: 4,
      name: "Floor Lamp",
      price: 299,
      image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300",
      rating: 4.6
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#b6cacb]/10 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Images and 3D/AR */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="aspect-square bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl overflow-hidden shadow-lg"
            >            {!isARActive ? (
              <>
                {show3D ? (
                  <ThreeDViewer 
                    modelUrl={`/models/${product.id}.glb`}
                    className="rounded-xl"
                  />
                ) : (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0c1825] to-[#2a5d93] flex items-center justify-center text-white">
                <div className="text-center">
                  <CameraIcon className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg">AR Camera Active</p>
                  <p className="text-sm opacity-60">Position furniture in your space</p>
                </div>
              </div>
            )}
            </motion.div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === index
                      ? 'border-[#29d4c5] shadow-lg'
                      : 'border-white/30 hover:border-[#29d4c5]/50'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* 3D/AR Controls */}            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShow3D(!show3D)}
                className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <CubeIcon className="h-5 w-5" />
                <span>{show3D ? 'Show Photos' : 'View in 3D'}</span>
              </button>
              <button
                onClick={() => setIsARActive(!isARActive)}
                className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/30 text-[#0c1825] py-3 px-4 rounded-lg hover:bg-[#29d4c5]/20 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <EyeIcon className="h-5 w-5" />
                <span>{isARActive ? 'Exit AR' : 'Try in AR'}</span>
              </button>
            </div>

            {/* Demo Video */}
            <div className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-4 shadow-lg">
              <div className="aspect-video bg-[#0c1825] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#2a5d93] transition-colors">
                <div className="text-center text-white">
                  <PlayIcon className="h-12 w-12 mx-auto mb-2" />
                  <p>Watch 360° Product Video</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-10 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-[#0c1825] mb-4">
                {product.name}
              </h1>

              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-[#29d4c5] fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-[#2a5d93]">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              <p className="text-4xl font-bold text-[#0c1825] mb-4">
                ${product.price.toLocaleString()}
              </p>

              <p className="text-[#2a5d93] mb-6">
                Sold by <span className="font-semibold">{product.seller}</span>
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.has3D && (
                  <span className="bg-[#29d4c5] text-white px-3 py-1 rounded-full text-sm font-semibold">
                    3D Model Available
                  </span>
                )}
                {product.hasAR && (
                  <span className="bg-[#209aaa] text-white px-3 py-1 rounded-full text-sm font-semibold">
                    AR Compatible
                  </span>
                )}
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  In Stock
                </span>
              </div>

              <p className="text-[#2a5d93] mb-6">{product.description}</p>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-4">
                  <label className="text-[#0c1825] font-medium">Quantity:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="border border-[#29d4c5]/30 rounded-lg px-3 py-2 bg-white/80 focus:ring-2 focus:ring-[#29d4c5] focus:border-transparent"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>                <div className="flex space-x-4">
                  <button 
                    onClick={() => addToCart({ ...product, quantity })}
                    className="flex-1 bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </button>
                  <button className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/30 text-[#0c1825] py-3 px-4 rounded-lg hover:bg-[#29d4c5]/20 transition-all duration-200">
                    <HeartIcon className="h-5 w-5" />
                  </button>
                  <button className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/30 text-[#0c1825] py-3 px-4 rounded-lg hover:bg-[#29d4c5]/20 transition-all duration-200">
                    <ShareIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-[#29d4c5] font-medium">{product.shipping}</p>
            </motion.div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl shadow-lg overflow-hidden">
            {/* Tab Headers */}
            <div className="border-b border-[#29d4c5]/20">
              <div className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-[#29d4c5] text-[#29d4c5]'
                        : 'border-transparent text-[#2a5d93] hover:text-[#29d4c5]'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'description' && (
                <div>
                  <h3 className="text-lg font-semibold text-[#0c1825] mb-4">Product Description</h3>
                  <p className="text-[#2a5d93] mb-6">{product.description}</p>
                  <h4 className="font-semibold text-[#0c1825] mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="text-[#2a5d93] flex items-center">
                        <span className="w-2 h-2 bg-[#29d4c5] rounded-full mr-3"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  <h3 className="text-lg font-semibold text-[#0c1825] mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-[#29d4c5]/10 py-2">
                        <span className="font-medium text-[#0c1825] capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-[#2a5d93]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-lg font-semibold text-[#0c1825] mb-4">Customer Reviews</h3>
                  <div className="space-y-6">
                    {/* Mock review */}
                    <div className="border-b border-[#29d4c5]/10 pb-6">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className="h-4 w-4 text-[#29d4c5] fill-current" />
                          ))}
                        </div>
                        <span className="ml-2 font-medium text-[#0c1825]">Sarah M.</span>
                        <span className="ml-2 text-sm text-[#2a5d93]">Verified Purchase</span>
                      </div>
                      <p className="text-[#2a5d93]">
                        "Absolutely love this sofa! The 3D model helped me visualize it perfectly in my living room. 
                        Quality is excellent and delivery was super fast."
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-[#0c1825] mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-[#0c1825] mb-2">{product.name}</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-[#29d4c5] fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-1 text-sm text-[#2a5d93]">{product.rating}</span>
                  </div>
                  <p className="text-lg font-bold text-[#0c1825]">${product.price.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}          </div>
        </div>
      </div>
      
      {/* AR Viewer Modal */}
      <ARViewer 
        isActive={isARActive}
        onClose={() => setIsARActive(false)}
        productName={product.name}
      />
    </div>
  );
};

export default ProductDetail;
