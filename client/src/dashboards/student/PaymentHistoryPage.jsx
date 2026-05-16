import { useState, useEffect } from 'react';
import api from '../../services/api';

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/history').then(r => setPayments(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment History</h1>
      <div className="bg-white border border-surface-300 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Course</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p._id} className="border-t border-surface-200">
                <td className="px-4 py-3 font-medium">{p.course?.title || 'N/A'}</td>
                <td className="px-4 py-3">₹{p.amount}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!payments.length && <p className="text-center py-8 text-gray-400">No payment records</p>}
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
