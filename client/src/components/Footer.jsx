import { Link } from 'react-router-dom';
import { FaGraduationCap, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-primary-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FaGraduationCap className="text-2xl text-accent-500" />
              <span className="text-xl font-bold">Edu<span className="text-accent-500">Zone</span></span>
            </div>
            <p className="text-primary-200 text-sm leading-relaxed">
              AI-Powered Learning Management System. Learn, grow, and achieve your goals with our expert-crafted courses.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-primary-200 hover:text-accent-500 transition-colors"><FaFacebook /></a>
              <a href="#" className="text-primary-200 hover:text-accent-500 transition-colors"><FaTwitter /></a>
              <a href="#" className="text-primary-200 hover:text-accent-500 transition-colors"><FaLinkedin /></a>
              <a href="#" className="text-primary-200 hover:text-accent-500 transition-colors"><FaInstagram /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="text-primary-200 hover:text-accent-500 transition-colors">Browse Courses</Link></li>
              <li><Link to="/about" className="text-primary-200 hover:text-accent-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-primary-200 hover:text-accent-500 transition-colors">Contact</Link></li>
              <li><Link to="/register?type=educator" className="text-primary-200 hover:text-accent-500 transition-colors">Become an Educator</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses?category=Web Development" className="text-primary-200 hover:text-accent-500 transition-colors">Web Development</Link></li>
              <li><Link to="/courses?category=Data Science" className="text-primary-200 hover:text-accent-500 transition-colors">Data Science</Link></li>
              <li><Link to="/courses?category=Machine Learning" className="text-primary-200 hover:text-accent-500 transition-colors">Machine Learning</Link></li>
              <li><Link to="/courses?category=Mobile Development" className="text-primary-200 hover:text-accent-500 transition-colors">Mobile Development</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm text-primary-200">
              <li>📧 support@eduzone.com</li>
              <li>📞 +91 7653061135</li>
              <li>📍 Bhubaneswar, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-400 mt-8 pt-6 text-center text-sm text-primary-200">
          © {new Date().getFullYear()} EduZone. All rights reserved. | MCA Final Year Project
        </div>
      </div>
    </footer>
  );
};

export default Footer;
