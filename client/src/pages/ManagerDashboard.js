import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamCalendar, setTeamCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

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
      setTeamCalendar(calendarRes.data.leaves);
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
        <div className="loading">Loading manager dashboard...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="manager-container">
        <div className="page-header">
          <h1>Manager Dashboard</h1>
          <p>Manage team leave requests and view team calendar</p>
        </div>

        <div className="tabs">
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
            Team Members ({teamMembers.length})
          </button>
          <button
            className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Team Calendar ({teamCalendar.length})
          </button>
        </div>

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
                        <th>Employee</th>
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
                          <td>{leave.employee.firstName} {leave.employee.lastName}</td>
                          <td>{leave.employee.employeeId}</td>
                          <td className="capitalize">{leave.leaveType}</td>
                          <td>{formatDate(leave.startDate)}</td>
                          <td>{formatDate(leave.endDate)}</td>
                          <td>{leave.numberOfDays}</td>
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
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Employee ID</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Casual</th>
                      <th>Medical</th>
                      <th>Earned</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <tr key={member._id}>
                        <td>{member.firstName} {member.lastName}</td>
                        <td>{member.employeeId}</td>
                        <td>{member.email}</td>
                        <td className="capitalize">{member.role.replace('_', ' ')}</td>
                        <td>{member.leaveBalances.casual}</td>
                        <td>{member.leaveBalances.medical}</td>
                        <td>{member.leaveBalances.earned}</td>
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
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="tab-content">
            {teamCalendar.length === 0 ? (
              <div className="card">
                <p className="no-data">No approved leaves this month</p>
              </div>
            ) : (
              <div className="card">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee</th>
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
                          <td>{leave.employee.firstName} {leave.employee.lastName}</td>
                          <td className="capitalize">{leave.leaveType}</td>
                          <td>{formatDate(leave.startDate)}</td>
                          <td>{formatDate(leave.endDate)}</td>
                          <td>{leave.numberOfDays}</td>
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
