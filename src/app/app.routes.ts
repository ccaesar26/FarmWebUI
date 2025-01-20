import {Routes} from '@angular/router';
import {InitializeFarmComponent} from './initialize-farm/initialize-farm.component';
import {LandingComponent} from './landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent }, // Default route
  { path: 'initialize-farm', component: InitializeFarmComponent },
];
