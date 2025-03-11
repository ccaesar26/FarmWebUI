import { Component } from '@angular/core';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { Card } from 'primeng/card';
import { TabPanel, TabView } from 'primeng/tabview';
import { PrimeTemplate } from 'primeng/api';
import { TaskMonitorBoardComponent } from '../task-monitor-board/task-monitor-board.component';
import { ScrollPanel } from 'primeng/scrollpanel';
import { TaskMonitorCalendarComponent } from '../task-monitor-calendar/task-monitor-calendar.component';

@Component({
  selector: 'app-task-monitor-tabs-menu',
  imports: [
    Tabs,
    TabList,
    Tab,
    Card,
    TabPanel,
    TabView,
    PrimeTemplate,
    TaskMonitorBoardComponent,
    ScrollPanel,
    TaskMonitorCalendarComponent
  ],
  templateUrl: './task-monitor-tabs-menu.component.html',
  styleUrl: './task-monitor-tabs-menu.component.css'
})
export class TaskMonitorTabsMenuComponent {

}
