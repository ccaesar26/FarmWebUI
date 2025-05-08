// reports-management.component.ts
import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button'; // For potential future actions
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, finalize } from 'rxjs/operators';
import {
  DisplayReport,
  ReportDto,
  ReportsByStatusMap,
  ReportStatus,
  reportStatusToString
} from '../../../core/models/reports.model';
import { ReportsService } from '../../../core/services/reports.service';
import { FieldService } from '../../../core/services/field.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

type Severity = 'success' | 'info' | 'danger' | 'secondary' | 'contrast' | 'warn';

@Component({
  selector: 'app-reports-management',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    CardModule,
    TagModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [ MessageService ],
  templateUrl: './reports-management.component.html',
  styleUrls: [ './reports-management.component.scss' ]
})
export class ReportsManagementComponent implements OnInit {

  reportsByStatus = signal<ReportsByStatusMap>({});
  reportStatuses: ReportStatus[] = [ // Define order explicitly if needed
    ReportStatus.Submitted,
    ReportStatus.Seen,
    ReportStatus.InProgress,
    ReportStatus.Resolved,
    ReportStatus.Closed,
  ]; // For iteration
  isLoading = signal(true);
  // Control which panels are open initially (optional)
  // Example: Open Pending and InProgress by default
  activeAccordionIndexes: number[] = [ 0, 1 ]; // Indexes corresponding to reportStatuses array

  // Mapping for backend status numbers (adjust if backend sends strings)
  statusMapReverse: Map<ReportStatus, number> = new Map([
    [ ReportStatus.Submitted, 0 ],
    [ ReportStatus.Seen, 1 ],
    [ ReportStatus.InProgress, 2 ],
    [ ReportStatus.Resolved, 3 ],
    [ ReportStatus.Closed, 4 ],
    // Add others if needed
  ]);
  statusMap: Map<number, ReportStatus> = new Map([
    [ 0, ReportStatus.Submitted ],
    [ 1, ReportStatus.Seen ],
    [ 2, ReportStatus.InProgress ],
    [ 3, ReportStatus.Resolved ],
    [ 4, ReportStatus.Closed ],
  ]);

  workers: WritableSignal<User[]> = signal([]);

  constructor(
    private reportsService: ReportsService,
    private fieldService: FieldService,
    private userService: UserService, // Assuming UserService has getUserById
    private messageService: MessageService
  ) {
  }

  ngOnInit(): void {
    this.fetchWorkers(); // Fetch workers on init
    this.loadReportsAndDetails();
  }

  fetchWorkers(): void {
    this.userService.getWorkerUsers().subscribe(workers => {
        this.workers.set(workers);
        console.log("Fetched workers:", this.workers());
      }
    )
  }

  loadReportsAndDetails(): void {
    this.isLoading.set(true);
    this.reportsService.getReports().pipe( // Fetch all reports initially
      switchMap((reports: ReportDto[]) => {
        if (!reports || reports.length === 0) {
          return of([]); // No reports to process
        }

        // Create an array of observables to fetch details for each report
        const detailObservables = reports.map(report => {
          // Fetch Field Name
          const fieldName$ = (report.fieldId && report.fieldId !== '')
            ? this.fieldService.getFieldById(report.fieldId).pipe(
              map(field => field.name), // Get name or 'N/A'
              catchError(() => of('')) // Handle error for specific field
            )
            : of(null); // No field ID, emit null

          // Look for Creator Username in workers
          const creatorUsername$ = this.workers().find(worker => worker.id === report.createdByUserId)?.username
            ? of(this.workers().find(worker => worker.id === report.createdByUserId)?.username)
            : of('Unknown Creator'); // Should ideally not happen if createdByUserId is mandatory

          // Combine fetches for this report
          return forkJoin({ fieldName: fieldName$, creatorUsername: creatorUsername$ }).pipe(
            map(details => ({
              ...report, // Spread original report data
              status: this.statusMap.get(report.status as unknown as number), // Map status
              fieldName: details.fieldName,
              creatorUsername: details.creatorUsername
            } as DisplayReport)) // Cast to the display type
          );
        });

        // Wait for all detail fetches to complete
        return forkJoin(detailObservables);
      }),
      map((displayReports: DisplayReport[]) => this.groupReportsByStatus(displayReports)), // Group by status
      catchError(error => {
        console.error("Error loading or processing reports:", error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load reports.' });
        return of({}); // Return empty map on error
      }),
      finalize(() => this.isLoading.set(false)) // Ensure loading stops
    ).subscribe(groupedReports => {
      this.reportsByStatus.set(groupedReports);
      console.log("Grouped reports:", this.reportsByStatus());
    });
  }

  // Helper to group reports
  private groupReportsByStatus(reports: DisplayReport[]): ReportsByStatusMap {
    const grouped: ReportsByStatusMap = {};
    for (const status of this.reportStatuses) {
      grouped[status] = reports.filter(report => report.status === status);
    }
    return grouped;
  }

  // Helper for tag severity
  getStatusSeverity(status: ReportStatus): Severity {
    switch (status) {
      case ReportStatus.Submitted:
        return 'info';
      case ReportStatus.InProgress:
        return 'warn';
      case ReportStatus.Resolved:
        return 'success';
      default:
        return 'secondary';
    }
  }

  // --- Add methods for update status and add comment later ---
  openUpdateStatusDialog(report: DisplayReport) {
    console.log("Open update status for:", report.id);
    // Implement dialog logic here
  }

  openCommentsDialog(report: DisplayReport) {
    console.log("Open comments for:", report.id);
    // Implement dialog logic here
  }

  protected readonly reportStatusToString = reportStatusToString;
}
