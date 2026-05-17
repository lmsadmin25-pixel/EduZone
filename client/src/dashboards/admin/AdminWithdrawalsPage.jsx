import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaSearch, FaFilter, FaFilePdf, FaFileExcel, FaRupeeSign, FaClock, FaCheckCircle, FaTimesCircle, FaUniversity, FaMobileAlt } from 'react-icons/fa';
import api from '../../services/api';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const REJECTION_REASONS = [
  'Incorrect bank details', 'Suspicious activity detected',
  'Minimum withdrawal amount not reached', 'Verification pending',
  'Technical issue', 'Duplicate request', 'Other'
];
const statusColor = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' };
const statusIcon = { pending: <FaClock className="text-yellow-500" />, approved: <FaCheckCircle className="text-green-500" />, rejected: <FaTimesCircle className="text-red-500" /> };

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectModal, setRejectModal] = useState(null); // withdrawal object
  const [rejectReason, setRejectReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [wr, st] = await Promise.all([
        api.get(`/admin/withdrawals?status=${filter}&page=${page}&limit=15`),
        api.get('/admin/withdrawals/stats')
      ]);
      setWithdrawals(wr.data.withdrawals || []);
      setTotalPages(wr.data.totalPages || 1);
      setStats(st.data);
    } catch { toast.error('Failed to load withdrawal data'); }
    finally { setLoading(false); }
  }, [filter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this withdrawal request?')) return;
    setProcessing(true);
    try {
      await api.put(`/admin/withdrawals/${id}/approve`);
      toast.success('Withdrawal approved!');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to approve'); }
    finally { setProcessing(false); }
  };

  const handleReject = async () => {
    if (!rejectReason) { toast.error('Select a rejection reason'); return; }
    if (rejectReason === 'Other' && !customReason.trim()) { toast.error('Enter a custom reason'); return; }
    setProcessing(true);
    try {
      await api.put(`/admin/withdrawals/${rejectModal._id}/reject`, { rejectionReason: rejectReason, customRejectionReason: customReason });
      toast.success('Withdrawal rejected & educator notified');
      setRejectModal(null); setRejectReason(''); setCustomReason('');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to reject'); }
    finally { setProcessing(false); }
  };

  const filtered = withdrawals.filter(w =>
    w.educator?.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.educator?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const doExport = (format) => {
    if (!withdrawals.length) { toast.info('No data to export'); return; }
    const cols = ['Date', 'Educator', 'Email', 'Amount (₹)', 'Platform Fee (₹)', 'Net (₹)', 'Method', 'Status', 'Rejection Reason'];
    const rows = withdrawals.map(w => [
      new Date(w.createdAt).toLocaleDateString('en-IN'),
      w.educator?.name || '-', w.educator?.email || '-',
      w.amount.toFixed(2), w.platformFee.toFixed(2), w.netAmount.toFixed(2),
      w.payoutMethod?.type?.toUpperCase() || '-', w.status.toUpperCase(),
      w.status === 'rejected' ? (w.rejectionReason === 'Other' ? w.customRejectionReason : w.rejectionReason) : '-'
    ]);
    if (format === 'pdf') exportToPDF(cols, rows, 'Withdrawal Requests', 'admin_withdrawals');
    else exportToExcel(cols, rows, 'admin_withdrawals');
  };

  const statCards = [
    { label: 'Pending Requests', value: stats.pending || 0, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: <FaClock /> },
    { label: 'Approved', value: stats.approved || 0, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: <FaCheckCircle /> },
    { label: 'Rejected', value: stats.rejected || 0, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: <FaTimesCircle /> },
    { label: 'Total Paid Out', value: `₹${(stats.totalPaid || 0).toFixed(2)}`, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: <FaRupeeSign /> },
    { label: 'Platform Fees Collected', value: `₹${(stats.totalPlatformFees || 0).toFixed(2)}`, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: <FaRupeeSign /> },
    { label: 'Pending Amount', value: `₹${(stats.totalPendingAmount || 0).toFixed(2)}`, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: <FaRupeeSign /> },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Withdrawal Management</h1>
        <p className="text-sm text-gray-500 mt-1">Review and process educator withdrawal requests</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {statCards.map((c, i) => (
          <div key={i} className={`bg-white border ${c.border} rounded-xl p-4 shadow-sm`}>
            <div className={`w-9 h-9 ${c.bg} ${c.color} rounded-lg flex items-center justify-center text-base mb-3`}>{c.icon}</div>
            <p className="text-lg font-bold text-gray-800">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-surface-300 rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by educator name or email..."
            className="w-full pl-9 pr-4 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
        </div>
        <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1">
          <FaFilter className="text-gray-400 ml-1" />
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => { setFilter(s === 'all' ? '' : s); setPage(1); }}
              className={`px-3 py-1.5 text-xs rounded-md font-medium capitalize transition-colors ${filter === (s === 'all' ? '' : s) ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>{s}</button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={() => doExport('excel')} className="flex items-center gap-1.5 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"><FaFileExcel /> Excel</button>
          <button onClick={() => doExport('pdf')} className="flex items-center gap-1.5 px-3 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"><FaFilePdf /> PDF</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-surface-300 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400"><FaRupeeSign className="text-3xl mx-auto mb-2" /><p>No withdrawal requests found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>{['Educator', 'Amount', 'Platform Fee (5%)', 'Net Payout', 'Method', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map(w => (
                  <tr key={w._id} className="hover:bg-surface-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{w.educator?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{w.educator?.email || '-'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">₹{w.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-orange-600 font-medium">-₹{w.platformFee.toFixed(2)}</td>
                    <td className="px-4 py-3 text-green-600 font-bold">₹{w.netAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit ${w.payoutMethod?.type === 'bank' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {w.payoutMethod?.type === 'bank' ? <FaUniversity /> : <FaMobileAlt />}
                        {w.payoutMethod?.type?.toUpperCase() || '-'}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {w.payoutMethod?.type === 'bank'
                          ? `${w.payoutMethod.bankDetails?.bankName || ''} ****${(w.payoutMethod.bankDetails?.accountNumber || '').slice(-4)}`
                          : w.payoutMethod?.upiId || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(w.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[w.status]}`}>
                        {statusIcon[w.status]} {w.status}
                      </span>
                      {w.status === 'rejected' && (
                        <p className="text-xs text-red-400 mt-1">{w.rejectionReason === 'Other' ? w.customRejectionReason : w.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {w.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(w._id)} disabled={processing}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">
                            <FaCheck /> Accept
                          </button>
                          <button onClick={() => { setRejectModal(w); setRejectReason(''); setCustomReason(''); }} disabled={processing}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium">
                            <FaTimes /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {w.processedAt ? `Processed ${new Date(w.processedAt).toLocaleDateString('en-IN')}` : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-surface-50">← Prev</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-surface-50">Next →</button>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setRejectModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-surface-200">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FaTimesCircle className="text-red-500" /> Reject Withdrawal</h2>
              <button onClick={() => setRejectModal(null)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-surface-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-700">{rejectModal.educator?.name}</p>
                <p className="text-gray-500">Amount: ₹{rejectModal.amount?.toFixed(2)} • Net: ₹{rejectModal.netAmount?.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rejection Reason *</label>
                <div className="space-y-2">
                  {REJECTION_REASONS.map(r => (
                    <label key={r} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${rejectReason === r ? 'border-red-400 bg-red-50' : 'border-surface-300 hover:border-gray-400'}`}>
                      <input type="radio" name="reason" value={r} checked={rejectReason === r} onChange={() => setRejectReason(r)} className="accent-red-500" />
                      <span className="text-sm text-gray-700">{r}</span>
                    </label>
                  ))}
                </div>
              </div>
              {rejectReason === 'Other' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Custom Reason *</label>
                  <textarea value={customReason} onChange={e => setCustomReason(e.target.value)} rows={3}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-red-400 resize-none" placeholder="Enter detailed rejection reason..." />
                </div>
              )}
            </div>
            <div className="p-5 border-t border-surface-200 flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 border border-surface-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-surface-50">Cancel</button>
              <button onClick={handleReject} disabled={processing}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors">
                {processing ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
