import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Trash2,
  Printer,
  Save,
  RotateCcw,
  Sparkles,
  User,
  Phone,
  Layers,
  CreditCard,
  Wallet,
  Smartphone,
  Coins,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const Billing = () => {
  const {
    shop,
    products,
    customers,
    categories,
    saveBill,
    triggerPrintBill,
    showToast,
    setActiveTab
  } = useApp();

  // Customer state
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Cart Items
  const [items, setItems] = useState([]);

  // Product Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [customDiscount, setCustomDiscount] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash, UPI, Card, Credit, Split
  const [splitCash, setSplitCash] = useState('');
  const [splitUpi, setSplitUpi] = useState('');
  const [splitCard, setSplitCard] = useState('');

  // Overall bill discount (flat amount)
  const [billExtraDiscount, setBillExtraDiscount] = useState(0);

  // Refs for keyboard shortcuts
  const searchInputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const qtyInputRef = useRef(null);

  // Filter products for search
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      searchTerm.trim() === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.tamilName && p.tamilName.includes(searchTerm));
    return matchesCategory && matchesSearch;
  });

  // Calculate live totals
  const subtotal = items.reduce((sum, item) => sum + item.rate * item.qty, 0);
  const itemDiscounts = items.reduce(
    (sum, item) => sum + (item.rate * item.qty * (item.discount / 100)),
    0
  );
  const totalDiscount = itemDiscounts + Number(billExtraDiscount || 0);

  // Tax calculation
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const taxRate = shop.defaultTaxRate || 12;
  const taxAmount = (taxableAmount * taxRate) / 100;

  // Grand total calculation
  const rawGrandTotal = taxableAmount + taxAmount;
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOff = Number((roundedGrandTotal - rawGrandTotal).toFixed(2));

  // Customer mobile autocomplete
  const handleMobileChange = (e) => {
    const mob = e.target.value;
    setCustomerMobile(mob);
    const existing = customers.find((c) => c.mobile === mob.trim());
    if (existing) {
      setCustomerName(existing.name);
      setCustomerAddress(existing.address || '');
    }
  };

  // Add Item to cart
  const handleAddItem = () => {
    if (!selectedProduct) {
      showToast('Please select a product first!', 'warning');
      return;
    }
    if (qty <= 0) {
      showToast('Quantity must be at least 1', 'warning');
      return;
    }

    if (selectedProduct.currentStock < qty) {
      showToast(`Warning: Only ${selectedProduct.currentStock} in stock for ${selectedProduct.name}`, 'warning');
    }

    const itemDisc = customDiscount !== '' ? Number(customDiscount) : selectedProduct.discount || 0;
    const rate = selectedProduct.sellingPrice;
    const lineTotal = (rate * qty) * (1 - itemDisc / 100);

    const existingIdx = items.findIndex((i) => i.id === selectedProduct.id);
    if (existingIdx >= 0) {
      const updated = [...items];
      const newQty = updated[existingIdx].qty + Number(qty);
      updated[existingIdx].qty = newQty;
      updated[existingIdx].total = (rate * newQty) * (1 - itemDisc / 100);
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          id: selectedProduct.id,
          code: selectedProduct.code,
          name: selectedProduct.name,
          packing: selectedProduct.packing,
          rate: rate,
          qty: Number(qty),
          discount: itemDisc,
          taxRate: selectedProduct.taxRate || 12,
          total: lineTotal
        }
      ]);
    }

    // Reset search selection
    setSelectedProduct(null);
    setSearchTerm('');
    setQty(1);
    setCustomDiscount('');
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  // Update item quantity directly in cart
  const handleUpdateItemQty = (index, delta) => {
    setItems((prev) => {
      const updated = [...prev];
      const newQty = Math.max(1, updated[index].qty + delta);
      updated[index].qty = newQty;
      updated[index].total = (updated[index].rate * newQty) * (1 - updated[index].discount / 100);
      return updated;
    });
  };

  // Remove item from cart
  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset / Clear Bill
  const handleResetBill = () => {
    setItems([]);
    setCustomerName('');
    setCustomerMobile('');
    setCustomerAddress('');
    setSelectedProduct(null);
    setSearchTerm('');
    setPaymentMethod('Cash');
    setSplitCash('');
    setSplitUpi('');
    setSplitCard('');
    setBillExtraDiscount(0);
    showToast('Billing screen cleared', 'info');
  };

  // Save bill action
  const handleSaveBill = (print = false) => {
    if (items.length === 0) {
      showToast('Add at least one cracker item to save bill!', 'warning');
      return;
    }

    let splitDetails = null;
    if (paymentMethod === 'Split') {
      const c = Number(splitCash) || 0;
      const u = Number(splitUpi) || 0;
      const d = Number(splitCard) || 0;
      if (c + u + d !== roundedGrandTotal) {
        showToast(`Split amounts (₹${c + u + d}) must equal Grand Total (₹${roundedGrandTotal})!`, 'error');
        return;
      }
      splitDetails = { cash: c, upi: u, card: d };
    }

    const billData = {
      customerName: customerName.trim() || 'Cash Customer',
      customerMobile: customerMobile.trim(),
      customerAddress: customerAddress.trim(),
      items,
      subtotal,
      discountTotal,
      taxTotal: taxAmount,
      roundOff,
      grandTotal: roundedGrandTotal,
      paymentMethod,
      splitDetails
    };

    saveBill(billData, print);
    handleResetBill();
  };

  // Keyboard Shortcuts (F2, F3, F4, F5, F6, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleResetBill();
        if (searchInputRef.current) searchInputRef.current.focus();
      } else if (e.key === 'F3') {
        e.preventDefault();
        if (searchInputRef.current) searchInputRef.current.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (mobileInputRef.current) mobileInputRef.current.focus();
      } else if (e.key === 'F5') {
        e.preventDefault();
        handleSaveBill(false);
      } else if (e.key === 'F6') {
        e.preventDefault();
        handleSaveBill(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedProduct(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, customerName, customerMobile, roundedGrandTotal, paymentMethod, splitCash, splitUpi, splitCard]);

  // Current bill number to display
  const currentBillNo = `${shop.invoicePrefix || 'INV-'}${shop.nextInvoiceNum || 1005}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top POS Toolbar with Bill Info & Shortcuts */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>NEXT INVOICE NO</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
              {currentBillNo}
            </div>
          </div>
          <div style={{ height: '32px', width: '1px', background: 'var(--border-color)' }}></div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>BILL DATE</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {formatDateTime(new Date().toISOString())}
            </div>
          </div>
        </div>

        {/* Keyboard Shortcut Cheatsheet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SHORTCUTS:</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <span className="kbd">F2</span> New
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <span className="kbd">F3</span> Search
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <span className="kbd">F4</span> Customer
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <span className="kbd">F5</span> Save
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <span className="kbd">F6</span> Save &amp; Print
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
            <span className="kbd">ESC</span> Clear
          </span>
        </div>
      </div>

      {/* Customer Information Row (Quick & Simple - No GSTIN required) */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
          <User size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Customer Information (வாடிக்கையாளர் விவரம்)
          </span>
          <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>No GSTIN Needed</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          <div>
            <label className="input-label">
              <Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Mobile Number (Press F4)
            </label>
            <input
              ref={mobileInputRef}
              type="tel"
              className="input"
              placeholder="e.g. 9876543210"
              value={customerMobile}
              onChange={handleMobileChange}
              maxLength={10}
            />
          </div>

          <div>
            <label className="input-label">Customer Name</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Kumar / Walk-in Customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">Address / Town (Optional)</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Rajapalayam / Sivakasi"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Product Quick-Search & Add Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Add Crackers to Bill (பட்டாசு தேர்வு செய்க)
            </span>
          </div>

          {/* Category Quick Chips */}
          <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px', maxWidth: '750px' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
            >
              All Items
            </button>
            {categories.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`btn btn-sm ${selectedCategory === c.name ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', whiteSpace: 'nowrap' }}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input and Add Form */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 2fr) 100px 110px 100px auto', gap: '0.75rem', alignItems: 'flex-end' }}>
          {/* Autocomplete Search */}
          <div style={{ position: 'relative' }}>
            <label className="input-label">Product Name / Code (Press F3)</label>
            <input
              ref={searchInputRef}
              type="text"
              className="input"
              placeholder="Search 'atom', 'chakkar', 'rocket', 'box'..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (!searchTerm) setSearchTerm('');
              }}
            />

            {/* Dropdown Suggestions */}
            {searchTerm.trim() !== '' && !selectedProduct && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#ffffff',
                border: '1px solid var(--border-dark)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 50,
                maxHeight: '260px',
                overflowY: 'auto',
                marginTop: '4px'
              }}>
                {filteredProducts.length === 0 ? (
                  <div style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No crackers found matching "{searchTerm}"
                  </div>
                ) : (
                  filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProduct(p);
                        setSearchTerm(p.name);
                        setCustomDiscount(p.discount || '');
                        if (qtyInputRef.current) qtyInputRef.current.focus();
                      }}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderBottom: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.825rem'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-light)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {p.name}
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                            ({p.packing})
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {p.tamilName} • {p.brand} • <span style={{ color: p.currentStock <= p.minimumStock ? 'var(--danger)' : 'var(--success)' }}>Stock: {p.currentStock}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{p.sellingPrice}</div>
                        {p.discount > 0 && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>
                            {p.discount}% Off
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="input-label">Quantity</label>
            <input
              ref={qtyInputRef}
              type="number"
              min="1"
              className="input"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddItem();
              }}
            />
          </div>

          {/* Rate */}
          <div>
            <label className="input-label">Rate (₹)</label>
            <input
              type="text"
              className="input"
              readOnly
              value={selectedProduct ? selectedProduct.sellingPrice : '-'}
              style={{ background: '#f8fafc', fontWeight: 700 }}
            />
          </div>

          {/* Disc % */}
          <div>
            <label className="input-label">Disc %</label>
            <input
              type="number"
              className="input"
              placeholder="%"
              value={customDiscount}
              onChange={(e) => setCustomDiscount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddItem();
              }}
            />
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddItem}
            className="btn btn-primary"
            style={{ height: '38px', gap: '0.4rem', fontWeight: 700 }}
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>

        {/* Selected item preview pill */}
        {selectedProduct && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.5rem 0.75rem',
            background: 'var(--primary-light)',
            border: '1px solid #fed7aa',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Selected:</span>
              <span>{selectedProduct.name} [{selectedProduct.code}]</span>
              <span className="badge badge-neutral">{selectedProduct.packing}</span>
              <span>Available Stock: <strong>{selectedProduct.currentStock}</strong></span>
            </div>
            <button
              onClick={() => {
                setSelectedProduct(null);
                setSearchTerm('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 700 }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Zero products clean slate banner */}
        {products.length === 0 && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem 1.25rem',
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ fontWeight: 800, color: '#9a3412', fontSize: '0.9rem' }}>
                🧨 எந்த dummy தரவும் இல்லை — உங்கள் நிஜ பட்டாசுகளை சேர்க்கவும் (100% Real Data Mode)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#c2410c', marginTop: '2px' }}>
                All dummy items removed. Click to add your shop's actual cracker items and rates.
              </div>
            </div>
            <button
              onClick={() => setActiveTab('products')}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700, gap: '0.35rem' }}
            >
              <Plus size={15} />
              <span>Add Cracker (+ புதிய பட்டாசு சேர்க்க)</span>
            </button>
          </div>
        )}
      </div>

      {/* Bill Items Table & Settlement Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)', gap: '1.25rem' }}>
        {/* Left: Cart Items List */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Billed Items ({items.length})
              </h3>
            </div>
            {items.length > 0 && (
              <button
                onClick={() => setItems([])}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', color: 'var(--danger)' }}
              >
                Clear Items
              </button>
            )}
          </div>

          <div className="table-container" style={{ flex: 1, minHeight: '280px' }}>
            {items.length === 0 ? (
              <div style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Sparkles size={32} color="#cbd5e1" />
                <div style={{ fontWeight: 600 }}>No cracker items added yet</div>
                <div style={{ fontSize: '0.8rem' }}>
                  Search product above (or press <strong>F3</strong>) to add items.
                </div>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>#</th>
                    <th>Product</th>
                    <th style={{ textAlign: 'right' }}>Rate</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'center' }}>Disc</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'center', width: '8%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{item.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {item.packing} • {item.code}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{item.rate}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleUpdateItemQty(index, -1)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem' }}
                          >
                            -
                          </button>
                          <span style={{ fontWeight: 800, minWidth: '24px', textAlign: 'center' }}>{item.qty}</span>
                          <button
                            onClick={() => handleUpdateItemQty(index, 1)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem' }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>
                        {item.discount > 0 ? `${item.discount}%` : '-'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>
                        {formatCurrency(item.total)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Payment Method & Totals Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Payment Method Selector */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Payment Mode (பணம் செலுத்தும் முறை)
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.6rem' }}>
              {['Cash', 'UPI', 'Card', 'Credit', 'Split'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPaymentMethod(mode)}
                  style={{
                    padding: '0.55rem 0.4rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === mode ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: paymentMethod === mode ? 'var(--primary-light)' : '#ffffff',
                    color: paymentMethod === mode ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  {mode === 'Cash' && <Coins size={16} />}
                  {mode === 'UPI' && <Smartphone size={16} />}
                  {mode === 'Card' && <CreditCard size={16} />}
                  {mode === 'Credit' && <Wallet size={16} />}
                  {mode === 'Split' && <Layers size={16} />}
                  <span>{mode}</span>
                </button>
              ))}
            </div>

            {/* Split Payment inputs if selected */}
            {paymentMethod === 'Split' && (
              <div style={{
                marginTop: '0.85rem',
                padding: '0.75rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Split Payment Breakdown (Total: ₹{roundedGrandTotal}):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '45px', fontSize: '0.75rem', fontWeight: 600 }}>Cash:</span>
                    <input
                      type="number"
                      className="input"
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                      placeholder="₹ Amount"
                      value={splitCash}
                      onChange={(e) => setSplitCash(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '45px', fontSize: '0.75rem', fontWeight: 600 }}>UPI:</span>
                    <input
                      type="number"
                      className="input"
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                      placeholder="₹ Amount"
                      value={splitUpi}
                      onChange={(e) => setSplitUpi(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '45px', fontSize: '0.75rem', fontWeight: 600 }}>Card:</span>
                    <input
                      type="number"
                      className="input"
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                      placeholder="₹ Amount"
                      value={splitCard}
                      onChange={(e) => setSplitCard(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Calculation Card */}
          <div className="card" style={{ padding: '1.25rem', background: '#ffffff' }}>
            <table style={{ width: '100%', fontSize: '0.85rem' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>Items Subtotal:</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', color: 'var(--success)' }}>Discount Total:</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>
                    -{formatCurrency(totalDiscount)}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>Tax ({taxRate}%):</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(taxAmount)}</td>
                </tr>
                {roundOff !== 0 && (
                  <tr>
                    <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>Round Off:</td>
                    <td style={{ padding: '4px 0', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {roundOff > 0 ? `+${formatCurrency(roundOff)}` : `-${formatCurrency(Math.abs(roundOff))}`}
                    </td>
                  </tr>
                )}
                <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 0 4px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    GRAND TOTAL:
                  </td>
                  <td style={{ padding: '10px 0 4px', textAlign: 'right', fontSize: '1.45rem', fontWeight: 900, color: 'var(--primary)' }}>
                    {formatCurrency(roundedGrandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bill Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => handleSaveBill(true)}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', gap: '0.5rem', fontWeight: 800, fontSize: '1.05rem' }}
                disabled={items.length === 0}
              >
                <Printer size={18} />
                <span>SAVE &amp; PRINT BILL (F6)</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  onClick={() => handleSaveBill(false)}
                  className="btn btn-success"
                  style={{ fontWeight: 700 }}
                  disabled={items.length === 0}
                >
                  <Save size={16} />
                  <span>Save Only (F5)</span>
                </button>

                <button
                  onClick={handleResetBill}
                  className="btn btn-secondary"
                  style={{ fontWeight: 600 }}
                >
                  <RotateCcw size={16} />
                  <span>Clear (ESC)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
