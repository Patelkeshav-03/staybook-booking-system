import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CustomerDashboard.css';

// Icons
import {
    FaHome, FaSuitcase, FaCreditCard, FaStar, FaHeart, FaUser, FaSignOutAlt,
    FaCalendarCheck, FaTimesCircle, FaWallet, FaMapMarkerAlt, FaMapMarkedAlt, FaPhone, FaTrash, FaBell
} from 'react-icons/fa';

const CustomerDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();
    const [reviewForm, setReviewForm] = useState({ bookingId: '', rating: 5, comment: '' });
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [bookingForm, setBookingForm] = useState({ hotelId: '', roomId: '', checkInDate: '', checkOutDate: '' });
    const [hotels, setHotels] = useState([]);
    const [rooms, setRooms] = useState([]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingReviewId) {
                await api.put(`/customer/reviews/${editingReviewId}`, {
                    rating: reviewForm.rating,
                    comment: reviewForm.comment
                });
                alert('Review updated successfully!');
            } else {
                await api.post('/customer/reviews', reviewForm);
                alert('Review submitted successfully!');
            }
            setReviewForm({ bookingId: '', rating: 5, comment: '' });
            setEditingReviewId(null);
            fetchDashboardData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit review');
        }
    };

    const handleEditClick = (review) => {
        setReviewForm({
            bookingId: review.booking, // Note: backend needs to populate booking or just ID
            rating: review.rating,
            comment: review.comment
        });
        setEditingReviewId(review._id);
        // Scroll to form (optional, but good UX)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setReviewForm({ bookingId: '', rating: 5, comment: '' });
        setEditingReviewId(null);
    };

    const handleRemoveFromWishlist = async (hotelId) => {
        try {
            await api.delete(`/customer/wishlist/${hotelId}`);
            alert('Removed from wishlist');
            fetchDashboardData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to remove from wishlist');
        }
    };

    const handleAddToWishlist = async (hotelId) => {
        try {
            await api.post('/customer/wishlist', { hotelId });
            alert('Added to wishlist!');
            fetchDashboardData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add to wishlist');
        }
    };

    const fetchDashboardData = async () => {
        try {
            const { data } = await api.get('/customer/dashboard');
            setData(data);
        } catch (error) {
            console.error('Error fetching customer data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Fetch hotels when 'book-room' tab is active
    useEffect(() => {
        if (activeTab === 'book-room') {
            const fetchHotels = async () => {
                try {
                    const { data } = await api.get('/public/hotels');
                    setHotels(data);
                } catch (error) {
                    console.error('Error fetching hotels:', error);
                }
            };
            fetchHotels();
        }
    }, [activeTab]);

    // Fetch rooms when hotel is selected
    useEffect(() => {
        if (bookingForm.hotelId) {
            const fetchRooms = async () => {
                try {
                    const { data } = await api.get(`/public/hotels/${bookingForm.hotelId}/rooms`);
                    setRooms(data);
                } catch (error) {
                    console.error('Error fetching rooms:', error);
                }
            };
            fetchRooms();
        } else {
            setRooms([]);
        }
    }, [bookingForm.hotelId]);

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/customer/book-room', {
                roomId: bookingForm.roomId,
                checkInDate: bookingForm.checkInDate,
                checkOutDate: bookingForm.checkOutDate
            });
            alert('Booking confirmed!');
            setBookingForm({ hotelId: '', roomId: '', checkInDate: '', checkOutDate: '' });
            setActiveTab('bookings');
            fetchDashboardData();
        } catch (error) {
            alert(error.response?.data?.message || 'Booking failed');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await api.put(`/customer/bookings/${bookingId}/cancel`);
            alert('Booking cancelled successfully');
            fetchDashboardData(); // Refresh data
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const handleDownloadInvoice = (bookingId) => {
        alert(`Downloading invoice for booking #${bookingId.substring(bookingId.length - 6).toUpperCase()}...`);
        // Future: Implement actual PDF download
    };

    if (loading) return <div className="c-loading">Loading Dashboard...</div>;

    const NotificationsView = () => (
        <>
            <h1 className="c-dashboard-title">Notifications</h1>
            <div style={{ marginTop: '20px' }}>
                {data?.notifications && data.notifications.length > 0 ? (
                    data.notifications.map(notification => (
                        <div key={notification._id} style={{
                            background: 'white',
                            padding: '15px 20px',
                            borderRadius: '12px',
                            marginBottom: '15px',
                            boxShadow: '0 2px 4px -1px rgba(0,0,0,0.06)',
                            borderLeft: `5px solid ${notification.type === 'booking_confirmation' ? '#22c55e' :
                                notification.type === 'cancellation' ? '#ef4444' :
                                    notification.type === 'promotion' ? '#d97706' : // Gold for promotion
                                        '#3b82f6' // Blue for system/other
                                }`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>{notification.title}</strong>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                    {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p style={{ margin: 0, color: '#64748b', lineHeight: '1.5' }}>{notification.message}</p>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                        <FaBell size={48} style={{ color: '#e2e8f0', marginBottom: '20px' }} />
                        <h3>No notifications yet</h3>
                        <p>We'll notify you about your bookings and exclusive offers.</p>
                    </div>
                )}
            </div>
        </>
    );

    const Sidebar = () => (
        <div className="c-sidebar">
            <div className="c-sidebar-header">Staybook Customer</div>
            <ul className="c-sidebar-menu">
                <li className={`c-sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                    <FaHome className="c-sidebar-icon" /> Dashboard
                </li>
                <li className={`c-sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                    <FaSuitcase className="c-sidebar-icon" /> My Bookings
                </li>
                <li className={`c-sidebar-item ${activeTab === 'book-room' ? 'active' : ''}`} onClick={() => setActiveTab('book-room')}>
                    <FaMapMarkedAlt className="c-sidebar-icon" /> Book a Stay
                </li>
                <li className={`c-sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
                    <FaBell className="c-sidebar-icon" /> Notifications
                    {data?.notifications?.some(n => !n.isRead) && <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', marginLeft: 'auto' }}></span>}
                </li>
                <li className={`c-sidebar-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
                    <FaCreditCard className="c-sidebar-icon" /> Payments
                </li>
                <li className={`c-sidebar-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
                    <FaStar className="c-sidebar-icon" /> Reviews
                </li>
                <li className={`c-sidebar-item ${activeTab === 'wishlist' ? 'active' : ''}`} onClick={() => setActiveTab('wishlist')}>
                    <FaHeart className="c-sidebar-icon" /> Wishlist
                </li>
                <li className={`c-sidebar-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                    <FaUser className="c-sidebar-icon" /> Profile
                </li>
                <li className="c-sidebar-item" onClick={handleLogout} style={{ marginTop: 'auto', color: '#ff6b6b' }}>
                    <FaSignOutAlt className="c-sidebar-icon" /> Logout
                </li>
            </ul>
        </div>
    );

    const DashboardView = () => (
        <>
            <div className="c-top-bar">
                <h1 className="c-dashboard-title">My Dashboard</h1>
                <div className="c-user-profile">
                    <FaUser size={20} color="#64748b" />
                    <span className="c-user-name">Welcome Back</span>
                </div>
            </div>

            <div className="c-stats-grid">
                <div className="c-stat-card">
                    <div className="c-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                        <FaCalendarCheck />
                    </div>
                    <div className="c-stat-info">
                        <h3>Total Bookings</h3>
                        <div className="c-stat-value">{data?.summary?.totalBookings || 0}</div>
                    </div>
                </div>
                <div className="c-stat-card">
                    <div className="c-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
                        <FaSuitcase />
                    </div>
                    <div className="c-stat-info">
                        <h3>Upcoming Stays</h3>
                        <div className="c-stat-value">{data?.summary?.upcomingStays || 0}</div>
                    </div>
                </div>
                <div className="c-stat-card">
                    <div className="c-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
                        <FaTimesCircle />
                    </div>
                    <div className="c-stat-info">
                        <h3>Cancelled</h3>
                        <div className="c-stat-value">{data?.summary?.cancelledBookings || 0}</div>
                    </div>
                </div>
                <div className="c-stat-card">
                    <div className="c-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706' }}>
                        <FaWallet />
                    </div>
                    <div className="c-stat-info">
                        <h3>Total Spent</h3>
                        <div className="c-stat-value">${data?.summary?.totalSpent || 0}</div>
                    </div>
                </div>
                <div className="c-stat-card">
                    <div className="c-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}>
                        <FaStar />
                    </div>
                    <div className="c-stat-info">
                        <h3>Reviews Given</h3>
                        <div className="c-stat-value">{data?.reviewsGiven || 0}</div>
                    </div>
                </div>
            </div>

            {data?.upcomingBooking && (
                <div className="c-highlight-card">
                    <div className="c-stay-info">
                        <h5 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8 }}>Next Upcoming Stay</h5>
                        <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{data.upcomingBooking.hotel?.name || 'Unknown Hotel'}</h2>
                        <div className="c-stay-details" style={{ marginBottom: '20px' }}>
                            <p><FaMapMarkerAlt /> {data.upcomingBooking.hotel?.location || 'Location Info'}</p>
                            <p><FaCalendarCheck /> Check-in: {new Date(data.upcomingBooking.checkIn).toLocaleDateString()}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                className="c-action-btn"
                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.upcomingBooking.hotel?.location || '')}`, '_blank')}
                                style={{ background: '#c5a059', color: '#fff', border: 'none' }}
                            >
                                <FaMapMarkedAlt style={{ marginRight: '8px' }} /> Get Directions
                            </button>
                            <button
                                className="c-action-btn"
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
                                onClick={() => alert(`Contacting ${data.upcomingBooking.hotel?.name}... Feature coming soon!`)}
                            >
                                <FaPhone style={{ marginRight: '8px' }} /> Contact Hotel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {data?.recommendations && data.recommendations.length > 0 && (
                <div style={{ margin: '30px 0' }}>
                    <h3 className="c-section-title">Recommended Just For You</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {data.recommendations.map(hotel => (
                            <div key={hotel._id} style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                <div style={{ height: '180px', background: '#e2e8f0', backgroundImage: `url(${hotel.imageUrls?.[0] || 'https://via.placeholder.com/300'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                    <div style={{ padding: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fbbf24', padding: '4px 8px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FaStar size={12} /> {hotel.rating || 'New'}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{hotel.name}</h4>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <FaMapMarkerAlt size={12} /> {hotel.location}
                                    </p>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <button
                                            className="c-action-btn"
                                            style={{ flex: 4, textAlign: 'center' }}
                                            onClick={() => setActiveTab('book-room')}
                                        >
                                            Book Now
                                        </button>
                                        <button
                                            onClick={() => handleAddToWishlist(hotel._id)}
                                            style={{
                                                flex: 1,
                                                background: data?.wishlist?.some(w => w._id === hotel._id) ? '#ef4444' : '#fef2f2',
                                                color: data?.wishlist?.some(w => w._id === hotel._id) ? '#fff' : '#ef4444',
                                                border: '1px solid #fee2e2',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Add to Wishlist"
                                        >
                                            <FaHeart />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <h3 className="c-section-title">Recent Bookings</h3>
            <table className="c-bookings-table">
                <thead>
                    <tr>
                        <th>Booking ID</th>
                        <th>Hotel Name</th>
                        <th>Room Type</th>
                        <th>Check-in</th>
                        <th>Status</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.bookings && data.bookings.length > 0 ? (
                        data.bookings.slice(0, 5).map(booking => (
                            <tr key={booking._id}>
                                <td>#{booking._id.substring(booking._id.length - 6).toUpperCase()}</td>
                                <td>{booking.hotel?.name || 'Hotel Name'}</td>
                                <td>{booking.room?.type || 'Standard'}</td>
                                <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                                <td>
                                    <span className={`c-badge ${booking.status}`}>{booking.status}</span>
                                </td>
                                <td>${booking.totalAmount}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No bookings found. Start exploring!</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    );

    const BookingsView = () => (
        <>
            <h1 className="c-dashboard-title">My Bookings</h1>
            <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                <table className="c-bookings-table">
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Hotel Name</th>
                            <th>Room Type</th>
                            <th>Check-In</th>
                            <th>Check-Out</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.bookings && data.bookings.length > 0 ? (
                            data.bookings.map(booking => (
                                <tr key={booking._id}>
                                    <td>#{booking._id.substring(booking._id.length - 6).toUpperCase()}</td>
                                    <td>{booking.hotel?.name || 'Hotel Name'}</td>
                                    <td>{booking.room?.type || 'Standard'}</td>
                                    <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                                    <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`c-badge ${booking.status}`}>{booking.status}</span>
                                    </td>
                                    <td>${booking.totalAmount}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleDownloadInvoice(booking._id)}
                                                className="c-action-btn"
                                                style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#0f172a' }}
                                            >
                                                Invoice
                                            </button>
                                            {booking.status === 'confirmed' && (
                                                <button
                                                    onClick={() => handleCancelBooking(booking._id)}
                                                    className="c-action-btn"
                                                    style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#ef4444' }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>No bookings found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );

    const handleDownloadReceipt = (paymentId) => {
        alert(`Downloading receipt for Payment #${paymentId}...`);
        // Future: Implement PDF generation
    };

    const PaymentsView = () => (
        <>
            <h1 className="c-dashboard-title">Payment History</h1>
            <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                <table className="c-bookings-table">
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Booking ID</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.payments && data.payments.length > 0 ? (
                            data.payments.map(payment => (
                                <tr key={payment._id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>#{payment.paymentId}</td>
                                    <td>#{payment.bookingId.toString().substring(0, 8).toUpperCase()}</td>
                                    <td>${payment.amount}</td>
                                    <td>{new Date(payment.date).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`c-badge ${payment.status === 'Refunded' ? 'cancelled' : (payment.status === 'Pending' ? 'pending' : 'confirmed')}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDownloadReceipt(payment.paymentId)}
                                            className="c-action-btn"
                                            style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#0f172a' }}
                                        >
                                            <FaWallet style={{ marginRight: '5px' }} /> Receipt
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No transactions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );



    const ReviewsView = () => (
        <>
            <h1 className="c-dashboard-title">My Reviews</h1>

            <div style={{ background: 'white', padding: '25px', borderRadius: '15px', marginTop: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <h3 className="c-section-title">{editingReviewId ? 'Edit Your Review' : 'Write a Review'}</h3>
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '600px' }}>
                    {!editingReviewId && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontWeight: '500' }}>Select Stay</label>
                            <select
                                value={reviewForm.bookingId}
                                onChange={(e) => setReviewForm({ ...reviewForm, bookingId: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                required={!editingReviewId}
                            >
                                <option value="">-- Choose a completed stay --</option>
                                {data?.bookings?.filter(b => (b.status === 'checked-out' || b.status === 'confirmed') && !data.reviews.find(r => r.booking === b._id)).map(b => (
                                    <option key={b._id} value={b._id}>
                                        {b.hotel?.name} - {new Date(b.checkIn).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontWeight: '500' }}>Rating</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <FaStar
                                    key={star}
                                    size={24}
                                    color={star <= reviewForm.rating ? '#fbbf24' : '#e2e8f0'}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontWeight: '500' }}>Your Experience</label>
                        <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            rows="4"
                            placeholder="Share your experience..."
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="c-action-btn">{editingReviewId ? 'Update Review' : 'Submit Review'}</button>
                        {editingReviewId && (
                            <button type="button" onClick={handleCancelEdit} className="c-action-btn" style={{ background: '#94a3b8' }}>Cancel</button>
                        )}
                    </div>
                </form>
            </div>

            <div style={{ marginTop: '30px' }}>
                <h3 className="c-section-title">Past Reviews</h3>
                {data?.reviews && data.reviews.length > 0 ? (
                    <div className="c-stats-grid">
                        {data.reviews.map(review => (
                            <div key={review._id} className="c-stat-card" style={{ display: 'block', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <h4 style={{ margin: 0 }}>{review.hotel?.name || 'Hotel'}</h4>
                                    <div style={{ color: '#fbbf24' }}>
                                        {[...Array(review.rating)].map((_, i) => <FaStar key={i} />)}
                                    </div>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>"{review.comment}"</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                    <button
                                        onClick={() => handleEditClick(review)}
                                        style={{ background: 'transparent', border: 'none', color: '#0f172a', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#64748b', fontStyle: 'italic' }}>No reviews submitted yet.</p>
                )}
            </div>
        </>
    );

    const WishlistView = () => (
        <>
            <h1 className="c-dashboard-title">My Wishlist</h1>
            {data?.wishlist && data.wishlist.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {data.wishlist.map(hotel => (
                        <div key={hotel._id} style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <div style={{ height: '200px', background: '#e2e8f0', backgroundImage: `url(${hotel.imageUrls?.[0] || 'https://via.placeholder.com/300'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', fontWeight: '800' }}>{hotel.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: 'bold' }}>
                                        <FaStar size={14} /> {hotel.rating || 'New'}
                                    </div>
                                </div>
                                <p style={{ color: '#1e293b', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 15px 0' }}>
                                    <FaMapMarkerAlt /> {hotel.location}
                                </p>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        className="c-action-btn"
                                        style={{ flex: 1, textAlign: 'center' }}
                                        onClick={() => window.location.href = `/hotels/${hotel._id}`} // Or navigate
                                    >
                                        Book Now
                                    </button>
                                    <button
                                        onClick={() => handleRemoveFromWishlist(hotel._id)}
                                        style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '0 15px', cursor: 'pointer' }}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                    <FaHeart size={48} style={{ color: '#e2e8f0', marginBottom: '20px' }} />
                    <h3 style={{ color: '#1e293b', fontWeight: '800' }}>Your wishlist is empty</h3>
                    <p style={{ color: '#1e293b', fontWeight: '600' }}>Save your favorite hotels here for easy access.</p>
                    <button className="c-action-btn" style={{ marginTop: '20px' }} onClick={() => setActiveTab('book-room')}>
                        Browse Hotels
                    </button>
                </div>
            )}
        </>
    );

    const BrowseHotelsView = () => (
        <>
            <h1 className="c-dashboard-title">Book a New Stay</h1>
            <div style={{ background: 'white', padding: '25px', borderRadius: '15px', marginTop: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxWidth: '100%' }}>
                <form onSubmit={handleBookingSubmit} style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '700' }}>Select Hotel</label>
                            <select
                                value={bookingForm.hotelId}
                                onChange={(e) => setBookingForm({ ...bookingForm, hotelId: e.target.value, roomId: '' })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                required
                            >
                                <option value="">-- Choose Hotel --</option>
                                {hotels.map(hotel => (
                                    <option key={hotel._id} value={hotel._id}>{hotel.name} - {hotel.location}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '700' }}>Select Room Type</label>
                            <select
                                value={bookingForm.roomId}
                                onChange={(e) => setBookingForm({ ...bookingForm, roomId: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                required
                                disabled={!bookingForm.hotelId}
                            >
                                <option value="">-- Choose Room --</option>
                                {rooms.map(room => (
                                    <option key={room._id} value={room._id}>
                                        {room.roomType} - ${room.pricePerNight}/night {room.count ? `(${room.count} left)` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '700' }}>Check-in Date</label>
                            <input
                                type="date"
                                value={bookingForm.checkInDate}
                                onChange={(e) => setBookingForm({ ...bookingForm, checkInDate: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '700' }}>Check-out Date</label>
                            <input
                                type="date"
                                value={bookingForm.checkOutDate}
                                onChange={(e) => setBookingForm({ ...bookingForm, checkOutDate: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                required
                                min={bookingForm.checkInDate || new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={() => bookingForm.hotelId && handleAddToWishlist(bookingForm.hotelId)}
                            className="c-action-btn"
                            style={{
                                padding: '12px 24px',
                                background: '#fef2f2',
                                color: '#ef4444',
                                border: '1px solid #fee2e2',
                                opacity: !bookingForm.hotelId ? 0.5 : 1
                            }}
                            disabled={!bookingForm.hotelId}
                        >
                            <FaHeart style={{ marginRight: '8px' }} /> Save to Wishlist
                        </button>
                        <button
                            type="submit"
                            className="c-action-btn"
                            style={{ padding: '12px 24px', fontSize: '1rem', background: (!bookingForm.roomId || !bookingForm.checkInDate || !bookingForm.checkOutDate) ? '#cbd5e1' : undefined }}
                            disabled={!bookingForm.roomId || !bookingForm.checkInDate || !bookingForm.checkOutDate}
                        >
                            Confirm Booking
                        </button>
                    </div>
                </form>
            </div>
        </>
    );

    const ProfileView = () => {
        const [profileForm, setProfileForm] = useState({
            name: data?.userProfile?.name || '',
            phoneNumber: data?.userProfile?.phoneNumber || '',
            profilePhoto: data?.userProfile?.profilePhoto || '',
            password: '',
            currentPassword: ''
        });

        const handleProfileUpdate = async (e) => {
            e.preventDefault();
            try {
                await api.put('/customer/profile', profileForm);
                alert('Profile updated successfully');
                setProfileForm({ ...profileForm, password: '', currentPassword: '' });
                fetchDashboardData();
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to update profile');
            }
        };

        return (
            <>
                <h1 className="c-dashboard-title">Profile Settings</h1>
                <div style={{ background: 'white', padding: '25px', borderRadius: '15px', marginTop: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
                    <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden', border: '3px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                <img
                                    src={profileForm.profilePhoto || 'https://via.placeholder.com/150'}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontWeight: '500' }}>Full Name</label>
                            <input
                                type="text"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontWeight: '500' }}>Phone Number</label>
                            <input
                                type="tel"
                                value={profileForm.phoneNumber}
                                onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                placeholder="+1 234 567 890"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontWeight: '500' }}>Profile Photo URL</label>
                            <input
                                type="text"
                                value={profileForm.profilePhoto}
                                onChange={(e) => setProfileForm({ ...profileForm, profilePhoto: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                placeholder="https://example.com/photo.jpg"
                            />
                        </div>

                        <div style={{ borderTop: '1px solid #e2e8f0', margin: '10px 0' }}></div>
                        <h4 style={{ margin: '0', color: '#1e293b' }}>Change Password</h4>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontWeight: '500' }}>Current Password</label>
                            <input
                                type="password"
                                value={profileForm.currentPassword}
                                onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                placeholder="Required to set new password"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontWeight: '500' }}>New Password</label>
                            <input
                                type="password"
                                value={profileForm.password}
                                onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                placeholder="Leave blank to keep current"
                            />
                        </div>

                        <button type="submit" className="c-action-btn" style={{ marginTop: '10px' }}>Save Changes</button>
                    </form>
                </div>
            </>
        );
    };

    return (
        <div className="customer-dashboard-container">
            <Sidebar />
            <div className="c-main-content">
                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'bookings' && <BookingsView />}
                {activeTab === 'book-room' && <BrowseHotelsView />}
                {activeTab === 'notifications' && <NotificationsView />}
                {activeTab === 'payments' && <PaymentsView />}
                {activeTab === 'reviews' && <ReviewsView />}
                {activeTab === 'wishlist' && <WishlistView />}
                {activeTab === 'profile' && <ProfileView />}
            </div>
        </div>
    );
};

export default CustomerDashboard;
