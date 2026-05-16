import { useState, useEffect } from 'react';
import api from '../../services/api';

const EducatorStudentsPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/educator/my-courses').then(r => setCourses(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadStudents = async (courseId) => {
    setSelectedCourse(courseId);
    try {
      const res = await api.get(`/enrollments/${courseId}/students`);
      setStudents(res.data);
    } catch { setStudents([]); }
  };

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Students</h1>
      <div className="mb-4">
        <select value={selectedCourse} onChange={e => loadStudents(e.target.value)} className="px-4 py-2.5 border border-surface-300 rounded-lg text-sm">
          <option value="">Select a course to view students</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.title} ({c.enrolledStudents} students)</option>)}
        </select>
      </div>

      {selectedCourse && (
        <div className="bg-white border border-surface-300 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Progress</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id} className="border-t border-surface-200">
                  <td className="px-4 py-3 font-medium">{s.student?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.student?.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-surface-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${s.progress === 100 ? 'bg-green-500' : 'bg-primary-500'}`} style={{ width: `${s.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{s.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(s.enrolledAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!students.length && <p className="text-center py-8 text-gray-400">No students enrolled</p>}
        </div>
      )}
    </div>
  );
};

export default EducatorStudentsPage;
