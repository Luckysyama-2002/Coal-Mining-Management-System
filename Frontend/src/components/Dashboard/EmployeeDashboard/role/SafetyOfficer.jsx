import React, { useState } from 'react';
import { 
  FiShield, FiUsers, FiAlertTriangle, FiWind, 
  FiMapPin, FiCheckCircle, FiActivity, FiBell 
} from 'react-icons/fi';
import './SafetyOfficer.css';

const SafetyOfficer = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'Critical', msg: 'High Methane in Sector 4', time: '10:02 AM' },
    { id: 2, type: 'Warning', msg: 'Excavator EXC-092 Overheating', time: '10:15 AM' }
  ]);

  const activePersonnel = [
    { id: 'CM-4092', name: 'Rajesh K.', role: 'Excavator', zone: 'Sector 4', pulse: '72 bpm' },
    { id: 'CM-3310', name: 'Suresh M.', role: 'Driller', zone: 'Sector 7', pulse: '84 bpm' },
    { id: 'CM-2021', name: 'Amit V.', role: 'Blaster', zone: 'Surface', pulse: '70 bpm' }
  ];

  return (
    <div className="safety-container">
      <header className="safety-header">
        <div className="safety-title">
          <FiShield className="safety-logo" />
          <div>
            <h1>Chief Safety Console</h1>
            <p>Mine-Sync Network: <span className="online-pulse">● Active</span></p>
          </div>
        </div>
        <div className="global-stats">
          <div className="stat-pill">Surface Wind: 12 km/h</div>
          <div className="stat-pill">Avg Air Quality: 94%</div>
        </div>
      </header>

      <div className="safety-grid">
        {/* LIVE PERSONNEL MONITOR */}
        <div className="s-panel personnel-table">
          <h3><FiUsers /> Real-time Personnel Vitals</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Operator</th>
                <th>Zone</th>
                <th>Vitals</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activePersonnel.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><strong>{p.name}</strong><br/><small>{p.role}</small></td>
                  <td><FiMapPin /> {p.zone}</td>
                  <td><FiActivity /> {p.pulse}</td>
                  <td><span className="badge-ok">Safe</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* INCIDENT QUEUE */}
        <div className="s-panel incident-queue">
          <h3><FiBell /> Active Alerts</h3>
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-card ${alert.type.toLowerCase()}`}>
              <FiAlertTriangle />
              <div className="alert-body">
                <strong>{alert.type}</strong>
                <p>{alert.msg}</p>
                <span>{alert.time}</span>
              </div>
              <button className="ack-btn">Acknowledge</button>
            </div>
          ))}
          <button className="broadcast-btn">BROADCAST MINE-WIDE SIREN</button>
        </div>

        {/* GAS SENSORS (TELEMETRY) */}
        <div className="s-panel gas-grid-container">
          <h3><FiWind /> Air Quality Grid (ppm)</h3>
          <div className="gas-grid">
            <div className="gas-sensor high">
              <label>CH4 (Methane)</label>
              <strong>0.85</strong>
              <span>Limit: 1.00</span>
            </div>
            <div className="gas-sensor safe">
              <label>CO (Carbon Mono)</label>
              <strong>12.0</strong>
              <span>Limit: 50.0</span>
            </div>
            <div className="gas-sensor safe">
              <label>O2 (Oxygen)</label>
              <strong>19.8%</strong>
              <span>Limit: 19.5%</span>
            </div>
          </div>
        </div>

        {/* OPERATIONS CLEARANCE */}
        <div className="s-panel clearance-panel">
          <h3><FiCheckCircle /> Pending Authorizations</h3>
          <div className="auth-request">
            <div className="auth-info">
              <strong>Blasting Sequence #BH-202</strong>
              <p>Request from: Amit V. (Blaster)</p>
            </div>
            <div className="auth-actions">
              <button className="deny">Deny</button>
              <button className="approve">Approve</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyOfficer;