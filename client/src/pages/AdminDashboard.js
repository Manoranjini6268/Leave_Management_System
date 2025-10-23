import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersRes, deptsRes, policiesRes, reportRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/departments'),
        axios.get('/api/admin/policies'),
        axios.get('/api/admin/reports')
      ]);

      setUsers(usersRes.data.users);
      setDepartments(deptsRes.data.departments);
      setPolicies(policiesRes.data.policies);
      setReport(reportRes.data.report);
    } catch (error) {
      toast.error('Error loading admin data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, data = {}) => {
    setModalType(type);
    setFormData(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/users', formData);
      toast.success('User created successfully');
      closeModal();
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/users/${formData._id}`, formData);
      toast.success('User updated successfully');
      closeModal();
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) {
      return;
    }
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      toast.success('User deactivated successfully');
      fetchAdminData();
    } catch (error) {
      toast.error('Error deactivating user');
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/departments', formData);
      toast.success('Department created successfully');
      closeModal();
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating department');
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/policies', formData);
      toast.success('Policy created successfully');
      closeModal();
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating policy');
    }
  };

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/policies/${formData._id}`, formData);
      toast.success('Policy updated successfully');
      closeModal();
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating policy');
    }
  };

  const handleResetBalances = async () => {
    if (!window.confirm('Are you sure you want to reset all leave balances? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.post('/api/admin/reset-balances', {
        casual: 12,
        medical: 12,
        earned: 15
      });
      toast.success('Leave balances reset successfully');
      fetchAdminData();
    } catch (error) {
      toast.error('Error resetting leave balances');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading admin dashboard...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="admin-container">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Manage organization settings and configurations</p>
        </div>

        {report && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Employees</h3>
                <p className="stat-value">{report.totalEmployees}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏢</div>
              <div className="stat-content">
                <h3>Departments</h3>
                <p className="stat-value">{report.totalDepartments}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Total Leaves</h3>
                <p className="stat-value">{report.leaveStatistics.total}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>Pending Requests</h3>
                <p className="stat-value">{report.leaveStatistics.pending}</p>
              </div>
            </div>
          </div>
        )}

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({users.length})
          </button>
          <button
            className={`tab ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            Departments ({departments.length})
          </button>
          <button
            className={`tab ${activeTab === 'policies' ? 'active' : ''}`}
            onClick={() => setActiveTab('policies')}
          >
            Leave Policies ({policies.length})
          </button>
          <button
            className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>User Management</h2>
              <button className="btn btn-primary" onClick={() => openModal('createUser')}>
                Add New User
              </button>
            </div>
            <div className="card">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Employee ID</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.employeeId}</td>
                        <td>{user.email}</td>
                        <td className="capitalize">{user.role.replace('_', ' ')}</td>
                        <td>{user.department?.name || 'N/A'}</td>
                        <td>
                          <span className={`badge ${user.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => openModal('editUser', user)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              Deactivate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Department Management</h2>
              <button className="btn btn-primary" onClick={() => openModal('createDepartment')}>
                Add New Department
              </button>
            </div>
            <div className="card">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Manager</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => (
                      <tr key={dept._id}>
                        <td>{dept.name}</td>
                        <td>{dept.code}</td>
                        <td>
                          {dept.manager 
                            ? `${dept.manager.firstName} ${dept.manager.lastName}` 
                            : 'Not Assigned'}
                        </td>
                        <td>{dept.description || 'N/A'}</td>
                        <td>
                          <span className={`badge ${dept.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                            {dept.isActive ? 'Active' : 'Inactive'}
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

        {activeTab === 'policies' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Leave Policy Management</h2>
              <button className="btn btn-primary" onClick={() => openModal('createPolicy')}>
                Add New Policy
              </button>
            </div>
            <div className="card">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Leave Type</th>
                      <th>Annual Quota</th>
                      <th>Max Consecutive Days</th>
                      <th>Requires Approval</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policies.map((policy) => (
                      <tr key={policy._id}>
                        <td>{policy.name}</td>
                        <td className="capitalize">{policy.leaveType}</td>
                        <td>{policy.annualQuota}</td>
                        <td>{policy.maxConsecutiveDays || 'N/A'}</td>
                        <td>{policy.requiresApproval ? 'Yes' : 'No'}</td>
                        <td>
                          <span className={`badge ${policy.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                            {policy.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => openModal('editPolicy', policy)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && report && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Organization Reports</h2>
              <button className="btn btn-warning" onClick={handleResetBalances}>
                Reset All Leave Balances
              </button>
            </div>
            
            <div className="reports-grid">
              <div className="report-card">
                <h3>Leave Statistics ({report.year})</h3>
                <div className="report-stats">
                  <div className="report-stat">
                    <span className="label">Total Leaves:</span>
                    <span className="value">{report.leaveStatistics.total}</span>
                  </div>
                  <div className="report-stat">
                    <span className="label">Approved:</span>
                    <span className="value text-success">{report.leaveStatistics.approved}</span>
                  </div>
                  <div className="report-stat">
                    <span className="label">Pending:</span>
                    <span className="value text-warning">{report.leaveStatistics.pending}</span>
                  </div>
                  <div className="report-stat">
                    <span className="label">Rejected:</span>
                    <span className="value text-danger">{report.leaveStatistics.rejected}</span>
                  </div>
                </div>
              </div>

              <div className="report-card">
                <h3>Leave Days by Type</h3>
                <div className="report-stats">
                  <div className="report-stat">
                    <span className="label">Casual Leave:</span>
                    <span className="value">{report.leaveStatistics.byType.casual} days</span>
                  </div>
                  <div className="report-stat">
                    <span className="label">Medical Leave:</span>
                    <span className="value">{report.leaveStatistics.byType.medical} days</span>
                  </div>
                  <div className="report-stat">
                    <span className="label">Earned Leave:</span>
                    <span className="value">{report.leaveStatistics.byType.earned} days</span>
                  </div>
                  <div className="report-stat">
                    <span className="label">Unpaid Leave:</span>
                    <span className="value">{report.leaveStatistics.byType.unpaid} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {modalType === 'createUser' && 'Create New User'}
                  {modalType === 'editUser' && 'Edit User'}
                  {modalType === 'createDepartment' && 'Create New Department'}
                  {modalType === 'createPolicy' && 'Create New Policy'}
                  {modalType === 'editPolicy' && 'Edit Policy'}
                </h2>
                <button className="modal-close" onClick={closeModal}>&times;</button>
              </div>
              <div className="modal-body">
                {(modalType === 'createUser' || modalType === 'editUser') && (
                  <form onSubmit={modalType === 'createUser' ? handleCreateUser : handleUpdateUser}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          className="form-control"
                          value={formData.firstName || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          className="form-control"
                          value={formData.lastName || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Employee ID *</label>
                        <input
                          type="text"
                          name="employeeId"
                          className="form-control"
                          value={formData.employeeId || ''}
                          onChange={handleInputChange}
                          required
                          disabled={modalType === 'editUser'}
                        />
                      </div>
                      <div className="form-group">
                        <label>Role *</label>
                        <select
                          name="role"
                          className="form-control"
                          value={formData.role || 'team_member'}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="team_member">Team Member</option>
                          <option value="team_leader">Team Leader</option>
                          <option value="team_manager">Team Manager</option>
                          <option value="general_manager">General Manager</option>
                        </select>
                      </div>
                    </div>
                    {modalType === 'createUser' && (
                      <div className="form-group">
                        <label>Password *</label>
                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          value={formData.password || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    )}
                    <div className="form-group">
                      <label>Department</label>
                      <select
                        name="department"
                        className="form-control"
                        value={formData.department?._id || formData.department || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="btn btn-secondary" onClick={closeModal}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {modalType === 'createUser' ? 'Create User' : 'Update User'}
                      </button>
                    </div>
                  </form>
                )}

                {modalType === 'createDepartment' && (
                  <form onSubmit={handleCreateDepartment}>
                    <div className="form-group">
                      <label>Department Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Department Code *</label>
                      <input
                        type="text"
                        name="code"
                        className="form-control"
                        value={formData.code || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        className="form-control"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="btn btn-secondary" onClick={closeModal}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Create Department
                      </button>
                    </div>
                  </form>
                )}

                {(modalType === 'createPolicy' || modalType === 'editPolicy') && (
                  <form onSubmit={modalType === 'createPolicy' ? handleCreatePolicy : handleUpdatePolicy}>
                    <div className="form-group">
                      <label>Policy Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Leave Type *</label>
                        <select
                          name="leaveType"
                          className="form-control"
                          value={formData.leaveType || 'casual'}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="casual">Casual</option>
                          <option value="medical">Medical</option>
                          <option value="earned">Earned</option>
                          <option value="unpaid">Unpaid</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Annual Quota *</label>
                        <input
                          type="number"
                          name="annualQuota"
                          className="form-control"
                          value={formData.annualQuota || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Max Consecutive Days</label>
                      <input
                        type="number"
                        name="maxConsecutiveDays"
                        className="form-control"
                        value={formData.maxConsecutiveDays || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        className="form-control"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="btn btn-secondary" onClick={closeModal}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {modalType === 'createPolicy' ? 'Create Policy' : 'Update Policy'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
