// Define interfaces to match your backend data structures.  This is *crucial* for type safety.
export interface DroughtDataDto {
  date: string; // Use string for dates from the API, then parse.  Avoid `Date` directly in interfaces.
  rasterDataBase64: string;
}

export interface DroughtLevelInfo {
  level: number;
  meaning: string;
  description: string;
}
