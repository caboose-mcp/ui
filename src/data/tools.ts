export type ParamDef = {
  name: string
  type: 'string' | 'number' | 'boolean'
  required: boolean
  description: string
  default?: string
}

export type ToolDef = {
  name: string
  category: string
  description: string
  params: ParamDef[]
  example?: { input: Record<string, unknown>; output: string }
  sandboxable?: boolean
  tier: 'hosted' | 'local' | 'both'
  tags?: string[]
  highlighted?: boolean
}

export const CATEGORIES = [
  { id: 'all', label: 'All Tools', color: 'text-text-secondary' },
  { id: 'calendar', label: 'Calendar', color: 'text-blue-400' },
  { id: 'notes', label: 'Notes', color: 'text-yellow-400' },
  { id: 'focus', label: 'Focus', color: 'text-purple-400' },
  { id: 'learning', label: 'Learning', color: 'text-cyan-400' },
  { id: 'auth', label: 'Auth & RBAC', color: 'text-green-400' },
  { id: 'github', label: 'GitHub', color: 'text-slate-300' },
  { id: 'slack', label: 'Slack', color: 'text-green-300' },
  { id: 'discord', label: 'Discord', color: 'text-indigo-400' },
  { id: 'database', label: 'Database', color: 'text-orange-400' },
  { id: 'docker', label: 'Docker', color: 'text-blue-300' },
  { id: 'system', label: 'System', color: 'text-red-400' },
  { id: 'printing', label: '3D Printing', color: 'text-pink-400' },
  { id: 'selfimprove', label: 'Self-Improve', color: 'text-emerald-400' },
  { id: 'sources', label: 'Sources', color: 'text-amber-400' },
  { id: 'health', label: 'Health', color: 'text-teal-400' },
  { id: 'cloudsync', label: 'Cloud Sync', color: 'text-sky-400' },
  { id: 'chezmoi', label: 'Chezmoi', color: 'text-violet-400' },
  { id: 'toolsmith', label: 'Toolsmith', color: 'text-rose-400' },
  { id: 'sandbox', label: 'Sandbox', color: 'text-lime-400' },
  { id: 'audit', label: 'Audit', color: 'text-orange-300' },
  { id: 'env', label: 'Environment', color: 'text-lime-300' },
  { id: 'agency', label: 'Agency', color: 'text-fuchsia-400' },
  { id: 'claude', label: 'Claude Files', color: 'text-amber-300' },
  { id: 'misc', label: 'Misc', color: 'text-slate-400' },
]

export const TOOLS: ToolDef[] = [
  // ── Calendar ──────────────────────────────────────────────────────────────
  {
    name: 'calendar_today',
    category: 'calendar',
    tier: 'hosted',
    tags: ['date', 'time', 'read-only'],
    description: 'Return today\'s date, day of week, ISO week number, current time, and Unix timestamp.',
    params: [],
    sandboxable: true,
    example: {
      input: {},
      output: `Date:    2026-03-19\nDay:     Thursday\nWeek:    12\nTime:    14:32:07 UTC\nUnix:    1742394727`,
    },
  },
  {
    name: 'calendar_list',
    category: 'calendar',
    tier: 'hosted',
    tags: ['events', 'google'],
    description: 'List upcoming Google Calendar events for a date range.',
    params: [
      { name: 'days', type: 'number', required: false, description: 'How many days ahead to look (default 7, max 90)', default: '7' },
      { name: 'calendar_id', type: 'string', required: false, description: 'Calendar ID to query', default: 'primary' },
    ],
    example: {
      input: { days: 7 },
      output: `Upcoming events (next 7 days):\n\n• Team standup\n  ID: abc123xyz\n  2026-03-20T09:00:00Z → 2026-03-20T09:30:00Z\n\n• Sprint review\n  ID: def456uvw\n  2026-03-22T14:00:00Z → 2026-03-22T15:00:00Z`,
    },
  },
  {
    name: 'calendar_create',
    category: 'calendar',
    tier: 'hosted',
    tags: ['events', 'google', 'write'],
    description: 'Create a Google Calendar event with title, start/end times, and optional description.',
    params: [
      { name: 'title', type: 'string', required: true, description: 'Event title' },
      { name: 'start', type: 'string', required: true, description: 'Start time: RFC3339 or \'YYYY-MM-DD HH:MM\'' },
      { name: 'end', type: 'string', required: false, description: 'End time (same formats). Defaults to 1 hour after start.' },
      { name: 'details', type: 'string', required: false, description: 'Event description/notes' },
      { name: 'calendar_id', type: 'string', required: false, description: 'Calendar ID (default: primary)' },
    ],
    example: {
      input: { title: 'Sprint planning', start: '2026-03-25 10:00', end: '2026-03-25 11:00' },
      output: `Event created: "Sprint planning" (ID: abc789)\nMon Mar 25 10:00 → Mon Mar 25 11:00`,
    },
  },
  {
    name: 'calendar_delete',
    category: 'calendar',
    tier: 'hosted',
    tags: ['events', 'google', 'write'],
    description: 'Delete a Google Calendar event by its ID.',
    params: [
      { name: 'event_id', type: 'string', required: true, description: 'Event ID from calendar_list' },
      { name: 'calendar_id', type: 'string', required: false, description: 'Calendar ID (default: primary)' },
    ],
    example: { input: { event_id: 'abc123xyz' }, output: 'Event abc123xyz deleted.' },
  },
  {
    name: 'calendar_auth_url',
    category: 'calendar',
    tier: 'hosted',
    tags: ['oauth', 'setup'],
    description: 'Generate the Google Calendar OAuth2 consent URL. Visit it in a browser, then paste the code into calendar_auth_complete.',
    params: [],
    example: {
      input: {},
      output: `Visit this URL to authorize Google Calendar:\n\nhttps://accounts.google.com/o/oauth2/v2/auth?...\n\nThen: calendar_auth_complete(code="4/0Adeu5...")`,
    },
  },
  {
    name: 'calendar_auth_complete',
    category: 'calendar',
    tier: 'hosted',
    tags: ['oauth', 'setup'],
    description: 'Complete Google Calendar OAuth2 setup by exchanging the authorization code for a token.',
    params: [
      { name: 'code', type: 'string', required: true, description: 'Authorization code from the Google consent URL' },
    ],
    example: { input: { code: '4/0Adeu5...' }, output: 'Google Calendar authorized. Token saved to ~/.claude/google/calendar-token.json.' },
  },

  // ── Notes ──────────────────────────────────────────────────────────────────
  {
    name: 'note_add',
    category: 'notes',
    tier: 'hosted',
    tags: ['write'],
    description: 'Append a quick note to CLAUDE_DIR/notes.md with a timestamp and optional tag.',
    params: [
      { name: 'text', type: 'string', required: true, description: 'Note content' },
      { name: 'tag', type: 'string', required: false, description: 'Optional tag/category (e.g. idea, todo, bug)' },
    ],
    example: { input: { text: 'Investigate JWT refresh token rotation', tag: 'todo' }, output: 'Note saved.' },
  },
  {
    name: 'note_list',
    category: 'notes',
    tier: 'hosted',
    tags: ['read-only'],
    description: 'List recent notes from CLAUDE_DIR/notes.md with optional tag filter.',
    params: [
      { name: 'tag', type: 'string', required: false, description: 'Filter by tag (optional)' },
    ],
    example: {
      input: { tag: 'todo' },
      output: `- [2026-03-19 14:30] #todo Investigate JWT refresh token rotation\n- [2026-03-18 09:15] #todo Add rate limiting to /api/sandbox`,
    },
  },
  {
    name: 'notes_drive_backup',
    category: 'notes',
    tier: 'hosted',
    tags: ['google', 'backup', 'write'],
    description: 'Upload the local notes.md to Google Drive as \'caboose-notes.md\'. Requires Google Calendar auth.',
    params: [],
    example: { input: {}, output: 'Notes backed up to Google Drive as "caboose-notes.md" (2847 bytes).' },
  },
  {
    name: 'notes_drive_restore',
    category: 'notes',
    tier: 'hosted',
    tags: ['google', 'backup'],
    description: 'Download \'caboose-notes.md\' from Google Drive, overwriting the local notes.md.',
    params: [],
    example: { input: {}, output: 'Notes restored from Google Drive (2847 bytes).' },
  },

  // ── Focus ──────────────────────────────────────────────────────────────────
  {
    name: 'focus_start',
    category: 'focus',
    tier: 'hosted',
    tags: ['adhd', 'productivity'],
    description: 'Start a timed focus session with a specific goal. Saves session to disk for persistence.',
    params: [
      { name: 'goal', type: 'string', required: true, description: 'What you\'re focusing on' },
      { name: 'duration', type: 'number', required: false, description: 'Duration in minutes (default 25)', default: '25' },
    ],
    example: {
      input: { goal: 'Implement JWT auth middleware', duration: 45 },
      output: `Focus session started!\nGoal: Implement JWT auth middleware\nDuration: 45 min\nEnds: 15:17 UTC\nSession ID: focus-2026-03-19`,
    },
  },
  {
    name: 'focus_status',
    category: 'focus',
    tier: 'hosted',
    tags: ['adhd', 'read-only'],
    description: 'Check the active focus session — time remaining, goal, and parked thoughts.',
    params: [],
    example: {
      input: {},
      output: `Active focus session\nGoal: Implement JWT auth middleware\nTime remaining: 38m 12s\nParked thoughts: 2`,
    },
  },
  {
    name: 'focus_park',
    category: 'focus',
    tier: 'hosted',
    tags: ['adhd', 'write'],
    description: 'Park a distracting thought to a parking lot file so it doesn\'t break your focus.',
    params: [
      { name: 'thought', type: 'string', required: true, description: 'The thought or task to park' },
    ],
    example: { input: { thought: 'Look into Playwright for Google Messages' }, output: 'Thought parked. Stay focused!' },
  },
  {
    name: 'focus_end',
    category: 'focus',
    tier: 'hosted',
    tags: ['adhd'],
    description: 'End the active focus session and review parked thoughts.',
    params: [],
    example: { input: {}, output: `Focus session complete! 45 minutes on: Implement JWT auth middleware\n\nParked thoughts:\n- Look into Playwright for Google Messages\n- Update README badges` },
  },
  {
    name: 'focus_config',
    category: 'focus',
    tier: 'hosted',
    tags: ['adhd', 'config'],
    description: 'View or update focus session configuration (default duration, break reminders).',
    params: [
      { name: 'default_duration', type: 'number', required: false, description: 'Default session duration in minutes' },
    ],
    example: { input: {}, output: 'Focus config: default_duration=25, break_reminder=true' },
  },

  // ── Learning ───────────────────────────────────────────────────────────────
  {
    name: 'learn_start',
    category: 'learning',
    tier: 'hosted',
    tags: ['language', 'programming'],
    description: 'Start a new language learning session (spoken languages or programming languages).',
    params: [
      { name: 'language', type: 'string', required: true, description: 'Language to learn (e.g. Spanish, Japanese, Go, Rust)' },
    ],
    example: { input: { language: 'Japanese' }, output: `Session started!\nSession ID: jpn-2026-03-19\nLanguage: Japanese\nLevel: Beginner\nFirst exercise ready — use learn_exercise(session_id="jpn-2026-03-19")` },
  },
  {
    name: 'learn_exercise',
    category: 'learning',
    tier: 'hosted',
    tags: ['language'],
    description: 'Get the next exercise in an active learning session.',
    params: [
      { name: 'session_id', type: 'string', required: true, description: 'Session ID from learn_start' },
    ],
    example: { input: { session_id: 'jpn-2026-03-19' }, output: `Exercise 1/10\nTranslate: "Good morning"\nHint: It\'s a greeting used before noon` },
  },
  {
    name: 'learn_submit',
    category: 'learning',
    tier: 'hosted',
    tags: ['language', 'write'],
    description: 'Submit an answer for the current exercise and get feedback.',
    params: [
      { name: 'session_id', type: 'string', required: true, description: 'Session ID' },
      { name: 'answer', type: 'string', required: true, description: 'Your answer' },
    ],
    example: { input: { session_id: 'jpn-2026-03-19', answer: 'おはようございます' }, output: '✓ Correct! おはようございます (ohayou gozaimasu)\nScore: 1/1 | Streak: 3' },
  },
  {
    name: 'learn_status',
    category: 'learning',
    tier: 'hosted',
    tags: ['read-only'],
    description: 'Show current learning schedule, active sessions, and streak.',
    params: [],
    example: { input: {}, output: `Learning status:\nStreak: 7 days 🔥\n\nActive sessions:\n- Japanese (Beginner) — 3 exercises today\n- Go (Intermediate) — 1 exercise today` },
  },
  {
    name: 'learn_schedule',
    category: 'learning',
    tier: 'hosted',
    tags: ['config'],
    description: 'Show or update the learning schedule (days, time, sessions per day).',
    params: [],
    example: { input: {}, output: 'Schedule: daily at 09:00, 2 sessions per day, reminder enabled' },
  },

  // ── Auth & RBAC ────────────────────────────────────────────────────────────
  {
    name: 'auth_create_token',
    category: 'auth',
    tier: 'hosted',
    tags: ['jwt', 'rbac', 'write'],
    description: 'Create a JWT token with a specific tool allowlist and optional Google OAuth scopes. Returns a 15-minute magic link.',
    params: [
      { name: 'label', type: 'string', required: true, description: 'Friendly name for the token (e.g. vscode-alice)' },
      { name: 'tools', type: 'string', required: false, description: 'Comma-separated tool names (empty = all tools)' },
      { name: 'google_scopes', type: 'string', required: false, description: 'Comma-separated Google scopes (calendar = readonly)' },
      { name: 'expires_days', type: 'number', required: false, description: 'Days until expiry (default 30)', default: '30' },
    ],
    example: {
      input: { label: 'vscode-alice', tools: 'calendar_list,note_add,focus_start', expires_days: 90 },
      output: `Token created for "vscode-alice"\nJTI:     6ba7b810-9dad-11d1-80b4\nExpires: 2026-06-17\nTools:   calendar_list, note_add, focus_start\n\nMagic link (valid 15 min):\nhttp://localhost:8080/auth/verify?token=abc123def456...`,
    },
  },
  {
    name: 'auth_list_tokens',
    category: 'auth',
    tier: 'hosted',
    tags: ['jwt', 'rbac', 'read-only'],
    description: 'List all non-revoked JWT tokens with their label, allowed tools, and expiry date.',
    params: [],
    example: {
      input: {},
      output: `• vscode-alice\n  JTI: 6ba7b810-...\n  Expires: 2026-06-17\n  Tools: calendar_list, note_add, focus_start\n\n• discord-bot\n  JTI: 7cb8c921-...\n  Expires: 2026-04-19\n  Tools: all`,
    },
  },
  {
    name: 'auth_revoke_token',
    category: 'auth',
    tier: 'hosted',
    tags: ['jwt', 'rbac', 'write'],
    description: 'Revoke a JWT token by JTI. Takes effect immediately — no grace period.',
    params: [
      { name: 'jti', type: 'string', required: true, description: 'Token JTI to revoke' },
    ],
    example: { input: { jti: '6ba7b810-9dad-11d1-80b4' }, output: 'Token 6ba7b810-... revoked.' },
  },
  {
    name: 'auth_link_identity',
    category: 'auth',
    tier: 'hosted',
    tags: ['sso', 'discord', 'slack', 'write'],
    description: 'Link a Discord, Slack, or Google identity to a JWT token. Once linked, messages from that user automatically use the token\'s ACL.',
    params: [
      { name: 'jti', type: 'string', required: true, description: 'Token JTI to link to' },
      { name: 'platform', type: 'string', required: true, description: 'Platform: discord, slack, or google' },
      { name: 'platform_id', type: 'string', required: true, description: 'Platform user ID or email' },
    ],
    example: { input: { jti: '6ba7b810-...', platform: 'discord', platform_id: '123456789' }, output: 'Linked discord:123456789 → token 6ba7b810-...' },
  },
  {
    name: 'auth_list_identities',
    category: 'auth',
    tier: 'hosted',
    tags: ['sso', 'read-only'],
    description: 'List all identity → token mappings across Discord, Slack, and Google.',
    params: [],
    example: { input: {}, output: 'Linked identities:\n\n• discord:123456789 → 6ba7b810-... (vscode-alice)\n• slack:U0123ABCD → 6ba7b810-... (vscode-alice)' },
  },
  {
    name: 'auth_unlink_identity',
    category: 'auth',
    tier: 'hosted',
    tags: ['sso', 'write'],
    description: 'Remove an identity → token link.',
    params: [
      { name: 'platform', type: 'string', required: true, description: 'Platform: discord, slack, or google' },
      { name: 'platform_id', type: 'string', required: true, description: 'Platform user ID or email' },
    ],
    example: { input: { platform: 'discord', platform_id: '123456789' }, output: 'Unlinked discord:123456789.' },
  },

  // ── Secrets ────────────────────────────────────────────────────────────────
  {
    name: 'secret_set',
    category: 'misc',
    tier: 'hosted',
    tags: ['gpg', 'security', 'write'],
    description: 'GPG-encrypt and store a secret value at ~/.claude/secrets/<key>.gpg.',
    params: [
      { name: 'key', type: 'string', required: true, description: 'Secret identifier (e.g. GITHUB_TOKEN)' },
      { name: 'value', type: 'string', required: true, description: 'Secret value to encrypt' },
    ],
    example: { input: { key: 'MY_API_KEY', value: 'sk-abc123' }, output: 'Secret MY_API_KEY stored (GPG encrypted).' },
  },
  {
    name: 'secret_get',
    category: 'misc',
    tier: 'hosted',
    tags: ['gpg', 'security'],
    description: 'Decrypt and retrieve a stored secret.',
    params: [
      { name: 'key', type: 'string', required: true, description: 'Secret identifier' },
    ],
    example: { input: { key: 'MY_API_KEY' }, output: 'sk-abc123' },
  },
  {
    name: 'secret_list',
    category: 'misc',
    tier: 'hosted',
    tags: ['gpg', 'security', 'read-only'],
    description: 'List all stored secret keys (names only, not values).',
    params: [],
    example: { input: {}, output: 'Stored secrets:\n- MY_API_KEY\n- SLACK_TOKEN\n- GITHUB_PAT' },
  },

  // ── GitHub ─────────────────────────────────────────────────────────────────
  {
    name: 'github_list_repos',
    category: 'github',
    tier: 'hosted',
    tags: ['read-only'],
    description: 'List GitHub repositories for the authenticated user or a specified org.',
    params: [
      { name: 'org', type: 'string', required: false, description: 'GitHub org name (default: authenticated user)' },
      { name: 'limit', type: 'number', required: false, description: 'Max repos to return (default 20)', default: '20' },
    ],
    example: { input: {}, output: 'caboose-mcp (Go, 47 stars, updated 2026-03-19)\ncaboose-infra (HCL, private, updated 2026-03-10)' },
  },
  {
    name: 'github_create_pr',
    category: 'github',
    tier: 'hosted',
    tags: ['write'],
    description: 'Create a GitHub pull request using the gh CLI.',
    params: [
      { name: 'title', type: 'string', required: true, description: 'PR title' },
      { name: 'body', type: 'string', required: false, description: 'PR body/description' },
      { name: 'base', type: 'string', required: false, description: 'Base branch (default: main)', default: 'main' },
    ],
    example: { input: { title: 'feat: JWT RBAC auth' }, output: 'PR created: https://github.com/caboose-mcp/caboose-mcp/pull/8' },
  },
  {
    name: 'github_search_code',
    category: 'github',
    tier: 'hosted',
    tags: ['read-only'],
    description: 'Search code across GitHub repositories.',
    params: [
      { name: 'query', type: 'string', required: true, description: 'Search query (supports GitHub code search syntax)' },
    ],
    example: { input: { query: 'RunBotAgent repo:caboose-mcp/caboose-mcp' }, output: 'packages/server/tools/bot_agent.go:45' },
  },

  // ── Slack ──────────────────────────────────────────────────────────────────
  {
    name: 'slack_list_channels',
    category: 'slack',
    tier: 'hosted',
    tags: ['read-only'],
    description: 'List Slack channels the bot is a member of.',
    params: [],
    example: { input: {}, output: '#general (1,234 members)\n#dev-alerts (18 members)\n#ai-tools (42 members)' },
  },
  {
    name: 'slack_post_message',
    category: 'slack',
    tier: 'hosted',
    tags: ['write'],
    description: 'Post a message to a Slack channel.',
    params: [
      { name: 'channel', type: 'string', required: true, description: 'Channel name or ID (e.g. #general or C0123ABCD)' },
      { name: 'text', type: 'string', required: true, description: 'Message text (supports Slack mrkdwn)' },
    ],
    example: { input: { channel: '#dev-alerts', text: 'Deploy to ECS complete ✅' }, output: 'Message posted to #dev-alerts (ts: 1742394727.123456).' },
  },
  {
    name: 'slack_read_messages',
    category: 'slack',
    tier: 'hosted',
    tags: ['read-only'],
    description: 'Read recent messages from a Slack channel.',
    params: [
      { name: 'channel', type: 'string', required: true, description: 'Channel name or ID' },
      { name: 'limit', type: 'number', required: false, description: 'Max messages to return (default 10)', default: '10' },
    ],
    example: { input: { channel: '#dev-alerts', limit: 3 }, output: '[14:32] caboose-bot: Deploy complete ✅\n[13:15] alice: PR #8 merged\n[12:00] bob: CI passed' },
  },

  // ── Discord ────────────────────────────────────────────────────────────────
  {
    name: 'discord_list_channels',
    category: 'discord',
    tier: 'hosted',
    tags: ['read-only'],
    description: 'List Discord text channels in the configured guild.',
    params: [],
    example: { input: {}, output: '#general\n#dev\n#ai-tools\n#bot-commands' },
  },
  {
    name: 'discord_post_message',
    category: 'discord',
    tier: 'hosted',
    tags: ['write'],
    description: 'Post a message to a Discord channel.',
    params: [
      { name: 'channel_id', type: 'string', required: true, description: 'Discord channel ID' },
      { name: 'content', type: 'string', required: true, description: 'Message content (supports Discord markdown)' },
    ],
    example: { input: { channel_id: '1234567890', content: '**Deploy complete** ✅' }, output: 'Message posted (ID: 9876543210).' },
  },
  {
    name: 'discord_read_messages',
    category: 'discord',
    tier: 'hosted',
    tags: ['read-only'],
    description: 'Read recent messages from a Discord channel.',
    params: [
      { name: 'channel_id', type: 'string', required: true, description: 'Discord channel ID' },
      { name: 'limit', type: 'number', required: false, description: 'Max messages (default 10)', default: '10' },
    ],
    example: { input: { channel_id: '1234567890', limit: 3 }, output: '[alice] Hey, can you check the printer status?\n[caboose-bot] Printer is idle. Last print: 2h ago.\n[bob] Nice!' },
  },

  {
    name: 'discord_webhook_post',
    category: 'discord',
    tier: 'hosted',
    tags: ['write'],
    description: 'Post a message via Discord incoming webhook (no bot token required).',
    params: [
      { name: 'content', type: 'string', required: true, description: 'Message content' },
      { name: 'webhook_url', type: 'string', required: false, description: 'Webhook URL (overrides DISCORD_WEBHOOK_URL env var)' },
    ],
    example: { input: { content: 'Deploy complete ✅' }, output: 'Webhook message posted.' },
  },

  // ── Database ───────────────────────────────────────────────────────────────
  {
    name: 'postgres_query',
    category: 'database',
    tier: 'hosted',
    tags: ['sql', 'read-only'],
    description: 'Execute a read-only SQL query against the configured PostgreSQL database.',
    params: [
      { name: 'sql', type: 'string', required: true, description: 'SQL query to execute (SELECT only)' },
    ],
    example: {
      input: { sql: 'SELECT count(*) as total FROM events WHERE created_at > now() - interval \'7 days\'' },
      output: 'total\n-----\n1,284',
    },
  },
  {
    name: 'postgres_list_tables',
    category: 'database',
    tier: 'hosted',
    tags: ['sql', 'read-only'],
    description: 'List all tables in the PostgreSQL database with row counts.',
    params: [],
    example: { input: {}, output: 'events       12,847 rows\nusers         3,291 rows\nsessions      1,104 rows' },
  },
  {
    name: 'mongodb_query',
    category: 'database',
    tier: 'hosted',
    tags: ['nosql', 'read-only'],
    description: 'Execute a MongoDB find query on a collection.',
    params: [
      { name: 'collection', type: 'string', required: true, description: 'Collection name' },
      { name: 'filter', type: 'string', required: false, description: 'JSON filter object (default {})' },
      { name: 'limit', type: 'number', required: false, description: 'Max documents to return (default 10)', default: '10' },
    ],
    example: { input: { collection: 'sessions', filter: '{"active": true}', limit: 3 }, output: '[{"_id":"abc", "user":"alice", "active":true}, ...]' },
  },
  {
    name: 'mongodb_list_collections',
    category: 'database',
    tier: 'hosted',
    tags: ['nosql', 'read-only'],
    description: 'List all collections in the MongoDB database.',
    params: [],
    example: { input: {}, output: 'sessions\nusers\nevents\nconfig' },
  },

  // ── Docker ─────────────────────────────────────────────────────────────────
  {
    name: 'docker_list_containers',
    category: 'docker',
    tier: 'local',
    tags: ['read-only'],
    description: 'List running Docker containers with their status, ports, and image.',
    params: [
      { name: 'all', type: 'boolean', required: false, description: 'Include stopped containers (default false)' },
    ],
    example: { input: {}, output: 'nginx          Up 3d    0.0.0.0:80->80/tcp\npostgres       Up 3d    0.0.0.0:5432->5432/tcp\ncaboose-dev    Up 2h    0.0.0.0:8080->8080/tcp' },
  },
  {
    name: 'docker_logs',
    category: 'docker',
    tier: 'local',
    tags: ['read-only'],
    description: 'Fetch recent logs from a Docker container.',
    params: [
      { name: 'container', type: 'string', required: true, description: 'Container name or ID' },
      { name: 'lines', type: 'number', required: false, description: 'Number of lines to return (default 50)', default: '50' },
    ],
    example: { input: { container: 'caboose-dev', lines: 5 }, output: '2026-03-19 14:30:01 caboose-mcp HTTP server on :8080 (JWT auth only)\n2026-03-19 14:30:01 magic link exchange: :8080/auth/verify?token=<magic>' },
  },
  {
    name: 'docker_inspect',
    category: 'docker',
    tier: 'local',
    tags: ['read-only'],
    description: 'Inspect a Docker container and return key metadata.',
    params: [
      { name: 'container', type: 'string', required: true, description: 'Container name or ID' },
    ],
    example: { input: { container: 'caboose-dev' }, output: 'Image: caboose-mcp:latest\nStatus: running\nPID: 12345\nStarted: 2026-03-19T12:30:00Z' },
  },

  // ── System ─────────────────────────────────────────────────────────────────
  {
    name: 'execute_command',
    category: 'system',
    tier: 'local',
    tags: ['shell', 'gate'],
    description: 'Execute a shell command on the local machine. Goes through the audit gate if gating is enabled — requires explicit approval before running.',
    params: [
      { name: 'command', type: 'string', required: true, description: 'Shell command to execute' },
      { name: 'timeout', type: 'number', required: false, description: 'Timeout in seconds (default 30)', default: '30' },
    ],
    example: { input: { command: 'df -h /' }, output: 'Filesystem      Size  Used Avail Use%\n/dev/sda1       100G   42G   54G  44%' },
  },

  // ── Health ─────────────────────────────────────────────────────────────────
  {
    name: 'health_report',
    category: 'health',
    tier: 'hosted',
    tags: ['monitoring', 'read-only'],
    sandboxable: true,
    description: 'Return a system health snapshot: CPU usage, memory, disk, running Docker containers, and systemd service statuses.',
    params: [],
    example: {
      input: {},
      output: `System Health Report — 2026-03-19 14:32 UTC\n\nCPU:     12% (4 cores)\nMemory:  2.1 GB / 8.0 GB (26%)\nDisk:    42 GB / 100 GB (42%)\nUptime:  3d 14h 22m\n\nDocker containers: 3 running\n  ✓ nginx\n  ✓ postgres\n  ✓ caboose-dev\n\nServices:\n  ✓ caboose-mcp-serve  active (running)`,
    },
  },

  // ── Self-Improve ───────────────────────────────────────────────────────────
  {
    name: 'si_scan_dir',
    category: 'selfimprove',
    tier: 'hosted',
    tags: ['ai', 'analysis'],
    description: 'Scan a directory and generate improvement suggestions using Claude. Respects the allowlist to decide auto-apply vs require-approval.',
    params: [
      { name: 'path', type: 'string', required: true, description: 'Directory path to scan' },
      { name: 'focus', type: 'string', required: false, description: 'Specific area to focus on (e.g. security, performance, tests)' },
    ],
    example: { input: { path: 'packages/server/tools', focus: 'tests' }, output: 'Found 3 improvement suggestions for packages/server/tools (focus: tests). Use si_list_pending to review.' },
  },
  {
    name: 'si_list_pending',
    category: 'selfimprove',
    tier: 'hosted',
    tags: ['ai', 'read-only'],
    description: 'List all pending improvement suggestions awaiting review.',
    params: [],
    example: { input: {}, output: '3 pending suggestions:\n1. add-auth-tests (quality) — Add unit tests for auth handlers\n2. improve-error-messages (ux) — Improve error messages in calendar.go\n3. extract-helper (refactoring) — Extract shared date parsing helper' },
  },
  {
    name: 'si_approve',
    category: 'selfimprove',
    tier: 'hosted',
    tags: ['ai', 'write'],
    description: 'Approve and apply a pending improvement suggestion.',
    params: [
      { name: 'id', type: 'string', required: true, description: 'Suggestion ID from si_list_pending' },
    ],
    example: { input: { id: 'add-auth-tests' }, output: 'Suggestion add-auth-tests approved and applied.' },
  },
  {
    name: 'si_tech_digest',
    category: 'selfimprove',
    tier: 'hosted',
    tags: ['ai', 'read-only'],
    description: 'Generate a tech digest from tracked sources: summaries, trends, and action items.',
    params: [],
    example: { input: {}, output: 'Tech Digest — 2026-03-19\n\n3 sources checked:\n• Go 1.24 release notes — 2 action items\n• Tailwind v4 migration — 1 action item' },
  },

  // ── Self-Improve (continued) ──────────────────────────────────────────────
  {
    name: 'si_git_diff',
    category: 'selfimprove',
    tier: 'hosted',
    tags: ['ai', 'git', 'read-only'],
    description: 'Show git diff for a repository to generate improvement suggestions.',
    params: [
      { name: 'path', type: 'string', required: false, description: 'Repository path (default: current directory)' },
    ],
    example: { input: { path: '.' }, output: 'Diff captured. Use si_suggest to create suggestions from the diff.' },
  },
  {
    name: 'si_suggest',
    category: 'selfimprove',
    tier: 'hosted',
    tags: ['ai', 'write'],
    description: 'Create a pending improvement suggestion manually.',
    params: [
      { name: 'title', type: 'string', required: true, description: 'Short title for the suggestion' },
      { name: 'description', type: 'string', required: true, description: 'Detailed description of the improvement' },
      { name: 'category', type: 'string', required: false, description: 'Category: quality, security, performance, ux, refactoring' },
      { name: 'file', type: 'string', required: false, description: 'Target file path' },
      { name: 'diff', type: 'string', required: false, description: 'Unified diff to apply' },
    ],
    example: { input: { title: 'add-tests', description: 'Add unit tests for auth handlers', category: 'quality' }, output: 'Suggestion add-tests created.' },
  },
  {
    name: 'si_reject',
    category: 'selfimprove',
    tier: 'hosted',
    tags: ['ai', 'write'],
    description: 'Reject and discard a pending improvement suggestion.',
    params: [
      { name: 'id', type: 'string', required: true, description: 'Suggestion ID from si_list_pending' },
    ],
    example: { input: { id: 'add-auth-tests' }, output: 'Suggestion add-auth-tests rejected and removed.' },
  },
  {
    name: 'si_apply',
    category: 'selfimprove',
    tier: 'hosted',
    tags: ['ai', 'write'],
    description: 'Apply an approved suggestion\'s diff to the target file.',
    params: [
      { name: 'id', type: 'string', required: true, description: 'Approved suggestion ID' },
    ],
    example: { input: { id: 'add-auth-tests' }, output: 'Suggestion add-auth-tests applied: tools/auth_test.go patched.' },
  },
  {
    name: 'si_report_error',
    category: 'selfimprove',
    tier: 'hosted',
    tags: ['ai', 'write'],
    description: 'Record an error for later triage.',
    params: [
      { name: 'error', type: 'string', required: true, description: 'Error message or stack trace' },
      { name: 'context', type: 'string', required: false, description: 'Additional context (file, tool, user action)' },
    ],
    example: { input: { error: 'calendar_list: token expired', context: 'user requested calendar events' }, output: 'Error recorded: err-2026-03-20-001' },
  },

  // ── Sources ────────────────────────────────────────────────────────────────
  {
    name: 'source_add',
    category: 'sources',
    tier: 'hosted',
    tags: ['rss', 'write'],
    description: 'Add a URL as a tracked source (RSS/Atom feed or web page).',
    params: [
      { name: 'name', type: 'string', required: true, description: 'Friendly name for the source' },
      { name: 'url', type: 'string', required: true, description: 'URL of the feed or page' },
      { name: 'type', type: 'string', required: false, description: 'Type: rss, atom, or page (default: auto-detect)' },
    ],
    example: { input: { name: 'Go Blog', url: 'https://go.dev/blog/feed.atom', type: 'atom' }, output: 'Source "Go Blog" added.' },
  },
  {
    name: 'source_list',
    category: 'sources',
    tier: 'hosted',
    tags: ['rss', 'read-only'],
    description: 'List all watched sources with their type and last-checked time.',
    params: [],
    example: { input: {}, output: '3 sources:\n• Go Blog (atom) — checked 2h ago\n• Tailwind CSS (rss) — checked 1d ago\n• anthropic/sdk-go (github_repo) — checked 30m ago' },
  },
  {
    name: 'source_edit',
    category: 'sources',
    tier: 'hosted',
    tags: ['rss', 'write'],
    description: 'Edit an existing source by ID (update name, URL, or type).',
    params: [
      { name: 'id', type: 'string', required: true, description: 'Source ID from source_list' },
      { name: 'name', type: 'string', required: false, description: 'New friendly name' },
      { name: 'url', type: 'string', required: false, description: 'New URL' },
    ],
    example: { input: { id: 'src-1', name: 'Go Official Blog' }, output: 'Source src-1 updated.' },
  },
  {
    name: 'source_remove',
    category: 'sources',
    tier: 'hosted',
    tags: ['rss', 'write'],
    description: 'Remove a tracked source by ID.',
    params: [
      { name: 'id', type: 'string', required: true, description: 'Source ID from source_list' },
    ],
    example: { input: { id: 'src-1' }, output: 'Source src-1 removed.' },
  },
  {
    name: 'source_check',
    category: 'sources',
    tier: 'hosted',
    tags: ['rss', 'read-only'],
    description: 'Check one or all sources for new activity since last check.',
    params: [
      { name: 'name', type: 'string', required: false, description: 'Source name to check (omit to check all)' },
    ],
    example: { input: {}, output: 'Checked 3 sources:\n• Go Blog: 1 new item\n• Tailwind CSS: no updates\n• anthropic/sdk-go: 2 new commits' },
  },
  {
    name: 'source_digest',
    category: 'sources',
    tier: 'hosted',
    tags: ['rss', 'read-only'],
    description: 'Check all sources and post a formatted digest to Slack or Discord.',
    params: [
      { name: 'name', type: 'string', required: true, description: 'Source name (or \'all\')' },
    ],
    example: { input: { name: 'Go Blog' }, output: 'Go Blog — last checked 2h ago\n\n• Go 1.24 Released (2026-02-11)\n• Structured Logging with slog (2026-01-15)' },
  },

  // ── Cloud Sync ─────────────────────────────────────────────────────────────
  {
    name: 'cloudsync_push',
    category: 'cloudsync',
    tier: 'hosted',
    tags: ['backup', 'write'],
    description: 'Encrypt and push Claude config to a GitHub Gist or S3 bucket.',
    params: [
      { name: 'message', type: 'string', required: false, description: 'Sync commit/version message' },
    ],
    example: { input: { message: 'after JWT auth setup' }, output: 'Config pushed to GitHub Gist (gist:abc123) — 14 files, 28KB encrypted.' },
  },
  {
    name: 'cloudsync_pull',
    category: 'cloudsync',
    tier: 'hosted',
    tags: ['backup'],
    description: 'Pull and decrypt Claude config from GitHub Gist or S3.',
    params: [],
    example: { input: {}, output: 'Config pulled from GitHub Gist — 14 files restored.' },
  },
  {
    name: 'cloudsync_status',
    category: 'cloudsync',
    tier: 'hosted',
    tags: ['read-only'],
    description: 'Show cloud sync status: backend, last push/pull, file count.',
    params: [],
    example: { input: {}, output: 'Backend: GitHub Gist\nLast push: 2026-03-18 09:30\nLast pull: 2026-03-19 08:00\nFiles: 14' },
  },
  {
    name: 'cloudsync_setup',
    category: 'cloudsync',
    tier: 'hosted',
    tags: ['config', 'write'],
    description: 'First-time setup — create an S3 bucket or GitHub Gist and configure the sync backend.',
    params: [
      { name: 'backend', type: 'string', required: false, description: 'Backend: s3 or gist (default: gist)' },
    ],
    example: { input: { backend: 'gist' }, output: 'CloudSync configured: GitHub Gist gist:abc123. Run cloudsync_push to upload your config.' },
  },
  {
    name: 'cloudsync_env_set',
    category: 'cloudsync',
    tier: 'hosted',
    tags: ['config', 'write'],
    description: 'Add or update an env var key=value in the encrypted sync bundle.',
    params: [
      { name: 'key', type: 'string', required: true, description: 'Environment variable name' },
      { name: 'value', type: 'string', required: true, description: 'Environment variable value' },
    ],
    example: { input: { key: 'SLACK_TOKEN', value: 'xoxb-...' }, output: 'SLACK_TOKEN added to sync bundle. Run cloudsync_push to save.' },
  },
  {
    name: 'cloudsync_env_list',
    category: 'cloudsync',
    tier: 'hosted',
    tags: ['config', 'read-only'],
    description: 'List env var keys stored in the sync bundle (values are not shown).',
    params: [],
    example: { input: {}, output: 'Env vars in sync bundle:\n- SLACK_TOKEN\n- DISCORD_TOKEN\n- GITHUB_TOKEN\n- POSTGRES_URL' },
  },

  // ── Chezmoi ────────────────────────────────────────────────────────────────
  {
    name: 'chezmoi_status',
    category: 'chezmoi',
    tier: 'local',
    tags: ['dotfiles', 'read-only'],
    description: 'Show chezmoi status — which dotfiles have local changes vs source.',
    params: [],
    example: { input: {}, output: 'M ~/.zshrc\nM ~/.config/nvim/init.lua\nA ~/.config/caboose/config.toml' },
  },
  {
    name: 'chezmoi_apply',
    category: 'chezmoi',
    tier: 'local',
    tags: ['dotfiles', 'write'],
    description: 'Apply chezmoi source state to the home directory.',
    params: [],
    example: { input: {}, output: 'chezmoi apply completed — 3 files updated.' },
  },
  {
    name: 'chezmoi_diff',
    category: 'chezmoi',
    tier: 'local',
    tags: ['dotfiles', 'read-only'],
    description: 'Show diff between chezmoi source state and home directory.',
    params: [],
    example: { input: {}, output: '--- a/.zshrc\n+++ b/.zshrc\n@@ -12,3 +12,4 @@\n+alias k="kubectl"\n+alias kg="kubectl get"' },
  },
  {
    name: 'chezmoi_add',
    category: 'chezmoi',
    tier: 'local',
    tags: ['dotfiles', 'write'],
    description: 'Add a file or directory to chezmoi management.',
    params: [
      { name: 'path', type: 'string', required: true, description: 'Absolute or home-relative path to manage' },
    ],
    example: { input: { path: '~/.zshrc' }, output: 'Added ~/.zshrc to chezmoi source state.' },
  },
  {
    name: 'chezmoi_forget',
    category: 'chezmoi',
    tier: 'local',
    tags: ['dotfiles', 'write'],
    description: 'Stop managing a file with chezmoi (leaves the target file intact).',
    params: [
      { name: 'path', type: 'string', required: true, description: 'Path of the managed file to forget' },
    ],
    example: { input: { path: '~/.zshrc' }, output: 'Removed ~/.zshrc from chezmoi (file left in place).' },
  },
  {
    name: 'chezmoi_update',
    category: 'chezmoi',
    tier: 'local',
    tags: ['dotfiles', 'write'],
    description: 'Pull the latest changes from the chezmoi source repo and apply them.',
    params: [],
    example: { input: {}, output: 'chezmoi update: pulled 2 commits, applied 3 files.' },
  },
  {
    name: 'chezmoi_init',
    category: 'chezmoi',
    tier: 'local',
    tags: ['dotfiles', 'write'],
    description: 'Initialize chezmoi, optionally from a git repo URL.',
    params: [
      { name: 'repo', type: 'string', required: false, description: 'Git repo URL to initialize from' },
    ],
    example: { input: { repo: 'https://github.com/cxm6467/dotfiles' }, output: 'chezmoi initialized from https://github.com/cxm6467/dotfiles' },
  },
  {
    name: 'chezmoi_data',
    category: 'chezmoi',
    tier: 'local',
    tags: ['dotfiles', 'read-only'],
    description: 'Show chezmoi template data variables (hostname, os, arch, custom data).',
    params: [],
    example: { input: {}, output: 'chezmoi data:\n  hostname: pi5\n  os: linux\n  arch: arm64\n  email: chris@example.com' },
  },
  {
    name: 'chezmoi_managed',
    category: 'chezmoi',
    tier: 'local',
    tags: ['dotfiles', 'read-only'],
    description: 'List all files and directories currently managed by chezmoi.',
    params: [],
    example: { input: {}, output: '~/.zshrc\n~/.gitconfig\n~/.config/nvim/init.lua\n~/.ssh/config' },
  },
  {
    name: 'chezmoi_git',
    category: 'chezmoi',
    tier: 'local',
    tags: ['dotfiles', 'git'],
    description: 'Run a git command inside the chezmoi source directory.',
    params: [
      { name: 'args', type: 'string', required: true, description: 'Git arguments (e.g. "status", "log --oneline -5")' },
    ],
    example: { input: { args: 'log --oneline -3' }, output: 'a1b2c3d Add .zshrc aliases\ne4f5g6h Init dotfiles\n7h8i9j0 Add nvim config' },
  },

  // ── 3D Printing ────────────────────────────────────────────────────────────
  {
    name: 'bambu_status',
    category: 'printing',
    tier: 'local',
    tags: ['bambu', 'mqtt', 'read-only'],
    description: 'Check the Bambu A1 printer status via MQTT/TLS: print progress, temperatures, filament.',
    params: [],
    example: { input: {}, output: 'Printer: Bambu Lab A1\nStatus: Printing (72%)\nFile: benchy.3mf\nETA: 14m 32s\nNozzle: 220°C | Bed: 55°C\nFilament: PLA White (180g remaining)' },
  },
  {
    name: 'bambu_print',
    category: 'printing',
    tier: 'local',
    tags: ['bambu', 'mqtt', 'write'],
    description: 'Start a print job on the Bambu A1 printer from a .3mf or .gcode file path.',
    params: [
      { name: 'file', type: 'string', required: true, description: 'Path to .3mf or .gcode file' },
    ],
    example: { input: { file: '/tmp/benchy.3mf' }, output: 'Print job started: benchy.3mf' },
  },
  {
    name: 'bambu_stop',
    category: 'printing',
    tier: 'local',
    tags: ['bambu', 'mqtt', 'write'],
    description: 'Stop the active print job on the Bambu printer.',
    params: [],
    example: { input: {}, output: 'Print job stopped.' },
  },
  {
    name: 'blender_generate',
    category: 'printing',
    tier: 'local',
    tags: ['blender', '3d'],
    description: 'Run Blender headless with a Python script to generate a 3D model.',
    params: [
      { name: 'script', type: 'string', required: true, description: 'Python script to execute in Blender' },
      { name: 'output', type: 'string', required: false, description: 'Output file path (default: /tmp/output.stl)' },
    ],
    example: { input: { script: 'import bpy; bpy.ops.mesh.primitive_cube_add()' }, output: 'Blender script executed. Output: /tmp/output.stl (142KB).' },
  },

  // ── Sandbox ────────────────────────────────────────────────────────────────
  {
    name: 'sandbox_run',
    category: 'sandbox',
    tier: 'hosted',
    tags: ['preview', 'safety'],
    description: 'Run a command in a temp directory sandbox and preview the changes without touching your real files.',
    params: [
      { name: 'command', type: 'string', required: true, description: 'Command to run in the sandbox' },
    ],
    example: { input: { command: 'sed -i s/foo/bar/g *.go' }, output: 'Sandbox result:\n  Modified: 3 files\n  Use sandbox_diff to see changes, sandbox_apply to apply.' },
  },
  {
    name: 'sandbox_diff',
    category: 'sandbox',
    tier: 'hosted',
    tags: ['preview', 'read-only'],
    description: 'Show a diff of changes made in the last sandbox run.',
    params: [],
    example: { input: {}, output: '--- a/main.go\n+++ b/main.go\n@@ -5,1 +5,1 @@\n-foo := "old"\n+bar := "old"' },
  },

  // ── Sandbox (continued) ───────────────────────────────────────────────────
  {
    name: 'sandbox_list',
    category: 'sandbox',
    tier: 'hosted',
    tags: ['preview', 'read-only'],
    description: 'List all active sandboxes with their ID, source directory, and age.',
    params: [],
    example: { input: {}, output: '2 active sandboxes:\n• sb-1742394600 — /home/caboose/dev/caboose-mcp (12m ago)\n• sb-1742391000 — /tmp/test-project (1h ago)' },
  },
  {
    name: 'sandbox_suggestion',
    category: 'sandbox',
    tier: 'hosted',
    tags: ['preview', 'ai'],
    description: 'Preview a pending si_ suggestion in a sandbox without applying it to the real files.',
    params: [
      { name: 'id', type: 'string', required: true, description: 'Suggestion ID from si_list_pending' },
    ],
    example: { input: { id: 'add-auth-tests' }, output: 'Sandbox sb-1742394600 created.\nDiff preview:\n+++ tools/auth_test.go ...' },
  },
  {
    name: 'sandbox_clean',
    category: 'sandbox',
    tier: 'hosted',
    tags: ['preview', 'write'],
    description: 'Delete sandboxes by ID or by age (all sandboxes older than N minutes).',
    params: [
      { name: 'id', type: 'string', required: false, description: 'Sandbox ID to delete' },
      { name: 'older_than', type: 'number', required: false, description: 'Delete all sandboxes older than N minutes' },
    ],
    example: { input: { older_than: 60 }, output: 'Cleaned 2 sandboxes older than 60 minutes.' },
  },

  // ── Audit ──────────────────────────────────────────────────────────────────
  {
    name: 'audit_list',
    category: 'audit',
    tier: 'hosted',
    tags: ['read-only', 'transparency'],
    description: 'Show the audit log of recent tool invocations with timestamps and results.',
    params: [
      { name: 'limit', type: 'number', required: false, description: 'Max entries (default 20)', default: '20' },
    ],
    example: { input: { limit: 3 }, output: '[14:32:07] calendar_list → OK (7 events)\n[14:30:01] focus_start → OK (session started)\n[14:28:55] note_add → OK' },
  },
  {
    name: 'audit_pending',
    category: 'audit',
    tier: 'hosted',
    tags: ['gate', 'read-only'],
    description: 'List commands awaiting approval in the audit gate queue.',
    params: [],
    example: { input: {}, output: '1 pending:\n• exec-1742394600: execute_command(command="rm -rf /tmp/old-builds")' },
  },
  {
    name: 'approve_execution',
    category: 'audit',
    tier: 'hosted',
    tags: ['gate', 'write'],
    description: 'Approve a gated command, executing it and logging the result.',
    params: [
      { name: 'id', type: 'string', required: true, description: 'Pending execution ID from audit_pending' },
    ],
    example: { input: { id: 'exec-1742394600' }, output: 'Approved and executed: rm -rf /tmp/old-builds\nResult: Removed 42 files (1.2 GB freed).' },
  },
  {
    name: 'audit_config',
    category: 'audit',
    tier: 'hosted',
    tags: ['config', 'gate'],
    description: 'View or modify the audit gate configuration (gate mode on/off, gated tool list).',
    params: [
      { name: 'gate_mode', type: 'string', required: false, description: 'Gate mode: off, log, gate' },
    ],
    example: { input: {}, output: 'Gate mode: gate\nGated tools: execute_command, env_fix\nLog: ~/.claude/audit/audit.log' },
  },
  {
    name: 'deny_execution',
    category: 'audit',
    tier: 'hosted',
    tags: ['gate', 'write'],
    description: 'Deny a gated command — removes it from the pending queue without executing.',
    params: [
      { name: 'id', type: 'string', required: true, description: 'Pending execution ID from audit_pending' },
    ],
    example: { input: { id: 'exec-1742394600' }, output: 'Execution exec-1742394600 denied and removed from queue.' },
  },

  // ── Toolsmith ──────────────────────────────────────────────────────────────
  {
    name: 'tool_scaffold',
    category: 'toolsmith',
    tier: 'local',
    tags: ['meta', 'write'],
    description: 'Scaffold a new tool file from a template — generates the boilerplate for a new tool group.',
    params: [
      { name: 'name', type: 'string', required: true, description: 'Tool group name (e.g. payments, crm)' },
      { name: 'description', type: 'string', required: false, description: 'Short description of the tool group' },
    ],
    example: { input: { name: 'payments', description: 'Stripe payment tools' }, output: 'Created packages/server/tools/payments.go with scaffold.' },
  },
  {
    name: 'tool_list',
    category: 'toolsmith',
    tier: 'local',
    tags: ['meta', 'read-only'],
    description: 'List all registered MCP tools with their descriptions.',
    params: [],
    example: { input: {}, output: '117 tools registered:\n• calendar_today — Return today\'s date...\n• calendar_list — List upcoming Google Calendar events...' },
  },
  {
    name: 'tool_write',
    category: 'toolsmith',
    tier: 'local',
    tags: ['meta', 'write'],
    description: 'Write Go source to tools/<file>.go and patch main.go to register it.',
    params: [
      { name: 'filename', type: 'string', required: true, description: 'Target filename under tools/ (e.g. payments.go)' },
      { name: 'source', type: 'string', required: true, description: 'Go source code to write' },
    ],
    example: { input: { filename: 'payments.go', source: 'package tools...' }, output: 'Wrote tools/payments.go and patched main.go.' },
  },
  {
    name: 'tool_rebuild',
    category: 'toolsmith',
    tier: 'local',
    tags: ['meta', 'write'],
    description: 'Run go build in the server package and return compiler output.',
    params: [],
    example: { input: {}, output: 'Build succeeded (0 errors).' },
  },

  // ── Mermaid ────────────────────────────────────────────────────────────────
  {
    name: 'mermaid_generate',
    category: 'misc',
    tier: 'hosted',
    tags: ['diagrams', 'read-only'],
    sandboxable: true,
    description: 'Generate a Mermaid diagram from a description. Returns a fenced ```mermaid code block ready to paste into docs.',
    params: [
      { name: 'description', type: 'string', required: true, description: 'Natural language description of the diagram' },
      { name: 'type', type: 'string', required: false, description: 'Diagram type: flowchart, sequence, class, er, gantt (default: auto-detect)', default: 'auto' },
    ],
    example: {
      input: { description: 'User logs in, server verifies JWT, returns tools list' },
      output: '```mermaid\nsequenceDiagram\n  participant U as User\n  participant S as Server\n  U->>S: POST /mcp (Bearer JWT)\n  S->>S: Verify JWT + check ACL\n  S-->>U: tools/list response\n```',
    },
  },

  // ── Greptile ───────────────────────────────────────────────────────────────
  {
    name: 'greptile_query',
    category: 'misc',
    tier: 'hosted',
    tags: ['ai', 'code-search'],
    description: 'Query your codebase using Greptile\'s AI-powered semantic code search.',
    params: [
      { name: 'query', type: 'string', required: true, description: 'Natural language question about your codebase' },
    ],
    example: { input: { query: 'How does the JWT token verification work?' }, output: 'JWT verification happens in VerifyJWT (tools/auth.go:273)...' },
  },
  {
    name: 'greptile_index',
    category: 'misc',
    tier: 'hosted',
    tags: ['ai', 'code-search', 'write'],
    description: 'Trigger Greptile to index a GitHub repository so it can be queried.',
    params: [
      { name: 'repo', type: 'string', required: true, description: 'GitHub repo in owner/name format (e.g. caboose-mcp/caboose-mcp)' },
      { name: 'branch', type: 'string', required: false, description: 'Branch to index (default: main)' },
    ],
    example: { input: { repo: 'caboose-mcp/caboose-mcp' }, output: 'Indexing started for caboose-mcp/caboose-mcp@main. Check back in a few minutes.' },
  },

  // ── Jokes ──────────────────────────────────────────────────────────────────
  {
    name: 'joke',
    category: 'misc',
    tier: 'hosted',
    tags: ['fun', 'read-only'],
    sandboxable: true,
    description: 'Tell a programming joke from a curated local list.',
    params: [],
    example: { input: {}, output: 'Why do programmers prefer dark mode?\nBecause light attracts bugs.' },
  },
  {
    name: 'dad_joke',
    category: 'misc',
    tier: 'hosted',
    tags: ['fun', 'read-only'],
    sandboxable: true,
    description: 'Tell a dad joke from a curated local list.',
    params: [],
    example: { input: {}, output: "I'm reading a book about anti-gravity. It's impossible to put down." },
  },

  // ── Persona ────────────────────────────────────────────────────────────────
  {
    name: 'agent_persona',
    category: 'misc',
    tier: 'hosted',
    tags: ['config'],
    description: 'View or update the bot\'s persona configuration (tone, verbosity, style).',
    params: [
      { name: 'tone', type: 'string', required: false, description: 'Tone: professional, casual, fantasy, scifi' },
      { name: 'verbosity', type: 'string', required: false, description: 'Verbosity: concise, normal, verbose' },
    ],
    example: { input: { tone: 'fantasy' }, output: 'Persona updated: tone=fantasy, verbosity=normal.' },
  },

  // ── Setup ──────────────────────────────────────────────────────────────────
  {
    name: 'setup_check',
    category: 'misc',
    tier: 'hosted',
    tags: ['config', 'read-only'],
    description: 'Check the current setup status — which services are configured, which are missing.',
    params: [],
    example: { input: {}, output: '✓ Google Calendar\n✓ Slack\n✓ Discord\n✗ Bambu (BAMBU_IP not set)\n✗ PostgreSQL (POSTGRES_URL not set)' },
  },

  // ── Fun & Entertainment ──────────────────────────────────────────────────────
  {
    name: 'chuck_norris_joke',
    category: 'misc',
    tier: 'hosted',
    tags: ['fun', 'api', 'read-only'],
    highlighted: true,
    description: 'Fetch a random Chuck Norris joke from the chuck norris API. Optionally filter by category.',
    params: [
      { name: 'category', type: 'string', required: false, description: 'Optional category (e.g., career, celebrity, explicit). Returns random joke if not specified.' },
    ],
    sandboxable: true,
    example: {
      input: { category: 'career' },
      output: 'Chuck Norris Joke (career):\n\nChuck Norris solved the halting problem.',
    },
  },
  {
    name: 'setup_init_dirs',
    category: 'misc',
    tier: 'hosted',
    tags: ['config', 'write'],
    description: 'Initialize all ~/.claude/ subdirectories used by caboose-mcp.',
    params: [],
    example: { input: {}, output: 'Created: ~/.claude/pending, ~/.claude/errors, ~/.claude/learning, ~/.claude/focus, ~/.claude/audit, ~/.claude/secrets, ~/.claude/agents' },
  },
  {
    name: 'setup_write_env',
    category: 'misc',
    tier: 'hosted',
    tags: ['config', 'write'],
    description: 'Write a .env file with provided key=value pairs.',
    params: [
      { name: 'pairs', type: 'string', required: true, description: 'Newline-separated KEY=VALUE pairs' },
      { name: 'path', type: 'string', required: false, description: 'Output path (default: .env)' },
    ],
    example: { input: { pairs: 'SLACK_TOKEN=xoxb-...\nDISCORD_TOKEN=...' }, output: '.env written (2 vars).' },
  },
  {
    name: 'setup_n8n_workflows',
    category: 'misc',
    tier: 'hosted',
    tags: ['config', 'read-only'],
    description: 'Return example n8n workflow JSON for integrating caboose-mcp via webhook.',
    params: [],
    example: { input: {}, output: '{ "nodes": [...], "connections": {...} }' },
  },
  {
    name: 'setup_github_mcp_info',
    category: 'misc',
    tier: 'hosted',
    tags: ['config', 'read-only'],
    description: 'Explain the difference between the GitHub MCP server and caboose-mcp.',
    params: [],
    example: { input: {}, output: 'GitHub MCP server provides GitHub-specific tools. caboose-mcp wraps the gh CLI and adds personal productivity tools. Both can coexist.' },
  },

  // ── Claude Files ───────────────────────────────────────────────────────────
  {
    name: 'claude_read_file',
    category: 'claude',
    tier: 'hosted',
    tags: ['files', 'read-only'],
    description: 'Read a file under ~/.claude/ by relative path.',
    params: [
      { name: 'path', type: 'string', required: true, description: 'Relative path under ~/.claude/ (e.g. notes.md)' },
    ],
    example: { input: { path: 'notes.md' }, output: '# Notes\n\n- [2026-03-19] #todo Investigate JWT refresh...' },
  },
  {
    name: 'claude_write_file',
    category: 'claude',
    tier: 'hosted',
    tags: ['files', 'write'],
    description: 'Write content to a file under ~/.claude/.',
    params: [
      { name: 'path', type: 'string', required: true, description: 'Relative path under ~/.claude/' },
      { name: 'content', type: 'string', required: true, description: 'File content to write' },
    ],
    example: { input: { path: 'persona.json', content: '{"tone":"casual"}' }, output: 'Written: ~/.claude/persona.json (18 bytes).' },
  },
  {
    name: 'claude_append_memory',
    category: 'claude',
    tier: 'hosted',
    tags: ['files', 'write'],
    description: 'Append a line to CLAUDE.md or a named memory file in ~/.claude/memory/.',
    params: [
      { name: 'content', type: 'string', required: true, description: 'Content to append' },
      { name: 'file', type: 'string', required: false, description: 'Memory filename (default: CLAUDE.md)' },
    ],
    example: { input: { content: 'Always use bun for JS projects.' }, output: 'Appended to ~/.claude/CLAUDE.md.' },
  },
  {
    name: 'claude_list_files',
    category: 'claude',
    tier: 'hosted',
    tags: ['files', 'read-only'],
    description: 'List files and directories under ~/.claude/.',
    params: [
      { name: 'path', type: 'string', required: false, description: 'Subdirectory to list (default: root)' },
    ],
    example: { input: {}, output: 'notes.md\npersona.json\nfocus/\nlearning/\npending/\nsecrets/' },
  },

  // ── Environment ────────────────────────────────────────────────────────────
  {
    name: 'env_check',
    category: 'env',
    tier: 'hosted',
    tags: ['devtools', 'read-only'],
    description: 'Check which dev tools are installed and report their versions. Shows install commands for missing tools.',
    params: [
      { name: 'missing_only', type: 'boolean', required: false, description: 'Only list missing tools (default false)' },
    ],
    sandboxable: true,
    example: { input: {}, output: '## Installed (14)\n✅  node             v22.3.0\n✅  go               go version go1.24 linux/arm64\n...\n## Missing (2)\n❌  uv' },
  },
  {
    name: 'env_fix',
    category: 'env',
    tier: 'hosted',
    tags: ['devtools', 'write', 'gate'],
    description: 'Install one or all missing dev tools via apt-get, brew, or alternative install command. Gated by audit.',
    params: [
      { name: 'tool', type: 'string', required: false, description: 'Tool name to install (omit to install all missing)' },
      { name: 'method', type: 'string', required: false, description: 'Install method: apt, brew, or alt (default: apt)' },
    ],
    example: { input: { tool: 'pre-commit', method: 'alt' }, output: '→ Installing pre-commit: pip install pre-commit\nSuccessfully installed pre-commit-3.7.0' },
  },

  // ── Agency ─────────────────────────────────────────────────────────────────
  {
    name: 'agency_list',
    category: 'agency',
    tier: 'local',
    tags: ['persona', 'read-only'],
    description: 'List all loaded agent spec files from ~/.claude/agents/.',
    params: [],
    example: { input: {}, output: '4 agent specs loaded:\n• backend-engineer — "Backend & API specialist"\n• devops — "DevOps & Infrastructure"\n• data-analyst — "Data Analysis"\n• creative — "Creative writing & UX"' },
  },
  {
    name: 'agency_detect',
    category: 'agency',
    tier: 'local',
    tags: ['persona', 'ai'],
    description: 'Detect the best-matching agent persona for a given message using keyword scoring.',
    params: [
      { name: 'message', type: 'string', required: true, description: 'User message to match against agent specs' },
    ],
    example: { input: { message: 'help me optimize this postgres query' }, output: 'Best match: backend-engineer (score: 4)\nPreferred tools: postgres_query, docker_inspect, health_report' },
  },
  {
    name: 'agency_hint',
    category: 'agency',
    tier: 'local',
    tags: ['persona', 'ai'],
    description: 'Return a formatted tool hint block for a message — advisory guidance injected into the system prompt.',
    params: [
      { name: 'message', type: 'string', required: true, description: 'User message to generate hints for' },
    ],
    example: { input: { message: 'deploy the app and check logs' }, output: '💡 Agent hint (devops): prefer docker_logs, health_report, execute_command. Minimize: calendar, notes, printing.' },
  },
]

// Convenience lookups
export const TOOL_MAP = new Map(TOOLS.map(t => [t.name, t]))
export const SANDBOX_TOOLS = TOOLS.filter(t => t.sandboxable)
export const TOOL_COUNT = TOOLS.length

export function getToolsByCategory(category: string): ToolDef[] {
  if (category === 'all') return TOOLS
  return TOOLS.filter(t => t.category === category)
}

export function searchTools(query: string): ToolDef[] {
  const q = query.toLowerCase()
  return TOOLS.filter(t =>
    t.name.includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags?.some(tag => tag.includes(q)) ||
    t.category.includes(q)
  )
}
