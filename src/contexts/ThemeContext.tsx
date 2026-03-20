import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('theme') as Theme | null
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        setThemeState(storedTheme)
      }
    } catch {
      // If accessing localStorage fails, fall back to the default theme ('system')
    } finally {
      setMounted(true)
    }
  }, [])

  // Update resolved theme based on system preference and user selection
  useEffect(() => {
    if (!mounted) return

    const getResolvedTheme = (): 'light' | 'dark' => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return theme
    }

    const applyTheme = (resolved: 'light' | 'dark') => {
      // Update HTML class
      const html = document.documentElement
      html.classList.remove('light', 'dark')
      html.classList.add(resolved)

      // Update theme-color meta tag
      const themeColorMeta = document.querySelector('meta[name="theme-color"]')
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', resolved === 'dark' ? '#0c0c14' : '#f5f5f5')
      }
    }

    const resolved = getResolvedTheme()
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
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem('theme', newTheme)
    } catch (error) {
      // Log and ignore storage errors so UI continues to function even if persistence fails
      console.error('Failed to persist theme to localStorage:', error)
    }
  }

  // Don't render children until hydration is complete to avoid flashing
  if (!mounted) {
    return null
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
