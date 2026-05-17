import { useState, useEffect } from 'react';
import { FaQuestionCircle, FaChartBar, FaTrophy, FaUsers, FaSearch, FaFilePdf, FaFileExcel, FaCheckCircle } from 'react-icons/fa';
import { HiClock } from 'react-icons/hi';
import api from '../../services/api';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const AdminQuizzesPage = () => {
  const [data, setData] = useState({ tests: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/quizzes')
      .then(r => setData(r.data || { tests: [], stats: {} }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { tests, stats } = data;

  const filtered = tests.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.course?.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.educator?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const doExport = (format) => {
    if (!tests.length) { alert('No data to export'); return; }
    const cols = ['Quiz Title', 'Course', 'Educator', 'Questions', 'Total Marks', 'Duration (min)', 'Created'];
    const rows = tests.map(t => [
      t.title, t.course?.title || '-', t.educator?.name || '-',
      t.questions?.length || 0, t.totalMarks || 0, t.duration || 30,
      new Date(t.createdAt).toLocaleDateString('en-IN')
    ]);
    if (format === 'pdf') exportToPDF(cols, rows, 'Quiz Monitoring', 'admin_quizzes');
    else exportToExcel(cols, rows, 'admin_quizzes');
  };

  const statCards = [
    { title: 'Total Quizzes', value: stats.total || 0, icon: <FaQuestionCircle />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    { title: 'Quiz Attempts', value: stats.totalAttempts || 0, icon: <FaUsers />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { title: 'Total Questions', value: stats.totalQuestions || 0, icon: <FaCheckCircle />, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { title: 'Avg Score', value: stats.avgScore ? `${stats.avgScore}%` : '—', icon: <FaChartBar />, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quiz / Test Monitoring</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide quiz and test performance overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s, i) => (
          <div key={i} className={`bg-white border ${s.border} rounded-xl p-4 shadow-sm`}>
            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-lg flex items-center justify-center text-lg mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.title}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-surface-300 rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-surface-200">
          <h2 className="font-semibold text-gray-800">All Quizzes ({tests.length})</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-8 pr-3 py-2 border border-surface-300 rounded-lg text-xs focus:outline-none focus:border-primary-500 w-44" />
            </div>
            <button onClick={() => doExport('excel')} className="flex items-center gap-1.5 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"><FaFileExcel /> Excel</button>
            <button onClick={() => doExport('pdf')} className="flex items-center gap-1.5 px-3 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"><FaFilePdf /> PDF</button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  {['Quiz Title', 'Course', 'Educator', 'Questions', 'Total Marks', 'Duration', 'Created'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map(t => (
                  <tr key={t._id} className="hover:bg-surface-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{t.title}</td>
                    <td className="px-4 py-3 text-gray-600">{t.course?.title || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{t.educator?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">{t.questions?.length || 0} Qs</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-700">{t.totalMarks || 0} marks</td>
                    <td className="px-4 py-3 text-gray-500">
                      <span className="flex items-center gap-1"><HiClock className="text-gray-400" />{t.duration || 30} min</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <FaQuestionCircle className="text-4xl mx-auto mb-3 text-gray-300" />
            <p className="font-medium">{search ? 'No results match your search' : 'No quizzes created yet'}</p>
            <p className="text-sm mt-1">Educators can create quizzes using the AI Quiz Generator or manually.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuizzesPage;
