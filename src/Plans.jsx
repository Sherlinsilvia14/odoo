import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        name: '', planType: 'Duration-based', price: '', billingInterval: 'Monthly', minQuantity: 1, startDate: '', endDate: '',
        servicesIncluded: [],
        options: { autoClose: false, closable: true, pausable: true, renewable: true }
    });

    useEffect(() => {
        fetchPlans();
        fetchServices();
        fetchDiscounts();
    }, []);

    const fetchServices = async () => {
        const res = await fetch('/api/services');
        if (res.ok) setServices(await res.json());
    };

    const fetchPlans = async () => {
        const res = await fetch('/api/plans');
        if (res.ok) setPlans(await res.json());
    };

    const fetchDiscounts = async () => {
        const res = await fetch('/api/discounts');
        if (res.ok) setDiscounts(await res.json());
    };

    const handleEdit = (plan) => {
        setEditingId(plan._id);
        setFormData({
            name: plan.name,
            planType: plan.planType || 'Duration-based',
            price: plan.price,
            billingInterval: plan.billingInterval,
            minQuantity: plan.minQuantity,
            startDate: plan.startDate?.split('T')[0] || '',
            endDate: plan.endDate?.split('T')[0] || '',
            servicesIncluded: plan.servicesIncluded || [],
            options: { ...plan.options }
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingId ? `/api/plans/${editingId}` : '/api/plans';
        const method = editingId ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setShowModal(false);
        setEditingId(null);
        setFormData({
            name: '', planType: 'Duration-based', price: '', billingInterval: 'Monthly', minQuantity: 1, startDate: '', endDate: '',
            servicesIncluded: [],
            options: { autoClose: false, closable: true, pausable: true, renewable: true }
        });
        fetchPlans();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Deleting this plan will not affect existing subscriptions. Proceed?')) {
            const res = await fetch(`/api/plans/${id}`, { method: 'DELETE' });
            if (res.ok) fetchPlans();
        }
    };

    const toggleOption = (opt) => {
        setFormData({ ...formData, options: { ...formData.options, [opt]: !formData.options[opt] } });
    };

    const toggleService = (id) => {
        const current = [...formData.servicesIncluded];
        const idx = current.indexOf(id);
        if (idx > -1) current.splice(idx, 1);
        else current.push(id);
        setFormData({ ...formData, servicesIncluded: current });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', margin: 0 }}>Subscription Plans</h2>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <span className="badge" style={{ background: '#e0f2fe', color: '#075985', border: '1px solid #bae6fd' }}>
                            {plans.filter(p => p.planType === 'Duration-based').length} Duration Plans
                        </span>
                        <span className="badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                            {plans.filter(p => p.planType === 'Package-based').length} Package Tiers
                        </span>
                    </div>
                </div>
                <button className="btn btn-gold" onClick={() => setShowModal(true)}> <Plus size={18} /> Create Plan</button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {plans.map(p => (
                    <div key={p._id} className="card plan-card" style={{
                        borderTop: '4px solid var(--primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'default'
                    }} onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                    }} onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="badge" style={{ fontSize: '0.65rem', background: p.planType === 'Package-based' ? '#fef3c7' : '#e0f2fe', color: p.planType === 'Package-based' ? '#92400e' : '#075985', marginBottom: '0.4rem', display: 'inline-block' }}>{p.planType}</span>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{p.name}</h3>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>{p.billingInterval} Period</div>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>₹{p.price}</div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <div>Renewable: {p.options?.renewable ? 'Yes' : 'No'}</div>
                            <div>Interval: {p.billingInterval}</div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                            <div className="flex justify-between" style={{ fontSize: '0.8rem', color: '#666' }}>
                                <span>Original Price:</span>
                                <span>₹{p.price}</span>
                            </div>
                            <div className="flex justify-between" style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                                <span>Auto Discount:</span>
                                <span>
                                    {(() => {
                                        const rule = discounts.find(r => r.isActive && !r.customer && (r.plan === p._id || r.plan?._id === p._id)) ||
                                            discounts.find(r => r.isActive && !r.customer && r.applicablePlanInterval === p.billingInterval);

                                        const base = Number(p.price) || 0;
                                        if (rule) {
                                            const val = Number(rule.value) || 0;
                                            const amt = rule.type === 'Percentage' ? (base * val / 100) : val;
                                            return `- ₹${amt.toFixed(0)} ${rule.type === 'Percentage' ? `(${val}%)` : ''}`;
                                        }

                                        // Hardcoded fallbacks if no DB rule exists
                                        const fallback = p.billingInterval === 'Monthly' ? 100 : p.billingInterval === 'Quarterly' ? 200 : p.billingInterval === 'Half-Yearly' ? 300 : p.billingInterval === 'Yearly' ? 400 : 0;
                                        return `- ₹${fallback}`;
                                    })()}
                                </span>
                            </div>
                            <div className="flex justify-between" style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary-dark)', borderTop: '1px dashed #cbd5e0', marginTop: '0.4rem', paddingTop: '0.4rem' }}>
                                <span>Final Price:</span>
                                <span>₹{(() => {
                                    const rule = discounts.find(r => r.isActive && !r.customer && (r.plan === p._id || r.plan?._id === p._id)) ||
                                        discounts.find(r => r.isActive && !r.customer && r.applicablePlanInterval === p.billingInterval);

                                    const base = Number(p.price) || 0;
                                    if (rule) {
                                        const val = Number(rule.value) || 0;
                                        const disc = rule.type === 'Percentage' ? (base * val / 100) : val;
                                        return Math.max(0, base - disc).toFixed(0);
                                    }
                                    const fallback = p.billingInterval === 'Monthly' ? 100 : p.billingInterval === 'Quarterly' ? 200 : p.billingInterval === 'Half-Yearly' ? 300 : p.billingInterval === 'Yearly' ? 400 : 0;
                                    return Math.max(0, base - fallback).toFixed(0);
                                })()}</span>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Included Services:</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1rem' }}>
                                {p.servicesIncluded?.length > 0 ? p.servicesIncluded.map(sId => {
                                    const s = services.find(srv => (srv._id === sId) || (srv._id === sId._id));
                                    return s ? <span key={s._id} className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{s.name}</span> : null;
                                }) : <span style={{ fontSize: '0.75rem', color: '#999' }}>General Access</span>}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                            <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleEdit(p)}><Edit2 size={14} style={{ marginRight: '4px' }} /> Edit</button>
                            <button className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#fee2e2' }} onClick={() => handleDelete(p._id)}><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <h3>{editingId ? 'Edit Plan' : 'Create Plan'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Plan Tier</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'].map(tier => (
                                        <button
                                            key={tier}
                                            type="button"
                                            className="btn"
                                            onClick={() => {
                                                const templates = {
                                                    'Monthly': { name: 'Monthly Membership', price: 1000, billingInterval: 'Monthly', planType: 'Duration-based' },
                                                    'Quarterly': { name: 'Quarterly Savings', price: 1599, billingInterval: 'Quarterly', planType: 'Duration-based' },
                                                    'Half-Yearly': { name: 'Half-Yearly Elite', price: 4999, billingInterval: 'Half-Yearly', planType: 'Duration-based' },
                                                    'Yearly': { name: 'Yearly VIP Glow', price: 9999, billingInterval: 'Yearly', planType: 'Duration-based' }
                                                };
                                                setFormData({ ...formData, ...templates[tier] });
                                            }}
                                            style={{
                                                flex: 1,
                                                fontSize: '0.8rem',
                                                background: formData.name.includes(tier) ? 'var(--primary)' : '#f3f4f6',
                                                color: formData.name.includes(tier) ? 'white' : '#374151',
                                                border: '1px solid #e5e7eb'
                                            }}
                                        >
                                            {tier}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Plan Type</label>
                                <select className="form-input" value={formData.planType} onChange={e => setFormData({ ...formData, planType: e.target.value })}>
                                    <option value="Duration-based">Duration-based</option>
                                    <option value="Package-based">Package-based</option>
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Name</label><input required className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                                <div className="form-group" style={{ width: '150px' }}><label className="form-label">Price (₹)</label><input required className="form-input" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} /></div>
                            </div>
                            <div className="flex gap-4">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Billing Interval</label>
                                    <select className="form-input" value={formData.billingInterval} onChange={e => setFormData({ ...formData, billingInterval: e.target.value })}>
                                        <option>Monthly</option>
                                        <option>Quarterly</option>
                                        <option>Half-Yearly</option>
                                        <option>Yearly</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Min Qty</label><input type="number" className="form-input" value={formData.minQuantity} onChange={e => setFormData({ ...formData, minQuantity: e.target.value })} /></div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Services Included</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto', padding: '0.8rem', border: '1px solid #eee', borderRadius: '8px', background: '#fdfdfd' }}>
                                    {services.map(s => (
                                        <label key={s._id} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', padding: '0.2rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.servicesIncluded.includes(s._id)}
                                                onChange={() => toggleService(s._id)}
                                            />
                                            {s.name}
                                        </label>
                                    ))}
                                </div>
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
                                <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>{editingId ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Plans;
