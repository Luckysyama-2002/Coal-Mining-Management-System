import React from 'react';
import Navbar from './components/Navbar';
import Overview from './components/Overview';
import VisionMission from './components/VissionMission';
import Footer from './components/footer';
import './Home.css';
import { FiArrowRight, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      <Navbar userRole="Guest" gasLevel={0.00} />
      
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

      {/* SYSTEM OVERVIEW */}
      <Overview />

      {/* VISION & MISSION */}
      <VisionMission />

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Home;