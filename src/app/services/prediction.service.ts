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

  analyzeImage(file: File, patientInfo?: { name: string, age: number | null, email: string, technician: string }): Observable<PredictionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (patientInfo) {
      if (patientInfo.name) formData.append('patient_name', patientInfo.name);
      if (patientInfo.age !== null && patientInfo.age !== undefined) {
        formData.append('patient_age', patientInfo.age.toString());
      }
      if (patientInfo.email) formData.append('patient_email', patientInfo.email);
      if (patientInfo.technician) formData.append('technician_name', patientInfo.technician);
    }
    
    return this.http.post<PredictionResponse>(`${this.apiUrl}/predict`, formData);
  }

  getApiUrl(): string {
    return this.apiUrl;
  }
}
