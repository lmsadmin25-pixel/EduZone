import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const COLORS = ['#1E3A5F', '#F4B400', '#22C55E', '#3B82F6', '#EF4444', '#8B5CF6'];

const AnalyticsPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/educator/my-courses').then(r => setCourses(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const studentData = courses.map(c => ({ name: c.title?.substring(0, 20), students: c.enrolledStudents || 0 }));
  const ratingData = courses.map(c => ({ name: c.title?.substring(0, 20), rating: c.rating || 0 }));
  const revenueData = courses.map(c => ({ name: c.title?.substring(0, 15), revenue: (c.price || 0) * (c.enrolledStudents || 0) }));
  const categoryData = Object.entries(courses.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));

  const totalStudents = courses.reduce((s, c) => s + (c.enrolledStudents || 0), 0);
  const totalRevenue = courses.reduce((s, c) => s + (c.price || 0) * (c.enrolledStudents || 0), 0);
  const avgRating = courses.length ? (courses.reduce((s, c) => s + (c.rating || 0), 0) / courses.length).toFixed(1) : 0;

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-surface-300 rounded-lg p-5 text-center">
          <p className="text-2xl font-bold text-primary-500">{totalStudents}</p>
          <p className="text-sm text-gray-500">Total Students</p>
        </div>
        <div className="bg-white border border-surface-300 rounded-lg p-5 text-center">
          <p className="text-2xl font-bold text-accent-600">₹{totalRevenue}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>
        <div className="bg-white border border-surface-300 rounded-lg p-5 text-center">
          <p className="text-2xl font-bold text-green-600">{avgRating} ⭐</p>
          <p className="text-sm text-gray-500">Avg Rating</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Students per Course</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={studentData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Bar dataKey="students" fill="#1E3A5F" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Course Ratings</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={ratingData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis domain={[0, 5]} /><Tooltip /><Line type="monotone" dataKey="rating" stroke="#F4B400" strokeWidth={2} /></LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Revenue per Course</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis /><Tooltip formatter={v => `₹${v}`} /><Bar dataKey="revenue" fill="#22C55E" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Courses by Category</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
