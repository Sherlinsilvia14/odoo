import React, { useState, useEffect } from 'react';
import { FileText, Check, X } from 'lucide-react';

const Quotations = () => {
    const [quotations, setQuotations] = useState([]);

    useEffect(() => { fetchQuotations(); }, []);

    const fetchQuotations = async () => {
        const res = await fetch('/api/subscriptions');
        if (res.ok) {
            const all = await res.json();
            // Filter only Draft or Quotation status
            setQuotations(all.filter(s => ['Draft', 'Quotation'].includes(s.status)));
        }
    };

    const handleConfirm = async (id) => {
        if (!confirm('Confirm this quotation and generate invoice?')) return;

        const res = await fetch(`/api/subscriptions/${id}/confirm`, { method: 'PUT' });
        if (res.ok) {
            alert('Quotation Confirmed! Invoice Generated.');
            fetchQuotations();
        }
    };

    return (
        <div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', marginBottom: '1.5rem' }}>Quotations</h2>

            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f9fafb', borderBottom: '1px solid #eee' }}>
                        <tr>
                            <th className="p-3 text-left">Customer</th>
                            <th className="p-3 text-left">Plan / Services</th>
                            <th className="p-3 text-left">Total Estimate</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotations.length === 0 ? (
                            <tr><td colSpan="5" className="p-3 text-center text-gray-500">No pending quotations.</td></tr>
                        ) : (
                            quotations.map(q => (
                                <tr key={q._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td className="p-3">{q.customer?.name}</td>
                                    <td className="p-3">
                                        {q.plan?.name || 'Custom'}
                                        {q.services.length > 0 && <span style={{ fontSize: '0.8rem', color: '#666' }}> ({q.services.length} services)</span>}
                                    </td>
                                    <td className="p-3" style={{ fontWeight: 600 }}>₹{q.totalAmount}</td>
                                    <td className="p-3"><span className="badge badge-warning">{q.status}</span></td>
                                    <td className="p-3">
                                        <button onClick={() => handleConfirm(q._id)} className="btn btn-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                            <Check size={14} style={{ display: 'inline', marginRight: '4px' }} /> Confirm
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default Quotations;
