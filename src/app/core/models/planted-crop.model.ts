export interface CropCreateDto {
  name: string;
  binomialName: string;
  cultivatedVariety?: string;
  imageLink?: string;
  perennial: boolean;
  plantingDate: string;
  expectedFirstHarvestDate?: string;
  expectedLastHarvestDate?: string;
  expectedFirstHarvestStartDate?: string;
  expectedFirstHarvestEndDate?: string;
  expectedLastHarvestStartDate?: string;
  expectedLastHarvestEndDate?: string;
  fieldId: string;
  surface?: string; // Ignore this for now, as it might be a geometry type
  area: number;
  cropCatalogId: string;
}

export interface CropDto {
  id: string;
  name: string;
  binomialName: string;
  cultivatedVariety?: string;
  imageLink?: string;
  perennial: boolean;
  plantingDate: string;
  expectedFirstHarvestDate?: string;
  expectedLastHarvestDate?: string;
  expectedFirstHarvestStartDate?: string;
  expectedFirstHarvestEndDate?: string;
  expectedLastHarvestStartDate?: string;
  expectedLastHarvestEndDate?: string;
  fieldId: string; // Assuming Guid is represented as string in frontend
  surface?: string; // Consider using a more specific type if you handle geometry in frontend
  area?: number;
  cropCatalogId: string; // Assuming Guid is represented as string in frontend
}

export interface CropUpdateDto {
  id: string; // Assuming Guid is represented as string in frontend
  name: string;
  binomialName: string;
  cultivatedVariety?: string;
  imageLink?: string;
  perennial: boolean;
  plantingDate: string;
  expectedFirstHarvestDate?: string;
  expectedLastHarvestDate?: string;
  expectedFirstHarvestStartDate?: string;
  expectedFirstHarvestEndDate?: string;
  expectedLastHarvestStartDate?: string;
  expectedLastHarvestEndDate?: string;
  fieldId: string; // Assuming Guid is represented as string in frontend
  surface?: string; // Consider using a more specific type if you handle geometry in frontend
  area: number;
  cropCatalogId: string; // Assuming Guid is represented as string in frontend
}

// Optional: You might also want to define interfaces for the related entities
// if your frontend needs to display or interact with them directly.

// Example for FertilizerEvent (if needed)
export interface FertilizerEvent {
  id: string;
  cropId: string;
  fertilizerType: string;
  applicationDate: Date;
  quantityApplied: number;
  units: string;
  applicationMethod?: string;
  equipmentUsed?: string;
  appliedByUserId: string;
  appliedByUserName: string;
  notes?: Note[];
}

// Example for GrowthStageEvent (if needed)
export interface GrowthStageEvent {
  id: string;
  cropId: string;
  stage: string;
  timestamp: Date;
  recordedByUserId: string;
  recordedByUserName: string;
  notes?: Note[];
}

// Example for HealthStatusEvent (if needed)
export interface HealthStatusEvent {
  id: string;
  cropId: string;
  healthStatus: string;
  timestamp: Date;
  recordedByUserId: string;
  recordedByUserName: string;
  pestOrDisease?: string;
  severityLevel: SeverityLevel;
  treatmentApplied?: string;
  notes?: Note[];
}

export enum SeverityLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

// Example for Note (if needed)
export interface Note {
  id: string;
  text: string;
  timestamp: Date;
  authorUserId: string;
  authorUserName: string;
}
