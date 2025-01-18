import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

interface Appointment {
  appointmentId: number;
  doctorId: number;
  patientId: number;
  type: string;
  date: string;
  time: string;
  duration: number;
  occurred: boolean;
  cancelled: boolean;
  details: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private appointments: Appointment[] = [];
  private appointmentsSubject = new BehaviorSubject<Appointment[]>(this.appointments);

  appointments$ = this.appointmentsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.http.get<Appointment[]>('http://localhost:3000/appointments').subscribe(data => {
      this.appointments = data;
      this.appointmentsSubject.next(this.appointments);
    });
  }

  removeAppointment(appointmentId: number): void {
    console.log(`Removing appointment with ID: ${appointmentId}`);
    this.http.delete(`http://localhost:3000/appointments/${appointmentId}`).subscribe(() => {
      this.appointments = this.appointments.filter(appointment => appointment.appointmentId !== appointmentId);
      this.appointmentsSubject.next(this.appointments);
      console.log(`Appointment with ID: ${appointmentId} removed.`);
    });
  }
  
}