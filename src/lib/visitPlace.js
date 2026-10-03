function compactPlace(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(city|district|county|borough|region|local board)\b/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '')
}

function samePlace(left, right) {
  const a = compactPlace(left)
  const b = compactPlace(right)
  return Boolean(a) && a === b
}

function pickDistrict(data, cityName) {
  const administrative = data?.localityInfo?.administrative
  if (Array.isArray(administrative)) {
    const match = administrative
      .filter((item) => item?.name && Number(item.adminLevel) >= 6)
      .filter((item) => !samePlace(item.name, cityName))
      .filter((item) => !samePlace(item.name, data.countryName))
      .sort((a, b) => Number(b.adminLevel) - Number(a.adminLevel))[0]
    if (match) return match.name
  }

  if (data?.locality && !samePlace(data.locality, cityName)) return data.locality
  return ''
}

async function fetchIpPlace() {
  const primary = await fetch('https://ipapi.co/json/')
  if (primary.ok) {
    const data = await primary.json()
    if (!data.error) {
      return {
        city: data.city || '',
        region: data.region || '',
        country: data.country_name || '',
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
      }
    }
  }

  const fallback = await fetch('https://ipwho.is/')
  if (!fallback.ok) throw new Error('Location lookup failed')
  const data = await fallback.json()
  if (!data.success) throw new Error(data.message || 'Location lookup failed')
  return {
    city: data.city || '',
    region: data.region || '',
    country: data.country || '',
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
  }
}

async function fetchReverseGeocode(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  const endpoint = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client')
  endpoint.searchParams.set('latitude', String(latitude))
  endpoint.searchParams.set('longitude', String(longitude))
  endpoint.searchParams.set('localityLanguage', 'en')
  const response = await fetch(endpoint)
  if (!response.ok) return null
  return response.json()
}

function readDevicePosition() {
  if (!navigator.geolocation) return Promise.reject(new Error('Geolocation unavailable'))
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => reject(new Error('Geolocation denied')),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    )
  })
}

function placeFromReverse(data, latitude, longitude) {
  const city = data?.city || data?.locality || ''
  return {
    city,
    region: data?.principalSubdivision || '',
    country: data?.countryName || '',
    latitude,
    longitude,
    district: pickDistrict(data, city),
  }
}

export async function resolveVisitPlace() {
  let place = null
  try {
    place = await fetchIpPlace()
  } catch {
    place = null
  }

  if (place?.city) {
    let district = ''
    try {
      const data = await fetchReverseGeocode(place.latitude, place.longitude)
      district = pickDistrict(data, place.city || place.region)
    } catch {
      district = ''
    }
    return { ...place, district }
  }

  try {
    const position = await readDevicePosition()
    const data = await fetchReverseGeocode(position.latitude, position.longitude)
    const reversed = placeFromReverse(data, position.latitude, position.longitude)
    return {
      city: reversed.city,
      region: reversed.region || place?.region || '',
      country: reversed.country || place?.country || '',
      latitude: position.latitude,
      longitude: position.longitude,
      district: reversed.district,
    }
  } catch {
    if (place?.country && Number.isFinite(place.latitude) && Number.isFinite(place.longitude)) {
      return { ...place, district: '' }
    }
    throw new Error('Location lookup failed')
  }
}
