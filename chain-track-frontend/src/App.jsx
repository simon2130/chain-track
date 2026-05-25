import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import BatchesPage from './pages/BatchesPage';
import VerifyPage from './pages/VerifyPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify/:token" element={<VerifyPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Navbar />
              <div className="container">
                <Dashboard />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <Navbar />
              <div className="container">
                <ProductsPage />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/batches" element={
            <ProtectedRoute>
              <Navbar />
              <div className="container">
                <BatchesPage />
              </div>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;