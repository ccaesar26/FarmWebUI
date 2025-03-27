import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptorFn: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  // Clone the request and add 'withCredentials'
  if (req.url.includes(environment.apiUrl)) {
    const modifiedReq = req.clone({
      withCredentials: true
    });

    return next(modifiedReq);
  } else {
    return next(req);
  }
};
