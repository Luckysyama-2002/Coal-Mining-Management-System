import React, { useState } from 'react';
import { 
  FiUser, FiBriefcase, FiX, FiClock, FiPhone, 
  FiMail, FiFileText, FiCreditCard, FiMapPin, FiHeart 
} from 'react-icons/fi';
import api from '../../../api';
import './AddEmployeeModal.css';

const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
  const initialFormState = {
    name: '',
    role: '',
    shift: 'A',
    status: 'Active',
    mobile: '',
    email: '',
    aadhaar: '',
    pan: '',
    bankAccount: '',
    ifsc: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Role validation
    if (!formData.role) {
      errors.role = 'Role is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Mobile validation
    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      errors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    // Aadhaar validation
    if (!formData.aadhaar.trim()) {
      errors.aadhaar = 'Aadhaar number is required';
    } else if (!/^\d{12}$/.test(formData.aadhaar)) {
      errors.aadhaar = 'Aadhaar must be exactly 12 digits';
    }

    // PAN validation
    if (!formData.pan.trim()) {
      errors.pan = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())) {
      errors.pan = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
    }

    // Bank account validation
    if (!formData.bankAccount.trim()) {
      errors.bankAccount = 'Bank account number is required';
    } else if (!/^\d{9,18}$/.test(formData.bankAccount)) {
      errors.bankAccount = 'Bank account number must be 9-18 digits';
    }

    // IFSC validation
    if (!formData.ifsc.trim()) {
      errors.ifsc = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc.toUpperCase())) {
      errors.ifsc = 'Please enter a valid IFSC code';
    }

    // Address validation
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }
    if (!formData.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = 'Pincode must be 6 digits';
    }

    // Emergency contact validation
    if (!formData.emergencyName.trim()) {
      errors.emergencyName = 'Emergency contact name is required';
    }
    if (!formData.emergencyPhone.trim()) {
      errors.emergencyPhone = 'Emergency contact number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.emergencyPhone)) {
      errors.emergencyPhone = 'Please enter a valid 10-digit emergency contact number';
    }
    if (!formData.emergencyRelation.trim()) {
      errors.emergencyRelation = 'Relationship is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateMockId = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const seq = Math.floor(Math.random() * 9000) + 1000;
    return `CM-${year}${seq}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validation for numeric fields
    if (['aadhaar', 'pincode', 'bankAccount', 'mobile', 'emergencyPhone'].includes(name)) {
      if (value !== '' && !/^\d+$/.test(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    if (!validateForm()) {
      setError('Please correct the errors below');
      return;
    }

    setLoading(true);

    try {
      // Map form fields to backend expected fields
      const employeeData = {
        emp_name: formData.name,
        password: 'defaultPass123', // TODO: Generate or prompt for password
        role: formData.role,
        email: formData.email,
        mobile: formData.mobile,
        aadhaar: formData.aadhaar,
        pan: formData.pan,
        bankAccount: formData.bankAccount,
        ifsc: formData.ifsc,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        shift: formData.shift,
        status: formData.status,
        emergencyName: formData.emergencyName,
        emergencyPhone: formData.emergencyPhone,
        emergencyRelation: formData.emergencyRelation,
        date_of_joining: new Date().toISOString().split('T')[0] // Today's date
      };

      const response = await api.post('/employee/employees', employeeData);

      const newEmployee = {
        id: response.data.employee.emp_id,
        name: response.data.employee.emp_name,
        role: response.data.employee.role,
        shift: response.data.employee.shift,
        status: response.data.employee.status
      };

      onEmployeeAdded(newEmployee);
      setLoading(false);
      setFormData(initialFormState);
      onClose();
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setError(`Validation failed: ${errorData.errors.join(', ')}`);
      } else {
        setError(errorData?.message || 'Failed to add employee. Try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-pop wide-modal">
        <button className="close-x" onClick={onClose}><FiX size={24} /></button>
        
        <div className="modal-header-section">
          <h2><FiUser className="title-icon" /> Full Personnel Registration</h2>
          <p>Provide comprehensive worker details for compliance and payroll.</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          
          {/* SECTION 1: PROFESSIONAL & CONTACT */}
          <h4 className="form-section-title"><FiUser /> Personal & Professional</h4>
          <div className="form-grid">
            <div className="input-field">
              <label>Full Name</label>
              <input name="name" type="text" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="input-field">
              <label>Job Role</label>
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="">Select Role</option>
                <option value="excavator_operator">Excavator Operator</option>
                <option value="driller">Driller</option>
                <option value="blaster">Blaster</option>
                <option value="safety_officer">Safety Officer</option>
                <option value="surveyor">Surveyor</option>
              </select>
            </div>
            <div className="input-field">
              <label>Shift</label>
              <select name="shift" value={formData.shift} onChange={handleChange}>
                <option value="A">Shift A (Day)</option>
                <option value="B">Shift B (Evening)</option>
                <option value="C">Shift C (Night)</option>
              </select>
            </div>
            <div className="input-field">
              <label>Mobile Number</label>
              <input name="mobile" type="tel" maxLength={10} value={formData.mobile} onChange={handleChange} required />
            </div>
            <div className="input-field">
              <label>Email Address</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          {/* SECTION 2: IDENTITY & BANKING */}
          <h4 className="form-section-title"><FiCreditCard /> Identity & Payroll</h4>
          <div className="form-grid">
            <div className="input-field">
              <label>Aadhaar Number</label>
              <input name="aadhaar" type="text" maxLength={12} value={formData.aadhaar} onChange={handleChange} required />
            </div>
            <div className="input-field">
              <label>PAN Number</label>
              <input name="pan" type="text" maxLength={10} style={{textTransform: 'uppercase'}} value={formData.pan} onChange={handleChange} required />
            </div>
            <div className="input-field">
              <label>Bank Account No.</label>
              <input name="bankAccount" type="text" value={formData.bankAccount} onChange={handleChange} required />
            </div>
            <div className="input-field">
              <label>IFSC Code</label>
              <input name="ifsc" type="text" style={{textTransform: 'uppercase'}} value={formData.ifsc} onChange={handleChange} required />
            </div>
          </div>

          {/* SECTION 3: ADDRESS */}
          <h4 className="form-section-title"><FiMapPin /> Address Details</h4>
          <div className="form-grid">
            <div className="input-field">
              <label>City</label>
              <input name="city" type="text" value={formData.city} onChange={handleChange} required />
            </div>
            <div className="input-field">
              <label>State</label>
              <input name="state" type="text" value={formData.state} onChange={handleChange} required />
            </div>
            <div className="input-field">
              <label>Pincode</label>
              <input name="pincode" type="text" maxLength={6} value={formData.pincode} onChange={handleChange} required />
            </div>
            <div className="input-field">
              <label>Country</label>
              <input name="country" type="text" value={formData.country} onChange={handleChange} required />
            </div>
          </div>

          {/* SECTION 4: EMERGENCY CONTACT */}
          <h4 className="form-section-title"><FiHeart /> Emergency Contact</h4>
          <div className="form-grid">
            <div className="input-field">
              <label>Contact Person Name</label>
              <input name="emergencyName" type="text" value={formData.emergencyName} onChange={handleChange} required />
            </div>
            <div className="input-field">
              <label>Phone Number</label>
              <input name="emergencyPhone" type="tel" maxLength={10} value={formData.emergencyPhone} onChange={handleChange} required />
            </div>
            <div className="input-field">
              <label>Relationship</label>
              <input name="emergencyRelation" type="text" placeholder="e.g. Spouse" value={formData.emergencyRelation} onChange={handleChange} required />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="confirm-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Register Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;