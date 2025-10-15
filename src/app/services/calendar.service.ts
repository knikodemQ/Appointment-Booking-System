import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from, forkJoin } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { Database, ref, get, child, remove as firebaseRemove, set, push, update } from '@angular/fire/database';
import { User } from '../models/user.model';
import { Absence } from '../models/absence.model';
import { Availability } from '../models/availability.model';
import { Appointment } from './../models/appointment.model';
import {of,  throwError, catchError } from 'rxjs';
import { AppointmentService } from './appointment.service';


@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = 'http://localhost:3000';
  
  private appointments: Appointment[] = [];
  private users: User[] = [];
  private availabilities: Availability[] = [];
  private absences: Absence[] = [];

  private appointmentsSubject = new BehaviorSubject<Appointment[]>(this.appointments);
  private usersSubject = new BehaviorSubject<User[]>(this.users);
  private availabilitiesSubject = new BehaviorSubject<Availability[]>(this.availabilities);
  private absencesSubject = new BehaviorSubject<Absence[]>(this.absences);

  appointments$ = this.appointmentsSubject.asObservable();
  users$ = this.usersSubject.asObservable();
  availabilities$ = this.availabilitiesSubject.asObservable();
  absences$ = this.absencesSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private db: Database,
    private appointmentService: AppointmentService
  ) {
    this.loadAllData();

    
    this.appointmentService.appointmentRemoved$.subscribe(appointmentId => {
      this.appointments = this.appointments.filter(app => app.uid !== appointmentId);
      this.appointmentsSubject.next(this.appointments);
      console.log(`Wizyta ${appointmentId} usunięta z kalendarza przez AppointmentService.`);
    });
  }

  private isFirebase(): boolean {
    return localStorage.getItem('dataSource') === 'firebase';
  }

  private isMongoDB(): boolean {
    return localStorage.getItem('dataSource') === 'mongodb';
  }

  private mongoApiUrl = 'http://localhost:3001/api';

  private getNextId(collection: string): Observable<number> {
    return from(get(child(ref(this.db), collection))).pipe(
      map(snapshot => {
        const data = snapshot.val();
        const ids = data ? Object.keys(data).map(key => data[key].id || 0) : [];
        const numericIds = ids.filter((id): id is number => typeof id === 'number');
        return numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
      })
    );
  }

  loadAllData(): void {
    if (this.isFirebase()) {
      forkJoin({
        users: this.getFirebaseCollection<User>('users'),
        availabilities: this.getFirebaseCollection<Availability>('availability'),
        absences: this.getFirebaseCollection<Absence>('absences'),
        appointments: this.getFirebaseCollection<Appointment>('appointments')
      }).subscribe(({ users, availabilities, absences, appointments }) => {
        this.users = users;
        this.availabilities = availabilities;
        this.absences = absences;
        this.appointments = appointments;

        this.usersSubject.next(this.users);
        this.availabilitiesSubject.next(this.availabilities);
        this.absencesSubject.next(this.absences);
        this.appointmentsSubject.next(this.appointments);
      });
    } else if (this.isMongoDB()) {
      forkJoin({
        users: this.http.get<User[]>(`${this.mongoApiUrl}/users`),
        availabilities: this.http.get<Availability[]>(`${this.mongoApiUrl}/availability`),
        absences: this.http.get<Absence[]>(`${this.mongoApiUrl}/absences`),
        appointments: this.http.get<Appointment[]>(`${this.mongoApiUrl}/appointments`)
      }).subscribe(({ users, availabilities, absences, appointments }) => {
        this.users = users;
        this.availabilities = availabilities;
        this.absences = absences;
        this.appointments = appointments;

        this.usersSubject.next(this.users);
        this.availabilitiesSubject.next(this.availabilities);
        this.absencesSubject.next(this.absences);
        this.appointmentsSubject.next(this.appointments);
      });
    } else {
      forkJoin({
        users: this.http.get<User[]>(`${this.apiUrl}/users`),
        availabilities: this.http.get<Availability[]>(`${this.apiUrl}/availability`),
        absences: this.http.get<Absence[]>(`${this.apiUrl}/absences`),
        appointments: this.http.get<Appointment[]>(`${this.apiUrl}/appointments`)
      }).subscribe(({ users, availabilities, absences, appointments }) => {
        this.users = users;
        this.availabilities = availabilities;
        this.absences = absences;
        this.appointments = appointments;

        this.usersSubject.next(this.users);
        this.availabilitiesSubject.next(this.availabilities);
        this.absencesSubject.next(this.absences);
        this.appointmentsSubject.next(this.appointments);
      });
    }
  }

  private getFirebaseCollection<T>(collection: string): Observable<T[]> {
    const collectionRef = ref(this.db, collection);
    return from(get(child(ref(this.db), collection))).pipe(
      map(snapshot => {
        const data = snapshot.val();
        return data ? Object.values(data) as T[] : [];
      }),
      tap(data => {
        switch(collection) {
          case 'users':
            this.users = data as User[];
            this.usersSubject.next(this.users);
            break;
          case 'availability':
            this.availabilities = data as Availability[];
            this.availabilitiesSubject.next(this.availabilities);
            break;
          case 'absences':
            this.absences = data as Absence[];
            this.absencesSubject.next(this.absences);
            break;
          case 'appointments':
            this.appointments = data as Appointment[];
            this.appointmentsSubject.next(this.appointments);
            break;
        }
      })
    );
  }

  getUsers(): Observable<User[]> {
    return this.users$;
  }

  createUser(user: User): Observable<User> {
    if (this.isFirebase()) {
      const usersRef = ref(this.db, 'users');
      const newUserRef = push(usersRef);
      const newUser: User = { ...user, uid: newUserRef.key! }; // Użycie operatora non-null assertion
      return from(set(newUserRef, newUser)).pipe(
        map(() => newUser),
        tap(() => {
          this.users.push(newUser);
          this.usersSubject.next(this.users);
        })
      );
    } else {
      return this.getNextId('users').pipe(
        switchMap(id => {
          const newUser = { ...user, id };
          return this.http.post<User>(`${this.apiUrl}/users`, newUser);
        }),
        tap((newUser: User) => {
          this.users.push(newUser);
          this.usersSubject.next(this.users);
        })
      );
    }
  }
  getAvailabilities(): Observable<Availability[]> {
    return this.availabilities$;
  }

  createAvailability(availability: Availability): Observable<Availability> {
    if (this.isFirebase()) {
      const availabilitiesRef = ref(this.db, 'availability');
      const newAvailabilityRef = push(availabilitiesRef);
      const newAvailability: Availability = { ...availability, uid: newAvailabilityRef.key || undefined };
      return from(set(newAvailabilityRef, newAvailability)).pipe(
        map(() => newAvailability),
        tap(() => {
          this.availabilities.push(newAvailability);
          this.availabilitiesSubject.next(this.availabilities);
        })
      );
    } else {
      return this.getNextId('availability').pipe(
        switchMap(id => {
          const newAvailability = { ...availability, id };
          return this.http.post<Availability>(`${this.apiUrl}/availability`, newAvailability);
        }),
        tap((newAvailability: Availability) => {
          this.availabilities.push(newAvailability);
          this.availabilitiesSubject.next(this.availabilities);
        })
      );
    }
  }

  getAbsences(): Observable<Absence[]> {
    return this.absences$;
  }

  createAbsence(absence: Absence): Observable<Absence> {
    if (this.isFirebase()) {
      const absencesRef = ref(this.db, 'absences');
      const newAbsenceRef = push(absencesRef);
      const newAbsence: Absence = { ...absence, uid: newAbsenceRef.key || undefined };
      return from(set(newAbsenceRef, newAbsence)).pipe(
        map(() => newAbsence),
        tap(() => {
          this.absences.push(newAbsence);
          this.absencesSubject.next(this.absences);
        })
      );
    } else {
      return this.getNextId('absences').pipe(
        switchMap(id => {
          const newAbsence = { ...absence, id };
          return this.http.post<Absence>(`${this.apiUrl}/absences`, newAbsence);
        }),
        tap((newAbsence: Absence) => {
          this.absences.push(newAbsence);
          this.absencesSubject.next(this.absences);
        })
      );
    }
  }

  getAppointments(): Observable<Appointment[]> {
    return this.appointments$;
  }

  createAppointment(appointment: Appointment): Observable<Appointment> {
    if (this.isFirebase()) {
      const appointmentsRef = ref(this.db, 'appointments');
      const newAppointmentRef = push(appointmentsRef);
      const newAppointment: Appointment = { ...appointment, uid: newAppointmentRef.key || undefined };
      return from(set(newAppointmentRef, newAppointment)).pipe(
        map(() => newAppointment),
        tap(() => {
          this.appointments.push(newAppointment);
          this.appointmentsSubject.next(this.appointments);
        })
      );
    } else {
      return this.getNextId('appointments').pipe(
        switchMap(id => {
          const newAppointment = { ...appointment, id };
          return this.http.post<Appointment>(`${this.apiUrl}/appointments`, newAppointment);
        }),
        tap((newApp: Appointment) => {
          this.appointments.push(newApp);
          this.appointmentsSubject.next(this.appointments);
        })
      );
    }
  }

  removeAppointment(appointmentId: number | string, patientId: string): Observable<void> {
    return this.getAppointmentById(appointmentId).pipe(
      switchMap(appointment => {
        if (appointment && appointment.patientId === patientId) {
          if (this.isFirebase()) {
            this.appointmentService.removeAppointment(appointmentId.toString());
            return from(firebaseRemove(ref(this.db, `appointments/${appointment.uid}`)));
          } else {
            return this.http.delete<void>(`${this.apiUrl}/appointments/${appointment.id}`);
          }
        } else {
          return throwError(() => new Error('Nieautoryzowana operacja usuwania.'));
        }
      }),
      catchError(err => {
        console.error('Błąd podczas usuwania wizyty:', err);
        return throwError(() => err);
      })
    );
  }

  private getAppointmentById(appointmentId: number | string): Observable<Appointment | null> {
    if (this.isFirebase()) {
      const appointmentRef = ref(this.db, `appointments/${appointmentId}`);
      return from(get(appointmentRef)).pipe(
        map(snapshot => snapshot.exists() ? (snapshot.val() as Appointment) : null),
        catchError(() => of(null))
      );
    } else {
      return this.http.get<Appointment>(`${this.apiUrl}/appointments/${appointmentId}`).pipe(
        catchError(() => of(null))
      );
    }
  }

}