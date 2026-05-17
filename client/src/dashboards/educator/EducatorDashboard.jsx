import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaBookOpen, FaUsers, FaRupeeSign, FaStar, FaClipboardList, FaChartPie, FaWallet, FaArrowRight } from 'react-icons/fa';
import api from '../../services/api';

const COLORS = ['#1E3A5F', '#F4B400', '#22C55E', '#3B82F6', '#EF4444', '#8B5CF6'];

const EducatorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/courses/educator/my-courses').catch(() => ({ data: [] })),
      api.get('/wallet/educator').catch(() => ({ data: null }))
    ]).then(([c, w]) => {
      setCourses(c.data || []);
      setWallet(w.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalStudents = courses.reduce((s, c) => s + (c.enrolledStudents || 0), 0);
  const totalRevenue = wallet ? wallet.totalEarnings : courses.reduce((s, c) => s + (c.price || 0) * (c.enrolledStudents || 0), 0);
  const pendingBalance = wallet?.pendingBalance || 0;
  const avgRating = courses.length ? (courses.reduce((s, c) => s + (c.rating || 0), 0) / courses.length).toFixed(1) : '0.0';

  const cards = [
    { title: 'Total Courses', value: courses.length, icon: <FaBookOpen />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Students', value: totalStudents, icon: <FaUsers />, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Gross Earnings', value: `₹${totalRevenue.toFixed(2)}`, icon: <FaRupeeSign />, color: 'text-accent-600', bg: 'bg-accent-50' },
    { title: 'Average Rating', value: `${avgRating} ⭐`, icon: <FaStar />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Total Assignments', value: 0, icon: <FaClipboardList />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Quiz Analytics', value: `${courses.length} Active`, icon: <FaChartPie />, color: 'text-primary-600', bg: 'bg-primary-50' },
  ];

  const enrollData = courses.map(c => ({ name: c.title?.substring(0, 15), students: c.enrolledStudents || 0 }));
  const perfData = courses.map(c => ({ name: c.title?.substring(0, 15), rating: c.rating || 0 }));
  const catData = Object.entries(courses.reduce((acc, c) => { acc[c.category || 'Other'] = (acc[c.category || 'Other'] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Educator Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white border border-surface-300 rounded-lg p-4">
            <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-lg flex items-center justify-center text-lg mb-3`}>{card.icon}</div>
            <p className="text-xl font-bold text-gray-800">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Earnings Quick Card */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl p-5 mb-6 text-white flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl"><FaWallet /></div>
          <div>
            <p className="text-sm text-green-100">Available to Withdraw</p>
            <p className="text-3xl font-bold">₹{pendingBalance.toFixed(2)}</p>
            <p className="text-xs text-green-100 mt-1">Total earned: ₹{totalRevenue.toFixed(2)} • Withdrawn: ₹{(wallet?.withdrawnAmount || 0).toFixed(2)}</p>
          </div>
        </div>
        <Link to="/educator/earnings" className="flex items-center gap-2 bg-white text-green-700 font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-green-50 transition-colors">
          Manage Earnings <FaArrowRight />
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Student Enrollment per Course</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={enrollData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Bar dataKey="students" fill="#1E3A5F" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Course Performance (Ratings)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={perfData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis domain={[0, 5]} /><Tooltip /><Line type="monotone" dataKey="rating" stroke="#F4B400" strokeWidth={2} dot={{ fill: '#F4B400' }} /></LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Pie */}
      <div className="bg-white border border-surface-300 rounded-lg p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Courses by Category</h2>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={catData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EducatorDashboard;
