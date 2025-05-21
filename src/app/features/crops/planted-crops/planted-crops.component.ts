import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { Card } from 'primeng/card';
import { DatePipe } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { PlantedCropFormComponent } from '../planted-crop-form/planted-crop-form.component';
import { PlantedCropService } from '../../../core/services/planted-crop.service';
import { CropCreateDto, CropDto } from '../../../core/models/planted-crop.model';

@Component({
  selector: 'app-planted-crops',
  imports: [
    Card,
    ProgressSpinner,
    TableModule,
    Button,
    Dialog,
    PlantedCropFormComponent,
    DatePipe
],
  templateUrl: './planted-crops.component.html',
  styleUrl: './planted-crops.component.scss'
})
export class PlantedCropsComponent implements OnInit {
  isLoading: WritableSignal<boolean> = signal(false)
  displayModal: WritableSignal<boolean> = signal(false);

  crops: CropDto[] = [];

  constructor(private plantedCropService: PlantedCropService) {
  }

  ngOnInit(): void {
    this.loadCrops();
  }

  loadCrops(): void {
    this.isLoading.set(true);
    this.plantedCropService.getCrops().subscribe({
      next: (data) => {
        this.crops = data;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading crops:', error);
        this.isLoading.set(false);
      }
    });
  }

  openNew() {
    this.displayModal.set(true)
  }

  hideDialog() {
    this.displayModal.set(false);
  }

  createCrop(crop: CropDto) {
    const cropCreateDto: CropCreateDto = {
      name: crop.name,
      binomialName: crop.binomialName,
      cultivatedVariety: crop.cultivatedVariety,
      imageLink: crop.imageLink,
      perennial: crop.perennial,
      plantingDate: crop.plantingDate,
      expectedFirstHarvestDate: crop.expectedFirstHarvestDate,
      expectedLastHarvestDate: crop.expectedLastHarvestDate,
      expectedFirstHarvestStartDate: crop.expectedFirstHarvestStartDate,
      expectedFirstHarvestEndDate: crop.expectedFirstHarvestEndDate,
      expectedLastHarvestStartDate: crop.expectedLastHarvestStartDate,
      expectedLastHarvestEndDate: crop.expectedLastHarvestEndDate,
      fieldId: crop.fieldId,
      area: crop.area || 0,
      cropCatalogId: crop.cropCatalogId
    }

    this.plantedCropService.createCrop(cropCreateDto).subscribe(
      (newCrop) => {
        this.crops.push(newCrop);
        this.hideDialog();
      },
      (error) => {
        console.error('Error creating crop:', error);
      }
    );
  }
}
