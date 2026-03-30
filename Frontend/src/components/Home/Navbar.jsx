import React from 'react';
import { FiShield, FiLogIn } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import './Navbar.css';

const Navbar = ({ userRole = "Miner" }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const isLoggedIn = !!localStorage.getItem('authToken');
  const storedRole = localStorage.getItem('user_role') || userRole;
  const isManager = storedRole.toLowerCase().includes('manager');

  return (
    <nav className="nav-container">
      {/* 1. Brand & Role */}
      <div className="nav-brand">
        <div className="brand-icon-box">
          <FiShield size={20} />
        </div>
        <div className="brand-text">
          <h2 className="brand-title">COAL-OS</h2>
          {isLoggedIn && (
            <span className="role-badge">{storedRole}</span>
          )}
        </div>
      </div>

      <div className="nav-bottom-border">
        {isLoggedIn ? (
          <>
            {isManager ? (
              <button className="dashboard-button" onClick={() => navigate('/manager')}>
                Manager Panel
              </button>
            ) : (
              <button className="dashboard-button" onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
            )}
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="login-button" onClick={() => navigate('/login')}>
            <FiLogIn size={18} />
            <span className="login-text">Login</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
