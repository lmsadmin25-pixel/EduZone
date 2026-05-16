import { FaQuestionCircle, FaChartBar, FaTrophy, FaUsers } from 'react-icons/fa';

const AdminQuizzesPage = () => {
  const stats = [
    { title: 'Total Quizzes', value: 0, icon: <FaQuestionCircle />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Quiz Attempts', value: 0, icon: <FaUsers />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Average Score', value: '—', icon: <FaChartBar />, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Top Performer', value: '—', icon: <FaTrophy />, color: 'text-accent-600', bg: 'bg-accent-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quiz / Test Monitoring</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-surface-300 rounded-lg p-4 flex items-center gap-4">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-lg flex items-center justify-center text-xl`}>{s.icon}</div>
            <div>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-surface-300 rounded-lg p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Quiz Performance Analytics</h2>
        <div className="text-center py-12 text-gray-400">
          <FaQuestionCircle className="text-4xl mx-auto mb-3 text-gray-300" />
          <p>Quiz analytics will populate once quizzes are attempted by students</p>
        </div>
      </div>
    </div>
  );
};

export default AdminQuizzesPage;
