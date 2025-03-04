// drought-data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DroughtDataDto, DroughtLevelInfo } from '../models/drought-data.model';

@Injectable({
  providedIn: 'root' // Make this service a singleton, available throughout the app.
})
export class DroughtDataService {

  private readonly apiUrl: string;

  constructor(private http: HttpClient) {
    // Use environment variables for API URLs
    this.apiUrl = `${environment.apiUrl}/drought-data`; //  e.g.,  'http://localhost:5800/api/drought-data' OR '/api/drought-data' if using proxy

  }

  // Get the drought record (raster data) for the current date.
  getDroughtRecord(): Observable<DroughtDataDto> {
    const url = `${this.apiUrl}/drought-record`;
    return this.http.get<DroughtDataDto>(url).pipe(
      map(response => ({
        ...response,
        date: new Date(response.date).toLocaleDateString() //parse date in a readable way.
      })),
      catchError(this.handleError) // Centralized error handling!
    );
  }

  // Get the drought level for a specific location and (optional) time.
  getDroughtLevel(lon: number, lat: number, time?: Date): Observable<DroughtLevelInfo> {
    const url = `${this.apiUrl}/drought-level`;

    // Build query parameters.  HttpParams handles URL encoding correctly!
    let params = new HttpParams()
      .set('lon', lon.toString())
      .set('lat', lat.toString());

    // if (time) {
    //   // Format the date as yyyy-MM-dd.  DatePipe is another (more verbose) option.
    //   const formattedDate = time.toISOString().split('T')[0];
    //   params = params.set('time', formattedDate);
    // }

    return this.http.get<DroughtLevelInfo>(url, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Private error handler.  This is a *very* good practice.
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error.
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
      if (error.status === 500) { //Example specific 500-level error
        errorMessage = "Failed to fetch drought data from EDO API (Server Error)."
      }
      if (error.status === 400) {
        errorMessage = error.error; //propagate bad request message.
      }

    }
    console.error(errorMessage); // Log the error for debugging.
    return throwError(() => new Error(errorMessage)); // Return an observable with a user-facing error message.
  }
}
