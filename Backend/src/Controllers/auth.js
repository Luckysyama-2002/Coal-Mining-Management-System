const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  findById,
  createUser,
  findEmployeeByIdMethod,
  generateAndSetOtp,
  verifyOtp,
  updatePassword,
  logAuditAction
} = require('../Models/User');

const login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Input validation
    if (!userId || !password) {
      return res.status(400).json({ message: 'Employee ID and password are required.' });
    }

    // Sanitize inputs
    const sanitizedUserId = userId.toString().trim();
    const sanitizedPassword = password.toString();

    // Validate userId format
    if (!/^[A-Za-z0-9_-]{3,20}$/.test(sanitizedUserId)) {
      return res.status(400).json({ message: 'Invalid Employee ID format. Please use a valid login identifier.' });
    }

    // Validate password length
    if (sanitizedPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const user = await findById(sanitizedUserId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isValidPassword = bcrypt.compareSync(sanitizedPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { emp_id: user.emp_id, name: user.emp_name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log successful login
    await logAuditAction(user.emp_id, 'LOGIN', 'Login successful', req.ip);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: { emp_id: user.emp_id, name: user.emp_name, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error while logging in.' });
  }
};

const signup = async (req, res) => {
  try {
    const { emp_name, password, role, email, mobile } = req.body;

    if (!emp_name || !password || !role) {
      return res.status(400).json({ message: 'emp_name, password, and role are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const newUser = await createUser({ emp_name, password, role, email, mobile });

    res.status(201).json({
      message: 'User created successfully.',
      user: { emp_id: newUser.emp_id, emp_name: newUser.emp_name, role: newUser.role }
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'User creation failed: duplicate entry.' });
    }
    res.status(500).json({ message: 'Server error while signing up.' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { emp_id, method, email, phone } = req.body;

    if (!emp_id || !method || (method === 'email' && !email) || (method === 'sms' && !phone)) {
      return res.status(400).json({ message: 'emp_id, method, and contact information are required.' });
    }

    const contact = method === 'email' ? email : phone;
    const field = method === 'email' ? 'email' : 'mobile';

    const user = await findEmployeeByIdMethod(emp_id, field, contact);
    if (!user) {
      return res.status(404).json({ message: 'Employee not found with provided details.' });
    }

    await generateAndSetOtp(emp_id, method, contact);
    res.status(200).json({ message: `Recovery OTP sent to your ${method}.` });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error while requesting password recovery.' });
  }
};

const verifyOtpController = async (req, res) => {
  try {
    const { emp_id, otp } = req.body;

    if (!emp_id || !otp) {
      return res.status(400).json({ message: 'emp_id and otp are required.' });
    }

    const result = await verifyOtp(emp_id, otp);
    if (!result.valid) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error while verifying OTP.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { emp_id, otp, newPassword, confirmPassword } = req.body;

    if (!emp_id || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'emp_id, otp, newPassword and confirmPassword are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const verifyResult = await verifyOtp(emp_id, otp);
    if (!verifyResult.valid) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    await updatePassword(emp_id, newPassword);
    res.status(200).json({ message: 'Password reset successfully. Please log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error while resetting password.' });
  }
};

module.exports = {
  login,
  signup,
  forgotPassword,
  verifyOtp: verifyOtpController,
  resetPassword
};
