import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ProfilePage = () => {
  const { user, role, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '', expertise: user?.expertise || '', qualification: user?.qualification || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-surface-300 rounded-lg p-6 max-w-2xl space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-xs text-primary-500 capitalize">{role}</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
            className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
            className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
        </div>
        {role === 'educator' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3}
                className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expertise</label>
              <input type="text" value={form.expertise} onChange={e => setForm({...form, expertise: e.target.value})}
                className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
            </div>
          </>
        )}
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50">
          {loading ? 'Saving...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
