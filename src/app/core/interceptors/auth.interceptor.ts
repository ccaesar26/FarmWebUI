import { HttpInterceptorFn, HttpHandlerFn, HttpEvent, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, switchMap, filter, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

// Maintain the refreshing state outside the interceptor function
let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptorFn: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const handleRequest = (request: HttpRequest<any>) => {
    if (request.url.includes(environment.apiUrl || environment.baseUrl)) {
      request = request.clone({ withCredentials: true });
    }
    return next(request);
  };

  return handleRequest(req).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(req, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService, router: Router): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: any) => { // Adjust type based on your backend response
        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);
        return next(addToken(req, response.accessToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        router.navigate([ '/login' ]);
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(jwt => {
        return next(addToken(req, jwt));
      })
    );
  }
}

function addToken(request: HttpRequest<any>, token: string) {
  return request.clone({
    setHeaders: {
      'Authorization': `Bearer ${token}`
    }
  });
}
