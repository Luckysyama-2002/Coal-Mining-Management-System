import React from 'react';
import './footer.css';


const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-brand">
        <h3>CORE-MINER OS</h3>
        <p>Digitizing India's Energy Safety.</p>
      </div>
      <div className="footer-contact">
        <h4>Emergency Helpline</h4>
        <p className="emergency-num">+91 1800-444-SAFE</p>
      </div>
    </div>
    <div className="footer-bottom">
      &copy; 2026 Coal Mining Project. All Rights Reserved.
    </div>
  </footer>
);

export default Footer;