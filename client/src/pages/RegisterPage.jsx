import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap } from 'react-icons/fa';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const isEducator = searchParams.get('type') === 'educator';
  const { registerStudent, registerEducator } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(isEducator ? 'educator' : 'student');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', qualification: '', expertise: '', bio: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      setLoading(true);
      if (tab === 'student') {
        await registerStudent({ name: form.name, email: form.email, password: form.password });
        toast.success('Registration successful!');
        navigate('/student/dashboard');
      } else {
        await registerEducator({ name: form.name, email: form.email, password: form.password, qualification: form.qualification, expertise: form.expertise, bio: form.bio });
        toast.success('Registration submitted! Please wait for admin approval.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-lg border border-surface-300 p-8">
        <div className="text-center mb-6">
          <FaGraduationCap className="text-4xl text-primary-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Create Account</h1>
        </div>

        <div className="flex mb-6 bg-surface-100 rounded-lg p-1">
          <button onClick={() => setTab('student')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'student' ? 'bg-primary-500 text-white' : 'text-gray-600'}`}>Student</button>
          <button onClick={() => setTab('educator')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'educator' ? 'bg-primary-500 text-white' : 'text-gray-600'}`}>Educator</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" required placeholder="Full Name" value={form.name} onChange={e => update('name', e.target.value)}
            className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
          <input type="email" required placeholder="Email" value={form.email} onChange={e => update('email', e.target.value)}
            className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
          <input type="password" required placeholder="Password" value={form.password} onChange={e => update('password', e.target.value)}
            className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
          <input type="password" required placeholder="Confirm Password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
            className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />

          {tab === 'educator' && (
            <>
              <input type="text" required placeholder="Qualification (e.g., M.Tech)" value={form.qualification} onChange={e => update('qualification', e.target.value)}
                className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
              <input type="text" required placeholder="Expertise (e.g., Web Development)" value={form.expertise} onChange={e => update('expertise', e.target.value)}
                className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
              <textarea placeholder="Short Bio" value={form.bio} onChange={e => update('bio', e.target.value)} rows={3}
                className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
            </>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50">
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
