/**
 * AudioEngine.js
 * Programmatic Web Audio API synthesizer for tactile interface feedback.
 * 0kB external assets. Muted by default. Fully respects user control.
 */

class AudioEngine {
  constructor() {
    this.ctx = null
    this.enabled = false
    this.initialized = false

    // Read stored preference (default: false / muted)
    try {
      this.enabled = localStorage.getItem('bd_sound_enabled') === 'true'
    } catch (_) {
      this.enabled = false
    }

    // Auto-attach micro-sounds to interactive elements
    if (typeof window !== 'undefined') {
      window.addEventListener('DOMContentLoaded', () => this.attachListeners())
    }
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  toggle() {
    this.ensureContext()
    this.enabled = !this.enabled
    try {
      localStorage.setItem('bd_sound_enabled', this.enabled ? 'true' : 'false')
    } catch (_) {}

    window.dispatchEvent(
      new CustomEvent('sound:state-changed', {
        detail: { enabled: this.enabled },
      })
    )

    if (this.enabled) {
      this.playChime()
    }
    return this.enabled
  }

  isEnabled() {
    return this.enabled
  }

  /**
   * Tactile Mechanical Click (Button & Link Taps)
   */
  playClick() {
    if (!this.enabled) return
    this.ensureContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.025)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.025)
  }

  /**
   * Smooth Frequency Tick (Tabs, Accordions, Sliders)
   */
  playTab() {
    if (!this.enabled) return
    this.ensureContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.04)

    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.04)
  }

  /**
   * Harmonic Glass Chime (Modals, Lightboxes, Success actions)
   */
  playChime() {
    if (!this.enabled) return
    this.ensureContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const freqs = [523.25, 659.25, 783.99] // C5, E5, G5 major triad

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)

      const startVol = 0.04 / (idx + 1)
      gain.gain.setValueAtTime(startVol, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now + idx * 0.02)
      osc.stop(now + 0.38)
    })
  }

  attachListeners() {
    // Listen for tab button clicks & quick toggles
    document.querySelectorAll('.js-service-tab, .js-toggle-chat, .js-open-lightbox').forEach((el) => {
      el.addEventListener('click', () => this.playTab())
    })

    // Listen for modal opening triggers
    document.querySelectorAll('.js-open-quote, .js-open-lightbox, .js-toggle-chat, .js-open-schedule, .js-open-resume').forEach((el) => {
      el.addEventListener('click', () => this.playChime())
    })

    // Listen for modal close triggers
    document.querySelectorAll('.js-close-schedule, .js-close-resume, .js-close-lightbox').forEach((el) => {
      el.addEventListener('click', () => this.playClick())
    })
  }
}

export const audioEngine = new AudioEngine()

if (typeof window !== 'undefined') {
  window.audioEngine = audioEngine
}
