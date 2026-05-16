import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaBookOpen, FaCheckCircle, FaClipboardList, FaClock, FaCertificate, FaChartLine, FaPlay } from 'react-icons/fa';
import api from '../../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ enrolledCourses: 0, completedCourses: 0, pendingAssignments: 0, upcomingTests: 0, certificates: 0, overallProgress: 0 });
  const [enrollments, setEnrollments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [enrollRes, notifRes] = await Promise.all([
          api.get('/enrollments/my').catch(() => ({ data: [] })),
          api.get('/notifications').catch(() => ({ data: { notifications: [] } }))
        ]);

        const myEnrollments = enrollRes.data || [];
        setEnrollments(myEnrollments);
        setNotifications((notifRes.data?.notifications || []).slice(0, 5));

        const completed = myEnrollments.filter(e => e.progress === 100).length;
        const total = myEnrollments.length;
        const avgProgress = total ? Math.round(myEnrollments.reduce((s, e) => s + (e.progress || 0), 0) / total) : 0;

        setStats({
          enrolledCourses: total,
          completedCourses: completed,
          pendingAssignments: 0,
          upcomingTests: 0,
          certificates: completed,
          overallProgress: avgProgress
        });

        // Get recommendations
        try {
          const recRes = await api.get('/ai/recommendations');
          setRecommendations(recRes.data?.recommendations || []);
        } catch {}
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const cards = [
    { title: 'Enrolled Courses', value: stats.enrolledCourses, icon: <FaBookOpen />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Completed Courses', value: stats.completedCourses, icon: <FaCheckCircle />, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Pending Assignments', value: stats.pendingAssignments, icon: <FaClipboardList />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Upcoming Tests', value: stats.upcomingTests, icon: <FaClock />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Certificates Earned', value: stats.certificates, icon: <FaCertificate />, color: 'text-accent-600', bg: 'bg-accent-50' },
    { title: 'Overall Progress', value: `${stats.overallProgress}%`, icon: <FaChartLine />, color: 'text-primary-600', bg: 'bg-primary-50' },
  ];

  const activityData = [
    { day: 'Mon', hours: 2.5 }, { day: 'Tue', hours: 3 }, { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 4 }, { day: 'Fri', hours: 2 }, { day: 'Sat', hours: 5 }, { day: 'Sun', hours: 1 },
  ];

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-sm text-gray-500 mt-1">Here's your learning progress overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white border border-surface-300 rounded-lg p-4">
            <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-lg flex items-center justify-center text-lg mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 bg-white border border-surface-300 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Continue Learning</h2>
            <Link to="/student/my-courses" className="text-sm text-primary-500 hover:underline">View All</Link>
          </div>
          {enrollments.filter(e => e.progress < 100).slice(0, 4).length > 0 ? (
            <div className="space-y-3">
              {enrollments.filter(e => e.progress < 100).slice(0, 4).map(e => (
                <Link key={e._id} to={`/student/course/${e.course?._id}`}
                  className="flex items-center gap-4 p-3 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaPlay className="text-primary-500 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{e.course?.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-surface-200 rounded-full h-1.5">
                        <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${e.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{e.progress}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No courses in progress</p>
              <Link to="/courses" className="text-sm text-primary-500 hover:underline mt-2 inline-block">Browse Courses →</Link>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Notifications</h2>
            <Link to="/student/notifications" className="text-sm text-primary-500 hover:underline">All</Link>
          </div>
          <div className="space-y-3">
            {notifications.length > 0 ? notifications.map(n => (
              <div key={n._id} className={`p-3 rounded-lg text-sm ${!n.isRead ? 'bg-blue-50' : 'bg-surface-50'}`}>
                <p className="font-medium text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message?.substring(0, 60)}...</p>
              </div>
            )) : <p className="text-gray-400 text-sm text-center py-4">No notifications</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Learning Activity Graph */}
        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Learning Activity (Hours)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="hours" fill="#1E3A5F" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recommended Courses */}
        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Recommended for You</h2>
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.slice(0, 4).map(r => (
                <Link key={r._id} to={`/courses/${r._id}`}
                  className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors">
                  <img src={r.thumbnail || '/vite.svg'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{r.title}</p>
                    <p className="text-xs text-gray-500">{r.category} • {r.isFree ? 'Free' : `₹${r.price}`}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">Enroll in courses to get AI recommendations</p>
              <Link to="/courses" className="text-sm text-primary-500 hover:underline mt-2 inline-block">Explore Courses →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
