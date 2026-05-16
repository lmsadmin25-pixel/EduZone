import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg border border-surface-300 overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="h-44 bg-surface-200 overflow-hidden">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-400 text-sm">
            No Thumbnail
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <span className="text-xs font-medium text-primary-500 bg-primary-50 px-2 py-1 rounded">
          {course.category}
        </span>

        <h3 className="mt-2 text-base font-semibold text-gray-800 line-clamp-2 min-h-[3rem]">
          {course.title}
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          {course.educator?.name || 'Educator'}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <FaStar className="text-accent-500 text-sm" />
          <span className="text-sm font-medium text-gray-700">{course.rating?.toFixed(1) || '0.0'}</span>
          <span className="text-xs text-gray-400">({course.reviewCount || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-200">
          <span className="text-lg font-bold text-primary-500">
            {course.isFree ? 'Free' : `₹${course.price}`}
          </span>
          <Link to={`/courses/${course._id}`}
            className="text-sm font-medium text-accent-600 hover:text-accent-700 transition-colors">
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
