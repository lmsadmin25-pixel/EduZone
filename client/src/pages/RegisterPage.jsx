import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaExclamationCircle, FaCheck } from 'react-icons/fa';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateQualification,
  validateExpertise,
  validateBio,
  getPasswordStrength
} from '../utils/validators';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const isEducator = searchParams.get('type') === 'educator';
  const { registerStudent, registerEducator } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(isEducator ? 'educator' : 'student');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    qualification: '', expertise: '', bio: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(form.password);

  // ─── Field-level validation ─────────────────────────────────────────────────
  const validateField = (name, value) => {
    switch (name) {
      case 'name':            return validateName(value);
      case 'email':           return validateEmail(value);
      case 'password':        return validatePassword(value);
      case 'confirmPassword': return validateConfirmPassword(form.password, value);
      case 'qualification':   return tab === 'educator' ? validateQualification(value) : '';
      case 'expertise':       return tab === 'educator' ? validateExpertise(value) : '';
      case 'bio':             return validateBio(value);
      default:                return '';
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // When password changes, re-validate confirmPassword if it was touched
      if (field === 'password' && touched.confirmPassword) {
        setErrors(e => ({
          ...e,
          password: validatePassword(value),
          confirmPassword: validateConfirmPassword(value, updated.confirmPassword)
        }));
      } else if (touched[field]) {
        setErrors(e => ({ ...e, [field]: validateField(field, value) }));
      }
      return updated;
    });
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  // ─── Full-form validation before submit ─────────────────────────────────────
  const getRequiredFields = () => {
    const base = ['name', 'email', 'password', 'confirmPassword'];
    if (tab === 'educator') return [...base, 'qualification', 'expertise'];
    return base;
  };

  const validateAll = () => {
    const fields = getRequiredFields();
    const allFields = [...fields, 'bio'];
    const newErrors = {};
    const newTouched = {};
    allFields.forEach(f => {
      newErrors[f] = validateField(f, form[f]);
      newTouched[f] = true;
    });
    setErrors(newErrors);
    setTouched(newTouched);
    return fields.every(f => !newErrors[f]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    try {
      setLoading(true);
      if (tab === 'student') {
        await registerStudent({ name: form.name, email: form.email, password: form.password });
        toast.success('Registration successful!');
        navigate('/student/dashboard');
      } else {
        await registerEducator({
          name: form.name, email: form.email, password: form.password,
          qualification: form.qualification, expertise: form.expertise, bio: form.bio
        });
        toast.success('Registration submitted! Please wait for admin approval.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  // ─── UI Helpers ─────────────────────────────────────────────────────────────
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

  // Password requirement indicators
  const requirements = [
    { label: 'At least 8 characters', met: form.password.length >= 8 },
    { label: 'One uppercase letter',  met: /[A-Z]/.test(form.password) },
    { label: 'One lowercase letter',  met: /[a-z]/.test(form.password) },
    { label: 'One number',            met: /\d/.test(form.password) },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-lg border border-surface-300 p-8">
        <div className="text-center mb-6">
          <FaGraduationCap className="text-4xl text-primary-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Create Account</h1>
        </div>

        {/* Tab switcher */}
        <div className="flex mb-6 bg-surface-100 rounded-lg p-1">
          <button onClick={() => setTab('student')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'student' ? 'bg-primary-500 text-white' : 'text-gray-600'}`}>
            Student
          </button>
          <button onClick={() => setTab('educator')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'educator' ? 'bg-primary-500 text-white' : 'text-gray-600'}`}>
            Educator
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input type="text" placeholder="Jane Doe" value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={inputClass('name')} />
            <FieldError field="name" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={inputClass('email')} />
            <FieldError field="email" />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" placeholder="Create a strong password" value={form.password}
              onChange={e => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              className={inputClass('password')} />
            <FieldError field="password" />

            {/* Password strength bar */}
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ backgroundColor: i <= passwordStrength.score ? passwordStrength.color : '#e5e7eb' }}
                    />
                  ))}
                </div>
                <p className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </p>
              </div>
            )}

            {/* Requirements checklist */}
            {touched.password && (
              <ul className="mt-2 space-y-1">
                {requirements.map(r => (
                  <li key={r.label} className={`flex items-center gap-1.5 text-xs ${r.met ? 'text-green-600' : 'text-gray-400'}`}>
                    <FaCheck className={`text-[10px] ${r.met ? 'text-green-500' : 'text-gray-300'}`} />
                    {r.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
            <input type="password" placeholder="Repeat your password" value={form.confirmPassword}
              onChange={e => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              className={inputClass('confirmPassword')} />
            <FieldError field="confirmPassword" />
          </div>

          {/* Educator-only fields */}
          {tab === 'educator' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Qualification</label>
                <input type="text" placeholder="e.g., M.Tech, PhD" value={form.qualification}
                  onChange={e => handleChange('qualification', e.target.value)}
                  onBlur={() => handleBlur('qualification')}
                  className={inputClass('qualification')} />
                <FieldError field="qualification" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Area of Expertise</label>
                <input type="text" placeholder="e.g., Web Development, Data Science" value={form.expertise}
                  onChange={e => handleChange('expertise', e.target.value)}
                  onBlur={() => handleBlur('expertise')}
                  className={inputClass('expertise')} />
                <FieldError field="expertise" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Short Bio <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea placeholder="Tell students about yourself..." value={form.bio}
                  onChange={e => handleChange('bio', e.target.value)}
                  onBlur={() => handleBlur('bio')}
                  rows={3}
                  className={inputClass('bio')} />
                <div className="flex justify-between mt-1">
                  <FieldError field="bio" />
                  <p className={`text-xs ml-auto ${form.bio.length > 480 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {form.bio.length}/500
                  </p>
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors">
            {loading ? 'Creating...' : tab === 'educator' ? 'Register as Educator' : 'Register as Student'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-primary-500 font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
