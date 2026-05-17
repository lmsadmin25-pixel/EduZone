import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FaRupeeSign, FaWallet, FaArrowDown, FaShieldAlt, FaHistory, FaPlus, FaTimes, FaUniversity, FaMobileAlt, FaFilePdf, FaFileExcel, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import api from '../../services/api';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const PLATFORM_FEE = 5;
const statusColor = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
const statusIcon = { pending: <FaClock />, approved: <FaCheckCircle />, rejected: <FaTimesCircle /> };

export default function EarningsPage() {
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [payoutMethods, setPayoutMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('select');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [newMethod, setNewMethod] = useState({ type: 'bank', accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', branchName: '', upiId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [w, wh, pm] = await Promise.all([api.get('/wallet/educator'), api.get('/wallet/withdrawals'), api.get('/wallet/payout-methods')]);
      setWallet(w.data); setWithdrawals(wh.data || []); setPayoutMethods(pm.data || []);
    } catch { toast.error('Failed to load wallet data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openWithdrawModal = () => {
    setWithdrawAmount(''); setSelectedMethod(null);
    setNewMethod({ type: 'bank', accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', branchName: '', upiId: '' });
    setModalStep(payoutMethods.length > 0 ? 'select' : 'new');
    setShowModal(true);
  };

  const fee = withdrawAmount ? parseFloat(((parseFloat(withdrawAmount) * PLATFORM_FEE) / 100).toFixed(2)) : 0;
  const net = withdrawAmount ? parseFloat((parseFloat(withdrawAmount) - fee).toFixed(2)) : 0;

  const handleSubmitWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 1) { toast.error('Minimum withdrawal is ₹1'); return; }
    if (amount > (wallet?.pendingBalance || 0)) { toast.error('Insufficient balance'); return; }
    setSubmitting(true);
    try {
      const body = { amount };
      if (selectedMethod) { body.payoutMethodId = selectedMethod._id; }
      else {
        if (newMethod.type === 'bank') {
          if (!newMethod.accountHolderName || !newMethod.bankName || !newMethod.accountNumber || !newMethod.ifscCode || !newMethod.branchName) { toast.error('All bank fields are required'); setSubmitting(false); return; }
        } else { if (!newMethod.upiId) { toast.error('UPI ID is required'); setSubmitting(false); return; } }
        body.newPayoutMethod = newMethod;
      }
      await api.post('/wallet/withdraw', body);
      toast.success('Withdrawal request submitted!');
      setShowModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Withdrawal failed'); }
    finally { setSubmitting(false); }
  };

  const doExport = (data, cols, rows, title, fname, format) => {
    if (!data.length) { toast.info('No data to export'); return; }
    if (format === 'pdf') exportToPDF(cols, rows, title, fname);
    else exportToExcel(cols, rows, fname);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  const walletCards = [
    { label: 'Total Earnings', value: wallet?.totalEarnings || 0, icon: <FaRupeeSign />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Pending Balance', value: wallet?.pendingBalance || 0, icon: <FaWallet />, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { label: 'Withdrawn', value: wallet?.withdrawnAmount || 0, icon: <FaArrowDown />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    { label: 'Platform Fees Paid', value: wallet?.platformFeePaid || 0, icon: <FaShieldAlt />, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  ];

  const txCols = ['Date', 'Type', 'Amount (₹)', 'Description'];
  const txRows = (wallet?.transactions || []).map(t => [new Date(t.date).toLocaleDateString('en-IN'), t.type.toUpperCase(), t.amount.toFixed(2), t.description]);
  const wCols = ['Date', 'Gross (₹)', 'Fee (₹)', 'Net (₹)', 'Method', 'Status'];
  const wRows = withdrawals.map(w => [new Date(w.createdAt).toLocaleDateString('en-IN'), w.amount.toFixed(2), w.platformFee.toFixed(2), w.netAmount.toFixed(2), w.payoutMethod?.type?.toUpperCase() || '-', w.status.toUpperCase()]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Earnings & Wallet</h1>
          <p className="text-sm text-gray-500 mt-1">Track your revenue and manage withdrawals</p>
        </div>
        <button onClick={openWithdrawModal} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm">
          <FaArrowDown /> Withdraw Funds
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {walletCards.map((c, i) => (
          <div key={i} className={`bg-white border ${c.border} rounded-xl p-4 shadow-sm`}>
            <div className={`w-10 h-10 ${c.bg} ${c.color} rounded-lg flex items-center justify-center text-lg mb-3`}>{c.icon}</div>
            <p className="text-xl font-bold text-gray-800">₹{c.value.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <FaShieldAlt className="text-blue-500 text-xl flex-shrink-0" />
        <p className="text-xs text-blue-700">A <strong>{PLATFORM_FEE}%</strong> platform fee is deducted from each withdrawal for payment processing, infrastructure, and support services.</p>
      </div>

      <div className="flex border-b border-surface-300 mb-6">
        {['overview', 'transactions', 'withdrawals'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="bg-white border border-surface-300 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Earnings Summary</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Sales Revenue', val: wallet?.totalEarnings || 0, cls: 'text-gray-800' },
              { label: 'Amount Withdrawn (Net)', val: wallet?.withdrawnAmount || 0, cls: 'text-purple-600' },
              { label: 'Platform Fees Paid', val: wallet?.platformFeePaid || 0, cls: 'text-orange-600' },
              { label: 'Available to Withdraw', val: wallet?.pendingBalance || 0, cls: 'text-green-600 text-lg' },
            ].map((r, i) => (
              <div key={i} className={`flex justify-between py-2 text-sm ${i < 3 ? 'border-b border-surface-100' : 'font-bold'}`}>
                <span className="text-gray-600">{r.label}</span>
                <span className={`font-semibold ${r.cls}`}>₹{r.val.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white border border-surface-300 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-surface-200">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><FaHistory /> Transaction History</h2>
            <div className="flex gap-2">
              <button onClick={() => doExport(txRows, txCols, txRows, 'Transactions', 'transactions', 'excel')} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"><FaFileExcel /> Excel</button>
              <button onClick={() => doExport(txRows, txCols, txRows, 'Transactions', 'transactions', 'pdf')} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"><FaFilePdf /> PDF</button>
            </div>
          </div>
          {(wallet?.transactions?.length > 0) ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50"><tr>{txCols.map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-surface-100">
                  {[...wallet.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).map((t, i) => (
                    <tr key={i} className="hover:bg-surface-50">
                      <td className="px-4 py-3 text-gray-500">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.type === 'credit' ? 'bg-green-100 text-green-700' : t.type === 'refund' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{t.type.toUpperCase()}</span></td>
                      <td className={`px-4 py-3 font-semibold ${t.type === 'credit' || t.type === 'refund' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'credit' || t.type === 'refund' ? '+' : '-'}₹{t.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{t.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="py-12 text-center text-gray-400"><FaHistory className="text-3xl mx-auto mb-2" /><p className="text-sm">No transactions yet.</p></div>}
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="bg-white border border-surface-300 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-surface-200">
            <h2 className="font-semibold text-gray-800">Withdrawal History</h2>
            <div className="flex gap-2">
              <button onClick={() => doExport(wRows, wCols, wRows, 'Withdrawals', 'withdrawals', 'excel')} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"><FaFileExcel /> Excel</button>
              <button onClick={() => doExport(wRows, wCols, wRows, 'Withdrawals', 'withdrawals', 'pdf')} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"><FaFilePdf /> PDF</button>
            </div>
          </div>
          {withdrawals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50"><tr>{['Date','Gross','Platform Fee (5%)','Net Amount','Method','Status','Note'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-surface-100">
                  {withdrawals.map(w => (
                    <tr key={w._id} className="hover:bg-surface-50">
                      <td className="px-4 py-3 text-gray-500">{new Date(w.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 font-medium">₹{w.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-orange-600">-₹{w.platformFee.toFixed(2)}</td>
                      <td className="px-4 py-3 font-bold text-green-600">₹{w.netAmount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs uppercase text-gray-500">{w.payoutMethod?.type || '-'}</td>
                      <td className="px-4 py-3"><span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[w.status]}`}>{statusIcon[w.status]} {w.status}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-400">{w.status === 'rejected' ? (w.rejectionReason === 'Other' ? w.customRejectionReason : w.rejectionReason) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="py-12 text-center text-gray-400"><p className="text-sm">No withdrawal requests yet.</p></div>}
        </div>
      )}

      {/* Withdraw Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-surface-200">
              <h2 className="text-lg font-bold text-gray-800">Withdraw Funds</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl"><FaTimes /></button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FaRupeeSign /></span>
                  <input type="number" min="1" max={wallet?.pendingBalance || 0} value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-surface-300 rounded-lg focus:outline-none focus:border-primary-500 text-sm" placeholder={`Available: ₹${(wallet?.pendingBalance || 0).toFixed(2)}`} />
                </div>
                {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                  <div className="mt-3 bg-surface-50 rounded-lg p-3 space-y-1.5 text-sm border border-surface-200">
                    <div className="flex justify-between"><span className="text-gray-600">Gross Amount</span><span className="font-medium">₹{parseFloat(withdrawAmount).toFixed(2)}</span></div>
                    <div className="flex justify-between text-orange-600"><span>Platform Fee ({PLATFORM_FEE}%)</span><span>-₹{fee.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-green-600 border-t border-surface-200 pt-1.5"><span>You Receive</span><span>₹{net.toFixed(2)}</span></div>
                  </div>
                )}
              </div>

              {modalStep === 'select' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payout Method</label>
                  <div className="space-y-2">
                    {payoutMethods.map(m => (
                      <label key={m._id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedMethod?._id === m._id ? 'border-primary-500 bg-primary-50' : 'border-surface-300 hover:border-gray-400'}`}>
                        <input type="radio" name="pm" checked={selectedMethod?._id === m._id} onChange={() => setSelectedMethod(m)} className="accent-primary-500" />
                        {m.type === 'bank' ? <FaUniversity className="text-blue-500" /> : <FaMobileAlt className="text-green-500" />}
                        <div>
                          <p className="text-sm font-medium text-gray-700">{m.label}</p>
                          <p className="text-xs text-gray-400">{m.type === 'bank' ? `${m.bankName} • ${m.ifscCode}` : m.upiId}</p>
                        </div>
                      </label>
                    ))}
                    <button onClick={() => { setSelectedMethod(null); setModalStep('new'); }} className="w-full flex items-center gap-2 p-3 border-2 border-dashed border-surface-300 rounded-lg text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors">
                      <FaPlus /> Add New Payout Method
                    </button>
                  </div>
                </div>
              )}

              {modalStep === 'new' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-semibold text-gray-700">Method Type:</span>
                    <div className="flex rounded-lg border border-surface-300 overflow-hidden">
                      {[{ val: 'bank', label: 'Bank Account', icon: <FaUniversity /> }, { val: 'upi', label: 'UPI', icon: <FaMobileAlt /> }].map(t => (
                        <button key={t.val} onClick={() => setNewMethod(m => ({ ...m, type: t.val }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${newMethod.type === t.val ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-surface-50'}`}>
                          {t.icon}{t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {newMethod.type === 'bank' ? (
                    <>
                      {[{ k: 'accountHolderName', l: 'Account Holder Name *', p: 'Full name as on bank account' },
                        { k: 'bankName', l: 'Bank Name *', p: 'e.g. State Bank of India' },
                        { k: 'accountNumber', l: 'Account Number *', p: 'Enter account number' },
                        { k: 'ifscCode', l: 'IFSC Code *', p: 'e.g. SBIN0001234' },
                        { k: 'branchName', l: 'Branch Name *', p: 'e.g. Mumbai Main Branch' },
                        { k: 'upiId', l: 'UPI ID (Optional)', p: 'yourname@upi' }
                      ].map(f => (
                        <div key={f.k}>
                          <label className="block text-xs font-medium text-gray-700 mb-1">{f.l}</label>
                          <input value={newMethod[f.k]} onChange={e => setNewMethod(m => ({ ...m, [f.k]: e.target.value }))}
                            className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" placeholder={f.p} />
                        </div>
                      ))}
                    </>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">UPI ID *</label>
                      <input value={newMethod.upiId} onChange={e => setNewMethod(m => ({ ...m, upiId: e.target.value }))}
                        className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" placeholder="yourname@upi" />
                    </div>
                  )}
                  {payoutMethods.length > 0 && (
                    <button onClick={() => setModalStep('select')} className="text-xs text-primary-500 hover:underline">← Back to saved methods</button>
                  )}
                </div>
              )}
            </div>
            <div className="p-5 border-t border-surface-200 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-surface-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-surface-50">Cancel</button>
              <button onClick={handleSubmitWithdrawal} disabled={submitting || !withdrawAmount}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
