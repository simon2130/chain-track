import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { jwtDecode } from 'jwt-decode';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [particles, setParticles] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const pts = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            dur: Math.random() * 8 + 6,
            delay: Math.random() * 5,
        }));
        setParticles(pts);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(email, password);
            const token = res.data.token;
            const decoded = jwtDecode(token);
            localStorage.setItem('token', token);
            localStorage.setItem('email', email);
            localStorage.setItem('role', decoded.role || '');
            navigate('/');
        } catch {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Animated particles */}
            {particles.map(p => (
                <div key={p.id} style={{
                    position: 'absolute',
                    left: `${p.x}%`, top: `${p.y}%`,
                    width: p.size, height: p.size,
                    borderRadius: '50%',
                    background: '#00c8ff',
                    opacity: 0.3,
                    animation: `float ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
                    pointerEvents: 'none',
                }} />
            ))}

            {/* Glow orbs */}
            <div style={{
                position: 'absolute', width: 400, height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,200,255,0.08) 0%, transparent 70%)',
                top: '10%', left: '20%',
                animation: 'orb1 10s ease-in-out infinite alternate',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', width: 300, height: 300,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
                bottom: '10%', right: '20%',
                animation: 'orb2 12s ease-in-out infinite alternate',
                pointerEvents: 'none',
            }} />

            <style>{`
                @keyframes float { from { transform: translateY(0); } to { transform: translateY(-20px); } }
                @keyframes orb1 { from { transform: translate(0,0); } to { transform: translate(40px, 30px); } }
                @keyframes orb2 { from { transform: translate(0,0); } to { transform: translate(-30px, -20px); } }
                @keyframes shimmer { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
            `}</style>

            {/* Card */}
            <div style={{
                width: 420,
                background: 'rgba(8,20,40,0.9)',
                border: '1px solid rgba(0,200,255,0.2)',
                borderRadius: 16,
                padding: '44px 40px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 60px rgba(0,200,255,0.08), 0 40px 80px rgba(0,0,0,0.6)',
                animation: 'cardIn 0.6s ease both',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Top glow line */}
                <div style={{
                    position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
                    background: 'linear-gradient(90deg, transparent, #00c8ff, transparent)',
                    animation: 'shimmer 3s ease infinite',
                }} />

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{
                        width: 60, height: 60,
                        background: 'linear-gradient(135deg, #004080, #0078c8, #00c8ff)',
                        borderRadius: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, margin: '0 auto 16px',
                        boxShadow: '0 0 30px rgba(0,200,255,0.35)',
                    }}>⛓</div>
                    <div style={{
                        fontFamily: 'Orbitron, monospace',
                        fontSize: 22, fontWeight: 900,
                        color: '#e0f2fe', letterSpacing: '2px',
                    }}>
                        CHAIN<span style={{ color: '#00c8ff' }}>TRACK</span>
                    </div>
                    <div style={{ color: '#475569', fontSize: 12, marginTop: 6, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        Supply Chain Integrity Platform
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 20 }}>
                        <span>⚠</span> {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: 4 }}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="operator@chain.io"
                            required
                            style={{ marginBottom: 16 }}
                        />
                    </div>
                    <div style={{ marginBottom: 4 }}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{ marginBottom: 24 }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '13px',
                            fontSize: 15,
                            letterSpacing: '0.5px',
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <span style={{
                                    width: 16, height: 16,
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    animation: 'spin 0.7s linear infinite',
                                }} />
                                Authenticating...
                            </span>
                        ) : 'Access System →'}
                    </button>
                </form>

                <div style={{
                    marginTop: 24,
                    textAlign: 'center',
                    fontSize: 11,
                    color: '#334155',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                    <span style={{ width: 6, height: 6, background: '#00ff87', borderRadius: '50%', boxShadow: '0 0 6px #00ff87' }} />
                    All connections encrypted · v2.0
                </div>
            </div>
        </div>
    );
}

export default LoginPage;