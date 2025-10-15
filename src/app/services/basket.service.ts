import { Injectable } from '@angular/core';
import { BehaviorSubject, of, from } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ref, remove as firebaseRemove, get, child } from '@angular/fire/database';
import { Database } from '@angular/fire/database';
import { HttpClient } from '@angular/common/http';
import { Appointment } from '../models/appointment.model';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';
import { AppointmentService } from './appointment.service';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private basket: Appointment[] = [];
  private basketSubject = new BehaviorSubject<Appointment[]>(this.basket);
  private currentUser: User | null = null;

  basket$ = this.basketSubject.asObservable();

  constructor(
    private db: Database,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private http: HttpClient
  ) {    
    const savedBasket = localStorage.getItem('basket');
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      console.log('Aktualny użytkownik:', this.currentUser);
    });

    if (savedBasket) {
      const parsedBasket: Appointment[] = JSON.parse(savedBasket);
      // Filtrowanie wizyt bez UID
      this.basket = parsedBasket.filter(app => app.uid);
      this.basketSubject.next(this.basket);
      console.log('Wczytane dane z koszyka:', this.basket);
      this.basket.forEach(app => console.log('Appointment UID:', app.uid));
    }

    // Subskrypcja usunięć wizyt z AppointmentService
    this.appointmentService.appointmentRemoved$.subscribe(appointmentId => {
      this.basket = this.basket.filter(app => app.uid !== appointmentId);
      this.updateLocalStorage();
      this.basketSubject.next(this.basket);
      console.log(`Wizyta ${appointmentId} usunięta z koszyka przez AppointmentService.`);
    });
  }

  addToBasket(appointment: Appointment): void {
    if (!appointment.uid) {
      console.error('Appointment must have a uid:', appointment);
      return;
    }
    console.log('Dodawanie do koszyka:', appointment);
    // Zapobieganie duplikatom
    const exists = this.basket.some(app => app.uid === appointment.uid);
    if (!exists) {
      this.basket.push(appointment);
      this.updateLocalStorage();
      this.basketSubject.next(this.basket);
    } else {
      console.log('Wizyta już jest w koszyku:', appointment.uid);
    }
  }

  removeFromBasketById(appointmentId: string | undefined): void { 
    if (!appointmentId || !this.currentUser || !this.currentUser.uid) {
      console.log('Nieprawidłowy appointmentId lub użytkownik niezalogowany.');
      return;
    }

    const uid = this.currentUser.uid;
    this.basket = this.basket.filter(appointment => 
      !(appointment.uid === appointmentId && appointment.patientId === uid)
    );
    console.log(`Usuwanie wizyty z koszyka o UID: ${appointmentId}`);
    this.removeFromDatabase(appointmentId, uid);

    this.updateLocalStorage();
    this.basketSubject.next(this.basket);
    console.log('Aktualny stan koszyka po usunięciu:', this.basket);

    // Emisja zdarzenia usunięcia wizyty
    this.appointmentService.notifyAppointmentRemoved(appointmentId);
  }

  clearBasket(): void {
    // Zapisz wizyty przed wyczyszczeniem koszyka
    const appointmentsToNotify = this.basket.filter(app => app.uid);
    
    this.basket = [];
    this.updateLocalStorage();
    this.basketSubject.next(this.basket);
    console.log('Koszyk wyczyszczony.');

    // Opcjonalnie: Emituj zdarzenia usunięcia wszystkich wizyt
    appointmentsToNotify.forEach(app => {
      if (app.uid) {
        this.appointmentService.notifyAppointmentRemoved(app.uid);
      }
    });
  }

  private updateLocalStorage(): void {
    localStorage.setItem('basket', JSON.stringify(this.basket));
    console.log('Zaktualizowano localStorage.');
  }

  private isFirebase(): boolean {
    return localStorage.getItem('dataSource') === 'firebase';
  }

  private isMongoDB(): boolean {
    return localStorage.getItem('dataSource') === 'mongodb';
  }

  private removeFromDatabase(appointmentId: string, patientId: string): void {
    if (!appointmentId) {
      console.log('Nieprawidłowy appointmentId.');
      return;
    }
  
    if (this.isFirebase()) {
      const appointmentRef = ref(this.db, `appointments/${appointmentId}`);
      from(get(appointmentRef)).pipe(
        switchMap(snapshot => {
          const appointment = snapshot.val() as Appointment;
          if (appointment && appointment.patientId === patientId) {
            console.log(`Usuwanie wizyty z Firebase o UID: ${appointmentId}`);
            return from(firebaseRemove(appointmentRef));
          } else {
            console.log(`Wizyta o UID: ${appointmentId} nie istnieje lub nie należy do użytkownika.`);
            return of(null);
          }
        }),
        catchError(err => {
          console.error(`Błąd podczas usuwania wizyty z Firebase:`, err);
          return of(null);
        })
      ).subscribe({
        next: () => {
          console.log(`Wizyta o UID: ${appointmentId} została usunięta z Firebase.`);
        },
        error: (err) => console.error(`Error during removal:`, err)
      });
    } else if (this.isMongoDB()) {
      // MongoDB - sprawdź czy wizyta należy do użytkownika i usuń
      this.http.get<Appointment>(`http://localhost:3001/api/appointments/${appointmentId}`).pipe(
        switchMap(appointment => {
          if (appointment && appointment.patientId.toString() === patientId) {
            console.log(`Usuwanie wizyty z MongoDB o ID: ${appointmentId}`);
            return this.http.delete<void>(`http://localhost:3001/api/appointments/${appointmentId}`);
          } else {
            console.log(`Wizyta o ID: ${appointmentId} nie istnieje lub nie należy do użytkownika.`);
            return of(null);
          }
        }),
        catchError(err => {
          console.error(`Błąd podczas usuwania wizyty z MongoDB:`, err);
          return of(null);
        })
      ).subscribe({
        next: () => {
          console.log(`Wizyta o ID: ${appointmentId} została usunięta z MongoDB.`);
        },
        error: (err) => console.error(`Error during MongoDB removal:`, err)
      });
    } else {
      // JSON Server - usuń wizytę
      this.http.delete<void>(`http://localhost:3000/appointments/${appointmentId}`).pipe(
        catchError(err => {
          console.error(`Błąd podczas usuwania wizyty z JSON Server:`, err);
          return of(null);
        })
      ).subscribe({
        next: () => {
          console.log(`Wizyta o ID: ${appointmentId} została usunięta z JSON Server.`);
        },
        error: (err) => console.error(`Error during JSON Server removal:`, err)
      });
    }
  }
}