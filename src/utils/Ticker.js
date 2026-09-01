import Emitter from './Emitter'

import { gsap } from 'gsap/gsap-core'

class Ticker {
  /**
   * Constructor
   */
  constructor () {
    this.callbacks = []

    this.delta = 0
  }

  /**
   * Init
   */
  init () {
    gsap.ticker.add(this.tick.bind(this))
  }

  /**
   * Tick
   */
  tick(time, delta) {
    this.delta = delta

    if (this.callbacks.length > 0) {
      const cbs = this.callbacks
      this.callbacks = []
      for (let i = 0; i < cbs.length; i++) {
        const object = cbs[i]
        if (object && typeof object.callback === 'function') {
          object.callback.apply(object.context)
        }
      }
    }

    Emitter.emit('tick', time * 1000)
  }

  /**
   * Next tick
   */
  nextTick (callback, context) {
    this.callbacks.push({
      callback,
      context
    })
  }
}

export default new Ticker()
