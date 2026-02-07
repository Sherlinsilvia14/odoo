import React, { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';

const Invoices = ({ customerId }) => {
    const [invoices, setInvoices] = useState([]);

    useEffect(() => { fetchInvoices(); }, [customerId]);
    const fetchInvoices = async () => {
        const url = customerId ? `/api/invoices?customerId=${customerId}` : '/api/invoices';
        const res = await fetch(url);
        if (res.ok) setInvoices(await res.json());
    };

    const handlePay = async (invoice) => {
        const amount = prompt(`Enter amount to pay for ${invoice.invoiceNumber} (Total: ₹${invoice.total})`, invoice.total);
        if (!amount) return;

        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoice: invoice._id,
                    customer: invoice.customer?._id || customerId,
                    amount: parseFloat(amount),
                    method: 'Credit Card', // Mock method
                    description: 'Online Payment'
                })
            });
            if (res.ok) {
                alert('Payment Successful!');
                fetchInvoices();
            }
        } catch (err) {
            console.error(err);
            alert('Payment Failed');
        }
    };

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
                        <thead><tr><th>Invoice #</th>{!customerId && <th>Customer</th>}<th>Date</th><th>Status</th><th>Total</th>{customerId && <th>Action</th>}</tr></thead>
                        <tbody>
                            {invoices.map(inv => (
                                <tr key={inv._id}>
                                    <td>{inv.invoiceNumber}</td>
                                    {!customerId && <td>{inv.customer?.name}</td>}
                                    <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                    <td><span className={`badge ${inv.status === 'Paid' ? 'badge-active' : 'badge-warning'}`}>{inv.status}</span></td>
                                    <td>₹{inv.total}</td>
                                    {customerId && (
                                        <td>
                                            {inv.status !== 'Paid' && (
                                                <button className="btn btn-gold" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => handlePay(inv)}>
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
