import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Icon from '../components/Icon';
import { toast } from 'react-toastify';
import { formatDate, leaveTypeLabel } from '../utils/helpers';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamCalendar, setTeamCalendar] = useState([]);
  const [onLeaveToday, setOnLeaveToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Role-based configuration
  const isTeamLeader = user?.role === 'team_leader';
  const isTeamManager = user?.role === 'team_manager';
  const isGeneralManager = user?.role === 'general_manager';

  const getPageTitle = () => {
    if (isTeamLeader) return 'Team Leader Panel';
    if (isTeamManager) return 'Team Manager Dashboard';
    return 'General Manager Dashboard';
  };

  const getPageIcon = () => {
    if (isTeamLeader) return 'briefcase';
    if (isTeamManager) return 'users';
    return 'settings';
  };

  const getPageDescription = () => {
    if (isTeamLeader) return `Manage your direct reports' leave requests - Team Members: ${teamMembers.length}`;
    if (isTeamManager) return `Manage department leave requests - Team Members: ${teamMembers.length}`;
    return 'Manage all organizational leave requests';
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      const [pendingRes, membersRes, calendarRes] = await Promise.all([
        axios.get('/api/manager/pending'),
        axios.get('/api/manager/team-members'),
        axios.get('/api/manager/team-calendar')
      ]);

      setPendingLeaves(pendingRes.data.leaves);
      setTeamMembers(membersRes.data.teamMembers);

      const calendarLeaves = calendarRes.data.leaves;
      setTeamCalendar(calendarLeaves);

      // Compute who is on leave today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOnLeave = calendarLeaves.filter(l => {
        const s = new Date(l.startDate); s.setHours(0,0,0,0);
        const e = new Date(l.endDate);   e.setHours(0,0,0,0);
        return s <= today && e >= today;
      });
      setOnLeaveToday(todayOnLeave);
    } catch (error) {
      toast.error('Error loading manager data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    if (!window.confirm('Are you sure you want to approve this leave request?')) {
      return;
    }

    try {
      await axios.put(`/api/manager/approve/${leaveId}`);
      toast.success('Leave request approved successfully');
      fetchManagerData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error approving leave request');
    }
  };

  const handleReject = async (leaveId) => {
    setSelectedLeave(leaveId);
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await axios.put(`/api/manager/reject/${selectedLeave}`, {
        reason: rejectionReason
      });
      toast.success('Leave request rejected');
      setSelectedLeave(null);
      setRejectionReason('');
      fetchManagerData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error rejecting leave request');
    }
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
      <div className="manager-container">
        <div className="page-header">
          <div>
            <h1><Icon name={getPageIcon()} size={20} /> {getPageTitle()}</h1>
            <p>{getPageDescription()}</p>
          </div>
        </div>

        <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-value">{pendingLeaves.length}</div>
              <div className="stat-label">Pending Requests</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{teamMembers.length}</div>
              <div className="stat-label">{isTeamLeader ? 'Direct Reports' : 'Team Members'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{onLeaveToday.length}</div>
              <div className="stat-label">On Leave Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{teamCalendar.length}</div>
              <div className="stat-label">Approved This Month</div>
            </div>
          </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            On Leave Today ({onLeaveToday.length})
          </button>
          <button
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests ({pendingLeaves.length})
          </button>
          <button
            className={`tab ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            {isTeamLeader ? 'Team Members' : 'Team'} ({teamMembers.length})
          </button>
          <button
            className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Team Calendar ({teamCalendar.length})
          </button>
        </div>

        {activeTab === 'today' && (
          <div className="tab-content">
            {onLeaveToday.length === 0 ? (
              <div className="card">
                <p className="no-data">No team members are on approved leave today</p>
              </div>
            ) : (
              <div className="card">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Leave Type</th>
                        <th>Return Date</th>
                        <th>Days Remaining</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {onLeaveToday.map((leave) => {
                        const end = new Date(leave.endDate);
                        const today = new Date(); today.setHours(0,0,0,0); end.setHours(0,0,0,0);
                        const remaining = Math.round((end - today) / (1000*60*60*24)) + 1;
                        return (
                          <tr key={leave._id}>
                            <td><strong>{leave.employee.firstName} {leave.employee.lastName}</strong></td>
                            <td><span className="badge badge-approved">{leaveTypeLabel(leave.leaveType)}</span></td>
                            <td>{formatDate(leave.endDate)}</td>
                            <td><span className="badge badge-pending">{remaining} day{remaining !== 1 ? 's' : ''}</span></td>
                            <td><div className="reason-cell" title={leave.reason}>{leave.reason.substring(0,50)}{leave.reason.length > 50 ? '...' : ''}</div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="tab-content">
            {pendingLeaves.length === 0 ? (
              <div className="card">
                <p className="no-data">No pending leave requests</p>
              </div>
            ) : (
              <div className="card">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{isTeamLeader ? 'Team Member' : 'Employee'}</th>
                        <th>Employee ID</th>
                        <th>Leave Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Days</th>
                        <th>Reason</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingLeaves.map((leave) => (
                        <tr key={leave._id}>
                          <td><strong>{leave.employee.firstName} {leave.employee.lastName}</strong></td>
                          <td>{leave.employee.employeeId}</td>
                          <td>{leaveTypeLabel(leave.leaveType)}</td>
                          <td>{formatDate(leave.startDate)}</td>
                          <td>{formatDate(leave.endDate)}</td>
                          <td><span className="badge badge-info">{leave.numberOfDays} days</span></td>
                          <td>
                            <div className="reason-cell" title={leave.reason}>
                              {leave.reason.substring(0, 50)}
                              {leave.reason.length > 50 ? '...' : ''}
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleApprove(leave._id)}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleReject(leave._id)}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'team' && (
          <div className="tab-content">
            <div className="card">
              {teamMembers.length === 0 ? (
                <p className="no-data">No team members assigned</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Employee ID</th>
                        <th>Email</th>
                        {!isTeamLeader && <th>Role</th>}
                        <th>Casual</th>
                        <th>Medical</th>
                        <th>Earned</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member) => (
                        <tr key={member._id}>
                          <td><strong>{member.firstName} {member.lastName}</strong></td>
                          <td>{member.employeeId}</td>
                          <td>{member.email}</td>
                          {!isTeamLeader && <td className="capitalize">{member.role.replace(/_/g, ' ')}</td>}
                          <td className="balance-cell">{member.leaveBalances.casual}</td>
                          <td className="balance-cell">{member.leaveBalances.medical}</td>
                          <td className="balance-cell">{member.leaveBalances.earned}</td>
                          <td>
                            <span className={`badge ${member.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                              {member.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="tab-content">
            {teamCalendar.length === 0 ? (
              <div className="card">
                <p className="no-data">No approved leaves scheduled this month</p>
              </div>
            ) : (
              <div className="card">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{isTeamLeader ? 'Team Member' : 'Employee'}</th>
                        <th>Leave Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Days</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamCalendar.map((leave) => (
                        <tr key={leave._id}>
                          <td><strong>{leave.employee.firstName} {leave.employee.lastName}</strong></td>
                          <td><span className="badge badge-info">{leaveTypeLabel(leave.leaveType)}</span></td>
                          <td>{formatDate(leave.startDate)}</td>
                          <td>{formatDate(leave.endDate)}</td>
                          <td>{leave.numberOfDays} days</td>
                          <td>
                            <div className="reason-cell" title={leave.reason}>
                              {leave.reason.substring(0, 50)}
                              {leave.reason.length > 50 ? '...' : ''}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedLeave && (
          <div className="modal-overlay" onClick={() => setSelectedLeave(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Reject Leave Request</h2>
                <button className="modal-close" onClick={() => setSelectedLeave(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Reason for Rejection *</label>
                  <textarea
                    className="form-control"
                    placeholder="Please provide a reason for rejecting this leave request"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="4"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedLeave(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={submitRejection}
                  >
                    Reject Leave
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManagerDashboard;
