import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { KalendarzComponent } from './kalendarz/kalendarz.component';
import { BasketComponent } from './basket/basket.component';
import { PacjentFormComponent } from './pacjent-form/pacjent-form.component';
import { DefineAvailabilityComponent } from './define-availability/define-availability.component';
import { DefineAbsenceComponent } from './define-absence/define-absence.component';
import { DataSourceSelectorComponent } from './data-source-selector/data-source-selector.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { TerminarzLekarzaComponent } from './terminarz-lekarza/terminarz-lekarza.component';
import { PersistenceSelectorComponent } from './persistence-selector/persistence-selector.component';
import { RegisterDoctorComponent } from './register-doctor/register-doctor.component';
import { DoctorListComponent } from './doctor-list/doctor-list.component';

export const routes: Routes = [
  { path: 'calendar', component: KalendarzComponent, canActivate: [AuthGuard] },
  { path: 'basket', component: BasketComponent, canActivate: [AuthGuard] },
  { path: 'pacjent-form', component: PacjentFormComponent, canActivate: [AuthGuard] },
  { path: 'define-availability', component: DefineAvailabilityComponent, canActivate: [AuthGuard] },
  { path: 'define-absence', component: DefineAbsenceComponent, canActivate: [AuthGuard] },
  { path: 'data-source-selector', component: DataSourceSelectorComponent, canActivate: [AuthGuard] },
  { path: 'terminarz-lekarza', component: TerminarzLekarzaComponent, canActivate: [AuthGuard] },
  { path: 'persistence-selector', component: PersistenceSelectorComponent, canActivate: [AuthGuard] },
  { path: 'register-doctor', component: RegisterDoctorComponent, canActivate: [AuthGuard] },
  { path: 'doctor-list', component: DoctorListComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '' }
];
