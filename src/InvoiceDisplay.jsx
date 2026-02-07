import React from 'react';
import { Share2, FileText, Printer } from 'lucide-react';

const InvoiceDisplay = ({ invoice, onConfirm }) => {
    if (!invoice) return null;

    const subtotal = invoice.subtotal || 0;
    const discount = invoice.discountTotal || 0;
    const tax = invoice.taxTotal || 0;
    const total = invoice.total || 0;

    return (
        <div className="invoice-container" style={{
            maxWidth: '600px',
            margin: '2rem auto',
            padding: '3rem',
            backgroundColor: '#fff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: '#1a1a1a', letterSpacing: '2px', marginBottom: '0.5rem' }}>URBANGLOW</h1>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Premium Salon & Wellness</p>
                <div style={{ height: '2px', width: '60px', backgroundColor: '#d4af37', margin: '1rem auto' }}></div>
            </div>

            {/* Bill Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                <div>
                    <h5 style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Billed To</h5>
                    <p style={{ color: '#1f2937', fontWeight: 600, fontSize: '1.1rem' }}>{invoice.customer?.name || 'Customer'}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{invoice.customer?.email}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{invoice.customer?.phone}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h5 style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Invoice Details</h5>
                    <p style={{ color: '#1f2937', fontWeight: 600 }}>{invoice.invoiceNumber}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Status: <span style={{ color: invoice.status === 'Paid' ? '#059669' : '#d97706', fontWeight: 700 }}>{invoice.status.toUpperCase()}</span></p>
                </div>
            </div>

            {/* Items Table */}
            <div style={{ marginBottom: '3rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                            <th style={{ textAlign: 'left', padding: '1rem 0', color: '#4b5563', fontSize: '0.85rem' }}>Description</th>
                            <th style={{ textAlign: 'center', padding: '1rem 0', color: '#4b5563', fontSize: '0.85rem' }}>Qty</th>
                            <th style={{ textAlign: 'right', padding: '1rem 0', color: '#4b5563', fontSize: '0.85rem' }}>Price</th>
                            <th style={{ textAlign: 'right', padding: '1rem 0', color: '#4b5563', fontSize: '0.85rem' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items && invoice.items.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '1.25rem 0', color: '#1f2937', fontWeight: 500 }}>{item.description}</td>
                                <td style={{ textAlign: 'center', padding: '1.25rem 0', color: '#4b5563' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'right', padding: '1.25rem 0', color: '#4b5563' }}>₹{item.unitPrice}</td>
                                <td style={{ textAlign: 'right', padding: '1.25rem 0', color: '#1f2937', fontWeight: 600 }}>₹{item.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary Box */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '250px', backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#4b5563' }}>
                        <span>Subtotal</span>
                        <span>₹{subtotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#059669' }}>
                        <span>Discount</span>
                        <span>-₹{discount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#4b5563' }}>
                        <span>GST (18%)</span>
                        <span>₹{tax}</span>
                    </div>
                    <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '1rem' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#111827', fontSize: '1.2rem' }}>
                        <span>Total</span>
                        <span>₹{total}</span>
                    </div>
                </div>
            </div>

            {/* Footer / Actions */}
            <div style={{ marginTop: '3rem', borderTop: '1px solid #e5e7eb', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                    <p>Remaining Balance: <span style={{ color: '#1f2937', fontWeight: 600 }}>₹{invoice.remainingBalance || 0}</span></p>
                </div>
                <div className="flex gap-4">
                    <button className="btn" style={{ background: '#f3f4f6', color: '#4b5563', padding: '0.75rem 1.5rem' }}>
                        <Printer size={18} style={{ marginRight: '8px' }} /> Print
                    </button>
                    <button className="btn btn-gold" style={{ padding: '0.75rem 2.5rem' }} onClick={onConfirm}>
                        Confirm & Pay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDisplay;
