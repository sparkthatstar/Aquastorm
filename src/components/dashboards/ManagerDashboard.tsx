import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ORDER_STATES_META } from '../../data/mockData';
import { OrderRecord } from '../../types';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Search,
  Filter,
  Download,
  Eye,
  XCircle,
  Truck,
  TrendingUp,
  AlertCircle,
  Phone,
  FileSpreadsheet
} from 'lucide-react';

interface ManagerDashboardProps {
  onNavigate: (view: string, orderId?: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onNavigate }) => {
  const {
    orders,
    allUsers,
    verifyPayment,
    holdPayment,
    assignVendor,
    complaints,
    showToast
  } = useApp();

  const [filterState, setFilterState] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderForInspect, setSelectedOrderForInspect] = useState<OrderRecord | null>(null);
  const [holdReason, setHoldReason] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');

  // Active delivery riders/vendors
  const availableVendors = allUsers.filter(u => u.role === 'vendor' && u.isActive);

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    const matchesState = filterState === 'all' || o.state === filterState;
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.hostelDomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.roomIdentifier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesState && matchesSearch;
  });

  // Metric Ribbon Calculations
  const todayOrders = orders.length;
  const pendingPayments = orders.filter(o => o.state === 'STATE_01_PENDING_PAYMENT');
  const activeDeliveries = orders.filter(o =>
    o.state === 'STATE_04_ASSIGNED_TO_VENDOR' ||
    o.state === 'STATE_05_VENDOR_ACCEPTED' ||
    o.state === 'STATE_06_PREPARING' ||
    o.state === 'STATE_07_OUT_FOR_DELIVERY'
  );
  const totalRevenue = orders
    .filter(o => o.state !== 'STATE_CANCELLED' && o.state !== 'STATE_01_PENDING_PAYMENT')
    .reduce((acc, cur) => acc + cur.totalAmount, 0);

  const openComplaintsCount = complaints.filter(c => c.status === 'Open').length;

  const handleVerify = (orderId: string) => {
    verifyPayment(orderId);
    setSelectedOrderForInspect(null);
  };

  const handleHold = (orderId: string) => {
    if (!holdReason.trim()) {
      showToast('Please provide a reason for putting the payment on hold.');
      return;
    }
    holdPayment(orderId, holdReason);
    setHoldReason('');
    setSelectedOrderForInspect(null);
  };

  const handleAssign = (orderId: string) => {
    const vendor = availableVendors.find(v => v.id === selectedVendorId);
    if (!vendor) {
      showToast('Please select a delivery vendor from the campus roster.');
      return;
    }
    assignVendor(orderId, vendor.id, vendor.fullName);
    setSelectedVendorId('');
    setSelectedOrderForInspect(null);
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Hostel', 'Room', 'Floor', 'Track', 'Amount', 'State', 'Vendor', 'Created At'];
    const rows = orders.map(o => [
      o.id,
      `"${o.customerName}"`,
      `"${o.hostelDomain}"`,
      `"${o.roomIdentifier}"`,
      o.floorIndex,
      o.fulfillmentTrack,
      o.totalAmount,
      o.state,
      `"${o.assignedVendorName || 'Unassigned'}"`,
      o.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aquastorm_fulfillment_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Fulfillment performance report exported to CSV.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header & Role Guardrail Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-amber-700" />
            Manager Operations Command
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 mt-1">
            Logistics & Fulfillment Roster
          </h1>
          <p className="text-xs text-slate-600">
            Realtime order approvals, payment receipt verification, and vendor task dispatching for ESUTH Hostels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Logistics CSV</span>
          </button>
        </div>
      </div>

      {/* Strict Guardrail Notice */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
        <span>
          <strong>Operational Policy:</strong> Managers can approve payments, assign vendors, and adjust logistics. <em>Order cancellations and refunds are strictly restricted to Admin override.</em>
        </span>
      </div>

      {/* Live Metric Ribbons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Orders</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{todayOrders}</span>
          <span className="text-[10px] text-slate-500">Live Campus Roster</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Pending Verification</span>
          <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">{pendingPayments.length}</span>
          <span className="text-[10px] text-amber-700 font-semibold">Slips Awaiting Review</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#00AFD5] block">In Fulfillment</span>
          <span className="text-2xl font-black text-[#00AFD5] font-mono mt-1 block">{activeDeliveries.length}</span>
          <span className="text-[10px] text-sky-700 font-semibold">Active In Transit</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Verified Revenue</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">₦{totalRevenue.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500">Gross Processed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">Live Complaints</span>
          <span className="text-2xl font-black text-red-600 font-mono mt-1 block">{openComplaintsCount}</span>
          <span className="text-[10px] text-red-700 font-semibold">Admin Escalations</span>
        </div>
      </div>

      {/* Logistics Control Table with Multi-Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search and Filters Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Order ID, Room, Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
            />
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="all">All Operational States ({orders.length})</option>
              <option value="STATE_01_PENDING_PAYMENT">Pending Payment Verification ({orders.filter(o => o.state === 'STATE_01_PENDING_PAYMENT').length})</option>
              <option value="STATE_02_PAYMENT_VERIFIED">Payment Verified</option>
              <option value="STATE_03_APPROVED">Approved (Need Vendor Assignment)</option>
              <option value="STATE_04_ASSIGNED_TO_VENDOR">Assigned to Vendor</option>
              <option value="STATE_07_OUT_FOR_DELIVERY">Out For Delivery</option>
              <option value="STATE_08_DELIVERED">Delivered</option>
              <option value="STATE_09_COMPLETED">Completed</option>
              <option value="STATE_CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer & Coordinates</th>
                <th className="py-3 px-4">Fulfillment Details</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Current State</th>
                <th className="py-3 px-4">Assigned Vendor</th>
                <th className="py-3 px-4 text-right">Ops Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold font-mono text-[#03098F] block">{order.id}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">{order.customerName}</span>
                    <span className="text-[11px] text-slate-500">
                      {order.roomIdentifier} • {order.hostelDomain.split('(')[0]}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-700 block">
                      {order.fulfillmentTrack === 'water_depot'
                        ? 'Water (Depot Pickup)'
                        : order.fulfillmentTrack === 'water_room_delivery'
                        ? 'Water (Room Delivery)'
                        : 'Food Order'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} Items
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900">₦{order.totalAmount.toLocaleString()}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                      order.state === 'STATE_01_PENDING_PAYMENT'
                        ? 'bg-amber-100 text-amber-800'
                        : order.state === 'STATE_08_DELIVERED' || order.state === 'STATE_09_COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.state === 'STATE_CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-[#03098F]'
                    }`}>
                      {ORDER_STATES_META[order.state]?.label || order.state}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {order.assignedVendorName ? (
                      <span className="font-semibold text-slate-800 text-xs">{order.assignedVendorName}</span>
                    ) : (
                      <span className="text-amber-600 font-semibold text-[11px]">Pending Rider</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrderForInspect(order)}
                      className="px-3 py-1.5 bg-[#03098F] text-white hover:bg-[#03098F]/90 rounded-lg font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Inspection & Operations Action Modal */}
      {selectedOrderForInspect && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold font-heading text-slate-900 flex items-center gap-2">
                  <span>Logistics Action: {selectedOrderForInspect.id}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedOrderForInspect.customerName} ({selectedOrderForInspect.customerPhone})
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForInspect(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Spatial Details */}
            <div className="p-4 bg-slate-50 rounded-2xl grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Hostel</span>
                <span className="font-semibold text-slate-800">{selectedOrderForInspect.hostelDomain}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Room & Floor</span>
                <span className="font-semibold text-slate-800">
                  {selectedOrderForInspect.roomIdentifier} (Floor {selectedOrderForInspect.floorIndex})
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Payable</span>
                <span className="font-mono font-extrabold text-[#03098F] text-sm">
                  ₦{selectedOrderForInspect.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Proof Slip Verification Box */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#03098F]">
                  Bank Transfer Payment Verification
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700">
                  Method: {selectedOrderForInspect.paymentMethod}
                </span>
              </div>

              {selectedOrderForInspect.paymentReceiptUrl ? (
                <div className="space-y-3">
                  <img
                    src={selectedOrderForInspect.paymentReceiptUrl}
                    alt="Receipt"
                    className="max-h-48 w-auto rounded-xl border border-slate-300 shadow-xs mx-auto"
                  />
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleVerify(selectedOrderForInspect.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Payment & Approve Order</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No payment slip attached by customer yet.</p>
              )}
            </div>

            {/* Vendor Roster Assignment Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#00AFD5]" />
                Dispatch to Campus Delivery Vendor
              </h4>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                >
                  <option value="">Select Campus Delivery Rider...</option>
                  {availableVendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.fullName} ({v.mobileNumber})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleAssign(selectedOrderForInspect.id)}
                  disabled={!selectedVendorId}
                  className="w-full sm:w-auto px-5 py-2 bg-[#03098F] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>

            {/* Hold Order Action */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Reason to hold (e.g., Unclear transaction ref)..."
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => handleHold(selectedOrderForInspect.id)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
              >
                Place on Hold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
