import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { TOOLS } from '../data/tools'
import ToolCard from './ToolCard'

export default function Spotlight() {
  const highlightedTools = TOOLS.filter(t => t.highlighted)

  if (highlightedTools.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-accent-green" />
        <h2 className="text-xl font-semibold text-text-primary">Spotlight</h2>
      </div>
      <p className="text-sm text-text-secondary mb-8">
        Featured tools worth trying out.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlightedTools.map(tool => (
          <Link
            key={tool.name}
            to={`/tools/${tool.name}`}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-green/20 to-accent-green/5
                            rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <ToolCard tool={tool} />
          </Link>
        ))}
      </div>
    </section>
  )
}
