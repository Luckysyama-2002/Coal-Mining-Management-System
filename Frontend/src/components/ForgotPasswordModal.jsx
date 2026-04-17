// import React, { useState } from 'react';
// import { FiMail, FiX, FiCheckCircle, FiPhone } from 'react-icons/fi';
// import './ForgotPasswordModal.css';

// const ForgotPasswordModal = ({ isOpen, onClose }) => {
//   const [submitted, setSubmitted] = useState(false);
//   const [method, setMethod] = useState('email'); // Toggle between email or supervisor

//   if (!isOpen) return null;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Logic: Send reset request to Backend
//     setSubmitted(true);
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal-content">
//         <button className="close-btn" onClick={onClose}><FiX size={24} /></button>
        
//         {!submitted ? (
//           <div className="modal-body">
//             <h2>Reset Password</h2>
//             <p>Select a method to recover your Mine-Sync access.</p>

//             <div className="method-toggle">
//               <button 
//                 className={method === 'email' ? 'active' : ''} 
//                 onClick={() => setMethod('email')}
//               >Email</button>
//               <button 
//                 className={method === 'sms' ? 'active' : ''} 
//                 onClick={() => setMethod('sms')}
//               >Supervisor/SMS</button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="input-group">
//                 <label>{method === 'email' ? 'Registered Email' : 'Employee Phone Number'}</label>
//                 <div className="input-wrapper">
//                   {method === 'email' ? <FiMail className="input-icon" /> : <FiPhone className="input-icon" />}
//                   <input 
//                     type={method === 'email' ? 'email' : 'tel'} 
//                     placeholder={method === 'email' ? 'name@mine.gov.in' : '+91 XXXXX XXXXX'}
//                     required 
//                   />
//                 </div>
//               </div>
//               <button type="submit" className="reset-submit-btn">Send Recovery Code</button>
//             </form>
//           </div>
//         ) : (
//           <div className="modal-success">
//             <FiCheckCircle size={60} className="success-icon" />
//             <h2>Request Sent</h2>
//             <p>A recovery link has been sent. If you don't receive it in 2 minutes, contact the IT Helpdesk at Sector 4.</p>
//             <button className="reset-submit-btn" onClick={onClose}>Back to Login</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ForgotPasswordModal;

import React, { useState } from 'react';
import { FiMail, FiX, FiCheckCircle, FiPhone, FiUser, FiKey, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../api';
import './ForgotPasswordModal.css';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('request');
  const [method, setMethod] = useState('email');
  const [employeeId, setEmployeeId] = useState('');
  const [contactValue, setContactValue] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setStep('request');
    setMethod('email');
    setEmployeeId('');
    setContactValue('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!employeeId.trim()) {
      setErrorMsg('Employee ID is required.');
      return;
    }

    if (!contactValue.trim()) {
      setErrorMsg(method === 'email' ? 'Email is required.' : 'Mobile number is required.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        emp_id: employeeId.trim(),
        method,
        ...(method === 'email' ? { email: contactValue.trim() } : { phone: contactValue.trim() })
      };

      const response = await api.post('/auth/forgot-password', payload);
      setSuccessMsg(response.data?.message || 'Recovery code sent.');
      setStep('otp');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Unable to send recovery code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otp.trim()) {
      setErrorMsg('Please enter the OTP code.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/verify-otp', {
        emp_id: employeeId.trim(),
        otp: otp.trim()
      });
      setStep('reset');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        emp_id: employeeId.trim(),
        otp: otp.trim(),
        newPassword,
        confirmPassword
      });
      setStep('changed');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const contactLabel = method === 'email' ? 'Registered Email' : 'Registered Mobile Number';
  const contactPlaceholder = method === 'email' ? 'name@mine.gov.in' : '+91 98765 43210';
  const contactType = method === 'email' ? 'email' : 'tel';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={handleClose}><FiX size={24} /></button>

        {step === 'request' && (
          <div className="modal-body">
            <h2>Reset Password</h2>
            <p>Enter your ID and choose a recovery method.</p>

            {errorMsg && <div className="error-msg">{errorMsg}</div>}
            {successMsg && <div className="error-msg" style={{ backgroundColor: '#e2f5e9', color: '#064e3b', borderColor: '#10b981' }}>{successMsg}</div>}

            <form onSubmit={handleSendCode}>
              <div className="input-group">
                <label>Employee ID</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. CM-4092"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="method-toggle">
                <button
                  type="button"
                  className={method === 'email' ? 'active' : ''}
                  onClick={() => setMethod('email')}
                >Email</button>
                <button
                  type="button"
                  className={method === 'sms' ? 'active' : ''}
                  onClick={() => setMethod('sms')}
                >Mobile/SMS</button>
              </div>

              <div className="input-group">
                <label>{contactLabel}</label>
                <div className="input-wrapper">
                  {method === 'email' ? <FiMail className="input-icon" /> : <FiPhone className="input-icon" />}
                  <input
                    type={contactType}
                    placeholder={contactPlaceholder}
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="reset-submit-btn">
                {loading ? 'Sending...' : 'Send Recovery Code'}
              </button>
            </form>
          </div>
        )}

        {step === 'otp' && (
          <div className="modal-body">
            <h2>Verify OTP</h2>
            <p>Enter the 6-digit code sent to your {method === 'email' ? 'email' : 'mobile number'}.</p>

            {errorMsg && <div className="error-msg">{errorMsg}</div>}

            <form onSubmit={handleVerifyOtp}>
              <div className="input-group">
                <label>Enter OTP</label>
                <div className="input-wrapper">
                  <FiKey className="input-icon" />
                  <input
                    type="text"
                    placeholder="XXXXXX"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="reset-submit-btn">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <p className="resend-text">
              Didn't receive the code?
              <button type="button" className="resend-btn" onClick={handleSendCode}>
                Resend Code
              </button>
            </p>
          </div>
        )}

        {step === 'reset' && (
          <div className="modal-body">
            <h2>New Password</h2>
            <p>Enter your new password and confirm it.</p>

            {errorMsg && <div className="error-msg">{errorMsg}</div>}

            <form onSubmit={handleChangePassword}>
              <div className="input-group">
                <label>New Password</label>
                <div className="input-wrapper">
                  <FiKey className="input-icon" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="New secure password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Confirm New Password</label>
                <div className="input-wrapper">
                  <FiKey className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="reset-submit-btn">
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {step === 'changed' && (
          <div className="modal-success">
            <FiCheckCircle size={60} className="success-icon" />
            <h2>Password Updated</h2>
            <p>Your password has been updated. You can now login with your new password.</p>
            <button className="reset-submit-btn" onClick={handleClose}>Back to Login</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
