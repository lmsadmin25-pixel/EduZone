import { Link } from 'react-router-dom';
import { FaStar, FaUsers } from 'react-icons/fa';
import { HiBookOpen } from 'react-icons/hi';

// Category gradient map for placeholder backgrounds
const CATEGORY_GRADIENTS = {
  'Web Development': 'from-blue-500 to-blue-700',
  'Mobile Development': 'from-purple-500 to-purple-700',
  'Data Science': 'from-green-500 to-green-700',
  'Machine Learning': 'from-orange-500 to-orange-700',
  'Cyber Security': 'from-red-500 to-red-700',
  'Cloud Computing': 'from-sky-500 to-sky-700',
  'Database': 'from-indigo-500 to-indigo-700',
  'Programming': 'from-teal-500 to-teal-700',
  'Design': 'from-pink-500 to-pink-700',
};
const DEFAULT_GRADIENT = 'from-primary-500 to-primary-700';

const CourseCard = ({ course }) => {
  const gradient = CATEGORY_GRADIENTS[course.category] || DEFAULT_GRADIENT;

  return (
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
      {/* Thumbnail */}
      <div className="h-44 bg-surface-200 overflow-hidden flex-shrink-0">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2`}>
            <HiBookOpen className="text-white/70 text-5xl" />
            <span className="text-white/80 text-xs font-medium tracking-wide px-3 text-center">
              {course.category || 'Course'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-full w-fit">
          {course.category}
        </span>

        <h3 className="mt-2 text-sm font-bold text-gray-800 line-clamp-2 min-h-[2.5rem] leading-tight">
          {course.title}
        </h3>

        <p className="text-xs text-gray-500 mt-1">
          {course.educator?.name || 'EduZone Educator'}
        </p>

        {/* Rating & Students */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <FaStar className="text-yellow-400 text-xs" />
            <span className="text-xs font-semibold text-gray-700">{course.rating?.toFixed(1) || '0.0'}</span>
            <span className="text-xs text-gray-400">({course.reviewCount || 0})</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <FaUsers className="text-xs" />
            <span>{course.enrolledStudents || 0}</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100">
          <span className="text-lg font-bold text-primary-600">
            {course.isFree ? (
              <span className="text-green-600">Free</span>
            ) : (
              `₹${course.price}`
            )}
          </span>
          <Link
            to={`/courses/${course._id}`}
            className="text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
