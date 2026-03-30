import React, { useState, useEffect } from 'react';
import { 
  FiTruck, FiActivity, FiAlertTriangle, FiCheckCircle, 
  FiMap, FiWind, FiBattery, FiSettings 
} from 'react-icons/fi';
import './ExcavatorOperator.css';

const ExcavatorOperator = () => {
  const [machineStats, setMachineStats] = useState({
    fuel: 78,
    temp: 82,
    hours: 1240,
    payloadToday: 450 // in tons
  });

  // Simulate real-time sensor data
  useEffect(() => {
    const interval = setInterval(() => {
      setMachineStats(prev => ({
        ...prev,
        temp: prev.temp + (Math.random() > 0.5 ? 0.1 : -0.1)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="operator-container">
      {/* HEADER: MISSION STATUS */}
      <header className="op-header">
        <div className="machine-id">
          <FiTruck className="machine-icon" />
          <div>
            <h1>EXC-092 (CAT 6060)</h1>
            <p>Assigned Zone: <strong>Sector 4 - North Face</strong></p>
          </div>
        </div>
        <div className="safety-status cleared">
          <FiCheckCircle /> System Check: OK
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <div className="op-grid">
        
        {/* TELEMETRY CARDS */}
        <div className="telemetry-card">
          <div className="tel-icon fuel"><FiBattery /></div>
          <div className="tel-info">
            <span className="tel-label">Fuel Level</span>
            <span className="tel-value">{machineStats.fuel}%</span>
            <div className="progress-bar"><div className="fill" style={{width: `${machineStats.fuel}%`}}></div></div>
          </div>
        </div>

        <div className="telemetry-card">
          <div className="tel-icon temp"><FiActivity /></div>
          <div className="tel-info">
            <span className="tel-label">Hydraulic Temp</span>
            <span className="tel-value">{machineStats.temp.toFixed(1)}°C</span>
            <span className="tel-sub">Normal Range: 70-90°C</span>
          </div>
        </div>

        <div className="telemetry-card">
          <div className="tel-icon load"><FiTruck /></div>
          <div className="tel-info">
            <span className="tel-label">Payload Today</span>
            <span className="tel-value">{machineStats.payloadToday}T</span>
            <span className="tel-sub">Target: 600T</span>
          </div>
        </div>

        {/* MAIN INTERACTIVE AREA */}
        <div className="main-display-area">
          <div className="display-card site-map">
            <h3><FiMap /> Proximity Awareness</h3>
            <div className="mock-radar">
              <div className="radar-circle"></div>
              <div className="radar-sweep"></div>
              <div className="radar-point user"></div>
              <div className="radar-point dumper"></div>
            </div>
            <p className="radar-caption">Nearest Dumper: <strong>HD-104 (12m)</strong></p>
          </div>

          <div className="display-card alerts-panel">
            <h3><FiAlertTriangle /> Critical Alerts</h3>
            <div className="alert-item warning">
              <FiWind /> High Dust Levels - Recirculation ON
            </div>
            <div className="alert-item info">
              <FiSettings /> Maintenance due in 10 working hours
            </div>
            <button className="sos-btn">EMERGENCY STOP</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcavatorOperator;