import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, ChevronLeft } from 'lucide-react';
import InvoiceDisplay from './InvoiceDisplay';
import PaymentGateway from './PaymentGateway';

const Invoices = ({ customerId }) => {
    const [invoices, setInvoices] = useState([]);
    const [view, setView] = useState('list'); // list, invoice, payment
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => { fetchInvoices(); }, [customerId]);
    const fetchInvoices = async () => {
        const url = customerId ? `/api/invoices?customerId=${customerId}` : '/api/invoices';
        const res = await fetch(url);
        if (res.ok) setInvoices(await res.json());
    };

    const handlePayClick = (invoice) => {
        setSelectedInvoice(invoice);
        setView('invoice');
    };

    const handleConfirmInvoice = () => {
        setView('payment');
    };

    const handlePaymentSuccess = () => {
        setView('list');
        fetchInvoices();
    };

    if (view === 'invoice') {
        return (
            <div>
                <button onClick={() => setView('list')} className="btn btn-outline mb-4" style={{ marginBottom: '1.5rem' }}>
                    <ChevronLeft size={18} /> Back to List
                </button>
                <InvoiceDisplay
                    invoice={selectedInvoice}
                    onConfirm={handleConfirmInvoice}
                />
            </div>
        );
    }

    if (view === 'payment') {
        return (
            <PaymentGateway
                invoice={selectedInvoice}
                onPaymentSuccess={handlePaymentSuccess}
                onBack={() => setView('invoice')}
            />
        );
    }

    return (
        <div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', marginBottom: '1.5rem' }}>
                {customerId ? 'My Invoices' : 'Invoices'}
            </h2>
            <div className="card" style={{ padding: 0 }}>
                {invoices.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No invoices found.</div>
                ) : (
                    <table className="table">
                        <thead><tr><th>Invoice #</th>{!customerId && <th>Customer</th>}<th>Date</th><th>Breakdown</th><th>Status</th><th>Total</th>{customerId && <th>Action</th>}</tr></thead>
                        <tbody>
                            {invoices.map(inv => (
                                <tr key={inv._id}>
                                    <td>{inv.invoiceNumber}</td>
                                    {!customerId && <td>{inv.customer?.name}</td>}
                                    <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="flex justify-between" style={{ fontSize: '0.8rem' }}><span>Disc:</span><span style={{ color: '#059669' }}>-₹{inv.discountTotal || 0}</span></div>
                                        <div className="flex justify-between" style={{ fontSize: '0.8rem' }}><span>Tax:</span><span>₹{inv.taxTotal || 0}</span></div>
                                        <div className="flex justify-between" style={{ fontSize: '0.8rem', fontWeight: 600 }}><span>Bal:</span><span style={{ color: inv.remainingBalance < 0 ? '#dc2626' : '#059669' }}>₹{inv.remainingBalance || 0}</span></div>
                                    </td>
                                    <td><span className={`badge ${inv.status === 'Paid' ? 'badge-active' : 'badge-warning'}`}>{inv.status}</span></td>
                                    <td style={{ fontWeight: 'bold' }}>₹{inv.total}</td>
                                    {customerId && (
                                        <td>
                                            {inv.status !== 'Paid' && (
                                                <button className="btn btn-gold" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => handlePayClick(inv)}>
                                                    Pay Now
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
export default Invoices;
