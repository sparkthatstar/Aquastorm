export default function AuditLogViewer({ logs }: { logs: any[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left p-4 font-medium text-gray-500">Action</th>
            <th className="text-left p-4 font-medium text-gray-500">Actor</th>
            <th className="text-left p-4 font-medium text-gray-500">Target</th>
            <th className="text-left p-4 font-medium text-gray-500">Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr key={idx} className="border-b border-gray-50">
              <td className="p-4 capitalize">{log.action.replace(/_/g, ' ')}</td>
              <td className="p-4">{log.actor?.full_name || 'System'}</td>
              <td className="p-4 text-gray-500">{log.target_type}</td>
              <td className="p-4 text-gray-500 text-xs">{new Date(log.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
