export interface CreateFieldRequest {
  farmId: string;
  fieldName: string;
  fieldBoundary: any; // GeoJSON Polygon
}
