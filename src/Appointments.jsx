import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, User, Scissors, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';

const Appointments = ({ compact = false, customerId = null }) => {
    const [appointments, setAppointments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [services, setServices] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({ customer: '', service: '', stylist: '', date: '', time: '', notes: '' });

    useEffect(() => {
        fetchAppointments();
        fetchInitialData();
    }, [selectedDate, customerId]);

    const fetchInitialData = async () => {
        const [sRes, stRes, cRes] = await Promise.all([
            fetch('/api/services'),
            fetch('/api/users?role=Internal'),
            fetch('/api/users?role=Customer')
        ]);
        if (sRes.ok) setServices(await sRes.json());
        if (stRes.ok) setStylists(await stRes.json());
        if (cRes.ok) setCustomers(await cRes.json());

        // Auto-set customer if in customer view
        if (customerId) {
            setFormData(prev => ({ ...prev, customer: customerId }));
        }
    };

    const fetchAppointments = async () => {
        const url = customerId
            ? `/api/appointments?customerId=${customerId}`
            : `/api/appointments?date=${selectedDate}`;
        const res = await fetch(url);
        if (res.ok) setAppointments(await res.json());
    };

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Clean payload: remove empty strings so MongoDB doesn't fail ObjectId validation
        const payload = {
            ...formData,
            date: formData.date || selectedDate
        };
        if (!payload.stylist) delete payload.stylist;
        if (!payload.customer && customerId) payload.customer = customerId;

        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(`Appointment added successfully for ${new Date(data.date).toLocaleDateString()}!`);
                setFormData({ customer: '', service: '', stylist: '', date: '', time: '', notes: '' });
                // If added for a different date, user needs to switch to see it
                if (data.date.split('T')[0] === selectedDate) {
                    fetchAppointments();
                }
                setTimeout(() => { setShowModal(false); setSuccess(''); }, 1500);
            } else {
                setError(data.message || data.error || 'Failed to save appointment');
            }
        } catch (err) {
            setError('Connection error');
        }
    };

    const updateStatus = async (id, status) => {
        await fetch(`/api/appointments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        fetchAppointments();
    };

    return (
        <div>
            {!compact && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', margin: 0 }}>
                            {customerId ? 'My Appointments' : 'Appointments'}
                        </h2>
                        {!customerId && (
                            <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '0.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ border: 'none', outline: 'none' }} />
                            </div>
                        )}
                    </div>
                    <button className="btn btn-gold" onClick={() => setShowModal(true)}>
                        <Plus size={16} /> {customerId ? 'Request Appointment' : 'New Booking'}
                    </button>
                </div>
            )}

            <div className="grid gap-4">
                {appointments.length === 0 ? (
                    <div className="card text-center" style={{ padding: '3rem', color: '#666' }}>
                        <Calendar size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No appointments scheduled for this date.</p>
                    </div>
                ) : (
                    appointments.map(app => (
                        <div key={app._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center', minWidth: '80px', borderRight: '1px solid #eee', paddingRight: '2rem' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>{app.time}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(app.date).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{app.customer?.name}</div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.2rem', fontSize: '0.9rem', color: '#666' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Scissors size={14} /> {app.service?.name}</span>
                                        {!customerId && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={14} /> {app.stylist?.name || 'Unassigned'}</span>}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span className={`badge ${app.status === 'Completed' ? 'badge-active' : app.status === 'Cancelled' ? 'badge-inactive' : app.status === 'Pending' ? 'badge-warning' : ''}`}>
                                    {app.status}
                                </span>
                                {!compact && !customerId && (
                                    <>
                                        {app.status === 'Pending' && <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => updateStatus(app._id, 'Scheduled')} title="Approve"><Check size={16} color="blue" /></button>}
                                        {app.status === 'Scheduled' && <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => updateStatus(app._id, 'Completed')} title="Complete"><Check size={16} color="green" /></button>}
                                        {(app.status === 'Scheduled' || app.status === 'Pending') && <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => updateStatus(app._id, 'Cancelled')} title="Cancel"><X size={16} color="red" /></button>}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <div className="card" style={{ width: '500px', background: 'white', padding: '2rem' }}>
                        <h3>New Appointment</h3>
                        {error && <div style={{ color: '#dc2626', background: '#fee2e2', padding: '0.5rem', borderRadius: '4px', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</div>}
                        {success && <div style={{ color: '#059669', background: '#ecfdf5', padding: '0.5rem', borderRadius: '4px', marginTop: '1rem', fontSize: '0.9rem' }}>{success}</div>}
                        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
                            {!customerId && (
                                <div className="form-group">
                                    <label>Customer</label>
                                    <select required className="form-input" value={formData.customer} onChange={e => setFormData({ ...formData, customer: e.target.value })}>
                                        <option value="">Select Customer</option>
                                        {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label>Service</label>
                                <select required className="form-input" value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })}>
                                    <option value="">Select Service</option>
                                    {services.map(s => <option key={s._id} value={s._id}>{s.name} - ₹{s.price}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input required type="date" className="form-input" value={formData.date || selectedDate} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input required type="time" className="form-input" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                                </div>
                            </div>
                            {!customerId && (
                                <div className="form-group">
                                    <label>Select Professional</label>
                                    <select required className="form-input" value={formData.stylist} onChange={e => setFormData({ ...formData, stylist: e.target.value })}>
                                        <option value="">-- Select Professional --</option>
                                        {stylists.map(s => <option key={s._id} value={s._id}>{s.name} ({s.role})</option>)}
                                    </select>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>Confirm Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;
