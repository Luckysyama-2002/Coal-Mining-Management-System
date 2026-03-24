import React from 'react';
import './VissionMission.css';
import { FiEye, FiTarget, FiCheckCircle } from 'react-icons/fi';

const VisionMission = () => {
  return (
    <section className="vm-container">
      <div className="vm-wrapper">
        
        {/* Mission Card - The "How" */}
        <div className="vm-card mission">
          <div className="vm-icon-circle">
            <FiTarget size={30} />
          </div>
          <h2 className="vm-title">Our Mission</h2>
          <p className="vm-text">
            To eliminate communication gaps in underground mining through 
            structured digital handovers and real-time safety telemetry. We aim to 
            empower every miner with the data they need to stay safe and productive.
          </p>
          <ul className="vm-list">
            <li><FiCheckCircle className="check-icon" /> Digital Real-time Logs</li>
            <li><FiCheckCircle className="check-icon" /> IoT Safety Integration</li>
            <li><FiCheckCircle className="check-icon" /> Transparent Payroll Management</li>
          </ul>
        </div>

        {/* Vision Card - The "Why" */}
        <div className="vm-card vision">
          <div className="vm-icon-circle">
            <FiEye size={30} />
          </div>
          <h2 className="vm-title">Our Vision</h2>
          <p className="vm-text">
            To be the global benchmark for <strong>"Zero-Harm"</strong> mining operations. 
            We envision a future where technology predicts hazards before they 
            occur, ensuring India's energy resources are extracted with the 
            highest safety standards in the world.
          </p>
          <div className="vision-quote">
            "Safety is not an option; it's our digital foundation."
          </div>
        </div>

      </div>
    </section>
  );
};

export default VisionMission;