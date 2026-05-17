import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaRupeeSign, FaFileExcel, FaFilePdf, FaSearch } from 'react-icons/fa';
import api from '../../services/api';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const AdminPaymentsPage = () => {
  const [stats, setStats] = useState({});
  const [payments, setPayments] = useState([]);
  const [wStats, setWStats] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard').catch(() => ({ data: {} })),
      api.get('/payments/reports').catch(() => ({ data: { payments: [] } })),
      api.get('/admin/withdrawals/stats').catch(() => ({ data: {} }))
    ]).then(([d, p, w]) => {
      setStats(d.data || {});
      setPayments(p.data?.payments || []);
      setWStats(w.data || {});
    }).finally(() => setLoading(false));
  }, []);

  const revenueData = (stats.monthlyRevenue || []).map(m => ({
    month: monthNames[m._id - 1] || m._id,
    revenue: m.revenue,
    count: m.count
  }));

  const filtered = payments.filter(p =>
    p.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.student?.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.course?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const doExport = (format) => {
    if (!payments.length) { alert('No data to export'); return; }
    const cols = ['Date', 'Student', 'Email', 'Course', 'Amount (₹)', 'Payment ID', 'Status'];
    const rows = payments.map(p => [
      new Date(p.createdAt).toLocaleDateString('en-IN'),
      p.student?.name || '-', p.student?.email || '-',
      p.course?.title || '-', p.amount, p.razorpayPaymentId || '-', p.status
    ]);
    if (format === 'pdf') exportToPDF(cols, rows, 'Transaction History', 'transactions');
    else exportToExcel(cols, rows, 'transactions');
  };

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  const platformFeeTotal = wStats.totalPlatformFees || 0;
  const paidOut = wStats.totalPaid || 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Revenue & Payments</h1>
        <p className="text-sm text-gray-500 mt-1">Track all transactions and platform revenue</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Platform Fees Collected', value: `₹${platformFeeTotal.toFixed(2)}`, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
          { label: 'Paid Out to Educators', value: `₹${paidOut.toFixed(2)}`, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
          { label: 'Total Transactions', value: payments.length, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
        ].map((c, i) => (
          <div key={i} className={`${c.bg} border rounded-xl p-4 shadow-sm`}>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {revenueData.length > 0 && (
        <div className="bg-white border border-surface-300 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Monthly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => `₹${v}`} />
              <Area type="monotone" dataKey="revenue" stroke="#1E3A5F" fill="#1E3A5F" fillOpacity={0.1} strokeWidth={2} name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white border border-surface-300 rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-surface-200">
          <div className="flex items-center gap-2">
            <FaRupeeSign className="text-primary-500" />
            <h2 className="font-semibold text-gray-800">All Transactions ({payments.length})</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search student, course..."
                className="pl-8 pr-3 py-2 border border-surface-300 rounded-lg text-xs focus:outline-none focus:border-primary-500 w-52" />
            </div>
            <button onClick={() => doExport('excel')} className="flex items-center gap-1.5 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"><FaFileExcel /> Excel</button>
            <button onClick={() => doExport('pdf')} className="flex items-center gap-1.5 px-3 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"><FaFilePdf /> PDF</button>
          </div>
        </div>
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  {['Date', 'Student', 'Course', 'Amount', 'Payment ID', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-surface-50">
                    <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{p.student?.name || '-'}</p>
                      <p className="text-xs text-gray-400">{p.student?.email || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.course?.title || '-'}</td>
                    <td className="px-4 py-3 font-bold text-green-600">₹{p.amount}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.razorpayPaymentId || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">
            <FaRupeeSign className="text-3xl mx-auto mb-2" />
            <p className="text-sm">{search ? 'No results match your search' : 'No transactions yet'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
