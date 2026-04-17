const express = require('express');
const { verifyToken, checkRole } = require('../Middleware/auth');
const { pool, findById, createUser, getProfile, getHealthCheckups, getShifts, getPayslips, getSafetyStatus, updateSafetyStatus, logAuditAction } = require('../Models/User');

const router = express.Router();

// ============================================
// CREATE EMPLOYEE (MANAGER/ADMIN ONLY)
// ============================================
router.post('/employees', verifyToken, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const employeeData = req.body;

    // Required field validation
    const requiredFields = ['emp_name', 'password', 'role', 'email', 'mobile', 'aadhaar', 'pan'];
    const missingFields = requiredFields.filter(field => !employeeData[field] || !employeeData[field].toString().trim());

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Data validation
    const errors = [];

    // Name validation
    if (employeeData.emp_name.length < 2 || employeeData.emp_name.length > 100) {
      errors.push('Name must be between 2 and 100 characters');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employeeData.email)) {
      errors.push('Invalid email format');
    }

    // Mobile validation (Indian mobile numbers)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(employeeData.mobile)) {
      errors.push('Invalid mobile number format');
    }

    // Aadhaar validation
    if (!/^\d{12}$/.test(employeeData.aadhaar)) {
      errors.push('Aadhaar must be exactly 12 digits');
    }

    // PAN validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(employeeData.pan.toUpperCase())) {
      errors.push('Invalid PAN format');
    }

    // Role validation
    const validRoles = ['employee', 'manager', 'admin', 'safety_officer', 'surveyor', 'driller', 'blaster', 'excavator_operator'];
    if (!validRoles.includes(employeeData.role)) {
      errors.push('Invalid role specified');
    }

    // Password validation
    if (employeeData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    // Bank account validation (if provided)
    if (employeeData.bankAccount && !/^\d{9,18}$/.test(employeeData.bankAccount)) {
      errors.push('Bank account number must be 9-18 digits');
    }

    // IFSC validation (if provided)
    if (employeeData.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(employeeData.ifsc.toUpperCase())) {
      errors.push('Invalid IFSC code format');
    }

    // Pincode validation (if provided)
    if (employeeData.pincode && !/^\d{6}$/.test(employeeData.pincode)) {
      errors.push('Pincode must be exactly 6 digits');
    }

    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors
      });
    }

    // Sanitize input data
    const sanitizedData = {
      ...employeeData,
      emp_name: employeeData.emp_name.trim(),
      email: employeeData.email.toLowerCase().trim(),
      mobile: employeeData.mobile.trim(),
      aadhaar: employeeData.aadhaar.trim(),
      pan: employeeData.pan.toUpperCase().trim(),
      city: employeeData.city?.trim(),
      state: employeeData.state?.trim(),
      country: employeeData.country?.trim() || 'India',
      bankAccount: employeeData.bankAccount?.trim(),
      ifsc: employeeData.ifsc?.toUpperCase().trim(),
      emergencyName: employeeData.emergencyName?.trim(),
      emergencyPhone: employeeData.emergencyPhone?.trim(),
      emergencyRelation: employeeData.emergencyRelation?.trim()
    };

    const newEmployee = await createUser(sanitizedData);
    
    // Log the employee creation
    await logAuditAction(req.user.emp_id, 'EMPLOYEE_CREATE', `Created new employee ${newEmployee.emp_id}`, req.ip);
    
    res.status(201).json({
      message: 'Employee created successfully.',
      employee: newEmployee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        message: 'Employee already exists with provided unique field (email, mobile, aadhaar, or PAN).'
      });
    }
    res.status(500).json({ message: 'Server error while creating employee.' });
  }
});

// ============================================
// GET EMPLOYEE PROFILE
// ============================================
router.get('/profile/:emp_id', verifyToken, async (req, res) => {
  try {
    const { emp_id } = req.params;

    if (req.user.emp_id !== emp_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const employee = await getProfile(emp_id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    res.status(200).json({ employee });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching employee profile.' });
  }
});

// ============================================
// UPDATE EMPLOYEE PROFILE (OWN PROFILE ONLY)
// ============================================
router.put('/profile/:emp_id', verifyToken, async (req, res) => {
  try {
    const { emp_id } = req.params;

    // Users can only update their own profile
    if (req.user.emp_id !== emp_id) {
      return res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
    }

    const updateData = req.body;

    // Allowed fields for self-update
    const allowedFields = [
      'email', 'mobile', 'city', 'state', 'pincode', 'country',
      'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update.' });
    }

    // Build dynamic update query
    const setClause = Object.keys(filteredData).map(field => `${field} = ?`).join(', ');
    const values = Object.values(filteredData);
    values.push(emp_id); // Add emp_id for WHERE clause

    const updateQuery = `UPDATE employee SET ${setClause} WHERE emp_id = ?`;

    const [result] = await pool.execute(updateQuery, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // Log the profile update
    await logAuditAction(emp_id, 'PROFILE_UPDATE', `Profile updated: ${Object.keys(filteredData).join(', ')}`, req.ip);

    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Update failed: duplicate entry.' });
    }
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
});

// ============================================
// GET ALL EMPLOYEES (MANAGER/ADMIN ONLY)
// ============================================
router.get('/employees', verifyToken, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const [employees] = await pool.execute(
      'SELECT emp_id, emp_name, email, mobile, role, shift, status FROM employee'
    );
    res.status(200).json({ employees });
  } catch (error) {
    console.error('Employees fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching employees.' });
  }
});

// ============================================
// UPDATE EMPLOYEE INFO (MANAGER/ADMIN ONLY)
// ============================================
router.put('/employees/:emp_id', verifyToken, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const { emp_id } = req.params;
    const updateData = req.body;

    const allowedFields = ['email', 'mobile', 'city', 'state', 'pincode', 'shift', 'status'];
    const filteredData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update.' });
    }

    const setClause = Object.keys(filteredData).map(key => `\`${key}\` = ?`).join(', ');
    const values = [...Object.values(filteredData), emp_id];

    await pool.execute(
      `UPDATE employee SET ${setClause} WHERE emp_id = ?`,
      values
    );

    res.status(200).json({ message: 'Employee updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating employee.' });
  }
});

// ============================================
// DELETE EMPLOYEE (ADMIN ONLY)
// ============================================
router.delete('/employees/:emp_id', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { emp_id } = req.params;

    // Check if employee exists
    const [employee] = await pool.execute('SELECT emp_id FROM employee WHERE emp_id = ?', [emp_id]);
    if (employee.length === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // Delete employee (cascade will handle related records)
    await pool.execute('DELETE FROM employee WHERE emp_id = ?', [emp_id]);

    res.status(200).json({ message: 'Employee deleted successfully.' });
  } catch (error) {
    console.error('Employee deletion error:', error);
    res.status(500).json({ message: 'Server error while deleting employee.' });
  }
});

// ============================================
// LEAVE APPROVALS (MANAGER/ADMIN ONLY)
// ============================================
router.get('/leaves', verifyToken, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const [leaves] = await pool.execute(`
      SELECT lr.*, e.emp_name 
      FROM leave_requests lr 
      JOIN employee e ON lr.emp_id = e.emp_id 
      ORDER BY lr.applied_date DESC
    `);
    res.status(200).json({ leaves });
  } catch (error) {
    console.error('Leaves fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching leave requests.' });
  }
});

router.put('/leaves/:id', verifyToken, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    await pool.execute(
      'UPDATE leave_requests SET status = ?, approved_by = ?, approved_date = NOW() WHERE id = ?',
      [status, req.user.emp_id, id]
    );

    res.status(200).json({ message: `Leave request ${status}.` });
  } catch (error) {
    console.error('Leave update error:', error);
    res.status(500).json({ message: 'Server error while updating leave request.' });
  }
});

// ============================================
// SAFETY REPORTS (MANAGER/ADMIN/SAFETY_OFFICER)
// ============================================
router.get('/safety', verifyToken, checkRole('manager', 'admin', 'safety_officer'), async (req, res) => {
  try {
    const [incidents] = await pool.execute(`
      SELECT si.*, e.emp_name 
      FROM safety_incidents si 
      JOIN employee e ON si.emp_id = e.emp_id 
      ORDER BY si.reported_date DESC
    `);
    res.status(200).json({ incidents });
  } catch (error) {
    console.error('Safety fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching safety incidents.' });
  }
});

router.put('/safety/:id', verifyToken, checkRole('manager', 'admin', 'safety_officer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    await pool.execute(
      'UPDATE safety_incidents SET status = ?, resolution = ?, resolved_date = NOW() WHERE id = ?',
      [status, resolution, id]
    );

    // Log the incident resolution
    await logAuditAction(req.user.emp_id, 'INCIDENT_RESOLVE', `Resolved safety incident ID ${id}`, req.ip);

    res.status(200).json({ message: 'Safety incident updated.' });
  } catch (error) {
    console.error('Safety update error:', error);
    res.status(500).json({ message: 'Server error while updating safety incident.' });
  }
});

// SENSOR READINGS (MANAGER/ADMIN/SAFETY_OFFICER)
// ============================================
router.get('/sensor-readings', verifyToken, checkRole('manager', 'admin', 'safety_officer'), async (req, res) => {
  try {
    const [readings] = await pool.execute(`
      SELECT location, sensor_type, reading_value, unit, status, recorded_at,
        threshold_min, threshold_max
      FROM sensor_readings
      ORDER BY location, sensor_type, recorded_at DESC
    `);
    
    // Group by location
    const groupedReadings = readings.reduce((acc, reading) => {
      if (!acc[reading.location]) {
        acc[reading.location] = {};
      }
      if (!acc[reading.location][reading.sensor_type]) {
        acc[reading.location][reading.sensor_type] = [];
      }
      acc[reading.location][reading.sensor_type].push(reading);
      return acc;
    }, {});

    res.status(200).json({ readings: groupedReadings });
  } catch (error) {
    console.error('Sensor readings fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching sensor readings.' });
  }
});

// RISK ZONES (MANAGER/ADMIN/SAFETY_OFFICER)
// ============================================
router.get('/risk-zones', verifyToken, checkRole('manager', 'admin', 'safety_officer'), async (req, res) => {
  try {
    const [zones] = await pool.execute(`
      SELECT rz.*, e.emp_name as emergency_contact_name
      FROM risk_zones rz
      LEFT JOIN employee e ON rz.emergency_contact = e.emp_id
      ORDER BY rz.risk_level DESC, rz.zone_name
    `);
    res.status(200).json({ zones });
  } catch (error) {
    console.error('Risk zones fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching risk zones.' });
  }
});

// Update risk zone
router.put('/risk-zones/:id', verifyToken, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { risk_level, ventilation_status, gas_monitoring_status, current_occupancy } = req.body;

    await pool.execute(
      `UPDATE risk_zones 
       SET risk_level = ?, ventilation_status = ?, gas_monitoring_status = ?, current_occupancy = ?
       WHERE id = ?`,
      [risk_level, ventilation_status, gas_monitoring_status, current_occupancy, id]
    );

    res.status(200).json({ message: 'Risk zone updated successfully.' });
  } catch (error) {
    console.error('Risk zone update error:', error);
    res.status(500).json({ message: 'Server error while updating risk zone.' });
  }
});

// PPE COMPLIANCE (MANAGER/ADMIN/SAFETY_OFFICER)
// ============================================
router.get('/ppe-compliance', verifyToken, checkRole('manager', 'admin', 'safety_officer'), async (req, res) => {
  try {
    const [compliance] = await pool.execute(`
      SELECT pc.*, e.emp_name, inspector.emp_name as inspector_name
      FROM ppe_compliance pc
      JOIN employee e ON pc.emp_id = e.emp_id
      LEFT JOIN employee inspector ON pc.inspector_id = inspector.emp_id
      ORDER BY pc.overall_compliance ASC, e.emp_name
    `);
    res.status(200).json({ compliance });
  } catch (error) {
    console.error('PPE compliance fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching PPE compliance data.' });
  }
});

// SENSOR ALERTS (MANAGER/ADMIN/SAFETY_OFFICER)
// ============================================
router.get('/sensor-alerts', verifyToken, checkRole('manager', 'admin', 'safety_officer'), async (req, res) => {
  try {
    const [alerts] = await pool.execute(`
      SELECT sa.*, e.emp_name as acknowledged_by_name
      FROM sensor_alerts sa
      LEFT JOIN employee e ON sa.acknowledged_by = e.emp_id
      ORDER BY sa.severity DESC, sa.triggered_at DESC
    `);
    res.status(200).json({ alerts });
  } catch (error) {
    console.error('Sensor alerts fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching sensor alerts.' });
  }
});

// Acknowledge sensor alert
router.put('/sensor-alerts/:id/acknowledge', verifyToken, checkRole('manager', 'admin', 'safety_officer'), async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      `UPDATE sensor_alerts 
       SET status = ?, acknowledged_by = ?, acknowledged_at = NOW()
       WHERE id = ?`,
      ['acknowledged', req.user.emp_id, id]
    );

    await logAuditAction(req.user.emp_id, 'ALERT_ACKNOWLEDGED', `Acknowledged sensor alert ID ${id}`, req.ip);

    res.status(200).json({ message: 'Alert acknowledged.' });
  } catch (error) {
    console.error('Alert acknowledge error:', error);
    res.status(500).json({ message: 'Server error while acknowledging alert.' });
  }
});

// Resolve sensor alert
router.put('/sensor-alerts/:id/resolve', verifyToken, checkRole('manager', 'admin', 'safety_officer'), async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      `UPDATE sensor_alerts 
       SET status = ?, resolved_at = NOW()
       WHERE id = ?`,
      ['resolved', id]
    );

    await logAuditAction(req.user.emp_id, 'ALERT_RESOLVED', `Resolved sensor alert ID ${id}`, req.ip);

    res.status(200).json({ message: 'Alert resolved.' });
  } catch (error) {
    console.error('Alert resolve error:', error);
    res.status(500).json({ message: 'Server error while resolving alert.' });
  }
});

// SAFETY ANALYTICS & METRICS (MANAGER/ADMIN/SAFETY_OFFICER)
// ============================================
router.get('/safety-metrics', verifyToken, checkRole('manager', 'admin', 'safety_officer'), async (req, res) => {
  try {
    const [metrics] = await pool.execute(`
      SELECT * FROM safety_metrics
      ORDER BY metric_date DESC
      LIMIT 30
    `);
    
    // Calculate additional metrics
    const todayMetric = metrics[0] || {};
    const trends = {
      incident_trend: metrics.length > 1 ? metrics[0].total_incidents - metrics[1].total_incidents : 0,
      alert_trend: metrics.length > 1 ? metrics[0].alert_count - metrics[1].alert_count : 0,
      ppe_compliance_trend: metrics.length > 1 ? metrics[0].ppe_compliance_rate - metrics[1].ppe_compliance_rate : 0
    };

    res.status(200).json({ 
      metrics,
      today: todayMetric,
      trends
    });
  } catch (error) {
    console.error('Safety metrics fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching safety metrics.' });
  }
});

// Safety dashboard summary
router.get('/safety-dashboard', verifyToken, checkRole('manager', 'admin', 'safety_officer'), async (req, res) => {
  try {
    // Get latest metrics
    const [metrics] = await pool.execute(`
      SELECT * FROM safety_metrics
      ORDER BY metric_date DESC
      LIMIT 1
    `);

    // Get active incidents
    const [incidents] = await pool.execute(`
      SELECT COUNT(*) as active_count FROM safety_incidents 
      WHERE status != 'resolved'
    `);

    // Get active alerts
    const [alerts] = await pool.execute(`
      SELECT 
        COUNT(*) as total_alerts,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_alerts,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_alerts
      FROM sensor_alerts
    `);

    // Get high-risk zones
    const [zones] = await pool.execute(`
      SELECT * FROM risk_zones
      WHERE risk_level IN ('high', 'critical')
    `);

    // Get PPE non-compliance
    const [ppeIssues] = await pool.execute(`
      SELECT COUNT(*) as non_compliant_count FROM ppe_compliance
      WHERE overall_compliance != 'full'
    `);

    const summary = {
      todayMetrics: metrics[0] || {},
      activeIncidents: incidents[0]?.active_count || 0,
      sensorAlerts: alerts[0] || {},
      highRiskZones: zones.length,
      ppeNonCompliance: ppeIssues[0]?.non_compliant_count || 0
    };

    res.status(200).json({ summary });
  } catch (error) {
    console.error('Safety dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching safety dashboard.' });
  }
});

// ============================================
// AUDIT REPORTS (MANAGER/ADMIN ONLY)
// ============================================
router.get('/audit', verifyToken, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const [logs] = await pool.execute(`
      SELECT al.*, e.emp_name 
      FROM audit_logs al 
      JOIN employee e ON al.emp_id = e.emp_id 
      ORDER BY al.timestamp DESC 
      LIMIT 100
    `);
    res.status(200).json({ logs });
  } catch (error) {
    console.error('Audit fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching audit logs.' });
  }
});

// PRODUCTION AUDITS (MANAGER/ADMIN ONLY)
// ============================================
router.get('/production-audits', verifyToken, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const [audits] = await pool.execute(`
      SELECT pa.*, 
             reporter.emp_name as reported_by_name,
             verifier.emp_name as verified_by_name
      FROM production_audits pa
      JOIN employee reporter ON pa.reported_by = reporter.emp_id
      LEFT JOIN employee verifier ON pa.verified_by = verifier.emp_id
      ORDER BY pa.date DESC, pa.created_at DESC
    `);
    res.status(200).json({ audits });
  } catch (error) {
    console.error('Production audit fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching production audits.' });
  }
});

// COMPLIANCE AUDITS (MANAGER/ADMIN ONLY)
// ============================================
router.get('/compliance-audits', verifyToken, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const [audits] = await pool.execute(`
      SELECT ca.*, 
             auditor.emp_name as audited_by_name,
             assigned.emp_name as assigned_to_name
      FROM compliance_audits ca
      JOIN employee auditor ON ca.audited_by = auditor.emp_id
      LEFT JOIN employee assigned ON ca.assigned_to = assigned.emp_id
      ORDER BY ca.check_date DESC, ca.created_at DESC
    `);
    res.status(200).json({ audits });
  } catch (error) {
    console.error('Compliance audit fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching compliance audits.' });
  }
});

// AUDIT SUMMARY (MANAGER/ADMIN ONLY)
// ============================================
router.get('/audit-summary', verifyToken, checkRole('manager', 'admin'), async (req, res) => {
  try {
    // Get current month production total
    const [productionResult] = await pool.execute(`
      SELECT 
        SUM(actual_tons) as total_production,
        AVG((actual_tons / target_tons) * 100) as avg_efficiency
      FROM production_audits 
      WHERE MONTH(date) = MONTH(CURRENT_DATE()) 
      AND YEAR(date) = YEAR(CURRENT_DATE())
    `);

    // Get compliance score (percentage of passed audits)
    const [complianceResult] = await pool.execute(`
      SELECT 
        COUNT(*) as total_audits,
        SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed_audits
      FROM compliance_audits 
      WHERE MONTH(check_date) = MONTH(CURRENT_DATE()) 
      AND YEAR(check_date) = YEAR(CURRENT_DATE())
    `);

    // Get safety deviations (failed compliance + safety incidents)
    const [safetyResult] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM compliance_audits 
         WHERE status = 'failed' 
         AND MONTH(check_date) = MONTH(CURRENT_DATE()) 
         AND YEAR(check_date) = YEAR(CURRENT_DATE())) +
        (SELECT COUNT(*) FROM safety_incidents 
         WHERE status != 'resolved' 
         AND MONTH(reported_date) = MONTH(CURRENT_DATE()) 
         AND YEAR(reported_date) = YEAR(CURRENT_DATE())) as safety_deviations
    `);

    const summary = {
      monthlyOutput: productionResult[0]?.total_production || 0,
      complianceScore: complianceResult[0]?.total_audits > 0 
        ? ((complianceResult[0]?.passed_audits / complianceResult[0]?.total_audits) * 100).toFixed(1)
        : 100,
      safetyDeviations: safetyResult[0]?.safety_deviations || 0,
      productionEfficiency: productionResult[0]?.avg_efficiency?.toFixed(1) || 0
    };

    res.status(200).json({ summary });
  } catch (error) {
    console.error('Audit summary fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching audit summary.' });
  }
});

// ============================================
// PAYSLIPS (MANAGER/ADMIN ONLY)
// ============================================
router.get('/payslips/:emp_id', verifyToken, checkRole('manager', 'admin'), async (req, res) => {
  try {
    const { emp_id } = req.params;
    const [payslips] = await pool.execute(
      'SELECT * FROM payslips WHERE emp_id = ? ORDER BY year DESC, month DESC',
      [emp_id]
    );
    res.status(200).json({ payslips });
  } catch (error) {
    console.error('Payslips fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching payslips.' });
  }
});

// ============================================
// SAFETY OFFICER ENDPOINTS
// ============================================

// LOG NEW SAFETY INCIDENT (SAFETY OFFICER ONLY)
router.post('/safety/incidents', verifyToken, checkRole('safety_officer', 'admin'), async (req, res) => {
  try {
    const { emp_id, incident_type, description, severity, location } = req.body;

    if (!emp_id || !incident_type || !description || !severity) {
      return res.status(400).json({ message: 'emp_id, incident_type, description, and severity are required.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO safety_incidents (emp_id, incident_type, description, severity, location, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [emp_id, incident_type, description, severity, location, req.user.emp_id]
    );

    res.status(201).json({ message: 'Incident logged successfully.', incidentId: result.insertId });
  } catch (error) {
    console.error('Log incident error:', error);
    res.status(500).json({ message: 'Server error while logging incident.' });
  }
});

// ASSIGN INCIDENT TO SAFETY OFFICER (SAFETY OFFICER ONLY)
router.put('/safety/assign/:id', verifyToken, checkRole('safety_officer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    await pool.execute(
      'UPDATE safety_incidents SET assigned_to = ?, status = ? WHERE id = ?',
      [assigned_to, 'investigating', id]
    );

    res.status(200).json({ message: 'Incident assigned successfully.' });
  } catch (error) {
    console.error('Assign incident error:', error);
    res.status(500).json({ message: 'Server error while assigning incident.' });
  }
});

// UPDATE INCIDENT STATUS AND RESOLUTION (SAFETY OFFICER ONLY)
router.put('/safety/status/:id', verifyToken, checkRole('safety_officer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    if (!['reported', 'investigating', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const updateData = { status };
    const updateFields = ['status = ?'];
    const values = [status];

    if (resolution) {
      updateFields.push('resolution = ?');
      values.push(resolution);
    }

    if (status === 'resolved') {
      updateFields.push('resolved_date = NOW()');
    }

    values.push(id);

    await pool.execute(
      `UPDATE safety_incidents SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    res.status(200).json({ message: 'Incident status updated successfully.' });
  } catch (error) {
    console.error('Update incident status error:', error);
    res.status(500).json({ message: 'Server error while updating incident status.' });
  }
});

// GET SAFETY ANALYTICS (SAFETY OFFICER ONLY)
router.get('/safety-analytics', verifyToken, checkRole('safety_officer', 'admin'), async (req, res) => {
  try {
    // Get incident statistics
    const [severityStats] = await pool.execute(`
      SELECT severity, COUNT(*) as count
      FROM safety_incidents
      GROUP BY severity
    `);

    const [statusStats] = await pool.execute(`
      SELECT status, COUNT(*) as count
      FROM safety_incidents
      GROUP BY status
    `);

    const [openIncidents] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM safety_incidents
      WHERE status != 'resolved'
    `);

    const [resolvedToday] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM safety_incidents
      WHERE status = 'resolved' AND DATE(resolved_date) = CURDATE()
    `);

    // Get personnel safety status
    const [personnelStats] = await pool.execute(`
      SELECT safety_status, COUNT(*) as count
      FROM employee
      GROUP BY safety_status
    `);

    const [activePersonnel] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM employee
      WHERE status = 'Active'
    `);

    // Calculate compliance rate (mock calculation - in real app, this would be more complex)
    const totalIncidents = severityStats.reduce((sum, stat) => sum + stat.count, 0);
    const complianceRate = totalIncidents > 0 ? Math.max(0, 100 - (totalIncidents * 2)) : 100;

    const analytics = {
      criticalIncidents: severityStats.find(s => s.severity === 'critical')?.count || 0,
      highIncidents: severityStats.find(s => s.severity === 'high')?.count || 0,
      mediumIncidents: severityStats.find(s => s.severity === 'medium')?.count || 0,
      lowIncidents: severityStats.find(s => s.severity === 'low')?.count || 0,
      openIncidents: openIncidents[0].count,
      resolvedToday: resolvedToday[0].count,
      greenStatus: personnelStats.find(s => s.safety_status === 'green')?.count || 0,
      yellowStatus: personnelStats.find(s => s.safety_status === 'yellow')?.count || 0,
      redStatus: personnelStats.find(s => s.safety_status === 'red')?.count || 0,
      activePersonnel: activePersonnel[0].count,
      complianceRate: Math.round(complianceRate),
      avgResponseTime: '2.5 hours' // Mock data
    };

    res.status(200).json({ analytics });
  } catch (error) {
    console.error('Safety analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching safety analytics.' });
  }
});

// GET COMPLIANCE REPORTS (SAFETY OFFICER ONLY)
router.get('/compliance-reports', verifyToken, checkRole('safety_officer', 'admin'), async (req, res) => {
  try {
    // Mock compliance data - in real app, this would query actual compliance records
    const reports = {
      monthlyAudit: {
        status: 'completed',
        score: 95,
        lastAudit: '2024-12-01',
        nextAudit: '2025-01-01'
      },
      equipmentInspection: {
        completed: 48,
        total: 50,
        overdue: 2,
        nextScheduled: '2024-12-15'
      },
      trainingRecords: {
        completed: 89,
        total: 95,
        pending: 6,
        complianceRate: 94
      }
    };

    res.status(200).json({ reports });
  } catch (error) {
    console.error('Compliance reports error:', error);
    res.status(500).json({ message: 'Server error while fetching compliance reports.' });
  }
});

// ============================================
// EMPLOYEE DASHBOARD ROUTES
// ============================================

// GET EMPLOYEE HEALTH CHECKUPS
router.get('/health/:emp_id', verifyToken, async (req, res) => {
  try {
    const { emp_id } = req.params;

    if (req.user.emp_id !== emp_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const checkups = await getHealthCheckups(emp_id);
    res.status(200).json({ checkups });
  } catch (error) {
    console.error('Health checkups fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching health checkups.' });
  }
});

// GET EMPLOYEE SHIFTS
router.get('/shifts/:emp_id', verifyToken, async (req, res) => {
  try {
    const { emp_id } = req.params;

    if (req.user.emp_id !== emp_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const shifts = await getShifts(emp_id);
    res.status(200).json({ shifts });
  } catch (error) {
    console.error('Shifts fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching shifts.' });
  }
});

// GET EMPLOYEE PAYSLIPS (FOR EMPLOYEE)
router.get('/mypayslips/:emp_id', verifyToken, async (req, res) => {
  try {
    const { emp_id } = req.params;

    if (req.user.emp_id !== emp_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const payslips = await getPayslips(emp_id);
    res.status(200).json({ payslips });
  } catch (error) {
    console.error('Payslips fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching payslips.' });
  }
});

// GET EMPLOYEE SAFETY STATUS
router.get('/safety-status/:emp_id', verifyToken, async (req, res) => {
  try {
    const { emp_id } = req.params;

    if (req.user.emp_id !== emp_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const safetyStatus = await getSafetyStatus(emp_id);
    res.status(200).json({ safetyStatus });
  } catch (error) {
    console.error('Safety status fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching safety status.' });
  }
});

// UPDATE EMPLOYEE SAFETY STATUS (ADMIN ONLY)
router.put('/safety-status/:emp_id', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { emp_id } = req.params;
    const { status } = req.body;

    if (!['green', 'yellow', 'red'].includes(status)) {
      return res.status(400).json({ message: 'Invalid safety status.' });
    }

    await updateSafetyStatus(emp_id, status);
    res.status(200).json({ message: 'Safety status updated.' });
  } catch (error) {
    console.error('Safety status update error:', error);
    res.status(500).json({ message: 'Server error while updating safety status.' });
  }
});

// GET DASHBOARD SUMMARY (MANAGER ONLY)
router.get('/summary', verifyToken, checkRole('manager'), async (req, res) => {
  try {
    const [totalEmployees] = await pool.execute('SELECT COUNT(*) as count FROM employee');
    const [activeEmployees] = await pool.execute('SELECT COUNT(*) as count FROM employee WHERE status = "active"');
    const [pendingLeaves] = await pool.execute('SELECT COUNT(*) as count FROM leave_requests WHERE status = "pending"');
    const [openIncidents] = await pool.execute('SELECT COUNT(*) as count FROM safety_incidents WHERE status IN ("open", "investigating")');

    const summary = {
      totalEmployees: totalEmployees[0].count,
      activeEmployees: activeEmployees[0].count,
      pendingLeaves: pendingLeaves[0].count,
      openIncidents: openIncidents[0].count
    };

    res.status(200).json({ summary });
  } catch (error) {
    console.error('Summary fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching summary.' });
  }
});

module.exports = router;
