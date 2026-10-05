import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  @Input() isLoading = false;
  @Output() analyze = new EventEmitter<File>();

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isDragging = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    
    if (event.dataTransfer?.files?.length) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
    input.value = ''; // reset
  }

  private handleFile(file: File) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/tiff'];
    if (validTypes.includes(file.type)) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => {
        if(e.target) {
           this.imagePreview = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid image (PNG, JPG/JPEG, BMP, TIFF).');
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  analyzeImage() {
    if (this.selectedFile && !this.isLoading) {
      this.analyze.emit(this.selectedFile);
    }
  }
}
