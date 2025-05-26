import { Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NotificationDto } from '../models/notification.model';
import * as signalR from '@microsoft/signalr';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  // --- Notification Service ---
  private apiUrl = `${environment.baseUrl}/api/notification`;

  constructor(private http: HttpClient) {
  }

  getAllNotifications(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(`${this.apiUrl}/all`);
  }

  markAsRead(notificationId: string): Observable<void> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post<void>(`${this.apiUrl}/markAsRead`, JSON.stringify(notificationId), { headers });
  }

  // --- SignalR Hub Connection ---
  private hubUrl = `${environment.baseUrl}/hubs/notifications`;
  private hubConnection!: signalR.HubConnection;
  private connectionPromise: Promise<void> | null = null;

  public onNotificationReceived: ((notification: NotificationDto) => void)  = () => {};
  public connectionStatus: WritableSignal<'disconnected' | 'connecting' | 'connected' | 'error'> = signal('disconnected');

  public startConnection = (accessToken?: string): Promise<void> => {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionStatus.set('connecting');

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        withCredentials: true,
      })
      // .withAutomaticReconnect([0, 2000, 10000, 30000]) // Default automatic reconnect intervals
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connectionPromise = this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR Connection started successfully.');
        this.connectionStatus.set('connected');
        this.registerServerEvents();
      })
      .catch(err => {
        console.error('Error while starting SignalR connection: ', err);
        this.connectionStatus.set('error');
        this.connectionPromise = null;
        return Promise.reject(err);
      });

    this.hubConnection.onreconnecting(error => {
      console.warn(`SignalR connection is reconnecting due to: ${error}`);
      this.connectionStatus.set('connecting');
    });

    this.hubConnection.onreconnected(connectionId => {
      console.log(`SignalR connection reconnected with ID: ${connectionId}`);
      this.connectionStatus.set('connected');
    });

    this.hubConnection.onclose(error => {
      console.warn(`SignalR connection closed: ${error}`);
      this.connectionStatus.set('disconnected');
      this.connectionPromise = null;
    });

    return this.connectionPromise;
  }

  private registerServerEvents(): void {
    this.hubConnection.on('NewReportNotification', (data: NotificationDto) => {
      console.log('Received NewReportNotification:', data);
      this.onNotificationReceived(data);
    });
    this.hubConnection.on('NewReportCommentNotification', (data: NotificationDto) => {
      console.log('Received NewReportCommentNotification:', data);
      this.onNotificationReceived(data);
    });
  }

  public stopConnection = async (): Promise<void> => {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.connectionPromise = null;
      try {
        await this.hubConnection.stop();
        console.log('SignalR Connection stopped.');
        this.connectionStatus.set('disconnected');
      } catch (err) {
        console.error('Error while stopping SignalR connection: ', err);
        this.connectionStatus.set('error'); // Or 'disconnected'
        return await Promise.reject(err);
      }
    }
    return Promise.resolve();
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }
}
