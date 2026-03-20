/**
 * Skip to main content link
 * Provides keyboard navigation for screen reader users to jump directly to main content
 * Visible on focus for keyboard navigation accessibility
 */
export default function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50
                 focus:px-3 focus:py-2 focus:bg-accent-green focus:text-bg focus:rounded-md
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg focus:ring-accent-green"
    >
      Skip to main content
    </a>
  )
}
