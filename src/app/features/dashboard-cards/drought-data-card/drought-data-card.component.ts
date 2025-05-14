// drought-data-card.component.ts
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DroughtDataService } from '../../../core/services/drought-data.service';
import { FieldService } from '../../../core/services/field.service';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DroughtLevelInfo } from '../../../core/models/drought-data.model';
import { GetFieldCoordinatesResponse } from '../../../core/models/field.model';
import { ScrollPanel } from 'primeng/scrollpanel';

interface DroughtLevelDisplay {
  icon: string;
  color: string;
}

interface DroughtSummary {
  level: number;
  meaning: string;
  description: string;
  fields: string[];
}

@Component({
  selector: 'app-drought-data-card',
  standalone: true,
  imports: [ CommonModule, CardModule, ProgressSpinnerModule, DropdownModule, FormsModule, TableModule, ScrollPanel ], // Include DropdownModule
  templateUrl: './drought-data-card.component.html',
  styleUrls: [ './drought-data-card.component.scss' ]
})
export class DroughtDataCardComponent implements OnInit {

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  droughtSummaries = signal<DroughtSummary[]>([]);
  // selectedDroughtCondition = signal<DroughtSummary | null>(null); // Add selected condition

  // Options for the dropdown
  // droughtConditionOptions = computed(() => {
  //   return this.droughtSummaries().map(summary => ({
  //     label: `${summary.meaning}`,
  //     value: summary
  //   }));
  // });

  // Computed signal for display properties (icon and color)
  // droughtDisplay = computed<DroughtLevelDisplay | null>(() => {
  //   const levelInfo = this.selectedDroughtCondition();
  //   if (!levelInfo) {
  //     return null;
  //   }
  //
  //   const displayData: { [key: number]: DroughtLevelDisplay } = {
  //     0: { icon: "pi pi-circle", color: "text-green-500" },
  //     1: { icon: "pi pi-info-circle", color: "text-yellow-500" },
  //     2: { icon: "pi pi-exclamation-circle", color: "text-orange-500" },
  //     3: { icon: "pi pi-exclamation-triangle", color: "text-red-500" },
  //     4: { icon: "pi pi-circle", color: "text-emerald-500" },
  //     5: { icon: "pi pi-circle", color: "text-cyan-500" },
  //     6: { icon: "pi pi-circle", color: "text-teal-500" },
  //   };
  //
  //   // Default to level 0 if the selected level isn't in displayData
  //   return displayData[levelInfo.level] || displayData[0];
  // });
  droughtDisplay = (summary: DroughtSummary) => {
    const displayData: { [key: number]: DroughtLevelDisplay } = {
      0: { icon: "pi pi-circle", color: "text-green-500" },
      1: { icon: "pi pi-info-circle", color: "text-yellow-500" },
      2: { icon: "pi pi-exclamation-circle", color: "text-orange-500" },
      3: { icon: "pi pi-exclamation-triangle", color: "text-red-500" },
      4: { icon: "pi pi-circle", color: "text-emerald-500" },
      5: { icon: "pi pi-circle", color: "text-cyan-500" },
      6: { icon: "pi pi-circle", color: "text-teal-500" },
    };

    // Default to level 0 if the selected level isn't in displayData
    return displayData[summary.level] || displayData[0];
  };


  constructor(private droughtService: DroughtDataService, private fieldService: FieldService) {
  }

  ngOnInit(): void {
    this.fetchDroughtData(); // No date parameter
  }

  fetchDroughtData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.droughtSummaries.set([]);
    // this.selectedDroughtCondition.set(null); // Reset selected condition

    this.fieldService.getFieldsCoordinates().pipe(
      switchMap((fieldCoordinates: GetFieldCoordinatesResponse) => {
        if (fieldCoordinates.coordinates.length === 0) {
          return of([]);
        }
        const droughtRequests = fieldCoordinates.coordinates.map(coord =>
          this.droughtService.getDroughtLevel(coord.x, coord.y).pipe( // Pass null for date
            catchError(err => {
              console.error("Error fetching drought level:", err);
              return of(null);
            })
          )
        );
        return forkJoin(droughtRequests);
      }),
      switchMap((droughtLevels: (DroughtLevelInfo | null)[]) => {
        const validDroughtLevels = droughtLevels.filter((level): level is DroughtLevelInfo => level !== null);
        if (validDroughtLevels.length === 0) {
          this.loading.set(false);
          return of([]);
        }

        return this.fieldService.getFields().pipe(
          map(fields => {
            const summaryMap = new Map<number, { meaning: string, description: string, fields: string[] }>();

            validDroughtLevels.forEach(levelInfo => {
              if (!summaryMap.has(levelInfo.level)) {
                summaryMap.set(levelInfo.level, {
                  meaning: levelInfo.meaning,
                  description: levelInfo.description,
                  fields: []
                });
              }
            });

            // Get fields coordinates (Consider making this a separate signal if used elsewhere)
            this.fieldService.getFieldsCoordinates().subscribe(coordResponse => {
              // Associate fields with drought levels
              coordResponse.coordinates.forEach((coord, index) => {
                const droughtLevel = validDroughtLevels[index];
                if (droughtLevel) {
                  const matchingField = fields.find(field => this.isPointInPolygon(coord, field.boundary));
                  if (matchingField) {
                    summaryMap.get(droughtLevel.level)!.fields.push(matchingField.name);
                  }
                }
              });
            });

            const summaryArray: DroughtSummary[] = Array.from(summaryMap.entries()).map(([ level, data ]) => ({
              level,
              meaning: data.meaning,
              description: data.description,
              fields: data.fields
            }));

            this.droughtSummaries.set(summaryArray.sort((a, b) => {
              const priorityOrder = [ 3, 2, 1, 0, 4, 5, 6 ];
              return priorityOrder.indexOf(a.level) - priorityOrder.indexOf(b.level);
            }));

            // Determine the highest urgency level for default selection
            // const priorityOrder = [ 3, 2, 1, 0, 4, 5, 6 ];
            // let defaultCondition: DroughtSummary | null = null;
            // for (const level of priorityOrder) {
            //   const foundCondition = summaryArray.find(s => s.level === level);
            //   if (foundCondition) {
            //     defaultCondition = foundCondition;
            //     break; // Stop as soon as we find a match
            //   }
            // }
            //
            // this.selectedDroughtCondition.set(defaultCondition || null); // Set default or null if none found

            // return summaryArray;
          })
        );
      }),
      catchError(err => {
        this.errorMessage.set("Error fetching drought data: " + err.message);
        this.loading.set(false);
        return of([]);
      })
    ).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  // onConditionChange(newCondition: DroughtSummary | null): void {
  //   this.selectedDroughtCondition.set(newCondition);
  // }

  // Helper function (remains the same)
  isPointInPolygon(point: { x: number, y: number }, polygon: any): boolean {
    if (!polygon || !polygon.coordinates || !Array.isArray(polygon.coordinates)) {
      return false;
    }
    if (!Array.isArray(polygon.coordinates[0][0])) {
      return false;
    }

    const x = point.x, y = point.y;
    let inside = false;
    const polyPoints = polygon.coordinates[0];

    for (let i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
      const xi = polyPoints[i][0], yi = polyPoints[i][1];
      const xj = polyPoints[j][0], yj = polyPoints[j][1];

      const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }
}
