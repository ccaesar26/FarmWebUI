// reports-management.component.ts
import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService, SelectItem } from 'primeng/api';
import { forkJoin, Observable, of, tap } from 'rxjs';
import { catchError, map, switchMap, finalize } from 'rxjs/operators';
import {
  AddCommentDto,
  CommentDto,
  DisplayReport, // Use this interface which has status as enum
  // ReportsByStatusMap, // Remove this type
  ReportStatus,
  reportStatusToString, UpdateReportStatusDto // Keep this helper
} from '../../../core/models/reports.model';
import { ReportsService } from '../../../core/services/reports.service';
import { FieldService } from '../../../core/services/field.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { Dialog } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { Ripple } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';
import { Skeleton } from 'primeng/skeleton';
import { Textarea } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip'; // Keep User model for fetchWorkers if needed elsewhere

// Define the new grouping structure
type GroupedReports = {
  Current: DisplayReport[];
  Closed: DisplayReport[];
};

type Severity = 'success' | 'info' | 'danger' | 'secondary' | 'contrast' | 'warn';

@Component({
  selector: 'app-reports-management',
  standalone: true,
  imports: [
    CommonModule, AccordionModule, CardModule, TagModule, ButtonModule,
    ProgressSpinnerModule, ToastModule, Dialog, DropdownModule, Ripple, FormsModule, Skeleton, Textarea, Tooltip
  ],
  providers: [ MessageService ],
  templateUrl: './reports-management.component.html',
  styleUrls: [ './reports-management.component.scss' ]
})
export class ReportsManagementComponent implements OnInit {

  // Signal to hold the grouped reports
  reportsByGroup = signal<GroupedReports>({ Current: [], Closed: [] });
  // Array of group names for the template *ngFor
  reportGroups: ('Current' | 'Closed')[] = [ 'Current', 'Closed' ];

  isLoading = signal(true);

  // Keep user/worker signal if needed for displaying names later
  workers: WritableSignal<User[]> = signal([]);

  // --- Properties for Update Status Dialog ---
  displayUpdateStatusDialog: boolean = false;
  reportToUpdate: DisplayReport | null = null;
  selectedStatus: ReportStatus | null = null; // Holds the value from the dropdown
  statusOptions: SelectItem[] = []; // Options for the dropdown
  isUpdatingStatus = signal(false); // Loading state for the save button
  // --- End Dialog Properties ---

  // --- Properties for Comments Dialog ---
  displayCommentsDialog: boolean = false;
  reportForComments: DisplayReport | null = null; // Report context for comments
  comments = signal<CommentDto[]>([]); // Signal to hold comments
  isLoadingComments = signal(false);
  newCommentText: string = ''; // ngModel for the new comment input
  isAddingComment = signal(false);
  // --- End Comments Dialog Properties ---

  constructor(
    private reportsService: ReportsService,
    private fieldService: FieldService,
    private userService: UserService,
    private messageService: MessageService
  ) {
  }

  ngOnInit(): void {
    // Fetch workers first if their data is needed immediately for reports
    this.fetchWorkers().subscribe(() => {
      // Now load reports after workers are potentially available
      this.loadReportsAndDetails();
    });

    this.populateStatusOptions(); // Populate dropdown options
  }

  // Populate status options for the dropdown
  populateStatusOptions(): void {
    this.statusOptions = Object.values(ReportStatus)
      .filter(status => typeof status === 'number') // Filter out non-numeric values
      .filter(status => status !== ReportStatus.Closed)
      .map(status => ({
        label: reportStatusToString(status as ReportStatus), // Use your helper function
        value: status // The actual enum value
      }));
  }

  // Fetch workers (keep this if needed, adjust return type if you don't need the result directly)
  fetchWorkers(): Observable<User[]> {
    return this.userService.getWorkerUsers().pipe(
      tap(workers => {
        this.workers.set(workers);
        console.log("Fetched workers:", this.workers());
      }),
      catchError(err => {
        console.error("Failed to fetch workers", err);
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Could not fetch worker list for names.'
        });
        return of([]); // Return empty on error but continue
      })
    );
  }


  loadReportsAndDetails(): void {
    this.isLoading.set(true);
    // Service returns DisplayReport[] with status as enum
    this.reportsService.getReports().pipe(
      switchMap((displayReports: DisplayReport[]) => {
        if (!displayReports || displayReports.length === 0) {
          return of([]);
        }
        // Fetch additional details (Field Name, Username)
        const detailObservables = displayReports.map(report => {
          const fieldName$ = (report.fieldId && report.fieldId !== '')
            ? this.fieldService.getFieldById(report.fieldId).pipe(
              map(field => field.name), // Get name or 'N/A'
              catchError(() => of('')) // Handle error for specific field
            )
            : of(null);

          // Use already fetched workers signal for efficiency
          const creatorUsername = this.workers().find(w => w.id === report.createdByUserId)?.username || 'Unknown';
          const creatorUsername$ = of(creatorUsername); // Wrap in observable

          return forkJoin({ fieldName: fieldName$, creatorUsername: creatorUsername$ }).pipe(
            map(details => ({
              ...report, // Spread the DisplayReport (status is already enum)
              fieldName: details.fieldName,
              creatorUsername: details.creatorUsername
            } as DisplayReport)) // Ensure type
          );
        });
        return forkJoin(detailObservables);
      }),
      map((finalReports: DisplayReport[]) => this.groupReports(finalReports)), // Use the new grouping function
      catchError(error => {
        console.error("Error loading or processing reports:", error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load reports.' });
        return of({ Current: [], Closed: [] }); // Return empty groups on error
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(groupedReports => {
      this.reportsByGroup.set(groupedReports); // Set the new signal
      console.log("Grouped reports:", this.reportsByGroup());
    });
  }

  // New function to group into "Current" and "Closed"
  private groupReports(reports: DisplayReport[]): GroupedReports {
    const grouped: GroupedReports = { Current: [], Closed: [] };
    const currentStatuses = [
      ReportStatus.Submitted,
      ReportStatus.Seen,
      ReportStatus.InProgress,
      ReportStatus.Resolved
    ];

    reports.forEach(report => {
      if (report.status === ReportStatus.Closed) {
        grouped.Closed.push(report);
      } else if (currentStatuses.includes(report.status)) {
        grouped.Current.push(report);
      }
      // else: Handle any unexpected statuses if necessary
    });
    return grouped;
  }

  // getStatusSeverity remains the same, operating on individual report status
  getStatusSeverity(status: ReportStatus): Severity {
    switch (status) {
      case ReportStatus.Submitted:
        return 'secondary';
      case ReportStatus.Seen:
        return 'info';
      case ReportStatus.InProgress:
        return 'warn';
      case ReportStatus.Resolved:
        return 'success';
      case ReportStatus.Closed:
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  // --- Image Download Method ---
  downloadImage(imageDataBase64: string | null | undefined, mimeType: string | null | undefined, fileNamePrefix: string) {
    if (!imageDataBase64) {
      this.messageService.add({ severity: 'warn', summary: 'No Image', detail: 'There is no image data to download.' });
      return;
    }

    const resolvedMimeType = mimeType || 'image/png'; // Default to png if mimeType is unknown
    const byteCharacters = atob(imageDataBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: resolvedMimeType });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    // Determine file extension
    let extension = '.png'; // Default
    if (resolvedMimeType === 'image/jpeg') {
      extension = '.jpg';
    } else if (resolvedMimeType === 'image/gif') {
      extension = '.gif';
    } // Add more mime types as needed

    link.download = `${fileNamePrefix.replace(/\s+/g, '_')}${extension}`; // Sanitize filename and add extension
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // Clean up
  }
  // --- End Image Download Method ---

  // Keep reportStatusToString helper from the model file if you still need it
  protected readonly reportStatusToString = reportStatusToString;

  // --- Update Status Dialog Methods ---
  openUpdateStatusDialog(report: DisplayReport) {
    console.log("Open update status for:", report.id, "Current status:", report.status);
    this.reportToUpdate = { ...report }; // Store a copy of the report
    this.selectedStatus = report.status; // Pre-select current status in dropdown
    this.displayUpdateStatusDialog = true;
  }

  hideUpdateStatusDialog() {
    this.displayUpdateStatusDialog = false;
    this.reportToUpdate = null;
    this.selectedStatus = null;
    this.isUpdatingStatus.set(false); // Reset loading state
  }

  saveReportStatus() {
    if (!this.reportToUpdate || this.selectedStatus === null) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a status.' });
      return;
    }

    if (this.selectedStatus === this.reportToUpdate.status) {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Status has not changed.' });
      this.hideUpdateStatusDialog(); // Close if status didn't change
      return;
    }

    this.isUpdatingStatus.set(true);

    // Call the service - it expects the *enum* value
    const updateData = { status: this.selectedStatus } as UpdateReportStatusDto;
    this.reportsService.updateReportStatus(this.reportToUpdate.id, updateData).pipe(
      finalize(() => this.isUpdatingStatus.set(false)) // Ensure loading stops
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Report status updated.' });
        this.hideUpdateStatusDialog();
        this.loadReportsAndDetails();
      },
      error: (err) => {
        console.error("Failed to update report status", err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status.' });
        // Optionally revert UI change if needed
      }
    });
  }
  // --- End Dialog Methods ---

  // --- Comments Dialog Methods ---
  openCommentsDialog(report: DisplayReport) {
    this.reportForComments = report;
    this.comments.set([]); // Clear previous comments
    this.newCommentText = ''; // Clear new comment input
    this.isLoadingComments.set(true); // Show loading state
    this.displayCommentsDialog = true;

    this.reportsService.getComments(report.id).pipe(
      finalize(() => this.isLoadingComments.set(false)) // Stop loading
    ).subscribe({
      next: (fetchedComments) => {
        // Sort comments by CreatedAt descending before setting
        const sortedComments = fetchedComments.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.comments.set(sortedComments);
      },
      error: (err) => {
        console.error("Failed to load comments", err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load comments.' });
      }
    });
  }

  hideCommentsDialog() {
    this.displayCommentsDialog = false;
    this.reportForComments = null;
    this.comments.set([]);
    this.newCommentText = '';
  }

  addComment() {
    if (!this.reportForComments || !this.newCommentText?.trim()) {
      return; // Don't add empty comments
    }

    this.isAddingComment.set(true);
    const dto: AddCommentDto = {
      commentText: this.newCommentText.trim()
      // parentCommentId can be added here if implementing replies
    };

    this.reportsService.addComment(this.reportForComments.id, dto).pipe(
      switchMap((newCommentId) => {
        // After adding, immediately fetch the updated comments list
        // Or, if the backend returns the full new comment object, use that
        return this.reportsService.getComments(this.reportForComments!.id);
      }),
      finalize(() => this.isAddingComment.set(false)) // Stop loading
    ).subscribe({
      next: (updatedComments) => {
        // Sort comments by CreatedAt descending before setting
        const sortedComments = updatedComments.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.comments.set(sortedComments);
        this.newCommentText = ''; // Clear input
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Comment added.' });

        // Optionally update the comment count on the report card in the main view
        this.reportsByGroup.update(groups => {
          const reportInCurrent = groups.Current.find(r => r.id === this.reportForComments!.id);
          if (reportInCurrent) reportInCurrent.commentCount = updatedComments.length;
          const reportInClosed = groups.Closed.find(r => r.id === this.reportForComments!.id);
          if (reportInClosed) reportInClosed.commentCount = updatedComments.length;
          return groups; // Return the updated groups
        });

      },
      error: (err) => {
        console.error("Failed to add comment", err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not add comment.' });
      }
    });
  }
  // --- End Comments Dialog Methods ---

  markAsClosedDialog(report: DisplayReport) {
    const updatedReport = { ...report, status: ReportStatus.Closed };
    this.reportsService.updateReportStatus(report.id, updatedReport).pipe(
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Report marked as closed.' });
        this.loadReportsAndDetails(); // Refresh the reports
      }),
      catchError(err => {
        console.error("Failed to mark report as closed", err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to mark report as closed.' });
        return of(null); // Handle error
      })
    ).subscribe(() => {
        // Optionally handle success here
      }
    );
  }

  // Helper to get username from cached workers list
  getCommentUsername(userId: string): string {
    return this.workers().find(w => w.id === userId)?.username || 'Unknown User';
  }
}
