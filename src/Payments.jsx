import React, { useState, useEffect } from 'react';

const Payments = ({ customerId }) => {
    const [payments, setPayments] = useState([]);

    useEffect(() => { fetchPayments(); }, [customerId]);
    const fetchPayments = async () => {
        const url = customerId ? `/api/payments?customerId=${customerId}` : '/api/payments';
        const res = await fetch(url);
        if (res.ok) setPayments(await res.json());
    };
    return (
        <div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', marginBottom: '1.5rem' }}>
                {customerId ? 'Payment History' : 'Payments'}
            </h2>
            <div className="card" style={{ padding: 0 }}>
                {payments.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No payments found.</div>
                ) : (
                    <table className="table">
                        <thead><tr><th>Date</th>{!customerId && <th>Customer</th>}<th>Method</th><th>Amount</th></tr></thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p._id}>
                                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                    {!customerId && <td>{p.customer?.name}</td>}
                                    <td>{p.method}</td>
                                    <td style={{ fontWeight: 'bold' }}>₹{p.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
export default Payments;
