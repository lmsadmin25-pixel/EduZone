const DashboardCard = ({ icon, title, value, subtitle, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-500',
    accent: 'bg-accent-50 text-accent-600',
    success: 'bg-green-50 text-green-600',
    danger: 'bg-red-50 text-red-600',
    info: 'bg-blue-50 text-blue-600'
  };

  return (
    <div className="bg-white rounded-lg border border-surface-300 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
