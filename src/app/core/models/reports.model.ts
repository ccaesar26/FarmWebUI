// src/app/core/models/reports.model.ts (Create or place in your models folder)

export enum ReportStatus {
  Submitted = 0,  // Assign explicit numeric values matching the backend
  Seen = 1,
  InProgress = 2,
  Resolved = 3,
  Closed = 4
}

export function reportStatusToString(status: ReportStatus): string {
  switch (status) {
    case ReportStatus.Submitted:
      return 'Submitted';
    case ReportStatus.Seen:
      return 'Seen';
    case ReportStatus.InProgress:
      return 'In Progress';
    case ReportStatus.Resolved:
      return 'Resolved';
    case ReportStatus.Closed:
      return 'Closed';
    default:
      return 'Unknown Status';
  }
}

// Interface for the main Report Data Transfer Object
export interface ReportDto {
  id: string; // GUID as string
  title: string;
  description?: string | null;
  imageData?: string | null;   // Base64 string for image data
  imageMimeType?: string | null;
  status: number;
  fieldId?: string | null;     // GUID as string
  farmId: string;       // GUID as string
  createdByUserId: string; // GUID as string
  createdAt: string;      // ISO date string
  updatedAt?: string | null;// ISO date string
  commentCount: number;
}

// --- Add Interface for Display ---
export interface DisplayReport extends ReportDto { // Inherits from ReportDto
  fieldName?: string | null; // Fetched Field Name
  creatorUsername?: string | null; // Fetched Username
}

// Helper type for grouping
export type ReportsByStatusMap = {
  [key in ReportStatus]?: DisplayReport[];
};

// Interface for creating a new report
export interface CreateReportDto {
  title: string;
  description?: string | null;
  imageData?: string | null;   // Base64 string
  imageMimeType?: string | null;
  fieldId?: string | null;
}

// Interface for updating report status
export interface UpdateReportStatusDto {
  status: ReportStatus;
}

// Interface for filtering reports
export interface ReportFilterDto {
  status?: ReportStatus | null;
  createdByUserId?: string | null;
  fieldId?: string | null;
  // Add other filters as needed (e.g., date ranges)
  // dateFrom?: string | null;
  // dateTo?: string | null;
}

// Interface for adding a comment
export interface AddCommentDto {
  commentText: string;
  parentCommentId?: string | null; // GUID as string
}

// Interface for displaying a comment
export interface CommentDto {
  id: string;         // GUID as string
  reportId: string;   // GUID as string
  parentCommentId?: string | null; // GUID as string
  userId: string;     // GUID as string
  commentText: string;
  createdAt: string;  // ISO date string
  // Consider adding username/name here if fetched with comments
  // userName?: string;
  // You might fetch child comments separately or include them if nested
  // childComments?: CommentDto[];
}

// Helper type for Paged Results (if your GetReportsAsync returns pagination info)
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
