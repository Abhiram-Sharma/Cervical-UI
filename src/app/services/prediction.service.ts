import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PredictionResponse } from '../models/prediction-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  analyzeImage(file: File): Observable<PredictionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<PredictionResponse>(`${this.apiUrl}/predict`, formData);
  }

  getApiUrl(): string {
    return this.apiUrl;
  }
}
