import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, FileText } from 'lucide-react';

const Subscriptions = ({ customerId }) => {
    const [subs, setSubs] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchSubs(); }, [customerId]);
    const fetchSubs = async () => {
        const url = customerId ? `/api/subscriptions?customerId=${customerId}` : '/api/subscriptions';
        const res = await fetch(url);
        if (res.ok) setSubs(await res.json());
    };

    const confirmSub = async (id) => {
        if (confirm('Confirm Subscription and Generate Invoice?')) {
            const res = await fetch(`/api/subscriptions/${id}/confirm`, { method: 'PUT' });
            if (res.ok) {
                alert('Subscription Confirmed & Invoice Generated!');
                fetchSubs();
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', margin: 0 }}>
                    {customerId ? 'My Subscriptions' : 'Subscriptions'}
                </h2>
                {!customerId && (
                    <button className="btn btn-gold" onClick={() => alert('Full Create Flow to be implemented')}>
                        <Plus size={18} /> Create Subscription
                    </button>
                )}
            </div>

            <div className="card" style={{ padding: 0 }}>
                {subs.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No subscriptions found.</div>
                ) : (
                    <table className="table">
                        <thead><tr><th>Sub #</th>{!customerId && <th>Customer</th>}<th>Plan</th><th>Dates</th><th>Total</th><th>Status</th>{!customerId && <th>Actions</th>}</tr></thead>
                        <tbody>
                            {subs.map(s => (
                                <tr key={s._id}>
                                    <td>{s.subscriptionNumber || 'SUB-001'}</td>
                                    {!customerId && <td>{s.customer?.name}</td>}
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{s.plan?.name || 'Custom'}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                            Start: {s.startDate ? new Date(s.startDate).toLocaleDateString() : '-'}<br />
                                            End: {s.endDate ? new Date(s.endDate).toLocaleDateString() : '-'}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 'bold' }}>₹{s.totalAmount}</td>
                                    <td>
                                        <span className={`badge ${s.status === 'Active' ? 'badge-active' : s.status === 'Confirmed' ? 'badge-warning' : 'badge-gray'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    {!customerId && (
                                        <td>
                                            {s.status === 'Draft' && (
                                                <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} onClick={() => confirmSub(s._id)}>
                                                    Confirm
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
export default Subscriptions;
