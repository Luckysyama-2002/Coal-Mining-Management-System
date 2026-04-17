import React, { useState, useEffect } from 'react';
import { 
  FiFileText, FiTrendingUp, FiAlertCircle, FiX,
  FiShield, FiDownload, FiBarChart2 
} from 'react-icons/fi';
import api from '../../../api';
import './AuditReport.css';

const AuditReport = ({ onClose }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [productionAudits, setProductionAudits] = useState([]);
  const [complianceAudits, setComplianceAudits] = useState([]);
  const [auditSummary, setAuditSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('production');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [messageTimeout, setMessageTimeout] = useState(null);
  const [messageFadeOut, setMessageFadeOut] = useState(false);

  useEffect(() => {
    return () => {
      if (messageTimeout) {
        if (messageTimeout.fade) clearTimeout(messageTimeout.fade);
        if (messageTimeout.clear) clearTimeout(messageTimeout.clear);
      }
    };
  }, [messageTimeout]);

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        const [summaryRes, productionRes, complianceRes, logsRes] = await Promise.all([
          api.get('/employee/audit-summary'),
          api.get('/employee/production-audits'),
          api.get('/employee/compliance-audits'),
          api.get('/employee/audit')
        ]);

        setAuditSummary(summaryRes.data.summary);
        setProductionAudits(productionRes.data.audits);
        setComplianceAudits(complianceRes.data.audits);
        setAuditLogs(logsRes.data.logs);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch audit data:', error);
        setLoading(false);
      }
    };
    fetchAuditData();
  }, []);

  // Function to convert array of objects to CSV
  const convertToCSV = (data, headers) => {
    if (!data || data.length === 0) return '';

    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma or quote
        if (value.toString().includes(',') || value.toString().includes('"')) {
          return `"${value.toString().replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  };

  // Function to download CSV file
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export handler
  const handleExport = () => {
    // Clear any existing timeouts
    if (messageTimeout) {
      if (messageTimeout.fade) clearTimeout(messageTimeout.fade);
      if (messageTimeout.clear) clearTimeout(messageTimeout.clear);
    }

    setExportLoading(true);
    setExportMessage('');
    setMessageFadeOut(false);

    let dataToExport = [];
    let headers = [];
    let filename = '';

    switch (activeTab) {
      case 'production':
        if (!productionAudits || productionAudits.length === 0) {
          setExportMessage('No production audit data available. File cannot be downloaded.');
          setExportLoading(false);
          return;
        }
        dataToExport = productionAudits.map(audit => ({
          'Audit ID': audit.audit_id,
          'Date': new Date(audit.date).toLocaleDateString(),
          'Sector': audit.sector,
          'Target (Tons)': audit.target_tons,
          'Actual (Tons)': audit.actual_tons,
          'Variance (Tons)': (audit.actual_tons - audit.target_tons).toFixed(2),
          'Status': audit.status,
          'Reported By': audit.reported_by_name,
          'Verified By': audit.verified_by_name || 'N/A',
          'Notes': audit.notes || 'N/A'
        }));
        headers = ['Audit ID', 'Date', 'Sector', 'Target (Tons)', 'Actual (Tons)', 'Variance (Tons)', 'Status', 'Reported By', 'Verified By', 'Notes'];
        filename = `production_audit_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'compliance':
        if (!complianceAudits || complianceAudits.length === 0) {
          setExportMessage('No compliance audit data available. File cannot be downloaded.');
          setExportLoading(false);
          return;
        }
        dataToExport = complianceAudits.map(audit => ({
          'Audit ID': audit.audit_id,
          'Regulation': audit.regulation,
          'Check Date': new Date(audit.check_date).toLocaleDateString(),
          'Status': audit.status,
          'Severity': audit.severity,
          'Description': audit.description,
          'Findings': audit.findings || 'N/A',
          'Corrective Action': audit.corrective_action || 'N/A',
          'Due Date': audit.due_date ? new Date(audit.due_date).toLocaleDateString() : 'N/A',
          'Audited By': audit.audited_by_name,
          'Assigned To': audit.assigned_to_name || 'N/A'
        }));
        headers = ['Audit ID', 'Regulation', 'Check Date', 'Status', 'Severity', 'Description', 'Findings', 'Corrective Action', 'Due Date', 'Audited By', 'Assigned To'];
        filename = `compliance_audit_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'system':
        if (!auditLogs || auditLogs.length === 0) {
          setExportMessage('No system audit logs available. File cannot be downloaded.');
          setExportLoading(false);
          return;
        }
        dataToExport = auditLogs.map(log => ({
          'Timestamp': new Date(log.timestamp).toLocaleString(),
          'Employee ID': log.emp_id,
          'Employee Name': log.emp_name,
          'Action': log.action,
          'Details': log.details || 'N/A',
          'IP Address': log.ip_address || 'N/A'
        }));
        headers = ['Timestamp', 'Employee ID', 'Employee Name', 'Action', 'Details', 'IP Address'];
        filename = `system_audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        break;

      default:
        setExportMessage('Invalid audit type selected.');
        setExportLoading(false);
        return;
    }

    try {
      const csvContent = convertToCSV(dataToExport, headers);
      downloadCSV(csvContent, filename);
      setExportMessage('Audit data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      setExportMessage('Failed to export audit data. Please try again.');
    }

    setExportLoading(false);

    // Start fade-out animation after 3 seconds, then clear message after 4 seconds total
    const fadeTimeout = setTimeout(() => {
      setMessageFadeOut(true);
    }, 3000);

    const clearTimeout = setTimeout(() => {
      setExportMessage('');
      setMessageFadeOut(false);
    }, 4000);

    setMessageTimeout({ fade: fadeTimeout, clear: clearTimeout });
  };

  return (
    <div className="audit-wrapper">
      <header className="audit-header">
        <div className="header-text">
          <h2><FiFileText /> Operational Audit Report</h2>
          <p>Reviewing production compliance and safety certification logs.</p>
        </div>
        {/* <button className="close-btn" onClick={onClose}>
          <FiX size={24} />
        </button> */}
        <button 
          className={`export-btn ${exportLoading ? 'loading' : ''}`} 
          onClick={handleExport}
          disabled={exportLoading}
        >
          <FiDownload /> {exportLoading ? 'Exporting...' : 'Export Audit (CSV)'}
        </button>
        {exportMessage && (
          <div 
            className={`export-message ${exportMessage.includes('successfully') ? 'success' : 'error'} ${messageFadeOut ? 'fade-out' : ''}`}
            onClick={() => {
              setExportMessage('');
              setMessageFadeOut(false);
              if (messageTimeout) {
                if (messageTimeout.fade) clearTimeout(messageTimeout.fade);
                if (messageTimeout.clear) clearTimeout(messageTimeout.clear);
              }
            }}
            style={{ cursor: 'pointer' }}
            title="Click to dismiss"
          >
            {exportMessage}
            <FiX size={14} style={{ marginLeft: '8px', opacity: 0.7 }} />
          </div>
        )}
      </header>

      {/* AUDIT SUMMARY CARDS */}
      <div className="audit-summary-grid">
        <div className="summary-card">
          <div className="card-icon blue"><FiShield /></div>
          <div className="card-info">
            <span>Compliance Score</span>
            <h3>{auditSummary.complianceScore || 0}%</h3>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon green"><FiBarChart2 /></div>
          <div className="card-info">
            <span>Monthly Output</span>
            <h3>{auditSummary.monthlyOutput || 0} Tons</h3>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon red"><FiAlertCircle /></div>
          <div className="card-info">
            <span>Safety Deviations</span>
            <h3>{auditSummary.safetyDeviations || 0}</h3>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon purple"><FiTrendingUp /></div>
          <div className="card-info">
            <span>Production Efficiency</span>
            <h3>{auditSummary.productionEfficiency || 0}%</h3>
          </div>
        </div>
      </div>

      {/* AUDIT TABS */}
      <div className="audit-tabs">
        <button 
          className={`tab-btn ${activeTab === 'production' ? 'active' : ''}`}
          onClick={() => setActiveTab('production')}
        >
          <FiTrendingUp /> Production Audit
        </button>
        <button 
          className={`tab-btn ${activeTab === 'compliance' ? 'active' : ''}`}
          onClick={() => setActiveTab('compliance')}
        >
          <FiShield /> Compliance Audit
        </button>
        <button 
          className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          <FiFileText /> System Logs
        </button>
      </div>

      {/* DETAILED AUDIT LOG */}
      <section className="audit-log-section">
        <div className="log-header">
          <h3>
            {activeTab === 'production' && <><FiTrendingUp /> Production vs. Target Log</>}
            {activeTab === 'compliance' && <><FiShield /> Compliance Audit Log</>}
            {activeTab === 'system' && <><FiFileText /> System Activity Log</>}
          </h3>
          <span className="timestamp">Last Updated: Just Now</span>
        </div>
        
        <table className="audit-table">
          <thead>
            <tr>
              {activeTab === 'production' && (
                <>
                  <th>Audit ID</th>
                  <th>Date</th>
                  <th>Sector</th>
                  <th>Target</th>
                  <th>Actual</th>
                  <th>Variance</th>
                  <th>Status</th>
                  <th>Reported By</th>
                </>
              )}
              {activeTab === 'compliance' && (
                <>
                  <th>Audit ID</th>
                  <th>Check Date</th>
                  <th>Regulation</th>
                  <th>Status</th>
                  <th>Severity</th>
                  <th>Description</th>
                  <th>Due Date</th>
                  <th>Audited By</th>
                </>
              )}
              {activeTab === 'system' && (
                <>
                  <th>Timestamp</th>
                  <th>Employee</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {activeTab === 'production' && productionAudits.length > 0 ? productionAudits.map((audit) => {
              const variance = audit.actual_tons - audit.target_tons;
              return (
                <tr key={audit.id}>
                  <td className="id-cell">{audit.audit_id}</td>
                  <td>{new Date(audit.date).toLocaleDateString()}</td>
                  <td>{audit.sector}</td>
                  <td>{audit.target_tons}T</td>
                  <td>{audit.actual_tons}T</td>
                  <td className={variance >= 0 ? 'text-green' : 'text-red'}>
                    {variance > 0 ? `+${variance}T` : `${variance}T`}
                  </td>
                  <td>
                    <span className={`audit-pill ${audit.status}`}>
                      {audit.status}
                    </span>
                  </td>
                  <td>{audit.reported_by_name}</td>
                </tr>
              );
            }) : activeTab === 'compliance' && complianceAudits.length > 0 ? complianceAudits.map((audit) => (
              <tr key={audit.id}>
                <td className="id-cell">{audit.audit_id}</td>
                <td>{new Date(audit.check_date).toLocaleDateString()}</td>
                <td>{audit.regulation}</td>
                <td>
                  <span className={`audit-pill ${audit.status}`}>
                    {audit.status}
                  </span>
                </td>
                <td>
                  <span className={`severity-pill ${audit.severity}`}>
                    {audit.severity}
                  </span>
                </td>
                <td>{audit.description}</td>
                <td>{audit.due_date ? new Date(audit.due_date).toLocaleDateString() : 'N/A'}</td>
                <td>{audit.audited_by_name}</td>
              </tr>
            )) : activeTab === 'system' && auditLogs.length > 0 ? auditLogs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.emp_name}</td>
                <td>{log.action}</td>
                <td>{log.details || 'N/A'}</td>
                <td>{log.ip_address || 'N/A'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={activeTab === 'production' ? 8 : activeTab === 'compliance' ? 8 : 5} className="no-data">
                  No audit data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* STATUTORY COMPLIANCE CHECKLIST */}
      <section className="compliance-checklist">
        <h3>Statutory Compliance Status</h3>
        <div className="check-grid">
          <div className="check-item passed">
            <span className="check-bullet">✓</span>
            <p>DGMS Safety Standards 2026</p>
          </div>
          <div className="check-item passed">
            <span className="check-bullet">✓</span>
            <p>Environmental Impact Assessment</p>
          </div>
          <div className="check-item pending">
            <span className="check-bullet">!</span>
            <p>Explosives Inventory Audit</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuditReport;