import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Home from './Pages/Home';
import Login from './Pages/Login';
import Dashboard from './Pages/EmployeeDashboard';
import ManagerDashboard from './Pages/ManagerDashboard';
import SafetyOfficerDashboard from './Pages/SafetyOfficerDashboard';
import ProtectedRoute from './ProtectedRoute';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/safety-officer"
          element={
            <ProtectedRoute allowedRoles={['safety_officer', 'admin']}>
              <SafetyOfficerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};



export default App;
