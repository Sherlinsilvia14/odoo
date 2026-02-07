import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const Discounts = () => {
    const [discounts, setDiscounts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: 'Percentage', value: '' });

    useEffect(() => { fetchDiscounts(); }, []);

    const fetchDiscounts = async () => {
        const res = await fetch('/api/discounts');
        if (res.ok) setDiscounts(await res.json());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch('/api/discounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setShowModal(false);
        fetchDiscounts();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem' }}>Discounts</h2>
                <button className="btn btn-gold" onClick={() => setShowModal(true)}> <Plus size={18} /> Add Discount</button>
            </div>
            <div className="card" style={{ padding: 0 }}>
                <table className="table">
                    <thead><tr><th>Name</th><th>Type</th><th>Value</th></tr></thead>
                    <tbody>
                        {discounts.map(d => (
                            <tr key={d._id}>
                                <td>{d.name}</td>
                                <td>{d.type}</td>
                                <td>{d.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add Discount</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label className="form-label">Name</label><input required className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div className="form-group"><label className="form-label">Type</label>
                                <select className="form-input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option>Percentage</option><option>Fixed</option>
                                </select>
                            </div>
                            <div className="form-group"><label className="form-label">Value</label><input required type="number" className="form-input" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} /></div>
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
export default Discounts;
