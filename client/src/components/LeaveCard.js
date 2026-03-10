import React from 'react';
import Icon from './Icon';
import './LeaveCard.css';

const LeaveCard = ({ title, value, icon, color = '#2563eb' }) => {
  return (
    <div className="leave-card">
      <div className="leave-card-icon" style={{ background: `${color}18`, color }}>
        <Icon name={icon} size={20} color={color} />
      </div>
      <div className="leave-card-content">
        <p className="leave-card-title">{title}</p>
        <p className="leave-card-value">{value}</p>
      </div>
    </div>
  );
};

export default LeaveCard;
