import React, { useState, useEffect } from 'react';
import { Invoice, StaffUser } from '../types';
import { apiRequest, formatDate, formatDateTime, formatNGN } from '../lib/api';
import { PrintDocumentModal } from '../components/PrintDocumentModal';
import {
  Receipt,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  Printer,
  Sparkles,
  BarChart,
  Search,
  Plus,
  X,
  Layers,
  ShieldCheck,
  Activity,
  Check,
  ToggleLeft,
  ToggleRight,
  Filter,
  Tag
} from 'lucide-react';

interface BillingPageProps {
  user: StaffUser;
}

export const BillingPage: React.FC<BillingPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'reconciliation' | 'services'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Service Catalog state
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('all');
  const [serviceSearch, setServiceSearch] = useState('');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newService, setNewService] = useState({
    code: '',
    name: '',
    category: 'consultation',
    price: '',
    description: '',
    is_active: true
  });

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'pos' | 'bank_transfer'>('pos');
  const [txRef, setTxRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payError, setPayError] = useState<string | null>(null);

  // Auto-generate invoice modal
  const [showAutoGenModal, setShowAutoGenModal] = useState(false);
  const [openVisits, setOpenVisits] = useState<any[]>([]);
  const [autoGenVisitId, setAutoGenVisitId] = useState('');

  // Print receipt modal
  const [printDoc, setPrintDoc] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const invRes = await apiRequest(`/api/billing/invoices?status=${statusFilter}`);
      setInvoices(invRes.invoices || []);

      const recRes = await apiRequest('/api/billing/reconciliation');
      setReconciliation(recRes);

      const vRes = await apiRequest('/api/visits');
      setOpenVisits(vRes.visits || []);

      const srvRes = await apiRequest('/api/billing/services');
      setServicesList(srvRes.services || []);
    } catch (err) {
      console.error('Failed to load billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleService = async (serviceId: string) => {
    try {
      const res = await apiRequest(`/api/billing/services/${serviceId}/toggle`, { method: 'PATCH' });
      setMessage({ type: 'success', text: res.message });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle service status');
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/api/billing/services', {
        method: 'POST',
        body: JSON.stringify(newService)
      });
      setMessage({ type: 'success', text: res.message });
      setShowAddServiceModal(false);
      setNewService({ code: '', name: '', category: 'consultation', price: '', description: '', is_active: true });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create service');
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPayAmount(inv.balance_due);
    setPayMethod('pos');
    setTxRef(`POS-${Date.now().toString().slice(-6)}`);
    setPayNotes('Standard settlement');
    setPayError(null);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setPayError(null);

    try {
      const res = await apiRequest('/api/billing/payments', {
        method: 'POST',
        body: JSON.stringify({
          invoice_id: selectedInvoice.id,
          amount: Number(payAmount),
          payment_method: payMethod,
          transaction_reference: txRef,
          notes: payNotes
        })
      });

      setShowPaymentModal(false);
      setMessage({ type: 'success', text: `Payment confirmed. Receipt ${res.payment_no} generated.` });
      fetchData();

      // Offer to print receipt
      setPrintDoc({
        payment_no: res.payment_no,
        invoice_no: selectedInvoice.invoice_no,
        patient_name: selectedInvoice.patient_name,
        patient_no: selectedInvoice.patient_no,
        amount: Number(payAmount),
        payment_method: payMethod,
        transaction_reference: txRef,
        cashier_name: user.full_name,
        items: selectedInvoice.items
      });
    } catch (err: any) {
      setPayError(err.message || 'Payment processing failed.');
    }
  };

  const handleAutoGenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoGenVisitId) return;
    try {
      const res = await apiRequest('/api/billing/invoices/auto-generate', {
        method: 'POST',
        body: JSON.stringify({ visit_id: autoGenVisitId })
      });
      setShowAutoGenModal(false);
      setMessage({ type: 'success', text: res.message });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Billing & Cashiering Desk</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Invoice settlement in Nigerian Naira (₦), POS reconciliation, and receipt generation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 rounded-md ${activeTab === 'invoices' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
            >
              Invoices & Payments
            </button>
            <button
              onClick={() => setActiveTab('reconciliation')}
              className={`px-3 py-1.5 rounded-md ${activeTab === 'reconciliation' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
            >
              Daily Shift Reconciliation
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 ${
                activeTab === 'services' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>Registered Services ({servicesList.filter(s => s.is_active === 1).length} Active)</span>
            </button>
          </div>

          {activeTab === 'services' && (user.role === 'admin' || user.role === 'accountant') ? (
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Service</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setAutoGenVisitId(openVisits[0]?.id || '');
                setShowAutoGenModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Visit Invoice</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {activeTab === 'invoices' ? (
        <>
          {/* Status filters */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Status:</span>
              {['all', 'unpaid', 'partially_paid', 'paid'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                    statusFilter === st ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All Invoices' : st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <span className="text-slate-500 font-mono text-[11px]">
              Currency: NGN (₦)
            </span>
          </div>

          {/* Invoices List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
                Loading clinic invoices...
              </div>
            ) : invoices.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
                No invoices found.
              </div>
            ) : (
              invoices.map((inv) => {
                const isPaid = inv.status === 'paid';
                return (
                  <div key={inv.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900">{inv.invoice_no}</span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                            isPaid ? 'bg-emerald-100 text-emerald-800' : inv.status === 'partially_paid' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {inv.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-slate-500 mt-1">
                          Patient: <strong className="text-slate-900">{inv.patient_name}</strong> ({inv.patient_no}) · Visit: {inv.visit_no}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-slate-400 text-[11px]">Total / Due:</div>
                          <div className="font-mono font-bold text-sm text-slate-900">
                            {formatNGN(inv.total_amount)}
                          </div>
                          {inv.balance_due > 0 && (
                            <div className="text-red-700 font-bold font-mono text-[11px]">
                              Due: {formatNGN(inv.balance_due)}
                            </div>
                          )}
                        </div>

                        {!isPaid && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Collect Payment</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Line Items */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px]">
                          <tr>
                            <th className="p-2">Item Description</th>
                            <th className="p-2 text-center">Qty</th>
                            <th className="p-2 text-right">Unit Price</th>
                            <th className="p-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {inv.items?.map((item) => (
                            <tr key={item.id}>
                              <td className="p-2 font-medium text-slate-800">{item.description}</td>
                              <td className="p-2 text-center">{item.quantity}</td>
                              <td className="p-2 text-right font-mono">{formatNGN(item.unit_price)}</td>
                              <td className="p-2 text-right font-mono font-semibold">{formatNGN(item.total_price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Completed Payments if any */}
                    {inv.payments && inv.payments.length > 0 && (
                      <div className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-lg flex flex-wrap items-center justify-between text-[11px]">
                        <div className="space-y-0.5">
                          <strong className="text-emerald-950">Settlement Receipts ({inv.payments.length}):</strong>
                          {inv.payments.map((p) => (
                            <div key={p.id} className="text-emerald-800">
                              • Receipt <strong>{p.payment_no}</strong>: {formatNGN(p.amount)} via {p.payment_method.toUpperCase()} (Ref: {p.transaction_reference})
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            const lastP = inv.payments![0];
                            setPrintDoc({
                              payment_no: lastP.payment_no,
                              invoice_no: inv.invoice_no,
                              patient_name: inv.patient_name,
                              patient_no: inv.patient_no,
                              amount: lastP.amount,
                              payment_method: lastP.payment_method,
                              transaction_reference: lastP.transaction_reference,
                              cashier_name: lastP.cashier_name,
                              items: inv.items
                            });
                          }}
                          className="px-2 py-1 bg-white border border-emerald-300 text-emerald-800 rounded font-semibold flex items-center gap-1 hover:bg-emerald-100"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Reprint Receipt</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : activeTab === 'reconciliation' ? (
        /* Daily Shift Reconciliation */
        reconciliation && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                Today's Cashier Shift Reconciliation ({formatDate(reconciliation.date)})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
                  <span className="text-xs font-semibold text-teal-800 uppercase">Total Revenue Collected</span>
                  <div className="text-2xl font-bold font-mono text-teal-950 mt-1">
                    {formatNGN(reconciliation.grandTotal)}
                  </div>
                  <span className="text-[11px] text-teal-700">{reconciliation.transactionCount} transactions confirmed</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Electronic POS Volume</span>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                    {formatNGN(reconciliation.summary?.find((s: any) => s.payment_method === 'pos')?.total_amount || 0)}
                  </div>
                  <span className="text-[11px] text-slate-500">Terminal settlements</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Cash & Bank Transfers</span>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                    {formatNGN(
                      (reconciliation.summary?.find((s: any) => s.payment_method === 'cash')?.total_amount || 0) +
                      (reconciliation.summary?.find((s: any) => s.payment_method === 'bank_transfer')?.total_amount || 0)
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">Vault & direct verified transfer</span>
                </div>
              </div>

              {/* Cashier Breakdown Table */}
              <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold">
                    <tr>
                      <th className="p-3">Cashier Staff Member</th>
                      <th className="p-3">Payment Channel</th>
                      <th className="p-3 text-center">Tx Count</th>
                      <th className="p-3 text-right">Settled Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reconciliation.cashierBreakdown?.map((c: any, i: number) => (
                      <tr key={i}>
                        <td className="p-3 font-semibold text-slate-900">{c.cashier_name}</td>
                        <td className="p-3 uppercase font-medium text-slate-700">{c.payment_method}</td>
                        <td className="p-3 text-center font-mono">{c.count}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">{formatNGN(c.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Registered Services & Tariffs Catalog */
        <div className="space-y-6">
          {/* Active Status System Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
                <ShieldCheck className="w-6 h-6 text-emerald-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight text-white">
                    All Registered Services are Active on the System
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-400/25 text-emerald-100 border border-emerald-300/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    100% Operational
                  </span>
                </div>
                <p className="text-xs text-emerald-50/90 mt-1 max-w-2xl leading-relaxed">
                  Every registered clinical, maternity, laboratory, ultrasound imaging, inpatient ward, and consultation service in AL-EMAN CLINIC AND MATERNITY HOME is live and available for doctor ordering, clinical documentation, and automated cashier billing.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-lg bg-white/10 backdrop-blur-xs border border-white/15 text-center">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-100">Live Services</span>
                <span className="text-xl font-bold font-mono text-white">
                  {servicesList.filter(s => s.is_active === 1).length} / {servicesList.length}
                </span>
              </div>
            </div>
          </div>

          {/* Stat metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase">Total Catalog</span>
                <Layers className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">{servicesList.length}</div>
              <span className="text-[11px] text-slate-500">Registered hospital services</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase">Active Status</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                {servicesList.filter(s => s.is_active === 1).length} Active
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">100% live & orderable</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase">Departments</span>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {new Set(servicesList.map(s => s.category)).size}
              </div>
              <span className="text-[11px] text-slate-500">Maternity, Lab, Scans & Care</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase">Billing Currency</span>
                <Tag className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">NGN (₦)</div>
              <span className="text-[11px] text-slate-500">Regulated clinic tariffs</span>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-600 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Department:
              </span>
              {[
                { id: 'all', label: 'All Services' },
                { id: 'maternity', label: 'Maternity & Delivery' },
                { id: 'imaging', label: 'Ultrasound / Scans' },
                { id: 'consultation', label: 'Consultations' },
                { id: 'laboratory', label: 'Laboratory' },
                { id: 'nursing', label: 'Nursing & Child' },
                { id: 'procedure', label: 'Procedures' },
                { id: 'inpatient', label: 'Inpatient Ward' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setServiceCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    serviceCategoryFilter === cat.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder="Search service name, code, or details..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Services Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Institutional Service & Tariff Directory</h3>
                <p className="text-xs text-slate-500">Official fee schedule for Al-Eman Clinic and Maternity Home</p>
              </div>
              <span className="text-xs font-semibold text-slate-600">
                Showing {servicesList.filter((s) => {
                  const matchesCat = serviceCategoryFilter === 'all' || s.category === serviceCategoryFilter;
                  const matchesSearch =
                    !serviceSearch ||
                    s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                    s.code.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                    (s.description && s.description.toLowerCase().includes(serviceSearch.toLowerCase()));
                  return matchesCat && matchesSearch;
                }).length} of {servicesList.length} services
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-32">Service Code</th>
                    <th className="p-3">Service Name & Description</th>
                    <th className="p-3 w-36">Department</th>
                    <th className="p-3 w-32 text-right">Standard Tariff</th>
                    <th className="p-3 w-28 text-center">System Status</th>
                    {(user.role === 'admin' || user.role === 'accountant') && (
                      <th className="p-3 w-28 text-center">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {servicesList
                    .filter((s) => {
                      const matchesCat = serviceCategoryFilter === 'all' || s.category === serviceCategoryFilter;
                      const matchesSearch =
                        !serviceSearch ||
                        s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                        s.code.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                        (s.description && s.description.toLowerCase().includes(serviceSearch.toLowerCase()));
                      return matchesCat && matchesSearch;
                    })
                    .map((s) => {
                      const getCatStyle = (cat: string) => {
                        switch (cat) {
                          case 'maternity':
                            return 'bg-pink-50 text-pink-700 border-pink-200';
                          case 'imaging':
                            return 'bg-purple-50 text-purple-700 border-purple-200';
                          case 'laboratory':
                            return 'bg-cyan-50 text-cyan-700 border-cyan-200';
                          case 'consultation':
                            return 'bg-blue-50 text-blue-700 border-blue-200';
                          case 'nursing':
                            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          case 'procedure':
                            return 'bg-amber-50 text-amber-700 border-amber-200';
                          case 'inpatient':
                            return 'bg-indigo-50 text-indigo-700 border-indigo-200';
                          default:
                            return 'bg-slate-100 text-slate-700 border-slate-200';
                        }
                      };

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3">
                            <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              {s.code}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-900">{s.name}</div>
                            {s.description && (
                              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{s.description}</div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${getCatStyle(s.category)}`}>
                              {s.category}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {formatNGN(s.price)}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {s.is_active === 1 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                Inactive
                              </span>
                            )}
                          </td>
                          {(user.role === 'admin' || user.role === 'accountant') && (
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleToggleService(s.id)}
                                title={s.is_active === 1 ? 'Deactivate service' : 'Activate service'}
                                className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                                  s.is_active === 1
                                    ? 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                }`}
                              >
                                {s.is_active === 1 ? 'Deactivate' : 'Activate'}
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Record Cashier Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {payError && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded">
                {payError}
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-4">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-1">
                <div>Invoice: <strong className="font-mono">{selectedInvoice.invoice_no}</strong></div>
                <div>Patient: <strong>{selectedInvoice.patient_name}</strong></div>
                <div>Outstanding Balance: <strong className="text-red-700 font-mono">{formatNGN(selectedInvoice.balance_due)}</strong></div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount to Pay (₦) *</label>
                <input
                  type="number"
                  step="0.01"
                  max={selectedInvoice.balance_due}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2 border rounded font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pos', 'cash', 'bank_transfer'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPayMethod(method)}
                      className={`p-2 rounded border font-semibold uppercase text-[11px] ${
                        payMethod === method
                          ? 'border-teal-500 bg-teal-50 text-teal-900 ring-1 ring-teal-400'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {method.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transaction Reference / Terminal Auth Code *
                </label>
                <input
                  type="text"
                  required
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder="e.g. POS-AUTH-991204 or NIP-ZENITH-440192"
                  className="w-full p-2 border rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Standard settlement"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-generate Invoice Modal */}
      {showAutoGenModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Auto-Generate Visit Invoice</h3>
              <button onClick={() => setShowAutoGenModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAutoGenSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Open Visit *</label>
                <select
                  required
                  value={autoGenVisitId}
                  onChange={(e) => setAutoGenVisitId(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300 bg-white"
                >
                  {openVisits.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.visit_no} - {v.patient_name} ({v.stage})
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-slate-500 leading-relaxed text-[11px]">
                The system will automatically scan this patient visit, bundle consultation fees, triage fees, ordered laboratory tests, and prescribed formulary medications into a consolidated itemized bill.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAutoGenModal(false)}
                  className="px-3 py-1.5 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register New Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Register New Clinic Service</h3>
              <button onClick={() => setShowAddServiceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAT-SCAN-01"
                    value={newService.code}
                    onChange={(e) => setNewService({ ...newService, code: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono uppercase text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department / Category *</label>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="maternity">Maternity & Delivery</option>
                    <option value="imaging">Ultrasound & Imaging</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="nursing">Nursing & Child Care</option>
                    <option value="procedure">Clinical Procedure</option>
                    <option value="inpatient">Inpatient Ward</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pelvic & Fetal Growth Doppler Scan"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Tariff Fee (₦) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 5000"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Clinical indications, standard protocols, or department details..."
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-xs resize-none"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded">
                <input
                  type="checkbox"
                  id="srv_active_chk"
                  checked={newService.is_active}
                  onChange={(e) => setNewService({ ...newService, is_active: e.target.checked })}
                  className="accent-teal-600 rounded"
                />
                <label htmlFor="srv_active_chk" className="font-semibold text-slate-700 text-xs cursor-pointer">
                  Activate immediately upon registration (Status: Active)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-3 py-1.5 border rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded text-xs"
                >
                  Save & Register Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Print Modal */}
      {printDoc && (
        <PrintDocumentModal
          title="Official Clinic Revenue Receipt"
          documentType="receipt"
          data={printDoc}
          onClose={() => setPrintDoc(null)}
        />
      )}

    </div>
  );
};
