import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Plus, Phone, MapPin, Search, Edit2, History, Truck } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export const Suppliers = () => {
  const { suppliers, purchases, addSupplier, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierForHistory, setSelectedSupplierForHistory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contactPerson: '',
    mobile: '',
    address: '',
    balance: 0
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: `SUP-${Math.floor(10 + Math.random() * 90)}`,
      contactPerson: '',
      mobile: '',
      address: '',
      balance: 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      showToast('Supplier Name and Mobile are required!', 'error');
      return;
    }
    addSupplier(formData);
    setIsModalOpen(false);
  };

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.mobile.includes(searchTerm)
  );

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
            <span>🏭 Fireworks Suppliers &amp; Agencies (சப்ளையர்)</span>
            <span className="badge badge-primary">{suppliers.length} Registered</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Manage Sivakasi fireworks manufacturers, supplier ledgers, and purchase history.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary" style={{ gap: '0.5rem', fontWeight: 700 }}>
          <Plus size={18} />
          <span>Add Supplier (புதிய சப்ளையர்)</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: '380px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '2rem' }}
            placeholder="Search supplier by name, code, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Supplier Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
            <Building2 size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>இன்னும் சப்ளையர்கள் சேர்க்கப்படவில்லை (No Suppliers Yet)</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>மேலேயுள்ள "Add Supplier" பட்டனை கிளிக் செய்து உங்கள் பட்டாசு சப்ளையர்களை சேர்க்கவும்.</div>
          </div>
        ) : (
          filtered.map((sup) => {
          const supplierPurchases = purchases.filter((p) => p.supplierId === sup.id || p.supplierName === sup.name);

          return (
            <div key={sup.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                      {sup.code}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 2px' }}>
                      {sup.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Contact: {sup.contactPerson || 'Proprietor'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <Phone size={14} color="var(--primary)" />
                    <strong>+91 {sup.mobile}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={14} color="var(--text-muted)" />
                    <span>{sup.address}</span>
                  </div>
                </div>

                <div style={{ marginTop: '0.85rem', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Outstanding Balance:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: sup.balance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    {formatCurrency(sup.balance)}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {supplierPurchases.length} total orders
                </span>
                <button
                  onClick={() => setSelectedSupplierForHistory(sup)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.35rem', fontSize: '0.75rem' }}
                >
                  <History size={13} />
                  <span>Purchase History</span>
                </button>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Supplier Purchase History Modal */}
      {selectedSupplierForHistory && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <History size={18} color="var(--primary)" />
                <span>Purchase History: {selectedSupplierForHistory.name}</span>
              </div>
              <button onClick={() => setSelectedSupplierForHistory(null)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <div className="modal-body">
              {purchases.filter((p) => p.supplierId === selectedSupplierForHistory.id || p.supplierName === selectedSupplierForHistory.name).length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No inward purchases recorded for this supplier yet.
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Bill #</th>
                        <th>Items</th>
                        <th style={{ textAlign: 'right' }}>Total (₹)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases
                        .filter((p) => p.supplierId === selectedSupplierForHistory.id || p.supplierName === selectedSupplierForHistory.name)
                        .map((pur) => (
                          <tr key={pur.id}>
                            <td>{formatDate(pur.date)}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{pur.billNo}</td>
                            <td>
                              {pur.items.map((i, idx) => (
                                <div key={idx} style={{ fontSize: '0.75rem' }}>{i.name} ({i.qty} units)</div>
                              ))}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(pur.totalAmount)}</td>
                            <td>
                              <span className="badge badge-neutral">{pur.status}</span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedSupplierForHistory(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Building2 size={18} color="var(--primary)" />
                <span>Register Fireworks Supplier</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="input-label">Supplier / Agency Name *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. Standard Fireworks Pvt Ltd"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="input-label">Supplier Code</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>

                <div>
                  <label className="input-label">Contact Person</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Ramachandran"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>

                <div>
                  <label className="input-label">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="input"
                    placeholder="9842100011"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>

                <div>
                  <label className="input-label">Address / Location</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Thiruthangal Road, Sivakasi"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="input-label">Opening Pending Balance (₹)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
