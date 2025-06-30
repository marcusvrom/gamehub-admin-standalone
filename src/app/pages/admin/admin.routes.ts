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
import { FinancialComponent } from './financial/financial.component';
import { InventoryManagementComponent } from './inventory-management/inventory-management.component';
import { PointOfSaleComponent } from './point-of-sale/point-of-sale.component';
import { GameLibraryComponent } from './game-library/game-library.component';
import { EventManagementComponent } from './event-management/event-management.component';
import { EventDetailComponent } from './event-detail/event-detail.component';

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
            { path: 'inventory', component: InventoryManagementComponent },
            { path: 'events', component: EventManagementComponent },
            { path: 'events/:id', component: EventDetailComponent },
            { path: 'settings', component: SettingsComponent },
            { path: 'scheduling', component: SchedulingComponent },
            { path: 'packages', component: PackageManagementComponent },
            { path: 'game-library', component: GameLibraryComponent },
            { path: 'pos', component: PointOfSaleComponent },
            { path: 'stations', component: StationManagementComponent },
            { path: 'financial', component: FinancialComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];
