export interface IdRequestDto {
  name: string;
  latitude: number;
  longitude: number;
  fieldName: string;
  imageBase64Data: string;
  datetime: Date;
}

export interface IdResponseDto {
  isPlant: boolean;
  cropSuggestions: Array<SuggestionDto>;
  diseaseSuggestions: Array<SuggestionDto>;
}

export interface SuggestionDto {
  name: string;
  probability: number;
  scientificName: string;
}

export interface CropIdEntry extends IdResponseDto {
  id: string,
  name: string,
  longitude: number,
  latitude: number,
  fieldName: string,
  imageBase64Data: string,
  datetime: Date,
  isPlant: boolean,
  suggestions: Array<SuggestionEntry>,
}

export interface SuggestionEntry {
  id: string,
  type: 'Crop' | 'Disease';
  name: string;
  probability: number;
  scientificName: string;
}
