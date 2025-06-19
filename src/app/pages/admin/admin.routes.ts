import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientListComponent } from './client-list/client-list.component';
import { ClientFormComponent } from './client-form/client-form.component';
import { ClientDetailComponent } from './client-detail/client-detail.component';
import { SettingsComponent } from './settings/settings.component';
import { SchedulingComponent } from './scheduling/scheduling.component';
import { PackageManagementComponent } from './package-management/package-management.component';
import { StationManagementComponent } from './station-management/station-management.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'clients', component: ClientListComponent },
            { path: 'clients/new', component: ClientFormComponent },
            { path: 'clients/edit/:id', component: ClientFormComponent },
            { path: 'clients/:id', component: ClientDetailComponent },
            { path: 'settings', component: SettingsComponent },
            { path: 'scheduling', component: SchedulingComponent },
            { path: 'packages', component: PackageManagementComponent },
            { path: 'stations', component: StationManagementComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];
