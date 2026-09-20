/**
 * ThemeManager.js
 * Manages site-wide aesthetic palettes:
 * - sepia (Editorial Sepia: Warm cream & deep espresso)
 * - cyberpunk (Cyberpunk Dark: Obsidian, neon cyan & electric magenta)
 * - acidlime (Acid Lime Brutalist: Studio dark & electric lime)
 * - royalviolet (Royal Amethyst: Velvet obsidian & electric lilac) [NEW]
 * - solaramber (Solar Ember: Basalt carbon & solar amber gold) [NEW]
 * - monochrome (Pure Mono: Platinum paper & pure carbon)
 */
import Emitter from './Emitter'

class ThemeManager {
  constructor() {
    this.currentTheme = 'sepia'
    this.themes = [
      {
        id: 'sepia',
        name: 'Editorial Sepia',
        tagline: 'Warm cream & deep espresso',
        primary: '#fff2ed',
        secondary: '#160000',
        accent: '#ff4d6d',
        badge: 'Default',
        isDark: false,
      },
      {
        id: 'cyberpunk',
        name: 'Cyberpunk Neon',
        tagline: 'Obsidian, neon cyan & magenta',
        primary: '#0a0c16',
        secondary: '#00f0ff',
        accent: '#ff007f',
        badge: 'High Glow',
        isDark: true,
      },
      {
        id: 'acidlime',
        name: 'Acid Lime',
        tagline: 'Studio dark & electric lime',
        primary: '#0b0e0b',
        secondary: '#d4ff00',
        accent: '#00ff88',
        badge: 'Brutalist',
        isDark: true,
      },
      {
        id: 'royalviolet',
        name: 'Royal Amethyst',
        tagline: 'Velvet obsidian & electric lilac',
        primary: '#0d0818',
        secondary: '#d8b4fe',
        accent: '#f43f5e',
        badge: 'Luxury Dark',
        isDark: true,
      },
      {
        id: 'solaramber',
        name: 'Solar Ember',
        tagline: 'Basalt carbon & solar amber gold',
        primary: '#120a05',
        secondary: '#ffb326',
        accent: '#ff5500',
        badge: 'Warm Glow',
        isDark: true,
      },
      {
        id: 'monochrome',
        name: 'Pure Mono',
        tagline: 'Platinum paper & pure carbon',
        primary: '#f5f5f7',
        secondary: '#0a0a0a',
        accent: '#555555',
        badge: 'Minimal',
        isDark: false,
      },
    ]

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bd_theme')
        if (saved && this.themes.some((t) => t.id === saved)) {
          this.currentTheme = saved
        }
      } catch (_) {}

      // Apply initial theme
      this.applyTheme(this.currentTheme, false)
    }
  }

  cycleTheme() {
    const currentIndex = this.themes.findIndex((t) => t.id === this.currentTheme)
    const nextIndex = (currentIndex + 1) % this.themes.length
    const nextTheme = this.themes[nextIndex]
    this.applyTheme(nextTheme.id, true)
    return nextTheme
  }

  applyTheme(themeId, emitEvents = true) {
    if (typeof document === 'undefined') return
    const theme = this.themes.find((t) => t.id === themeId) || this.themes[0]
    this.currentTheme = theme.id

    const html = document.documentElement
    html.setAttribute('data-theme', theme.id)

    // Handle light vs dark mode helper classes
    if (theme.isDark) {
      html.classList.add('theme-is-dark')
      html.classList.remove('theme-is-light', 'theme-contrasted')
    } else {
      html.classList.add('theme-is-light', 'theme-contrasted')
      html.classList.remove('theme-is-dark')
    }

    try {
      localStorage.setItem('bd_theme', theme.id)
    } catch (_) {}

    // Update browser theme color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.primary)
    }

    if (emitEvents) {
      // Re-trigger canvas redraws across Hero & Work
      Emitter.emit('contrastchange', theme.isDark ? 'dark' : 'contrasted')
      Emitter.emit('themechange', theme)

      window.dispatchEvent(
        new CustomEvent('theme:change', {
          detail: { theme: theme.id, themeData: theme, isDark: theme.isDark },
        })
      )
    }
  }

  setTheme(themeId) {
    this.applyTheme(themeId, true)
  }

  getTheme() {
    return this.currentTheme
  }

  getCurrentThemeData() {
    return this.themes.find((t) => t.id === this.currentTheme) || this.themes[0]
  }

  getThemes() {
    return this.themes
  }
}

export const themeManager = new ThemeManager()
export default themeManager
