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

    // Soothing No-Copyright Background Music (Erik Satie — Gymnopédie No. 1 / CC0 Kevin MacLeod)
    this.bgMusic = null
    this.bgMusicSrc = '/audio/ambient-soothing.mp3'
    this.bgTargetVolume = 0.3
    this.fadeTimer = null

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
    } catch (_) { }

    window.dispatchEvent(
      new CustomEvent('sound:state-changed', {
        detail: { enabled: this.enabled },
      })
    )

    if (this.enabled) {
      this.playChime()
      this.startBackgroundMusic()
    } else {
      this.stopBackgroundMusic()
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
   * Generative Studio Ambient Mood Player Tracks
   * 0kB external files, completely synthesized via Web Audio API oscillators, noise, and filters.
   */
  ensureAnalyser() {
    if (!this.ctx) return
    if (!this.analyser) {
      this.analyser = this.ctx.createAnalyser()
      this.analyser.fftSize = 64
      this.analyserData = new Uint8Array(this.analyser.frequencyBinCount)
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime)
      this.masterGain.connect(this.analyser)
      this.analyser.connect(this.ctx.destination)
    }
  }

  getFrequencyData() {
    if (!this.analyser || !this.analyserData) return null
    this.analyser.getByteFrequencyData(this.analyserData)
    return this.analyserData
  }

  setMasterVolume(val) {
    this.ensureContext()
    this.ensureAnalyser()
    if (!this.masterGain || !this.ctx) return
    const v = Math.max(0, Math.min(1, val))
    this.masterGain.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.05)
  }

  /**
   * Soothing No-Copyright Background Music
   * Erik Satie — Gymnopédie No. 1 (Performed by Kevin MacLeod, CC BY 3.0 / No Copyright)
   * Plays with gentle fade-in / fade-out and pure warm harmonic synth backup. ZERO noise/hiss.
   */
  startBackgroundMusic() {
    if (!this.enabled) return
    this.ensureContext()

    if (!this.bgMusic && typeof Audio !== 'undefined') {
      this.bgMusic = new Audio(this.bgMusicSrc)
      this.bgMusic.loop = true
      this.bgMusic.volume = 0
      this.bgMusic.preload = 'auto'
    }

    if (this.fadeTimer) clearInterval(this.fadeTimer)

    if (this.bgMusic) {
      const playPromise = this.bgMusic.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            const step = 0.02
            const interval = 40
            this.fadeTimer = setInterval(() => {
              if (!this.bgMusic) {
                clearInterval(this.fadeTimer)
                return
              }
              if (this.bgMusic.volume < this.bgTargetVolume) {
                this.bgMusic.volume = Math.min(
                  this.bgTargetVolume,
                  parseFloat((this.bgMusic.volume + step).toFixed(3))
                )
              } else {
                clearInterval(this.fadeTimer)
              }
            }, interval)
          })
          .catch((err) => {
            console.warn('Background music autoplay waiting for gesture or error:', err)
            this.startSynthDrone()
          })
      }
    } else {
      this.startSynthDrone()
    }

    window.dispatchEvent(
      new CustomEvent('music:state-changed', {
        detail: { playing: true, track: 'Erik Satie — Gymnopédie No. 1' },
      })
    )
  }

  stopBackgroundMusic() {
    if (this.fadeTimer) clearInterval(this.fadeTimer)

    if (this.bgMusic && !this.bgMusic.paused) {
      const step = 0.03
      const interval = 30
      this.fadeTimer = setInterval(() => {
        if (!this.bgMusic) {
          clearInterval(this.fadeTimer)
          return
        }
        if (this.bgMusic.volume > 0.03) {
          this.bgMusic.volume = Math.max(
            0,
            parseFloat((this.bgMusic.volume - step).toFixed(3))
          )
        } else {
          this.bgMusic.volume = 0
          this.bgMusic.pause()
          clearInterval(this.fadeTimer)
        }
      }, interval)
    }

    this.stopSynthDrone()

    window.dispatchEvent(
      new CustomEvent('music:state-changed', {
        detail: { playing: false },
      })
    )
  }

  /**
   * Warm pure harmonic synthesizer fallback (Cmaj7 pure sine meditation chords, NO noise/hiss)
   */
  startSynthDrone() {
    if (!this.ctx || this.droneOscs.length > 0) return
    const now = this.ctx.currentTime
    this.droneGain = this.ctx.createGain()
    this.droneGain.gain.setValueAtTime(0.0001, now)
    this.droneGain.gain.linearRampToValueAtTime(0.025, now + 1.5)

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(320, now)

    this.droneGain.connect(filter)
    filter.connect(this.ctx.destination)

    const chord = [130.81, 196.0, 246.94, 329.63]
    this.droneOscs = chord.map((freq) => {
      const osc = this.ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      osc.connect(this.droneGain)
      osc.start(now)
      return osc
    })
  }

  stopSynthDrone() {
    if (!this.droneGain || !this.ctx) return
    const now = this.ctx.currentTime
    this.droneGain.gain.linearRampToValueAtTime(0.0001, now + 0.5)
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
    }, 550)
  }

  // Aliases for compatibility
  startAmbientDrone() {
    this.startBackgroundMusic()
  }

  stopAmbientDrone() {
    this.stopBackgroundMusic()
  }

  playMoodTrack() {
    this.startBackgroundMusic()
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
