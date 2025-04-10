import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { CropCreateDto, CropDto, CropUpdateDto } from '../models/planted-crop.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PlantedCropService {
  private apiUrl = `${environment.apiUrl}/crops`;

  constructor(private http: HttpClient) {}

  getCrops(): Observable<CropDto[]> {
    return this.http.get<CropDto[]>(this.apiUrl);
  }

  getCropById(id: string): Observable<CropDto> {
    return this.http.get<CropDto>(`${this.apiUrl}/${id}`);
  }

  createCrop(dto: CropCreateDto): Observable<CropDto> {
    return this.http.post<CropDto>(this.apiUrl, dto);
  }

  updateCrop(id: string, updateDto: CropUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, updateDto);
  }

  deleteCrop(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
