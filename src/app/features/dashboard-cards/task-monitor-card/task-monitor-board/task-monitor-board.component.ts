// task-monitor-board.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Avatar } from 'primeng/avatar'; // Import ScrollPanelModule

interface Task {
  id: string;
  title: string;
  assignedWorker: string; // Could be a User object later
  dueDate: Date;
  commentsCount: number;
  taskStatus: TaskStatus;
  taskPriority: TaskPriority;
  creationDate: Date;
}

enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  Completed = 'Completed',
  Blocked = 'Blocked',
  Cancelled = 'Cancelled',
}

enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

@Component({
  selector: 'app-task-monitor-board',
  standalone: true,
  imports: [ CommonModule, CardModule, TagModule, ScrollPanelModule, Avatar ], // Add ScrollPanelModule
  templateUrl: './task-monitor-board.component.html',
  styleUrls: [ './task-monitor-board.component.css' ]
})
export class TaskMonitorBoardComponent implements OnInit {

  tasks: Task[] = [];
  taskStatuses: TaskStatus[] = Object.values(TaskStatus);

  constructor() {
  }

  ngOnInit() {
    // Mock data - replace with actual data fetching
    this.tasks = [
      {
        id: '1',
        title: 'Configure farm',
        assignedWorker: 'John Doe',
        dueDate: new Date(2024, 2, 28),
        commentsCount: 2,
        taskStatus: TaskStatus.ToDo,
        taskPriority: TaskPriority.Medium,
        creationDate: new Date(2024, 2, 1)
      },
      {
        id: '2',
        title: 'Email unique at register',
        assignedWorker: 'Jane Smith',
        dueDate: new Date(2024, 3, 5),
        commentsCount: 5,
        taskStatus: TaskStatus.ToDo,
        taskPriority: TaskPriority.High,
        creationDate: new Date(2024, 2, 5)
      },
      {
        id: '3',
        title: 'Edit Selection',
        assignedWorker: 'Peter Jones',
        dueDate: new Date(2024, 3, 10),
        commentsCount: 0,
        taskStatus: TaskStatus.ToDo,
        taskPriority: TaskPriority.Low,
        creationDate: new Date(2024, 2, 10)
      },
      {
        id: '4',
        title: 'Validare email',
        assignedWorker: 'Cezar Const',
        dueDate: new Date(2024, 3, 12),
        commentsCount: 12,
        taskStatus: TaskStatus.ToDo,
        taskPriority: TaskPriority.Urgent,
        creationDate: new Date(2024, 1, 22)
      },
      {
        id: '5',
        title: 'Titlu de test',
        assignedWorker: 'Cezar Const',
        dueDate: new Date(2024, 4, 1),
        commentsCount: 1,
        taskStatus: TaskStatus.ToDo,
        taskPriority: TaskPriority.Low,
        creationDate: new Date(2024, 1, 25)
      },

      {
        id: '6',
        title: 'Baza de date cu date despre plante',
        assignedWorker: 'John Doe',
        dueDate: new Date(2024, 2, 20),
        commentsCount: 3,
        taskStatus: TaskStatus.InProgress,
        taskPriority: TaskPriority.Medium,
        creationDate: new Date(2024, 1, 15)
      },
      {
        id: '7',
        title: 'Relatii intre microservicii',
        assignedWorker: 'Jane Smith',
        dueDate: new Date(2024, 2, 25),
        commentsCount: 8,
        taskStatus: TaskStatus.InProgress,
        taskPriority: TaskPriority.High,
        creationDate: new Date(2024, 1, 16)
      },
      {
        id: '8',
        title: 'Comparat OpenWeatherMap, CLMS',
        assignedWorker: 'Peter Jones',
        dueDate: new Date(2024, 3, 2),
        commentsCount: 1,
        taskStatus: TaskStatus.InProgress,
        taskPriority: TaskPriority.Low,
        creationDate: new Date(2024, 2, 1)
      },
      {
        id: '9',
        title: 'API Remedii Culturi',
        assignedWorker: 'Cezar Const',
        dueDate: new Date(2024, 3, 5),
        commentsCount: 0,
        taskStatus: TaskStatus.InProgress,
        taskPriority: TaskPriority.Medium,
        creationDate: new Date(2024, 1, 25)
      },

      {
        id: '10',
        title: 'API Recunoasterea bolilor',
        assignedWorker: 'John Doe',
        dueDate: new Date(2024, 2, 15),
        commentsCount: 7,
        taskStatus: TaskStatus.Completed,
        taskPriority: TaskPriority.Medium,
        creationDate: new Date(2024, 0, 1)
      },
      {
        id: '11',
        title: 'Diagrame arhitecturale',
        assignedWorker: 'Jane Smith',
        dueDate: new Date(2024, 2, 18),
        commentsCount: 2,
        taskStatus: TaskStatus.Completed,
        taskPriority: TaskPriority.High,
        creationDate: new Date(2024, 1, 12)
      },
      {
        id: '12',
        title: 'Sequence Diagrams',
        assignedWorker: 'Peter Jones',
        dueDate: new Date(2024, 2, 22),
        commentsCount: 0,
        taskStatus: TaskStatus.Completed,
        taskPriority: TaskPriority.Low,
        creationDate: new Date(2024, 0, 15)
      },
      {
        id: '13',
        title: 'Drought prediction',
        assignedWorker: 'Cezar Const',
        dueDate: new Date(2024, 2, 28),
        commentsCount: 5,
        taskStatus: TaskStatus.Completed,
        taskPriority: TaskPriority.Medium,
        creationDate: new Date(2024, 1, 5)
      },
      {
        id: '14',
        title: 'Dashboard Wireframe',
        assignedWorker: 'Cezar Const',
        dueDate: new Date(2024, 3, 5),
        commentsCount: 10,
        taskStatus: TaskStatus.Completed,
        taskPriority: TaskPriority.Urgent,
        creationDate: new Date(2024, 0, 13)
      },
    ];
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
    return this.tasks.filter(task => task.taskStatus === status);
  }
}
