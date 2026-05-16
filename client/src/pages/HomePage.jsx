import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaUsers, FaBookOpen, FaCertificate, FaRobot, FaBrain, FaLightbulb, FaStar, FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { HiCode, HiDatabase, HiChip, HiShieldCheck, HiCloud, HiDeviceMobile } from 'react-icons/hi';
import api from '../services/api';
import CourseCard from '../components/CourseCard';

const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses?sort=popular&limit=8');
        setFeaturedCourses(res.data.courses || []);
      } catch (err) {
        console.log('Using placeholder courses');
        setFeaturedCourses([]);
      }
    };
    fetchCourses();
  }, []);

  const categories = [
    { name: 'Web Development', icon: <HiCode className="text-2xl" />, color: 'bg-blue-50 text-blue-600' },
    { name: 'Data Science', icon: <HiDatabase className="text-2xl" />, color: 'bg-green-50 text-green-600' },
    { name: 'Machine Learning', icon: <HiChip className="text-2xl" />, color: 'bg-purple-50 text-purple-600' },
    { name: 'Cyber Security', icon: <HiShieldCheck className="text-2xl" />, color: 'bg-red-50 text-red-600' },
    { name: 'Cloud Computing', icon: <HiCloud className="text-2xl" />, color: 'bg-sky-50 text-sky-600' },
    { name: 'Mobile Development', icon: <HiDeviceMobile className="text-2xl" />, color: 'bg-orange-50 text-orange-600' },
  ];

  const aiFeatures = [
    { icon: <FaRobot className="text-3xl text-accent-500" />, title: 'AI Quiz Generator', desc: 'Automatically generate MCQ quizzes from your notes and study materials using AI.' },
    { icon: <FaBrain className="text-3xl text-accent-500" />, title: 'AI Notes Summarizer', desc: 'Get concise summaries, key points, and important concepts from any study material.' },
    { icon: <FaLightbulb className="text-3xl text-accent-500" />, title: 'Smart Recommendations', desc: 'Personalized course recommendations based on your learning progress and interests.' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'B.Tech Student', text: 'EduZone helped me learn web development from scratch. The AI quiz generator is amazing!', rating: 5 },
    { name: 'Rahul Verma', role: 'MCA Student', text: 'The best LMS platform I have used. Clean interface and great course content.', rating: 5 },
    { name: 'Anita Gupta', role: 'BCA Student', text: 'I love the AI notes summarizer. It saves so much time during exam preparation!', rating: 4 },
  ];

  const stats = [
    { value: '10,000+', label: 'Students', icon: <FaUsers /> },
    { value: '500+', label: 'Courses', icon: <FaBookOpen /> },
    { value: '200+', label: 'Educators', icon: <FaGraduationCap /> },
    { value: '5,000+', label: 'Certificates', icon: <FaCertificate /> },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary-500 text-white section-padding py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-accent-500 text-primary-900 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                🚀 AI-Powered Learning
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Learn Without Limits with <span className="text-accent-500">EduZone</span>
              </h1>
              <p className="mt-4 text-lg text-primary-200 leading-relaxed">
                An AI-Powered Learning Management System with expert-crafted courses, interactive quizzes, 
                and personalized learning paths. Start your journey today!
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/courses" className="px-6 py-3 bg-accent-500 text-primary-900 font-semibold rounded-lg hover:bg-accent-400 transition-colors">
                  Browse Courses
                </Link>
                <Link to="/register" className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                  Get Started Free
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="w-80 h-80 bg-primary-400 rounded-2xl flex items-center justify-center">
                <FaGraduationCap className="text-9xl text-white/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-surface-300">
        <div className="max-w-7xl mx-auto section-padding py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-accent-500 text-2xl mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-2xl font-bold text-primary-500">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Featured Courses</h2>
              <p className="text-gray-500 mt-1">Explore our most popular courses</p>
            </div>
            <Link to="/courses" className="text-sm font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1">
              View All <FaArrowRight />
            </Link>
          </div>
          {featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCourses.slice(0, 4).map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-lg border border-surface-300 p-4 h-72 flex flex-col items-center justify-center text-center">
                  <FaBookOpen className="text-4xl text-surface-300 mb-3" />
                  <p className="text-gray-400 text-sm">Courses coming soon</p>
                  <p className="text-xs text-gray-300 mt-1">Be the first to explore</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Course Categories */}
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center">Browse by Category</h2>
          <p className="text-gray-500 text-center mt-1">Find the perfect course for your career</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {categories.map((cat, i) => (
              <Link to={`/courses?category=${cat.name}`} key={i}
                className="flex flex-col items-center p-5 rounded-lg border border-surface-300 hover:shadow-md transition-shadow text-center">
                <div className={`p-3 rounded-lg ${cat.color} mb-3`}>{cat.icon}</div>
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="section-padding bg-primary-500 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center">AI-Powered Features</h2>
          <p className="text-primary-200 text-center mt-1">Experience the future of learning</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {aiFeatures.map((f, i) => (
              <div key={i} className="bg-white/10 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-primary-200 text-sm mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center">What Students Say</h2>
          <p className="text-gray-500 text-center mt-1">Real feedback from our learners</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-lg border border-surface-300 p-6">
                <div className="flex gap-1 text-accent-500 mb-3">
                  {[...Array(t.rating)].map((_, j) => <FaStar key={j} />)}
                </div>
                <p className="text-gray-600 text-sm italic">"{t.text}"</p>
                <div className="mt-4 pt-4 border-t border-surface-200">
                  <p className="font-semibold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent-500 section-padding py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-primary-900">Ready to Start Learning?</h2>
          <p className="text-primary-800 mt-2">Join thousands of students and educators on EduZone today.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link to="/register" className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
              Sign Up Free
            </Link>
            <Link to="/register?type=educator" className="px-6 py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-500 hover:text-white transition-colors">
              Become an Educator
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
