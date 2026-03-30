import React, { useState } from 'react';
import { 
  FiUser, FiBriefcase, FiX, FiClock, FiPhone, 
  FiMail, FiFileText, FiCreditCard, FiMapPin, FiHeart 
} from 'react-icons/fi';
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

  if (!isOpen) return null;

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
    setLoading(true);

    // Basic Validation logic
    if (formData.aadhaar.length !== 12) {
      setError('Aadhaar must be exactly 12 digits.');
      setLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API

      const newEmployee = {
        ...formData,
        id: generateMockId(),
      };

      onEmployeeAdded(newEmployee);
      setLoading(false);
      setFormData(initialFormState);
      onClose();
    } catch (err) {
      setError('Failed to add employee. Try again.');
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
                <option value="Excavator Operator">Excavator Operator</option>
                <option value="Driller">Driller</option>
                <option value="Blaster">Blaster</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Surveyor">Surveyor</option>
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