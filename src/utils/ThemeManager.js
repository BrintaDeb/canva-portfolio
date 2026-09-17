/**
 * ThemeManager.js
 * Manages site-wide aesthetic palettes:
 * - sepia (Editorial Sepia: Warm cream & espresso)
 * - cyberpunk (Cyberpunk Dark: Obsidian, neon cyan & electric magenta)
 * - acidlime (Acid Lime Brutalist: Studio dark & electric lime)
 * - monochrome (Monochrome Chrome: Pure carbon & platinum white)
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
        badge: 'Default',
      },
      {
        id: 'cyberpunk',
        name: 'Cyberpunk Neon',
        tagline: 'Obsidian, neon cyan & magenta',
        primary: '#00f0ff',
        secondary: '#090a0f',
        badge: 'High Glow',
      },
      {
        id: 'acidlime',
        name: 'Acid Lime',
        tagline: 'Studio dark & electric lime',
        primary: '#d4ff00',
        secondary: '#0d0f0d',
        badge: 'Brutalist',
      },
      {
        id: 'monochrome',
        name: 'Pure Mono',
        tagline: 'Carbon black & platinum',
        primary: '#f0f0f0',
        secondary: '#000000',
        badge: 'Minimal',
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

  applyTheme(themeId, emitEvents = true) {
    if (typeof document === 'undefined') return
    const theme = this.themes.find((t) => t.id === themeId) || this.themes[0]
    this.currentTheme = theme.id

    const html = document.documentElement
    html.setAttribute('data-theme', theme.id)

    // Preserve compatibility with .theme-contrasted
    if (theme.id === 'sepia') {
      html.classList.add('theme-contrasted')
    }

    try {
      localStorage.setItem('bd_theme', theme.id)
    } catch (_) {}

    if (emitEvents) {
      // Re-trigger canvas redraws across Hero & Work
      Emitter.emit('contrastchange', true)
      Emitter.emit('themechange', theme)

      window.dispatchEvent(
        new CustomEvent('theme:change', {
          detail: { theme: theme.id, themeData: theme },
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

  getThemes() {
    return this.themes
  }
}

export const themeManager = new ThemeManager()
export default themeManager
