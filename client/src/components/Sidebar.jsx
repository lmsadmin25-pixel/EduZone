import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap } from 'react-icons/fa';
import {
  HiHome, HiBookOpen, HiClipboardList, HiUsers, HiCreditCard,
  HiAcademicCap, HiBell, HiUser, HiLogout, HiChartBar,
  HiPlusCircle, HiCog, HiLightBulb, HiDocumentText, HiSearch,
  HiClipboardCheck, HiCurrencyRupee, HiShieldCheck, HiCollection,
  HiPresentationChartBar, HiDatabase, HiFlag, HiUpload
} from 'react-icons/hi';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: <HiHome /> },
    { to: '/courses', label: 'Browse Courses', icon: <HiSearch /> },
    { to: '/student/my-courses', label: 'My Courses', icon: <HiBookOpen /> },
    { to: '/student/assignments', label: 'Assignments', icon: <HiClipboardList /> },
    { to: '/student/quizzes', label: 'Quizzes / Tests', icon: <HiClipboardCheck /> },
    { to: '/student/certificates', label: 'Certificates', icon: <HiAcademicCap /> },
    { to: '/student/payments', label: 'Payments', icon: <HiCreditCard /> },
    { to: '/student/ai-summarizer', label: 'AI Tools', icon: <HiLightBulb /> },
    { to: '/student/notifications', label: 'Notifications', icon: <HiBell /> },
    { to: '/student/profile', label: 'Profile Settings', icon: <HiUser /> },
  ];

  const educatorLinks = [
    { to: '/educator/dashboard', label: 'Dashboard', icon: <HiHome /> },
    { to: '/educator/courses', label: 'My Courses', icon: <HiBookOpen /> },
    { to: '/educator/create-course', label: 'Create Course', icon: <HiPlusCircle /> },
    { to: '/educator/upload', label: 'Upload Materials', icon: <HiUpload /> },
    { to: '/educator/quizzes', label: 'Create Quiz', icon: <HiClipboardList /> },
    { to: '/educator/assignments', label: 'Assignments', icon: <HiDocumentText /> },
    { to: '/educator/students', label: 'Students', icon: <HiUsers /> },
    { to: '/educator/analytics', label: 'Analytics', icon: <HiChartBar /> },
    { to: '/educator/earnings', label: 'Earnings & Wallet', icon: <HiCurrencyRupee /> },
    { to: '/educator/notifications', label: 'Notifications', icon: <HiBell /> },
    { to: '/educator/profile', label: 'Profile', icon: <HiUser /> },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <HiHome /> },
    { to: '/admin/students', label: 'Students Management', icon: <HiUsers /> },
    { to: '/admin/educators', label: 'Educators Management', icon: <HiAcademicCap /> },
    { to: '/admin/courses', label: 'Courses Management', icon: <HiBookOpen /> },
    { to: '/admin/enrollments', label: 'Enrollments', icon: <HiCollection /> },
    { to: '/admin/assignments', label: 'Assignments', icon: <HiClipboardList /> },
    { to: '/admin/quizzes', label: 'Quiz Monitoring', icon: <HiClipboardCheck /> },
    { to: '/admin/ai-monitoring', label: 'AI Features', icon: <HiLightBulb /> },
    { to: '/admin/payments', label: 'Revenue & Payments', icon: <HiCurrencyRupee /> },
    { to: '/admin/withdrawals', label: 'Withdrawals', icon: <HiDatabase /> },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: <HiPresentationChartBar /> },
    { to: '/admin/notifications', label: 'Notifications', icon: <HiBell /> },
    { to: '/admin/settings', label: 'Settings', icon: <HiCog /> },
  ];

  const links = role === 'admin' ? adminLinks : role === 'educator' ? educatorLinks : studentLinks;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-surface-300 w-64 z-50 transform transition-transform duration-200 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto flex flex-col`}>
        
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 h-16 border-b border-surface-300 flex-shrink-0">
          <FaGraduationCap className="text-xl text-primary-500" />
          <span className="text-lg font-bold text-primary-500">Edu<span className="text-accent-500">Zone</span></span>
        </div>

        {/* Nav Links */}
        <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-surface-100 hover:text-primary-500'
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-surface-300 flex-shrink-0">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors">
            <HiLogout className="text-lg" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
