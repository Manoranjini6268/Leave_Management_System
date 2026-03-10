import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Icon from '../components/Icon';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-left-inner">
          <h2>Streamline your leave management</h2>
          <p>A unified platform for employees, managers, and administrators to handle leave requests efficiently.</p>
          <ul className="auth-feature-list">
            <li><Icon name="check" size={16} color="#fff" /> Apply and track leave in real time</li>
            <li><Icon name="check" size={16} color="#fff" /> Role-based approvals and visibility</li>
            <li><Icon name="check" size={16} color="#fff" /> Department and policy management</li>
            <li><Icon name="check" size={16} color="#fff" /> Automated balance calculations</li>
          </ul>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-mark"><Icon name="building" size={18} color="#fff" /></div>
            <span className="auth-logo-text">Leave Management System</span>
          </div>

          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '8px' }}>
              Sign In
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Create one</Link></p>
          </div>

          <div className="demo-credentials">
            <h4>Demo credentials</h4>
            <p><strong>Admin:</strong> admin@company.com / admin123</p>
            <p><strong>Manager:</strong> manager@company.com / manager123</p>
            <p><strong>Employee:</strong> employee@company.com / employee123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
