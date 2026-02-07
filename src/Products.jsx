import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package, Check, X } from 'lucide-react';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', description: '', type: 'Service', category: '', salesPrice: '', costPrice: '', isRecurring: false,
        variants: []
    });
    const [variant, setVariant] = useState({ attribute: '', value: '', extraPrice: '' });

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        const res = await fetch('/api/products');
        if (res.ok) setProducts(await res.json());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setShowModal(false);
        setFormData({ name: '', description: '', type: 'Service', category: '', salesPrice: '', costPrice: '', isRecurring: false, variants: [] });
        fetchProducts();
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this product?')) {
            await fetch(`/api/products/${id}`, { method: 'DELETE' });
            fetchProducts();
        }
    };

    const addVariant = () => {
        if (variant.attribute && variant.value) {
            setFormData({ ...formData, variants: [...formData.variants, variant] });
            setVariant({ attribute: '', value: '', extraPrice: '' });
        }
    };

    const removeVariant = (index) => {
        const newVariants = [...formData.variants];
        newVariants.splice(index, 1);
        setFormData({ ...formData, variants: newVariants });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', margin: 0 }}>Products & Services</h2>
                <button className="btn btn-gold" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Base Price</th>
                                <th>Variants</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p._id}>
                                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                                    <td><span className="badge badge-active">{p.type}</span></td>
                                    <td>{p.category || '-'}</td>
                                    <td>₹{p.salesPrice}</td>
                                    <td>
                                        {p.variants && p.variants.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {p.variants.map((v, i) => (
                                                    <span key={i} style={{ fontSize: '0.75rem', color: '#666' }}>
                                                        {v.attribute}: {v.value} (+₹{v.extraPrice || 0})
                                                    </span>
                                                ))}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(p._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Playfair Display', fontSize: '1.5rem' }}>Add New Product</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="flex gap-4">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Product Name</label>
                                    <input required className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ width: '150px' }}>
                                    <label className="form-label">Type</label>
                                    <select className="form-input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option>Service</option><option>Goods</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div className="flex gap-4">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Category</label>
                                    <input className="form-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Hair, Skin" />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Base Price (₹)</label>
                                    <input required type="number" className="form-input" value={formData.salesPrice} onChange={e => setFormData({ ...formData, salesPrice: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Variants (e.g. Stylist Level)</h4>
                                <div className="flex gap-2 mb-2">
                                    <input className="form-input" placeholder="Attribute (e.g. Stylist)" value={variant.attribute} onChange={e => setVariant({ ...variant, attribute: e.target.value })} style={{ flex: 1 }} />
                                    <input className="form-input" placeholder="Value (e.g. Senior)" value={variant.value} onChange={e => setVariant({ ...variant, value: e.target.value })} style={{ flex: 1 }} />
                                    <input className="form-input" type="number" placeholder="Extra Price" value={variant.extraPrice} onChange={e => setVariant({ ...variant, extraPrice: e.target.value })} style={{ width: '100px' }} />
                                    <button type="button" className="btn btn-outline" onClick={addVariant}><Plus size={16} /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.variants.map((v, i) => (
                                        <span key={i} className="badge badge-gray flex items-center gap-1">
                                            {v.attribute}: {v.value} (+₹{v.extraPrice})
                                            <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeVariant(i)} />
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4" style={{ marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="btn btn-gold" style={{ flex: 1, justifyContent: 'center' }}>Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Products;
