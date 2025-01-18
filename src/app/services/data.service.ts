import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment, User, Availability, Absence } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'assets/data.json';

  constructor(private http: HttpClient) {}

  // Get all data
  getData(): Observable<{ users: User[], appointments: Appointment[], availability: Availability[], absences: Absence[] }> {
    return this.http.get<{ users: User[], appointments: Appointment[], availability: Availability[], absences: Absence[] }>(this.apiUrl);
  }

  // Get appointments
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments`);
  }

  // Add appointment
  addAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/appointments`, appointment);
  }

  // Update appointment
  updateAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/appointments/${appointment.appointmentId}`, appointment);
  }

  // Delete appointment
  deleteAppointment(appointmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/appointments/${appointmentId}`);
  }

  // Get users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  // Get availabilities
  getAvailabilities(): Observable<Availability[]> {
    return this.http.get<Availability[]>(`${this.apiUrl}/availability`);
  }

  // Add availability
  addAvailability(availability: Availability): Observable<Availability> {
    return this.http.post<Availability>(`${this.apiUrl}/availability`, availability);
  }

  // Get absences
  getAbsences(): Observable<Absence[]> {
    return this.http.get<Absence[]>(`${this.apiUrl}/absences`);
  }

  // Add absence
  addAbsence(absence: Absence): Observable<Absence> {
    return this.http.post<Absence>(`${this.apiUrl}/absences`, absence);
  }
}