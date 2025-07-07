// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AuthGuard }              from './guards/auth.guard';
import { RoleGuard }              from './guards/role.guard';
import { HomeComponent } from './page/home/home.component';
import { AddEditShiftComponent } from './page/shift/add-edit-shift.component';
export const routes: Routes = [
  
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' }
  },
  { path: '', redirectTo: '/admin', pathMatch: 'full' },  // or your default
  { path: '**', redirectTo: '/admin' },
  { path: 'Home', component: HomeComponent },
  {path: 'addShift', component:AddEditShiftComponent}
];
