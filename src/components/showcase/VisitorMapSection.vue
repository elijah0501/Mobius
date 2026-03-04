<template>
  <section class="showcase-section">
    <h2 class="section-title reveal">Visitor Globe</h2>
    <div class="section-title-bar reveal"></div>
    <p class="section-subtitle reveal">
      <template v-if="totalVisitors > 0">
        {{ totalVisitors }} visitors from around the world
      </template>
      <template v-else>
        Real-time visitor map
      </template>
    </p>

    <div class="glass-card visitor-card reveal">
      <!-- Visitor info bar -->
      <div class="visitor-header">
        <div class="visitor-icon">🌍</div>
        <div class="visitor-info">
          <div v-if="currentVisitor.loading" class="visitor-loading">
            <span class="loading-dot"></span>
            <span class="loading-text">Detecting your location...</span>
          </div>
          <template v-else-if="!currentVisitor.error">
            <h3 class="visitor-country">{{ currentVisitor.country }}</h3>
            <p class="visitor-detail">
              {{ currentVisitor.region }}<span v-if="currentVisitor.city">, {{ currentVisitor.city }}</span>
            </p>
            <p class="visitor-ip">IP: {{ maskIp(currentVisitor.ip) }}</p>
          </template>
          <div v-else class="visitor-error">
            <p>Location unavailable — your privacy tools may be blocking the request.</p>
          </div>
        </div>
        <!-- Live counter badge -->
        <div v-if="totalVisitors > 0" class="visitor-counter">
          <span class="counter-dot"></span>
          <span class="counter-text">{{ totalVisitors }}</span>
        </div>
      </div>

      <!-- Leaflet Map -->
      <div ref="mapContainer" class="map-container">
        <div v-if="currentVisitor.loading" class="map-placeholder">
          <div class="map-loading-ring"></div>
        </div>
      </div>

      <!-- Firebase status notice -->
      <div v-if="!firebaseActive" class="firebase-notice">
        <span>📡 Configure Firebase in <code>src/firebase.js</code> to enable real visitor tracking</span>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { db, isFirebaseConfigured } from '@/firebase'

let fbRef, fbPush, fbOnValue, fbQuery, fbOrderByChild, fbLimitToLast

export default {
  name: 'VisitorMapSection',
  setup() {
    const mapContainer = ref(null)
    let map = null
    let unsubscribe = null

    const firebaseActive = ref(isFirebaseConfigured)
    const totalVisitors = ref(0)
    const allVisitors = ref([])

    const currentVisitor = ref({
      country: null,
      region: null,
      city: null,
      lat: null,
      lon: null,
      ip: null,
      loading: true,
      error: false
    })

    /** Mask IP for privacy: 192.168.1.100 → 192.168.*.* */
    function maskIp(ip) {
      if (!ip) return ''
      const parts = ip.split('.')
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.*.*`
      }
      return ip.split(':').slice(0, 3).join(':') + '::**'
    }

    /** Add a visitor marker to the map with animation */
    function addVisitorMarker(lat, lon, isCurrent = false, delay = 0) {
      if (!map) return
      setTimeout(() => {
        if (!map) return
        if (isCurrent) {
          const pulseIcon = L.divIcon({
            className: 'visitor-pulse-marker visitor-pulse-current',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
          L.marker([lat, lon], { icon: pulseIcon }).addTo(map)
          L.circleMarker([lat, lon], {
            radius: 22,
            fillColor: '#4a90e2',
            fillOpacity: 0.06,
            color: '#4a90e2',
            weight: 1,
            opacity: 0.15
          }).addTo(map)
        } else {
          const dotIcon = L.divIcon({
            className: 'visitor-pulse-marker visitor-pulse-small',
            iconSize: [10, 10],
            iconAnchor: [5, 5]
          })
          L.marker([lat, lon], { icon: dotIcon }).addTo(map)
        }
      }, delay)
    }

    /** Draw a dashed line from a past visitor to the current visitor */
    function drawConnectionLine(fromLat, fromLon, toLat, toLon, delay = 0) {
      setTimeout(() => {
        if (!map) return
        L.polyline([[fromLat, fromLon], [toLat, toLon]], {
          color: '#4a90e2',
          weight: 0.7,
          opacity: 0.1,
          dashArray: '4 8'
        }).addTo(map)
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

    /** Record visitor to Firebase */
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

    /** Subscribe to real visitors from Firebase */
    function subscribeToVisitors() {
      if (!isFirebaseConfigured || !db) return
      const visitorsRef = fbRef(db, 'visitors')
      const recentQuery = fbQuery(visitorsRef, fbOrderByChild('timestamp'), fbLimitToLast(200))
      unsubscribe = fbOnValue(recentQuery, (snapshot) => {
        const data = snapshot.val()
        if (!data) return
        const visitors = Object.values(data)
        totalVisitors.value = visitors.length
        allVisitors.value = visitors
        visitors.forEach((v, i) => {
          if (v.lat && v.lon) {
            addVisitorMarker(v.lat, v.lon, false, i * 40)
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

        currentVisitor.value = {
          country: data.country_name,
          region: data.region,
          city: data.city,
          lat: data.latitude,
          lon: data.longitude,
          ip: data.ip,
          loading: false,
          error: false
        }

        await recordVisitor(data)

        if (map && data.latitude && data.longitude) {
          addVisitorMarker(data.latitude, data.longitude, true, 200)

          if (allVisitors.value.length > 0) {
            allVisitors.value.slice(0, 12).forEach((v, i) => {
              if (v.lat && v.lon) {
                drawConnectionLine(v.lat, v.lon, data.latitude, data.longitude, 1200 + i * 120)
              }
            })
          }

          setTimeout(() => {
            if (!map) return
            map.flyTo([data.latitude, data.longitude], 5, {
              duration: 2.5,
              easeLinearity: 0.2
            })
          }, 600)
        }
      } catch {
        currentVisitor.value = {
          ...currentVisitor.value,
          loading: false,
          error: true
        }
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
        fbQuery = dbModule.query
        fbOrderByChild = dbModule.orderByChild
        fbLimitToLast = dbModule.limitToLast
      }

      initMap()
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
      currentVisitor,
      firebaseActive,
      totalVisitors,
      maskIp
    }
  }
}
</script>

<style scoped>
.visitor-card {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
}

.visitor-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.visitor-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
}

.visitor-info {
  flex: 1;
}

.visitor-country {
  font-size: 1.3rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.2rem 0;
}

.visitor-detail {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 0.15rem 0;
}

.visitor-ip {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.25);
  font-family: 'SF Mono', 'Fira Code', monospace;
  margin: 0;
}

.visitor-counter {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  background: rgba(74, 144, 226, 0.12);
  border: 1px solid rgba(74, 144, 226, 0.2);
  flex-shrink: 0;
}

.counter-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.5);
  animation: dot-pulse 2s ease-in-out infinite;
}

.counter-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  font-variant-numeric: tabular-nums;
}

.visitor-loading {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4a90e2;
  animation: dot-pulse 1.5s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.loading-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
}

.visitor-error p {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
  margin: 0;
}

.map-container {
  width: 100%;
  height: 450px;
  position: relative;
  background: #0d1117;
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

.firebase-notice {
  padding: 0.8rem 2rem;
  background: rgba(255, 180, 50, 0.06);
  border-top: 1px solid rgba(255, 180, 50, 0.1);
  text-align: center;
}

.firebase-notice span {
  font-size: 0.8rem;
  color: rgba(255, 200, 100, 0.6);
}

.firebase-notice code {
  background: rgba(255, 255, 255, 0.06);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .map-container {
    height: 320px;
  }

  .visitor-header {
    padding: 1.2rem 1.5rem;
    flex-wrap: wrap;
  }

  .visitor-counter {
    margin-left: auto;
  }
}
</style>

<!-- Unscoped styles for Leaflet custom markers -->
<style>
.visitor-pulse-marker {
  position: relative;
}

.visitor-pulse-current::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 14px;
  height: 14px;
  background: #4a90e2;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow:
    0 0 8px rgba(74, 144, 226, 0.8),
    0 0 20px rgba(74, 144, 226, 0.4),
    0 0 40px rgba(74, 144, 226, 0.2);
  z-index: 2;
}

.visitor-pulse-current::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(74, 144, 226, 0.6);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: visitor-ring-pulse 2s ease-out infinite;
}

.visitor-pulse-small::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: #4a90e2;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 6px rgba(74, 144, 226, 0.5);
  opacity: 0.5;
  z-index: 1;
  animation: visitor-dot-appear 0.5s ease-out;
}

@keyframes visitor-dot-appear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  to {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes visitor-ring-pulse {
  0% {
    width: 14px;
    height: 14px;
    opacity: 1;
  }
  100% {
    width: 70px;
    height: 70px;
    opacity: 0;
  }
}

.map-container .leaflet-container {
  background: #0d1117;
}

.map-container .leaflet-control-attribution {
  display: none;
}

.map-container .leaflet-tile-pane {
  opacity: 0.85;
}
</style>
