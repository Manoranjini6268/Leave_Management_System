import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import './ApplyLeave.css';

const ApplyLeave = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (start > end) {
      toast.error('End date must be after start date');
      return;
    }

    if (start < new Date()) {
      toast.error('Cannot apply for past dates');
      return;
    }

    const days = calculateDays();
    const balance = user?.leaveBalances?.[formData.leaveType] || 0;
    
    if (formData.leaveType !== 'unpaid' && balance < days) {
      toast.error(`Insufficient ${formData.leaveType} leave balance. Available: ${balance} days`);
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/leaves', formData);
      toast.success('Leave application submitted successfully!');
      navigate('/leave-history');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting leave application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="apply-leave-container">
        <div className="apply-leave-card">
          <h1>Apply for Leave</h1>
          <p className="subtitle">Submit a new leave request</p>

          <div className="leave-balances-summary">
            <h3>Your Leave Balances</h3>
            <div className="balances-grid">
              <div className="balance-item">
                <span className="balance-label">Casual</span>
                <span className="balance-value">{user?.leaveBalances?.casual || 0}</span>
              </div>
              <div className="balance-item">
                <span className="balance-label">Medical</span>
                <span className="balance-value">{user?.leaveBalances?.medical || 0}</span>
              </div>
              <div className="balance-item">
                <span className="balance-label">Earned</span>
                <span className="balance-value">{user?.leaveBalances?.earned || 0}</span>
              </div>
              <div className="balance-item">
                <span className="balance-label">Unpaid</span>
                <span className="balance-value">Unlimited</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="leave-form">
            <div className="form-group">
              <label>Leave Type *</label>
              <select
                name="leaveType"
                className="form-control"
                value={formData.leaveType}
                onChange={handleChange}
                required
              >
                <option value="casual">Casual Leave</option>
                <option value="medical">Medical Leave</option>
                <option value="earned">Earned Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-control"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-control"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {formData.startDate && formData.endDate && (
              <div className="days-info">
                <strong>Total Days:</strong> {calculateDays()} day(s)
              </div>
            )}

            <div className="form-group">
              <label>Reason for Leave *</label>
              <textarea
                name="reason"
                className="form-control"
                placeholder="Please provide a reason for your leave request"
                value={formData.reason}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Leave Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ApplyLeave;
