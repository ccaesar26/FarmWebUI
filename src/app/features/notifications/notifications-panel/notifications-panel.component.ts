import {
  Component,
  effect,
  EventEmitter,
  OnInit,
  Output, signal,
  Signal, WritableSignal,
} from '@angular/core';
import { NotificationEntry, NotificationDto, ToNotificationEntry } from '../../../core/models/notification.model';
import { NotificationService } from '../../../core/services/notification.service';
import { DatePipe } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Accordion, AccordionTab } from 'primeng/accordion';
import { Badge } from 'primeng/badge';
import { ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { Tooltip } from 'primeng/tooltip';
import { Avatar } from 'primeng/avatar';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-notifications-panel',
  imports: [
    Accordion,
    AccordionTab,
    PrimeTemplate,
    Badge,
    ButtonDirective,
    Ripple,
    Tooltip,
    Avatar,
    DatePipe,
    Card
  ],
  templateUrl: './notifications-panel.component.html',
  styleUrl: './notifications-panel.component.scss'
})
export class NotificationsPanelComponent implements OnInit {
  // Output an event when the count changes
  @Output() countChanged: EventEmitter<number> = new EventEmitter();

  connectionStatus: Signal<'disconnected' | 'connecting' | 'connected' | 'error'>;
  unreadNotifications: WritableSignal<NotificationEntry[]> = signal([]);
  readNotifications: WritableSignal<NotificationEntry[]> = signal([]);

  users: WritableSignal<User[]> = signal([]);

  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private messageService: MessageService,
  ) {
    this.notificationService.onNotificationReceived = (notification: NotificationDto) => {
      const userName = this.users().find(user => user.id === notification.triggeringUserId)?.username || null;
      const entry = ToNotificationEntry(notification, userName || 'Unknown User');
      // Will show a toast
      this.messageService.add({
        severity: 'info',
        summary: entry.title,
        detail: entry.message,
        life: 5000,
      });
      // Reload the notifications
      if (!entry.isRead) {
        this.unreadNotifications.update(notifs => [...notifs, entry]);
      } else {
        this.readNotifications.update(notifs => [...notifs, entry]);
      }
    }

    this.connectionStatus = this.notificationService.connectionStatus;

    // Effect to emit countChanged when the service's count signal changes
    effect(() => {
      this.countChanged.emit(this.unreadNotifications().length);
    });
  }

  ngOnInit(): void {
    // Load users
    this.userService.getWorkerUsers().subscribe({
      next: (users) => {
        this.users.set(users);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });

    // Load notifications
    this.loadNotifications();

    // Start the SignalR connection
    this.notificationService.startConnection()
      .then(() => {
        console.log('SignalR connection established from NotificationsPanelComponent.');
      })
      .catch(err => {
        console.error('Failed to establish SignalR connection from NotificationsPanelComponent:', err);
      });
  }

  loadNotifications() {
    this.notificationService.getAllNotifications().subscribe({
      next: (notifications) => {
        const entries = notifications.map(dto => {
          const userName = this.users().find(user => user.id === dto.triggeringUserId)?.username || 'Unknown User';
          return ToNotificationEntry(dto, userName);
        });
        this.unreadNotifications.set(entries
          .filter(entry => !entry.isRead)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        );
        this.readNotifications.set(entries
          .filter(entry => entry.isRead)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        );
        // Emit the count of notifications
        this.countChanged.emit(this.unreadNotifications().length);
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
      }
    });
  }

  markAllAsRead() {
    // Mark one by one
    this.unreadNotifications().forEach(notification => {
      this.markAsRead(notification);
    });
  }

  markAsRead(notification: NotificationEntry) {
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        // Remove from unread and add to read
        this.unreadNotifications.update(notifs => notifs.filter(n => n.id !== notification.id));
        this.readNotifications.update(notifs => [...notifs, notification]);
      },
      error: (err) => {
        console.error('Failed to mark notification as read:', err);
      }
    });
  }

  getInitials(userName: string) {
    if (userName.length === 0) {
      return '';
    }
    if (userName.length === 1) {
      return userName.charAt(0).toUpperCase();
    }

    const firstLetter = userName.charAt(0).toUpperCase();
    const secondLetter = userName.charAt(1).toLowerCase();

    return `${firstLetter}${secondLetter}`;
  }
}
