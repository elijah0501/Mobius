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

async function fetchDistrict(latitude, longitude, cityName) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return ''
  const endpoint = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client')
  endpoint.searchParams.set('latitude', String(latitude))
  endpoint.searchParams.set('longitude', String(longitude))
  endpoint.searchParams.set('localityLanguage', 'en')
  const response = await fetch(endpoint)
  if (!response.ok) return ''
  return pickDistrict(await response.json(), cityName)
}

export async function resolveVisitPlace() {
  const place = await fetchIpPlace()
  let district = ''
  try {
    district = await fetchDistrict(place.latitude, place.longitude, place.city || place.region)
  } catch {
    district = ''
  }
  return { ...place, district }
}
