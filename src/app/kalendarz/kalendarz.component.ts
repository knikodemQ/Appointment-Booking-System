import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { BasketService } from '../services/basket.service';
import { CalendarService } from '../services/calendar.service';


interface TimeSlot {
  time: string;
  slots: { past: boolean; current: boolean; consultationType?: string; booked?: boolean; available?: boolean; absent?: boolean; appointment?: Appointment }[];
}

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

interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  isDoctor: boolean;
  gender: string;
  age?: number;
  specialization?: string;
}

interface Availability {
  doctorId: number;
  type: string;
  startDate: string;
  endDate: string;
  days: string[];
  timeSlots: { from: string; to: string }[];
}

interface Absence {
  doctorId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

@Component({
  selector: 'app-kalendarz',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './kalendarz.component.html',
  styleUrls: ['./kalendarz.component.css']
})
export class KalendarzComponent implements OnInit {
  currentWeek: Date = new Date();
  weekDays: { date: Date; consultations: number }[] = [];
  timeSlots: TimeSlot[] = [];
  visibleTimeSlots: TimeSlot[] = [];
  currentRangeIndex: number = 0;
  endOfWeek!: Date;
  isDayView: boolean = false;
  currentDay: Date = new Date();
  appointments: Appointment[] = [];
  users: User[] = [];
  availabilities: Availability[] = [];
  absences: Absence[] = [];
  appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  selectedSlot: { date: Date; time: string } | null = null;
  hoveredAppointment: Appointment | null = null;

  timeRanges = [
    { start: 7, end: 12, label: '7:00 - 12:00' },
    { start: 12, end: 17, label: '12:00 - 17:00' },
    { start: 17, end: 22, label: '17:00 - 22:00' },
  ];

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef, private basketService: BasketService, private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.calendarService.appointments$.subscribe((appointments) => {
      this.appointments = appointments;
      this.updateVisibleTimeSlots();
      this.markBookedSlots();
    });
    this.setCurrentTimeRange();
    this.updateWeek();
    this.loadUsers();
    this.loadAvailabilities();
    this.checkMobileView();
    this.reloadPageData();

    if (this.isDayView) {
      this.updateDay();
    } else {
      this.updateWeek();
    }
    this.loadDataOnInit();
  }

  @HostListener('window:resize', [])
  onResize(): void {
    this.checkMobileView();
    this.reloadPageData();
  }

  @HostListener('window:load', [])
  onLoad(): void {
    this.checkMobileView();
    this.reloadPageData();
  }

  private checkMobileView(): void {
    const isMobile = window.innerWidth <= 768;
    if (this.isDayView !== isMobile) {
      this.isDayView = isMobile;
      if (isMobile) {
        this.updateDay();
      } else {
        this.updateWeek();
      }
      this.reloadPageData();
    }
  }

  private loadDataOnInit(): void {
    this.loadUsers();
    this.loadAvailabilities();
    this.calendarService.loadAppointments();
    this.updateVisibleTimeSlots();
    this.markAvailableSlots();
    this.markBookedSlots();
    this.markAbsences();
  }

  private reloadPageData(): void {
    forkJoin({
      users: this.http.get<{ users: User[] }>('assets/data.json'),
      availabilities: this.http.get<{ availability: Availability[] }>('assets/data.json'),
      absences: this.http.get<{ absences: Absence[] }>('assets/data.json'),
      appointments: this.http.get<{ appointments: Appointment[] }>('assets/data.json')
    }).subscribe(({ users, availabilities, absences, appointments }) => {
      this.users = users.users;
      this.availabilities = availabilities.availability;
      this.absences = absences.absences;
      this.appointments = appointments.appointments;
      this.appointmentsSubject.next(this.appointments);
      this.generateTimeSlots();
      this.updateVisibleTimeSlots();
      this.markAvailableSlots();
      this.markBookedSlots();
      this.markAbsences();
      this.updateConsultationsCount();
    });
  }

  setCurrentTimeRange() {
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour >= 7 && currentHour < 12) {
      this.currentRangeIndex = 0;
    } else if (currentHour >= 12 && currentHour < 17) {
      this.currentRangeIndex = 1;
    } else if (currentHour >= 17 && currentHour < 22) {
      this.currentRangeIndex = 2;
    }
  }

  updateWeek() {
    this.generateWeekDays();
    this.generateTimeSlots();
    this.updateVisibleTimeSlots();
    this.endOfWeek = this.getEndOfWeek(this.currentWeek);
    this.markAvailableSlots();
    this.markAbsences();
  }

  generateWeekDays() {
    const startOfWeek = this.getStartOfWeek(this.currentWeek);
    const today = new Date();
    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000);
      return {
        date,
        consultations: 0,
        isToday:
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
      };
    });
  }

  generateTimeSlots() {
    this.timeSlots = [];
    for (let hour = 7; hour < 22; hour += 0.5) {
      const time = `${Math.floor(hour)}:${hour % 1 === 0 ? '00' : '30'}`;
      this.timeSlots.push({
        time,
        slots: this.weekDays.map((day) => ({
          past: day.date < new Date(),
          current: false,
          booked: false,
          available: false,
          absent: false,
          appointment: undefined,
        })),
      });
    }
    this.highlightCurrentTime();
  }

  getStartOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  getEndOfWeek(date: Date): Date {
    const startOfWeek = this.getStartOfWeek(date);
    return new Date(startOfWeek.setDate(startOfWeek.getDate() + 6));
  }

  changeWeek(direction: number) {
    this.currentWeek.setDate(this.currentWeek.getDate() + direction * 7);
    this.currentWeek = this.getStartOfWeek(this.currentWeek);
    this.updateWeek();
    this.calendarService.loadAppointments();
    this.markAvailableSlots();
    this.markAbsences();
  }

  setTimeRange(index: number) {
    this.currentRangeIndex = index;
    this.updateVisibleTimeSlots();
    this.calendarService.loadAppointments();
    this.markAvailableSlots();
    this.markAbsences();
  }

  private updateVisibleTimeSlots(): void {
    const range = this.timeRanges[this.currentRangeIndex];
    this.visibleTimeSlots = this.timeSlots.filter((slot) => {
      const hour = parseFloat(slot.time.split(':')[0]) + parseFloat(slot.time.split(':')[1]) / 60;
      return hour >= range.start && hour < range.end;
    });

    if (this.isDayView) {
      this.visibleTimeSlots = this.timeSlots.filter((slot) => {
        const hour = parseFloat(slot.time.split(':')[0]) + parseFloat(slot.time.split(':')[1]) / 60;
        return hour >= 7 && hour < 22;
      });
    }
  }

  highlightCurrentTime() {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    this.timeSlots.forEach((slot) => {
      const slotHour = parseFloat(slot.time.split(':')[0]) + parseFloat(slot.time.split(':')[1]) / 60;
      slot.slots.forEach((s, index) => {
        const isCurrentDay = this.isDayView
          ? this.weekDays[0].date.toDateString() === now.toDateString()
          : this.weekDays[index].date.toDateString() === now.toDateString();
        s.current = slotHour <= currentHour && slotHour + 0.5 > currentHour && isCurrentDay;
        s.past = slotHour < currentHour && this.weekDays[index].date <= now;
      });
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  isCurrentTimeSlot(timeSlot: TimeSlot): boolean {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    const slotHour = parseFloat(timeSlot.time.split(':')[0]) + parseFloat(timeSlot.time.split(':')[1]) / 60;
    return slotHour <= currentHour && slotHour + 0.5 > currentHour;
  }

  changeViewMode() {
    this.isDayView = !this.isDayView;
    if (this.isDayView) {
      this.updateDay();
    } else {
      this.updateWeek();
    }
    this.calendarService.loadAppointments();
    this.markAvailableSlots();
    this.markAbsences();
  }

  changeDay(direction: number) {
    this.currentDay.setDate(this.currentDay.getDate() + direction);
    this.currentDay = new Date(this.currentDay);
    this.updateDay();
    this.calendarService.loadAppointments();
    this.markAvailableSlots();
    this.markAbsences();
  }

  updateDay() {
    this.weekDays = [
      {
        date: this.currentDay,
        consultations: 0,
      },
    ];
    this.generateTimeSlots();
    this.visibleTimeSlots = this.timeSlots;
    this.updateVisibleTimeSlots();
    this.markAvailableSlots();
    this.markBookedSlots();
    this.markAbsences();
    this.updateConsultationsCount();
  }

  loadUsers() {
    this.http.get<{ users: User[] }>('assets/data.json').subscribe((data) => {
      this.users = data.users;
    });
  }

  loadAvailabilities() {
    this.http.get<{ availability: Availability[], absences: Absence[] }>('assets/data.json').subscribe((data) => {
      this.availabilities = data.availability;
      this.absences = data.absences;
      this.generateTimeSlots();
      this.markAvailableSlots();
      this.markAbsences();
    });
  }

  markBookedSlots() {
    const now = new Date();
    this.timeSlots.forEach((slot) => {
      slot.slots.forEach((s, index) => {
        const slotDate = this.weekDays[index].date;
        const slotDateTime = new Date(`${slotDate.toDateString()} ${slot.time}`);

        if (slotDateTime < now) {
          s.past = true;
        }

        this.appointments.forEach((appointment) => {
          const appointmentDate = new Date(appointment.date);
          if (slot.time === appointment.time && slotDate.toDateString() === appointmentDate.toDateString()) {
            s.booked = true;
            s.consultationType = appointment.type;
            s.appointment = appointment;
          }
        });
      });
    });
  }

  markAvailableSlots() {
    const now = new Date();
    this.timeSlots.forEach((slot) => {
      slot.slots.forEach((s) => {
        s.available = false;
      });
    });

    this.availabilities.forEach((availability) => {
      const startDate = new Date(availability.startDate);
      const endDate = new Date(availability.endDate);

      this.timeSlots.forEach((slot) => {
        slot.slots.forEach((s, index) => {
          const slotDate = this.weekDays[index].date;
          const slotDateTime = new Date(`${slotDate.toDateString()} ${slot.time}`);

          if (slotDate >= startDate && slotDate <= endDate && !s.booked && !s.past) {
            if (availability.type === 'cykliczne') {
              if (availability.days.includes(slotDate.toLocaleDateString('pl-PL', { weekday: 'long' }))) {
                availability.timeSlots.forEach((timeSlot) => {
                  const from = new Date(`${slotDate.toDateString()} ${timeSlot.from}`);
                  const to = new Date(`${slotDate.toDateString()} ${timeSlot.to}`);
                  if (slotDateTime >= from && slotDateTime < to && slotDateTime > now) {
                    s.available = true;
                  }
                });
              }
            } else if (availability.type === 'jednorazowe') {
              if (slotDate.toDateString() === startDate.toDateString()) {
                availability.timeSlots.forEach((timeSlot) => {
                  const from = new Date(`${slotDate.toDateString()} ${timeSlot.from}`);
                  const to = new Date(`${slotDate.toDateString()} ${timeSlot.to}`);
                  if (slotDateTime >= from && slotDateTime < to && slotDateTime > now) {
                    s.available = true;
                  }
                });
              }
            }
          }
        });
      });
    });

    this.markAbsences();
  }

  markAbsences() {
    this.absences.forEach((absence) => {
      const startDate = new Date(absence.startDate);
      const endDate = new Date(absence.endDate);

      this.timeSlots.forEach((slot) => {
        slot.slots.forEach((s, index) => {
          const slotDate = this.weekDays[index].date;
          if (slotDate >= startDate && slotDate <= endDate) {
            s.absent = true;
            s.available = false;
          }
        });
      });

      this.appointments.forEach((appointment) => {
        const appointmentDate = new Date(appointment.date);
        if (appointmentDate >= startDate && appointmentDate <= endDate) {
          appointment.cancelled = true;
        }
      });
    });
  }

  updateConsultationsCount() {
    this.weekDays.forEach(day => {
      day.consultations = this.appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.toDateString() === day.date.toDateString();
      }).length;
    });
  }

  selectSlot(date: Date, time: string) {
    this.router.navigate(['/pacjent-form'], { queryParams: { date: date.toISOString().split('T')[0], time } });
  }

  onHover(appointment: Appointment | undefined) {
    if (appointment) {
      const isCancelled = this.absences.some(absence => {
        const startDate = new Date(absence.startDate);
        const endDate = new Date(absence.endDate);
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= startDate && appointmentDate <= endDate;
      });
      appointment.cancelled = isCancelled;
    }
    this.hoveredAppointment = appointment || null;
  }

  getPatientFirstName(patientId: number): string {
    const patient = this.users.find(user => user.userId === patientId);
    return patient ? patient.firstName : '';
  }

  getPatientLastName(patientId: number): string {
    const patient = this.users.find(user => user.userId === patientId);
    return patient ? patient.lastName : '';
  }

  getPatientGender(patientId: number): string {
    const patient = this.users.find(user => user.userId === patientId);
    return patient ? patient.gender : '';
  }

  getPatientAge(patientId: number): number | undefined {
    const patient = this.users.find(user => user.userId === patientId);
    return patient ? patient.age : undefined;
  }

  removeAppointment(appointmentId: number | undefined) {
    if (appointmentId === undefined) return;

    this.calendarService.removeAppointment(appointmentId);
    this.basketService.removeFromBasketById(appointmentId);
    this.reloadPageData();
  }
}