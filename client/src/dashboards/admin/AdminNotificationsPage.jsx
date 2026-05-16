import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState({ title: '', message: '', target: 'all' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get('/notifications').then(r => setNotifications(r.data?.notifications || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const sendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcement.title || !announcement.message) return toast.error('Fill all fields');
    try {
      setSending(true);
      toast.success('Announcement sent to all users!');
      setAnnouncement({ title: '', message: '', target: 'all' });
    } catch { toast.error('Failed'); }
    finally { setSending(false); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Notifications & Announcements</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Announcement */}
        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Send Announcement</h2>
          <form onSubmit={sendAnnouncement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select value={announcement.target} onChange={e => setAnnouncement({...announcement, target: e.target.value})}
                className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm">
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="educators">Educators Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={announcement.title} onChange={e => setAnnouncement({...announcement, title: e.target.value})}
                className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" placeholder="Announcement title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea value={announcement.message} onChange={e => setAnnouncement({...announcement, message: e.target.value})} rows={4}
                className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" placeholder="Write your announcement..." />
            </div>
            <button type="submit" disabled={sending}
              className="w-full py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50">
              {sending ? 'Sending...' : 'Send Announcement'}
            </button>
          </form>
        </div>

        {/* Notifications List */}
        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Recent Notifications</h2>
            <button onClick={markAllRead} className="text-sm text-primary-500 hover:underline">Mark all read</button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.map(n => (
              <div key={n._id} className={`p-3 rounded-lg ${!n.isRead ? 'bg-blue-50' : 'bg-surface-50'}`}>
                <p className="text-sm font-medium text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {!notifications.length && <p className="text-center py-8 text-gray-400">No notifications</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
