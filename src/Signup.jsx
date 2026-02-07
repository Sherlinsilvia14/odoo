import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Check, Sparkles } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    // Simplified: Default role is Customer
    const role = 'Customer';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const passwordRules = [
        { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
        { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
        { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
        { label: "One number", test: (pw) => /[0-9]/.test(pw) },
        { label: "One special character", test: (pw) => /[!@#$%^&*]/.test(pw) },
    ];

    const validate = () => {
        let tempErrors = {};
        if (!formData.name) tempErrors.name = "Full Name is required";
        if (!formData.email) tempErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S/.test(formData.email)) tempErrors.email = "Email is invalid";

        if (!formData.phone) tempErrors.phone = "Phone is required";

        const failedRules = passwordRules.filter(rule => !rule.test(formData.password));
        if (failedRules.length > 0) tempErrors.password = "Please meet all password requirements";

        if (formData.password !== formData.confirmPassword) {
            tempErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        password: formData.password,
                        role: 'Customer' // For this specific page
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    alert('Account created successfully! Please login.');
                    navigate('/login');
                } else {
                    alert(data.message);
                }
            } catch (err) {
                console.error(err);
                alert('Registration failed. Please try again.');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    return (
        <div className="salon-auth-bg">
            {/* Background with overlay */}
            {/* Background with overlay */}
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundImage: 'url("https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=2070&auto=format&fit=crop")',
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
                background: 'rgba(255, 255, 255, 0.95)', // Slight transparency
                border: '1px solid rgba(212, 163, 115, 0.3)', // Gold border simplified
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
            }}>

                <Link to="/" style={{ color: '#666', display: 'flex', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.9rem', textDecoration: 'none', gap: '0.5rem', width: 'fit-content' }} className="hover:text-primary">
                    <ChevronLeft size={16} /> Back to Home
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', background: 'var(--primary)', borderRadius: '50%', marginBottom: '1rem' }}>
                        <Sparkles color="white" size={24} />
                    </div>
                    <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h2>
                    <p style={{ color: '#666' }}>Join UrbanGlow for exclusive services</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Jane Doe"
                        />
                        {errors.name && <div className="error-msg">{errors.name}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                        />
                        {errors.email && <div className="error-msg">{errors.email}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-input"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 000-0000"
                        />
                        {errors.phone && <div className="error-msg">{errors.phone}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setTouched({ ...touched, password: true })}
                            placeholder="••••••••"
                        />

                        {/* Password Validation List */}
                        {touched.password && (
                            <div style={{ marginTop: '0.8rem', padding: '0.8rem', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Requirements</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                    {passwordRules.map((rule, idx) => {
                                        const isValid = rule.test(formData.password);
                                        return (
                                            <div key={idx} style={{ fontSize: '0.75rem', color: isValid ? '#10b981' : '#9ca3af', display: 'flex', alignItems: 'center' }}>
                                                {isValid ? <Check size={12} style={{ marginRight: '4px' }} /> : <div style={{ width: '4px', height: '4px', background: '#d1d5db', borderRadius: '50%', marginRight: '8px', marginLeft: '4px' }}></div>}
                                                {rule.label}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {errors.password && <div className="error-msg" style={{ marginTop: '0.5rem' }}>{errors.password}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                        />
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <div className="error-msg">Passwords do not match</div>
                        )}
                        {errors.confirmPassword && <div className="error-msg">{errors.confirmPassword}</div>}
                    </div>

                    <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1rem' }}>
                        Create Account
                    </button>
                </form>

                <p className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
