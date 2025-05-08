// src/app/core/services/reports.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ReportDto,
  CreateReportDto,
  UpdateReportStatusDto,
  ReportFilterDto,
  AddCommentDto,
  CommentDto,
  PagedResult, DisplayReport, ReportStatus // Import PagedResult if using pagination
} from '../models/reports.model';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private apiUrl = `${environment.apiUrl}/reports`; // Correct controller name

  constructor(private http: HttpClient) { }

  /**
   * Creates a new report.
   * @param dto The report data to create.
   * @returns Observable<string> The ID of the newly created report.
   */
  createReport(dto: CreateReportDto): Observable<{ reportId: string }> { // Backend returns { reportId: ... }
    return this.http.post<{ reportId: string }>(this.apiUrl, dto).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gets a specific report by its ID.
   * @param id The GUID of the report.
   * @returns Observable<ReportDto> The report data.
   */
  getReport(id: string): Observable<ReportDto> {
    return this.http.get<ReportDto>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gets a list of reports, potentially filtered and paginated.
   * @param filter Optional filtering criteria.
   * @param pageNumber The page number to retrieve (default is 1).
   * @param pageSize The number of reports per page (default is 10).
   * @returns Observable<ReportDto[]> or Observable<PagedResult<ReportDto>> The list or paginated result of reports.
   */
  getReports(filter?: ReportFilterDto | null, pageNumber: number = 1, pageSize: number = 10): Observable<ReportDto[]> { // Adjust return type if paginated
    // getReports(filter?: ReportFilterDto | null, pageNumber: number = 1, pageSize: number = 10): Observable<PagedResult<ReportDto>> { // Example if paginated
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (filter) {
      if (filter.status != null) { // Check for null/undefined specifically
        params = params.set('status', filter.status);
      }
      if (filter.createdByUserId) {
        params = params.set('createdByUserId', filter.createdByUserId);
      }
      if (filter.fieldId) {
        params = params.set('fieldId', filter.fieldId);
      }
      // Add other filters here
      // if (filter.dateFrom) { params = params.set('dateFrom', filter.dateFrom); }
      // if (filter.dateTo) { params = params.set('dateTo', filter.dateTo); }
    }

    // Adjust the return type <ReportDto[]> or <PagedResult<ReportDto>> based on your API
    return this.http.get<ReportDto[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gets reports created by the currently authenticated user.
   * @returns Observable<ReportDto[]> The list of reports.
   */
  getMyReports(): Observable<ReportDto[]> {
    return this.http.get<ReportDto[]>(`${this.apiUrl}/my`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Updates the status of a specific report.
   * @param id The GUID of the report to update.
   * @param dto The new status information.
   * @returns Observable<void>
   */
  updateReportStatus(id: string, dto: UpdateReportStatusDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/status`, dto).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Deletes a specific report.
   * @param id The GUID of the report to delete.
   * @returns Observable<void>
   */
  deleteReport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // --- Comment Methods ---

  /**
   * Adds a comment to a specific report.
   * @param reportId The GUID of the report to add the comment to.
   * @param dto The comment data.
   * @returns Observable<string> The ID of the newly created comment.
   */
  addComment(reportId: string, dto: AddCommentDto): Observable<string> { // Backend returns commentId directly
    return this.http.post<string>(`${this.apiUrl}/${reportId}/comments`, dto).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gets all comments for a specific report.
   * @param reportId The GUID of the report.
   * @returns Observable<CommentDto[]> The list of comments.
   */
  getComments(reportId: string): Observable<CommentDto[]> {
    return this.http.get<CommentDto[]>(`${this.apiUrl}/${reportId}/comments`).pipe(
      catchError(this.handleError)
    );
  }

  // --- Private Error Handler ---
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      errorMessage = `Server Error ${error.status}: `;
      if (typeof error.error === 'string') {
        errorMessage += error.error;
      } else if (error.error && error.error.title) { // ASP.NET Core validation problem details
        errorMessage += error.error.title;
      } else {
        errorMessage += error.message;
      }
    }
    console.error('API Error:', error);
    // Consider using a user-friendly error message service instead of throwing
    return throwError(() => new Error(errorMessage));
  }

  // --- Mapping Function ---
  private mapReportDtoToDisplayReport(dto: ReportDto): DisplayReport {
    // Find the enum key corresponding to the number status
    const statusEnumKey = Object.keys(ReportStatus).find(key => ReportStatus[key as keyof typeof ReportStatus] === dto.status);
    const statusEnum = statusEnumKey ? ReportStatus[statusEnumKey as keyof typeof ReportStatus] : ReportStatus.Submitted; // Default if not found

    return {
      ...dto,
      status: statusEnum // Map number to enum
      // fieldName and creatorUsername will be added later
    };
  }
  // --- End Mapping Function ---
}
