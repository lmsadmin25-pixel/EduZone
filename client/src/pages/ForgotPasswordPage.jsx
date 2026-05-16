import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email, role });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally { setLoading(false); }
  };

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="bg-white rounded-lg border border-surface-300 p-8 max-w-md text-center">
        <h2 className="text-xl font-bold text-gray-800">Check Your Email</h2>
        <p className="text-gray-500 mt-2 text-sm">We've sent a password reset link to <strong>{email}</strong></p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-surface-300 p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Forgot Password</h1>
        <p className="text-sm text-gray-500 text-center mt-1">Enter your email to receive a reset link</p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm">
            <option value="student">Student</option>
            <option value="educator">Educator</option>
          </select>
          <input type="email" required placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
