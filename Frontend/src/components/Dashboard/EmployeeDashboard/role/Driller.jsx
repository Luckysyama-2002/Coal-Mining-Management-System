import React, { useState, useEffect } from 'react';
import { 
  FiDisc, FiArrowDown, FiAlertCircle, FiZap, 
  FiThermometer, FiDroplet, FiMaximize2, FiLifeBuoy 
} from 'react-icons/fi';
import './Driller.css';

const Driller = () => {
  const [drillStats, setDrillStats] = useState({
    currentDepth: 42.5,
    targetDepth: 120,
    rpm: 850,
    pressure: 2100, // PSI
    bitWear: 14 // percentage
  });

  // Simulate drilling progress and vibration
  useEffect(() => {
    const interval = setInterval(() => {
      setDrillStats(prev => ({
        ...prev,
        currentDepth: prev.currentDepth + (Math.random() * 0.05),
        rpm: 850 + (Math.random() * 20 - 10)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = (drillStats.currentDepth / drillStats.targetDepth) * 100;

  return (
    <div className="driller-container">
      <header className="driller-header">
        <div className="drill-identity">
          <div className="drill-icon-bg"><FiDisc className="spinning" /></div>
          <div>
            <h1>Rig-76 Alpha</h1>
            <p>Operation: <strong>Vertical Shaft Bore</strong> | Hole ID: #BH-202</p>
          </div>
        </div>
        <div className="gas-monitor safe">
          <FiDroplet /> CH4 Level: 0.02% (Safe)
        </div>
      </header>

      <div className="driller-layout">
        {/* LEFT COLUMN: DEPTH GAUGE */}
        <aside className="depth-column">
          <div className="depth-header">
            <FiArrowDown /> <span>Current Depth</span>
            <h2>{drillStats.currentDepth.toFixed(1)}m</h2>
          </div>
          <div className="depth-gauge-container">
            <div className="depth-marker start">0m</div>
            <div className="depth-track">
              <div className="depth-fill" style={{ height: `${progressPercent}%` }}>
                <div className="drill-head-indicator">
                  <FiDisc />
                </div>
              </div>
            </div>
            <div className="depth-marker end">{drillStats.targetDepth}m</div>
          </div>
        </aside>

        {/* RIGHT COLUMN: SENSORS & CONTROLS */}
        <main className="sensor-main">
          <div className="sensor-grid">
            <div className="s-card">
              <span className="s-label"><FiZap /> Rotation Speed</span>
              <span className="s-value">{Math.round(drillStats.rpm)} <small>RPM</small></span>
            </div>
            <div className="s-card">
              <span className="s-label"><FiMaximize2 /> Feed Pressure</span>
              <span className="s-value">{drillStats.pressure} <small>PSI</small></span>
            </div>
            <div className="s-card">
              <span className="s-label"><FiThermometer /> Motor Temp</span>
              <span className="s-value">68°C</span>
            </div>
            <div className="s-card">
              <span className="s-label"><FiLifeBuoy /> Bit Health</span>
              <span className={`s-value ${drillStats.bitWear > 80 ? 'danger' : 'good'}`}>
                {100 - drillStats.bitWear}%
              </span>
            </div>
          </div>

          <div className="rock-composition-card">
            <h3>Subsurface Strata Analysis</h3>
            <div className="strata-map">
              <div className="layer top">Top Soil (Passed)</div>
              <div className="layer sandstone">Sandstone (Current)</div>
              <div className="layer coal">Coal Seam (Target)</div>
            </div>
          </div>

          <div className="driller-actions">
            <button className="ctrl-btn stop">EMERGENCY RETRACT</button>
            <button className="ctrl-btn pause">PAUSE FEED</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Driller;