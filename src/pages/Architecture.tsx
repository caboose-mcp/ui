export default function Architecture() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Architecture</h1>
          <p className="text-text-secondary">
            Complete overview of the Caboose MCP architecture and system design.
          </p>
        </div>

        {/* Embedded Gamma Slideshow */}
        <div className="rounded-lg overflow-hidden border border-border bg-bg-secondary">
          <iframe
            src="https://gamma.app/embed/docs/Caboose-MCP-Complete-Architecture-Overview-qinbza0qddhntpk"
            className="w-full h-screen"
            title="Caboose MCP Architecture Overview"
            allowFullScreen
            frameBorder="0"
          />
        </div>
      </div>
    </div>
  )
}
