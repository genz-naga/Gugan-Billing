import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Download, Sparkles, Search, FileText } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const PriceList = () => {
  const { shop, products, categories } = useApp();
  const [search, setSearch] = useState('');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Action Header */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📋 Crackers Price List (பட்டாசு விலைப்பட்டியல்)</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Customer-facing price chart with special festive discounts and net rates.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '2rem', width: '220px' }}
              placeholder="Filter price list..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button onClick={handlePrint} className="btn btn-primary" style={{ gap: '0.4rem', fontWeight: 700 }}>
            <Printer size={16} />
            <span>Print Price List</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div
        id="printable-pricelist"
        className="card"
        style={{
          padding: '2rem',
          background: '#ffffff',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          {shop.logo && (
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <img src={shop.logo} alt={shop.name} style={{ height: '56px', maxWidth: '180px', objectFit: 'contain' }} />
            </div>
          )}
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {shop.name}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
            {shop.tamilName} • {shop.tagline}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {shop.address}, {shop.city} - {shop.pincode} • Phone: <strong>{shop.mobile}</strong> {shop.altMobile && `| ${shop.altMobile}`}
          </div>
          <div style={{
            display: 'inline-block',
            marginTop: '0.75rem',
            padding: '0.25rem 1rem',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius-full)',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            FESTIVAL SPECIAL PRICE LIST {new Date().getFullYear()}
          </div>
        </div>

        {/* Categories with Products */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {categories.map((cat) => {
            const catProducts = products.filter(
              (p) =>
                p.category === cat.name &&
                (search === '' ||
                  p.name.toLowerCase().includes(search.toLowerCase()) ||
                  p.code.toLowerCase().includes(search.toLowerCase()) ||
                  (p.tamilName && p.tamilName.includes(search)))
            );

            if (catProducts.length === 0) return null;

            return (
              <div key={cat.id}>
                {/* Category Header Banner */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderLeft: '4px solid var(--primary)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>({cat.tamilName})</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {catProducts.length} items
                  </span>
                </div>

                {/* Category Items Table */}
                <div className="table-container" style={{ border: '1px solid var(--border-color)' }}>
                  <table className="table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#fcfdfe' }}>
                        <th style={{ width: '8%' }}>Code</th>
                        <th>Cracker Item Description</th>
                        <th style={{ width: '15%' }}>Brand</th>
                        <th style={{ width: '15%' }}>Packing</th>
                        <th style={{ textAlign: 'right', width: '12%' }}>MRP Rate</th>
                        <th style={{ textAlign: 'center', width: '10%' }}>Discount</th>
                        <th style={{ textAlign: 'right', width: '14%' }}>Net Price (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catProducts.map((p) => {
                        const netPrice = p.sellingPrice * (1 - (p.discount || 0) / 100);
                        return (
                          <tr key={p.id}>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                              {p.code}
                            </td>
                            <td>
                              <div style={{ fontWeight: 700 }}>{p.name}</div>
                              {p.tamilName && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.tamilName}</div>
                              )}
                              {p.bundleItems && (
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                  Pack: {p.bundleItems}
                                </div>
                              )}
                            </td>
                            <td>{p.brand}</td>
                            <td>{p.packing}</td>
                            <td style={{ textAlign: 'right', textDecoration: p.discount > 0 ? 'line-through' : 'none', color: p.discount > 0 ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: 600 }}>
                              ₹{p.sellingPrice}
                            </td>
                            <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 700 }}>
                              {p.discount > 0 ? `${p.discount}% OFF` : '-'}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>
                              ₹{netPrice.toFixed(0)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div>* Prices are subject to availability of stock. Bulk discounts available for order above ₹10,000.</div>
          <div style={{ marginTop: '4px', fontWeight: 700, color: 'var(--primary)' }}>
            For booking &amp; door delivery, contact: {shop.mobile} / {shop.email}
          </div>
        </div>
      </div>
    </div>
  );
};
