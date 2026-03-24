import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiUser, FiArrowRight, FiShield, FiEye, FiEyeOff } from 'react-icons/fi';
import ForgotPasswordModal from './ForgotPasswordModal';
import './Login.css';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8000/api/v1/login', {
        userId,
        password
      });
      
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user_id', user.emp_id);
      localStorage.setItem('user_name', user.name);
      localStorage.setItem('user_role', user.role);
      
      // Role-based redirect
      if (user.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');

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
                required
              />
            </div>
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