import { ExternalLink, Presentation } from 'lucide-react'

const GAMMA_URL_PRIMARY = 'https://gamma.app/docs/Caboose-MCP-Complete-Architecture-Overview-qinbza0qddhntpk'
const GAMMA_URL_ALTERNATIVE = 'https://gamma.app/docs/xwh277cvfvw4d2c'

export default function Architecture() {
  return (
    <div className="min-h-screen bg-bg animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Architecture</h1>
          <p className="text-text-secondary mb-4">
            Complete overview of the Caboose MCP architecture and system design.
          </p>
        </div>

        {/* Link Card */}
        <div className="card-glow border border-border bg-bg-secondary shadow-lg rounded-lg overflow-hidden hover:border-border-bright transition-all mb-8">
          <div className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <Presentation className="w-8 h-8 text-accent-green flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">
                  Architecture Overview
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  Our interactive Gamma presentation provides a comprehensive walkthrough of the Caboose MCP system,
                  including component architecture, data flows, integration points, and design patterns.
                  View it directly for the best experience.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={GAMMA_URL_PRIMARY}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                aria-label="Open architecture overview in Gamma"
              >
                Open Presentation
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href={GAMMA_URL_ALTERNATIVE}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
                aria-label="Open alternative architecture view"
              >
                Alternative View
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="p-4 bg-bg-secondary border border-border rounded-lg">
          <h2 className="text-sm font-semibold text-text-primary mb-2">About This Architecture</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            This interactive presentation provides a comprehensive overview of the Caboose MCP system,
            including component architecture, data flows, integration points, and design patterns.
            Choose between the primary or alternative presentation to view the full system design.
          </p>
        </div>
      </div>
    </div>
  )
}
