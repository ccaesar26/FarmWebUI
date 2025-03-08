import { Component, OnInit } from '@angular/core';
import { SpeedDial } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-people-management',
  imports: [
    SpeedDial
  ],
  templateUrl: './people-management.component.html',
  styleUrl: './people-management.component.css'
})
export class PeopleManagementComponent implements OnInit {
  items: MenuItem[] | null = null;

  constructor(protected router: Router) {
  }

  ngOnInit() {
    this.items = [
      {
        label: 'Add',
        icon: 'pi pi-plus',
        command: () => {
          this.router.navigate(['/dashboard/people/add']);
        }
      },
      {
        label: 'Download CSV',
        icon: 'pi pi-download',
        command: () => {
        }
      },
    ]
  }
}
