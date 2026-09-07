import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  Printer,
  PieChart,
  Boxes,
  CreditCard,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { formatCurrency, formatCurrencyNoDec, formatDate } from '../utils/formatters';

export const Reports = () => {
  const { sales, products, categories, currentUser } = useApp();
  const [timeRange, setTimeRange] = useState('month'); // today, yesterday, week, month, all
  const [reportTab, setReportTab] = useState('sales'); // sales, profit, category, payment, stock

  // Role Gate
  if (currentUser.role !== 'admin') {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <Lock size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Admin Access Required</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Profit, cost valuations and analytical business reports are restricted to Shop Owner / Admin.
        </p>
      </div>
    );
  }

  // Filter sales based on time range
  const now = new Date();
  const filteredSales = sales.filter((s) => {
    const saleDate = new Date(s.date).getTime();
    if (timeRange === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return saleDate >= start;
    } else if (timeRange === 'yesterday') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return saleDate >= start && saleDate < end;
    } else if (timeRange === 'week') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getTime();
      return saleDate >= start;
    } else if (timeRange === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return saleDate >= start;
    }
    return true;
  });

  // Calculate Metrics
  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalBillsCount = filteredSales.length;
  const avgBillValue = totalBillsCount > 0 ? totalSalesRevenue / totalBillsCount : 0;

  // Gross Profit calculation
  let totalCostOfGoodsSold = 0;
  let totalRetailOfGoodsSold = 0;

  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.id || prod.code === item.code);
      const purchaseRate = p ? p.purchasePrice : item.rate * 0.65; // fallback
      totalCostOfGoodsSold += purchaseRate * item.qty;
      totalRetailOfGoodsSold += item.total;
    });
  });

  const grossProfit = Math.max(0, totalRetailOfGoodsSold - totalCostOfGoodsSold);
  const profitMarginPercent = totalRetailOfGoodsSold > 0 ? ((grossProfit / totalRetailOfGoodsSold) * 100).toFixed(1) : 0;

  // Category wise sales breakdown
  const categorySalesMap = {};
  categories.forEach((c) => {
    categorySalesMap[c.name] = 0;
  });

  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.id || prod.code === item.code);
      const cat = p ? p.category : 'Other Items';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + item.total;
    });
  });

  // Payment Breakdown
  let cashTotal = 0;
  let upiTotal = 0;
  let cardTotal = 0;
  let creditTotal = 0;

  filteredSales.forEach((s) => {
    if (s.paymentMethod === 'Cash') cashTotal += s.grandTotal;
    else if (s.paymentMethod === 'UPI') upiTotal += s.grandTotal;
    else if (s.paymentMethod === 'Card') cardTotal += s.grandTotal;
    else if (s.paymentMethod === 'Credit') creditTotal += s.grandTotal;
    else if (s.paymentMethod === 'Split' && s.splitDetails) {
      cashTotal += Number(s.splitDetails.cash) || 0;
      upiTotal += Number(s.splitDetails.upi) || 0;
      cardTotal += Number(s.splitDetails.card) || 0;
    }
  });

  // CSV Export
  const exportToCSV = () => {
    const headers = ['Invoice No', 'Date', 'Customer', 'Mobile', 'Payment Mode', 'Subtotal', 'Discount', 'Tax', 'Grand Total'];
    const rows = filteredSales.map((s) => [
      s.invoiceNo,
      formatDate(s.date),
      `"${s.customerName || ''}"`,
      s.customerMobile || '',
      s.paymentMethod,
      s.subtotal,
      s.discountTotal,
      s.taxTotal,
      s.grandTotal
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Range Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📊 Sales &amp; Gross Profit Reports (வியாபார அறிக்கைகள்)</span>
            <span className="badge badge-primary">Admin Exclusive</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Gross Profit, sales distribution by category, payment mode analytics &amp; CSV export.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Time Range Selectors */}
          {['today', 'yesterday', 'week', 'month', 'all'].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`btn btn-sm ${timeRange === r ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {r === 'today' ? "Today" : r === 'yesterday' ? "Yesterday" : r === 'week' ? "This Week" : r === 'month' ? "This Month" : "All Time"}
            </button>
          ))}

          <button onClick={exportToCSV} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
            <Download size={14} />
            <span>CSV</span>
          </button>
          <button onClick={() => window.print()} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
            <Printer size={14} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Top 4 Performance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>NET SALES REVENUE</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {formatCurrency(totalSalesRevenue)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {totalBillsCount} bills in {timeRange}
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>COST OF CRACKERS SOLD (COGS)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '0.25rem' }}>
            {formatCurrency(totalCostOfGoodsSold)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Based on purchase rates
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d' }}>GROSS PROFIT (லாபம்)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#166534', marginTop: '0.25rem' }}>
            {formatCurrency(grossProfit)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '2px', fontWeight: 700 }}>
            {profitMarginPercent}% Gross Margin
          </div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>AVG. BASKET / BILL SIZE</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--purple)', marginTop: '0.25rem' }}>
            {formatCurrency(avgBillValue)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Per customer bill average
          </div>
        </div>
      </div>

      {/* Two Columns: Category Breakdown & Payment Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
        {/* Category Sales Breakdown */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
              Category-Wise Sales Contribution
            </h3>
            <span className="badge badge-neutral">{categories.length} Categories</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {categories.map((cat) => {
              const amount = categorySalesMap[cat.name] || 0;
              const percent = totalSalesRevenue > 0 ? (amount / totalSalesRevenue) * 100 : 0;

              return (
                <div key={cat.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2px' }}>
                    <span>
                      {cat.icon} {cat.name}
                    </span>
                    <span>
                      {formatCurrency(amount)} ({percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        background: 'linear-gradient(90deg, #ea580c, #f97316)',
                        borderRadius: '4px'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
              Payment Mode Collection
            </h3>
            <span className="badge badge-neutral">All Methods</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Cash */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>💵 Cash In Hand</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Physical notes received</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>{formatCurrency(cashTotal)}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {totalSalesRevenue > 0 ? `${Math.round((cashTotal / totalSalesRevenue) * 100)}%` : '0%'}
                </div>
              </div>
            </div>

            {/* UPI */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>📱 UPI / QR Payments</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GooglePay, PhonePe, Paytm</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>{formatCurrency(upiTotal)}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {totalSalesRevenue > 0 ? `${Math.round((upiTotal / totalSalesRevenue) * 100)}%` : '0%'}
                </div>
              </div>
            </div>

            {/* Card */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>💳 Credit / Debit Card</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>POS machine swipe</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--purple)' }}>{formatCurrency(cardTotal)}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {totalSalesRevenue > 0 ? `${Math.round((cardTotal / totalSalesRevenue) * 100)}%` : '0%'}
                </div>
              </div>
            </div>

            {/* Credit / Balance */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>📒 Credit / Due Sale</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pay later customers</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--danger)' }}>{formatCurrency(creditTotal)}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {totalSalesRevenue > 0 ? `${Math.round((creditTotal / totalSalesRevenue) * 100)}%` : '0%'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
