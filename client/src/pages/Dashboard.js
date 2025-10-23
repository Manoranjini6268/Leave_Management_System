import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import LeaveCard from '../components/LeaveCard';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, leavesRes] = await Promise.all([
        axios.get('/api/leaves/stats'),
        axios.get('/api/leaves?status=pending')
      ]);

      setStats(statsRes.data);
      setRecentLeaves(leavesRes.data.leaves.slice(0, 5));
    } catch (error) {
      toast.error('Error loading dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{status}</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading dashboard...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.firstName}! 👋</h1>
            <p>Here's your leave overview</p>
          </div>
          <Link to="/apply-leave" className="btn btn-primary">
            Apply for Leave
          </Link>
        </div>

        <div className="dashboard-section">
          <h2>Leave Balances</h2>
          <div className="grid grid-4">
            <LeaveCard
              title="Casual Leave"
              value={stats?.balances?.casual || 0}
              icon="🏖️"
              color="#3b82f6"
            />
            <LeaveCard
              title="Medical Leave"
              value={stats?.balances?.medical || 0}
              icon="🏥"
              color="#ef4444"
            />
            <LeaveCard
              title="Earned Leave"
              value={stats?.balances?.earned || 0}
              icon="⭐"
              color="#10b981"
            />
            <LeaveCard
              title="Unpaid Leave"
              value={stats?.balances?.unpaid || 0}
              icon="📅"
              color="#f59e0b"
            />
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Leave Statistics (This Year)</h2>
          <div className="grid grid-4">
            <LeaveCard
              title="Total Leaves"
              value={stats?.stats?.total || 0}
              icon="📊"
              color="#8b5cf6"
            />
            <LeaveCard
              title="Pending"
              value={stats?.stats?.pending || 0}
              icon="⏳"
              color="#f59e0b"
            />
            <LeaveCard
              title="Approved"
              value={stats?.stats?.approved || 0}
              icon="✅"
              color="#10b981"
            />
            <LeaveCard
              title="Rejected"
              value={stats?.stats?.rejected || 0}
              icon="❌"
              color="#ef4444"
            />
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Leave Requests</h2>
            <Link to="/leave-history" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>

          {recentLeaves.length === 0 ? (
            <div className="card">
              <p className="no-data">No pending leave requests</p>
            </div>
          ) : (
            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td className="capitalize">{leave.leaveType}</td>
                      <td>{formatDate(leave.startDate)}</td>
                      <td>{formatDate(leave.endDate)}</td>
                      <td>{leave.numberOfDays}</td>
                      <td>{getStatusBadge(leave.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/apply-leave" className="action-card">
              <span className="action-icon">📝</span>
              <h3>Apply for Leave</h3>
              <p>Submit a new leave request</p>
            </Link>
            <Link to="/leave-history" className="action-card">
              <span className="action-icon">📋</span>
              <h3>Leave History</h3>
              <p>View all your leave requests</p>
            </Link>
            {user?.role !== 'team_member' && (
              <Link to="/manager" className="action-card">
                <span className="action-icon">👥</span>
                <h3>Manager Panel</h3>
                <p>Manage team leave requests</p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
