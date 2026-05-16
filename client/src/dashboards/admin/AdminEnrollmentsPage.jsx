import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminEnrollmentsPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/enrollments').then(r => setEnrollments(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = enrollments.filter(e =>
    (e.student?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.course?.title || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Enrollment Tracking</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-surface-300 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{enrollments.length}</p>
          <p className="text-xs text-gray-500">Total Enrollments</p>
        </div>
        <div className="bg-white border border-surface-300 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{enrollments.filter(e => e.progress === 100).length}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div className="bg-white border border-surface-300 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{enrollments.filter(e => e.progress < 100).length}</p>
          <p className="text-xs text-gray-500">In Progress</p>
        </div>
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Search by student or course..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
      </div>

      <div className="bg-white border border-surface-300 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Course</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Progress</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Enrolled</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e._id} className="border-t border-surface-200">
                <td className="px-4 py-3 font-medium">{e.student?.name || 'N/A'}</td>
                <td className="px-4 py-3 text-gray-600">{e.course?.title || 'N/A'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-surface-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${e.progress === 100 ? 'bg-green-500' : 'bg-primary-500'}`} style={{ width: `${e.progress || 0}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{e.progress || 0}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(e.enrolledAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${e.progress === 100 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {e.progress === 100 ? 'Completed' : 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <p className="text-center py-8 text-gray-400">No enrollments found</p>}
      </div>
    </div>
  );
};

export default AdminEnrollmentsPage;
