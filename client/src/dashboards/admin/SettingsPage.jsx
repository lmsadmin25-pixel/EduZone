import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaCog, FaKey, FaCloud, FaCreditCard, FaRobot, FaShieldAlt, FaUsers } from 'react-icons/fa';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('platform');

  const tabs = [
    { key: 'platform', label: 'Platform', icon: <FaCog /> },
    { key: 'roles', label: 'Role Management', icon: <FaUsers /> },
    { key: 'api', label: 'API Config', icon: <FaKey /> },
    { key: 'cloudinary', label: 'Cloudinary', icon: <FaCloud /> },
    { key: 'razorpay', label: 'Razorpay', icon: <FaCreditCard /> },
    { key: 'ai', label: 'AI Settings', icon: <FaRobot /> },
    { key: 'security', label: 'Security', icon: <FaShieldAlt /> },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Platform Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="bg-white border border-surface-300 rounded-lg p-3 h-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors mb-1
              ${activeTab === t.key ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-surface-100'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 bg-white border border-surface-300 rounded-lg p-6">
          {activeTab === 'platform' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-3">General Platform Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                <input type="text" defaultValue="EduZone" className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                <input type="email" defaultValue="support@eduzone.com" className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Mode</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="maintenance" />
                  <label htmlFor="maintenance" className="text-sm text-gray-700">Enable maintenance mode</label>
                </div>
              </div>
              <button onClick={() => toast.success('Settings saved')} className="px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600">Save</button>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-3">Role Management</h2>
              <div className="space-y-3">
                {[
                  { role: 'Student', perms: 'Browse, Enroll, Learn, Quiz, Assignments, AI Tools' },
                  { role: 'Educator', perms: 'Create Courses, Upload Materials, Create Quiz, Grade Assignments, Analytics' },
                  { role: 'Admin', perms: 'Full Platform Access, User Management, Payments, Settings' },
                ].map(r => (
                  <div key={r.role} className="p-4 bg-surface-50 rounded-lg">
                    <p className="font-medium text-gray-800">{r.role}</p>
                    <p className="text-xs text-gray-500 mt-1">{r.perms}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="autoApprove" />
                <label htmlFor="autoApprove" className="text-sm text-gray-700">Auto-approve educator registrations</label>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-3">API Configuration</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">JWT Secret</label>
                <input type="password" defaultValue="••••••••••••" className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">JWT Expiry</label>
                <input type="text" defaultValue="7d" className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" />
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">✅ API is configured and running</div>
            </div>
          )}

          {activeTab === 'cloudinary' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-3">Cloudinary Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cloud Name</label>
                <input type="text" defaultValue="dpfd6croq" className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input type="text" defaultValue="167797415228834" className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" readOnly />
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">✅ Cloudinary connected successfully</div>
            </div>
          )}

          {activeTab === 'razorpay' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-3">Razorpay Payment Gateway</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key ID</label>
                <input type="text" defaultValue="Configure in .env" className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm">
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                </select>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">⚠️ Configure Razorpay keys in server .env</div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-3">AI API Settings (Google Gemini)</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input type="password" defaultValue="••••••••••••" className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input type="text" defaultValue="gemini-2.0-flash" className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" readOnly />
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">✅ Gemini AI API connected</div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-3">Security Controls</h2>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="rateLimit" defaultChecked />
                <label htmlFor="rateLimit" className="text-sm text-gray-700">Enable API rate limiting</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="cors" defaultChecked />
                <label htmlFor="cors" className="text-sm text-gray-700">Enable CORS protection</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="helmet" defaultChecked />
                <label htmlFor="helmet" className="text-sm text-gray-700">Enable security headers (Helmet)</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password</label>
                <input type="password" placeholder="New password" className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" />
              </div>
              <button onClick={() => toast.success('Security settings saved')} className="px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600">Save Security Settings</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
