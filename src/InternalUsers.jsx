import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

const InternalUsers = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: '' });
    const [error, setError] = useState('');

    useEffect(() => { fetchUsers(); }, []);
    const fetchUsers = async () => {
        const res = await fetch('/api/users?role=Internal');
        if (res.ok) setUsers(await res.json());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.role) {
            setError('Please select a role');
            return;
        }

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setShowModal(false);
                setFormData({ name: '', email: '', phone: '', password: '', role: '' });
                fetchUsers();
            } else {
                setError(data.message || data.error || 'Failed to add user');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        }
    };

    return (
        <div>
            <div className="flex justify-between mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem' }}>Internal Users</h2>
                <button className="btn btn-gold" onClick={() => setShowModal(true)}><Plus size={16} /> Add Staff</button>
            </div>

            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f9fafb', borderBottom: '1px solid #eee' }}>
                        <tr><th className="p-3 text-left">Name</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Phone</th><th className="p-3 text-left">Role</th></tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
                                <td className="p-3">{u.name}</td><td className="p-3">{u.email}</td><td className="p-3">{u.phone}</td><td className="p-3"><span className="badge badge-active">{u.role}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <div className="card" style={{ width: '400px', background: 'white', padding: '2rem' }}>
                        <h3>Add Internal User</h3>
                        {error && <div style={{ color: '#dc2626', background: '#fee2e2', padding: '0.5rem', borderRadius: '4px', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</div>}
                        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                            <div className="form-group"><label>Name</label><input required className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div className="form-group"><label>Email</label><input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                            <div className="form-group"><label>Phone</label><input required className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                            <div className="form-group">
                                <label>Role</label>
                                <select required className="form-input" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="" disabled>Select Role</option>
                                    <option value="Staff">Staff</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Stylist">Stylist</option>
                                    <option value="Receptionist">Receptionist</option>
                                    <option value="Internal">General Internal</option>
                                </select>
                            </div>
                            <div className="form-group"><label>Password</label><input required type="password" className="form-input" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} /></div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); setError(''); }}>Cancel</button>
                                <button type="submit" className="btn btn-gold">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default InternalUsers;
