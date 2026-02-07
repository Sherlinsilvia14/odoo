import React, { useState, useEffect } from 'react';

const UserProfile = ({ user }) => {
    const [profile, setProfile] = useState(user || {});

    // In a real app, you might want to fetch latest profile data here
    // useEffect(() => { fetchProfile(); }, []);

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                    width: '100px', height: '100px', background: 'var(--primary)',
                    borderRadius: '50%', display: 'inline-flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '2.5rem', color: 'white', fontWeight: 'bold'
                }}>
                    {profile.name ? profile.name[0] : 'U'}
                </div>
                <h2 style={{ fontFamily: 'Playfair Display', marginTop: '1rem' }}>{profile.name}</h2>
                <div className="badge badge-active inline-block">{profile.role || 'Customer'}</div>
            </div>

            <div className="grid gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
                    <div className="text-lg">{profile.email}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-xs text-gray-500 uppercase font-semibold">Phone</label>
                    <div className="text-lg">{profile.phone || '-'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-xs text-gray-500 uppercase font-semibold">Member Since</label>
                    <div className="text-lg">{new Date(profile.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
                <div className="p-4 rounded-lg" style={{ background: 'var(--primary-dark)', color: 'white' }}>
                    <label className="text-xs uppercase font-semibold" style={{ opacity: 0.8 }}>My Reward Credits</label>
                    <div className="text-2xl font-bold">{profile.totalCredits || 0} Points</div>
                    {profile.totalCredits >= 30 && (
                        <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.4rem', borderRadius: '4px' }}>
                            🎉 You have 1 Free Service waiting for you!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default UserProfile;
