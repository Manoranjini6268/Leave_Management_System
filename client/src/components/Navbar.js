import React, { useContext, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Icon from './Icon';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, hasRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (hasRole(['team_leader', 'team_manager', 'general_manager'])) {
      axios.get('/api/manager/pending')
        .then(res => setPendingCount(res.data.count || 0))
        .catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-logo"><Icon name="building" size={16} color="#fff" /></span>
          LeaveMS
        </Link>
        
        <div className="navbar-menu">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><Icon name="dashboard" size={15} />Dashboard</NavLink>
          <NavLink to="/apply-leave" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><Icon name="calendar" size={15} />Apply Leave</NavLink>
          <NavLink to="/leave-history" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><Icon name="history" size={15} />Leave History</NavLink>
          
          {hasRole(['team_leader', 'team_manager', 'general_manager']) && (
            <NavLink to="/manager" className={({ isActive }) => `nav-link nav-link-highlight nav-link-badge${isActive ? ' active' : ''}`}>
              <Icon name="users" size={15} color="#fff" />
              {hasRole(['team_leader']) ? 'Team Leader' : 'Manager'}
              {pendingCount > 0 && (
                <span className="nav-badge">{pendingCount}</span>
              )}
            </NavLink>
          )}
          
          {hasRole(['general_manager']) && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link nav-link-highlight${isActive ? ' active' : ''}`}><Icon name="settings" size={15} color="#fff" />Admin</NavLink>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
            <span className="user-role">{user?.role?.replace(/_/g, ' ')}</span>
          </div>
          <Link to="/profile" className="btn btn-secondary btn-sm"><Icon name="user" size={14} />Profile</Link>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            <Icon name="logout" size={14} />Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
