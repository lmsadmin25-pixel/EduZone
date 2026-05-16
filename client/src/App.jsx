import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';


// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

// Student Dashboards
import StudentDashboard from './dashboards/student/StudentDashboard';
import MyCoursesPage from './dashboards/student/MyCoursesPage';
import CoursePlayerPage from './dashboards/student/CoursePlayerPage';
import StudentQuizzesPage from './dashboards/student/StudentQuizzesPage';
import QuizPage from './dashboards/student/QuizPage';
import AssignmentsPage from './dashboards/student/AssignmentsPage';
import PaymentHistoryPage from './dashboards/student/PaymentHistoryPage';
import CertificatesPage from './dashboards/student/CertificatesPage';
import AISummarizerPage from './dashboards/student/AISummarizerPage';

// Educator Dashboards
import EducatorDashboard from './dashboards/educator/EducatorDashboard';
import ManageCoursesPage from './dashboards/educator/ManageCoursesPage';
import CourseFormPage from './dashboards/educator/CourseFormPage';
import UploadMaterialsPage from './dashboards/educator/UploadMaterialsPage';
import CreateQuizPage from './dashboards/educator/CreateQuizPage';
import EducatorAssignmentsPage from './dashboards/educator/EducatorAssignmentsPage';
import EducatorStudentsPage from './dashboards/educator/EducatorStudentsPage';
import AnalyticsPage from './dashboards/educator/AnalyticsPage';

// Admin Dashboards
import AdminDashboard from './dashboards/admin/AdminDashboard';
import ManageStudentsPage from './dashboards/admin/ManageStudentsPage';
import ManageEducatorsPage from './dashboards/admin/ManageEducatorsPage';
import AdminCoursesPage from './dashboards/admin/AdminCoursesPage';
import AdminEnrollmentsPage from './dashboards/admin/AdminEnrollmentsPage';
import AdminAssignmentsPage from './dashboards/admin/AdminAssignmentsPage';
import AdminQuizzesPage from './dashboards/admin/AdminQuizzesPage';
import AdminAIMonitoringPage from './dashboards/admin/AdminAIMonitoringPage';
import AdminPaymentsPage from './dashboards/admin/AdminPaymentsPage';
import AdminReportsPage from './dashboards/admin/AdminReportsPage';
import AdminNotificationsPage from './dashboards/admin/AdminNotificationsPage';
import SettingsPage from './dashboards/admin/SettingsPage';

// Shared
import NotificationsPage from './dashboards/shared/NotificationsPage';
import ProfilePage from './dashboards/shared/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />

        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Auth Routes (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Student Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['student']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/my-courses" element={<MyCoursesPage />} />
            <Route path="/student/course/:courseId" element={<CoursePlayerPage />} />
            <Route path="/student/quizzes" element={<StudentQuizzesPage />} />
            <Route path="/student/quiz/:testId" element={<QuizPage />} />
            <Route path="/student/assignments" element={<AssignmentsPage />} />
            <Route path="/student/payments" element={<PaymentHistoryPage />} />
            <Route path="/student/certificates" element={<CertificatesPage />} />
            <Route path="/student/ai-summarizer" element={<AISummarizerPage />} />
            <Route path="/student/notifications" element={<NotificationsPage />} />
            <Route path="/student/profile" element={<ProfilePage />} />
          </Route>

          {/* Educator Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['educator']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/educator/dashboard" element={<EducatorDashboard />} />
            <Route path="/educator/courses" element={<ManageCoursesPage />} />
            <Route path="/educator/create-course" element={<CourseFormPage />} />
            <Route path="/educator/upload" element={<UploadMaterialsPage />} />
            <Route path="/educator/quizzes" element={<CreateQuizPage />} />
            <Route path="/educator/assignments" element={<EducatorAssignmentsPage />} />
            <Route path="/educator/students" element={<EducatorStudentsPage />} />
            <Route path="/educator/analytics" element={<AnalyticsPage />} />
            <Route path="/educator/notifications" element={<NotificationsPage />} />
            <Route path="/educator/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<ManageStudentsPage />} />
            <Route path="/admin/educators" element={<ManageEducatorsPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/enrollments" element={<AdminEnrollmentsPage />} />
            <Route path="/admin/assignments" element={<AdminAssignmentsPage />} />
            <Route path="/admin/quizzes" element={<AdminQuizzesPage />} />
            <Route path="/admin/ai-monitoring" element={<AdminAIMonitoringPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-surface-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-primary-500">404</h1>
                <p className="text-gray-500 mt-2 mb-4">Page not found</p>
                <a href="/" className="text-primary-500 hover:underline">← Back to Home</a>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
