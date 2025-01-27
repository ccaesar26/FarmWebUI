import {Component} from '@angular/core';
import {Card} from "primeng/card";
import {Button} from 'primeng/button';
import {Step, StepList, StepPanel, StepPanels, Stepper} from 'primeng/stepper';
import {NgClass, NgStyle} from '@angular/common';
import {InputText} from 'primeng/inputtext';
import {FloatLabel} from 'primeng/floatlabel';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DatePicker} from 'primeng/datepicker';
import {Fluid} from 'primeng/fluid';
import {Select} from 'primeng/select';
import {NgxMapboxGLModule} from 'ngx-mapbox-gl';
import {StyleClass} from 'primeng/styleclass';
import mapboxgl from 'mapbox-gl';
import {PolygonComponent} from '../polygon/polygon.component';
import {Avatar} from 'primeng/avatar';
import {AutoFocus} from 'primeng/autofocus';

@Component({
  selector: 'app-initialize-farm',
  imports: [
    Card,
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
    Avatar,
    AutoFocus
  ],
  templateUrl: './initialize-farm.component.html',
  styleUrl: './initialize-farm.component.css'
})
export class InitializeFarmComponent {
  activeStep: number = 1;
  countries: any[] | undefined;

  name: FormControl<string | null> = new FormControl();
  birthdate: FormControl<string | null> = new FormControl();
  gender: FormControl<string | null> = new FormControl();
  genders: string[] = ['Male', 'Female'];
  selectedCountry: any;

  ngOnInit() {
    this.countries = [
      { name: 'Austria', code: '🇦🇹' },
      { name: 'Belgium', code: '🇧🇪' },
      { name: 'Bulgaria', code: '🇧🇬' },
      { name: 'Croatia', code: '🇭🇷' },
      { name: 'Cyprus', code: '🇨🇾' },
      { name: 'Czech Republic', code: '🇨🇿' },
      { name: 'Denmark', code: '🇩🇰' },
      { name: 'Estonia', code: '🇪🇪' },
      { name: 'Finland', code: '🇫🇮' },
      { name: 'France', code: '🇫🇷' },
      { name: 'Germany', code: '🇩🇪' },
      { name: 'Greece', code: '🇬🇷' },
      { name: 'Hungary', code: '🇭🇺' },
      { name: 'Ireland', code: '🇮🇪' },
      { name: 'Italy', code: '🇮🇹' },
      { name: 'Latvia', code: '🇱🇻' },
      { name: 'Lithuania', code: '🇱🇹' },
      { name: 'Luxembourg', code: '🇱🇺' },
      { name: 'Malta', code: '🇲🇹' },
      { name: 'Netherlands', code: '🇳🇱' },
      { name: 'Poland', code: '🇵🇱' },
      { name: 'Portugal', code: '🇵🇹' },
      { name: 'Romania', code: '🇷🇴' },
      { name: 'Slovakia', code: '🇸🇰' },
      { name: 'Slovenia', code: '🇸🇮' },
      { name: 'Spain', code: '🇪🇸' },
      { name: 'Sweden', code: '🇸🇪' },
    ];

  }
}
