import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { UserDto } from '../../../core/models/user.model';
import { CreateTaskCommentDto, TaskCommentDto } from '../../../core/models/task.model';
import { filter, firstValueFrom, Subscription } from 'rxjs';
import { FarmerTasksService } from '../../../core/services/farmer-tasks.service';
import { UserService } from '../../../core/services/user.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { DatePipe, NgClass } from '@angular/common';
import { Avatar } from 'primeng/avatar';
import { InputTextarea } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-task-comments',
  imports: [
    ProgressSpinner,
    NgClass,
    Avatar,
    DatePipe,
    InputTextarea,
    FormsModule,
    ButtonDirective
  ],
  templateUrl: './task-comments.component.html',
  styleUrl: './task-comments.component.scss'
})
export class TaskCommentsComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() taskId!: string; // Passed from the parent (task monitor board)
  @Input() onClose: (() => void) | null = null; // Optional close handler for the parent component

  @ViewChild('scrollMe') private commentsScrollContainer!: ElementRef; // For auto-scrolling

  comments: WritableSignal<TaskCommentDto[]> = signal([]);
  usersMap: WritableSignal<Map<string, UserDto>> = signal(new Map()); // To store user details for createdBy
  newCommentText: WritableSignal<string> = signal('');
  isLoading: WritableSignal<boolean> = signal(true);
  isSubmitting: WritableSignal<boolean> = signal(false);
  currentUserId: WritableSignal<string | null> = signal(null);

  private scrollToBottom = false;
  private commentAddedSubscription: Subscription | undefined;


  constructor(
    private taskService: FarmerTasksService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if (!this.taskId) {
      console.error('Task ID is required for TaskCommentsComponent');
      this.isLoading.set(false);
      return;
    }
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId.set(user?.id || null);
      },
      error: (err) => {
        console.error('Failed to fetch current user:', err);
        this.currentUserId.set(null); // Fallback if user fetch fails
      }
    });
    this.loadComments();

    this.commentAddedSubscription = this.taskService.onCommentAddedToTaskStream
      .pipe(filter(event => event.taskId === this.taskId)) // Only for this task's comments
      .subscribe(event => {
        console.log('Real-time new comment received for this task:', event.comment);
        this.addCommentToView(event.comment); // Add to local list
      });

    // (Optional) Subscribe to real-time comment updates if your service supports it
    // This assumes your FarmerTasksService has an event for new comments specific to a task
    // Or a more generic one you filter by taskId.
    // Example:
    // this.commentAddedSubscription = this.taskService.onCommentAddedToTask(this.taskId).subscribe(newComment => {
    //   this.addCommentToView(newComment);
    // });

    // For now, let's assume the TaskMonitorBoard's onTasksUpdate will trigger a reload that
    // would eventually refresh comments if the commentsCount changes.
    // A more direct SignalR for comments would be better.
  }

  ngOnDestroy(): void {
    if (this.commentAddedSubscription) {
      this.commentAddedSubscription.unsubscribe();
    }
  }

  ngAfterViewChecked() {
    if (this.scrollToBottom) {
      this.scrollToCommentsBottom();
      this.scrollToBottom = false;
    }
  }

  loadComments(): void {
    this.isLoading.set(true);
    this.taskService.getComments(this.taskId).subscribe({
      next: async (taskComments) => {
        // Fetch user details for each comment's createdBy
        const userIds = [...new Set(taskComments.map(c => c.userId))];
        const users: UserDto[] = [];
        for (const userId of userIds) {
          if (!this.usersMap().has(userId)) {
            try {
              const user = await firstValueFrom(this.userService.getUserById(userId));
              if (user) {
                users.push(user);
                this.usersMap.update(map => {
                  map.set(user.id, user);
                  return new Map(map); // Create new map instance to trigger change detection if needed
                });
              } else {
                console.warn(`User ${userId} not found`);
              }
            } catch (error: any) {
              console.error(`Failed to fetch user ${userId}`, error);
            }
          }
        }
        this.usersMap.update(map => {
          users.forEach(u => map.set(u.id, u));
          return new Map(map); // Create new map instance to trigger change detection if needed
        });
        this.comments.set(taskComments.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())); // Sort oldest first
        this.isLoading.set(false);
        this.scrollToBottom = true; // Scroll to bottom after loading
      },
      error: (err) => {
        console.error('Failed to load comments:', err);
        this.isLoading.set(false);
      }
    });
  }

  addCommentToView(comment: TaskCommentDto): void {
    this.comments.update(currentComments =>
      [...currentComments, comment].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    );
    // Fetch user if not already present
    if (!this.usersMap().has(comment.userId)) {
      this.userService.getUserById(comment.userId).subscribe(user => {
        if(user) {
          this.usersMap.update(map => {
            map.set(user.id, user);
            return new Map(map);
          });
        }
      });
    }
    this.scrollToBottom = true;
  }


  submitComment(): void {
    const commentText = this.newCommentText().trim();
    if (!commentText) return;

    this.isSubmitting.set(true);
    const dto: CreateTaskCommentDto = {
      taskId: this.taskId,
      comment: commentText
    };

    this.taskService.addComment(dto).subscribe({
      next: (commentId) => { // Assuming addComment returns the new comment's ID
        // To display immediately, we need the full TaskCommentDto
        // Option 1: Refetch all comments (simple but can be slow)
        // this.loadComments();

        // Option 2: Construct a temporary comment or fetch the new one by ID
        // For simplicity, let's assume we need to reflect it somehow.
        // The BEST way is if addComment returned the full TaskCommentDto
        // Or if SignalR pushes the new comment.
        const newComment: TaskCommentDto = {
          id: commentId, // This is what we get back
          taskId: this.taskId,
          comment: commentText,
          createdAt: new Date().toISOString(), // Client-side timestamp (server should override)
          userId: this.currentUserId() || 'unknown' // Use current user's ID
        };
        this.addCommentToView(newComment);

        this.newCommentText.set('');
        this.isSubmitting.set(false);
        this.scrollToBottom = true;

        // Optionally, notify the parent (TaskMonitorBoard) that comments count changed
        // This could be done via an @Output event if not relying solely on SignalR for task list updates.
        // Or, if your TaskService's SignalR `onTasksUpdate` triggers a full task reload, that might refresh the count.
      },
      error: (err) => {
        console.error('Failed to submit comment:', err);
        this.isSubmitting.set(false);
        alert('Failed to submit comment. Please try again later.' + (err?.message ? `: ${err.message}` : ''));
        // Show error to user (e.g., using PrimeNG MessageService)
      }
    });
  }

  getUserById(userId: string): UserDto | undefined {
    return this.usersMap().get(userId);
  }

  getInitials(userName: string | undefined | null): string {
    if (!userName) return '?';
    if (userName.length === 0) return '?';
    return userName.charAt(0).toUpperCase();
  }

  private scrollToCommentsBottom(): void {
    try {
      if (this.commentsScrollContainer?.nativeElement) {
        this.commentsScrollContainer.nativeElement.scrollTop = this.commentsScrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Could not scroll to bottom:', err);
    }
  }
}
