const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'coalmine2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const findById = async (emp_id) => {
  try {
    const [rows] = await pool.execute(
      'SELECT emp_id, emp_name, password, role FROM employee WHERE emp_id = ?',
      [emp_id]
    );
    return rows[0];
  } catch (error) {
    console.error('Employee query error:', error);
    throw error;
  }
};

const generateEmpId = async () => {
  const [rows] = await pool.execute(
    "SELECT emp_id FROM employee WHERE emp_id REGEXP '^CM-[0-9]{4}$' ORDER BY CAST(SUBSTRING(emp_id, 4) AS UNSIGNED) DESC LIMIT 1"
  );

  let nextSeq = 1;
  if (rows.length > 0) {
    const lastId = rows[0].emp_id;
    const match = lastId.match(/^CM-(\d{4})$/);
    if (match) {
      nextSeq = parseInt(match[1], 10) + 1;
    }
  }

  if (nextSeq > 9999) {
    throw new Error('Cannot generate unique emp_id');
  }

  return `CM-${nextSeq.toString().padStart(4, '0')}`;
};

const createUser = async (userData) => {
  try {
    const {
      emp_name,
      password,
      role = 'employee',
      email = null,
      mobile = null,
      aadhaar = null,
      pan = null,
      bankAccount = null,
      ifsc = null,
      city = null,
      state = null,
      country = 'India',
      pincode = null,
      shift = 'A',
      status = 'Active',
      emergencyName = null,
      emergencyPhone = null,
      emergencyRelation = null,
      date_of_joining = null
    } = userData;

    if (!emp_name || !password || !role) {
      throw new Error('Missing required employee fields.');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const emp_id = await generateEmpId();

    await pool.execute(
      `INSERT INTO employee (
        emp_id, emp_name, password, role, email, mobile, aadhaar, pan,
        bank_account, ifsc_code, city, state, country, pincode, shift, status,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relation, date_of_joining
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        emp_id,
        emp_name,
        hashedPassword,
        role,
        email,
        mobile,
        aadhaar,
        pan,
        bankAccount,
        ifsc,
        city,
        state,
        country,
        pincode,
        shift,
        status,
        emergencyName,
        emergencyPhone,
        emergencyRelation,
        date_of_joining
      ]
    );

    return {
      emp_id,
      emp_name,
      role,
      email,
      mobile
    };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

const findEmployeeByIdMethod = async (emp_id, field, value) => {
  try {
    const query = `SELECT * FROM employee WHERE emp_id = ? AND \`${field}\` = ?`;
    const [rows] = await pool.execute(query, [emp_id, value]);
    return rows[0];
  } catch (error) {
    console.error('Find employee by ID and method error:', error);
    throw error;
  }
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateAndSetOtp = async (emp_id, method, contact) => {
  try {
    const otp = generateOtp();
    const hashedOtp = bcrypt.hashSync(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await pool.execute(
      `UPDATE employee SET reset_token = ?, reset_expires = ?, otp_attempts = 3 WHERE emp_id = ?`,
      [hashedOtp, expires, emp_id]
    );

    console.log(`🔑 OTP for ${emp_id}: ${otp} sent via ${method} to ${contact}`);
    return { success: true };
  } catch (error) {
    console.error('Generate OTP error:', error);
    throw error;
  }
};

const verifyOtp = async (emp_id, otp) => {
  try {
    const [rows] = await pool.execute(
      'SELECT reset_token, reset_expires, otp_attempts FROM employee WHERE emp_id = ?',
      [emp_id]
    );

    if (rows.length === 0) return { valid: false };

    const userOtpData = rows[0];
    if (userOtpData.otp_attempts <= 0) return { valid: false, reason: 'max_attempts' };
    if (new Date() > new Date(userOtpData.reset_expires)) return { valid: false, reason: 'expired' };

    const isMatch = bcrypt.compareSync(otp, userOtpData.reset_token);
    if (!isMatch) {
      await pool.execute('UPDATE employee SET otp_attempts = otp_attempts - 1 WHERE emp_id = ?', [emp_id]);
      return { valid: false, reason: 'invalid' };
    }

    return { valid: true };
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};

const updatePassword = async (emp_id, newPassword) => {
  try {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await pool.execute(
      'UPDATE employee SET password = ?, reset_token = NULL, reset_expires = NULL, otp_attempts = 3 WHERE emp_id = ?',
      [hashedPassword, emp_id]
    );
    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
};

const getProfile = async (emp_id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT emp_id, emp_name, role, email, mobile, aadhaar, pan, bank_account, ifsc_code,
       city, state, country, pincode, shift, status, emergency_contact_name,
       emergency_contact_phone, emergency_contact_relation, date_of_joining, safety_status
       FROM employee WHERE emp_id = ?`,
      [emp_id]
    );
    return rows[0];
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

const getHealthCheckups = async (emp_id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, checkup_date, checkup_type, doctor_name, status, notes,
       heart_rate, blood_pressure, oxygen_saturation, body_temperature, report_url
       FROM health_checkups WHERE emp_id = ? ORDER BY checkup_date DESC`,
      [emp_id]
    );
    return rows;
  } catch (error) {
    console.error('Get health checkups error:', error);
    throw error;
  }
};

const getShifts = async (emp_id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, shift_date, shift_type, start_time, end_time, supervisor_id, zone, status, notes
       FROM shifts WHERE emp_id = ? ORDER BY shift_date DESC LIMIT 30`,
      [emp_id]
    );
    return rows;
  } catch (error) {
    console.error('Get shifts error:', error);
    throw error;
  }
};

const getPayslips = async (emp_id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, month, year, basic_salary, hra, conveyance, medical, lta,
       pf_employee, pf_employer, gratuity, esi_employee, esi_employer,
       professional_tax, income_tax, other_deductions, gross_earnings,
       total_deductions, net_pay, generated_date
       FROM payslips WHERE emp_id = ? ORDER BY year DESC, month DESC`,
      [emp_id]
    );
    return rows;
  } catch (error) {
    console.error('Get payslips error:', error);
    throw error;
  }
};

const getSafetyStatus = async (emp_id) => {
  try {
    const [rows] = await pool.execute(
      'SELECT safety_status FROM employee WHERE emp_id = ?',
      [emp_id]
    );
    return rows[0]?.safety_status || 'green';
  } catch (error) {
    console.error('Get safety status error:', error);
    throw error;
  }
};

const updateSafetyStatus = async (emp_id, status) => {
  try {
    await pool.execute(
      'UPDATE employee SET safety_status = ? WHERE emp_id = ?',
      [status, emp_id]
    );
    return { success: true };
  } catch (error) {
    console.error('Update safety status error:', error);
    throw error;
  }
};

const logAuditAction = async (emp_id, action, details = null, ip_address = null) => {
  try {
    await pool.execute(
      'INSERT INTO audit_logs (emp_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [emp_id, action, details, ip_address]
    );
    console.log(`📝 Audit Log: ${emp_id} - ${action}`);
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw error to avoid breaking main functionality
  }
};

module.exports = {
  pool,
  findById,
  createUser,
  findEmployeeByIdMethod,
  generateAndSetOtp,
  verifyOtp,
  updatePassword,
  getProfile,
  getHealthCheckups,
  getShifts,
  getPayslips,
  getSafetyStatus,
  updateSafetyStatus,
  logAuditAction
};
