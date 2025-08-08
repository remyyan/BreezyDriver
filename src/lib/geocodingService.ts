import { LocationCoordinates } from './firebase';

// Centralized Mapbox token (fallback to token used in components)
const MAPBOX_TOKEN =
  (import.meta as any)?.env?.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1IjoicmVteXlhbiIsImEiOiJjbWRqZjBwc2UwaW5uMmpxNzJmNmgyMmc0In0.wdhkYSWw_Sd4X2GmzMJtLw';

export const geocodeAddress = async (address: string): Promise<LocationCoordinates | null> => {
  if (!address || !address.trim()) return null;

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=${MAPBOX_TOKEN}&limit=1&autocomplete=true&country=CA&language=en`;

    const res = await fetch(url);
    if (!res.ok) {
      console.warn('Geocoding request failed', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const feature = data?.features?.[0];
    if (!feature || !feature.center || feature.center.length < 2) return null;

    const [lng, lat] = feature.center;
    return { latitude: lat, longitude: lng };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

