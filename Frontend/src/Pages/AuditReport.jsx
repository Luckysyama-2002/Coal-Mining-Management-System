import React, { useEffect } from 'react';
import { 
  FiFileText, FiTrendingUp, FiAlertCircle, FiX,
  FiShield, FiDownload, FiBarChart2 
} from 'react-icons/fi';
import './AuditReport.css';

const AuditReport = ({ onClose }) => {
  // Mock data for production audit
  const auditLogs = [
    { id: "AUD-001", date: "2026-03-20", sector: "North Face", target: "150T", actual: "142T", status: "Verified" },
    { id: "AUD-002", date: "2026-03-19", sector: "East Shaft", target: "200T", actual: "210T", status: "Verified" },
    { id: "AUD-003", date: "2026-03-18", sector: "Sector 7", target: "120T", actual: "80T", status: "Flagged" },
  ];

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
        <button className="export-btn">
          <FiDownload /> Export Audit (CSV)
        </button>
      </header>

      {/* AUDIT SUMMARY CARDS */}
      <div className="audit-summary-grid">
        <div className="summary-card">
          <div className="card-icon blue"><FiShield /></div>
          <div className="card-info">
            <span>Compliance Score</span>
            <h3>94.2%</h3>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon green"><FiBarChart2 /></div>
          <div className="card-info">
            <span>Monthly Output</span>
            <h3>4,280 Tons</h3>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon red"><FiAlertCircle /></div>
          <div className="card-info">
            <span>Safety Deviations</span>
            <h3>02 Flags</h3>
          </div>
        </div>
      </div>

      {/* DETAILED PRODUCTION LOG */}
      <section className="audit-log-section">
        <div className="log-header">
          <h3><FiTrendingUp /> Production vs. Target Log</h3>
          <span className="timestamp">Last Updated: Just Now</span>
        </div>
        
        <table className="audit-table">
          <thead>
            <tr>
              <th>Audit ID</th>
              <th>Date</th>
              <th>Sector</th>
              <th>Target</th>
              <th>Actual</th>
              <th>Variance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => {
              const variance = parseInt(log.actual) - parseInt(log.target);
              return (
                <tr key={log.id}>
                  <td className="id-cell">{log.id}</td>
                  <td>{log.date}</td>
                  <td>{log.sector}</td>
                  <td>{log.target}</td>
                  <td>{log.actual}</td>
                  <td className={variance >= 0 ? 'text-green' : 'text-red'}>
                    {variance > 0 ? `+${variance}T` : `${variance}T`}
                  </td>
                  <td>
                    <span className={`audit-pill ${log.status.toLowerCase()}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              );
            })}
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