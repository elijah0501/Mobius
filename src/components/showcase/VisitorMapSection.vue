<template>
  <section class="showcase-section">
    <h2 class="section-title reveal">Visitor Globe</h2>
    <div class="section-title-bar reveal"></div>
    <p class="section-subtitle reveal">See where you're visiting from</p>

    <div class="glass-card visitor-card reveal">
      <!-- Visitor info bar -->
      <div class="visitor-header">
        <div class="visitor-icon">🌍</div>
        <div class="visitor-info">
          <div v-if="visitor.loading" class="visitor-loading">
            <span class="loading-dot"></span>
            <span class="loading-text">Detecting your location...</span>
          </div>
          <template v-else-if="!visitor.error">
            <h3 class="visitor-country">{{ visitor.country }}</h3>
            <p class="visitor-detail">{{ visitor.region }}<span v-if="visitor.city">, {{ visitor.city }}</span></p>
            <p class="visitor-ip">IP: {{ visitor.ip }}</p>
          </template>
          <div v-else class="visitor-error">
            <p>Location unavailable — your privacy tools may be blocking the request.</p>
          </div>
        </div>
      </div>

      <!-- Leaflet Map -->
      <div ref="mapContainer" class="map-container">
        <div v-if="visitor.loading" class="map-placeholder">
          <div class="map-loading-ring"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const mapContainer = ref(null)
let map = null

const visitor = ref({
  country: null,
  region: null,
  city: null,
  lat: null,
  lon: null,
  ip: null,
  loading: true,
  error: false
})

// Simulated worldwide visitor locations for visual effect
const worldLocations = [
  [40.71, -74.01],   // New York
  [51.51, -0.13],    // London
  [48.86, 2.35],     // Paris
  [35.68, 139.69],   // Tokyo
  [37.57, 126.98],   // Seoul
  [-33.87, 151.21],  // Sydney
  [55.76, 37.62],    // Moscow
  [19.43, -99.13],   // Mexico City
  [-23.55, -46.63],  // São Paulo
  [28.61, 77.21],    // Delhi
  [39.90, 116.40],   // Beijing
  [1.35, 103.82],    // Singapore
  [52.52, 13.40],    // Berlin
  [41.01, 28.98],    // Istanbul
  [30.04, 31.24],    // Cairo
  [-1.29, 36.82],    // Nairobi
  [34.05, -118.24],  // Los Angeles
  [43.65, -79.38],   // Toronto
  [-34.60, -58.38],  // Buenos Aires
  [59.33, 18.07],    // Stockholm
]

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

  // Dark theme tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)

  // Add subtle label layer on top
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 19,
    opacity: 0.4
  }).addTo(map)

  // Add simulated visitor dots
  worldLocations.forEach((coords, index) => {
    setTimeout(() => {
      if (!map) return
      L.circleMarker(coords, {
        radius: 3,
        fillColor: '#4a90e2',
        fillOpacity: 0.3,
        stroke: false
      }).addTo(map)
    }, index * 80)
  })
}

async function fetchVisitorLocation() {
  try {
    const res = await fetch('https://ipapi.co/json/')
    if (!res.ok) throw new Error('API error')
    const data = await res.json()

    if (data.error) throw new Error(data.reason)

    visitor.value = {
      country: data.country_name,
      region: data.region,
      city: data.city,
      lat: data.latitude,
      lon: data.longitude,
      ip: data.ip,
      loading: false,
      error: false
    }

    if (map && data.latitude && data.longitude) {
      // Add primary pulsing marker
      const pulseIcon = L.divIcon({
        className: 'visitor-pulse-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
      L.marker([data.latitude, data.longitude], { icon: pulseIcon }).addTo(map)

      // Add glowing circle around visitor
      L.circleMarker([data.latitude, data.longitude], {
        radius: 18,
        fillColor: '#4a90e2',
        fillOpacity: 0.08,
        color: '#4a90e2',
        weight: 1,
        opacity: 0.2
      }).addTo(map)

      // Draw arc lines from some cities to visitor
      const arcCities = worldLocations.slice(0, 8)
      arcCities.forEach((city, i) => {
        setTimeout(() => {
          if (!map) return
          const line = L.polyline([city, [data.latitude, data.longitude]], {
            color: '#4a90e2',
            weight: 0.8,
            opacity: 0.15,
            dashArray: '4 6'
          })
          line.addTo(map)
        }, 1500 + i * 150)
      })

      // Fly to visitor location
      setTimeout(() => {
        if (!map) return
        map.flyTo([data.latitude, data.longitude], 5, {
          duration: 2.5,
          easeLinearity: 0.2
        })
      }, 500)
    }
  } catch {
    visitor.value = {
      ...visitor.value,
      loading: false,
      error: true
    }
  }
}

onMounted(async () => {
  await nextTick()
  initMap()
  fetchVisitorLocation()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
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

@media (max-width: 768px) {
  .map-container {
    height: 320px;
  }

  .visitor-header {
    padding: 1.2rem 1.5rem;
  }
}
</style>

<!-- Unscoped styles for Leaflet custom markers -->
<style>
.visitor-pulse-marker {
  position: relative;
}

.visitor-pulse-marker::before {
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

.visitor-pulse-marker::after {
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

/* Override Leaflet default styles for glass theme */
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
