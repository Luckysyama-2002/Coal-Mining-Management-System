import React from 'react';
import Navbar from '../components/Home/Navbar';
import HeroSection from '../components/Home/HeroSection';
import Overview from '../components/Home/Overview';
import VisionMission from '../components/Home/VissionMission';
import Footer from '../components/Home/footer';
import './Home.css';

const Home = () => {
  return (
    <div className="home-wrapper">
      <Navbar userRole="Guest" gasLevel={0.00} />
      <HeroSection />
      
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
