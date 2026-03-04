<template>
  <section class="visitor-section">
    <!-- Full-width map -->
    <div ref="mapContainer" class="map-container">
      <div v-if="loading" class="map-placeholder">
        <div class="map-loading-ring"></div>
      </div>
    </div>

    <!-- Bottom gradient: fades map into footer -->
    <div class="visitor-fade-bottom"></div>
  </section>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { db, isFirebaseConfigured } from '@/firebase'

let fbRef, fbPush, fbOnValue

export default {
  name: 'VisitorMapSection',
  setup() {
    const mapContainer = ref(null)
    const loading = ref(true)
    let map = null
    let unsubscribe = null
    let markersDrawn = false

    /** Add a radar-pulse marker to the map */
    function addVisitorMarker(lat, lon, isCurrent = false, delay = 0) {
      if (!map) return
      setTimeout(() => {
        if (!map) return
        // Random animation delay so radar pulses are staggered
        const animDelay = isCurrent ? 0 : Math.random() * 4
        if (isCurrent) {
          const pulseIcon = L.divIcon({
            className: 'visitor-pulse-marker visitor-pulse-current',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
          L.marker([lat, lon], { icon: pulseIcon, interactive: false }).addTo(map)
        } else {
          const el = document.createElement('div')
          el.style.setProperty('--pulse-delay', `${animDelay}s`)
          const dotIcon = L.divIcon({
            className: 'visitor-pulse-marker visitor-pulse-radar',
            html: el.outerHTML,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
          L.marker([lat, lon], { icon: dotIcon, interactive: false }).addTo(map)
        }
      }, delay)
    }

    function initMap() {
      if (!mapContainer.value) return
      map = L.map(mapContainer.value, {
        center: [25, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        dragging: true,
        minZoom: 2,
        maxZoom: 8,
        maxBounds: [[-85, -200], [85, 200]],
        maxBoundsViscosity: 1.0
      })
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        opacity: 0.35
      }).addTo(map)
    }

    /** Record current visitor to Firebase */
    async function recordVisitor(data) {
      if (!isFirebaseConfigured || !db) return
      try {
        const visitorsRef = fbRef(db, 'visitors')
        await fbPush(visitorsRef, {
          lat: data.latitude,
          lon: data.longitude,
          country: data.country_name,
          region: data.region || '',
          city: data.city || '',
          timestamp: Date.now()
        })
      } catch {
        // Silently fail — visitor tracking is non-critical
      }
    }

    /** Subscribe to ALL visitors from Firebase */
    function subscribeToVisitors() {
      if (!isFirebaseConfigured || !db) return
      const visitorsRef = fbRef(db, 'visitors')
      unsubscribe = fbOnValue(visitorsRef, (snapshot) => {
        const data = snapshot.val()
        if (!data || markersDrawn) return
        markersDrawn = true
        const visitors = Object.values(data)
        visitors.forEach((v, i) => {
          if (v.lat && v.lon) {
            addVisitorMarker(v.lat, v.lon, false, i * 30)
          }
        })
      })
    }

    async function fetchCurrentVisitor() {
      try {
        const res = await fetch('https://ipapi.co/json/')
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        if (data.error) throw new Error(data.reason)

        await recordVisitor(data)

        if (map && data.latitude && data.longitude) {
          addVisitorMarker(data.latitude, data.longitude, true, 200)
        }
      } catch {
        // Silently fail
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      await nextTick()

      // Load Firebase database functions dynamically
      if (isFirebaseConfigured) {
        const dbModule = await import('firebase/database')
        fbRef = dbModule.ref
        fbPush = dbModule.push
        fbOnValue = dbModule.onValue
      }

      initMap()
      loading.value = false
      subscribeToVisitors()
      fetchCurrentVisitor()
    })

    onUnmounted(() => {
      if (unsubscribe) unsubscribe()
      if (map) {
        map.remove()
        map = null
      }
    })

    return {
      mapContainer,
      loading
    }
  }
}
</script>

<style scoped>
.visitor-section {
  position: relative;
  width: 100%;
  z-index: 1;
}

/* Bottom gradient: fades map into footer */
.visitor-fade-bottom {
  position: relative;
  height: 120px;
  margin-top: -120px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 0, 0, 0.5) 50%,
    #000000 100%
  );
  z-index: 3;
  pointer-events: none;
}

.map-container {
  width: 100%;
  height: 500px;
  position: relative;
  background: transparent;
}

.map-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.map-loading-ring {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(74, 144, 226, 0.15);
  border-top-color: #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .map-container {
    height: 380px;
  }
}
</style>

<!-- Unscoped styles for Leaflet custom markers -->
<style>
.visitor-pulse-marker {
  position: relative;
}

/* ── Current visitor: prominent pulse ── */
.visitor-pulse-current::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  background: #4a90e2;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow:
    0 0 8px rgba(74, 144, 226, 0.9),
    0 0 20px rgba(74, 144, 226, 0.5),
    0 0 40px rgba(74, 144, 226, 0.25);
  z-index: 2;
}

.visitor-pulse-current::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(74, 144, 226, 0.6);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: visitor-ring-pulse 2s ease-out infinite;
}

/* ── Historical visitors: radar dot with expanding ring ── */
.visitor-pulse-radar {
  --pulse-delay: 0s;
}

.visitor-pulse-radar::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(74, 144, 226, 0.8);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 4px rgba(74, 144, 226, 0.6);
  z-index: 1;
  animation: radar-dot-breathe 3s ease-in-out infinite;
  animation-delay: var(--pulse-delay);
}

.visitor-pulse-radar::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  border: 1.5px solid rgba(74, 144, 226, 0.5);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: radar-ring-expand 3s ease-out infinite;
  animation-delay: var(--pulse-delay);
}

@keyframes radar-dot-breathe {
  0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.8); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
}

@keyframes radar-ring-expand {
  0% {
    width: 5px;
    height: 5px;
    opacity: 0.6;
  }
  100% {
    width: 35px;
    height: 35px;
    opacity: 0;
  }
}

@keyframes visitor-ring-pulse {
  0% {
    width: 12px;
    height: 12px;
    opacity: 1;
  }
  100% {
    width: 60px;
    height: 60px;
    opacity: 0;
  }
}

.map-container .leaflet-container {
  background: transparent;
}

.map-container .leaflet-control-attribution {
  display: none;
}

.map-container .leaflet-tile-pane {
  opacity: 0.7;
  filter: grayscale(1) invert(0.65);
}
</style>
