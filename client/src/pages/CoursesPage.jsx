import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiSearch } from 'react-icons/hi';
import api from '../services/api';
import CourseCard from '../components/CourseCard';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    'All', 'Web Development', 'Mobile Development', 'Data Science',
    'Machine Learning', 'Cyber Security', 'Cloud Computing',
    'Database', 'Programming', 'Design'
  ];

  useEffect(() => {
    fetchCourses();
  }, [category, sort, page]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category && category !== 'All') params.set('category', category);
      if (sort) params.set('sort', sort);
      params.set('page', page);

      const res = await api.get(`/courses?${params.toString()}`);
      setCourses(res.data.courses || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  return (
    <div className="section-padding">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">Explore Courses</h1>
        <p className="text-gray-500 mt-1">Find the perfect course to advance your skills</p>

        {/* Search & Filters */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            />
          </form>

          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500">
            <option value="">Sort By</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat === 'All' ? '' : cat); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${(category === cat || (!category && cat === 'All'))
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-100 text-gray-600 hover:bg-surface-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {courses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No courses found</p>
            <p className="text-gray-300 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1.5 rounded text-sm font-medium
                  ${page === i + 1 ? 'bg-primary-500 text-white' : 'bg-surface-100 text-gray-600 hover:bg-surface-200'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
