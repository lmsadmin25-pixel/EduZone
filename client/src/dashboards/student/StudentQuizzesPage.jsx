import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaQuestionCircle, FaCheckCircle } from 'react-icons/fa';
import api from '../../services/api';

const StudentQuizzesPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const enrollRes = await api.get('/enrollments/my');
        setEnrollments(enrollRes.data || []);
        const allTests = [];
        for (const e of enrollRes.data || []) {
          try {
            const tRes = await api.get(`/tests/course/${e.course?._id}`);
            allTests.push(...(tRes.data || []).map(t => ({ ...t, courseName: e.course?.title })));
          } catch {}
        }
        setTests(allTests);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quizzes & Tests</h1>

      {tests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map(t => (
            <div key={t._id} className="bg-white border border-surface-300 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-lg">
                  <FaQuestionCircle />
                </div>
                <span className="text-xs px-2 py-1 bg-primary-50 text-primary-600 rounded-full font-medium">
                  {t.questions?.length || 0} Qs
                </span>
              </div>
              <h3 className="font-semibold text-gray-800">{t.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{t.courseName}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><FaClock /> {t.duration} min</span>
                <span>{t.totalMarks} marks</span>
              </div>
              <Link to={`/student/quiz/${t._id}`}
                className="mt-4 w-full block text-center py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors">
                Start Quiz
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-surface-300 rounded-lg">
          <FaQuestionCircle className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No quizzes available yet</p>
          <p className="text-xs text-gray-400 mt-1">Enroll in courses to access quizzes</p>
        </div>
      )}
    </div>
  );
};

export default StudentQuizzesPage;
