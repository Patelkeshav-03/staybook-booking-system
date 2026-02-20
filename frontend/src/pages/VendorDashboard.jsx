import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './VendorDashboard.css';

// Icons
import {
    FaHotel, FaBed, FaCalendarAlt, FaMoneyBillWave,
    FaCheckCircle, FaExclamationCircle, FaChartPie, FaUserCircle, FaTimesCircle,
    FaHome, FaList, FaCog, FaSignOutAlt
} from 'react-icons/fa';

// Charts
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const VendorDashboard = () => {
    const getStoredVendorSettings = () => {
        try {
            const raw = localStorage.getItem('vendorSettings');
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            return {};
        }
    };

    const getStoredUser = () => {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            return {};
        }
    };

    const persistedSettings = getStoredVendorSettings();
    const storedUser = getStoredUser();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    // State for Hotel Management
    const [hotelForm, setHotelForm] = useState({ name: '', location: '', description: '' });
    const [showAddHotel, setShowAddHotel] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedHotelId, setSelectedHotelId] = useState('');
    const [roomsByHotel, setRoomsByHotel] = useState({});
    const [roomForm, setRoomForm] = useState({
        type: 'Standard',
        price: '',
        capacity: '',
        quantity: '',
        available: ''
    });
    const [editingRoomId, setEditingRoomId] = useState(null);
    const [bookingFilters, setBookingFilters] = useState({ fromDate: '', toDate: '', status: 'all' });
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [profileForm, setProfileForm] = useState({
        name: persistedSettings?.profile?.name || storedUser?.name || '',
        email: persistedSettings?.profile?.email || storedUser?.email || '',
        phone: persistedSettings?.profile?.phone || storedUser?.phone || '',
        companyName: persistedSettings?.profile?.companyName || storedUser?.companyName || ''
    });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [bankForm, setBankForm] = useState({
        accountHolder: persistedSettings?.bank?.accountHolder || '',
        bankName: persistedSettings?.bank?.bankName || '',
        accountNumber: persistedSettings?.bank?.accountNumber || '',
        ifscCode: persistedSettings?.bank?.ifscCode || '',
        upiId: persistedSettings?.bank?.upiId || ''
    });
    const [payoutForm, setPayoutForm] = useState({
        method: persistedSettings?.payout?.method || 'bank_transfer',
        frequency: persistedSettings?.payout?.frequency || 'weekly',
        minimumAmount: persistedSettings?.payout?.minimumAmount || '1000',
        autoPayout: persistedSettings?.payout?.autoPayout ?? true,
        payoutDay: persistedSettings?.payout?.payoutDay || 'monday'
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/vendor/stats');
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        if (!stats?.hotels?.length) return;

        if (!selectedHotelId) {
            setSelectedHotelId(stats.hotels[0]._id);
        }

        if (Object.keys(roomsByHotel).length) return;

        const extracted = stats.hotels.reduce((acc, hotel) => {
            const normalizedRooms = (hotel.rooms || []).map((room, index) => {
                const quantity = Number(room.quantity ?? room.totalRooms ?? room.total ?? 0);
                const available = Number(room.available ?? room.availableRooms ?? quantity);
                const safeAvailable = Math.max(0, Math.min(available, quantity || available));
                return {
                    id: room._id || `${hotel._id}-room-${index}`,
                    type: room.type || room.roomType || 'Standard',
                    price: Number(room.price || 0),
                    capacity: Number(room.capacity || room.maxGuests || 1),
                    quantity,
                    available: safeAvailable
                };
            });
            acc[hotel._id] = normalizedRooms;
            return acc;
        }, {});

        setRoomsByHotel(extracted);
    }, [stats, selectedHotelId, roomsByHotel]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return <div className="loading-screen">Loading Dashboard...</div>;

    const renderSidebar = () => (
        <div className="sidebar">
            <div className="sidebar-header">Staybook Vendor</div>
            <ul className="sidebar-menu">
                <li className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                    <FaHome className="sidebar-icon" /> Dashboard
                </li>
                <li className={`sidebar-item ${activeTab === 'hotels' ? 'active' : ''}`} onClick={() => setActiveTab('hotels')}>
                    <FaHotel className="sidebar-icon" /> My Hotels
                </li>
                <li className={`sidebar-item ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
                    <FaBed className="sidebar-icon" /> Rooms
                </li>
                <li className={`sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                    <FaCalendarAlt className="sidebar-icon" /> Bookings
                </li>
                <li className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                    <FaCog className="sidebar-icon" /> Settings
                </li>
                <li className="sidebar-item" onClick={handleLogout} style={{ marginTop: 'auto', color: '#ff6b6b' }}>
                    <FaSignOutAlt className="sidebar-icon" /> Logout
                </li>
            </ul>
        </div>
    );

    const StatCard = ({ title, value, icon, color }) => (
        <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: `${color}20`, color: color }}>
                {icon}
            </div>
            <div className="stat-info">
                <h3>{title}</h3>
                <p className="stat-value">{value}</p>
            </div>
        </div>
    );

    const renderOverview = () => (
        <>
            <div className="top-bar">
                <h1 className="dashboard-title">Dashboard Overview</h1>
                <div className="vendor-profile">
                    <FaUserCircle size={24} />
                    <span style={{ fontWeight: '700' }}>Vendor Admin</span>
                </div>
            </div>

            <div className="stats-grid">
                <StatCard title="Total Hotels" value={stats?.summary?.totalHotels || 0} icon={<FaHotel />} color="#3b82f6" />
                <StatCard title="Total Rooms" value={stats?.summary?.totalRooms || 0} icon={<FaBed />} color="#8b5cf6" />
                <StatCard title="Total Bookings" value={stats?.summary?.totalBookings || 0} icon={<FaCalendarAlt />} color="#0ea5e9" />
                <StatCard title="Confirmed Bookings" value={stats?.summary?.confirmedBookings || 0} icon={<FaCheckCircle />} color="#10b981" />
                <StatCard title="Cancelled Bookings" value={stats?.summary?.cancelledBookings || 0} icon={<FaTimesCircle />} color="#ef4444" />
                <StatCard title="Total Revenue" value={`$${stats?.summary?.totalEarnings || 0}`} icon={<FaMoneyBillWave />} color="#f59e0b" />
            </div>

            <div className="charts-section">
                <h3 className="chart-title">Revenue Analytics</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={stats?.revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="earnings" stroke="#c5a059" strokeWidth={3} dot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bookings-section">
                <h3 className="chart-title">Recent Bookings</h3>
                <table className="bookings-table">
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Guest Name</th>
                            <th>Status</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats?.recentBookings?.length > 0 ? (
                            stats.recentBookings.map((booking) => (
                                <tr key={booking._id}>
                                    <td>{booking._id.substring(0, 8)}...</td>
                                    <td>{booking.user?.name || 'Guest'}</td>
                                    <td>
                                        <span className={`status-badge status-${booking.status}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td>${booking.totalAmount}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center' }}>No recent bookings found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...hotelForm,
                amenities: hotelForm.amenities.split(',').map(item => item.trim()).filter(i => i), // Clean array
                images: hotelForm.images.split(',').map(item => item.trim()).filter(i => i)
            };

            if (editingId) {
                await api.put(`/vendor/hotels/${editingId}`, payload);
                alert('Hotel updated successfully!');
            } else {
                await api.post('/vendor/hotels', payload);
                alert('Hotel added successfully!');
            }

            resetForm();
            // Refresh stats
            const { data } = await api.get('/vendor/stats');
            setStats(data);
        } catch (error) {
            console.error('Error saving hotel', error);
            alert('Failed to save hotel');
        }
    };

    const resetForm = () => {
        setHotelForm({ name: '', location: '', description: '', amenities: '', images: '', isActive: true });
        setShowAddHotel(false);
        setEditingId(null);
    };

    const handleStartEdit = (hotel) => {
        setHotelForm({
            name: hotel.name,
            location: hotel.location,
            description: hotel.description,
            amenities: hotel.amenities ? hotel.amenities.join(', ') : '',
            images: hotel.images ? hotel.images.join(', ') : '',
            isActive: hotel.isActive
        });
        setEditingId(hotel._id);
        setShowAddHotel(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteHotel = async (hotelId) => {
        if (!window.confirm('Are you sure you want to remove this hotel? All associated rooms and bookings might be affected.')) return;
        try {
            await api.delete(`/vendor/hotels/${hotelId}`);
            alert('Hotel removed');
            const { data } = await api.get('/vendor/stats');
            setStats(data);
        } catch (error) {
            console.error('Error deleting hotel', error);
            alert('Failed to delete hotel');
        }
    };

    const handleToggleActive = async (hotel) => {
        try {
            await api.put(`/vendor/hotels/${hotel._id}`, { isActive: !hotel.isActive });
            // Refresh stats
            const { data } = await api.get('/vendor/stats');
            setStats(data);
        } catch (error) {
            console.error('Error updating status', error);
            alert('Failed to update status');
        }
    };

    const resetRoomForm = () => {
        setRoomForm({ type: 'Standard', price: '', capacity: '', quantity: '', available: '' });
        setEditingRoomId(null);
    };

    const handleRoomSubmit = (e) => {
        e.preventDefault();
        if (!selectedHotelId) {
            alert('Please select a hotel first.');
            return;
        }

        const quantity = Number(roomForm.quantity);
        const availableInput = roomForm.available === '' ? quantity : Number(roomForm.available);
        const available = Math.max(0, Math.min(availableInput, quantity));

        if (!roomForm.type || Number(roomForm.price) <= 0 || Number(roomForm.capacity) <= 0 || quantity <= 0) {
            alert('Please enter valid room details.');
            return;
        }

        setRoomsByHotel((prev) => {
            const currentRooms = prev[selectedHotelId] || [];

            if (editingRoomId) {
                return {
                    ...prev,
                    [selectedHotelId]: currentRooms.map((room) =>
                        room.id === editingRoomId
                            ? {
                                ...room,
                                type: roomForm.type,
                                price: Number(roomForm.price),
                                capacity: Number(roomForm.capacity),
                                quantity,
                                available
                            }
                            : room
                    )
                };
            }

            const newRoom = {
                id: `${selectedHotelId}-${Date.now()}`,
                type: roomForm.type,
                price: Number(roomForm.price),
                capacity: Number(roomForm.capacity),
                quantity,
                available
            };

            return {
                ...prev,
                [selectedHotelId]: [...currentRooms, newRoom]
            };
        });

        resetRoomForm();
    };

    const handleEditRoom = (room) => {
        setRoomForm({
            type: room.type,
            price: String(room.price),
            capacity: String(room.capacity),
            quantity: String(room.quantity),
            available: String(room.available)
        });
        setEditingRoomId(room.id);
    };

    const handleDeleteRoom = (roomId) => {
        if (!window.confirm('Delete this room?')) return;

        setRoomsByHotel((prev) => ({
            ...prev,
            [selectedHotelId]: (prev[selectedHotelId] || []).filter((room) => room.id !== roomId)
        }));

        if (editingRoomId === roomId) {
            resetRoomForm();
        }
    };

    const handleUpdateAvailability = (room) => {
        const input = window.prompt('Enter new available quantity', room.available);
        if (input === null) return;

        const parsed = Number(input);
        if (Number.isNaN(parsed) || parsed < 0 || parsed > room.quantity) {
            alert(`Availability must be between 0 and ${room.quantity}.`);
            return;
        }

        setRoomsByHotel((prev) => ({
            ...prev,
            [selectedHotelId]: (prev[selectedHotelId] || []).map((current) =>
                current.id === room.id ? { ...current, available: parsed } : current
            )
        }));
    };

    const handleDownloadInvoice = (booking) => {
        const bookingId = booking._id || booking.id || 'N/A';
        const guestName = booking.user?.name || booking.guestName || 'Guest';
        const roomName = booking.room?.type || booking.roomType || booking.room?.name || 'N/A';
        const hotelName = booking.hotel?.name || booking.hotelName || 'N/A';
        const checkIn = booking.checkInDate || booking.checkIn || booking.startDate || 'N/A';
        const checkOut = booking.checkOutDate || booking.checkOut || booking.endDate || 'N/A';
        const amount = booking.totalAmount || booking.amount || 0;
        const status = booking.status || 'pending';

        const invoiceContent = [
            'Staybook - Booking Invoice',
            '---------------------------',
            `Booking ID: ${bookingId}`,
            `Guest Name: ${guestName}`,
            `Hotel: ${hotelName}`,
            `Room: ${roomName}`,
            `Check-In: ${new Date(checkIn).toLocaleDateString()}`,
            `Check-Out: ${new Date(checkOut).toLocaleDateString()}`,
            `Status: ${status}`,
            `Amount: $${amount}`,
            `Generated On: ${new Date().toLocaleString()}`
        ].join('\n');

        const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${bookingId}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const persistVendorSettings = (key, value) => {
        try {
            const existing = getStoredVendorSettings();
            const updated = { ...existing, [key]: value };
            localStorage.setItem('vendorSettings', JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to persist vendor settings', error);
        }
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        try {
            await api.put('/vendor/profile', profileForm);
            localStorage.setItem('user', JSON.stringify({ ...storedUser, ...profileForm }));
            persistVendorSettings('profile', profileForm);
            alert('Profile updated successfully.');
        } catch (error) {
            persistVendorSettings('profile', profileForm);
            localStorage.setItem('user', JSON.stringify({ ...storedUser, ...profileForm }));
            alert('Profile saved locally. Backend profile endpoint unavailable.');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            alert('Please fill all password fields.');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            alert('New password must be at least 6 characters long.');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('New password and confirm password must match.');
            return;
        }

        try {
            await api.put('/vendor/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            alert('Password changed successfully.');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            alert('Unable to change password right now. Please verify backend endpoint.');
        }
    };

    const handleBankDetailsSave = async (e) => {
        e.preventDefault();

        if (!bankForm.accountHolder || !bankForm.bankName || !bankForm.accountNumber || !bankForm.ifscCode) {
            alert('Please fill required bank detail fields.');
            return;
        }

        try {
            await api.put('/vendor/bank-details', bankForm);
            persistVendorSettings('bank', bankForm);
            alert('Bank details saved successfully.');
        } catch (error) {
            persistVendorSettings('bank', bankForm);
            alert('Bank details saved locally. Backend bank endpoint unavailable.');
        }
    };

    const handlePayoutSettingsSave = async (e) => {
        e.preventDefault();

        if (Number(payoutForm.minimumAmount) < 0) {
            alert('Minimum payout amount cannot be negative.');
            return;
        }

        try {
            await api.put('/vendor/payout-settings', payoutForm);
            persistVendorSettings('payout', payoutForm);
            alert('Payout settings updated successfully.');
        } catch (error) {
            persistVendorSettings('payout', payoutForm);
            alert('Payout settings saved locally. Backend payout endpoint unavailable.');
        }
    };

    const renderHotelsView = () => (
        <div className="hotels-view">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="dashboard-title">My Hotels</h2>
                <button
                    className="action-btn"
                    onClick={() => { resetForm(); setShowAddHotel(!showAddHotel); }}
                    style={{ background: showAddHotel ? '#ef4444' : '#c5a059', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {showAddHotel ? <><FaTimesCircle /> Cancel</> : <><FaHotel /> Add New Hotel</>}
                </button>
            </div>

            {showAddHotel && (
                <div className="add-hotel-form" style={{ background: 'white', padding: '25px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', color: '#1e293b', fontSize: '1.5rem' }}>{editingId ? 'Edit Hotel Details' : 'Add New Hotel'}</h3>
                    <form onSubmit={handleFormSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Hotel Name</label>
                                <input
                                    type="text"
                                    value={hotelForm.name}
                                    onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                                    required
                                    placeholder="e.g. Grand Luxury Hotel"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Location</label>
                                <input
                                    type="text"
                                    value={hotelForm.location}
                                    onChange={(e) => setHotelForm({ ...hotelForm, location: e.target.value })}
                                    required
                                    placeholder="e.g. New York, USA"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Description</label>
                            <textarea
                                value={hotelForm.description}
                                onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })}
                                required
                                placeholder="Brief description of the property..."
                                rows="3"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Amenities (comma separated)</label>
                                <textarea
                                    value={hotelForm.amenities}
                                    onChange={(e) => setHotelForm({ ...hotelForm, amenities: e.target.value })}
                                    placeholder="Pool, Gym, WiFi, Breakfast..."
                                    rows="3"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Image URLs (comma separated)</label>
                                <textarea
                                    value={hotelForm.images}
                                    onChange={(e) => setHotelForm({ ...hotelForm, images: e.target.value })}
                                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                    rows="3"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                        </div>

                        {editingId && (
                            <div className="form-group" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ fontWeight: '700', color: '#1e293b' }}>Active Status:</label>
                                <button
                                    type="button"
                                    onClick={() => setHotelForm({ ...hotelForm, isActive: !hotelForm.isActive })}
                                    style={{
                                        padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                                        background: hotelForm.isActive ? '#dcfce7' : '#fee2e2',
                                        color: hotelForm.isActive ? '#166534' : '#991b1b',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {hotelForm.isActive ? 'Active' : 'Inactive'}
                                </button>
                            </div>
                        )}

                        <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                            <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                {editingId ? 'Update Hotel' : 'Create Hotel'}
                            </button>
                            <button type="button" onClick={resetForm} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="hotels-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                {stats?.hotels && stats.hotels.length > 0 ? (
                    stats.hotels.map(hotel => (
                        <div key={hotel._id} className="hotel-card" style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', position: 'relative' }}>

                            <div className="hotel-image" style={{ height: '180px', background: '#e2e8f0', backgroundImage: `url(${hotel.images?.[0] || 'https://via.placeholder.com/400x200?text=No+Image'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                                    <span className={`status-badge ${hotel.status || 'pending'}`} style={{
                                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                                        background: (hotel.status || 'pending') === 'approved' ? '#dcfce7' : '#fef9c3',
                                        color: (hotel.status || 'pending') === 'approved' ? '#166534' : '#854d0e',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        {(hotel.status || 'pending').toUpperCase()}
                                    </span>
                                    {hotel.isActive ? (
                                        <span style={{ background: '#22c55e', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>ACTIVE</span>
                                    ) : (
                                        <span style={{ background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>INACTIVE</span>
                                    )}
                                </div>
                            </div>

                            <div className="hotel-details" style={{ padding: '20px' }}>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', color: '#1e293b' }}>{hotel.name}</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <FaHotel size={14} /> {hotel.location}
                                </p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.9rem', color: '#475569', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                                    <span><strong>{hotel.roomCount || 0}</strong> Rooms</span>
                                    <span><strong>{hotel.amenities?.length || 0}</strong> Amenities</span>
                                </div>

                                <div className="hotel-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <button
                                        onClick={() => handleStartEdit(hotel)}
                                        className="action-btn"
                                        style={{ padding: '8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                                    >
                                        Edit Details
                                    </button>
                                    <button
                                        className="action-btn"
                                        style={{ padding: '8px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                                        onClick={() => setActiveTab('rooms')} // Future: pass hotel ID filter
                                    >
                                        Manage Rooms
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(hotel)}
                                        className="action-btn"
                                        style={{ padding: '8px', background: hotel.isActive ? '#fbbf24' : '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                                    >
                                        {hotel.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteHotel(hotel._id)}
                                        style={{ padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#64748b', background: '#f8fafc', borderRadius: '15px', border: '2px dashed #cbd5e1' }}>
                        <FaHotel size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
                        <h3>No Hotels Found</h3>
                        <p>Get started by adding your first hotel property.</p>
                        <button
                            onClick={() => setShowAddHotel(true)}
                            style={{ marginTop: '20px', background: '#c5a059', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            + Add New Hotel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const selectedHotel = stats?.hotels?.find((hotel) => hotel._id === selectedHotelId);
    const selectedHotelRooms = roomsByHotel[selectedHotelId] || [];
    const vendorHotelIds = new Set((stats?.hotels || []).map((hotel) => hotel._id));
    const allBookings = stats?.bookings || stats?.recentBookings || [];

    const vendorBookings = allBookings.filter((booking) => {
        if (!vendorHotelIds.size) return true;

        const bookingHotelId =
            booking.hotel?._id ||
            booking.hotelId ||
            booking.room?.hotel?._id ||
            booking.room?.hotelId ||
            booking.hotel;

        if (!bookingHotelId || typeof bookingHotelId !== 'string') return true;

        return vendorHotelIds.has(bookingHotelId);
    });

    const filteredBookings = vendorBookings.filter((booking) => {
        const bookingStatus = (booking.status || '').toLowerCase();
        const statusMatch = bookingFilters.status === 'all' || bookingStatus === bookingFilters.status;

        const rawCheckInDate = booking.checkInDate || booking.checkIn || booking.startDate;
        const checkInDate = rawCheckInDate ? new Date(rawCheckInDate) : null;

        const fromMatch = bookingFilters.fromDate
            ? checkInDate && checkInDate >= new Date(bookingFilters.fromDate)
            : true;

        const toMatch = bookingFilters.toDate
            ? checkInDate && checkInDate <= new Date(`${bookingFilters.toDate}T23:59:59`)
            : true;

        return statusMatch && fromMatch && toMatch;
    });

    const bookingStatuses = Array.from(
        new Set(vendorBookings.map((booking) => (booking.status || '').toLowerCase()).filter((status) => status))
    );

    const renderRoomsView = () => (
        <div className="hotels-view">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="dashboard-title">Room Management</h2>
            </div>

            {!stats?.hotels?.length ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', background: '#f8fafc', borderRadius: '15px', border: '2px dashed #cbd5e1' }}>
                    <FaHotel size={48} style={{ marginBottom: '15px', opacity: 0.3 }} />
                    <h3>No Hotels Found</h3>
                    <p>Please add a hotel before managing rooms.</p>
                </div>
            ) : (
                <>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Select Hotel</label>
                        <select
                            value={selectedHotelId}
                            onChange={(e) => {
                                setSelectedHotelId(e.target.value);
                                resetRoomForm();
                            }}
                            style={{ width: '100%', maxWidth: '420px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        >
                            {stats.hotels.map((hotel) => (
                                <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                            ))}
                        </select>
                        {selectedHotel && (
                            <p style={{ marginTop: '10px', color: '#64748b' }}>Managing rooms for <strong>{selectedHotel.name}</strong> ({selectedHotel.location})</p>
                        )}
                    </div>

                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>{editingRoomId ? 'Edit Room' : 'Add Room'}</h3>
                        <form onSubmit={handleRoomSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Room Type</label>
                                    <select
                                        value={roomForm.type}
                                        onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    >
                                        <option value="Standard">Standard</option>
                                        <option value="Deluxe">Deluxe</option>
                                        <option value="Suite">Suite</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Price</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={roomForm.price}
                                        onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })}
                                        required
                                        placeholder="e.g. 150"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Room Capacity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={roomForm.capacity}
                                        onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                                        required
                                        placeholder="e.g. 2"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Quantity Available</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={roomForm.quantity}
                                        onChange={(e) => setRoomForm({ ...roomForm, quantity: e.target.value })}
                                        required
                                        placeholder="e.g. 10"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Current Availability</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={roomForm.available}
                                        onChange={(e) => setRoomForm({ ...roomForm, available: e.target.value })}
                                        placeholder="Defaults to quantity"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                    {editingRoomId ? 'Update Room' : 'Add Room'}
                                </button>
                                <button type="button" onClick={resetRoomForm} style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                    Clear
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bookings-section">
                        <h3 className="chart-title">Rooms List</h3>
                        <table className="bookings-table">
                            <thead>
                                <tr>
                                    <th>Room Type</th>
                                    <th>Price</th>
                                    <th>Available</th>
                                    <th>Booked</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedHotelRooms.length > 0 ? (
                                    selectedHotelRooms.map((room) => {
                                        const booked = Math.max(room.quantity - room.available, 0);
                                        return (
                                            <tr key={room.id}>
                                                <td>{room.type}</td>
                                                <td>${room.price}</td>
                                                <td>{room.available}</td>
                                                <td>{booked}</td>
                                                <td style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleEditRoom(room)}
                                                        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateAvailability(room)}
                                                        style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                                                    >
                                                        Update Availability
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRoom(room.id)}
                                                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center' }}>No rooms added for this hotel.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );

    const renderBookingsView = () => (
        <div className="hotels-view">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="dashboard-title">Booking Management</h2>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Filters</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>From Date</label>
                        <input
                            type="date"
                            value={bookingFilters.fromDate}
                            onChange={(e) => setBookingFilters({ ...bookingFilters, fromDate: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>To Date</label>
                        <input
                            type="date"
                            value={bookingFilters.toDate}
                            onChange={(e) => setBookingFilters({ ...bookingFilters, toDate: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Status</label>
                        <select
                            value={bookingFilters.status}
                            onChange={(e) => setBookingFilters({ ...bookingFilters, status: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        >
                            <option value="all">All</option>
                            {bookingStatuses.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bookings-section">
                <h3 className="chart-title">Hotel Bookings</h3>
                <table className="bookings-table">
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Guest Name</th>
                            <th>Room</th>
                            <th>Check-In</th>
                            <th>Check-Out</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map((booking) => {
                                const bookingId = booking._id || booking.id || 'N/A';
                                const roomName = booking.room?.type || booking.roomType || booking.room?.name || 'N/A';
                                const checkInRaw = booking.checkInDate || booking.checkIn || booking.startDate;
                                const checkOutRaw = booking.checkOutDate || booking.checkOut || booking.endDate;

                                return (
                                    <tr key={bookingId}>
                                        <td>{String(bookingId).slice(0, 8)}...</td>
                                        <td>{booking.user?.name || booking.guestName || 'Guest'}</td>
                                        <td>{roomName}</td>
                                        <td>{checkInRaw ? new Date(checkInRaw).toLocaleDateString() : 'N/A'}</td>
                                        <td>{checkOutRaw ? new Date(checkOutRaw).toLocaleDateString() : 'N/A'}</td>
                                        <td>
                                            <span className={`status-badge status-${booking.status || 'pending'}`}>
                                                {booking.status || 'pending'}
                                            </span>
                                        </td>
                                        <td>${booking.totalAmount || booking.amount || 0}</td>
                                        <td style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => setSelectedBooking(booking)}
                                                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => handleDownloadInvoice(booking)}
                                                style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                                            >
                                                Download Invoice
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center' }}>No bookings match the selected filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedBooking && (
                <div style={{ marginTop: '20px', background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>Booking Details</h3>
                        <button
                            onClick={() => setSelectedBooking(null)}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            Close
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', color: '#334155' }}>
                        <p><strong>Booking ID:</strong> {selectedBooking._id || selectedBooking.id || 'N/A'}</p>
                        <p><strong>Guest:</strong> {selectedBooking.user?.name || selectedBooking.guestName || 'Guest'}</p>
                        <p><strong>Email:</strong> {selectedBooking.user?.email || selectedBooking.guestEmail || 'N/A'}</p>
                        <p><strong>Room:</strong> {selectedBooking.room?.type || selectedBooking.roomType || selectedBooking.room?.name || 'N/A'}</p>
                        <p><strong>Hotel:</strong> {selectedBooking.hotel?.name || selectedBooking.hotelName || 'N/A'}</p>
                        <p><strong>Status:</strong> {selectedBooking.status || 'pending'}</p>
                        <p><strong>Check-In:</strong> {(selectedBooking.checkInDate || selectedBooking.checkIn || selectedBooking.startDate) ? new Date(selectedBooking.checkInDate || selectedBooking.checkIn || selectedBooking.startDate).toLocaleString() : 'N/A'}</p>
                        <p><strong>Check-Out:</strong> {(selectedBooking.checkOutDate || selectedBooking.checkOut || selectedBooking.endDate) ? new Date(selectedBooking.checkOutDate || selectedBooking.checkOut || selectedBooking.endDate).toLocaleString() : 'N/A'}</p>
                        <p><strong>Amount:</strong> ${selectedBooking.totalAmount || selectedBooking.amount || 0}</p>
                    </div>
                </div>
            )}
        </div>
    );

    const renderSettingsView = () => (
        <div className="hotels-view">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="dashboard-title">Vendor Settings</h2>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', color: '#1e293b', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Update Profile</h3>
                    <form onSubmit={handleProfileSave}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Name</label>
                                <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Email</label>
                                <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Phone</label>
                                <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Company Name</label>
                                <input type="text" value={profileForm.companyName} onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                        </div>
                        <button type="submit" style={{ marginTop: '15px', background: '#3b82f6', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            Save Profile
                        </button>
                    </form>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', color: '#1e293b', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Change Password</h3>
                    <form onSubmit={handlePasswordChange}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Current Password</label>
                                <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>New Password</label>
                                <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Confirm Password</label>
                                <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                        </div>
                        <button type="submit" style={{ marginTop: '15px', background: '#8b5cf6', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            Update Password
                        </button>
                    </form>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', color: '#1e293b', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Add Bank Details</h3>
                    <form onSubmit={handleBankDetailsSave}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Account Holder Name</label>
                                <input type="text" value={bankForm.accountHolder} onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Bank Name</label>
                                <input type="text" value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Account Number</label>
                                <input type="text" value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>IFSC Code</label>
                                <input type="text" value={bankForm.ifscCode} onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>UPI ID (Optional)</label>
                                <input type="text" value={bankForm.upiId} onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                        </div>
                        <button type="submit" style={{ marginTop: '15px', background: '#10b981', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            Save Bank Details
                        </button>
                    </form>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', color: '#1e293b', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Manage Payout Settings</h3>
                    <form onSubmit={handlePayoutSettingsSave}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Payout Method</label>
                                <select value={payoutForm.method} onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="upi">UPI</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Payout Frequency</label>
                                <select value={payoutForm.frequency} onChange={(e) => setPayoutForm({ ...payoutForm, frequency: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Minimum Payout Amount</label>
                                <input type="number" min="0" value={payoutForm.minimumAmount} onChange={(e) => setPayoutForm({ ...payoutForm, minimumAmount: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#1e293b' }}>Payout Day</label>
                                <select value={payoutForm.payoutDay} onChange={(e) => setPayoutForm({ ...payoutForm, payoutDay: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                    <option value="monday">Monday</option>
                                    <option value="tuesday">Tuesday</option>
                                    <option value="wednesday">Wednesday</option>
                                    <option value="thursday">Thursday</option>
                                    <option value="friday">Friday</option>
                                    <option value="saturday">Saturday</option>
                                    <option value="sunday">Sunday</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input type="checkbox" id="autoPayout" checked={payoutForm.autoPayout} onChange={(e) => setPayoutForm({ ...payoutForm, autoPayout: e.target.checked })} />
                                <label htmlFor="autoPayout" style={{ fontWeight: '500' }}>Enable Auto Payout</label>
                            </div>
                        </div>
                        <button type="submit" style={{ marginTop: '15px', background: '#f59e0b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            Save Payout Settings
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

    return (
        <div className="vendor-dashboard-container">
            {renderSidebar()}
            <div className="main-content">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'hotels' && renderHotelsView()}
                {activeTab === 'rooms' && renderRoomsView()}
                {activeTab === 'bookings' && renderBookingsView()}
                {activeTab === 'settings' && renderSettingsView()}
            </div>
        </div>
    );
};

export default VendorDashboard;
