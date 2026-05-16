import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMenu, HiX, HiBell } from 'react-icons/hi';
import { FaGraduationCap } from 'react-icons/fa';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'educator') return '/educator/dashboard';
    return '/student/dashboard';
  };

  return (
    <nav className="bg-white border-b border-surface-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <FaGraduationCap className="text-2xl text-primary-500" />
            <span className="text-xl font-bold text-primary-500">Edu<span className="text-accent-500">Zone</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">Home</Link>
            <Link to="/courses" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">Courses</Link>
            <Link to="/about" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">Contact</Link>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-surface-300 py-2 z-50">
                    <Link to={getDashboardLink()} onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-surface-100">
                      Dashboard
                    </Link>
                    <button onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-surface-100">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"
                  className="px-4 py-2 text-sm font-medium text-primary-500 border border-primary-500 rounded-lg hover:bg-primary-50 transition-colors">
                  Login
                </Link>
                <Link to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-surface-300 px-4 py-4 space-y-3">
          <Link to="/" className="block text-gray-600 hover:text-primary-500" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/courses" className="block text-gray-600 hover:text-primary-500" onClick={() => setMobileOpen(false)}>Courses</Link>
          <Link to="/about" className="block text-gray-600 hover:text-primary-500" onClick={() => setMobileOpen(false)}>About</Link>
          <Link to="/contact" className="block text-gray-600 hover:text-primary-500" onClick={() => setMobileOpen(false)}>Contact</Link>
          {user ? (
            <>
              <Link to={getDashboardLink()} className="block text-primary-500 font-medium" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="block text-red-600">Logout</button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center px-4 py-2 text-sm border border-primary-500 text-primary-500 rounded-lg" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="flex-1 text-center px-4 py-2 text-sm bg-primary-500 text-white rounded-lg" onClick={() => setMobileOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
