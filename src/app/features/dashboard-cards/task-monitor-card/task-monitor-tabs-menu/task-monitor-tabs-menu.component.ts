import { Component } from '@angular/core';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { Card } from 'primeng/card';
import { TabPanel, TabView } from 'primeng/tabview';
import { PrimeTemplate } from 'primeng/api';

@Component({
  selector: 'app-task-monitor-tabs-menu',
  imports: [
    Tabs,
    TabList,
    Tab,
    Card,
    TabPanel,
    TabView,
    PrimeTemplate
  ],
  templateUrl: './task-monitor-tabs-menu.component.html',
  styleUrl: './task-monitor-tabs-menu.component.css'
})
export class TaskMonitorTabsMenuComponent {

}
