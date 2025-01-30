import {Routes} from '@angular/router';
import {InitializeFarmComponent} from './components/initialize-farm/initialize-farm.component';
import {LandingComponent} from './components/landing/landing.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: LandingComponent }, // Default route
  { path: 'initialize-farm', component: InitializeFarmComponent },
  { path: 'dashboard', component: DashboardComponent }
];
