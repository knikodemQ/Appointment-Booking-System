import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { AbsenceService } from '../services/absence.service';
import { AvailabilityService } from '../services/availability.service';

import { User } from '../models/user.model';
import { Absence } from '../models/absence.model';
import { Availability } from '../models/availability.model';
import { Appointment } from './../models/appointment.model';

@Component({
  selector: 'app-define-availability',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './define-availability.component.html',
  styleUrls: ['./define-availability.component.css']
})
export class DefineAvailabilityComponent implements OnInit {
  availabilityForm: FormGroup;
  timeSlots: string[] = [];
  absences: any[] = [];
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private absenceService: AbsenceService,
    private availabilityService: AvailabilityService
  ) {
    this.availabilityForm = this.fb.group({
      type: ['cykliczne'],
      startDate: ['', Validators.required],
      endDate: [''],
      days: this.fb.array([]),
      timeSlots: this.fb.array([this.createTimeSlot()])
    }, { validators: [this.dateRangeValidator, this.absenceValidator.bind(this)] });

    this.generateTimeSlots();
  }

  ngOnInit(): void {
    this.availabilityForm.get('type')?.valueChanges.subscribe(value => {
      if (value === 'jednorazowe') {
        this.availabilityForm.get('endDate')?.disable();
        this.availabilityForm.get('days')?.disable();
      } else {
        this.availabilityForm.get('endDate')?.enable();
        this.availabilityForm.get('days')?.enable();
      }
    });

    this.loadAbsences();
  }

  loadAbsences(): void {
    this.absenceService.getAbsences().subscribe(data => {
      this.absences = data;
    });
  }

  generateTimeSlots(): void {
    this.timeSlots = [];
    for (let hour = 7; hour < 22; hour += 0.5) {
      const time = `${Math.floor(hour)}:${hour % 1 === 0 ? '00' : '30'}`;
      this.timeSlots.push(time);
    }
  }

  get days(): FormArray {
    return this.availabilityForm.get('days') as FormArray;
  }

  get timeSlotControls(): FormArray {
    return this.availabilityForm.get('timeSlots') as FormArray;
  }

  createTimeSlot(): FormGroup {
    return this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required]
    });
  }

  addTimeSlot(): void {
    this.timeSlotControls.push(this.createTimeSlot());
  }

  removeTimeSlot(index: number): void {
    this.timeSlotControls.removeAt(index);
  }

  onCheckboxChange(event: any): void {
    const days: FormArray = this.availabilityForm.get('days') as FormArray;

    if (event.target.checked) {
      days.push(new FormControl(event.target.value));
    } else {
      const index = days.controls.findIndex(x => x.value === event.target.value);
      days.removeAt(index);
    }
  }

  validateTimeSlots(index: number): void {
    const timeSlot = this.timeSlotControls.at(index) as FormGroup;
    const from = this.parseTime(timeSlot.get('from')?.value);
    const to = this.parseTime(timeSlot.get('to')?.value);
  
    if (from !== null && to !== null && from >= to) {
      timeSlot.get('to')?.setErrors({ invalidTime: true });
    } else {
      timeSlot.get('to')?.setErrors(null);
    }
  
    for (let i = 0; i < this.timeSlotControls.length; i++) {
      if (i !== index) {
        const otherTimeSlot = this.timeSlotControls.at(i) as FormGroup;
        const otherFrom = this.parseTime(otherTimeSlot.get('from')?.value);
        const otherTo = this.parseTime(otherTimeSlot.get('to')?.value);
  
        if (
          from !== null &&
          to !== null &&
          otherFrom !== null &&
          otherTo !== null &&
          (from < otherTo && to > otherFrom)
        ) {
          timeSlot.get('from')?.setErrors({ overlap: true });
          timeSlot.get('to')?.setErrors({ overlap: true });
          otherTimeSlot.get('from')?.setErrors({ overlap: true });
          otherTimeSlot.get('to')?.setErrors({ overlap: true });
        }
      }
    }
  }
  
  parseTime(time: string): number | null {
    if (!time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes; // Zamiana na minuty
  }
  

  validateDates(): void {
    const startDate = this.availabilityForm.get('startDate')?.value;
    const endDate = this.availabilityForm.get('endDate')?.value;
  
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      this.availabilityForm.get('endDate')?.setErrors({ invalidDate: true });
    } else {
      this.availabilityForm.get('endDate')?.setErrors(null);
    }
  }
  
  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;
  
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return { invalidDateRange: true };
    }
    return null;
  }

  absenceValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;
    const days = control.get('days')?.value;

    if (startDate) {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : start;

      for (const absence of this.absences) {
        const absenceStart = new Date(absence.startDate);
        const absenceEnd = new Date(absence.endDate);

        if (start <= absenceEnd && end >= absenceStart) {
          if (control.get('type')?.value === 'cykliczne') {
            for (const day of days) {
              const dayIndex = this.getDayIndex(day);
              const absenceDays = this.getDaysBetween(absenceStart, absenceEnd);
              if (absenceDays.includes(dayIndex)) {
                return { invalidDay: true };
              }
            }
          } else {
            return { invalidDay: true };
          }
        }
      }
    }
    return null;
  }

  getDayIndex(day: string): number {
    const days = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
    return days.indexOf(day);
  }

  getDaysBetween(start: Date, end: Date): number[] {
    const days = [];
    const current = new Date(start);
    while (current <= end) {
      days.push(current.getDay());
      current.setDate(current.getDate() + 1);
    }
    return days;
  }

  onSubmit(): void {
    const availability = this.availabilityForm.value;

    if (availability.type === 'jednorazowe') {
      const startDate = new Date(availability.startDate);
      const nextDay = new Date(startDate);
      nextDay.setDate(startDate.getDate() + 1);
      availability.endDate = nextDay.toISOString().split('T')[0];
      availability.days = [];
    }

    availability.doctorId = 3; // doctorId 3 simplify

    this.availabilityService.createAvailability(availability).subscribe({
      next: () => {
        this.router.navigate(['/calendar']);
      },
      error: (err) => {
        this.errorMessage = 'Nie udało się zapisać dostępności. Spróbuj ponownie.';
        console.error(err);
      }
    });
  }
}