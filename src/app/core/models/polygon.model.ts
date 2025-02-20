export interface Polygon {
  id: string;
  name: string;
  coordinates: number[][];
}

export function convertToGeoJson(polygon: Polygon)  {
  return {
    type: 'Polygon',
    coordinates: [polygon.coordinates] // Ensure this follows GeoJSON structure
  };
}
