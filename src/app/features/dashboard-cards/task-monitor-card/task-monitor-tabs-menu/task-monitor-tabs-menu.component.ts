import {Component, OnInit} from '@angular/core';
import {Card} from 'primeng/card';
import {TabPanel, TabView} from 'primeng/tabview';
import {MenuItem, PrimeTemplate} from 'primeng/api';
import {TaskMonitorBoardComponent} from '../task-monitor-board/task-monitor-board.component';
import {ScrollPanel} from 'primeng/scrollpanel';
import {Router} from '@angular/router';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-task-monitor-tabs-menu',
  imports: [
    Card,
    TabPanel,
    TabView,
    PrimeTemplate,
    TaskMonitorBoardComponent,
    ScrollPanel,
    ButtonDirective
  ],
  templateUrl: './task-monitor-tabs-menu.component.html',
  styleUrl: './task-monitor-tabs-menu.component.css'
})
export class TaskMonitorTabsMenuComponent implements OnInit {
  items: MenuItem[] | null = [];

  constructor(protected router: Router) {
  }

  ngOnInit() {
    this.items = [
      {
        label: 'Add',
        icon: 'pi pi-plus',
        command: () => {
          this.router.navigate(['/dashboard/tasks/create']);
        }
      }
    ];
  }
}
