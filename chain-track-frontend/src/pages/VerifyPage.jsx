import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { verifyChain } from '../services/api';

function VerifyPage() {
    const { token } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scanProgress, setScanProgress] = useState(0);

    useEffect(() => {
        // Animated progress bar
        const interval = setInterval(() => {
            setScanProgress(p => Math.min(p + 8, 90));
        }, 100);

        verifyChain(token)
            .then(res => { setResult(res.data); setScanProgress(100); })
            .catch(() => { setResult({ valid: false, message: 'Token not found or invalid' }); setScanProgress(100); })
            .finally(() => { setLoading(false); clearInterval(interval); });

        return () => clearInterval(interval);
    }, [token]);

    const valid = result?.valid;

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
        }}>
            <style>{`
                @keyframes scanLine { 0% { top: 0; } 100% { top: 100%; } }
                @keyframes verifyIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
                @keyframes ripple { 0% { transform:scale(0.8); opacity:0.8; } 100% { transform:scale(2.5); opacity:0; } }
                @keyframes checkDraw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
            `}</style>

            <div style={{ width: '100%', maxWidth: 560 }}>
                {/* Brand */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 18, fontWeight: 700, color: '#e0f2fe', letterSpacing: 2 }}>
                        CHAIN<span style={{ color: '#00c8ff' }}>TRACK</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#334155', marginTop: 4, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        Product Verification Portal
                    </div>
                </div>

                {loading ? (
                    <div style={{
                        background: 'rgba(8,20,40,0.9)',
                        border: '1px solid rgba(0,200,255,0.2)',
                        borderRadius: 16,
                        padding: '48px 40px',
                        textAlign: 'center',
                        backdropFilter: 'blur(20px)',
                    }}>
                        {/* Scanning icon */}
                        <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 28px' }}>
                            <div style={{
                                width: 80, height: 80,
                                borderRadius: '50%',
                                border: '2px solid rgba(0,200,255,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                            }}>
                                <span style={{ fontSize: 32 }}>⛓</span>
                                <div style={{
                                    position: 'absolute', left: 0, right: 0, height: 2,
                                    background: 'linear-gradient(90deg, transparent, #00c8ff, transparent)',
                                    animation: 'scanLine 1.5s ease-in-out infinite',
                                }} />
                            </div>
                        </div>

                        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 15, color: '#00c8ff', marginBottom: 8, letterSpacing: '1px' }}>
                            Verifying Chain Integrity
                        </div>
                        <div style={{ fontSize: 13, color: '#475569', marginBottom: 24 }}>
                            Cross-referencing blockchain records...
                        </div>

                        {/* Progress bar */}
                        <div style={{
                            background: 'rgba(0,200,255,0.08)',
                            borderRadius: 999, height: 4, overflow: 'hidden',
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${scanProgress}%`,
                                background: 'linear-gradient(90deg, #0078c8, #00c8ff)',
                                borderRadius: 999,
                                transition: 'width 0.2s ease',
                                boxShadow: '0 0 10px rgba(0,200,255,0.5)',
                            }} />
                        </div>
                        <div className="mono" style={{ fontSize: 11, color: '#334155', marginTop: 8 }}>{scanProgress}%</div>
                    </div>
                ) : (
                    <div style={{
                        background: 'rgba(8,20,40,0.9)',
                        border: `1px solid ${valid ? 'rgba(0,255,135,0.25)' : 'rgba(255,59,92,0.25)'}`,
                        borderRadius: 16,
                        overflow: 'hidden',
                        backdropFilter: 'blur(20px)',
                        animation: 'verifyIn 0.5s ease',
                        boxShadow: valid
                            ? '0 0 40px rgba(0,255,135,0.08), 0 40px 80px rgba(0,0,0,0.5)'
                            : '0 0 40px rgba(255,59,92,0.08), 0 40px 80px rgba(0,0,0,0.5)',
                    }}>
                        {/* Status banner */}
                        <div style={{
                            background: valid
                                ? 'linear-gradient(135deg, rgba(0,255,135,0.08), rgba(0,255,135,0.03))'
                                : 'linear-gradient(135deg, rgba(255,59,92,0.1), rgba(255,59,92,0.03))',
                            borderBottom: `1px solid ${valid ? 'rgba(0,255,135,0.15)' : 'rgba(255,59,92,0.15)'}`,
                            padding: '32px 40px',
                            textAlign: 'center',
                        }}>
                            {/* Big status icon */}
                            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
                                <div style={{
                                    width: 72, height: 72, borderRadius: '50%',
                                    background: valid ? 'rgba(0,255,135,0.12)' : 'rgba(255,59,92,0.12)',
                                    border: `2px solid ${valid ? 'rgba(0,255,135,0.4)' : 'rgba(255,59,92,0.4)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 32,
                                    boxShadow: valid ? '0 0 30px rgba(0,255,135,0.25)' : '0 0 30px rgba(255,59,92,0.25)',
                                    position: 'relative', zIndex: 1,
                                }}>
                                    {valid ? '✓' : '✕'}
                                </div>
                                {/* Ripple */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    borderRadius: '50%',
                                    border: `2px solid ${valid ? 'rgba(0,255,135,0.3)' : 'rgba(255,59,92,0.3)'}`,
                                    animation: 'ripple 2s ease-out infinite',
                                }} />
                            </div>

                            <div style={{
                                fontFamily: 'Orbitron, monospace',
                                fontSize: 20, fontWeight: 700,
                                color: valid ? '#00ff87' : '#ff3b5c',
                                marginBottom: 8,
                            }}>
                                {valid ? 'Chain Verified' : 'Chain COMPROMISED'}
                            </div>
                            <div style={{
                                fontSize: 14,
                                color: valid ? 'rgba(0,255,135,0.6)' : 'rgba(255,59,92,0.6)',
                            }}>
                                {valid ? 'Authentic Product — Integrity Intact' : 'Possible Fraud — Do Not Accept'}
                            </div>
                        </div>

                        {/* Details */}
                        <div style={{ padding: '28px 40px' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#334155', marginBottom: 16 }}>
                                Chain Record
                            </div>

                            {result.batchNumber ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[
                                        { label: 'Batch Number', value: result.batchNumber, mono: true },
                                        { label: 'Status', value: result.batchStatus },
                                        { label: 'Transactions in Chain', value: result.transactionCount },
                                        { label: 'Verification Message', value: result.message },
                                    ].filter(f => f.value !== undefined).map(f => (
                                        <div key={f.label} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '10px 14px',
                                            background: 'rgba(0,0,0,0.2)',
                                            borderRadius: 8,
                                            border: '1px solid rgba(255,255,255,0.04)',
                                        }}>
                                            <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{f.label}</span>
                                            <span style={{
                                                fontSize: 13, color: '#e0f2fe', fontWeight: 500,
                                                fontFamily: f.mono ? 'JetBrains Mono, monospace' : 'inherit',
                                            }}>{f.value}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    padding: '16px', borderRadius: 8,
                                    background: 'rgba(255,59,92,0.06)',
                                    border: '1px solid rgba(255,59,92,0.15)',
                                    color: '#ff3b5c', fontSize: 13,
                                }}>
                                    {result.message}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 40px',
                            borderTop: '1px solid rgba(0,200,255,0.06)',
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: 11, color: '#334155',
                        }}>
                            <span>Verified at {new Date().toLocaleTimeString()}</span>
                            <span className="mono" style={{ color: '#1e3a5f' }}>{token?.slice(0, 16)}...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyPage;