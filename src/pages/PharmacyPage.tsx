import React, { useState, useEffect } from 'react';
import { Medicine, Prescription, StockMovement, StaffUser } from '../types';
import { apiRequest, formatDate, formatDateTime, formatNGN } from '../lib/api';
import { PrintDocumentModal } from '../components/PrintDocumentModal';
import {
  Pill,
  PackagePlus,
  AlertTriangle,
  History,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowDownRight,
  Printer,
  Search,
  X
} from 'lucide-react';

interface PharmacyPageProps {
  user: StaffUser;
}

export const PharmacyPage: React.FC<PharmacyPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'inventory' | 'movements'>('prescriptions');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<{ lowStock: any[]; expiringSoon: any[] }>({ lowStock: [], expiringSoon: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showStockReceiptModal, setShowStockReceiptModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showNewMedModal, setShowNewMedModal] = useState(false);
  const [printDoc, setPrintDoc] = useState<any>(null);

  // Forms
  const [receiptForm, setReceiptForm] = useState({
    medicine_id: '',
    quantity: 50,
    unit_cost: '',
    batch_number: '',
    expiry_date: '',
    supplier: '',
    invoice_reference: ''
  });

  const [adjustForm, setAdjustForm] = useState({
    medicine_id: '',
    adjustment_type: 'breakage',
    quantity: -1,
    reason: ''
  });

  const [newMedForm, setNewMedForm] = useState({
    code: '',
    generic_name: '',
    brand_name: '',
    category: 'Antibiotics',
    strength: '',
    dosage_form: 'Tablet',
    unit: 'pack',
    purchase_cost: '',
    selling_price: '',
    initial_stock: 50,
    reorder_level: 20,
    batch_number: '',
    expiry_date: '',
    supplier: ''
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const rxRes = await apiRequest('/api/prescriptions');
      setPrescriptions(rxRes.prescriptions || []);

      const medRes = await apiRequest(`/api/pharmacy/inventory?q=${encodeURIComponent(searchQuery)}`);
      setMedicines(medRes.medicines || []);

      const movRes = await apiRequest('/api/pharmacy/stock-movements?limit=40');
      setMovements(movRes.movements || []);

      const alertRes = await apiRequest('/api/pharmacy/alerts');
      setAlerts(alertRes);
    } catch (err) {
      console.error('Failed to load pharmacy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  const handleDispense = async (prescriptionId: string) => {
    setMessage(null);
    try {
      const res = await apiRequest(`/api/prescriptions/${prescriptionId}/dispense`, {
        method: 'POST',
        body: JSON.stringify({ patient_notes: 'Medications dispensed with oral administration instructions.' })
      });
      setMessage({ type: 'success', text: res.message });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Dispensing failed.' });
    }
  };

  const handleStockReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await apiRequest('/api/pharmacy/stock-receipt', {
        method: 'POST',
        body: JSON.stringify(receiptForm)
      });
      setShowStockReceiptModal(false);
      setMessage({ type: 'success', text: res.message });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await apiRequest('/api/pharmacy/stock-adjustment', {
        method: 'POST',
        body: JSON.stringify(adjustForm)
      });
      setShowAdjustModal(false);
      setMessage({ type: 'success', text: res.message });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleNewMedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await apiRequest('/api/pharmacy/inventory', {
        method: 'POST',
        body: JSON.stringify(newMedForm)
      });
      setShowNewMedModal(false);
      setMessage({ type: 'success', text: 'New medicine added to formulary.' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pharmacy & Formulary</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescription dispensing, batch/expiry ledger, and automated stock deductions
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`px-3 py-1.5 rounded-md ${activeTab === 'prescriptions' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
            >
              Prescriptions ({prescriptions.filter((p) => p.status === 'pending').length} pending)
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-md ${activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
            >
              Stock Inventory ({medicines.length})
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-3 py-1.5 rounded-md ${activeTab === 'movements' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
            >
              Movement Ledger
            </button>
          </div>

          <button
            onClick={() => {
              setReceiptForm({
                medicine_id: medicines[0]?.id || '',
                quantity: 50,
                unit_cost: '',
                batch_number: `BAT-${new Date().getFullYear()}-01`,
                expiry_date: '2028-12-31',
                supplier: 'Healthcare Distributor',
                invoice_reference: 'SUP-INV-01'
              });
              setShowStockReceiptModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Stock Receipt</span>
          </button>
        </div>
      </div>

      {/* Notifications / Alerts banner */}
      {message && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Low stock & expiry alerts */}
      {(alerts.lowStock.length > 0 || alerts.expiringSoon.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.lowStock.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-900">Low Stock Reorder Alert ({alerts.lowStock.length} items):</strong>
                <div className="mt-1 space-y-0.5 text-[11px] text-amber-800">
                  {alerts.lowStock.slice(0, 3).map((m: any) => (
                    <div key={m.id}>
                      • {m.generic_name} ({m.brand_name}): In stock: <strong>{m.stock_quantity}</strong> (Reorder threshold: {m.reorder_level})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {alerts.expiringSoon.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs flex items-start gap-2">
              <Calendar className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-rose-900">Approaching Expiry Alert ({alerts.expiringSoon.length} items):</strong>
                <div className="mt-1 space-y-0.5 text-[11px] text-rose-800">
                  {alerts.expiringSoon.slice(0, 3).map((m: any) => (
                    <div key={m.id}>
                      • {m.generic_name} (Batch: {m.batch_number}): Expires <strong>{formatDate(m.expiry_date)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Prescriptions Queue & Dispensing */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
              No active prescriptions in the dispensary queue.
            </div>
          ) : (
            prescriptions.map((rx) => {
              const isDispensed = rx.status === 'dispensed';
              return (
                <div key={rx.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{rx.prescription_no}</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          isDispensed ? 'bg-emerald-100 text-emerald-800' : rx.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rx.status}
                        </span>
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        Patient: <strong className="text-slate-800">{rx.patient_name}</strong> ({rx.patient_no}) · Prescribing Doctor: {rx.doctor_name}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPrintDoc(rx)}
                        className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Order</span>
                      </button>

                      {!isDispensed && rx.status !== 'cancelled' && (
                        <button
                          onClick={() => handleDispense(rx.id)}
                          className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                        >
                          <Pill className="w-3.5 h-3.5" />
                          <span>Dispense & Deduct Stock</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Medication Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px]">
                        <tr>
                          <th className="p-2">Medication</th>
                          <th className="p-2">Dosage / Route</th>
                          <th className="p-2">Frequency / Duration</th>
                          <th className="p-2 text-center">Prescribed Qty</th>
                          <th className="p-2 text-center">Current Stock</th>
                          <th className="p-2">Batch / Expiry</th>
                          <th className="p-2">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rx.items?.map((itm) => (
                          <tr key={itm.id}>
                            <td className="p-2 font-semibold text-slate-900">{itm.medicine_name}</td>
                            <td className="p-2 text-slate-600">{itm.dosage} · {itm.route}</td>
                            <td className="p-2 text-slate-600">{itm.frequency} x {itm.duration_days} days</td>
                            <td className="p-2 text-center font-bold text-slate-900">{itm.quantity_prescribed}</td>
                            <td className="p-2 text-center font-mono">
                              <span className={(itm.current_stock || 0) < itm.quantity_prescribed ? 'text-red-600 font-bold' : 'text-emerald-700'}>
                                {itm.current_stock ?? '—'}
                              </span>
                            </td>
                            <td className="p-2 text-slate-500 font-mono text-[11px]">
                              {itm.batch_number || '—'} · {formatDate(itm.expiry_date)}
                            </td>
                            <td className="p-2 text-slate-500 italic">{itm.instructions || 'As directed'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Stock Inventory & Formulary */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search generic or brand name..."
                className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg border-slate-300"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAdjustForm({
                    medicine_id: medicines[0]?.id || '',
                    adjustment_type: 'breakage',
                    quantity: -1,
                    reason: ''
                  });
                  setShowAdjustModal(true);
                }}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Stock Adjustment / Wastage
              </button>

              <button
                onClick={() => {
                  setNewMedForm({
                    code: `MED-${Math.floor(100 + Math.random() * 900)}`,
                    generic_name: '',
                    brand_name: '',
                    category: 'Antibiotics',
                    strength: '500mg',
                    dosage_form: 'Tablet',
                    unit: 'pack',
                    purchase_cost: '2000',
                    selling_price: '3500',
                    initial_stock: 50,
                    reorder_level: 20,
                    batch_number: 'BAT-2026-01',
                    expiry_date: '2028-12-31',
                    supplier: 'Emzor Pharmaceuticals'
                  });
                  setShowNewMedModal(true);
                }}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900"
              >
                + Add New Medicine
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Medicine (Generic & Brand)</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Form & Strength</th>
                    <th className="p-3 text-center">Stock Balance</th>
                    <th className="p-3 text-right">Selling Price</th>
                    <th className="p-3">Batch & Expiry</th>
                    <th className="p-3">Supplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicines.map((m) => {
                    const isLow = m.stock_quantity <= m.reorder_level;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-700">{m.code}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{m.generic_name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{m.brand_name}</div>
                        </td>
                        <td className="p-3 text-slate-600">{m.category}</td>
                        <td className="p-3 text-slate-600">{m.dosage_form} · {m.strength}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                            isLow ? 'bg-red-100 text-red-800' : 'bg-emerald-50 text-emerald-800'
                          }`}>
                            {m.stock_quantity} {m.unit}s
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          {formatNGN(m.selling_price)}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          {m.batch_number} · {formatDate(m.expiry_date)}
                        </td>
                        <td className="p-3 text-slate-500">{m.supplier}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Stock Movement Ledger */}
      {activeTab === 'movements' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Immutable Stock Movement Ledger
            </h3>
            <span className="text-[11px] text-slate-500">Every stock increase or decrease is authoritatively recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Movement Ref</th>
                  <th className="p-3">Medicine</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-center">Quantity</th>
                  <th className="p-3 text-center">Balance (Before → After)</th>
                  <th className="p-3">Batch</th>
                  <th className="p-3">Reason / Source</th>
                  <th className="p-3">Staff Actor & Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {movements.map((mov) => {
                  const isPositive = mov.quantity > 0;
                  return (
                    <tr key={mov.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{mov.movement_no}</td>
                      <td className="p-3 font-sans font-semibold text-slate-900">{mov.generic_name}</td>
                      <td className="p-3 uppercase font-sans font-bold text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded ${
                          mov.transaction_type === 'receipt' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {mov.transaction_type}
                        </span>
                      </td>
                      <td className={`p-3 text-center font-bold ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                        {isPositive ? `+${mov.quantity}` : mov.quantity}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {mov.balance_before} → <strong className="text-slate-900">{mov.balance_after}</strong>
                      </td>
                      <td className="p-3 text-slate-500">{mov.batch_number}</td>
                      <td className="p-3 font-sans text-slate-600">{mov.reason}</td>
                      <td className="p-3 font-sans text-slate-400">
                        <div>{mov.performed_by_name || 'Staff'}</div>
                        <div className="text-[10px]">{formatDateTime(mov.created_at)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Receipt Modal */}
      {showStockReceiptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Record Stock Intake</h3>
              <button onClick={() => setShowStockReceiptModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockReceiptSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medicine *</label>
                <select
                  required
                  value={receiptForm.medicine_id}
                  onChange={(e) => setReceiptForm({ ...receiptForm, medicine_id: e.target.value })}
                  className="w-full p-2 border rounded border-slate-300 bg-white"
                >
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.generic_name} ({m.brand_name}) · Current: {m.stock_quantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Units Received *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={receiptForm.quantity}
                    onChange={(e) => setReceiptForm({ ...receiptForm, quantity: Number(e.target.value) })}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={receiptForm.batch_number}
                    onChange={(e) => setReceiptForm({ ...receiptForm, batch_number: e.target.value })}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={receiptForm.expiry_date}
                    onChange={(e) => setReceiptForm({ ...receiptForm, expiry_date: e.target.value })}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier *</label>
                  <input
                    type="text"
                    required
                    value={receiptForm.supplier}
                    onChange={(e) => setReceiptForm({ ...receiptForm, supplier: e.target.value })}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStockReceiptModal(false)}
                  className="px-3 py-1.5 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded"
                >
                  Confirm Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Audited Stock Adjustment</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medicine *</label>
                <select
                  required
                  value={adjustForm.medicine_id}
                  onChange={(e) => setAdjustForm({ ...adjustForm, medicine_id: e.target.value })}
                  className="w-full p-2 border rounded border-slate-300 bg-white"
                >
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.generic_name} (Current: {m.stock_quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Adjustment Type *</label>
                  <select
                    value={adjustForm.adjustment_type}
                    onChange={(e) => setAdjustForm({ ...adjustForm, adjustment_type: e.target.value })}
                    className="w-full p-2 border rounded border-slate-300 bg-white"
                  >
                    <option value="breakage">Breakage / Damage</option>
                    <option value="expiry">Expired Stock Removal</option>
                    <option value="reconciliation">Audit Count Reconciliation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delta Quantity *</label>
                  <input
                    type="number"
                    required
                    value={adjustForm.quantity}
                    onChange={(e) => setAdjustForm({ ...adjustForm, quantity: Number(e.target.value) })}
                    placeholder="-5 or +5"
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Justification *</label>
                <textarea
                  required
                  rows={2}
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  placeholder="Document audited cause for stock adjustment..."
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-3 py-1.5 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showNewMedModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Add Medicine to Formulary</h3>
              <button onClick={() => setShowNewMedModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNewMedSubmit} className="mt-4 space-y-3 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={newMedForm.code}
                    onChange={(e) => setNewMedForm({ ...newMedForm, code: e.target.value })}
                    className="w-full p-2 border rounded border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newMedForm.category}
                    onChange={(e) => setNewMedForm({ ...newMedForm, category: e.target.value })}
                    className="w-full p-2 border rounded border-slate-300 bg-white"
                  >
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Analgesics">Analgesics</option>
                    <option value="Antihypertensives">Antihypertensives</option>
                    <option value="Antimalarials">Antimalarials</option>
                    <option value="Antidiabetics">Antidiabetics</option>
                    <option value="Gastrointestinal">Gastrointestinal</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="IV Fluids">IV Fluids</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Generic Name *</label>
                  <input
                    type="text"
                    required
                    value={newMedForm.generic_name}
                    onChange={(e) => setNewMedForm({ ...newMedForm, generic_name: e.target.value })}
                    placeholder="e.g. Ciprofloxacin HCl"
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={newMedForm.brand_name}
                    onChange={(e) => setNewMedForm({ ...newMedForm, brand_name: e.target.value })}
                    placeholder="e.g. Ciprotab"
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Strength</label>
                  <input
                    type="text"
                    value={newMedForm.strength}
                    onChange={(e) => setNewMedForm({ ...newMedForm, strength: e.target.value })}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Form</label>
                  <select
                    value={newMedForm.dosage_form}
                    onChange={(e) => setNewMedForm({ ...newMedForm, dosage_form: e.target.value })}
                    className="w-full p-2 border rounded border-slate-300 bg-white"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Inhaler">Inhaler</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (₦) *</label>
                  <input
                    type="number"
                    required
                    value={newMedForm.selling_price}
                    onChange={(e) => setNewMedForm({ ...newMedForm, selling_price: e.target.value })}
                    className="w-full p-2 border rounded border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={newMedForm.batch_number}
                    onChange={(e) => setNewMedForm({ ...newMedForm, batch_number: e.target.value })}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={newMedForm.expiry_date}
                    onChange={(e) => setNewMedForm({ ...newMedForm, expiry_date: e.target.value })}
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier *</label>
                <input
                  type="text"
                  required
                  value={newMedForm.supplier}
                  onChange={(e) => setNewMedForm({ ...newMedForm, supplier: e.target.value })}
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewMedModal(false)}
                  className="px-3 py-1.5 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded"
                >
                  Save to Formulary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Prescription Modal */}
      {printDoc && (
        <PrintDocumentModal
          title="Prescription Order & Dispensing Slip"
          documentType="prescription"
          data={printDoc}
          onClose={() => setPrintDoc(null)}
        />
      )}

    </div>
  );
};
