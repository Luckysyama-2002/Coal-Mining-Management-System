import React, { useState } from 'react';
import { 
  FiCheckCircle, FiXCircle, FiClock, FiX,
  FiCalendar, FiUser, FiMessageSquare 
} from 'react-icons/fi';
import './LeaveApproval.css';

const LeaveApproval = ({ onClose }) => {
  const [requests, setRequests] = useState([
    { 
      id: "LR-101", 
      name: "Suresh Raina", 
      role: "Driller", 
      type: "Sick Leave", 
      dates: "Mar 22 - Mar 24", 
      days: 3, 
      reason: "Severe fever and flu symptoms.",
      status: "Pending" 
    },
    { 
      id: "LR-102", 
      name: "Amit Singh", 
      role: "Safety Officer", 
      type: "Annual Leave", 
      dates: "Apr 05 - Apr 10", 
      days: 6, 
      reason: "Visiting hometown for sister's wedding.",
      status: "Pending" 
    }
  ]);

  const handleAction = (id, newStatus) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    ));
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
      <div className="leave-wrapper">
        <header className="leave-header">
          <div className="header-text">
            <h2><FiCalendar /> Leave Management</h2>
            <p>Review and process worker time-off requests.</p>
          </div>
          <div className="leave-stats">
            <div className="mini-stat">
              <span className="label">On Leave Today</span>
              <span className="count color-orange">12</span>
            </div>
            <div className="mini-stat">
              <span className="label">Pending Requests</span>
              <span className="count color-blue">{requests.filter(r => r.status === 'Pending').length}</span>
            </div>
          </div>
        </header>

        <section className="requests-section">
          <h3>Pending Approvals</h3>
          <div className="requests-list">
            {requests.filter(r => r.status === 'Pending').map(req => (
              <div key={req.id} className="request-card">
                <div className="req-user-info">
                  <div className="user-avatar"><FiUser /></div>
                  <div>
                    <h4>{req.name}</h4>
                    <span>{req.role} • {req.id}</span>
                  </div>
                </div>

                <div className="req-details">
                  <div className="detail-box">
                    <FiCalendar className="detail-icon" />
                    <div>
                      <p className="d-label">Dates</p>
                      <p className="d-val">{req.dates} ({req.days} days)</p>
                    </div>
                  </div>
                  <div className="detail-box">
                    <FiClock className="detail-icon" />
                    <div>
                      <p className="d-label">Leave Type</p>
                      <p className="d-val">{req.type}</p>
                    </div>
                  </div>
                </div>

                <div className="req-reason">
                  <FiMessageSquare className="detail-icon" />
                  <p>"{req.reason}"</p>
                </div>

                <div className="req-actions">
                  <button 
                    className="btn-reject" 
                    onClick={() => handleAction(req.id, 'Rejected')}
                  >
                    <FiXCircle /> Reject
                  </button>
                  <button 
                    className="btn-approve" 
                    onClick={() => handleAction(req.id, 'Approved')}
                  >
                    <FiCheckCircle /> Approve
                  </button>
                </div>
              </div>
            ))}
            
            {requests.filter(r => r.status === 'Pending').length === 0 && (
              <div className="empty-state">No pending leave requests.</div>
            )}
          </div>
        </section>

        <section className="processed-section">
          <h3>Recently Processed</h3>
          <table className="processed-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Dates</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.filter(r => r.status !== 'Pending').map(req => (
                <tr key={req.id}>
                  <td>{req.name}</td>
                  <td>{req.dates}</td>
                  <td>
                    <span className={`status-tag ${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
};

export default LeaveApproval;
