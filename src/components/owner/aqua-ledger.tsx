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
  const [loading, setLoading] = useState(false)

  // Manual entry form state
  const [entryType, setEntryType] = useState<'credit' | 'debit'>('credit')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [amount, setAmount] = useState(0)
  const [isStockPurchase, setIsStockPurchase] = useState(false)

  // Stock transfer state
  const [transferVendor, setTransferVendor] = useState('')
  const [transferQty, setTransferQty] = useState(0)
  const [unstockVendor, setUnstockVendor] = useState('')
  const [unstockQty, setUnstockQty] = useState(0)

  async function fetchData() {
    // Fetch ledger entries
    const { data: ledgerData } = await supabase
      .from('aqualedger_entries')
      .select('*')
      .order('entry_date', { ascending: false })
      .limit(50)
    
    if (ledgerData) setEntries(ledgerData)

    // Fetch summary
    const { data: summaryData } = await supabase.rpc('get_ledger_summary')
    if (summaryData) setSummary(summaryData)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleLogEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!category.trim()) return alert('Please enter a transaction type/category.')
    if (amount <= 0) return alert('Amount must be greater than 0.')

    setLoading(true)
    const { error } = await supabase.rpc('log_ledger_entry', {
      p_entry_type: entryType,
      p_category: category.trim(),
      p_description: description.trim() || null,
      p_quantity: Number(quantity),
      p_amount: Number(amount),
      p_is_stock_purchase: isStockPurchase
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('Ledger entry logged successfully!')
      setCategory('')
      setDescription('')
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

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert(`Successfully transferred ${transferQty} bags to vendor!`)
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

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert(`Successfully unstocked ${unstockQty} bags from vendor!`)
      setUnstockVendor('')
      setUnstockQty(0)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDeleteEntry(id: string) {
    if (!confirm('Delete this ledger entry? This cannot be undone.')) return
    const { error } = await supabase.from('aqualedger_entries').delete().eq('id', id)
    if (error) alert(error.message)
    router.refresh()
  }

  const isProfit = summary.profit >= 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-500 text-white rounded-xl p-4 shadow-md">
          <p className="text-xs uppercase font-medium opacity-80">Total Revenue (Credit)</p>
          <p className="text-2xl font-bold mt-1">₦{Number(summary.total_credit).toLocaleString()}</p>
        </div>
        <div className="bg-red-500 text-white rounded-xl p-4 shadow-md">
          <p className="text-xs uppercase font-medium opacity-80">Total Expenses (Debit)</p>
          <p className="text-2xl font-bold mt-1">₦{Number(summary.total_debit).toLocaleString()}</p>
        </div>
        <div className={`${isProfit ? 'bg-cyan-600' : 'bg-orange-600'} text-white rounded-xl p-4 shadow-md`}>
          <p className="text-xs uppercase font-medium opacity-80">{isProfit ? 'Profit' : 'Loss'}</p>
          <p className="text-2xl font-bold mt-1">₦{Math.abs(Number(summary.profit)).toLocaleString()}</p>
        </div>
      </div>

      {/* Aqua Store + Stock Transfers */}
      <div className="bg-white/80 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Aqua Store (Central Stock)</h2>
          <span className="text-2xl font-bold text-cyan-700 bg-cyan-50 px-4 py-1 rounded-full">{storeStock} bags</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transfer to Vendor */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Stock Vendor (Aqua Store → Vendor)</h3>
            <select 
              value={transferVendor}
              onChange={(e) => setTransferVendor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm mb-2"
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
              placeholder="Quantity"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm mb-2"
            />
            <button 
              onClick={handleTransfer}
              disabled={loading}
              className="w-full bg-cyan-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50"
            >
              Transfer Stock
            </button>
          </div>

          {/* Unstock Vendor */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Unstock Vendor (Vendor → Aqua Store)</h3>
            <select 
              value={unstockVendor}
              onChange={(e) => setUnstockVendor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm mb-2"
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
              placeholder="Quantity"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm mb-2"
            />
            <button 
              onClick={handleUnstock}
              disabled={loading}
              className="w-full bg-orange-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              Unstock Vendor
            </button>
          </div>
        </div>

        {/* Vendor Stock Display */}
        <div className="mt-4">
          <h3 className="text-sm font-bold text-gray-800 mb-2">Vendor Stock Levels</h3>
          <div className="space-y-2">
            {vendors.map((v) => (
              <div key={v.profile_id} className="flex justify-between items-center bg-white rounded-lg p-2 border border-gray-100">
                <span className="text-sm font-medium text-gray-800">{v.name}</span>
                <span className="text-sm text-gray-600">Available: <span className="font-bold text-cyan-700">{v.available}</span> | Reserved: {v.reserved}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Ledger Entry Form */}
      <div className="bg-white/80 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Log Manual Entry</h2>
        <form onSubmit={handleLogEntry} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select 
              value={entryType}
              onChange={(e) => setEntryType(e.target.value as 'credit' | 'debit')}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
            >
              <option value="credit">Credit (Income)</option>
              <option value="debit">Debit (Expense)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <input 
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Transport, Maintenance, Misc Income"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <input 
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input 
              type="number"
              min="0"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
            <input 
              type="number"
              min="0"
              step="0.01"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
              required
            />
          </div>
          <div className="flex items-end">
            {entryType === 'debit' && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input 
                  type="checkbox"
                  checked={isStockPurchase}
                  onChange={(e) => setIsStockPurchase(e.target.checked)}
                  className="rounded"
                />
                This is a stock purchase (adds to Aqua Store)
              </label>
            )}
          </div>
          <div className="md:col-span-3">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-900 disabled:opacity-50"
            >
              {loading ? 'Logging...' : 'Log Entry'}
            </button>
          </div>
        </form>
      </div>

      {/* Ledger Entries (Balance Sheet) */}
      <div className="bg-white/80 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Ledger History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-500">Date</th>
                <th className="text-left p-3 font-medium text-gray-500">Type</th>
                <th className="text-left p-3 font-medium text-gray-500">Description</th>
                <th className="text-center p-3 font-medium text-gray-500">Qty</th>
                <th className="text-right p-3 font-medium text-green-600">Credit (₦)</th>
                <th className="text-right p-3 font-medium text-red-600">Debit (₦)</th>
                <th className="text-center p-3 font-medium text-gray-400">-</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400">No ledger entries yet.</td>
                </tr>
              )}
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3 text-gray-500 text-xs">{new Date(e.entry_date).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${e.entry_type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {e.category}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700">{e.description || '—'}</td>
                  <td className="p-3 text-center text-gray-500">{e.quantity || '—'}</td>
                  <td className="p-3 text-right font-bold text-green-600">{e.entry_type === 'credit' ? Number(e.amount).toLocaleString() : '—'}</td>
                  <td className="p-3 text-right font-bold text-red-600">{e.entry_type === 'debit' ? Number(e.amount).toLocaleString() : '—'}</td>
                  <td className="p-3 text-center">
                    {!e.related_order_id && (
                      <button onClick={() => handleDeleteEntry(e.id)} className="text-xs text-gray-400 hover:text-red-500">✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
