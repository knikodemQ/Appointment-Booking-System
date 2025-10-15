import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Database, ref, get, child, set, push, remove } from '@angular/fire/database';
import { Observable, from, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:3000/appointments';
  private appointmentRemovedSource = new Subject<string>();

  // Observable do subskrypcji usunięć wizyt
  appointmentRemoved$ = this.appointmentRemovedSource.asObservable();

  constructor(private http: HttpClient, private db: Database) {}

  private isFirebase(): boolean {
    return localStorage.getItem('dataSource') === 'firebase';
  }

  private isMongoDB(): boolean {
    return localStorage.getItem('dataSource') === 'mongodb';
  }

  private mongoApiUrl = 'http://localhost:3001/api/appointments';

  private getNextId(collection: string): Observable<number> {
    return from(get(child(ref(this.db), collection))).pipe(
      map(snapshot => {
        const data = snapshot.val();
        const ids = data ? Object.keys(data).map(key => data[key].id || 0) : [];
        return ids.length > 0 ? Math.max(...ids) + 1 : 1;
      })
    );
  }

  getAppointments(): Observable<Appointment[]> {
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
      return this.http.get<Appointment[]>(this.apiUrl);
    }
  }

  createAppointment(appointment: Appointment): Observable<Appointment> {
    if (this.isFirebase()) {
      const appointmentsRef = ref(this.db, 'appointments');
      const newAppointmentRef = push(appointmentsRef);
      const newAppointment: Appointment = { ...appointment, uid: newAppointmentRef.key || undefined };
      return from(set(newAppointmentRef, newAppointment)).pipe(
        map(() => newAppointment)
      );
    } else {
      return this.getNextId('appointments').pipe(
        switchMap(id => {
          const newAppointment = { ...appointment, id };
          return this.http.post<Appointment>(this.apiUrl, newAppointment);
        })
      );
    }
  }

  removeAppointment(appointmentId: number | string): Observable<void> {
    if (this.isFirebase()) {
      return from(remove(ref(this.db, `appointments/${appointmentId}`)));
    } else {
      return this.http.delete<void>(`${this.apiUrl}/${appointmentId}`);
    }
  }

  /**
   * Emisja zdarzenia usunięcia wizyty
   * @param appointmentId UID usuwanej wizyty
   */
  notifyAppointmentRemoved(appointmentId: string): void {
    this.appointmentRemovedSource.next(appointmentId);
  }
}