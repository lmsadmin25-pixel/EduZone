import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ManageStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/students').then(r => setStudents(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleBlock = async (id, isBlocked) => {
    try {
      await api.put(`/admin/users/${id}/block`, { userType: 'Student' });
      setStudents(prev => prev.map(s => s._id === id ? { ...s, isBlocked: !isBlocked } : s));
      toast.success(isBlocked ? 'Unblocked' : 'Blocked');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Students</h1>
      <div className="bg-white border border-surface-300 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Enrolled</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id} className="border-t border-surface-200">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-gray-500">{s.email}</td>
                <td className="px-4 py-3 text-gray-500">{s.enrolledCourses?.length || 0}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${s.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                    {s.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleBlock(s._id, s.isBlocked)} className={`text-xs px-3 py-1 rounded text-white ${s.isBlocked ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'}`}>
                    {s.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!students.length && <p className="text-center py-8 text-gray-400">No students found</p>}
      </div>
    </div>
  );
};

export default ManageStudentsPage;
