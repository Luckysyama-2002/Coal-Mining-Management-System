import React, { useState, useEffect } from 'react';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiX,
  FiShield, FiAward, FiEdit2, FiSettings, FiSave, FiCheckCircle
} from 'react-icons/fi';
import api from '../../../api';
import './Profile.css';

const Profile = ({ manager, onClose }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [manager]);

  const fetchProfile = async () => {
    try {
      const profileId = manager?.id || localStorage.getItem('user_id');
      const response = await api.get(`/employee/profile/${profileId}`);
      setProfileData(response.data.employee);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setUpdateData({
      email: profileData.email || '',
      mobile: profileData.mobile || '',
      city: profileData.city || '',
      state: profileData.state || '',
      pincode: profileData.pincode || '',
      emergency_contact_name: profileData.emergency_contact_name || '',
      emergency_contact_phone: profileData.emergency_contact_phone || '',
      emergency_contact_relation: profileData.emergency_contact_relation || ''
    });
  };

  const handleSave = async () => {
    try {
      await api.put(`/employee/profile/${manager.id}`, updateData);
      setEditing(false);
      setMessage('Profile updated successfully!');
      setShowMessage(true);
      fetchProfile(); // Refresh data

      setTimeout(() => {
        setShowMessage(false);
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage('Failed to update profile. Please try again.');
      setShowMessage(true);

      setTimeout(() => {
        setShowMessage(false);
        setMessage('');
      }, 3000);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setUpdateData({});
  };

  if (loading) {
    return (
      <div className="profile-wrapper">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-wrapper">
        <div className="error">Failed to load profile data</div>
      </div>
    );
  }

  const fullProfile = {
    ...profileData,
    name: profileData.emp_name,
    id: profileData.emp_id,
    address: `${profileData.city || 'N/A'}, ${profileData.state || 'N/A'} ${profileData.pincode || ''}, ${profileData.country || 'India'}`,
    joinedDate: profileData.date_of_joining ? new Date(profileData.date_of_joining).toLocaleDateString() : 'N/A',
    certifications: ["Mine Safety Expert (DGMS)", "Heavy Machinery Ops Level 4"], // Mock certifications
    accessLevel: profileData.role === 'manager' ? 'Level 1 Administrator' :
                 profileData.role === 'admin' ? 'System Administrator' :
                 profileData.role === 'safety_officer' ? 'Safety Supervisor' : 'Employee'
  };

  return (
    <>
      {onClose && (
        <button
          className="absolute top-4 right-4 z-50 bg-white shadow-lg hover:shadow-xl rounded-full p-2 border transition-all duration-200"
          onClick={onClose}
          style={{ fontSize: '1.2rem' }}
        >
          <FiX />
        </button>
      )}

      {showMessage && (
        <div className={`profile-message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message.includes('successfully') && <FiCheckCircle />}
          {message}
        </div>
      )}

      <div className="profile-wrapper">
        <div className="profile-grid">

          {/* LEFT COLUMN: Identity Card */}
          <section className="profile-card-main">
            <div className="avatar-large">
              <FiUser />
              <button className="edit-avatar-btn"><FiEdit2 /></button>
            </div>
            <h2 className="profile-name">{fullProfile.name}</h2>
            <p className="profile-id">{fullProfile.id}</p>
            <div className="access-badge">
              <FiShield /> {fullProfile.accessLevel}
            </div>

            <div className="profile-quick-actions">
              {!editing ? (
                <button className="p-btn primary" onClick={handleEdit}>
                  <FiEdit2 /> Edit Profile
                </button>
              ) : (
                <>
                  <button className="p-btn secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button className="p-btn primary" onClick={handleSave}>
                    <FiSave /> Save Changes
                  </button>
                </>
              )}
            </div>
          </section>

          {/* RIGHT COLUMN: Detailed Information */}
          <section className="profile-details-area">
            <div className="detail-group">
              <h3>Contact Information</h3>
              <div className="detail-item">
                <FiMail className="detail-icon" />
                <div>
                  <label>Email Address</label>
                  {editing ? (
                    <input
                      type="email"
                      value={updateData.email}
                      onChange={(e) => setUpdateData({...updateData, email: e.target.value})}
                      className="profile-input"
                    />
                  ) : (
                    <p>{fullProfile.email || 'Not provided'}</p>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <FiPhone className="detail-icon" />
                <div>
                  <label>Mobile Number</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={updateData.mobile}
                      onChange={(e) => setUpdateData({...updateData, mobile: e.target.value})}
                      className="profile-input"
                    />
                  ) : (
                    <p>{fullProfile.mobile || 'Not provided'}</p>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <FiMapPin className="detail-icon" />
                <div>
                  <label>City</label>
                  {editing ? (
                    <input
                      type="text"
                      value={updateData.city}
                      onChange={(e) => setUpdateData({...updateData, city: e.target.value})}
                      className="profile-input"
                    />
                  ) : (
                    <p>{profileData.city || 'Not provided'}</p>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <FiMapPin className="detail-icon" />
                <div>
                  <label>State</label>
                  {editing ? (
                    <input
                      type="text"
                      value={updateData.state}
                      onChange={(e) => setUpdateData({...updateData, state: e.target.value})}
                      className="profile-input"
                    />
                  ) : (
                    <p>{profileData.state || 'Not provided'}</p>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <FiMapPin className="detail-icon" />
                <div>
                  <label>PIN Code</label>
                  {editing ? (
                    <input
                      type="text"
                      value={updateData.pincode}
                      onChange={(e) => setUpdateData({...updateData, pincode: e.target.value})}
                      className="profile-input"
                    />
                  ) : (
                    <p>{profileData.pincode || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="detail-group">
              <h3>Emergency Contact</h3>
              <div className="detail-item">
                <FiUser className="detail-icon" />
                <div>
                  <label>Emergency Contact Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={updateData.emergency_contact_name}
                      onChange={(e) => setUpdateData({...updateData, emergency_contact_name: e.target.value})}
                      className="profile-input"
                    />
                  ) : (
                    <p>{profileData.emergency_contact_name || 'Not provided'}</p>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <FiPhone className="detail-icon" />
                <div>
                  <label>Emergency Contact Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={updateData.emergency_contact_phone}
                      onChange={(e) => setUpdateData({...updateData, emergency_contact_phone: e.target.value})}
                      className="profile-input"
                    />
                  ) : (
                    <p>{profileData.emergency_contact_phone || 'Not provided'}</p>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <FiUser className="detail-icon" />
                <div>
                  <label>Relationship</label>
                  {editing ? (
                    <input
                      type="text"
                      value={updateData.emergency_contact_relation}
                      onChange={(e) => setUpdateData({...updateData, emergency_contact_relation: e.target.value})}
                      className="profile-input"
                    />
                  ) : (
                    <p>{profileData.emergency_contact_relation || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="detail-group">
              <h3>Professional Credentials</h3>
              <div className="detail-item">
                <FiMapPin className="detail-icon" />
                <div>
                  <label>Role</label>
                  <p>{profileData.role ? profileData.role.replace('_', ' ').toUpperCase() : 'N/A'}</p>
                </div>
              </div>
              <div className="detail-item">
                <FiAward className="detail-icon" />
                <div>
                  <label>Joining Date</label>
                  <p>{fullProfile.joinedDate}</p>
                </div>
              </div>
              <div className="detail-item">
                <FiShield className="detail-icon" />
                <div>
                  <label>Status</label>
                  <p>{profileData.status || 'Active'}</p>
                </div>
              </div>
              <div className="cert-list">
                {fullProfile.certifications.map((cert, index) => (
                  <span key={index} className="cert-tag">{cert}</span>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Profile;
