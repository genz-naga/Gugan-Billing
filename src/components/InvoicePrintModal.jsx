import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Printer,
  X,
  FileSpreadsheet,
  Receipt,
  Download,
  CheckCircle2,
  Phone,
  MapPin
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const InvoicePrintModal = () => {
  const { shop, activeInvoiceForPrint, isPrintModalOpen, setIsPrintModalOpen } = useApp();
  const [printFormat, setPrintFormat] = useState(shop.printFormat || 'thermal'); // 'thermal' or 'a4'

  if (!isPrintModalOpen || !activeInvoiceForPrint) return null;

  const inv = activeInvoiceForPrint;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel" style={{ maxWidth: printFormat === 'a4' ? '820px' : '480px' }}>
        {/* Modal Controls (Hidden in Print) */}
        <div className="modal-header no-print">
          <div className="modal-title">
            <Printer size={20} color="var(--primary)" />
            <span>Invoice Print Preview #{inv.invoiceNo}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Format Toggle Buttons */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: 'var(--radius-md)' }}>
              <button
                onClick={() => setPrintFormat('thermal')}
                className="btn btn-sm"
                style={{
                  background: printFormat === 'thermal' ? '#ffffff' : 'transparent',
                  color: printFormat === 'thermal' ? 'var(--primary)' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: printFormat === 'thermal' ? 'var(--shadow-xs)' : 'none',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}
              >
                <Receipt size={14} />
                <span>Thermal 80mm</span>
              </button>
              <button
                onClick={() => setPrintFormat('a4')}
                className="btn btn-sm"
                style={{
                  background: printFormat === 'a4' ? '#ffffff' : 'transparent',
                  color: printFormat === 'a4' ? 'var(--accent-blue)' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: printFormat === 'a4' ? 'var(--shadow-xs)' : 'none',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}
              >
                <FileSpreadsheet size={14} />
                <span>A4 Standard</span>
              </button>
            </div>

            <button
              onClick={() => setIsPrintModalOpen(false)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem', borderRadius: '50%' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="modal-body" style={{ background: '#f8fafc', padding: '1.25rem', overflowY: 'auto' }}>
          {printFormat === 'thermal' ? (
            /* ==========================================================
               THERMAL RECEIPT (3-INCH / 80MM)
               ========================================================== */
            <div
              id="printable-invoice"
              style={{
                width: '320px',
                margin: '0 auto',
                background: '#ffffff',
                padding: '1.25rem 1rem',
                border: '1px dashed #cbd5e1',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#111827',
                lineHeight: 1.4,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                {shop.logo && (
                  <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                    <img src={shop.logo} alt="Logo" style={{ maxHeight: '48px', maxWidth: '140px', objectFit: 'contain' }} />
                  </div>
                )}
                <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#000000' }}>
                  {shop.name || 'SHRI GUGAN CRACKERS'}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, marginTop: '2px', color: '#374151' }}>
                  {shop.tamilName}
                </div>
                <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '3px' }}>
                  {shop.address}, {shop.city} - {shop.pincode}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>
                  Ph: {shop.mobile} {shop.altMobile ? `| ${shop.altMobile}` : ''}
                </div>
              </div>

              <div style={{ borderBottom: '1px dashed #000000', margin: '6px 0' }}></div>

              {/* Invoice Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                <span>Bill No: {inv.invoiceNo}</span>
                <span>Date: {formatDateTime(inv.date)}</span>
              </div>
              <div style={{ fontSize: '11px', marginTop: '3px' }}>
                <div><strong>Cust:</strong> {inv.customerName || 'Cash Customer'}</div>
                {inv.customerMobile && <div><strong>Mob:</strong> {inv.customerMobile}</div>}
              </div>

              <div style={{ borderBottom: '1px dashed #000000', margin: '6px 0' }}></div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #000000', textAlign: 'left' }}>
                    <th style={{ paddingBottom: '3px' }}>Item</th>
                    <th style={{ paddingBottom: '3px', textAlign: 'center' }}>Qty</th>
                    <th style={{ paddingBottom: '3px', textAlign: 'right' }}>Rate</th>
                    <th style={{ paddingBottom: '3px', textAlign: 'right' }}>Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.items.map((item, idx) => (
                    <tr key={idx} style={{ verticalAlign: 'top' }}>
                      <td style={{ paddingTop: '4px', paddingBottom: '2px' }}>
                        <div>{item.name}</div>
                        {item.discount > 0 && (
                          <div style={{ fontSize: '9px', color: '#4b5563' }}>
                            Disc: {item.discount}% off
                          </div>
                        )}
                      </td>
                      <td style={{ paddingTop: '4px', textAlign: 'center' }}>{item.qty}</td>
                      <td style={{ paddingTop: '4px', textAlign: 'right' }}>₹{item.rate}</td>
                      <td style={{ paddingTop: '4px', textAlign: 'right', fontWeight: 700 }}>₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderBottom: '1px dashed #000000', margin: '8px 0' }}></div>

              {/* Calculations */}
              <div style={{ fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>₹{inv.subtotal.toFixed(2)}</span>
                </div>
                {inv.discountTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                    <span>Discount:</span>
                    <span>-₹{inv.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                {inv.taxTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tax ({shop.defaultTaxRate || 12}%):</span>
                    <span>₹{inv.taxTotal.toFixed(2)}</span>
                  </div>
                )}
                {inv.roundOff !== 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                    <span>Round Off:</span>
                    <span>{inv.roundOff > 0 ? `+₹${inv.roundOff.toFixed(2)}` : `-₹${Math.abs(inv.roundOff).toFixed(2)}`}</span>
                  </div>
                )}
              </div>

              <div style={{ borderBottom: '1px double #000000', margin: '6px 0' }}></div>

              {/* Grand Total */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '15px',
                fontWeight: 800,
                padding: '2px 0'
              }}>
                <span>GRAND TOTAL:</span>
                <span>₹{inv.grandTotal.toFixed(2)}</span>
              </div>

              <div style={{ borderBottom: '1px double #000000', margin: '6px 0' }}></div>

              {/* Payment Details */}
              <div style={{ fontSize: '11px', margin: '6px 0' }}>
                <strong>Payment Mode:</strong> {inv.paymentMethod}
                {inv.paymentMethod === 'Split' && inv.splitDetails && (
                  <div style={{ paddingLeft: '8px', fontSize: '10px', color: '#374151', marginTop: '2px' }}>
                    {inv.splitDetails.cash > 0 && <div>Cash: ₹{inv.splitDetails.cash}</div>}
                    {inv.splitDetails.upi > 0 && <div>UPI: ₹{inv.splitDetails.upi}</div>}
                    {inv.splitDetails.card > 0 && <div>Card: ₹{inv.splitDetails.card}</div>}
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '10px' }}>
                <div style={{ fontWeight: 700 }}>{shop.footerMessage}</div>
                <div style={{ fontSize: '9px', marginTop: '4px', color: '#4b5563' }}>
                  Safety: Keep water/sand bucket nearby. Light with agarbatti only.
                </div>
                <div style={{ marginTop: '8px', fontSize: '9px', color: '#6b7280' }}>
                  Software by Gugan POS • www.guganpos.com
                </div>
              </div>
            </div>
          ) : (
            /* ==========================================================
               A4 STANDARD SHEET / RETAIL INVOICE
               ========================================================== */
            <div
              id="printable-invoice"
              style={{
                width: '100%',
                maxWidth: '750px',
                margin: '0 auto',
                background: '#ffffff',
                padding: '2rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--text-main)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {/* Header Box */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2px solid var(--primary)',
                paddingBottom: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {shop.logo ? (
                      <img src={shop.logo} alt={shop.name} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                    ) : (
                      <span style={{ fontSize: '1.75rem' }}>🧨</span>
                    )}
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {shop.name}
                    </h2>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginTop: '2px' }}>
                    {shop.tamilName} • {shop.tagline}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '380px' }}>
                    {shop.address}, {shop.city}, {shop.district} - {shop.pincode}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <strong>Phone:</strong> {shop.mobile} {shop.altMobile && `| ${shop.altMobile}`} • <strong>Email:</strong> {shop.email}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem', fontWeight: 800 }}>
                    RETAIL INVOICE
                  </span>
                  <table style={{ marginTop: '0.75rem', fontSize: '0.82rem', textAlign: 'right', marginLeft: 'auto' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '2px 8px', color: 'var(--text-muted)' }}>Invoice No:</td>
                        <td style={{ padding: '2px 0', fontWeight: 700 }}>{inv.invoiceNo}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 8px', color: 'var(--text-muted)' }}>Date & Time:</td>
                        <td style={{ padding: '2px 0', fontWeight: 600 }}>{formatDateTime(inv.date)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 8px', color: 'var(--text-muted)' }}>Payment:</td>
                        <td style={{ padding: '2px 0', fontWeight: 700, color: 'var(--success)' }}>{inv.paymentMethod}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer Box */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Customer Details:
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    {inv.customerName || 'Cash / Walk-in Customer'}
                  </div>
                  {inv.customerAddress && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{inv.customerAddress}</div>
                  )}
                </div>
                {inv.customerMobile && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Mobile Number:
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
                      +91 {inv.customerMobile}
                    </div>
                  </div>
                )}
              </div>

              {/* Item Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid var(--border-color)', fontSize: '0.8rem', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', width: '5%' }}>#</th>
                    <th style={{ padding: '8px 10px' }}>Item Description</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '10%' }}>Qty</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '15%' }}>Rate (₹)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '12%' }}>Disc</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '10%' }}>Tax</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '18%' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>
                        {item.name}
                        {item.code && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>[{item.code}]</span>}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{item.qty}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatCurrency(item.rate)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>
                        {item.discount > 0 ? `${item.discount}%` : '-'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {item.taxRate || 12}%
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary and Terms */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
                {/* Terms and QR */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Terms &amp; Conditions:
                  </div>
                  <pre style={{
                    fontFamily: 'inherit',
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {shop.terms}
                  </pre>

                  {inv.paymentMethod === 'Split' && inv.splitDetails && (
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                      <strong style={{ fontSize: '0.75rem' }}>Split Payment Summary:</strong>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', marginTop: '2px' }}>
                        {inv.splitDetails.cash > 0 && <span>Cash: {formatCurrency(inv.splitDetails.cash)}</span>}
                        {inv.splitDetails.upi > 0 && <span>UPI: {formatCurrency(inv.splitDetails.upi)}</span>}
                        {inv.splitDetails.card > 0 && <span>Card: {formatCurrency(inv.splitDetails.card)}</span>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Calculation Column */}
                <div style={{ width: '280px' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>Items / Total Qty:</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>
                          {inv.items.length} items / {inv.items.reduce((acc, i) => acc + Number(i.qty), 0)} pcs
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>Subtotal:</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(inv.subtotal)}</td>
                      </tr>
                      {inv.discountTotal > 0 && (
                        <tr>
                          <td style={{ padding: '4px 0', color: 'var(--success)' }}>Total Discount:</td>
                          <td style={{ padding: '4px 0', textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>
                            -{formatCurrency(inv.discountTotal)}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>GST Tax ({shop.defaultTaxRate || 12}%):</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(inv.taxTotal)}</td>
                      </tr>
                      {inv.roundOff !== 0 && (
                        <tr>
                          <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>Round Off:</td>
                          <td style={{ padding: '4px 0', textAlign: 'right', color: 'var(--text-muted)' }}>
                            {inv.roundOff > 0 ? `+${formatCurrency(inv.roundOff)}` : `-${formatCurrency(Math.abs(inv.roundOff))}`}
                          </td>
                        </tr>
                      )}
                      <tr style={{ borderTop: '2px solid var(--border-color)', borderBottom: '2px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>GRAND TOTAL:</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {formatCurrency(inv.grandTotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Signatory */}
                  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <div style={{ borderBottom: '1px solid #cbd5e1', width: '150px', margin: '0 auto 4px' }}></div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      For {shop.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Authorized Signatory</div>
                  </div>
                </div>
              </div>

              {/* Thank you Banner */}
              <div style={{
                textAlign: 'center',
                marginTop: '1.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--primary)'
              }}>
                {shop.footerMessage}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="modal-footer no-print">
          <button onClick={() => setIsPrintModalOpen(false)} className="btn btn-secondary">
            Close Preview
          </button>
          <button onClick={handlePrint} className="btn btn-primary" style={{ gap: '0.5rem', fontWeight: 700 }}>
            <Printer size={16} />
            <span>Print Invoice Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
