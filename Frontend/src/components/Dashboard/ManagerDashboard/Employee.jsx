import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiFilter, FiFileText, FiPlus, 
  FiUsers, FiShield, FiAlertCircle 
} from 'react-icons/fi';
import api from '../../../api';
import AddEmployeeModal from './AddEmployeeModal';
import './Employee.css';

const Employee = ({ employees, onPaySlipClick, onEmployeeAdded }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterShift, setFilterShift] = useState("All");
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    openIncidents: 0
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/employee/summary');
        setSummary(response.data.summary);
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      }
    };
    fetchSummary();
  }, []);

  const handleAddEmployee = (newEmployee) => {
    if (onEmployeeAdded) {
      onEmployeeAdded(newEmployee);
    }
    setShowAddModal(false);
  };

  // Optimized Filter Logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesShift = filterShift === "All" || emp.shift === filterShift;
    return matchesSearch && matchesShift;
  });

  return (
    <section className="employee-view">
      {/* Page Specific Stats */}
      <div className="stats-row">
        <div className="stat-card blue">
          <div className="s-icon-bg"><FiUsers /></div>
          <div className="s-info">
            <span className="s-value">{summary.totalEmployees}</span>
            <span className="s-label">Total Staff</span>
          </div>
        </div>
        <div className="stat-card green">
          <div className="s-icon-bg"><FiShield /></div>
          <div className="s-info">
            <span className="s-value">{summary.activeEmployees}</span>
            <span className="s-label">Currently Active</span>
          </div>
        </div>
        <div className="stat-card gold">
          <div className="s-icon-bg"><FiAlertCircle /></div>
          <div className="s-info">
            <span className="s-value">{summary.pendingLeaves}</span>
            <span className="s-label">Pending Approvals</span>
          </div>
        </div>
        <div className="stat-card red">
          <div className="s-icon-bg"><FiAlertCircle /></div>
          <div className="s-info">
            <span className="s-value">{summary.openIncidents}</span>
            <span className="s-label">Open Incidents</span>
          </div>
        </div>
      </div>

      <div className="view-header">
        <div className="header-title">
          <h3>Workforce Directory</h3>
          <p>Real-time personnel tracking and documentation.</p>
        </div>
        
        <div className="view-actions">
          <button className="add-emp-btn-inline" onClick={() => setShowAddModal(true)}>
            <FiPlus /> Add Employee
          </button>
          
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search ID or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-wrapper">
            <FiFilter className="filter-icon" />
            <select value={filterShift} onChange={(e) => setFilterShift(e.target.value)}>
              <option value="All">All Shifts</option>
              <option value="A">Shift A</option>
              <option value="B">Shift B</option>
              <option value="C">Shift C</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="mgr-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Designation</th>
              <th>Shift</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td className="emp-id-cell">{emp.id}</td>
                  <td>
                    <div className="name-cell">
                      <div className="name-initials">
                        {emp.name ? emp.name.charAt(0) : '?'}
                      </div>
                      {emp.name}
                    </div>
                  </td>
                  <td>{emp.role}</td>
                  <td><span className="shift-tag">Shift {emp.shift}</span></td>
                  <td>
                    <span className={`status-pill ${(emp.status || 'Active').toLowerCase().replace(/\s+/g, '')}`}>
                      {emp.status || 'Active'}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button 
                      className="table-btn" 
                      onClick={() => onPaySlipClick(emp)}
                      title="Generate Pay Slip"
                    >
                      <FiFileText /> Pay Slip
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No records found for "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddEmployeeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onEmployeeAdded={handleAddEmployee}
        />
      )}
    </section>
  );
};

export default Employee;