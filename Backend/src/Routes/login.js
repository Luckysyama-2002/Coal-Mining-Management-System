const express = require('express');
const { login, signup, forgotPassword, verifyOtp, resetPassword } = require('../Controllers/auth');

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
