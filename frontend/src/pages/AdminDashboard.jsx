import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/admin/dashboard');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching admin data', error);
                alert('Failed to fetch data');
            }
        };
        fetchData();
    }, []);

    if (!data) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin Dashboard</h1>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ border: '1px solid #ddd', padding: '10px' }}>
                    <h3>Total Users</h3>
                    <p>{data.users}</p>
                </div>
                <div style={{ border: '1px solid #ddd', padding: '10px' }}>
                    <h3>Total Hotels</h3>
                    <p>{data.hotels}</p>
                </div>
                <div style={{ border: '1px solid #ddd', padding: '10px' }}>
                    <h3>Total Bookings</h3>
                    <p>{data.bookings}</p>
                </div>
                <div style={{ border: '1px solid #ddd', padding: '10px' }}>
                    <h3>Total Revenue</h3>
                    <p>${data.revenue}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
