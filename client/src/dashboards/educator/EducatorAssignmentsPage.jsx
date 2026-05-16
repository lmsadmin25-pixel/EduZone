import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const EducatorAssignmentsPage = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', course: '', dueDate: '', totalMarks: 100 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const cRes = await api.get('/courses/educator/my-courses');
        setCourses(cRes.data);
        const allA = [];
        for (const c of cRes.data) {
          try { const a = await api.get(`/assignments/course/${c._id}`); allA.push(...a.data); } catch {}
        }
        setAssignments(allA);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await api.post('/assignments', form);
      setAssignments(prev => [res.data.assignment, ...prev]);
      setForm({ title: '', description: '', course: '', dueDate: '', totalMarks: 100 });
      toast.success('Assignment created');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCreating(false); }
  };

  const viewSubmissions = async (id) => {
    try {
      const res = await api.get(`/assignments/${id}/submissions`);
      setSubmissions(res.data);
      setSelectedAssignment(id);
    } catch { toast.error('Failed to load'); }
  };

  const gradeSubmission = async (subId, marks, feedback) => {
    try {
      await api.put(`/assignments/submissions/${subId}/grade`, { marks, feedback });
      setSubmissions(prev => prev.map(s => s._id === subId ? { ...s, marks, feedback, isGraded: true } : s));
      toast.success('Graded!');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Assignments</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create */}
        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Create Assignment</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <select value={form.course} onChange={e => setForm({...form, course: e.target.value})} required className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm">
              <option value="">Select Course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
            <input type="text" required placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" />
            <textarea required placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" />
            <div className="flex gap-3">
              <input type="date" required value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="flex-1 px-3 py-2.5 border border-surface-300 rounded-lg text-sm" />
              <input type="number" placeholder="Marks" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: Number(e.target.value)})} className="w-24 px-3 py-2.5 border border-surface-300 rounded-lg text-sm" />
            </div>
            <button type="submit" disabled={creating} className="w-full py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Assignment'}
            </button>
          </form>
        </div>

        {/* List & Submissions */}
        <div className="space-y-4">
          <div className="bg-white border border-surface-300 rounded-lg p-5">
            <h2 className="font-semibold text-gray-800 mb-3">All Assignments</h2>
            {assignments.map(a => (
              <div key={a._id} className="flex justify-between items-center py-3 border-b border-surface-200 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-400">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                </div>
                <button onClick={() => viewSubmissions(a._id)} className="text-xs px-3 py-1 bg-primary-50 text-primary-600 rounded hover:bg-primary-100">View Submissions</button>
              </div>
            ))}
            {!assignments.length && <p className="text-gray-400 text-sm">No assignments</p>}
          </div>

          {selectedAssignment && (
            <div className="bg-white border border-surface-300 rounded-lg p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Submissions</h2>
              {submissions.map(s => (
                <div key={s._id} className="py-3 border-b border-surface-200 last:border-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{s.student?.name}</p>
                      <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 hover:underline">View File</a>
                    </div>
                    {s.isGraded ? (
                      <span className="text-sm text-green-600 font-medium">{s.marks} marks</span>
                    ) : (
                      <div className="flex gap-2">
                        <input type="number" placeholder="Marks" id={`m-${s._id}`} className="w-16 px-2 py-1 border border-surface-300 rounded text-xs" />
                        <button onClick={() => gradeSubmission(s._id, Number(document.getElementById(`m-${s._id}`).value), 'Graded')}
                          className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Grade</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {!submissions.length && <p className="text-gray-400 text-sm">No submissions yet</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducatorAssignmentsPage;
