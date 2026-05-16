import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ManageEducatorsPage = () => {
  const [educators, setEducators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/educators').then(r => setEducators(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/educators/${id}/approve`);
      setEducators(prev => prev.map(e => e._id === id ? { ...e, isApproved: true } : e));
      toast.success('Educator approved');
    } catch { toast.error('Failed'); }
  };

  const handleBlock = async (id, isBlocked) => {
    try {
      await api.put(`/admin/users/${id}/block`, { userType: 'Educator' });
      setEducators(prev => prev.map(e => e._id === id ? { ...e, isBlocked: !isBlocked } : e));
      toast.success(isBlocked ? 'Unblocked' : 'Blocked');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Educators</h1>
      <div className="bg-white border border-surface-300 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Qualification</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {educators.map(e => (
              <tr key={e._id} className="border-t border-surface-200">
                <td className="px-4 py-3 font-medium">{e.name}</td>
                <td className="px-4 py-3 text-gray-500">{e.email}</td>
                <td className="px-4 py-3 text-gray-500">{e.qualification}</td>
                <td className="px-4 py-3">
                  {e.isBlocked ? <span className="text-red-600 text-xs font-medium">Blocked</span>
                    : e.isApproved ? <span className="text-green-600 text-xs font-medium">Approved</span>
                    : <span className="text-yellow-600 text-xs font-medium">Pending</span>}
                </td>
                <td className="px-4 py-3 space-x-2">
                  {!e.isApproved && <button onClick={() => handleApprove(e._id)} className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Approve</button>}
                  <button onClick={() => handleBlock(e._id, e.isBlocked)} className={`text-xs px-3 py-1 rounded ${e.isBlocked ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'} text-white`}>
                    {e.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!educators.length && <p className="text-center py-8 text-gray-400">No educators found</p>}
      </div>
    </div>
  );
};

export default ManageEducatorsPage;
