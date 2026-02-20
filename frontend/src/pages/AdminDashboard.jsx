import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AdminDashboard.css';

// Icons
import {
    FaUsers, FaHotel, FaCalendarAlt, FaMoneyBillWave, FaShieldAlt,
    FaUserShield, FaSignOutAlt, FaHome, FaCheckCircle, FaTimesCircle,
    FaChartBar, FaUserCircle, FaTrash, FaToggleOn, FaToggleOff, FaBed,
    FaSearch, FaLock, FaLockOpen, FaStore
} from 'react-icons/fa';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [bookingFilters, setBookingFilters] = useState({
        status: '',
        startDate: '',
        endDate: ''
    });
    const navigate = useNavigate();

    const fetchOverview = async () => {
        try {
            const response = await api.get('/admin/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching admin stats', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get(`/admin/users?search=${searchTerm}`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    const fetchHotels = async () => {
        try {
            const response = await api.get('/admin/hotels');
            setHotels(response.data);
        } catch (error) {
            console.error('Error fetching hotels', error);
        }
    };

    const fetchVendors = async () => {
        try {
            const response = await api.get('/admin/vendors');
            setVendors(response.data);
        } catch (error) {
            console.error('Error fetching vendors', error);
        }
    };

    const fetchBookings = async () => {
        try {
            const { status, startDate, endDate } = bookingFilters;
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await api.get(`/admin/bookings?${params.toString()}`);
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings', error);
        }
    };

    useEffect(() => {
        const initDashboard = async () => {
            setLoading(true);
            await fetchOverview();
            setLoading(false);
        };
        initDashboard();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'vendors') fetchVendors();
        if (activeTab === 'hotels') fetchHotels();
        if (activeTab === 'bookings') fetchBookings();
        if (activeTab === 'overview') fetchOverview();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'bookings') fetchBookings();
    }, [bookingFilters]);

    const handleToggleHotel = async (hotelId) => {
        try {
            await api.put(`/admin/hotels/${hotelId}/toggle`);
            fetchHotels();
            alert('Hotel status updated');
        } catch (error) {
            alert('Failed to update hotel status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            fetchUsers();
            alert('User deleted');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleToggleBlock = async (userId) => {
        try {
            await api.put(`/admin/users/${userId}/block`);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to toggle block status');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            fetchUsers();
            alert('User role updated');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update user role');
        }
    };

    const handleUpdateVendorStatus = async (vendorId, status) => {
        try {
            await api.put(`/admin/vendors/${vendorId}/status`, { status });
            fetchVendors();
            alert(`Vendor ${status}`);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update vendor status');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f6f8' }}>
            <div style={{ fontSize: '1.5rem', color: '#1a2236', fontWeight: 'bold' }}>Loading Admin Dashboard...</div>
        </div>
    );

    const StatCard = ({ title, value, icon, color }) => (
        <div className="admin-stat-card">
            <div className="admin-stat-icon-wrapper" style={{ background: `${color}20`, color: color }}>
                {icon}
            </div>
            <div className="admin-stat-info">
                <h3>{title}</h3>
                <p className="admin-stat-value">{value}</p>
            </div>
        </div>
    );

    const renderOverview = () => (
        <>
            <div className="admin-top-bar">
                <h1 className="admin-dashboard-title">Admin Overview</h1>
                <div className="admin-profile">
                    <FaUserCircle size={24} color="#1a2236" />
                    <span style={{ fontWeight: '700' }}>System Admin</span>
                </div>
            </div>

            <div className="admin-stats-grid">
                <StatCard title="Total Users" value={stats?.stats?.users || 0} icon={<FaUsers />} color="#3b82f6" />
                <StatCard title="Total Vendors" value={stats?.stats?.vendors || 0} icon={<FaUserShield />} color="#f59e0b" />
                <StatCard title="Total Hotels" value={stats?.stats?.hotels || 0} icon={<FaHotel />} color="#8b5cf6" />
                <StatCard title="Total Rooms" value={stats?.stats?.rooms || 0} icon={<FaBed />} color="#ec4899" />
                <StatCard title="Total Bookings" value={stats?.stats?.bookings || 0} icon={<FaCalendarAlt />} color="#0ea5e9" />
                <StatCard title="Total Revenue" value={`$${stats?.stats?.revenue || 0}`} icon={<FaMoneyBillWave />} color="#10b981" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="admin-section">
                    <h3 className="admin-section-title"><FaUsers /> Recent Users</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.recentUsers?.map(user => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td><span className={`admin-badge badge-${user.role}`}>{user.role}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="admin-section">
                    <h3 className="admin-section-title"><FaHotel /> Recent Hotels</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Location</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.recentHotels?.map(hotel => (
                                <tr key={hotel._id}>
                                    <td>{hotel.name}</td>
                                    <td>{hotel.location}</td>
                                    <td>
                                        <span style={{ color: hotel.isActive ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                                            {hotel.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );

    const renderUsersView = () => (
        <div className="admin-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="admin-section-title" style={{ margin: 0 }}><FaUsers /> User Management</h2>
                <div className="admin-search-wrapper">
                    <FaSearch className="admin-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
                        className="admin-search-input"
                    />
                </div>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Joined</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td style={{ fontWeight: '700' }}>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <select
                                    className="admin-role-select"
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                    disabled={user.role === 'admin'}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td>
                                <span className={`admin-badge ${user.isBlocked ? 'badge-cancelled' : 'badge-confirmed'}`} style={{ background: user.isBlocked ? '#fee2e2' : '#dcfce7', color: user.isBlocked ? '#ef4444' : '#166534' }}>
                                    {user.isBlocked ? 'Blocked' : 'Active'}
                                </span>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button
                                        onClick={() => handleToggleBlock(user._id)}
                                        style={{ background: 'none', border: 'none', color: user.isBlocked ? '#22c55e' : '#f59e0b', cursor: 'pointer', fontSize: '1.2rem' }}
                                        title={user.isBlocked ? "Unblock User" : "Block User"}
                                        disabled={user.role === 'admin'}
                                    >
                                        {user.isBlocked ? <FaLockOpen /> : <FaLock />}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user._id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}
                                        title="Delete User"
                                        disabled={user.role === 'admin'}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderVendorsView = () => (
        <div className="admin-section">
            <h2 className="admin-section-title"><FaStore /> Vendor Management</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Joined</th>
                        <th>Vendor Name</th>
                        <th>Hotels</th>
                        <th>Total Bookings</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vendors.map(vendor => (
                        <tr key={vendor._id}>
                            <td>{new Date(vendor.createdAt).toLocaleDateString()}</td>
                            <td style={{ fontWeight: '700' }}>{vendor.name}</td>
                            <td>{vendor.hotelCount}</td>
                            <td>{vendor.bookingCount}</td>
                            <td>
                                <span className={`admin-badge`} style={{
                                    background: vendor.vendorStatus === 'approved' ? '#dcfce7' : vendor.vendorStatus === 'rejected' ? '#fee2e2' : '#fef3c7',
                                    color: vendor.vendorStatus === 'approved' ? '#166534' : vendor.vendorStatus === 'rejected' ? '#991b1b' : '#92400e'
                                }}>
                                    {vendor.vendorStatus}
                                </span>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        className="admin-action-btn approve"
                                        onClick={() => handleUpdateVendorStatus(vendor._id, 'approved')}
                                        disabled={vendor.vendorStatus === 'approved'}
                                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="admin-action-btn reject"
                                        onClick={() => handleUpdateVendorStatus(vendor._id, 'rejected')}
                                        disabled={vendor.vendorStatus === 'rejected'}
                                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleToggleBlock(vendor._id)}
                                        style={{ background: 'none', border: 'none', color: vendor.isBlocked ? '#22c55e' : '#f59e0b', cursor: 'pointer', fontSize: '1.2rem' }}
                                        title={vendor.isBlocked ? "Unblock User" : "Suspend Vendor"}
                                    >
                                        {vendor.isBlocked ? <FaLockOpen /> : <FaLock />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    const renderHotelsView = () => (
        <div className="admin-section">
            <h2 className="admin-section-title"><FaHotel /> Hotel Management</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Hotel Name</th>
                        <th>Location</th>
                        <th>Vendor ID</th>
                        <th>Status</th>
                        <th>Toggle Status</th>
                    </tr>
                </thead>
                <tbody>
                    {hotels.map(hotel => (
                        <tr key={hotel._id}>
                            <td style={{ fontWeight: '700' }}>{hotel.name}</td>
                            <td>{hotel.location}</td>
                            <td>{hotel.vendorId.substring(0, 8)}...</td>
                            <td>
                                <span style={{
                                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                                    background: hotel.isActive ? '#dcfce7' : '#fee2e2',
                                    color: hotel.isActive ? '#166534' : '#991b1b'
                                }}>
                                    {hotel.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td>
                                <button
                                    onClick={() => handleToggleHotel(hotel._id)}
                                    style={{ background: 'none', border: 'none', color: hotel.isActive ? '#10b981' : '#64748b', cursor: 'pointer', fontSize: '1.5rem' }}
                                >
                                    {hotel.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderBookingsView = () => (
        <div className="admin-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="admin-section-title" style={{ margin: 0 }}><FaCalendarAlt /> Booking Oversight</h2>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <select
                        className="admin-role-select"
                        value={bookingFilters.status}
                        onChange={(e) => setBookingFilters({ ...bookingFilters, status: e.target.value })}
                    >
                        <option value="">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="pending">Pending</option>
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '5px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>From:</span>
                        <input
                            type="date"
                            style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', fontWeight: 'bold' }}
                            value={bookingFilters.startDate}
                            onChange={(e) => setBookingFilters({ ...bookingFilters, startDate: e.target.value })}
                        />
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>To:</span>
                        <input
                            type="date"
                            style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', fontWeight: 'bold' }}
                            value={bookingFilters.endDate}
                            onChange={(e) => setBookingFilters({ ...bookingFilters, endDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Hotel</th>
                        <th>Room</th>
                        <th>Status</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(booking => (
                        <tr key={booking._id}>
                            <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                            <td style={{ fontSize: '0.8rem', color: '#64748b' }}>#{booking._id.substring(18).toUpperCase()}</td>
                            <td style={{ fontWeight: '700' }}>
                                <div>{booking.userId?.name || 'Unknown'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '400' }}>{booking.userId?.email}</div>
                            </td>
                            <td>
                                <div style={{ fontWeight: '600' }}>{booking.hotelId?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{booking.hotelId?.location}</div>
                            </td>
                            <td>{booking.roomId?.type || 'Standard'}</td>
                            <td>
                                <span className={`admin-badge`} style={{
                                    background: booking.status === 'confirmed' ? '#dcfce7' : booking.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                                    color: booking.status === 'confirmed' ? '#166534' : booking.status === 'cancelled' ? '#991b1b' : '#92400e'
                                }}>
                                    {booking.status}
                                </span>
                            </td>
                            <td style={{ fontWeight: '800', color: '#1e293b' }}>${booking.totalPrice}</td>
                        </tr>
                    ))}
                    {bookings.length === 0 && (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No bookings found for the selected criteria.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="admin-dashboard-container">
            <div className="admin-sidebar">
                <div className="admin-sidebar-header">Staybook Admin</div>
                <ul className="admin-sidebar-menu">
                    <li className={`admin-sidebar-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                        <FaHome className="admin-sidebar-icon" /> Dashboard
                    </li>
                    <li className={`admin-sidebar-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <FaUsers className="admin-sidebar-icon" /> Manage Users
                    </li>
                    <li className={`admin-sidebar-item ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => setActiveTab('vendors')}>
                        <FaStore className="admin-sidebar-icon" /> Manage Vendors
                    </li>
                    <li className={`admin-sidebar-item ${activeTab === 'hotels' ? 'active' : ''}`} onClick={() => setActiveTab('hotels')}>
                        <FaHotel className="admin-sidebar-icon" /> Manage Hotels
                    </li>
                    <li className={`admin-sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                        <FaCalendarAlt className="admin-sidebar-icon" /> All Bookings
                    </li>
                    <li className="admin-sidebar-item" onClick={handleLogout} style={{ marginTop: 'auto', color: '#ff6b6b' }}>
                        <FaSignOutAlt className="admin-sidebar-icon" /> Logout
                    </li>
                </ul>
            </div>

            <div className="admin-main-content">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'users' && renderUsersView()}
                {activeTab === 'vendors' && renderVendorsView()}
                {activeTab === 'hotels' && renderHotelsView()}
                {activeTab === 'bookings' && renderBookingsView()}
            </div>
        </div>
    );
};

export default AdminDashboard;
