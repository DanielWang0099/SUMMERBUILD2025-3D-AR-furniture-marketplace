import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CubeIcon, 
  CameraIcon, 
  ShoppingBagIcon, 
  StarIcon,
  PlayIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const [playingVideo, setPlayingVideo] = useState(false);

  const features = [
    {
      icon: CubeIcon,
      title: "3D Model Generation",
      description: "Upload a video of your furniture and we'll automatically generate a photorealistic 3D model for buyers to explore."
    },
    {
      icon: CameraIcon,
      title: "Augmented Reality",
      description: "Let customers visualize furniture in their actual space using their device's camera for a try-before-you-buy experience."
    },
    {
      icon: ShoppingBagIcon,
      title: "Smart Marketplace",
      description: "Advanced filtering, search, and discovery tools help customers find exactly what they're looking for."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Furniture Store Owner",
      content: "PlaceIt! increased my online sales by 300%. Customers love seeing furniture in their homes before buying.",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Home Buyer",
      content: "Finally found the perfect sofa! The AR feature saved me from buying something that wouldn't fit my space.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Interior Designer",
      content: "I recommend PlaceIt! to all my clients. It makes furniture selection so much more confident and fun.",
      rating: 5
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa]">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Furniture Shopping
              <span className="block text-[#29d4c5]">Reimagined</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#b6cacb] mb-8 max-w-3xl mx-auto">
              Experience the future of furniture shopping with 3D models and augmented reality. 
              See how furniture looks in your space before you buy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/browse"
                className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                <span>Start Shopping</span>
              </Link>
              <Link 
                to="/sell"
                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/30 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <CubeIcon className="h-6 w-6" />
                <span>Start Selling</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0c1825] mb-4">
              Revolutionary Features
            </h2>
            <p className="text-xl text-[#2a5d93] max-w-2xl mx-auto">
              Cutting-edge technology meets intuitive design to transform how you buy and sell furniture.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#0c1825] mb-4">{feature.title}</h3>
                <p className="text-[#2a5d93]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gradient-to-r from-[#209aaa] via-[#29d4c5] to-[#209aaa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Watch how PlaceIt! transforms a simple video into an immersive 3D shopping experience.
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30">
              <div className="aspect-video bg-[#0c1825] rounded-lg flex items-center justify-center">
                {!playingVideo ? (
                  <button 
                    onClick={() => setPlayingVideo(true)}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-6 hover:bg-white/30 transition-all duration-200 hover:scale-110"
                  >
                    <PlayIcon className="h-12 w-12 text-white" />
                  </button>
                ) : (
                  <div className="text-white text-center">
                    <p className="text-lg">Demo video would play here</p>
                    <p className="text-sm text-white/60 mt-2">Showing 3D model generation and AR features</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0c1825] mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-[#2a5d93] max-w-2xl mx-auto">
              Join thousands of satisfied customers and sellers who've transformed their furniture experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-8 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-[#29d4c5] fill-current" />
                  ))}
                </div>
                <p className="text-[#0c1825] mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-[#0c1825]">{testimonial.name}</p>
                  <p className="text-[#2a5d93] text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#0c1825] via-[#2a5d93] to-[#209aaa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your
              <span className="block text-[#29d4c5]">Furniture Experience?</span>
            </h2>
            <p className="text-xl text-[#b6cacb] mb-8 max-w-2xl mx-auto">
              Join PlaceIt! today and discover the future of furniture shopping and selling.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register"
                className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link 
                to="/browse"
                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/30 transition-all duration-200"
              >
                Explore Marketplace
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
