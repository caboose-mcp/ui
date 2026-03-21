import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { callMCPTool } from '../lib/api'

interface ToolParameter {
  name: string
  type: 'string' | 'number' | 'boolean'
  required: boolean
  description: string
}

export default function AdminCreateTool() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'dev',
    tier: 'hosted' as 'hosted' | 'local' | 'both',
    tags: '',
    parameters: [] as ToolParameter[],
  })

  const [newParam, setNewParam] = useState<ToolParameter>({
    name: '',
    type: 'string',
    required: false,
    description: '',
  })

  const handleAddParameter = () => {
    if (!newParam.name.trim()) {
      setError('Parameter name is required')
      return
    }
    setFormData({
      ...formData,
      parameters: [...formData.parameters, { ...newParam }],
    })
    setNewParam({ name: '', type: 'string', required: false, description: '' })
    setError(null)
  }

  const handleRemoveParameter = (index: number) => {
    setFormData({
      ...formData,
      parameters: formData.parameters.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!formData.name.trim()) {
        throw new Error('Tool name is required')
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required')
      }

      const result = await callMCPTool('repo_create_tool', {
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        description: formData.description,
        category: formData.category,
        tier: formData.tier,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean).join(','),
        parameters_json: JSON.stringify(formData.parameters),
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/admin/pending-tools')
        }, 2000)
      } else {
        throw new Error(result.error || 'Failed to create tool')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tool')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to create tools</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Create New Tool</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500 rounded-lg text-green-300">
            ✅ Tool created! Redirecting to pending tools...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tool Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="my_tool (snake_case)"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this tool do?"
                rows={4}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="dev">Development</option>
                  <option value="automation">Automation</option>
                  <option value="data">Data</option>
                  <option value="integration">Integration</option>
                  <option value="misc">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tier
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="hosted">Hosted (Cloud-safe)</option>
                  <option value="local">Local (Hardware)</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Parameters</h2>

            <div className="space-y-4">
              {formData.parameters.length > 0 && (
                <div className="space-y-2">
                  {formData.parameters.map((param, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-700/50 p-3 rounded"
                    >
                      <div className="flex-1">
                        <p className="font-mono text-sm text-blue-300">
                          {param.name}: <span className="text-slate-400">{param.type}</span>
                          {param.required && <span className="text-red-400"> *</span>}
                        </p>
                        <p className="text-xs text-slate-400">{param.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveParameter(idx)}
                        className="ml-4 px-3 py-1 bg-red-900/50 hover:bg-red-900 text-red-300 rounded text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-slate-700/50 p-4 rounded space-y-3">
                <h3 className="text-sm font-medium text-slate-300">Add Parameter</h3>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newParam.name}
                    onChange={(e) => setNewParam({ ...newParam, name: e.target.value })}
                    placeholder="Parameter name"
                    className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none"
                  />
                  <select
                    value={newParam.type}
                    onChange={(e) =>
                      setNewParam({
                        ...newParam,
                        type: e.target.value as 'string' | 'number' | 'boolean',
                      })
                    }
                    className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                  </select>
                </div>

                <input
                  type="text"
                  value={newParam.description}
                  onChange={(e) => setNewParam({ ...newParam, description: e.target.value })}
                  placeholder="Description"
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newParam.required}
                    onChange={(e) => setNewParam({ ...newParam, required: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="required" className="text-sm text-slate-300">
                    Required
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleAddParameter}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                >
                  Add Parameter
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded font-medium"
            >
              {isLoading ? 'Creating...' : 'Create Tool'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
