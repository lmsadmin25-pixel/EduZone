import { FaRobot, FaLightbulb, FaQuestionCircle, FaChartLine } from 'react-icons/fa';

const AdminAIMonitoringPage = () => {
  const stats = [
    { title: 'AI Quizzes Generated', value: 0, icon: <FaQuestionCircle />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'AI Summaries Created', value: 0, icon: <FaLightbulb />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'API Calls This Month', value: 0, icon: <FaChartLine />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active AI Users', value: 0, icon: <FaRobot />, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">AI Features Monitoring</h1>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">🤖 AI Quiz Generator Activity</h2>
          <p className="text-sm text-gray-500 mb-3">Tracks educator usage of AI-powered quiz generation from uploaded study material.</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg">
              <span className="text-sm text-gray-700">Gemini API Model</span>
              <span className="text-sm font-medium text-primary-600">gemini-2.0-flash</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg">
              <span className="text-sm text-gray-700">Quiz Format</span>
              <span className="text-sm font-medium text-gray-800">MCQ (4 options)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg">
              <span className="text-sm text-gray-700">Auto-correct Answers</span>
              <span className="text-sm font-medium text-green-600">Enabled</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-4">📝 AI Notes Summarizer Activity</h2>
          <p className="text-sm text-gray-500 mb-3">Tracks student usage of AI-powered notes summarization tool.</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg">
              <span className="text-sm text-gray-700">Summary Types</span>
              <span className="text-sm font-medium text-gray-800">Key Points + Concepts</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg">
              <span className="text-sm text-gray-700">Input Methods</span>
              <span className="text-sm font-medium text-gray-800">Text / PDF Upload</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg">
              <span className="text-sm text-gray-700">Service Status</span>
              <span className="text-sm font-medium text-green-600">● Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAIMonitoringPage;
