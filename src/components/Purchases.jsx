import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  Plus,
  Calendar,
  Building2,
  Boxes,
  CheckCircle2,
  FileText,
  Search
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export const Purchases = () => {
  const { purchases, suppliers, products, addPurchase, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [billNo, setBillNo] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [qty, setQty] = useState(50);
  const [rate, setRate] = useState('');
  const [status, setStatus] = useState('Paid');

  const handleProductChange = (prodId) => {
    setSelectedProductId(prodId);
    const p = products.find((prod) => prod.id === prodId);
    if (p) {
      setRate(p.purchasePrice || '');
    }
  };

  const handleOpenAdd = () => {
    const defaultProd = products[0];
    setSelectedProductId(defaultProd?.id || '');
    setRate(defaultProd?.purchasePrice || '');
    setBillNo(`PUR-${Math.floor(1000 + Math.random() * 9000)}`);
    setQty(50);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === supplierId);
    const prod = products.find((p) => p.id === selectedProductId);

    if (!prod) {
      showToast('Select a valid cracker product!', 'error');
      return;
    }
    if (qty <= 0) {
      showToast('Quantity must be greater than 0!', 'warning');
      return;
    }

    const purchaseRate = Number(rate) || prod.purchasePrice;
    const itemTotal = purchaseRate * Number(qty);

    const purchaseData = {
      supplierId,
      supplierName: sup ? sup.name : 'Unknown Supplier',
      billNo: billNo || `PUR-${Date.now().toString().slice(-4)}`,
      items: [
        {
          productId: prod.id,
          name: prod.name,
          qty: Number(qty),
          rate: purchaseRate,
          total: itemTotal
        }
      ],
      totalAmount: itemTotal,
      status
    };

    addPurchase(purchaseData);
    setIsModalOpen(false);
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
            <span>📥 Purchase Entry &amp; Stock Inward (கொள்முதல்)</span>
            <span className="badge badge-primary">{purchases.length} Inwards</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Record factory / distributor cracker purchases. Automatically increases inventory stock!
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary" style={{ gap: '0.5rem', fontWeight: 700 }}>
          <Plus size={18} />
          <span>New Stock Entry (புதிய கொள்முதல்)</span>
        </button>
      </div>

      {/* Purchases History Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Inward #</th>
                <th>Supplier / Agency</th>
                <th>Supplier Bill #</th>
                <th>Date</th>
                <th>Purchased Items</th>
                <th style={{ textAlign: 'right' }}>Total Amount</th>
                <th style={{ textAlign: 'center' }}>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((pur) => (
                <tr key={pur.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                    {pur.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{pur.supplierName}</div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {pur.billNo}
                  </td>
                  <td>{formatDate(pur.date)}</td>
                  <td>
                    {pur.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem', marginBottom: '2px' }}>
                        <strong>{item.name}</strong> × <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.qty} units</span> @ ₹{item.rate}
                      </div>
                    ))}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    {formatCurrency(pur.totalAmount)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${pur.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                      {pur.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Inward Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Truck size={20} color="var(--primary)" />
                <span>New Cracker Purchase Inward</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Supplier */}
                <div>
                  <label className="input-label">Supplier (சப்ளையர்)</label>
                  <select
                    className="select"
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Supplier Bill No */}
                <div>
                  <label className="input-label">Supplier Invoice / DC No</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. STND-9012"
                    value={billNo}
                    onChange={(e) => setBillNo(e.target.value)}
                  />
                </div>

                {/* Product Select */}
                <div>
                  <label className="input-label">Cracker Product</label>
                  <select
                    className="select"
                    value={selectedProductId}
                    onChange={(e) => handleProductChange(e.target.value)}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name} (Current Stock: {p.currentStock})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Qty & Purchase Rate */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="input-label">Quantity (Boxes/Units)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="input"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="input-label">Purchase Rate (₹)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      className="input"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Total Preview */}
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--primary-light)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #fed7aa',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Total Inward Amount:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatCurrency((Number(qty) || 0) * (Number(rate) || 0))}
                  </span>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="input-label">Payment Status</label>
                  <select
                    className="select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Pending">Pending / Credit</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  Save &amp; Inward Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
