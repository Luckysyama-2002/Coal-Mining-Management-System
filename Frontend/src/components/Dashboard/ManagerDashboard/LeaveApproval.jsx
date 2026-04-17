import React, { useState, useEffect } from 'react';
import { 
  FiCheckCircle, FiXCircle, FiClock, FiX,
  FiCalendar, FiUser, FiMessageSquare 
} from 'react-icons/fi';
import api from '../../../api';
import './LeaveApproval.css';

const LeaveApproval = ({ onClose }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await api.get('/employee/leaves');
        setRequests(response.data.leaves);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch leaves:', error);
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  const handleAction = async (id, newStatus) => {
    try {
      await api.put(`/employee/leaves/${id}`, { status: newStatus });
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: newStatus } : req
      ));
    } catch (error) {
      console.error('Failed to update leave:', error);
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
      <div className="leave-wrapper">
        <header className="leave-header">
          <div className="header-text">
            <h2><FiCalendar /> Leave Management</h2>
            <p>Review and process worker time-off requests.</p>
          </div>
          <div className="leave-stats">
            <div className="mini-stat">
              <span className="label">On Leave Today</span>
              <span className="count color-orange">
                {requests.filter(r => {
                  const today = new Date().toISOString().split('T')[0];
                  return r.status === 'approved' && r.start_date <= today && r.end_date >= today;
                }).length}
              </span>
            </div>
            <div className="mini-stat">
              <span className="label">Pending Requests</span>
              <span className="count color-blue">{requests.filter(r => r.status === 'pending').length}</span>
            </div>
          </div>
        </header>

        <section className="requests-section">
          <h3>Pending Approvals</h3>
          <div className="requests-list">
            {requests.filter(r => r.status === 'pending').map(req => {
              const startDate = new Date(req.start_date).toLocaleDateString();
              const endDate = new Date(req.end_date).toLocaleDateString();
              const days = Math.ceil((new Date(req.end_date) - new Date(req.start_date)) / (1000 * 60 * 60 * 24)) + 1;
              
              return (
                <div key={req.id} className="request-card">
                  <div className="req-user-info">
                    <div className="user-avatar"><FiUser /></div>
                    <div>
                      <h4>{req.emp_name}</h4>
                      <span>{req.emp_id}</span>
                    </div>
                  </div>

                  <div className="req-details">
                    <div className="detail-box">
                      <FiCalendar className="detail-icon" />
                      <div>
                        <p className="d-label">Dates</p>
                        <p className="d-val">{startDate} - {endDate} ({days} days)</p>
                      </div>
                    </div>
                    <div className="detail-box">
                      <FiClock className="detail-icon" />
                      <div>
                        <p className="d-label">Leave Type</p>
                        <p className="d-val">{req.leave_type}</p>
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
                      onClick={() => handleAction(req.id, 'rejected')}
                    >
                      <FiXCircle /> Reject
                    </button>
                    <button 
                      className="btn-approve" 
                      onClick={() => handleAction(req.id, 'approved')}
                    >
                      <FiCheckCircle /> Approve
                    </button>
                  </div>
                </div>
              );
            })}
            
            {requests.filter(r => r.status === 'pending').length === 0 && (
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
              {requests.filter(r => r.status !== 'pending').map(req => {
                const startDate = new Date(req.start_date).toLocaleDateString();
                const endDate = new Date(req.end_date).toLocaleDateString();
                
                return (
                  <tr key={req.id}>
                    <td>{req.emp_name}</td>
                    <td>{startDate} - {endDate}</td>
                    <td>
                      <span className={`status-tag ${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
};

export default LeaveApproval;
