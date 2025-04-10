import { Component } from '@angular/core';
import {
  TaskMonitorTabsMenuComponent
} from '../../dashboard-cards/task-monitor-card/task-monitor-tabs-menu/task-monitor-tabs-menu.component';

@Component({
  selector: 'app-tasks-management',
  imports: [
    TaskMonitorTabsMenuComponent
  ],
  templateUrl: './tasks-management.component.html',
  styleUrl: './tasks-management.component.css'
})
export class TasksManagementComponent {

}
