// src/app/app.routes.ts
import { Routes } from '@angular/router';
//import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
// import { AuthGuard }              from './guards/auth.guard';
// import { RoleGuard }              from './guards/role.guard';
import { HomeComponent } from './page/home/home.component';
import { ShiftFormComponent } from './page/shift/add-edit-shift.component';
import { AllShiftsComponent } from './admin/all-shifts/all-shifts.component';
import { AllWorkersComponent } from './admin/all-workers/all-workers.component';
import { AdminHomeComponent } from './admin/home/admin-home.component';
import { LoginComponent } from './page/login/login.component';
import { RegistrationComponent } from './page/registration/registration.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminRegistrationComponent } from './admin/admin-registration/admin-registration.component';
import { MyShiftComponent } from './page/my-shift/my-shift.component';
import { EditProfileComponent } from './page/edit-profile/edit-profile.component';
import { FilterShiftsComponent } from './admin/filter-shifts/filter-shifts.component';
import { EditWorkerComponent } from './admin/edit-worker/edit-worker.component';
import { AdminShiftFormComponent } from './admin/shift-edit/shift-edit.component';
export const routes: Routes = [

    {
        path: 'admin',
        children: [
            { path: 'login', component: AdminLoginComponent },
            { path: 'registration', component: AdminRegistrationComponent },
            { path: 'shifts', component: AllShiftsComponent },
            { path: 'workers', component: AllWorkersComponent },
            { path: 'home', component: AdminHomeComponent },
            { path: 'filter', component: FilterShiftsComponent },
            { path: 'worker', component: EditWorkerComponent },
            {path : 'shiftFormAd',component : AdminShiftFormComponent}
        ]
    },
    {
        path: '',
        children: [
            { path: '', component: LoginComponent },
            { path: 'login', component: LoginComponent },
            { path: 'registration', component: RegistrationComponent },
            { path: 'home', component: HomeComponent },
            { path: 'shiftForm', component: ShiftFormComponent },
            { path: 'editProfile', component: EditProfileComponent },
            { path: 'myshift', component: MyShiftComponent },
        ]
    }
];