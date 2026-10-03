import { onMounted, onUnmounted, ref } from 'vue'

const DISTANCE = 72
const EDGE_RANGE = 48
const SPIN_DISTANCE = 180
const OMEGA = 13
const OMEGA_SPIN = 6
const EPS = 0.0015

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2
}

/** Critically damped spring. It starts from rest, so it eases in and out without overshoot. */
function spring(cur, vel, target, omega, dt) {
  const decay = Math.exp(-omega * dt)
  const offset = cur - target
  const coeff = vel + omega * offset
  return [target + (offset + coeff * dt) * decay, (vel - omega * coeff * dt) * decay]
}

/**
 * Drives the fixed header from scroll position.
 * --nav-p collapses the bar, --nav-spin turns the mark, and --nav-edge
 * fades the glass in only once content passes underneath.
 */
export function useCollapsingNav(headerRef, linksRef) {
  const compact = ref(false)
  const narrow = ref(false)
  const remeasure = ref(() => {})

  let teardown = () => {}

  onMounted(() => {
    const el = headerRef.value
    const nav = linksRef.value
    if (!el) return

    const narrowQuery = window.matchMedia('(max-width: 40rem)')
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncNarrow = () => {
      narrow.value = narrowQuery.matches
    }
    syncNarrow()
    narrowQuery.addEventListener('change', syncNarrow)

    const progress = { current: 0 }

    const syncHeight = () => {
      if (progress.current > 0) return
      document.documentElement.style.setProperty('--site-nav-height', `${el.offsetHeight}px`)
    }
    syncHeight()
    const resizeObserver = new ResizeObserver(syncHeight)
    resizeObserver.observe(el)

    const measureLabels = () => {
      if (!nav) return
      nav.querySelectorAll('.site-nav__link').forEach((anchor) => {
        const text = anchor.querySelector('.site-nav__link-text')
        if (!text) return
        anchor.style.setProperty('--label-w', `${Math.ceil(text.scrollWidth)}px`)
      })
    }
    measureLabels()
    document.fonts?.ready.then(measureLabels).catch(() => {})

    let progressStr = ''
    let edgeStr = ''
    let spinStr = ''
    let flatNow = null
    let compactNow = false
    let expandedH = 0
    let shrink = 0
    let contentTopDoc = 0
    let pCur = 0
    let pVel = 0
    let spinCur = 0
    let spinVel = 0
    let running = false
    let lastT = 0
    let disposed = false

    const readPx = (styles, name, rem) => {
      const raw = styles.getPropertyValue(name).trim()
      return raw.endsWith('rem') ? parseFloat(raw) * rem : parseFloat(raw)
    }

    const measure = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
      const styles = getComputedStyle(el)
      shrink = Math.max(0, readPx(styles, '--nav-h-max', rem) - readPx(styles, '--nav-h-min', rem))
      expandedH =
        readPx(styles, '--nav-h-max', rem) +
        parseFloat(styles.borderTopWidth) +
        parseFloat(styles.borderBottomWidth)

      const main = document.querySelector('main')
      contentTopDoc = main
        ? main.getBoundingClientRect().top +
          window.scrollY +
          parseFloat(getComputedStyle(main).paddingTop)
        : expandedH
    }

    const step = (dt) => {
      const y = Math.max(0, window.scrollY)
      const pTarget = easeInOut(Math.min(1, y / DISTANCE))
      const spinTarget = reduceQuery.matches ? 0 : Math.min(1, y / SPIN_DISTANCE)

      if (reduceQuery.matches) {
        pCur = pTarget
        pVel = 0
        spinCur = 0
        spinVel = 0
        return true
      }

      ;[pCur, pVel] = spring(pCur, pVel, pTarget, OMEGA, dt)
      pCur = Math.min(1, Math.max(0, pCur))
      ;[spinCur, spinVel] = spring(spinCur, spinVel, spinTarget, OMEGA_SPIN, dt)
      spinCur = Math.min(1, Math.max(0, spinCur))

      const settledP = Math.abs(pCur - pTarget) < EPS && Math.abs(pVel) < EPS * 10
      const settledSpin = Math.abs(spinCur - spinTarget) < EPS && Math.abs(spinVel) < EPS * 10
      if (settledP && settledSpin) {
        pCur = pTarget
        pVel = 0
        spinCur = spinTarget
        spinVel = 0
        return true
      }
      return false
    }

    const write = () => {
      const nextProgress = pCur.toFixed(3)
      if (nextProgress !== progressStr) {
        progressStr = nextProgress
        progress.current = pCur
        el.style.setProperty('--nav-p', nextProgress)
        const nextCompact = pCur > 0.5
        if (nextCompact !== compactNow) {
          compactNow = nextCompact
          compact.value = nextCompact
        }
      }

      const nextSpin = spinCur.toFixed(3)
      if (nextSpin !== spinStr) {
        spinStr = nextSpin
        el.style.setProperty('--nav-spin', nextSpin)
      }

      const headerBottom = expandedH - pCur * shrink
      const contentTop = contentTopDoc - Math.max(0, window.scrollY)
      const edge = Math.min(1, Math.max(0, (headerBottom - contentTop) / EDGE_RANGE))
      const nextEdge = edge.toFixed(3)
      if (nextEdge !== edgeStr) {
        edgeStr = nextEdge
        el.style.setProperty('--nav-edge', nextEdge)
        const nextFlat = edge === 0
        if (nextFlat !== flatNow) {
          flatNow = nextFlat
          el.classList.toggle('site-nav--flat', nextFlat)
        }
      }
    }

    const frame = (t) => {
      if (disposed) {
        running = false
        return
      }
      const dt = Math.min(0.05, (t - lastT) / 1000) || 1 / 60
      lastT = t
      const settled = step(dt)
      write()
      if (settled) {
        running = false
        return
      }
      window.requestAnimationFrame(frame)
    }

    const kick = () => {
      if (running || disposed) return
      running = true
      lastT = performance.now()
      window.requestAnimationFrame(frame)
    }

    const apply = () => {
      const y = Math.max(0, window.scrollY)
      pCur = easeInOut(Math.min(1, y / DISTANCE))
      pVel = 0
      spinCur = reduceQuery.matches ? 0 : Math.min(1, y / SPIN_DISTANCE)
      spinVel = 0
      progressStr = ''
      edgeStr = ''
      spinStr = ''
      write()
    }

    const onResize = () => {
      measure()
      measureLabels()
      apply()
    }

    measure()
    apply()
    remeasure.value = onResize

    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', onResize)

    teardown = () => {
      disposed = true
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', onResize)
      narrowQuery.removeEventListener('change', syncNarrow)
      resizeObserver.disconnect()
      remeasure.value = () => {}
    }
  })

  onUnmounted(() => {
    teardown()
  })

  return { compact, narrow, remeasure }
}
