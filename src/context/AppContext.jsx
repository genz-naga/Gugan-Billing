import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CATEGORIES,
  INITIAL_SHOP,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_SALES,
  INITIAL_PURCHASES,
  INITIAL_RETURNS
} from '../data/initialData';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// Wipe any previous dummy records from localStorage to ensure 100% real data only
const DATA_VERSION = 'v3_zero_dummy_real_data';
if (typeof window !== 'undefined' && localStorage.getItem('svc_data_version') !== DATA_VERSION) {
  localStorage.removeItem('svc_products');
  localStorage.removeItem('svc_customers');
  localStorage.removeItem('svc_suppliers');
  localStorage.removeItem('svc_sales');
  localStorage.removeItem('svc_purchases');
  localStorage.removeItem('svc_returns');
  localStorage.setItem('svc_data_version', DATA_VERSION);
}

export const AppProvider = ({ children }) => {
  // Current user / role: 'admin' or 'cashier'
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('svc_user');
    return saved ? JSON.parse(saved) : { role: 'admin', name: 'Shop Owner (Admin)' };
  });

  // Shop details
  const [shop, setShop] = useState(() => {
    const saved = localStorage.getItem('svc_shop');
    if (saved) {
      const parsed = JSON.parse(saved);
      const name = (!parsed.name || parsed.name === 'Sri Vinayaga Crackers') ? 'Shri Gugan Crackers' : parsed.name;
      const tamilName = (!parsed.tamilName || parsed.tamilName === 'ஸ்ரீ விநாயகர் கிராக்கர்ஸ்') ? 'ஸ்ரீ குகன் கிராக்கர்ஸ்' : parsed.tamilName;
      const city = (!parsed.city || parsed.city === 'Rajapalayam') ? 'Sivakasi' : parsed.city;
      return { ...INITIAL_SHOP, ...parsed, name, tamilName, city, logo: parsed.logo || '/logo.png' };
    }
    return INITIAL_SHOP;
  });

  // Products (Zero dummy data)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('svc_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Customers (Zero dummy data)
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('svc_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  // Suppliers
  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('svc_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  // Sales
  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('svc_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  // Purchases
  const [purchases, setPurchases] = useState(() => {
    const saved = localStorage.getItem('svc_purchases');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  // Returns
  const [returns, setReturns] = useState(() => {
    const saved = localStorage.getItem('svc_returns');
    return saved ? JSON.parse(saved) : INITIAL_RETURNS;
  });

  // Print modal state
  const [activeInvoiceForPrint, setActiveInvoiceForPrint] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState('billing'); // 'dashboard', 'billing', 'products', 'pricelist', 'customers', 'stock', 'purchases', 'suppliers', 'sales', 'returns', 'reports', 'settings'

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Synchronize state with localStorage
  useEffect(() => {
    localStorage.setItem('svc_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('svc_shop', JSON.stringify(shop));
  }, [shop]);

  useEffect(() => {
    localStorage.setItem('svc_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('svc_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('svc_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('svc_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('svc_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('svc_returns', JSON.stringify(returns));
  }, [returns]);

  // Actions
  const switchRole = (role) => {
    if (role === 'admin') {
      setCurrentUser({ role: 'admin', name: 'Shop Owner (Admin)' });
      showToast('Switched to Admin (Owner) Mode - All features unlocked', 'success');
    } else {
      setCurrentUser({ role: 'cashier', name: 'Cashier Staff' });
      showToast('Switched to Cashier Staff Mode (Restricted view)', 'info');
      // If currently on admin-only tabs, redirect to billing
      if (['reports', 'settings'].includes(activeTab)) {
        setActiveTab('billing');
      }
    }
  };

  // Save new bill
  const saveBill = (billData, printAfterSave = false) => {
    const invoiceNo = `${shop.invoicePrefix || 'INV-'}${shop.nextInvoiceNum || 1001}`;
    
    const newSale = {
      ...billData,
      id: invoiceNo,
      invoiceNo,
      date: new Date().toISOString(),
      createdBy: currentUser.role === 'admin' ? 'Admin' : 'Cashier'
    };

    // 1. Deduct Stock automatically
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const lineItem = newSale.items.find((item) => item.id === p.id);
        if (lineItem) {
          const newStock = Math.max(0, p.currentStock - lineItem.qty);
          return { ...p, currentStock: newStock };
        }
        return p;
      })
    );

    // 2. Add or update customer
    if (newSale.customerMobile) {
      setCustomers((prevCustomers) => {
        const existingIdx = prevCustomers.findIndex((c) => c.mobile === newSale.customerMobile);
        if (existingIdx >= 0) {
          const updated = [...prevCustomers];
          updated[existingIdx] = {
            ...updated[existingIdx],
            name: newSale.customerName || updated[existingIdx].name,
            address: newSale.customerAddress || updated[existingIdx].address,
            gstin: newSale.customerGstin || updated[existingIdx].gstin || '',
            totalBilled: (updated[existingIdx].totalBilled || 0) + newSale.grandTotal,
            totalBills: (updated[existingIdx].totalBills || 0) + 1
          };
          return updated;
        } else {
          return [
            ...prevCustomers,
            {
              id: `CUST-${Date.now().toString().slice(-4)}`,
              name: newSale.customerName || 'Walk-in Customer',
              mobile: newSale.customerMobile,
              address: newSale.customerAddress || '',
              gstin: newSale.customerGstin || '',
              totalBilled: newSale.grandTotal,
              totalBills: 1,
              creditBalance: 0
            }
          ];
        }
      });
    }

    // 3. Save sale
    setSales((prev) => [newSale, ...prev]);

    // 4. Increment invoice number in shop
    setShop((prev) => ({
      ...prev,
      nextInvoiceNum: (prev.nextInvoiceNum || 1001) + 1
    }));

    showToast(`Bill #${invoiceNo} saved successfully! 🎉`, 'success');

    if (printAfterSave) {
      setActiveInvoiceForPrint(newSale);
      setIsPrintModalOpen(true);
    }

    return newSale;
  };

  // Process Sales Return
  const processReturn = (returnData) => {
    const returnId = `RET-${Date.now().toString().slice(-4)}`;
    const newReturn = {
      ...returnData,
      id: returnId,
      date: new Date().toISOString(),
      createdBy: currentUser.role === 'admin' ? 'Admin' : 'Cashier'
    };

    // Increase stock for returned items
    setProducts((prev) =>
      prev.map((prod) => {
        const ret = newReturn.returnedItems.find((r) => r.id === prod.id);
        if (ret) {
          return {
            ...prod,
            currentStock: prod.currentStock + Number(ret.qty)
          };
        }
        return prod;
      })
    );

    setReturns((prev) => [newReturn, ...prev]);
    showToast(`Sales return #${returnId} processed. Stock replenished! ↩️`, 'success');
    return newReturn;
  };

  // Add Product
  const addProduct = (productData) => {
    const newProd = {
      ...productData,
      id: productData.code || `PRD-${Date.now().toString().slice(-4)}`,
      currentStock: Number(productData.openingStock) || 0,
      purchasePrice: Number(productData.purchasePrice) || 0,
      sellingPrice: Number(productData.sellingPrice) || 0,
      discount: Number(productData.discount) || 0,
      taxRate: Number(productData.taxRate) || 12,
      minimumStock: Number(productData.minimumStock) || 10,
      status: productData.status || 'Active'
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Product "${newProd.name}" added successfully! 🧨`, 'success');
  };

  // Update Product
  const updateProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    showToast(`Product "${updatedProduct.name}" updated!`, 'success');
  };

  // Delete Product
  const deleteProduct = (id) => {
    if (currentUser.role !== 'admin') {
      showToast('Only Admin can delete products!', 'error');
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product deleted from inventory', 'info');
  };

  // Quick adjust stock
  const quickAdjustStock = (productId, newStock) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, currentStock: Math.max(0, Number(newStock)) } : p))
    );
    showToast('Stock count adjusted', 'success');
  };

  // Add Purchase Entry (Inward stock)
  const addPurchase = (purchaseData) => {
    const purchaseId = `PUR-${Date.now().toString().slice(-4)}`;
    const newPur = {
      ...purchaseData,
      id: purchaseId,
      date: new Date().toISOString()
    };

    // Increment stock for each purchased item
    setProducts((prev) =>
      prev.map((prod) => {
        const inward = newPur.items.find((item) => item.productId === prod.id);
        if (inward) {
          return {
            ...prod,
            currentStock: prod.currentStock + Number(inward.qty),
            purchasePrice: inward.rate ? Number(inward.rate) : prod.purchasePrice
          };
        }
        return prod;
      })
    );

    setPurchases((prev) => [newPur, ...prev]);
    showToast(`Purchase inward saved & stock added! 📦`, 'success');
  };

  // Add / Update Supplier
  const addSupplier = (suppData) => {
    if (suppData.id) {
      setSuppliers((prev) => prev.map((s) => (s.id === suppData.id ? suppData : s)));
      showToast('Supplier updated', 'success');
    } else {
      const newSup = {
        ...suppData,
        id: `SUP-${Date.now().toString().slice(-4)}`,
        balance: Number(suppData.balance) || 0,
        totalPurchases: 0
      };
      setSuppliers((prev) => [...prev, newSup]);
      showToast('New supplier registered', 'success');
    }
  };

  // Add / Update Customer
  const addCustomer = (custData) => {
    if (custData.id) {
      setCustomers((prev) => prev.map((c) => (c.id === custData.id ? custData : c)));
      showToast('Customer details updated', 'success');
    } else {
      const newCust = {
        ...custData,
        id: `CUST-${Date.now().toString().slice(-4)}`,
        totalBilled: 0,
        totalBills: 0,
        creditBalance: Number(custData.creditBalance) || 0
      };
      setCustomers((prev) => [...prev, newCust]);
      showToast('Customer created', 'success');
    }
  };

  // Update Shop Profile
  const updateShop = (newDetails) => {
    setShop(newDetails);
    showToast('Shop and Invoice settings saved! 🏪', 'success');
  };

  // Backup data export
  const exportData = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      shop,
      products,
      customers,
      suppliers,
      sales,
      purchases,
      returns
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Sri_Vinayaga_Crackers_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Complete shop backup downloaded! 💾', 'success');
  };

  // Restore data import
  const importData = (importedJson) => {
    try {
      if (importedJson.shop) setShop(importedJson.shop);
      if (importedJson.products) setProducts(importedJson.products);
      if (importedJson.customers) setCustomers(importedJson.customers);
      if (importedJson.suppliers) setSuppliers(importedJson.suppliers);
      if (importedJson.sales) setSales(importedJson.sales);
      if (importedJson.purchases) setPurchases(importedJson.purchases);
      if (importedJson.returns) setReturns(importedJson.returns);
      showToast('Data restored successfully! 🔄', 'success');
    } catch (e) {
      showToast('Invalid backup JSON file!', 'error');
    }
  };

  // Wipe all data - 100% Clean Slate
  const wipeAllData = () => {
    if (window.confirm('Delete all data completely? This will clear all products, customers, suppliers, and bills so you can enter your real data.')) {
      setProducts([]);
      setCustomers([]);
      setSuppliers([]);
      setSales([]);
      setPurchases([]);
      setReturns([]);
      setShop(INITIAL_SHOP);
      localStorage.removeItem('svc_products');
      localStorage.removeItem('svc_customers');
      localStorage.removeItem('svc_suppliers');
      localStorage.removeItem('svc_sales');
      localStorage.removeItem('svc_purchases');
      localStorage.removeItem('svc_returns');
      localStorage.setItem('svc_data_version', DATA_VERSION);
      showToast('All records cleared! Ready for your real data.', 'info');
    }
  };

  // Trigger print bill
  const triggerPrintBill = (invoice) => {
    setActiveInvoiceForPrint(invoice);
    setIsPrintModalOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchRole,
        shop,
        updateShop,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        quickAdjustStock,
        categories: CATEGORIES,
        customers,
        addCustomer,
        suppliers,
        addSupplier,
        sales,
        saveBill,
        purchases,
        addPurchase,
        returns,
        processReturn,
        activeTab,
        setActiveTab,
        activeInvoiceForPrint,
        isPrintModalOpen,
        setIsPrintModalOpen,
        triggerPrintBill,
        exportData,
        importData,
        wipeAllData,
        resetData: wipeAllData,
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
