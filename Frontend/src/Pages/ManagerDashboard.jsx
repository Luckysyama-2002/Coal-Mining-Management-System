import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiPlus, FiFileText, FiUser, FiCheckCircle,
  FiTrendingUp, FiLogOut, FiShield, FiBarChart2 
} from 'react-icons/fi';

// Component Imports
import Employee from '../components/Dashboard/ManagerDashboard/Employee';
import PaySlip from '../components/Dashboard/ManagerDashboard/PaySlip';
import LeaveApproval from '../components/Dashboard/ManagerDashboard/LeaveApproval';
import SafetyReport from '../components/Dashboard/ManagerDashboard/SafetyReport';
import AuditReport from '../components/Dashboard/ManagerDashboard/AuditReport';
import Profile from '../components/Dashboard/ManagerDashboard/Profile';

// Styling
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const navigate = useNavigate();

  // --- 1. STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('employees');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Mock Employee Data (In a real app, this would come from an API/Firebase)
  const [employees, setEmployees] = useState([
    { id: "CM-4092", name: "Rajesh Kumar", role: "Excavator", shift: "A", status: "Active" },
    { id: "CM-4095", name: "Amit Singh", role: "Safety Officer", shift: "B", status: "On Leave" },
    { id: "CM-4102", name: "Suresh Raina", role: "Driller", shift: "A", status: "Active" },
    { id: "CM-4110", name: "Vikash Yadav", role: "Blaster", shift: "C", status: "Active" },
  ]);

  const manager = {
    name: "Vikram Rathore",
    id: "MGR-102",
    zone: "Eastern Coalfields",
    experience: "12 Years"
  };

  // --- 2. HANDLERS ---
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleAddEmployee = (newEmp) => {
    setEmployees(prev => [...prev, newEmp]);
  };

  const triggerPaySlip = (emp) => {
    setSelectedEmployee(emp);
    setActiveTab('payslip');
  };

  // --- 3. SIDEBAR CONFIGURATION ---
  const menuItems = [
    { id: 'employees', label: 'Workforce', icon: <FiUsers /> },
    { id: 'auditreport', label: 'Audit Log', icon: <FiTrendingUp /> },
    { id: 'leaveapprovals', label: 'Approvals', icon: <FiCheckCircle /> },
    { id: 'safetyreport', label: 'Safety Hub', icon: <FiShield /> },
    { id: 'profile', label: 'My Profile', icon: <FiUser /> },
  ];

  return (
    <div className="mgr-container"> 
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="mgr-sidebar">
        <div className="mgr-logo">
          <FiBarChart2 className="logo-icon" />
          <span>MINE-SYNC PRO</span>
        </div>
        
        <nav className="mgr-nav">
          {menuItems.map(item => (
            <div 
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`} 
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon} <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="mgr-main">
        
        {/* TOP HEADER BAR */}
        <header className="mgr-header">
          <div className="mgr-profile-summary" onClick={() => setActiveTab('profile')}>
            <div className="mgr-avatar"><FiUser /></div>
            <div className="mgr-info">
              <h2>{manager.name}</h2>
              <p>{manager.id} • {manager.zone}</p>
            </div>
          </div>
        <button className="mgr-logout" onClick={handleLogout}>
          <FiLogOut /> <span>Logout</span>
        </button>
      </header>

        {/* DYNAMIC CONTENT AREA */}
        <section className="dynamic-content">
          {activeTab === 'employees' && (
            <Employee 
              employees={employees} 
              onPaySlipClick={triggerPaySlip} 
              onEmployeeAdded={handleAddEmployee}
            />
          )}
          
          {activeTab === 'payslip' && (
            <PaySlip 
              employee={selectedEmployee} 
              onClose={() => setActiveTab('employees')} 
            />
          )}

          {activeTab === 'leaveapprovals' && <LeaveApproval />}
          
          {activeTab === 'safetyreport' && <SafetyReport />}
          
          {activeTab === 'auditreport' && <AuditReport />}
          
          {activeTab === 'profile' && <Profile manager={manager} />}
        </section>

      </main>
    </div>
  );
};

export default ManagerDashboard;