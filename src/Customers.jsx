import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

const Customers = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [expandedUser, setExpandedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'Customer' });
    const [error, setError] = useState('');

    useEffect(() => { fetchUsers(); }, []);
    const fetchUsers = async () => {
        const res = await fetch('/api/users?role=Customer');
        if (res.ok) setUsers(await res.json());
    };

    const handleUpdateCredits = async (id, amount) => {
        try {
            const res = await fetch(`/api/users/${id}/credits`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseInt(amount) })
            });
            if (res.ok) {
                fetchUsers();
                // Optionally update userDetails if it's currently showing
                const updatedUser = await res.json();
                if (expandedUser === id) {
                    // Update the credits in the local state for immediate feedback
                    setUsers(prev => prev.map(u => u._id === id ? updatedUser : u));
                }
            } else {
                alert('Failed to update credits');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDetails = async (id) => {
        if (expandedUser === id) {
            setExpandedUser(null);
            return;
        }
        setExpandedUser(id);
        setUserDetails(null);
        const res = await fetch(`/api/users/${id}/details`);
        if (res.ok) setUserDetails(await res.json());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setShowModal(false);
                setFormData({ name: '', email: '', phone: '', password: '', role: 'Customer' });
                fetchUsers();
            } else {
                setError(data.message || data.error || 'Failed to add customer');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem' }}>Customers</h2>
            </div>

            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f9fafb', borderBottom: '1px solid #eee' }}>
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Phone</th>
                            <th className="p-3 text-left">Credits</th>
                            <th className="p-3 text-left">Joined</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <React.Fragment key={u._id}>
                                <tr style={{ borderBottom: '1px solid #eee', cursor: 'pointer', background: expandedUser === u._id ? '#fdf8f6' : 'transparent' }} onClick={() => fetchDetails(u._id)}>
                                    <td className="p-3 font-medium">{u.name}</td>
                                    <td className="p-3">{u.email}</td>
                                    <td className="p-3">{u.phone}</td>
                                    <td className="p-3">
                                        <span style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>{u.totalCredits || 0}</span>
                                    </td>
                                    <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="p-3 text-right">
                                        {expandedUser === u._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </td>
                                </tr>
                                {expandedUser === u._id && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '1rem', background: '#fdf8f6' }}>
                                            {!userDetails ? <p>Loading history...</p> : (
                                                <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                                                        <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Subscriptions</h4>
                                                        {userDetails.subscriptions.length === 0 ? <p className="text-gray-500 text-sm">No subscriptions</p> : (
                                                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                                                {userDetails.subscriptions.map(s => (
                                                                    <li key={s._id} style={{ fontSize: '0.9rem', marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
                                                                        <span>{s.plan?.name || 'Custom'}</span>
                                                                        <span className={`badge ${s.status === 'Active' ? 'badge-active' : ''}`}>{s.status}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                                                        <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Payment History</h4>
                                                        {userDetails.payments.length === 0 ? <p className="text-gray-500 text-sm">No payments recorded</p> : (
                                                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                                                {userDetails.payments.map(p => (
                                                                    <li key={p._id} style={{ fontSize: '0.9rem', marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
                                                                        <span>{new Date(p.date).toLocaleDateString()} ({p.method})</span>
                                                                        <span style={{ fontWeight: 'bold', color: 'green' }}>₹{p.amount}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                                                        <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>Credit Management</span>
                                                            <span style={{ color: 'var(--primary-dark)' }}>Total: {u.totalCredits || 0}</span>
                                                        </h4>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button className="btn btn-gold" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={(e) => {
                                                                e.stopPropagation();
                                                                const amount = prompt('Enter points to add (or negative to deduct):');
                                                                if (amount && !isNaN(amount)) {
                                                                    handleUpdateCredits(u._id, amount);
                                                                }
                                                            }}>
                                                                Adjust Credits
                                                            </button>
                                                        </div>
                                                        {u.totalCredits >= 30 && (
                                                            <div style={{ marginTop: '0.8rem', padding: '0.5rem', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                                Eligible for Free Service
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};
export default Customers;
