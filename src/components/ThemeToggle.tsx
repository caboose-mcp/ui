import { Sun, Moon, Monitor } from 'lucide-react'
import { useThemeContext, type Theme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeContext()

  const themes: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-bg-secondary">
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-1.5 rounded-md transition-all duration-150 ${
            theme === value
              ? 'bg-accent-green/10 text-accent-green'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          title={label}
          aria-label={`Switch to ${label} theme`}
          aria-pressed={theme === value}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}
