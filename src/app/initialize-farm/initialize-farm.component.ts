import {Component} from '@angular/core';
import {Card} from "primeng/card";
import {Button} from 'primeng/button';
import {Step, StepList, StepPanel, StepPanels, Stepper} from 'primeng/stepper';
import {NgClass} from '@angular/common';
import {InputText} from 'primeng/inputtext';
import {FloatLabel} from 'primeng/floatlabel';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputGroup} from 'primeng/inputgroup';
import {InputGroupAddon} from 'primeng/inputgroupaddon';
import {DatePicker} from 'primeng/datepicker';
import {StyleClass} from 'primeng/styleclass';
import {Fluid} from 'primeng/fluid';
import {Select} from 'primeng/select';
import {FileUpload, FileUploadEvent} from 'primeng/fileupload';
import {PrimeTemplate} from 'primeng/api';
import {Toast} from 'primeng/toast';

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
    InputGroup,
    InputGroupAddon,
    ReactiveFormsModule,
    DatePicker,
    StyleClass,
    Fluid,
    Select,
    FileUpload,
    PrimeTemplate,
    Toast
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

  onUpload($event: FileUploadEvent) {
    console.log($event.files);
  }
}
