import { onMounted, onUnmounted } from 'vue'
import { AURORA_FRAG, AURORA_VERT } from '@/lib/auroraShader'

const RENDER_SCALE = 0.45
const MAX_DIM = 900
const MAX_FPS = 30

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  const seg = Math.floor(h / 60) % 6
  const table = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ]
  const [r, g, b] = table[seg]
  return [r + m, g + m, b + m]
}

function readNumber(style, name, fallback) {
  const raw = style.getPropertyValue(name).trim().replace('%', '')
  const value = Number.parseFloat(raw)
  return Number.isFinite(value) ? value : fallback
}

function compile(gl, type, source) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/** Draws the fog field. Falls back to the CSS lobes when WebGL is unavailable. */
export function usePageAurora(hostRef, canvasRef, useCss) {
  let teardown = () => {}

  onMounted(() => {
    const canvas = canvasRef.value
    const host = hostRef.value
    if (!canvas || !host) {
      useCss.value = true
      return
    }

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
    })

    if (!gl) {
      useCss.value = true
      return
    }

    const vs = compile(gl, gl.VERTEX_SHADER, AURORA_VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, AURORA_FRAG)
    const program = vs && fs ? gl.createProgram() : null
    if (!vs || !fs || !program) {
      useCss.value = true
      return
    }
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      useCss.value = true
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, 'uRes')
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uColA = gl.getUniformLocation(program, 'uColA')
    const uColB = gl.getUniformLocation(program, 'uColB')
    const uGain = gl.getUniformLocation(program, 'uGain')

    const rootStyle = getComputedStyle(document.documentElement)
    const hue = readNumber(rootStyle, '--glow-h', 199)
    const sat = readNumber(rootStyle, '--glow-s', 65) / 100
    const lum = readNumber(rootStyle, '--glow-l', 63) / 100
    const speedDiv = readNumber(rootStyle, '--aurora-t', 1.8) || 1.8
    const gain = readNumber(rootStyle, '--aurora-gain', 0.34)

    gl.uniform3fv(uColA, hslToRgb(hue, sat, lum))
    gl.uniform3fv(uColB, hslToRgb(158, sat, lum))
    gl.uniform1f(uGain, gain)

    let width = 0
    let height = 0
    const resize = () => {
      const cw = host.clientWidth
      const ch = host.clientHeight
      const scale = Math.min(RENDER_SCALE, MAX_DIM / Math.max(cw, ch, 1))
      const w = Math.max(1, Math.round(cw * scale))
      const h = Math.max(1, Math.round(ch * scale))
      if (w === width && h === height) return
      width = w
      height = h
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      gl.uniform2f(uRes, w, h)
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    let raf = 0
    let last = 0
    const start = performance.now()
    const minDelta = 1000 / MAX_FPS

    const draw = (t) => {
      gl.uniform1f(uTime, t / speedDiv)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const frame = (now) => {
      raf = window.requestAnimationFrame(frame)
      if (document.hidden || host.clientWidth === 0) return
      if (now - last < minDelta) return
      last = now
      resize()
      draw((now - start) / 1000)
    }

    resize()
    if (reduce.matches) {
      draw(12)
    } else {
      raf = window.requestAnimationFrame(frame)
    }

    const onMotionChange = () => {
      window.cancelAnimationFrame(raf)
      if (reduce.matches) {
        resize()
        draw(12)
      } else {
        last = 0
        raf = window.requestAnimationFrame(frame)
      }
    }
    reduce.addEventListener('change', onMotionChange)

    const observer = new ResizeObserver(() => {
      if (reduce.matches) {
        resize()
        draw(12)
      }
    })
    observer.observe(host)

    teardown = () => {
      window.cancelAnimationFrame(raf)
      reduce.removeEventListener('change', onMotionChange)
      observer.disconnect()
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  })

  onUnmounted(() => {
    teardown()
  })
}
