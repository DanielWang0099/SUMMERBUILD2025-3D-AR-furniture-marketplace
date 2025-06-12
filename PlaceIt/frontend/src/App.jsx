import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Sell from './pages/Sell';
import Login from './pages/Login';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Toast from './components/UI/Toast';
import { useApp } from './context/AppContext';
import './App.css';

function AppContent() {
  const { toast, hideToast } = useApp();

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          {/* Add more routes as needed */}
          <Route path="*" element={<div className="min-h-screen bg-white flex items-center justify-center"><h1 className="text-2xl">Page Not Found</h1></div>} />
        </Routes>
      </Layout>
      
      {/* Global Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={!!toast}
          onClose={hideToast}
        />
      )}
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
