import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, FiClock, FiActivity, FiLogOut, FiBarChart2, FiMapPin, FiCalendar, 
  FiHeart, FiEye, FiDownload 
} from 'react-icons/fi';
import './EmployeeDashboard.css';
import Calendar from '../components/Dashboard/EmployeeDashboard/Calendar';
import api from '../api';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [previewReport, setPreviewReport] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [healthData, setHealthData] = useState([]);
  const [shiftData, setShiftData] = useState([]);
  const [payslipData, setPayslipData] = useState([]);
  const [safetyStatus, setSafetyStatus] = useState('green');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const emp_id = localStorage.getItem('user_id');

        // Fetch profile
        const profileRes = await api.get(`/employee/profile/${emp_id}`);
        setEmployeeData(profileRes.data.employee);

        // Fetch health
        const healthRes = await api.get(`/employee/health/${emp_id}`);
        setHealthData(healthRes.data.checkups);

        // Fetch shifts
        const shiftRes = await api.get(`/employee/shifts/${emp_id}`);
        setShiftData(shiftRes.data.shifts);

        // Fetch payslips
        const payslipRes = await api.get(`/employee/mypayslips/${emp_id}`);
        setPayslipData(payslipRes.data.payslips);

        // Fetch safety status
        const safetyRes = await api.get(`/employee/safety-status/${emp_id}`);
        setSafetyStatus(safetyRes.data.safetyStatus);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError('Failed to load employee data');
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [navigate]);

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

  const handleDownloadPayslip = (payslip) => {
    // For now, just alert. In real app, generate PDF
    alert(`Downloading payslip for ${payslip.month}/${payslip.year}`);
  };

  const getShiftTime = (shift) => {
    const shifts = {
      'A': '8:00 AM - 4:00 PM',
      'B': '12:00 AM - 8:00 AM',
      'C': '4:00 PM - 12:00 AM'
    };
    return shifts[shift] || 'Unknown';
  };

  if (loading) {
    return <div className="loading">Loading employee data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

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
          <div 
            className={`nav-item ${activeTab === 'payslip' ? 'active' : ''}`} 
            onClick={() => setActiveTab('payslip')}
          >
            <FiBarChart2 /> <span>My Payslips</span>
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
            <h1>Welcome back, {employeeData ? employeeData.emp_name.split(' ')[0] : 'Employee'}!</h1>
            <p>ID: {employeeData?.emp_id} | Safety Status: <span className={`status-badge-${safetyStatus}`}>{safetyStatus.toUpperCase()}</span></p>
          </div>
          <div className="last-login">Last Sync: Today, 08:00 AM</div>
        </header>

        <section className="emp-dynamic-content">
          {activeTab === 'details' && employeeData && (
            <div className="emp-card-grid">
              <div className="info-card">
                <h3>Personal Information</h3>
                <div className="info-row"><span>Full Name:</span> <strong>{employeeData.emp_name}</strong></div>
                <div className="info-row"><span>Employee ID:</span> <strong>{employeeData.emp_id}</strong></div>
                <div className="info-row"><span>Role:</span> <strong>{employeeData.role.replace('_', ' ').toUpperCase()}</strong></div>
                <div className="info-row"><span>Shift:</span> <strong>{employeeData.shift}</strong></div>
                <div className="info-row"><span>Status:</span> <strong>{employeeData.status}</strong></div>
                <div className="info-row"><span>Date of Joining:</span> <strong>{employeeData.date_of_joining ? new Date(employeeData.date_of_joining).toLocaleDateString() : 'N/A'}</strong></div>
              </div>
              <div className="info-card">
                <h3>Contact Information</h3>
                <div className="info-row"><span>Contact:</span> <strong>{employeeData.mobile || 'N/A'}</strong></div>
                <div className="info-row"><span>Email:</span> <strong>{employeeData.email || 'N/A'}</strong></div>
                <div className="info-row"><span>Aadhaar:</span> <strong>{employeeData.aadhaar || 'N/A'}</strong></div>
                <div className="info-row"><span>PAN:</span> <strong>{employeeData.pan || 'N/A'}</strong></div>
                <div className="info-row"><span>Bank Account:</span> <strong>{employeeData.bank_account ? '**** **** ' + employeeData.bank_account.slice(-4) : 'N/A'}</strong></div>
                <div className="info-row"><span>IFSC Code:</span> <strong>{employeeData.ifsc_code || 'N/A'}</strong></div>
              </div>
              <div className="info-card">
                <h3>Address</h3>
                <div className="info-row"><span>City:</span> <strong>{employeeData.city || 'N/A'}</strong></div>
                <div className="info-row"><span>State:</span> <strong>{employeeData.state || 'N/A'}</strong></div>
                <div className="info-row"><span>Country:</span> <strong>{employeeData.country || 'India'}</strong></div>
                <div className="info-row"><span>Pincode:</span> <strong>{employeeData.pincode || 'N/A'}</strong></div>
              </div>
              <div className="info-card">
                <h3>Emergency Contact</h3>
                <div className="info-row"><span>Contact Name:</span> <strong>{employeeData.emergency_contact_name || 'N/A'}</strong></div>
                <div className="info-row"><span>Relationship:</span> <strong>{employeeData.emergency_contact_relation || 'N/A'}</strong></div>
                <div className="info-row"><span>Phone:</span> <strong>{employeeData.emergency_contact_phone || 'N/A'}</strong></div>
              </div>
            </div>
          )}

          {activeTab === 'shift' && employeeData && (
            <div className="shift-view">
              <div className="shift-status-card">
                <FiCalendar className="shift-icon" />
                <div>
                  <h2>Current Assignment</h2>
                  <p><strong>Role:</strong> {employeeData.role.replace('_', ' ').toUpperCase()}</p>
                  <p><strong>Shift {employeeData.shift}:</strong> {getShiftTime(employeeData.shift)}</p>
                  <p><strong>Status:</strong> {employeeData.status}</p>
                </div>
              </div>
              <Calendar shifts={shiftData} />
            </div>
          )}

{activeTab === 'health' && (
            <div className="health-view">
              <div className="health-summary">
                <div className="health-header">
                  <FiActivity /> <h2>Current Health Status</h2>
                  <span className="fit-status">Fit for Duty</span>
                </div>
                {(() => {
                  const latestCheckup = healthData.find(c => c.status === 'completed');
                  if (latestCheckup) {
                    return (
                      <div className="vitals-grid">
                        <div className="vital-item">
                          <span className="v-label">Heart Rate</span>
                          <span className="v-value">{latestCheckup.heart_rate || 'N/A'}</span>
                        </div>
                        <div className="vital-item">
                          <span className="v-label">Blood Pressure</span>
                          <span className="v-value">{latestCheckup.blood_pressure || 'N/A'}</span>
                        </div>
                        <div className="vital-item">
                          <span className="v-label">Oxygen Saturation</span>
                          <span className="v-value">{latestCheckup.oxygen_saturation || 'N/A'}</span>
                        </div>
                        <div className="vital-item">
                          <span className="v-label">Body Temp</span>
                          <span className="v-value">{latestCheckup.body_temperature || 'N/A'}</span>
                        </div>
                      </div>
                    );
                  }
                  return <p>No vitals data available</p>;
                })()}
                <div className="checkup-notice">
                  Last Checkup: {healthData.find(c => c.status === 'completed') ? new Date(healthData.find(c => c.status === 'completed').checkup_date).toLocaleDateString() : 'None'}
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
                        <th>Type</th>
                        <th>Doctor</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {healthData.filter(c => c.status === 'completed').length > 0 ? healthData.filter(c => c.status === 'completed').map((checkup) => (
                        <tr key={checkup.id}>
                          <td>{new Date(checkup.checkup_date).toLocaleDateString()}</td>
                          <td>{checkup.checkup_type}</td>
                          <td>{checkup.doctor_name || 'N/A'}</td>
                          <td>
                            <span className="status-badge-cleared">Completed</span>
                          </td>
                          <td>
                            {checkup.report_url && (
                              <>
                                <button className="action-btn" onClick={() => handlePreview(checkup.report_url)}>
                                  <FiEye /> Preview
                                </button>
                                <button className="action-btn" onClick={() => handleDownload(checkup.report_url)}>
                                  <FiDownload /> Download
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="no-data">
                            No completed health checkups.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Upcoming Checkups */}
              <div className="upcoming-section">
                <h3>Upcoming Health Checkups</h3>
                <div className="upcoming-grid">
                  {healthData.filter(c => c.status === 'scheduled').length > 0 ? healthData.filter(c => c.status === 'scheduled').map((checkup) => (
                    <div key={checkup.id} className="upcoming-card">
                      <FiCalendar className="up-icon" />
                      <h4>{checkup.checkup_type}</h4>
                      <p className="up-date">{new Date(checkup.checkup_date).toLocaleDateString()}</p>
                      <p>{checkup.notes || 'No notes'}</p>
                      <button className="reschedule-btn">Reschedule</button>
                    </div>
                  )) : (
                    <div className="no-data">
                      No upcoming health checkups scheduled.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payslip' && (
            <div className="payslip-view">
              <h2>My Payslips</h2>
              {payslipData.length > 0 ? (
                <div className="payslip-list">
                  {payslipData.map((payslip) => (
                    <div key={`${payslip.month}-${payslip.year}`} className="payslip-card">
                      <div className="payslip-header">
                        <h3>Payslip for {new Date(payslip.year, payslip.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                        <span className="payslip-date">Generated: {new Date(payslip.generated_date).toLocaleDateString()}</span>
                      </div>
                      <div className="payslip-details">
                        <div className="earnings">
                          <h4>Earnings</h4>
                          <div className="detail-row"><span>Basic Salary:</span> ₹{payslip.basic_salary}</div>
                          <div className="detail-row"><span>HRA:</span> ₹{payslip.hra}</div>
                          <div className="detail-row"><span>Conveyance:</span> ₹{payslip.conveyance}</div>
                          <div className="detail-row"><span>Medical:</span> ₹{payslip.medical}</div>
                          <div className="detail-row"><span>LTA:</span> ₹{payslip.lta}</div>
                          <div className="detail-row total"><span>Gross Earnings:</span> ₹{payslip.gross_earnings}</div>
                        </div>
                        <div className="deductions">
                          <h4>Deductions</h4>
                          <div className="detail-row"><span>PF Employee:</span> ₹{payslip.pf_employee}</div>
                          <div className="detail-row"><span>ESI Employee:</span> ₹{payslip.esi_employee}</div>
                          <div className="detail-row"><span>Professional Tax:</span> ₹{payslip.professional_tax}</div>
                          <div className="detail-row"><span>Income Tax:</span> ₹{payslip.income_tax}</div>
                          <div className="detail-row"><span>Other Deductions:</span> ₹{payslip.other_deductions}</div>
                          <div className="detail-row total"><span>Total Deductions:</span> ₹{payslip.total_deductions}</div>
                        </div>
                      </div>
                      <div className="net-pay">
                        <strong>Net Pay: ₹{payslip.net_pay}</strong>
                      </div>
                      <button className="download-btn" onClick={() => handleDownloadPayslip(payslip)}>
                        <FiDownload /> Download PDF
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No payslips available.</p>
              )}
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