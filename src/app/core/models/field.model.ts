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
