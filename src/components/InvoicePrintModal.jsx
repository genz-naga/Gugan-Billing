import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Printer,
  X,
  FileSpreadsheet,
  Receipt,
  Sparkles
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

export const InvoicePrintModal = () => {
  const { shop, activeInvoiceForPrint, isPrintModalOpen, setIsPrintModalOpen } = useApp();
  // Default to performa format matching user's reference bill
  const [printFormat, setPrintFormat] = useState(shop.printFormat || 'performa'); // 'performa', 'a4', 'thermal'
  const monogramText = 'RK';

  if (!isPrintModalOpen || !activeInvoiceForPrint) return null;

  const inv = activeInvoiceForPrint;

  const handlePrint = () => {
    window.print();
  };

  // Financial calculations with robust fallbacks
  const subtotal = Number(inv.subtotal) || 0;
  const totalCases = inv.totalCases !== undefined
    ? Number(inv.totalCases)
    : (inv.items ? inv.items.reduce((sum, i) => sum + (Number(i.cases) || 0), 0) : 0);

  const pfPercent = inv.pfPercent !== undefined ? Number(inv.pfPercent) : 3;
  const pfAmount = inv.pfAmount !== undefined
    ? Number(inv.pfAmount)
    : Number(((subtotal * pfPercent) / 100).toFixed(2));

  const taxPercent = inv.taxPercent !== undefined ? Number(inv.taxPercent) : (shop.defaultTaxRate || 6.5);
  const taxBase = subtotal + pfAmount;
  const taxAmount = inv.taxTotal !== undefined
    ? Number(inv.taxTotal)
    : Number(((taxBase * taxPercent) / 100).toFixed(2));

  const rawNetAmount = taxBase + taxAmount;
  const netAmount = inv.netAmount !== undefined
    ? Number(inv.netAmount)
    : (inv.grandTotal !== undefined ? Number(inv.grandTotal) : Math.round(rawNetAmount));

  const roundOff = inv.roundOff !== undefined
    ? Number(inv.roundOff)
    : Number((netAmount - rawNetAmount).toFixed(2));

  const commissionPercent = inv.commissionPercent !== undefined ? Number(inv.commissionPercent) : 3;
  const commissionAmount = inv.commissionAmount !== undefined
    ? Number(inv.commissionAmount)
    : Math.round((subtotal * commissionPercent) / 100);

  const netBalance = inv.netBalance !== undefined
    ? Number(inv.netBalance)
    : (netAmount - commissionAmount);

  // Minimum row count for authentic vertical lines stretching to footer
  const emptyRowsCount = Math.max(0, 11 - (inv.items ? inv.items.length : 0));
  const emptyRows = Array.from({ length: emptyRowsCount });

  return (
    <div className="modal-backdrop">
      <div className="modal-panel" style={{ maxWidth: printFormat === 'thermal' ? '460px' : '880px', width: '100%' }}>
        {/* Modal Controls (Hidden in Print) */}
        <div className="modal-header no-print">
          <div className="modal-title">
            <Printer size={20} color="var(--primary)" />
            <span>Bill Print Preview #{inv.invoiceNo}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Format Toggle Buttons */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: 'var(--radius-md)' }}>
              <button
                onClick={() => setPrintFormat('performa')}
                className="btn btn-sm"
                style={{
                  background: printFormat === 'performa' ? '#ffffff' : 'transparent',
                  color: printFormat === 'performa' ? 'var(--primary)' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: printFormat === 'performa' ? 'var(--shadow-xs)' : 'none',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  gap: '0.35rem'
                }}
              >
                <Sparkles size={14} />
                <span>Performa Wholesale</span>
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

              <button
                onClick={() => setPrintFormat('thermal')}
                className="btn btn-sm"
                style={{
                  background: printFormat === 'thermal' ? '#ffffff' : 'transparent',
                  color: printFormat === 'thermal' ? '#059669' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: printFormat === 'thermal' ? 'var(--shadow-xs)' : 'none',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}
              >
                <Receipt size={14} />
                <span>Thermal 80mm</span>
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
        <div className="modal-body" style={{ background: '#cbd5e1', padding: '1.25rem', overflowY: 'auto' }}>
          {printFormat === 'performa' ? (
            /* ==========================================================
               PERFORMA / WHOLESALE BILL (EXACT MATCH TO REFERENCE PHOTO)
               ========================================================== */
            <div
              id="printable-invoice"
              className="performa-invoice"
              style={{
                width: '100%',
                maxWidth: '790px',
                minHeight: '1020px',
                margin: '0 auto',
                background: '#ffffff',
                border: '1.5px solid #000000',
                boxSizing: 'border-box',
                fontFamily: 'Arial, Helvetica, sans-serif',
                color: '#000000',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                position: 'relative'
              }}
            >
              {/* Document Header Title */}
              <div style={{
                position: 'relative',
                padding: '8px 16px 6px',
                textAlign: 'center',
                borderBottom: '1.5px solid #000000'
              }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  color: '#000000',
                  textTransform: 'uppercase'
                }}>
                  {inv.billTitle || 'PERFORMA'}
                </div>
                <div style={{
                  position: 'absolute',
                  right: '16px',
                  top: '10px',
                  fontSize: '11px',
                  color: '#1e293b'
                }}>
                  {inv.copyType || '(EXTRA COPY)'}
                </div>
              </div>

              {/* Top Customer Info and Logo Box */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 140px',
                borderBottom: '1.5px solid #000000'
              }}>
                {/* Left Side: M/s Customer, City, GSTIN/PAN */}
                <div style={{
                  padding: '8px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                      <span style={{ fontWeight: 'normal' }}>M/s : </span>
                      <strong style={{ fontSize: '14px', letterSpacing: '0.02em' }}>
                        {inv.customerName || 'M/S.K.R.ENTERPRISE'}
                      </strong>
                    </div>
                    <div style={{ paddingLeft: '38px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '2px' }}>
                      {inv.customerAddress || 'BANGALORE'}
                    </div>
                  </div>

                  <div style={{
                    borderTop: '1px solid #000000',
                    marginTop: '8px',
                    paddingTop: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    GSTIN / PAN : <span style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.04em' }}>{inv.customerGstin || '29ATGPM1120L2ZN'}</span>
                  </div>
                </div>

                {/* Right Side: Boxed Logo / Monogram Frame */}
                <div style={{
                  borderLeft: '1.5px solid #000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  background: '#ffffff',
                  minHeight: '80px'
                }}>
                  {shop.logo && shop.logo !== '/logo.png' ? (
                    <img src={shop.logo} alt="Logo" style={{ maxHeight: '72px', maxWidth: '120px', objectFit: 'contain' }} />
                  ) : (
                    /* High-Fidelity Stylized Monogram Vector matching image */
                    <svg viewBox="0 0 100 80" width="100" height="70" style={{ overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="monogramGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#1e293b" />
                          <stop offset="100%" stopColor="#475569" />
                        </linearGradient>
                      </defs>
                      {/* Stylized Monogram Letters "RK" / Shop Initials */}
                      <text
                        x="50%"
                        y="62%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fill="url(#monogramGrad)"
                        fontSize="48"
                        fontWeight="900"
                        fontFamily="Georgia, serif"
                        letterSpacing="-2"
                      >
                        {monogramText}
                      </text>
                      {/* Swoosh Stroke across */}
                      <path
                        d="M 15 65 Q 50 35 88 15"
                        stroke="#000000"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        opacity="0.8"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Table with continuous vertical borders running down */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px',
                  color: '#000000',
                  flex: 1
                }}>
                  <thead>
                    <tr style={{
                      borderBottom: '1.5px solid #000000',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}>
                      <th style={{ width: '5%', padding: '6px 4px', borderRight: '1px solid #000000' }}>S.N</th>
                      <th style={{ width: '33%', padding: '6px 6px', textAlign: 'left', borderRight: '1px solid #000000' }}>Product name</th>
                      <th style={{ width: '8%', padding: '6px 4px', borderRight: '1px solid #000000' }}>Cases</th>
                      <th style={{ width: '11%', padding: '6px 4px', borderRight: '1px solid #000000' }}>Pack<br />Content</th>
                      <th style={{ width: '7%', padding: '6px 4px', borderRight: '1px solid #000000' }}>Qty</th>
                      <th style={{ width: '10%', padding: '6px 4px', borderRight: '1px solid #000000' }}>Rate</th>
                      <th style={{ width: '8%', padding: '6px 4px', borderRight: '1px solid #000000' }}>Disc.%</th>
                      <th style={{ width: '8%', padding: '6px 4px', borderRight: '1px solid #000000' }}>Per</th>
                      <th style={{ width: '10%', padding: '6px 6px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Billed Items */}
                    {inv.items && inv.items.map((item, idx) => (
                      <tr key={idx} style={{ height: '28px', verticalAlign: 'middle' }}>
                        <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #000000' }}>
                          {idx + 1}
                        </td>
                        <td style={{ textAlign: 'left', padding: '4px 6px', borderRight: '1px solid #000000', fontWeight: 'bold' }}>
                          {item.name}
                        </td>
                        <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #000000' }}>
                          {item.cases || 1}
                        </td>
                        <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #000000' }}>
                          {item.packContent || (item.packing || '18 BOX')}
                        </td>
                        <td style={{ textAlign: 'right', padding: '4px 6px', borderRight: '1px solid #000000' }}>
                          {item.qty}
                        </td>
                        <td style={{ textAlign: 'right', padding: '4px 6px', borderRight: '1px solid #000000' }}>
                          {Number(item.rate).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #000000' }}>
                          {item.discount ? Number(item.discount).toFixed(2) : '0.00'}
                        </td>
                        <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #000000' }}>
                          {item.per || '1 BOX'}
                        </td>
                        <td style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 'bold' }}>
                          {Number(item.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {/* Extended Empty Rows to Maintain Vertical Gridlines down the Page */}
                    {emptyRows.map((_, i) => (
                      <tr key={`empty-${i}`} style={{ height: '30px' }}>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #000000' }}>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Row directly above bottom boxes */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '38% 8% 44% 10%',
                borderTop: '1.5px solid #000000',
                borderBottom: '1.5px solid #000000',
                fontSize: '12px',
                fontWeight: 'bold',
                lineHeight: '26px'
              }}>
                <div style={{ textAlign: 'right', paddingRight: '10px', borderRight: '1px solid #000000' }}>
                  Total Cases
                </div>
                <div style={{ textAlign: 'center', borderRight: '1px solid #000000' }}>
                  {totalCases}
                </div>
                <div style={{ textAlign: 'right', paddingRight: '14px', borderRight: '1px solid #000000' }}>
                  SubTotal
                </div>
                <div style={{ textAlign: 'right', paddingRight: '6px' }}>
                  {subtotal.toFixed(2)}
                </div>
              </div>

              {/* Bottom Footer Split Section (Dispatch Details & Financial Summary) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 280px',
                minHeight: '175px'
              }}>
                {/* Left Box: Order No, Despatch date, Transport, Agent, Page 1 */}
                <div style={{
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div>
                      <strong>Order No &nbsp; &nbsp; &nbsp; &nbsp;:</strong> {inv.orderNo ? `${inv.orderNo},` : ' ,'}
                    </div>
                    <div>
                      <strong>Despatch date &nbsp;:</strong> {inv.despatchDate || '28-08-2026'}
                    </div>
                    <div>
                      <strong>Transport &nbsp; &nbsp; &nbsp; :</strong> {inv.transport || 'ARIYA'}
                    </div>
                    <div>
                      <strong>Agent &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :</strong> {inv.agent || 'ARUN'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', fontSize: '11px', paddingBottom: '2px', color: '#1e293b' }}>
                    Page 1
                  </div>
                </div>

                {/* Right Box: P&F, TAX, Round off, Net amount, Comission, Net Balance */}
                <div style={{
                  borderLeft: '1.5px solid #000000',
                  padding: '8px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '2px 0' }}>P &amp; F {pfPercent} %</td>
                        <td style={{ textAlign: 'right', padding: '2px 0' }}>{pfAmount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 0' }}>TAX</td>
                        <td style={{ textAlign: 'right', padding: '2px 0' }}>{taxAmount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 0' }}>Round off</td>
                        <td style={{ textAlign: 'right', padding: '2px 0' }}>
                          {roundOff > 0 ? `${roundOff.toFixed(2)}` : `${roundOff.toFixed(2)}`}
                        </td>
                      </tr>

                      {/* Net Amount with separator */}
                      <tr style={{ borderTop: '1px solid #000000' }}>
                        <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Net amount</td>
                        <td style={{ textAlign: 'right', padding: '4px 0', fontWeight: 'bold' }}>
                          {netAmount.toFixed(2)}
                        </td>
                      </tr>

                      {/* Comission */}
                      <tr>
                        <td style={{ padding: '2px 0' }}>Comission @ {commissionPercent}%</td>
                        <td style={{ textAlign: 'right', padding: '2px 0' }}>{commissionAmount.toFixed(2)}</td>
                      </tr>

                      {/* Net Balance with separator */}
                      <tr style={{ borderTop: '1px solid #000000' }}>
                        <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Net Balance</td>
                        <td style={{ textAlign: 'right', padding: '4px 0', fontWeight: 'bold' }}>
                          {netBalance.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : printFormat === 'thermal' ? (
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
                <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#000000' }}>
                  {shop.name || 'SHRI GUGAN CRACKERS'}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, marginTop: '2px', color: '#374151' }}>
                  {shop.tamilName}
                </div>
                <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '3px' }}>
                  {shop.address}, {shop.city}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>
                  Ph: {shop.mobile}
                </div>
              </div>

              <div style={{ borderBottom: '1px dashed #000000', margin: '6px 0' }}></div>

              {/* Invoice Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                <span>Bill: {inv.invoiceNo}</span>
                <span>Date: {inv.despatchDate || formatDateTime(inv.date)}</span>
              </div>
              <div style={{ fontSize: '11px', marginTop: '3px' }}>
                <div><strong>M/s:</strong> {inv.customerName || 'Cash Customer'}</div>
                {inv.customerAddress && <div><strong>City:</strong> {inv.customerAddress}</div>}
                {inv.customerGstin && <div><strong>GSTIN:</strong> {inv.customerGstin}</div>}
                {inv.transport && <div><strong>Transport:</strong> {inv.transport}</div>}
              </div>

              <div style={{ borderBottom: '1px dashed #000000', margin: '6px 0' }}></div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #000000', textAlign: 'left' }}>
                    <th style={{ paddingBottom: '3px' }}>Item</th>
                    <th style={{ paddingBottom: '3px', textAlign: 'center' }}>Cs</th>
                    <th style={{ paddingBottom: '3px', textAlign: 'center' }}>Qty</th>
                    <th style={{ paddingBottom: '3px', textAlign: 'right' }}>Rate</th>
                    <th style={{ paddingBottom: '3px', textAlign: 'right' }}>Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.items && inv.items.map((item, idx) => (
                    <tr key={idx} style={{ verticalAlign: 'top' }}>
                      <td style={{ paddingTop: '4px', paddingBottom: '2px' }}>
                        <div>{item.name}</div>
                        <div style={{ fontSize: '9px', color: '#64748b' }}>{item.packContent}</div>
                      </td>
                      <td style={{ paddingTop: '4px', textAlign: 'center' }}>{item.cases || 1}</td>
                      <td style={{ paddingTop: '4px', textAlign: 'center' }}>{item.qty}</td>
                      <td style={{ paddingTop: '4px', textAlign: 'right' }}>₹{Number(item.rate).toFixed(2)}</td>
                      <td style={{ paddingTop: '4px', textAlign: 'right', fontWeight: 700 }}>₹{Number(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderBottom: '1px dashed #000000', margin: '8px 0' }}></div>

              {/* Calculations */}
              <div style={{ fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Cases:</span>
                  <span>{totalCases}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {pfAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>P &amp; F ({pfPercent}%):</span>
                    <span>₹{pfAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tax ({taxPercent}%):</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {roundOff !== 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280' }}>
                    <span>Round Off:</span>
                    <span>{roundOff > 0 ? `+₹${roundOff.toFixed(2)}` : `₹${roundOff.toFixed(2)}`}</span>
                  </div>
                )}
              </div>

              <div style={{ borderBottom: '1px double #000000', margin: '6px 0' }}></div>

              {/* Grand Total */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: 800,
                padding: '2px 0'
              }}>
                <span>NET AMOUNT:</span>
                <span>₹{netAmount.toFixed(2)}</span>
              </div>

              {commissionAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#dc2626' }}>
                  <span>Comission @ {commissionPercent}%:</span>
                  <span>-₹{commissionAmount.toFixed(2)}</span>
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: 800,
                padding: '4px 0',
                color: '#16a34a'
              }}>
                <span>NET BALANCE:</span>
                <span>₹{netBalance.toFixed(2)}</span>
              </div>

              <div style={{ borderBottom: '1px double #000000', margin: '6px 0' }}></div>

              {/* Footer Note */}
              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '10px' }}>
                <div style={{ fontWeight: 700 }}>{shop.footerMessage}</div>
                <div style={{ marginTop: '6px', fontSize: '9px', color: '#6b7280' }}>
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
                    <span style={{ fontSize: '1.75rem' }}>🧨</span>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {shop.name}
                    </h2>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', marginTop: '2px' }}>
                    {shop.tamilName} • {shop.tagline}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '380px' }}>
                    {shop.address}, {shop.city} - {shop.pincode}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <strong>Phone:</strong> {shop.mobile} • <strong>Email:</strong> {shop.email}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem', fontWeight: 800 }}>
                    TAX INVOICE
                  </span>
                  <table style={{ marginTop: '0.75rem', fontSize: '0.82rem', textAlign: 'right', marginLeft: 'auto' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '2px 8px', color: 'var(--text-muted)' }}>Invoice No:</td>
                        <td style={{ padding: '2px 0', fontWeight: 700 }}>{inv.invoiceNo}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 8px', color: 'var(--text-muted)' }}>Date:</td>
                        <td style={{ padding: '2px 0', fontWeight: 600 }}>{inv.despatchDate || formatDateTime(inv.date)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 8px', color: 'var(--text-muted)' }}>Transport:</td>
                        <td style={{ padding: '2px 0', fontWeight: 700 }}>{inv.transport || 'Direct'}</td>
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
                    M/s Customer Details:
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    {inv.customerName || 'Cash / Walk-in Customer'}
                  </div>
                  {inv.customerAddress && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{inv.customerAddress}</div>
                  )}
                  {inv.customerGstin && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      GSTIN/PAN: {inv.customerGstin}
                    </div>
                  )}
                </div>
                {inv.customerMobile && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Mobile:
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
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '10%' }}>Cases</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '10%' }}>Qty</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '15%' }}>Rate (₹)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '10%' }}>Disc</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '18%' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.items && inv.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>
                        {item.name}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.packContent}</div>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>{item.cases || 1}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{item.qty}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{Number(item.rate).toFixed(2)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--success)' }}>
                        {item.discount > 0 ? `${item.discount}%` : '-'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>
                        {Number(item.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary and Calculations */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Transport &amp; Despatch Notes:
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div>Transport: <strong>{inv.transport || 'N/A'}</strong></div>
                    <div>Agent: <strong>{inv.agent || 'N/A'}</strong></div>
                    <div>Order No: <strong>{inv.orderNo || 'N/A'}</strong></div>
                  </div>
                </div>

                <div style={{ width: '280px' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>Total Cases / Items:</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>
                          {totalCases} cases / {inv.items ? inv.items.length : 0} items
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>SubTotal:</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{subtotal.toFixed(2)}</td>
                      </tr>
                      {pfAmount > 0 && (
                        <tr>
                          <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>P &amp; F ({pfPercent}%):</td>
                          <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{pfAmount.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>TAX ({taxPercent}%):</td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{taxAmount.toFixed(2)}</td>
                      </tr>
                      {roundOff !== 0 && (
                        <tr>
                          <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>Round off:</td>
                          <td style={{ padding: '4px 0', textAlign: 'right', color: 'var(--text-muted)' }}>
                            {roundOff > 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 0', fontSize: '1rem', fontWeight: 800 }}>Net amount:</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontSize: '1.1rem', fontWeight: 800 }}>
                          {netAmount.toFixed(2)}
                        </td>
                      </tr>
                      {commissionAmount > 0 && (
                        <tr>
                          <td style={{ padding: '4px 0', color: '#dc2626' }}>Comission @ {commissionPercent}%:</td>
                          <td style={{ padding: '4px 0', textAlign: 'right', color: '#dc2626', fontWeight: 600 }}>
                            -{commissionAmount.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      <tr style={{ borderTop: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '6px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
                          Net Balance:
                        </td>
                        <td style={{ padding: '6px 0', textAlign: 'right', fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {netBalance.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
            <span>Print Invoice Now (Ctrl+P)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
