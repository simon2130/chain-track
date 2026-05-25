import { useState, useEffect } from 'react';
import { getProducts, createProduct } from '../services/api';

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', sku: '', category: '' });
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const role = localStorage.getItem('role');

    const loadProducts = () => {
        setLoading(true);
        getProducts()
            .then(res => setProducts(res.data.content || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadProducts(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createProduct(form);
            setMessage('✓ Product registered successfully!');
            setForm({ name: '', description: '', sku: '', category: '' });
            setShowForm(false);
            loadProducts();
        } catch (err) {
            setMessage('✗ ' + (err.response?.data?.message || 'Error creating product'));
        } finally {
            setSubmitting(false);
        }
    };

    const isError = message.startsWith('✗');

    const categoryColors = {
        Electronics: '#00c8ff', Food: '#00ff87', Pharma: '#a855f7',
        Clothing: '#ffb800', Chemical: '#ff3b5c',
    };
    const getCatColor = (cat) => categoryColors[cat] || '#94a3b8';

    return (
        <div>
            <style>{`
                @keyframes rowIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
                @keyframes formSlide { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
            `}</style>

            {/* Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">Products</div>
                    <div className="page-subtitle">{products.length} registered product{products.length !== 1 ? 's' : ''} in the network</div>
                </div>
                {(role === 'MANUFACTURER' || role === 'ADMIN') && (
                    <button
                        className={showForm ? 'btn btn-ghost' : 'btn btn-primary'}
                        onClick={() => { setShowForm(!showForm); setMessage(''); }}
                    >
                        {showForm ? '✕ Cancel' : '+ Register Product'}
                    </button>
                )}
            </div>

            {message && (
                <div className={`alert ${isError ? 'alert-error' : 'alert-success'}`}>
                    {message}
                </div>
            )}

            {/* Create form */}
            {showForm && (
                <div className="card" style={{ animation: 'formSlide 0.3s ease', borderColor: 'rgba(0,200,255,0.25)' }}>
                    <div className="section-title">Register New Product</div>
                    <form onSubmit={handleCreate}>
                        <div className="form-grid">
                            <div>
                                <label>Product Name</label>
                                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Premium Vitamin C 1000mg" required />
                            </div>
                            <div>
                                <label>SKU</label>
                                <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} placeholder="VC-1000-MG-250" required style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                            </div>
                            <div>
                                <label>Category</label>
                                <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Pharma" required />
                            </div>
                            <div>
                                <label>Description (optional)</label>
                                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief product description" />
                            </div>
                            <div className="full" style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" className="btn btn-primary" disabled={submitting}
                                        style={{ opacity: submitting ? 0.7 : 1 }}>
                                    {submitting ? 'Creating...' : 'Create Product'}
                                </button>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div className="loading-center"><div className="spinner" /><span>Loading products...</span></div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#334155' }}>
                        <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.4 }}>⬡</div>
                        <div style={{ fontSize: 14 }}>No products registered yet</div>
                        {(role === 'MANUFACTURER' || role === 'ADMIN') && (
                            <div style={{ fontSize: 12, marginTop: 8 }}>Click <strong style={{ color: '#00c8ff' }}>Register Product</strong> to get started</div>
                        )}
                    </div>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th style={{ paddingLeft: 24 }}>ID</th>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Category</th>
                            <th>Created By</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((p, i) => (
                            <tr key={p.id} style={{ animation: `rowIn 0.3s ease ${i * 0.04}s both` }}>
                                <td style={{ paddingLeft: 24 }}>
                                    <span className="mono" style={{ color: '#475569' }}>#{p.id}</span>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600, color: '#e0f2fe', fontSize: 14 }}>{p.name}</div>
                                    {p.description && (
                                        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{p.description}</div>
                                    )}
                                </td>
                                <td>
                                    <span className="badge badge-blue mono">{p.sku}</span>
                                </td>
                                <td>
                                        <span style={{
                                            fontSize: 12, fontWeight: 600,
                                            color: getCatColor(p.category),
                                            background: `${getCatColor(p.category)}18`,
                                            border: `1px solid ${getCatColor(p.category)}30`,
                                            padding: '3px 10px', borderRadius: 6,
                                        }}>{p.category}</span>
                                </td>
                                <td style={{ fontSize: 12, color: '#475569' }}>{p.createdByEmail}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default ProductsPage;