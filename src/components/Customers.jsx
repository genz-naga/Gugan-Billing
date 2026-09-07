import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Plus, Search, Phone, MapPin, Receipt, History } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export const Customers = () => {
  const { customers, sales, addCustomer, setActiveTab, triggerPrintBill, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustHistory, setSelectedCustHistory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    creditBalance: 0
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      mobile: '',
      address: '',
      creditBalance: 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      showToast('Customer Name and Mobile are required!', 'error');
      return;
    }
    addCustomer(formData);
    setIsModalOpen(false);
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <span>👤 Customer Directory (வாடிக்கையாளர்கள்)</span>
            <span className="badge badge-primary">{customers.length} Customers</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Quick customer lookup by mobile number. No GSTIN required for cracker retail customers!
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary" style={{ gap: '0.5rem', fontWeight: 700 }}>
          <Plus size={18} />
          <span>Add Customer (புதிய வாடிக்கையாளர்)</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: '380px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '2rem' }}
            placeholder="Search customer by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customer List Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
            <Users size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>இன்னும் வாடிக்கையாளர்கள் இல்லை (No Customers Yet)</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>பில்லிங் செய்யும் போது வாடிக்கையாளர் எண் கொடுத்தால் தானாகவே சேமிக்கப்படும், அல்லது "Add Customer" மூலம் சேர்க்கலாம்.</div>
          </div>
        ) : (
          filtered.map((c) => {
          const custBills = sales.filter((s) => s.customerMobile === c.mobile || s.customerName === c.name);

          return (
            <div key={c.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {c.name}
                  </h3>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    {c.totalBills || custBills.length} Bills
                  </span>
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                    <Phone size={13} color="var(--primary)" />
                    <strong>+91 {c.mobile}</strong>
                  </div>
                  {c.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                      <MapPin size={13} />
                      <span>{c.address}</span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '0.85rem', padding: '0.65rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Purchases:</div>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                      {formatCurrency(c.totalBilled || 0)}
                    </div>
                  </div>
                  {c.creditBalance > 0 && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>Credit Due:</div>
                      <div style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '0.95rem' }}>
                        {formatCurrency(c.creditBalance)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={() => setSelectedCustHistory({ customer: c, bills: custBills })}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.35rem', fontSize: '0.75rem' }}
                >
                  <History size={13} />
                  <span>Bills History</span>
                </button>

                <button
                  onClick={() => setActiveTab('billing')}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  Create Bill
                </button>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Customer Bill History Modal */}
      {selectedCustHistory && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <History size={18} color="var(--primary)" />
                <span>Purchase History: {selectedCustHistory.customer.name}</span>
              </div>
              <button onClick={() => setSelectedCustHistory(null)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <div className="modal-body">
              {selectedCustHistory.bills.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No previous bills found for this customer.
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Bill #</th>
                        <th>Date</th>
                        <th>Items Count</th>
                        <th>Mode</th>
                        <th style={{ textAlign: 'right' }}>Total (₹)</th>
                        <th style={{ textAlign: 'center' }}>Print</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustHistory.bills.map((b) => (
                        <tr key={b.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                            {b.invoiceNo}
                          </td>
                          <td>{formatDate(b.date)}</td>
                          <td>{b.items.length} items</td>
                          <td>
                            <span className="badge badge-neutral">{b.paymentMethod}</span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(b.grandTotal)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => triggerPrintBill(b)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.4rem' }}
                            >
                              <Receipt size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedCustHistory(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Users size={18} color="var(--primary)" />
                <span>Add Customer</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="input-label">Customer Name *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="input-label">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    className="input"
                    placeholder="9876543210"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>

                <div>
                  <label className="input-label">Address / Town (Optional)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Gandhi Nagar, Rajapalayam"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="input-label">Opening Credit Balance (₹)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.creditBalance}
                    onChange={(e) => setFormData({ ...formData, creditBalance: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
