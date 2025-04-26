import { Component } from '@angular/core';
import { WeatherCardComponent } from '../dashboard-cards/weather-card/weather-card.component';
import { DroughtDataCardComponent } from '../dashboard-cards/drought-data-card/drought-data-card.component';
import {
  TaskMonitorTabsMenuComponent
} from '../dashboard-cards/task-monitor-card/task-monitor-tabs-menu/task-monitor-tabs-menu.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    WeatherCardComponent,
    DroughtDataCardComponent,
    TaskMonitorTabsMenuComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
}
