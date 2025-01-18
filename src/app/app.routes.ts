import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { KalendarzComponent } from './kalendarz/kalendarz.component';
import { BasketComponent } from './basket/basket.component';
import { PacjentFormComponent } from './pacjent-form/pacjent-form.component';
import { DefineAvailabilityComponent } from './define-availability/define-availability.component';
import { DefineAbsenceComponent } from './define-absence/define-absence.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'calendar', component: KalendarzComponent },
  { path: 'basket', component: BasketComponent },
  { path: 'pacjent-form', component: PacjentFormComponent },
  { path: 'define-availability', component: DefineAvailabilityComponent },
  { path: 'define-absence', component: DefineAbsenceComponent },
  { path: '**', redirectTo: '' }
];