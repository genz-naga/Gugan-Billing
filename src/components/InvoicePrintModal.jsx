import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Printer,
  X,
  FileSpreadsheet,
  Receipt,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  QrCode,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { formatDateTime, numberToWordsIndian, formatCurrency } from '../utils/formatters';

export const InvoicePrintModal = () => {
  const { shop, activeInvoiceForPrint, isPrintModalOpen, setIsPrintModalOpen } = useApp();
  // Default to A4 Executive or the bill's saved format
  const [printFormat, setPrintFormat] = useState('a4'); // 'a4', 'performa', 'thermal'

  useEffect(() => {
    if (activeInvoiceForPrint) {
      setPrintFormat(activeInvoiceForPrint.billFormat || 'a4');
    }
  }, [activeInvoiceForPrint]);

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

  const totalQty = inv.totalQty !== undefined
    ? Number(inv.totalQty)
    : (inv.items ? inv.items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0) : 0);

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

  // Pad items for authentic paper billing look
  const emptyRowsCountPerforma = Math.max(0, 10 - (inv.items ? inv.items.length : 0));
  const emptyRowsPerforma = Array.from({ length: emptyRowsCountPerforma });

  const emptyRowsCountA4 = Math.max(0, 6 - (inv.items ? inv.items.length : 0));
  const emptyRowsA4 = Array.from({ length: emptyRowsCountA4 });

  // UPI payment payload for QR Code
  const upiId = shop.upiId || 'gugancrackers@upi';
  const upiPayLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shop.name || 'Shri Gugan Crackers')}&am=${netAmount}&cu=INR&tn=${encodeURIComponent(`Invoice ${inv.invoiceNo}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=1&data=${encodeURIComponent(upiPayLink)}`;

  // Shop details with safe fallbacks
  const shopAddress = shop.address || 'Sattur Road, Near Bus Stand';
  const shopCity = shop.city || 'Sivakasi';
  const shopDistrict = shop.district || 'Virudhunagar';
  const shopState = shop.state || 'Tamil Nadu';
  const shopPincode = shop.pincode || '626123';
  const shopPhone = shop.mobile || '94431 23456';
  const shopAltPhone = shop.altMobile || '98421 23456';
  const shopEmail = shop.email || 'guganfireworks@gmail.com';
  const shopGstin = shop.gstin || '33AAAAA0000A1Z5';

  return (
    <div className="modal-backdrop">
      <div className="modal-panel" style={{ maxWidth: printFormat === 'thermal' ? '460px' : '920px', width: '100%' }}>
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
                onClick={() => setPrintFormat('a4')}
                className="btn btn-sm"
                style={{
                  background: printFormat === 'a4' ? '#ffffff' : 'transparent',
                  color: printFormat === 'a4' ? 'var(--primary)' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: printFormat === 'a4' ? 'var(--shadow-xs)' : 'none',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  gap: '0.35rem'
                }}
              >
                <Sparkles size={14} />
                <span>Executive A4 (முழு பில்)</span>
              </button>

              <button
                onClick={() => setPrintFormat('performa')}
                className="btn btn-sm"
                style={{
                  background: printFormat === 'performa' ? '#ffffff' : 'transparent',
                  color: printFormat === 'performa' ? 'var(--accent-blue)' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: printFormat === 'performa' ? 'var(--shadow-xs)' : 'none',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  gap: '0.35rem'
                }}
              >
                <FileSpreadsheet size={14} />
                <span>Wholesale Performa (மொத்த விற்பனை)</span>
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
                  fontSize: '0.75rem',
                  gap: '0.35rem'
                }}
              >
                <Receipt size={14} />
                <span>Thermal 80mm (ரசீது)</span>
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
          {printFormat === 'a4' ? (
            /* ==========================================================
               1. EXECUTIVE A4 MASTER BILL TEMPLATE (COMPLETE & LUXURIOUS)
               ========================================================== */
            <div
              id="printable-invoice"
              style={{
                width: '100%',
                maxWidth: '820px',
                margin: '0 auto',
                background: '#ffffff',
                border: '2px solid #1e293b',
                boxSizing: 'border-box',
                fontFamily: 'Arial, Helvetica, sans-serif',
                color: '#0f172a',
                padding: '1.25rem 1.5rem',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              {/* TOP HEADER: Shop Logo, Shop Name, Complete Address, Invoice Meta */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '110px 1fr 220px',
                alignItems: 'center',
                gap: '1rem',
                borderBottom: '2px solid #881337',
                paddingBottom: '0.85rem'
              }}>
                {/* 1. Shop Logo */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#ffffff',
                  padding: '4px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <img
                    src={shop.logo || '/logo.png'}
                    alt="Shri Gugan Crackers Logo"
                    style={{
                      maxHeight: '92px',
                      maxWidth: '100px',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                </div>

                {/* 2. Shop Details & Address */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: '900',
                    color: '#881337',
                    letterSpacing: '0.04em',
                    lineHeight: '1.1',
                    textTransform: 'uppercase'
                  }}>
                    {shop.name || 'SHRI GUGAN CRACKERS'}
                  </div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 'bold',
                    color: '#b45309',
                    letterSpacing: '0.02em',
                    marginTop: '1px'
                  }}>
                    {shop.tamilName || 'ஸ்ரீ குகன் கிராக்கர்ஸ்'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {shop.tagline || 'Direct Sivakasi Fireworks • Retail & Wholesale'}
                  </div>

                  {/* Complete Shop Address */}
                  <div style={{
                    fontSize: '11.5px',
                    color: '#1e293b',
                    marginTop: '3px',
                    lineHeight: '1.35'
                  }}>
                    <strong>Address:</strong> {shopAddress}, {shopCity} - {shopPincode}, {shopDistrict} Dist, {shopState}
                  </div>

                  <div style={{
                    fontSize: '11px',
                    color: '#1e293b',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.85rem'
                  }}>
                    <span><strong>Phone:</strong> +91 {shopPhone} {shopAltPhone ? ` / ${shopAltPhone}` : ''}</span>
                    <span><strong>Email:</strong> {shopEmail}</span>
                  </div>

                  <div style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#0f172a'
                  }}>
                    <span>GSTIN: <span style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}>{shopGstin}</span></span>
                    <span style={{ marginLeft: '12px', color: '#64748b' }}>State Code: 33 (TN)</span>
                  </div>
                </div>

                {/* 3. Invoice Badge & Key Numbers */}
                <div style={{
                  borderLeft: '1.5px dashed #cbd5e1',
                  paddingLeft: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{
                    background: '#881337',
                    color: '#ffffff',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontWeight: '900',
                    fontSize: '13px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}>
                    {(inv.billTitle && inv.billTitle !== 'PERFORMA') ? inv.billTitle : 'INVOICE'}
                  </div>

                  <table style={{ width: '100%', fontSize: '11.5px', marginTop: '6px' }}>
                    <tbody>
                      <tr>
                        <td style={{ color: '#64748b', fontWeight: 'bold', padding: '2px 0' }}>Bill No:</td>
                        <td style={{ textAlign: 'right', fontWeight: '900', fontFamily: 'monospace', fontSize: '13px', color: '#0f172a' }}>
                          {inv.invoiceNo}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b', padding: '2px 0' }}>Date:</td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>
                          {inv.despatchDate || formatDateTime(inv.date)}
                        </td>
                      </tr>
                      {inv.orderNo && (
                        <tr>
                          <td style={{ color: '#64748b', padding: '2px 0' }}>Order No:</td>
                          <td style={{ textAlign: 'right', fontWeight: '600' }}>{inv.orderNo}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CUSTOMER DETAILS (BILLED TO) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                    Billed To / வாடிக்கையாளர் விவரம்:
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', marginTop: '2px' }}>
                    M/s {inv.customerName || 'Cash / Walk-in Customer'}
                  </div>
                  <div style={{ color: '#334155', marginTop: '2px', fontWeight: '500' }}>
                    <strong>Address:</strong> {inv.customerAddress || 'Direct / Sivakasi'}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {inv.customerMobile && (
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ color: '#64748b' }}>Customer Mobile: </span>
                      <strong style={{ color: '#881337', fontSize: '13px' }}>+91 {inv.customerMobile}</strong>
                    </div>
                  )}
                  {inv.customerGstin ? (
                    <div style={{ fontSize: '12px', marginTop: '2px' }}>
                      <span style={{ color: '#64748b' }}>GSTIN / PAN: </span>
                      <strong style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}>{inv.customerGstin}</strong>
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Place of Supply: <strong>Tamil Nadu (33)</strong>
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    Payment Mode: <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{inv.paymentMethod || 'Cash'}</span>
                  </div>
                </div>
              </div>

              {/* PRODUCTS TABLE */}
              <div style={{ overflow: 'hidden', border: '1.5px solid #000000', borderRadius: '4px' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '11.5px',
                  color: '#000000'
                }}>
                  <thead>
                    <tr style={{
                      background: '#1e293b',
                      color: '#ffffff',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '11.5px'
                    }}>
                      <th style={{ width: '5%', padding: '6px 4px', borderRight: '1px solid #ffffff' }}>S.N</th>
                      <th style={{ width: '35%', padding: '6px 8px', textAlign: 'left', borderRight: '1px solid #ffffff' }}>
                        Cracker Product Description (பட்டாசு பெயர்)
                      </th>
                      <th style={{ width: '8%', padding: '6px 4px', borderRight: '1px solid #ffffff' }}>Cases</th>
                      <th style={{ width: '12%', padding: '6px 4px', borderRight: '1px solid #ffffff' }}>Pack Content</th>
                      <th style={{ width: '8%', padding: '6px 4px', borderRight: '1px solid #ffffff' }}>Qty</th>
                      <th style={{ width: '11%', padding: '6px 4px', borderRight: '1px solid #ffffff' }}>Rate (₹)</th>
                      <th style={{ width: '7%', padding: '6px 4px', borderRight: '1px solid #ffffff' }}>Disc.%</th>
                      <th style={{ width: '14%', padding: '6px 8px', textAlign: 'right' }}>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items && inv.items.map((item, idx) => (
                      <tr key={idx} style={{
                        borderBottom: '1px solid #cbd5e1',
                        background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        height: '27px'
                      }}>
                        <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1' }}>
                          {idx + 1}
                        </td>
                        <td style={{ textAlign: 'left', padding: '4px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 'bold' }}>
                          {item.name}
                        </td>
                        <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1' }}>
                          {item.cases || 1}
                        </td>
                        <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1' }}>
                          {item.packContent || item.packing || '1 BOX'}
                        </td>
                        <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1', fontWeight: 'bold' }}>
                          {item.qty}
                        </td>
                        <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>
                          {Number(item.rate).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1', color: '#047857' }}>
                          {item.discount ? `${Number(item.discount).toFixed(1)}%` : '-'}
                        </td>
                        <td style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 'bold' }}>
                          {Number(item.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {/* Empty placeholder rows for balance */}
                    {emptyRowsA4.map((_, i) => (
                      <tr key={`empty-a4-${i}`} style={{ height: '24px', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ borderRight: '1px solid #e2e8f0' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #e2e8f0' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #e2e8f0' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #e2e8f0' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #e2e8f0' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #e2e8f0' }}>&nbsp;</td>
                        <td style={{ borderRight: '1px solid #e2e8f0' }}>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TABLE SUMMARY BAR */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40% 12% 16% 32%',
                background: '#f1f5f9',
                border: '1.5px solid #000000',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                <div>Total Items Billed: {inv.items ? inv.items.length : 0}</div>
                <div style={{ textAlign: 'center' }}>Cases: {totalCases}</div>
                <div style={{ textAlign: 'center' }}>Total Qty: {totalQty}</div>
                <div style={{ textAlign: 'right' }}>SubTotal: ₹{subtotal.toFixed(2)}</div>
              </div>

              {/* LOWER SPLIT: UPI & Words & Terms on Left / Financials on Right */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 310px',
                gap: '1rem',
                alignItems: 'start'
              }}>
                {/* Left Column: Amount in Words, UPI QR Code, Terms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {/* Amount in Words */}
                  <div style={{
                    background: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontSize: '11.5px'
                  }}>
                    <strong style={{ color: '#92400e' }}>Amount in Words (வார்த்தைகளில்):</strong>
                    <div style={{ fontWeight: 'bold', color: '#1e293b', marginTop: '2px', fontStyle: 'italic' }}>
                      {numberToWordsIndian(netAmount)}
                    </div>
                  </div>

                  {/* UPI QR Code Box & Payment Mode */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '8px 10px',
                    background: '#ffffff',
                    border: '1.5px dashed #059669',
                    borderRadius: '6px'
                  }}>
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      style={{
                        width: '78px',
                        height: '78px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        display: 'block'
                      }}
                    />
                    <div style={{ flex: 1, fontSize: '11px', color: '#1e293b' }}>
                      <div style={{ fontWeight: '900', color: '#059669', fontSize: '11.5px', textTransform: 'uppercase' }}>
                        📲 Instant UPI Scan &amp; Pay
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#475569', marginTop: '1px' }}>
                        GPay • PhonePe • Paytm • BHIM
                      </div>
                      <div style={{ marginTop: '3px', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '11px' }}>
                        UPI ID: {upiId}
                      </div>
                      <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '2px' }}>
                        Amount: <strong>₹{netAmount.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div style={{
                    fontSize: '9.5px',
                    color: '#475569',
                    lineHeight: '1.35',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '4px'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase' }}>
                      Terms &amp; Safety Conditions (விதிமுறைகள்):
                    </div>
                    <div>1. Goods once sold will not be exchanged or refunded.</div>
                    <div>2. Store fireworks in a cool, dry and fireproof location.</div>
                    <div>3. Light crackers strictly under responsible adult supervision.</div>
                    <div>4. Subject to Sivakasi Jurisdiction only.</div>
                  </div>
                </div>

                {/* Right Column: Financial Calculations & Grand Total */}
                <div style={{
                  border: '1.5px solid #000000',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  background: '#ffffff'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '4px 10px', color: '#475569' }}>Gross SubTotal:</td>
                        <td style={{ textAlign: 'right', padding: '4px 10px', fontWeight: '600' }}>
                          ₹{subtotal.toFixed(2)}
                        </td>
                      </tr>

                      {pfAmount > 0 && (
                        <tr>
                          <td style={{ padding: '4px 10px', color: '#475569' }}>P &amp; F Charges ({pfPercent}%):</td>
                          <td style={{ textAlign: 'right', padding: '4px 10px', fontWeight: '600' }}>
                            ₹{pfAmount.toFixed(2)}
                          </td>
                        </tr>
                      )}

                      {taxAmount > 0 && (
                        <tr>
                          <td style={{ padding: '4px 10px', color: '#475569' }}>Tax / GST ({taxPercent}%):</td>
                          <td style={{ textAlign: 'right', padding: '4px 10px', fontWeight: '600' }}>
                            ₹{taxAmount.toFixed(2)}
                          </td>
                        </tr>
                      )}

                      {roundOff !== 0 && (
                        <tr>
                          <td style={{ padding: '4px 10px', color: '#64748b' }}>Round Off:</td>
                          <td style={{ textAlign: 'right', padding: '4px 10px', color: '#64748b' }}>
                            {roundOff > 0 ? `+₹${roundOff.toFixed(2)}` : `₹${roundOff.toFixed(2)}`}
                          </td>
                        </tr>
                      )}

                      {/* NET AMOUNT (GRAND TOTAL) */}
                      <tr style={{ background: '#881337', color: '#ffffff' }}>
                        <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase' }}>
                          NET AMOUNT (மொத்தம்):
                        </td>
                        <td style={{ textAlign: 'right', padding: '8px 10px', fontSize: '16px', fontWeight: '900' }}>
                          ₹{netAmount.toFixed(2)}
                        </td>
                      </tr>

                      {commissionAmount > 0 && (
                        <tr>
                          <td style={{ padding: '4px 10px', color: '#dc2626' }}>Commission @ {commissionPercent}%:</td>
                          <td style={{ textAlign: 'right', padding: '4px 10px', color: '#dc2626', fontWeight: 'bold' }}>
                            -₹{commissionAmount.toFixed(2)}
                          </td>
                        </tr>
                      )}

                      {commissionAmount > 0 && (
                        <tr style={{ borderTop: '1.5px solid #000000', background: '#ecfdf5' }}>
                          <td style={{ padding: '6px 10px', fontWeight: '900', color: '#065f46', fontSize: '12.5px' }}>
                            NET BALANCE PAYABLE:
                          </td>
                          <td style={{ textAlign: 'right', padding: '6px 10px', fontWeight: '900', color: '#065f46', fontSize: '14px' }}>
                            ₹{netBalance.toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FOOTER SIGNATURES & FESTIVE GREETING */}
              <div style={{
                marginTop: '0.4rem',
                borderTop: '1.5px solid #000000',
                paddingTop: '0.65rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                alignItems: 'end',
                fontSize: '11px'
              }}>
                <div>
                  <div style={{ height: '36px' }}></div>
                  <div style={{ borderTop: '1px dashed #64748b', display: 'inline-block', paddingTop: '2px', fontWeight: 'bold' }}>
                    Customer / Receiver's Signature
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#881337' }}>
                    For {shop.name || 'SHRI GUGAN CRACKERS'}
                  </div>
                  <div style={{ height: '36px' }}></div>
                  <div style={{ borderTop: '1px dashed #64748b', display: 'inline-block', paddingTop: '2px', fontWeight: 'bold' }}>
                    Authorized Signatory &amp; Stamp
                  </div>
                </div>
              </div>

              {/* BILINGUAL GREETING */}
              <div style={{
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#881337',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '4px'
              }}>
                🎉 {shop.footerMessage || 'Thank you for choosing Shri Gugan Crackers! Visit Again. / நன்றி! மீண்டும் வருக!'} 🎉
              </div>
            </div>
          ) : printFormat === 'performa' ? (
            /* ==========================================================
               2. PERFORMA / WHOLESALE BILL (WITH COMPLETE SHOP ADDRESS & LOGO)
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
                padding: '8px 16px',
                textAlign: 'center',
                borderBottom: '1.5px solid #000000',
                background: '#f8fafc'
              }}>
                <div style={{
                  fontSize: '17px',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  color: '#000000',
                  textTransform: 'uppercase'
                }}>
                  {(inv.billTitle && inv.billTitle !== 'PERFORMA') ? inv.billTitle : 'INVOICE'}
                </div>
              </div>

              {/* Shop Full Details Banner in Wholesale Performa */}
              <div style={{
                padding: '6px 14px',
                borderBottom: '1.5px solid #000000',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#ffffff'
              }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {shop.name || 'SHRI GUGAN CRACKERS'} • {shop.tamilName || 'ஸ்ரீ குகன் கிராக்கர்ஸ்'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#000000', marginTop: '1px' }}>
                    {shopAddress}, {shopCity} - {shopPincode}, {shopDistrict} Dist, {shopState}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#000000' }}>
                    <strong>Ph:</strong> +91 {shopPhone} {shopAltPhone ? ` / ${shopAltPhone}` : ''} | <strong>Email:</strong> {shopEmail}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', fontWeight: 'bold' }}>
                  <div>GSTIN: <span style={{ fontFamily: 'monospace' }}>{shopGstin}</span></div>
                  <div>State Code: 33 (TN)</div>
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
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>
                      GSTIN / PAN : <span style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.04em' }}>{inv.customerGstin || '29ATGPM1120L2ZN'}</span>
                    </span>
                    {inv.customerMobile && (
                      <span>Ph: +91 {inv.customerMobile}</span>
                    )}
                  </div>
                </div>

                {/* Right Side: Boxed Logo Frame */}
                <div style={{
                  borderLeft: '1.5px solid #000000',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 8px',
                  background: '#ffffff',
                  minHeight: '85px',
                  textAlign: 'center'
                }}>
                  <img
                    src={shop.logo || '/logo.png'}
                    alt="Logo"
                    style={{
                      maxHeight: '74px',
                      maxWidth: '125px',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    fontSize: '9px',
                    fontWeight: 'bold',
                    letterSpacing: '0.04em',
                    marginTop: '2px',
                    color: '#000000',
                    lineHeight: 1.1
                  }}>
                    {shop.name || 'SHRI GUGAN CRACKERS'}
                  </div>
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
                    {emptyRowsPerforma.map((_, i) => (
                      <tr key={`empty-perf-${i}`} style={{ height: '28px' }}>
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
                {/* Left Box: Order No, Despatch date, Transport, Agent, Amount in Words */}
                <div style={{
                  padding: '8px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {inv.orderNo && (
                      <div>
                        <strong>Order No &nbsp; &nbsp; &nbsp; &nbsp;:</strong> {inv.orderNo}
                      </div>
                    )}
                    <div>
                      <strong>Date &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;:</strong> {inv.despatchDate || formatDateTime(inv.date)}
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '11px', color: '#1e293b' }}>
                      <strong>Words:</strong> {numberToWordsIndian(netAmount)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', paddingTop: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#1e293b' }}>Page 1</div>
                    <div style={{ fontSize: '10px', borderTop: '1px dashed #000000', paddingTop: '2px', fontWeight: 'bold' }}>
                      Authorized Signatory
                    </div>
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
                        <td style={{ padding: '2px 0' }}>TAX ({taxPercent}%)</td>
                        <td style={{ textAlign: 'right', padding: '2px 0' }}>{taxAmount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 0' }}>Round off</td>
                        <td style={{ textAlign: 'right', padding: '2px 0' }}>
                          {roundOff > 0 ? `+${roundOff.toFixed(2)}` : `${roundOff.toFixed(2)}`}
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
          ) : (
            /* ==========================================================
               3. THERMAL RECEIPT (3-INCH / 80MM COUNTER SLIP)
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
                <img
                  src={shop.logo || '/logo.png'}
                  alt="Logo"
                  style={{ maxHeight: '54px', maxWidth: '120px', objectFit: 'contain', margin: '0 auto 6px', display: 'block' }}
                />
                <div style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.02em', color: '#000000' }}>
                  {shop.name || 'SHRI GUGAN CRACKERS'}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '1px', color: '#374151' }}>
                  {shop.tamilName || 'ஸ்ரீ குகன் கிராக்கர்ஸ்'}
                </div>
                <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '2px' }}>
                  {shopAddress}, {shopCity} - {shopPincode}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>
                  Ph: {shopPhone}
                </div>
                <div style={{ fontSize: '10px', color: '#4b5563' }}>
                  GSTIN: {shopGstin}
                </div>
              </div>

              <div style={{ borderBottom: '1px dashed #000000', margin: '6px 0' }}></div>

              {/* Invoice Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                <span>Bill: #{inv.invoiceNo}</span>
                <span>Date: {inv.despatchDate || formatDateTime(inv.date)}</span>
              </div>
              <div style={{ fontSize: '11px', marginTop: '3px' }}>
                <div><strong>M/s:</strong> {inv.customerName || 'Cash Customer'}</div>
                {inv.customerAddress && <div><strong>City:</strong> {inv.customerAddress}</div>}
                {inv.customerMobile && <div><strong>Phone:</strong> +91 {inv.customerMobile}</div>}
                {inv.customerGstin && <div><strong>GSTIN:</strong> {inv.customerGstin}</div>}
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
                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
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

              {commissionAmount > 0 && (
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
              )}

              <div style={{ borderBottom: '1px double #000000', margin: '6px 0' }}></div>

              {/* QR Code in Thermal */}
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <img
                  src={qrCodeUrl}
                  alt="UPI QR"
                  style={{ width: '64px', height: '64px', margin: '0 auto', display: 'block' }}
                />
                <div style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '2px' }}>
                  Scan to Pay: {upiId}
                </div>
              </div>

              {/* Footer Note */}
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '10px' }}>
                <div style={{ fontWeight: 700 }}>{shop.footerMessage}</div>
                <div style={{ marginTop: '4px', fontSize: '9px', color: '#6b7280' }}>
                  Software by Shri Gugan Billing
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
