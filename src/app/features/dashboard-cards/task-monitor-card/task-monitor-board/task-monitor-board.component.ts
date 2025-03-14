// task-monitor-board.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TaskDto, TaskPriority, TaskStatus } from '../../../../core/models/task.model';
import { FarmerTasksService } from '../../../../core/services/farmer-tasks.service';
import { UserProfileService } from '../../../../core/services/user-profile.service';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

interface Task {
  id: string;
  title: string;
  description: string | null | undefined;
  assignedUserName: string | null | undefined;
  status: TaskStatus;
  priority: TaskPriority;
}

@Component({
  selector: 'app-task-monitor-board',
  standalone: true,
  imports: [ CommonModule, CardModule, TagModule, ScrollPanelModule ], // Add ScrollPanelModule
  templateUrl: './task-monitor-board.component.html',
  styleUrls: [ './task-monitor-board.component.css' ]
})
export class TaskMonitorBoardComponent implements OnInit {

  tasks = signal<Task[]>([]);
  taskStatuses: TaskStatus[] = Object.values(TaskStatus);

  statusMap: Map<number, TaskStatus> = new Map();
  priorityMap: Map<number, TaskPriority> = new Map();

  constructor(
    private taskService: FarmerTasksService,
    private userProfileService: UserProfileService
  ) {
    this.statusMap.set(0, TaskStatus.ToDo);
    this.statusMap.set(1, TaskStatus.InProgress);
    this.statusMap.set(2, TaskStatus.Completed);
    this.statusMap.set(3, TaskStatus.Blocked);
    this.statusMap.set(4, TaskStatus.Cancelled);
    this.statusMap.set(5, TaskStatus.OnHold);

    this.priorityMap.set(0, TaskPriority.Low);
    this.priorityMap.set(1, TaskPriority.Medium);
    this.priorityMap.set(2, TaskPriority.High);
    this.priorityMap.set(3, TaskPriority.Urgent);
  }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks({}) // Fetch all tasks (empty filter)
      .pipe(
        switchMap(tasks => {
          // Map tasks to observables that include user profile data
          const taskObservables = tasks.map(task => {
            return this.userProfileService.getProfileByUserId(task.assignedUserId).pipe( // Assuming task has assignedUserId
              map(profile => ({
                id: task.id,
                title: task.title,
                description: task.description,
                assignedUserName: profile.name,
                status: this.statusMap.get(task.status as unknown as number) ?? TaskStatus.ToDo,
                priority: this.priorityMap.get(task.priority as unknown as number) ?? TaskPriority.Low
              })),
              catchError(error => {
                console.error(`Error fetching profile for task ${task.id}:`, error);
                // Return the task without assignedUserName if there's an error
                return of({
                  id: task.id,
                  title: task.title,
                  description: task.description,
                  assignedUserName: "", // or "Unknown"
                  status: this.statusMap.get(task.status as unknown as number) ?? TaskStatus.ToDo,
                  priority: this.priorityMap.get(task.priority as unknown as number) ?? TaskPriority.Low
                });
              })
            );
          });

          // Wait for all tasks to have their user profiles fetched
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

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter(task => task.status === status);
  }
}
