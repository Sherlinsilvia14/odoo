import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';

const Services = () => {
    const [services, setServices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'Hair', image: '' });

    useEffect(() => { fetchServices(); }, []);
    const fetchServices = async () => {
        const res = await fetch('/api/services');
        if (res.ok) setServices(await res.json());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setShowModal(false);
        setFormData({ name: '', description: '', price: '', category: 'Hair', image: '' });
        fetchServices();
    };

    const handleDelete = async (id) => {
        if (confirm('Delete?')) {
            await fetch(`/api/services/${id}`, { method: 'DELETE' });
            fetchServices();
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <p style={{ color: '#666' }}>Manage your salon services and pricing.</p>
                <button className="btn btn-gold" onClick={() => setShowModal(true)}> <Plus size={18} /> Add Service</button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {services.map(s => (
                    <div key={s._id} className="card service-card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                        <div className="service-img-container">
                            <img src={s.image || 'https://images.unsplash.com/photo-1560066984-12186d30b71c?auto=format&fit=crop&q=80'} alt={s.name} />
                            <div className="service-overlay">
                                <span>{s.name}</span>
                            </div>
                        </div>
                        <div style={{ padding: '1.2rem' }}>
                            <div className="flex justify-between" style={{ alignItems: 'flex-start' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>{s.name}</h3>
                                <span className="badge badge-active">{s.category}</span>
                            </div>
                            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', height: '40px', overflow: 'hidden' }}>{s.description}</p>
                            <div className="flex justify-between items-center" style={{ marginTop: 'auto' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>₹{s.price}</span>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Playfair Display', fontSize: '1.5rem' }}>Add New Service</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label className="form-label">Name</label><input required className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div className="form-group"><label className="form-label">Image URL</label><input className="form-input" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." /></div>
                            <div className="flex gap-4">
                                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Price (₹)</label><input required type="number" className="form-input" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} /></div>
                                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Category</label>
                                    <select className="form-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option>Hair</option><option>Skin</option><option>Grooming</option><option>Premium</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea></div>
                            <div className="flex gap-4" style={{ marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-gold" style={{ flex: 1, justifyContent: 'center' }}>Save Service</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Services;
