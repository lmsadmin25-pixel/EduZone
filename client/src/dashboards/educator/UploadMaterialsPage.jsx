import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaVideo, FaFilePdf, FaTrash, FaEdit, FaSave, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { HiBookOpen } from 'react-icons/hi';
import api from '../../services/api';

const emptyLesson = { title: '', videoUrl: '', pdfUrl: '', duration: '' };

const UploadMaterialsPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseData, setCourseData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [newLesson, setNewLesson] = useState(emptyLesson);
  const [editingId, setEditingId] = useState(null);
  const [editLesson, setEditLesson] = useState({});
  const [uploading, setUploading] = useState({ new: false, edit: false });
  const [saving, setSaving] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(false);

  // Load educator's courses
  useEffect(() => {
    api.get('/courses/educator/my-courses').then(r => setCourses(r.data || [])).catch(() => {});
  }, []);

  // Load selected course lessons
  useEffect(() => {
    if (!selectedCourse) { setCourseData(null); setLessons([]); return; }
    setLoadingCourse(true);
    api.get(`/courses/${selectedCourse}`)
      .then(r => { setCourseData(r.data); setLessons(r.data.lessons || []); })
      .catch(() => toast.error('Failed to load course'))
      .finally(() => setLoadingCourse(false));
  }, [selectedCourse]);

  // Upload a file (video or pdf) and return URL
  const uploadFile = async (file, type, key) => {
    const formData = new FormData();
    formData.append('file', file);
    const endpoint = type === 'video' ? '/upload/video' : '/upload/pdf';
    setUploading(prev => ({ ...prev, [key]: true }));
    try {
      const res = await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`${type === 'video' ? 'Video' : 'PDF'} uploaded!`);
      return res.data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
      return null;
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Handle file selection for new lesson
  const handleNewFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadFile(file, type, 'new');
    if (url) setNewLesson(prev => ({ ...prev, [type === 'video' ? 'videoUrl' : 'pdfUrl']: url }));
  };

  // Handle file selection for edit lesson
  const handleEditFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadFile(file, type, 'edit');
    if (url) setEditLesson(prev => ({ ...prev, [type === 'video' ? 'videoUrl' : 'pdfUrl']: url }));
  };

  // Add new lesson to course
  const handleAddLesson = async () => {
    if (!newLesson.title.trim()) return toast.error('Lesson title is required');
    if (!selectedCourse) return toast.error('Please select a course');
    setSaving(true);
    try {
      const res = await api.post(`/courses/${selectedCourse}/lessons`, newLesson);
      setLessons(res.data.course?.lessons || []);
      setNewLesson(emptyLesson);
      toast.success('Lesson added successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add lesson');
    } finally { setSaving(false); }
  };

  // Start editing a lesson
  const startEdit = (lesson) => {
    setEditingId(lesson._id);
    setEditLesson({ title: lesson.title, videoUrl: lesson.videoUrl, pdfUrl: lesson.pdfUrl, duration: lesson.duration });
  };

  // Save edited lesson
  const saveEdit = async (lessonId) => {
    setSaving(true);
    try {
      const res = await api.put(`/courses/${selectedCourse}/lessons/${lessonId}`, editLesson);
      setLessons(res.data.course?.lessons || []);
      setEditingId(null);
      toast.success('Lesson updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update lesson');
    } finally { setSaving(false); }
  };

  // Delete a lesson
  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      const res = await api.delete(`/courses/${selectedCourse}/lessons/${lessonId}`);
      setLessons(res.data.course?.lessons || []);
      toast.success('Lesson deleted');
    } catch { toast.error('Failed to delete lesson'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Course Lessons</h1>
        <p className="text-sm text-gray-500 mt-1">Add lessons, upload videos and PDFs — they'll be visible to enrolled students instantly</p>
      </div>

      {/* Course selector */}
      <div className="bg-white border border-surface-300 rounded-xl p-5 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Your Course</label>
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
          className="w-full max-w-md px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500">
          <option value="">Choose a course to manage lessons...</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      </div>

      {!selectedCourse && (
        <div className="text-center py-16 text-gray-400">
          <HiBookOpen className="text-5xl mx-auto mb-3 text-gray-300" />
          <p className="font-medium">Select a course above to manage its lessons</p>
        </div>
      )}

      {selectedCourse && loadingCourse && (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>
      )}

      {selectedCourse && !loadingCourse && (
        <div className="space-y-6">
          {/* Existing Lessons */}
          <div className="bg-white border border-surface-300 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-surface-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Lessons ({lessons.length})</h2>
              {courseData?.isPublished
                ? <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">● Published</span>
                : <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium">● Draft</span>}
            </div>

            {lessons.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">No lessons yet. Add your first lesson below.</div>
            ) : (
              <div className="divide-y divide-surface-100">
                {lessons.map((lesson, i) => (
                  <div key={lesson._id} className="p-4">
                    {editingId === lesson._id ? (
                      // Edit mode
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                          <input value={editLesson.title} onChange={e => setEditLesson(p => ({ ...p, title: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                            placeholder="Lesson title" />
                          <input value={editLesson.duration} onChange={e => setEditLesson(p => ({ ...p, duration: e.target.value }))}
                            className="w-28 px-3 py-2 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                            placeholder="e.g. 10 min" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-9">
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Replace Video</label>
                            <input type="file" accept="video/*" onChange={e => handleEditFileUpload(e, 'video')}
                              className="text-xs w-full" disabled={uploading.edit} />
                            {editLesson.videoUrl && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><FaCheckCircle /> Video ready</p>}
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Replace PDF</label>
                            <input type="file" accept=".pdf,.doc,.docx" onChange={e => handleEditFileUpload(e, 'pdf')}
                              className="text-xs w-full" disabled={uploading.edit} />
                            {editLesson.pdfUrl && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><FaCheckCircle /> PDF ready</p>}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-9">
                          <button onClick={() => saveEdit(lesson._id)} disabled={saving || uploading.edit}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-xs rounded-lg hover:bg-primary-600 disabled:opacity-50 font-semibold">
                            <FaSave /> {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="flex items-center gap-1.5 px-4 py-2 border border-surface-300 text-gray-600 text-xs rounded-lg hover:bg-surface-50">
                            <FaTimes /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm">{lesson.title}</p>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {lesson.videoUrl
                              ? <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"><FaVideo className="text-[10px]" /> Video</span>
                              : <span className="flex items-center gap-1 text-xs text-gray-400 bg-surface-100 px-2 py-0.5 rounded-full"><FaVideo className="text-[10px]" /> No video</span>}
                            {lesson.pdfUrl
                              ? <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><FaFilePdf className="text-[10px]" /> PDF</span>
                              : null}
                            {lesson.duration && <span className="text-xs text-gray-500">{lesson.duration}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => startEdit(lesson)} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"><FaEdit className="text-sm" /></button>
                          <button onClick={() => deleteLesson(lesson._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FaTrash className="text-sm" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Lesson */}
          <div className="bg-white border border-surface-300 rounded-xl p-5">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FaPlus className="text-primary-500" /> Add New Lesson</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Lesson Title *</label>
                  <input value={newLesson.title} onChange={e => setNewLesson(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Introduction to HTML"
                    className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
                  <input value={newLesson.duration} onChange={e => setNewLesson(p => ({ ...p, duration: e.target.value }))}
                    placeholder="e.g. 15 min"
                    className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-surface-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaVideo className="text-blue-500" />
                    <label className="text-xs font-semibold text-gray-700">Upload Video</label>
                  </div>
                  <input type="file" accept="video/*" onChange={e => handleNewFileUpload(e, 'video')}
                    className="text-xs w-full" disabled={uploading.new} />
                  {newLesson.videoUrl && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium"><FaCheckCircle /> Video uploaded & ready</p>
                  )}
                  {uploading.new && <p className="text-xs text-blue-500 mt-1 animate-pulse">Uploading...</p>}
                </div>

                <div className="border border-surface-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaFilePdf className="text-red-500" />
                    <label className="text-xs font-semibold text-gray-700">Upload PDF / Notes</label>
                  </div>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={e => handleNewFileUpload(e, 'pdf')}
                    className="text-xs w-full" disabled={uploading.new} />
                  {newLesson.pdfUrl && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium"><FaCheckCircle /> PDF uploaded & ready</p>
                  )}
                </div>
              </div>

              <button onClick={handleAddLesson} disabled={saving || uploading.new || !newLesson.title.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors">
                <FaPlus /> {saving ? 'Adding...' : 'Add Lesson to Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadMaterialsPage;
