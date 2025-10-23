import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, hasRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏢</span>
          Leave Management System
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/apply-leave" className="nav-link">Apply Leave</Link>
          <Link to="/leave-history" className="nav-link">Leave History</Link>
          
          {hasRole(['team_leader', 'team_manager', 'general_manager']) && (
            <Link to="/manager" className="nav-link">Manager Panel</Link>
          )}
          
          {hasRole(['general_manager']) && (
            <Link to="/admin" className="nav-link">Admin Panel</Link>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
            <span className="user-role">{user?.role?.replace('_', ' ')}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
