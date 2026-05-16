import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ManageCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/courses/educator/my-courses').then(r => setCourses(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses(prev => prev.filter(c => c._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
        <Link to="/educator/create-course" className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600">+ Create Course</Link>
      </div>
      <div className="bg-white border border-surface-300 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Students</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c._id} className="border-t border-surface-200">
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3 text-gray-500">{c.category}</td>
                <td className="px-4 py-3">{c.isFree ? 'Free' : `₹${c.price}`}</td>
                <td className="px-4 py-3">{c.enrolledStudents}</td>
                <td className="px-4 py-3"><span className={`text-xs font-medium ${c.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>{c.isPublished ? 'Published' : 'Draft'}</span></td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={() => handleDelete(c._id)} className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!courses.length && <p className="text-center py-8 text-gray-400">No courses yet</p>}
      </div>
    </div>
  );
};

export default ManageCoursesPage;
