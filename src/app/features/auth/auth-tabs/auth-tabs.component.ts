import { Component } from '@angular/core';
import { ReactiveFormsModule } from "@angular/forms";
import { Tab, TabList, Tabs } from "primeng/tabs";
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-tabs',
  imports: [
    ReactiveFormsModule,
    Tab,
    TabList,
    Tabs,
    RouterOutlet
  ],
  templateUrl: './auth-tabs.component.html',
  styleUrl: './auth-tabs.component.scss'
})
export class AuthTabsComponent {
  activeTab: number = 0;

  constructor(private router: Router) {
    this.activeTab = router.url.includes('register') ? 1 : 0;
  }

  navigateTo(route: string) {
    this.router.navigate([ route ]);
  }
}
