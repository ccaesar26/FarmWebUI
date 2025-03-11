// task-monitor-calendar.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { InputTextarea } from 'primeng/inputtextarea';
import { Ripple } from 'primeng/ripple';

interface Task {
  id: number; // Changed to number
  title: string;
  assignedWorker: string;
  dueDate: Date | null;
  commentsCount: number;
  taskStatus: TaskStatus; // Use the enum
  taskPriority: TaskPriority; // Use the enum
  creationDate: Date;
  description?: string;
}

// Use enums for status and priority
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
  selector: 'app-task-monitor-calendar',
  standalone: true,
  imports: [ CommonModule, FullCalendarModule, DialogModule, ButtonModule, FormsModule, InputTextModule, CalendarModule, TagModule, InputTextarea, Ripple ],
  templateUrl: './task-monitor-calendar.component.html',
  styleUrls: ['./task-monitor-calendar.component.css']
})
export class TaskMonitorCalendarComponent implements OnInit {

  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    eventClick: this.handleEventClick.bind(this),
    dateClick: this.handleDateClick.bind(this),
    weekends: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    events: [],
    height: 'auto'
  };

  tasks: Task[] = [];
  displayDialog: boolean = false;
  selectedTask: Task | null = null;

  constructor() { }

  ngOnInit() {
    // Mock data
    this.tasks = [
      { id: 1, title: 'Configure farm', assignedWorker: 'John Doe', dueDate: new Date(2024, 2, 28), commentsCount: 2, taskStatus: TaskStatus.ToDo, taskPriority: TaskPriority.Medium, creationDate: new Date(2024, 2, 1), description: 'Set up the basic farm configuration.' },
      { id: 2, title: 'Email unique at register', assignedWorker: 'Jane Smith', dueDate: new Date(2024, 3, 5), commentsCount: 5, taskStatus: TaskStatus.ToDo, taskPriority: TaskPriority.High, creationDate: new Date(2024, 2, 5), description: 'Implement unique email validation on registration.' },
      { id: 3, title: 'Edit Selection', assignedWorker: 'Peter Jones', dueDate: new Date(2024, 3, 10), commentsCount: 0, taskStatus: TaskStatus.ToDo, taskPriority: TaskPriority.Low, creationDate: new Date(2024, 2, 10) },
      { id: 4, title: 'Validare email', assignedWorker: 'Cezar Const', dueDate: new Date(2024, 3, 12), commentsCount: 12, taskStatus: TaskStatus.InProgress, taskPriority: TaskPriority.Urgent, creationDate: new Date(2024, 1, 22) },
      { id: 5, title: 'Titlu de test', assignedWorker: 'Cezar Const', dueDate: new Date(2024, 4, 1), commentsCount: 1, taskStatus: TaskStatus.Completed, taskPriority: TaskPriority.Low, creationDate: new Date(2024, 1, 25) },
      { id: 6, title: 'Baza de date cu date despre plante', assignedWorker: 'John Doe', dueDate: new Date(2024, 2, 20), commentsCount: 3, taskStatus: TaskStatus.InProgress, taskPriority: TaskPriority.Medium, creationDate: new Date(2024, 1, 15) },
      { id: 7, title: 'Relatii intre microservicii', assignedWorker: 'Jane Smith', dueDate: new Date(2024, 2, 25), commentsCount: 8, taskStatus: TaskStatus.InProgress, taskPriority: TaskPriority.High, creationDate: new Date(2024, 1, 16) },
    ];
    this.calendarOptions.events = this.tasksToEvents(this.tasks);

  }


  tasksToEvents(tasks: Task[]): EventInput[] {
    return tasks.map(task => ({
      id: task.id.toString(), // Convert id to string
      title: task.title,
      start: task.dueDate || new Date(),
      allDay: true,
      extendedProps: {
        task: task
      }
    }));
  }

  handleDateClick(arg: any) {
    //  console.log('Date click!', arg);
    // alert('date click! ' + arg.dateStr)
  }

  handleEventClick(clickInfo: EventClickArg) {
    const event = clickInfo.event;
    const task: Task = event.extendedProps['task'];
    this.selectedTask = { ...task }; // Create a *copy* for editing
    this.displayDialog = true;
  }


  closeDialog() {
    this.displayDialog = false;
    this.selectedTask = null;
  }

  updateTask() {
    if (!this.selectedTask) return;

    const taskIndex = this.tasks.findIndex(t => t.id === this.selectedTask!.id);
    if (taskIndex > -1) {
      this.tasks[taskIndex] = { ...this.selectedTask };

      const calendarApi = this.calendarComponent?.getApi();
      const event = calendarApi?.getEventById(this.selectedTask.id.toString()); // Convert id to string

      if (event) {
        event.setProp('title', this.selectedTask.title);
        if (this.selectedTask.dueDate) {
          event.setStart(this.selectedTask.dueDate);
        }
        event.setExtendedProp('task', this.selectedTask);
      }
    }
    this.closeDialog();
  }

  parseDate(dateString: string): Date | null {
    if (dateString) {
      return new Date(dateString);
    }
    return null;
  }


  getPrioritySeverity(priority: TaskPriority): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (priority) {
      case TaskPriority.Low:
        return 'success';
      case TaskPriority.Medium:
        return 'info';
      case TaskPriority.High:
        return 'warn';
      case TaskPriority.Urgent:
        return 'danger';
      default:
        return 'secondary';
    }
  }


  getStatusSeverity(status: TaskStatus): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (status) {
      case TaskStatus.ToDo:
        return 'secondary';
      case TaskStatus.InProgress:
        return 'info';
      case TaskStatus.Completed:
        return 'success';
      case TaskStatus.Blocked:
        return 'danger';
      case TaskStatus.OnHold:
        return 'warn';
      default:
        return 'secondary';
    }
  }
}
