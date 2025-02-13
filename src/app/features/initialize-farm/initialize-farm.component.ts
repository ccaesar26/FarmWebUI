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
import { Polygon } from '../../core/models/polygon';
import { RouterLink } from '@angular/router';

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
  fields: FormControl<Array<Polygon> | null> = new FormControl();
  genders: string[] = [ 'Male', 'Female' ];
  selectedCountry: FormControl<string | null> = new FormControl();

  constructor() {
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
    this.countries = [
      { name: 'Austria', code: 'AT' },
      { name: 'Belgium', code: 'BE' },
      { name: 'Bulgaria', code: 'BG' },
      { name: 'Croatia', code: 'HR' },
      { name: 'Cyprus', code: 'CY' },
      { name: 'Czech Republic', code: 'CZ' },
      { name: 'Denmark', code: 'DK' },
      { name: 'Estonia', code: 'EE' },
      { name: 'Finland', code: 'FI' },
      { name: 'France', code: 'FR' },
      { name: 'Germany', code: 'DE' },
      { name: 'Greece', code: 'GR' },
      { name: 'Hungary', code: 'HU' },
      { name: 'Ireland', code: 'IE' },
      { name: 'Italy', code: 'IT' },
      { name: 'Latvia', code: 'LV' },
      { name: 'Lithuania', code: 'LT' },
      { name: 'Luxembourg', code: 'LU' },
      { name: 'Malta', code: 'MT' },
      { name: 'Netherlands', code: 'NL' },
      { name: 'Poland', code: 'PL' },
      { name: 'Portugal', code: 'PT' },
      { name: 'Romania', code: 'RO' },
      { name: 'Slovakia', code: 'SK' },
      { name: 'Slovenia', code: 'SI' },
      { name: 'Spain', code: 'ES' },
      { name: 'Sweden', code: 'SE' }
    ];
  }

  // Method to log form control values
  onFinish() {
    // Show a popup with the form values
    alert(JSON.stringify(this.form.value, null, 2));
  }
}
