import { useState, useEffect } from 'react';
import api from '../../services/api';

const AssignmentsPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const enrollRes = await api.get('/enrollments/my');
        setEnrollments(enrollRes.data);
        const allAssignments = [];
        for (const e of enrollRes.data) {
          try {
            const aRes = await api.get(`/assignments/course/${e.course?._id}`);
            allAssignments.push(...aRes.data.map(a => ({ ...a, courseName: e.course?.title })));
          } catch {}
        }
        setAssignments(allAssignments);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload/pdf', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFileUrl(res.data.url);
    } catch { alert('Upload failed'); }
  };

  const handleSubmit = async (assignmentId) => {
    if (!fileUrl) return alert('Please upload a file first');
    try {
      setSubmitting(assignmentId);
      await api.post(`/assignments/${assignmentId}/submit`, { fileUrl });
      alert('Submitted!');
      setFileUrl('');
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(null); }
  };

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Assignments</h1>

      {assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map(a => (
            <div key={a._id} className="bg-white border border-surface-300 rounded-lg p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{a.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{a.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Course: {a.courseName}</span>
                    <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                    <span>Marks: {a.totalMarks}</span>
                  </div>
                  {a.attachmentUrl && (
                    <a href={a.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-500 hover:underline mt-2 inline-block">
                      📎 Download Attachment
                    </a>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium
                  ${new Date(a.dueDate) < new Date() ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {new Date(a.dueDate) < new Date() ? 'Overdue' : 'Open'}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-surface-200 flex flex-wrap items-center gap-3">
                <input type="file" onChange={handleUpload} className="text-sm" />
                <button onClick={() => handleSubmit(a._id)} disabled={submitting === a._id}
                  className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50">
                  {submitting === a._id ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-surface-300 rounded-lg">
          <p className="text-gray-400">No assignments yet</p>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
