import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error on typing
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            console.log('Attempting login with:', formData.email);
            const { data } = await api.post('/auth/login', formData);

            console.log('Login successful:', data);

            // Store in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role); // Store role separately for easy access
            localStorage.setItem('user', JSON.stringify({
                _id: data._id,
                name: data.name,
                email: data.email,
                role: data.role
            }));

            // Redirect based on role
            if (data.role === 'admin') navigate('/admin/dashboard');
            else if (data.role === 'vendor') navigate('/vendor/dashboard');
            else navigate('/customer/dashboard');

        } catch (err) {
            console.error('Login failed:', err);

            // Set specific error message from backend if available
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err.code === 'ERR_NETWORK') {
                setError('Network Error: Server is unreachable. Please ensure the backend is running.');
            } else {
                setError(`Error: ${err.message || 'Unknown error occurred'}`);
                console.error('Full Error Object:', err);
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2 className="auth-title">Staybook</h2>
                    <p className="auth-subtitle">Welcome back to your luxury experience</p>
                </div>

                {error && <div className="auth-error" style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
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
                            placeholder="Enter your email"
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
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="auth-button">
                        Sign In
                    </button>

                    <div className="auth-footer">
                        Don't have an account?
                        <Link to="/register" className="auth-link">Register Now</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
