import React from 'react';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiX,
  FiShield, FiAward, FiEdit2, FiSettings 
} from 'react-icons/fi';
import './Profile.css';

const Profile = ({ manager, onClose }) => {
  // Extended mock data for the profile
  const fullProfile = {
    ...manager,
    email: "vikram.rathore@mine-sync.gov.in",
    phone: "+91 98765 00102",
    address: "Bunglow No. 42, Coal Township, Dhanbad, Jharkhand",
    joinedDate: "Jan 12, 2014",
    certifications: ["Mine Safety Expert (DGMS)", "Heavy Machinery Ops Level 4"],
    accessLevel: "Level 1 Administrator"
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
              <button className="p-btn secondary"><FiSettings /> Settings</button>
              <button className="p-btn primary">Update Bio</button>
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
                  <p>{fullProfile.email}</p>
                </div>
              </div>
              <div className="detail-item">
                <FiPhone className="detail-icon" />
                <div>
                  <label>Mobile Number</label>
                  <p>{fullProfile.phone}</p>
                </div>
              </div>
              <div className="detail-item">
                <FiMapPin className="detail-icon" />
                <div>
                  <label>Office Address</label>
                  <p>{fullProfile.address}</p>
                </div>
              </div>
            </div>

            <div className="detail-group">
              <h3>Professional Credentials</h3>
              <div className="detail-item">
                <FiMapPin className="detail-icon" />
                <div>
                  <label>Assigned Zone</label>
                  <p>{fullProfile.zone}</p>
                </div>
              </div>
              <div className="detail-item">
                <FiAward className="detail-icon" />
                <div>
                  <label>Experience</label>
                  <p>{fullProfile.experience || "12 Years"}</p>
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
