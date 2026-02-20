// Registration Component Fix
import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            console.log('Sending registration data:', formData);
            const { data } = await api.post('/auth/register', formData);

            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: data.role }));

            if (data.role === 'admin') navigate('/admin/dashboard');
            else if (data.role === 'vendor') navigate('/vendor/dashboard');
            else navigate('/customer/dashboard');
        } catch (err) {
            console.error('Registration Error:', err);
            // Capture specific error message from backend
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2 className="auth-title">Staybook v2.0</h2>
                    <p className="auth-subtitle">Join us for your next adventure</p>
                </div>

                {error && <div style={{ color: '#ef4444', marginBottom: '15px', fontWeight: '500', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="you@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Minimum 6 characters"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="role">Register As</label>
                        <select
                            id="role"
                            name="role"
                            className="form-select form-input"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="customer">Customer</option>
                            <option value="vendor">Hotel Vendor</option>
                        </select>
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <div className="auth-footer">
                        Already have an account?
                        <Link to="/login" className="auth-link">Login Here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
