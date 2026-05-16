import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminPaymentsPage = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-surface-300 rounded-lg p-5 text-center">
          <p className="text-2xl font-bold text-primary-500">₹{stats.totalRevenue || 0}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>
        <div className="bg-white border border-surface-300 rounded-lg p-5 text-center">
          <p className="text-2xl font-bold text-accent-600">{stats.totalEnrollments || 0}</p>
          <p className="text-sm text-gray-500">Total Enrollments</p>
        </div>
        <div className="bg-white border border-surface-300 rounded-lg p-5 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.totalCourses || 0}</p>
          <p className="text-sm text-gray-500">Active Courses</p>
        </div>
      </div>

      <div className="bg-white border border-surface-300 rounded-lg p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Monthly Revenue Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Month</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Revenue</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {(stats.monthlyRevenue || []).map(m => (
                <tr key={m._id} className="border-t border-surface-200">
                  <td className="px-4 py-3 font-medium">{monthNames[m._id - 1]}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">₹{m.revenue}</td>
                  <td className="px-4 py-3 text-gray-500">{m.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!(stats.monthlyRevenue || []).length && <p className="text-center py-8 text-gray-400">No revenue data</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
