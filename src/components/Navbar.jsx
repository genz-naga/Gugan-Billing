import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  UserCheck,
  Shield,
  Clock,
  Printer,
  PlusCircle,
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const Navbar = () => {
  const { currentUser, switchRole, shop, setActiveTab, resetData } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-xs)'
    }}>
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xs)'
        }}>
          {shop.logo ? (
            <img
              src={shop.logo}
              alt={shop.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <span style={{ fontSize: '1.4rem' }}>🧨</span>
          )}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              {shop.name || 'Shri Gugan Crackers'}
            </h1>
            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
              {shop.city || 'Sivakasi'}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
            {shop.tamilName} • {shop.mobile}
          </p>
        </div>
      </div>

      {/* Center Shortcuts & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <button
          onClick={() => setActiveTab('billing')}
          className="btn btn-primary btn-sm"
          style={{ gap: '0.4rem', fontWeight: 700 }}
          title="F2: Open Quick Billing"
        >
          <Sparkles size={15} />
          <span>Quick Billing</span>
          <span className="kbd" style={{ background: 'rgba(255,255,255,0.25)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}>F2</span>
        </button>

        <button
          onClick={() => setActiveTab('pricelist')}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.4rem' }}
          title="View Crackers Price List"
        >
          <FileText size={15} color="var(--primary)" />
          <span>Price List</span>
        </button>
      </div>

      {/* Right Controls: Clock, Role Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Real-time Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.75rem',
          background: '#f8fafc',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          fontWeight: 600
        }}>
          <Clock size={14} color="var(--primary)" />
          <span>{formatDate(currentTime.toISOString())}</span>
          <span style={{ color: 'var(--text-light)' }}>|</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{timeString}</span>
        </div>

        {/* Role Switcher Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#f1f5f9',
          borderRadius: 'var(--radius-full)',
          padding: '2px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => switchRole('admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              background: currentUser.role === 'admin' ? '#ffffff' : 'transparent',
              color: currentUser.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: currentUser.role === 'admin' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Shield size={13} />
            <span>Admin</span>
          </button>
          <button
            onClick={() => switchRole('cashier')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              background: currentUser.role === 'cashier' ? '#ffffff' : 'transparent',
              color: currentUser.role === 'cashier' ? 'var(--accent-blue)' : 'var(--text-muted)',
              boxShadow: currentUser.role === 'cashier' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <UserCheck size={13} />
            <span>Staff / Cashier</span>
          </button>
        </div>
      </div>
    </header>
  );
};
