// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AquaLedger({ vendors, storeStock }: { vendors: any[]; storeStock: number }) {
  const supabase = createClient()
  const router = useRouter()
  
  const [entries, setEntries] = useState<any[]>([])
  const [summary, setSummary] = useState({ total_credit: 0, total_debit: 0, profit: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Inventory state
  const [transferVendor, setTransferVendor] = useState('')
  const [transferQty, setTransferQty] = useState(0)
  const [unstockVendor, setUnstockVendor] = useState('')
  const [unstockQty, setUnstockQty] = useState(0)

  // Form state
  const today = new Date().toISOString().split('T')[0]
  const [entryType, setEntryType] = useState<'credit' | 'debit'>('credit')
  const [date, setDate] = useState(today)
  const [category, setCategory] = useState('Sales')
  const [customCategory, setCustomCategory] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [amount, setAmount] = useState(0)
  const [isStockPurchase, setIsStockPurchase] = useState(false)

  async function fetchData() {
    const { data: ledgerData } = await supabase
      .from('aqualedger_entries')
      .select('*')
      .order('entry_date', { ascending: false })
    
    if (ledgerData) setEntries(ledgerData)

    const { data: summaryData } = await supabase.rpc('get_ledger_summary')
    if (summaryData) setSummary(summaryData)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleLogEntry(e: React.FormEvent) {
    e.preventDefault()
    const finalCategory = category === 'Custom' ? customCategory : category
    if (!finalCategory.trim()) return alert('Please enter a transaction type.')
    if (amount <= 0) return alert('Price/Amount must be greater than 0.')

    setLoading(true)
    const { error } = await supabase.rpc('log_ledger_entry', {
      p_entry_type: entryType,
      p_category: finalCategory.trim(),
      p_description: null,
      p_quantity: Number(quantity),
      p_amount: Number(amount),
      p_is_stock_purchase: isStockPurchase,
      p_entry_date: new Date(date).toISOString()
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setIsModalOpen(false)
      setCustomCategory('')
      setQuantity(0)
      setAmount(0)
      setIsStockPurchase(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleTransfer() {
    if (!transferVendor) return alert('Select a vendor')
    if (transferQty <= 0) return alert('Quantity must be greater than 0')

    setLoading(true)
    const { error } = await supabase.rpc('transfer_stock_to_vendor', {
      p_vendor_id: transferVendor,
      p_quantity: Number(transferQty)
    })

    if (error) alert('Error: ' + error.message)
    else {
      setTransferVendor('')
      setTransferQty(0)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleUnstock() {
    if (!unstockVendor) return alert('Select a vendor')
    if (unstockQty <= 0) return alert('Quantity must be greater than 0')

    setLoading(true)
    const { error } = await supabase.rpc('unstock_vendor', {
      p_vendor_id: unstockVendor,
      p_quantity: Number(unstockQty)
    })

    if (error) alert('Error: ' + error.message)
    else {
      setUnstockVendor('')
      setUnstockQty(0)
      router.refresh()
    }
    setLoading(false)
  }

  const isProfit = summary.profit >= 0
  const debitEntries = entries.filter(e => e.entry_type === 'debit')
  const creditEntries = entries.filter(e => e.entry_type === 'credit')

  return (
    <div className="space-y-8">
      
      {/* === AQUA LEDGER BOOK === */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">📒 Aqua Ledger</h2>
          <div className={`px-4 py-2 rounded-full font-bold text-sm ${isProfit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isProfit ? 'Profit' : 'Loss'}: ₦{Math.abs(Number(summary.profit)).toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-gray-200">
          {/* Debit Side (Left) */}
          <div className="p-4 bg-red-50/30">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-red-200">
              <h3 className="font-bold text-red-700">Debit (Expenses)</h3>
              <span className="text-sm font-bold text-red-600">-₦{Number(summary.total_debit).toLocaleString()}</span>
            </div>
            <div className="space-y-3 text-sm">
              {debitEntries.length === 0 && <p className="text-gray-400 text-center py-4">No entries</p>}
              {debitEntries.map((e) => (
                <div key={e.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{e.category}</p>
                    <p className="text-xs text-gray-500">{new Date(e.entry_date).toLocaleDateString()} {e.quantity > 0 && `• Qty: ${e.quantity}`}</p>
                  </div>
                  <p className="font-bold text-red-600">₦{Number(e.amount).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Credit Side (Right) */}
          <div className="p-4 bg-green-50/30">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-green-200">
              <h3 className="font-bold text-green-700">Credit (Income)</h3>
              <span className="text-sm font-bold text-green-600">+₦{Number(summary.total_credit).toLocaleString()}</span>
            </div>
            <div className="space-y-3 text-sm">
              {creditEntries.length === 0 && <p className="text-gray-400 text-center py-4">No entries</p>}
              {creditEntries.map((e) => (
                <div key={e.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{e.category}</p>
                    <p className="text-xs text-gray-500">{new Date(e.entry_date).toLocaleDateString()} {e.quantity > 0 && `• Qty: ${e.quantity}`}</p>
                  </div>
                  <p className="font-bold text-green-600">₦{Number(e.amount).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Log Button */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-cyan-600 font-semibold text-sm hover:underline"
          >
            + add log
          </button>
        </div>
      </div>

      {/* === INVENTORY MANAGEMENT === */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Warehouse & Vendor Inventory</h2>
          <div className="bg-cyan-50 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-cyan-700">Aqua Store (Central): </span>
            <span className="text-lg font-bold text-cyan-900">{storeStock} bags</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Transfer to Vendor */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Stock Vendor (Central → Vendor)</h3>
            <select 
              value={transferVendor}
              onChange={(e) => setTransferVendor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm mb-2 bg-white"
            >
              <option value="">Select Vendor...</option>
              {vendors.map((v) => (
                <option key={v.profile_id} value={v.profile_id}>{v.name}</option>
              ))}
            </select>
            <input 
              type="number"
              min="1"
              value={transferQty || ''}
              onChange={(e) => setTransferQty(parseInt(e.target.value))}
              placeholder="Quantity to transfer"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm mb-3 bg-white"
            />
            <button 
              onClick={handleTransfer}
              disabled={loading}
              className="w-full bg-cyan-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50"
            >
              Send Stock
            </button>
          </div>

          {/* Unstock Vendor */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Unstock Vendor (Vendor → Central)</h3>
            <select 
              value={unstockVendor}
              onChange={(e) => setUnstockVendor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm mb-2 bg-white"
            >
              <option value="">Select Vendor...</option>
              {vendors.map((v) => (
                <option key={v.profile_id} value={v.profile_id}>{v.name}</option>
              ))}
            </select>
            <input 
              type="number"
              min="1"
              value={unstockQty || ''}
              onChange={(e) => setUnstockQty(parseInt(e.target.value))}
              placeholder="Quantity to reclaim"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm mb-3 bg-white"
            />
            <button 
              onClick={handleUnstock}
              disabled={loading}
              className="w-full bg-orange-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              Reclaim Stock
            </button>
          </div>
        </div>

        {/* Vendor Stock List */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Vendor Stock Levels</h3>
          <div className="space-y-2">
            {vendors.map((v) => (
              <div key={v.profile_id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="font-medium text-gray-800">{v.name}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">Reserved: <b className="text-gray-700">{v.reserved}</b></span>
                  <span className="text-gray-500">Available: <b className="text-cyan-700">{v.available}</b></span>
                </div>
              </div>
            ))}
            {vendors.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No approved vendors yet.</p>}
          </div>
        </div>
      </div>

      {/* === ADD LOG MODAL === */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Ledger Log</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleLogEntry} className="space-y-4">
              <div className="flex gap-4">
                <label className="flex-1 flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={entryType === 'credit'} onChange={() => setEntryType('credit')} />
                  <span className="text-sm font-medium text-green-600">Credit (Income)</span>
                </label>
                <label className="flex-1 flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={entryType === 'debit'} onChange={() => setEntryType('debit')} />
                  <span className="text-sm font-medium text-red-600">Debit (Expense)</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm mb-2"
                >
                  <option>Sales</option>
                  <option>Stock Up</option>
                  <option>Vendor Pay</option>
                  <option>Custom</option>
                </select>
                {category === 'Custom' && (
                  <input 
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Type custom transaction name"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Bags)</label>
                  <input 
                    type="number"
                    min="0"
                    value={quantity || ''}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price/Amount (₦)</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                  />
                </div>
              </div>

              {entryType === 'debit' && (
                <label className="flex items-center gap-2 text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                  <input 
                    type="checkbox"
                    checked={isStockPurchase}
                    onChange={(e) => setIsStockPurchase(e.target.checked)}
                    className="rounded"
                  />
                  This is a stock purchase (Adds quantity to Central Aqua Store)
                </label>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-900 disabled:opacity-50 mt-2"
              >
                {loading ? 'Saving...' : 'Save Log'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
