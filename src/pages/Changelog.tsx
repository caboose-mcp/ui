import { useState, useMemo } from 'react'
import { Clock, GitCommit, ExternalLink, Search, ChevronDown } from 'lucide-react'
import cabooseMcpLog from '../data/changelog.json'
import uiLog from '../data/changelog-ui.json'
import memlLog from '../data/changelog-meml.json'

export type ChangelogEntry = {
  hash: string
  date: string
  subject: string
  author: string
  tags: string[]
  repo: 'caboose-mcp' | 'ui' | 'meml'
}

const ALL_TAGS = ['feat', 'fix', 'docs', 'ci', 'chore', 'refactor', 'style', 'test', 'perf', 'other']
const LIMITS = [10, 25, 50, 100, 0] // 0 = all

const REPO_STYLES: Record<string, string> = {
  'caboose-mcp': 'text-accent-green bg-accent-green/10 border-accent-green/20',
  'ui':          'text-accent-blue bg-accent-blue/10 border-accent-blue/20',
  'meml':        'text-accent-purple bg-accent-purple/10 border-accent-purple/20',
}

const REPO_URLS: Record<string, string> = {
  'caboose-mcp': 'https://github.com/caboose-mcp/caboose-mcp',
  'ui':          'https://github.com/caboose-mcp/ui',
  'meml':        'https://github.com/caboose-mcp/meml',
}

const changelogData = ([...cabooseMcpLog, ...uiLog, ...memlLog] as ChangelogEntry[]).sort((a, b) =>
  new Date(b.date).getTime() - new Date(a.date).getTime()
)

const TAG_STYLES: Record<string, string> = {
  feat:     'text-accent-green bg-accent-green/10 border-accent-green/20',
  fix:      'text-accent-blue bg-accent-blue/10 border-accent-blue/20',
  docs:     'text-accent-purple bg-accent-purple/10 border-accent-purple/20',
  ci:       'text-accent-orange bg-accent-orange/10 border-accent-orange/20',
  other:    'text-text-muted bg-bg border-border',
}

const DOT_STYLES: Record<string, string> = {
  feat: 'bg-accent-green border-accent-green/50',
  fix:  'bg-accent-blue border-accent-blue/50',
}

export default function Changelog() {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activeRepo, setActiveRepo] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(false)
  const [limit, setLimit] = useState(10)

  const filtered = useMemo(() => {
    let entries = [...changelogData]

    if (activeRepo) {
      entries = entries.filter(e => e.repo === activeRepo)
    }

    if (activeTag) {
      entries = entries.filter(e => e.tags.includes(activeTag))
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      entries = entries.filter(e =>
        e.subject.toLowerCase().includes(q) ||
        e.author.toLowerCase().includes(q) ||
        e.hash.startsWith(q)
      )
    }

    entries.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime()
      return sortAsc ? diff : -diff
    })

    return limit > 0 ? entries.slice(0, limit) : entries
  }, [search, activeTag, activeRepo, sortAsc, limit])

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of changelogData) {
      for (const t of e.tags) {
        counts[t] = (counts[t] ?? 0) + 1
      }
    }
    return counts
  }, [])

  const repoCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of changelogData) {
      counts[e.repo] = (counts[e.repo] ?? 0) + 1
    }
    return counts
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-accent-green" />
          <h1 className="text-2xl font-bold text-text-primary">Changelog</h1>
        </div>
        <p className="text-sm text-text-secondary">
          Auto-generated from git history when our release workflow runs. Each entry links to the GitHub commit.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search commits…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-bg-secondary border border-border rounded-md
                       text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-green/50"
          />
        </div>

        {/* Sort */}
        <button
          onClick={() => setSortAsc(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-md
                     bg-bg-secondary text-text-secondary hover:text-text-primary hover:border-border-bright
                     transition-colors whitespace-nowrap"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortAsc ? 'rotate-180' : ''}`} />
          {sortAsc ? 'Oldest first' : 'Newest first'}
        </button>

        {/* Limit */}
        <select
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
          className="px-3 py-1.5 text-sm bg-bg-secondary border border-border rounded-md
                     text-text-secondary focus:outline-none focus:border-accent-green/50"
        >
          {LIMITS.map(l => (
            <option key={l} value={l}>{l === 0 ? 'All' : `Last ${l}`}</option>
          ))}
        </select>
      </div>

      {/* Repo filters */}
      <div className="flex flex-wrap gap-1.5 mb-6 pb-4 border-b border-border">
        <button
          onClick={() => setActiveRepo(null)}
          className={`tag text-xs border transition-colors ${
            activeRepo === null
              ? 'text-accent-green bg-accent-green/10 border-accent-green/20'
              : 'text-text-muted bg-bg border-border hover:border-border-bright'
          }`}
        >
          all repos
        </button>
        {['caboose-mcp', 'ui', 'meml'].map(repo => {
          const count = repoCounts[repo]
          if (count === 0) return null
          return (
            <button
              key={repo}
              onClick={() => setActiveRepo(activeRepo === repo ? null : repo)}
              className={`tag text-xs border transition-colors ${
                activeRepo === repo
                  ? REPO_STYLES[repo]
                  : 'text-text-muted bg-bg border-border hover:border-border-bright'
              }`}
            >
              {repo} ({count})
            </button>
          )
        })}
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setActiveTag(null)}
          className={`tag text-xs border transition-colors ${
            activeTag === null
              ? 'text-accent-green bg-accent-green/10 border-accent-green/20'
              : 'text-text-muted bg-bg border-border hover:border-border-bright'
          }`}
        >
          all ({changelogData.length})
        </button>
        {ALL_TAGS.filter(t => tagCounts[t]).map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`tag text-xs border transition-colors ${
              activeTag === tag
                ? (TAG_STYLES[tag] ?? TAG_STYLES.other)
                : 'text-text-muted bg-bg border-border hover:border-border-bright'
            }`}
          >
            {tag} ({tagCounts[tag]})
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-text-muted mb-4">
        Showing {filtered.length} of {changelogData.length} entries
      </p>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <p className="text-sm text-text-muted py-8 text-center">No commits match your filters.</p>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-0">
            {filtered.map((entry, i) => (
              <div
                key={entry.hash}
                className="relative pl-10 pb-6 animate-slide-up"
                style={{ animationDelay: `${Math.min(i * 20, 300)}ms` }}
              >
                <div className={`absolute left-3 top-1.5 w-2 h-2 rounded-full border ${
                  DOT_STYLES[entry.tags[0]] ?? 'bg-border-bright border-border'
                }`} />

                <div className="group">
                  <div className="flex flex-wrap items-start gap-2 mb-1">
                    <span className={`tag text-[10px] border font-medium ${REPO_STYLES[entry.repo]}`}>
                      {entry.repo}
                    </span>
                    {entry.tags.map(tag => (
                      <span key={tag} className={`tag text-[10px] border ${TAG_STYLES[tag] ?? TAG_STYLES.other}`}>
                        {tag}
                      </span>
                    ))}
                    <a
                      href={`${REPO_URLS[entry.repo]}/commit/${entry.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary
                                 transition-colors ml-auto"
                    >
                      <GitCommit className="w-3 h-3" />
                      <code className="font-mono">{entry.hash.slice(0, 7)}</code>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <p className="text-sm text-text-primary leading-snug">{entry.subject}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}{' '}
                    · {entry.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
