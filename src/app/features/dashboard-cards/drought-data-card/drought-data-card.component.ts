// drought-data-card.component.ts
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DroughtDataService } from '../../../core/services/drought-data.service';
import { FieldService } from '../../../core/services/field.service'; // Import FieldService
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table'; // Import TableModule
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DroughtLevelInfo } from '../../../core/models/drought-data.model';
import { GetFieldCoordinatesResponse } from '../../../core/models/field.model';


interface DroughtLevelDisplay {
  icon: string;
  color: string;
}

interface DroughtSummary {
  level: number;
  meaning: string;
  description: string;
  fields: string[]; // Array of field names
}

@Component({
  selector: 'app-drought-data-card',
  standalone: true,
  imports: [CommonModule, CardModule, ProgressSpinnerModule, DropdownModule, FormsModule, TableModule], // Add TableModule
  templateUrl: './drought-data-card.component.html',
  styleUrls: ['./drought-data-card.component.css']
})
export class DroughtDataCardComponent implements OnInit {

  droughtLevelInfo = signal<DroughtLevelInfo | null>(null);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  selectedDate = signal<Date | null>(new Date());
  availableDates: { label: string, value: Date }[] = [];

  droughtSummary = signal<DroughtSummary[]>([]); // Signal for the summary table data
  maxDroughtLevel = computed(() => {  //most alarming state signal
    let maxLevel = -1; // Start with a value lower than any valid level
    this.droughtSummary().forEach(summary => {
      if (summary.level > maxLevel) {
        maxLevel = summary.level;
      }
    });
    return this.droughtLevelInfo()?.level === maxLevel ? this.droughtLevelInfo() : null; //return droughtLevelInfo signal
  });
  // Computed signal for display properties (icon and color)
  droughtDisplay = computed<DroughtLevelDisplay | null>(() => {
    const levelInfo = this.maxDroughtLevel(); //use maxDroughtLevel
    if (!levelInfo) {
      return null;
    }

    const displayData: { [key: number]: DroughtLevelDisplay } = {
      0: { icon: "pi pi-circle", color: "green-600" },
      1: { icon: "pi pi-info-circle", color: "yellow-600" },
      2: { icon: "pi pi-exclamation-circle", color: "amber-600" },
      3: { icon: "pi pi-exclamation-triangle", color: "red-600" },
      4: { icon: "pi pi-circle", color: "emerald-600" },
      5: { icon: "pi pi-circle", color: "cyan-600" },
      6: { icon: "pi pi-circle", color: "teal-600" },
    };

    return displayData[levelInfo.level] || null;
  });

  constructor(private droughtService: DroughtDataService, private fieldService: FieldService) { }

  ngOnInit(): void {
    this.fetchDroughtData(this.selectedDate());
  }

  fetchDroughtData(date: Date | null): void {
    if (!date) {
      this.errorMessage.set("Please provide a valid date.");
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.droughtSummary.set([]); // Clear previous summary data
    this.droughtLevelInfo.set(null);

    this.fieldService.getFieldsCoordinates().pipe(
      switchMap((fieldCoordinates: GetFieldCoordinatesResponse) => {
        if (fieldCoordinates.coordinates.length === 0) {
          return of([]); // Return an empty array if there are no coordinates
        }
        // Create an array of observables, one for each coordinate pair
        const droughtRequests = fieldCoordinates.coordinates.map(coord =>
          this.droughtService.getDroughtLevel(coord.x, coord.y, date).pipe(
            catchError(err => {
              console.error("Error fetching drought level for coordinate:", coord, err);
              return of(null);  // Return null for this specific coordinate on error
            })
          )
        );
        // Use forkJoin to execute all requests in parallel
        return forkJoin(droughtRequests);
      }),
      switchMap((droughtLevels: (DroughtLevelInfo | null)[]) => { //array of (DroughtLevelInfo | null)[]
        // Filter out null values (failed requests) and create a summary
        const validDroughtLevels = droughtLevels.filter((level): level is DroughtLevelInfo => level !== null);
        if (validDroughtLevels.length === 0)
        {
          this.loading.set(false);
          return of([]);//if no valid drought data
        }

        return this.fieldService.getFields().pipe( //get fields
          map(fields => {
            const summaryMap = new Map<number, { meaning: string, description: string, fields: string[] }>();

            // Populate the summaryMap
            validDroughtLevels.forEach(levelInfo => {
              if (!summaryMap.has(levelInfo.level)) {
                summaryMap.set(levelInfo.level, {
                  meaning: levelInfo.meaning,
                  description: levelInfo.description,
                  fields: []
                });
              }
            });


            // Get fields coordinates
            this.fieldService.getFieldsCoordinates().subscribe(coordResponse => {

              // Associate fields with drought levels.  This requires another nested loop.
              coordResponse.coordinates.forEach((coord, index) => {
                const droughtLevel = validDroughtLevels[index]; //get droughtLevel
                if (droughtLevel) { //if droughtLevel exists
                  const matchingField = fields.find(field => {  //find field
                    // Check if the coordinate is within the field boundary
                    return this.isPointInPolygon(coord, field.boundary);
                  });

                  if (matchingField) { //if field found, add to fields array
                    summaryMap.get(droughtLevel.level)!.fields.push(matchingField.name);
                  }
                }
              });

            });

            // Convert the map to an array and set droughtSummary signal
            const summaryArray: DroughtSummary[] = Array.from(summaryMap.entries()).map(([level, data]) => ({
              level,
              meaning: data.meaning,
              description: data.description,
              fields: data.fields
            }));

            this.droughtSummary.set(summaryArray); //summary data

            let maxLevel = -1;
            let maxLevelInfo: DroughtLevelInfo | null = null;
            summaryArray.forEach(summary => { //find most alarming state.
              if (summary.level > maxLevel) {
                maxLevel = summary.level;
                maxLevelInfo = {level: summary.level, meaning: summary.meaning, description: summary.description}
              }
            });
            this.droughtLevelInfo.set(maxLevelInfo); //most alarming state data

            return summaryArray;
          })
        );
      }),
      catchError(err => { //catch errors in switchMap
        this.errorMessage.set(err.message); //global error handling
        this.loading.set(false);
        return of([]); // Return an empty array to prevent the stream from breaking
      })
    ).subscribe({ //subscribe and set loading false.
      next: () => {this.loading.set(false)},
      error: () => {this.loading.set(false)} //ensure loading false
    });
  }

  onDateChange(newDate: Date | null) {
    this.selectedDate.set(newDate);
    this.fetchDroughtData(newDate);
  }

  // Helper function to check if a point is inside a polygon (simplified for demonstration)
  isPointInPolygon(point: { x: number, y: number }, polygon: any): boolean {
    // Basic check: if polygon is not defined, consider point is not inside
    if (!polygon || !polygon.coordinates || !Array.isArray(polygon.coordinates)) {
      return false;
    }
    // Ensure polygon is a 3D array
    if (!Array.isArray(polygon.coordinates[0][0])) {
      return false;
    }

    const x = point.x, y = point.y;
    let inside = false;
    // Get first element of polygon.coordinates
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
