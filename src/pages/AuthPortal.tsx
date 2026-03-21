import { useState } from 'react'
import { KeyRound, CheckCircle2, AlertCircle, Loader2, Copy, Check } from 'lucide-react'
import { exchangeMagicLink, initiateDiscordOAuth } from '../lib/api'
import CodeBlock from '../components/CodeBlock'

type ExchangeResult = { token: string; jti: string; expires_at: string }

export default function AuthPortal() {
  const [magicToken, setMagicToken] = useState('')
  const [result, setResult] = useState<ExchangeResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const exchange = async () => {
    if (!magicToken.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await exchangeMagicLink(magicToken.trim())
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Exchange failed')
    } finally {
      setLoading(false)
    }
  }

  const copyToken = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="w-5 h-5 text-accent-green" />
          <h1 className="text-2xl font-bold text-text-primary">Auth Portal</h1>
        </div>
        <p className="text-sm text-text-secondary">
          Exchange a magic link for a signed JWT, then use it as a bearer token with any MCP client.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: exchange form */}
        <div className="space-y-4">
          {/* Discord OAuth */}
          <div className="card border-accent-blue/20 bg-accent-blue/5">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Discord Login</h2>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              Sign in with your Discord account to automatically create a JWT token linked to your Discord identity.
              Perfect for seamless authentication.
            </p>
            <button
              onClick={initiateDiscordOAuth}
              className="btn-primary w-full justify-center bg-gradient-to-r from-accent-blue to-accent-purple hover:shadow-lg"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.042-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.294.074.074 0 0 1 .076-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.195.372.294a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.076.076 0 0 0-.041.107c.352.699.763 1.363 1.225 1.994a.077.077 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.057c.5-4.718-.838-8.812-3.551-12.456a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.968-2.419 2.157-2.419 1.194 0 2.169 1.095 2.157 2.42 0 1.333-.968 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.968-2.419 2.157-2.419 1.194 0 2.169 1.095 2.157 2.42 0 1.333-.963 2.418-2.157 2.418z" />
              </svg>
              Login with Discord
            </button>
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Magic link exchange</h2>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              Generate a magic link with <code className="font-mono text-text-code">auth_create_token</code> or{' '}
              <code className="font-mono text-text-code">caboose-mcp auth:create</code>, then paste the token below.
              Magic links expire in 15 minutes.
            </p>
            <label className="block text-xs text-text-muted mb-1.5 font-mono">Magic token</label>
            <input
              type="text"
              placeholder="abc123def456…:6ba7b810-9dad-…"
              value={magicToken}
              onChange={e => setMagicToken(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && exchange()}
              className="input text-xs font-mono mb-3"
            />
            <button
              onClick={exchange}
              disabled={loading || !magicToken.trim()}
              className="btn-primary w-full justify-center"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Exchanging…</>
                : <><KeyRound className="w-4 h-4" /> Get JWT</>
              }
            </button>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-accent-red/10 border border-accent-red/20 px-3 py-2 animate-slide-up">
                <AlertCircle className="w-3.5 h-3.5 text-accent-red mt-0.5 shrink-0" />
                <p className="text-xs text-accent-red">{error}</p>
              </div>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className="card border-accent-green/20 animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-accent-green" />
                <h3 className="text-sm font-semibold text-text-primary">JWT issued</h3>
              </div>
              <div className="space-y-2 text-xs text-text-secondary mb-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">JTI</span>
                  <code className="font-mono text-text-code">{result.jti.slice(0, 18)}…</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Expires</span>
                  <code className="font-mono text-text-code">{result.expires_at.split('T')[0]}</code>
                </div>
              </div>
              <div className="bg-bg-secondary rounded-lg p-3 font-mono text-xs text-text-code
                              break-all leading-relaxed mb-2">
                {result.token}
              </div>
              <button onClick={copyToken} className="btn-ghost w-full justify-center text-xs">
                {copied
                  ? <><Check className="w-3.5 h-3.5 text-accent-green" /> Copied!</>
                  : <><Copy className="w-3.5 h-3.5" /> Copy JWT</>
                }
              </button>
            </div>
          )}
        </div>

        {/* Right: usage guide */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-sm font-semibold text-text-primary mb-4">How to use</h2>

            <div className="space-y-4">
              <Step n={1} title="Create a scoped token">
                <p className="text-xs text-text-secondary mb-2">
                  Use the MCP tool or CLI to create a token with a specific tool allowlist:
                </p>
                <CodeBlock code={`# Via CLI\n./caboose-mcp auth:create \\\n  --label "my-client" \\\n  --tools "calendar_list,note_add,focus_start" \\\n  --google-scopes "calendar" \\\n  --expires 90\n\n# Via Claude\nauth_create_token(\n  label="my-client",\n  tools="calendar_list,note_add",\n  expires_days=90\n)`} />
              </Step>

              <Step n={2} title="Exchange the magic link">
                <p className="text-xs text-text-secondary mb-2">
                  Paste the token from the magic link URL into the form on the left, or use curl:
                </p>
                <CodeBlock code={`curl "https://mcp.chrismarasco.io\\\n  /auth/verify?token=<magic-token>"`} />
              </Step>

              <Step n={3} title="Add to .mcp.json">
                <p className="text-xs text-text-secondary mb-2">Connect Claude Code to your endpoint:</p>
                <CodeBlock code={`# ~/.claude/.mcp.json\n{\n  "mcpServers": {\n    "caboose": {\n      "url": "https://mcp.chrismarasco.io/mcp",\n      "headers": {\n        "Authorization": "Bearer eyJ..."\n      }\n    }\n  }\n}`} />
              </Step>

              <Step n={4} title="Link Discord / Slack identity (optional)">
                <p className="text-xs text-text-secondary mb-2">
                  SSO — messages from that user automatically use your JWT's tool ACL:
                </p>
                <CodeBlock code={`auth_link_identity(\n  jti="6ba7b810-...",\n  platform="discord",\n  platform_id="123456789"\n)`} />
              </Step>
            </div>
          </div>
        </div>
      </div>

      {/* Token tiers explanation */}
      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        {[
          {
            title: 'Full access token',
            desc: 'Empty tools list. Can call any tool. Use for trusted clients like Claude Code on your local machine.',
            color: 'border-accent-purple/20 bg-accent-purple/5',
            accent: 'text-accent-purple',
          },
          {
            title: 'Scoped token',
            desc: 'Explicit tool allowlist. Disallowed tools return a JSON-RPC error. Use for VS Code, web clients, third-party integrations.',
            color: 'border-accent-green/20 bg-accent-green/5',
            accent: 'text-accent-green',
          },
          {
            title: 'Google-scoped token',
            desc: "Add google_scopes='calendar' for read-only Calendar access. calendar_create and calendar_delete are blocked.",
            color: 'border-accent-blue/20 bg-accent-blue/5',
            accent: 'text-accent-blue',
          },
        ].map(t => (
          <div key={t.title} className={`rounded-xl border p-4 ${t.color}`}>
            <p className={`text-xs font-semibold mb-1 ${t.accent}`}>{t.title}</p>
            <p className="text-xs text-text-secondary leading-relaxed">{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-5 h-5 rounded-full bg-accent-green/15 border border-accent-green/30
                         text-accent-green text-xs font-mono flex items-center justify-center shrink-0">
          {n}
        </span>
        <span className="text-xs font-medium text-text-primary">{title}</span>
      </div>
      <div className="pl-7">{children}</div>
    </div>
  )
}
