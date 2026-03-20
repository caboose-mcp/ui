import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getStoredTheme(): Theme {
  try {
    const storedTheme = localStorage.getItem('theme') as Theme | null
    if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
      return storedTheme
    }
  } catch {
    // Fall back to system default if storage is unavailable
  }
  return 'system'
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch {
      return 'dark'
    }
  }
  return theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize synchronously from localStorage — safe because this app is client-side only (no SSR),
  // so localStorage is always available before the first render.
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => resolveTheme(theme))

  // Apply theme to DOM and listen for system preference changes
  useEffect(() => {
    const applyTheme = (resolved: 'light' | 'dark') => {
      const html = document.documentElement
      html.classList.remove('light', 'dark')
      html.classList.add(resolved)

      const themeColorMeta = document.querySelector('meta[name="theme-color"]')
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', resolved === 'dark' ? '#0c0c14' : '#f5f5f5')
      }
    }

    const resolved = resolveTheme(theme)
    setResolvedTheme(resolved)
    applyTheme(resolved)

    // Listen for system theme changes if using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        const newResolved = mediaQuery.matches ? 'dark' : 'light'
        setResolvedTheme(newResolved)
        applyTheme(newResolved)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem('theme', newTheme)
    } catch (error) {
      // Log and ignore storage errors so UI continues to function even if persistence fails
      console.error('Failed to persist theme to localStorage:', error)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}
