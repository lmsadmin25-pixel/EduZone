import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaVideo, FaFilePdf, FaFileAlt, FaCheck } from 'react-icons/fa';
import api from '../../services/api';

const UploadMaterialsPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [uploadType, setUploadType] = useState('video');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    api.get('/courses/educator/my-courses').then(r => setCourses(r.data || [])).catch(() => {});
  }, []);

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file');
    if (!selectedCourse) return toast.error('Please select a course');

    const formData = new FormData();
    formData.append('file', file);

    const endpoints = { video: '/upload/video', pdf: '/upload/pdf', image: '/upload/image' };

    try {
      setUploading(true);
      const res = await api.post(endpoints[uploadType], formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadedFiles(prev => [{ type: uploadType, url: res.data.url, name: file.name, date: new Date().toLocaleDateString() }, ...prev]);
      toast.success(`${uploadType} uploaded successfully!`);
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const types = [
    { key: 'video', label: 'Video', icon: <FaVideo />, accept: 'video/*', color: 'text-blue-600 bg-blue-50' },
    { key: 'pdf', label: 'PDF / Notes', icon: <FaFilePdf />, accept: '.pdf,.doc,.docx', color: 'text-red-600 bg-red-50' },
    { key: 'image', label: 'Image', icon: <FaFileAlt />, accept: 'image/*', color: 'text-green-600 bg-green-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload Materials</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="bg-white border border-surface-300 rounded-lg p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Upload to Cloudinary</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500">
                <option value="">Choose course...</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
              <div className="grid grid-cols-3 gap-2">
                {types.map(t => (
                  <button key={t.key} onClick={() => setUploadType(t.key)}
                    className={`p-3 rounded-lg border text-center text-sm font-medium transition-colors
                    ${uploadType === t.key ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-300 hover:border-primary-300'}`}>
                    <span className={`text-xl flex justify-center mb-1 ${t.color} w-8 h-8 rounded-full items-center mx-auto`}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-2 border-dashed border-surface-300 rounded-lg p-8 text-center hover:border-primary-300 transition-colors">
              <FaCloudUploadAlt className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-3">
                {file ? file.name : 'Click to select or drag & drop your file'}
              </p>
              <input type="file" accept={types.find(t => t.key === uploadType)?.accept}
                onChange={e => setFile(e.target.files[0])}
                className="text-sm" />
            </div>

            <button onClick={handleUpload} disabled={uploading || !file}
              className="w-full py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors">
              {uploading ? 'Uploading...' : 'Upload Material'}
            </button>
          </div>
        </div>

        {/* Upload History */}
        <div className="bg-white border border-surface-300 rounded-lg p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Recently Uploaded</h2>
          {uploadedFiles.length > 0 ? (
            <div className="space-y-3">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                    <FaCheck />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                    <p className="text-xs text-gray-500">{f.type.toUpperCase()} • {f.date}</p>
                  </div>
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 hover:underline">View</a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FaCloudUploadAlt className="text-4xl mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No files uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadMaterialsPage;
