import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaCheckCircle, FaLink, FaCopy } from 'react-icons/fa';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { sent, resetUrl }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email, role });
      if (res.data.resetUrl) {
        // SMTP not configured — show the link directly
        setResult({ sent: false, resetUrl: res.data.resetUrl });
        toast.info('Email service not configured. Use the link below.');
      } else {
        setResult({ sent: true });
        toast.success('Reset email sent! Check your inbox.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally { setLoading(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(result.resetUrl);
    toast.success('Reset link copied!');
  };

  // Email sent successfully
  if (result?.sent) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="bg-white rounded-xl border border-surface-300 p-8 max-w-md text-center shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheckCircle className="text-green-500 text-3xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Check Your Email</h2>
        <p className="text-gray-500 mt-2 text-sm">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <p className="text-xs text-gray-400 mt-3">Didn't receive it? Check your spam folder or try again.</p>
        <Link to="/login" className="inline-block mt-5 text-sm text-primary-500 hover:underline">← Back to Login</Link>
      </div>
    </div>
  );

  // SMTP not configured — show direct link fallback
  if (result?.resetUrl) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="bg-white rounded-xl border border-surface-300 p-8 max-w-lg shadow-sm">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaLink className="text-yellow-500 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 text-center">Reset Link Generated</h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-5">
          Email service isn't configured yet. Use the link below to reset your password directly.
        </p>
        <div className="bg-surface-50 border border-surface-300 rounded-lg p-3 text-xs break-all text-gray-600 mb-4">
          {result.resetUrl}
        </div>
        <div className="flex gap-3">
          <button onClick={copyLink}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-surface-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-surface-50">
            <FaCopy /> Copy Link
          </button>
          <a href={result.resetUrl}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600">
            Open Reset Page →
          </a>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          To enable email delivery, set <code className="bg-surface-100 px-1 rounded">SMTP_HOST</code>, <code className="bg-surface-100 px-1 rounded">SMTP_USER</code>, <code className="bg-surface-100 px-1 rounded">SMTP_PASS</code> in Render.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-surface-300 p-8 shadow-sm">
        <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-5">
          <FaEnvelope className="text-primary-500 text-2xl" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 text-center">Forgot Password</h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">Enter your email to receive a reset link</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Account Type</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500">
              <option value="student">Student</option>
              <option value="educator">Educator</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <input type="email" required placeholder="Your registered email"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-primary-500 font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
