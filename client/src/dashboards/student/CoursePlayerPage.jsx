import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlay, FaFilePdf, FaCheck } from 'react-icons/fa';
import api from '../../services/api';

const CoursePlayerPage = () => {
  const { courseId } = useParams();
  const [enrollment, setEnrollment] = useState(null);
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, enrollRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get('/enrollments/my')
        ]);
        setCourse(courseRes.data);
        const enr = enrollRes.data.find(
          e => (e.course?._id || e.course)?.toString() === courseId
        );
        if (enr) {
          // Normalise completedLessons to strings right at load time
          enr.completedLessons = (enr.completedLessons || []).map(id => id.toString());
        }
        setEnrollment(enr || null);
      } catch { toast.error('Failed to load course'); }
      finally { setLoading(false); }
    };
    load();
  }, [courseId]);

  const markComplete = async (lessonId) => {
    if (!enrollment) {
      toast.error('Enrollment not found. Please enroll in this course first.');
      return;
    }
    if (!lessonId) {
      toast.error('Could not identify this lesson. Please refresh the page.');
      return;
    }
    try {
      setMarking(true);
      const res = await api.put(`/enrollments/${enrollment._id}/progress`, {
        lessonId: lessonId.toString()
      });
      const updated = res.data.enrollment;

      // Update state with normalised string IDs — keep populated course reference intact
      setEnrollment(prev => ({
        ...prev,
        progress: updated.progress,
        completedAt: updated.completedAt,
        completedLessons: (updated.completedLessons || []).map(id => id.toString())
      }));

      toast.success('Lesson marked as complete!');

      // Auto-generate certificate when course is 100% complete
      if (updated.progress === 100) {
        try {
          await api.post('/certificates/generate', { courseId });
          toast.success('🎉 Congratulations! Certificate generated — check My Certificates!', { autoClose: 6000 });
        } catch {
          // Certificate may already exist — ignore silently
        }
      }
    } catch (err) {
      // Surface the actual server error message for clarity
      const msg = err.response?.data?.message || err.message || 'Failed to update progress';
      toast.error(msg);
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;
  if (!course) return <div className="text-center py-10 text-gray-400">Course not found</div>;

  const currentLesson = course.lessons?.[activeLesson];

  // All IDs normalised to strings at load/update time — simple includes() is now safe
  const isLessonCompleted = (lessonId) =>
    enrollment?.completedLessons?.includes(lessonId?.toString());

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
          <p className="text-sm text-gray-500 mt-1">Progress: {enrollment?.progress || 0}%</p>
        </div>
        <Link to="/student/my-courses" className="text-sm text-primary-500 hover:underline">← Back to Courses</Link>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-200 rounded-full h-2 mb-6">
        <div className={`h-2 rounded-full transition-all duration-500 ${enrollment?.progress === 100 ? 'bg-green-500' : 'bg-primary-500'}`}
          style={{ width: `${enrollment?.progress || 0}%` }} />
      </div>

      {/* Not enrolled warning */}
      {!enrollment && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
          ⚠️ You are not enrolled in this course. Please enroll first to track your progress.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video / Content Area */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-surface-300 rounded-lg overflow-hidden">
            {currentLesson?.videoUrl ? (
              <div className="aspect-video bg-black">
                <video src={currentLesson.videoUrl} controls className="w-full h-full" />
              </div>
            ) : (
              <div className="aspect-video bg-surface-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <FaPlay className="text-4xl mx-auto mb-2" />
                  <p>No video for this lesson</p>
                </div>
              </div>
            )}

            <div className="p-5">
              <h2 className="text-lg font-semibold text-gray-800">
                Lesson {activeLesson + 1}: {currentLesson?.title || 'Untitled'}
              </h2>

              <div className="flex flex-wrap gap-3 mt-4">
                {currentLesson?.pdfUrl && (
                  <a href={currentLesson.pdfUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">
                    <FaFilePdf /> Download PDF
                  </a>
                )}

                {!isLessonCompleted(currentLesson?._id) ? (
                  <button
                    onClick={() => markComplete(currentLesson?._id)}
                    disabled={marking || !enrollment}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <FaCheck /> {marking ? 'Saving...' : 'Mark as Complete'}
                  </button>
                ) : (
                  <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                    <FaCheck /> Completed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Sidebar */}
        <div className="bg-white border border-surface-300 rounded-lg p-4 h-fit">
          <h3 className="font-semibold text-gray-800 mb-3">Course Content</h3>
          <div className="space-y-1">
            {course.lessons?.map((lesson, i) => (
              <button
                key={lesson._id || i}
                onClick={() => setActiveLesson(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors
                  ${activeLesson === i ? 'bg-primary-500 text-white' : 'hover:bg-surface-100 text-gray-700'}`}
              >
                <span className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-medium
                  ${isLessonCompleted(lesson._id)
                    ? 'bg-green-500 text-white'
                    : activeLesson === i ? 'bg-white text-primary-500' : 'bg-surface-200 text-gray-500'}`}>
                  {isLessonCompleted(lesson._id) ? <FaCheck className="text-[10px]" /> : i + 1}
                </span>
                <span className="truncate">{lesson.title}</span>
              </button>
            ))}
          </div>

          {enrollment?.progress === 100 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-sm font-medium text-green-700">🎉 Course Completed!</p>
              <Link to="/student/certificates" className="text-xs text-green-600 hover:underline mt-1 inline-block">
                Get Certificate →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayerPage;
