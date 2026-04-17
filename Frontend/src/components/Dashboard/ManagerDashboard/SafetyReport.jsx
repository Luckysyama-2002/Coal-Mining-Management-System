import React, { useState, useEffect } from 'react';
import { 
  FiShield, FiAlertOctagon, FiActivity, FiX,
  FiWind, FiThermometer, FiZap, FiDownload, FiCheckCircle 
} from 'react-icons/fi';
import api from '../../../api';
import './SafetyReport.css';

const SafetyReport = ({ onClose }) => {
  const [incidents, setIncidents] = useState([]);
  const [sensors, setSensors] = useState({});
  const [riskZones, setRiskZones] = useState([]);
  const [ppeCompliance, setPpeCompliance] = useState([]);
  const [sensorAlerts, setSensorAlerts] = useState([]);
  const [safetyMetrics, setSafetyMetrics] = useState({});
  const [dashboardSummary, setDashboardSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPdfMessage, setShowPdfMessage] = useState(false);
  const [pdfMessage, setPdfMessage] = useState('');
  const [pdfMessageTimeout, setPdfMessageTimeout] = useState(null);


  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await api.put(`/employee/sensor-alerts/${alertId}/acknowledge`);
      setSensorAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
      ));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await api.put(`/employee/sensor-alerts/${alertId}/resolve`);
      setSensorAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, status: 'resolved' } : alert
      ));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const handleResolve = async (incidentId) => {
    try {
      await api.put(`/safety/incidents/${incidentId}/resolve`);
      setIncidents(prev => prev.map(inc => 
        inc.id === incidentId ? { ...inc, status: 'resolved' } : inc
      ));
    } catch (error) {
      console.error('Failed to resolve incident:', error);
    }
  };

  // PDF Generation Function
  const generatePDF = () => {
    // Clear any existing timeouts
    if (pdfMessageTimeout) {
      clearTimeout(pdfMessageTimeout);
    }

    // Check if there's data to export
    if (!incidents || incidents.length === 0) {
      setPdfMessage('No safety incidents data available. File cannot be downloaded.');
      setShowPdfMessage(true);
      
      const timeout = setTimeout(() => {
        setShowPdfMessage(false);
        setPdfMessage('');
      }, 4000);
      setPdfMessageTimeout(timeout);
      return;
    }

    try {
      // Create PDF content
      let pdfContent = `SAFETY REPORT - INCIDENT LOG\n`;
      pdfContent += `Generated: ${new Date().toLocaleString()}\n`;
      pdfContent += `\n===============================================\n\n`;
      
      // Add incidents data
      incidents.forEach((inc, index) => {
        pdfContent += `INCIDENT #${index + 1}\n`;
        pdfContent += `Time: ${new Date(inc.reported_date).toLocaleString()}\n`;
        pdfContent += `Location: ${inc.location || 'N/A'}\n`;
        pdfContent += `Type: ${inc.incident_type}\n`;
        pdfContent += `Description: ${inc.description}\n`;
        pdfContent += `Severity: ${inc.severity}\n`;
        pdfContent += `Status: ${inc.status}\n`;
        pdfContent += `\n-----------------------------------------------\n\n`;
      });

      // Add summary statistics if available
      if (dashboardSummary.todayMetrics) {
        pdfContent += `\nSUMMARY STATISTICS (Today)\n`;
        pdfContent += `Total Incidents: ${dashboardSummary.todayMetrics.total_incidents || 0}\n`;
        pdfContent += `Critical Incidents: ${dashboardSummary.todayMetrics.critical_incidents || 0}\n`;
        pdfContent += `Days Without Lost-Time Injury: ${dashboardSummary.todayMetrics.days_without_lti || 0}\n`;
        pdfContent += `PPE Compliance Rate: ${(dashboardSummary.todayMetrics.ppe_compliance_rate || 0).toFixed(1)}%\n`;
      }

      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `safety_report_${new Date().toISOString().split('T')[0]}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setPdfMessage('Safety report exported successfully!');
      setShowPdfMessage(true);

      const timeout = setTimeout(() => {
        setShowPdfMessage(false);
        setPdfMessage('');
      }, 4000);
      setPdfMessageTimeout(timeout);
    } catch (error) {
      console.error('PDF generation error:', error);
      setPdfMessage('Failed to generate report. Please try again.');
      setShowPdfMessage(true);

      const timeout = setTimeout(() => {
        setShowPdfMessage(false);
        setPdfMessage('');
      }, 4000);
      setPdfMessageTimeout(timeout);
    }
  };

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
            <h2><FiShield /> Mine Safety Command Center</h2>
            <p>Real-time atmospheric monitoring, incident tracking, and compliance management.</p>
          </div>
          <div className="safety-badge">
            <span className="dot pulse"></span> SYSTEM ACTIVE
          </div>
        </header>

        <div className="sensor-grid">
          <div className={`sensor-card ${dashboardSummary.todayMetrics?.avg_sensor_methane > 0.1 ? 'danger-bg' : 'safe-bg'}`}>
            <div className="sensor-main">
              <FiWind className="sensor-icon" />
              <div>
                <span className="sensor-label">Methane (CH4)</span>
                <h3 className="sensor-value">{(dashboardSummary.todayMetrics?.avg_sensor_methane || 0).toFixed(3)}%</h3>
              </div>
            </div>
            <div className="sensor-footer">Threshold: 0.75%</div>
          </div>

          <div className="sensor-card safe-bg">
            <div className="sensor-main">
              <FiZap className="sensor-icon" />
              <div>
                <span className="sensor-label">Oxygen (O2)</span>
                <h3 className="sensor-value">{(dashboardSummary.todayMetrics?.avg_sensor_oxygen || 0).toFixed(1)}%</h3>
              </div>
            </div>
            <div className="sensor-footer">Min Req: 19.5%</div>
          </div>

          <div className="sensor-card warning-bg">
            <div className="sensor-main">
              <FiThermometer className="sensor-icon" />
              <div>
                <span className="sensor-label">Ambient Temp</span>
                <h3 className="sensor-value">{(dashboardSummary.todayMetrics?.avg_sensor_temp || 0).toFixed(1)}°C</h3>
              </div>
            </div>
            <div className="sensor-footer">Max Limit: 38°C</div>
          </div>
        </div>

        {/* TABS */}
        <div className="safety-tabs">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <FiShield /> Overview
          </button>
          <button className={`tab-btn ${activeTab === 'sensors' ? 'active' : ''}`} onClick={() => setActiveTab('sensors')}>
            <FiActivity /> Sensors
          </button>
          <button className={`tab-btn ${activeTab === 'zones' ? 'active' : ''}`} onClick={() => setActiveTab('zones')}>
            <FiAlertOctagon /> Risk Zones
          </button>
          <button className={`tab-btn ${activeTab === 'ppe' ? 'active' : ''}`} onClick={() => setActiveTab('ppe')}>
            <FiShield /> PPE
          </button>
          <button className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>
            <FiAlertOctagon /> Alerts
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
        <>
        <div className="summary-cards-grid">
          <div className="summary-card alerts">
            <div className="card-number">{dashboardSummary.sensorAlerts?.total_alerts || 0}</div>
            <div className="card-label">Sensor Alerts</div>
            <div className="card-critical">{dashboardSummary.sensorAlerts?.critical_alerts || 0} Critical</div>
          </div>
          <div className="summary-card incidents">
            <div className="card-number">{dashboardSummary.activeIncidents || 0}</div>
            <div className="card-label">Active Incidents</div>
          </div>
          <div className="summary-card zones">
            <div className="card-number">{dashboardSummary.highRiskZones || 0}</div>
            <div className="card-label">High-Risk Zones</div>
          </div>
          <div className="summary-card ppe">
            <div className="card-number">{dashboardSummary.ppeNonCompliance || 0}</div>
            <div className="card-label">PPE Non-Compliant</div>
          </div>
        </div>
        </>
        )}

        {/* SENSORS TAB */}
        {activeTab === 'sensors' && (
        <section className="content-section">
          <h3><FiActivity /> Live Sensor Readings by Location</h3>
          <div className="sensor-readings-grid">
            {Object.keys(sensors).length > 0 ? Object.entries(sensors).map(([location, sensorTypes]) => (
              <div key={location} className="location-card">
                <h4>{location}</h4>
                {Object.entries(sensorTypes).map(([type, readings]) => {
                  const latest = readings[0];
                  return (
                    <div key={`${location}-${type}`} className={`sensor-item status-${latest.status}`}>
                      <span className="sensor-name">{type.toUpperCase()}</span>
                      <span className="sensor-val">{latest.reading_value} {latest.unit}</span>
                      <span className={`status-badge ${latest.status}`}>{latest.status}</span>
                    </div>
                  );
                })}
              </div>
            )) : <p>No sensor data available</p>}
          </div>
        </section>
        )}

        {/* RISK ZONES TAB */}
        {activeTab === 'zones' && (
        <section className="content-section">
          <h3><FiAlertOctagon /> Risk Zones & Hazard Locations</h3>
          <div className="zones-table-container">
            <table className="zones-table">
              <thead>
                <tr>
                  <th>Zone Name</th>
                  <th>Risk Level</th>
                  <th>Occupancy</th>
                  <th>Ventilation</th>
                  <th>Monitoring</th>
                  <th>Next Inspection</th>
                </tr>
              </thead>
              <tbody>
                {riskZones.length > 0 ? riskZones.map((zone) => (
                  <tr key={zone.id} className={`zone-${zone.risk_level}`}>
                    <td className="bold">{zone.zone_name}</td>
                    <td><span className={`risk-badge ${zone.risk_level}`}>{zone.risk_level}</span></td>
                    <td>{zone.current_occupancy}/{zone.max_capacity}</td>
                    <td><span className={`status-badge ${zone.ventilation_status}`}>{zone.ventilation_status}</span></td>
                    <td><span className={`status-badge ${zone.gas_monitoring_status}`}>{zone.gas_monitoring_status}</span></td>
                    <td>{zone.next_inspection ? new Date(zone.next_inspection).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                )) : <tr><td colSpan="6" className="no-data">No risk zones found</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        )}

        {/* PPE COMPLIANCE TAB */}
        {activeTab === 'ppe' && (
        <section className="content-section">
          <h3><FiShield /> PPE Compliance Status</h3>
          <div className="ppe-table-container">
            <table className="ppe-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Helmet</th>
                  <th>Respirator</th>
                  <th>Boots</th>
                  <th>Gloves</th>
                  <th>Vest</th>
                  <th>Overall</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {ppeCompliance.length > 0 ? ppeCompliance.map((item) => (
                  <tr key={item.id} className={`ppe-${item.overall_compliance}`}>
                    <td className="bold">{item.emp_name}</td>
                    <td><span className={`item-badge ${item.helmet}`}>{item.helmet}</span></td>
                    <td><span className={`item-badge ${item.respirator}`}>{item.respirator}</span></td>
                    <td><span className={`item-badge ${item.safety_boots}`}>{item.safety_boots}</span></td>
                    <td><span className={`item-badge ${item.gloves}`}>{item.gloves}</span></td>
                    <td><span className={`item-badge ${item.vest}`}>{item.vest}</span></td>
                    <td><span className={`compliance-badge ${item.overall_compliance}`}>{item.overall_compliance}</span></td>
                    <td>{item.next_due_date ? new Date(item.next_due_date).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                )) : <tr><td colSpan="8" className="no-data">No PPE data found</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        )}

        {/* ALERTS TAB */}
        {activeTab === 'alerts' && (
        <section className="content-section">
          <h3><FiAlertOctagon /> Active Sensor Alerts</h3>
          <div className="alerts-table-container">
            <table className="alerts-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Sensor Type</th>
                  <th>Alert Message</th>
                  <th>Reading</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Triggered</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sensorAlerts.length > 0 ? sensorAlerts.map((alert) => (
                  <tr key={alert.id} className={`alert-${alert.status}`}>
                    <td className="bold">{alert.location}</td>
                    <td>{alert.sensor_type}</td>
                    <td>{alert.alert_message}</td>
                    <td>{alert.reading_value ? `${alert.reading_value}/${alert.threshold_value}` : 'N/A'}</td>
                    <td><span className={`severity-badge ${alert.severity}`}>{alert.severity}</span></td>
                    <td><span className={`status-badge ${alert.status}`}>{alert.status}</span></td>
                    <td>{new Date(alert.triggered_at).toLocaleString()}</td>
                    <td>
                      {alert.status === 'active' && (
                        <button className="action-btn" onClick={() => handleAcknowledgeAlert(alert.id)}>Acknowledge</button>
                      )}
                      {alert.status === 'acknowledged' && (
                        <button className="action-btn secondary" onClick={() => handleResolveAlert(alert.id)}>Resolve</button>
                      )}
                    </td>
                  </tr>
                )) : <tr><td colSpan="8" className="no-data">No active alerts</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        )}

        {/* INCIDENTS SECTION */}
        <section className="incident-section">
          <div className="section-head">
            <h3><FiAlertOctagon /> Recent Safety Incidents</h3>
            <div style={{ position: 'relative' }}>
              <button className="report-btn" onClick={generatePDF}>
                <FiDownload /> Generate PDF Report
              </button>
              {showPdfMessage && (
                <div className={`pdf-export-message ${pdfMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {pdfMessage}
                </div>
              )}
            </div>
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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.length > 0 ? incidents.map((inc) => (
                  <tr key={inc.id}>
                    <td>{new Date(inc.reported_date).toLocaleTimeString()}</td>
                    <td className="bold">{inc.location || 'N/A'}</td>
                    <td>{inc.incident_type}</td>
                    <td>{inc.description}</td>
                    <td>
                      <span className={`sev-tag ${inc.severity.toLowerCase()}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td><span className={`status-tag ${inc.status}`}>{inc.status}</span></td>
                    <td>
                      {inc.status !== 'resolved' && (
                        <button 
                          className="resolve-btn" 
                          onClick={() => handleResolve(inc.id)}
                        >
                          <FiCheckCircle /> Resolve
                        </button>
                      )}
                      {inc.status === 'resolved' && (
                        <span className="resolved-tag">Resolved</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No safety incidents reported.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="safety-compliance-row">
          <div className="comp-item">
            <FiActivity /> <span>Days since last Lost-Time Injury: <strong>{dashboardSummary.todayMetrics?.days_without_lti || 0}</strong></span>
          </div>
          <div className="comp-item">
            <FiShield /> <span>PPE Compliance: <strong>{(dashboardSummary.todayMetrics?.ppe_compliance_rate || 0).toFixed(1)}%</strong></span>
          </div>
          <div className="comp-item">
            <FiAlertOctagon /> <span>Critical Incidents (Today): <strong>{dashboardSummary.todayMetrics?.critical_incidents || 0}</strong></span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default SafetyReport;
