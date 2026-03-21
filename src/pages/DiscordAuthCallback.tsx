import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

/**
 * Handles Discord OAuth callback.
 * The Discord OAuth flow:
 * 1. User clicks "Login with Discord" → redirects to /auth/discord/start
 * 2. Backend redirects to Discord consent page
 * 3. User authorizes → Discord redirects to /auth/discord/callback?code=...&state=...
 * 4. Backend exchanges code for token, links identity, creates JWT
 * 5. Backend redirects to /auth/callback?token=...&expires_at=...&username=...&discord_id=...
 * 6. This component captures the token from URL and stores it in localStorage
 * 7. Component redirects to /auth for user confirmation
 */
export default function DiscordAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const expiresAt = searchParams.get('expires_at')
    const username = searchParams.get('username')
    const discordId = searchParams.get('discord_id')

    if (!token || !expiresAt) {
      setStatus('error')
      setError('Missing token or expiry in callback URL')
      return
    }

    try {
      // Store token in localStorage (same as magic link flow)
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_expires_at', expiresAt)
      if (username) {
        localStorage.setItem('auth_username', username)
      }
      if (discordId) {
        localStorage.setItem('auth_discord_id', discordId)
      }

      setStatus('success')

      // Redirect to auth page after a short delay for UX
      setTimeout(() => {
        navigate('/auth', { replace: true })
      }, 1500)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to store token')
    }
  }, [searchParams, navigate])

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
      <div className="card space-y-4">
        {status === 'processing' && (
          <>
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-text-primary mb-1">
                Signing you in…
              </h2>
              <p className="text-sm text-text-secondary">
                Processing your Discord authorization
              </p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center">
              <CheckCircle2 className="w-8 h-8 text-accent-green" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-text-primary mb-1">
                Success!
              </h2>
              <p className="text-sm text-text-secondary">
                Your JWT token has been created. Redirecting…
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center">
              <AlertCircle className="w-8 h-8 text-accent-red" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-text-primary mb-2">
                Authorization failed
              </h2>
              <p className="text-sm text-text-secondary mb-4">{error}</p>
              <button
                onClick={() => navigate('/auth', { replace: true })}
                className="btn-secondary w-full justify-center"
              >
                Back to Auth
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
