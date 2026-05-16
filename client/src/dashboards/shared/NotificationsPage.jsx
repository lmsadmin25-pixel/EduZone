import { useState, useEffect } from 'react';
import api from '../../services/api';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/notifications').then(r => setNotifications(r.data.notifications)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <button onClick={markAllRead} className="text-sm text-primary-500 hover:underline">Mark all as read</button>
      </div>
      <div className="bg-white border border-surface-300 rounded-lg divide-y divide-surface-200">
        {notifications.map(n => (
          <div key={n._id} className={`p-4 ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
            <p className="text-sm font-medium text-gray-800">{n.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
        {!notifications.length && <p className="text-center py-8 text-gray-400">No notifications</p>}
      </div>
    </div>
  );
};

export default NotificationsPage;
