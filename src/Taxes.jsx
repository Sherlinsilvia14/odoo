import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const Taxes = () => {
    const [taxes, setTaxes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        percentage: '',
        applicablePlanInterval: 'Monthly',
        type: 'Percentage'
    });

    useEffect(() => { fetchTaxes(); }, []);

    const fetchTaxes = async () => {
        const res = await fetch('/api/taxes');
        if (res.ok) setTaxes(await res.json());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch('/api/taxes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setShowModal(false);
        setFormData({ name: '', percentage: '', applicablePlanInterval: 'Monthly', type: 'Percentage' });
        fetchTaxes();
    };

    const handleDelete = async (id) => {
        await fetch(`/api/taxes/${id}`, { method: 'DELETE' });
        fetchTaxes();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>
                        Urban<span style={{ color: 'var(--primary)' }}>Glow</span>
                    </div>
                    <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }}></div>
                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', margin: 0 }}>GST & Tax Center</h2>
                </div>
                <button className="btn btn-gold" onClick={() => setShowModal(true)}> <Plus size={18} /> Configure Tax</button>
            </div>

            <div className="card" style={{ marginBottom: '2rem', borderLeft: '5px solid #3b82f6', background: 'linear-gradient(135deg, #fff 0%, #f0f7ff 100%)' }}>
                <h3 style={{ marginBottom: '1rem', color: '#1e40af' }}>Plan-Specific GST Rules</h3>
                <div className="grid grid-cols-4 gap-4">
                    {['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'].map(interval => (
                        <div key={interval} className="card" style={{ background: 'white', textAlign: 'center', padding: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666' }}>{interval}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3b82f6' }}>{interval === 'Yearly' ? '20%' : '10%'} GST</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead><tr><th>Tax Name</th><th>Rate</th><th>Applied To</th><th>Actions</th></tr></thead>
                    <tbody>
                        {taxes.map(t => (
                            <tr key={t._id}>
                                <td style={{ fontWeight: 600 }}>{t.name}</td>
                                <td style={{ fontWeight: 'bold' }}>{t.percentage}%</td>
                                <td><span className="badge badge-gray">{t.applicablePlanInterval} Plans</span></td>
                                <td><button onClick={() => handleDelete(t._id)} style={{ color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={16} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '450px' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Configure GST/Tax</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
                            <div className="form-group">
                                <label className="form-label">Tax Name (e.g. CGST)</label>
                                <input required className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Rate (%)</label>
                                    <input required type="number" className="form-input" value={formData.percentage} onChange={e => setFormData({ ...formData, percentage: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Plan Tier</label>
                                    <select className="form-input" value={formData.applicablePlanInterval} onChange={e => setFormData({ ...formData, applicablePlanInterval: e.target.value })}>
                                        <option>Monthly</option><option>Quarterly</option><option>Half-Yearly</option><option>Yearly</option><option>All</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>Apply Tax Rule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Taxes;
