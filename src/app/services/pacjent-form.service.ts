import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Database, ref, get, child, set, push } from '@angular/fire/database';
import { Observable, from, combineLatest } from 'rxjs';
import { map, switchMap, first } from 'rxjs/operators';
import { Appointment } from '../models/appointment.model';
import { Absence } from '../models/absence.model';
import { Availability } from '../models/availability.model';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class PacjentFormService {
  private apiUrl = 'http://localhost:3000/appointments';
  private absencesUrl = 'http://localhost:3000/absences';
  private availabilityUrl = 'http://localhost:3000/availability';
  private usersUrl = 'http://localhost:3000/users';
  
  // MongoDB URLs
  private mongoApiUrl = 'http://localhost:3001/api/appointments';
  private mongoAbsencesUrl = 'http://localhost:3001/api/absences';
  private mongoAvailabilityUrl = 'http://localhost:3001/api/availability';
  private mongoUsersUrl = 'http://localhost:3001/api/users';

  constructor(
    private http: HttpClient,
    private db: Database,
    private authService: AuthService
  ) {}

  public isFirebase(): boolean {
    return localStorage.getItem('dataSource') === 'firebase';
  }

  public isMongoDB(): boolean {
    return localStorage.getItem('dataSource') === 'mongodb';
  }

  /**
   * Ładuje dane użytkownika na podstawie źródła danych.
   */
  loadUserData(): Observable<User | null> {
    if (this.isFirebase()) {
      return this.authService.user$.pipe(
        first(),
        switchMap(user => {
          if (user && user.uid) {
            return from(this.getUserFromFirebase(user.uid));
          }
          return from([null]);
        })
      );
    } else if (this.isMongoDB()) {
      return this.http.get<User[]>(this.mongoUsersUrl).pipe(
        map(users => {
          const patient = users.find(u => !u.isDoctor);
          console.log('MongoDB user loaded:', patient);
          return patient || users[0] || null; // Fallback na pierwszego użytkownika
        })
      );
    } else {
      return this.http.get<User[]>(this.usersUrl).pipe(
        map(users => users.find(u => u.id === 1) || null)
      );
    }
  }

  /**
   * Pobiera dane użytkownika z Firebase na podstawie UID.
   * @param uid UID użytkownika z Firebase Auth
   */
  private getUserFromFirebase(uid: string): Promise<User | null> {
    const userRef = ref(this.db, `users/${uid}`);
    return get(userRef).then(snapshot => {
      if (snapshot.exists()) {
        return snapshot.val() as User;
      }
      return null;
    }).catch(error => {
      console.error('Błąd podczas pobierania użytkownika z Firebase:', error);
      return null;
    });
  }

  /**
   * Ładuje dostępności na podstawie źródła danych.
   */
  loadAvailabilities(): Observable<Availability[]> {
    if (this.isFirebase()) {
      const availabilityRef = ref(this.db, 'availability');
      return from(get(availabilityRef)).pipe(
        map(snapshot => {
          const data = snapshot.val();
          return data ? Object.values(data) as Availability[] : [];
        })
      );
    } else if (this.isMongoDB()) {
      return this.http.get<Availability[]>(this.mongoAvailabilityUrl);
    } else {
      return this.http.get<Availability[]>(this.availabilityUrl);
    }
  }

  /**
   * Ładuje nieobecności na podstawie źródła danych.
   */
  loadAbsences(): Observable<Absence[]> {
    if (this.isFirebase()) {
      const absencesRef = ref(this.db, 'absences');
      return from(get(absencesRef)).pipe(
        map(snapshot => {
          const data = snapshot.val();
          return data ? Object.values(data) as Absence[] : [];
        })
      );
    } else if (this.isMongoDB()) {
      return this.http.get<Absence[]>(this.mongoAbsencesUrl);
    } else {
      return this.http.get<Absence[]>(this.absencesUrl);
    }
  }

  /**
   * Pobiera istniejące wizyty na podstawie źródła danych i identyfikatora użytkownika.
   * @param patientId Identyfikator pacjenta (id lub uid)
   */
  getExistingAppointments(): Observable<Appointment[]> {
    if (this.isFirebase()) {
      const appointmentsRef = ref(this.db, 'appointments');
      return from(get(appointmentsRef)).pipe(
        map(snapshot => {
          const data = snapshot.val();
          return data ? Object.values(data) as Appointment[] : [];
        })
      );
    } else if (this.isMongoDB()) {
      return this.http.get<Appointment[]>(this.mongoApiUrl);
    } else {
      return this.http.get<Appointment[]>(`${this.apiUrl}`);
    }
  }

  /**
   * Tworzy nową wizytę na podstawie źródła danych.
   * @param appointment Obiekt wizyty do utworzenia
   */
  createAppointment(appointment: Appointment): Observable<Appointment> {
    if (this.isFirebase()) {
      const appointmentsRef = ref(this.db, 'appointments');
      const newAppointmentRef = push(appointmentsRef);
      const newAppointment: Appointment = { ...appointment, uid: newAppointmentRef.key || undefined };
      return from(set(newAppointmentRef, newAppointment)).pipe(
        map(() => newAppointment)
      );
    } else if (this.isMongoDB()) {
      return this.http.post<Appointment>(this.mongoApiUrl, appointment);
    } else {
      return this.getNextId().pipe(
        switchMap(id => {
          const newAppointment = { ...appointment, id };
          return this.http.post<Appointment>(this.apiUrl, newAppointment);
        })
      );
    }
  }

  /**
   * Pobiera następne dostępne ID dla JSON Server.
   */
  private getNextId(): Observable<number> {
    return from(get(child(ref(this.db), 'appointments'))).pipe(
      map(snapshot => {
        const data = snapshot.val();
        const ids = data ? Object.keys(data).map(key => data[key].id || 0) : [];
        return ids.length > 0 ? Math.max(...ids) + 1 : 1;
      })
    );
  }
}