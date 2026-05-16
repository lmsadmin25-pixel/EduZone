import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CourseFormPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Web Development', price: 0,
    level: 'Beginner', language: 'English', thumbnail: '', isPublished: false
  });

  const categories = ['Web Development','Mobile Development','Data Science','Machine Learning','Cyber Security','Cloud Computing','Database','Programming','Design','Other'];

  const handleUploadThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ ...form, thumbnail: res.data.url });
      toast.success('Thumbnail uploaded');
    } catch { toast.error('Upload failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/courses', form);
      toast.success('Course created!');
      navigate('/educator/courses');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const u = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Course</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-surface-300 rounded-lg p-6 max-w-3xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
          <input type="text" required value={form.title} onChange={e => u('title', e.target.value)}
            className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea required value={form.description} onChange={e => u('description', e.target.value)} rows={4}
            className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={e => u('category', e.target.value)} className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select value={form.level} onChange={e => u('level', e.target.value)} className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm">
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input type="number" min={0} value={form.price} onChange={e => u('price', Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
          <input type="file" accept="image/*" onChange={handleUploadThumbnail} className="text-sm" />
          {form.thumbnail && <img src={form.thumbnail} alt="Thumb" className="mt-2 h-24 rounded" />}
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.isPublished} onChange={e => u('isPublished', e.target.checked)} id="publish" />
          <label htmlFor="publish" className="text-sm text-gray-700">Publish immediately</label>
        </div>
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Course'}
        </button>
      </form>
    </div>
  );
};

export default CourseFormPage;
