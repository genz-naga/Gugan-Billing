import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ReceiptText,
  Sparkles,
  Boxes,
  FileText,
  Users,
  History,
  RotateCcw,
  Truck,
  Building2,
  BarChart3,
  Settings,
  Lock,
  AlertTriangle
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, currentUser, products, returns } = useApp();

  // Count low stock items
  const lowStockCount = products.filter(
    (p) => p.currentStock <= p.minimumStock
  ).length;

  const menuItems = [
    { id: 'dashboard', label: "Dashboard", tamil: "முகப்பு", icon: LayoutDashboard },
    { id: 'billing', label: "Quick Billing", tamil: "பில்லிங் (F2)", icon: ReceiptText, badge: 'HOT', badgeType: 'primary' },
    { id: 'products', label: "Products Master", tamil: "பட்டாசு ரகம்", icon: Sparkles },
    { id: 'pricelist', label: "Price List", tamil: "விலைப்பட்டியல்", icon: FileText },
    {
      id: 'stock',
      label: "Stock & Alerts",
      tamil: "இருப்பு விவரம்",
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeType: 'danger'
    },
    { id: 'customers', label: "Customers", tamil: "வாடிக்கையாளர்", icon: Users },
    { id: 'sales', label: "Sales History", tamil: "விற்பனை வரலாறு", icon: History },
    {
      id: 'returns',
      label: "Sales Return",
      tamil: "பொருள் ரிட்டன்",
      icon: RotateCcw,
      badge: returns.length > 0 ? `${returns.length}` : null,
      badgeType: 'neutral'
    },
    { id: 'purchases', label: "Stock Inward", tamil: "கொள்முதல்", icon: Truck },
    { id: 'suppliers', label: "Suppliers", tamil: "சப்ளையர்கள்", icon: Building2 },
    {
      id: 'reports',
      label: "Reports & Profit",
      tamil: "அறிக்கைகள் & லாபம்",
      icon: BarChart3,
      adminOnly: true
    },
    {
      id: 'settings',
      label: "Shop Settings",
      tamil: "அமைப்புகள்",
      icon: Settings,
      adminOnly: true
    }
  ];

  return (
    <aside style={{
      width: '240px',
      background: '#ffffff',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      userSelect: 'none'
    }}>
      {/* Navigation List */}
      <nav style={{ padding: '0.85rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        <div style={{
          padding: '0.25rem 0.75rem 0.5rem',
          fontSize: '0.7rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-light)'
        }}>
          Main Navigation
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isLocked = item.adminOnly && currentUser.role !== 'admin';

          return (
            <button
              key={item.id}
              disabled={isLocked}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 600,
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : (isLocked ? 'var(--text-light)' : 'var(--text-secondary)'),
                border: isActive ? '1px solid #fed7aa' : '1px solid transparent',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isLocked) {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && !isLocked) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Icon
                  size={18}
                  color={isActive ? 'var(--primary)' : (isLocked ? '#cbd5e1' : '#64748b')}
                />
                <div>
                  <div style={{ lineHeight: 1.2 }}>{item.label}</div>
                  <div style={{ fontSize: '0.7rem', color: isLocked ? '#cbd5e1' : 'var(--text-light)', fontWeight: 500 }}>
                    {item.tamil}
                  </div>
                </div>
              </div>

              {isLocked ? (
                <Lock size={13} color="#cbd5e1" title="Admin only" />
              ) : item.badge ? (
                <span className={`badge badge-${item.badgeType}`} style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Low Stock Warning Banner in Sidebar */}
      {lowStockCount > 0 && (
        <div style={{
          margin: '0.75rem',
          padding: '0.75rem',
          background: 'var(--danger-light)',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontWeight: 700, fontSize: '0.8rem' }}>
            <AlertTriangle size={15} />
            <span>Low Stock Alert!</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#991b1b', margin: 0 }}>
            {lowStockCount} items below minimum stock.
          </p>
          <button
            onClick={() => setActiveTab('stock')}
            className="btn btn-sm"
            style={{
              background: '#ffffff',
              color: 'var(--danger)',
              border: '1px solid #fca5a5',
              fontSize: '0.72rem',
              padding: '0.2rem 0.5rem',
              marginTop: '0.25rem'
            }}
          >
            Review Stock
          </button>
        </div>
      )}

      {/* System Status Footer */}
      <div style={{
        padding: '0.85rem',
        borderTop: '1px solid var(--border-color)',
        background: '#fcfdfe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
          <span style={{ fontWeight: 600 }}>POS Online</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>v2.4 Pro</span>
      </div>
    </aside>
  );
};
