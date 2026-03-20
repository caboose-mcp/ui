import { useState } from 'react'
import { ExternalLink, AlertCircle } from 'lucide-react'

const GAMMA_URLS = {
  primary: 'https://gamma.app/docs/Caboose-MCP-Complete-Architecture-Overview-qinbza0qddhntpk',
  alternative: 'https://gamma.app/docs/xwh277cvfvw4d2c',
}

export default function Architecture() {
  const [useAlternative, setUseAlternative] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const currentUrl = useAlternative ? GAMMA_URLS.alternative : GAMMA_URLS.primary
  const embedUrl = currentUrl.replace('/docs/', '/embed/docs/')

  const handleToggle = () => {
    setIsLoaded(false)
    setHasError(false)
    setUseAlternative(prev => !prev)
  }

  const handleIframeError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  return (
    <div className="min-h-screen bg-bg animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Architecture</h1>
          <p className="text-text-secondary mb-4">
            Complete overview of the Caboose MCP architecture and system design.
          </p>

          {/* URL Toggle for Fallback */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              className={`px-3 py-1.5 rounded-md text-sm transition-all duration-150
                          focus:outline-none focus:ring-2 focus:ring-accent-green/50 ${
                useAlternative
                  ? 'bg-bg-secondary border border-border-bright text-text-primary'
                  : 'bg-accent-green/10 border border-accent-green/30 text-accent-green'
              }`}
              title={`Switch to ${useAlternative ? 'primary' : 'alternative'} Gamma presentation`}
              aria-label={`Switch to ${useAlternative ? 'primary' : 'alternative'} Gamma presentation`}
              aria-pressed={useAlternative}
            >
              {useAlternative ? 'Alternative' : 'Primary'} Presentation
            </button>
            <span className="text-xs text-text-muted">
              {useAlternative ? '(Alternative URL)' : '(Main URL)'}
            </span>
          </div>
        </div>

        {/* Error State - Show when embed fails to load */}
        {hasError ? (
          <div className="rounded-lg overflow-hidden border border-border-bright bg-bg-secondary shadow-lg">
            <div className="p-8 flex flex-col items-center justify-center min-h-96">
              <AlertCircle className="w-12 h-12 text-accent-orange mb-4" />
              <h2 className="text-lg font-semibold text-text-primary mb-2">
                Unable to Load Presentation
              </h2>
              <p className="text-text-secondary text-sm mb-6 text-center max-w-md">
                The embedded presentation is temporarily unavailable. Please view it directly in Gamma.
              </p>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-green text-bg rounded-md
                           hover:bg-accent-green/90 focus:outline-none focus:ring-2
                           focus:ring-accent-green/50 transition-colors font-medium"
                aria-label="Open architecture overview in Gamma"
              >
                Open in Gamma
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          /* Embedded Gamma Slideshow */
          <div className="rounded-lg overflow-hidden border border-border bg-bg-secondary shadow-lg">
            <div className="relative w-full bg-black/20">
              {/* Loading overlay — hidden once iframe fires onLoad */}
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-secondary z-10 pointer-events-none">
                  <div className="text-center">
                    <p className="text-text-muted text-sm mb-2">Loading architecture overview...</p>
                  </div>
                </div>
              )}

              <iframe
                src={embedUrl}
                className="w-full h-screen"
                title="Caboose MCP Architecture Overview"
                allowFullScreen
                sandbox="allow-same-origin allow-scripts allow-popups allow-presentation allow-forms allow-top-navigation-by-user-activation"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                onError={handleIframeError}
              />
            </div>

            {/* Fallback Direct Link */}
            <div className="px-6 py-4 bg-bg-secondary border-t border-border">
              <p className="text-xs text-text-muted mb-2">
                If the embedded presentation has issues loading, you can:
              </p>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-accent-green
                           hover:text-accent-green/80 focus:outline-none focus:ring-2
                           focus:ring-accent-green/50 rounded-md transition-colors"
                aria-label="Open architecture overview in new window"
              >
                Open in new window
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-bg-secondary border border-border rounded-lg">
          <h2 className="text-sm font-semibold text-text-primary mb-2">About This Architecture</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            This interactive presentation provides a comprehensive overview of the Caboose MCP system,
            including component architecture, data flows, integration points, and design patterns.
            If you experience loading issues, try switching to the alternative presentation or
            opening in a new window for the best experience.
          </p>
        </div>
      </div>
    </div>
  )
}
