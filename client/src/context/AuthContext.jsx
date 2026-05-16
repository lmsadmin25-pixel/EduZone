import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data.user);
          setRole(res.data.role);
        } catch (error) {
          console.error('Auth load error:', error);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password, userRole) => {
    const res = await api.post('/auth/login', { email, password, role: userRole });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', userData.role);
    setToken(newToken);
    setUser(userData);
    setRole(userData.role);
    return res.data;
  };

  const registerStudent = async (data) => {
    const res = await api.post('/auth/register/student', data);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', 'student');
    setToken(newToken);
    setUser(userData);
    setRole('student');
    return res.data;
  };

  const registerEducator = async (data) => {
    const res = await api.post('/auth/register/educator', data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user, token, role, loading,
      login, registerStudent, registerEducator, logout, updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
