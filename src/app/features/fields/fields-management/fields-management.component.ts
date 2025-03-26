import { Component, OnInit, signal } from '@angular/core';
import { Card } from 'primeng/card';
import { PolygonComponent } from '../../../core/components/polygon/polygon.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { convertFromGeoJson, Polygon } from '../../../core/models/polygon.model';
import { FieldService } from '../../../core/services/field.service';
import { catchError, map, of } from 'rxjs';

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
  styleUrl: './fields-management.component.css'
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
      this.initialFields = polygons; // Store initial state
      this.form.controls['fields'].patchValue(polygons); // Set form value for PolygonComponent
      this.isLoading.set(false);
      console.log("Loaded fields:", polygons);
    });
  }


  onSave() {

  }
}
