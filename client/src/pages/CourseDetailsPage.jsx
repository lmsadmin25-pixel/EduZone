import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaPlay, FaFilePdf, FaClock, FaUsers, FaBookOpen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, reviewRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/reviews/course/${id}`)
        ]);
        setCourse(courseRes.data);
        setReviews(reviewRes.data);
      } catch { toast.error('Failed to load'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    if (role !== 'student') return toast.info('Only students can enroll');
    try {
      setEnrolling(true);
      if (course.isFree) {
        await api.post('/enrollments', { courseId: id });
        toast.success('Enrolled!');
        navigate('/student/my-courses');
      } else {
        const { data } = await api.post('/payments/create-order', { courseId: id });
        const rzp = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID, amount: data.amount,
          currency: data.currency, name: 'EduZone', order_id: data.orderId,
          handler: async (r) => { await api.post('/payments/verify', r); toast.success('Enrolled!'); navigate('/student/my-courses'); },
          theme: { color: '#1E3A5F' }
        });
        rzp.open();
      }
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setEnrolling(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;
  if (!course) return <div className="text-center py-20 text-gray-400">Not found</div>;

  return (
    <div>
      <section className="bg-primary-500 text-white section-padding py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <span className="text-sm bg-accent-500 text-primary-900 px-3 py-1 rounded-full font-medium">{course.category}</span>
            <h1 className="text-3xl font-bold mt-3">{course.title}</h1>
            <p className="text-primary-200 mt-3">{course.description}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-primary-200">
              <span className="flex items-center gap-1"><FaStar className="text-accent-500" /> {course.rating?.toFixed(1)} ({course.reviewCount})</span>
              <span className="flex items-center gap-1"><FaUsers /> {course.enrolledStudents} students</span>
              <span className="flex items-center gap-1"><FaBookOpen /> {course.lessons?.length} lessons</span>
            </div>
            <p className="mt-3 text-sm">By <strong>{course.educator?.name}</strong></p>
          </div>
          <div className="bg-white rounded-lg p-6 text-gray-800">
            <div className="h-40 bg-surface-200 rounded-lg overflow-hidden mb-4">
              {course.thumbnail ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-surface-400">No Image</div>}
            </div>
            <div className="text-3xl font-bold text-primary-500 mb-4">{course.isFree ? 'Free' : `₹${course.price}`}</div>
            <button onClick={handleEnroll} disabled={enrolling} className="w-full py-3 bg-accent-500 text-primary-900 font-semibold rounded-lg hover:bg-accent-400 disabled:opacity-50">
              {enrolling ? 'Processing...' : course.isFree ? 'Enroll Free' : 'Buy Now'}
            </button>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Curriculum</h2>
          <div className="space-y-2">
            {course.lessons?.map((l, i) => (
              <div key={i} className="border border-surface-300 rounded-lg p-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center text-sm font-semibold">{i+1}</span>
                <span className="font-medium text-gray-700 flex-1">{l.title}</span>
                {l.duration && <span className="text-xs text-gray-400"><FaClock className="inline mr-1" />{l.duration}</span>}
              </div>
            ))}
            {!course.lessons?.length && <p className="text-gray-400">No lessons yet</p>}
          </div>

          <h2 className="text-xl font-bold mt-10 mb-4">Reviews</h2>
          {reviews.length ? reviews.map(r => (
            <div key={r._id} className="border border-surface-300 rounded-lg p-4 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <strong className="text-sm">{r.student?.name}</strong>
                <div className="flex text-accent-500 text-xs">{[...Array(r.rating)].map((_,i)=><FaStar key={i}/>)}</div>
              </div>
              <p className="text-sm text-gray-600">{r.comment}</p>
            </div>
          )) : <p className="text-gray-400 text-sm">No reviews yet</p>}
        </div>
      </section>
    </div>
  );
};

export default CourseDetailsPage;
