/**
 * SPECTRA 4-MINUTE QUIZ - PRECISION DRIFT-FREE TIMER
 * 
 * Uses Date.now() timestamp differential to prevent drift.
 * Dispatches status updates, warning thresholds (< 60s, < 15s), and expiry callback.
 */

(function (root) {
  'use strict';

  class SpectraTimer {
    /**
     * @param {Object} options
     * @param {number} options.durationMs Total duration in milliseconds (default 240,000 = 4 mins)
     * @param {Function} options.onTick Callback fired on every tick (approx every 100-250ms for smooth sync)
     * @param {Function} options.onExpire Callback fired when time reaches 0
     * @param {Function} options.onWarning Callback fired when time enters < 60s warning zone
     * @param {Function} options.onDanger Callback fired when time enters < 15s critical zone
     */
    constructor(options = {}) {
      this.totalDuration = options.durationMs || 240000; // 4 minutes
      this.onTick = options.onTick || null;
      this.onExpire = options.onExpire || null;
      this.onWarning = options.onWarning || null;
      this.onDanger = options.onDanger || null;

      this.startTime = null;
      this.endTime = null;
      this.remainingMs = this.totalDuration;
      this.intervalId = null;
      this.running = false;
      this.expired = false;

      // Status flags to fire threshold callbacks once
      this._warned = false;
      this._inDanger = false;
    }

    /**
     * Start countdown from current remainingMs
     */
    start() {
      if (this.running || this.expired) {
        return;
      }

      this.running = true;
      this.startTime = Date.now();
      this.endTime = this.startTime + this.remainingMs;

      // Immediate tick to reflect initial state
      this._tick();

      // Run interval at 200ms to guarantee sub-second accuracy without taxing CPU
      this.intervalId = setInterval(() => {
        this._tick();
      }, 200);
    }

    /**
     * Stop/Pause the timer
     */
    stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      if (this.running) {
        this.remainingMs = Math.max(0, this.endTime - Date.now());
        this.running = false;
      }
    }

    /**
     * Reset timer back to initial or new duration
     * @param {number} [newDurationMs]
     */
    reset(newDurationMs) {
      this.stop();
      if (typeof newDurationMs === 'number' && newDurationMs > 0) {
        this.totalDuration = newDurationMs;
      }
      this.remainingMs = this.totalDuration;
      this.startTime = null;
      this.endTime = null;
      this.expired = false;
      this._warned = false;
      this._inDanger = false;
    }

    /**
     * Internal tick processor
     */
    _tick() {
      const now = Date.now();
      const remaining = Math.max(0, this.endTime - now);
      this.remainingMs = remaining;

      const formatted = SpectraTimer.format(remaining);
      const percentRemaining = Math.max(0, Math.min(100, (remaining / this.totalDuration) * 100));

      // Warning threshold (< 60s)
      if (remaining <= 60000 && remaining > 15000) {
        if (!this._warned && typeof this.onWarning === 'function') {
          this._warned = true;
          this.onWarning(remaining, formatted);
        }
      }

      // Danger threshold (< 15s)
      if (remaining <= 15000 && remaining > 0) {
        if (!this._inDanger && typeof this.onDanger === 'function') {
          this._inDanger = true;
          this.onDanger(remaining, formatted);
        }
      }

      // Tick callback
      if (typeof this.onTick === 'function') {
        this.onTick({
          remainingMs: remaining,
          formatted: formatted,
          percentRemaining: percentRemaining,
          isWarning: remaining <= 60000 && remaining > 15000,
          isDanger: remaining <= 15000 && remaining > 0
        });
      }

      // Expiry
      if (remaining <= 0) {
        this.expired = true;
        this.stop();
        if (typeof this.onExpire === 'function') {
          this.onExpire();
        }
      }
    }

    /**
     * Get elapsed time in milliseconds
     * @returns {number}
     */
    getElapsedMs() {
      if (!this.startTime) return 0;
      return Math.min(this.totalDuration, this.totalDuration - this.remainingMs);
    }

    /**
     * Formats milliseconds into MM:SS string
     * @param {number} ms 
     * @returns {string}
     */
    static format(ms) {
      const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const mm = String(minutes).padStart(2, '0');
      const ss = String(seconds).padStart(2, '0');
      return `${mm}:${ss}`;
    }
  }

  root.SpectraTimer = SpectraTimer;

})(typeof window !== 'undefined' ? window : this);
