import { Component } from '@angular/core';
import {
  TaskMonitorBoardComponent
} from '../../dashboard-cards/task-monitor-card/task-monitor-board/task-monitor-board.component';

@Component({
  selector: 'app-tasks-management',
  imports: [
    TaskMonitorBoardComponent
  ],
  templateUrl: './tasks-management.component.html',
  styleUrl: './tasks-management.component.scss'
})
export class TasksManagementComponent {

}
