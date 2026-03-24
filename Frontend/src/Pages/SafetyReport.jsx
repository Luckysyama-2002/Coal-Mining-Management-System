import React, { useState, useEffect } from 'react';
import { 
  FiShield, FiAlertOctagon, FiActivity, FiX,
  FiWind, FiThermometer, FiZap, FiDownload 
} from 'react-icons/fi';
import './SafetyReport.css';

const SafetyReport = ({ onClose }) => {
  // Simulating live sensor data
  const [sensors, setSensors] = useState({
    methane: 0.04,
    oxygen: 20.9,
    temp: 28
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors({
        methane: +(0.04 + Math.random() * 0.05).toFixed(2),
        oxygen: +(20.9 - Math.random() * 0.2).toFixed(1),
        temp: +(28 + Math.random() * 2).toFixed(0)
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const incidents = [
    { id: "SEC-77", type: "Ventilation", msg: "Low airflow detected in West Wing", severity: "High", time: "14:20" },
    { id: "SEC-12", type: "Equipment", msg: "Conveyor belt 04 overheating", severity: "Medium", time: "12:05" },
    { id: "SEC-04", type: "Gas", msg: "Methane spike during blasting", severity: "Critical", time: "09:30" },
  ];

  return (
    <>
      {onClose && (
        <button 
          className="fixed top-4 right-4 z-50 bg-white shadow-lg hover:shadow-xl rounded-full p-3 border transition-all duration-200" 
          onClick={onClose}
          style={{ fontSize: '1.5rem' }}
        >
          <FiX />
        </button>
      )}
      <div className="safety-wrapper">
        <header className="safety-header">
          <div className="header-text">
            <h2><FiShield /> Mine Safety Command</h2>
            <p>Real-time atmospheric monitoring and incident tracking.</p>
          </div>
          <div className="safety-badge">
            <span className="dot pulse"></span> SYSTEM SECURE
          </div>
        </header>

        <div className="sensor-grid">
          <div className={`sensor-card ${sensors.methane > 0.1 ? 'danger-bg' : 'safe-bg'}`}>
            <div className="sensor-main">
              <FiWind className="sensor-icon" />
              <div>
                <span className="sensor-label">Methane (CH4)</span>
                <h3 className="sensor-value">{sensors.methane}%</h3>
              </div>
            </div>
            <div className="sensor-footer">Threshold: 0.75%</div>
          </div>

          <div className="sensor-card safe-bg">
            <div className="sensor-main">
              <FiZap className="sensor-icon" />
              <div>
                <span className="sensor-label">Oxygen (O2)</span>
                <h3 className="sensor-value">{sensors.oxygen}%</h3>
              </div>
            </div>
            <div className="sensor-footer">Min Req: 19.5%</div>
          </div>

          <div className="sensor-card warning-bg">
            <div className="sensor-main">
              <FiThermometer className="sensor-icon" />
              <div>
                <span className="sensor-label">Ambient Temp</span>
                <h3 className="sensor-value">{sensors.temp}°C</h3>
              </div>
            </div>
            <div className="sensor-footer">Max Limit: 38°C</div>
          </div>
        </div>

        <section className="incident-section">
          <div className="section-head">
            <h3><FiAlertOctagon /> Recent Safety Incidents</h3>
            <button className="report-btn"><FiDownload /> Generate PDF Report</button>
          </div>
          
          <div className="incident-table-container">
            <table className="safety-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Incident Details</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr key={inc.id}>
                    <td>{inc.time}</td>
                    <td className="bold">{inc.id}</td>
                    <td>{inc.type}</td>
                    <td>{inc.msg}</td>
                    <td>
                      <span className={`sev-tag ${inc.severity.toLowerCase()}`}>
                        {inc.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="safety-compliance-row">
          <div className="comp-item">
            <FiActivity /> <span>Days since last Lost-Time Injury: <strong>142</strong></span>
          </div>
          <div className="comp-item">
            <FiShield /> <span>PPE Compliance: <strong>99.8%</strong></span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default SafetyReport;
