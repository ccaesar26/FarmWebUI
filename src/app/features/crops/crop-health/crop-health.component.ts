import { ChangeDetectorRef, Component, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';

import { ProgressSpinner } from 'primeng/progressspinner';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { CropIdFormComponent } from '../crop-id-form/crop-id-form.component';
import { CropIdService } from '../../../core/services/crop-id.service';
import { CropIdEntry, IdRequestDto, SuggestionEntry } from '../../../core/models/crop-id.model';
import { finalize, map, Subscription } from 'rxjs';
import { DatePipe, NgClass } from '@angular/common';
import { TableModule, TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';
import { Ripple } from 'primeng/ripple';
import { Tag } from 'primeng/tag';
import { Image } from 'primeng/image';
import { ProgressBar } from 'primeng/progressbar';

type Severity = 'success' | 'info' | 'danger' | 'secondary' | 'warn' | 'contrast';

interface CropIdDisplay {
  id: string,
  name: string,
  longitude: number,
  latitude: number,
  fieldName: string,
  imageBase64Data: string,
  datetime: Date,
  isPlant: boolean,
  cropSuggestions: Array<SuggestionEntry>,
  diseaseSuggestions: Array<SuggestionEntry>,
}

@Component({
  selector: 'app-crop-health',
  imports: [
    ProgressSpinner,
    Button,
    Dialog,
    ReactiveFormsModule,
    CropIdFormComponent,
    TableModule,
    ButtonDirective,
    Ripple,
    Tag,
    Image,
    ProgressBar,
    NgClass,
    DatePipe
  ],
  templateUrl: './crop-health.component.html',
  styleUrl: './crop-health.component.scss'
})
export class CropHealthComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(true);
  displayModal = signal<boolean>(false);
  pastEntries = signal<Array<CropIdDisplay>>([]);
  expandedRows: WritableSignal<{ [s: string]: boolean }> = signal({}); // To manage expanded rows

  private subscriptions = new Subscription();

  constructor(
    private cropIdService: CropIdService,
    private cdRef: ChangeDetectorRef,
    // private messageService: MessageService,
    // private datePipe: DatePipe
  ) {
  }

  ngOnInit(): void {
    this.loadPastEntries();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Clean up subscriptions
  }

  loadPastEntries(): void {
    this.isLoading.set(true);
    this.subscriptions.add(
      this.cropIdService.getAllIdEntriesByFarmId()
        .pipe(
          map((responses: CropIdEntry[]): CropIdDisplay[] => {
            return responses.sort(
              (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
            ).map((entry): CropIdDisplay => {
                return {
                  id: entry.id,
                  name: entry.name,
                  longitude: entry.longitude,
                  latitude: entry.latitude,
                  fieldName: entry.fieldName,
                  imageBase64Data: entry.imageBase64Data,
                  datetime: entry.datetime,
                  isPlant: entry.isPlant,
                  cropSuggestions: entry.suggestions
                    .filter((e) => e.type == 'Crop')
                    .sort((a, b) => b.probability - a.probability),
                  diseaseSuggestions: entry.suggestions
                    .filter((e) => e.type == 'Disease')
                    .sort((a, b) => b.probability - a.probability)
                }
              }
            );
          }),
          finalize(() => this.isLoading.set(false))
        )
        .subscribe({
          next: (entries) => this.pastEntries.set(entries),
          error: (err) => {
            console.error('Error loading past entries:', err);
            // this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load past entries.' });
          }
        })
    );
  }

  openNew(): void {
    this.displayModal.set(true);
  }

  onCancel(): void {
    this.displayModal.set(false);
  }

  createIdRequest(request: IdRequestDto): void {
    alert('Creating ID request: ' + JSON.stringify(request));
    console.log('Received request from form:', request);
    this.isLoading.set(true); // Show loader while processing
    this.displayModal.set(false); // Close form dialog

    this.subscriptions.add(
      this.cropIdService.identifyCropHealth(request)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => {
            // this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Crop health analysis complete.' });
            // Add the new entry to the top of the list or reload all
            this.loadPastEntries(); // Simplest way to refresh with the new entry
          },
          error: (err) => {
            console.error('Error identifying crop health:', err);
            // this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to analyze crop health.' });
          }
        })
    );
  }

  getProbabilitySeverity(probability: number): Severity {
    if (probability > 0.75) return 'success';
    if (probability > 0.5) return 'info';
    if (probability > 0.25) return 'warn';
    return 'danger';
  }
}
