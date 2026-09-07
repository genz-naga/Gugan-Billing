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
  Truck,
  Calendar,
  Hash,
  MapPin
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

export const Billing = () => {
  const {
    shop,
    products,
    customers,
    categories,
    saveBill,
    showToast
  } = useApp();

  const getTodayFormatted = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');

  // Wholesale / Dispatch Details (as in Performa Bill)
  const [billTitle, setBillTitle] = useState('PERFORMA');
  const [copyType, setCopyType] = useState('(EXTRA COPY)');
  const [orderNo, setOrderNo] = useState('');
  const [despatchDate, setDespatchDate] = useState(getTodayFormatted());
  const [transport, setTransport] = useState('ARIYA');
  const [agent, setAgent] = useState('ARUN');

  // Cart Items
  const [items, setItems] = useState([]);

  // Product Add / Entry State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customItemName, setCustomItemName] = useState('');
  const [cases, setCases] = useState(1);
  const [packPieces, setPackPieces] = useState(18);
  const [packContent, setPackContent] = useState('18 BOX');
  const [qty, setQty] = useState(18);
  const [rate, setRate] = useState('');
  const [customDiscount, setCustomDiscount] = useState('0');
  const [per, setPer] = useState('1 BOX');

  // Wholesale Charges & Calculations (Matching Reference Bill)
  const [pfPercent, setPfPercent] = useState(3); // P & F 3%
  const [taxPercent, setTaxPercent] = useState(shop.defaultTaxRate || 6.5); // TAX rate
  const [commissionPercent, setCommissionPercent] = useState(3); // Comission @ 3%

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash, UPI, Card, Credit, Split
  const [splitCash, setSplitCash] = useState('');
  const [splitUpi, setSplitUpi] = useState('');
  const [splitCard, setSplitCard] = useState('');

  // Refs for keyboard shortcuts
  const searchInputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const casesInputRef = useRef(null);
  const rateInputRef = useRef(null);

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
  const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const totalCases = items.reduce((sum, item) => sum + (Number(item.cases) || 0), 0);
  const totalQty = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  // P & F (Packing & Forwarding)
  const pfAmount = Number(((subtotal * (Number(pfPercent) || 0)) / 100).toFixed(2));

  // Taxable base and Tax
  const taxBase = subtotal + pfAmount;
  const taxAmount = Number(((taxBase * (Number(taxPercent) || 0)) / 100).toFixed(2));

  // Round off and Net Amount
  const rawNetAmount = taxBase + taxAmount;
  const roundedNetAmount = Math.round(rawNetAmount);
  const roundOff = Number((roundedNetAmount - rawNetAmount).toFixed(2));
  const netAmount = roundedNetAmount;

  // Commission @ 3%
  const commissionAmount = Math.round((subtotal * (Number(commissionPercent) || 0)) / 100);

  // Net Balance
  const netBalance = netAmount - commissionAmount;

  // Customer selection from dropdown
  const handleSelectCustomer = (custId) => {
    setSelectedCustomerId(custId);
    if (!custId) {
      setCustomerName('');
      setCustomerMobile('');
      setCustomerAddress('');
      setCustomerGstin('');
      return;
    }
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setCustomerName(cust.name || '');
      setCustomerMobile(cust.mobile || '');
      setCustomerAddress(cust.address || '');
      setCustomerGstin(cust.gstin || '');
    }
  };

  // Customer mobile autocomplete
  const handleMobileChange = (e) => {
    const mob = e.target.value;
    setCustomerMobile(mob);
    const existing = customers.find((c) => c.mobile === mob.trim());
    if (existing) {
      setSelectedCustomerId(existing.id);
      setCustomerName(existing.name);
      setCustomerAddress(existing.address || '');
      setCustomerGstin(existing.gstin || '');
    }
  };

  // Handle Cases change - auto update Qty
  const handleCasesChange = (cVal) => {
    const numCases = Math.max(1, Number(cVal) || 1);
    setCases(numCases);
    const pPieces = Number(packPieces) || 1;
    setQty(numCases * pPieces);
  };

  // Handle Pack Pieces change - auto update Qty
  const handlePackPiecesChange = (pVal) => {
    const pPieces = Math.max(1, Number(pVal) || 1);
    setPackPieces(pPieces);
    setPackContent(`${pPieces} BOX`);
    setQty(cases * pPieces);
  };

  // Select a product from suggestions
  const handleSelectProduct = (p) => {
    setSelectedProduct(p);
    setSearchTerm(p.name);
    setCustomItemName(p.name);
    setRate(p.sellingPrice);
    setCustomDiscount(p.discount || 0);

    const pieces = Number(p.boxPieces) || 18;
    setPackPieces(pieces);
    setPackContent(p.packing || `${pieces} BOX`);
    setPer(p.unit || '1 BOX');
    setCases(1);
    setQty(pieces);

    if (casesInputRef.current) casesInputRef.current.focus();
  };

  // Add Item to cart
  const handleAddItem = () => {
    const itemName = selectedProduct ? selectedProduct.name : (searchTerm.trim() || customItemName.trim());
    if (!itemName) {
      showToast('Please enter or select a product name!', 'warning');
      return;
    }

    const itemRate = Number(rate);
    if (!itemRate || itemRate <= 0) {
      showToast('Please enter a valid rate (₹)!', 'warning');
      return;
    }

    const itemCases = Number(cases) || 1;
    const itemQty = Number(qty) || itemCases * (Number(packPieces) || 1);
    const itemDisc = Number(customDiscount) || 0;
    const lineTotal = Number(((itemQty * itemRate) * (1 - itemDisc / 100)).toFixed(2));

    const newItem = {
      id: selectedProduct ? selectedProduct.id : `CUSTOM-${Date.now().toString().slice(-4)}`,
      code: selectedProduct ? selectedProduct.code : '',
      name: itemName,
      cases: itemCases,
      packContent: packContent.trim() || `${packPieces} BOX`,
      qty: itemQty,
      rate: itemRate,
      discount: itemDisc,
      per: per.trim() || '1 BOX',
      total: lineTotal
    };

    setItems((prev) => [...prev, newItem]);

    // Reset input fields
    setSelectedProduct(null);
    setSearchTerm('');
    setCustomItemName('');
    setCases(1);
    setPackPieces(18);
    setPackContent('18 BOX');
    setQty(18);
    setRate('');
    setCustomDiscount('0');
    setPer('1 BOX');

    if (searchInputRef.current) searchInputRef.current.focus();
    showToast(`Added "${itemName}" to bill`, 'success');
  };

  // Update item quantity or cases directly in cart
  const handleUpdateItemCases = (index, delta) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const newCases = Math.max(1, (Number(item.cases) || 1) + delta);
      const ratio = item.cases > 0 ? item.qty / item.cases : 1;
      const newQty = Math.round(newCases * ratio);
      const newTotal = Number(((newQty * item.rate) * (1 - item.discount / 100)).toFixed(2));

      updated[index] = {
        ...item,
        cases: newCases,
        qty: newQty,
        total: newTotal
      };
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
    setSelectedCustomerId('');
    setCustomerName('');
    setCustomerMobile('');
    setCustomerAddress('');
    setCustomerGstin('');
    setSelectedProduct(null);
    setSearchTerm('');
    setCustomItemName('');
    setCases(1);
    setPackPieces(18);
    setPackContent('18 BOX');
    setQty(18);
    setRate('');
    setCustomDiscount('0');
    setPaymentMethod('Cash');
    setSplitCash('');
    setSplitUpi('');
    setSplitCard('');
    setOrderNo('');
    setDespatchDate(getTodayFormatted());
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
      if (c + u + d !== netAmount) {
        showToast(`Split amounts (₹${c + u + d}) must equal Net Amount (₹${netAmount})!`, 'error');
        return;
      }
      splitDetails = { cash: c, upi: u, card: d };
    }

    const billData = {
      billTitle, // 'PERFORMA'
      copyType,  // '(EXTRA COPY)'
      orderNo: orderNo.trim(),
      despatchDate: despatchDate.trim(),
      transport: transport.trim(),
      agent: agent.trim(),
      customerName: customerName.trim() || 'Cash Customer',
      customerMobile: customerMobile.trim(),
      customerAddress: customerAddress.trim(),
      customerGstin: customerGstin.trim().toUpperCase(),
      items,
      totalCases,
      totalQty,
      subtotal,
      pfPercent: Number(pfPercent) || 0,
      pfAmount,
      taxPercent: Number(taxPercent) || 0,
      taxTotal: taxAmount,
      roundOff,
      grandTotal: netAmount,
      netAmount,
      commissionPercent: Number(commissionPercent) || 0,
      commissionAmount,
      netBalance,
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
  }, [items, customerName, customerMobile, customerAddress, customerGstin, netAmount, paymentMethod, splitCash, splitUpi, splitCard, orderNo, despatchDate, transport, agent, pfPercent, taxPercent, commissionPercent]);

  // Current bill number to display
  const currentBillNo = `${shop.invoicePrefix || 'INV-'}${shop.nextInvoiceNum || 1001}`;

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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>INVOICE / BILL NO</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
              {currentBillNo}
            </div>
          </div>
          <div style={{ height: '32px', width: '1px', background: 'var(--border-color)' }}></div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>BILL FORMAT</span>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
              PERFORMA (Wholesale)
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

      {/* Customer Information & Wholesale Dispatch Row */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Customer Details (M/s வாடிக்கையாளர் தேர்வு)
            </span>
          </div>

          {/* Customer Dropdown Quick Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Select Saved Customer:</span>
            <select
              className="select"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', minWidth: '220px' }}
              value={selectedCustomerId}
              onChange={(e) => handleSelectCustomer(e.target.value)}
            >
              <option value="">-- Or Pick from Directory --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.address ? `(${c.address})` : ''} - {c.mobile}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Customer Detail Inputs (M/s, City, Mobile, GSTIN/PAN) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          <div>
            <label className="input-label">M/s Customer / Enterprise Name *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. M/S.K.R.ENTERPRISE"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">
              <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
              City / Station / Address
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. BANGALORE"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
          </div>

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
            <label className="input-label">GSTIN / PAN</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. 29ATGPM1120L2ZN"
              value={customerGstin}
              onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        {/* Dispatch & Transport Row (Order No, Despatch Date, Transport, Agent) */}
        <div style={{
          marginTop: '1rem',
          paddingTop: '0.85rem',
          borderTop: '1px dashed var(--border-color)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          background: '#f8fafc',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)'
        }}>
          <div>
            <label className="input-label" style={{ fontSize: '0.72rem' }}>
              <Hash size={11} style={{ display: 'inline', marginRight: '3px' }} />
              Order No
            </label>
            <input
              type="text"
              className="input"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
              placeholder="e.g. ORD-101 or empty"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.72rem' }}>
              <Calendar size={11} style={{ display: 'inline', marginRight: '3px' }} />
              Despatch Date
            </label>
            <input
              type="text"
              className="input"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
              placeholder="28-08-2026"
              value={despatchDate}
              onChange={(e) => setDespatchDate(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.72rem' }}>
              <Truck size={11} style={{ display: 'inline', marginRight: '3px' }} />
              Transport
            </label>
            <input
              type="text"
              className="input"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
              placeholder="e.g. ARIYA / VRL"
              value={transport}
              onChange={(e) => setTransport(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.72rem' }}>
              <User size={11} style={{ display: 'inline', marginRight: '3px' }} />
              Agent
            </label>
            <input
              type="text"
              className="input"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
              placeholder="e.g. ARUN"
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.72rem' }}>Bill Title</label>
            <select
              className="select"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
              value={billTitle}
              onChange={(e) => setBillTitle(e.target.value)}
            >
              <option value="PERFORMA">PERFORMA</option>
              <option value="TAX INVOICE">TAX INVOICE</option>
              <option value="ESTIMATE">ESTIMATE</option>
            </select>
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.72rem' }}>Copy Note</label>
            <input
              type="text"
              className="input"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
              placeholder="(EXTRA COPY)"
              value={copyType}
              onChange={(e) => setCopyType(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Product Quick-Search & Wholesale Cracker Add Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Add Crackers / பட்டாசு சேர்க்க (Cases, Pack Content &amp; Rate)
            </span>
          </div>

          {/* Category Quick Chips */}
          {categories && categories.length > 0 && (
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px', maxWidth: '700px' }}>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
              >
                All
              </button>
              {categories.slice(0, 5).map((c) => (
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
          )}
        </div>

        {/* Search & Wholesale Input Form */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 2fr) 80px 110px 85px 105px 75px 80px auto', gap: '0.65rem', alignItems: 'flex-end' }}>
          {/* Autocomplete Search or Custom Item */}
          <div style={{ position: 'relative' }}>
            <label className="input-label">Product Name (Press F3)</label>
            <input
              ref={searchInputRef}
              type="text"
              className="input"
              placeholder="e.g. HAI HAI (30 shots)"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCustomItemName(e.target.value);
                if (selectedProduct && selectedProduct.name !== e.target.value) {
                  setSelectedProduct(null);
                }
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
                  <div style={{ padding: '0.75rem', fontSize: '0.8rem' }}>
                    <div style={{ color: 'var(--text-muted)' }}>No existing cracker named "{searchTerm}"</div>
                    <div style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '4px' }}>
                      Tip: Enter Cases, Pack Content and Rate below to add this as a custom item!
                    </div>
                  </div>
                ) : (
                  filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
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
                            ({p.packing || `${p.boxPieces || 10} pcs`})
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {p.brand} • Stock: {p.currentStock}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{p.sellingPrice}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Cases */}
          <div>
            <label className="input-label">Cases</label>
            <input
              ref={casesInputRef}
              type="number"
              min="1"
              className="input"
              value={cases}
              onChange={(e) => handleCasesChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddItem();
              }}
            />
          </div>

          {/* Pack Content */}
          <div>
            <label className="input-label">Pack Content</label>
            <input
              type="text"
              className="input"
              placeholder="18 BOX"
              value={packContent}
              onChange={(e) => {
                const val = e.target.value;
                setPackContent(val);
                // Extract number if starts with digits
                const num = parseInt(val, 10);
                if (!isNaN(num) && num > 0) {
                  setPackPieces(num);
                  setQty(cases * num);
                }
              }}
            />
          </div>

          {/* Total Qty (Cases * Pack) */}
          <div>
            <label className="input-label">Qty</label>
            <input
              type="number"
              min="1"
              className="input"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddItem();
              }}
              title="Cases × Pack Content"
            />
          </div>

          {/* Rate */}
          <div>
            <label className="input-label">Rate (₹)</label>
            <input
              ref={rateInputRef}
              type="number"
              step="0.01"
              className="input"
              placeholder="e.g. 299"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddItem();
              }}
            />
          </div>

          {/* Disc % */}
          <div>
            <label className="input-label">Disc %</label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="0"
              value={customDiscount}
              onChange={(e) => setCustomDiscount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddItem();
              }}
            />
          </div>

          {/* Per */}
          <div>
            <label className="input-label">Per</label>
            <input
              type="text"
              className="input"
              placeholder="1 BOX"
              value={per}
              onChange={(e) => setPer(e.target.value)}
            />
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddItem}
            className="btn btn-primary"
            style={{ height: '38px', gap: '0.4rem', fontWeight: 700, padding: '0 1rem' }}
          >
            <Plus size={16} />
            <span>Add</span>
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
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Product Selected:</span>
              <strong>{selectedProduct.name}</strong>
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
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Bill Items Table & Wholesale Settlement */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(340px, 1fr)', gap: '1.25rem' }}>
        {/* Left: Cart Items List in Wholesale Performa Structure */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Invoice Items ({items.length}) • Total Cases: {totalCases}
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
                padding: '3.5rem 1.5rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Sparkles size={36} color="#cbd5e1" />
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  No Cracker Items Added (பட்டாசுகள் சேர்க்கப்படவில்லை)
                </div>
                <div style={{ fontSize: '0.8rem', maxWidth: '400px' }}>
                  Search cracker above or type Product Name, Cases (13), Pack Content (18 BOX), Rate (299) and click Add!
                </div>
              </div>
            ) : (
              <table className="table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '4%' }}>S.N</th>
                    <th>Product name</th>
                    <th style={{ textAlign: 'center', width: '9%' }}>Cases</th>
                    <th style={{ textAlign: 'center', width: '12%' }}>Pack Content</th>
                    <th style={{ textAlign: 'center', width: '8%' }}>Qty</th>
                    <th style={{ textAlign: 'right', width: '11%' }}>Rate</th>
                    <th style={{ textAlign: 'center', width: '9%' }}>Disc.%</th>
                    <th style={{ textAlign: 'center', width: '9%' }}>Per</th>
                    <th style={{ textAlign: 'right', width: '14%' }}>Amount</th>
                    <th style={{ textAlign: 'center', width: '6%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{index + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.name}</div>
                        {item.code && (
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.code}</div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <button
                            onClick={() => handleUpdateItemCases(index, -1)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.1rem 0.35rem', fontSize: '0.7rem' }}
                          >
                            -
                          </button>
                          <span style={{ fontWeight: 800, minWidth: '22px', textAlign: 'center' }}>{item.cases}</span>
                          <button
                            onClick={() => handleUpdateItemCases(index, 1)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.1rem 0.35rem', fontSize: '0.7rem' }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.packContent}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--primary)' }}>{item.qty}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.rate.toFixed(2)}</td>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {item.discount > 0 ? `${item.discount.toFixed(2)}%` : '0.00'}
                      </td>
                      <td style={{ textAlign: 'center' }}>{item.per || '1 BOX'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                        {item.total.toFixed(2)}
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
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                    <td colSpan="2" style={{ textAlign: 'right' }}>Total Cases:</td>
                    <td style={{ textAlign: 'center', color: 'var(--primary)' }}>{totalCases}</td>
                    <td colSpan="4" style={{ textAlign: 'right' }}>SubTotal:</td>
                    <td colSpan="2" style={{ textAlign: 'right', fontSize: '0.95rem' }}>{subtotal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>

        {/* Right: Payment Method & Totals Breakdown (Matching Reference Image) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Payment Method Selector */}
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Payment Mode (பணம் செலுத்தும் முறை)
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginTop: '0.5rem' }}>
              {['Cash', 'UPI', 'Card', 'Credit', 'Split'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPaymentMethod(mode)}
                  style={{
                    padding: '0.45rem 0.35rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === mode ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: paymentMethod === mode ? 'var(--primary-light)' : '#ffffff',
                    color: paymentMethod === mode ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.15rem'
                  }}
                >
                  {mode === 'Cash' && <Coins size={14} />}
                  {mode === 'UPI' && <Smartphone size={14} />}
                  {mode === 'Card' && <CreditCard size={14} />}
                  {mode === 'Credit' && <Wallet size={14} />}
                  {mode === 'Split' && <Layers size={14} />}
                  <span>{mode}</span>
                </button>
              ))}
            </div>

            {/* Split Payment inputs if selected */}
            {paymentMethod === 'Split' && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.65rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Split Payment Breakdown (Net: ₹{netAmount}):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '45px', fontSize: '0.75rem', fontWeight: 600 }}>Cash:</span>
                    <input
                      type="number"
                      className="input"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
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
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
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
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                      placeholder="₹ Amount"
                      value={splitCard}
                      onChange={(e) => setSplitCard(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wholesale Performa Calculations Card (Exact bill layout values) */}
          <div className="card" style={{ padding: '1.25rem', background: '#ffffff' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Wholesale Bill Breakdown
            </div>

            <table style={{ width: '100%', fontSize: '0.85rem' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>SubTotal:</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700 }}>
                    {subtotal.toFixed(2)}
                  </td>
                </tr>

                {/* P & F Row (Packing & Forwarding) */}
                <tr>
                  <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>P &amp; F:</span>
                      <input
                        type="number"
                        step="0.1"
                        style={{ width: '45px', padding: '1px 4px', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', textAlign: 'center' }}
                        value={pfPercent}
                        onChange={(e) => setPfPercent(e.target.value)}
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>
                    {pfAmount.toFixed(2)}
                  </td>
                </tr>

                {/* TAX Row */}
                <tr>
                  <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>TAX:</span>
                      <input
                        type="number"
                        step="0.1"
                        style={{ width: '45px', padding: '1px 4px', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', textAlign: 'center' }}
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(e.target.value)}
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>
                    {taxAmount.toFixed(2)}
                  </td>
                </tr>

                {/* Round off Row */}
                {roundOff !== 0 && (
                  <tr>
                    <td style={{ padding: '4px 0', color: 'var(--text-muted)' }}>Round off:</td>
                    <td style={{ padding: '4px 0', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {roundOff > 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}
                    </td>
                  </tr>
                )}

                {/* Net amount */}
                <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 0 4px', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Net amount:
                  </td>
                  <td style={{ padding: '8px 0 4px', textAlign: 'right', fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>
                    {netAmount.toFixed(2)}
                  </td>
                </tr>

                {/* Comission @ % */}
                <tr>
                  <td style={{ padding: '4px 0', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Comission @:</span>
                      <input
                        type="number"
                        step="0.1"
                        style={{ width: '45px', padding: '1px 4px', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', textAlign: 'center' }}
                        value={commissionPercent}
                        onChange={(e) => setCommissionPercent(e.target.value)}
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>
                    -{commissionAmount.toFixed(2)}
                  </td>
                </tr>

                {/* Net Balance */}
                <tr style={{ borderTop: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#16a34a' }}>
                    Net Balance:
                  </td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontSize: '1.25rem', fontWeight: 900, color: '#16a34a' }}>
                    {netBalance.toFixed(2)}
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
