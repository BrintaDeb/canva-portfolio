/**
 * Tilt.js — Ultra-lightweight 3D Card Perspective Tilt & Dynamic Specular Sheen
 * Designed for Bento grid cards and project showcases.
 */

export class CardTilt {
  constructor(options = {}) {
    this.selector = options.selector || '.s__cell, .s-work__card, .s-work__column, [data-tilt]'
    this.maxTilt = options.maxTilt || 5.5 // Max tilt in degrees
    this.scale = options.scale || 1.015
    this.perspective = options.perspective || 1000
    this.elements = []
    this.cleanupFns = []

    if (typeof window === 'undefined') return

    // Verify hover capability and motion preferences
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    this.init()
  }

  init() {
    this.elements = Array.from(document.querySelectorAll(this.selector))

    this.elements.forEach(el => {
      // Don't tilt if element is a modal dialog or lightbox itself
      if (el.closest('.modal-dialog') || el.closest('.project-lightbox')) return

      this.bindCard(el)
    })
  }

  bindCard(el) {
    // Ensure parent card preserves 3D transforms
    el.style.transformStyle = 'preserve-3d'
    el.style.willChange = 'transform'

    // Create or find sheen element
    let sheen = el.querySelector('.tilt-sheen')
    if (!sheen) {
      sheen = document.createElement('div')
      sheen.className = 'tilt-sheen'
      sheen.style.cssText = `
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 10;
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: inherit;
        mix-blend-mode: overlay;
      `
      el.style.position = el.style.position || 'relative'
      el.appendChild(sheen)
    }

    let rafId = null

    const onMouseEnter = () => {
      el.style.transition = 'transform 0.15s ease-out'
      sheen.style.opacity = '1'
    }

    const onMouseMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId)

      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return

        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height

        const dx = (x - 0.5) * 2
        const dy = (y - 0.5) * 2

        const rotateX = (-dy * this.maxTilt).toFixed(2)
        const rotateY = (dx * this.maxTilt).toFixed(2)

        el.style.transform = `perspective(${this.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${this.scale}, ${this.scale}, ${this.scale})`

        const px = (x * 100).toFixed(1)
        const py = (y * 100).toFixed(1)
        sheen.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255, 255, 255, 0.12) 0%, transparent 60%)`
      })
    }

    const onMouseLeave = () => {
      if (rafId) cancelAnimationFrame(rafId)

      el.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
      el.style.transform = `perspective(${this.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
      sheen.style.opacity = '0'
    }

    el.addEventListener('mouseenter', onMouseEnter, { passive: true })
    el.addEventListener('mousemove', onMouseMove, { passive: true })
    el.addEventListener('mouseleave', onMouseLeave, { passive: true })

    this.cleanupFns.push(() => {
      el.removeEventListener('mouseenter', onMouseEnter)
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
      if (sheen && sheen.parentNode) sheen.parentNode.removeChild(sheen)
    })
  }

  destroy() {
    this.cleanupFns.forEach(fn => fn())
    this.cleanupFns = []
  }
}

export default CardTilt
