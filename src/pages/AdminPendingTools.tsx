import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { callMCPTool } from '../lib/api'

interface PendingTool {
  name: string
  description: string
  category: string
  tier: string
  created_by: string
  created_at: string
  last_test_at?: string
  last_test_result?: string
}

export default function AdminPendingTools() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [pendingTools, setPendingTools] = useState<PendingTool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approving, setApproving] = useState<string | null>(null)

  useEffect(() => {
    loadPendingTools()
  }, [])

  const loadPendingTools = async () => {
    try {
      setIsLoading(true)
      const result = await callMCPTool('repo_list_pending_tools', {})
      if (result.success) {
        // Parse the text output to extract tool info
        // This is a simplified version; full implementation would parse the formatted output
        setPendingTools([])
      } else {
        setError(result.error || 'Failed to load pending tools')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending tools')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveTool = async (toolName: string) => {
    try {
      setApproving(toolName)
      const result = await callMCPTool('repo_approve_tool', {
        tool_name: toolName,
        approver_notes: 'Approved via UI',
      })

      if (result.success) {
        setPendingTools(pendingTools.filter((t) => t.name !== toolName))
      } else {
        setError(result.error || 'Failed to approve tool')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve tool')
    } finally {
      setApproving(null)
    }
  }

  const handleRejectTool = async (toolName: string) => {
    if (!confirm(`Reject tool "${toolName}"? This cannot be undone.`)) {
      return
    }

    try {
      const result = await callMCPTool('repo_reject_tool', {
        tool_name: toolName,
        reason: 'Rejected via UI',
      })

      if (result.success) {
        setPendingTools(pendingTools.filter((t) => t.name !== toolName))
      } else {
        setError(result.error || 'Failed to reject tool')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject tool')
    }
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view pending tools</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Pending Tools</h1>
          <button
            onClick={() => navigate('/admin/create-tool')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
          >
            + Create Tool
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-400">Loading pending tools...</p>
          </div>
        ) : pendingTools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No pending tools</p>
            <button
              onClick={() => navigate('/admin/create-tool')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
            >
              Create your first tool
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTools.map((tool) => (
              <div
                key={tool.name}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white font-mono">{tool.name}</h2>
                    <p className="text-slate-300 mt-2">{tool.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        tool.tier === 'hosted'
                          ? 'bg-blue-900/50 text-blue-300'
                          : tool.tier === 'local'
                            ? 'bg-orange-900/50 text-orange-300'
                            : 'bg-purple-900/50 text-purple-300'
                      }`}
                    >
                      {tool.tier}
                    </span>
                    <span className="px-3 py-1 rounded text-sm font-medium bg-slate-700 text-slate-300">
                      {tool.category}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-slate-400">Created by</p>
                    <p className="text-white font-mono">{tool.created_by}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Created</p>
                    <p className="text-white">{new Date(tool.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {tool.last_test_result && (
                  <div className="mb-4 p-3 bg-slate-700/50 rounded text-sm">
                    <p className="text-slate-300">
                      <span className="text-green-400">✅ Last test:</span> {tool.last_test_result}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApproveTool(tool.name)}
                    disabled={approving === tool.name}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded font-medium"
                  >
                    {approving === tool.name ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleRejectTool(tool.name)}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => navigate(`/admin/test-tool/${tool.name}`)}
                    className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded font-medium"
                  >
                    Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
