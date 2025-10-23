import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import './LeaveHistory.css';

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedLeave, setSelectedLeave] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [filter, leaves]);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('/api/leaves');
      setLeaves(res.data.leaves);
      setFilteredLeaves(res.data.leaves);
    } catch (error) {
      toast.error('Error loading leave history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeaves = () => {
    if (filter === 'all') {
      setFilteredLeaves(leaves);
    } else {
      setFilteredLeaves(leaves.filter(leave => leave.status === filter));
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    try {
      await axios.put(`/api/leaves/${leaveId}/cancel`);
      toast.success('Leave request cancelled successfully');
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error cancelling leave request');
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

  const viewLeaveDetails = (leave) => {
    setSelectedLeave(leave);
  };

  const closeModal = () => {
    setSelectedLeave(null);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading leave history...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="leave-history-container">
        <div className="page-header">
          <h1>Leave History</h1>
          <p>View and manage your leave requests</p>
        </div>

        <div className="filter-section">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({leaves.length})
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({leaves.filter(l => l.status === 'pending').length})
            </button>
            <button
              className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved ({leaves.filter(l => l.status === 'approved').length})
            </button>
            <button
              className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({leaves.filter(l => l.status === 'rejected').length})
            </button>
            <button
              className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled ({leaves.filter(l => l.status === 'cancelled').length})
            </button>
          </div>
        </div>

        {filteredLeaves.length === 0 ? (
          <div className="card">
            <p className="no-data">No leave requests found</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td className="capitalize">{leave.leaveType}</td>
                      <td>{formatDate(leave.startDate)}</td>
                      <td>{formatDate(leave.endDate)}</td>
                      <td>{leave.numberOfDays}</td>
                      <td>{formatDate(leave.appliedAt)}</td>
                      <td>{getStatusBadge(leave.status)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => viewLeaveDetails(leave)}
                          >
                            View
                          </button>
                          {(leave.status === 'pending' || leave.status === 'approved') && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleCancelLeave(leave._id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedLeave && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Leave Request Details</h2>
                <button className="modal-close" onClick={closeModal}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <strong>Leave Type:</strong>
                  <span className="capitalize">{selectedLeave.leaveType}</span>
                </div>
                <div className="detail-row">
                  <strong>Start Date:</strong>
                  <span>{formatDate(selectedLeave.startDate)}</span>
                </div>
                <div className="detail-row">
                  <strong>End Date:</strong>
                  <span>{formatDate(selectedLeave.endDate)}</span>
                </div>
                <div className="detail-row">
                  <strong>Number of Days:</strong>
                  <span>{selectedLeave.numberOfDays}</span>
                </div>
                <div className="detail-row">
                  <strong>Status:</strong>
                  {getStatusBadge(selectedLeave.status)}
                </div>
                <div className="detail-row">
                  <strong>Applied On:</strong>
                  <span>{formatDate(selectedLeave.appliedAt)}</span>
                </div>
                <div className="detail-row">
                  <strong>Reason:</strong>
                  <span>{selectedLeave.reason}</span>
                </div>
                {selectedLeave.approvedBy && (
                  <div className="detail-row">
                    <strong>Approved/Rejected By:</strong>
                    <span>{selectedLeave.approvedBy.firstName} {selectedLeave.approvedBy.lastName}</span>
                  </div>
                )}
                {selectedLeave.rejectionReason && (
                  <div className="detail-row">
                    <strong>Rejection Reason:</strong>
                    <span>{selectedLeave.rejectionReason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LeaveHistory;
