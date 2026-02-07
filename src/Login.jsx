import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, User, Shield, Briefcase, Check } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({}); // To track field focus for validation display

    const passwordRules = [
        { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
        { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
        { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
        { label: "One special character", test: (pw) => /[!@#$%^&*]/.test(pw) },
    ];

    const validate = () => {
        let tempErrors = {};
        if (!formData.email) tempErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Email is invalid";

        const failedRules = passwordRules.filter(rule => !rule.test(formData.password));
        if (failedRules.length > 0) tempErrors.password = "Password does not meet requirements";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, role }) // Send selected role
                });

                const data = await res.json();
                if (res.ok) {
                    console.log(`Logging in as ${data.user.role}`, data);
                    localStorage.setItem('token', data.token); // Store token for auth
                    localStorage.setItem('user', JSON.stringify(data.user));
                    navigate('/dashboard', { state: { role: data.user.role, user: data.user } });
                } else {
                    setErrors({ ...errors, form: data.message });
                    // No alert here, we show it in UI as requested
                }
            } catch (err) {
                console.error(err);
                alert('Login failed. Please try again.');
            }
        }
    };

    return (
        <div className="salon-auth-bg">
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundImage: 'url("https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=2072&auto=format&fit=crop")', // Different premium image for Login
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(3px) brightness(0.6)',
                zIndex: -1
            }}></div>

            <div className="auth-card" style={{
                position: 'relative',
                zIndex: 1,
                padding: '3rem',
                maxWidth: '600px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(212, 163, 115, 0.3)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
            }}>
                <Link to="/" style={{ color: '#666', display: 'flex', alignItems: 'center', marginBottom: '1.5rem', textDecoration: 'none', gap: '0.5rem', width: 'fit-content' }}>
                    <ChevronLeft size={16} /> Back to Home
                </Link>

                {!role ? (
                    <div>
                        <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h2>
                        <p className="text-center" style={{ marginBottom: '2rem', color: '#666' }}>Select your account type to login</p>

                        <div className="role-grid">
                            <div className="role-card" onClick={() => setRole('Admin')}>
                                <Shield size={28} color={role === 'Admin' ? 'var(--text-dark)' : '#666'} />
                                <div style={{ fontWeight: 600, marginTop: '0.5rem' }}>Admin</div>
                            </div>
                            <div className="role-card" onClick={() => setRole('Internal')}>
                                <Briefcase size={28} color={role === 'Internal' ? 'var(--text-dark)' : '#666'} />
                                <div style={{ fontWeight: 600, marginTop: '0.5rem' }}>Internal</div>
                            </div>
                            <div className="role-card" onClick={() => setRole('Customer')}>
                                <User size={28} color={role === 'Customer' ? 'var(--text-dark)' : '#666'} />
                                <div style={{ fontWeight: 600, marginTop: '0.5rem' }}>Customer</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', margin: 0 }}>
                                Login
                                <span style={{ display: 'block', fontSize: '0.9rem', fontFamily: 'Inter', color: '#666', fontWeight: 400, marginTop: '0.2rem' }}>as {role}</span>
                            </h2>
                            <button
                                className="btn btn-outline"
                                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                                onClick={() => setRole(null)}
                            >
                                Switch Role
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="name@example.com"
                                />
                                {errors.email && <div className="error-msg">{errors.email}</div>}
                            </div>

                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                                    <Link to="/reset-password" style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', textDecoration: 'none' }}>Forgot Password?</Link>
                                </div>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    onFocus={() => setTouched({ ...touched, password: true })}
                                    placeholder="••••••••"
                                />

                                {/* Validation Rules Display - As requested even on Login */}
                                {touched.password && (
                                    <div style={{ marginTop: '0.8rem', padding: '0.8rem', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Security Requirements</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.3rem' }}>
                                            {passwordRules.map((rule, idx) => {
                                                const isValid = rule.test(formData.password);
                                                return (
                                                    <div key={idx} style={{ fontSize: '0.75rem', color: isValid ? '#10b981' : '#9ca3af', display: 'flex', alignItems: 'center' }}>
                                                        {isValid ? <Check size={12} style={{ marginRight: '6px' }} /> : <div style={{ width: '4px', height: '4px', background: '#d1d5db', borderRadius: '50%', marginRight: '8px', marginLeft: '4px' }}></div>}
                                                        {rule.label}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {errors.password && <div className="error-msg" style={{ marginTop: '0.5rem' }}>{errors.password}</div>}
                            </div>

                            {errors.form && (
                                <div style={{ color: '#dc2626', background: '#fee2e2', padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
                                    {errors.form}
                                </div>
                            )}

                            <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', marginTop: '1rem' }}>Sign In</button>
                        </form>
                        <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                            New to UrbanGlow? <Link to="/signup" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Create an account</Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
