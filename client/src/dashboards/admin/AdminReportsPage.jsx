import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaDownload } from 'react-icons/fa';
import api from '../../services/api';

const COLORS = ['#1E3A5F', '#F4B400', '#22C55E', '#3B82F6', '#EF4444'];

const AdminReportsPage = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data || {})).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const platformData = [
    { name: 'Students', value: stats.totalStudents || 0 },
    { name: 'Educators', value: stats.totalEducators || 0 },
    { name: 'Courses', value: stats.totalCourses || 0 },
    { name: 'Enrollments', value: stats.totalEnrollments || 0 },
  ];

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports & Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Platform Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1E3A5F" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={platformData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {platformData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-surface-300 rounded-lg p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Export Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['Student Data', 'Course Data', 'Payment Data'].map(r => (
            <button key={r} className="flex items-center justify-center gap-2 p-4 border border-surface-300 rounded-lg hover:bg-surface-50 transition-colors">
              <FaDownload className="text-primary-500" />
              <span className="text-sm font-medium text-gray-700">Export {r}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
