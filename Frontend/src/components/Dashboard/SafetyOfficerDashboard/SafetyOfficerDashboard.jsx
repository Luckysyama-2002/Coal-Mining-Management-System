import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShield, FiAlertTriangle, FiUsers, FiTrendingUp,
  FiFileText, FiCheckCircle, FiLogOut, FiBarChart2,
  FiPlus, FiEye, FiEdit, FiDownload, FiActivity,
  FiThermometer, FiWind, FiZap, FiAlertOctagon, FiX, FiUser
} from 'react-icons/fi';
import api from '../../../api';
import Profile from '../ManagerDashboard/Profile';
import './SafetyOfficerDashboard.css';

const SafetyOfficerDashboard = ({ onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [incidents, setIncidents] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [sensors, setSensors] = useState({});
  const [riskZones, setRiskZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState({});

  const [incidentForm, setIncidentForm] = useState({
    emp_id: '',
    incident_type: 'accident',
    description: '',
    severity: 'medium',
    location: ''
  });

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  // Fetch all safety data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch incidents
        try {
          const incidentsRes = await api.get('/employee/safety');
          setIncidents(incidentsRes.data.incidents);
        } catch (err) {
          console.warn('Failed to fetch incidents, using empty array:', err);
          setIncidents([]);
        }

        // Fetch sensor readings with fallback dummy data
        try {
          const sensorsRes = await api.get('/employee/sensor-readings');
          setSensors(sensorsRes.data.readings);
        } catch (err) {
          console.warn('Failed to fetch sensor readings, using dummy data:', err);
          // Dummy sensor data
          const dummySensors = {
            "Sector A": [
              {
                id: 1,
                type: "methane",
                value: 1.2,
                unit: "%",
                status: "safe",
                threshold_min: 0,
                threshold_max: 2,
                recorded_at: new Date().toISOString()
              },
              {
                id: 2,
                type: "oxygen",
                value: 20.5,
                unit: "%",
                status: "safe",
                threshold_min: 19,
                threshold_max: 23,
                recorded_at: new Date().toISOString()
              }
            ],
            "Sector B": [
              {
                id: 3,
                type: "methane",
                value: 2.8,
                unit: "%",
                status: "warning",
                threshold_min: 0,
                threshold_max: 2,
                recorded_at: new Date().toISOString()
              },
              {
                id: 4,
                type: "temperature",
                value: 35.2,
                unit: "C",
                status: "safe",
                threshold_min: 0,
                threshold_max: 40,
                recorded_at: new Date().toISOString()
              }
            ]
          };
          setSensors(dummySensors);
        }

        // Fetch risk zones
        try {
          const zonesRes = await api.get('/employee/risk-zones');
          setRiskZones(zonesRes.data.zones);
        } catch (err) {
          console.warn('Failed to fetch risk zones, using empty array:', err);
          setRiskZones([]);
        }

        // Fetch sensor alerts
        try {
          const alertsRes = await api.get('/employee/sensor-alerts');
          setAlerts(alertsRes.data.alerts);
        } catch (err) {
          console.warn('Failed to fetch sensor alerts, using empty array:', err);
          setAlerts([]);
        }

        // Fetch dashboard summary
        try {
          const dashboardRes = await api.get('/employee/safety-dashboard');
          setDashboardSummary(dashboardRes.data.summary);
        } catch (err) {
          console.warn('Failed to fetch dashboard summary, using dummy data:', err);
          // Dummy dashboard summary
          const dummySummary = {
            todayMetrics: {
              total_incidents: 3,
              critical_incidents: 1,
              days_without_lti: 45,
              ppe_compliance_rate: 87.5
            },
            activeIncidents: 2,
            sensorAlerts: {
              total_alerts: 4,
              critical_alerts: 1,
              active_alerts: 2
            },
            highRiskZones: 1,
            ppeNonCompliance: 2
          };
          setDashboardSummary(dummySummary);
        }

        setLoading(false);
      } catch (err) {
        console.error('Critical error in fetchAllData:', err);
        setError('Failed to load safety data');
        setLoading(false);
      }
    };

    fetchAllData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateIncident = async () => {
    try {
      await api.post('/employee/safety', incidentForm);
      // Refresh incidents
      const response = await api.get('/employee/safety');
      setIncidents(response.data.incidents);
      setShowIncidentForm(false);
      setIncidentForm({
        emp_id: '',
        incident_type: 'accident',
        description: '',
        severity: 'medium',
        location: ''
      });
    } catch (error) {
      console.error('Failed to create incident:', error);
    }
  };

  const handleResolveIncident = async (id) => {
    try {
      await api.put(`/employee/safety/${id}`, { status: 'resolved', resolution: 'Resolved by safety officer' });
      setIncidents(prev => prev.map(inc =>
        inc.id === id ? { ...inc, status: 'resolved' } : inc
      ));
    } catch (error) {
      console.error('Failed to resolve incident:', error);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await api.put(`/employee/sensor-alerts/${alertId}/acknowledge`);
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
      ));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await api.put(`/employee/sensor-alerts/${alertId}/resolve`);
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, status: 'resolved' } : alert
      ));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  if (loading) {
    return (
      <div className="safety-officer-wrapper">
        <div className="loading-state">Loading safety dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="safety-officer-wrapper">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="safety-officer-wrapper">
      {/* Header */}
      <div className="safety-header">
        <div className="header-content">
          <div className="header-title">
            <FiShield className="header-icon" />
            <h1>Safety Officer Dashboard</h1>
          </div>
          <div className="header-actions">
            <button className="action-btn primary" onClick={() => setShowIncidentForm(true)}>
              <FiPlus /> Report Incident
            </button>
            <button className="action-btn secondary" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
            {onClose && (
              <button className="action-btn secondary" onClick={onClose}>
                <FiX /> Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="safety-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiBarChart2 /> Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'incidents' ? 'active' : ''}`}
          onClick={() => setActiveTab('incidents')}
        >
          <FiAlertTriangle /> Incidents
        </button>
        <button
          className={`tab-btn ${activeTab === 'sensors' ? 'active' : ''}`}
          onClick={() => setActiveTab('sensors')}
        >
          <FiActivity /> Sensors
        </button>
        <button
          className={`tab-btn ${activeTab === 'zones' ? 'active' : ''}`}
          onClick={() => setActiveTab('zones')}
        >
          <FiShield /> Risk Zones
        </button>
        <button
          className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <FiAlertOctagon /> Alerts
        </button>
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FiUser /> Profile
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            {/* Summary Cards */}
            <div className="summary-grid">
              <div className="summary-card">
                <FiAlertTriangle className="card-icon critical" />
                <div className="card-content">
                  <h3>{dashboardSummary.todayMetrics?.total_incidents || 0}</h3>
                  <p>Total Incidents Today</p>
                </div>
              </div>
              <div className="summary-card">
                <FiTrendingUp className="card-icon warning" />
                <div className="card-content">
                  <h3>{dashboardSummary.todayMetrics?.critical_incidents || 0}</h3>
                  <p>Critical Incidents</p>
                </div>
              </div>
              <div className="summary-card">
                <FiShield className="card-icon success" />
                <div className="card-content">
                  <h3>{dashboardSummary.todayMetrics?.days_without_lti || 0}</h3>
                  <p>Days Without LTI</p>
                </div>
              </div>
              <div className="summary-card">
                <FiCheckCircle className="card-icon info" />
                <div className="card-content">
                  <h3>{(dashboardSummary.todayMetrics?.ppe_compliance_rate || 0).toFixed(1)}%</h3>
                  <p>PPE Compliance</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
              <h3>Recent Safety Activity</h3>
              <div className="activity-list">
                {incidents.slice(0, 5).map(incident => (
                  <div key={incident.id} className="activity-item">
                    <div className="activity-icon">
                      <FiAlertTriangle />
                    </div>
                    <div className="activity-content">
                      <p>{incident.incident_type} reported at {incident.location}</p>
                      <span>{new Date(incident.reported_date).toLocaleString()}</span>
                    </div>
                    <span className={`status-badge ${incident.status}`}>
                      {incident.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="incidents-section">
            <div className="section-header">
              <h3>Safety Incidents Management</h3>
              <button className="action-btn primary" onClick={() => setShowIncidentForm(true)}>
                <FiPlus /> New Incident
              </button>
            </div>

            <div className="incidents-table-container">
              <table className="incidents-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map(incident => (
                    <tr key={incident.id}>
                      <td>{new Date(incident.reported_date).toLocaleDateString()}</td>
                      <td>{incident.incident_type}</td>
                      <td>{incident.location}</td>
                      <td>
                        <span className={`severity-badge ${incident.severity}`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${incident.status}`}>
                          {incident.status}
                        </span>
                      </td>
                      <td>
                        {incident.status !== 'resolved' && (
                          <button
                            className="action-btn small success"
                            onClick={() => handleResolveIncident(incident.id)}
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sensors' && (
          <div className="sensors-section">
            <h3>Real-time Sensor Monitoring</h3>
            <div className="sensors-grid">
              {Object.entries(sensors).map(([location, readings]) => (
                <div key={location} className="sensor-card">
                  <h4>{location}</h4>
                  <div className="sensor-readings">
                    {readings.map((reading, index) => (
                      <div key={index} className={`sensor-item ${reading.status}`}>
                        <span className="sensor-name">{reading.type}</span>
                        <span className="sensor-value">{reading.value} {reading.unit}</span>
                        <span className={`status-indicator ${reading.status}`}></span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="zones-section">
            <h3>Risk Zone Monitoring</h3>
            <div className="zones-table-container">
              <table className="zones-table">
                <thead>
                  <tr>
                    <th>Zone</th>
                    <th>Risk Level</th>
                    <th>Occupancy</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {riskZones.map(zone => (
                    <tr key={zone.id} className={`zone-${zone.risk_level}`}>
                      <td>{zone.zone_name}</td>
                      <td>
                        <span className={`risk-badge ${zone.risk_level}`}>
                          {zone.risk_level}
                        </span>
                      </td>
                      <td>{zone.current_occupancy}/{zone.max_occupancy}</td>
                      <td>
                        <span className={`status-badge ${zone.monitoring_status}`}>
                          {zone.monitoring_status}
                        </span>
                      </td>
                      <td>{new Date(zone.last_updated).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="alerts-section">
            <h3>Sensor Alerts Management</h3>
            <div className="alerts-table-container">
              <table className="alerts-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Sensor</th>
                    <th>Location</th>
                    <th>Alert Type</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map(alert => (
                    <tr key={alert.id} className={`alert-${alert.status}`}>
                      <td>{new Date(alert.timestamp).toLocaleString()}</td>
                      <td>{alert.sensor_type}</td>
                      <td>{alert.location}</td>
                      <td>{alert.alert_type}</td>
                      <td>
                        <span className={`severity-badge ${alert.severity}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${alert.status}`}>
                          {alert.status}
                        </span>
                      </td>
                      <td>
                        {alert.status === 'active' && (
                          <button
                            className="action-btn small warning"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </button>
                        )}
                        {alert.status === 'acknowledged' && (
                          <button
                            className="action-btn small success"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <Profile 
            manager={{
              id: localStorage.getItem('user_id'),
              name: localStorage.getItem('user_name'),
              role: localStorage.getItem('user_role')
            }} 
            onClose={() => setActiveTab('overview')} 
          />
        )}
      </div>

      {/* Incident Form Modal */}
      {showIncidentForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Report New Incident</h3>
              <button className="close-btn" onClick={() => setShowIncidentForm(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleCreateIncident(); }}>
                <div className="form-group">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    value={incidentForm.emp_id}
                    onChange={(e) => setIncidentForm({...incidentForm, emp_id: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Incident Type</label>
                  <select
                    value={incidentForm.incident_type}
                    onChange={(e) => setIncidentForm({...incidentForm, incident_type: e.target.value})}
                  >
                    <option value="accident">Accident</option>
                    <option value="near_miss">Near Miss</option>
                    <option value="hazard">Hazard</option>
                    <option value="equipment_failure">Equipment Failure</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={incidentForm.description}
                    onChange={(e) => setIncidentForm({...incidentForm, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Severity</label>
                  <select
                    value={incidentForm.severity}
                    onChange={(e) => setIncidentForm({...incidentForm, severity: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={incidentForm.location}
                    onChange={(e) => setIncidentForm({...incidentForm, location: e.target.value})}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn secondary" onClick={() => setShowIncidentForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn primary">
                    Report Incident
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyOfficerDashboard;

