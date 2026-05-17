import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { FaFilePdf, FaFileExcel, FaUsers, FaBookOpen, FaRupeeSign, FaUserGraduate } from 'react-icons/fa';
import api from '../../services/api';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const COLORS = ['#1E3A5F', '#F4B400', '#22C55E', '#3B82F6', '#EF4444', '#8B5CF6'];

const AdminReportsPage = () => {
  const [stats, setStats] = useState({});
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard').catch(() => ({ data: {} })),
      api.get('/payments/reports').catch(() => ({ data: { payments: [] } })),
      api.get('/admin/students').catch(() => ({ data: [] })),
      api.get('/admin/enrollments').catch(() => ({ data: [] }))
    ]).then(([d, p, s, e]) => {
      setStats(d.data || {});
      setPayments(p.data?.payments || []);
      setStudents(s.data || []);
      setEnrollments(e.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const platformData = [
    { name: 'Students', value: stats.totalStudents || 0 },
    { name: 'Educators', value: stats.totalEducators || 0 },
    { name: 'Courses', value: stats.totalCourses || 0 },
    { name: 'Enrollments', value: stats.totalEnrollments || 0 },
  ];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const revenueData = (stats.monthlyRevenue || []).map(m => ({ month: monthNames[m._id - 1] || m._id, revenue: m.revenue, count: m.count }));
  const categoryData = (stats.categoryStats || []).map(c => ({ name: c._id, value: c.count }));

  // ─── Export helpers ───────────────────────────────────────────────────────────
  const exportReport = (type, format) => {
    let cols, rows, title, filename;
    switch (type) {
      case 'students':
        cols = ['Name', 'Email', 'Enrolled Courses', 'Joined Date'];
        rows = students.map(s => [s.name, s.email, s.enrolledCourses?.length || 0, new Date(s.createdAt).toLocaleDateString('en-IN')]);
        title = 'Student Report'; filename = 'student_report'; break;
      case 'revenue':
        cols = ['Month', 'Revenue (₹)', 'Transactions'];
        rows = revenueData.map(r => [r.month, r.revenue?.toFixed(2), r.count]);
        title = 'Revenue Analytics'; filename = 'revenue_report'; break;
      case 'enrollments':
        cols = ['Student', 'Email', 'Course', 'Category', 'Price (₹)', 'Date'];
        rows = enrollments.map(e => [e.student?.name || '-', e.student?.email || '-', e.course?.title || '-', e.course?.category || '-', e.course?.price || 0, new Date(e.enrolledAt || e.createdAt).toLocaleDateString('en-IN')]);
        title = 'Course Enrollments'; filename = 'enrollment_report'; break;
      case 'payments':
        cols = ['Date', 'Student', 'Email', 'Course', 'Amount (₹)', 'Status'];
        rows = payments.map(p => [new Date(p.createdAt).toLocaleDateString('en-IN'), p.student?.name || '-', p.student?.email || '-', p.course?.title || '-', p.amount, p.status]);
        title = 'Transaction History'; filename = 'payment_report'; break;
      default: return;
    }
    if (!rows.length) { alert('No data available to export'); return; }
    if (format === 'pdf') exportToPDF(cols, rows, title, filename);
    else exportToExcel(cols, rows, filename);
  };

  const reportTypes = [
    { key: 'students', label: 'Student Report', icon: <FaUsers className="text-blue-500" />, desc: `${students.length} students` },
    { key: 'enrollments', label: 'Course Enrollments', icon: <FaUserGraduate className="text-green-500" />, desc: `${enrollments.length} enrollments` },
    { key: 'payments', label: 'Transaction History', icon: <FaRupeeSign className="text-yellow-500" />, desc: `${payments.length} transactions` },
    { key: 'revenue', label: 'Revenue Analytics', icon: <FaBookOpen className="text-purple-500" />, desc: `${revenueData.length} months of data` },
  ];

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Platform insights and downloadable reports</p>
      </div>

      {/* Stat Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Students', value: stats.totalStudents || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Educators', value: stats.totalEducators || 0, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Completion Rate', value: `${stats.completionRate || 0}%`, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((c, i) => (
          <div key={i} className={`${c.bg} border border-surface-200 rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-surface-300 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Monthly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => `₹${v}`} />
              <Area type="monotone" dataKey="revenue" stroke="#F4B400" fill="#F4B400" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-surface-300 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Platform Overview</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#1E3A5F" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category distribution */}
      {categoryData.length > 0 && (
        <div className="bg-white border border-surface-300 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Course Category Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Export Cards */}
      <div className="bg-white border border-surface-300 rounded-xl p-5">
        <h2 className="font-semibold text-gray-800 mb-1">Export Reports</h2>
        <p className="text-xs text-gray-500 mb-4">Download reports in PDF or Excel format</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reportTypes.map(r => (
            <div key={r.key} className="flex items-center justify-between p-4 border border-surface-200 rounded-xl hover:border-primary-300 hover:bg-surface-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-100 rounded-lg flex items-center justify-center text-lg">{r.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{r.label}</p>
                  <p className="text-xs text-gray-400">{r.desc}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => exportReport(r.key, 'excel')} title="Export Excel"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-medium">
                  <FaFileExcel /> XLS
                </button>
                <button onClick={() => exportReport(r.key, 'pdf')} title="Export PDF"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 font-medium">
                  <FaFilePdf /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
