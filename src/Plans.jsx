import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', price: '', billingInterval: 'Monthly', minQuantity: 1, startDate: '', endDate: '',
        options: { autoClose: false, closable: true, pausable: true, renewable: true }
    });

    useEffect(() => { fetchPlans(); }, []);

    const fetchPlans = async () => {
        const res = await fetch('/api/plans');
        if (res.ok) setPlans(await res.json());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch('/api/plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setShowModal(false);
        fetchPlans();
    };

    const toggleOption = (opt) => {
        setFormData({ ...formData, options: { ...formData.options, [opt]: !formData.options[opt] } });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem' }}>Subscription Plans</h2>
                <button className="btn btn-gold" onClick={() => setShowModal(true)}> <Plus size={18} /> Create Plan</button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {plans.map(p => (
                    <div key={p._id} className="card plan-card" style={{ borderTop: '4px solid var(--primary)' }}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{p.name}</h3>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>{p.billingInterval}</div>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>₹{p.price}</div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <div>Min Qty: {p.minQuantity}</div>
                            <div>Renewable: {p.options?.renewable ? 'Yes' : 'No'}</div>
                            <div>Pausable: {p.options?.pausable ? 'Yes' : 'No'}</div>
                            <div>Closable: {p.options?.closable ? 'Yes' : 'No'}</div>
                        </div>
                        <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Edit Plan</button>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <h3>Create Plan</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="flex gap-4">
                                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Name</label><input required className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                                <div className="form-group" style={{ width: '150px' }}><label className="form-label">Price (₹)</label><input required className="form-input" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} /></div>
                            </div>
                            <div className="flex gap-4">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Billing Interval</label>
                                    <select className="form-input" value={formData.billingInterval} onChange={e => setFormData({ ...formData, billingInterval: e.target.value })}>
                                        <option>Daily</option><option>Weekly</option><option>Monthly</option><option>Yearly</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Min Qty</label><input type="number" className="form-input" value={formData.minQuantity} onChange={e => setFormData({ ...formData, minQuantity: e.target.value })} /></div>
                            </div>

                            <div className="form-group"><label className="form-label">Plan Options</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.options.autoClose} onChange={() => toggleOption('autoClose')} /> Auto Close</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.options.closable} onChange={() => toggleOption('closable')} /> User Closable</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.options.pausable} onChange={() => toggleOption('pausable')} /> User Pausable</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={formData.options.renewable} onChange={() => toggleOption('renewable')} /> Renewable</label>
                                </div>
                            </div>

                            <div className="flex gap-4" style={{ marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Plans;
