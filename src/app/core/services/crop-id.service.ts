// src/app/core/services/crop-id.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CropIdEntry, IdRequestDto, IdResponseDto } from '../models/crop-id.model';
import { environment } from '../../../environments/environment'; // Adjust path as needed

@Injectable({
  providedIn: 'root'
})
export class CropIdService {
  private apiUrl = `${environment.apiUrl}/crop-id`; // Base URL for the CropIdController

  constructor(private http: HttpClient) { }

  /**
   * Gets all crop identification entries for the current user's farm.
   * (Corresponds to GET /api/crop-id)
   * @returns Observable<CropIdEntry[]>
   */
  getAllIdEntriesByFarmId(): Observable<CropIdEntry[]> {
    return this.http.get<CropIdEntry[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Identifies crop health based on the provided image and details.
   * (Corresponds to POST /api/crop-id/health)
   * @param requestDto - The data required for identification.
   * @returns Observable<IdResponseDto> - The identification response.
   */
  identifyCropHealth(requestDto: IdRequestDto): Observable<IdResponseDto> {
    // The backend expects "application/json", so ensure the Content-Type is set if not default
    // Angular's HttpClient typically sets Content-Type: application/json for POST with object body
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
        // Authorization header will be added by your interceptor
      })
    };

    // Convert Date to ISO string for backend compatibility if needed
    // The backend controller doesn't show a 'datetime' field in IdRequestDto,
    // but your TS interface has it. Assuming the backend expects it as part of the DTO.
    // If the backend expects a specific string format, adjust here.
    const payload: IdRequestDto = {
      ...requestDto,
      datetime: new Date(requestDto.datetime) // Ensure it's a valid Date object before toISOString
    };


    return this.http.post<IdResponseDto>(`${this.apiUrl}/health`, payload, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Private error handler for API calls.
   * @param error - The HttpErrorResponse.
   * @returns An Observable that throws an error.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      errorMessage = `Server Error Code: ${error.status}\nMessage: `;
      if (typeof error.error === 'string') {
        errorMessage += error.error;
      } else if (error.error && error.error.message) {
        errorMessage += error.error.message;
      } else if (error.error && error.error.title) { // ASP.NET Core validation problem details
        errorMessage += error.error.title;
      } else {
        errorMessage += error.message;
      }
    }
    console.error('API Error in CropIdService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
