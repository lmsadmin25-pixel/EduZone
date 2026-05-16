import { useAuth } from '../context/AuthContext';
import { HiMenu, HiBell } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const Topbar = ({ onMenuClick }) => {
  const { user, role } = useAuth();

  const roleLabel = role === 'admin' ? 'Admin' : role === 'educator' ? 'Educator' : 'Student';

  return (
    <header className="bg-white border-b border-surface-300 h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-gray-600 p-2">
          <HiMenu className="text-xl" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Welcome, {user?.name || 'User'}</h2>
          <p className="text-xs text-gray-400">{roleLabel} Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link to={`/${role}/notifications`} className="relative text-gray-500 hover:text-primary-500 transition-colors">
          <HiBell className="text-xl" />
        </Link>
        <div className="w-9 h-9 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
