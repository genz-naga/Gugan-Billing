import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw, Search, CheckCircle2, AlertCircle, Receipt, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const SalesReturn = () => {
  const { sales, returns, processReturn, showToast } = useApp();

  const [searchBillNo, setSearchBillNo] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [returnItems, setReturnItems] = useState({}); // { [productId]: returnQty }
  const [returnReason, setReturnReason] = useState('Customer exchange / return');

  // Search bill
  const handleLookupBill = (e) => {
    e.preventDefault();
    if (!searchBillNo.trim()) return;

    const found = sales.find(
      (s) => s.invoiceNo.toLowerCase() === searchBillNo.trim().toLowerCase()
    );

    if (found) {
      setSelectedBill(found);
      // Initialize return quantities
      const initialQtys = {};
      found.items.forEach((i) => {
        initialQtys[i.id] = 0;
      });
      setReturnItems(initialQtys);
    } else {
      showToast(`Bill #${searchBillNo} not found in records!`, 'error');
    }
  };

  // Calculate refund amount
  const calculateRefund = () => {
    if (!selectedBill) return 0;
    let total = 0;
    selectedBill.items.forEach((item) => {
      const retQty = Number(returnItems[item.id] || 0);
      if (retQty > 0) {
        const netRate = item.rate * (1 - (item.discount || 0) / 100);
        total += netRate * retQty;
      }
    });
    return Math.round(total);
  };

  const refundTotal = calculateRefund();

  // Submit return
  const handleSubmitReturn = (e) => {
    e.preventDefault();
    if (!selectedBill) return;

    const returnedList = [];
    selectedBill.items.forEach((item) => {
      const q = Number(returnItems[item.id] || 0);
      if (q > 0) {
        const netRate = item.rate * (1 - (item.discount || 0) / 100);
        returnedList.push({
          id: item.id,
          name: item.name,
          qty: q,
          rate: item.rate,
          refundAmount: netRate * q
        });
      }
    });

    if (returnedList.length === 0) {
      showToast('Select at least 1 item quantity to return!', 'warning');
      return;
    }

    const returnData = {
      invoiceNo: selectedBill.invoiceNo,
      customerName: selectedBill.customerName,
      customerMobile: selectedBill.customerMobile,
      returnedItems: returnedList,
      totalRefund: refundTotal,
      reason: returnReason
    };

    processReturn(returnData);
    setSelectedBill(null);
    setSearchBillNo('');
    setReturnItems({});
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>↩️ Sales Return &amp; Stock Restock (விற்பனை திரும்பப்பெறுதல்)</span>
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
          Search original bill, select returned crackers, calculate refund, and restock inventory automatically.
        </p>
      </div>

      {/* Bill Lookup Card */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form onSubmit={handleLookupBill} style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <label className="input-label">Enter Original Invoice Number (பில் எண்)</label>
            <div style={{ position: 'relative' }}>
              <Receipt size={16} color="var(--primary)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '2.2rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                placeholder="e.g. INV-1001"
                value={searchBillNo}
                onChange={(e) => setSearchBillNo(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem', height: '38px', fontWeight: 700 }}>
            <Search size={16} />
            <span>Search Bill</span>
          </button>
        </form>
      </div>

      {/* Bill Details & Return Form if found */}
      {selectedBill && (
        <div className="card" style={{ padding: '1.5rem', border: '2px solid var(--primary)', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>Found Bill #{selectedBill.invoiceNo}</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px' }}>
                Customer: {selectedBill.customerName} ({selectedBill.customerMobile || 'No Phone'})
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Billed on: {formatDateTime(selectedBill.date)} • Bill Total: {formatCurrency(selectedBill.grandTotal)}
              </div>
            </div>

            <button onClick={() => setSelectedBill(null)} className="btn btn-secondary btn-sm">
              Cancel Lookup
            </button>
          </div>

          {/* Items return selector */}
          <form onSubmit={handleSubmitReturn}>
            <div className="table-container" style={{ marginBottom: '1rem' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Cracker Product</th>
                    <th style={{ textAlign: 'right' }}>Original Rate</th>
                    <th style={{ textAlign: 'center' }}>Purchased Qty</th>
                    <th style={{ textAlign: 'center' }}>Discount</th>
                    <th style={{ textAlign: 'center', width: '20%' }}>Return Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 700 }}>
                        {item.name}
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.code}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>₹{item.rate}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>{item.qty}</td>
                      <td style={{ textAlign: 'center', color: 'var(--success)' }}>
                        {item.discount > 0 ? `${item.discount}%` : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          max={item.qty}
                          className="input"
                          style={{ width: '80px', textAlign: 'center', fontWeight: 800 }}
                          value={returnItems[item.id] || 0}
                          onChange={(e) => {
                            const val = Math.min(item.qty, Math.max(0, Number(e.target.value)));
                            setReturnItems({ ...returnItems, [item.id]: val });
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', alignItems: 'flex-start' }}>
              <div>
                <label className="input-label">Reason for Return (காரணம்)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Defective fuse, Customer exchange"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                />
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Calculated Refund Amount:
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--danger)', margin: '4px 0' }}>
                  {formatCurrency(refundTotal)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                  Stock will be replenished (+qty) immediately upon confirmation.
                </div>

                <button
                  type="submit"
                  className="btn btn-danger"
                  style={{ width: '100%', marginTop: '0.85rem', fontWeight: 700 }}
                  disabled={refundTotal <= 0}
                >
                  <RotateCcw size={16} />
                  <span>Confirm Return &amp; Restock</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Past Returns Records Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
            Past Sales Return Transactions ({returns.length})
          </h3>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Return #</th>
                <th>Original Bill #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Returned Items</th>
                <th>Reason</th>
                <th style={{ textAlign: 'right' }}>Refund Amount</th>
              </tr>
            </thead>
            <tbody>
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No return transactions recorded yet.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                      {ret.id}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {ret.invoiceNo}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{formatDateTime(ret.date)}</td>
                    <td>
                      <div>{ret.customerName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ret.customerMobile}</div>
                    </td>
                    <td>
                      {ret.returnedItems.map((item, idx) => (
                        <div key={idx} style={{ fontSize: '0.8rem' }}>
                          {item.name} × <strong>{item.qty} pcs</strong> (₹{item.refundAmount})
                        </div>
                      ))}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {ret.reason}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--danger)', fontSize: '0.95rem' }}>
                      -{formatCurrency(ret.totalRefund)}
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
