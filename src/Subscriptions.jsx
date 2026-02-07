import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, FileText } from 'lucide-react';

const Subscriptions = ({ customerId, role }) => {
    const [subs, setSubs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [products, setProducts] = useState([]);
    const [discountRules, setDiscountRules] = useState([]);
    const [taxRules, setTaxRules] = useState([]);
    const [formData, setFormData] = useState({
        customer: '',
        plan: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        selectedServices: [],
        planAmount: 0,
        serviceCost: 0,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
        remainingBalance: 0
    });

    const selectedCustomer = customers.find(c => c._id === formData.customer);
    const selectedPlan = plans.find(p => p._id === formData.plan);

    useEffect(() => {
        fetchSubs();
        if (!customerId) fetchInitialData();
    }, [customerId]);

    const fetchInitialData = async () => {
        const [cRes, pRes, prRes, dRes, tRes] = await Promise.all([
            fetch('/api/users?role=Customer'),
            fetch('/api/plans'),
            fetch('/api/products'),
            fetch('/api/discounts'),
            fetch('/api/taxes')
        ]);
        if (cRes.ok) setCustomers(await cRes.json());
        if (pRes.ok) setPlans(await pRes.json());
        if (prRes.ok) setProducts(await prRes.json());
        if (dRes.ok) setDiscountRules(await dRes.json());
        if (tRes.ok) setTaxRules(await tRes.json());
    };

    const fetchSubs = async () => {
        const url = customerId ? `/api/subscriptions?customerId=${customerId}` : '/api/subscriptions';
        const res = await fetch(url);
        if (res.ok) setSubs(await res.json());
    };

    // Helper for plan discounts
    const getPlanDiscount = (interval) => {
        switch (interval) {
            case 'Monthly': return 100;
            case 'Quarterly': return 200;
            case 'Half-Yearly': return 300;
            case 'Yearly': return 400;
            default: return 0;
        }
    };

    useEffect(() => {
        if (formData.plan) {
            const plan = plans.find(p => p._id === formData.plan);
            if (!plan) return;

            // 1. Plan Amount (Base Budget)
            const planPrice = plan.price;

            // 2. Service Cost
            let serviceTotal = 0;
            formData.selectedServices.forEach(id => {
                const prod = products.find(p => p._id === id);
                if (prod) serviceTotal += prod.salesPrice;
            });

            // 3. Discount (Based on Plan)
            const planDiscount = getPlanDiscount(plan.billingInterval);

            // 4. Taxable Amount (Service Cost - Discount)
            // Logic: Discount applies to the Service Cost, not the Plan Price directly in this context (per example)
            const taxableAmount = Math.max(0, serviceTotal - planDiscount);

            // 5. GST (18% on Taxable Amount)
            const gst = Math.round(taxableAmount * 0.18);

            // 6. Final Payable (for the service transaction)
            const finalServicePayable = taxableAmount + gst;

            // 7. Remaining Balance (Plan Amount - Final Service Pay)
            // This implies the Plan Price acts as a wallet/credit
            const balance = planPrice - finalServicePayable;

            // Expiry
            let expiry = new Date(formData.startDate);
            if (plan.billingInterval === 'Monthly') expiry.setMonth(expiry.getMonth() + 1);
            else if (plan.billingInterval === 'Quarterly') expiry.setMonth(expiry.getMonth() + 3);
            else if (plan.billingInterval === 'Half-Yearly') expiry.setMonth(expiry.getMonth() + 6);
            else if (plan.billingInterval === 'Yearly') expiry.setFullYear(expiry.getFullYear() + 1);

            setFormData(prev => ({
                ...prev,
                planAmount: planPrice,
                serviceCost: serviceTotal,
                discountAmount: planDiscount,
                taxAmount: gst,
                totalAmount: finalServicePayable,
                remainingBalance: balance,
                endDate: expiry.toISOString().split('T')[0]
            }));
        }
    }, [formData.plan, formData.selectedServices, formData.startDate, plans, products]); // Removing unnecessary deps

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const items = formData.selectedServices.map(id => {
                const p = products.find(prod => prod._id === id);
                return {
                    product: id,
                    name: p.name,
                    quantity: 1,
                    unitPrice: p.salesPrice,
                    amount: p.salesPrice
                };
            });

            const res = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    discountTotal: formData.discountAmount,
                    taxTotal: formData.taxAmount,
                    items,
                    status: 'Draft'
                })
            });
            if (res.ok) {
                setShowModal(false);
                setFormData({
                    customer: '', plan: '',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '', selectedServices: [],
                    planAmount: 0, serviceCost: 0,
                    discountAmount: 0, taxAmount: 0,
                    totalAmount: 0, remainingBalance: 0
                });
                fetchSubs();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ... (Keep existing helpers like confirmSub, closeSub, toggleSelectedService)
    const confirmSub = async (id) => {
        if (window.confirm('Confirm Subscription and Generate Invoice?')) {
            const res = await fetch(`/api/subscriptions/${id}/confirm`, { method: 'PUT' });
            if (res.ok) {
                alert('Subscription Confirmed & Invoice Generated!');
                fetchSubs();
            }
        }
    };

    const closeSub = async (id) => {
        if (window.confirm('Are you sure you want to CLOSE this subscription?')) {
            const res = await fetch(`/api/subscriptions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Closed' })
            });
            if (res.ok) fetchSubs();
        }
    };

    const toggleSelectedService = (id) => {
        const current = [...formData.selectedServices];
        const idx = current.indexOf(id);
        if (idx > -1) current.splice(idx, 1);
        else current.push(id);
        setFormData({ ...formData, selectedServices: current });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>
                        Urban<span style={{ color: 'var(--primary)' }}>Glow</span>
                    </div>
                    <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }}></div>
                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.6rem', margin: 0 }}>
                        {customerId ? 'My Subscriptions' : 'Subscriptions'}
                    </h2>
                </div>
                {!customerId && role !== 'Admin' && (
                    <button className="btn btn-gold" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Create Subscription
                    </button>
                )}
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                {subs.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No subscriptions found.</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Sub #</th>
                                {!customerId && <th>Customer</th>}
                                <th>Plan Details</th>
                                <th>Services</th>
                                <th>Billing Summary</th>
                                <th>Status</th>
                                {!customerId ? <th>Actions</th> : <th>Details</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {subs.map(s => (
                                <tr key={s._id}>
                                    <td>{s.subscriptionNumber || 'SUB-001'}</td>
                                    {!customerId && (
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{s.customer?.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>{s.customer?.email}</div>
                                        </td>
                                    )}
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{s.plan?.name || 'Custom Plan'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--primary-dark)' }}>Price: ₹{s.planAmount || s.plan?.price || 0}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#888' }}>Expiry: {s.endDate ? new Date(s.endDate).toLocaleDateString() : '-'}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.8rem' }}>Cost: ₹{s.serviceCost || 0}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#666' }}>{s.items?.length || 0} Services</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <div className="flex justify-between" style={{ gap: '1rem' }}><span>Cost:</span><span>₹{s.serviceCost || 0}</span></div>
                                            <div className="flex justify-between" style={{ gap: '1rem' }}><span>Disc:</span><span style={{ color: '#059669' }}>-₹{s.discountTotal || 0}</span></div>
                                            <div className="flex justify-between" style={{ gap: '1rem' }}><span>GST:</span><span>₹{s.taxTotal || 0}</span></div>
                                            <div className="flex justify-between" style={{ fontWeight: 'bold', color: 'var(--primary-dark)', borderTop: '1px solid #eee', marginTop: '2px' }}>
                                                <span>Final Paid:</span><span>₹{s.totalAmount}</span>
                                            </div>
                                            <div className="flex justify-between" style={{ fontSize: '0.75rem', color: s.remainingBalance < 0 ? '#dc2626' : '#059669', fontWeight: 600, borderTop: '1px solid #eee' }}>
                                                <span>Balance:</span><span>₹{s.remainingBalance || 0}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${s.status === 'Active' ? 'badge-active' : s.status === 'Confirmed' ? 'badge-warning' : s.status === 'Draft' ? 'badge-gray' : 'badge-gray'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    {!customerId && (
                                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                                            {s.status === 'Draft' && role !== 'Admin' && (
                                                <button className="btn btn-gold" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} onClick={() => confirmSub(s._id)}>
                                                    Confirm
                                                </button>
                                            )}
                                            {(role === 'Admin' || role === 'Manager') && s.status !== 'Closed' && (
                                                <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#dc2626' }} onClick={() => closeSub(s._id)}>
                                                    Close
                                                </button>
                                            )}
                                        </td>
                                    )}
                                    {customerId && (
                                        <td>
                                            <div style={{ fontSize: '0.7rem', color: '#888' }}>
                                                {s.items?.length > 0 ? `${s.items.length} Add-ons` : 'Standard Plan'}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: '550px', background: 'white', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', color: 'var(--primary-dark)', fontWeight: 'bold' }}>Urban<span style={{ color: 'var(--primary)' }}>Glow</span></div>
                            <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>Create New Subscription</h3>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
                            <div className="form-group">
                                <label className="form-label">Select Customer</label>
                                <select required className="form-input" value={formData.customer} onChange={e => setFormData({ ...formData, customer: e.target.value })}>
                                    <option value="">Choose a customer...</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Select Membership Plan</label>
                                <select required className="form-input" value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })}>
                                    <option value="">Choose a plan...</option>
                                    {plans.map(p => (
                                        <option key={p._id} value={p._id}>
                                            {p.name} - ₹{p.price} (Disc: ₹{getPlanDiscount(p.billingInterval)})
                                        </option>
                                    ))}
                                </select>
                                {selectedPlan && (
                                    <div style={{ marginTop: '0.5rem', padding: '0.8rem', background: '#fffbeb', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #fde68a' }}>
                                        <div style={{ fontWeight: 600 }}>{selectedPlan.name}</div>
                                        <div style={{ color: '#92400e' }}>
                                            Price: ₹{selectedPlan.price} | Benefit: ₹{getPlanDiscount(selectedPlan.billingInterval)} Off on Services
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Add-on Services</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.8rem', border: '1px solid #eee', borderRadius: '8px', background: '#fdfdfd' }}>
                                    {products.map(p => (
                                        <label key={p._id} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', padding: '4px', borderRadius: '4px', background: formData.selectedServices.includes(p._id) ? '#fef3c7' : 'transparent' }}>
                                            <input type="checkbox" checked={formData.selectedServices.includes(p._id)} onChange={() => toggleSelectedService(p._id)} />
                                            <span>{p.name} (₹{p.salesPrice})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input required type="date" className="form-input" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Expiry Date</label>
                                    <input readOnly type="date" className="form-input" value={formData.endDate} style={{ background: '#f3f4f6' }} />
                                </div>
                            </div>

                            {selectedPlan && (
                                <div style={{ padding: '1.2rem', background: '#fdfbf7', borderRadius: '12px', border: '1px solid #e5e7eb', marginTop: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Billing Summary</h4>
                                    <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.9rem' }}>
                                        <div className="flex justify-between">
                                            <span style={{ color: '#666' }}>Plan Amount (Balance):</span>
                                            <span style={{ fontWeight: 600 }}>₹{formData.planAmount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span style={{ color: '#666' }}>Service Cost:</span>
                                            <span>₹{formData.serviceCost}</span>
                                        </div>
                                        <div className="flex justify-between" style={{ color: '#059669' }}>
                                            <span>Discount Applied:</span>
                                            <span>-₹{formData.discountAmount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span style={{ color: '#666' }}>Tax (GST 18%):</span>
                                            <span>₹{formData.taxAmount}</span>
                                        </div>
                                        <div className="flex justify-between" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>Final Paid Amount:</span>
                                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary-dark)' }}>₹{formData.totalAmount}</span>
                                        </div>
                                        <div className="flex justify-between" style={{ background: '#ecfdf5', padding: '8px', borderRadius: '6px', marginTop: '4px' }}>
                                            <span style={{ fontWeight: 600, color: '#065f46' }}>Remaining Balance:</span>
                                            <span style={{ fontWeight: 'bold', color: formData.remainingBalance < 0 ? '#dc2626' : '#059669' }}>₹{formData.remainingBalance}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-gold" style={{ flex: 2 }}>Save & Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Subscriptions;
