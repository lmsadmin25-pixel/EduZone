import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/courses').then(r => setCourses(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">All Courses</h1>
      <div className="bg-white border border-surface-300 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Educator</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Students</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rating</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c._id} className="border-t border-surface-200">
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3 text-gray-500">{c.educator?.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.category}</td>
                <td className="px-4 py-3">{c.isFree ? 'Free' : `₹${c.price}`}</td>
                <td className="px-4 py-3">{c.enrolledStudents}</td>
                <td className="px-4 py-3">{c.rating?.toFixed(1) || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${c.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>{c.isPublished ? 'Published' : 'Draft'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!courses.length && <p className="text-center py-8 text-gray-400">No courses</p>}
      </div>
    </div>
  );
};

export default AdminCoursesPage;
