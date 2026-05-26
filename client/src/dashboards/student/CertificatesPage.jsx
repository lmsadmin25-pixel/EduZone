import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaDownload, FaTrophy, FaMedal, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { HiAcademicCap } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CertificatesPage = () => {
  const { user } = useAuth();
  const [certs, setCerts] = useState([]);
  const [completedEnrollments, setCompletedEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});
  const [selectedCert, setSelectedCert] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const load = async () => {
      try {
        const [certRes, enrollRes] = await Promise.all([
          api.get('/certificates/my'),
          api.get('/enrollments/my')
        ]);
        const myCerts = certRes.data || [];
        const allEnrollments = enrollRes.data || [];
        // Normalise to strings so Set.has() works regardless of ObjectId vs string
        const certCourseIds = new Set(myCerts.map(c => (c.course?._id || c.course)?.toString()));
        const needsCert = allEnrollments.filter(e =>
          e.progress === 100 && !certCourseIds.has((e.course?._id || e.course)?.toString())
        );
        setCerts(myCerts);
        setCompletedEnrollments(needsCert);
      } catch { toast.error('Failed to load certificates'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleGenerate = async (courseId) => {
    setGenerating(prev => ({ ...prev, [courseId]: true }));
    try {
      const res = await api.post('/certificates/generate', { courseId });
      const newCert = res.data.certificate;
      // Fetch full cert with populated fields
      const fullRes = await api.get(`/certificates/${newCert._id}`);
      setCerts(prev => [fullRes.data, ...prev]);
      setCompletedEnrollments(prev =>
        prev.filter(e => (e.course?._id || e.course)?.toString() !== courseId.toString())
      );
      toast.success('🎉 Certificate generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setGenerating(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const downloadCert = (cert) => {
    setSelectedCert(cert);
    setTimeout(() => window.print(), 300);
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Certificates</h1>
        <p className="text-sm text-gray-500 mt-1">Your earned certificates for completed courses</p>
      </div>

      {/* Ready to generate */}
      {completedEnrollments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            🎓 Ready to Claim
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedEnrollments.map(e => {
              const courseId = e.course?._id || e.course;
              const title = e.course?.title || 'Course';
              return (
                <div key={courseId} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mb-3">
                    <FaCheckCircle />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{title}</h3>
                  <p className="text-xs text-green-600 font-medium mb-4">100% Completed</p>
                  <button
                    onClick={() => handleGenerate(courseId)}
                    disabled={generating[courseId]}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors w-full justify-center">
                    {generating[courseId]
                      ? <><FaSpinner className="animate-spin" /> Generating...</>
                      : <><FaMedal /> Generate Certificate</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Existing Certificates */}
      {certs.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            🏆 Earned Certificates ({certs.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certs.map(c => (
              <div key={c._id}
                className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                {/* Certificate Header */}
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-3xl mb-3 shadow-md">
                    🏆
                  </div>
                  <p className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-1">Certificate of Completion</p>
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">{c.course?.title || 'Course'}</h3>
                  <p className="text-xs text-gray-500 mt-1">By {c.course?.educator?.name || 'EduZone'}</p>
                </div>

                <div className="mt-auto space-y-1 text-center border-t border-surface-100 pt-3">
                  <p className="text-xs text-gray-400">Certificate ID</p>
                  <p className="text-xs font-mono text-primary-600 font-semibold">{c.certificateId}</p>
                  <p className="text-xs text-gray-400">Issued: {new Date(c.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                <button
                  onClick={() => downloadCert(c)}
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-primary-500 text-white text-xs font-semibold rounded-lg hover:bg-primary-600 transition-colors">
                  <FaDownload /> Download Certificate
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : completedEnrollments.length === 0 ? (
        <div className="text-center py-16 bg-white border border-surface-300 rounded-xl">
          <HiAcademicCap className="text-6xl text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-500">No certificates yet</p>
          <p className="text-sm text-gray-400 mt-1">Complete all lessons in a course to earn your certificate</p>
        </div>
      ) : null}

      {/* Printable Certificate — hidden on screen, visible on print */}
      {selectedCert && (
        <div className="hidden print:block" ref={printRef}>
          <div style={{
            width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: 'Georgia, serif', background: '#fff'
          }}>
            <div style={{
              border: '12px double #1E3A5F', padding: '60px', textAlign: 'center',
              maxWidth: '800px', width: '100%', position: 'relative'
            }}>
              <p style={{ fontSize: '14px', color: '#F4B400', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '8px' }}>EduZone Learning Platform</p>
              <h1 style={{ fontSize: '40px', color: '#1E3A5F', fontWeight: 'bold', margin: '10px 0' }}>Certificate of Completion</h1>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>This is to certify that</p>
              <h2 style={{ fontSize: '32px', color: '#1E3A5F', borderBottom: '2px solid #F4B400', display: 'inline-block', paddingBottom: '8px', marginBottom: '20px' }}>
                {user?.name || 'Student'}
              </h2>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '10px' }}>has successfully completed the course</p>
              <h3 style={{ fontSize: '24px', color: '#F4B400', fontWeight: 'bold', margin: '10px 0 30px' }}>
                {selectedCert.course?.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#888', marginBottom: '6px' }}>
                Instructed by: <strong>{selectedCert.course?.educator?.name || 'EduZone Educator'}</strong>
              </p>
              <p style={{ fontSize: '14px', color: '#888', marginBottom: '30px' }}>
                Issued on: {new Date(selectedCert.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <div style={{ borderTop: '1px solid #ddd', paddingTop: '20px', fontSize: '12px', color: '#aaa' }}>
                Certificate ID: {selectedCert.certificateId} | Verify at: eduzone-zjnk.onrender.com
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body > *:not(.print\\:block) { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default CertificatesPage;
