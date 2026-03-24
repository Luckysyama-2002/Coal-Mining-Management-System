import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, FiClock, FiActivity, FiLogOut, FiBarChart2, FiMapPin, FiCalendar, 
  FiHeart, FiEye, FiDownload 
} from 'react-icons/fi';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [previewReport, setPreviewReport] = useState(null);

  // Mock Data for the logged-in employee
  const employeeData = {
    name: "Rajesh Kumar",
    id: "CM-4092",
    role: "Excavator Operator",
    shift: "A (Morning)",
    zone: "Sector 7 - Underground",
    supervisor: "Vikram Rathore (MGR-102)",
    joinDate: "2023-05-10",
    contact: "+91 98765 43210",
    email: "rajesh.kumar@coalmine.com",
    aadhaar: "1234 5678 9012",
    pan: "ABCDE1234F",
    bankAccount: "**** **** 5678",
    ifsc: "SBI0000123",
    city: "Dhanbad",
    state: "Jharkhand",
    country: "India",
    pincode: "826001",
    healthStatus: "Fit for Duty",
    lastCheckup: "Oct 12, 2025",
    vitals: {
      heartRate: "72 bpm",
      bloodPressure: "120/80",
      oxygen: "98%",
      bodyTemp: "36.6°C"
    },
    previousCheckups: [
      { id: 1, date: "2024-10-12", doctor: "Dr. A. Sharma", status: "Cleared", reportUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: 2, date: "2024-09-15", doctor: "Dr. R. Patel", status: "Minor Issue - Rest Recommended", reportUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { id: 3, date: "2024-08-20", doctor: "Dr. S. Gupta", status: "Cleared", reportUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
    ],
    upcomingCheckups: [
      { id: 1, date: "2024-11-15", type: "Annual Medical Exam", notes: "Full body and fitness certification" },
      { id: 2, date: "2024-12-10", type: "Pulmonary Function Test", notes: "Dust exposure monitoring" }
    ]
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handlePreview = (url) => {
    setPreviewReport(url);
  };

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'health-report.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="emp-dashboard-container">

      {/* SIDEBAR */}
      <aside className="emp-sidebar">
        <div className="emp-logo">
          <FiBarChart2 className="logo-icon" />
          <span>MINE-SYNC PRO</span>
        </div>

        <nav className="emp-nav">
          <div 
            className={`nav-item ${activeTab === 'details' ? 'active' : ''}`} 
            onClick={() => setActiveTab('details')}
          >
             <FiUser /> <span>My Profile</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'health' ? 'active' : ''}`} 
            onClick={() => setActiveTab('health')}
          >
            <FiActivity /> <span>Doctor Checkups</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'shift' ? 'active' : ''}`} 
            onClick={() => setActiveTab('shift')}
          >
            <FiMapPin /> <span>Shift Schedule</span>
          </div>
        </nav>

        <button className="emp-logout" onClick={handleLogout}>
          <FiLogOut /> <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="emp-main">
        <header className="emp-header">
          <div>
            <h1>Welcome back, {employeeData.name.split(' ')[0]}!</h1>
            <p>ID: {employeeData.id} | Safety Status: <span className="status-badge-green">Cleared</span></p>
          </div>
          <div className="last-login">Last Sync: Today, 08:00 AM</div>
        </header>

        <section className="emp-dynamic-content">
          {activeTab === 'details' && (
            <div className="emp-card-grid">
              <div className="info-card">
                <h3>Personal Information</h3>
                <div className="info-row"><span>Full Name:</span> <strong>{employeeData.name}</strong></div>
                <div className="info-row"><span>Employee ID:</span> <strong>{employeeData.id}</strong></div>
                <div className="info-row"><span>Primary Zone:</span> <strong>{employeeData.zone}</strong></div>
                <div className="info-row"><span>Role:</span> <strong>{employeeData.role}</strong></div>
                <div className="info-row"><span>Shift:</span> <strong>{employeeData.shift}</strong></div>
                <div className="info-row"><span>Supervisor:</span> <strong>{employeeData.supervisor}</strong></div>
                <div className="info-row"><span>Date of Joining:</span> <strong>{employeeData.joinDate}</strong></div>
              </div>
              <div className="info-card">
                <h3>Contact Information</h3>
                <div className="info-row"><span>Contact:</span> <strong>{employeeData.contact}</strong></div>
                <div className="info-row"><span>Email:</span> <strong>{employeeData.email}</strong></div>
                <div className="info-row"><span>Aadhaar:</span> <strong>{employeeData.aadhaar}</strong></div>
                <div className="info-row"><span>PAN:</span> <strong>{employeeData.pan}</strong></div>
                <div className="info-row"><span>Bank Account:</span> <strong>{employeeData.bankAccount}</strong></div>
                <div className="info-row"><span>IFSC Code:</span> <strong>{employeeData.ifsc}</strong></div>
              </div>
              <div className="info-card">
                <h3>Address</h3>
                <div className="info-row"><span>City:</span> <strong>{employeeData.city}</strong></div>
                <div className="info-row"><span>State:</span> <strong>{employeeData.state}</strong></div>
                <div className="info-row"><span>Country:</span> <strong>{employeeData.country}</strong></div>
                <div className="info-row"><span>Pincode:</span> <strong>{employeeData.pincode}</strong></div>
              </div>
              <div className="info-card">
                <h3>Emergency Contact</h3>
                <div className="info-row"><span>Contact Name:</span> <strong>Sunita Kumar</strong></div>
                <div className="info-row"><span>Relationship:</span> <strong>Spouse</strong></div>
                <div className="info-row"><span>Phone:</span> <strong>+91 98765-43210</strong></div>
              </div>
            </div>
          )}

          {activeTab === 'shift' && (
            <div className="shift-view">
              <div className="shift-status-card">
                <FiCalendar className="shift-icon" />
                <div>
                  <h2>Current Assignment</h2>
                  <p><strong>Role:</strong> {employeeData.role}</p>
                  <p><strong>Current Shift:</strong> {employeeData.shift}</p>
                  <p><strong>Reporting To:</strong> {employeeData.supervisor}</p>
                </div>
              </div>
              <div className="location-card">
                <FiMapPin />
                <span>Assigned Workstation: <strong>Level 4 South Wing</strong></span>
              </div>
            </div>
          )}

{activeTab === 'health' && (
            <div className="health-view">
              <div className="health-summary">
                <div className="health-header">
                  <FiActivity /> <h2>Current Health Status</h2>
                  <span className="fit-status">{employeeData.healthStatus}</span>
                </div>
                <div className="vitals-grid">
                  <div className="vital-item">
                    <span className="v-label">Heart Rate</span>
                    <span className="v-value">{employeeData.vitals.heartRate}</span>
                  </div>
                  <div className="vital-item">
                    <span className="v-label">Blood Pressure</span>
                    <span className="v-value">{employeeData.vitals.bloodPressure}</span>
                  </div>
                  <div className="vital-item">
                    <span className="v-label">Oxygen Saturation</span>
                    <span className="v-value">{employeeData.vitals.oxygen}</span>
                  </div>
                  <div className="vital-item">
                    <span className="v-label">Body Temp</span>
                    <span className="v-value">{employeeData.vitals.bodyTemp}</span>
                  </div>
                </div>
                <div className="checkup-notice">
                  Last Checkup: {employeeData.lastCheckup}
                </div>
              </div>

              {/* Previous Checkups Table */}
              <div className="reports-section">
                <h3>Previous Doctor Checkups</h3>
                <div className="table-container">
                  <table className="health-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Doctor</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeData.previousCheckups.map((checkup) => (
                        <tr key={checkup.id}>
                          <td>{new Date(checkup.date).toLocaleDateString()}</td>
                          <td>{checkup.doctor}</td>
                          <td>
                            <span className={`status-badge ${checkup.status === 'Cleared' ? 'status-cleared' : 'status-issue'}`}>
                              {checkup.status}
                            </span>
                          </td>
                          <td>
                            <button className="action-btn" onClick={() => handlePreview(checkup.reportUrl)}>
                              <FiEye /> Preview
                            </button>
                            <button className="action-btn" onClick={() => handleDownload(checkup.reportUrl)}>
                              <FiDownload /> Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Upcoming Checkups */}
              <div className="upcoming-section">
                <h3>Upcoming Health Checkups</h3>
                <div className="upcoming-grid">
                  {employeeData.upcomingCheckups.map((checkup) => (
                    <div key={checkup.id} className="upcoming-card">
                      <FiCalendar className="up-icon" />
                      <h4>{checkup.type}</h4>
                      <p className="up-date">{new Date(checkup.date).toLocaleDateString()}</p>
                      <p>{checkup.notes}</p>
                      <button className="reschedule-btn">Reschedule</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {previewReport && (
            <div className="preview-modal-overlay">
              <div className="preview-modal">
                <div className="modal-header">
                  <h3>Health Report Preview</h3>
                  <button className="close-btn" onClick={() => setPreviewReport(null)}>×</button>
                </div>
                <iframe src={previewReport} title="Health Report" className="report-iframe" />
                <div className="modal-actions">
                  <button onClick={() => handleDownload(previewReport)}>Download PDF</button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default EmployeeDashboard;