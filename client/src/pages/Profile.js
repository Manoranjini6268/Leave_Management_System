import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Icon from '../components/Icon';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { formatDate, capitalise } from '../utils/helpers';
import './Profile.css';

const Profile = () => {
  const { user: authUser, login } = useContext(AuthContext);

  const [profile, setProfile]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [editMode, setEditMode]           = useState(false);
  const [saving, setSaving]               = useState(false);
  const [changingPw, setChangingPw]       = useState(false);
  const [savingPw, setSavingPw]           = useState(false);

  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [pwData, setPwData]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/users/profile');
      setProfile(res.data.user);
      const { firstName, lastName, email } = res.data.user;
      setFormData({ firstName, lastName, email });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put('/api/users/profile', formData);
      setProfile(res.data.user);
      setEditMode(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPw(true);
    try {
      await axios.put('/api/users/change-password', {
        currentPassword: pwData.currentPassword,
        newPassword:     pwData.newPassword
      });
      toast.success('Password changed successfully');
      setChangingPw(false);
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error changing password');
    } finally {
      setSavingPw(false);
    }
  };

  const roleLabel = (role) =>
    role
      ? role.split('_').map(capitalise).join(' ')
      : '';

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading profile...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">

        {/* ── Header ── */}
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <div>
            <h1>{profile.firstName} {profile.lastName}</h1>
            <p className="profile-subtitle">
              <span className="role-badge">{roleLabel(profile.role)}</span>
              {profile.department?.name && (
                <span className="dept-badge">{profile.department.name}</span>
              )}
            </p>
          </div>
        </div>

        <div className="profile-grid">

          {/* ── Info card ── */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h2>Personal Information</h2>
              {!editMode && (
                <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(true)}>
                  <Icon name="pencil" size={13} /> Edit
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleProfileSave}>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      className="form-control"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      className="form-control"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Employee ID</span>
                  <span className="info-value">{profile.employeeId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{profile.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Role</span>
                  <span className="info-value">{roleLabel(profile.role)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <span className="info-value">{profile.department?.name || '—'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Manager</span>
                  <span className="info-value">
                    {profile.manager
                      ? `${profile.manager.firstName} ${profile.manager.lastName}`
                      : '—'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Joining Date</span>
                  <span className="info-value">{formatDate(profile.joiningDate)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Account Status</span>
                  <span className={`badge ${profile.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Leave balances card ── */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h2>Leave Balances</h2>
              <span className="year-label">{new Date().getFullYear()}</span>
            </div>
            <div className="balance-grid">
              {[
                { type: 'casual',  icon: 'sun',          label: 'Casual',  color: '#2563eb' },
                { type: 'medical', icon: 'heart',        label: 'Medical', color: '#dc2626' },
                { type: 'earned',  icon: 'award',        label: 'Earned',  color: '#16a34a' },
                { type: 'unpaid',  icon: 'dollar-sign',  label: 'Unpaid',  color: '#d97706' },
              ].map(({ type, icon, label, color }) => (
                <div className="balance-item" key={type} style={{ borderLeftColor: color }}>
                  <span className="balance-icon" style={{ color }}><Icon name={icon} size={18} color={color} /></span>
                  <div>
                    <div className="balance-value" style={{ color }}>
                      {profile.leaveBalances?.[type] ?? 0}
                    </div>
                    <div className="balance-type">{label} Leave</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Change password card ── */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h2>Security</h2>
              {!changingPw && (
                <button className="btn btn-secondary btn-sm" onClick={() => setChangingPw(true)}>
                  <Icon name="key" size={13} /> Change Password
                </button>
              )}
            </div>

            {changingPw ? (
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pwData.currentPassword}
                    onChange={e => setPwData({ ...pwData, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pwData.newPassword}
                    onChange={e => setPwData({ ...pwData, newPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={pwData.confirmPassword}
                    onChange={e => setPwData({ ...pwData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setChangingPw(false); setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={savingPw}>
                    {savingPw ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="security-hint">
                Use a strong password that you don't use elsewhere. Minimum 6 characters.
              </p>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Profile;
