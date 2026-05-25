import { useState, useEffect, useRef } from 'react';
import { getAnalytics } from '../services/api';

function AnimatedNumber({ value }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        if (!value && value !== 0) return;
        const start = performance.now();
        const dur = 1200;
        const from = 0;
        const to = value;
        const tick = (now) => {
            const progress = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(from + (to - from) * ease));
            if (progress < 1) ref.current = requestAnimationFrame(tick);
        };
        ref.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(ref.current);
    }, [value]);
    return <>{display}</>;
}

const roleInfo = {
    ADMIN: {
        icon: '◈',
        color: '#a855f7',
        glow: 'rgba(168,85,247,0.2)',
        title: 'System Administrator',
        subtitle: 'Full platform visibility & control',
        features: [
            { icon: '◉', text: 'Monitor all products, batches & organizations in real time' },
            { icon: '◉', text: 'Audit transaction chains and detect compromised batches' },
            { icon: '◉', text: 'Manage users and access permissions across the network' },
        ]
    },
    MANUFACTURER: {
        icon: '⬡',
        color: '#00c8ff',
        glow: 'rgba(0,200,255,0.2)',
        title: 'Manufacturer',
        subtitle: 'Create products and initialize batch chains',
        features: [
            { icon: '◉', text: 'Register new products with SKU and category metadata' },
            { icon: '◉', text: 'Create batches and generate tamper-proof QR codes' },
            { icon: '◉', text: 'Log initial manufacturing events to the chain' },
        ]
    },
    SHIPPER: {
        icon: '⬢',
        color: '#ffb800',
        glow: 'rgba(255,184,0,0.2)',
        title: 'Logistics Operator',
        subtitle: 'Track and log shipment movements',
        features: [
            { icon: '◉', text: 'Log SHIPPED and IN_TRANSIT events for batches' },
            { icon: '◉', text: 'Update delivery status and destination organizations' },
            { icon: '◉', text: 'View full provenance trail for assigned shipments' },
        ]
    },
    RETAILER: {
        icon: '⬟',
        color: '#00ff87',
        glow: 'rgba(0,255,135,0.2)',
        title: 'Retail Verifier',
        subtitle: 'Authenticate product origins via QR scan',
        features: [
            { icon: '◉', text: 'Scan QR codes to instantly verify product authenticity' },
            { icon: '◉', text: 'View full supply chain history for any batch' },
            { icon: '◉', text: 'Flag suspicious or compromised items for investigation' },
        ]
    }
};

const statConfig = [
    { key: 'totalProducts',      label: 'Products',      color: '#00c8ff', glow: 'rgba(0,200,255,0.15)',   suffix: '' },
    { key: 'totalBatches',       label: 'Batches',       color: '#00ff87', glow: 'rgba(0,255,135,0.15)',   suffix: '' },
    { key: 'totalTransactions',  label: 'Transactions',  color: '#a855f7', glow: 'rgba(168,85,247,0.15)',  suffix: '' },
    { key: 'totalOrganizations', label: 'Organizations', color: '#ffb800', glow: 'rgba(255,184,0,0.15)',   suffix: '' },
    { key: 'totalUsers',         label: 'Users',         color: '#00c8ff', glow: 'rgba(0,200,255,0.15)',   suffix: '' },
    { key: 'compromisedBatches', label: 'Compromised',   color: '#ff3b5c', glow: 'rgba(255,59,92,0.15)',   suffix: '' },
];

function Dashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    const info = roleInfo[role] || roleInfo.RETAILER;

    useEffect(() => {
        if (role === 'ADMIN') {
            getAnalytics()
                .then(res => { setAnalytics(res.data); setLoaded(true); })
                .catch(() => setLoaded(true));
        } else {
            setLoaded(true);
        }
    }, [role]);

    return (
        <div>
            <style>{`
                @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
                @keyframes gridPulse { 0%,100% { opacity:0.03; } 50% { opacity:0.06; } }
                .stat-card-inner { animation: slideUp 0.5s ease both; }
                .feature-item { animation: fadeIn 0.5s ease both; }
            `}</style>

            {/* Welcome hero */}
            <div style={{
                background: `linear-gradient(135deg, ${info.glow} 0%, rgba(2,8,24,0.6) 60%)`,
                border: `1px solid ${info.color}30`,
                borderRadius: 16,
                padding: '36px 40px',
                marginBottom: 24,
                position: 'relative',
                overflow: 'hidden',
                animation: 'slideUp 0.4s ease',
            }}>
                {/* Decorative corner */}
                <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: 200, height: 200,
                    background: `radial-gradient(circle at top right, ${info.glow}, transparent 70%)`,
                    pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, position: 'relative' }}>
                    <div style={{
                        width: 56, height: 56,
                        background: `${info.color}18`,
                        border: `1px solid ${info.color}40`,
                        borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 26, color: info.color,
                        flexShrink: 0,
                        boxShadow: `0 0 20px ${info.glow}`,
                    }}>{info.icon}</div>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: info.color, marginBottom: 6 }}>
                            Welcome back · {email?.split('@')[0]}
                        </div>
                        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 24, fontWeight: 700, color: '#e0f2fe', marginBottom: 6 }}>
                            {info.title}
                        </div>
                        <div style={{ color: '#64748b', fontSize: 14 }}>{info.subtitle}</div>
                    </div>
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14,
                    marginTop: 28,
                }}>
                    {info.features.map((f, i) => (
                        <div key={i} className="feature-item" style={{
                            background: 'rgba(0,0,0,0.25)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 10,
                            padding: '14px 16px',
                            display: 'flex', gap: 10, alignItems: 'flex-start',
                            animationDelay: `${i * 0.1}s`,
                        }}>
                            <span style={{ color: info.color, fontSize: 10, marginTop: 3 }}>▸</span>
                            <span style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{f.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Admin analytics grid */}
            {role === 'ADMIN' && (
                <div>
                    <div style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: '2px',
                        textTransform: 'uppercase', color: '#475569',
                        marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                        <span>Live Analytics</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(0,200,255,0.1)' }} />
                        {analytics && (
                            <span style={{ color: '#00ff87', display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff87', boxShadow: '0 0 6px #00ff87', display: 'inline-block' }} />
                                Live
                            </span>
                        )}
                    </div>

                    {!loaded ? (
                        <div className="loading-center">
                            <div className="spinner" />
                            <span style={{ fontSize: 13 }}>Fetching analytics...</span>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                            {statConfig.map((s, i) => (
                                <div key={s.key} className="stat-card-inner" style={{
                                    background: 'rgba(8,20,40,0.8)',
                                    border: `1px solid ${s.color}25`,
                                    borderRadius: 12,
                                    padding: '22px 24px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'default',
                                    transition: 'all 0.3s',
                                    animationDelay: `${i * 0.08}s`,
                                }}
                                     onMouseEnter={e => {
                                         e.currentTarget.style.borderColor = `${s.color}50`;
                                         e.currentTarget.style.boxShadow = `0 0 24px ${s.glow}, 0 8px 24px rgba(0,0,0,0.4)`;
                                         e.currentTarget.style.transform = 'translateY(-2px)';
                                     }}
                                     onMouseLeave={e => {
                                         e.currentTarget.style.borderColor = `${s.color}25`;
                                         e.currentTarget.style.boxShadow = 'none';
                                         e.currentTarget.style.transform = 'translateY(0)';
                                     }}
                                >
                                    {/* Glow accent */}
                                    <div style={{
                                        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                                        background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
                                        opacity: 0.5,
                                    }} />

                                    <div style={{
                                        fontFamily: 'Orbitron, monospace',
                                        fontSize: 40,
                                        fontWeight: 900,
                                        color: s.color,
                                        lineHeight: 1,
                                        marginBottom: 8,
                                        textShadow: `0 0 20px ${s.color}60`,
                                    }}>
                                        {analytics ? <AnimatedNumber value={analytics[s.key] || 0} /> : '—'}
                                    </div>
                                    <div style={{
                                        fontSize: 11, fontWeight: 700,
                                        letterSpacing: '1px', textTransform: 'uppercase',
                                        color: '#475569',
                                    }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Quick actions footer */}
            <div style={{
                marginTop: 24,
                padding: '20px 24px',
                background: 'rgba(0,200,255,0.03)',
                border: '1px solid rgba(0,200,255,0.08)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ fontSize: 12, color: '#334155' }}>
                    ChainTrack v2.0 · Blockchain Supply Chain Integrity
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#334155' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;