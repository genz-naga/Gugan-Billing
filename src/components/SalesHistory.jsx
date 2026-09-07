import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { History, Search, Printer, RotateCcw, Calendar, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const SalesHistory = () => {
  const { sales, triggerPrintBill, setActiveTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, this_month

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.customerMobile && s.customerMobile.includes(searchTerm));

    if (dateFilter === 'today') {
      const today = new Date().setHours(0, 0, 0, 0);
      return matchesSearch && new Date(s.date).getTime() >= today;
    }
    return matchesSearch;
  });

  const totalSalesValue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📜 Sales History &amp; Receipts (விற்பனை வரலாறு)</span>
            <span className="badge badge-primary">{filteredSales.length} Invoices</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Search invoices by bill number (e.g. INV-1001), customer phone, date. Reprint anytime.
          </p>
        </div>

        <div style={{ padding: '0.5rem 1rem', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filtered Sales Total:</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
            {formatCurrency(totalSalesValue)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '2rem' }}
              placeholder="Search by Bill No (INV-1001), Customer Name, Mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setDateFilter('all')}
              className={`btn btn-sm ${dateFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`btn btn-sm ${dateFilter === 'today' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Today Only
            </button>
          </div>
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>Invoice #</th>
                <th>Date &amp; Time</th>
                <th>Customer</th>
                <th>Items Summary</th>
                <th style={{ textAlign: 'center' }}>Payment Mode</th>
                <th style={{ textAlign: 'right' }}>Subtotal</th>
                <th style={{ textAlign: 'right' }}>Discount</th>
                <th style={{ textAlign: 'right' }}>Grand Total</th>
                <th style={{ textAlign: 'center', width: '12%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No invoices found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)' }}>
                      {sale.invoiceNo}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatDateTime(sale.date)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{sale.customerName || 'Cash Customer'}</div>
                      {sale.customerMobile && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sale.customerMobile}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem' }}>
                        {sale.items.slice(0, 2).map((i, idx) => (
                          <div key={idx}>
                            {i.name} × <strong>{i.qty}</strong>
                          </div>
                        ))}
                        {sale.items.length > 2 && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                            +{sale.items.length - 2} more items...
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-blue">{sale.paymentMethod}</span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      {formatCurrency(sale.subtotal)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>
                      {sale.discountTotal > 0 ? `-${formatCurrency(sale.discountTotal)}` : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                      {formatCurrency(sale.grandTotal)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => triggerPrintBill(sale)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem', gap: '0.25rem', fontSize: '0.75rem' }}
                          title="Print / View Invoice"
                        >
                          <Printer size={13} />
                          <span>Print</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
