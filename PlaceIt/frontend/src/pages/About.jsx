import { motion } from 'framer-motion';
import { 
  CubeIcon, 
  CameraIcon, 
  ShoppingBagIcon,
  UserGroupIcon,
  ChartBarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const stats = [
    { label: "Active Sellers", value: "10K+", icon: UserGroupIcon },
    { label: "Products Listed", value: "50K+", icon: ShoppingBagIcon },
    { label: "3D Models Created", value: "25K+", icon: CubeIcon },
    { label: "Countries Served", value: "25+", icon: GlobeAltIcon }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Co-Founder",
      bio: "Former VP of Product at major furniture retailer. Passionate about revolutionizing online furniture shopping.",
      image: "https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=600"
    },
    {
      name: "Michael Chen",
      role: "CTO & Co-Founder", 
      bio: "AR/VR expert with 10+ years in 3D technology. Previously led 3D teams at major tech companies.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300"
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Design",
      bio: "UX designer specializing in immersive experiences. Award-winning designer with focus on accessibility.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#b6cacb]/10 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0c1825] via-[#2a5d93] to-[#209aaa] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              About <span className="text-[#29d4c5]">PlaceIt!</span>
            </h1>
            <p className="text-xl text-[#b6cacb] max-w-3xl mx-auto">
              We're revolutionizing furniture shopping with cutting-edge 3D and AR technology, 
              making it easier than ever to find the perfect pieces for your space.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#0c1825] mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-[#2a5d93] mb-6">
                We believe furniture shopping should be confident, convenient, and fun. Our platform 
                bridges the gap between online convenience and in-store experience through immersive 
                3D models and augmented reality.
              </p>
              <p className="text-lg text-[#2a5d93] mb-8">
                By empowering sellers with easy 3D model generation and giving buyers the tools to 
                visualize furniture in their actual spaces, we're creating a more informed and 
                satisfying shopping experience for everyone.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <CubeIcon className="h-6 w-6 text-[#29d4c5]" />
                  <span className="text-[#0c1825] font-medium">3D Technology</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CameraIcon className="h-6 w-6 text-[#29d4c5]" />
                  <span className="text-[#0c1825] font-medium">AR Experience</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-12 lg:mt-0"
            >
              <div className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-8 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600" 
                  alt="Modern furniture showcase"
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
                <h3 className="text-xl font-bold text-[#0c1825] mb-3">
                  The Future of Furniture Shopping
                </h3>
                <p className="text-[#2a5d93]">
                  Experience how our technology transforms traditional furniture retail into 
                  an immersive, confident shopping journey.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-[#209aaa] via-[#29d4c5] to-[#209aaa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Growing Every Day
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Join thousands of sellers and buyers who trust PlaceIt! for their furniture needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 text-center"
              >
                <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0c1825] mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-[#2a5d93] max-w-2xl mx-auto">
              Passionate innovators dedicated to transforming the furniture shopping experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white/60 backdrop-blur-sm border border-[#29d4c5]/20 rounded-xl p-6 shadow-lg text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-[#0c1825] mb-2">{member.name}</h3>
                <p className="text-[#29d4c5] font-medium mb-4">{member.role}</p>
                <p className="text-[#2a5d93] text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0c1825] mb-4">
              Our Values
            </h2>
            <p className="text-xl text-[#2a5d93] max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CubeIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0c1825] mb-3">Innovation</h3>
              <p className="text-[#2a5d93]">
                We constantly push the boundaries of technology to create better shopping experiences.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0c1825] mb-3">Community</h3>
              <p className="text-[#2a5d93]">
                We believe in building strong relationships between sellers and buyers in our marketplace.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0c1825] mb-3">Quality</h3>
              <p className="text-[#2a5d93]">
                We're committed to providing the highest quality 3D models and user experience.
              </p>
            </motion.div>
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
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Furniture Experience?
            </h2>
            <p className="text-xl text-[#b6cacb] mb-8 max-w-2xl mx-auto">
              Join PlaceIt! today and discover the future of furniture shopping and selling.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/browse"
                className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 inline-flex items-center justify-center space-x-2"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                <span>Start Shopping</span>
              </a>
              <a
                href="/sell"
                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/30 transition-all duration-200 inline-flex items-center justify-center space-x-2"
              >
                <CubeIcon className="h-6 w-6" />
                <span>Start Selling</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
