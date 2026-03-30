import React, { useState } from 'react';
import { 
  FiMap, FiLayers, FiMaximize, FiTarget, 
  FiNavigation, FiBox, FiAlertCircle, FiTrendingUp 
} from 'react-icons/fi';
import './Surveyor.css';

const Surveyor = () => {
  const [activeLayer, setActiveLayer] = useState('Topographic');

  const stockpileData = [
    { id: 'SP-01', material: 'Coking Coal', volume: '12,450 m³', quality: 'Grade A' },
    { id: 'SP-02', material: 'Thermal Coal', volume: '8,200 m³', quality: 'Grade B' },
    { id: 'SP-03', material: 'Overburden', volume: '45,000 m³', quality: 'Waste' }
  ];

  return (
    <div className="surveyor-container">
      <header className="surveyor-header">
        <div className="surveyor-id">
          <div className="surveyor-icon-bg"><FiLayers /></div>
          <div>
            <h1>Geospatial Control</h1>
            <p>Last Drone Sync: <strong>Today, 09:15 AM</strong> | GPS Precision: <strong>±0.02m</strong></p>
          </div>
        </div>
        <div className="stability-index">
          <FiTrendingUp /> Ground Stability: <strong>98.4%</strong>
        </div>
      </header>

      <div className="surveyor-grid">
        {/* 3D MAP VIEWPORT */}
        <div className="s-card map-viewport">
          <div className="viewport-header">
            <h3><FiMap /> 3D Mine Model</h3>
            <div className="layer-selector">
              <button className={activeLayer === 'Topographic' ? 'active' : ''} onClick={() => setActiveLayer('Topographic')}>Topographic</button>
              <button className={activeLayer === 'Geological' ? 'active' : ''} onClick={() => setActiveLayer('Geological')}>Geological</button>
            </div>
          </div>
          <div className="mock-map">
            <div className="map-overlay-coords">
              Lat: 23.6102° N <br /> Lon: 85.2722° E
            </div>
            <div className="topo-lines"></div>
            <div className="drone-marker">
              <FiNavigation className="drone-icon" />
              <span className="label">Drone-X4</span>
            </div>
          </div>
        </div>

        {/* VOLUMETRIC DATA */}
        <div className="s-card inventory">
          <h3><FiBox /> Volumetric Analysis</h3>
          <div className="stockpile-list">
            {stockpileData.map(item => (
              <div key={item.id} className="stock-item">
                <div className="stock-header">
                  <strong>{item.id}</strong>
                  <span>{item.quality}</span>
                </div>
                <div className="stock-value">{item.volume}</div>
                <div className="stock-label">{item.material}</div>
              </div>
            ))}
          </div>
        </div>

        {/* STRUCTURAL STABILITY SENSORS */}
        <div className="s-card sensors">
          <h3><FiTarget /> Displacement Sensors (Tilt)</h3>
          <div className="sensor-table">
            <div className="sensor-row">
              <span>Sensor #TS-01 (South Wall)</span>
              <span className="val-ok">0.002mm</span>
            </div>
            <div className="sensor-row">
              <span>Sensor #TS-02 (Level 4 Arc)</span>
              <span className="val-ok">0.005mm</span>
            </div>
            <div className="sensor-row warning">
              <span>Sensor #TS-03 (East Portal)</span>
              <span className="val-warn">1.240mm</span>
            </div>
          </div>
          <p className="sensor-note"><FiAlertCircle /> Alert threshold set at 2.000mm displacement.</p>
        </div>

        {/* RECENT MEASUREMENTS */}
        <div className="s-card measurements">
          <h3><FiMaximize /> Quick Measure</h3>
          <div className="measure-tool">
            <div className="tool-input">
              <label>Point A (Drill Rig)</label>
              <input type="text" readOnly value="23.6102, 85.2722" />
            </div>
            <div className="tool-input">
              <label>Point B (Blasting Zone)</label>
              <input type="text" readOnly value="23.6115, 85.2740" />
            </div>
            <div className="dist-result">Distance: <strong>142.58m</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Surveyor;