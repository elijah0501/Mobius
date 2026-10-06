<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import EducationSection from '@/components/showcase/EducationSection.vue'
import { profile } from '@/content/profile.js'

defineProps({
  split: {
    type: Boolean,
    default: false,
  },
})

const emailOpen = ref(false)
const mailRoot = ref(null)
const webLinks = computed(() => profile.links.filter((link) => !link.address))
const mailLink = computed(() => profile.links.find((link) => link.address))

function toggleEmail() {
  emailOpen.value = !emailOpen.value
}

function onDocumentPointerDown(event) {
  if (!emailOpen.value) return
  const root = mailRoot.value
  if (root && !root.contains(event.target)) emailOpen.value = false
}

function onDocumentKeyDown(event) {
  if (event.key === 'Escape') emailOpen.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onDocumentKeyDown)
})

const flipped = ref(false)
const tracking = ref(false)
const dragging = ref(false)
const tiltX = ref(0)
const tiltY = ref(0)
const spin = ref(0)
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
let hoverX = 0
let hoverY = 0
let spinVelocity = 0
let spinTarget = 0
let spinSettling = false
let flipFrom = 0
let flipTo = 0
let flipTime = 0
const flipDuration = 0.68
let wobbleOnSettle = false
let inertiaSettle = false
let followTimer = 0
let followStamp = 0
let activePointer = -1
let dragOriginX = 0
let dragOriginSpin = 0
let dragMoved = false
let dragVelocity = 0
let dragLastTime = 0
let suppressClick = false
const followHalfLife = 0.11
const followLambda = Math.LN2 / followHalfLife
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const maxTilt = 5
const dragDegreesPerWidth = 22.5
const spinStiffness = 150
const spinDamping = 2 * Math.sqrt(spinStiffness)
const settleOmega = 6.5
const settleZeta = 0.32
const settleStiffness = settleOmega * settleOmega
const settleDamping = 2 * settleZeta * settleOmega

const tiltStyle = computed(() => ({
  transform: `rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg) translateZ(0.2px)`,
}))

const spinStyle = computed(() => ({
  transform: `rotateY(${spin.value}deg)`,
}))

const sheenStyle = computed(() => ({
  '--sheen-x': `${sheenX.value}%`,
  '--sheen-y': `${sheenY.value}%`,
  '--letter-shine': letterShine.value.toFixed(3),
}))

function onPointerDown(event) {
  if (event.button !== 0) return
  activePointer = event.pointerId
  dragOriginX = event.clientX
  dragOriginSpin = spin.value
  dragMoved = false
  suppressClick = false
  dragVelocity = 0
  dragLastTime = performance.now()
  spinSettling = false
  wobbleOnSettle = false
  inertiaSettle = false
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // Drag still follows the pointer while it remains over the badge.
  }
}

function onPointerMove(event) {
  if (activePointer === event.pointerId) {
    const dx = event.clientX - dragOriginX
    if (!dragMoved && Math.abs(dx) > 8) {
      dragMoved = true
      dragging.value = true
    }
    if (dragMoved) {
      const width = event.currentTarget.getBoundingClientRect().width
      const next = dragOriginSpin + (dx / width) * dragDegreesPerWidth
      const now = performance.now()
      const dt = Math.max(0.008, (now - dragLastTime) / 1000)
      dragVelocity = (next - spin.value) / dt
      dragLastTime = now
      spin.value = next
      syncFlipped()
      tiltTarget.x = 0
      tiltTarget.y = 0
      tracking.value = true
      startFollow()
      return
    }
  }
  if (activePointer !== -1 || event.pointerType !== 'mouse' || reduceMotion.matches) return
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

function onPointerUp(event) {
  if (event.pointerId !== activePointer) return
  const held = event.currentTarget
  activePointer = -1
  dragging.value = false
  try {
    if (held.hasPointerCapture?.(event.pointerId)) held.releasePointerCapture(event.pointerId)
  } catch {
    // The pointer was never captured.
  }
  if (!dragMoved) return
  suppressClick = true
  const rect = held.getBoundingClientRect()
  const inside =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  settleDrag()
  if (!inside) restPointer()
}

function onPointerLeave() {
  if (activePointer !== -1) return
  restPointer()
}

function onClick() {
  if (suppressClick) {
    suppressClick = false
    return
  }
  beginFlip()
}

function beginFlip() {
  const next = spin.value + 180
  if (reduceMotion.matches) {
    spin.value = normalize(next)
    spinTarget = spin.value
    spinVelocity = 0
    syncFlipped()
    return
  }
  spinTarget = next
  flipFrom = spin.value
  flipTo = next
  flipTime = 0
  spinVelocity = 0
  spinSettling = true
  wobbleOnSettle = true
  inertiaSettle = false
  tiltTarget.x = 0
  tiltTarget.y = 0
  startFollow()
}

function settleDrag() {
  let target = Math.round(spin.value / 180) * 180
  if (dragVelocity !== 0) {
    const projected = spin.value + dragVelocity * 0.18
    if (Math.abs(projected - target) > 90 && Math.abs(dragVelocity) > 220) {
      target += Math.sign(dragVelocity) * 180
    }
  }
  if (reduceMotion.matches) {
    spin.value = normalize(target)
    spinTarget = spin.value
    spinVelocity = 0
    syncFlipped()
    return
  }
  spinTarget = target
  spinVelocity = clamp(dragVelocity, -720, 720)
  spinSettling = true
  wobbleOnSettle = false
  inertiaSettle = false
  startFollow()
}

function restPointer() {
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
  hoverX = damp(hoverX, tiltTarget.x, dt)
  hoverY = damp(hoverY, tiltTarget.y, dt)
  sheenX.value = damp(sheenX.value, sheenTarget.x, dt)
  sheenY.value = damp(sheenY.value, sheenTarget.y, dt)
  letterShine.value = damp(letterShine.value, shineTarget, dt)
  stepSpin(dt)
  tiltX.value = hoverX
  tiltY.value = hoverY
  const settled =
    !spinSettling &&
    Math.abs(tiltTarget.x - hoverX) < 0.02 &&
    Math.abs(tiltTarget.y - hoverY) < 0.02 &&
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

function stepSpin(dt) {
  if (!spinSettling) return
  if (wobbleOnSettle) {
    const previous = spin.value
    flipTime += dt
    const progress = Math.min(1, flipTime / flipDuration)
    const eased = progress * progress * progress * (progress * (progress * 6 - 15) + 10)
    spin.value = flipFrom + (flipTo - flipFrom) * eased
    syncFlipped()
    if (progress < 0.88) return
    spinVelocity = (spin.value - previous) / dt
    spinTarget = flipTo
    wobbleOnSettle = false
    inertiaSettle = true
  }
  const stiffness = inertiaSettle ? settleStiffness : spinStiffness
  const damping = inertiaSettle ? settleDamping : spinDamping
  const accel = -stiffness * (spin.value - spinTarget) - damping * spinVelocity
  spinVelocity += accel * dt
  spin.value += spinVelocity * dt
  syncFlipped()
  const speedLimit = inertiaSettle ? 3 : 8
  if (Math.abs(spin.value - spinTarget) < 0.15 && Math.abs(spinVelocity) < speedLimit) {
    spin.value = normalize(spinTarget)
    spinTarget = spin.value
    spinVelocity = 0
    spinSettling = false
    inertiaSettle = false
    syncFlipped()
  }
}

function damp(current, target, dt) {
  return target + (current - target) * Math.exp(-followLambda * dt)
}

function snapFollow() {
  hoverX = tiltTarget.x
  hoverY = tiltTarget.y
  tiltX.value = hoverX
  tiltY.value = hoverY
  sheenX.value = sheenTarget.x
  sheenY.value = sheenTarget.y
  letterShine.value = shineTarget
}

function syncFlipped() {
  const turns = normalize(spin.value)
  flipped.value = turns > 90 && turns < 270
}

function normalize(angle) {
  return ((angle % 360) + 360) % 360
}

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onDocumentKeyDown)
  if (followTimer) clearTimeout(followTimer)
  followTimer = 0
})

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
</script>

<template>
  <section
    class="showcase-section about-section reveal"
    :class="{ 'about-section--split': split }"
    aria-label="About"
  >
    <div class="about-layout">
      <div class="about-profile">
      <button
        type="button"
        class="about-portrait"
        :class="{ 'is-flipped': flipped, 'is-tracking': tracking, 'is-dragging': dragging }"
        :style="sheenStyle"
        :aria-pressed="flipped"
        aria-label="Elijah portrait badge"
        @click="onClick"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @pointerleave="onPointerLeave"
      >
        <span class="about-portrait__tilt" :style="tiltStyle">
          <span class="about-portrait__spin" :style="spinStyle">
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
            <div class="about-heading">
              <h1 class="about-name">{{ profile.name }}</h1>
              <p class="about-degree">PhD</p>
            </div>
            <p v-if="profile.tagline" class="about-tagline">{{ profile.tagline }}</p>
            <p class="about-summary">{{ profile.summary }}</p>
            <div v-if="!split" class="about-meta">
              <div v-for="field in profile.fields" :key="field.label" class="meta-item">
                <span class="meta-label">{{ field.label }}</span>
                <span class="meta-value">{{ field.value }}</span>
              </div>
            </div>
            <div class="about-social">
              <a
                v-for="link in webLinks"
                :key="link.label"
                class="about-link"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
              >{{ link.label }}</a>
              <span v-if="mailLink" ref="mailRoot" class="about-mail">
                <button
                  type="button"
                  class="about-link"
                  :aria-expanded="emailOpen"
                  aria-controls="about-mail-bubble"
                  @click="toggleEmail"
                >{{ mailLink.label }}</button>
                <Transition name="about-mail">
                  <span
                    v-if="emailOpen"
                    id="about-mail-bubble"
                    class="about-mail__bubble"
                    role="dialog"
                    aria-label="Email address"
                  >
                    <span class="about-mail__address">{{ mailLink.address }}</span>
                    <a class="about-mail__send" :href="mailLink.href" aria-label="Open email">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M21 3 10.5 13.5" />
                        <path d="m21 3-6.5 18-4-7.5L3 9.5 21 3z" />
                      </svg>
                    </a>
                  </span>
                </Transition>
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
      <EducationSection v-if="split" embedded />
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

.about-profile {
  display: contents;
}

.about-section--split .about-layout {
  grid-template-columns: minmax(0, 1.32fr) minmax(0, 0.56fr);
  align-items: start;
  gap: 6rem;
}

.about-section--split .about-layout > :deep(.education-panel) {
  margin-top: calc(7rem / 2 - 1rem * 1.45 / 2);
}

.about-section--split .about-profile {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    'photo heading'
    'summary summary'
    'social social';
  column-gap: 4rem;
  row-gap: 2rem;
  align-items: center;
}

.about-section--split .about-card,
.about-section--split .about-content,
.about-section--split .about-info {
  display: contents;
}

.about-section--split .about-portrait {
  grid-area: photo;
  width: 5rem;
  height: 5rem;
  justify-self: start;
  margin-left: 2rem;
}

.about-section--split .about-heading {
  grid-area: heading;
  align-items: baseline;
  justify-content: flex-start;
  gap: 1rem;
  margin: 0;
}

.about-section--split .about-degree {
  margin-right: 0;
  font-size: 0.8rem;
}

.about-section--split .about-name {
  font-size: 2.5rem;
}

.about-section--split .about-summary {
  grid-area: summary;
  margin: 0;
  font-size: 1rem;
  line-height: 1.65;
}

.about-section--split .about-social {
  grid-area: social;
  margin-top: 0.15rem;
  padding-top: 0.95rem;
}

.about-section--split .about-portrait__name,
.about-section--split .about-portrait__latin {
  font-size: 0.56rem;
}

.about-section--split .about-portrait__latin {
  letter-spacing: 0.12em;
}

.about-section--split .about-portrait__seal {
  font-size: 1.49rem;
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
  transition: none;
}

.about-portrait.is-dragging {
  cursor: grabbing;
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
      ellipse 36% 28% at var(--sheen-x) var(--sheen-y),
      rgb(255 255 255 / 0.36) 0%,
      rgb(255 255 255 / 0.12) 52%,
      transparent 80%
    ),
    radial-gradient(
      ellipse 74% 62% at var(--sheen-x) var(--sheen-y),
      rgb(255 255 255 / 0.14) 0%,
      rgb(255 255 255 / 0) 72%
    ),
    radial-gradient(
      circle at var(--sheen-x) var(--sheen-y),
      #e2e6e9 0%,
      #c4cbcf 30%,
      #9aa2a8 58%,
      #6c747a 100%
    );
  box-shadow:
    0 16px 28px rgb(0 0 0 / 0.5),
    inset 0 0 22px rgb(40 46 52 / 0.14);
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
  text-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
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
  font-size: 3.74rem;
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
    0.18px 0.22px 0.35px rgb(24 28 32 / 0.92),
    0.31px 0.37px 0.55px rgb(12 16 20 / 0.4),
    -0.14px -0.16px 0.35px rgb(255 255 255 / 0.72);
}

.about-portrait__name-face {
  background:
    linear-gradient(
      -39deg,
      transparent 28%,
      rgb(255 255 255 / var(--letter-shine)) 66%,
      transparent 84%
    ),
    linear-gradient(
      -39deg,
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

.about-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin: 0 0 1.05rem;
}

.about-name {
  margin: 0;
  font-size: 1.65rem;
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: 0.01em;
  color: var(--ink);
}

.about-degree {
  margin: 0 calc(2ch - 0.22em) 0 0;
  flex-shrink: 0;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.22em;
  --foil-gold-deep: color-mix(in srgb, var(--foil-gold-lo) 50%, white);
  background-image: linear-gradient(
    118deg,
    var(--foil-gold-hi) 0%,
    var(--foil-gold) 20%,
    var(--foil-gold-deep) 38%,
    var(--foil-gold-hi) 52%,
    #fff6d6 60%,
    var(--foil-gold) 72%,
    var(--foil-gold-deep) 88%,
    var(--foil-gold) 100%
  );
  background-size: 220% 100%;
  background-position: var(--brand-foil-x) 50%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.about-tagline {
  margin: -0.45rem 0 1.05rem;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--muted);
}

.about-summary {
  margin: 0 0 1.5rem;
  font-size: 1rem;
  line-height: 1.75;
  color: var(--ink);
  text-align: justify;
}

.meta-value {
  min-width: 0;
  font-size: 1rem;
  line-height: 1.45;
  color: var(--ink);
}

.about-link {
  display: inline-block;
  padding: 0.22rem 0.7rem;
  border-radius: 999px;
  background: rgba(245, 240, 232, 0.04);
  border: 1px solid var(--line);
  font: inherit;
  color: var(--muted);
  white-space: nowrap;
  text-decoration: none;
}

.about-link:hover,
.about-link:focus-visible {
  color: var(--ink);
  border-color: var(--foil-gold-lo);
}

button.about-link {
  cursor: pointer;
  appearance: none;
}

.about-mail {
  position: relative;
  display: inline-flex;
}

.about-mail__bubble {
  position: absolute;
  left: 50%;
  top: calc(100% + 0.62rem);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.38rem 0.38rem 0.38rem 0.72rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: color-mix(in srgb, var(--panel) 88%, white);
  box-shadow: 0 12px 28px rgb(0 0 0 / 0.38);
  white-space: nowrap;
  transform: translateX(-50%);
  transform-origin: center top;
}

.about-mail-enter-active {
  animation: about-mail-in 0.34s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}

.about-mail-leave-active {
  animation: about-mail-out 0.24s cubic-bezier(0.22, 0.61, 0.36, 1) both;
  pointer-events: none;
}

@keyframes about-mail-in {
  from {
    opacity: 0;
    translate: 0 -0.45rem;
    scale: 0.92;
  }
  to {
    opacity: 1;
    translate: 0 0;
    scale: 1;
  }
}

@keyframes about-mail-out {
  from {
    opacity: 1;
    translate: 0 0;
    scale: 1;
  }
  to {
    opacity: 0;
    translate: 0 -0.35rem;
    scale: 0.94;
  }
}

.about-mail__bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  top: -0.28rem;
  width: 0.55rem;
  height: 0.55rem;
  background: color-mix(in srgb, var(--panel) 88%, white);
  border-top: 1px solid var(--line);
  border-left: 1px solid var(--line);
  transform: translateX(-50%) rotate(45deg);
}

.about-mail__address {
  font-size: 0.82rem;
  line-height: 1;
  color: var(--ink);
}

.about-mail__send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.65rem;
  height: 1.65rem;
  border: 1px solid var(--foil-gold-lo);
  border-radius: 50%;
  background: rgb(212 175 55 / 0.12);
  color: var(--foil-gold-hi);
}

.about-mail__send svg {
  width: 0.86rem;
  height: 0.86rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.about-mail__send:hover,
.about-mail__send:focus-visible {
  color: var(--ink);
  background: rgb(212 175 55 / 0.28);
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
  align-items: baseline;
  gap: 0.8rem;
}

.meta-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  width: 6.6rem;
  flex-shrink: 0;
}

@media (max-width: 960px) {
  .about-section--split .about-layout {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 2.4rem;
  }

  .about-section--split .about-layout > :deep(.education-panel) {
    margin-top: 0;
  }
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

  .about-mail-enter-active,
  .about-mail-leave-active {
    animation: none;
  }
}

@media (max-width: 640px) {
  .about-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .about-heading {
    width: 100%;
    justify-content: center;
    gap: 0.85rem;
  }

  .about-degree {
    margin-right: 0;
  }

  .about-summary {
    text-align: center;
  }

  .about-meta {
    align-items: center;
  }

  .meta-item {
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }

  .meta-label {
    width: auto;
  }

  .about-social {
    justify-content: center;
  }

  .about-mail__bubble {
    left: auto;
    right: 0;
    transform: none;
    transform-origin: right top;
  }

  .about-mail__bubble::after {
    left: auto;
    right: 0.85rem;
    transform: rotate(45deg);
  }

  .about-section--split .about-layout {
    align-items: stretch;
    gap: 2.4rem;
  }

  .about-section--split .about-heading {
    justify-content: flex-start;
    width: auto;
  }

  .about-section--split .about-summary,
  .about-section--split .about-content {
    text-align: left;
  }

  .about-section--split .about-social {
    justify-content: flex-start;
  }
}
</style>
