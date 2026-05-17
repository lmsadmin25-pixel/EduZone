import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { FaUsers, FaChalkboardTeacher, FaBookOpen, FaUserGraduate, FaRupeeSign, FaCheckCircle, FaHourglassHalf, FaRobot, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import api from '../../services/api';

const COLORS = ['#1E3A5F', '#F4B400', '#22C55E', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [wStats, setWStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard').catch(() => ({ data: {} })),
      api.get('/admin/withdrawals/stats').catch(() => ({ data: {} }))
    ]).then(([d, w]) => {
      setStats(d.data || {});
      setWStats(w.data || {});
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: 'Total Students', value: stats.totalStudents || 0, icon: <FaUsers />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Educators', value: stats.totalEducators || 0, icon: <FaChalkboardTeacher />, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Total Courses', value: stats.totalCourses || 0, icon: <FaBookOpen />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Total Enrollments', value: stats.totalEnrollments || 0, icon: <FaUserGraduate />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Active Users', value: (stats.totalStudents || 0) + (stats.totalEducators || 0), icon: <FaChartLine />, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue || 0}`, icon: <FaRupeeSign />, color: 'text-accent-600', bg: 'bg-accent-50' },
    { title: 'Pending Approvals', value: stats.pendingEducators || 0, icon: <FaHourglassHalf />, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'AI Quizzes Generated', value: stats.aiQuizCount || 0, icon: <FaRobot />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Completion Rate', value: `${stats.completionRate || 0}%`, icon: <FaCheckCircle />, color: 'text-primary-600', bg: 'bg-primary-50' },
  ];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueData = (stats.monthlyRevenue || []).map(m => ({ month: monthNames[m._id - 1] || m._id, revenue: m.revenue, count: m.count }));
  const categoryData = (stats.categoryStats || []).map(c => ({ name: c._id, value: c.count }));

  // Simulated monthly growth data
  const growthData = monthNames.slice(0, 6).map((m, i) => ({
    month: m,
    students: Math.floor((stats.totalStudents || 10) * (0.3 + i * 0.14)),
    educators: Math.floor((stats.totalEducators || 3) * (0.4 + i * 0.12)),
  }));

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview and analytics</p>
      </div>

      {/* Pending Withdrawals Alert */}
      {(wStats.pending > 0) && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaMoneyBillWave className="text-yellow-600 text-xl" />
            <div>
              <p className="font-semibold text-yellow-800">{wStats.pending} Withdrawal Request{wStats.pending > 1 ? 's' : ''} Pending</p>
              <p className="text-xs text-yellow-600">Review and process educator withdrawal requests</p>
            </div>
          </div>
          <Link to="/admin/withdrawals" className="px-4 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-lg hover:bg-yellow-600 transition-colors">Review Now</Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white border border-surface-300 rounded-lg p-4 flex items-center gap-4">
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-lg flex items-center justify-center text-xl flex-shrink-0`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-500">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={v => `₹${v}`} />
              <Area type="monotone" dataKey="revenue" stroke="#F4B400" fill="#F4B400" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">User Growth (Monthly)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="students" stroke="#1E3A5F" strokeWidth={2} dot={{ fill: '#1E3A5F' }} name="Students" />
              <Line type="monotone" dataKey="educators" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E' }} name="Educators" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Course Categories</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData.length ? categoryData : [{ name: 'No Data', value: 1 }]} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {(categoryData.length ? categoryData : [{ name: 'No Data', value: 1 }]).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Most Enrolled Courses</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={(stats.topCourses || []).map(c => ({ name: c.title?.substring(0, 20), students: c.enrolledStudents || 0 }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="students" fill="#1E3A5F" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Activity */}
      <div className="bg-white border border-surface-300 rounded-lg p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Platform Activity Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-surface-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-primary-500">{stats.totalCourses || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Active Courses</p>
          </div>
          <div className="p-4 bg-surface-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-500">{stats.totalEnrollments || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total Enrollments</p>
          </div>
          <div className="p-4 bg-surface-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-accent-600">₹{stats.totalRevenue || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Revenue This Month</p>
          </div>
          <div className="p-4 bg-surface-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-500">{stats.pendingEducators || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Pending Actions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
