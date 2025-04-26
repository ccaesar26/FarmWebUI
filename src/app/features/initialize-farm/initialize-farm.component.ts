import { Component, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { Step, StepList, StepPanel, StepPanels, Stepper } from 'primeng/stepper';
import { NgClass } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { Fluid } from 'primeng/fluid';
import { Select } from 'primeng/select';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { PolygonComponent } from '../../core/components/polygon/polygon.component';
import { AutoFocus } from 'primeng/autofocus';
import { Divider } from 'primeng/divider';
import { convertToGeoJson, Polygon } from '../../core/models/polygon.model';
import { Router, RouterLink } from '@angular/router';
import { UserProfileService } from '../../core/services/user-profile.service';
import { FarmProfileService } from '../../core/services/farm-profile.service';
import { FieldService } from '../../core/services/field.service';
import { AuthService } from '../../core/services/auth.service';
import { CreateUserProfileRequest } from '../../core/models/user-profile.model';
import { CreateFarmProfileRequest } from '../../core/models/farm-profile.model';
import { CreateFieldRequest } from '../../core/models/field.model';
import { COUNTRIES } from './countries.constants';
import { forkJoin, switchMap } from 'rxjs';

@Component({
  selector: 'app-initialize-farm',
  imports: [
    Button,
    StepPanel,
    Stepper,
    StepList,
    Step,
    StepPanels,
    NgClass,
    InputText,
    FloatLabel,
    FormsModule,
    ReactiveFormsModule,
    DatePicker,
    Fluid,
    Select,
    NgxMapboxGLModule,
    PolygonComponent,
    AutoFocus,
    Divider,
    RouterLink
  ],
  templateUrl: './initialize-farm.component.html',
  styleUrl: './initialize-farm.component.scss'
})
export class InitializeFarmComponent {
  form: FormGroup = new FormGroup({
    farmerName: new FormControl('', [ Validators.required ]),
    birthdate: new FormControl('', [ Validators.required ]),
    gender: new FormControl(null, [ Validators.required ]),
    farmName: new FormControl('', [ Validators.required ]),
    selectedCountry: new FormControl<{ name: string, code: string } | null>(null, [ Validators.required ]),
    fields: new FormControl([]),
  });

  activeStep: number = 1;
  countries = COUNTRIES;
  isSubmitting: boolean = false;
  genders: string[] = [ 'Male', 'Female' ];

  constructor(
    private router: Router,
    private userProfileService: UserProfileService,
    private farmProfileService: FarmProfileService,
    private fieldService: FieldService,
    private authService: AuthService
  ) {
  }

  onFinish() {
    if (this.form.invalid) return;

    this.isSubmitting = true;

    const {
      farmerName,
      birthdate,
      gender,
      farmName,
      selectedCountry,
      fields
    } = this.form.controls;

    const userProfile: CreateUserProfileRequest = {
      userId: null,
      name: farmerName.value,
      dateOfBirth: this.formatDate(birthdate.value),
      gender: gender.value,
      role: 'Manager'
    };

    const farmProfile: CreateFarmProfileRequest = {
      name: farmName.value,
      country: selectedCountry.value.name,
    };

    const polygons: Polygon[] = fields.value;
    const fieldRequests: CreateFieldRequest[] = polygons.map(polygon => ({
      fieldName: polygon.name,
      fieldBoundary: convertToGeoJson(polygon),
    }));

    this.initializeFarm(userProfile, farmProfile, fieldRequests).subscribe(() => {
      this.isSubmitting = false;
      this.router.navigate([ '/dashboard' ]);
    });
  }

  initializeFarm(
    userProfile: CreateUserProfileRequest,
    farmProfile: CreateFarmProfileRequest,
    fieldRequests: CreateFieldRequest[]
  ) {
    return this.userProfileService.createUserProfile(userProfile).pipe(
      switchMap(() => this.farmProfileService.createFarmProfile(farmProfile)),
      switchMap(() => {
        return this.authService.refreshToken().pipe(
          switchMap(() => {
            return fieldRequests.length > 0
              ? forkJoin(fieldRequests.map(field => this.fieldService.createField(field)))
              : [];
          })
        );
      })
    );
  }

  private formatDate(date: Date | string): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0]; // Extracts YYYY-MM-DD
  }
}
