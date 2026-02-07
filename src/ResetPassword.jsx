import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Lock, Smartphone } from 'lucide-react';

const ResetPassword = () => {
    const navigate = useNavigate();

    // Steps: 'phone' -> 'otp' -> 'password'
    const [step, setStep] = useState('phone');

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [devOtp, setDevOtp] = useState(''); 

    // Step 1: Request OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError(''); setMessage(''); setDevOtp('');
        try {
            const res = await fetch('/api/forgot-password-mobile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('OTP sent to your mobile number.');
                setStep('otp');
                if (data.devOtp) setDevOtp(data.devOtp);
            } else {
                setError(data.message);
            }
        } catch (err) { setError('Something went wrong.'); }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError(''); setMessage('');
        try {
            const res = await fetch('/api/verify-otp-mobile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('OTP Verified.');
                setResetToken(data.resetToken);
                setStep('password');
            } else {
                setError(data.message);
            }
        } catch (err) { setError('Something went wrong.'); }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        const passwordRules = [
            (pw) => pw.length > 8,
            (pw) => /[A-Z]/.test(pw),
            (pw) => /[a-z]/.test(pw),
            (pw) => /[!@#$%^&*]/.test(pw)
        ];
        if (!passwordRules.every(r => r(newPassword))) {
            setError("Password must be > 8 chars, contain uppercase, lowercase, and special char.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, newPassword })
            });
            if (res.ok) {
                alert('Password reset successful! Please login.');
                navigate('/login');
            } else {
                const data = await res.json();
                setError(data.message);
            }
        } catch (err) { setError('Something went wrong.'); }
    };

    return (
        <div className="salon-auth-bg">
            <div style={{
                position: 'fixed', inset: 0,
                backgroundImage: 'url("https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop")',
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'blur(3px) brightness(0.6)', zIndex: -1
            }}></div>

            <div className="auth-card" style={{
                position: 'relative', zIndex: 1, padding: '3rem', maxWidth: '500px', width: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(212, 163, 115, 0.3)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}>
                <Link to="/login" style={{ color: '#666', display: 'flex', alignItems: 'center', marginBottom: '1.5rem', textDecoration: 'none', gap: '0.5rem', width: 'fit-content' }}>
                    <ChevronLeft size={16} /> Back to Login
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', background: 'var(--primary)', borderRadius: '50%', marginBottom: '1rem' }}>
                        <Lock color="white" size={24} />
                    </div>
                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {step === 'password' ? 'New Password' : 'Reset Password'}
                    </h2>
                    <p style={{ color: '#666' }}>
                        {step === 'phone' && 'Enter your mobile number to receive an OTP.'}
                        {step === 'otp' && 'Enter the 6-digit OTP sent to your mobile.'}
                        {step === 'password' && 'Create a strong new password.'}
                    </p>
                </div>

                {step === 'phone' && (
                    <form onSubmit={handleRequestOTP}>
                        <div className="form-group">
                            <label className="form-label">Mobile Number</label>
                            <div className="flex items-center" style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0 0.75rem', background: 'white' }}>
                                <Smartphone size={18} color="#9ca3af" />
                                <input required type="tel" style={{ border: 'none', boxShadow: 'none' }} className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" />
                            </div>
                        </div>
                        {error && <div className="error-msg">{error}</div>}
                        <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', marginTop: '1rem' }}>Send OTP</button>
                    </form>
                )}

                {step === 'otp' && (
                    <form onSubmit={handleVerifyOTP}>
                        {devOtp && (
                            <div style={{ marginBottom: '1rem', textAlign: 'center', padding: '1rem', background: '#fff7ed', borderRadius: '8px', border: '1px solid #ffd8a8' }}>
                                <p style={{ fontSize: '0.85rem', color: '#9a3412', marginBottom: '0.2rem', fontWeight: 600 }}>
                                    ⚠️ SMS Gateway Not Configured
                                </p>
                                <p style={{ fontSize: '0.8rem', color: '#c2410c' }}>
                                    Your simulated OTP is: <strong>{devOtp}</strong>
                                </p>
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">Enter OTP</label>
                            <input required type="text" maxLength="6" className="form-input" style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.2rem' }} value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" />
                        </div>
                        {error && <div className="error-msg">{error}</div>}
                        <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', marginTop: '1rem' }}>Verify OTP</button>
                        <div className="text-center mt-4">
                            <button type="button" onClick={() => setStep('phone')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.9rem' }}>Use different number</button>
                        </div>
                    </form>
                )}

                {step === 'password' && (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input required type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input required type="password" className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                        </div>
                        {error && <div className="error-msg">{error}</div>}
                        <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', marginTop: '1rem' }}>Reset Password</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
