import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Appointment } from '../models/appointment.model';
import { Availability } from '../models/availability.model';
import { Absence } from '../models/absence.model';

@Injectable({
  providedIn: 'root'
})
export class MongoService {
  private apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  // Test connection
  testConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/test`);
  }

  // Users CRUD
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  // Appointments CRUD
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments`);
  }

  getAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/appointments/${id}`);
  }

  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/appointments`, appointment);
  }

  updateAppointment(id: string, appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/appointments/${id}`, appointment);
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/appointments/${id}`);
  }

  // Availability CRUD
  getAvailabilities(): Observable<Availability[]> {
    return this.http.get<Availability[]>(`${this.apiUrl}/availability`);
  }

  createAvailability(availability: Availability): Observable<Availability> {
    return this.http.post<Availability>(`${this.apiUrl}/availability`, availability);
  }

  deleteAvailability(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/availability/${id}`);
  }

  // Absences CRUD
  getAbsences(): Observable<Absence[]> {
    return this.http.get<Absence[]>(`${this.apiUrl}/absences`);
  }

  createAbsence(absence: Absence): Observable<Absence> {
    return this.http.post<Absence>(`${this.apiUrl}/absences`, absence);
  }

  deleteAbsence(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/absences/${id}`);
  }

  // Batch operations
  getAllData(): Observable<{
    users: User[],
    appointments: Appointment[],
    availabilities: Availability[],
    absences: Absence[]
  }> {
    const users$ = this.getUsers();
    const appointments$ = this.getAppointments();
    const availabilities$ = this.getAvailabilities();
    const absences$ = this.getAbsences();
    
    return new Observable(observer => {
      Promise.all([
        users$.toPromise(),
        appointments$.toPromise(),
        availabilities$.toPromise(),
        absences$.toPromise()
      ]).then(([users, appointments, availabilities, absences]) => {
        observer.next({
          users: users || [],
          appointments: appointments || [],
          availabilities: availabilities || [],
          absences: absences || []
        });
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }
}