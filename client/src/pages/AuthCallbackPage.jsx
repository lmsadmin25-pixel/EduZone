import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallbackPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    const role = params.get('role');
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role || 'student');
      window.location.href = `/${role || 'student'}/dashboard`;
    } else {
      navigate('/login');
    }
  }, []);

  return <div className="min-h-screen flex items-center justify-center"><p>Authenticating...</p></div>;
};

export default AuthCallbackPage;
