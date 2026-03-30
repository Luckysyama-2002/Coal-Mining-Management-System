import React from 'react';
import './Overview.css';
import { FiTrendingUp, FiShield, FiCpu, FiClock } from 'react-icons/fi';

const Overview = () => {
  const stats = [
    {
      id: 1,
      icon: <FiShield />,
      title: "Safety First",
      desc: "Real-time gas monitoring and automated emergency alerts reduce response time by 70%.",
      color: "gold"
    },
    {
      id: 2,
      icon: <FiTrendingUp />,
      title: "Productivity",
      desc: "Digital shift handovers eliminate downtime and ensure continuous production flow.",
      color: "green"
    },
    {
      id: 3,
      icon: <FiCpu />,
      title: "IoT Integration",
      desc: "Direct connection to underground sensors for temperature, water, and air quality.",
      color: "blue"
    },
    {
      id: 4,
      icon: <FiClock />,
      title: "Zero Data Loss",
      desc: "Paperless record-keeping ensures every handover and payment is logged permanently.",
      color: "purple"
    }
  ];

  return (
    <section className="overview-container">
      <div className="overview-header">
        <span className="overview-badge">System Capabilities</span>
        <h2 className="overview-title">Digitalizing Mine Management</h2>
        <div className="overview-underline"></div>
      </div>

      <div className="overview-grid">
        {stats.map((item) => (
          <div key={item.id} className={`overview-card border-${item.color}`}>
            <div className={`icon-wrapper bg-${item.color}`}>
              {item.icon}
            </div>
            <h3 className="card-title">{item.title}</h3>
            <p className="card-desc">{item.desc}</p>
          </div>
        ))}
      </div>
      
      {/* Live Impact Counter (Optional Visual) */}
      <div className="impact-box">
        <div className="impact-item">
          <p className="impact-num">24/7</p>
          <p className="impact-label">Active Monitoring</p>
        </div>
        <div className="impact-divider"></div>
        <div className="impact-item">
          <p className="impact-num">0%</p>
          <p className="impact-label">Communication Gaps</p>
        </div>
      </div>
    </section>
  );
};

export default Overview;