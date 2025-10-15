import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BasketService } from '../services/basket.service';
import { PacjentFormService } from '../services/pacjent-form.service';
import { User } from '../models/user.model';
import { Absence } from '../models/absence.model';
import { Availability } from '../models/availability.model';
import { Appointment } from './../models/appointment.model';
import { switchMap, first } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-pacjent-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pacjent-form.component.html',
  styleUrls: ['./pacjent-form.component.css']
})
export class PacjentFormComponent implements OnInit {
  appointmentForm: FormGroup;
  user: User | null = null;

  availableSlots: string[] = [];
  availabilities: Availability[] = [];
  absences: Absence[] = [];
  errorMessage: string = '';
  minDate: string = new Date().toISOString().split('T')[0];
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private basketService: BasketService,
    private pacjentFormService: PacjentFormService
  ) {
    this.appointmentForm = this.fb.group({
      firstName: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }],
      gender: [{ value: '', disabled: true }],
      age: [{ value: '', disabled: true }],
      details: ['', Validators.required],
      type: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Ładowanie parametrów i danych użytkownika
    this.route.queryParams.pipe(
      switchMap(params => {
        this.appointmentForm.patchValue({ date: params['date'], time: params['time'] });
        return this.pacjentFormService.loadUserData();
      }),
      switchMap(user => {
        this.user = user;
        console.log('User loaded in pacjent-form:', user);
        if (this.user) {
          console.log('Patching form with user data:', this.user.firstName, this.user.lastName);
          this.appointmentForm.patchValue({
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            gender: this.user.gender,
            age: this.user.age
          });
        } else {
          console.log('No user data loaded!');
        }
        return combineLatest([
          this.pacjentFormService.loadAvailabilities(),
          this.pacjentFormService.loadAbsences()
        ]);
      })
    ).subscribe({
      next: ([availabilities, absences]) => {
        this.availabilities = availabilities;
        this.absences = absences;
        this.loadAvailableSlots();
      },
      error: (err) => {
        this.errorMessage = 'Nie udało się załadować danych.';
        console.error(err);
      }
    });

    // Reakcja na zmianę daty
    this.appointmentForm.get('date')?.valueChanges.subscribe(() => {
      this.loadAvailableSlots();
    });
  }

  /**
   * Ładuje dostępne sloty na podstawie daty, dostępności i nieobecności.
   */
  loadAvailableSlots() {
    const date = this.appointmentForm.get('date')?.value;
    if (!date) {
      this.availableSlots = [];
      return;
    }

    const selectedDate = new Date(date);
    const now = new Date();

    if (selectedDate < now) {
      this.availableSlots = [];
      return;
    }

    // Sprawdzenie, czy wybrany dzień jest dniem odwołanym
    const isCancelledDay = this.absences.some(absence => {
      const startDate = new Date(absence.startDate);
      const endDate = new Date(absence.endDate);
      return selectedDate >= startDate && selectedDate <= endDate;
    });

    if (isCancelledDay) {
      this.availableSlots = [];
      return;
    }

    const availabilities = this.availabilities.filter(a => {
      const startDate = new Date(a.startDate);
      const endDate = new Date(a.endDate);
      const dayName = selectedDate.toLocaleDateString('pl-PL', { weekday: 'long' });

      if (a.type === 'cykliczne') {
        return selectedDate >= startDate && selectedDate <= endDate && a.days.includes(dayName);
      } else if (a.type === 'jednorazowe') {
        return selectedDate.toDateString() === startDate.toDateString();
      }
      return false;
    });

    if (availabilities.length === 0) {
      this.availableSlots = [];
      return;
    }

    // Pobranie wszystkich istniejących wizyt
    this.pacjentFormService.getExistingAppointments().subscribe({
      next: (existingAppointments: Appointment[]) => {
        let allSlots: string[] = [];
        availabilities.forEach(availability => {
          allSlots = allSlots.concat(this.generateTimeSlots(availability));
        });

        // Filtracja slotów na podstawie wszystkich istniejących wizyt
        this.availableSlots = allSlots.filter(slot => 
          !existingAppointments.some(app => app.date === date && app.time === slot)
        );
      },
      error: (err) => {
        this.errorMessage = 'Nie udało się pobrać istniejących wizyt.';
        console.error(err);
      }
    });
  }

  /**
   * Generuje sloty czasowe na podstawie dostępności.
   * @param availability Obiekt dostępności
   */
  generateTimeSlots(availability: Availability): string[] {
    const slots: string[] = [];
    availability.timeSlots.forEach(timeSlot => {
      let start = this.convertTimeToDecimal(timeSlot.from);
      const end = this.convertTimeToDecimal(timeSlot.to);
      while (start < end) {
        slots.push(this.convertDecimalToTime(start));
        start += 0.5;
      }
    });
    return slots;
  }

  /**
   * Konwertuje czas w formacie HH:MM na wartość dziesiętną.
   * @param time Czas w formacie 'HH:MM'
   */
  convertTimeToDecimal(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  }

  /**
   * Konwertuje wartość dziesiętną na czas w formacie HH:MM.
   * @param decimal Wartość dziesiętna
   */
  convertDecimalToTime(decimal: number): string {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Pobiera właściwy identyfikator użytkownika w zależności od źródła danych.
   */
  private getUserId(): string | number | undefined {
    if (!this.user) return undefined;
    
    const dataSource = localStorage.getItem('dataSource');
    if (dataSource === 'firebase') {
      return this.user.uid;
    } else if (dataSource === 'mongodb') {
      return this.user._id;
    } else {
      return this.user.id;
    }
  }

  /**
   * Obsługuje wysyłanie formularza.
   */
  onSubmit() {
    const userId = this.getUserId();
    console.log('onSubmit called - User:', this.user, 'UserId:', userId, 'Form valid:', this.appointmentForm.valid);
    if (this.appointmentForm.invalid || this.isSubmitting || !this.user || !userId) {
      console.log('Submit blocked - Form invalid:', this.appointmentForm.invalid, 'Submitting:', this.isSubmitting, 'User:', !this.user, 'UserId:', !userId);
      return;
    }

    this.isSubmitting = true;

    const newAppointment: Appointment = {
      doctorId: 3, // simplification: doctorId is 3
      patientId: userId, // uniwersalny identyfikator
      type: this.appointmentForm.get('type')?.value,
      date: this.appointmentForm.get('date')?.value,
      time: this.appointmentForm.get('time')?.value,
      duration: 30,
      occurred: false,
      cancelled: false,
      details: this.appointmentForm.get('details')?.value
    };

    this.pacjentFormService.getExistingAppointments().pipe(
      first()
    ).subscribe({
      next: (existingAppointments: Appointment[]) => {
        // Sprawdzenie, czy wybrany slot jest już zarezerwowany
        const isSlotTaken = existingAppointments.some(app => app.date === newAppointment.date && app.time === newAppointment.time);

        if (isSlotTaken) {
          this.errorMessage = 'Wybrany slot jest już zarezerwowany.';
          this.isSubmitting = false;
          return;
        }

        // Tworzenie nowej wizyty
        this.pacjentFormService.createAppointment(newAppointment).subscribe({
          next: (createdAppointment: Appointment) => {
            // Dodanie wizyty do koszyka
            this.basketService.addToBasket(createdAppointment);
            // Navigacja lub informacja o sukcesie
            this.isSubmitting = false;
            this.router.navigate(['/calendar']);
          },
          error: (err: any) => {
            this.errorMessage = 'Nie udało się utworzyć wizyty.';
            console.error(err);
            this.isSubmitting = false;
          }
        });
      },
      error: (err: any) => {
        this.errorMessage = 'Nie udało się pobrać istniejących wizyt.';
        console.error(err);
        this.isSubmitting = false;
      }
    });
  }
}