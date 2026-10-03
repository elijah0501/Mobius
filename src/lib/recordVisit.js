import { push, ref as dbRef } from 'firebase/database'
import { db, isFirebaseConfigured } from '@/firebase'
import { resolveVisitPlace } from '@/lib/visitPlace'

const SESSION_KEY = 'mobius-visit-recorded'
let recording = false

function readRecorded() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function writeRecorded(recorded) {
  try {
    if (recorded) sessionStorage.setItem(SESSION_KEY, '1')
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Storage can be unavailable. The in-memory guard still covers this page load.
  }
}

export async function recordVisitOnce() {
  if (!isFirebaseConfigured || !db || recording || readRecorded()) return
  recording = true
  writeRecorded(true)
  try {
    const place = await resolveVisitPlace()
    if (!place.country || !Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) {
      writeRecorded(false)
      return
    }
    await push(dbRef(db, 'visitors'), {
      lat: place.latitude,
      lon: place.longitude,
      country: place.country,
      region: place.region || '',
      city: place.city || '',
      district: place.district || '',
      timestamp: Date.now(),
    })
  } catch {
    writeRecorded(false)
  } finally {
    recording = false
  }
}
