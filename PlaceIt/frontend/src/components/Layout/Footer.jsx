import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#0c1825] via-[#2a5d93] to-[#209aaa] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/src/assets/placeit-logo-no-bg.png" 
                alt="PlaceIt!" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold">PlaceIt!</span>
            </div>
            <p className="text-[#b6cacb] mb-4 max-w-md">
              Experience furniture shopping like never before with our immersive 3D and AR marketplace. 
              Visualize furniture in your space before you buy.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-[#b6cacb] hover:text-[#29d4c5] transition-colors duration-200">
                Twitter
              </a>
              <a href="#" className="text-[#b6cacb] hover:text-[#29d4c5] transition-colors duration-200">
                Facebook
              </a>
              <a href="#" className="text-[#b6cacb] hover:text-[#29d4c5] transition-colors duration-200">
                Instagram
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/browse" className="text-[#b6cacb] hover:text-[#29d4c5] transition-colors duration-200">
                  Browse Furniture
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-[#b6cacb] hover:text-[#29d4c5] transition-colors duration-200">
                  Sell Your Furniture
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-[#b6cacb] hover:text-[#29d4c5] transition-colors duration-200">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-[#b6cacb] hover:text-[#29d4c5] transition-colors duration-200">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-[#b6cacb] hover:text-[#29d4c5] transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-[#b6cacb] hover:text-[#29d4c5] transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-[#b6cacb] hover:text-[#29d4c5] transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#b6cacb] hover:text-[#29d4c5] transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-[#b6cacb]">
            © 2025 PlaceIt! All rights reserved. Built with 💚 for better furniture shopping.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
