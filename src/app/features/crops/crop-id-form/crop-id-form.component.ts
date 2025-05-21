import { Component, EventEmitter, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { IdRequestDto } from '../../../core/models/crop-id.model';
import { Field, GetFieldCenterCoordinates } from '../../../core/models/field.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldService } from '../../../core/services/field.service';
import { Fluid } from 'primeng/fluid';
import { FloatLabel } from 'primeng/floatlabel';

import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { FileSelectEvent, FileUpload, FileUploadEvent } from 'primeng/fileupload';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-crop-id-form',
  imports: [
    Fluid,
    ReactiveFormsModule,
    FloatLabel,
    Select,
    InputText,
    FileUpload,
    ButtonDirective
  ],
  templateUrl: './crop-id-form.component.html',
  styleUrl: './crop-id-form.component.scss'
})
export class CropIdFormComponent implements OnInit {

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<IdRequestDto>();

  fieldsEntries: WritableSignal<Field[]> = signal([]);
  submitted: WritableSignal<boolean> = signal(false);
  submitting: WritableSignal<boolean> = signal(false);
  uploadedFile: File | null = null;
  isUploadedFile: WritableSignal<boolean> = signal(false);

  form = new FormGroup({
    name: new FormControl<string>('', [ Validators.required ]),
    selectedField: new FormControl<Field | null>(null, [ Validators.required ]),
  });

  constructor(
    private fieldService: FieldService,
  ) {
  }

  ngOnInit() {
    this.fieldService.getFields().subscribe({
      next: (fields) => {
        this.fieldsEntries.set(fields);
      },
      error: (error) => {
        console.error('Error fetching fields:', error);
      }
    });
  }

  onCancel() {
    this.form.reset();
    this.cancel.emit();
  }

  async onSubmit() {
    this.submitted.set(true);

    if (!this.form.valid) {
      return;
    }

    this.submitting.set(true);
    const { name, selectedField } = this.form.value;
    if (!name || !selectedField || !this.uploadedFile) {
      console.error('Form is invalid');
      return;
    }

    try {
      const imageBase64 = await this.convertFileToBase64(this.uploadedFile);

      const {lon, lat} = GetFieldCenterCoordinates(selectedField);

      const idRequest: IdRequestDto = {
        name: name,
        latitude: lat,
        longitude: lon,
        fieldName: selectedField.name,
        imageBase64Data: imageBase64,
        datetime: new Date()
      };

      this.save.emit(idRequest);
    } catch (error) {
      console.error('Error converting file to base64:', error);
    } finally {
      this.submitting.set(false);
      this.submitted.set(false);
      this.form.reset();
      this.isUploadedFile.set(false);
      this.uploadedFile = null;
    }
  }

  onUpload(event: FileSelectEvent) {
    this.uploadedFile = event.files[0];
    this.isUploadedFile.set(true);
  }

  isValid() {
    return this.form.valid && this.isUploadedFile();
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // reads file as data URL
      reader.onload = () => resolve(reader.result as string); // base64 result
      reader.onerror = error => reject(error);
    });
  }
}
