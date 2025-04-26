import { Component, OnInit, signal } from '@angular/core';
import { Card } from 'primeng/card';
import { PolygonComponent } from '../../../core/components/polygon/polygon.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { convertFromGeoJson, convertToGeoJson, Polygon } from '../../../core/models/polygon.model';
import { FieldService } from '../../../core/services/field.service';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { CreateFieldRequest, UpdateFieldRequest } from '../../../core/models/field.model';

@Component({
  selector: 'app-fields-management',
  imports: [
    Card,
    PolygonComponent,
    FormsModule,
    ReactiveFormsModule,
    Button
  ],
  templateUrl: './fields-management.component.html',
  styleUrl: './fields-management.component.scss'
})
export class FieldsManagementComponent implements OnInit {
  form: FormGroup = new FormGroup({
    fields: new FormControl<Polygon[]>([])
  });

  initialFields: Polygon[] = []; // Store initially loaded fields for comparison (needed for update/delete later)
  isLoading = signal(true); // Use signal for loading
  isSaving = signal(false);  // Use signal for saving

  constructor(private fieldService: FieldService) {
  }

  ngOnInit() {
    this.loadExistingFields();
  }

  loadExistingFields() {
    this.isLoading.set(true);
    this.fieldService.getFields().pipe(
      map(backendFields => {
        // Convert backend Field[] to frontend Polygon[]
        return backendFields
          .map(field => convertFromGeoJson(field))
          .filter((polygon): polygon is Polygon => polygon !== null); // Filter out nulls
      }),
      catchError(error => {
        console.error("Error loading fields:", error);
        // this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load existing fields.' });
        return of([]); // Return empty array on error
      })
    ).subscribe(polygons => {
      this.initialFields = [...polygons]; // Store initial state
      this.form.controls['fields'].patchValue(polygons); // Set form value for PolygonComponent
      this.isLoading.set(false);
      console.log("Loaded fields:", polygons);
    });
  }

  onDiscard() {
    this.loadExistingFields();
  }

  onSave() {
    if (this.isSaving()) return;
    this.isSaving.set(true);

    const { fields } = this.form.controls;
    const polygons: Polygon[] = fields.value;

    const fieldsToCreate: CreateFieldRequest[] = [];
    const fieldsToUpdate: UpdateFieldRequest[] = [];

    polygons.forEach(polygon => {
      const isNewField = !this.initialFields.some(initialField => initialField.id === polygon.id);
      if (isNewField) {
        fieldsToCreate.push({
          fieldName: polygon.name,
          fieldBoundary: convertToGeoJson(polygon),
        });
      } else {
        // Find the original field to get the backend fieldId if available. If not available, it's still ok, backend can identify by other means if needed.
        const originalField = this.initialFields.find(initialField => initialField.id === polygon.id);
        fieldsToUpdate.push({
          fieldId: originalField?.id ?? "", // Assuming backendId exists in your Polygon model after loading from backend
          fieldName: polygon.name,
          fieldBoundary: convertToGeoJson(polygon),
        });
      }
    });

    const createObservables = fieldsToCreate.length > 0
      ? fieldsToCreate.map(field => this.fieldService.createField(field))
      : [ of(null) ]; // of(null) if no creates
    const updateObservables = fieldsToUpdate.length > 0
      ? fieldsToUpdate.map(field => this.fieldService.updateField(field))
      : [ of(null) ]; // of(null) if no updates

    forkJoin({
      creates: forkJoin(createObservables),
      updates: forkJoin(updateObservables)
    }).pipe(
      tap(() => console.log('Save operations started')), // Log at the start of save operations
      switchMap(() => this.fieldService.getFields()), // Refresh fields after save
      map(backendFields => {
        return backendFields
          .map(field => convertFromGeoJson(field))
          .filter((polygon): polygon is Polygon => polygon !== null);
      }),
      tap(refreshedPolygons => {
        this.initialFields = refreshedPolygons; // Update initialFields with refreshed data
        this.form.controls['fields'].patchValue(refreshedPolygons); // Update form with refreshed data
      }),
      catchError(error => {
        console.error('Error during save operations:', error);
        // Optionally, show an error message to the user
        return of([]); // Or throwError(error) to propagate the error
      })
    ).subscribe({
      next: (refreshedPolygons) => {
        this.isSaving.set(false);
        this.loadExistingFields();
        console.log('Fields saved and refreshed successfully', refreshedPolygons);
        // Optionally, show a success message to the user
      },
      error: () => {
        this.isSaving.set(false); // Ensure isSaving is false even on error
      }
    });
  }
}
