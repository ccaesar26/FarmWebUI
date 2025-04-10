import area from '@turf/area';
import { Feature, Polygon } from 'geojson';

export interface CreateFieldRequest {
  fieldName: string;
  fieldBoundary: any; // GeoJSON Polygon
}

export interface UpdateFieldRequest {
  fieldId: string;
  fieldName: string;
  fieldBoundary: any;
}

export interface Field {
  id: string;
  name: string;
  boundary: any; // GeoJSON Polygon
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface GetFieldCoordinatesResponse {
  coordinates: Coordinate[];
}

export interface CityOption {
  name: string;
  lat: number;
  lon: number;
  country: string;
}

export type GetFieldsCitiesResponse = CityOption[];

export function CalculateArea(field: Field) {
  try {
    const polygon: Feature<Polygon> = {
      type: 'Feature',
      geometry: field.boundary,
      properties: {}
    };
    // alert(JSON.stringify(polygon, null, 4));
    // alert(area(polygon));
    return Math.floor(area(polygon)); // Returns the area in square meters
  } catch (error) {
    console.error('Error calculating area:', error);
    return null; // Or handle the error as needed
  }
}
