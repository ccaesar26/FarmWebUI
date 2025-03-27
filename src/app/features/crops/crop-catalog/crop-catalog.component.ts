import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CropCatalogEntry } from '../../../core/models/crop-catalog.model';
import { CropCatalogService } from '../../../core/services/crop-catalog.service';
import { Card } from 'primeng/card';
import { PrimeTemplate } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { NgForOf, NgIf } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Paginator } from 'primeng/paginator';

@Component({
  selector: 'app-crop-catalog',
  imports: [
    Card,
    PrimeTemplate,
    ProgressSpinner,
    NgIf,
    NgForOf,
    Dialog,
    Button,
    Paginator
  ],
  templateUrl: './crop-catalog.component.html',
  styleUrl: './crop-catalog.component.css'
})
export class CropCatalogComponent implements OnInit {
  allCropEntries: WritableSignal<CropCatalogEntry[]> = signal([]);
  cropEntries: WritableSignal<CropCatalogEntry[]> = signal([]);
  isLoading: WritableSignal<boolean> = signal(false)
  dialogVisible: WritableSignal<boolean> = signal(false);
  selectedCrop: WritableSignal<CropCatalogEntry | null> = signal(null);

  // Pagination properties
  totalRecords = signal<number>(0);
  rowsPerPage = signal<number>(10); // Initial rows per page
  first = signal<number>(0);        // First record index

  constructor(private cropCatalogService: CropCatalogService) {
  }

  ngOnInit(): void {
    this.isLoading.set(true);
    this.cropCatalogService.getCropCatalogEntries().subscribe(
      (entries) => {
        this.allCropEntries.set(entries.sort((a, b) => a.name.localeCompare(b.name)));
        this.totalRecords.set(entries.length);
        this.paginate({ first: 0, rows: this.rowsPerPage() });
        this.isLoading.set(false);
      },
      (error) => {
        console.error('Error fetching crop catalog entries:', error);
        this.isLoading.set(false);
      }
    );
  }

  openDialog(crop: CropCatalogEntry) {
    this.selectedCrop.set(crop);
    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.selectedCrop.set(null);
  }

  onPageChange(event: any) {
    this.paginate(event);
  }

  paginate(event: any) {
    this.isLoading.set(true); // Optionally show loading during pagination

    this.first.set(event.first);
    this.rowsPerPage.set(event.rows);

    const startIndex = event.first;
    const endIndex = startIndex + event.rows;
    const currentSlice = this.allCropEntries().slice(startIndex, endIndex);
    this.cropEntries.set(currentSlice);

    this.isLoading.set(false); // Hide loading after pagination is done
  }
}
