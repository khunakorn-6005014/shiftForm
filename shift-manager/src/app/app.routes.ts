// src/app/app.routes.ts
import { Routes } from '@angular/router';
//import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AuthGuard }              from './guards/auth.guard';
import { RoleGuard }              from './guards/role.guard';
import { HomeComponent } from './page/home/home.component';
import { AddEditShiftComponent } from './page/shift/add-edit-shift.component';
import {AllShiftsComponent} from './admin/all-shifts/all-shifts.component';
import {AllWorkersComponent} from './admin/all-workers/all-workers.component';
import { AdminHomeComponent } from './admin/home/admin-home.component';
//import { LoginComponent } from './pages/login/login.component';
//import { RegistrationComponent } from './pages/registration/registration.component';
// import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
// import { AdminRegistrationComponent } from './admin/admin-registration/admin-registration.component';

export const routes: Routes = [
  // 1) Default redirect to the public home
  { path: '',   pathMatch: 'full', redirectTo: 'home' },

  // 2) Public user pages
  { path: 'home',            component: HomeComponent,             canActivate: [AuthGuard] },
  { path: 'add_edit_shift',  component: AddEditShiftComponent,     canActivate: [AuthGuard] },

  // 3) Admin dashboard & sub-pages
  
  {
    path: 'admin',
    component: AdminHomeComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'admin/shifts',
    component: AllShiftsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  {
    path: 'admin/workers',
    component: AllWorkersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },

  // 4) Catch-all
  { path: '**', redirectTo: 'home' }
];
