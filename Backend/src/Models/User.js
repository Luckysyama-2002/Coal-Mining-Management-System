const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'coalmine',
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

const generateEmpId = async (emp_name) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = emp_name.substring(0, 2).toUpperCase();
  
  let seq = 1;
  while (true) {
    const candidate = `${year}${prefix}${seq.toString().padStart(4, '0')}`;
    // Check if exists
    const [rows] = await pool.execute(
      'SELECT emp_id FROM employee WHERE emp_id = ?',
      [candidate]
    );
    if (rows.length === 0) return candidate;
    seq++;
    if (seq > 9999) throw new Error('Cannot generate unique emp_id');
  }
};

const createUser = async (userData) => {
  try {
    const { emp_name, password, role } = userData;
    const hashedPassword = require('bcryptjs').hashSync(password, 10);
    const emp_id = await generateEmpId(emp_name);
    
    const [result] = await pool.execute(
      'INSERT INTO employee (emp_id, emp_name, password, role) VALUES (?, ?, ?, ?)',
      [emp_id, emp_name, hashedPassword, role]
    );
    
    const createdUser = { emp_id, emp_name, role };
    return createdUser;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

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

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateAndSetOtp = async (emp_id) => {
  try {
    const otp = generateOtp();
    const hashedOtp = bcrypt.hashSync(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await pool.execute(
      `UPDATE employee 
       SET reset_token = ?, reset_expires = ?, otp_attempts = 3 
       WHERE emp_id = ?`,
      [hashedOtp, expires, emp_id]
    );

    console.log(`🔑 OTP for ${emp_id}: ${otp} (sent via ${method || 'method'} - implement real send)`); // Mock send
    return { success: true };
  } catch (error) {
    console.error('Generate OTP error:', error);
    throw error;
  }
};

const verifyOtp = async (emp_id, otp) => {
  try {
    const [rows] = await pool.execute(
      `SELECT reset_token, reset_expires, otp_attempts FROM employee WHERE emp_id = ?`,
      [emp_id]
    );
    if (rows.length === 0) return { valid: false };

    const userOtpData = rows[0];
    if (userOtpData.otp_attempts <= 0) return { valid: false, reason: 'max_attempts' };

    if (new Date() > new Date(userOtpData.reset_expires)) {
      return { valid: false, reason: 'expired' };
    }

    const isMatch = bcrypt.compareSync(otp, userOtpData.reset_token);
    if (!isMatch) {
      // Decrement attempts
      await pool.execute(
        'UPDATE employee SET otp_attempts = otp_attempts - 1 WHERE emp_id = ?',
        [emp_id]
      );
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
      `UPDATE employee 
       SET password = ?, reset_token = NULL, reset_expires = NULL, otp_attempts = 3 
       WHERE emp_id = ?`,
      [hashedPassword, emp_id]
    );
    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
};

module.exports = { 
  findById, 
  createUser, 
  findEmployeeByIdMethod, 
  generateAndSetOtp, 
  verifyOtp, 
  updatePassword 
};
