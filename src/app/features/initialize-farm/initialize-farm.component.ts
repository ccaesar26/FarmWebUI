import { Component, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { Step, StepList, StepPanel, StepPanels, Stepper } from 'primeng/stepper';
import { NgClass } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { Fluid } from 'primeng/fluid';
import { Select } from 'primeng/select';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { PolygonComponent } from '../polygon/polygon.component';
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
  styleUrl: './initialize-farm.component.css'
})
export class InitializeFarmComponent implements OnInit {
  form: FormGroup;
  activeStep: number = 1;
  countries: any[] | undefined;

  farmerName: FormControl<string | null> = new FormControl();
  birthdate: FormControl<string | null> = new FormControl();
  gender: FormControl<string | null> = new FormControl();
  farmName: FormControl<string | null> = new FormControl();
  genders: string[] = [ 'Male', 'Female' ];
  selectedCountry: FormControl<string | null> = new FormControl();
  fields: FormControl<Array<Polygon> | null> = new FormControl();

  constructor(
    private router: Router,
    private userProfileService: UserProfileService,
    private farmProfileService: FarmProfileService,
    private fieldService: FieldService,
    private authService: AuthService
  ) {
    // Initialize the form group with form controls
    this.form = new FormGroup({
      farmerName: this.farmerName,
      birthdate: this.birthdate,
      gender: this.gender,
      farmName: this.farmName,
      selectedCountry: this.selectedCountry,
      fields: this.fields
    });
  }

  ngOnInit() {
    this.countries = COUNTRIES;
  }

  onFinish() {
    if (this.form.valid) {
      const userProfile: CreateUserProfileRequest = {
        name: this.farmerName.value!,
        dateOfBirth: this.birthdate.value!,
        gender: this.gender.value!,
      };

      const farmProfile: CreateFarmProfileRequest = {
        name: this.farmName.value!,
        country: this.selectedCountry.value!,
      };

      const polygons: Polygon[] = this.fields.value ?? [];

      this.initializeFarm(userProfile, farmProfile, polygons).subscribe(() => {
        this.router.navigate([ '/dashboard' ]);
      });
    }
  }

  initializeFarm(userProfile: CreateUserProfileRequest, farmProfile: CreateFarmProfileRequest, polygons: Polygon[]) {
    return this.userProfileService.createUserProfile(userProfile).pipe(
      switchMap(() => this.farmProfileService.createFarmProfile(farmProfile)),
      switchMap(farmResponse => {
        const farmId = farmResponse.id;

        return this.authService.refreshToken().pipe(
          switchMap(() => {
            const fieldRequests: CreateFieldRequest[] = polygons.map(polygon => ({
              farmId,
              fieldName: polygon.name,
              fieldBoundary: convertToGeoJson(polygon),
            }));

            return fieldRequests.length > 0
              ? forkJoin(fieldRequests.map(field => this.fieldService.createField(field)))
              : [];
          })
        );
      })
    );
  }

}
