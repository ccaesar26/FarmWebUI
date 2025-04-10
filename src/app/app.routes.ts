import { Routes } from '@angular/router';
import { InitializeFarmComponent } from './features/initialize-farm/initialize-farm.component';
import { AuthTabsComponent } from './features/auth/auth-tabs/auth-tabs.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UnauthorizedComponent } from './features/unauthorized/unauthorized.component';
import { LandingLayoutComponent } from './core/layouts/landing-layout/landing-layout.component';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { RegisterSuccessComponent } from './core/components/register-success/register-success.component';
import { dashboardGuardFn } from './core/guards/dashboard.guard';
import { initializeFarmGuardFn } from './core/guards/initialize-farm.guard';
import { PeopleManagementComponent } from './features/people/people-management/people-management.component';
import { CreateTaskComponent } from './features/tasks/create-task/create-task.component';
import { FieldsManagementComponent } from './features/fields/fields-management/fields-management.component';
import { CropCatalogComponent } from './features/crops/crop-catalog/crop-catalog.component';
import { PlantedCropsComponent } from './features/crops/planted-crops/planted-crops.component';
import { TasksManagementComponent } from './features/tasks/tasks-management/tasks-management.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LandingLayoutComponent,
    children: [
      {
        path: '',
        component: AuthTabsComponent,
        children: [
          { path: '', component: LoginComponent }
        ]
      },
    ]
  },
  {
    path: 'register',
    component: LandingLayoutComponent,
    children: [
      {
        path: '',
        component: AuthTabsComponent,
        children: [
          { path: '', component: RegisterComponent }
        ]
      },
      {
        path: 'success',
        component: RegisterSuccessComponent
      }
    ]
  },
  {
    path: 'initialize-farm',
    component: LandingLayoutComponent,
    children:
      [
        { path: '', component: InitializeFarmComponent, canActivate: [ initializeFarmGuardFn ] }
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
      { path: '', component: DashboardComponent, canActivate: [ dashboardGuardFn ] },
      { path: 'fields', component: FieldsManagementComponent, canActivate: [ dashboardGuardFn ] },
      { path: 'crop-catalog', component: CropCatalogComponent, canActivate: [ dashboardGuardFn ] },
      { path: 'planted-crops', component: PlantedCropsComponent, canActivate: [ dashboardGuardFn ] },
      { path: 'tasks', component: TasksManagementComponent, canActivate: [ dashboardGuardFn ] },
      { path: 'tasks/create', component: CreateTaskComponent, canActivate: [ dashboardGuardFn ] },
      { path: 'people', component: PeopleManagementComponent, canActivate: [ dashboardGuardFn ] },
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
