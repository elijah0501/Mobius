<template>
  <section class="showcase-section">
    <div class="glass-card visitor-card reveal">

      <!-- Leaflet Map -->
      <div ref="mapContainer" class="map-container">
        <!-- Visitor Log Panel -->
        <div v-if="visitorLog.length > 0" class="visitor-log-panel">
          <div class="log-header">
            <span class="log-dot"></span>
            <span class="log-title">Visitors</span>
            <span class="log-count">{{ visitorLog.length }}</span>
          </div>
          <div class="log-list">
            <div v-for="(v, i) in visitorLog" :key="i" class="log-item" :class="{ 'log-item-current': v.isCurrent }">
              <span class="log-pin" :class="{ 'log-pin-current': v.isCurrent }"></span>
              <div class="log-item-info">
                <span class="log-item-location">{{ v.city ? v.city + ', ' : '' }}{{ v.country }}</span>
                <span class="log-item-time">{{ v.timeAgo }}</span>
              </div>
            </div>
          </div>
        </div>

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
    const visitorLog = ref([])

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

    /** Format timestamp to relative time string */
    function formatTimeAgo(timestamp) {
      const seconds = Math.floor((Date.now() - timestamp) / 1000)
      if (seconds < 60) return 'Just now'
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
      return `${Math.floor(seconds / 86400)}d ago`
    }

    /** Add a visitor marker to the map with animation + popup */
    function addVisitorMarker(lat, lon, isCurrent = false, delay = 0, info = null) {
      if (!map) return
      setTimeout(() => {
        if (!map) return
        let marker
        if (isCurrent) {
          const pulseIcon = L.divIcon({
            className: 'visitor-pulse-marker visitor-pulse-current',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          })
          marker = L.marker([lat, lon], { icon: pulseIcon, zIndexOffset: 1000 }).addTo(map)
          L.circleMarker([lat, lon], {
            radius: 30,
            fillColor: '#4a90e2',
            fillOpacity: 0.08,
            color: '#4a90e2',
            weight: 1,
            opacity: 0.2
          }).addTo(map)
        } else {
          const dotIcon = L.divIcon({
            className: 'visitor-pulse-marker visitor-pulse-small',
            iconSize: [10, 10],
            iconAnchor: [5, 5]
          })
          marker = L.marker([lat, lon], { icon: dotIcon }).addTo(map)
        }
        if (marker && info) {
          const popupHtml = `
            <div class="visitor-popup">
              <div class="popup-location">${info.country || 'Unknown'}</div>
              ${info.region ? `<div class="popup-detail">${info.region}${info.city ? ', ' + info.city : ''}</div>` : ''}
              ${info.time ? `<div class="popup-time">${info.time}</div>` : ''}
              ${isCurrent ? '<div class="popup-badge">📍 You</div>' : ''}
            </div>
          `
          marker.bindPopup(popupHtml, {
            className: 'visitor-map-popup',
            closeButton: false,
            offset: [0, isCurrent ? -14 : -5]
          })
          if (isCurrent) {
            setTimeout(() => { if (marker && map) marker.openPopup() }, 300)
          }
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
        const visitors = Object.values(data).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        totalVisitors.value = visitors.length
        allVisitors.value = visitors

        // Build visitor log entries
        const logEntries = visitors.map(v => ({
          country: v.country || 'Unknown',
          city: v.city || '',
          region: v.region || '',
          timeAgo: formatTimeAgo(v.timestamp),
          isCurrent: false
        }))
        visitorLog.value = logEntries

        visitors.forEach((v, i) => {
          if (v.lat && v.lon) {
            addVisitorMarker(v.lat, v.lon, false, i * 40, {
              country: v.country,
              region: v.region,
              city: v.city,
              time: formatTimeAgo(v.timestamp)
            })
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

        // Add current visitor to log
        const currentEntry = {
          country: data.country_name,
          city: data.city || '',
          region: data.region || '',
          timeAgo: 'Just now',
          isCurrent: true
        }
        visitorLog.value = [currentEntry, ...visitorLog.value.filter(v => !v.isCurrent)]

        if (map && data.latitude && data.longitude) {
          addVisitorMarker(data.latitude, data.longitude, true, 200, {
            country: data.country_name,
            region: data.region,
            city: data.city,
            time: 'Just now'
          })

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
      visitorLog,
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

/* Visitor Log Panel */
.visitor-log-panel {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 1000;
  width: 220px;
  max-height: 380px;
  background: rgba(13, 17, 23, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.log-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.5);
  animation: dot-pulse 2s ease-in-out infinite;
}

.log-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  flex: 1;
}

.log-count {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(74, 144, 226, 0.8);
  background: rgba(74, 144, 226, 0.12);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
}

.log-list {
  overflow-y: auto;
  flex: 1;
  padding: 0.4rem 0;
}

.log-list::-webkit-scrollbar {
  width: 3px;
}

.log-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 1rem;
  transition: background 0.2s;
}

.log-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.log-item-current {
  background: rgba(74, 144, 226, 0.08);
}

.log-pin {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(74, 144, 226, 0.5);
  flex-shrink: 0;
}

.log-pin-current {
  width: 8px;
  height: 8px;
  background: #4a90e2;
  box-shadow: 0 0 8px rgba(74, 144, 226, 0.6);
  animation: dot-pulse 2s ease-in-out infinite;
}

.log-item-info {
  flex: 1;
  min-width: 0;
}

.log-item-location {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-item-current .log-item-location {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.log-item-time {
  display: block;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.25);
  font-family: 'SF Mono', 'Fira Code', monospace;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
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

  .visitor-log-panel {
    top: 10px;
    right: 10px;
    width: 180px;
    max-height: 260px;
  }

  .log-header {
    padding: 0.5rem 0.8rem;
  }

  .log-item {
    padding: 0.3rem 0.8rem;
  }
}
</style>

<!-- Unscoped styles for Leaflet custom markers & popups -->
<style>
.visitor-pulse-marker {
  position: relative;
}

.visitor-pulse-current::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  background: #4a90e2;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow:
    0 0 10px rgba(74, 144, 226, 0.9),
    0 0 25px rgba(74, 144, 226, 0.5),
    0 0 50px rgba(74, 144, 226, 0.3);
  z-index: 2;
  animation: current-breathe 2.5s ease-in-out infinite;
}

@keyframes current-breathe {
  0%, 100% {
    width: 12px;
    height: 12px;
    box-shadow:
      0 0 6px rgba(74, 144, 226, 0.6),
      0 0 15px rgba(74, 144, 226, 0.3),
      0 0 30px rgba(74, 144, 226, 0.15);
    opacity: 0.85;
  }
  50% {
    width: 18px;
    height: 18px;
    box-shadow:
      0 0 12px rgba(74, 144, 226, 1),
      0 0 30px rgba(74, 144, 226, 0.6),
      0 0 60px rgba(74, 144, 226, 0.3);
    opacity: 1;
  }
}

.visitor-pulse-current::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(74, 144, 226, 0.7);
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
  animation: visitor-dot-breathe 3s ease-in-out infinite;
}

@keyframes visitor-dot-breathe {
  0%, 100% {
    opacity: 0.3;
    box-shadow: 0 0 4px rgba(74, 144, 226, 0.3);
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    opacity: 0.7;
    box-shadow: 0 0 10px rgba(74, 144, 226, 0.6);
    transform: translate(-50%, -50%) scale(1.2);
  }
}

@keyframes visitor-ring-pulse {
  0% {
    width: 16px;
    height: 16px;
    opacity: 1;
  }
  100% {
    width: 80px;
    height: 80px;
    opacity: 0;
  }
}

/* Popup styles */
.visitor-map-popup .leaflet-popup-content-wrapper {
  background: rgba(13, 17, 23, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 144, 226, 0.2);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  color: #fff;
  padding: 0;
}

.visitor-map-popup .leaflet-popup-content {
  margin: 0;
  padding: 0.6rem 1rem;
  font-size: 0.8rem;
  line-height: 1.4;
}

.visitor-map-popup .leaflet-popup-tip {
  background: rgba(13, 17, 23, 0.85);
  border: 1px solid rgba(74, 144, 226, 0.15);
  border-top: none;
  border-left: none;
}

.visitor-popup .popup-location {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2px;
}

.visitor-popup .popup-detail {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 2px;
}

.visitor-popup .popup-time {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.3);
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.visitor-popup .popup-badge {
  font-size: 0.7rem;
  color: #4a90e2;
  font-weight: 600;
  margin-top: 3px;
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
