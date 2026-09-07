import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Boxes,
  Gift,
  CheckCircle2,
  XCircle,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const Products = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    currentUser,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, normal

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const initialFormState = {
    name: '',
    tamilName: '',
    code: '',
    category: 'Sound Crackers',
    brand: 'Standard',
    packing: '10 pcs / box',
    unit: 'Box',
    boxPieces: 10,
    purchasePrice: '',
    sellingPrice: '',
    discount: 10,
    taxRate: 12,
    openingStock: 100,
    minimumStock: 15,
    status: 'Active',
    isBundle: false,
    bundleItems: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      ...initialFormState,
      code: `CK-${Math.floor(100 + Math.random() * 900)}`
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (p) => {
    if (currentUser.role !== 'admin') {
      showToast('Cashier role cannot edit products. Switch to Admin.', 'warning');
      return;
    }
    setEditingProduct(p);
    setFormData({ ...p });
    setIsModalOpen(true);
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sellingPrice) {
      showToast('Product Name and Selling Price are required!', 'error');
      return;
    }

    if (editingProduct) {
      updateProduct({
        ...formData,
        id: editingProduct.id,
        sellingPrice: Number(formData.sellingPrice),
        purchasePrice: Number(formData.purchasePrice),
        discount: Number(formData.discount),
        taxRate: Number(formData.taxRate),
        minimumStock: Number(formData.minimumStock)
      });
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
  };

  // Filter products
  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tamilName && p.tamilName.includes(searchQuery)) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = p.currentStock <= p.minimumStock;
    } else if (stockFilter === 'out') {
      matchesStock = p.currentStock <= 0;
    }

    return matchesCat && matchesSearch && matchesStock;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Add Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🧨 Crackers Product Master</span>
            <span className="badge badge-primary">{products.length} Products</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Manage Sivakasi cracker catalog, brands, rates, discounts, bundles &amp; minimum stock.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ gap: '0.5rem', fontWeight: 700 }}
        >
          <Plus size={18} />
          <span>Add New Cracker (புதிய பட்டாசு சேர்க்க)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '2rem' }}
              placeholder="Search by Name, Code (SC001), Brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <select
            className="select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.icon} {c.name} ({products.filter((p) => p.category === c.name).length})
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            className="select"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">All Stock Status</option>
            <option value="low">Low Stock (≤ Min Stock)</option>
            <option value="out">Out of Stock (0 Stock)</option>
          </select>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginTop: '0.75rem', paddingBottom: '2px' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem' }}
          >
            All Items ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`btn btn-sm ${selectedCategory === c.name ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '4%' }}>Code</th>
                <th>Cracker Name</th>
                <th>Category</th>
                <th>Brand / Packing</th>
                {currentUser.role === 'admin' && <th style={{ textAlign: 'right' }}>Pur. Price</th>}
                <th style={{ textAlign: 'right' }}>Sell Price</th>
                <th style={{ textAlign: 'center' }}>Disc %</th>
                <th style={{ textAlign: 'center' }}>Current Stock</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center', width: '10%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isLow = p.currentStock > 0 && p.currentStock <= p.minimumStock;
                  const isOut = p.currentStock <= 0;

                  return (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                        {p.code}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {p.name}
                          {p.isBundle && (
                            <span className="badge badge-purple" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>
                              🎁 Gift Box
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {p.tamilName}
                        </div>
                        {p.bundleItems && (
                          <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontStyle: 'italic' }}>
                            Contains: {p.bundleItems}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-neutral">{p.category}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.brand}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.packing}</div>
                      </td>
                      {currentUser.role === 'admin' && (
                        <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                          {formatCurrency(p.purchasePrice)}
                        </td>
                      )}
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>
                        {formatCurrency(p.sellingPrice)}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 700 }}>
                        {p.discount > 0 ? `${p.discount}%` : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, color: isOut ? 'var(--danger)' : isLow ? 'var(--warning)' : 'var(--success)' }}>
                          {p.currentStock} {p.unit}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Min: {p.minimumStock}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isOut ? (
                          <span className="badge badge-danger">Out 🔴</span>
                        ) : isLow ? (
                          <span className="badge badge-warning">Low ⚠️</span>
                        ) : (
                          <span className="badge badge-success">Active 🟢</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.5rem' }}
                            title="Edit Cracker"
                          >
                            <Edit2 size={13} />
                          </button>
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete cracker "${p.name}"?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                              title="Delete Cracker"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Sparkles size={20} color="var(--primary)" />
                <span>{editingProduct ? 'Edit Cracker Product' : 'Add New Cracker (பட்டாசு சேர்த்தல்)'}</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Product Name */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. Lakshmi Atom Bomb"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Tamil Name */}
                <div>
                  <label className="input-label">Tamil Name (தமிழ் பெயர்)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. லக்ஷ்மி ஆட்டம் பாம்"
                    value={formData.tamilName}
                    onChange={(e) => setFormData({ ...formData, tamilName: e.target.value })}
                  />
                </div>

                {/* Product Code */}
                <div>
                  <label className="input-label">Product Code / SKU *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. SC001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="input-label">Category (பிரிவு)</label>
                  <select
                    className="select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="input-label">Brand (பிராண்ட்)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Standard, Sony, Krishna, Peacock"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>

                {/* Packing */}
                <div>
                  <label className="input-label">Packing Details</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 10 pcs / box, 1 roll"
                    value={formData.packing}
                    onChange={(e) => setFormData({ ...formData, packing: e.target.value })}
                  />
                </div>

                {/* Unit & Unit conversion */}
                <div>
                  <label className="input-label">Unit</label>
                  <select
                    className="select"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="Box">Box</option>
                    <option value="Pkt">Pkt (Packet)</option>
                    <option value="Roll">Roll</option>
                    <option value="Pcs">Pcs (Pieces)</option>
                  </select>
                </div>

                {/* Purchase Price (Admin Only) */}
                <div>
                  <label className="input-label">Purchase Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    className="input"
                    placeholder="80"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="input-label">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="input"
                    placeholder="120"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  />
                </div>

                {/* Discount % */}
                <div>
                  <label className="input-label">Default Discount %</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="10"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  />
                </div>

                {/* Tax Rate % */}
                <div>
                  <label className="input-label">Tax Rate (GST %)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="12"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                  />
                </div>

                {/* Opening Stock */}
                {!editingProduct && (
                  <div>
                    <label className="input-label">Opening Stock</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="100"
                      value={formData.openingStock}
                      onChange={(e) => setFormData({ ...formData, openingStock: e.target.value })}
                    />
                  </div>
                )}

                {/* Minimum Stock Alert Level */}
                <div>
                  <label className="input-label">Minimum Stock Alert Level</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="15"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                  />
                </div>

                {/* Gift Box Bundle Checkbox */}
                <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isBundle}
                      onChange={(e) => setFormData({ ...formData, isBundle: e.target.checked })}
                    />
                    <span>🎁 This is a Gift Box Bundle (கிப்ட் பாக்ஸ் தொகுப்பு)</span>
                  </label>

                  {formData.isBundle && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <label className="input-label">Bundle Contents (பாக்ஸிலுள்ள பொருட்கள்)</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Flower Pot × 2, Rocket × 5, Sparkler × 10, Chakkar × 5"
                        value={formData.bundleItems}
                        onChange={(e) => setFormData({ ...formData, bundleItems: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
