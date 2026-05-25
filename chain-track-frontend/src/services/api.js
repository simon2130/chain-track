import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({ baseURL: BASE_URL });

// Attach token to every request automatically
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auth
export const login = (email, password) =>
    api.post('/api/auth/login', { email, password });

export const register = (data) =>
    api.post('/api/auth/register', data);

export const logout = () =>
    api.post('/api/auth/logout');

// Products
export const getProducts = (page = 0) =>
    api.get(`/api/products?page=${page}`);

export const createProduct = (data) =>
    api.post('/api/products', data);

export const searchProducts = (params) =>
    api.get('/api/products/search', { params });

// Batches
export const createBatch = (data) =>
    api.post('/api/batches', data);

export const getBatch = (id) =>
    api.get(`/api/batches/${id}`);

export const generateQR = (batchId) =>
    api.post(`/api/batches/${batchId}/qr`);

// Transactions
export const logTransaction = (data) =>
    api.post('/api/transactions', data);

export const getTransactions = (batchId) =>
    api.get(`/api/transactions/batch/${batchId}`);

// Verify
export const verifyChain = (token) =>
    api.get(`/api/verify/${token}`);

// Admin
export const getAnalytics = () =>
    api.get('/api/admin/analytics');

export const getUsers = () =>
    api.get('/api/admin/users');

// Organizations
export const getOrganizations = () =>
    api.get('/api/organizations');