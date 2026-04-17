import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiUser, FiArrowRight, FiShield, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../api';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import './Login.css';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('user_role');

    if (token) {
      if (role === 'manager') {
        navigate('/manager');
      } else if (role === 'safety_officer') {
        navigate('/safety-officer');
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!userId.trim()) {
      newErrors.userId = 'Employee ID is required';
    } else if (!/^[A-Za-z0-9_-]{3,20}$/.test(userId.trim())) {
      newErrors.userId = 'Employee ID must be 3-20 characters long and may include letters, numbers, hyphens, or underscores.';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('/auth/login', {
        userId: userId.trim(),
        password: password.trim(),
      });

      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user_id', user.emp_id);
      localStorage.setItem('user_name', user.name);
      localStorage.setItem('user_role', user.role);

      if (user.role === 'manager') {
        navigate('/manager');
      } else if (user.role === 'safety_officer') {
        navigate('/safety-officer');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Header Section */}
        <div className="login-header">
          <div className="login-logo">
            <FiShield size={32} />
          </div>
          <h1>Mine-Sync Access</h1>
          <p>Enter your credentials to access the dashboard</p>
        </div>

        {/* Form Section */}
        <form className="login-form" onSubmit={handleLogin}>
          {errors.general && (
            <div className="error-message" style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>
              {errors.general}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="userId">Employee ID</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input 
                id="userId"
                type="text" 
                placeholder="e.g. CM-4092"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className={errors.userId ? 'error' : ''}
                required
              />
            </div>
            {errors.userId && <span className="field-error" style={{ color: 'red', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.userId}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Security Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input 
                id="password"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'error' : ''}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.password && <span className="field-error" style={{ color: 'red', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.password}</span>}
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <button type="button" className="forgot-btn" onClick={() => setShowForgotModal(true)}>
              Forgot Password?
            </button>
          </div>

          <button type="submit" disabled={loading} className="login-submit-btn">
            {loading ? 'Logging in...' : 'Login to Dashboard'} <FiArrowRight />
          </button>
        </form>

        <div className="login-footer">
          <p>Emergency? Contact Sector Supervisor</p>
        </div>
      </div>

      <ForgotPasswordModal 
        isOpen={showForgotModal} 
        onClose={() => setShowForgotModal(false)} 
      />
    </div>
  );
};

export default Login;