import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, User, Calendar, Settings, Scissors, Package, FileText, Users, BarChart, FileCheck, CreditCard, Percent, DollarSign, UserCheck, Clock, Bell } from 'lucide-react';
import Products from './Products';
import Appointments from './Appointments';
import Plans from './Plans';
import Services from './Services';
import Subscriptions from './Subscriptions';
import Invoices from './Invoices';
import Payments from './Payments';
import Reports from './Reports';
import Customers from './Customers';
import InternalUsers from './InternalUsers';
import Taxes from './Taxes';
import Discounts from './Discounts';
import UserProfile from './UserProfile'; // New

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const role = location.state?.role || 'User';
    const user = location.state?.user || {};
    // Ensure we have a valid userID for filtering
    const userId = user._id || user.id;

    const [activeTab, setActiveTab] = useState('Dashboard');
    const [userStats, setUserStats] = useState(null);

    useEffect(() => {
        if (activeTab === 'Dashboard') {
            fetchStats();
        }
    }, [activeTab, role]);

    const fetchStats = async () => {
        const url = role === 'Customer' ? `/api/reports?customerId=${userId}` : '/api/reports';
        if (role === 'Customer' && !userId) return;

        const res = await fetch(url);
        if (res.ok) setUserStats(await res.json());
    };

    const handleLogout = () => {
        navigate('/login');
    };

    // --- Navigation Config ---
    const adminItems = [
        { label: 'Dashboard', icon: LayoutDashboard },
        { label: 'Services', icon: Scissors },
        { label: 'Products', icon: Package },
        { label: 'Plans', icon: Calendar },
        { label: 'Subscriptions', icon: FileCheck },
        { label: 'Invoices', icon: DollarSign },
        { label: 'Payments', icon: CreditCard },
        { label: 'Customers', icon: Users },
        { label: 'Internal Users', icon: UserCheck },
        { label: 'Discounts', icon: Percent },
        { label: 'Taxes', icon: Percent },
        { label: 'Reports', icon: BarChart },
    ];

    const staffItems = [
        { label: 'Dashboard', icon: LayoutDashboard },
        { label: 'Appointments', icon: Clock },
        { label: 'Customers', icon: Users },
        { label: 'Subscriptions', icon: FileCheck },
        { label: 'Invoices', icon: DollarSign },
        { label: 'Payments', icon: CreditCard },
        { label: 'Services', icon: Scissors },
        { label: 'Products', icon: Package },
        { label: 'Reports', icon: BarChart },
    ];

    const customerItems = [
        { label: 'Dashboard', icon: LayoutDashboard },
        { label: 'Profile', icon: User },
        { label: 'Appointments', icon: Clock },
        { label: 'Services', icon: Scissors },
        { label: 'My Subscriptions', icon: FileCheck },
        { label: 'Invoices', icon: DollarSign },
        { label: 'Payments', icon: CreditCard },
    ];

    const isStaff = ['Internal', 'Manager', 'Receptionist', 'Stylist', 'Staff'].includes(role);
    const items = role === 'Admin' ? adminItems : (isStaff ? staffItems : customerItems);

    const renderContent = () => {
        // --- Customer Views ---
        if (role === 'Customer') {
            switch (activeTab) {
                case 'Dashboard':
                    return (
                        <div>
                            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', marginBottom: '1.5rem' }}>Overview</h2>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="card">
                                    <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Active Subscriptions</h3>
                                    <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary)' }}>{userStats?.activeSubs || 0}</div>
                                </div>
                                <div className="card">
                                    <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Paid</h3>
                                    <div style={{ fontSize: '2rem', fontWeight: 600 }}>₹{userStats?.totalPaid || 0}</div>
                                </div>
                                <div className="card">
                                    <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Expiring Soon</h3>
                                    <div style={{ fontSize: '2rem', fontWeight: 600, color: '#f59e0b' }}>{userStats?.upcomingExpiry || 0}</div>
                                </div>
                            </div>
                        </div>
                    );
                case 'Profile': return <UserProfile user={user} />;
                case 'Services': return <Services readOnly={true} />;
                case 'My Subscriptions': return <Subscriptions customerId={userId} />;
                case 'Invoices': return <Invoices customerId={userId} />;
                case 'Payments': return <Payments customerId={userId} />;
                case 'Appointments': return <Appointments customerId={userId} />;
                default: return <div>Coming Soon</div>;
            }
        }

        // --- Staff / Internal Views ---
        if (isStaff) {
            switch (activeTab) {
                case 'Dashboard':
                    return (
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div className="card">
                                    <h3 style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Today's Appointments</h3>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-dark)' }}>{userStats?.todayAppointments || 0}</div>
                                </div>
                                <div className="card">
                                    <h3 style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Active Subscriptions</h3>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{userStats?.activeSubs || 0}</div>
                                </div>
                                <div className="card">
                                    <h3 style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Pending Payments</h3>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#dc2626' }}>{userStats?.pendingPayments || 0}</div>
                                </div>
                                <div className="card">
                                    <h3 style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Today's Revenue</h3>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#059669' }}>₹{userStats?.todayRevenue || 0}</div>
                                </div>
                                <div className="card">
                                    <h3 style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>New Customers (Today)</h3>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{userStats?.newCustomersToday || 0}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="card">
                                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Today's Schedule</h3>
                                    <Appointments compact />
                                </div>
                                <div className="card">
                                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Notifications</h3>
                                    <div style={{ display: 'grid', gap: '0.8rem' }}>
                                        {userStats?.pendingPayments > 0 && <div style={{ background: '#fffbeb', padding: '0.8rem', borderRadius: '6px', fontSize: '0.9rem', borderLeft: '4px solid #f59e0b' }}>⚠️ {userStats.pendingPayments} Pending payments need attention</div>}
                                        {userStats?.todayAppointments > 0 && <div style={{ background: '#f0fdf4', padding: '0.8rem', borderRadius: '6px', fontSize: '0.9rem', borderLeft: '4px solid #22c55e' }}>📅 {userStats.todayAppointments} Appointments scheduled for today</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                case 'Appointments': return <Appointments />;
                case 'Customers': return <Customers readOnly={role !== 'Manager'} />;
                case 'Services': return <Services readOnly />;
                case 'Products': return <Products readOnly />;
                case 'Subscriptions': return <Subscriptions role={role} readOnly={role === 'Stylist'} />;
                case 'Invoices': return <Invoices readOnly={role === 'Stylist'} />;
                case 'Payments': return <Payments />;
                case 'Reports': return <Reports limited />;
                default: return <div>Module Coming Soon</div>;
            }
        }

        // --- Admin Views ---
        switch (activeTab) {
            case 'Internal Users': return <InternalUsers />;
            case 'Services': return <Services />;
            case 'Products': return <Products />;
            case 'Plans': return <Plans />;
            case 'Subscriptions': return <Subscriptions role={role} />;
            case 'Invoices': return <Invoices />;
            case 'Payments': return <Payments />;
            case 'Customers': return <Customers />;
            case 'Reports': return <Reports />;
            case 'Taxes': return <Taxes />;
            case 'Discounts': return <Discounts />;
            case 'Dashboard':
                const stats = userStats || { totalCustomers: 0, activeSubs: 0, totalRevenue: 0, pendingPayments: 0 };
                return (
                    <div className="grid grid-cols-4 gap-4">
                        <div className="card">
                            <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Customers</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 600 }}>{stats.totalCustomers}</div>
                        </div>
                        <div className="card">
                            <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Active Subs</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 600 }}>{stats.activeSubs}</div>
                        </div>
                        <div className="card">
                            <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total Revenue</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary-dark)' }}>₹{stats.totalRevenue}</div>
                        </div>
                        <div className="card" onClick={() => setActiveTab('Plans')} style={{ cursor: 'pointer' }}>
                            <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Membership Plans</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary)' }}>{stats.totalPlans || 0}</div>
                            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.5rem' }}>Click to manage plans →</div>
                        </div>
                    </div>
                );
            default: return <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>{activeTab} Module Coming Soon</div>;
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'row' }}>
            {/* Background for entire dashboard */}
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: '#fdfaf6', // Fallback
                backgroundImage: 'url("https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.1, // Very subtle background texture
                zIndex: -1,
                pointerEvents: 'none'
            }}></div>

            {/* Sidebar */}
            <div className="sidebar" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
                <div style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', padding: '10px 0', zIndex: 10 }}>
                    Urban<span style={{ color: 'var(--primary)' }}>Glow</span>
                </div>

                <nav style={{ flex: 1, overflowY: 'auto' }}>
                    {items.map(item => (
                        <div
                            key={item.label}
                            onClick={() => setActiveTab(item.label)}
                            className={`sidebar-item ${activeTab === item.label ? 'active' : ''}`}
                        >
                            <item.icon size={18} /> {item.label}
                        </div>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                            {user.name ? user.name[0] : 'A'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || 'User'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#888' }}>{role}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="content-panel">
                    <header style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', margin: 0 }}>{activeTab}</h2>
                    </header>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
export default Dashboard;
