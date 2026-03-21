export type ServerStats = {
  total: number
}

export async function fetchStats(): Promise<ServerStats> {
  const res = await fetch(`${API_BASE}/api/stats`)
  if (!res.ok) throw new Error(res.statusText)
  return res.json() as Promise<ServerStats>
}

export type SandboxRequest = {
  tool: string
  args: Record<string, unknown>
}

export type SandboxResponse = {
  output: string
  error?: string
  duration_ms: number
}

// In production VITE_API_BASE points to https://mcp.chrismarasco.io.
// In dev the Vite proxy rewrites /api and /auth to http://localhost:8080.
const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function runSandboxTool(req: SandboxRequest): Promise<SandboxResponse> {
  const res = await fetch(`${API_BASE}/api/sandbox`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }

  return res.json() as Promise<SandboxResponse>
}

export async function exchangeMagicLink(token: string): Promise<{
  token: string
  jti: string
  expires_at: string
}> {
  const url = new URL('/auth/verify', API_BASE || window.location.origin)
  url.searchParams.set('token', token)

  const res = await fetch(url.toString())
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText })) as { error?: string }
    throw new Error(data.error ?? res.statusText)
  }
  return res.json()
}

/**
 * Initiates Discord OAuth login flow.
 * This function redirects the user to Discord's OAuth consent page.
 * After user authorizes, Discord redirects back to /auth/discord/callback,
 * which in turn redirects to /auth/callback with the token in query params.
 */
export function initiateDiscordOAuth(): void {
  const redirectUri = `${window.location.origin}/auth/discord/callback`
  const params = new URLSearchParams({ redirect_uri: redirectUri })
  window.location.href = `${API_BASE || window.location.origin}/auth/discord/start?${params}`
}
