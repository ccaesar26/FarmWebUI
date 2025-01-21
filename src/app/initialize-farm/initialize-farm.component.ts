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
    NgxMapboxGLModule
  ],
  templateUrl: './initialize-farm.component.html',
  styleUrl: './initialize-farm.component.css'
})
export class InitializeFarmComponent {
  activeStep: number = 1;
  name: FormControl<string | null> = new FormControl();
  birthdate: FormControl<string | null> = new FormControl();
  gender: FormControl<string | null> = new FormControl();
  genders: string[] = ['Male', 'Female'];

  constructor() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2NhZXNhciIsImEiOiJjbHFxbDJxY280MjJuMm5tazZwYWZ6cjBhIn0.Si8HxzoWgI0n5VF5_FqyFQ';
  }
}
