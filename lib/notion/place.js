const hasCoordinateValue = value =>
  value !== null && value !== undefined && value !== ''

export const normalizePlaceCoordinates = place => {
  if (!place || typeof place !== 'object') {
    return null
  }

  if (!hasCoordinateValue(place.lat) || !hasCoordinateValue(place.lon)) {
    return null
  }

  const lat = Number(place.lat)
  const lon = Number(place.lon)

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null
  }

  return { lat, lon }
}

export const hasResolvedPlaceCoordinates = place =>
  Boolean(normalizePlaceCoordinates(place))
