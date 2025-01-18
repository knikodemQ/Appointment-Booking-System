import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { BasketService } from '../services/basket.service';

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
  age: number;
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
  selector: 'app-pacjent-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pacjent-form.component.html',
  styleUrls: ['./pacjent-form.component.css']
})
export class PacjentFormComponent implements OnInit {
  appointmentForm: FormGroup;
  user: User = {
    userId: 1,
    firstName: '',
    lastName: '',
    email: '',
    isDoctor: false,
    gender: '',
    age: 0
  };

  availableSlots: string[] = [];
  availabilities: Availability[] = [];
  absences: Absence[] = [];
  errorMessage: string = '';
  minDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private basketService: BasketService
  ) {
    this.appointmentForm = this.fb.group({
      firstName: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }],
      gender: [{ value: '', disabled: true }],
      age: [{ value: '', disabled: true }],
      details: [''],
      type: [''],
      date: [''],
      time: ['']
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.appointmentForm.patchValue({ date: params['date'] });
      this.loadUserData();
      this.loadAvailabilities();
      this.loadAbsences();
    });
  
    this.appointmentForm.get('date')?.valueChanges.subscribe(date => {
      this.loadAvailableSlots();
    });
  }

  loadAbsences() {
    this.http.get<Absence[]>('http://localhost:3000/absences').subscribe(data => {
      this.absences = data;
      this.loadAvailableSlots();
    });
  }

  loadUserData() {
    this.http.get<User[]>('http://localhost:3000/users').subscribe(data => {
      const user = data.find(u => u.userId === 1); // patientId is 1 for simplicity
      if (user) {
        this.user = user;
        this.appointmentForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          age: user.age
        });
      }
    });
  }

  loadAvailabilities() {
    this.http.get<Availability[]>('http://localhost:3000/availability').subscribe(data => {
      this.availabilities = data;
      this.loadAvailableSlots();
    });
  }

  loadAvailableSlots() {
    const date = this.appointmentForm.get('date')?.value;
    if (!date) return;
  
    const now = new Date();
    const selectedDate = new Date(date);
  
    if (selectedDate < now) {
      this.availableSlots = [];
      return;
    }
  
    // Sprawdź, czy wybrany dzień jest dniem odwołanym
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
      if (a.type === 'cykliczne') {
        return selectedDate >= startDate && selectedDate <= endDate && a.days.includes(selectedDate.toLocaleDateString('pl-PL', { weekday: 'long' }));
      } else if (a.type === 'jednorazowe') {
        return selectedDate.toDateString() === startDate.toDateString();
      }
      return false;
    });
  
    if (availabilities.length === 0) {
      this.availableSlots = [];
      return;
    }
  
    this.http.get<Appointment[]>('http://localhost:3000/appointments').subscribe(data => {
      const selectedDateAppointments = data.filter((app: Appointment) => app.date === date);
      let allSlots: string[] = [];
      availabilities.forEach(availability => {
        allSlots = allSlots.concat(this.generateTimeSlots(availability));
      });
      this.availableSlots = allSlots.filter(slot => !selectedDateAppointments.some((app: Appointment) => app.time === slot));
    });
  }

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

  convertTimeToDecimal(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  }

  convertDecimalToTime(decimal: number): string {
    const hours = Math.floor(decimal);
    const minutes = (decimal % 1) * 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  onSubmit() {
    if (this.appointmentForm.invalid) return;

    const newAppointment: Appointment = {
      appointmentId: 0,
      doctorId: 3, // doctorId is 3 for simplicity
      patientId: 1, // patientId is 1 for simplicity
      type: this.appointmentForm.get('type')?.value,
      date: this.appointmentForm.get('date')?.value,
      time: this.appointmentForm.get('time')?.value,
      duration: 30,
      occurred: false,
      cancelled: false,
      details: this.appointmentForm.get('details')?.value
    };

    this.http.get<Appointment[]>('http://localhost:3000/appointments').subscribe(existingAppointments => {
      const newAppointmentId = existingAppointments.length > 0
        ? Math.max(...existingAppointments.map(a => a.appointmentId)) + 1
        : 1;

      newAppointment.appointmentId = newAppointmentId;

      this.http.post<Appointment>('http://localhost:3000/appointments', newAppointment).subscribe({
        next: () => {
          this.basketService.addToBasket(newAppointment); // Dodaj wizytę do koszyka
          this.router.navigate(['/calendar']);
        },
        error: (err) => {
          this.errorMessage = 'Nie udało się zapisać spotkania. Spróbuj ponownie.';
          console.error(err); 
        }
      });
    });
  }
}