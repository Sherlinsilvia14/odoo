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
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{data.totalCustomers}</div>
                </div>
                <div className="card text-center">
                    <h3>Active Subscriptions</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>{data.activeSubs}</div>
                </div>
                <div className="card text-center">
                    <h3>Total Revenue</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>₹{data.totalRevenue}</div>
                </div>
                <div className="card text-center" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <h3>Discounts Given</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>₹{data.totalDiscounts || 0}</div>
                </div>
                <div className="card text-center" style={{ borderLeft: '4px solid #6366f1' }}>
                    <h3>Tax Collected</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>₹{data.totalTaxCollected || 0}</div>
                </div>
                <div className="card text-center" style={{ borderLeft: '4px solid #10b981' }}>
                    <h3>Global Plan Balance</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>₹{data.totalRemainingBalance || 0}</div>
                </div>
                <div className="card text-center" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <h3>Credits Issued</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>{data.totalCreditsIssued || 0}</div>
                </div>
                <div className="card text-center" style={{ borderLeft: '4px solid var(--primary-dark)' }}>
                    <h3>Membership Fees</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>₹{data.totalMembershipFees || 0}</div>
                </div>
            </div>
        </div>
    );
};
export default Reports;
