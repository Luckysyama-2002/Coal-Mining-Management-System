import React, { useState } from 'react';
import { 
  FiTarget, FiZap, FiAlertOctagon, FiShield, 
  FiRadio, FiBarChart2, FiClock, FiLock, FiUnlock 
} from 'react-icons/fi';
import './Blaster.css';

const Blaster = () => {
  const [isArmed, setIsArmed] = useState(false);
  const [blastStatus, setBlastStatus] = useState('Standby');

  const explosives = [
    { id: 'EXP-A', type: 'Emulsion', qty: '450kg', status: 'Loaded' },
    { id: 'DET-01', type: 'Non-Electric', qty: '12 Units', status: 'Wired' },
    { id: 'BST-09', type: 'Cast Booster', qty: '5 Units', status: 'Primed' }
  ];

  return (
    <div className="blaster-container">
      <header className="blaster-header">
        <div className="blaster-id">
          <div className="blaster-icon-bg"><FiZap /></div>
          <div>
            <h1>Blasting Command Center</h1>
            <p>Shot ID: <strong>#SH-2026-004</strong> | Pattern: <strong>Staggered V</strong></p>
          </div>
        </div>
        <div className={`arm-status-indicator ${isArmed ? 'armed' : 'safe'}`}>
          {isArmed ? <FiLock /> : <FiUnlock />} {isArmed ? 'SYSTEM ARMED' : 'SYSTEM DISARMED'}
        </div>
      </header>

      <div className="blaster-grid">
        {/* BLASTING CHECKLIST */}
        <div className="b-card checklist">
          <h3><FiShield /> Pre-Blast Protocol</h3>
          <ul className="safety-list">
            <li className="done">Area Evacuation Confirmed</li>
            <li className="done">Vibration Monitors Active</li>
            <li className="pending">Siren Warning Dispatched</li>
            <li className="pending">Final Radio Clearance</li>
          </ul>
        </div>

        {/* DETONATION CONTROLS */}
        <div className="b-card firing-panel">
          <h3><FiRadio /> Firing Sequence</h3>
          <div className="timer-display">
            <FiClock /> <span>T-Minus: 15:00</span>
          </div>
          <div className="control-switches">
            <button 
              className={`toggle-arm ${isArmed ? 'active' : ''}`}
              onClick={() => setIsArmed(!isArmed)}
            >
              {isArmed ? 'DISARM' : 'ARM SYSTEM'}
            </button>
            <button 
              className="fire-btn" 
              disabled={!isArmed}
              onDoubleClick={() => setBlastStatus('Firing...')}
            >
              INITIATE BLAST
            </button>
          </div>
          <p className="fire-hint">Double-click "Initiate" to confirm detonation.</p>
        </div>

        {/* INVENTORY TRACKING */}
        <div className="b-card inventory">
          <h3><FiBarChart2 /> Explosive Inventory</h3>
          <table className="inv-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {explosives.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.type}</td>
                  <td>{item.qty}</td>
                  <td><span className="dot-status">{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SEISMIC MONITOR */}
        <div className="b-card seismic">
          <h3><FiTarget /> Ground Vibration (PPV)</h3>
          <div className="seismic-graph">
            {/* Visual simulation of a wave */}
            <div className="wave-container">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="wave-bar" style={{height: `${Math.random() * 40 + 10}px`}}></div>
              ))}
            </div>
          </div>
          <div className="seismic-stats">
            <span>Peak: <strong>2.4 mm/s</strong></span>
            <span>Limit: <strong>5.0 mm/s</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blaster;