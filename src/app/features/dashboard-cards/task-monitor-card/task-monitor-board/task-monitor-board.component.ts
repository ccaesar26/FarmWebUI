// task-monitor-board.component.ts
import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import {
  CreateTaskDto,
  priorityToNumber,
  statusToNumber,
  Task, TaskCategoryDto,
  TaskPriority,
  TaskStatus
} from '../../../../core/models/task.model';
import { FarmerTasksService } from '../../../../core/services/farmer-tasks.service';
import { UserProfileService } from '../../../../core/services/user-profile.service';
import { catchError, finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { FieldService } from '../../../../core/services/field.service';
import { ButtonDirective } from 'primeng/button';
import { Router } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Dialog } from 'primeng/dialog';
import { TaskFormComponent } from '../../../tasks/task-form/task-form.component';
import { UserProfileDto } from '../../../../core/models/user-profile.model';
import { Field } from '../../../../core/models/field.model';
import { UserService } from '../../../../core/services/user.service';
import { TaskCommentsComponent } from '../../../tasks/task-comments/task-comments.component';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-task-monitor-board',
  standalone: true,
  imports: [ CommonModule, CardModule, TagModule, ScrollPanelModule, ButtonDirective, ProgressSpinner, Dialog, TaskFormComponent, TaskCommentsComponent, Tooltip ], // Add ScrollPanelModule
  templateUrl: './task-monitor-board.component.html',
  styleUrls: [ './task-monitor-board.component.scss' ]
})
export class TaskMonitorBoardComponent implements OnInit {

  tasks: WritableSignal<Task[]> = signal([]);
  taskStatuses: TaskStatus[] = Object.values(TaskStatus);

  statusMap: Map<number, TaskStatus> = new Map();
  priorityMap: Map<number, TaskPriority> = new Map();

  isDarkMode: WritableSignal<boolean> = signal(false);
  loading: WritableSignal<boolean> = signal(true);

  displayModal: WritableSignal<boolean> = signal(false);
  selectedTask = signal<Task | null>(null);

  categories: WritableSignal<TaskCategoryDto[]> = signal([]);
  workers: WritableSignal<UserProfileDto[]> = signal([]);
  fields: WritableSignal<Field[]> = signal([]);

  displayCommentsModal: WritableSignal<boolean> = signal(false);
  selectedTaskForComments = signal<Task | null>(null);

  constructor(
    private taskService: FarmerTasksService,
    private userService: UserService,
    private userProfileService: UserProfileService,
    private fieldService: FieldService,
    protected router: Router
  ) {
    this.statusMap.set(0, TaskStatus.ToDo);
    this.statusMap.set(1, TaskStatus.InProgress);
    this.statusMap.set(2, TaskStatus.Completed);
    this.statusMap.set(3, TaskStatus.OnHold);

    this.priorityMap.set(0, TaskPriority.Low);
    this.priorityMap.set(1, TaskPriority.Medium);
    this.priorityMap.set(2, TaskPriority.High);
    this.priorityMap.set(3, TaskPriority.Urgent);

    this.isDarkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);

    this.taskService.onTasksUpdate = () => {
      console.log('Task update received.');
      this.loadTasks();
    }

    this.taskService.startConnection();
  }

  ngOnInit() {
    this.taskService.getTaskCategories().subscribe(categories => {
      this.categories.set(categories);
    });

    this.userService.getWorkerUsers()
      .subscribe(users => {
          users.map(user =>
            this.userProfileService.getProfileByUserId(user.id)
              .subscribe(userProfile => this.workers.set([ ...this.workers(), userProfile ]))
          );
        }
      );

    this.fieldService.getFields().subscribe(
      fields => this.fields.set(fields)
    );

    this.loadTasks();
  }

  loadTasks() {
    this.loading.set(true);
    this.taskService.getTasks({}) // Fetch all tasks (empty filter)
      .pipe(
        switchMap(tasks => {
          const taskObservables = tasks.map(task => {
            // Fetch field name
            const fieldObservable = this.fieldService.getFieldById(task.fieldId).pipe(
              map(field => field.name),
              catchError(error => {
                console.error(`Error fetching field name for field ${task.fieldId}:`, error);
                return of(null);
              })
            );

            if (task.assignedUserIds.length === 0) {
              // No assigned users, only fetch field name
              return fieldObservable.pipe(
                map(fieldName => ({
                  id: task.id,
                  title: task.title,
                  description: task.description,
                  dueDate: task.dueDate,
                  assignedUserNames: "Unassigned",
                  status: this.statusMap.get(task.status) ?? TaskStatus.ToDo,
                  priority: this.priorityMap.get(task.priority) ?? TaskPriority.Low,
                  recurrence: task.recurrence,
                  recurrenceEndDate: task.recurrenceEndDate,
                  categoryName: task.categoryName,
                  commentsCount: task.commentsCount,
                  createdAt: task.createdAt,
                  fieldName: fieldName
                }))
              );
            }

            // Fetch all user profiles for the assigned users
            const profileObservables = task.assignedUserIds.map(userId =>
              this.userProfileService.getProfileByUserId(userId).pipe(
                map(profile => profile.name),
                catchError(error => {
                  console.error(`Error fetching profile for user ${userId}:`, error);
                  return of("Unknown");
                })
              )
            );

            return forkJoin({ fieldName: fieldObservable, userNames: forkJoin(profileObservables) }).pipe(
              map(({ fieldName, userNames }) => ({
                id: task.id,
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                assignedUserNames: userNames.join(", "), // Join names into a string
                status: this.statusMap.get(task.status) ?? TaskStatus.ToDo,
                priority: this.priorityMap.get(task.priority) ?? TaskPriority.Low,
                recurrence: task.recurrence,
                recurrenceEndDate: task.recurrenceEndDate,
                categoryName: task.categoryName,
                commentsCount: task.commentsCount,
                createdAt: task.createdAt,
                fieldName: fieldName
              }))
            );
          });

          return forkJoin(taskObservables);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (tasks) => {
          this.tasks.set(tasks); // Assuming this.tasks.set() accepts an array
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
        }
      });
  }


  getPriorityIcon(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.Low:
        return 'pi pi-circle-fill text-green-500'; // Use Tailwind classes for color
      case TaskPriority.Medium:
        return 'pi pi-circle-fill text-yellow-500';
      case TaskPriority.High:
        return 'pi pi-circle-fill text-orange-500';
      case TaskPriority.Urgent:
        return 'pi pi-circle-fill text-red-500';
      default:
        return 'pi pi-circle-fill';
    }
  }

  getStatusColor(taskStatus: TaskStatus): string {
    const isDark = this.isDarkMode();
    switch (taskStatus) {
      case TaskStatus.ToDo:
        return isDark ? 'bg-sky-800' : 'bg-sky-200';
      case TaskStatus.InProgress:
        return isDark ? 'bg-amber-800' : 'bg-amber-200';
      case TaskStatus.Completed:
        return isDark ? 'bg-green-800' : 'bg-green-200';
      case TaskStatus.OnHold:
        return isDark ? 'bg-purple-800' : 'bg-purple-200';
      default:
        return '';
    }
  }

  getCategoryIcon(categoryName: string): string {
    switch (categoryName) {
      case 'Maintenance':
        return 'handyman';
      case 'Pest and Disease Control':
        return 'pest_control';
      case 'Planting':
        return 'psychiatry';
      case 'Irrigation':
        return 'sprinkler';
      case 'Fertilization':
        return 'experiment';
      case 'Harvesting':
        return 'agriculture';
      default:
        return 'category';
    }
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter(task => task.status === status);
  }

  openNew() {
    this.selectedTask.set(null); // Set to null for add mode
    this.displayModal.set(true);
  }

  onSave(updatedTask: Task) {
    if (this.selectedTask()) {
      // Edit mode
      this.updateTaskInFarm(updatedTask);
    } else {
      // Add mode
      this.addTaskToFarm(updatedTask);
    }
  }

  onCancel() {
    this.displayModal.set(false);
  }

  addTaskToFarm(task: Task) {
    const createTaskDto: CreateTaskDto = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      priority: priorityToNumber(task.priority),
      categoryId: this.categories().find(c => c.name === task.categoryName)?.id ?? '',
      recurrence: task.recurrence,
      recurrenceEndDate: task.recurrenceEndDate ? new Date(task.recurrenceEndDate).toISOString() : null,
      fieldId: this.fields().find(f => f.name === task.fieldName)?.id ?? '',
      status: statusToNumber(TaskStatus.ToDo)
    }

    const assignees = task.assignedUserNames;
    const userProfileIds = this.workers().filter(w => assignees?.includes(w.name)).map(w => w.id);

    this.userService.getWorkerUsers().subscribe({
      next: (users) => {
        const assignUsersToTaskDto = users.filter(u => userProfileIds.includes(u.userProfileId)).map(u => u.id);

        this.taskService.createTask(createTaskDto)
          .subscribe({
            next: (taskId) => {
              this.taskService.assignTask(taskId, assignUsersToTaskDto)
                .subscribe({
                  next: () => {
                    this.displayModal.set(false);
                    // this.loadTasks(); // Should be automatically updated with SignalR
                  },
                  error: () => {
                    alert('Failed to assign users to task');
                  }
                });
            },
            error: () => {
              alert('Failed to create task');
            }
          });
      },
      error: () => {
        alert('Failed to get worker users');
      }
    });
  }

  updateTaskInFarm(task: Task) {
  }

  openComments(task: Task): void {
    this.selectedTaskForComments.set(task);
    this.displayCommentsModal.set(true);
  }

  onCloseCommentsModal(): void {
    this.displayCommentsModal.set(false);
    this.selectedTaskForComments.set(null);
    // IMPORTANT: After closing comments, the commentsCount on the task card might be stale.
    // If SignalR for tasks doesn't automatically update the specific task item,
    // you might need to refetch the specific task or the whole list.
    // For now, we assume the task list refresh via SignalR (onTasksUpdate) will handle it.
    // Or, the TaskCommentsComponent could emit an event on new comment.
    this.loadTasks(); // Force reload tasks to update comment counts
  }
}
