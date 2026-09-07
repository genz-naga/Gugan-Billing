import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Billing } from './components/Billing';
import { Products } from './components/Products';
import { PriceList } from './components/PriceList';
import { Stock } from './components/Stock';
import { Customers } from './components/Customers';
import { SalesHistory } from './components/SalesHistory';
import { SalesReturn } from './components/SalesReturn';
import { Purchases } from './components/Purchases';
import { Suppliers } from './components/Suppliers';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';

const AppContent = () => {
  const { activeTab, toast } = useApp();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'billing':
        return <Billing />;
      case 'products':
        return <Products />;
      case 'pricelist':
        return <PriceList />;
      case 'stock':
        return <Stock />;
      case 'customers':
        return <Customers />;
      case 'sales':
        return <SalesHistory />;
      case 'returns':
        return <SalesReturn />;
      case 'purchases':
        return <Purchases />;
      case 'suppliers':
        return <Suppliers />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Billing />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar />

        <main className="content-body">
          {renderActiveTab()}
        </main>
      </div>

      {/* Global Invoice Print Preview Modal */}
      <InvoicePrintModal />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: '#ffffff',
            boxShadow: 'var(--shadow-xl)',
            border:
              toast.type === 'success'
                ? '1px solid #86efac'
                : toast.type === 'error'
                ? '1px solid #fca5a5'
                : toast.type === 'warning'
                ? '1px solid #fde68a'
                : '1px solid #93c5fd',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={18} color="var(--success)" />}
          {toast.type === 'error' && <XCircle size={18} color="var(--danger)" />}
          {toast.type === 'warning' && <AlertCircle size={18} color="var(--warning)" />}
          {toast.type === 'info' && <Info size={18} color="var(--accent-blue)" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
