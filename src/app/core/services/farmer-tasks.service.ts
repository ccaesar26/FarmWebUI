import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  CreateTaskCommentDto,
  CreateTaskDto, TaskCategoryDto, TaskCommentDto,
  TaskDto,
  TaskFilterDto,
  TaskStatus,
  UpdateTaskDto
} from '../models/task.model';
import { catchError, Observable, Subject, throwError } from 'rxjs';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class FarmerTasksService {
  private apiUrl = `${environment.apiUrl}/tasks`;
  private hubConnection!: signalR.HubConnection;

  public onTasksUpdate: (() => void) | null = null;
  public onCommentAddedToTaskStream = new Subject<{taskId: string, comment: TaskCommentDto}>();

  constructor(private http: HttpClient) { }

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:5800/taskHub`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connection started.'));

    this.hubConnection.on('TaskCreated', () => {
      console.log('Task created event received.');

      if (this.onTasksUpdate) {
        this.onTasksUpdate();
      }
    });

    this.hubConnection.on('TaskUpdated', () => {
      console.log('Task updated event received.');

      if (this.onTasksUpdate) {
        this.onTasksUpdate();
      }
    });

    this.hubConnection.on('CommentAddedToTask', (taskId: string, comment: TaskCommentDto) => { // Assume server sends this
      console.log(`Comment added to task ${taskId} event received.`, comment);
      this.onCommentAddedToTaskStream.next({taskId, comment});
      // Also trigger general task update if commentsCount changes on the task object itself
      if (this.onTasksUpdate) {
        this.onTasksUpdate();
      }
    });
  }

  createTask(dto: CreateTaskDto): Observable<string> { // Returns the task ID
    return this.http.post<string>(this.apiUrl, dto).pipe(
      catchError(this.handleError)
    );
  }

  getTaskById(id: string): Observable<TaskDto> {
    return this.http.get<TaskDto>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getTasks(filter: TaskFilterDto): Observable<TaskDto[]> {
    // Build query parameters based on the filter
    let params = new HttpParams();
    if (filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter.priority) {
      params = params.set('priority', filter.priority);
    }
    if (filter.assignedUserId) {
      params = params.set('assignedUserId', filter.assignedUserId);
    }
    if (filter.categoryId) {
      params = params.set('categoryId', filter.categoryId);
    }
    if (filter.dueDateStart) {
      params = params.set('dueDateStart', filter.dueDateStart);
    }
    if (filter.dueDateEnd) {
      params = params.set('dueDateEnd', filter.dueDateEnd);
    }
    if(filter.title) {
      params = params.set('title', filter.title);
    }

    return this.http.get<TaskDto[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  updateTask(id: string, dto: UpdateTaskDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto).pipe(
      catchError(this.handleError)
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  assignTask(taskId: string, userIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${taskId}/assign`, { userIds }).pipe(
      catchError(this.handleError)
    );
  }

  unassignTask(taskId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${taskId}/unassign`, {}).pipe(
      catchError(this.handleError)
    );
  }
  updateTaskStatus(taskId: string, status: TaskStatus): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${taskId}/status`, status).pipe(
      catchError(this.handleError)
    );
  }

  getMyTasks(): Observable<TaskDto[]> {
    return this.http.get<TaskDto[]>(`${this.apiUrl}/my`).pipe(
      catchError(this.handleError)
    );
  }

  getTaskCategories(): Observable<TaskCategoryDto[]> { // Replace 'any[]' with a proper interface if you have one
    return this.http.get<any[]>(`${this.apiUrl}/categories`).pipe(
      catchError(this.handleError)
    );
  }

  addComment(dto: CreateTaskCommentDto): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/comment`, dto);
  }

  getComments(taskId: string): Observable<TaskCommentDto[]> { // Replace 'any[]' with a proper interface
    return this.http.get<TaskCommentDto[]>(`${this.apiUrl}/${taskId}/comments`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
