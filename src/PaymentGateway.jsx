import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, CheckCircle, ArrowLeft } from 'lucide-react';

const PaymentGateway = ({ invoice, onPaymentSuccess, onBack }) => {
    const [status, setStatus] = useState('pending');
    const [notified, setNotified] = useState(false);

    const amount = invoice.total || 0;
    const upiString = `upi://pay?pa=urbanglow@upi&pn=UrbanGlow&am=${amount}&cu=INR&tr=${invoice.invoiceNumber}`;

    useEffect(() => {
        if (!notified) {
            sendWhatsAppNotification();
            setNotified(true);
        }
    }, []);

    const sendWhatsAppNotification = async () => {
        try {
            await fetch('/api/notify-whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: invoice.customer?.phone || '9999999999',
                    message: `UrbanGlow Invoice\nInvoice No: ${invoice.invoiceNumber}\nAmount to Pay: ₹${amount}`,
                    qrCode: upiString
                })
            });
        } catch (err) {
            console.error('WhatsApp Notification Error:', err);
        }
    };

    const simulateSuccess = async () => {
        setStatus('processing');
        setTimeout(async () => {
            try {
                const res = await fetch('/api/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        invoice: invoice._id,
                        customer: invoice.customer?._id,
                        amount: amount,
                        method: 'UPI',
                        description: 'UPI Payment Success'
                    })
                });
                if (res.ok) {
                    setStatus('success');
                    setTimeout(() => onPaymentSuccess(), 2000);
                }
            } catch (err) {
                console.error(err);
                setStatus('pending');
            }
        }, 1500);
    };

    if (status === 'success') {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', fontFamily: "'Inter', sans-serif" }}>
                <CheckCircle size={80} color="#059669" style={{ marginBottom: '2rem' }} />
                <h2 style={{ fontSize: '2rem', color: '#111827', marginBottom: '1rem' }}>Payment Successful!</h2>
                <p style={{ color: '#6b7280' }}>Your invoice has been marked as paid. Redirecting...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '450px', margin: '2rem auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', fontFamily: "'Inter', sans-serif", border: '1px solid #f3f4f6' }}>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: '2rem' }}>
                <ArrowLeft size={18} /> Back to Invoice
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Scan to Pay</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '2rem' }}>Merchant: <span style={{ color: '#111827', fontWeight: 600 }}>UrbanGlow</span></p>

            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', display: 'inline-block', border: '2px solid #f3f4f6', marginBottom: '2rem' }}>
                <QRCodeSVG value={upiString} size={200} />
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111827', margin: 0 }}>₹{amount}</h2>
                <p style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '2px' }}>Total Amount Payable</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <a href={upiString} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }} onClick={(e) => {
                    // In a real mobile browser, this triggers the UPI intent.
                    // For simulation, we'll mark it as paid after clicking.
                    if (!window.confirm('Redirecting to PhonePe/UPI App. Simulate payment success?')) {
                        e.preventDefault();
                    } else {
                        simulateSuccess();
                    }
                }}>
                    <Smartphone size={20} /> Pay with PhonePe / GPay
                </a>

                <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Payment Method: <span style={{ color: '#4b5563', fontWeight: 600 }}>UPI</span></p>
            </div>

            {status === 'processing' && (
                <div style={{ marginTop: '1.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                    Processing your payment...
                </div>
            )}
        </div>
    );
};

export default PaymentGateway;
