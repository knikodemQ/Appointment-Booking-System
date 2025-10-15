import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

import { CalendarService } from '../services/calendar.service';
import { AuthService } from '../services/auth.service'; 



import { User } from '../models/user.model';
import { Absence } from '../models/absence.model';
import { Availability } from '../models/availability.model';
import { Appointment } from './../models/appointment.model';

interface TimeSlot {
  time: string;
  slots: { past: boolean; current: boolean; consultationType?: string; booked?: boolean; available?: boolean; absent?: boolean; appointment?: Appointment }[];
}

@Component({
  selector: 'app-kalendarz',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './terminarz-lekarza.component.html',
  styleUrls: ['./terminarz-lekarza.component.css']
})
export class TerminarzLekarzaComponent implements OnInit {
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
  user: User | null = null;
  
  errorMessage: string = '';

  timeRanges = [
    { start: 7, end: 12, label: '7:00 - 12:00' },
    { start: 12, end: 17, label: '12:00 - 17:00' },
    { start: 17, end: 22, label: '17:00 - 22:00' },
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private calendarService: CalendarService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.calendarService.loadAllData();

    this.authService.user$.subscribe(user => {
      this.user = user;
      this.reloadPageData();
    });

    this.calendarService.users$.subscribe((users) => {
      this.users = users;
    });

    this.calendarService.availabilities$.subscribe((availabilities) => {
      this.availabilities = availabilities;
      this.markAvailableSlots();
      this.updateConsultationsCount();
    });

    this.calendarService.absences$.subscribe((absences) => {
      this.absences = absences;
      this.markAbsences();
    });

    this.calendarService.appointments$.subscribe((appointments) => {
      this.appointments = appointments;
      this.updateVisibleTimeSlots();
      this.markBookedSlots();
    });

    this.setCurrentTimeRange();
    this.updateWeek();
    this.checkMobileView();
    this.updateConsultationsCount();

    if (this.isDayView) {
      this.updateDay();
    } else {
      this.updateWeek();
    }
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

  private reloadPageData(): void {
   
    this.generateTimeSlots();
    this.calendarService.loadAllData();
    this.updateVisibleTimeSlots();
    this.markAvailableSlots();
    this.markBookedSlots();
    this.markAbsences();
    this.updateConsultationsCount();
    
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
    this.updateConsultationsCount();

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
    this.calendarService.loadAllData();
    this.markAvailableSlots();
    this.markAbsences();
  }

  setTimeRange(index: number) {
    this.currentRangeIndex = index;
    this.updateVisibleTimeSlots();
    this.calendarService.loadAllData();
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
    this.calendarService.loadAllData();
    this.markAvailableSlots();
    this.markAbsences();
  }

  changeDay(direction: number) {
    this.currentDay.setDate(this.currentDay.getDate() + direction);
    this.currentDay = new Date(this.currentDay);
    this.updateDay();
    this.calendarService.loadAllData();
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
      endDate.setDate(endDate.getDate() + 1); 

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

  private getDaysBetween(start: Date, end: Date): Date[] {
    const days: Date[] = [];
    let current = new Date(start);
  
    while (current <= end) { 
      days.push(new Date(current)); 
      current.setDate(current.getDate() + 1);
    }
  
    return days;
  }

  markAbsences() {
    this.absences.forEach((absence) => {
      const startDate = new Date(absence.startDate);
      const endDate = new Date(absence.endDate);
  
      const days = this.getDaysBetween(startDate, endDate); 
  
      days.forEach(day => {
        this.timeSlots.forEach((slot) => {
          slot.slots.forEach((s, index) => {
            const slotDate = this.weekDays[index].date;
  
            if (
              slotDate.toDateString() === day.toDateString() &&
              !s.booked &&
              !s.past
            ) {
              s.absent = true;
            }
          });
        });
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

  

  getPatientFirstName(patientId: number | string): string {
    const patient = this.users.find(user => user.id === patientId || user.uid === patientId);
    return patient ? patient.firstName : '';
  }

  getPatientLastName(patientId: number | string): string {
    const patient = this.users.find(user => user.id === patientId || user.uid === patientId);
    return patient ? patient.lastName : '';
  }

  getPatientGender(patientId: number | string): string {
    const patient = this.users.find(user => user.id === patientId || user.uid === patientId);
    return patient ? patient.gender : '';
  }

  getPatientAge(patientId: number | string): number | undefined {
    const patient = this.users.find(user => user.id === patientId || user.uid === patientId);
    return patient ? patient.age : undefined;
  }

}