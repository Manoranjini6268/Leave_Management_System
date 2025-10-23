import React from 'react';
import './LeaveCard.css';

const LeaveCard = ({ title, value, icon, color }) => {
  return (
    <div className="leave-card" style={{ borderLeftColor: color }}>
      <div className="leave-card-icon" style={{ background: `${color}20`, color: color }}>
        {icon}
      </div>
      <div className="leave-card-content">
        <h3 className="leave-card-title">{title}</h3>
        <p className="leave-card-value">{value}</p>
      </div>
    </div>
  );
};

export default LeaveCard;
