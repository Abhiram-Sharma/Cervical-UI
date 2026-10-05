import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { PredictionService } from './services/prediction.service';
import { PredictionResponse } from './models/prediction-response.model';

enum AppState {
  INITIAL = 'INITIAL',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUploadComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'cervical-frontend';
  
  state = AppState.INITIAL;
  AppState = AppState;
  
  errorMessage = '';
  
  originalFile: File | null = null;
  originalImagePreview: string | ArrayBuffer | null = null;
  
  result: PredictionResponse | null = null;
  
  patientForm: FormGroup;
  
  private sub?: Subscription;

  constructor(private predictionService: PredictionService, private fb: FormBuilder) {
    this.patientForm = this.fb.group({
      name: [''],
      age: [null, [Validators.min(0), Validators.max(120)]],
      email: ['', [Validators.email]],
      technician: ['']
    });
  }

  onAnalyze(file: File) {
    // If form is invalid, we return and mark fields to show errors.
    if (this.patientForm.invalid) {
       Object.values(this.patientForm.controls).forEach(c => c.markAsTouched());
       return;
    }

    this.resetStateKeepForm();
    
    this.originalFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      if(e.target) {
        this.originalImagePreview = e.target.result;
      }
    };
    reader.readAsDataURL(file);

    this.state = AppState.ANALYZING;
    this.errorMessage = '';

    const pInfo = this.patientForm.value;
    const patientInfo = {
      name: pInfo.name,
      age: pInfo.age,
      email: pInfo.email,
      technician: pInfo.technician
    };

    this.sub = this.predictionService.analyzeImage(file, patientInfo).subscribe({
      next: (response) => {
        this.result = response;
        this.state = AppState.SUCCESS;
        this.triggerAutomaticDownload();
      },
      error: (err: HttpErrorResponse) => {
        this.state = AppState.ERROR;
        this.handleError(err);
      }
    });
  }

  private handleError(err: HttpErrorResponse) {
    if (err.status === 0) {
      this.errorMessage = 'Unable to connect to the analysis server. (Ensure CORS is enabled on FastAPI for http://localhost:4200)';
    } else if (err.status === 400) {
      this.errorMessage = err.error?.detail || 'Please upload a valid image.';
    } else if (err.status === 413) {
      this.errorMessage = 'The uploaded image is too large.';
    } else if (err.status === 500) {
      this.errorMessage = 'An error occurred while processing the image.';
    } else {
      this.errorMessage = 'An unexpected error occurred during processing.';
    }
  }

  private triggerAutomaticDownload() {
    if (this.result?.report?.download_url) {
      const url = this.predictionService.getApiUrl() + this.result.report.download_url;
      this.downloadReport(url);
    }
  }

  downloadReportManual() {
    if (this.result?.report?.download_url) {
      const url = this.predictionService.getApiUrl() + this.result.report.download_url;
      this.downloadReport(url);
    }
  }

  private downloadReport(url: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cervical_cancer_screening_report.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  resetStateKeepForm() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.result = null;
    this.originalImagePreview = null;
    this.originalFile = null;
    this.errorMessage = '';
    this.state = AppState.INITIAL;
  }

  resetState() {
    this.resetStateKeepForm();
    this.patientForm.reset();
  }

  tryAgain() {
    this.resetStateKeepForm();
  }
  
  getCellDistributionArray() {
    if (!this.result?.cell_distribution) return [];
    const dist = this.result.cell_distribution;
    const total = (dist.SCC || 0) + (dist.HSIL || 0) + (dist.LSIL || 0) + (dist.Normal || 0);
    
    return [
      { label: 'SCC', count: dist.SCC || 0, percentage: total > 0 ? ((dist.SCC || 0) / total) * 100 : 0 },
      { label: 'HSIL', count: dist.HSIL || 0, percentage: total > 0 ? ((dist.HSIL || 0) / total) * 100 : 0 },
      { label: 'LSIL', count: dist.LSIL || 0, percentage: total > 0 ? ((dist.LSIL || 0) / total) * 100 : 0 },
      { label: 'Normal', count: dist.Normal || 0, percentage: total > 0 ? ((dist.Normal || 0) / total) * 100 : 0 }
    ];
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
