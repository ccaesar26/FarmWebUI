import { Component } from '@angular/core';
import { WeatherCardComponent } from '../dashboard-cards/weather-card/weather-card.component';
import { DroughtDataCardComponent } from '../dashboard-cards/drought-data-card/drought-data-card.component';
import {
  TaskMonitorBoardComponent
} from '../dashboard-cards/task-monitor-card/task-monitor-board/task-monitor-board.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    WeatherCardComponent,
    DroughtDataCardComponent,
    TaskMonitorBoardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
}
