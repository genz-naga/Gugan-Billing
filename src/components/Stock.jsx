import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Search,
  Plus,
  Minus,
  Edit,
  DollarSign,
  PackageCheck,
  ArrowUpDown
} from 'lucide-react';
import { formatCurrency, formatCurrencyNoDec } from '../utils/formatters';

export const Stock = () => {
  const { products, quickAdjustStock, categories, currentUser, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // all, low, out
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');

  // Stock inventory valuation metrics
  const totalItemsCount = products.reduce((sum, p) => sum + (p.currentStock || 0), 0);
  const totalCostValuation = products.reduce((sum, p) => sum + (p.currentStock * (p.purchasePrice || 0)), 0);
  const totalRetailValuation = products.reduce((sum, p) => sum + (p.currentStock * (p.sellingPrice || 0)), 0);
  const potentialGrossProfit = totalRetailValuation - totalCostValuation;

  const lowStockProducts = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minimumStock);
  const outOfStockProducts = products.filter((p) => p.currentStock <= 0);

  // Filter list
  const filtered = products.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterMode === 'low') return matchesSearch && p.currentStock > 0 && p.currentStock <= p.minimumStock;
    if (filterMode === 'out') return matchesSearch && p.currentStock <= 0;
    return matchesSearch;
  });

  const handleOpenAdjust = (p) => {
    setAdjustingProduct(p);
    setNewStockValue(p.currentStock);
  };

  const handleSaveAdjust = (e) => {
    e.preventDefault();
    if (adjustingProduct && newStockValue !== '') {
      quickAdjustStock(adjustingProduct.id, newStockValue);
      setAdjustingProduct(null);
    }
  };

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
            <span>📦 Stock Inventory &amp; Low Stock Alerts</span>
            {lowStockProducts.length + outOfStockProducts.length > 0 && (
              <span className="badge badge-danger">
                {lowStockProducts.length + outOfStockProducts.length} Attention Needed
              </span>
            )}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Real-time crackers inventory tracking, auto-deduction on billing, restocking &amp; valuation.
          </p>
        </div>
      </div>

      {/* Stock Valuation Cards (Admin view) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem'
      }}>
        <div className="card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL STOCK QUANTITY</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {totalItemsCount} units
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Across {products.length} product codes
          </div>
        </div>

        {currentUser.role === 'admin' && (
          <div className="card" style={{ padding: '1.15rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PURCHASE COST VALUATION</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '0.25rem' }}>
              {formatCurrencyNoDec(totalCostValuation)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Inventory investment cost
            </div>
          </div>
        )}

        <div className="card" style={{ padding: '1.15rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>RETAIL SALES VALUATION</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {formatCurrencyNoDec(totalRetailValuation)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Expected retail revenue
          </div>
        </div>

        {currentUser.role === 'admin' && (
          <div className="card" style={{ padding: '1.15rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>POTENTIAL GROSS PROFIT</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>
              {formatCurrencyNoDec(potentialGrossProfit)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '2px', fontWeight: 600 }}>
              {totalCostValuation > 0 ? `${Math.round((potentialGrossProfit / totalCostValuation) * 100)}% ROI margin` : '0%'}
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setFilterMode('all')}
              className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All Stock ({products.length})
            </button>
            <button
              onClick={() => setFilterMode('low')}
              className={`btn btn-sm ${filterMode === 'low' ? 'btn-danger' : 'btn-secondary'}`}
              style={{ gap: '0.35rem' }}
            >
              <AlertTriangle size={14} />
              <span>Low Stock ({lowStockProducts.length})</span>
            </button>
            <button
              onClick={() => setFilterMode('out')}
              className={`btn btn-sm ${filterMode === 'out' ? 'btn-danger' : 'btn-secondary'}`}
            >
              Out of Stock ({outOfStockProducts.length})
            </button>
          </div>

          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '2rem' }}
              placeholder="Filter stock by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '6%' }}>Code</th>
                <th>Product Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'center' }}>Current Stock</th>
                <th style={{ textAlign: 'center' }}>Minimum Level</th>
                <th style={{ textAlign: 'center' }}>Stock Status</th>
                {currentUser.role === 'admin' && <th style={{ textAlign: 'right' }}>Stock Value (₹)</th>}
                <th style={{ textAlign: 'center', width: '12%' }}>Quick Adjust</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const isLow = p.currentStock > 0 && p.currentStock <= p.minimumStock;
                const isOut = p.currentStock <= 0;

                return (
                  <tr key={p.id} style={{ background: isOut ? '#fef2f2' : isLow ? '#fffbeb' : 'inherit' }}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                      {p.code}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {p.tamilName} • {p.packing}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{p.category}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: isOut ? 'var(--danger)' : isLow ? 'var(--warning)' : 'var(--text-main)' }}>
                        {p.currentStock} {p.unit}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {p.minimumStock} {p.unit}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isOut ? (
                        <span className="badge badge-danger">Out of Stock 🔴</span>
                      ) : isLow ? (
                        <span className="badge badge-warning">Low Stock ⚠️</span>
                      ) : (
                        <span className="badge badge-success">In Stock 🟢</span>
                      )}
                    </td>
                    {currentUser.role === 'admin' && (
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {formatCurrency(p.currentStock * p.purchasePrice)}
                      </td>
                    )}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleOpenAdjust(p)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', gap: '0.35rem' }}
                      >
                        <Edit size={12} />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Adjust Modal */}
      {adjustingProduct && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Boxes size={18} color="var(--primary)" />
                <span>Adjust Stock Count</span>
              </div>
              <button onClick={() => setAdjustingProduct(null)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <form onSubmit={handleSaveAdjust}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                    {adjustingProduct.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Code: {adjustingProduct.code} • Unit: {adjustingProduct.unit}
                  </div>
                </div>

                <div>
                  <label className="input-label">New Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="input"
                    style={{ fontSize: '1.1rem', fontWeight: 800 }}
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(e.target.value)}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Current in system: {adjustingProduct.currentStock} {adjustingProduct.unit}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setAdjustingProduct(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
