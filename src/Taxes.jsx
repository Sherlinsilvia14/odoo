import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const Taxes = () => {
    const [taxes, setTaxes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', percentage: '', type: 'Percentage' });

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
        setFormData({ name: '', percentage: '', type: 'Percentage' });
        fetchTaxes();
    };

    const handleDelete = async (id) => {
        await fetch(`/api/taxes/${id}`, { method: 'DELETE' });
        fetchTaxes();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem' }}>Tax Management</h2>
                <button className="btn btn-gold" onClick={() => setShowModal(true)}> <Plus size={18} /> Add Tax</button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead><tr><th>Name</th><th>Value</th><th>Type</th><th>Actions</th></tr></thead>
                    <tbody>
                        {taxes.map(t => (
                            <tr key={t._id}>
                                <td>{t.name}</td>
                                <td>{t.percentage}%</td>
                                <td><span className="badge badge-gray">{t.type}</span></td>
                                <td><button onClick={() => handleDelete(t._id)} style={{ color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={16} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add Tax</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label className="form-label">Name</label><input required className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div className="form-group"><label className="form-label">Percentage</label><input required type="number" className="form-input" value={formData.percentage} onChange={e => setFormData({ ...formData, percentage: e.target.value })} /></div>
                            <div className="flex gap-4">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Taxes;
