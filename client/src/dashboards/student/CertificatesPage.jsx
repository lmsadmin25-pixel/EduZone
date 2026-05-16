import { useState, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';
import api from '../../services/api';

const CertificatesPage = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/certificates/my').then(r => setCerts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Certificates</h1>
      {certs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certs.map(c => (
            <div key={c._id} className="bg-white border border-surface-300 rounded-lg p-5 text-center">
              <div className="w-16 h-16 bg-accent-50 text-accent-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">🏆</div>
              <h3 className="font-semibold text-gray-800">{c.course?.title}</h3>
              <p className="text-xs text-gray-500 mt-1">By {c.course?.educator?.name}</p>
              <p className="text-xs text-gray-400 mt-1">ID: {c.certificateId}</p>
              <p className="text-xs text-gray-400">Issued: {new Date(c.issuedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-surface-300 rounded-lg">
          <p className="text-gray-400">No certificates yet. Complete a course to earn one!</p>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
