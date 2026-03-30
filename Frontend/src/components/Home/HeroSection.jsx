import React from 'react';
import { FiArrowRight, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-container">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="badge">
            <FiShield /> ISO 27001 Certified Safety System
          </div>
          <h1 className="hero-main-title">
            THE FUTURE OF <span className="text-yellow">COAL MINING</span> IS DIGITAL
          </h1>
          <p className="hero-description">
            A centralized platform for real-time shift handovers, environmental 
            safety monitoring, and automated payroll for India's mining workforce.
          </p>
          <div className="hero-btns">
            <button className="btn-login" onClick={() => navigate('/login')}>
              Employee Login <FiArrowRight />
            </button>
            <button className="btn-outline">View Safety Reports</button>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
