import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../services/api';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    const [scrolled, setScrolled] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => { window.removeEventListener('scroll', onScroll); clearInterval(timer); };
    }, []);

    const handleLogout = async () => {
        try { await logout(); } catch {}
        localStorage.clear();
        navigate('/login');
    };

    const roleColor = {
        ADMIN: '#a855f7',
        MANUFACTURER: '#00c8ff',
        SHIPPER: '#ffb800',
        RETAILER: '#00ff87',
    }[role] || '#94a3b8';

    const navLinks = [
        { to: '/', label: 'Dashboard', always: true },
        { to: '/products', label: 'Products', roles: ['MANUFACTURER', 'ADMIN'] },
        { to: '/batches', label: 'Batches', roles: ['MANUFACTURER', 'ADMIN', 'SHIPPER', 'RETAILER'] },
    ].filter(l => l.always || l.roles?.includes(role));

    return (
        <nav style={{
            background: scrolled ? 'rgba(2,8,24,0.95)' : 'rgba(6,16,31,0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,200,255,0.12)',
            padding: '0 28px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            transition: 'background 0.3s',
            boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: 34, height: 34,
                        background: 'linear-gradient(135deg, #0078c8, #00c8ff)',
                        borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16,
                        boxShadow: '0 0 16px rgba(0,200,255,0.4)',
                    }}>⛓</div>
                    <span style={{
                        fontFamily: 'Orbitron, monospace',
                        fontWeight: 700,
                        fontSize: 16,
                        color: '#e0f2fe',
                        letterSpacing: '1px',
                    }}>CHAIN<span style={{ color: '#00c8ff' }}>TRACK</span></span>
                </Link>

                <div style={{ display: 'flex', gap: '4px' }}>
                    {navLinks.map(link => {
                        const active = location.pathname === link.to;
                        return (
                            <Link key={link.to} to={link.to} style={{
                                color: active ? '#00c8ff' : '#94a3b8',
                                textDecoration: 'none',
                                padding: '6px 14px',
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 600,
                                background: active ? 'rgba(0,200,255,0.1)' : 'transparent',
                                border: active ? '1px solid rgba(0,200,255,0.25)' : '1px solid transparent',
                                transition: 'all 0.2s',
                                letterSpacing: '0.3px',
                            }}
                                  onMouseEnter={e => { if (!active) { e.target.style.color = '#e0f2fe'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}}
                                  onMouseLeave={e => { if (!active) { e.target.style.color = '#94a3b8'; e.target.style.background = 'transparent'; }}}
                            >{link.label}</Link>
                        );
                    })}
                </div>
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    color: 'rgba(0,200,255,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff87', display: 'inline-block', boxShadow: '0 0 6px #00ff87' }} />
                    {time.toLocaleTimeString()}
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '6px 12px',
                }}>
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: roleColor,
                        boxShadow: `0 0 8px ${roleColor}`,
                    }} />
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{email?.split('@')[0]}</span>
                    <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
                        color: roleColor, textTransform: 'uppercase',
                        background: `${roleColor}18`,
                        padding: '2px 7px', borderRadius: 4,
                    }}>{role}</span>
                </div>

                <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '7px 16px', fontSize: 12 }}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;