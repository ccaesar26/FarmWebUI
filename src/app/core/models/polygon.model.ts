import { Field } from './field.model';

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

export function convertFromGeoJson(field: Field): Polygon | null {
  if (field.boundary && field.boundary.type === 'Polygon' && field.boundary.coordinates && field.boundary.coordinates.length > 0) {
    // GeoJSON Polygons have an extra nesting level for coordinates (for exterior/interior rings)
    // We assume we only care about the first (exterior) ring for your Polygon component
    return {
      id: field.id, // Use the field's ID
      name: field.name,
      coordinates: field.boundary.coordinates[0] // Take the first ring
    };
  }
  console.warn("Could not convert field boundary to Polygon:", field);
  return null; // Return null if conversion isn't possible
}
