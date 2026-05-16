import { FaClipboardList, FaCheckCircle, FaHourglassHalf, FaChartBar } from 'react-icons/fa';

const AdminAssignmentsPage = () => {
  const stats = [
    { title: 'Total Assignments', value: 0, icon: <FaClipboardList />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Submissions Completed', value: 0, icon: <FaCheckCircle />, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Pending Submissions', value: 0, icon: <FaHourglassHalf />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Average Score', value: '—', icon: <FaChartBar />, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Assignment Monitoring</h1>

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
        <h2 className="font-semibold text-gray-800 mb-4">Platform-Wide Assignment Analytics</h2>
        <div className="text-center py-12 text-gray-400">
          <FaClipboardList className="text-4xl mx-auto mb-3 text-gray-300" />
          <p>Assignment data will appear here once educators create assignments</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAssignmentsPage;
