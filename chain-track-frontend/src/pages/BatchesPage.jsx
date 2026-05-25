import { useState } from 'react';
import { createBatch, generateQR, getBatch, logTransaction, getTransactions } from '../services/api';

const statusConfig = {
    CREATED:    { badge: 'badge-blue',   label: 'Created',    icon: '○', color: '#00c8ff' },
    IN_TRANSIT: { badge: 'badge-yellow', label: 'In Transit', icon: '◎', color: '#ffb800' },
    DELIVERED:  { badge: 'badge-green',  label: 'Delivered',  icon: '●', color: '#00ff87' },
    COMPROMISED:{ badge: 'badge-red',    label: 'Compromised',icon: '✕', color: '#ff3b5c' },
};

const eventConfig = {
    MANUFACTURED: { color: '#00c8ff', icon: '⬡' },
    SHIPPED:      { color: '#ffb800', icon: '▶' },
    IN_TRANSIT:   { color: '#a855f7', icon: '◎' },
    RECEIVED:     { color: '#00ff87', icon: '✓' },
};

function BatchesPage() {
    const [batchForm, setBatchForm] = useState({ productId: '', quantity: '', manufacturedDate: '', expiryDate: '' });
    const [batchId, setBatchId] = useState('');
    const [batch, setBatch] = useState(null);
    const [qrImage, setQrImage] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [txForm, setTxForm] = useState({ eventType: 'SHIPPED', toOrgId: '', notes: '' });
    const [message, setMessage] = useState('');
    const [creating, setCreating] = useState(false);
    const [loadingBatch, setLoadingBatch] = useState(false);
    const [loggingTx, setLoggingTx] = useState(false);
    const [generatingQR, setGeneratingQR] = useState(false);
    const role = localStorage.getItem('role');

    const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 4000); };
    const isError = message.startsWith('✗');

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await createBatch({
                productId: parseInt(batchForm.productId),
                quantity: parseInt(batchForm.quantity),
                manufacturedDate: batchForm.manufacturedDate,
                expiryDate: batchForm.expiryDate || null,
            });
            showMsg(`✓ Batch created! ID: ${res.data.id} · Batch #${res.data.batchNumber}`);
            setBatchForm({ productId: '', quantity: '', manufacturedDate: '', expiryDate: '' });
        } catch (err) {
            showMsg('✗ ' + (err.response?.data?.message || 'Error creating batch'));
        } finally { setCreating(false); }
    };

    const handleLoadBatch = async () => {
        if (!batchId) return;
        setLoadingBatch(true);
        setBatch(null); setQrImage(null); setTransactions([]);
        try {
            const res = await getBatch(batchId);
            setBatch(res.data);
            if (res.data.qrToken) setQrImage(res.data.qrToken.qrImageBase64);
            const txRes = await getTransactions(batchId);
            setTransactions(txRes.data.content || []);
        } catch {
            showMsg('✗ Batch not found');
        } finally { setLoadingBatch(false); }
    };

    const handleGenerateQR = async () => {
        setGeneratingQR(true);
        try {
            const res = await generateQR(batchId);
            setQrImage(res.data.qrImageBase64);
            showMsg('✓ QR code generated successfully!');
        } catch (err) {
            showMsg('✗ ' + (err.response?.data?.message || 'Error generating QR'));
        } finally { setGeneratingQR(false); }
    };

    const handleLogTransaction = async (e) => {
        e.preventDefault();
        setLoggingTx(true);
        try {
            await logTransaction({
                batchId: parseInt(batchId),
                eventType: txForm.eventType,
                toOrgId: parseInt(txForm.toOrgId),
                notes: txForm.notes,
            });
            showMsg('✓ Movement event logged to chain!');
            handleLoadBatch();
        } catch (err) {
            showMsg('✗ ' + (err.response?.data?.message || 'Error logging transaction'));
        } finally { setLoggingTx(false); }
    };

    const sc = batch ? (statusConfig[batch.status] || statusConfig.CREATED) : null;

    return (
        <div>
            <style>{`
                @keyframes qrReveal { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
                @keyframes chainIn  { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
                .tx-row { animation: chainIn 0.3s ease both; }
            `}</style>

            <div className="page-header">
                <div>
                    <div className="page-title">Batch Management</div>
                    <div className="page-subtitle">Create, track, and log supply chain events</div>
                </div>
            </div>

            {message && (
                <div className={`alert ${isError ? 'alert-error' : 'alert-success'}`}>{message}</div>
            )}

            {/* Create Batch */}
            {(role === 'MANUFACTURER' || role === 'ADMIN') && (
                <div className="card">
                    <div className="section-title">Create New Batch</div>
                    <form onSubmit={handleCreateBatch}>
                        <div className="form-grid">
                            <div>
                                <label>Product ID</label>
                                <input
                                    value={batchForm.productId}
                                    onChange={e => setBatchForm({...batchForm, productId: e.target.value})}
                                    placeholder="42" required
                                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                                />
                            </div>
                            <div>
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    value={batchForm.quantity}
                                    onChange={e => setBatchForm({...batchForm, quantity: e.target.value})}
                                    placeholder="500" required
                                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                                />
                            </div>
                            <div>
                                <label>Manufactured Date</label>
                                <input type="date" value={batchForm.manufacturedDate} onChange={e => setBatchForm({...batchForm, manufacturedDate: e.target.value})} required />
                            </div>
                            <div>
                                <label>Expiry Date <span style={{ color: '#334155', fontWeight: 400 }}>(optional)</span></label>
                                <input type="date" value={batchForm.expiryDate} onChange={e => setBatchForm({...batchForm, expiryDate: e.target.value})} />
                            </div>
                            <div className="full">
                                <button type="submit" className="btn btn-primary" disabled={creating}
                                        style={{ opacity: creating ? 0.7 : 1 }}>
                                    {creating ? 'Creating Batch...' : '+ Initialize Batch'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Search batch */}
            <div className="card">
                <div className="section-title">Load Batch by ID</div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <input
                        value={batchId}
                        onChange={e => setBatchId(e.target.value)}
                        placeholder="Enter Batch ID..."
                        style={{ marginBottom: 0, fontFamily: 'JetBrains Mono, monospace', flex: 1 }}
                        onKeyDown={e => e.key === 'Enter' && handleLoadBatch()}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={handleLoadBatch}
                        disabled={loadingBatch || !batchId}
                        style={{ whiteSpace: 'nowrap', opacity: (!batchId || loadingBatch) ? 0.6 : 1 }}
                    >
                        {loadingBatch ? 'Loading...' : 'Fetch Batch →'}
                    </button>
                </div>
            </div>

            {loadingBatch && (
                <div className="loading-center"><div className="spinner" /><span>Fetching batch data...</span></div>
            )}

            {batch && (
                <>
                    {/* Batch details */}
                    <div className="card" style={{ borderColor: `${sc.color}30` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div className="section-title" style={{ marginBottom: 0 }}>Batch Details</div>
                            <span className={`badge ${sc.badge}`}>
                                {sc.icon} {sc.label}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
                            {[
                                { label: 'Batch Number', value: batch.batchNumber, mono: true },
                                { label: 'Quantity', value: batch.quantity?.toLocaleString() },
                                { label: 'Manufactured', value: batch.manufacturedDate },
                                { label: 'Expires', value: batch.expiryDate || 'N/A' },
                            ].map(f => (
                                <div key={f.label} style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: 8,
                                    padding: '12px 16px',
                                    border: '1px solid rgba(255,255,255,0.04)',
                                }}>
                                    <div style={{ fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', color: '#475569', marginBottom: 6, fontWeight: 600 }}>{f.label}</div>
                                    <div style={{ fontFamily: f.mono ? 'JetBrains Mono, monospace' : 'inherit', color: '#e0f2fe', fontSize: 14, fontWeight: 500 }}>{f.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* QR section */}
                        <div style={{ borderTop: '1px solid rgba(0,200,255,0.08)', paddingTop: 20 }}>
                            {(role === 'MANUFACTURER' || role === 'ADMIN') && !qrImage && (
                                <button className="btn btn-success" onClick={handleGenerateQR} disabled={generatingQR}>
                                    {generatingQR ? 'Generating...' : '⬡ Generate QR Code'}
                                </button>
                            )}
                            {qrImage && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 24, animation: 'qrReveal 0.4s ease' }}>
                                    <div style={{
                                        padding: 12,
                                        background: 'white',
                                        borderRadius: 10,
                                        boxShadow: '0 0 30px rgba(0,200,255,0.15)',
                                    }}>
                                        <img src={`data:image/png;base64,${qrImage}`} alt="QR Code" style={{ width: 140, display: 'block' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#00ff87', marginBottom: 8 }}>
                                            ✓ QR Code Active
                                        </div>
                                        <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, maxWidth: 280 }}>
                                            Scan to instantly verify batch authenticity. Links directly to the immutable chain record.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Log movement */}
                    <div className="card">
                        <div className="section-title">Log Movement Event</div>
                        <form onSubmit={handleLogTransaction}>
                            <div className="form-grid">
                                <div>
                                    <label>Event Type</label>
                                    <select value={txForm.eventType} onChange={e => setTxForm({...txForm, eventType: e.target.value})}>
                                        {role === 'MANUFACTURER' && <option value="MANUFACTURED">MANUFACTURED</option>}
                                        {(role === 'SHIPPER' || role === 'ADMIN') && <option value="SHIPPED">SHIPPED</option>}
                                        {(role === 'SHIPPER' || role === 'ADMIN') && <option value="IN_TRANSIT">IN_TRANSIT</option>}
                                        {(role === 'RETAILER' || role === 'ADMIN') && <option value="RECEIVED">RECEIVED</option>}
                                        {role === 'ADMIN' && <option value="MANUFACTURED">MANUFACTURED</option>}
                                    </select>
                                </div>
                                <div>
                                    <label>To Organization ID</label>
                                    <input
                                        value={txForm.toOrgId}
                                        onChange={e => setTxForm({...txForm, toOrgId: e.target.value})}
                                        placeholder="Organization ID"
                                        required
                                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                                    />
                                </div>
                                <div className="full">
                                    <label>Notes</label>
                                    <input value={txForm.notes} onChange={e => setTxForm({...txForm, notes: e.target.value})} placeholder="Optional notes about this movement..." />
                                </div>
                                <div className="full">
                                    <button type="submit" className="btn btn-primary" disabled={loggingTx}
                                            style={{ opacity: loggingTx ? 0.7 : 1 }}>
                                        {loggingTx ? 'Writing to chain...' : '▶ Log to Chain'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Transaction history */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px 0' }}>
                            <div className="section-title" style={{ marginBottom: 0 }}>
                                Chain History
                                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                                    {transactions.length} event{transactions.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {transactions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#334155' }}>
                                <div style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase' }}>No chain events yet</div>
                            </div>
                        ) : (
                            <div style={{ padding: '16px 24px 24px' }}>
                                {transactions.map((tx, i) => {
                                    const ec = eventConfig[tx.eventType] || { color: '#94a3b8', icon: '○' };
                                    return (
                                        <div key={tx.id} className="tx-row" style={{
                                            display: 'flex', gap: 16, alignItems: 'flex-start',
                                            padding: '14px 0',
                                            borderBottom: i < transactions.length - 1 ? '1px solid rgba(0,200,255,0.06)' : 'none',
                                            animationDelay: `${i * 0.06}s`,
                                        }}>
                                            {/* Chain dot and line */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 2 }}>
                                                <div style={{
                                                    width: 32, height: 32,
                                                    borderRadius: '50%',
                                                    background: `${ec.color}18`,
                                                    border: `1px solid ${ec.color}40`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 14, color: ec.color, flexShrink: 0,
                                                }}>{ec.icon}</div>
                                                {i < transactions.length - 1 && (
                                                    <div style={{ width: 1, flex: 1, marginTop: 4, background: 'linear-gradient(180deg, rgba(0,200,255,0.2), transparent)', minHeight: 20 }} />
                                                )}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                    <span className="badge" style={{ background: `${ec.color}18`, color: ec.color, border: `1px solid ${ec.color}30` }}>
                                                        {tx.eventType}
                                                    </span>
                                                    <span className="mono" style={{ fontSize: 11, color: '#475569' }}>
                                                        {new Date(tx.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#64748b', marginTop: 6 }}>
                                                    <span>From: <strong style={{ color: '#94a3b8' }}>{tx.fromOrg?.name || '—'}</strong></span>
                                                    <span style={{ color: '#334155' }}>→</span>
                                                    <span>To: <strong style={{ color: '#94a3b8' }}>{tx.toOrg?.name || '—'}</strong></span>
                                                    <span style={{ marginLeft: 'auto' }}>By: <strong style={{ color: '#94a3b8' }}>{tx.performedBy?.email}</strong></span>
                                                </div>
                                                {tx.notes && (
                                                    <div style={{ fontSize: 12, color: '#475569', marginTop: 6, fontStyle: 'italic' }}>"{tx.notes}"</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default BatchesPage;