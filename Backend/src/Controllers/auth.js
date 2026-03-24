const jwt = require('jsonwebtoken');
const { findById } = require('../Models/User');

const login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Validation
    if (!userId || !password) {
      return res.status(400).json({ message: 'Employee ID and password are required' });
    }

    // Find employee
    const user = await findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password with bcrypt\n    const bcrypt = require('bcryptjs');\n    if (!bcrypt.compareSync(password, user.password)) {\n      return res.status(401).json({ message: 'Invalid credentials' });\n    }

    // Generate JWT
    const token = jwt.sign(
      { emp_id: user.emp_id, name: user.emp_name, role: user.role },
      process.env.JWT_SECRET || 'your_super_secret_key_change_me',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { emp_id: user.emp_id, name: user.emp_name, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
const signup = async (req, res) => {
  try {
    const { emp_name, password, role } = req.body;

    // Validation
    if (!emp_name || !password || !role) {
      return res.status(400).json({ message: 'emp_name, password, and role are required' });
    }

    // Create user with auto-generated unique emp_id (uses bcryptjs hash)
    const { createUser } = require('../Models/User');
    const newUser = await createUser({ emp_name, password, role });

    res.status(201).json({
      message: 'User created successfully',
      user: { emp_id: newUser.emp_id, emp_name: newUser.emp_name, role: newUser.role }
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 'ER_DUP_ENTRY' || error.code === 'ER_BAD_NULL_ERROR') {
      return res.status(400).json({ message: 'Signup failed - check unique fields or required data' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};



const { findEmployeeByIdMethod, generateAndSetOtp, verifyOtp, updatePassword } = require('../Models/User');

const forgotPassword = async (req, res) => {
  try {
    const { emp_id, method, email, phone } = req.body;

    if (!emp_id || !method || (method === 'email' && !email) || (method === 'sms' && !phone)) {
      return res.status(400).json({ message: 'emp_id, method (email/sms), and contact required' });
    }

    const contact = method === 'email' ? email : phone;
    const field = method === 'email' ? 'email' : 'phone';

    const user = await findEmployeeByIdMethod(emp_id, field, contact);
    if (!user) {
      return res.status(404).json({ message: 'Employee not found with provided details' });
    }

    await generateAndSetOtp(emp_id);
    res.status(200).json({ message: `Recovery OTP sent to your ${method}! Check console for OTP.` });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyOtpController = async (req, res) => {
  try {
    const { emp_id, otp } = req.body;

    if (!emp_id || !otp) {
      return res.status(400).json({ message: 'emp_id and otp required' });
    }

    const result = await verifyOtp(emp_id, otp);
    if (!result.valid) {
      return res.status(400).json({ message: `Invalid OTP: ${result.reason || 'try again'}` });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { emp_id, otp, newPassword, confirmPassword } = req.body;

    if (!emp_id || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'emp_id, otp, newPassword, confirmPassword required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Verify OTP again for security
    const verifyResult = await verifyOtp(emp_id, otp);
    if (!verifyResult.valid) {
      return res.status(400).json({ message: `Cannot reset: ${verifyResult.reason || 'invalid OTP'}` });
    }

    await updatePassword(emp_id, newPassword);
    res.status(200).json({ message: 'Password reset successfully. Please login with new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  login, 
  signup, 
  forgotPassword, 
  verifyOtp: verifyOtpController, 
  resetPassword 
};
