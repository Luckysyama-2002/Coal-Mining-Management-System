import React, { useState } from 'react';
import { FiUser, FiBriefcase, FiX, FiClock, FiCheckCircle, FiPhone, FiMail, FiFileText } from 'react-icons/fi';
import './AddEmployeeModal.css';

const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    shift: 'A',
    status: 'Active',
    mobile: '',
    email: '',
    aadhaar: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Function to generate a realistic mining ID
  const generateMockId = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const seq = Math.floor(Math.random() * 9000) + 1000;
    return `CM-${year}${seq}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic Validation
    if (!formData.name.trim() || !formData.role || formData.aadhaar.length < 12) {
      setError('Please fill all fields correctly. Aadhaar must be 12 digits.');
      setLoading(false);
      return;
    }

    try {
      // Simulate API Call
      await new Promise(resolve => setTimeout(resolve, 800));

      const newEmployee = {
        ...formData,
        id: generateMockId(),
        name: formData.name.trim(),
      };

      onEmployeeAdded(newEmployee); // This updates the list in ManagerDashboard
      setLoading(false);
      
      // Reset form and close
      setFormData({ name: '', role: '', shift: 'A', status: 'Active', mobile: '', email: '', aadhaar: '' });
      onClose();
    } catch (err) {
      setError('Failed to add employee. Try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Special check for Aadhaar to only allow numbers
    if (name === 'aadhaar' && value !== '' && !/^\d+$/.test(value)) return;
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-pop">
        <button className="close-x" onClick={onClose}><FiX size={24} /></button>
        
        <div className="modal-header-section">
          <h2><FiUser className="title-icon" /> New Personnel Entry</h2>
          <p>Register a new worker into the Mine-Sync database.</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="input-field">
              <label><FiUser /> Full Name</label>
              <input name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="input-field">
              <label><FiBriefcase /> Job Role</label>
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="">Select Role</option>
                <option value="Excavator Operator">Excavator Operator</option>
                <option value="Driller">Driller</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Surveyor">Surveyor</option>
              </select>
            </div>

            <div className="input-field">
              <label><FiClock /> Assigned Shift</label>
              <select name="shift" value={formData.shift} onChange={handleChange}>
                <option value="A">Shift A (Day)</option>
                <option value="B">Shift B (Evening)</option>
                <option value="C">Shift C (Night)</option>
              </select>
            </div>

            <div className="input-field">
              <label><FiPhone /> Contact Number</label>
              <input name="mobile" type="tel" placeholder="+91" value={formData.mobile} onChange={handleChange} required />
            </div>

            <div className="input-field full-width">
              <label><FiMail /> Email Address</label>
              <input name="email" type="email" placeholder="worker@coalfield.com" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="input-field full-width">
              <label><FiFileText /> Aadhaar Card Number</label>
              <input name="aadhaar" type="text" maxLength={12} placeholder="12-digit number" value={formData.aadhaar} onChange={handleChange} required />
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