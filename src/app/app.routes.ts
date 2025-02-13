import { Routes } from '@angular/router';
import { InitializeFarmComponent } from './features/initialize-farm/initialize-farm.component';
import { LandingComponent } from './features/landing/landing.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UnauthorizedComponent } from './features/unauthorized/unauthorized.component';
import { LandingLayoutComponent } from './core/layouts/landing-layout/landing-layout.component';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { managerAuthGuard } from './core/guards/manager-auth.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LandingLayoutComponent,
    children: [
      { path: '', component: LandingComponent },
    ]
  },
  {
    path: 'initialize-farm',
    component: LandingLayoutComponent,
    children:
      [
        { path: '', component: InitializeFarmComponent },
      ]
  },
  {
    path: 'unauthorized',
    component: LandingLayoutComponent,
    children: [
      { path: '', component: UnauthorizedComponent },
    ]
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    children: [
      { path: '', component: DashboardComponent, canActivate: [ authGuard, managerAuthGuard ] },
    ]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
