/**
 * AudioEngine.js
 * Programmatic Web Audio API synthesizer for tactile interface feedback.
 * 0kB external assets. Muted by default. Fully respects user control & localStorage.
 */

class AudioEngine {
  constructor() {
    this.ctx = null
    this.enabled = false
    this.initialized = false
    this.droneGain = null
    this.droneOscs = []
    this.lastWhooshTime = 0

    // Read stored preference (default: false / muted)
    try {
      this.enabled = localStorage.getItem('bd_sound_enabled') === 'true'
    } catch (_) {
      this.enabled = false
    }

    // Auto-attach micro-sounds to interactive elements
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', () => this.attachListeners())
      } else {
        this.attachListeners()
      }
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
      this.startAmbientDrone()
    } else {
      this.stopAmbientDrone()
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
    osc.frequency.setValueAtTime(1100, now)
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.022)

    gain.gain.setValueAtTime(0.07, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.022)
  }

  /**
   * Magnetic Snap Thud (Custom Cursor Latch)
   */
  playSnap() {
    if (!this.enabled) return
    this.ensureContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(120, now)
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.035)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(240, now)

    gain.gain.setValueAtTime(0.09, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.035)
  }

  /**
   * Smooth Frequency Tick (Tabs, Accordions, Sliders, Chips)
   */
  playTab() {
    if (!this.enabled) return
    this.ensureContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(340, now)
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.035)

    gain.gain.setValueAtTime(0.05, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.035)
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

  /**
   * Deep Resonant Sub-Bass Sweep (CTA "GO" Shockwave)
   */
  playShockwave() {
    if (!this.enabled) return
    this.ensureContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(140, now)
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.5)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(350, now)
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.5)

    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.5)
  }

  /**
   * Kinetic Air Whoosh (Hero Typography Repulsion)
   */
  playKineticWhoosh() {
    if (!this.enabled) return
    const nowMs = Date.now()
    if (nowMs - this.lastWhooshTime < 140) return // Throttle
    this.lastWhooshTime = nowMs

    this.ensureContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    osc.type = 'sine'
    const startFreq = 220 + Math.random() * 80
    osc.frequency.setValueAtTime(startFreq, now)
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, now + 0.06)

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(startFreq * 1.2, now)
    filter.Q.setValueAtTime(2, now)

    gain.gain.setValueAtTime(0.025, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.06)
  }

  /**
   * Generative Harmonic Ambient Drone (Warm low-volume room chord)
   */
  startAmbientDrone() {
    if (!this.enabled || this.droneGain) return
    this.ensureContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    this.droneGain = this.ctx.createGain()
    this.droneGain.gain.setValueAtTime(0.0001, now)
    this.droneGain.gain.linearRampToValueAtTime(0.018, now + 2) // Slow fade in

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(220, now)

    this.droneGain.connect(filter)
    filter.connect(this.ctx.destination)

    const chord = [65.41, 98.0, 130.81, 164.81] // C2, G2, C3, E3 harmonic chord
    this.droneOscs = chord.map((freq) => {
      const osc = this.ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      osc.connect(this.droneGain)
      osc.start(now)
      return osc
    })
  }

  stopAmbientDrone() {
    if (!this.droneGain || !this.ctx) return
    const now = this.ctx.currentTime
    this.droneGain.gain.linearRampToValueAtTime(0.0001, now + 0.8) // Smooth fade out
    setTimeout(() => {
      this.droneOscs.forEach((osc) => {
        try {
          osc.stop()
          osc.disconnect()
        } catch (_) {}
      })
      this.droneOscs = []
      if (this.droneGain) {
        this.droneGain.disconnect()
        this.droneGain = null
      }
    }, 850)
  }

  attachListeners() {
    // Tabs, date chips, filter pills
    document.querySelectorAll('.js-service-tab, .js-toggle-chat, .js-open-lightbox, .slot-chip, .date-tab').forEach((el) => {
      el.addEventListener('click', () => this.playTab())
    })

    // Modal opening triggers
    document.querySelectorAll('.js-open-quote, .js-open-lightbox, .js-toggle-chat, .js-open-schedule, .js-open-resume, .js-sched-open').forEach((el) => {
      el.addEventListener('click', () => this.playChime())
    })

    // Modal close triggers
    document.querySelectorAll('.js-close-schedule, .js-close-resume, .js-close-lightbox').forEach((el) => {
      el.addEventListener('click', () => this.playClick())
    })

    // Global navigation and action buttons
    document.querySelectorAll('.s-nav__link, .sb__link, .site-foot__resume-btn, .schedule-btn, .s__button').forEach((el) => {
      el.addEventListener('click', () => this.playClick())
    })
  }
}

export const audioEngine = new AudioEngine()

if (typeof window !== 'undefined') {
  window.audioEngine = audioEngine
}
