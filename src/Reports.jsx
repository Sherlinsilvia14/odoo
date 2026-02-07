import React, { useState, useEffect } from 'react';

const Reports = () => {
    const [data, setData] = useState(null);
    useEffect(() => {
        fetch('/api/reports').then(res => res.json()).then(setData);
    }, []);

    if (!data) return <div>Loading...</div>;

    return (
        <div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', marginBottom: '1.5rem' }}>Salon Reports</h2>
            <div className="grid grid-cols-3 gap-6">
                <div className="card text-center">
                    <h3>Total Customers</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{data.totalCustomers}</div>
                </div>
                <div className="card text-center">
                    <h3>Active Subscriptions</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'green' }}>{data.activeSubs}</div>
                </div>
                <div className="card text-center">
                    <h3>Total Revenue</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>₹{data.totalRevenue}</div>
                </div>
            </div>
        </div>
    );
};
export default Reports;
