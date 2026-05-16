import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MyCoursesPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments/my').then(r => setEnrollments(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Courses</h1>
      {enrollments.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map(e => (
            <div key={e._id} className="bg-white border border-surface-300 rounded-lg overflow-hidden">
              <div className="h-36 bg-surface-200">
                {e.course?.thumbnail && <img src={e.course.thumbnail} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{e.course?.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{e.course?.educator?.name}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span><span>{e.progress}%</span>
                  </div>
                  <div className="w-full bg-surface-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${e.progress === 100 ? 'bg-green-500' : 'bg-primary-500'}`} style={{ width: `${e.progress}%` }} />
                  </div>
                </div>
                <Link to={`/student/course/${e.course?._id}`}
                  className="block text-center mt-3 py-2 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                  {e.progress === 100 ? 'Review' : 'Continue Learning'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-surface-300 rounded-lg">
          <p className="text-gray-400">No courses enrolled yet</p>
          <Link to="/courses" className="text-primary-500 text-sm hover:underline mt-2 inline-block">Browse Courses</Link>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
