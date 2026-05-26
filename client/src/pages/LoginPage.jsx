import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaGoogle, FaExclamationCircle } from 'react-icons/fa';
import { validateEmail, validateLoginPassword } from '../utils/validators';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'student' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // ─── Field-level validation ─────────────────────────────────────────────────
  const validateField = (name, value) => {
    switch (name) {
      case 'email':    return validateEmail(value);
      case 'password': return validateLoginPassword(value);
      default:         return '';
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  // ─── Full-form validation before submit ─────────────────────────────────────
  const validateAll = () => {
    const newErrors = {
      email:    validateField('email', form.email),
      password: validateField('password', form.password),
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return Object.values(newErrors).every(e => !e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    try {
      setLoading(true);
      await login(form.email, form.password, form.role);
      toast.success('Login successful!');
      const dashMap = { student: '/student/dashboard', educator: '/educator/dashboard', admin: '/admin/dashboard' };
      navigate(dashMap[form.role]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  // ─── Helper to render a field error ─────────────────────────────────────────
  const FieldError = ({ field }) =>
    touched[field] && errors[field] ? (
      <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
        <FaExclamationCircle className="shrink-0" />
        {errors[field]}
      </p>
    ) : null;

  const inputClass = (field) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none transition-colors ${
      touched[field] && errors[field]
        ? 'border-red-400 focus:border-red-500 bg-red-50'
        : 'border-surface-300 focus:border-primary-500'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-lg border border-surface-300 p-8">
        <div className="text-center mb-6">
          <FaGraduationCap className="text-4xl text-primary-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Welcome Back</h1>
          <p className="text-sm text-gray-500">Sign in to your EduZone account</p>
        </div>

        {/* Role Tabs */}
        <div className="flex mb-6 bg-surface-100 rounded-lg p-1">
          {['student', 'educator', 'admin'].map(r => (
            <button key={r} onClick={() => setForm({ ...form, role: r })}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors capitalize
              ${form.role === r ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={inputClass('email')}
              placeholder="you@example.com"
            />
            <FieldError field="email" />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              className={inputClass('password')}
              placeholder="••••••••"
            />
            <FieldError field="password" />
          </div>

          {form.role !== 'admin' && (
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-primary-500 hover:underline">Forgot Password?</Link>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors">
            {loading ? 'Signing in...' : `Sign In as ${form.role.charAt(0).toUpperCase() + form.role.slice(1)}`}
          </button>
        </form>

        {/* Google OAuth - only for student/educator */}
        {form.role !== 'admin' && (
          <>
            <div className="my-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-surface-300" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-surface-300" />
            </div>
            <a href="/api/auth/google"
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-surface-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-surface-50 transition-colors">
              <FaGoogle className="text-red-500" /> Continue with Google
            </a>
          </>
        )}

        {/* Register link - only for student/educator */}
        {form.role !== 'admin' ? (
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account? <Link to="/register" className="text-primary-500 font-medium hover:underline">Register</Link>
          </p>
        ) : (
          <p className="text-center text-xs text-gray-400 mt-6">
            Admin accounts are created by the system administrator.
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
