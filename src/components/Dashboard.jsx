import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Receipt,
  Boxes,
  AlertTriangle,
  ShoppingBag,
  Calendar,
  CreditCard,
  RotateCcw,
  PlusCircle,
  Sparkles,
  ArrowUpRight,
  Eye,
  Printer,
  ChevronRight,
  Wallet
} from 'lucide-react';
import { formatCurrency, formatCurrencyNoDec, formatDateTime } from '../utils/formatters';

export const Dashboard = () => {
  const {
    shop,
    sales,
    products,
    returns,
    setActiveTab,
    triggerPrintBill
  } = useApp();

  // Calculate Today's Stats
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const todaySales = sales.filter((s) => new Date(s.date).getTime() >= todayStart);
  const monthSales = sales.filter((s) => new Date(s.date).getTime() >= thisMonthStart);

  const todaySalesTotal = todaySales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
  const monthSalesTotal = monthSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
  const todayBillsCount = todaySales.length;

  // Collection breakdown (Cash, UPI, Card, Split)
  let cashCol = 0;
  let upiCol = 0;
  let cardCol = 0;

  todaySales.forEach((s) => {
    if (s.paymentMethod === 'Cash') cashCol += s.grandTotal;
    else if (s.paymentMethod === 'UPI') upiCol += s.grandTotal;
    else if (s.paymentMethod === 'Card') cardCol += s.grandTotal;
    else if (s.paymentMethod === 'Split' && s.splitDetails) {
      cashCol += Number(s.splitDetails.cash) || 0;
      upiCol += Number(s.splitDetails.upi) || 0;
      cardCol += Number(s.splitDetails.card) || 0;
    }
  });

  const todayCollectionTotal = cashCol + upiCol + cardCol;

  // Low stock and out of stock
  const lowStockItems = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minimumStock);
  const outOfStockItems = products.filter((p) => p.currentStock <= 0);

  // Recent 5 bills
  const recentBills = sales.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
        border: '1px solid #fed7aa',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #fed7aa',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-xs)'
          }}>
            {shop.logo ? (
              <img src={shop.logo} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '2rem' }}>🎆</span>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Welcome to {shop.name}!
              </h2>
              <span className="badge badge-primary">Diwali POS Ready</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {shop.tamilName} • Fast billing, real-time stock sync &amp; multi-payment collection.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setActiveTab('billing')} className="btn btn-primary" style={{ gap: '0.4rem', fontWeight: 700 }}>
            <Sparkles size={16} />
            <span>New Bill (F2)</span>
          </button>
          <button onClick={() => setActiveTab('stock')} className="btn btn-secondary" style={{ gap: '0.4rem' }}>
            <Boxes size={16} />
            <span>Check Stock</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (8 Key Metrics requested by user) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem'
      }}>
        {/* 1. Today's Sales */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>🧾 Today's Sales</span>
            <span style={{ padding: '0.35rem', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <TrendingUp size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {formatCurrency(todaySalesTotal)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {todayBillsCount} bills billed today
          </div>
        </div>

        {/* 2. Today's Collection */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>💰 Today's Collection</span>
            <span style={{ padding: '0.35rem', borderRadius: '8px', background: 'var(--success-light)', color: 'var(--success)' }}>
              <Wallet size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '-0.02em' }}>
            {formatCurrency(todayCollectionTotal)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Direct cash &amp; digital received
          </div>
        </div>

        {/* 3. Total Products */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>📦 Total Products</span>
            <span style={{ padding: '0.35rem', borderRadius: '8px', background: 'var(--accent-blue-light)', color: 'var(--accent-blue)' }}>
              <Boxes size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {products.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Across 11 Sivakasi categories
          </div>
        </div>

        {/* 4. Low Stock */}
        <div
          className="card"
          onClick={() => setActiveTab('stock')}
          style={{
            padding: '1.15rem',
            cursor: 'pointer',
            borderColor: lowStockItems.length > 0 ? '#fca5a5' : 'var(--border-color)',
            background: lowStockItems.length > 0 ? 'var(--danger-light)' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: lowStockItems.length > 0 ? '#991b1b' : 'var(--text-muted)' }}>
              ⚠️ Low Stock
            </span>
            <span style={{ padding: '0.35rem', borderRadius: '8px', background: '#fee2e2', color: 'var(--danger)' }}>
              <AlertTriangle size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--danger)', letterSpacing: '-0.02em' }}>
            {lowStockItems.length + outOfStockItems.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: lowStockItems.length > 0 ? '#b91c1c' : 'var(--text-muted)', marginTop: '0.25rem' }}>
            {outOfStockItems.length} out of stock
          </div>
        </div>

        {/* 5. Today's Bills */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>🛒 Today's Bills</span>
            <span style={{ padding: '0.35rem', borderRadius: '8px', background: 'var(--purple-light)', color: 'var(--purple)' }}>
              <ShoppingBag size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {todayBillsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Total receipts generated
          </div>
        </div>

        {/* 6. This Month Sales */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>📊 This Month Sales</span>
            <span style={{ padding: '0.35rem', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Calendar size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
            {formatCurrencyNoDec(monthSalesTotal)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {monthSales.length} total monthly orders
          </div>
        </div>

        {/* 7. Returns */}
        <div
          className="card"
          onClick={() => setActiveTab('returns')}
          style={{ padding: '1.15rem', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>↩️ Returns</span>
            <span style={{ padding: '0.35rem', borderRadius: '8px', background: '#f1f5f9', color: 'var(--text-secondary)' }}>
              <RotateCcw size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {returns.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Processed sales returns
          </div>
        </div>
      </div>

      {/* Payment Modes Collection Section (Cash / UPI / Card) */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              💳 Today's Payment Mode Breakdown
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Collection split across Cash, UPI &amp; Cards
            </p>
          </div>
          <span className="badge badge-neutral">Auto-Calculated</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Cash */}
          <div style={{ padding: '0.85rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d' }}>💵 Cash Collection</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#166534', marginTop: '0.25rem' }}>
              {formatCurrency(cashCol)}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#15803d', marginTop: '2px' }}>
              {todayCollectionTotal > 0 ? `${Math.round((cashCol / todayCollectionTotal) * 100)}% of today's total` : '0%'}
            </div>
          </div>

          {/* UPI */}
          <div style={{ padding: '0.85rem 1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8' }}>📱 UPI Collection (GPay / PhonePe)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e40af', marginTop: '0.25rem' }}>
              {formatCurrency(upiCol)}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#1d4ed8', marginTop: '2px' }}>
              {todayCollectionTotal > 0 ? `${Math.round((upiCol / todayCollectionTotal) * 100)}% of today's total` : '0%'}
            </div>
          </div>

          {/* Card */}
          <div style={{ padding: '0.85rem 1rem', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7e22ce' }}>💳 Card / POS Swipe</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#6b21a8', marginTop: '0.25rem' }}>
              {formatCurrency(cardCol)}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#7e22ce', marginTop: '2px' }}>
              {todayCollectionTotal > 0 ? `${Math.round((cardCol / todayCollectionTotal) * 100)}% of today's total` : '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Urgent Low Stock & Recent Bills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
        {/* Urgent Low Stock Alert List */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="var(--danger)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Low Stock Crackers Warning
              </h3>
            </div>
            <button onClick={() => setActiveTab('stock')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
              Manage Stock
            </button>
          </div>

          {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              ✅ All crackers have sufficient stock levels!
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight: '240px', overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'center' }}>Current</th>
                    <th style={{ textAlign: 'center' }}>Min</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...outOfStockItems, ...lowStockItems].map((prod) => (
                    <tr key={prod.id}>
                      <td style={{ fontWeight: 600 }}>{prod.name}</td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{prod.category}</span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: prod.currentStock <= 0 ? 'var(--danger)' : 'var(--warning)' }}>
                        {prod.currentStock} {prod.unit}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{prod.minimumStock}</td>
                      <td>
                        {prod.currentStock <= 0 ? (
                          <span className="badge badge-danger">Out of Stock 🔴</span>
                        ) : (
                          <span className="badge badge-warning">Low Stock ⚠️</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Bills & Quick Reprint */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Recent Sales Bills
              </h3>
            </div>
            <button onClick={() => setActiveTab('sales')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
              View All Bills
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Mode</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentBills.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{b.invoiceNo}</td>
                    <td>
                      <div>{b.customerName || 'Cash Customer'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.customerMobile}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(b.grandTotal)}</td>
                    <td>
                      <span className="badge badge-blue">{b.paymentMethod}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => triggerPrintBill(b)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Print / View Invoice"
                      >
                        <Printer size={13} />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
