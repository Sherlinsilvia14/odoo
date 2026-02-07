import React from 'react';
import { Sparkles, Star, Scissors, Heart, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="home">
            {/* Navigation Bar */}
            <nav className="navbar">
                <div className="container flex justify-between items-center">
                    <div className="logo" style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        Urban<span style={{ color: 'var(--primary)' }}>Glow</span>
                    </div>

                    <div className="menu flex items-center gap-8">
                        <a href="#home" className="nav-link">Home</a>
                        <a href="#services" className="nav-link">Services</a>
                        <a href="#about" className="nav-link">About</a>
                        <a href="#contact" className="nav-link">Contact</a>
                    </div>

                    <div className="auth-buttons flex items-center gap-4">
                        <Link to="/login" className="btn btn-outline">Login</Link>
                        <Link to="/signup" className="btn btn-gold">Sign Up</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero" id="home">
                <div className="container">
                    <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: 'white' }}>Glow with Confidence</h1>
                    <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem', opacity: 0.9 }}>
                        Experience modern grooming and beauty services tailored to bring out your best self.
                        Luxury, relaxation, and style—all in one place.
                    </p>
                    <button className="btn btn-gold" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Book Appointment</button>
                </div>
            </section>

            {/* Awards Section */}
            <section className="awards container" style={{ marginBottom: '5rem' }}>
                <div className="grid grid-cols-3">
                    <div className="card text-center" style={{ background: 'var(--secondary)', border: 'none' }}>
                        <Star size={40} color="var(--primary-dark)" style={{ marginBottom: '1rem' }} />
                        <h3>Best Emerging Salon</h3>
                        <p>Awarded for excellence in modern styling & customer care, 2025.</p>
                    </div>
                    <div className="card text-center" style={{ background: '#fce4ec', border: 'none' }}>
                        <Heart size={40} color="#ec4899" style={{ marginBottom: '1rem' }} />
                        <h3>Customer Choice</h3>
                        <p>Voted top grooming studio by thousands of happy clients.</p>
                    </div>
                    <div className="card text-center" style={{ background: '#e0f2f1', border: 'none' }}>
                        <Scissors size={40} color="#009688" style={{ marginBottom: '1rem' }} />
                        <h3>Top Grooming Studio</h3>
                        <p>Recognized for precision cuts and premium treatments.</p>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="services container" id="services" style={{ marginBottom: '5rem' }}>
                <div className="text-center" style={{ marginBottom: '3rem' }}>
                    <h2 className="section-title">Our Premium Services</h2>
                    <p style={{ color: '#666' }}>Curated treatments for your hair, skin, and soul.</p>
                </div>

                <div className="grid grid-cols-3">
                    <div className="card">
                        <div style={{ height: '200px', background: '#eee', borderRadius: '4px', marginBottom: '1.5rem', backgroundImage: 'url(https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop)', backgroundSize: 'cover' }}></div>
                        <h3>Hair Styling</h3>
                        <p style={{ color: '#555', marginBottom: '1rem' }}>Latest cuts, colors, and treatments from expert stylists.</p>
                        <a href="#" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Explore Hair Menu →</a>
                    </div>
                    <div className="card">
                        <div style={{ height: '200px', background: '#eee', borderRadius: '4px', marginBottom: '1.5rem', backgroundImage: 'url(https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=2080&auto=format&fit=crop)', backgroundSize: 'cover' }}></div>
                        <h3>Grooming & Spa</h3>
                        <p style={{ color: '#555', marginBottom: '1rem' }}>Detailed beard trims, facials, and relaxation therapies.</p>
                        <a href="#" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Explore Grooming →</a>
                    </div>
                    <div className="card">
                        <div style={{ height: '200px', background: '#eee', borderRadius: '4px', marginBottom: '1.5rem', backgroundImage: 'url(https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=2070&auto=format&fit=crop)', backgroundSize: 'cover' }}></div>
                        <h3>Skin Care</h3>
                        <p style={{ color: '#555', marginBottom: '1rem' }}>Rejuvenating treatments for glowing, healthy skin.</p>
                        <a href="#" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Explore Skin →</a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer" id="contact">
                <div className="container flex justify-between" style={{ flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                        <h3 style={{ color: 'white', marginBottom: '1rem' }}>UrbanGlow</h3>
                        <p style={{ color: '#aaa', maxWidth: '300px' }}>
                            Redefining beauty and grooming with elegance. Visit us for a transformative experience.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ color: 'white' }}>Contact Us</h4>
                        <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem', color: '#aaa' }}>
                            <MapPin size={18} />
                            <span>123 Fashion Avenue, City Center</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: '#aaa' }}>
                            <Phone size={18} />
                            <span>+1 (555) 123-4567</span>
                        </div>
                    </div>

                    <div>
                        <h4 style={{ color: 'white' }}>Follow Us</h4>
                        <div className="flex gap-4">
                            <a href="#" style={{ color: 'white' }}><Instagram /></a>
                            <a href="#" style={{ color: 'white' }}><Facebook /></a>
                            <a href="#" style={{ color: 'white' }}><Twitter /></a>
                        </div>
                    </div>
                </div>
                <div className="text-center" style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #333', color: '#666', fontSize: '0.9rem' }}>
                    © 2026 UrbanGlow Salon. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

export default Home;
