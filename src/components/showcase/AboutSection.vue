<script setup>
import { computed, onUnmounted, ref } from 'vue'

const flipped = ref(false)
const tracking = ref(false)
const tiltX = ref(0)
const tiltY = ref(0)
const restSheen = { x: 24, y: 18 }
const sheenTravel = 18
const sheenLimit = { min: 6, max: 94 }
const restShine = 0.69
const lightNorm = Math.hypot(restSheen.x - 50, restSheen.y - 50)
const lightNx = (restSheen.x - 50) / lightNorm
const lightNy = (restSheen.y - 50) / lightNorm
const sheenX = ref(restSheen.x)
const sheenY = ref(restSheen.y)
const letterShine = ref(restShine)
const tiltTarget = { x: 0, y: 0 }
const sheenTarget = { x: restSheen.x, y: restSheen.y }
let shineTarget = restShine
let followTimer = 0
let followStamp = 0
const followHalfLife = 0.11
const followLambda = Math.LN2 / followHalfLife
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const maxTilt = 5

const tiltStyle = computed(() => ({
  transform: `rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg)`,
}))

const plateReach = 0.35

const sheenStyle = computed(() => {
  const dx = ((50 - sheenX.value) / 50) * plateReach
  const dy = ((50 - sheenY.value) / 50) * plateReach
  const plateAngle = (Math.atan2(sheenX.value - 50, 50 - sheenY.value) * 180) / Math.PI
  return {
    '--sheen-x': `${sheenX.value}%`,
    '--sheen-y': `${sheenY.value}%`,
    '--plate-dx': `${dx.toFixed(2)}px`,
    '--plate-dy': `${dy.toFixed(2)}px`,
    '--plate-angle': `${plateAngle.toFixed(2)}deg`,
    '--letter-shine': letterShine.value.toFixed(3),
  }
})

function onPointerMove(event) {
  if (event.pointerType !== 'mouse' || reduceMotion.matches) return
  const rect = event.currentTarget.getBoundingClientRect()
  let px = ((event.clientX - rect.left) / rect.width - 0.5) * 2
  let py = ((event.clientY - rect.top) / rect.height - 0.5) * 2
  const dist = Math.hypot(px, py)
  if (dist > 1) {
    px /= dist
    py /= dist
  }
  tiltTarget.x = py * maxTilt
  tiltTarget.y = -px * maxTilt
  const pointerX = ((event.clientX - rect.left) / rect.width) * 100
  const pointerY = ((event.clientY - rect.top) / rect.height) * 100
  const nx = pointerX / 50 - 1
  const ny = pointerY / 50 - 1
  sheenTarget.x = clamp(restSheen.x + nx * sheenTravel, sheenLimit.min, sheenLimit.max)
  sheenTarget.y = clamp(restSheen.y + ny * sheenTravel, sheenLimit.min, sheenLimit.max)
  const facing = clamp(nx * lightNx + ny * lightNy, -1, 1)
  shineTarget = 0.38 + 0.62 * ((facing + 1) / 2)
  tracking.value = true
  startFollow()
}

function onPointerLeave() {
  tiltTarget.x = 0
  tiltTarget.y = 0
  sheenTarget.x = restSheen.x
  sheenTarget.y = restSheen.y
  shineTarget = restShine
  tracking.value = false
  startFollow()
}

function startFollow() {
  if (reduceMotion.matches) {
    snapFollow()
    return
  }
  if (followTimer) return
  followStamp = 0
  followTimer = window.setTimeout(() => stepFollow(performance.now()), 16)
}

function stepFollow(now) {
  const dt = followStamp ? Math.min(0.05, (now - followStamp) / 1000) : 1 / 60
  followStamp = now
  tiltX.value = damp(tiltX.value, tiltTarget.x, dt)
  tiltY.value = damp(tiltY.value, tiltTarget.y, dt)
  sheenX.value = damp(sheenX.value, sheenTarget.x, dt)
  sheenY.value = damp(sheenY.value, sheenTarget.y, dt)
  letterShine.value = damp(letterShine.value, shineTarget, dt)
  const settled =
    Math.abs(tiltTarget.x - tiltX.value) < 0.02 &&
    Math.abs(tiltTarget.y - tiltY.value) < 0.02 &&
    Math.abs(sheenTarget.x - sheenX.value) < 0.05 &&
    Math.abs(sheenTarget.y - sheenY.value) < 0.05 &&
    Math.abs(shineTarget - letterShine.value) < 0.004
  if (settled) {
    snapFollow()
    followTimer = 0
    followStamp = 0
    return
  }
  followTimer = window.setTimeout(() => stepFollow(performance.now()), 16)
}

function damp(current, target, dt) {
  return target + (current - target) * Math.exp(-followLambda * dt)
}

function snapFollow() {
  tiltX.value = tiltTarget.x
  tiltY.value = tiltTarget.y
  sheenX.value = sheenTarget.x
  sheenY.value = sheenTarget.y
  letterShine.value = shineTarget
}

onUnmounted(() => {
  if (followTimer) clearTimeout(followTimer)
  followTimer = 0
})

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
</script>

<template>
  <section class="showcase-section about-section reveal" aria-label="About">
    <div class="about-layout">
      <button
        type="button"
        class="about-portrait"
        :class="{ 'is-flipped': flipped, 'is-tracking': tracking }"
        :style="sheenStyle"
        :aria-pressed="flipped"
        aria-label="Elijah portrait badge"
        @click="flipped = !flipped"
        @pointermove="onPointerMove"
        @pointerleave="onPointerLeave"
      >
        <span class="about-portrait__tilt" :style="tiltStyle">
          <span class="about-portrait__spin">
            <span class="about-portrait__face about-portrait__face--front">
              <span class="about-portrait__glaze" aria-hidden="true"></span>
            </span>
            <span class="about-portrait__face about-portrait__face--back">
              <span class="about-portrait__name">
                <span class="about-portrait__latin">
                  <span class="about-portrait__name-shade" aria-hidden="true">Elijah</span>
                  <span class="about-portrait__name-face">Elijah</span>
                </span>
                <span class="about-portrait__seal" lang="zh-Hant">
                  <span class="about-portrait__name-shade" aria-hidden="true">張</span>
                  <span class="about-portrait__name-face">張</span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </button>
      <div class="about-card">
        <div class="about-content">
          <div class="about-info">
          <div class="placeholder-text name" style="width: 220px; height: 2rem; margin-bottom: 0.6rem;"></div>
          <div class="placeholder-text tagline" style="width: 300px; height: 1.1rem; margin-bottom: 1.5rem;"></div>
          <div class="placeholder-text" style="margin-bottom: 0.6rem;"></div>
          <div class="placeholder-text" style="margin-bottom: 0.6rem;"></div>
          <div class="placeholder-text" style="width: 90%; margin-bottom: 0.6rem;"></div>
          <div class="placeholder-text" style="width: 75%; margin-bottom: 1.5rem;"></div>
          <div class="about-meta">
            <div class="meta-item">
              <span class="meta-label">Location</span>
              <div class="placeholder-text" style="width: 120px; height: 0.9rem;"></div>
            </div>
            <div class="meta-item">
              <span class="meta-label">Institution</span>
              <div class="placeholder-text" style="width: 160px; height: 0.9rem;"></div>
            </div>
            <div class="meta-item">
              <span class="meta-label">Interests</span>
              <div class="placeholder-text" style="width: 200px; height: 0.9rem;"></div>
            </div>
          </div>
          <div class="about-social">
            <span class="placeholder-tag">GitHub</span>
            <span class="placeholder-tag">LinkedIn</span>
            <span class="placeholder-tag">Scholar</span>
            <span class="placeholder-tag">Email</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@font-face {
  font-family: 'Chong Xi Small Seal';
  src: url('../../assets/fonts/chongxi_seal.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+5F35;
}

.about-section {
  padding-top: calc(100px);
}

.about-layout {
  display: grid;
  grid-template-columns: minmax(14.52rem, 1fr) minmax(0, 53.5rem);
  align-items: center;
  width: 100%;
}

@property --ring-turn {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@property --sheen-x {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 24%;
}

@property --sheen-y {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 18%;
}

@property --plate-dx {
  syntax: '<length>';
  inherits: true;
  initial-value: 0.18px;
}

@property --plate-dy {
  syntax: '<length>';
  inherits: true;
  initial-value: 0.22px;
}

@property --plate-angle {
  syntax: '<angle>';
  inherits: true;
  initial-value: -39deg;
}

@property --letter-shine {
  syntax: '<number>';
  inherits: true;
  initial-value: 0.69;
}

.about-portrait {
  width: 14.52rem;
  height: 14.52rem;
  justify-self: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  perspective: 320px;
  appearance: none;
}

.about-portrait:focus-visible {
  outline: 2px solid var(--accent-line);
  outline-offset: 5px;
}

.about-portrait__tilt,
.about-portrait__spin {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.about-portrait__tilt {
  transition: none;
}

.about-portrait__spin {
  transition: transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.about-portrait.is-flipped .about-portrait__spin {
  transform: rotateY(180deg);
}

.about-portrait__face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 50%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.about-portrait__face--front {
  border-radius: 50%;
  background:
    url('@/assets/photo.png') center 42% / 124% no-repeat;
  box-shadow: 0 16px 28px rgb(0 0 0 / 0.5);
}

.about-portrait__face--front::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 3;
  border-radius: 50%;
  padding: 1px;
  background: conic-gradient(
    from var(--ring-turn),
    var(--foil-gold) 0%,
    var(--foil-gold-lo) 62%,
    var(--foil-gold) 78%,
    var(--foil-gold-hi) 86%,
    #fff6d6 90%,
    var(--foil-gold-hi) 94%,
    var(--foil-gold) 100%
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
  pointer-events: none;
  animation: badge-ring-turn 10s linear infinite;
}

@keyframes badge-ring-turn {
  to {
    --ring-turn: 360deg;
  }
}

.about-portrait__glaze {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: 50%;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse 62% 18% at var(--sheen-x) var(--sheen-y),
      rgb(255 255 255 / 0.92) 0%,
      rgb(255 255 255 / 0.35) 42%,
      transparent 72%
    ),
    radial-gradient(
      ellipse 88% 46% at var(--sheen-x) var(--sheen-y),
      rgb(255 255 255 / 0.38) 0%,
      transparent 58%
    ),
    radial-gradient(
      circle at var(--sheen-x) var(--sheen-y),
      transparent 36%,
      rgb(8 12 16 / 0.2) 100%
    );
}

.about-portrait__face--back {
  display: grid;
  place-items: center;
  transform: rotateY(180deg);
  background:
    radial-gradient(
      ellipse 12% 9% at var(--sheen-x) var(--sheen-y),
      rgb(255 255 255 / 0.98) 0%,
      rgb(255 255 255 / 0.42) 40%,
      transparent 72%
    ),
    radial-gradient(
      ellipse 42% 36% at var(--sheen-x) var(--sheen-y),
      rgb(255 255 255 / 0.22) 0%,
      rgb(255 255 255 / 0) 64%
    ),
    radial-gradient(
      circle at var(--sheen-x) var(--sheen-y),
      #f3f5f6 0%,
      #c3cacf 26%,
      #8d959b 54%,
      #5c646a 100%
    );
  box-shadow:
    0 16px 28px rgb(0 0 0 / 0.5),
    inset 0 0 16px rgb(30 36 42 / 0.22);
}

.about-portrait__name {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.42rem;
  line-height: 1;
  gap: 1lh;
  pointer-events: none;
}

.about-portrait__latin,
.about-portrait__seal {
  display: grid;
  place-items: center;
}

.about-portrait__latin {
  font-family: 'Alegreya SC', 'Times New Roman', serif;
  font-size: 1.42rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  line-height: 1;
}

.about-portrait__seal {
  font-family: 'Chong Xi Small Seal', serif;
  font-size: 1.72rem;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1;
}

.about-portrait__name-shade,
.about-portrait__name-face {
  grid-area: 1 / 1;
}

.about-portrait__name-shade {
  color: transparent;
  text-shadow:
    var(--plate-dx) var(--plate-dy) 0.08px rgb(24 28 32 / 0.92),
    calc(var(--plate-dx) * 1.7) calc(var(--plate-dy) * 1.7) 0.28px rgb(12 16 20 / 0.4),
    calc(var(--plate-dx) * -0.75) calc(var(--plate-dy) * -0.75) 0 rgb(255 255 255 / 0.88);
}

.about-portrait__name-face {
  background:
    linear-gradient(
      var(--plate-angle),
      transparent 28%,
      rgb(255 255 255 / var(--letter-shine)) 66%,
      transparent 84%
    ),
    linear-gradient(
      var(--plate-angle),
      #4e565c 0%,
      #7d868d 26%,
      #b7c0c6 48%,
      #f4f7f8 70%,
      #d5dce0 86%,
      #8e979e 100%
    );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}


.about-card {
  width: 100%;
  max-width: 53.5rem;
  min-width: 0;
  margin: 0;
  justify-self: end;
}

.about-content {
  display: flex;
  align-items: flex-start;
}

.about-info {
  flex: 1;
  min-width: 0;
}

.about-social {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.8rem;
  padding-top: 1.2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.about-meta {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.meta-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  width: 80px;
  flex-shrink: 0;
}

@media (max-width: 760px) {
  .about-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 1.6rem;
  }

  .about-card {
    width: 100%;
    flex-basis: auto;
  }

  .about-portrait {
    width: 11.5rem;
    height: 11.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .about-portrait,
  .about-portrait__tilt,
  .about-portrait__spin {
    transition: none;
  }

  .about-portrait__face--front::after {
    animation: none;
  }
}

@media (max-width: 640px) {
  .about-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .about-meta {
    align-items: center;
  }

  .meta-item {
    flex-direction: column;
    gap: 0.3rem;
  }

  .meta-label {
    width: auto;
  }

  .about-social {
    justify-content: center;
  }
}
</style>
