import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings as SettingsIcon,
  Store,
  FileText,
  Percent,
  CreditCard,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2
} from 'lucide-react';

export const Settings = () => {
  const {
    shop,
    updateShop,
    currentUser,
    switchRole,
    exportData,
    importData,
    resetData,
    showToast
  } = useApp();

  const [settingsTab, setSettingsTab] = useState('shop'); // shop, invoice, tax, user, backup
  const [formData, setFormData] = useState({ ...shop });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateShop(formData);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        importData(json);
      } catch (err) {
        showToast('Invalid backup JSON file format!', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚙️ Shop &amp; Software Settings (கடை அமைப்புகள்)</span>
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
          Configure shop details, invoice layouts, thermal printer size, tax options, roles and backups.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="card" style={{ padding: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
          {[
            { id: 'shop', label: '🏪 Shop Details', desc: 'Name, Address & Contact' },
            { id: 'invoice', label: '🧾 Invoice & Print', desc: 'A4 vs Thermal & Footer' },
            { id: 'tax', label: '💰 Tax & GST', desc: 'Inclusive / Exclusive Rates' },
            { id: 'user', label: '🔐 User Roles', desc: 'Admin vs Cashier Permissions' },
            { id: 'backup', label: '💾 Backup & Restore', desc: 'Export & Reset Data' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSettingsTab(tab.id)}
              className={`btn btn-sm ${settingsTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', fontWeight: 700 }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Shop Details */}
      {settingsTab === 'shop' && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store size={18} color="var(--primary)" />
            <span>Shop Profile &amp; Contact Information</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Logo Preview and Upload */}
            <div style={{
              gridColumn: 'span 2',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              padding: '1rem',
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xs)'
              }}>
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '2rem' }}>🧨</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Shop Logo (கடை லோகோ)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0.5rem' }}>
                  Current logo from <code>src/assets/image.png</code>. Appears on bills, price lists and thermal receipts.
                </div>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', gap: '0.35rem' }}>
                  <Upload size={13} />
                  <span>Upload / Change Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setFormData((prev) => ({ ...prev, logo: ev.target.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="input-label">Shop Name (English) *</label>
              <input
                type="text"
                name="name"
                required
                className="input"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="input-label">Shop Name (Tamil - தமிழ்) *</label>
              <input
                type="text"
                name="tamilName"
                className="input"
                value={formData.tamilName}
                onChange={handleChange}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Tagline / Subtitle</label>
              <input
                type="text"
                name="tagline"
                className="input"
                value={formData.tagline}
                onChange={handleChange}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Shop Address (முகவரி)</label>
              <input
                type="text"
                name="address"
                className="input"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="input-label">City / Town</label>
              <input
                type="text"
                name="city"
                className="input"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="input-label">District (மாவட்டம்)</label>
              <input
                type="text"
                name="district"
                className="input"
                value={formData.district}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="input-label">State (மாநிலம்)</label>
              <input
                type="text"
                name="state"
                className="input"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="input-label">Pincode</label>
              <input
                type="text"
                name="pincode"
                className="input"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="input-label">Primary Mobile Number *</label>
              <input
                type="tel"
                name="mobile"
                required
                className="input"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="input-label">Alternate Mobile / WhatsApp</label>
              <input
                type="tel"
                name="altMobile"
                className="input"
                value={formData.altMobile}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="input-label">Email (Optional)</label>
              <input
                type="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="input-label">UPI ID for Payment QR (e.g. 9876543210@okaxis)</label>
              <input
                type="text"
                name="upiId"
                className="input"
                value={formData.upiId || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem', fontWeight: 700 }}>
              <Save size={16} />
              <span>Save Shop Details</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Invoice & Print */}
      {settingsTab === 'invoice' && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--primary)" />
            <span>Invoice Prefix, Numbering &amp; Print Format</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="input-label">Invoice Prefix (பில் முன்னொட்டு)</label>
              <input
                type="text"
                name="invoicePrefix"
                className="input"
                value={formData.invoicePrefix}
                onChange={handleChange}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Example: INV-, SVC-, GUG-
              </div>
            </div>

            <div>
              <label className="input-label">Next Invoice Number</label>
              <input
                type="number"
                name="nextInvoiceNum"
                className="input"
                value={formData.nextInvoiceNum}
                onChange={handleChange}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Next bill will be: {formData.invoicePrefix}{formData.nextInvoiceNum}
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Default Printer Layout</label>
              <select
                name="printFormat"
                className="select"
                value={formData.printFormat}
                onChange={handleChange}
              >
                <option value="performa">Performa Wholesale Invoice (As per Photo Format)</option>
                <option value="a4">Standard A4 Sheet (Detailed Retail Invoice)</option>
                <option value="thermal">3-Inch (80mm) Thermal POS Receipt</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Bill Footer Message (பில் அடிக்குறிப்பு)</label>
              <input
                type="text"
                name="footerMessage"
                className="input"
                value={formData.footerMessage}
                onChange={handleChange}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Terms &amp; Conditions</label>
              <textarea
                name="terms"
                rows="4"
                className="textarea"
                value={formData.terms}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem', fontWeight: 700 }}>
              <Save size={16} />
              <span>Save Invoice Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Tax & GST */}
      {settingsTab === 'tax' && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Percent size={18} color="var(--primary)" />
            <span>Tax Rates &amp; Calculation Treatment</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '580px' }}>
            <div style={{ padding: '0.85rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="taxInclusive"
                  checked={formData.taxInclusive}
                  onChange={handleChange}
                />
                <span>Selling Price is Tax Inclusive (வரி உள்ளடக்கிய விலை)</span>
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 1.6rem' }}>
                When checked, cracker prices listed are the final MRP amount. Tax is broken down automatically on invoice.
              </p>
            </div>

            <div>
              <label className="input-label">Default Tax Rate (GST %)</label>
              <input
                type="number"
                name="defaultTaxRate"
                className="input"
                value={formData.defaultTaxRate}
                onChange={handleChange}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Typically 12% or 18% for fireworks products as per GST guidelines.
              </div>
            </div>

            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-start' }}>
              <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem', fontWeight: 700 }}>
                <Save size={16} />
                <span>Save Tax Settings</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 4: User Roles */}
      {settingsTab === 'user' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="var(--primary)" />
            <span>User Roles &amp; Permissions</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Admin Box */}
            <div style={{
              padding: '1.25rem',
              border: currentUser.role === 'admin' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              background: currentUser.role === 'admin' ? 'var(--primary-light)' : '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Shop Owner (Admin)
                </h4>
                {currentUser.role === 'admin' && <span className="badge badge-primary">Current Active</span>}
              </div>

              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', margin: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <li>Full access to Gross Profit reports</li>
                <li>View purchase prices &amp; inventory valuation</li>
                <li>Edit &amp; delete cracker products</li>
                <li>Modify shop settings &amp; invoice numbering</li>
                <li>Backup &amp; restore database</li>
              </ul>

              <button
                onClick={() => switchRole('admin')}
                className="btn btn-primary btn-sm"
                disabled={currentUser.role === 'admin'}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                Switch to Admin Role
              </button>
            </div>

            {/* Cashier Box */}
            <div style={{
              padding: '1.25rem',
              border: currentUser.role === 'cashier' ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              background: currentUser.role === 'cashier' ? 'var(--accent-blue-light)' : '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Cashier / Counter Staff
                </h4>
                {currentUser.role === 'cashier' && <span className="badge badge-blue">Current Active</span>}
              </div>

              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', margin: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <li>Fast Billing Screen (F2 - F6)</li>
                <li>Add &amp; view Customer records</li>
                <li>View Sales history &amp; Print receipts</li>
                <li style={{ color: 'var(--danger)', fontWeight: 600 }}>❌ Restricted: Gross Profit reports</li>
                <li style={{ color: 'var(--danger)', fontWeight: 600 }}>❌ Restricted: Purchase prices</li>
                <li style={{ color: 'var(--danger)', fontWeight: 600 }}>❌ Restricted: Shop settings</li>
              </ul>

              <button
                onClick={() => switchRole('cashier')}
                className="btn btn-secondary btn-sm"
                disabled={currentUser.role === 'cashier'}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                Switch to Cashier Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Backup & Restore */}
      {settingsTab === 'backup' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} color="var(--primary)" />
            <span>Database Backup &amp; Reset Management</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* Export */}
            <div style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>💾 Download Backup File</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 1rem' }}>
                Export your entire shop inventory, customers, suppliers, bills and settings as a secure JSON file.
              </p>
              <button onClick={exportData} className="btn btn-primary" style={{ gap: '0.4rem', fontWeight: 700 }}>
                <Download size={16} />
                <span>Export JSON Backup</span>
              </button>
            </div>

            {/* Import */}
            <div style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>🔄 Restore from Backup</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 1rem' }}>
                Upload a previously exported backup file to restore complete data.
              </p>
              <label className="btn btn-secondary" style={{ display: 'inline-flex', cursor: 'pointer', gap: '0.4rem', fontWeight: 700 }}>
                <Upload size={16} />
                <span>Select JSON File</span>
                <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Reset / Wipe */}
            <div style={{ padding: '1.25rem', border: '1px solid #fecaca', borderRadius: 'var(--radius-lg)', background: '#fff5f5' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--danger)' }}>⚠️ Clear All Records (Clean Slate)</div>
              <p style={{ fontSize: '0.75rem', color: '#991b1b', margin: '4px 0 1rem' }}>
                Wipe all items, customers, suppliers and bills so you can manage purely real crackers data.
              </p>
              <button onClick={resetData} className="btn btn-danger" style={{ gap: '0.4rem', fontWeight: 700 }}>
                <RotateCcw size={16} />
                <span>Clear All Data Completely</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
