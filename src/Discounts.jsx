import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Percent, CheckCircle, XCircle, Edit2 } from 'lucide-react';

const Discounts = () => {
    const [discounts, setDiscounts] = useState([]);
    const [plans, setPlans] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        applicablePlanInterval: 'Monthly',
        plan: '',
        value: '',
        type: 'Percentage',
        customer: '',
        applicableProducts: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isActive: true
    });

    useEffect(() => {
        fetchDiscounts();
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        const [cRes, pRes, plRes] = await Promise.all([
            fetch('/api/users?role=Customer'),
            fetch('/api/products'),
            fetch('/api/plans')
        ]);
        if (cRes.ok) setCustomers(await cRes.json());
        if (pRes.ok) setProducts(await pRes.json());
        if (plRes.ok) setPlans(await plRes.json());
    };

    const fetchDiscounts = async () => {
        const res = await fetch('/api/discounts');
        if (res.ok) {
            const data = await res.json();
            setDiscounts(data);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingId ? `/api/discounts/${editingId}` : '/api/discounts';
        const method = editingId ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setShowModal(false);
        setEditingId(null);
        resetForm();
        fetchDiscounts();
    };

    const toggleStatus = async (discount) => {
        await fetch(`/api/discounts/${discount._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !discount.isActive })
        });
        fetchDiscounts();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this discount rule?')) {
            await fetch(`/api/discounts/${id}`, { method: 'DELETE' });
            fetchDiscounts();
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', applicablePlanInterval: 'Monthly', plan: '', value: '', type: 'Percentage',
            customer: '', applicableProducts: [],
            startDate: new Date().toISOString().split('T')[0], endDate: '', isActive: true
        });
    };

    const toggleProduct = (id) => {
        const current = formData.applicableProducts;
        if (current.includes(id)) setFormData({ ...formData, applicableProducts: current.filter(x => x !== id) });
        else setFormData({ ...formData, applicableProducts: [...current, id] });
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>
                        Urban<span style={{ color: 'var(--primary)' }}>Glow</span>
                    </div>
                    <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }}></div>
                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', margin: 0 }}>Smart Discounts</h2>
                </div>
                <button className="btn btn-gold" onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }}>
                    <Plus size={18} /> Create Rule
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #fff 0%, #fef8f0 100%)', borderLeft: '5px solid var(--primary)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>Plan-Level Incentives</h3>
                <div className="grid grid-cols-4 gap-4">
                    {['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'].map(interval => (
                        <div key={interval} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #f3f4f6', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666' }}>{interval}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>20% OFF</div>
                            <div style={{ fontSize: '0.65rem', color: '#059669' }}>Applied on Services</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Discount Rule</th>
                            <th>Target Customer</th>
                            <th>Membership</th>
                            <th>Base Price</th>
                            <th>Discount</th>
                            <th>Final Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {discounts.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>No specialized rules found.</td></tr>
                        ) : (
                            discounts.map(d => (
                                <tr key={d._id}>
                                    <td style={{ fontWeight: 600 }}>
                                        {d.name}
                                        {d.applicableProducts?.length > 0 && <div style={{ fontSize: '0.7rem', color: '#666' }}>{d.applicableProducts.length} Services included</div>}
                                    </td>
                                    <td>
                                        {d.customer ? <span className="badge badge-gold">{d.customer.name}</span> : <span className="badge badge-gray">All Customers</span>}
                                    </td>
                                    <td>
                                        {d.plan ? (
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{d.plan.name}</div>
                                        ) : (
                                            <span className="badge badge-gray">{d.applicablePlanInterval} Plans</span>
                                        )}
                                    </td>
                                    <td>
                                        {(() => {
                                            const targetedPlan = d.plan || plans.find(p => p.billingInterval === d.applicablePlanInterval);
                                            return targetedPlan?.price ? `₹${targetedPlan.price}` : '-';
                                        })()}
                                    </td>
                                    <td style={{ fontWeight: 'bold', color: '#059669' }}>{d.value || 0}{d.type === 'Percentage' ? '%' : '₹'}</td>
                                    <td style={{ fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                                        {(() => {
                                            const targetedPlan = d.plan || plans.find(p => p.billingInterval === d.applicablePlanInterval);
                                            if (!targetedPlan?.price) return 'N/A';

                                            const price = Number(targetedPlan.price) || 0;
                                            const val = Number(d.value) || 0;
                                            const discount = d.type === 'Percentage' ? (price * val / 100) : val;
                                            return `₹${Math.max(0, price - discount).toFixed(0)}`;
                                        })()}
                                    </td>
                                    <td>
                                        <button onClick={() => toggleStatus(d)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: d.isActive ? '#059669' : '#dc2626' }}>
                                            {d.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-icon" onClick={() => {
                                                setEditingId(d._id);
                                                setFormData({
                                                    ...d,
                                                    customer: d.customer?._id || '',
                                                    plan: d.plan?._id || '',
                                                    applicableProducts: d.applicableProducts?.map(p => p._id) || []
                                                });
                                                setShowModal(true);
                                            }}><Edit2 size={14} /></button>
                                            <button className="btn-icon" style={{ color: '#dc2626' }} onClick={() => handleDelete(d._id)}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{editingId ? 'Edit Discount Rule' : 'New Discount Rule'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Rule Name</label>
                                <input required className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Target Customer</label>
                                    <select className="form-input" value={formData.customer} onChange={e => setFormData({ ...formData, customer: e.target.value })}>
                                        <option value="">All Customers</option>
                                        {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="form-label">Subscription Tier</label>
                                        <select className="form-input" value={formData.applicablePlanInterval} onChange={e => setFormData({ ...formData, applicablePlanInterval: e.target.value, plan: '' })}>
                                            <option>Monthly</option><option>Quarterly</option><option>Half-Yearly</option><option>Yearly</option><option>All</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Specific Membership (OR)</label>
                                        <select className="form-input" value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })}>
                                            <option value="">Choose specific plan...</option>
                                            {plans.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Discount Value</label>
                                    <input required type="number" className="form-input" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select className="form-input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option>Percentage</option><option>Fixed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Applicable Services (Optional)</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', maxHeight: '120px', overflowY: 'auto', padding: '0.8rem', border: '1px solid #eee', borderRadius: '8px' }}>
                                    {products.map(p => (
                                        <label key={p._id} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <input type="checkbox" checked={formData.applicableProducts.includes(p._id)} onChange={() => toggleProduct(p._id)} />
                                            {p.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4" style={{ marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>{editingId ? 'Update Rule' : 'Create Rule'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Discounts;
