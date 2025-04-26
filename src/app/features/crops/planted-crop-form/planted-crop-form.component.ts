import { Component, EventEmitter, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { Fluid } from 'primeng/fluid';
import { ButtonDirective } from 'primeng/button';
import { CropCatalogEntry } from '../../../core/models/crop-catalog.model';
import { CropCatalogService } from '../../../core/services/crop-catalog.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Card } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { NgIf } from '@angular/common';
import { Calendar } from 'primeng/calendar';
import { CalculateArea, Field } from '../../../core/models/field.model';
import { FieldService } from '../../../core/services/field.service';
import { Panel } from 'primeng/panel';
import { InputNumber } from 'primeng/inputnumber';
import { CropDto } from '../../../core/models/planted-crop.model';

@Component({
  selector: 'app-planted-crop-form',
  imports: [
    Fluid,
    ButtonDirective,
    FormsModule,
    ReactiveFormsModule,
    Card,
    FloatLabel,
    Select,
    InputText,
    Message,
    NgIf,
    Calendar,
    Panel,
    InputNumber
  ],
  templateUrl: './planted-crop-form.component.html',
  styleUrl: './planted-crop-form.component.scss'
})
export class PlantedCropFormComponent implements OnInit {

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<CropDto>();

  cropEntries: WritableSignal<CropCatalogEntry[]> = signal([]);
  fieldsEntries: WritableSignal<Field[]> = signal([]);
  submitted: WritableSignal<boolean> = signal(false);
  submitting: WritableSignal<boolean> = signal(false);


  cropForm = new FormGroup({
    selectedCrop: new FormControl<CropCatalogEntry | null>(null, [ Validators.required ]),
    variety: new FormControl<string | undefined>(undefined),
    plantingDate: new FormControl<Date | null>(new Date(), [ Validators.required ]),
    expectedHarvestPeriod: new FormControl<Date[]>([]),
    expectedEarlyHarvestPeriod: new FormControl<Date[]>([]),
    expectedLateHarvestPeriod: new FormControl<Date[]>([]),
    field: new FormControl<Field | null>(null, [ Validators.required ]),
    area: new FormControl<number | null>(null, [ Validators.required ]),
  });

  constructor(
    private cropCatalogService: CropCatalogService,
    private fieldService: FieldService,
  ) {
  }

  ngOnInit() {
    this.cropCatalogService.getCropCatalogEntries().subscribe(
      (entries) => {
        this.cropEntries.set(entries.sort((a, b) => a.name.localeCompare(b.name)));
      },
      (error) => {
        console.error('Error fetching crop catalog entries:', error);
      }
    );

    this.fieldService.getFields().subscribe(
      (entries) => {
        this.fieldsEntries.set(entries.sort((a, b) => a.name.localeCompare(b.name)));
      },
      (error) => {
        console.error('Error fetching field entries:', error);
      }
    );

    // Subscribe to changes in plantingDate to calculate harvest dates
    this.cropForm.controls.plantingDate.valueChanges.subscribe(plantingDate => {
      this.calculateHarvestDates(plantingDate);
    });

    // Optionally, subscribe to changes in selectedCrop if harvest dates depend on it immediately
    this.cropForm.controls.selectedCrop.valueChanges.subscribe(() => {
      this.calculateHarvestDates(this.cropForm.controls.plantingDate.value);
    });

    // Subscribe to changes in field to update area
    this.cropForm.controls.field.valueChanges.subscribe(field => {
      if (field) {
        this.cropForm.controls.area.setValue(CalculateArea(field));
      } else {
        this.cropForm.controls.area.setValue(null);
      }
    });
  }

  onCancel() {
    // Clear the form
    this.cropForm.reset({
      selectedCrop: null,
      variety: null,
      plantingDate: new Date(),
    });
    this.cancel.emit();
  }

  onSubmit() {
    this.submitted.set(true);
    this.submitting.set(true);
    if (this.cropForm.invalid) {
      this.submitting.set(false);
      return;
    }

    const selectedCrop = this.cropForm.controls.selectedCrop.value;
    const plantingDate = this.cropForm.controls.plantingDate.value;

    if (selectedCrop && plantingDate) {
      const cropDto: CropDto = {
        id: '',
        name: selectedCrop.name,
        binomialName: selectedCrop.binomialName,
        cultivatedVariety: this.cropForm.controls.variety.value || undefined,
        imageLink: selectedCrop.imageLink,
        perennial: selectedCrop.isPerennial,
        plantingDate: this.formatToDateOnlyString(plantingDate),
        expectedFirstHarvestDate: undefined,
        expectedLastHarvestDate: undefined,
        expectedFirstHarvestStartDate: undefined,
        expectedFirstHarvestEndDate: undefined,
        expectedLastHarvestStartDate: undefined,
        expectedLastHarvestEndDate: undefined,
        fieldId: this.cropForm.controls.field.value?.id || '',
        area: this.cropForm.controls.area.value || 0,
        cropCatalogId: selectedCrop.id,
      };

      if (!cropDto.perennial) {
        cropDto.expectedFirstHarvestDate = this.formatToDateOnlyString(this.cropForm.controls.expectedHarvestPeriod.value?.at(0));
        cropDto.expectedLastHarvestDate = this.formatToDateOnlyString(this.cropForm.controls.expectedHarvestPeriod.value?.at(1));
      } else {
        cropDto.expectedFirstHarvestStartDate = this.formatToDateOnlyString(this.cropForm.controls.expectedEarlyHarvestPeriod.value?.at(0));
        cropDto.expectedFirstHarvestEndDate = this.formatToDateOnlyString(this.cropForm.controls.expectedEarlyHarvestPeriod.value?.at(1));
        cropDto.expectedLastHarvestStartDate = this.formatToDateOnlyString(this.cropForm.controls.expectedLateHarvestPeriod.value?.at(0));
        cropDto.expectedLastHarvestEndDate = this.formatToDateOnlyString(this.cropForm.controls.expectedLateHarvestPeriod.value?.at(1));
      }

      this.save.emit(cropDto);
      this.submitting.set(false);
    }

    this.cropForm.reset({
      selectedCrop: null,
      variety: null,
      plantingDate: new Date(),
    });
  }

  private calculateHarvestDates(plantingDate: Date | null) {
    const selectedCrop = this.cropForm.controls.selectedCrop.value;

    if (plantingDate && selectedCrop) {
      if (!selectedCrop.isPerennial) {
        if (selectedCrop.daysToFirstHarvest && selectedCrop.daysToLastHarvest) {
          const expectedHarvestPeriod = new Array<Date>(2);

          const firstHarvest = new Date(plantingDate);
          firstHarvest.setDate(firstHarvest.getDate() + selectedCrop.daysToFirstHarvest);
          expectedHarvestPeriod[0] = firstHarvest;

          const lastHarvest = new Date(plantingDate);
          lastHarvest.setDate(lastHarvest.getDate() + selectedCrop.daysToLastHarvest);
          expectedHarvestPeriod[1] = lastHarvest;

          this.cropForm.controls.expectedHarvestPeriod.setValue(expectedHarvestPeriod);
        } else {
          this.cropForm.controls.expectedHarvestPeriod.setValue([]);
        }
      } else {
        if (selectedCrop.minMonthsToBearFruit && selectedCrop.maxMonthsToBearFruit &&
          selectedCrop.harvestSeasonStart && selectedCrop.harvestSeasonEnd) {
          /*
          * Calculate the first and last harvest dates based on the minMonthsToBearFruit, maxMonthsToBearFruit,
          * harvestSeasonStart and harvestSeasonEnd
          *
          * harvestSeasonStart, and harvestSeasonEnd uses the year 2000 as a reference, but should be adjusted to the current year
          *
          * firstDate = plantingDate + minMonthsToBearFruit
          * if firstDate is before harvestSeasonStart, set firstDate to harvestSeasonStart this year and lastDate to harvestSeasonEnd this year
          * else if firstDate is after harvestSeasonEnd, set firstDate to harvestSeasonStart next year and lastDate to harvestSeasonEnd next year
          * else if firstDate is between harvestSeasonStart and harvestSeasonEnd, set firstDate to firstDate and lastDate to harvestSeasonEnd this year
          * */

          const currentYear = new Date().getFullYear();

          let firstHarvestStart = new Date(plantingDate);
          let firstHarvestEnd = new Date(plantingDate);
          firstHarvestStart.setMonth(firstHarvestStart.getMonth() + selectedCrop.minMonthsToBearFruit);
          firstHarvestEnd.setMonth(firstHarvestEnd.getMonth() + selectedCrop.minMonthsToBearFruit);

          const harvestSeasonStart = new Date(
            currentYear + selectedCrop.minMonthsToBearFruit / 12,
            parseInt(selectedCrop.harvestSeasonStart.split('-')[1]) - 1,
            parseInt(selectedCrop.harvestSeasonStart.split('-')[2])
          );
          const harvestSeasonEnd = new Date(
            currentYear + selectedCrop.minMonthsToBearFruit / 12,
            parseInt(selectedCrop.harvestSeasonEnd.split('-')[1]) - 1,
            parseInt(selectedCrop.harvestSeasonEnd.split('-')[2])
          );

          if (firstHarvestStart < harvestSeasonStart) {
            firstHarvestStart = new Date(harvestSeasonStart);
            firstHarvestEnd = new Date(harvestSeasonEnd);
          } else if (firstHarvestStart > harvestSeasonEnd) {
            firstHarvestStart = new Date(
              harvestSeasonStart.getFullYear() + 1,
              harvestSeasonStart.getMonth(),
              harvestSeasonStart.getDate()
            );
            firstHarvestEnd = new Date(
              harvestSeasonEnd.getFullYear() + 1,
              harvestSeasonEnd.getMonth(),
              harvestSeasonEnd.getDate()
            );
          } else {
            firstHarvestStart = new Date(firstHarvestStart);
            firstHarvestEnd = new Date(harvestSeasonEnd);
          }

          this.cropForm.controls.expectedEarlyHarvestPeriod.setValue([ firstHarvestStart, firstHarvestEnd ]);

          let lastHarvestStart = new Date(plantingDate);
          let lastHarvestEnd = new Date(plantingDate);
          lastHarvestStart.setMonth(lastHarvestStart.getMonth() + selectedCrop.maxMonthsToBearFruit);
          lastHarvestEnd.setMonth(lastHarvestEnd.getMonth() + selectedCrop.maxMonthsToBearFruit);

          harvestSeasonStart.setFullYear(currentYear + selectedCrop.maxMonthsToBearFruit / 12);
          harvestSeasonEnd.setFullYear(currentYear + selectedCrop.maxMonthsToBearFruit / 12);

          if (lastHarvestStart < harvestSeasonStart) {
            lastHarvestStart = new Date(harvestSeasonStart);
            lastHarvestEnd = new Date(harvestSeasonEnd);
          } else if (lastHarvestStart > harvestSeasonEnd) {
            lastHarvestStart = new Date(
              harvestSeasonStart.getFullYear() + 1,
              harvestSeasonStart.getMonth(),
              harvestSeasonStart.getDate()
            );
            lastHarvestEnd = new Date(
              harvestSeasonEnd.getFullYear() + 1,
              harvestSeasonEnd.getMonth(),
              harvestSeasonEnd.getDate()
            );
          } else {
            lastHarvestStart = new Date(lastHarvestStart);
            lastHarvestEnd = new Date(harvestSeasonEnd);
          }

          this.cropForm.controls.expectedLateHarvestPeriod.setValue([ lastHarvestStart, lastHarvestEnd ]);
        } else {
          this.cropForm.controls.expectedEarlyHarvestPeriod.setValue([]);
        }
      }
    } else {
      this.cropForm.controls.expectedEarlyHarvestPeriod.setValue([]);
    }
  }

  private formatToDateOnlyString(date: Date | undefined): string {
    const year = date?.getFullYear();
    const month = String((date?.getMonth() ?? 0) + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date?.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
