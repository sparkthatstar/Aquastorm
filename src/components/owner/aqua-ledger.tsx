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

  // Inventory inline state
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({})

  // Form state
  const today = new Date().toISOString().split('T')[0]
  const [entryType, setEntryType] = useState<'credit' | 'debit'>('credit')
  const [date, setDate] = useState(today)
  const [category, setCategory] = useState('Sales')
  const [customCategory, setCustomCategory] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [amount, setAmount] = useState(0)
  const [isStockPurchase, setIsStockPurchase] = useState(false)

  // Calculate Total Stock Value (Central + All Vendors)
  const totalVendorStock = vendors.reduce((sum, v) => sum + (Number(v.available) || 0) + (Number(v.reserved) || 0), 0)
  const totalStockValue = Number(storeStock) + totalVendorStock

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

  async function handleAddStock(vendorId: string) {
    const qty = parseInt(stockInputs[vendorId] || '0')
    if (qty <= 0) return alert('Please enter a valid quantity.')

    setLoading(true)
    const { error } = await supabase.rpc('transfer_stock_to_vendor', {
      p_vendor_id: vendorId,
      p_quantity: qty
    })

    if (error) alert('Error: ' + error.message)
    else {
      setStockInputs({ ...stockInputs, [vendorId]: '' })
      router.refresh()
    }
    setLoading(false)
  }

  async function handleRemoveStock(vendorId: string) {
    const qty = parseInt(stockInputs[vendorId] || '0')
    if (qty <= 0) return alert('Please enter a valid quantity.')

    setLoading(true)
    const { error } = await supabase.rpc('unstock_vendor', {
      p_vendor_id: vendorId,
      p_quantity: qty
    })

    if (error) alert('Error: ' + error.message)
    else {
      setStockInputs({ ...stockInputs, [vendorId]: '' })
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
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-900">Warehouse & Vendor Inventory</h2>
          <div className="flex gap-6 items-center">
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-medium">Central Store</p>
              <p className="text-xl font-bold text-cyan-700">{storeStock} bags</p>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-medium">Total Stock Value</p>
              <p className="text-xl font-bold text-gray-900">{totalStockValue} bags</p>
            </div>
          </div>
        </div>

        {/* Vendor Stock List Table */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-3 font-medium text-gray-500">Vendor Name</th>
                <th className="text-center p-3 font-medium text-gray-500">Reserved</th>
                <th className="text-center p-3 font-medium text-gray-500">Available</th>
                <th className="text-right p-3 font-medium text-gray-500">Stock Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400">No approved vendors found.</td>
                </tr>
              )}
              {vendors.map((v) => (
                <tr key={v.profile_id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-800">{v.name}</td>
                  <td className="p-3 text-center text-gray-600">{v.reserved || 0}</td>
                  <td className="p-3 text-center font-bold text-cyan-700">{v.available || 0}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 justify-end">
                      <input 
                        type="number"
                        min="1"
                        value={stockInputs[v.profile_id] || ''}
                        onChange={(e) => setStockInputs({...stockInputs, [v.profile_id]: e.target.value})}
                        placeholder="Qty"
                        className="w-20 px-2 py-1 border border-gray-200 rounded-md text-sm bg-white"
                      />
                      <button 
                        onClick={() => handleAddStock(v.profile_id)}
                        disabled={loading}
                        className="bg-cyan-50 text-cyan-700 text-xs font-bold py-1.5 px-3 rounded-md hover:bg-cyan-100 disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button 
                        onClick={() => handleRemoveStock(v.profile_id)}
                        disabled={loading}
                        className="bg-orange-50 text-orange-700 text-xs font-bold py-1.5 px-3 rounded-md hover:bg-orange-100 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
