// task-monitor-board.component.ts
import { Component, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TaskPriority, TaskStatus } from '../../../../core/models/task.model';
import { FarmerTasksService } from '../../../../core/services/farmer-tasks.service';
import { UserProfileService } from '../../../../core/services/user-profile.service';
import { catchError, forkJoin, map, of, Subscription, switchMap } from 'rxjs';
import { FieldService } from '../../../../core/services/field.service';

interface Task {
  id: string;
  title: string;
  description: string | null | undefined;
  dueDate: string | null | undefined;
  priority: TaskPriority;
  status: TaskStatus;
  assignedUserNames: string | null | undefined;
  categoryName: string | null | undefined;
  commentsCount?: number;
  createdAt: string;
  fieldName?: string | null | undefined;
}

@Component({
  selector: 'app-task-monitor-board',
  standalone: true,
  imports: [ CommonModule, CardModule, TagModule, ScrollPanelModule ], // Add ScrollPanelModule
  templateUrl: './task-monitor-board.component.html',
  styleUrls: [ './task-monitor-board.component.css' ]
})
export class TaskMonitorBoardComponent implements OnInit {

  tasks: WritableSignal<Task[]> = signal([]);
  taskStatuses: TaskStatus[] = Object.values(TaskStatus);

  statusMap: Map<number, TaskStatus> = new Map();
  priorityMap: Map<number, TaskPriority> = new Map();

  isDarkMode: WritableSignal<boolean> = signal(false);

  constructor(
    private taskService: FarmerTasksService,
    private userProfileService: UserProfileService,
    private fieldsService: FieldService
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
  }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks({}) // Fetch all tasks (empty filter)
      .pipe(
        switchMap(tasks => {
          const taskObservables = tasks.map(task => {
            // Fetch field name
            const fieldObservable = this.fieldsService.getFieldById(task.fieldId).pipe(
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
                categoryName: task.categoryName,
                commentsCount: task.commentsCount,
                createdAt: task.createdAt,
                fieldName: fieldName
              }))
            );
          });

          return forkJoin(taskObservables);
        })
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

  // getStatusColor(taskStatus: TaskStatus): string {
  //   switch (taskStatus) {
  //     case TaskStatus.ToDo:
  //       return 'bg-sky-400 text-white'; // Use Tailwind classes for color
  //     case TaskStatus.InProgress:
  //       return 'bg-amber-400 text-white';
  //     case TaskStatus.Completed:
  //       return 'bg-green-400 text-white';
  //     case TaskStatus.OnHold:
  //       return 'bg-purple-400 text-white';
  //     default:
  //       return '';
  //   }
  // }

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
        return 'pi pi-wrench';
      case 'Pest and Disease Control':
        return 'pi pi-filter';
      case 'Planting':
        return 'pi pi-hammer';
      case 'Irrigation':
        return 'pi pi-cloud';
      case 'Harvesting':
        return 'pi pi-box';
      default:
        return 'pi pi-question';
    }
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter(task => task.status === status);
  }
}
